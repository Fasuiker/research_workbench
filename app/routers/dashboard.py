from __future__ import annotations

import json
from datetime import datetime, date, timedelta
from pathlib import Path

from fastapi import APIRouter, BackgroundTasks, Body, Depends, File, UploadFile, Query, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db, SessionLocal, init_db
from app import models
from app.schemas import (
    SettingsOut,
    SettingsUpdate,
    DashboardOut,
    ProjectOut,
    TaskOut,
    CalendarEventOut,
    CheckInIn,
    CheckInOut,
    FocusStartIn,
    FocusStopIn,
    FocusUpdateIn,
    FocusOut,
    FocusStatsOut,
    LeaveIn,
    LeaveOut,
    InboxIn,
    InboxOut,
)
from app.services.backup import export_snapshot, import_zip
from app.services.demo_data import factory_reset, seed_demo_data
from app.services.prompt_defaults import (
    default_prompts,
    merge_prompts,
    prompts_to_json,
    prompt_meta,
    PROMPT_KEYS,
)
from app.config import EXPORT_DIR
from app.data_spaces import active_profile, restart_process, runtime_profile, select_profile, space_info

router = APIRouter(tags=["dashboard"])

DEFAULT_LINKS = [
    {"name": "Claude", "url": "https://claude.ai"},
    {"name": "ChatGPT", "url": "https://chatgpt.com"},
    {"name": "Google Scholar", "url": "https://scholar.google.com"},
    {"name": "Overleaf", "url": "https://www.overleaf.com"},
    {"name": "SSRN", "url": "https://www.ssrn.com"},
]


def _get_setting(db: Session, key: str, default: str = "") -> str:
    row = db.get(models.Setting, key)
    return row.value if row else default


def _set_setting(db: Session, key: str, value: str) -> None:
    row = db.get(models.Setting, key)
    if row:
        row.value = value
    else:
        db.add(models.Setting(key=key, value=value))


def _parse_links(raw: str) -> list[dict]:
    if not raw:
        return list(DEFAULT_LINKS)
    try:
        data = json.loads(raw)
        return data if isinstance(data, list) else list(DEFAULT_LINKS)
    except Exception:
        return list(DEFAULT_LINKS)


def _normalize_mail_accounts(raw: str, legacy_email: str = "") -> list[dict]:
    accounts: list[dict] = []
    if raw:
        try:
            data = json.loads(raw)
            if isinstance(data, list):
                for item in data:
                    if not isinstance(item, dict):
                        continue
                    name = str(item.get("name") or "").strip()
                    address = str(item.get("address") or "").strip()
                    url = str(item.get("url") or "").strip()
                    if not name and not address:
                        continue
                    if url and not url.startswith(("http://", "https://", "mailto:")):
                        url = "https://" + url.lstrip("/")
                    accounts.append(
                        {
                            "name": name or address or "邮箱",
                            "address": address,
                            "url": url,
                        }
                    )
        except Exception:
            accounts = []
    if not accounts and legacy_email:
        addr = legacy_email.strip()
        lower = addr.lower()
        if "gmail.com" in lower:
            url = "https://mail.google.com/"
            name = "Gmail"
        else:
            url = f"mailto:{addr}"
            name = "邮箱"
        accounts = [{"name": name, "address": addr, "url": url}]
    return accounts


@router.get("/health")
def health():
    return {"ok": True, "app": "research-workbench"}


def _mask_key(key: str) -> str:
    key = key or ""
    if len(key) <= 8:
        return "••••" if key else ""
    return f"{key[:3]}••••{key[-4:]}"


def _normalize_person_status(label: str) -> str:
    """Statuses: 在岗 / 休息 / 请假 / 外出."""
    s = (label or "").strip()
    # Reject mojibake / placeholder labels like "??"
    if not s or set(s.replace(" ", "")) <= {"?"}:
        return "在岗"
    if s == "请假":
        return "请假"
    if s == "休息":
        return "休息"
    if s in ("外出", "外出实验", "会议日"):
        return "外出"
    if s == "在岗":
        return "在岗"
    return "在岗"


