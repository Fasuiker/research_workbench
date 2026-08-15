from __future__ import annotations

import csv
import io
import json
import re
import subprocess
from datetime import datetime
from pathlib import Path

from pydantic import BaseModel, Field
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models
from app.schemas import (
    WatchFolderIn,
    WatchFolderOut,
    BrowseItem,
    HideBrowseFileIn,
    PaperIn,
    PaperOut,
    PaperBatchUpdate,
    AnnotationIn,
    AnnotationOut,
    PaperNoteIn,
    PaperNoteOut,
    ReadingSessionIn,
    ReadingSessionOut,
)
from app.services.migrate import META_DIMENSIONS, LEGACY_TOPIC_WRAPPERS
from app.services.files import (
    normalize_path,
    path_key,
    file_meta,
    title_from_filename,
    list_pdfs,
    path_imported_map,
    open_in_os,
    reveal_in_os,
    resolve_under_root,
)
from app.services.serialize import paper_to_out, note_to_out, session_to_out
from app.services.pdf_title import extract_article_title
from app.services.reading_state import QUEUE_TAGS, merge_status_into_tags, paper_note_has_content, sync_queue_tags_from_status


class ImportPathsIn(BaseModel):
    paths: list[str] = Field(default_factory=list)
    project_id: int | None = None
    project_ids: list[int] = Field(default_factory=list)
    folder_name: str = "默认"
    tags: list[str] = Field(default_factory=list)


def _title_metadata_from_pdf(path: str) -> tuple[str, str]:
    """Resolve title/DOI with the same extractor used by title export."""
    fallback = title_from_filename(path)
    try:
        hit = extract_article_title(path, use_doi=True)
    except Exception:
        return fallback, ""
    title = (hit.get("title") or "").strip()
    source = (hit.get("source") or "").strip()
    if not title or source not in {"metadata", "page", "doi"}:
        return fallback, ""
    return title[:500], str(hit.get("doi") or "")[:200]


class ExportTitlesIn(BaseModel):
    scope: str = "tag"  # tag | dimension
    name: str = ""
    from_pdf: bool = True
    use_doi: bool = True
    update_db: bool = False
    fmt: str = "txt"  # txt | md | csv | json


class RelocatePaperIn(BaseModel):
    local_path: str = ""

router = APIRouter(tags=["papers"])

META_DIR_COLORS = {
    "文献属性": "#B86B2B",
    "文献性质": "#B86B2B",  # legacy alias
    "阅读队列": "#6B5B95",
    "相关度": "#C23B22",
}
TOPIC_DIR_COLORS = ["#2F6FED", "#0F7B6C", "#6B5B95", "#B86B2B", "#C23B22", "#5C6B7A"]


def _get_setting(db: Session, key: str, default: str = "") -> str:
    row = db.get(models.Setting, key)
    return row.value if row else default


def _set_setting(db: Session, key: str, value: str) -> None:
    row = db.get(models.Setting, key)
    if row:
        row.value = value
    else:
        db.add(models.Setting(key=key, value=value))


def _hidden_browse_paths(db: Session) -> set[str]:
    try:
        data = json.loads(_get_setting(db, "browse_hidden_paths", "[]") or "[]")
    except Exception:
        data = []
    out: set[str] = set()
    if isinstance(data, list):
        for item in data:
            if isinstance(item, str) and item.strip():
                try:
                    out.add(normalize_path(item.strip()))
                except Exception:
                    out.add(item.strip())
    return out


def _add_hidden_browse_path(db: Session, path: str) -> str:
    norm = normalize_path(path)
    hidden = _hidden_browse_paths(db)
    hidden.add(norm)
    _set_setting(db, "browse_hidden_paths", json.dumps(sorted(hidden), ensure_ascii=False))
    db.commit()
    return norm


def _load_topic_directions(db: Session) -> list[dict]:
    raw = _get_setting(db, "tag_directions", "[]")
    try:
        data = json.loads(raw or "[]")
    except Exception:
        data = []
    out: list[dict] = []
    seen: set[str] = set()
    if isinstance(data, list):
        for item in data:
            if isinstance(item, str):
                name, color = item.strip(), ""
            elif isinstance(item, dict):
                name = str(item.get("name") or "").strip()
                color = str(item.get("color") or "").strip()
            else:
                continue
            if (
                not name
                or name in seen
                or name in META_DIMENSIONS
                or name in LEGACY_TOPIC_WRAPPERS
                or name == "自定义"
            ):
                continue
            seen.add(name)
            out.append({"name": name, "color": color or TOPIC_DIR_COLORS[len(out) % len(TOPIC_DIR_COLORS)]})
    # discover topic dims already used by tags
    tag_dims = (
        db.query(models.Tag.dimension)
        .filter(models.Tag.dimension.isnot(None))
        .distinct()
        .all()
    )
    for (dim,) in tag_dims:
        name = (dim or "").strip()
        if (
            not name
            or name in seen
            or name in META_DIMENSIONS
            or name in LEGACY_TOPIC_WRAPPERS
            or name == "自定义"
        ):
            continue
        seen.add(name)
        out.append({"name": name, "color": TOPIC_DIR_COLORS[len(out) % len(TOPIC_DIR_COLORS)]})
    return out


