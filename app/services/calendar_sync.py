"""Sync conference / submission deadlines into calendar events (+ advance reminders)."""

from __future__ import annotations

from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app import models

ADVANCE_DAYS = 7


def _day_start(d: date) -> datetime:
    return datetime.combine(d, datetime.min.time())


def _upsert_event(
    db: Session,
    *,
    link_type: str,
    link_id: int,
    title: str,
    event_type: str,
    on_day: date | None,
    notes: str = "",
    project_id: int | None = None,
) -> None:
    existing = (
        db.query(models.CalendarEvent)
        .filter_by(link_type=link_type, link_id=link_id)
        .all()
    )
    if not on_day:
        for ev in existing:
            db.delete(ev)
        return
    row = existing[0] if existing else None
    for extra in existing[1:]:
        db.delete(extra)
    payload = dict(
        title=title,
        event_type=event_type,
        start_at=_day_start(on_day),
        end_at=None,
        all_day=True,
        link_type=link_type,
        link_id=link_id,
        notes=notes,
        project_id=project_id,
    )
    if row:
        for k, v in payload.items():
            setattr(row, k, v)
    else:
        db.add(models.CalendarEvent(**payload))


def _clear_links(db: Session, link_types: list[str], link_id: int) -> None:
    rows = (
        db.query(models.CalendarEvent)
        .filter(
            models.CalendarEvent.link_type.in_(link_types),
            models.CalendarEvent.link_id == link_id,
        )
        .all()
    )
    for r in rows:
        db.delete(r)


def sync_conference_deadlines(db: Session, conf: models.Conference) -> None:
    """Write abstract/paper DDL (+ D-7 advance) into the calendar."""
    label = (conf.short_name or conf.name or "会议").strip()
    year = f" {conf.year}" if conf.year else ""

    abs_day = conf.abstract_deadline
    paper_day = conf.paper_deadline

    _upsert_event(
        db,
        link_type="conference_abs",
        link_id=conf.id,
        title=f"[会议DDL·摘要] {label}{year}",
        event_type="deadline",
        on_day=abs_day,
        notes=f"会议库 · {conf.name}",
    )
    _upsert_event(
        db,
        link_type="conference_abs_adv",
        link_id=conf.id,
        title=f"[DDL提醒] {label} 摘要截止还有 {ADVANCE_DAYS} 天",
        event_type="advance",
        on_day=(abs_day - timedelta(days=ADVANCE_DAYS)) if abs_day else None,
        notes=f"摘要 DDL {abs_day}",
    )
    _upsert_event(
        db,
        link_type="conference_paper",
        link_id=conf.id,
        title=f"[会议DDL·全文] {label}{year}",
        event_type="deadline",
        on_day=paper_day,
        notes=f"会议库 · {conf.name}",
    )
    _upsert_event(
        db,
        link_type="conference_paper_adv",
        link_id=conf.id,
        title=f"[DDL提醒] {label} 全文截止还有 {ADVANCE_DAYS} 天",
        event_type="advance",
        on_day=(paper_day - timedelta(days=ADVANCE_DAYS)) if paper_day else None,
        notes=f"全文 DDL {paper_day}",
    )


def clear_conference_deadlines(db: Session, conference_id: int) -> None:
    _clear_links(
        db,
        ["conference_abs", "conference_abs_adv", "conference_paper", "conference_paper_adv"],
        conference_id,
    )


def sync_submission_deadline(db: Session, sub: models.Submission) -> None:
    """Keep submission DDL on calendar; fill from conference paper DDL when empty."""
    deadline = sub.deadline
    if not deadline and sub.conference_id:
        conf = db.get(models.Conference, sub.conference_id)
        if conf and conf.paper_deadline:
            deadline = conf.paper_deadline
            sub.deadline = deadline
        elif conf and conf.abstract_deadline:
            deadline = conf.abstract_deadline
            sub.deadline = deadline

    label = (sub.title or "投稿").strip()
    _upsert_event(
        db,
        link_type="submission",
        link_id=sub.id,
        title=f"[投稿DDL] {label}",
        event_type="deadline",
        on_day=deadline,
        notes="投稿管理",
        project_id=sub.project_id,
    )
    _upsert_event(
        db,
        link_type="submission_adv",
        link_id=sub.id,
        title=f"[DDL提醒] 投稿「{label}」还有 {ADVANCE_DAYS} 天",
        event_type="advance",
        on_day=(deadline - timedelta(days=ADVANCE_DAYS)) if deadline else None,
        notes=f"投稿 DDL {deadline}",
        project_id=sub.project_id,
    )


def clear_submission_deadline(db: Session, submission_id: int) -> None:
    _clear_links(db, ["submission", "submission_adv"], submission_id)


def upcoming_ddl_tips(db: Session, within_days: int = 21) -> list[dict]:
    """Compact tip list for UI: conference + submission deadlines in range."""
    today = date.today()
    end = today + timedelta(days=within_days)
    tips: list[dict] = []

    for c in db.query(models.Conference).all():
        for kind, d in (("摘要", c.abstract_deadline), ("全文", c.paper_deadline)):
            if not d or d < today or d > end:
                continue
            tips.append(
                {
                    "kind": "conference",
                    "label": c.short_name or c.name,
                    "detail": kind,
                    "deadline": d.isoformat(),
                    "days_left": (d - today).days,
                    "id": c.id,
                    "rank": c.rank or "",
                }
            )

    for s in db.query(models.Submission).filter(models.Submission.status.notin_(["published", "rejected"])).all():
        d = s.deadline
        if not d and s.conference_id:
            conf = db.get(models.Conference, s.conference_id)
            d = conf.paper_deadline if conf else None
        if not d or d < today or d > end:
            continue
        tips.append(
            {
                "kind": "submission",
                "label": s.title,
                "detail": s.status,
                "deadline": d.isoformat(),
                "days_left": (d - today).days,
                "id": s.id,
                "rank": "",
            }
        )

    tips.sort(key=lambda x: (x["days_left"], x["label"]))
    return tips


def backfill_venue_deadlines(db: Session) -> int:
    n = 0
    for c in db.query(models.Conference).all():
        if c.abstract_deadline or c.paper_deadline:
            sync_conference_deadlines(db, c)
            n += 1
    for s in db.query(models.Submission).all():
        if s.deadline or s.conference_id:
            sync_submission_deadline(db, s)
            n += 1
    db.commit()
    return n
