from __future__ import annotations

from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models
from app.schemas import (
    ProjectIn,
    ProjectOut,
    ProjectNoteIn,
    ProjectNoteOut,
    EngineeringRecordIn,
    EngineeringRecordOut,
    ChecklistIn,
    ChecklistOut,
    ExperimentIn,
    ExperimentOut,
)
from app.services.submission_sync import sync_project_to_submission
from app.services.experiment_serialize import experiment_out as _experiment_out
from app.services.project_echo import project_out as _project_out
from app.services.recycle import soft_delete, clear_focus_if_matches

router = APIRouter(tags=["projects"])


class ProjectHiddenIn(BaseModel):
    hidden: bool = True


@router.get("/projects", response_model=list[ProjectOut])
def list_projects(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Project)
        .filter(models.Project.deleted_at.is_(None))
        .order_by(models.Project.updated_at.desc())
        .all()
    )
    return [_project_out(db, r) for r in rows]


@router.post("/projects", response_model=ProjectOut)
def create_project(payload: ProjectIn, db: Session = Depends(get_db)):
    data = payload.model_dump()
    # Default to research paper projects; grant checklist only for type=grant
    if data.get("project_type") not in ("research", "engineering", "grant", "collab", "ongoing"):
        data["project_type"] = "research"
    if not data.get("project_type"):
        data["project_type"] = "research"
    row = models.Project(**data)
    db.add(row)
    db.flush()
    sync_project_to_submission(db, row)
    db.commit()
    db.refresh(row)
    return _project_out(db, row)


@router.get("/projects/{project_id}", response_model=ProjectOut)
def get_project(project_id: int, db: Session = Depends(get_db)):
    row = db.get(models.Project, project_id)
    if not row or row.deleted_at:
        raise HTTPException(404)
    return _project_out(db, row)


@router.put("/projects/{project_id}", response_model=ProjectOut)
def update_project(project_id: int, payload: ProjectIn, db: Session = Depends(get_db)):
    from datetime import datetime

    row = db.get(models.Project, project_id)
    if not row or row.deleted_at:
        raise HTTPException(404)
    data = payload.model_dump()
    if data.get("project_type") not in ("research", "engineering", "grant", "collab", "ongoing"):
        data["project_type"] = "research"
    for k, v in data.items():
        setattr(row, k, v)
    row.updated_at = datetime.utcnow()
    sync_project_to_submission(db, row)
    db.commit()
    db.refresh(row)
    return _project_out(db, row)


@router.put("/projects/{project_id}/hidden", response_model=ProjectOut)
def set_project_hidden(project_id: int, payload: ProjectHiddenIn, db: Session = Depends(get_db)):
    """Toggle whether a project is hidden from research/experiments boards."""
    from datetime import datetime

    row = db.get(models.Project, project_id)
    if not row or row.deleted_at:
        raise HTTPException(404)
    row.hidden = bool(payload.hidden)
    row.updated_at = datetime.utcnow()
    if row.hidden:
        clear_focus_if_matches(db, project_id)
    db.commit()
    db.refresh(row)
    return _project_out(db, row)


@router.delete("/projects/{project_id}")
def delete_project(project_id: int, db: Session = Depends(get_db)):
    row = db.get(models.Project, project_id)
    if not row or row.deleted_at:
        raise HTTPException(404)
    clear_focus_if_matches(db, project_id)
    return soft_delete(db, models.Project, row)


def _floor_to_hour(dt=None):
    from datetime import datetime

    # 本地时间取整到小时，便于日记式记录
    dt = dt or datetime.now()
    return dt.replace(minute=0, second=0, microsecond=0)


def _note_out(row: models.ProjectNote) -> ProjectNoteOut:
    return ProjectNoteOut(
        id=row.id,
        project_id=row.project_id,
        title=row.title or "",
        body=row.body or "",
        recorded_at=row.recorded_at,
        created_at=row.created_at,
        updated_at=row.updated_at,
    )


