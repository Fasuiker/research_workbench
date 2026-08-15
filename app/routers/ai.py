from __future__ import annotations

from datetime import datetime
from functools import lru_cache
import json
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models
from app.config import DATA_DIR
from app.services.llm import chat_completion, paper_analysis_prompt, corpus_synthesis_prompt
from app.services.files import normalize_path
from app.services.pdf_text import extract_pdf_text
from app.services.full_read import (
    map_reduce_paper_brief,
    map_reduce_paper_digest,
    read_full_pdf,
    synthesize_from_briefs,
)
from app.services.prompt_defaults import merge_prompts
from app.services.weather import fetch_weather
from app.routers.dashboard import _get_setting

router = APIRouter(tags=["ai"])


class ChatIn(BaseModel):
    messages: list[dict] = Field(default_factory=list)
    temperature: float = 0.3


class AgentContextRef(BaseModel):
    type: str
    id: int


class AgentChatIn(BaseModel):
    """Floating agent: user text + optional local file paths to attach as context."""
    message: str = ""
    file_paths: list[str] = Field(default_factory=list)
    system: str = ""
    temperature: float = 0.3
    history: list[dict] = Field(default_factory=list)
    context_refs: list[AgentContextRef] = Field(default_factory=list)
    # general | figure — figure mode loads nature-figure contract/stance/backend fragments
    mode: str = "general"
    backend: str = ""  # python | r | empty (gate asks)


class AgentConversationIn(BaseModel):
    title: str = ""
    mode: str = "general"
    backend: str = ""
    messages: list[dict] = Field(default_factory=list)


class AnalyzeIn(BaseModel):
    mode: str = "summary"  # summary | critique | relate | notes | digest
    extra: str = ""
    use_pdf: bool = False


class DigestIn(BaseModel):
    """生成研究笔记。read_mode: full=全文通读；summary=摘要速览。"""
    write_note: bool = True
    write_mode: str = "append"
    max_pages: int = 0
    extra: str = ""
    prompt_override: str = ""
    # full | summary；空则读设置默认
    read_mode: str = ""


class CorpusIn(BaseModel):
    """类别/方向综述。read_mode: full=每篇全文；summary=摘要速览；notes=仅已有笔记。"""
    scope: str = "tag"
    name: str = ""
    mode: str = "survey"
    extra: str = ""
    prompt_override: str = ""
    use_pdf: bool = True
    max_papers: int = 40
    max_pages_per_paper: int = 0
    save_idea: bool = True
    read_mode: str = ""


def _normalize_read_mode(value: str | None, default: str = "summary") -> str:
    v = (value or "").strip().lower()
    if v in ("full", "全文", "thorough", "deep"):
        return "full"
    if v in ("summary", "fast", "quick", "摘要", "速览"):
        return "summary"
    return default if default in ("full", "summary") else "summary"


def _clean_agent_messages(messages: list[dict]) -> list[dict]:
    cleaned: list[dict] = []
    for raw in (messages or [])[-200:]:
        role = str(raw.get("role") or "").strip()
        content = str(raw.get("content") or "")
        if role not in ("user", "assistant") or not content.strip():
            continue
        item = {"role": role, "content": content[:200_000]}
        if raw.get("error"):
            item["error"] = True
        if role == "user":
            files = raw.get("files") if isinstance(raw.get("files"), list) else []
            contexts = raw.get("contexts") if isinstance(raw.get("contexts"), list) else []
            item["files"] = [x for x in files[:8] if isinstance(x, dict)]
            item["contexts"] = [x for x in contexts[:12] if isinstance(x, dict)]
        cleaned.append(item)
    return cleaned


def _agent_conversation_dict(row: models.AgentConversation, *, include_messages: bool = False) -> dict:
    try:
        messages = json.loads(row.messages_json or "[]")
    except (TypeError, json.JSONDecodeError):
        messages = []
    messages = messages if isinstance(messages, list) else []
    first_user = next((str(item.get("content") or "") for item in messages if isinstance(item, dict) and item.get("role") == "user"), "")
    data = {
        "id": row.id,
        "title": row.title or "新对话",
        "mode": row.mode or "general",
        "backend": row.backend or "",
        "message_count": len(messages),
        "preview": first_user.replace("\n", " ").strip()[:120],
        "created_at": row.created_at,
        "updated_at": row.updated_at,
    }
    if include_messages:
        data["messages"] = messages
    return data


@router.get("/ai/conversations")
def list_agent_conversations(limit: int = 100, db: Session = Depends(get_db)):
    rows = (
        db.query(models.AgentConversation)
        .order_by(models.AgentConversation.updated_at.desc(), models.AgentConversation.id.desc())
        .limit(max(1, min(limit, 200)))
        .all()
    )
    return [_agent_conversation_dict(row) for row in rows]


@router.get("/ai/conversations/{conversation_id}")
def get_agent_conversation(conversation_id: int, db: Session = Depends(get_db)):
    row = db.get(models.AgentConversation, conversation_id)
    if not row:
        raise HTTPException(404, "Scier 历史对话不存在")
    return _agent_conversation_dict(row, include_messages=True)