def _normalize_leave_status(label: str) -> str:
    s = (label or "").strip()
    if not s or set(s.replace(" ", "")) <= {"?"}:
        return "外出"
    s = _normalize_person_status(s)
    return s if s in ("请假", "外出", "休息", "在岗") else "请假"


@router.get("/settings", response_model=SettingsOut)
def get_settings(db: Session = Depends(get_db)):
    from app.services.backup_health import ensure_weekly_backup, backup_health

    ensure_weekly_backup(db)
    health = backup_health(db)
    fp = _get_setting(db, "focus_project_id", "")
    # clear focus if project missing / deleted / hidden
    if fp.isdigit():
        p = db.get(models.Project, int(fp))
        if (not p) or p.deleted_at or p.hidden:
            _set_setting(db, "focus_project_id", "")
            fp = ""
    key = _get_setting(db, "llm_api_key", "")
    legacy_email = _get_setting(db, "email", "")
    mail_accounts = _normalize_mail_accounts(_get_setting(db, "mail_accounts", ""), legacy_email)
    primary = next((a.get("address") or "" for a in mail_accounts if a.get("address")), legacy_email)
    prompts = merge_prompts(_get_setting(db, "llm_prompts", ""))
    return SettingsOut(
        focus_project_id=int(fp) if fp.isdigit() else None,
        personal_status=_normalize_person_status(_get_setting(db, "personal_status", "在岗")),
        watch_scan_depth=int(_get_setting(db, "watch_scan_depth", "4") or 4),
        ai_note_template=_get_setting(db, "ai_note_template", "algorithm"),
        workspace_name=_get_setting(db, "workspace_name", "科研工作台"),
        workspace_subtitle=_get_setting(db, "workspace_subtitle", "Research Workspace"),
        quick_links=_parse_links(_get_setting(db, "quick_links", "")),
        location_city=_get_setting(db, "location_city", "上海") or "上海",
        email=primary or legacy_email,
        mail_accounts=mail_accounts,
        llm_base_url=_get_setting(db, "llm_base_url", "https://api.openai.com/v1")
        or "https://api.openai.com/v1",
        llm_model=_get_setting(db, "llm_model", "gpt-4o-mini") or "gpt-4o-mini",
        llm_api_key_set=bool(key.strip()),
        llm_api_key_hint=_mask_key(key),
        llm_enabled=_get_setting(db, "llm_enabled", "1") not in ("0", "false", "False", "off", "no"),
        llm_read_mode=(
            "full"
            if _get_setting(db, "llm_read_mode", "summary").strip().lower()
            in ("full", "全文", "thorough", "deep")
            else "summary"
        ),
        theme=_get_setting(db, "theme", "light") or "light",
        llm_prompts=prompts,
        llm_prompt_defaults=default_prompts(),
        llm_prompt_meta=prompt_meta(),
        last_backup_at=health.get("last_backup_at"),
        last_backup_file=health.get("last_backup_file"),
        backup_remind_enabled=health.get("backup_remind_enabled", True),
        auto_weekly_backup=health.get("auto_weekly_backup", True),
        backup_interval_days=health.get("backup_interval_days", 7),
        backup_due=health.get("backup_due", False),
        backup_days_since=health.get("backup_days_since"),
    )


