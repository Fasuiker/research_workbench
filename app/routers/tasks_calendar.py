from __future__ import annotations

from datetime import datetime, date, timedelta

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

from app.database import get_db
from app import models
from app.schemas import TaskIn, TaskOut, CalendarEventIn, CalendarEventOut
from app.services.reading_state import paper_note_has_content

router = APIRouter(tags=["tasks-calendar"])


@router.get("/tasks", response_model=list[TaskOut])
def list_tasks(
    view: str = Query("all"),
    project_id: int | None = None,
    status: str = "",
    db: Session = Depends(get_db),
):
    q = db.query(models.Task).filter(models.Task.deleted_at.is_(None))
    today = date.today()
    if project_id is not None:
        q = q.filter_by(project_id=project_id)
    if status:
        q = q.filter_by(status=status)
    if view == "today":
        q = q.filter(models.Task.due_date == today)
    elif view == "week":
        q = q.filter(models.Task.due_date != None, models.Task.due_date <= today + timedelta(days=7))  # noqa: E711
    elif view == "overdue":
        q = q.filter(models.Task.status != "done", models.Task.due_date != None, models.Task.due_date < today)  # noqa: E711
    elif view == "open":
        q = q.filter(models.Task.status != "done")
    return q.order_by(models.Task.due_date.is_(None), models.Task.due_date, models.Task.id.desc()).all()


@router.post("/tasks", response_model=TaskOut)
def create_task(payload: TaskIn, db: Session = Depends(get_db)):
    row = models.Task(**payload.model_dump())
    if row.status == "done":
        row.completed_at = datetime.utcnow()
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/tasks/{task_id}", response_model=TaskOut)
def update_task(task_id: int, payload: TaskIn, db: Session = Depends(get_db)):
    row = db.get(models.Task, task_id)
    if not row:
        raise HTTPException(404)
    prev = row.status
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    if row.status == "done" and prev != "done":
        row.completed_at = datetime.utcnow()
    if row.status != "done":
        row.completed_at = None
    db.commit()
    db.refresh(row)
    return row


@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_db)):
    from app.services.recycle import soft_delete

    row = db.get(models.Task, task_id)
    if not row or getattr(row, "deleted_at", None):
        raise HTTPException(404)
    return soft_delete(db, models.Task, row)


@router.get("/calendar", response_model=list[CalendarEventOut])
def list_calendar(start: date | None = None, end: date | None = None, db: Session = Depends(get_db)):
    start = start or date.today().replace(day=1)
    end = end or (start + timedelta(days=42))
    start_dt = datetime.combine(start, datetime.min.time())
    end_dt = datetime.combine(end, datetime.max.time())
    # include multi-day leave/events that overlap the range
    events = (
        db.query(models.CalendarEvent)
        .filter(
            models.CalendarEvent.start_at <= end_dt,
            or_(
                models.CalendarEvent.end_at >= start_dt,
                and_(
                    models.CalendarEvent.end_at.is_(None),
                    models.CalendarEvent.start_at >= start_dt,
                ),
            ),
        )
        .order_by(models.CalendarEvent.start_at)
        .all()
    )
    return events


