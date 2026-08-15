from __future__ import annotations

from datetime import date, datetime

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import (
    GeneralNoteIn,
    GeneralNoteOut,
    IdeaIn,
    IdeaOut,
    LifeEntryIn,
    LifeEntryOut,
    ProjectOut,
)
from app.services.serialize import paper_to_out
from app.services.reading_state import sync_queue_tags_from_status

router = APIRouter(tags=["extras"])


DEPTH_XP = {"skim": 10, "intensive": 30, "critical": 60}

PAPER_NOTE_SECTIONS = (
    ("motivation", "研究动机"),
    ("problem", "问题定义"),
    ("method", "方法"),
    ("datasets", "数据集"),
    ("metrics", "指标"),
    ("results", "结果"),
    ("limitations", "局限"),
    ("relation_to_my_work", "与我课题关系"),
    ("quotable", "可引用要点"),
    ("next_actions", "后续动作"),
)


def _paper_note_markdown(note: models.PaperNote) -> str:
    if (note.raw_markdown or "").strip():
        return note.raw_markdown or ""
    sections = []
    for field, label in PAPER_NOTE_SECTIONS:
        value = (getattr(note, field, "") or "").strip()
        if value:
            sections.append(f"## {label}\n\n{value}")
    return "\n\n".join(sections)


def _paper_note_has_content(note: models.PaperNote) -> bool:
    """Only surface paper notes that contain user-authored Markdown or sections."""
    if (note.raw_markdown or "").strip():
        return True
    return any((getattr(note, field, "") or "").strip() for field, _ in PAPER_NOTE_SECTIONS)


@router.get("/notes")
def list_notes(db: Session = Depends(get_db)):
    """Aggregate project journals and paper research notes for the Notes hub."""
    general_rows = (
        db.query(models.GeneralNote)
        .filter(models.GeneralNote.deleted_at.is_(None))
        .order_by(models.GeneralNote.updated_at.desc())
        .all()
    )
    projects = (
        db.query(models.Project)
        .filter(models.Project.deleted_at.is_(None))
        .all()
    )
    project_by_id = {project.id: project for project in projects}

    project_rows = (
        db.query(models.ProjectNote, models.Project)
        .join(models.Project, models.Project.id == models.ProjectNote.project_id)
        .filter(models.Project.deleted_at.is_(None))
        .all()
    )
    paper_rows = (
        db.query(models.PaperNote, models.Paper)
        .join(models.Paper, models.Paper.id == models.PaperNote.paper_id)
        .all()
    )
    paper_project_ids: dict[int, set[int]] = {}
    for paper_id, project_id in db.query(
        models.PaperProject.paper_id,
        models.PaperProject.project_id,
    ).all():
        if project_id in project_by_id:
            paper_project_ids.setdefault(paper_id, set()).add(project_id)

    items = [
        {
            "key": f"general:{note.id}",
            "note_id": note.id,
            "source_type": "general",
            "source_id": note.id,
            "source_title": "普通笔记",
            "title": note.title or "",
            "content": note.body or "",
            "tags": note.tags or "",
            "project_ids": [],
            "project_titles": [],
            "recorded_at": None,
            "updated_at": note.updated_at,
        }
        for note in general_rows
    ]
    for note, project in project_rows:
        items.append(
            {
                "key": f"project:{note.id}",
                "note_id": note.id,
                "source_type": "project",
                "source_id": project.id,
                "source_title": project.title or f"项目 #{project.id}",
                "title": note.title or "",
                "content": note.body or "",
                "project_ids": [project.id],
                "project_titles": [project.title or f"项目 #{project.id}"],
                "recorded_at": note.recorded_at,
                "updated_at": note.updated_at,
            }
        )

    for note, paper in paper_rows:
        if not _paper_note_has_content(note):
            continue
        ids = paper_project_ids.setdefault(paper.id, set())
        if paper.project_id in project_by_id:
            ids.add(paper.project_id)
        sorted_ids = sorted(ids)
        items.append(
            {
                "key": f"paper:{paper.id}",
                "note_id": note.id,
                "source_type": "paper",
                "source_id": paper.id,
                "source_title": paper.title or f"文献 #{paper.id}",
                "title": paper.title or "",
                "content": _paper_note_markdown(note),
                "project_ids": sorted_ids,
                "project_titles": [project_by_id[pid].title or f"项目 #{pid}" for pid in sorted_ids],
                "recorded_at": None,
                "updated_at": note.updated_at,
            }
        )

    items.sort(key=lambda item: item["updated_at"] or item["recorded_at"] or datetime.min, reverse=True)
    return items