@router.put("/settings", response_model=SettingsOut)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    data = payload.model_dump(exclude_unset=True)
    # never persist empty key overwrite accidentally when UI sends blank
    if "llm_api_key" in data and not (data.get("llm_api_key") or "").strip():
        data.pop("llm_api_key", None)
    if "theme" in data and data["theme"] not in ("light", "dark", "pine", "mist", "bamboo", "sky", "amber"):
        data["theme"] = "light"
    if "personal_status" in data:
        data["personal_status"] = _normalize_person_status(data.get("personal_status") or "在岗")
    mapping = {
        "focus_project_id": lambda v: "" if v is None else str(v),
        "personal_status": str,
        "watch_scan_depth": str,
        "ai_note_template": str,
        "workspace_name": str,
        "workspace_subtitle": str,
        "quick_links": lambda v: json.dumps(v or [], ensure_ascii=False),
        "location_city": str,
        "email": str,
        "mail_accounts": lambda v: json.dumps(v or [], ensure_ascii=False),
        "llm_base_url": str,
        "llm_model": str,
        "llm_api_key": str,
        "llm_enabled": lambda v: "1" if v else "0",
        "llm_read_mode": lambda v: (
            "full"
            if str(v or "").strip().lower() in ("full", "全文", "thorough", "deep")
            else "summary"
        ),
        "theme": str,
        "llm_prompts": lambda v: prompts_to_json(merge_prompts(v or {})),
        "backup_remind_enabled": lambda v: "1" if v else "0",
        "auto_weekly_backup": lambda v: "1" if v else "0",
        "backup_interval_days": lambda v: str(max(1, min(90, int(v or 7)))),
    }
    if "mail_accounts" in data:
        accounts = _normalize_mail_accounts(json.dumps(data.get("mail_accounts") or [], ensure_ascii=False), "")
        data["mail_accounts"] = accounts
        if accounts and not data.get("email"):
            data["email"] = accounts[0].get("address") or ""
        elif accounts:
            data["email"] = accounts[0].get("address") or data.get("email") or ""
    if "llm_prompts" in data and data["llm_prompts"] is not None:
        raw = data["llm_prompts"]
        if not isinstance(raw, dict):
            data.pop("llm_prompts", None)
        elif not raw:
            # {} = 全部恢复默认
            data["llm_prompts"] = default_prompts()
        else:
            prev = merge_prompts(_get_setting(db, "llm_prompts", ""))
            for key in PROMPT_KEYS:
                if key not in raw:
                    continue
                val = raw.get(key)
                if isinstance(val, str) and val.strip():
                    prev[key] = val.strip()
                else:
                    prev[key] = default_prompts()[key]
            data["llm_prompts"] = prev
    for k, v in data.items():
        if k in mapping:
            _set_setting(db, k, mapping[k](v))
    db.commit()
    return get_settings(db)