@router.get("/calendar/activity")
def list_calendar_activity(start: date | None = None, end: date | None = None, db: Session = Depends(get_db)):
    """Virtual calendar activities derived from notes and project-linked focus sessions."""
    start = start or date.today().replace(day=1)
    end = end or (start + timedelta(days=42))
    start_dt = datetime.combine(start, datetime.min.time())
    end_dt = datetime.combine(end, datetime.max.time())
    items: list[dict] = []

    project_notes = (
        db.query(models.ProjectNote, models.Project)
        .join(models.Project, models.Project.id == models.ProjectNote.project_id)
        .filter(
            models.Project.deleted_at.is_(None),
            models.ProjectNote.updated_at >= start_dt,
            models.ProjectNote.updated_at <= end_dt,
        )
        .order_by(models.ProjectNote.updated_at)
        .all()
    )
    for note, project in project_notes:
        if not ((note.title or "").strip() or (note.body or "").strip()):
            continue
        items.append({
            "date": note.updated_at.date().isoformat(),
            "kind": "advance",
            "id": project.id,
            "title": f"项目笔记·{project.title}",
            "notes": (note.title or "记录项目笔记").strip(),
            "source": "project_note",
            "source_id": note.id,
        })

    focuses = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.deleted_at.is_(None),
            models.FocusSession.started_at >= start_dt,
            models.FocusSession.started_at <= end_dt,
        )
        .order_by(models.FocusSession.started_at)
        .all()
    )
    task_ids = {f.link_id for f in focuses if f.link_type == "task" and f.link_id}
    paper_ids = {f.link_id for f in focuses if f.link_type == "paper" and f.link_id}
    tasks = {t.id: t for t in db.query(models.Task).filter(models.Task.id.in_(task_ids)).all()} if task_ids else {}
    papers = {p.id: p for p in db.query(models.Paper).filter(models.Paper.id.in_(paper_ids)).all()} if paper_ids else {}
    paper_projects: dict[int, list[int]] = {}
    if paper_ids:
        for link in db.query(models.PaperProject).filter(models.PaperProject.paper_id.in_(paper_ids)).all():
            paper_projects.setdefault(link.paper_id, []).append(link.project_id)

    project_ids = set()
    focus_projects: dict[int, list[int]] = {}
    for focus in focuses:
        ids: list[int] = []
        if focus.link_type == "project" and focus.link_id:
            ids = [focus.link_id]
        elif focus.link_type == "task" and focus.link_id:
            task = tasks.get(focus.link_id)
            if task and task.project_id:
                ids = [task.project_id]
        elif focus.link_type == "paper" and focus.link_id:
            paper = papers.get(focus.link_id)
            ids = list(paper_projects.get(focus.link_id, []))
            if paper and paper.project_id and paper.project_id not in ids:
                ids.insert(0, paper.project_id)
        ids = list(dict.fromkeys(int(pid) for pid in ids if pid))
        focus_projects[focus.id] = ids
        project_ids.update(ids)
    projects = {
        p.id: p
        for p in db.query(models.Project).filter(models.Project.id.in_(project_ids), models.Project.deleted_at.is_(None)).all()
    } if project_ids else {}
    for focus in focuses:
        for project_id in focus_projects.get(focus.id, []):
            project = projects.get(project_id)
            if not project:
                continue
            minutes = max(0, round((focus.duration_seconds or 0) / 60))
            items.append({
                "date": focus.started_at.date().isoformat(),
                "kind": "advance",
                "id": project.id,
                "title": f"项目专注·{project.title}",
                "notes": f"{focus.title or '专注'}{f' · {minutes} 分钟' if minutes else ''}{f' · {focus.outcome}' if focus.outcome else ''}",
                "source": "focus",
                "source_id": focus.id,
            })

    paper_notes = (
        db.query(models.PaperNote, models.Paper)
        .join(models.Paper, models.Paper.id == models.PaperNote.paper_id)
        .filter(models.PaperNote.updated_at >= start_dt, models.PaperNote.updated_at <= end_dt)
        .order_by(models.PaperNote.updated_at)
        .all()
    )
    for note, paper in paper_notes:
        if not paper_note_has_content(note):
            continue
        items.append({
            "date": note.updated_at.date().isoformat(),
            "kind": "reading",
            "id": paper.id,
            "title": "文献阅读",
            "notes": paper.title or "未命名文献",
            "source": "paper_note",
            "source_id": note.id,
        })
    project_groups: dict[tuple[str, int], dict] = {}
    reading_groups: dict[str, dict] = {}
    for item in items:
        if item["kind"] == "advance":
            key = (item["date"], int(item["id"]))
            group = project_groups.setdefault(key, {
                "date": item["date"],
                "kind": "advance",
                "id": int(item["id"]),
                "title": f"项目推进·{item['title'].split('·', 1)[-1]}",
                "notes_list": [],
                "sources": set(),
                "source_ids": [],
            })
            note_text = (item.get("notes") or "").strip()
            if note_text and note_text not in group["notes_list"]:
                group["notes_list"].append(note_text)
            group["sources"].add(item.get("source") or "advance")
            group["source_ids"].append(item.get("source_id"))
        elif item["kind"] == "reading":
            group = reading_groups.setdefault(item["date"], {
                "date": item["date"],
                "kind": "reading",
                "id": int(item["id"]),
                "title": "文献阅读",
                "paper_ids": [],
                "titles": [],
                "source": "paper_note",
            })
            if int(item["id"]) not in group["paper_ids"]:
                group["paper_ids"].append(int(item["id"]))
            paper_title = (item.get("notes") or "未命名文献").strip()
            if paper_title not in group["titles"]:
                group["titles"].append(paper_title)

    output: list[dict] = []
    for group in project_groups.values():
        details = group.pop("notes_list")
        sources = group.pop("sources")
        group["notes"] = " · ".join(details[:3])
        if len(details) > 3:
            group["notes"] += f" · 另 {len(details) - 3} 条"
        group["source"] = "+".join(sorted(sources))
        output.append(group)
    for group in reading_groups.values():
        titles = group.pop("titles")
        group["notes"] = f"{len(titles)} 篇"
        output.append(group)
    return sorted(output, key=lambda item: (item["date"], item["kind"], str(item["id"])))