@router.get("/general-notes", response_model=list[GeneralNoteOut])
def list_general_notes(db: Session = Depends(get_db)):
    return (
        db.query(models.GeneralNote)
        .filter(models.GeneralNote.deleted_at.is_(None))
        .order_by(models.GeneralNote.updated_at.desc(), models.GeneralNote.id.desc())
        .all()
    )


@router.post("/general-notes", response_model=GeneralNoteOut)
def create_general_note(payload: GeneralNoteIn, db: Session = Depends(get_db)):
    data = payload.model_dump()
    data["title"] = (data.get("title") or "").strip()
    row = models.GeneralNote(**data)
    if not row.title and row.body:
        row.title = row.body.strip().splitlines()[0][:60]
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/general-notes/{note_id}", response_model=GeneralNoteOut)
def update_general_note(note_id: int, payload: GeneralNoteIn, db: Session = Depends(get_db)):
    from datetime import datetime as dt

    row = db.get(models.GeneralNote, note_id)
    if not row or row.deleted_at:
        raise HTTPException(404)
    row.title = (payload.title or "").strip()
    row.body = payload.body or ""
    row.tags = payload.tags or ""
    row.updated_at = dt.utcnow()
    db.commit()
    db.refresh(row)
    return row


@router.delete("/general-notes/{note_id}")
def delete_general_note(note_id: int, db: Session = Depends(get_db)):
    from app.services.recycle import soft_delete

    row = db.get(models.GeneralNote, note_id)
    if not row or row.deleted_at:
        raise HTTPException(404)
    return soft_delete(db, models.GeneralNote, row)


@router.get("/ideas", response_model=list[IdeaOut])
def list_ideas(status: str = "", db: Session = Depends(get_db)):
    q = db.query(models.Idea).filter(models.Idea.deleted_at.is_(None))
    if status:
        q = q.filter(models.Idea.status == status)
    return q.order_by(models.Idea.updated_at.desc()).all()


@router.post("/ideas", response_model=IdeaOut)
def create_idea(payload: IdeaIn, db: Session = Depends(get_db)):
    data = payload.model_dump()
    if data.get("status") not in ("open", "landed", "discarded"):
        data["status"] = "open"
    row = models.Idea(**data)
    if not row.title and row.content:
        row.title = row.content[:40]
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/ideas/{iid}", response_model=IdeaOut)
def update_idea(iid: int, payload: IdeaIn, db: Session = Depends(get_db)):
    row = db.get(models.Idea, iid)
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    if row.status not in ("open", "landed", "discarded"):
        row.status = "open"
    db.commit()
    db.refresh(row)
    return row


@router.put("/ideas/{iid}/status", response_model=IdeaOut)
def set_idea_status(iid: int, status: str = Query("landed"), db: Session = Depends(get_db)):
    if status not in ("open", "landed", "discarded"):
        raise HTTPException(400, "status 须为 open / landed / discarded")
    row = db.get(models.Idea, iid)
    if not row:
        raise HTTPException(404)
    row.status = status
    db.commit()
    db.refresh(row)
    return row


@router.delete("/ideas/{iid}")
def delete_idea(iid: int, db: Session = Depends(get_db)):
    from app.services.recycle import soft_delete

    row = db.get(models.Idea, iid)
    if not row or getattr(row, "deleted_at", None):
        raise HTTPException(404)
    return soft_delete(db, models.Idea, row)


@router.get("/life", response_model=list[LifeEntryOut])
def list_life(category: str = "", db: Session = Depends(get_db)):
    q = db.query(models.LifeEntry)
    if category:
        q = q.filter_by(category=category)
    return q.order_by(models.LifeEntry.id.desc()).limit(200).all()


