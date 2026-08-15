from __future__ import annotations

import base64
import json
import shutil
import zipfile
from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app.config import DB_PATH, EXPORT_DIR
from app.database import engine
from app import models


EXPORT_TABLES = [
    models.Setting,
    models.WatchFolder,
    models.GeneralNote,
    models.Project,
    models.ProjectNote,
    models.EngineeringRecord,
    models.GrantChecklistItem,
    models.Tag,
    models.Paper,
    models.PaperTag,
    models.PaperProject,
    models.PaperAnnotation,
    models.PaperNote,
    models.ReadingSession,
    models.ReadingSessionPaper,
    models.ExperimentRun,
    models.ExperimentFigure,
    models.Task,
    models.CalendarEvent,
    models.Journal,
    models.Conference,
    models.Submission,
    models.SubmissionEvent,
    models.Patent,
    models.Meeting,
    models.MeetingActionItem,
    models.ThesisMeta,
    models.ThesisChapter,
    models.ThesisMilestone,
    models.ThesisMilestoneAttachment,
    models.CheckIn,
    models.FocusSession,
    models.LeaveRecord,
    models.InboxItem,
    models.Idea,
    models.LifeEntry,
    models.DailyQuote,
    models.AgentConversation,
]


def _row_to_dict(obj) -> dict:
    data = {}
    for col in obj.__table__.columns:
        val = getattr(obj, col.name)
        if hasattr(val, "isoformat"):
            val = val.isoformat()
        elif isinstance(val, (bytes, bytearray)):
            val = {"__base64__": base64.b64encode(bytes(val)).decode("ascii")}
        data[col.name] = val
    return data


def export_snapshot(db: Session) -> Path:
    stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    out_dir = EXPORT_DIR / f"snapshot_{stamp}"
    out_dir.mkdir(parents=True, exist_ok=True)
    payload = {"exported_at": stamp, "tables": {}}
    for model in EXPORT_TABLES:
        rows = db.query(model).all()
        payload["tables"][model.__tablename__] = [_row_to_dict(r) for r in rows]
    json_path = out_dir / "workbench.json"
    json_path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    db_copy = out_dir / "workbench.db"
    shutil.copy2(DB_PATH, db_copy)
    zip_path = EXPORT_DIR / f"research_workbench_{stamp}.zip"
    with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.write(json_path, arcname="workbench.json")
        zf.write(db_copy, arcname="workbench.db")
    shutil.rmtree(out_dir, ignore_errors=True)
    return zip_path


def import_zip(db: Session, zip_path: Path, mode: str = "replace") -> dict:
    tmp = EXPORT_DIR / f"import_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
    tmp.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(zip_path, "r") as zf:
        zf.extractall(tmp)
    db_file = tmp / "workbench.db"
    json_file = tmp / "workbench.json"
    if mode == "replace" and db_file.exists():
        db.close()
        engine.dispose()
        shutil.copy2(db_file, DB_PATH)
        shutil.rmtree(tmp, ignore_errors=True)
        return {"mode": "replace", "source": "workbench.db"}
    if not json_file.exists():
        shutil.rmtree(tmp, ignore_errors=True)
        raise FileNotFoundError("ZIP 中缺少 workbench.json 或 workbench.db")
    payload = json.loads(json_file.read_text(encoding="utf-8"))
    if mode == "replace":
        for model in reversed(EXPORT_TABLES):
            db.query(model).delete()
        db.commit()
    inserted = 0
    for model in EXPORT_TABLES:
        table = model.__tablename__
        rows = payload.get("tables", {}).get(table, [])
        for row in rows:
            row = {
                key: base64.b64decode(value["__base64__"])
                if isinstance(value, dict) and "__base64__" in value
                else value
                for key, value in row.items()
            }
            if mode == "merge":
                existing = db.get(model, row.get("id"))
                if existing:
                    continue
            obj = model(**row)
            db.merge(obj)
            inserted += 1
    db.commit()
    shutil.rmtree(tmp, ignore_errors=True)
    return {"mode": mode, "inserted": inserted}