def _save_topic_directions(db: Session, dirs: list[dict]) -> None:
    payload = [{"name": d["name"], "color": d.get("color") or "#2F6FED"} for d in dirs if d.get("name")]
    _set_setting(db, "tag_directions", json.dumps(payload, ensure_ascii=False))


def _dimension_counts(db: Session) -> dict[str, int]:
    counts: dict[str, int] = {}
    for dim, in db.query(models.Tag.dimension).all():
        key = (dim or "自定义").strip() or "自定义"
        counts[key] = counts.get(key, 0) + 1
    return counts


def _ensure_tags(db: Session, paper: models.Paper, tag_names: list[str]) -> None:
    for link in list(paper.tag_links):
        db.delete(link)
    db.flush()
    seen = set()
    for name in tag_names:
        name = (name or "").strip()
        if not name or name in QUEUE_TAGS or name.lower() in seen:
            continue
        seen.add(name.lower())
        tag = db.query(models.Tag).filter_by(name=name).first()
        if not tag:
            tag = models.Tag(name=name, dimension="自定义")
            db.add(tag)
            db.flush()
        db.add(models.PaperTag(paper_id=paper.id, tag_id=tag.id))


def _ensure_projects(db: Session, paper: models.Paper, project_ids: list[int]) -> None:
    for link in list(paper.project_links):
        db.delete(link)
    db.flush()
    ids: list[int] = []
    for raw in project_ids or []:
        try:
            pid = int(raw)
        except (TypeError, ValueError):
            continue
        if pid <= 0 or pid in ids:
            continue
        if not db.get(models.Project, pid):
            continue
        ids.append(pid)
        db.add(models.PaperProject(paper_id=paper.id, project_id=pid))
    # keep legacy project_id as first linked project
    paper.project_id = ids[0] if ids else None


def _resolve_project_ids(payload_project_ids: list[int] | None, payload_project_id: int | None) -> list[int]:
    ids = [int(x) for x in (payload_project_ids or []) if x]
    if payload_project_id and int(payload_project_id) not in ids:
        ids.insert(0, int(payload_project_id))
    return ids


def _load_paper(db: Session, paper_id: int) -> models.Paper:
    paper = (
        db.query(models.Paper)
        .populate_existing()
        .options(
            joinedload(models.Paper.tag_links).joinedload(models.PaperTag.tag),
            joinedload(models.Paper.project_links),
        )
        .filter_by(id=paper_id)
        .first()
    )
    if not paper:
        raise HTTPException(404, "文献不存在")
    return paper


def _tag_out(t: models.Tag) -> dict:
    return {
        "id": t.id,
        "name": t.name,
        "color": t.color,
        "dimension": getattr(t, "dimension", None) or "自定义",
    }


@router.get("/tags")
def list_tags(db: Session = Depends(get_db)):
    rows = db.query(models.Tag).order_by(models.Tag.dimension, models.Tag.name).all()
    return [_tag_out(t) for t in rows]


@router.get("/tags/dimensions")
def list_dimensions(db: Session = Depends(get_db)):
    counts = _dimension_counts(db)
    topics = _load_topic_directions(db)
    # persist discovered topic dirs so empty ones can be managed later
    _save_topic_directions(db, topics)
    db.commit()
    items = []
    for d in topics:
        items.append(
            {
                "name": d["name"],
                "color": d.get("color") or "#2F6FED",
                "kind": "topic",
                "locked": False,
                "category_count": counts.get(d["name"], 0),
            }
        )
    for name in META_DIMENSIONS:
        items.append(
            {
                "name": name,
                "color": META_DIR_COLORS.get(name, "#5C6B7A"),
                "kind": "meta",
                "locked": True,
                "category_count": counts.get(name, 0),
            }
        )
    if counts.get("自定义"):
        items.append(
            {
                "name": "自定义",
                "color": "#5C6B7A",
                "kind": "other",
                "locked": False,
                "category_count": counts.get("自定义", 0),
            }
        )
    return {"directions": items, "meta": list(META_DIMENSIONS)}


@router.post("/tags/dimensions")
def create_dimension(
    name: str = "",
    color: str = "#2F6FED",
    db: Session = Depends(get_db),
):
    name = (name or "").strip()
    if not name:
        raise HTTPException(400, "方向名不能为空")
    if name in META_DIMENSIONS:
        raise HTTPException(400, "该名称属于系统保留维度")
    if name in LEGACY_TOPIC_WRAPPERS:
        raise HTTPException(400, "请直接自建具体研究方向，无需再建「研究方向/技术路线」包装层")
    if name == "自定义":
        raise HTTPException(400, "「自定义」为系统保留名")
    topics = _load_topic_directions(db)
    if any(d["name"] == name for d in topics):
        raise HTTPException(400, "方向已存在")
    color = (color or "").strip() or TOPIC_DIR_COLORS[len(topics) % len(TOPIC_DIR_COLORS)]
    topics.append({"name": name, "color": color})
    _save_topic_directions(db, topics)
    db.commit()
    return {
        "name": name,
        "color": color,
        "kind": "topic",
        "locked": False,
        "category_count": 0,
    }