@router.get("/calendar/research-days")
def list_calendar_research_days(start: date | None = None, end: date | None = None, db: Session = Depends(get_db)):
    """Return one compact research-activity state per day for calendar markers."""
    start = start or date.today().replace(day=1)
    end = end or (start + timedelta(days=42))
    start_dt = datetime.combine(start, datetime.min.time())
    end_dt = datetime.combine(end, datetime.max.time())
    by_day: dict[str, set[str]] = {}

    def mark(value: datetime | None, kind: str) -> None:
        if value is not None and start_dt <= value <= end_dt:
            by_day.setdefault(value.date().isoformat(), set()).add(kind)

    # Existing project-note/focus and paper-note rules remain the source of truth
    # for project advancement and literature reading.
    for item in list_calendar_activity(start=start, end=end, db=db):
        item_date = item.get("date")
        if item_date:
            by_day.setdefault(item_date, set()).add(
                "reading" if item.get("kind") == "reading" else "research"
            )

    projects = (
        db.query(models.Project)
        .filter(
            models.Project.deleted_at.is_(None),
            models.Project.updated_at >= start_dt,
            models.Project.updated_at <= end_dt,
        )
        .all()
    )
    for row in projects:
        mark(row.updated_at, "research")

    engineering_records = (
        db.query(models.EngineeringRecord)
        .filter(
            models.EngineeringRecord.updated_at >= start_dt,
            models.EngineeringRecord.updated_at <= end_dt,
        )
        .all()
    )
    for row in engineering_records:
        if (row.title or "").strip() or (row.body or "").strip():
            mark(row.updated_at, "research")

    general_notes = (
        db.query(models.GeneralNote)
        .filter(
            models.GeneralNote.deleted_at.is_(None),
            models.GeneralNote.updated_at >= start_dt,
            models.GeneralNote.updated_at <= end_dt,
        )
        .all()
    )
    for row in general_notes:
        if (row.title or "").strip() or (row.body or "").strip():
            mark(row.updated_at, "note")

    ideas = (
        db.query(models.Idea)
        .filter(
            models.Idea.deleted_at.is_(None),
            models.Idea.updated_at >= start_dt,
            models.Idea.updated_at <= end_dt,
        )
        .all()
    )
    for row in ideas:
        if (row.title or "").strip() or (row.content or "").strip():
            mark(row.updated_at, "note")

    inbox_items = (
        db.query(models.InboxItem)
        .filter(models.InboxItem.created_at >= start_dt, models.InboxItem.created_at <= end_dt)
        .all()
    )
    for row in inbox_items:
        if (row.content or "").strip():
            mark(row.created_at, "note")

    experiments = (
        db.query(models.ExperimentRun)
        .filter(
            models.ExperimentRun.deleted_at.is_(None),
            or_(
                and_(models.ExperimentRun.started_at >= start_dt, models.ExperimentRun.started_at <= end_dt),
                and_(models.ExperimentRun.ended_at >= start_dt, models.ExperimentRun.ended_at <= end_dt),
            ),
        )
        .all()
    )
    for row in experiments:
        mark(row.started_at, "experiment")
        mark(row.ended_at, "experiment")

    completed_tasks = (
        db.query(models.Task)
        .filter(
            models.Task.deleted_at.is_(None),
            models.Task.completed_at >= start_dt,
            models.Task.completed_at <= end_dt,
        )
        .all()
    )
    for row in completed_tasks:
        mark(row.completed_at, "task")

    task_focuses = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.deleted_at.is_(None),
            models.FocusSession.link_type == "task",
            models.FocusSession.started_at >= start_dt,
            models.FocusSession.started_at <= end_dt,
        )
        .all()
    )
    for row in task_focuses:
        mark(row.started_at, "task")

    return [
        {"date": day, "kinds": sorted(kinds)}
        for day, kinds in sorted(by_day.items())
    ]


@router.post("/calendar", response_model=CalendarEventOut)
def create_event(payload: CalendarEventIn, db: Session = Depends(get_db)):
    row = models.CalendarEvent(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/calendar/{event_id}", response_model=CalendarEventOut)
def update_event(event_id: int, payload: CalendarEventIn, db: Session = Depends(get_db)):
    row = db.get(models.CalendarEvent, event_id)
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/calendar/{event_id}")
def delete_event(event_id: int, db: Session = Depends(get_db)):
    row = db.get(models.CalendarEvent, event_id)
    if not row:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}