@router.post("/ai/conversations")
def create_agent_conversation(payload: AgentConversationIn, db: Session = Depends(get_db)):
    mode = payload.mode if payload.mode in ("general", "figure") else "general"
    messages = _clean_agent_messages(payload.messages)
    row = models.AgentConversation(
        title=(payload.title or "新对话").strip()[:300],
        mode=mode,
        backend=(payload.backend or "").strip()[:30],
        messages_json=json.dumps(messages, ensure_ascii=False),
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return _agent_conversation_dict(row, include_messages=True)


@router.put("/ai/conversations/{conversation_id}")
def update_agent_conversation(conversation_id: int, payload: AgentConversationIn, db: Session = Depends(get_db)):
    row = db.get(models.AgentConversation, conversation_id)
    if not row:
        raise HTTPException(404, "Scier 历史对话不存在")
    row.title = (payload.title or row.title or "新对话").strip()[:300]
    row.mode = payload.mode if payload.mode in ("general", "figure") else row.mode
    row.backend = (payload.backend or "").strip()[:30]
    row.messages_json = json.dumps(_clean_agent_messages(payload.messages), ensure_ascii=False)
    row.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(row)
    return _agent_conversation_dict(row, include_messages=True)


@router.delete("/ai/conversations/{conversation_id}")
def delete_agent_conversation(conversation_id: int, db: Session = Depends(get_db)):
    row = db.get(models.AgentConversation, conversation_id)
    if not row:
        raise HTTPException(404, "Scier 历史对话不存在")
    db.delete(row)
    db.commit()
    return {"ok": True}


def _setting_read_mode(db: Session) -> str:
    return _normalize_read_mode(_get_setting(db, "llm_read_mode", "summary"), "summary")


def _resolve_read_mode(db: Session, override: str | None = None) -> str:
    if (override or "").strip():
        return _normalize_read_mode(override, _setting_read_mode(db))
    return _setting_read_mode(db)


def _llm_conf(db: Session) -> tuple[str, str, str]:
    _guard_llm(db)
    key = _get_setting(db, "llm_api_key", "")
    base = _get_setting(db, "llm_base_url", "https://api.openai.com/v1")
    model = _get_setting(db, "llm_model", "gpt-4o-mini")
    return key, base, model


def _llm_enabled(db: Session) -> bool:
    return _get_setting(db, "llm_enabled", "1") not in ("0", "false", "False", "off", "no")


def _llm_prompts(db: Session) -> dict[str, str]:
    return merge_prompts(_get_setting(db, "llm_prompts", ""))


def _guard_llm(db: Session) -> None:
    """Raise 400 if master switch is off (also checked between map-reduce chunks)."""
    if not _llm_enabled(db):
        raise HTTPException(400, "大模型赋能已关闭（设置中可重新开启）")


def _should_abort(db: Session):
    return lambda: not _llm_enabled(db)


def _note_dict(note: models.PaperNote | None) -> dict:
    if not note:
        return {}
    out = {}
    for k in (
        "motivation",
        "problem",
        "method",
        "datasets",
        "metrics",
        "results",
        "limitations",
        "relation_to_my_work",
        "quotable",
        "next_actions",
        "raw_markdown",
    ):
        out[k] = getattr(note, k) or ""
    return out


def _paper_dict(paper: models.Paper) -> dict:
    tags = []
    try:
        tags = [lnk.tag.name for lnk in (paper.tag_links or []) if lnk.tag]
    except Exception:
        tags = []
    return {
        "title": paper.title,
        "authors": paper.authors,
        "year": paper.year,
        "venue": paper.venue,
        "abstract": paper.abstract,
        "tags": tags,
        "local_path": paper.local_path or "",
    }


AGENT_CONTEXT_GROUPS = {
    "project": ("研究", "项目"),
    "project_note": ("研究", "项目笔记"),
    "engineering_record": ("研究", "工程记录"),
    "paper": ("文献", "文献"),
    "paper_note": ("文献", "文献笔记"),
    "submission": ("投稿", "投稿"),
    "meeting": ("会议", "会议"),
    "general_note": ("札记", "普通笔记"),
    "idea": ("札记", "想法"),
    "inbox": ("札记", "Inbox"),
    "task": ("任务", "任务"),
    "experiment": ("实验", "实验 Run"),
    "thesis": ("论文", "论文总览"),
    "thesis_chapter": ("论文", "论文章节"),
    "thesis_milestone": ("论文", "论文节点"),
    "life": ("生活", "生活记录"),
}
AGENT_ROUTE_CONTEXT_TYPES = {
    "research": {"project", "project_note", "engineering_record"},
    "papers": {"paper", "paper_note"},
    "outputs": {"submission"},
    "meetings": {"meeting"},
    "ideas": {"general_note", "idea", "inbox"},
    "tasks": {"task"},
    "projects": {"experiment", "project"},
    "thesis": {"thesis", "thesis_chapter", "thesis_milestone"},
    "life": {"life"},
}


def _context_item(
    type_: str,
    row_id: int,
    title: str,
    subtitle: str = "",
    *,
    parent_id: int | None = None,
    updated_at=None,
    has_pdf: bool = False,
) -> dict:
    group, type_label = AGENT_CONTEXT_GROUPS[type_]
    return {
        "type": type_,
        "id": row_id,
        "title": (title or "未命名").strip(),
        "subtitle": (subtitle or "").strip(),
        "group": group,
        "type_label": type_label,
        "parent_id": parent_id,
        "updated_at": updated_at.isoformat() if updated_at else "",
        "has_pdf": has_pdf,
    }


@router.get("/ai/contexts")
def list_agent_contexts(
    route: str = "",
    project_id: int | None = None,
    paper_id: int | None = None,
    note_id: int | None = None,
    db: Session = Depends(get_db),
):
    """List workbench records that can be referenced by one floating-AI turn."""
    items: list[dict] = []
    projects = {
        row.id: row
        for row in db.query(models.Project).filter(models.Project.deleted_at.is_(None)).all()
    }
    for row in projects.values():
        items.append(_context_item(
            "project", row.id, row.title,
            f"{row.stage or row.status} · 进度 {row.progress or 0}%",
            updated_at=row.updated_at,
        ))
    for row in db.query(models.ProjectNote).order_by(models.ProjectNote.recorded_at.desc()).all():
        project = projects.get(row.project_id)
        items.append(_context_item(
            "project_note", row.id, row.title or "项目笔记",
            project.title if project else "项目已删除",
            parent_id=row.project_id,
            updated_at=row.updated_at,
        ))
    for row in db.query(models.EngineeringRecord).order_by(models.EngineeringRecord.recorded_at.desc()).all():
        project = projects.get(row.project_id)
        if project:
            items.append(_context_item(
                "engineering_record", row.id, row.title or "工程记录",
                project.title,
                parent_id=row.project_id,
                updated_at=row.updated_at,
            ))

    papers = {row.id: row for row in db.query(models.Paper).all()}
    for row in papers.values():
        items.append(_context_item(
            "paper", row.id, row.title,
            " · ".join(part for part in (row.venue, str(row.year or ""), row.authors) if part)[:220],
            updated_at=row.updated_at,
            has_pdf=bool((row.local_path or "").strip()),
        ))
    for row in db.query(models.PaperNote).order_by(models.PaperNote.updated_at.desc()).all():
        paper = papers.get(row.paper_id)
        if paper and any((getattr(row, key, "") or "").strip() for key in PAPER_NOTE_FIELDS):
            items.append(_context_item(
                "paper_note", row.id, f"笔记：{paper.title}",
                paper.venue or str(paper.year or ""),
                parent_id=row.paper_id,
                updated_at=row.updated_at,
            ))

    for row in db.query(models.Submission).order_by(models.Submission.updated_at.desc()).all():
        items.append(_context_item("submission", row.id, row.title, row.status, parent_id=row.project_id, updated_at=row.updated_at))
    for row in db.query(models.Meeting).order_by(models.Meeting.start_at.desc()).all():
        items.append(_context_item("meeting", row.id, row.title, f"{row.meeting_type} · {row.start_at:%Y-%m-%d}", parent_id=row.project_id, updated_at=row.start_at))
    for row in db.query(models.GeneralNote).filter(models.GeneralNote.deleted_at.is_(None)).order_by(models.GeneralNote.updated_at.desc()).all():
        items.append(_context_item("general_note", row.id, row.title or "普通笔记", row.tags, updated_at=row.updated_at))
    for row in db.query(models.Idea).filter(models.Idea.deleted_at.is_(None)).order_by(models.Idea.updated_at.desc()).all():
        items.append(_context_item("idea", row.id, row.title or "想法", f"{row.category} · {row.status}", updated_at=row.updated_at))
    for row in db.query(models.InboxItem).order_by(models.InboxItem.created_at.desc()).all():
        title = (row.content or "Inbox").strip().splitlines()[0][:80]
        items.append(_context_item("inbox", row.id, title, "已整理" if row.processed else "待整理", parent_id=row.project_id, updated_at=row.created_at))
    for row in db.query(models.Task).filter(models.Task.deleted_at.is_(None)).order_by(models.Task.created_at.desc()).all():
        items.append(_context_item("task", row.id, row.title, f"{row.status} · {row.priority}", parent_id=row.project_id, updated_at=row.created_at))
    for row in db.query(models.ExperimentRun).filter(models.ExperimentRun.deleted_at.is_(None)).order_by(models.ExperimentRun.created_at.desc()).all():
        project = projects.get(row.project_id)
        items.append(_context_item("experiment", row.id, row.title, f"{project.title + ' · ' if project else ''}{row.status}", parent_id=row.project_id, updated_at=row.created_at))
    for row in db.query(models.ThesisMeta).all():
        items.append(_context_item("thesis", row.id, row.title, row.subtitle))
    for row in db.query(models.ThesisChapter).order_by(models.ThesisChapter.order_index).all():
        items.append(_context_item("thesis_chapter", row.id, row.title, row.status, parent_id=row.parent_id))
    for row in db.query(models.ThesisMilestone).order_by(models.ThesisMilestone.due_date).all():
        items.append(_context_item("thesis_milestone", row.id, row.title, f"{row.status} · {row.due_date or '无日期'}"))
    for row in db.query(models.LifeEntry).order_by(models.LifeEntry.created_at.desc()).all():
        items.append(_context_item("life", row.id, row.title or row.category, f"{row.category} · {row.day or ''}", updated_at=row.created_at))

    preferred = AGENT_ROUTE_CONTEXT_TYPES.get((route or "").strip(), set())
    def score(item: dict) -> tuple:
        current = (
            (project_id and (item["id"] == project_id or item.get("parent_id") == project_id) and item["type"] in {"project", "project_note", "engineering_record", "experiment"})
            or (paper_id and (item["id"] == paper_id or item.get("parent_id") == paper_id) and item["type"] in {"paper", "paper_note"})
            or (note_id and item["id"] == note_id and item["type"] in {"general_note", "idea", "inbox"})
        )
        return (0 if current else 1, 0 if item["type"] in preferred else 1, item["group"], item["type_label"], item["title"].lower())
    items.sort(key=score)
    return {"items": items, "preferred_types": sorted(preferred), "max_selected": 12}


PAPER_NOTE_FIELDS = (
    "raw_markdown", "motivation", "problem", "method", "datasets", "metrics",
    "results", "limitations", "relation_to_my_work", "quotable", "next_actions",
)


def _clip_context(value, limit: int = 24_000) -> str:
    text = str(value or "").strip()
    return text if len(text) <= limit else text[:limit] + "\n…（上下文已截断）"


def _fields_block(title: str, fields: list[tuple[str, object]]) -> str:
    lines = [f"## {title}"]
    for label, value in fields:
        text = _clip_context(value)
        if text:
            lines.append(f"### {label}\n{text}")
    return "\n\n".join(lines)


AGENT_PAPER_PDF_CHARS = 60_000


def _balanced_pdf_excerpt(text: str, limit: int = AGENT_PAPER_PDF_CHARS) -> tuple[str, bool]:
    """Keep both the paper opening and ending when a PDF exceeds the chat context budget."""
    text = (text or "").strip()
    if len(text) <= limit:
        return text, False
    head_size = int(limit * 0.7)
    tail_size = limit - head_size
    return (
        text[:head_size].rstrip()
        + "\n\n…（PDF 中部因上下文长度限制已省略；下方继续保留文献末尾）…\n\n"
        + text[-tail_size:].lstrip(),
        True,
    )


@lru_cache(maxsize=32)
def _cached_agent_paper_pdf(native_path: str, mtime_ns: int, size: int) -> dict:
    """Cache the bounded text sent to Scier; mtime and size invalidate changed PDFs."""
    del mtime_ns, size
    parsed = extract_pdf_text(native_path, max_pages=None, max_chars=None)
    excerpt, shortened = _balanced_pdf_excerpt(parsed.get("text") or "")
    return {
        "text": excerpt,
        "page_count": int(parsed.get("page_count") or 0),
        "pages_read": int(parsed.get("pages_read") or 0),
        "shortened": shortened,
    }


def _paper_pdf_context(local_path: str) -> str:
    """Resolve an ingested paper's local PDF into source-grounded Scier context."""
    if not (local_path or "").strip():
        return "### PDF 正文\n该文献没有关联本地 PDF。"
    try:
        native = Path(normalize_path(local_path))
    except Exception:
        native = Path(local_path)
    if not native.is_file():
        return f"### PDF 正文\n本地 PDF 不存在或路径已失效：{local_path}"
    try:
        stat = native.stat()
        parsed = _cached_agent_paper_pdf(str(native), stat.st_mtime_ns, stat.st_size)
    except Exception as exc:
        return f"### PDF 正文\nPDF 文本提取失败：{exc}"
    text = (parsed.get("text") or "").strip()
    if not text:
        return "### PDF 正文\nPDF 未提取到可读文本，文件可能是扫描件，需要先进行 OCR。"
    page_meta = f"已读取 {parsed['pages_read']}/{parsed['page_count']} 页"
    if parsed.get("shortened"):
        page_meta += "；正文较长，已保留开头与结尾并省略中部"
    return f"### PDF 正文（{page_meta}）\n{text}"


def _resolve_agent_context(db: Session, ref: AgentContextRef) -> str:
    type_, row_id = ref.type, ref.id
    if type_ == "project":
        row = db.get(models.Project, row_id)
        if not row or row.deleted_at:
            return ""
        return _fields_block(f"项目：{row.title}", [
            ("类型 / 状态", f"{row.project_type} / {row.status} / {row.stage} / 进度 {row.progress}%"),
            ("研究或学习目标", row.research_question), ("预期贡献或能力", row.contribution),
            ("完成标准", row.success_criteria), ("下一步", row.next_step),
            ("目标来源", row.target_venue), ("项目说明", row.notes),
        ])
    if type_ == "project_note":
        row = db.get(models.ProjectNote, row_id)
        if not row:
            return ""
        project = db.get(models.Project, row.project_id)
        return _fields_block(f"项目笔记：{row.title or '未命名'}", [
            ("所属项目", project.title if project else ""), ("记录时间", row.recorded_at), ("Markdown 正文", row.body),
        ])
    if type_ == "engineering_record":
        row = db.get(models.EngineeringRecord, row_id)
        if not row:
            return ""
        project = db.get(models.Project, row.project_id)
        return _fields_block(f"工程记录：{row.title or '未命名'}", [
            ("所属项目", project.title if project else ""), ("记录类型", row.record_type),
            ("内容", row.body), ("来源", row.source_ref), ("代码位置", row.code_ref),
        ])
    if type_ == "paper":
        row = db.get(models.Paper, row_id)
        if not row:
            return ""
        tags = [link.tag.name for link in (row.tag_links or []) if link.tag]
        metadata = _fields_block(f"文献：{row.title}", [
            ("作者", row.authors), ("来源", row.venue or row.year), ("DOI", row.doi),
            ("阅读状态", f"{row.status} / {row.reading_depth}"), ("分类", "、".join(tags)), ("摘要", row.abstract),
        ])
        return metadata + "\n\n" + _paper_pdf_context(row.local_path or "")
    if type_ == "paper_note":
        row = db.get(models.PaperNote, row_id)
        if not row:
            return ""
        paper = db.get(models.Paper, row.paper_id)
        return _fields_block(f"文献笔记：{paper.title if paper else row.paper_id}", [
            (label, getattr(row, key, "")) for key, label in (
                ("raw_markdown", "Markdown 原笔记"), ("motivation", "动机"), ("problem", "问题"),
                ("method", "方法"), ("datasets", "数据集"), ("metrics", "指标"),
                ("results", "结果"), ("limitations", "局限"),
                ("relation_to_my_work", "与我的工作关系"), ("quotable", "可引用内容"), ("next_actions", "下一步"),
            )
        ])
    if type_ == "submission":
        row = db.get(models.Submission, row_id)
        if not row:
            return ""
        events = db.query(models.SubmissionEvent).filter_by(submission_id=row.id).order_by(models.SubmissionEvent.happened_at).all()
        event_text = "\n".join(f"- {event.happened_at:%Y-%m-%d} [{event.event_type}] {event.content}" for event in events)
        return _fields_block(f"投稿：{row.title}", [
            ("状态", row.status), ("作者", row.authors), ("截止日期", row.deadline),
            ("投稿说明", row.notes), ("状态事件", event_text),
        ])
    if type_ == "meeting":
        row = db.get(models.Meeting, row_id)
        if not row:
            return ""
        actions = "\n".join(f"- [{'x' if item.done else ' '}] {item.content}" for item in (row.action_items or []))
        return _fields_block(f"会议：{row.title}", [
            ("时间 / 类型", f"{row.start_at} / {row.meeting_type}"), ("议程", row.agenda),
            ("纪要", row.notes), ("决策", row.decisions), ("行动项", actions),
        ])
    if type_ == "general_note":
        row = db.get(models.GeneralNote, row_id)
        return "" if not row or row.deleted_at else _fields_block(f"普通笔记：{row.title or '未命名'}", [("标签", row.tags), ("Markdown 正文", row.body)])
    if type_ == "idea":
        row = db.get(models.Idea, row_id)
        return "" if not row or row.deleted_at else _fields_block(f"想法：{row.title or '未命名'}", [("分类 / 状态", f"{row.category} / {row.status}"), ("标签", row.tags), ("内容", row.content)])
    if type_ == "inbox":
        row = db.get(models.InboxItem, row_id)
        return "" if not row else _fields_block("Inbox", [("状态", "已整理" if row.processed else "待整理"), ("内容", row.content)])
    if type_ == "task":
        row = db.get(models.Task, row_id)
        return "" if not row or row.deleted_at else _fields_block(f"任务：{row.title}", [
            ("状态 / 优先级", f"{row.status} / {row.priority}"), ("截止日期", row.due_date), ("说明", row.description),
        ])
    if type_ == "experiment":
        row = db.get(models.ExperimentRun, row_id)
        if not row or row.deleted_at:
            return ""
        project = db.get(models.Project, row.project_id) if row.project_id else None
        return _fields_block(f"实验 Run：{row.title}", [
            ("所属项目", project.title if project else ""), ("状态", row.status), ("假设", row.hypothesis),
            ("参数", row.params_json), ("指标", row.metrics_json), ("结论", row.conclusion),
            ("失败原因", row.failure_reason), ("代码 / 数据", f"{row.code_path}\n{row.data_path}"),
        ])
    if type_ == "thesis":
        row = db.get(models.ThesisMeta, row_id)
        return "" if not row else _fields_block(f"论文总览：{row.title}", [
            ("副标题", row.subtitle), ("研究问题", row.research_question), ("贡献", row.contribution), ("说明", row.notes),
        ])
    if type_ == "thesis_chapter":
        row = db.get(models.ThesisChapter, row_id)
        return "" if not row else _fields_block(f"论文章节：{row.title}", [
            ("状态 / 字数目标", f"{row.status} / {row.word_target or '未设'}"), ("摘要", row.summary), ("待解决问题", row.issues),
        ])
    if type_ == "thesis_milestone":
        row = db.get(models.ThesisMilestone, row_id)
        return "" if not row else _fields_block(f"论文节点：{row.title}", [
            ("状态 / 日期", f"{row.status} / {row.due_date or '未设'}"), ("准备说明", row.notes), ("结果反馈", row.outcome),
        ])
    if type_ == "life":
        row = db.get(models.LifeEntry, row_id)
        return "" if not row else _fields_block(f"生活记录：{row.title or row.category}", [
            ("分类 / 日期", f"{row.category} / {row.day or ''}"), ("完成状态", "已完成" if row.done else "未完成"), ("内容", row.content),
        ])
    return ""


def _resolve_agent_contexts(db: Session, refs: list[AgentContextRef]) -> list[str]:
    if len(refs) > 12:
        raise HTTPException(400, "每轮最多选择 12 项工作台上下文")
    seen: set[tuple[str, int]] = set()
    blocks: list[str] = []
    total = 0
    for ref in refs:
        key = (ref.type, ref.id)
        if key in seen or ref.type not in AGENT_CONTEXT_GROUPS:
            continue
        seen.add(key)
        block = _resolve_agent_context(db, ref)
        if not block:
            continue
        remaining = 100_000 - total
        if remaining <= 0:
            break
        block = block[:remaining]
        blocks.append(block)
        total += len(block)
    return blocks


@router.get("/weather")
def weather(city: str = "", db: Session = Depends(get_db)):
    city = city or _get_setting(db, "location_city", "上海") or "上海"
    return fetch_weather(city)


@router.post("/ai/chat")
def ai_chat(payload: ChatIn, db: Session = Depends(get_db)):
    key, base, model = _llm_conf(db)
    if not payload.messages:
        raise HTTPException(400, "messages 不能为空")
    try:
        text = chat_completion(
            api_key=key,
            base_url=base,
            model=model,
            messages=payload.messages,
            temperature=payload.temperature,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e
    return {"content": text, "model": model}


AGENT_FILE_EXTENSIONS = {
    ".pdf", ".txt", ".md", ".csv", ".json", ".py", ".js", ".ts", ".tsx", ".jsx",
    ".css", ".html", ".xml", ".yaml", ".yml", ".tex", ".bib", ".log", ".sql",
}
AGENT_FILE_MAX_BYTES = 20 * 1024 * 1024


@router.post("/ai/agent/files")
async def upload_agent_files(files: list[UploadFile] = File(...)):
    """Upload files selected in the floating chat composer and return local attachment handles."""
    if not files:
        raise HTTPException(400, "请选择文件")
    if len(files) > 8:
        raise HTTPException(400, "每次最多添加 8 个文件")

    upload_dir = DATA_DIR / "agent_uploads"
    upload_dir.mkdir(parents=True, exist_ok=True)
    uploaded = []
    for item in files:
        original = Path(item.filename or "attachment").name
        suffix = Path(original).suffix.lower()
        if suffix not in AGENT_FILE_EXTENSIONS:
            raise HTTPException(400, f"暂不支持 {suffix or '无扩展名'} 文件：{original}")
        content = await item.read(AGENT_FILE_MAX_BYTES + 1)
        if len(content) > AGENT_FILE_MAX_BYTES:
            raise HTTPException(400, f"文件超过 20MB：{original}")
        target_dir = upload_dir / uuid4().hex
        target_dir.mkdir(parents=True, exist_ok=True)
        target = target_dir / original
        target.write_bytes(content)
        uploaded.append({
            "name": original,
            "path": str(target),
            "size": len(content),
            "type": item.content_type or "application/octet-stream",
        })
    return {"files": uploaded}


@router.post("/ai/agent")
def ai_agent(payload: AgentChatIn, db: Session = Depends(get_db)):
    """Floating helper agent using workspace LLM settings; can attach local text files."""
    from pathlib import Path

    from app.services.nature_figure_workflow import (
        build_figure_system_prompt,
        detect_backend,
        nature_figure_root,
    )

    key, base, model = _llm_conf(db)
    msg = (payload.message or "").strip()
    if not msg and not payload.file_paths and not payload.context_refs:
        raise HTTPException(400, "请输入内容、附加文件或选择工作台上下文")

    attachments = []
    for raw in (payload.file_paths or [])[:8]:
        try:
            p = Path(normalize_path(raw))
        except Exception:
            p = Path(str(raw))
        if not p.is_file():
            attachments.append(f"[无法读取] {raw}")
            continue
        if p.stat().st_size > AGENT_FILE_MAX_BYTES:
            attachments.append(f"[文件超过 20MB 已跳过] {p.name}")
            continue
        try:
            if p.suffix.lower() == ".pdf":
                parsed = extract_pdf_text(str(p), max_pages=40, max_chars=60_000)
                text = parsed.get("text") or ""
                pdf_meta = f"PDF 页数: 已读取 {parsed.get('pages_read', 0)}/{parsed.get('page_count', 0)}"
            else:
                text = p.read_text(encoding="utf-8", errors="replace")
                pdf_meta = ""
        except Exception as e:
            attachments.append(f"[读取失败 {e}] {p.name}")
            continue
        if len(text) > 60_000:
            text = text[:60_000] + "\n…(截断)"
        meta_line = f"\n{pdf_meta}" if pdf_meta else ""
        attachments.append(f"### 文件: {p.name}{meta_line}\n```\n{text}\n```")

    user_parts = [msg] if msg else []
    context_blocks = _resolve_agent_contexts(db, payload.context_refs or [])
    if context_blocks:
        user_parts.append(
            "【工作台上下文】\n以下内容来自用户明确选定的科研工作台记录。"
            "请优先依据这些内容回答；若上下文之间有冲突，请指出记录名称与冲突点。\n\n"
            + "\n\n---\n\n".join(context_blocks)
        )
    if attachments:
        user_parts.append("【附加文件】\n" + "\n\n".join(attachments))
    user_content = "\n\n".join(user_parts)

    mode = (payload.mode or "general").strip().lower()
    if mode not in ("general", "figure"):
        mode = "general"

    backend = (payload.backend or "").strip().lower()
    if backend not in ("python", "r", ""):
        backend = ""
    if mode == "figure" and not backend:
        # infer from this turn + recent history
        backend = detect_backend(msg)
        if not backend:
            for h in reversed(payload.history or []):
                if h.get("role") == "user":
                    backend = detect_backend(str(h.get("content") or ""))
                    if backend:
                        break

    if mode == "figure":
        system = build_figure_system_prompt(backend=backend)
    else:
        system = (payload.system or "").strip() or (
            "你是科研工作台里的 AI 助手 Scier。帮助用户理解问题、分析所附材料、整理想法、"
            "改进科研写作、解释概念、编写和调试代码，并给出清晰可执行的建议。"
            "不要主动引入科研绘图流程、配色规范或绘图后端；这些能力只在实验页面的 Scier 绘图模式中启用。"
            "回答准确、简洁，并优先结合用户当前消息和附件内容。"
        )

    messages = [{"role": "system", "content": system}]
    for h in (payload.history or [])[-12:]:
        role = h.get("role")
        content = h.get("content")
        if role in ("user", "assistant") and content:
            messages.append({"role": role, "content": str(content)})
    messages.append({"role": "user", "content": user_content})

    try:
        text = chat_completion(
            api_key=key,
            base_url=base,
            model=model,
            messages=messages,
            temperature=payload.temperature if mode != "figure" else min(payload.temperature, 0.35),
            timeout=240,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e
    return {
        "content": text,
        "model": model,
        "attached": len(payload.file_paths or []),
        "attached_contexts": len(context_blocks),
        "mode": mode,
        "backend": backend,
        "nature_figure_loaded": bool(nature_figure_root()) if mode == "figure" else False,
    }


@router.get("/ai/figure-workflow/status")
def figure_workflow_status():
    from app.services.nature_figure_workflow import nature_figure_root

    root = nature_figure_root()
    return {
        "available": bool(root),
        "skill_path": str(root) if root else "",
    }


@router.post("/ai/papers/{paper_id}/analyze")
def analyze_paper(paper_id: int, payload: AnalyzeIn, db: Session = Depends(get_db)):
    paper = (
        db.query(models.Paper)
        .options(joinedload(models.Paper.tag_links).joinedload(models.PaperTag.tag))
        .filter(models.Paper.id == paper_id)
        .first()
    )
    if not paper:
        raise HTTPException(404, "文献不存在")
    note = db.query(models.PaperNote).filter_by(paper_id=paper_id).first()
    paper_dict = _paper_dict(paper)
    note_dict = _note_dict(note)
    pdf_excerpt = ""
    pdf_meta = None
    if payload.use_pdf or payload.mode == "digest":
        if not paper.local_path:
            raise HTTPException(400, "该文献没有本地 PDF 路径")
        try:
            if payload.mode == "digest":
                pdf_meta = read_full_pdf(paper.local_path)
            else:
                pdf_meta = extract_pdf_text(paper.local_path, max_pages=None, max_chars=None)
            pdf_excerpt = pdf_meta.get("text") or ""
        except Exception as e:
            if payload.mode == "digest":
                raise HTTPException(400, f"PDF 文本提取失败：{e}") from e
    if payload.mode == "digest" and pdf_excerpt.strip():
        key, base, model = _llm_conf(db)
        try:
            text, mr = map_reduce_paper_digest(
                paper=paper_dict,
                note=note_dict,
                pdf_text=pdf_excerpt,
                api_key=key,
                base_url=base,
                model=model,
                prompts=_llm_prompts(db),
                extra=payload.extra,
                should_abort=_should_abort(db),
            )
        except ValueError as e:
            raise HTTPException(400, str(e)) from e
        except Exception as e:
            raise HTTPException(502, str(e)) from e
        return {
            "content": text,
            "model": model,
            "mode": payload.mode,
            "pdf": {**(pdf_meta or {}), **mr},
        }
    messages = paper_analysis_prompt(
        paper_dict,
        note_dict,
        payload.mode,
        pdf_excerpt=pdf_excerpt,
        prompts=_llm_prompts(db),
    )
    if payload.extra.strip():
        messages.append({"role": "user", "content": payload.extra.strip()})
    key, base, model = _llm_conf(db)
    try:
        text = chat_completion(api_key=key, base_url=base, model=model, messages=messages)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e
    return {
        "content": text,
        "model": model,
        "mode": payload.mode,
        "pdf": pdf_meta,
    }


def _note_excerpt_text(note: models.PaperNote | None, limit: int = 2000) -> str:
    if not note:
        return ""
    raw = (note.raw_markdown or "").strip()
    if raw:
        return raw[:limit]
    bits = []
    for k in ("motivation", "problem", "method", "results", "limitations", "relation_to_my_work"):
        v = (getattr(note, k, None) or "").strip()
        if v:
            bits.append(f"{k}: {v}")
    return "\n".join(bits)[:limit]


def _meta_brief(paper: dict, note_excerpt: str = "", pdf_snip: str = "") -> str:
    snip = (pdf_snip or "").strip()
    snip_block = f"\n\nPDF 抽样：\n{snip[:3500]}" if snip else ""
    return (
        f"## 一句话贡献\n（摘要速览，未全文通读）\n"
        f"## 问题\n{(paper.get('abstract') or '暂无摘要')[:1200]}\n"
        f"## 方法要点\n见摘要 / 已有笔记\n"
        f"## 实验/数据\n暂无或见笔记\n"
        f"## 结论\n见摘要\n"
        f"## 局限\n暂无\n"
        f"## 与综述相关的要点\n{(note_excerpt or '（无已有笔记）')[:1000]}"
        f"{snip_block}"
    )


@router.post("/ai/papers/{paper_id}/digest")
def digest_paper(paper_id: int, payload: DigestIn | None = None, db: Session = Depends(get_db)):
    """按 read_mode 生成研究笔记：summary=速览抽样；full=全文通读。"""
    payload = payload or DigestIn()
    read_mode = _resolve_read_mode(db, payload.read_mode)
    paper = (
        db.query(models.Paper)
        .options(joinedload(models.Paper.tag_links).joinedload(models.PaperTag.tag))
        .filter(models.Paper.id == paper_id)
        .first()
    )
    if not paper:
        raise HTTPException(404, "文献不存在")
    if not paper.local_path:
        raise HTTPException(400, "该文献没有本地 PDF，无法通读")

    note = db.query(models.PaperNote).filter_by(paper_id=paper_id).first()
    if not note:
        note = models.PaperNote(paper_id=paper_id)
        db.add(note)
        db.flush()

    try:
        if read_mode == "full":
            pdf_meta = read_full_pdf(paper.local_path)
        else:
            pdf_meta = extract_pdf_text(paper.local_path, max_pages=12, max_chars=28000)
    except Exception as e:
        raise HTTPException(400, f"PDF 文本提取失败：{e}") from e

    if not (pdf_meta.get("text") or "").strip():
        raise HTTPException(400, "未能从 PDF 提取到文本（可能是扫描件，需 OCR）")

    key, base, model = _llm_conf(db)
    prompts = _llm_prompts(db)
    if (payload.prompt_override or "").strip():
        prompts["digest"] = payload.prompt_override.strip()[:30_000]
    try:
        text, mr = map_reduce_paper_digest(
            paper=_paper_dict(paper),
            note=_note_dict(note),
            pdf_text=pdf_meta["text"],
            api_key=key,
            base_url=base,
            model=model,
            prompts=prompts,
            extra=(payload.extra or "")
            + ("" if read_mode == "full" else "\n注意：本次为摘要速览，正文可能截断，请标注依据不足处。"),
            should_abort=_should_abort(db),
            chunk_chars=10**9 if read_mode == "summary" else 56000,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e

    written = False
    write_mode = (payload.write_mode or "append").strip().lower()
    if payload.write_note and text.strip():
        stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        tag = "全文通读" if read_mode == "full" else "摘要速览"
        header = f"## AI 通读笔记 · {tag}（{stamp}）\n\n"
        body = text.strip()
        if write_mode == "replace":
            note.raw_markdown = header + body
        else:
            prev = (note.raw_markdown or "").rstrip()
            note.raw_markdown = (prev + ("\n\n" if prev else "") + header + body).strip()
        db.commit()
        written = True
    else:
        db.commit()

    return {
        "content": text,
        "model": model,
        "mode": "digest",
        "read_mode": read_mode,
        "written": written,
        "write_mode": write_mode if written else None,
        "pdf": {
            "pages_read": pdf_meta.get("pages_read"),
            "page_count": pdf_meta.get("page_count"),
            "truncated": bool(pdf_meta.get("truncated")) or read_mode == "summary",
            "char_count": pdf_meta.get("char_count"),
            "chunks": mr.get("chunks"),
            "map_reduce": mr.get("map_reduce") if read_mode == "full" else False,
        },
    }


def _papers_for_corpus(db: Session, *, scope: str, name: str, max_papers: int) -> tuple[list[models.Paper], list[str]]:
    name = (name or "").strip()
    if not name:
        raise HTTPException(400, "请指定类别或研究方向名称")
    scope = (scope or "tag").strip().lower()
    max_papers = max(1, min(80, int(max_papers or 40)))

    q = (
        db.query(models.Paper)
        .options(joinedload(models.Paper.tag_links).joinedload(models.PaperTag.tag))
        .join(models.PaperTag, models.PaperTag.paper_id == models.Paper.id)
        .join(models.Tag, models.Tag.id == models.PaperTag.tag_id)
    )
    tag_names: list[str] = []
    if scope == "tag":
        tag = db.query(models.Tag).filter(models.Tag.name == name).first()
        if not tag:
            raise HTTPException(404, f"类别不存在：{name}")
        tag_names = [tag.name]
        q = q.filter(models.Tag.id == tag.id)
    elif scope == "dimension":
        tags = db.query(models.Tag).filter(models.Tag.dimension == name).all()
        if not tags:
            raise HTTPException(404, f"该研究方向下还没有类别：{name}")
        tag_names = [t.name for t in tags]
        q = q.filter(models.Tag.dimension == name)
    else:
        raise HTTPException(400, "scope 须为 tag 或 dimension")

    papers = q.distinct().order_by(models.Paper.year.desc(), models.Paper.id.desc()).limit(max_papers).all()
    return papers, tag_names


@router.post("/ai/corpus/synthesize")
def synthesize_corpus(payload: CorpusIn, db: Session = Depends(get_db)):
    """类别/方向综述。summary=摘要速览；full=每篇全文；notes=仅已有笔记。"""
    papers, tag_names = _papers_for_corpus(
        db, scope=payload.scope, name=payload.name, max_papers=payload.max_papers
    )
    if not papers:
        raise HTTPException(400, "该范围内没有已入库文献")

    requested_mode = (payload.read_mode or "").strip().lower()
    read_mode = "notes" if requested_mode in ("notes", "note", "笔记", "已有笔记") else _resolve_read_mode(db, payload.read_mode)
    note_map = {
        n.paper_id: n
        for n in db.query(models.PaperNote).filter(models.PaperNote.paper_id.in_([p.id for p in papers])).all()
    }

    key, base, model = _llm_conf(db)
    prompts = _llm_prompts(db)
    mode = (payload.mode or "survey").strip().lower()
    if mode not in ("survey", "gaps", "reading"):
        mode = "survey"
    prompt_key = {
        "survey": "corpus_survey",
        "gaps": "corpus_gaps",
        "reading": "corpus_reading",
    }[mode]
    if (payload.prompt_override or "").strip():
        prompts[prompt_key] = payload.prompt_override.strip()[:30_000]

    briefs: list[dict] = []
    pdf_used = 0
    pdf_pages = 0
    map_reduce_n = 0
    skipped_without_notes = 0
    errors: list[str] = []

    for p in papers:
        note = note_map.get(p.id)
        note_excerpt = _note_excerpt_text(note)
        d = _paper_dict(p)
        brief = ""

        if read_mode == "notes":
            if not note_excerpt:
                skipped_without_notes += 1
                continue
            brief = note_excerpt
            d["abstract"] = ""
        elif read_mode == "full" and p.local_path:
            try:
                pdf_meta = read_full_pdf(p.local_path)
                pdf_text = (pdf_meta.get("text") or "").strip()
                if pdf_text:
                    pdf_used += 1
                    pdf_pages += int(pdf_meta.get("pages_read") or 0)
                    brief = map_reduce_paper_brief(
                        paper=d,
                        pdf_text=pdf_text,
                        note_excerpt=note_excerpt,
                        api_key=key,
                        base_url=base,
                        model=model,
                        prompts=prompts,
                        should_abort=_should_abort(db),
                    )
                    if len(pdf_text) > 56000:
                        map_reduce_n += 1
                else:
                    errors.append(f"{(p.title or '')[:40]}: 无文字层")
            except ValueError as e:
                if "大模型赋能已关闭" in str(e):
                    raise HTTPException(400, str(e)) from e
                errors.append(f"{(p.title or '')[:40]}: {e}")
            except Exception as e:
                errors.append(f"{(p.title or '')[:40]}: {e}")
        elif read_mode == "summary":
            pdf_snip = ""
            if p.local_path and payload.use_pdf:
                try:
                    snip_meta = extract_pdf_text(p.local_path, max_pages=2, max_chars=4000)
                    pdf_snip = snip_meta.get("text") or ""
                    if pdf_snip:
                        pdf_used += 1
                        pdf_pages += int(snip_meta.get("pages_read") or 0)
                except Exception:
                    pdf_snip = ""
            brief = _meta_brief(d, note_excerpt, pdf_snip)

        if not brief:
            brief = _meta_brief(d, note_excerpt)

        briefs.append(
            {
                "id": p.id,
                "title": d.get("title"),
                "authors": d.get("authors"),
                "year": d.get("year"),
                "venue": d.get("venue"),
                "status": p.status,
                "tags": d.get("tags") or [],
                "abstract": d.get("abstract") or "",
                "brief": brief,
            }
        )

    if not briefs:
        if read_mode == "notes":
            raise HTTPException(400, "该范围内没有可用于综述的文献笔记")
        raise HTTPException(400, "该范围内没有可用于综述的文献内容")

    extra = (payload.extra or "").strip()
    if read_mode == "summary":
        extra = (extra + "\n注意：本次为「摘要速览」，主要依据标题/摘要/已有笔记（及少量 PDF 抽样），不是全文通读。").strip()
    elif read_mode == "full":
        extra = (extra + "\n注意：每篇 brief 已是对该 PDF 全文通读后的精简卡片。").strip()
    else:
        extra = (extra + "\n注意：本次只以每篇文献已保存的笔记为输入，没有读取摘要或 PDF；请勿补写笔记中不存在的事实。").strip()

    try:
        text = synthesize_from_briefs(
            scope=payload.scope,
            scope_name=payload.name.strip(),
            briefs=briefs,
            mode=mode,
            extra=extra,
            api_key=key,
            base_url=base,
            model=model,
            prompts=prompts,
            should_abort=_should_abort(db),
            source_mode=read_mode,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e

    idea_id = None
    if payload.save_idea and (text or "").strip():
        stamp = datetime.now().strftime("%Y-%m-%d %H:%M")
        depth = "全文" if read_mode == "full" else "笔记" if read_mode == "notes" else "速览"
        title = f"AI综述·{depth} · {payload.name.strip()}（{stamp}）"
        linked = ",".join(str(b["id"]) for b in briefs[:40])
        tags = f"AI综述,{payload.name.strip()},{depth}"
        idea = models.Idea(
            title=title[:400],
            content=text.strip(),
            tags=tags[:300],
            category="record",
            status="open",
            linked_paper_ids=linked,
        )
        db.add(idea)
        db.commit()
        db.refresh(idea)
        idea_id = idea.id
    else:
        db.commit()

    return {
        "content": text,
        "model": model,
        "mode": mode,
        "read_mode": read_mode,
        "scope": payload.scope,
        "name": payload.name.strip(),
        "tag_names": tag_names,
        "paper_count": len(briefs),
        "paper_ids": [int(b["id"]) for b in briefs],
        "pdf_used": pdf_used,
        "pdf_pages": pdf_pages,
        "full_read": read_mode == "full",
        "map_reduce_papers": map_reduce_n,
        "skipped_without_notes": skipped_without_notes,
        "warnings": errors[:12],
        "idea_id": idea_id,
        "saved_idea": idea_id is not None,
    }


@router.post("/ai/today-brief")
def today_brief(db: Session = Depends(get_db)):
    """Generate a short daily tip from local context (no external RAG yet)."""
    key, base, model = _llm_conf(db)
    open_tasks = (
        db.query(models.Task)
        .filter(models.Task.status != "done")
        .order_by(models.Task.due_date.is_(None), models.Task.due_date)
        .limit(8)
        .all()
    )
    papers = (
        db.query(models.Paper)
        .filter(models.Paper.status.in_(["reading", "deep", "todo"]))
        .limit(6)
        .all()
    )
    projects = db.query(models.Project).filter(models.Project.status != "done").limit(5).all()
    ctx = {
        "tasks": [{"title": t.title, "due": str(t.due_date or "")} for t in open_tasks],
        "papers": [{"title": p.title, "status": p.status} for p in papers],
        "projects": [{"title": p.title, "stage": getattr(p, "stage", ""), "next": getattr(p, "next_step", "")} for p in projects],
    }
    messages = [
        {
            "role": "system",
            "content": "你是博士生日程教练。根据上下文给 3 条今天可执行建议，每条不超过 28 字，用中文列表。",
        },
        {"role": "user", "content": json_dumps(ctx)},
    ]
    try:
        text = chat_completion(api_key=key, base_url=base, model=model, messages=messages, temperature=0.4)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(502, str(e)) from e
    return {"content": text, "model": model}


def json_dumps(obj) -> str:
    import json

    return json.dumps(obj, ensure_ascii=False, indent=2)