@router.post("/tags")
def create_tag(
    name: str = "",
    color: str = "#3d5a5b",
    dimension: str = "自定义",
    db: Session = Depends(get_db),
):
    name = (name or "").strip()
    if not name:
        raise HTTPException(400, "标签名不能为空")
    dimension = (dimension or "自定义").strip() or "自定义"
    # ensure topic direction is registered when creating under a new dim
    if dimension not in META_DIMENSIONS and dimension != "自定义":
        topics = _load_topic_directions(db)
        if not any(d["name"] == dimension for d in topics):
            topics.append({"name": dimension, "color": color or "#2F6FED"})
            _save_topic_directions(db, topics)
    row = db.query(models.Tag).filter_by(name=name).first()
    if row:
        if color:
            row.color = color
        if dimension:
            row.dimension = dimension
        db.commit()
        db.refresh(row)
        return _tag_out(row)
    row = models.Tag(name=name, color=color or "#3d5a5b", dimension=dimension)
    db.add(row)
    db.commit()
    db.refresh(row)
    return _tag_out(row)


@router.put("/tags/{tid}")
def update_tag(
    tid: int,
    name: str = "",
    color: str = "",
    dimension: str = "",
    db: Session = Depends(get_db),
):
    row = db.get(models.Tag, tid)
    if not row:
        raise HTTPException(404, "类别不存在")
    new_name = (name or "").strip()
    if new_name and new_name != row.name:
        clash = db.query(models.Tag).filter(models.Tag.name == new_name, models.Tag.id != tid).first()
        if clash:
            raise HTTPException(400, "已有同名类别")
        row.name = new_name
    if color:
        row.color = color
    if (dimension or "").strip():
        dimension = dimension.strip()
        row.dimension = dimension
        if dimension not in META_DIMENSIONS and dimension != "自定义":
            topics = _load_topic_directions(db)
            if not any(d["name"] == dimension for d in topics):
                topics.append({"name": dimension, "color": color or row.color or "#2F6FED"})
                _save_topic_directions(db, topics)
    db.commit()
    db.refresh(row)
    return _tag_out(row)


@router.post("/tags/rename-dimension")
def rename_dimension(old_name: str = "", new_name: str = "", db: Session = Depends(get_db)):
    old_name = (old_name or "").strip()
    new_name = (new_name or "").strip()
    if not old_name or not new_name:
        raise HTTPException(400, "新旧方向名不能为空")
    if old_name in META_DIMENSIONS:
        raise HTTPException(400, "系统保留维度不可重命名")
    if new_name in META_DIMENSIONS or new_name in LEGACY_TOPIC_WRAPPERS or new_name == "自定义":
        raise HTTPException(400, "不能改名为系统保留或已弃用的包装维度")
    if old_name == new_name:
        return {"ok": True, "updated": 0}
    rows = db.query(models.Tag).filter_by(dimension=old_name).all()
    for row in rows:
        row.dimension = new_name
    topics = _load_topic_directions(db)
    replaced = False
    for d in topics:
        if d["name"] == old_name:
            d["name"] = new_name
            replaced = True
            break
    if not replaced and new_name not in {d["name"] for d in topics}:
        topics.append({"name": new_name, "color": "#2F6FED"})
    # drop duplicates after rename
    seen: set[str] = set()
    uniq = []
    for d in topics:
        if d["name"] in seen:
            continue
        seen.add(d["name"])
        uniq.append(d)
    _save_topic_directions(db, uniq)
    db.commit()
    return {"ok": True, "updated": len(rows)}


@router.delete("/tags/dimensions")
def delete_dimension(
    name: str = "",
    delete_categories: bool = False,
    db: Session = Depends(get_db),
):
    name = (name or "").strip()
    if not name:
        raise HTTPException(400, "方向名不能为空")
    if name in META_DIMENSIONS:
        raise HTTPException(400, "系统保留维度不可删除")
    topics = _load_topic_directions(db)
    topics = [d for d in topics if d["name"] != name]
    _save_topic_directions(db, topics)
    rows = db.query(models.Tag).filter_by(dimension=name).all()
    deleted = 0
    if delete_categories:
        for row in rows:
            db.delete(row)
            deleted += 1
    else:
        for row in rows:
            row.dimension = "自定义"
    db.commit()
    return {"ok": True, "deleted_categories": deleted, "moved_to_custom": 0 if delete_categories else len(rows)}


@router.delete("/tags/{tid}")
def delete_tag(tid: int, db: Session = Depends(get_db)):
    row = db.get(models.Tag, tid)
    if not row:
        raise HTTPException(404, "类别不存在")
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/watch-folders", response_model=list[WatchFolderOut])
def list_watch_folders(db: Session = Depends(get_db)):
    return db.query(models.WatchFolder).order_by(models.WatchFolder.id).all()