@router.get("/dashboard", response_model=DashboardOut)
def dashboard(db: Session = Depends(get_db)):
    today = date.today()
    settings = get_settings(db)
    focus_project = None
    if settings.focus_project_id:
        p = db.get(models.Project, settings.focus_project_id)
        if p and not p.deleted_at and not p.hidden:
            focus_project = ProjectOut.model_validate(p)
    next_tasks = (
        db.query(models.Task)
        .filter(models.Task.status != "done", models.Task.deleted_at.is_(None))
        .order_by(models.Task.due_date.is_(None), models.Task.due_date, models.Task.priority.desc())
        .limit(8)
        .all()
    )
    total = db.query(models.Task).filter(models.Task.deleted_at.is_(None)).count()
    done_today = (
        db.query(models.Task)
        .filter(
            models.Task.deleted_at.is_(None),
            models.Task.status == "done",
            func.date(models.Task.completed_at) == today,
        )
        .count()
    )
    overdue = (
        db.query(models.Task)
        .filter(
            models.Task.deleted_at.is_(None),
            models.Task.status != "done",
            models.Task.due_date < today,
        )
        .count()
    )
    open_count = (
        db.query(models.Task)
        .filter(models.Task.deleted_at.is_(None), models.Task.status != "done")
        .count()
    )
    end = datetime.combine(today + timedelta(days=7), datetime.max.time())
    start = datetime.combine(today, datetime.min.time())
    events = (
        db.query(models.CalendarEvent)
        .filter(models.CalendarEvent.start_at >= start, models.CalendarEvent.start_at <= end)
        .order_by(models.CalendarEvent.start_at)
        .limit(20)
        .all()
    )
    # merge task deadlines into virtual events list for dashboard
    task_due = (
        db.query(models.Task)
        .filter(models.Task.due_date != None, models.Task.due_date >= today, models.Task.due_date <= today + timedelta(days=7))  # noqa: E711
        .all()
    )
    upcoming = [CalendarEventOut.model_validate(e) for e in events]
    for t in task_due:
        upcoming.append(
            CalendarEventOut(
                id=-t.id,
                title=f"[任务] {t.title}",
                event_type="deadline",
                start_at=datetime.combine(t.due_date, datetime.min.time()),
                end_at=None,
                all_day=True,
                project_id=t.project_id,
                link_type="task",
                link_id=t.id,
                notes="",
                created_at=t.created_at,
            )
        )
    upcoming.sort(key=lambda x: x.start_at)
    checkins = db.query(models.CheckIn).order_by(models.CheckIn.day.desc()).limit(14).all()
    active_focus = db.query(models.FocusSession).filter_by(active=True).order_by(models.FocusSession.id.desc()).first()
    inbox = db.query(models.InboxItem).filter_by(processed=False).order_by(models.InboxItem.id.desc()).limit(20).all()
    paper_total = db.query(models.Paper).count()
    paper_reading = db.query(models.Paper).filter(models.Paper.status.in_(["reading", "deep"])).count()
    # streak: consecutive days with any checkin ending today or yesterday
    streak = 0
    d = today
    recent_days = (
        db.query(models.CheckIn.day)
        .filter(models.CheckIn.day >= today - timedelta(days=120))
        .distinct()
        .all()
    )
    days_with = {row[0] for row in recent_days}
    while d in days_with:
        streak += 1
        d -= timedelta(days=1)
    if streak == 0 and (today - timedelta(days=1)) in days_with:
        d = today - timedelta(days=1)
        while d in days_with:
            streak += 1
            d -= timedelta(days=1)
    return DashboardOut(
        personal_status=settings.personal_status,
        focus_project=focus_project,
        next_tasks=[TaskOut.model_validate(t) for t in next_tasks],
        task_stats={"total": total, "open": open_count, "done_today": done_today, "overdue": overdue},
        upcoming_events=upcoming[:20],
        recent_checkins=[CheckInOut.model_validate(c) for c in checkins],
        active_focus=FocusOut.model_validate(active_focus) if active_focus else None,
        inbox=[InboxOut.model_validate(i) for i in inbox],
        paper_stats={"total": paper_total, "active_reading": paper_reading},
        streak_days=streak,
    )


@router.get("/checkins", response_model=list[CheckInOut])
def list_checkins(db: Session = Depends(get_db)):
    return db.query(models.CheckIn).order_by(models.CheckIn.day.desc()).limit(90).all()


