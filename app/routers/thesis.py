from __future__ import annotations

from datetime import datetime
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from fastapi.responses import Response
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models
from app.schemas import (
    ThesisMetaIn,
    ThesisMetaOut,
    ThesisChapterIn,
    ThesisChapterOut,
    ThesisMilestoneIn,
    ThesisMilestoneOut,
    ThesisMilestoneAttachmentOut,
)

router = APIRouter(tags=["thesis"])

MAX_ATTACH_BYTES = 40 * 1024 * 1024  # 40MB per file
MAX_ATTACH_COUNT = 40


def _attach_out(row: models.ThesisMilestoneAttachment) -> ThesisMilestoneAttachmentOut:
    return ThesisMilestoneAttachmentOut(
        id=row.id,
        milestone_id=row.milestone_id,
        filename=row.filename,
        content_type=row.content_type or "application/octet-stream",
        size=row.size or 0,
        created_at=row.created_at,
    )


def _milestone_out(row: models.ThesisMilestone) -> ThesisMilestoneOut:
    return ThesisMilestoneOut(
        id=row.id,
        title=row.title,
        due_date=row.due_date,
        status=row.status or "pending",
        notes=row.notes or "",
        location=getattr(row, "location", None) or "",
        outcome=getattr(row, "outcome", None) or "",
        attachments=[_attach_out(a) for a in (row.attachments or [])],
    )


@router.get("/thesis", response_model=ThesisMetaOut)
def get_thesis(db: Session = Depends(get_db)):
    row = db.query(models.ThesisMeta).first()
    if not row:
        row = models.ThesisMeta()
        db.add(row)
        db.commit()
        db.refresh(row)
    return row


@router.put("/thesis", response_model=ThesisMetaOut)
def update_thesis(payload: ThesisMetaIn, db: Session = Depends(get_db)):
    row = db.query(models.ThesisMeta).first()
    if not row:
        row = models.ThesisMeta()
        db.add(row)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.get("/thesis/chapters", response_model=list[ThesisChapterOut])
def list_chapters(db: Session = Depends(get_db)):
    return db.query(models.ThesisChapter).order_by(models.ThesisChapter.order_index, models.ThesisChapter.id).all()