@router.post("/watch-folders", response_model=WatchFolderOut)
def add_watch_folder(payload: WatchFolderIn, db: Session = Depends(get_db)):
    path = normalize_path(payload.path)
    if not Path(path).is_dir():
        raise HTTPException(400, f"目录不存在: {path}")
    exists = db.query(models.WatchFolder).filter_by(path=path).first()
    if exists:
        raise HTTPException(400, "该目录已添加")
    # Avoid mojibake / "??" names from bad console encodings; prefer folder basename.
    raw_name = (payload.name or "").strip()
    if not raw_name or set(raw_name.replace(" ", "")) <= {"?"}:
        raw_name = Path(path).name or "papers"
    row = models.WatchFolder(name=raw_name, path=path, enabled=payload.enabled)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/watch-folders/{folder_id}")
def delete_watch_folder(folder_id: int, db: Session = Depends(get_db)):
    row = db.get(models.WatchFolder, folder_id)
    if not row:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/watch-folders/{folder_id}/browse", response_model=list[BrowseItem])
def browse_folder(folder_id: int, sub: str = "", db: Session = Depends(get_db)):
    folder = db.get(models.WatchFolder, folder_id)
    if not folder:
        raise HTTPException(404)
    try:
        items = list_pdfs(folder.path, sub=sub)
    except FileNotFoundError as e:
        raise HTTPException(400, str(e)) from e
    except PermissionError as e:
        raise HTTPException(403, str(e)) from e
    hidden = _hidden_browse_paths(db)
    if hidden:
        hidden_keys = {path_key(path) for path in hidden}
        items = [
            i for i in items
            if i["is_dir"] or path_key(i["path"]) not in hidden_keys
        ]
    paths = [i["path"] for i in items if not i["is_dir"]]
    imported = path_imported_map(db, paths)
    out = []
    for i in items:
        pid = imported.get(i["path"])
        out.append(
            BrowseItem(
                name=i["name"],
                path=i["path"] if i["is_dir"] else i["path"],
                is_dir=i["is_dir"],
                size=i.get("size"),
                mtime=i.get("mtime"),
                imported=bool(pid),
                paper_id=pid,
            )
        )
    # for dirs, encode relative path in path field as rel for frontend navigation
    for idx, i in enumerate(items):
        if i["is_dir"]:
            out[idx].path = i["rel"]
    return out


@router.post("/watch-folders/{folder_id}/hide")
def hide_browse_file(
    folder_id: int,
    payload: HideBrowseFileIn,
    db: Session = Depends(get_db),
):
    """Hide a PDF from the left browse list. Does not delete the disk file."""
    wf = db.get(models.WatchFolder, folder_id)
    if not wf:
        raise HTTPException(404)
    try:
        target = resolve_under_root(wf.path, payload.path)
    except PermissionError as e:
        raise HTTPException(403, str(e)) from e
    if target.suffix.lower() != ".pdf":
        raise HTTPException(400, "只能隐藏监视目录内的 PDF")
    # Allow hiding even if temporarily unreadable; path must still be under root.
    norm = _add_hidden_browse_path(db, str(target))
    return {"ok": True, "path": norm}


@router.post("/watch-folders/{folder_id}/reveal")
def reveal_browse_file(
    folder_id: int,
    payload: HideBrowseFileIn,
    db: Session = Depends(get_db),
):
    """Open Explorer/Finder at a PDF that is safely inside the watched folder."""
    wf = db.get(models.WatchFolder, folder_id)
    if not wf:
        raise HTTPException(404)
    try:
        target = resolve_under_root(wf.path, payload.path)
    except PermissionError as e:
        raise HTTPException(403, str(e)) from e
    if target.suffix.lower() != ".pdf" or not target.is_file():
        raise HTTPException(404, "PDF 文件不存在")
    try:
        reveal_in_os(str(target))
    except (OSError, subprocess.SubprocessError) as e:
        raise HTTPException(500, f"无法打开本地文件夹: {e}") from e
    return {"ok": True}


@router.post("/watch-folders/{folder_id}/import", response_model=list[PaperOut])
def import_from_folder(
    folder_id: int,
    payload: ImportPathsIn,
    db: Session = Depends(get_db),
):
    wf = db.get(models.WatchFolder, folder_id)
    if not wf:
        raise HTTPException(404)
    created = []
    for raw in payload.paths:
        path = normalize_path(raw)
        if not path.lower().endswith(".pdf") or not Path(path).is_file():
            continue
        existing = db.query(models.Paper).filter_by(local_path=path).first()
        if existing:
            created.append(existing)
            continue
        meta = file_meta(path)
        article_title, article_doi = _title_metadata_from_pdf(path)
        paper = models.Paper(
            title=article_title,
            doi=article_doi,
            local_path=path,
            file_size=meta["file_size"],
            file_mtime=meta["file_mtime"],
            file_hash=meta["file_hash"],
            folder=payload.folder_name or "默认",
            status="todo",
        )
        db.add(paper)
        db.flush()
        db.add(models.PaperNote(paper_id=paper.id))
        pids = _resolve_project_ids(payload.project_ids, payload.project_id)
        _ensure_projects(db, paper, pids)
        if payload.tags:
            _ensure_tags(db, paper, payload.tags)
        sync_queue_tags_from_status(db, paper)
        created.append(paper)
    db.commit()
    return [paper_to_out(_load_paper(db, p.id)) for p in created]