@router.post("/checkins", response_model=CheckInOut)
def create_checkin(payload: CheckInIn, db: Session = Depends(get_db)):
    row = models.CheckIn(
        day=payload.day or date.today(),
        kind=payload.kind,
        note=payload.note,
        minutes=payload.minutes,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


def _focus_elapsed(row: models.FocusSession, now: datetime | None = None) -> int:
    now = now or datetime.utcnow()
    if row.active:
        return max(0, int((now - row.started_at).total_seconds()))
    return int(row.duration_seconds or 0)


def _focus_out(row: models.FocusSession, db: Session) -> FocusOut:
    label = ""
    lt = (row.link_type or "").strip()
    lid = row.link_id
    if lt and lid:
        if lt == "project":
            p = db.get(models.Project, lid)
            label = (p.title if p else "") or f"项目 #{lid}"
        elif lt == "paper":
            paper = db.get(models.Paper, lid)
            label = (paper.title if paper else "") or f"文献 #{lid}"
        elif lt == "task":
            task = db.get(models.Task, lid)
            label = (task.title if task else "") or f"任务 #{lid}"
    base = FocusOut.model_validate(row)
    return base.model_copy(update={"link_label": label})


@router.get("/focus", response_model=list[FocusOut])
def list_focus(db: Session = Depends(get_db)):
    rows = (
        db.query(models.FocusSession)
        .filter(models.FocusSession.deleted_at.is_(None))
        .order_by(models.FocusSession.id.desc())
        .limit(50)
        .all()
    )
    return [_focus_out(r, db) for r in rows]


@router.get("/focus/active", response_model=FocusOut | None)
def active_focus(db: Session = Depends(get_db)):
    row = (
        db.query(models.FocusSession)
        .filter_by(active=True)
        .filter(models.FocusSession.deleted_at.is_(None))
        .order_by(models.FocusSession.id.desc())
        .first()
    )
    return _focus_out(row, db) if row else None


@router.get("/focus/stats", response_model=FocusStatsOut)
def focus_stats(db: Session = Depends(get_db)):
    now = datetime.utcnow()
    today = date.today()
    week_start = today - timedelta(days=today.weekday())
    month_start = today.replace(day=1)
    rows = (
        db.query(models.FocusSession)
        .filter(
            models.FocusSession.deleted_at.is_(None),
            models.FocusSession.started_at >= datetime.combine(month_start - timedelta(days=7), datetime.min.time()),
        )
        .order_by(models.FocusSession.id.desc())
        .all()
    )
    today_sec = week_sec = month_sec = 0
    today_n = week_n = 0
    completed_durs: list[int] = []
    active = None
    for r in rows:
        elapsed = _focus_elapsed(r, now)
        day = r.started_at.date() if r.started_at else today
        if day >= month_start:
            month_sec += elapsed
        if day >= week_start:
            week_sec += elapsed
            week_n += 1
        if day == today:
            today_sec += elapsed
            today_n += 1
        if r.active:
            active = _focus_out(r, db)
        elif elapsed > 0:
            completed_durs.append(elapsed)
    recent = (
        db.query(models.FocusSession)
        .filter(models.FocusSession.deleted_at.is_(None))
        .order_by(models.FocusSession.id.desc())
        .limit(12)
        .all()
    )
    avg = int(sum(completed_durs) / len(completed_durs)) if completed_durs else 0
    return FocusStatsOut(
        today_seconds=today_sec,
        week_seconds=week_sec,
        month_seconds=month_sec,
        today_sessions=today_n,
        week_sessions=week_n,
        avg_session_seconds=avg,
        active=active,
        recent=[_focus_out(r, db) for r in recent],
    )


@router.post("/focus/start", response_model=FocusOut)
def start_focus(payload: FocusStartIn, db: Session = Depends(get_db)):
    for active in db.query(models.FocusSession).filter_by(active=True).all():
        active.active = False
        active.ended_at = datetime.utcnow()
        active.duration_seconds = int((active.ended_at - active.started_at).total_seconds())
    mins = max(0, min(int(payload.planned_minutes or 0), 24 * 60))
    lt = (payload.link_type or "").strip()
    lid = payload.link_id
    lt, lid = _normalize_focus_link(lt, lid)
    row = models.FocusSession(
        title=(payload.title or "专注").strip() or "专注",
        link_type=lt,
        link_id=lid,
        planned_minutes=mins,
        active=True,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _focus_out(row, db)


@router.post("/focus/stop", response_model=FocusOut)
def stop_focus(payload: FocusStopIn, db: Session = Depends(get_db)):
    row = db.query(models.FocusSession).filter_by(active=True).order_by(models.FocusSession.id.desc()).first()
    if not row:
        raise HTTPException(404, "没有进行中的专注")
    row.active = False
    row.ended_at = datetime.utcnow()
    row.duration_seconds = int((row.ended_at - row.started_at).total_seconds())
    row.outcome = payload.outcome
    _apply_paper_reading(db, row.link_type, row.link_id, row.duration_seconds)
    db.commit()
    db.refresh(row)
    return _focus_out(row, db)


def _normalize_focus_link(link_type: str | None, link_id: int | None) -> tuple[str, int | None]:
    lt = (link_type or "").strip()
    lid = link_id
    if lt and not lid:
        return "", None
    if lt and lt not in ("project", "paper", "task"):
        return "", None
    return (lt, lid if lt else None)


def _apply_paper_reading(db: Session, link_type: str, link_id: int | None, delta_sec: int) -> None:
    if (link_type or "") != "paper" or not link_id or not delta_sec:
        return
    paper = db.get(models.Paper, link_id)
    if paper:
        paper.reading_seconds = max(0, int(paper.reading_seconds or 0) + int(delta_sec))


@router.put("/focus/{focus_id}", response_model=FocusOut)
def update_focus(focus_id: int, payload: FocusUpdateIn, db: Session = Depends(get_db)):
    row = db.get(models.FocusSession, focus_id)
    if not row:
        raise HTTPException(404, "专注记录不存在")
    was_active = bool(row.active)
    old_lt, old_lid = row.link_type or "", row.link_id
    old_dur = 0 if was_active else int(row.duration_seconds or 0)

    if payload.title is not None:
        row.title = (payload.title or "专注").strip() or "专注"
    if payload.outcome is not None:
        row.outcome = payload.outcome or ""
    if payload.planned_minutes is not None:
        row.planned_minutes = max(0, min(int(payload.planned_minutes), 24 * 60))
    if payload.link_type is not None or payload.link_id is not None:
        lt = payload.link_type if payload.link_type is not None else row.link_type
        lid = payload.link_id if payload.link_id is not None else row.link_id
        row.link_type, row.link_id = _normalize_focus_link(lt, lid)
    if payload.duration_seconds is not None:
        if row.active:
            raise HTTPException(400, "进行中的专注不能改实际时长，请先结束")
        row.duration_seconds = max(0, min(int(payload.duration_seconds), 24 * 3600))

    if not was_active:
        _apply_paper_reading(db, old_lt, old_lid, -old_dur)
        _apply_paper_reading(db, row.link_type, row.link_id, int(row.duration_seconds or 0))

    db.commit()
    db.refresh(row)
    return _focus_out(row, db)


@router.delete("/focus/{focus_id}")
def delete_focus(focus_id: int, db: Session = Depends(get_db)):
    from app.services.recycle import soft_delete

    row = db.get(models.FocusSession, focus_id)
    if not row or row.deleted_at:
        raise HTTPException(404, "专注记录不存在")
    return soft_delete(db, models.FocusSession, row)


@router.get("/leave", response_model=list[LeaveOut])
def list_leave(db: Session = Depends(get_db)):
    return db.query(models.LeaveRecord).order_by(models.LeaveRecord.start_date.desc()).all()


@router.post("/leave", response_model=LeaveOut)
def create_leave(payload: LeaveIn, db: Session = Depends(get_db)):
    label = _normalize_leave_status(payload.status_label)
    ev = models.CalendarEvent(
        title=f"{label}: {payload.reason or '个人状态'}",
        event_type="leave",
        start_at=datetime.combine(payload.start_date, datetime.min.time()),
        end_at=datetime.combine(payload.end_date, datetime.max.time()),
        all_day=True,
        notes=payload.reason or label,
    )
    db.add(ev)
    db.flush()
    row = models.LeaveRecord(
        start_date=payload.start_date,
        end_date=payload.end_date,
        reason=payload.reason,
        status_label=label,
        calendar_event_id=ev.id,
    )
    today = date.today()
    if payload.start_date <= today <= payload.end_date:
        _set_setting(db, "personal_status", label)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/leave/{leave_id}")
def delete_leave(leave_id: int, db: Session = Depends(get_db)):
    row = db.get(models.LeaveRecord, leave_id)
    if not row:
        raise HTTPException(404)
    if row.calendar_event_id:
        ev = db.get(models.CalendarEvent, row.calendar_event_id)
        if ev:
            db.delete(ev)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/inbox", response_model=list[InboxOut])
def list_inbox(processed: bool | None = None, db: Session = Depends(get_db)):
    q = db.query(models.InboxItem)
    if processed is not None:
        q = q.filter_by(processed=processed)
    return q.order_by(models.InboxItem.id.desc()).limit(100).all()


@router.post("/inbox", response_model=InboxOut)
def create_inbox(payload: InboxIn, db: Session = Depends(get_db)):
    row = models.InboxItem(**payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/inbox/{item_id}", response_model=InboxOut)
def update_inbox(item_id: int, processed: bool = True, project_id: int | None = None, db: Session = Depends(get_db)):
    row = db.get(models.InboxItem, item_id)
    if not row:
        raise HTTPException(404)
    row.processed = processed
    if project_id is not None:
        row.project_id = project_id
    db.commit()
    db.refresh(row)
    return row


@router.delete("/inbox/{item_id}")
def delete_inbox(item_id: int, db: Session = Depends(get_db)):
    row = db.get(models.InboxItem, item_id)
    if not row:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.post("/factory-reset")
def api_factory_reset(db: Session = Depends(get_db)):
    return factory_reset(db)


@router.post("/seed-demo")
def api_seed_demo(db: Session = Depends(get_db)):
    return seed_demo_data(db)


@router.get("/data-spaces")
def get_data_spaces():
    return space_info()


@router.post("/data-spaces/switch")
def switch_data_space(
    background_tasks: BackgroundTasks,
    profile: str = Body(..., embed=True),
):
    target = (profile or "").strip().lower()
    if target not in ("personal", "demo"):
        raise HTTPException(400, "未知数据空间")
    if runtime_profile() == "custom":
        raise HTTPException(409, "当前使用环境变量指定的自定义空间，无法从界面切换")
    if target == runtime_profile():
        return {"ok": True, "profile": target, "restarting": False}
    try:
        select_profile(target)
    except (ValueError, RuntimeError) as exc:
        raise HTTPException(409, str(exc)) from exc
    background_tasks.add_task(restart_process)
    return {"ok": True, "profile": target, "restarting": True}


@router.post("/data-spaces/demo/reset")
def reset_demo_space(db: Session = Depends(get_db)):
    if runtime_profile() != "demo":
        raise HTTPException(409, "只能在演示空间中重建演示数据")
    factory_reset(db)
    result = seed_demo_data(db)
    return {"ok": True, "profile": "demo", "seed": result}


@router.post("/export")
def export_data(db: Session = Depends(get_db)):
    from app.services.backup_health import mark_backup_now

    path = export_snapshot(db)
    mark_backup_now(db, path)
    return FileResponse(path, filename=path.name, media_type="application/zip")


@router.get("/recycle")
def recycle_list(db: Session = Depends(get_db)):
    from app.services.recycle import list_recycle

    return {"items": list_recycle(db)}


@router.post("/recycle/{entity_type}/{entity_id}/restore")
def recycle_restore(entity_type: str, entity_id: int, db: Session = Depends(get_db)):
    from app.services.recycle import restore

    try:
        return restore(db, entity_type, entity_id)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except LookupError as e:
        raise HTTPException(404, str(e)) from e


@router.delete("/recycle/{entity_type}/{entity_id}")
def recycle_purge(entity_type: str, entity_id: int, db: Session = Depends(get_db)):
    from app.services.recycle import purge
    from sqlalchemy.orm import joinedload

    # load figures for experiment purge
    if entity_type == "experiment":
        row = (
            db.query(models.ExperimentRun)
            .options(joinedload(models.ExperimentRun.figures))
            .filter(models.ExperimentRun.id == entity_id)
            .first()
        )
        if not row:
            raise HTTPException(404, "条目不存在")
    try:
        return purge(db, entity_type, entity_id)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except LookupError as e:
        raise HTTPException(404, str(e)) from e


@router.get("/guide")
def product_guide():
    """Product guide sections for Settings browser (Chinese)."""
    return {"sections": GUIDE_SECTIONS}


GUIDE_SECTIONS = [
    {
        "id": "consistency",
        "title": "隐藏 · 焦点 · 关联（一致性）",
        "body": (
            "【隐藏】在「研究」点小眼睛隐藏项目后：研究看板与「实验」列表默认都不再显示该项目及其 Run；"
            "若它曾是焦点项目，焦点会自动清空。可用「显示隐藏」临时查看。\n\n"
            "【焦点】设置或项目详情里设为焦点后，今日页会提示；开始专注时默认预选该项目。"
            "隐藏或删除项目会取消焦点，避免「看不见却还绑着」。\n\n"
            "【关联】文献可挂多个项目标签；专注可绑项目 / 文献 / 任务；想法可关联项目 · 文献 · 投稿。"
            "关联出现在详情与记录里，删除进回收站后关联保留，恢复后继续可用。"
        ),
    },
    {
        "id": "echo",
        "title": "回声（做完能看见）",
        "body": (
            "【专注 → 项目】结束绑定项目的专注后，项目详情会显示本周专注时长 / 次数与最近几条记录（含产出备注）。\n\n"
            "【文献 → 项目】项目详情显示已挂接的文献数量；可从项目跳到文献库按项目筛选。\n\n"
            "【捕获】今日 Inbox / 灵感落实后，会进入想法、任务或文献笔记——保存成功会有明确提示。"
        ),
    },
    {
        "id": "recycle",
        "title": "可恢复（回收站）",
        "body": (
            "删除项目、实验 Run、专注记录、任务、想法时，默认进入回收站（软删除），不会立刻永久抹掉。\n\n"
            "在本页「回收站」可恢复或彻底清除。彻底清除实验 Run 时会删除关联出图文件，请谨慎。\n\n"
            "恢复出厂设置仍会清空全部数据，不受回收站保护。"
        ),
    },
    {
        "id": "backup",
        "title": "每周备份",
        "body": (
            "【手动】点「导出备份」下载 ZIP，同时记一次备份时间。\n\n"
            "【自动】默认开启「每周自动备份」：超过间隔天数（默认 7 天）时，打开设置会在本机 exports/ 目录写入快照。"
            "也可在今日页看到「该备份了」提醒。\n\n"
            "换机请拷贝项目目录或导入 ZIP；勿把含 API Key 的库提交到 Git。"
        ),
    },
    {
        "id": "ai",
        "title": "AI 怎么用（摘要）",
        "body": (
            "文献侧：单篇通读 / 类别综述 / 标题导出——在文献页与分类看板。\n"
            "实验侧：Scier 的绘图模式 + 图库「说明/代码」——复制规范代码包改图。\n"
            "设置里可关总开关、改阅读深度与提示词。不配 Key 时主线功能仍可用。"
        ),
    },
]


@router.post("/import")
async def import_data(mode: str = Query("replace"), file: UploadFile = File(...)):
    if mode not in {"replace", "merge"}:
        raise HTTPException(400, "mode 须为 replace 或 merge")
    dest = EXPORT_DIR / f"upload_{datetime.now().strftime('%Y%m%d_%H%M%S')}_{file.filename}"
    content = await file.read()
    dest.write_bytes(content)
    if mode == "replace":
        # reopen session after replace
        db = SessionLocal()
        try:
            result = import_zip(db, dest, mode="replace")
        finally:
            db.close()
        init_db()
        return result
    db = SessionLocal()
    try:
        result = import_zip(db, dest, mode=mode)
    finally:
        db.close()
    return result
