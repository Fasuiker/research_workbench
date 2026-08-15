from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import (
    JournalIn,
    JournalBulkIn,
    JournalOut,
    ConferenceIn,
    ConferenceBulkIn,
    ConferenceOut,
    SubmissionIn,
    SubmissionOut,
    SubmissionEventIn,
    SubmissionEventOut,
    PatentIn,
    PatentOut,
)
from app.services.calendar_sync import (
    clear_conference_deadlines,
    clear_submission_deadline,
    sync_conference_deadlines,
    sync_submission_deadline,
    upcoming_ddl_tips,
)
from app.services.journal_catalog import normalize_tier, upsert_journal_catalog

router = APIRouter(tags=["outputs"])


@router.get("/journals", response_model=list[JournalOut])
def list_journals(db: Session = Depends(get_db)):
    return db.query(models.Journal).order_by(models.Journal.name).all()


@router.post("/journals/seed-recommended")
def seed_recommended_journals(db: Session = Depends(get_db)):
    """Upsert graduation / AI+CAD curated journal list."""
    result = upsert_journal_catalog(db, only_missing=False)
    flag = db.query(models.Setting).filter_by(key="journal_catalog_initialized").first()
    if flag:
        flag.value = "1"
    else:
        db.add(models.Setting(key="journal_catalog_initialized", value="1"))
    db.commit()
    return result