@router.get("/papers", response_model=list[PaperOut])
def list_papers(
    q: str = "",
    status: str = "",
    folder: str = "",
    project_id: int | None = None,
    tag: str = "",
    db: Session = Depends(get_db),
):
    query = db.query(models.Paper).options(
        joinedload(models.Paper.tag_links).joinedload(models.PaperTag.tag),
        joinedload(models.Paper.project_links),
    )
    if q:
        like = f"%{q}%"
        query = query.filter(
            (models.Paper.title.ilike(like))
            | (models.Paper.authors.ilike(like))
            | (models.Paper.venue.ilike(like))
        )
    if status:
        query = query.filter_by(status=status)
    if folder:
        query = query.filter_by(folder=folder)
    papers = query.order_by(models.Paper.updated_at.desc()).all()
    if project_id is not None:
        papers = [
            p
            for p in papers
            if p.project_id == project_id
            or any(l.project_id == project_id for l in (p.project_links or []))
        ]
    if tag:
        papers = [p for p in papers if tag in [l.tag.name for l in p.tag_links if l.tag]]
    return [paper_to_out(p) for p in papers]


@router.get("/papers/path-health")
def papers_path_health(db: Session = Depends(get_db)):
    rows = db.query(models.Paper).filter(models.Paper.local_path != "").order_by(models.Paper.id.desc()).all()
    missing = []
    for p in rows:
        path = p.local_path or ""
        try:
            ok = bool(path and Path(path).is_file())
        except OSError:
            ok = False
        if not ok:
            missing.append({"id": p.id, "title": p.title or "", "local_path": path})
    return {
        "total_with_path": len(rows),
        "missing_count": len(missing),
        "missing": missing,
    }


@router.post("/papers", response_model=PaperOut)
def create_paper(payload: PaperIn, db: Session = Depends(get_db)):
    data = payload.model_dump()
    tags = data.pop("tags", []) or []
    project_ids = data.pop("project_ids", []) or []
    legacy_pid = data.get("project_id")
    if data.get("local_path"):
        data["local_path"] = normalize_path(data["local_path"])
        meta = file_meta(data["local_path"])
        data.update({k: meta[k] for k in ("file_size", "file_mtime", "file_hash")})
        if data["title"] in {"", "Untitled"}:
            article_title, article_doi = _title_metadata_from_pdf(data["local_path"])
            data["title"] = article_title
            if article_doi and not (data.get("doi") or "").strip():
                data["doi"] = article_doi
    tags = merge_status_into_tags(tags, data.get("status"))
    paper = models.Paper(**data)
    db.add(paper)
    db.flush()
    _ensure_tags(db, paper, tags)
    sync_queue_tags_from_status(db, paper)
    _ensure_projects(db, paper, _resolve_project_ids(project_ids, legacy_pid))
    db.add(models.PaperNote(paper_id=paper.id))
    db.commit()
    return paper_to_out(_load_paper(db, paper.id))


@router.post("/papers/{paper_id}/relocate", response_model=PaperOut)
def relocate_paper(paper_id: int, payload: RelocatePaperIn, db: Session = Depends(get_db)):
    paper = _load_paper(db, paper_id)
    raw = (payload.local_path or "").strip()
    if not raw:
        raise HTTPException(400, "请提供新的 PDF 路径")
    path = normalize_path(raw)
    if not Path(path).is_file():
        raise HTTPException(400, f"文件不存在: {path}")
    paper.local_path = path
    meta = file_meta(path)
    paper.file_size = meta.get("file_size")
    paper.file_mtime = meta.get("file_mtime")
    paper.file_hash = meta.get("file_hash")
    db.commit()
    return paper_to_out(_load_paper(db, paper_id))


@router.get("/papers/{paper_id}", response_model=PaperOut)
def get_paper(paper_id: int, db: Session = Depends(get_db)):
    return paper_to_out(_load_paper(db, paper_id))


@router.post("/papers/{paper_id}/mark-opened", response_model=PaperOut)
def mark_paper_opened(paper_id: int, db: Session = Depends(get_db)):
    paper = _load_paper(db, paper_id)
    paper.status = "deep" if paper_note_has_content(paper.note) else "reading"
    sync_queue_tags_from_status(db, paper)
    db.commit()
    return paper_to_out(_load_paper(db, paper_id))


@router.post("/papers/{paper_id}/star", response_model=PaperOut)
def set_paper_star(paper_id: int, starred: bool = True, db: Session = Depends(get_db)):
    paper = _load_paper(db, paper_id)
    paper.starred = starred
    db.commit()
    return paper_to_out(_load_paper(db, paper_id))