def seed_defaults(db: Session) -> None:
    if not db.query(models.ThesisMeta).first():
        db.add(
            models.ThesisMeta(
                title="博士学位论文",
                checklist_json=json.dumps(
                    [
                        {"item": "开题报告定稿", "done": False},
                        {"item": "核心实验完成", "done": False},
                        {"item": "相关工作章节", "done": False},
                        {"item": "查重/格式检查", "done": False},
                    ],
                    ensure_ascii=False,
                ),
            )
        )
    if not db.query(models.ThesisMilestone).first():
        for title in ["开题", "中期考核", "预答辩", "答辩"]:
            db.add(models.ThesisMilestone(title=title, status="pending"))
    else:
        existing = {r.title for r in db.query(models.ThesisMilestone.title).all()}
        for title in ["开题", "中期考核", "预答辩", "答辩"]:
            if title not in existing:
                db.add(models.ThesisMilestone(title=title, status="pending"))
    if not db.query(models.ThesisChapter).first():
        chapters = [
            "摘要",
            "第1章 绪论",
            "第2章 相关工作",
            "第3章 方法",
            "第4章 实验",
            "第5章 总结与展望",
            "参考文献",
        ]
        for i, title in enumerate(chapters):
            db.add(models.ThesisChapter(title=title, order_index=i))
    defaults = [
        ("NeurIPS", "NeurIPS", "CCF-A"),
        ("ICML", "ICML", "CCF-A"),
        ("ICLR", "ICLR", "CCF-A"),
        ("CVPR", "CVPR", "CCF-A"),
        ("AAAI", "AAAI", "CCF-A"),
        ("ACL", "ACL", "CCF-A"),
        ("KDD", "KDD", "CCF-A"),
    ]
    conference_seeded = db.query(models.Setting).filter_by(key="conference_catalog_initialized").first()
    if not conference_seeded:
        if not db.query(models.Conference).first():
            for name, short, rank in defaults:
                db.add(models.Conference(name=name, short_name=short, rank=rank, field="AI"))
        db.add(models.Setting(key="conference_catalog_initialized", value="1"))
    journal_seeded = db.query(models.Setting).filter_by(key="journal_catalog_initialized").first()
    if not journal_seeded:
        if not db.query(models.Journal).first():
            try:
                from app.services.journal_catalog import upsert_journal_catalog

                upsert_journal_catalog(db, only_missing=False)
            except Exception:
                pass
        db.add(models.Setting(key="journal_catalog_initialized", value="1"))
    if not db.query(models.Setting).filter_by(key="personal_status").first():
        db.add(models.Setting(key="personal_status", value="在岗"))
        db.add(models.Setting(key="watch_scan_depth", value="4"))
        db.add(models.Setting(key="ai_note_template", value="algorithm"))
    workspace_name = db.query(models.Setting).filter_by(key="workspace_name").first()
    if not workspace_name:
        db.add(models.Setting(key="workspace_name", value="科研工作台"))
    elif (workspace_name.value or "").strip() == "学术工作台":
        workspace_name.value = "科研工作台"
    workspace_subtitle = db.query(models.Setting).filter_by(key="workspace_subtitle").first()
    if not workspace_subtitle:
        db.add(models.Setting(key="workspace_subtitle", value="Research Workspace"))
    elif (workspace_subtitle.value or "").strip() in {
        "Scholar Workspace", "Research Workbench", "Large Language Model Research Demo",
    }:
        workspace_subtitle.value = "Research Workspace"
    if not db.query(models.Setting).filter_by(key="quick_links").first():
        db.add(
            models.Setting(
                key="quick_links",
                value=json.dumps(
                    [
                        {"name": "Claude", "url": "https://claude.ai"},
                        {"name": "ChatGPT", "url": "https://chatgpt.com"},
                        {"name": "Google Scholar", "url": "https://scholar.google.com"},
                        {"name": "Overleaf", "url": "https://www.overleaf.com"},
                        {"name": "SSRN", "url": "https://www.ssrn.com"},
                        {"name": "arXiv", "url": "https://arxiv.org"},
                        {"name": "GitHub", "url": "https://github.com"},
                    ],
                    ensure_ascii=False,
                ),
            )
        )
    defaults_kv = {
        "location_city": "上海",
        "email": "",
        "llm_base_url": "https://api.openai.com/v1",
        "llm_model": "gpt-4o-mini",
        "llm_api_key": "",
        "daily_tip": "先推进一个可验证的小实验，再扩写相关工作。",
        "theme": "light",
    }
    for k, v in defaults_kv.items():
        if not db.query(models.Setting).filter_by(key=k).first():
            db.add(models.Setting(key=k, value=v))
    from app.services.classic_quotes import ensure_classic_quotes

    ensure_classic_quotes(db)
    # Taxonomy (dimensions + colors) is seeded in migrate._seed_taxonomy
    db.commit()