def _migrate_legacy_project_notes(db: Session, project: models.Project) -> None:
    """One-shot: move projects.notes into journal entries if none exist yet."""
    legacy = (project.notes or "").strip()
    if not legacy:
        return
    exists = (
        db.query(models.ProjectNote.id)
        .filter(models.ProjectNote.project_id == project.id)
        .first()
    )
    if exists:
        return
    db.add(
        models.ProjectNote(
            project_id=project.id,
            title="早期备注",
            body=legacy,
            recorded_at=_floor_to_hour(project.updated_at),
        )
    )
    db.commit()


@router.get("/projects/{project_id}/notes", response_model=list[ProjectNoteOut])
def list_project_notes(project_id: int, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project or project.deleted_at:
        raise HTTPException(404)
    _migrate_legacy_project_notes(db, project)
    rows = (
        db.query(models.ProjectNote)
        .filter(models.ProjectNote.project_id == project_id)
        .order_by(models.ProjectNote.recorded_at.desc(), models.ProjectNote.id.desc())
        .all()
    )
    return [_note_out(r) for r in rows]


@router.post("/projects/{project_id}/notes", response_model=ProjectNoteOut)
def create_project_note(project_id: int, payload: ProjectNoteIn, db: Session = Depends(get_db)):
    project = db.get(models.Project, project_id)
    if not project or project.deleted_at:
        raise HTTPException(404)
    row = models.ProjectNote(
        project_id=project_id,
        title=(payload.title or "").strip(),
        body=payload.body or "",
        recorded_at=_floor_to_hour(),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _note_out(row)


@router.put("/projects/{project_id}/notes/{note_id}", response_model=ProjectNoteOut)
def update_project_note(
    project_id: int, note_id: int, payload: ProjectNoteIn, db: Session = Depends(get_db)
):
    from datetime import datetime

    row = db.get(models.ProjectNote, note_id)
    if not row or row.project_id != project_id:
        raise HTTPException(404)
    row.title = (payload.title or "").strip()
    row.body = payload.body or ""
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return _note_out(row)


@router.delete("/projects/{project_id}/notes/{note_id}")
def delete_project_note(project_id: int, note_id: int, db: Session = Depends(get_db)):
    row = db.get(models.ProjectNote, note_id)
    if not row or row.project_id != project_id:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}


ENGINEERING_RECORD_TYPES = {
    "learning",
    "architecture",
    "setup",
    "technique",
    "issue",
    "decision",
    "takeaway",
}


def _ensure_engineering_project(db: Session, project_id: int) -> models.Project:
    project = db.get(models.Project, project_id)
    if not project or project.deleted_at:
        raise HTTPException(404)
    if project.project_type != "engineering":
        raise HTTPException(400, detail="结构化工程记录仅用于工程项目")
    return project


def _engineering_record_out(row: models.EngineeringRecord) -> EngineeringRecordOut:
    return EngineeringRecordOut.model_validate(row)


@router.get(
    "/projects/{project_id}/engineering-records",
    response_model=list[EngineeringRecordOut],
)
def list_engineering_records(project_id: int, db: Session = Depends(get_db)):
    _ensure_engineering_project(db, project_id)
    rows = (
        db.query(models.EngineeringRecord)
        .filter(models.EngineeringRecord.project_id == project_id)
        .order_by(models.EngineeringRecord.recorded_at.desc(), models.EngineeringRecord.id.desc())
        .all()
    )
    return [_engineering_record_out(row) for row in rows]


@router.post(
    "/projects/{project_id}/engineering-records",
    response_model=EngineeringRecordOut,
)
def create_engineering_record(
    project_id: int,
    payload: EngineeringRecordIn,
    db: Session = Depends(get_db),
):
    from datetime import datetime

    _ensure_engineering_project(db, project_id)
    data = payload.model_dump()
    if data.get("record_type") not in ENGINEERING_RECORD_TYPES:
        data["record_type"] = "learning"
    row = models.EngineeringRecord(project_id=project_id, recorded_at=datetime.now(), **data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return _engineering_record_out(row)


@router.put(
    "/projects/{project_id}/engineering-records/{record_id}",
    response_model=EngineeringRecordOut,
)
def update_engineering_record(
    project_id: int,
    record_id: int,
    payload: EngineeringRecordIn,
    db: Session = Depends(get_db),
):
    from datetime import datetime

    _ensure_engineering_project(db, project_id)
    row = db.get(models.EngineeringRecord, record_id)
    if not row or row.project_id != project_id:
        raise HTTPException(404)
    data = payload.model_dump()
    if data.get("record_type") not in ENGINEERING_RECORD_TYPES:
        data["record_type"] = "learning"
    for key, value in data.items():
        setattr(row, key, value)
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return _engineering_record_out(row)


@router.delete("/projects/{project_id}/engineering-records/{record_id}")
def delete_engineering_record(
    project_id: int,
    record_id: int,
    db: Session = Depends(get_db),
):
    _ensure_engineering_project(db, project_id)
    row = db.get(models.EngineeringRecord, record_id)
    if not row or row.project_id != project_id:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/projects/{project_id}/checklist", response_model=list[ChecklistOut])
def list_checklist(project_id: int, db: Session = Depends(get_db)):
    return db.query(models.GrantChecklistItem).filter_by(project_id=project_id).all()


@router.post("/projects/{project_id}/checklist", response_model=ChecklistOut)
def add_checklist(project_id: int, payload: ChecklistIn, db: Session = Depends(get_db)):
    if not db.get(models.Project, project_id):
        raise HTTPException(404)
    row = models.GrantChecklistItem(project_id=project_id, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/checklist/{item_id}", response_model=ChecklistOut)
def update_checklist(item_id: int, payload: ChecklistIn, db: Session = Depends(get_db)):
    row = db.get(models.GrantChecklistItem, item_id)
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/checklist/{item_id}")
def delete_checklist(item_id: int, db: Session = Depends(get_db)):
    row = db.get(models.GrantChecklistItem, item_id)
    if not row:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/experiments", response_model=list[ExperimentOut])
def list_experiments(project_id: int | None = None, db: Session = Depends(get_db)):
    q = (
        db.query(models.ExperimentRun)
        .options(joinedload(models.ExperimentRun.figures))
        .filter(models.ExperimentRun.deleted_at.is_(None))
    )
    if project_id is not None:
        q = q.filter_by(project_id=project_id)
    else:
        # hide runs whose project is deleted
        q = q.outerjoin(models.Project, models.ExperimentRun.project_id == models.Project.id).filter(
            (models.ExperimentRun.project_id.is_(None))
            | (models.Project.deleted_at.is_(None))
        )
    rows = q.order_by(models.ExperimentRun.id.desc()).all()
    return [_experiment_out(r) for r in rows]


@router.post("/experiments", response_model=ExperimentOut)
def create_experiment(payload: ExperimentIn, db: Session = Depends(get_db)):
    row = models.ExperimentRun(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    row.figures = []
    return _experiment_out(row)


@router.put("/experiments/{run_id}", response_model=ExperimentOut)
def update_experiment(run_id: int, payload: ExperimentIn, db: Session = Depends(get_db)):
    row = (
        db.query(models.ExperimentRun)
        .options(joinedload(models.ExperimentRun.figures))
        .filter(models.ExperimentRun.id == run_id, models.ExperimentRun.deleted_at.is_(None))
        .first()
    )
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return _experiment_out(row)


@router.delete("/experiments/{run_id}")
def delete_experiment(run_id: int, db: Session = Depends(get_db)):
    row = (
        db.query(models.ExperimentRun)
        .options(joinedload(models.ExperimentRun.figures))
        .filter(models.ExperimentRun.id == run_id, models.ExperimentRun.deleted_at.is_(None))
        .first()
    )
    if not row:
        raise HTTPException(404)
    return soft_delete(db, models.ExperimentRun, row)
