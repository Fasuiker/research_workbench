"""Backup health: last backup stamp, due reminder, optional auto weekly snapshot."""

from __future__ import annotations

from datetime import datetime
from pathlib import Path

from sqlalchemy.orm import Session

from app import models
from app.config import EXPORT_DIR
from app.services.backup import export_snapshot


def get_setting(db: Session, key: str, default: str = "") -> str:
    row = db.get(models.Setting, key)
    return row.value if row else default


def set_setting(db: Session, key: str, value: str) -> None:
    row = db.get(models.Setting, key)
    if row:
        row.value = value
    else:
        db.add(models.Setting(key=key, value=value))
    db.commit()


def mark_backup_now(db: Session, path: Path | None = None) -> str:
    stamp = datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    set_setting(db, "last_backup_at", stamp)
    if path:
        set_setting(db, "last_backup_file", str(path.name))
    return stamp


def backup_health(db: Session) -> dict:
    last = get_setting(db, "last_backup_at", "").strip()
    enabled = get_setting(db, "backup_remind_enabled", "1") not in ("0", "false", "False", "off")
    auto = get_setting(db, "auto_weekly_backup", "1") not in ("0", "false", "False", "off")
    try:
        days = max(1, min(90, int(get_setting(db, "backup_interval_days", "7") or "7")))
    except ValueError:
        days = 7
    days_since = None
    due = False
    if last:
        try:
            raw = last.replace("Z", "")
            dt = datetime.fromisoformat(raw)
            days_since = max(0, (datetime.utcnow() - dt).days)
            due = days_since >= days
        except ValueError:
            due = True
            days_since = None
    else:
        due = True
    return {
        "last_backup_at": last or None,
        "last_backup_file": get_setting(db, "last_backup_file", "") or None,
        "backup_remind_enabled": enabled,
        "auto_weekly_backup": auto,
        "backup_interval_days": days,
        "backup_due": bool(enabled and due),
        "backup_days_since": days_since,
        "exports_dir": str(EXPORT_DIR),
    }


def ensure_weekly_backup(db: Session) -> dict:
    """If auto weekly enabled and overdue (or never), write a snapshot under exports/."""
    health = backup_health(db)
    if not health["auto_weekly_backup"]:
        return {**health, "auto_ran": False}
    if health["last_backup_at"] and not health["backup_due"]:
        return {**health, "auto_ran": False}
    try:
        EXPORT_DIR.mkdir(parents=True, exist_ok=True)
        path = export_snapshot(db)
        stamp = mark_backup_now(db, path)
        health = backup_health(db)
        return {**health, "auto_ran": True, "auto_path": path.name, "last_backup_at": stamp}
    except Exception as e:
        return {**health, "auto_ran": False, "auto_error": str(e)}
