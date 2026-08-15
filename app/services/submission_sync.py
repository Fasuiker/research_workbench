"""Sync research project stages into the submissions (投稿) module."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app import models
from app.services.calendar_sync import sync_submission_deadline

# Project.stage → Submission.status
STAGE_TO_STATUS: dict[str, str] = {
    "在投": "submitted",
    "R&R": "revision",
    "接收": "accepted",
    "发表": "published",
}

SYNC_STAGES = frozenset(STAGE_TO_STATUS)
_TERMINAL = frozenset({"rejected", "published"})


def _match_venue(db: Session, venue: str) -> tuple[str, int | None, int | None]:
    """Return (target_type, journal_id, conference_id) from project.target_venue text."""
    text = (venue or "").strip()
    if not text:
        return "conference", None, None
    key = text.lower()

    confs = db.query(models.Conference).all()
    for c in confs:
        aliases = {(c.short_name or "").lower(), (c.name or "").lower()} - {""}
        if key in aliases or any(a and (a in key or key in a) for a in aliases):
            return "conference", None, c.id

    journals = db.query(models.Journal).all()
    for j in journals:
        name = (j.name or "").lower()
        if name and (key == name or key in name or name in key):
            return "journal", j.id, None

    # Heuristic: journal-like keywords
    if any(x in key for x in ("journal", "trans", "tpami", "jmlr", "ieee", "acm")):
        return "journal", None, None
    return "conference", None, None


def _pick_submission(db: Session, project_id: int, want_status: str) -> models.Submission | None:
    rows = (
        db.query(models.Submission)
        .filter_by(project_id=project_id)
        .order_by(models.Submission.updated_at.desc())
        .all()
    )
    if not rows:
        return None
    live = next((s for s in rows if s.status not in _TERMINAL), None)
    # New submission cycle when re-entering 在投 after reject/publish
    if want_status == "submitted" and live is None:
        return None
    return live or rows[0]


def sync_project_to_submission(db: Session, project: models.Project) -> models.Submission | None:
    """Create or update a linked submission when project stage is 在投/R&R/接收/发表."""
    if project.project_type == "engineering":
        return None
    # Completed / paused projects stay off the research board — do not auto-create 投稿.
    if (project.status or "").strip() in {"done", "paused"}:
        return None
    want = STAGE_TO_STATUS.get((project.stage or "").strip())
    if not want:
        return None

    target_type, journal_id, conference_id = _match_venue(db, project.target_venue)
    deadline = project.next_step_deadline or project.deadline
    notes_bit = f"[同步自项目阶段: {project.stage}]"
    sub = _pick_submission(db, project.id, want)

    if sub is None:
        sub = models.Submission(
            title=project.title,
            target_type=target_type,
            journal_id=journal_id,
            conference_id=conference_id,
            project_id=project.id,
            status=want,
            deadline=deadline,
            notes=notes_bit,
            manuscript_path=project.folder_path or "",
        )
        db.add(sub)
        db.flush()
        db.add(
            models.SubmissionEvent(
                submission_id=sub.id,
                event_type=want,
                happened_at=datetime.utcnow(),
                content=f"由项目「{project.title}」阶段「{project.stage}」自动创建",
            )
        )
    else:
        prev = sub.status
        sub.title = project.title or sub.title
        sub.status = want
        if deadline:
            sub.deadline = deadline
        if journal_id:
            sub.journal_id = journal_id
            sub.conference_id = None
            sub.target_type = "journal"
        elif conference_id:
            sub.conference_id = conference_id
            sub.journal_id = None
            sub.target_type = "conference"
        elif project.target_venue:
            sub.target_type = target_type
        if project.folder_path and not sub.manuscript_path:
            sub.manuscript_path = project.folder_path
        if notes_bit not in (sub.notes or ""):
            sub.notes = ((sub.notes or "").rstrip() + "\n" + notes_bit).strip()
        sub.updated_at = datetime.utcnow()
        if prev != want:
            db.add(
                models.SubmissionEvent(
                    submission_id=sub.id,
                    event_type=want,
                    happened_at=datetime.utcnow(),
                    content=f"项目阶段变更为「{project.stage}」（{prev} → {want}）",
                )
            )

    sync_submission_deadline(db, sub)
    return sub


def backfill_project_submissions(db: Session) -> int:
    """Ensure projects already in sync stages have a linked submission."""
    projects = (
        db.query(models.Project)
        .filter(
            models.Project.stage.in_(list(SYNC_STAGES)),
            models.Project.status.notin_(["done", "paused"]),
        )
        .all()
    )
    n = 0
    for p in projects:
        had = (
            db.query(models.Submission.id)
            .filter_by(project_id=p.id)
            .first()
            is not None
        )
        sub = sync_project_to_submission(db, p)
        if sub is not None and not had:
            n += 1
    if projects:
        db.commit()
    return n
