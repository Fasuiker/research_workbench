from __future__ import annotations

from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models
from app.schemas import MeetingIn, MeetingOut
from app.services.serialize import meeting_to_out

router = APIRouter(tags=["meetings"])


def _load(db: Session, mid: int) -> models.Meeting:
    m = (
        db.query(models.Meeting)
        .options(joinedload(models.Meeting.action_items))
        .filter_by(id=mid)
        .first()
    )
    if not m:
        raise HTTPException(404)
    return m


@router.get("/meetings", response_model=list[MeetingOut])
def list_meetings(db: Session = Depends(get_db)):
    rows = (
        db.query(models.Meeting)
        .options(joinedload(models.Meeting.action_items))
        .order_by(models.Meeting.start_at.desc())
        .all()
    )
    return [meeting_to_out(m) for m in rows]


@router.post("/meetings", response_model=MeetingOut)
def create_meeting(payload: MeetingIn, db: Session = Depends(get_db)):
    data = payload.model_dump()
    actions = data.pop("action_items", [])
    m = models.Meeting(**data)
    db.add(m)
    db.flush()
    for a in actions:
        db.add(models.MeetingActionItem(meeting_id=m.id, **a))
    db.add(
        models.CalendarEvent(
            title=f"[会议] {m.title}",
            event_type="meeting",
            start_at=m.start_at,
            end_at=m.end_at,
            all_day=False,
            project_id=m.project_id,
            link_type="meeting",
            link_id=m.id,
        )
    )
    db.commit()
    return meeting_to_out(_load(db, m.id))


@router.put("/meetings/{mid}", response_model=MeetingOut)
def update_meeting(mid: int, payload: MeetingIn, db: Session = Depends(get_db)):
    m = _load(db, mid)
    data = payload.model_dump()
    actions = data.pop("action_items", [])
    for k, v in data.items():
        setattr(m, k, v)
    for old in list(m.action_items):
        db.delete(old)
    db.flush()
    for a in actions:
        db.add(models.MeetingActionItem(meeting_id=m.id, **a))
    db.commit()
    return meeting_to_out(_load(db, mid))


@router.delete("/meetings/{mid}")
def delete_meeting(mid: int, db: Session = Depends(get_db)):
    m = db.get(models.Meeting, mid)
    if not m:
        raise HTTPException(404)
    # Remove linked calendar chips as well
    db.query(models.CalendarEvent).filter(
        (models.CalendarEvent.link_type == "meeting") & (models.CalendarEvent.link_id == mid)
    ).delete(synchronize_session=False)
    db.delete(m)
    db.commit()
    return {"ok": True}


@router.post("/meetings/{mid}/to-tasks")
def meeting_to_tasks(mid: int, db: Session = Depends(get_db)):
    m = _load(db, mid)
    created = []
    for a in m.action_items:
        if a.done or a.task_id:
            continue
        t = models.Task(
            title=a.content[:400],
            description=f"来自会议: {m.title}",
            due_date=a.due_date,
            project_id=m.project_id,
            link_type="meeting",
            link_id=m.id,
            status="todo",
            priority="medium",
        )
        db.add(t)
        db.flush()
        a.task_id = t.id
        created.append(t.id)
    db.commit()
    return {"created_task_ids": created}