@router.put("/papers/{paper_id}", response_model=PaperOut)
def update_paper(paper_id: int, payload: PaperIn, db: Session = Depends(get_db)):
    paper = _load_paper(db, paper_id)
    data = payload.model_dump()
    tags = data.pop("tags", []) or []
    project_ids = data.pop("project_ids", []) or []
    legacy_pid = data.get("project_id")
    if data.get("local_path"):
        data["local_path"] = normalize_path(data["local_path"])
        meta = file_meta(data["local_path"])
        data.update({k: meta[k] for k in ("file_size", "file_mtime", "file_hash")})
    for k, v in data.items():
        setattr(paper, k, v)
    _ensure_tags(db, paper, tags)
    sync_queue_tags_from_status(db, paper)
    _ensure_projects(db, paper, _resolve_project_ids(project_ids, legacy_pid))
    db.commit()
    return paper_to_out(_load_paper(db, paper_id))


@router.delete("/papers/{paper_id}")
def delete_paper(paper_id: int, db: Session = Depends(get_db)):
    paper = db.get(models.Paper, paper_id)
    if not paper:
        raise HTTPException(404)
    db.delete(paper)
    db.commit()
    return {"ok": True}


@router.post("/papers/batch", response_model=list[PaperOut])
def batch_update(payload: PaperBatchUpdate, db: Session = Depends(get_db)):
    out = []
    for pid in payload.ids:
        paper = _load_paper(db, pid)
        if payload.status is not None:
            paper.status = payload.status
            if payload.tags is None and not payload.tags_add:
                sync_queue_tags_from_status(db, paper)
        if payload.relevance is not None:
            paper.relevance = payload.relevance
        if payload.folder is not None:
            paper.folder = payload.folder
        if payload.project_ids is not None:
            _ensure_projects(db, paper, payload.project_ids)
        elif payload.project_ids_add:
            current = [l.project_id for l in paper.project_links]
            _ensure_projects(db, paper, list(dict.fromkeys(current + list(payload.project_ids_add))))
        elif payload.project_id is not None:
            # 0 = clear; >0 replace with single project
            _ensure_projects(db, paper, [] if not payload.project_id else [payload.project_id])
        if payload.tags is not None:
            _ensure_tags(db, paper, merge_status_into_tags(payload.tags, paper.status))
        elif payload.tags_add:
            current = [l.tag.name for l in paper.tag_links if l.tag]
            _ensure_tags(db, paper, merge_status_into_tags(list(dict.fromkeys(current + payload.tags_add)), paper.status))
        if payload.create_notes and not paper.note:
            db.add(models.PaperNote(paper_id=paper.id))
        out.append(paper)
    db.commit()
    return [paper_to_out(_load_paper(db, p.id)) for p in out]