@router.post("/journals", response_model=JournalOut)
def create_journal(payload: JournalIn, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["tier"] = normalize_tier(data.get("tier"))
    row = models.Journal(**data)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/journals/bulk")
def bulk_update_journals(payload: JournalBulkIn, db: Session = Depends(get_db)):
    ids = sorted(set(payload.ids))
    rows = db.query(models.Journal).filter(models.Journal.id.in_(ids)).all() if ids else []
    changes = payload.model_dump(exclude={"ids"}, exclude_none=True)
    if "tier" in changes:
        changes["tier"] = normalize_tier(changes["tier"])
    for row in rows:
        for key, value in changes.items():
            setattr(row, key, value)
    db.commit()
    return {"ok": True, "updated": len(rows)}


@router.delete("/journals/bulk")
def bulk_delete_journals(payload: JournalBulkIn, db: Session = Depends(get_db)):
    ids = sorted(set(payload.ids))
    if not ids:
        return {"ok": True, "deleted": 0}
    db.query(models.Submission).filter(models.Submission.journal_id.in_(ids)).update(
        {models.Submission.journal_id: None}, synchronize_session=False
    )
    deleted = db.query(models.Journal).filter(models.Journal.id.in_(ids)).delete(synchronize_session=False)
    db.commit()
    return {"ok": True, "deleted": deleted}


@router.put("/journals/{jid}", response_model=JournalOut)
def update_journal(jid: int, payload: JournalIn, db: Session = Depends(get_db)):
    row = db.get(models.Journal, jid)
    if not row:
        raise HTTPException(404)
    data = payload.model_dump()
    data["tier"] = normalize_tier(data.get("tier"))
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/journals/{jid}")
def delete_journal(jid: int, db: Session = Depends(get_db)):
    row = db.get(models.Journal, jid)
    if not row:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/conferences", response_model=list[ConferenceOut])
def list_conferences(db: Session = Depends(get_db)):
    return db.query(models.Conference).order_by(models.Conference.name).all()


@router.post("/conferences", response_model=ConferenceOut)
def create_conference(payload: ConferenceIn, db: Session = Depends(get_db)):
    row = models.Conference(**payload.model_dump())
    db.add(row)
    db.flush()
    sync_conference_deadlines(db, row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/conferences/bulk")
def bulk_update_conferences(payload: ConferenceBulkIn, db: Session = Depends(get_db)):
    ids = sorted(set(payload.ids))
    rows = db.query(models.Conference).filter(models.Conference.id.in_(ids)).all() if ids else []
    changes = payload.model_dump(exclude={"ids"}, exclude_none=True)
    for row in rows:
        for key, value in changes.items():
            setattr(row, key, value)
        sync_conference_deadlines(db, row)
    db.commit()
    return {"ok": True, "updated": len(rows)}


@router.delete("/conferences/bulk")
def bulk_delete_conferences(payload: ConferenceBulkIn, db: Session = Depends(get_db)):
    ids = sorted(set(payload.ids))
    if not ids:
        return {"ok": True, "deleted": 0}
    for cid in ids:
        clear_conference_deadlines(db, cid)
    db.query(models.Submission).filter(models.Submission.conference_id.in_(ids)).update(
        {models.Submission.conference_id: None}, synchronize_session=False
    )
    deleted = db.query(models.Conference).filter(models.Conference.id.in_(ids)).delete(synchronize_session=False)
    db.commit()
    return {"ok": True, "deleted": deleted}


@router.put("/conferences/{cid}", response_model=ConferenceOut)
def update_conference(cid: int, payload: ConferenceIn, db: Session = Depends(get_db)):
    row = db.get(models.Conference, cid)
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    sync_conference_deadlines(db, row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/conferences/{cid}")
def delete_conference(cid: int, db: Session = Depends(get_db)):
    row = db.get(models.Conference, cid)
    if not row:
        raise HTTPException(404)
    clear_conference_deadlines(db, cid)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/ddl-tips")
def ddl_tips(within_days: int = Query(21, ge=1, le=120), db: Session = Depends(get_db)):
    """Upcoming conference / submission deadlines for UI tips."""
    return upcoming_ddl_tips(db, within_days=within_days)


@router.get("/submissions", response_model=list[SubmissionOut])
def list_submissions(db: Session = Depends(get_db)):
    return db.query(models.Submission).order_by(models.Submission.updated_at.desc()).all()


@router.post("/submissions", response_model=SubmissionOut)
def create_submission(payload: SubmissionIn, db: Session = Depends(get_db)):
    row = models.Submission(**payload.model_dump())
    db.add(row)
    db.flush()
    sync_submission_deadline(db, row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/submissions/{sid}", response_model=SubmissionOut)
def update_submission(sid: int, payload: SubmissionIn, db: Session = Depends(get_db)):
    row = db.get(models.Submission, sid)
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    sync_submission_deadline(db, row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/submissions/{sid}")
def delete_submission(sid: int, db: Session = Depends(get_db)):
    row = db.get(models.Submission, sid)
    if not row:
        raise HTTPException(404)
    clear_submission_deadline(db, sid)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/submissions/{sid}/events", response_model=list[SubmissionEventOut])
def list_submission_events(sid: int, db: Session = Depends(get_db)):
    return (
        db.query(models.SubmissionEvent)
        .filter_by(submission_id=sid)
        .order_by(models.SubmissionEvent.happened_at.desc())
        .all()
    )


@router.post("/submissions/{sid}/events", response_model=SubmissionEventOut)
def add_submission_event(sid: int, payload: SubmissionEventIn, db: Session = Depends(get_db)):
    if not db.get(models.Submission, sid):
        raise HTTPException(404)
    data = payload.model_dump()
    if not data.get("happened_at"):
        data["happened_at"] = datetime.utcnow()
    row = models.SubmissionEvent(submission_id=sid, **data)
    db.add(row)
    sub = db.get(models.Submission, sid)
    if payload.event_type in {"submitted", "revision", "accepted", "rejected", "published"}:
        sub.status = payload.event_type if payload.event_type != "submitted" else "submitted"
    db.commit()
    db.refresh(row)
    return row


@router.get("/patents", response_model=list[PatentOut])
def list_patents(db: Session = Depends(get_db)):
    return db.query(models.Patent).order_by(models.Patent.id.desc()).all()


@router.post("/patents", response_model=PatentOut)
def create_patent(payload: PatentIn, db: Session = Depends(get_db)):
    row = models.Patent(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/patents/{pid}", response_model=PatentOut)
def update_patent(pid: int, payload: PatentIn, db: Session = Depends(get_db)):
    row = db.get(models.Patent, pid)
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/patents/{pid}")
def delete_patent(pid: int, db: Session = Depends(get_db)):
    row = db.get(models.Patent, pid)
    if not row:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}
