"""Soft-delete / recycle bin helpers for recoverable entities."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy.orm import Session

from app import models

RECYCLE_TYPES = {
    "project": models.Project,
    "experiment": models.ExperimentRun,
    "focus": models.FocusSession,
    "task": models.Task,
    "note": models.GeneralNote,
    "idea": models.Idea,
}

TYPE_LABEL = {
    "project": "项目",
    "experiment": "实验 Run",
    "focus": "专注记录",
    "task": "任务",
    "note": "普通笔记",
    "idea": "想法",
}


def _alive(q, model):
    return q.filter(model.deleted_at.is_(None))


def soft_delete(db: Session, model, row) -> dict:
    if getattr(row, "deleted_at", None):
        return {"ok": True, "already": True}
    row.deleted_at = datetime.utcnow()
    # stop active focus if soft-deleted
    if model is models.FocusSession and getattr(row, "active", False):
        row.active = False
        if not row.ended_at:
            row.ended_at = row.deleted_at
            row.duration_seconds = int((row.ended_at - row.started_at).total_seconds()) if row.started_at else 0
    db.commit()
    return {"ok": True, "recycled": True, "type": _type_for_model(model), "id": row.id}


def _type_for_model(model) -> str:
    for k, v in RECYCLE_TYPES.items():
        if v is model:
            return k
    return "unknown"


def restore(db: Session, entity_type: str, entity_id: int) -> dict:
    model = RECYCLE_TYPES.get(entity_type)
    if not model:
        raise ValueError("未知类型")
    row = db.get(model, entity_id)
    if not row or not getattr(row, "deleted_at", None):
        raise LookupError("回收站中无此条目")
    row.deleted_at = None
    db.commit()
    return {"ok": True, "restored": True, "type": entity_type, "id": entity_id}


def purge(db: Session, entity_type: str, entity_id: int) -> dict:
    model = RECYCLE_TYPES.get(entity_type)
    if not model:
        raise ValueError("未知类型")
    if model is models.ExperimentRun:
        from sqlalchemy.orm import joinedload
        from app.services.experiment_figures import delete_figure_files

        row = (
            db.query(models.ExperimentRun)
            .options(joinedload(models.ExperimentRun.figures))
            .filter(models.ExperimentRun.id == entity_id)
            .first()
        )
        if not row:
            raise LookupError("条目不存在")
        for fig in list(row.figures or []):
            delete_figure_files(fig)
    else:
        row = db.get(model, entity_id)
        if not row:
            raise LookupError("条目不存在")
    if model is models.FocusSession and (row.link_type or "") == "paper" and row.link_id and not row.active:
        paper = db.get(models.Paper, row.link_id)
        if paper:
            paper.reading_seconds = max(0, int(paper.reading_seconds or 0) - int(row.duration_seconds or 0))
    db.delete(row)
    db.commit()
    return {"ok": True, "purged": True, "type": entity_type, "id": entity_id}


def list_recycle(db: Session, limit: int = 100) -> list[dict]:
    items: list[dict] = []
    for etype, model in RECYCLE_TYPES.items():
        rows = (
            db.query(model)
            .filter(model.deleted_at.isnot(None))
            .order_by(model.deleted_at.desc())
            .limit(limit)
            .all()
        )
        for r in rows:
            title = getattr(r, "title", None) or getattr(r, "content", None) or f"#{r.id}"
            if etype == "note" and not (getattr(r, "title", "") or "").strip():
                title = (getattr(r, "body", "") or "")[:60] or f"普通笔记 #{r.id}"
            if etype == "idea" and not (getattr(r, "title", "") or "").strip():
                title = (getattr(r, "content", "") or "")[:60] or f"想法 #{r.id}"
            items.append(
                {
                    "type": etype,
                    "type_label": TYPE_LABEL.get(etype, etype),
                    "id": r.id,
                    "title": str(title)[:200],
                    "deleted_at": r.deleted_at.isoformat() if r.deleted_at else "",
                }
            )
    items.sort(key=lambda x: x.get("deleted_at") or "", reverse=True)
    return items[:limit]


def clear_focus_if_matches(db: Session, project_id: int) -> None:
    from app import models as m

    row = db.get(m.Setting, "focus_project_id")
    if row and row.value.isdigit() and int(row.value) == int(project_id):
        row.value = ""
        db.commit()