@router.post("/life", response_model=LifeEntryOut)
def create_life(payload: LifeEntryIn, db: Session = Depends(get_db)):
    row = models.LifeEntry(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/life/{lid}", response_model=LifeEntryOut)
def update_life(lid: int, payload: LifeEntryIn, db: Session = Depends(get_db)):
    row = db.get(models.LifeEntry, lid)
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/life/{lid}")
def delete_life(lid: int, db: Session = Depends(get_db)):
    row = db.get(models.LifeEntry, lid)
    if not row:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.post("/papers/{paper_id}/mark-depth")
def mark_depth(paper_id: int, depth: str = Query("intensive"), db: Session = Depends(get_db)):
    if depth not in DEPTH_XP:
        raise HTTPException(400, "depth 须为 skim/intensive/critical")
    paper = db.get(models.Paper, paper_id)
    if not paper:
        raise HTTPException(404)
    paper.reading_depth = depth
    paper.xp = (paper.xp or 0) + DEPTH_XP[depth]
    if depth == "intensive":
        paper.status = "deep"
    elif depth == "critical":
        paper.status = "deep"
    elif depth == "skim":
        paper.status = "read"
    sync_queue_tags_from_status(db, paper)
    db.commit()
    return {"ok": True, "xp": paper.xp, "reading_depth": paper.reading_depth}


@router.get("/search")
def global_search(q: str = "", db: Session = Depends(get_db)):
    if not q.strip():
        return {
            "papers": [],
            "projects": [],
            "tasks": [],
            "ideas": [],
            "submissions": [],
            "notes": [],
            "annotations": [],
            "meetings": [],
        }
    like = f"%{q.strip()}%"
    papers = db.query(models.Paper).filter(models.Paper.title.ilike(like)).limit(8).all()
    projects = (
        db.query(models.Project)
        .filter(models.Project.title.ilike(like), models.Project.deleted_at.is_(None))
        .limit(8)
        .all()
    )
    tasks = (
        db.query(models.Task)
        .filter(models.Task.title.ilike(like), models.Task.deleted_at.is_(None))
        .limit(8)
        .all()
    )
    ideas = db.query(models.Idea).filter(
        models.Idea.deleted_at.is_(None),
        (models.Idea.title.ilike(like)) | (models.Idea.content.ilike(like)),
    ).limit(8).all()
    subs = db.query(models.Submission).filter(models.Submission.title.ilike(like)).limit(8).all()
    general_notes = (
        db.query(models.GeneralNote)
        .filter(
            models.GeneralNote.deleted_at.is_(None),
            (models.GeneralNote.title.ilike(like))
            | (models.GeneralNote.body.ilike(like))
            | (models.GeneralNote.tags.ilike(like)),
        )
        .limit(8)
        .all()
    )
    paper_notes = (
        db.query(models.PaperNote, models.Paper)
        .join(models.Paper, models.Paper.id == models.PaperNote.paper_id)
        .filter(
            (models.PaperNote.raw_markdown.ilike(like))
            | (models.PaperNote.motivation.ilike(like))
            | (models.PaperNote.problem.ilike(like))
            | (models.PaperNote.method.ilike(like))
            | (models.PaperNote.results.ilike(like))
            | (models.PaperNote.quotable.ilike(like))
            | (models.PaperNote.next_actions.ilike(like))
            | (models.PaperNote.relation_to_my_work.ilike(like))
        )
        .limit(8)
        .all()
    )
    project_notes = (
        db.query(models.ProjectNote, models.Project)
        .join(models.Project, models.Project.id == models.ProjectNote.project_id)
        .filter(
            models.Project.deleted_at.is_(None),
            (models.ProjectNote.title.ilike(like)) | (models.ProjectNote.body.ilike(like)),
        )
        .limit(8)
        .all()
    )
    anns = (
        db.query(models.PaperAnnotation, models.Paper)
        .join(models.Paper, models.Paper.id == models.PaperAnnotation.paper_id)
        .filter(
            (models.PaperAnnotation.comment.ilike(like))
            | (models.PaperAnnotation.selected_text.ilike(like))
        )
        .limit(8)
        .all()
    )
    meetings = (
        db.query(models.Meeting)
        .filter(
            (models.Meeting.title.ilike(like))
            | (models.Meeting.notes.ilike(like))
            | (models.Meeting.agenda.ilike(like))
            | (models.Meeting.decisions.ilike(like))
        )
        .limit(8)
        .all()
    )
    return {
        "papers": [paper_to_out(p) for p in papers],
        "projects": projects,
        "tasks": tasks,
        "ideas": ideas,
        "submissions": subs,
        "notes": [
            {
                "id": n.id,
                "key": f"general:{n.id}",
                "source_type": "general",
                "source_id": n.id,
                "title": n.title or "未命名普通笔记",
                "snippet": (n.body or "")[:120],
            }
            for n in general_notes
        ]
        + [
            {
                "id": n.id,
                "paper_id": p.id,
                "key": f"paper:{p.id}",
                "source_type": "paper",
                "source_id": p.id,
                "title": p.title or "未命名文献",
                "snippet": (n.raw_markdown or n.problem or n.motivation or "")[:120],
            }
            for n, p in paper_notes
        ]
        + [
            {
                "id": n.id,
                "project_id": p.id,
                "key": f"project:{n.id}",
                "source_type": "project",
                "source_id": p.id,
                "title": n.title or p.title or "未命名项目笔记",
                "snippet": (n.body or "")[:120],
            }
            for n, p in project_notes
        ],
        "annotations": [
            {
                "id": a.id,
                "paper_id": p.id,
                "title": p.title or "未命名文献",
                "page": a.page,
                "snippet": (a.comment or a.selected_text or "")[:120],
            }
            for a, p in anns
        ],
        "meetings": [
            {
                "id": m.id,
                "title": m.title,
                "snippet": (m.notes or m.agenda or m.decisions or "")[:120],
            }
            for m in meetings
        ],
    }


@router.get("/quote")
def random_quote(db: Session = Depends(get_db)):
    rows = db.query(models.DailyQuote).filter_by(active=True).all()
    if not rows:
        return {"content": "今天推进一小步。", "author": "Workbench"}
    # stable-ish by day
    idx = date.today().toordinal() % len(rows)
    r = rows[idx]
    return {"content": r.content, "author": r.author}


@router.get("/research-board")
def research_board(db: Session = Depends(get_db)):
    stages = ["选题", "分析", "写作", "在投", "R&R", "接收"]
    projects = (
        db.query(models.Project)
        .filter(
            models.Project.status != "done",
            models.Project.project_type != "engineering",
            models.Project.hidden.is_(False),
            models.Project.deleted_at.is_(None),
        )
        .all()
    )
    board = {s: [] for s in stages}
    for p in projects:
        stage = p.stage if p.stage in board else "选题"
        board[stage].append(p)
    from sqlalchemy import or_

    papers = db.query(models.Paper).count()
    reading = db.query(models.Paper).filter(models.Paper.status.in_(["reading", "deep"])).count()
    active_ids = [p.id for p in projects]
    subs_q = db.query(models.Submission).filter(models.Submission.status.notin_(["published", "rejected"]))
    if active_ids:
        # Count submissions linked to active research projects, plus unlinked ones.
        subs = subs_q.filter(
            or_(models.Submission.project_id.in_(active_ids), models.Submission.project_id.is_(None))
        ).count()
    else:
        subs = subs_q.filter(models.Submission.project_id.is_(None)).count()
    return {
        "stages": stages,
        "board": {
            s: [ProjectOut.model_validate(p).model_dump(mode="json") for p in board[s]]
            for s in stages
        },
        "stats": {
            "active_projects": len(projects),
            "papers": papers,
            "reading": reading,
            "active_submissions": subs,
        },
    }


@router.get("/engineering-board")
def engineering_board(db: Session = Depends(get_db)):
    stages = ["待考察", "架构拆解", "环境搭建", "最小复现", "改造实践", "已沉淀"]
    projects = (
        db.query(models.Project)
        .filter(
            models.Project.project_type == "engineering",
            models.Project.status != "done",
            models.Project.hidden.is_(False),
            models.Project.deleted_at.is_(None),
        )
        .order_by(models.Project.updated_at.desc())
        .all()
    )
    board = {stage: [] for stage in stages}
    for project in projects:
        stage = project.stage if project.stage in board else "待考察"
        board[stage].append(project)

    record_rows = (
        db.query(models.EngineeringRecord.project_id, models.EngineeringRecord.record_type)
        .join(models.Project, models.EngineeringRecord.project_id == models.Project.id)
        .filter(
            models.Project.project_type == "engineering",
            models.Project.deleted_at.is_(None),
        )
        .all()
    )
    record_counts: dict[int, int] = {}
    technical_records = 0
    technical_types = {"architecture", "technique", "decision", "takeaway"}
    for project_id, record_type in record_rows:
        record_counts[project_id] = record_counts.get(project_id, 0) + 1
        if record_type in technical_types:
            technical_records += 1

    def project_payload(project: models.Project) -> dict:
        payload = ProjectOut.model_validate(project).model_dump(mode="json")
        payload["record_count"] = record_counts.get(project.id, 0)
        return payload

    completed = (
        db.query(models.Project)
        .filter(
            models.Project.project_type == "engineering",
            models.Project.status == "done",
            models.Project.deleted_at.is_(None),
        )
        .count()
    )
    return {
        "stages": stages,
        "board": {
            stage: [project_payload(project) for project in board[stage]]
            for stage in stages
        },
        "stats": {
            "active_projects": len(projects),
            "records": len(record_rows),
            "technical_records": technical_records,
            "completed_projects": completed,
        },
    }