def _papers_for_scope(db: Session, *, scope: str, name: str) -> tuple[list[models.Paper], list[str]]:
    name = (name or "").strip()
    if not name:
        raise HTTPException(400, "请指定类别或研究方向名称")
    scope = (scope or "tag").strip().lower()
    q = (
        db.query(models.Paper)
        .options(
            joinedload(models.Paper.tag_links).joinedload(models.PaperTag.tag),
            joinedload(models.Paper.project_links),
        )
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
    papers = q.distinct().order_by(models.Paper.year.desc(), models.Paper.id.desc()).all()
    return papers, tag_names


def _build_titles_export_body(
    *,
    scope: str,
    name: str,
    tag_names: list[str],
    rows: list[dict],
    fmt: str,
) -> tuple[str, str, str]:
    """Return (body, media_type, filename)."""
    stamp = datetime.now().strftime("%Y%m%d")
    safe = re.sub(r"[^\w\u4e00-\u9fff\-]+", "_", name).strip("_") or "papers"
    label = "类别" if scope == "tag" else "方向"
    fmt = (fmt or "txt").lower()
    if fmt == "json":
        payload = {
            "scope": scope,
            "name": name,
            "tags": tag_names,
            "count": len(rows),
            "items": rows,
        }
        return (
            json.dumps(payload, ensure_ascii=False, indent=2),
            "application/json; charset=utf-8",
            f"titles_{safe}_{stamp}.json",
        )
    if fmt == "csv":
        buf = io.StringIO()
        w = csv.writer(buf)
        w.writerow(["n", "title", "year", "authors", "stored_title", "source", "doi", "paper_id", "file"])
        for i, r in enumerate(rows, 1):
            w.writerow(
                [
                    i,
                    r.get("title") or "",
                    r.get("year") or "",
                    r.get("authors") or "",
                    r.get("stored_title") or "",
                    r.get("source") or "",
                    r.get("doi") or "",
                    r.get("paper_id") or "",
                    r.get("file_name") or "",
                ]
            )
        return buf.getvalue(), "text/csv; charset=utf-8", f"titles_{safe}_{stamp}.csv"
    if fmt == "md":
        lines = [
            f"# {label}「{name}」文献标题",
            "",
            f"- 共 {len(rows)} 篇",
            f"- 导出时间 {datetime.now().strftime('%Y-%m-%d %H:%M')}",
            "",
        ]
        for i, r in enumerate(rows, 1):
            yr = f" ({r['year']})" if r.get("year") else ""
            lines.append(f"{i}. {r.get('title') or '（无标题）'}{yr}")
            if r.get("authors"):
                lines.append(f"   - 作者：{r['authors']}")
            if r.get("doi"):
                lines.append(f"   - DOI：{r['doi']}")
            if r.get("source"):
                lines.append(f"   - 来源：{r['source']}")
        return "\n".join(lines) + "\n", "text/markdown; charset=utf-8", f"titles_{safe}_{stamp}.md"
    # txt default
    lines = [f"{label}「{name}」文献标题（共 {len(rows)} 篇）", ""]
    for i, r in enumerate(rows, 1):
        yr = f" ({r['year']})" if r.get("year") else ""
        lines.append(f"{i}. {r.get('title') or '（无标题）'}{yr}")
    return "\n".join(lines) + "\n", "text/plain; charset=utf-8", f"titles_{safe}_{stamp}.txt"


@router.post("/papers/export-titles")
def export_paper_titles(payload: ExportTitlesIn, db: Session = Depends(get_db)):
    """Export article titles for a category or research direction.

    Prefers PDF metadata / first-page text / DOI (Crossref). No OCR.
    """
    papers, tag_names = _papers_for_scope(db, scope=payload.scope, name=payload.name)
    if not papers:
        raise HTTPException(400, "该范围内没有已入库文献")

    rows: list[dict] = []
    updated = 0
    for p in papers:
        stored = (p.title or "").strip()
        file_name = Path(p.local_path).name if p.local_path else ""
        title = stored
        source = "stored"
        doi = (p.doi or "").strip()
        err = ""
        if payload.from_pdf and p.local_path:
            try:
                hit = extract_article_title(p.local_path, use_doi=payload.use_doi)
                got = (hit.get("title") or "").strip()
                src = hit.get("source") or ""
                if got and src in ("metadata", "page", "doi"):
                    title = got
                    source = src
                    doi = hit.get("doi") or doi
                    err = hit.get("error") or ""
                    if payload.update_db and got != stored:
                        p.title = got[:500]
                        if hit.get("doi") and not (p.doi or "").strip():
                            p.doi = str(hit["doi"])[:200]
                        updated += 1
                elif got and not stored:
                    title = got
                    source = src or "filename"
                    err = hit.get("error") or ""
                else:
                    err = hit.get("error") or ""
                    if hit.get("doi"):
                        doi = hit.get("doi") or doi
            except Exception as e:
                err = str(e)
        rows.append(
            {
                "paper_id": p.id,
                "title": title,
                "stored_title": stored,
                "year": p.year,
                "authors": p.authors or "",
                "source": source,
                "doi": doi,
                "file_name": file_name,
                "error": err,
            }
        )

    if payload.update_db and updated:
        db.commit()

    fmt = (payload.fmt or "txt").lower()
    if fmt not in ("txt", "md", "csv", "json"):
        fmt = "txt"
    body, _media, filename = _build_titles_export_body(
        scope=payload.scope, name=payload.name, tag_names=tag_names, rows=rows, fmt=fmt
    )
    return {
        "scope": payload.scope,
        "name": payload.name,
        "tags": tag_names,
        "count": len(rows),
        "updated": updated,
        "fmt": fmt,
        "filename": filename,
        "content": body,
        "items": rows,
        "note": "标题来自 PDF 元数据 / 首页文字 / DOI；扫描件无文字层时不走 OCR。",
    }


@router.get("/papers/{paper_id}/file")
def get_paper_file(paper_id: int, db: Session = Depends(get_db)):
    paper = db.get(models.Paper, paper_id)
    if not paper or not paper.local_path:
        raise HTTPException(404, "无本地文件")
    path = Path(paper.local_path)
    if not path.is_file():
        raise HTTPException(404, f"文件不存在: {paper.local_path}")
    return FileResponse(path, media_type="application/pdf", filename=path.name)


@router.post("/papers/{paper_id}/open-os")
def open_paper_os(paper_id: int, db: Session = Depends(get_db)):
    paper = db.get(models.Paper, paper_id)
    if not paper or not paper.local_path or not Path(paper.local_path).is_file():
        raise HTTPException(404, "文件不存在")
    open_in_os(paper.local_path)
    return {"ok": True}


@router.get("/papers/{paper_id}/annotations", response_model=list[AnnotationOut])
def list_annotations(paper_id: int, db: Session = Depends(get_db)):
    _load_paper(db, paper_id)
    return (
        db.query(models.PaperAnnotation)
        .filter_by(paper_id=paper_id)
        .order_by(models.PaperAnnotation.page, models.PaperAnnotation.id)
        .all()
    )


@router.post("/papers/{paper_id}/annotations", response_model=AnnotationOut)
def create_annotation(paper_id: int, payload: AnnotationIn, db: Session = Depends(get_db)):
    _load_paper(db, paper_id)
    row = models.PaperAnnotation(paper_id=paper_id, **payload.model_dump())
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.put("/annotations/{ann_id}", response_model=AnnotationOut)
def update_annotation(ann_id: int, payload: AnnotationIn, db: Session = Depends(get_db)):
    row = db.get(models.PaperAnnotation, ann_id)
    if not row:
        raise HTTPException(404)
    for k, v in payload.model_dump().items():
        setattr(row, k, v)
    db.commit()
    db.refresh(row)
    return row


@router.delete("/annotations/{ann_id}")
def delete_annotation(ann_id: int, db: Session = Depends(get_db)):
    row = db.get(models.PaperAnnotation, ann_id)
    if not row:
        raise HTTPException(404)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/papers/{paper_id}/note", response_model=PaperNoteOut)
def get_note(paper_id: int, db: Session = Depends(get_db)):
    _load_paper(db, paper_id)
    note = db.query(models.PaperNote).filter_by(paper_id=paper_id).first()
    if not note:
        note = models.PaperNote(paper_id=paper_id)
        db.add(note)
        db.commit()
        db.refresh(note)
    return note_to_out(note)


@router.put("/papers/{paper_id}/note", response_model=PaperNoteOut)
def upsert_note(paper_id: int, payload: PaperNoteIn, db: Session = Depends(get_db)):
    _load_paper(db, paper_id)
    note = db.query(models.PaperNote).filter_by(paper_id=paper_id).first()
    if not note:
        note = models.PaperNote(paper_id=paper_id)
        db.add(note)
    for k, v in payload.model_dump().items():
        setattr(note, k, v)
    paper = _load_paper(db, paper_id)
    paper.status = "deep" if paper_note_has_content(note) else "reading"
    sync_queue_tags_from_status(db, paper)
    db.commit()
    db.refresh(note)
    return note_to_out(note)


@router.post("/annotations/{ann_id}/promote")
def promote_annotation(ann_id: int, field: str = Query("raw_markdown"), db: Session = Depends(get_db)):
    ann = db.get(models.PaperAnnotation, ann_id)
    if not ann:
        raise HTTPException(404)
    allowed = {
        "raw_markdown",
        "quotable",
        "method",
        "limitations",
        "relation_to_my_work",
        "motivation",
        "problem",
        "results",
    }
    if field not in allowed:
        raise HTTPException(400, "非法字段")
    note = db.query(models.PaperNote).filter_by(paper_id=ann.paper_id).first()
    if not note:
        note = models.PaperNote(paper_id=ann.paper_id)
        db.add(note)
        db.flush()
    snippet = f"- [p.{ann.page}] {ann.selected_text or ann.comment}".strip()
    # 主笔记已切到 Markdown：默认写入 raw_markdown
    md = (note.raw_markdown or "").rstrip()
    note.raw_markdown = (md + ("\n\n" if md else "") + snippet).strip()
    if field != "raw_markdown":
        current = getattr(note, field) or ""
        setattr(note, field, (current + "\n" + snippet).strip())
    db.commit()
    return {"ok": True, "field": field}


@router.get("/reading-sessions", response_model=list[ReadingSessionOut])
def list_sessions(db: Session = Depends(get_db)):
    rows = db.query(models.ReadingSession).order_by(models.ReadingSession.id.desc()).all()
    return [session_to_out(s) for s in rows]


@router.post("/reading-sessions", response_model=ReadingSessionOut)
def create_session(payload: ReadingSessionIn, db: Session = Depends(get_db)):
    s = models.ReadingSession(title=payload.title, theme_tags=payload.theme_tags)
    db.add(s)
    db.flush()
    for pid in payload.paper_ids:
        if db.get(models.Paper, pid):
            db.add(models.ReadingSessionPaper(session_id=s.id, paper_id=pid))
            if not db.query(models.PaperNote).filter_by(paper_id=pid).first():
                db.add(models.PaperNote(paper_id=pid))
    db.commit()
    db.refresh(s)
    return session_to_out(s)


@router.get("/reading-sessions/{session_id}")
def get_session(session_id: int, db: Session = Depends(get_db)):
    s = db.get(models.ReadingSession, session_id)
    if not s:
        raise HTTPException(404)
    papers = [paper_to_out(_load_paper(db, sp.paper_id)) for sp in s.papers]
    anns = []
    for sp in s.papers:
        for a in db.query(models.PaperAnnotation).filter_by(paper_id=sp.paper_id).all():
            if not s.theme_tags or any(t.strip() and t.strip() in (a.tags or "") for t in s.theme_tags.split(",")):
                anns.append(AnnotationOut.model_validate(a))
    return {"session": session_to_out(s), "papers": papers, "annotations": anns}


@router.put("/reading-sessions/{session_id}")
def update_session(session_id: int, summary: str = "", status: str = "", db: Session = Depends(get_db)):
    s = db.get(models.ReadingSession, session_id)
    if not s:
        raise HTTPException(404)
    if summary:
        s.summary = summary
    if status:
        s.status = status
    db.commit()
    return session_to_out(s)


@router.get("/paper-folders")
def paper_folders(db: Session = Depends(get_db)):
    rows = db.query(models.Paper.folder).distinct().all()
    return sorted({r[0] or "默认" for r in rows})
