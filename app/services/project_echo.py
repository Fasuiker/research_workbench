"""Project list/detail enrichment: paper counts + focus echoes."""

from __future__ import annotations

from datetime import datetime, date, timedelta

from sqlalchemy.orm import Session

from app import models
from app.schemas import ProjectOut


def _focus_elapsed(row: models.FocusSession, now: datetime | None = None) -> int:
    now = now or datetime.utcnow()
    if row.active:
        return max(0, int((now - row.started_at).total_seconds())) if row.started_at else 0
    return int(row.duration_seconds or 0)


def project_out(db: Session, row: models.Project) -> ProjectOut:
    base = ProjectOut.model_validate(row)
    # papers via M2M + legacy
    paper_ids = set()
    for link in db.query(models.PaperProject).filter_by(project_id=row.id).all():
        paper_ids.add(link.paper_id)
    for p in db.query(models.Paper).filter_by(project_id=row.id).all():
        paper_ids.add(p.id)
    week_start = date.today() - timedelta(days=date.today().weekday())
    focuses = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.link_type == "project",
            models.FocusSession.link_id == row.id,
            models.FocusSession.deleted_at.is_(None),
        )
        .order_by(models.FocusSession.id.desc())
        .limit(40)
        .all()
    )
    now = datetime.utcnow()
    week_sec = 0
    week_n = 0
    recent = []
    for f in focuses:
        elapsed = _focus_elapsed(f, now)
        day = f.started_at.date() if f.started_at else date.today()
        if day >= week_start:
            week_sec += elapsed
            week_n += 1
        if len(recent) < 5:
            recent.append(
                {
                    "id": f.id,
                    "title": f.title,
                    "started_at": f.started_at.isoformat() if f.started_at else "",
                    "duration_seconds": elapsed,
                    "outcome": f.outcome or "",
                    "active": bool(f.active),
                }
            )
    fp = db.get(models.Setting, "focus_project_id")
    is_focus = bool(fp and fp.value.isdigit() and int(fp.value) == row.id)
    notes = (
        db.query(models.ProjectNote)
        .filter(models.ProjectNote.project_id == row.id)
        .order_by(models.ProjectNote.recorded_at.desc(), models.ProjectNote.id.desc())
        .all()
    )
    latest = notes[0] if notes else None
    preview = ""
    if latest:
        preview = ((latest.title or "").strip() or (latest.body or "").strip().replace("\n", " "))[:120]
    return base.model_copy(
        update={
            "paper_count": len(paper_ids),
            "focus_week_seconds": week_sec,
            "focus_week_sessions": week_n,
            "recent_focus": recent,
            "is_focus_project": is_focus,
            "note_count": len(notes),
            "latest_note_at": latest.recorded_at if latest else None,
            "latest_note_preview": preview,
        }
    )