@router.post("/thesis/chapters", response_model=ThesisChapterOut)
def create_chapter(payload: ThesisChapterIn, db: Session = Depends(get_db)):
    row = models.ThesisChapter(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _chapter_descendant_ids(db: Session, root_id: int) -> set[int]:
    rows = db.query(models.ThesisChapter.id, models.ThesisChapter.parent_id).all()
    children: dict[int | None, list[int]] = {}
    for cid, pid in rows:
        children.setdefault(pid, []).append(cid)
    out: set[int] = set()
    stack = list(children.get(root_id, []))
    while stack:
        cur = stack.pop()
        if cur in out:
            continue
        out.add(cur)
        stack.extend(children.get(cur, []))
    return out


@router.put("/thesis/chapters/{cid}", response_model=ThesisChapterOut)
def update_chapter(cid: int, payload: ThesisChapterIn, db: Session = Depends(get_db)):
    row = db.get(models.ThesisChapter, cid)
    if not row:
        raise HTTPException(404)
    data = payload.model_dump()
    parent_id = data.get("parent_id")
    if parent_id == cid:
        raise HTTPException(400, detail="不能将章节设为自己的父级")
    if parent_id is not None:
        if not db.get(models.ThesisChapter, parent_id):
            raise HTTPException(400, detail="父章节不存在")
        if parent_id in _chapter_descendant_ids(db, cid):
            raise HTTPException(400, detail="不能将章节移动到其子章节下")
    for k, v in data.items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/thesis/chapters/{cid}")
def delete_chapter(cid: int, db: Session = Depends(get_db)):
    row = db.get(models.ThesisChapter, cid)
    if not row:
        raise HTTPException(404)
    # delete subtree bottom-up so FK parent_id stays valid
    to_delete = _chapter_descendant_ids(db, cid) | {cid}
    rows = db.query(models.ThesisChapter).filter(models.ThesisChapter.id.in_(to_delete)).all()
    depth: dict[int, int] = {cid: 0}
    changed = True
    while changed:
        changed = False
        for r in rows:
            if r.id in depth:
                continue
            if r.parent_id in depth:
                depth[r.id] = depth[r.parent_id] + 1
                changed = True
    for r in sorted(rows, key=lambda x: depth.get(x.id, 0), reverse=True):
        db.delete(r)
    db.commit()
    return {"ok": True, "deleted": len(to_delete)}


@router.get("/thesis/milestones", response_model=list[ThesisMilestoneOut])
def list_milestones(db: Session = Depends(get_db)):
    rows = (
        db.query(models.ThesisMilestone)
        .options(joinedload(models.ThesisMilestone.attachments))
        .order_by(models.ThesisMilestone.due_date.is_(None), models.ThesisMilestone.id)
        .all()
    )
    return [_milestone_out(r) for r in rows]


@router.get("/thesis/milestones/{mid}", response_model=ThesisMilestoneOut)
def get_milestone(mid: int, db: Session = Depends(get_db)):
    row = (
        db.query(models.ThesisMilestone)
        .options(joinedload(models.ThesisMilestone.attachments))
        .filter(models.ThesisMilestone.id == mid)
        .first()
    )
    if not row:
        raise HTTPException(404)
    return _milestone_out(row)


@router.post("/thesis/milestones", response_model=ThesisMilestoneOut)
def create_milestone(payload: ThesisMilestoneIn, db: Session = Depends(get_db)):
    row = models.ThesisMilestone(**payload.model_dump())
    db.add(row)
    db.flush()
    if row.due_date:
        db.add(
            models.CalendarEvent(
                title=f"[论文节点] {row.title}",
                event_type="thesis_milestone",
                start_at=datetime.combine(row.due_date, datetime.min.time()),
                all_day=True,
                link_type="thesis_milestone",
                link_id=row.id,
            )
        )
    db.commit()
    db.refresh(row)
    return _milestone_out(row)


def _sync_milestone_calendar(db: Session, row: models.ThesisMilestone) -> None:
    ev = (
        db.query(models.CalendarEvent)
        .filter(
            models.CalendarEvent.link_type == "thesis_milestone",
            models.CalendarEvent.link_id == row.id,
        )
        .first()
    )
    if row.due_date:
        title = f"[论文节点] {row.title}"
        start = datetime.combine(row.due_date, datetime.min.time())
        if ev:
            ev.title = title
            ev.start_at = start
            ev.all_day = True
        else:
            db.add(
                models.CalendarEvent(
                    title=title,
                    event_type="thesis_milestone",
                    start_at=start,
                    all_day=True,
                    link_type="thesis_milestone",
                    link_id=row.id,
                )
            )
    elif ev:
        db.delete(ev)


@router.put("/thesis/milestones/{mid}", response_model=ThesisMilestoneOut)
def update_milestone(mid: int, payload: ThesisMilestoneIn, db: Session = Depends(get_db)):
    row = (
        db.query(models.ThesisMilestone)
        .options(joinedload(models.ThesisMilestone.attachments))
        .filter(models.ThesisMilestone.id == mid)
        .first()
    )
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    _sync_milestone_calendar(db, row)
    db.commit()
    db.refresh(row)
    return _milestone_out(row)


@router.delete("/thesis/milestones/{mid}")
def delete_milestone(mid: int, db: Session = Depends(get_db)):
    row = db.get(models.ThesisMilestone, mid)
    if not row:
        raise HTTPException(404)
    db.query(models.CalendarEvent).filter(
        models.CalendarEvent.link_type == "thesis_milestone",
        models.CalendarEvent.link_id == mid,
    ).delete(synchronize_session=False)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.post("/thesis/milestones/{mid}/attachments", response_model=list[ThesisMilestoneAttachmentOut])
async def upload_milestone_attachments(
    mid: int,
    files: list[UploadFile] = File(...),
    db: Session = Depends(get_db),
):
    row = (
        db.query(models.ThesisMilestone)
        .options(joinedload(models.ThesisMilestone.attachments))
        .filter(models.ThesisMilestone.id == mid)
        .first()
    )
    if not row:
        raise HTTPException(404)
    if not files:
        raise HTTPException(400, detail="请选择至少一个文件")
    existing = len(row.attachments or [])
    if existing + len(files) > MAX_ATTACH_COUNT:
        raise HTTPException(400, detail=f"附件最多 {MAX_ATTACH_COUNT} 个")

    created: list[models.ThesisMilestoneAttachment] = []
    for f in files:
        raw = await f.read()
        if not raw:
            continue
        if len(raw) > MAX_ATTACH_BYTES:
            raise HTTPException(400, detail=f"{f.filename or '文件'} 超过 40MB 上限")
        att = models.ThesisMilestoneAttachment(
            milestone_id=mid,
            filename=(f.filename or "未命名").strip() or "未命名",
            content_type=f.content_type or "application/octet-stream",
            size=len(raw),
            data=raw,
        )
        db.add(att)
        created.append(att)
    if not created:
        raise HTTPException(400, detail="未读到有效文件内容")
    db.commit()
    for att in created:
        db.refresh(att)
    return [_attach_out(a) for a in created]


@router.get("/thesis/milestones/{mid}/attachments/{aid}/file")
def download_milestone_attachment(mid: int, aid: int, db: Session = Depends(get_db)):
    att = db.get(models.ThesisMilestoneAttachment, aid)
    if not att or att.milestone_id != mid:
        raise HTTPException(404)
    name = quote(att.filename or "attachment")
    return Response(
        content=bytes(att.data or b""),
        media_type=att.content_type or "application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename*=UTF-8''{name}"},
    )


@router.delete("/thesis/milestones/{mid}/attachments/{aid}")
def delete_milestone_attachment(mid: int, aid: int, db: Session = Depends(get_db)):
    att = db.get(models.ThesisMilestoneAttachment, aid)
    if not att or att.milestone_id != mid:
        raise HTTPException(404)
    db.delete(att)
    db.commit()
    return {"ok": True}
