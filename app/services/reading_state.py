"""Keep Paper.status and 阅读队列 tags aligned."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app import models

QUEUE_TAGS = frozenset({"待读", "待精读", "已精读", "精读中", "已读归档"})
QUEUE_DIM = "阅读队列"
QUEUE_COLORS = {
    "待读": "#6B5B95",
    "待精读": "#8B7BB5",
    "已精读": "#4A3F6B",
}
STATUS_TO_QUEUE = {
    "todo": "待读",
    "reading": "待精读",
    "read": "已精读",
    "deep": "已精读",
}
QUEUE_TO_STATUS = {
    "待读": "todo",
    "待精读": "reading",
    "已精读": "deep",
}

PAPER_NOTE_FIELDS = (
    "raw_markdown", "motivation", "problem", "method", "datasets", "metrics",
    "results", "limitations", "relation_to_my_work", "quotable", "next_actions",
)


def paper_note_has_content(note: models.PaperNote | None) -> bool:
    return bool(note and any((getattr(note, field, "") or "").strip() for field in PAPER_NOTE_FIELDS))


def _ensure_queue_tag(db: Session, name: str) -> models.Tag:
    tag = db.query(models.Tag).filter_by(name=name).first()
    if not tag:
        tag = models.Tag(
            name=name,
            dimension=QUEUE_DIM,
            color=QUEUE_COLORS.get(name, "#6B5B95"),
        )
        db.add(tag)
        db.flush()
    elif (tag.dimension or "") != QUEUE_DIM:
        tag.dimension = QUEUE_DIM
    return tag


def strip_queue_names(tag_names: list[str]) -> list[str]:
    return [n for n in (tag_names or []) if n and n not in QUEUE_TAGS]


def queue_name_for_status(status: str | None) -> str | None:
    if (status or "") == "dropped":
        return None
    return STATUS_TO_QUEUE.get(status or "todo")


def merge_status_into_tags(tag_names: list[str], status: str | None) -> list[str]:
    """Replace any 阅读队列 tags with the one implied by status."""
    base = strip_queue_names(tag_names)
    q = queue_name_for_status(status)
    if q:
        base.append(q)
    return list(dict.fromkeys(base))


def status_from_queue_tags(tag_names: list[str], fallback: str | None = None) -> str | None:
    for name in tag_names or []:
        if name in QUEUE_TO_STATUS:
            return QUEUE_TO_STATUS[name]
    return fallback


def sync_queue_tags_from_status(db: Session, paper: models.Paper) -> None:
    """Rewrite paper's 阅读队列 tag links to match paper.status."""
    target = queue_name_for_status(paper.status)
    queue_links = (
        db.query(models.PaperTag)
        .join(models.Tag, models.Tag.id == models.PaperTag.tag_id)
        .filter(models.PaperTag.paper_id == paper.id, models.Tag.name.in_(QUEUE_TAGS))
        .all()
    )
    for link in queue_links:
        db.delete(link)
    db.flush()
    if not target:
        return
    tag = _ensure_queue_tag(db, target)
    already = db.query(models.PaperTag).filter_by(paper_id=paper.id, tag_id=tag.id).first()
    if not already:
        db.add(models.PaperTag(paper_id=paper.id, tag_id=tag.id))
