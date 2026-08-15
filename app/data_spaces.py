"""Resolve and persist local data-space selection without touching databases."""

from __future__ import annotations

import json
import os
import sys
import time
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent


def default_storage_root() -> Path:
    """Keep installed-app data outside Program Files and the bundled executable."""
    if getattr(sys, "frozen", False):
        folder_name = "ResearchWorkbench"
        if sys.platform == "darwin":
            return Path.home() / "Library" / "Application Support" / folder_name
        local_app_data = os.environ.get("LOCALAPPDATA")
        if local_app_data:
            return Path(local_app_data).expanduser().resolve() / folder_name
        return Path.home() / "AppData" / "Local" / folder_name
    return ROOT_DIR


STORAGE_ROOT = default_storage_root()
PROFILE_STATE_PATH = Path(os.environ.get("WORKBENCH_PROFILE_STATE_PATH", STORAGE_ROOT / ".workbench-profile.json")).expanduser().resolve()
SPACE_ROOT = Path(os.environ.get("WORKBENCH_SPACE_ROOT", STORAGE_ROOT / ".workbench-spaces")).expanduser().resolve()
PERSONAL_DATA_DIR = Path(os.environ.get("WORKBENCH_PERSONAL_DATA_DIR", STORAGE_ROOT / "data")).expanduser().resolve()
PERSONAL_EXPORT_DIR = Path(os.environ.get("WORKBENCH_PERSONAL_EXPORT_DIR", STORAGE_ROOT / "exports")).expanduser().resolve()
MANAGED_PROFILES = ("personal", "demo")


def environment_override() -> Path | None:
    raw = (os.environ.get("WORKBENCH_DATA_DIR") or "").strip()
    return Path(raw).expanduser().resolve() if raw else None


def stored_profile() -> str:
    try:
        payload = json.loads(PROFILE_STATE_PATH.read_text(encoding="utf-8"))
        profile = str(payload.get("active_profile") or "").strip().lower()
        return profile if profile in MANAGED_PROFILES else "personal"
    except (OSError, ValueError, TypeError):
        return "personal" if (PERSONAL_DATA_DIR / "workbench.db").exists() else "demo"


def active_profile() -> str:
    return "custom" if environment_override() else stored_profile()


def runtime_profile() -> str:
    """Return the space bound to the running SQLAlchemy engine."""
    from app.config import DATA_DIR

    current = DATA_DIR.resolve()
    for profile in ("personal", "demo"):
        if current == data_dir_for(profile).resolve():
            return profile
    return "custom"


def data_dir_for(profile: str) -> Path:
    if profile == "personal":
        return PERSONAL_DATA_DIR
    if profile == "demo":
        return SPACE_ROOT / "demo" / "data"
    override = environment_override()
    if profile == "custom" and override:
        return override
    raise ValueError(f"未知数据空间：{profile}")


def export_dir_for(profile: str) -> Path:
    explicit = (os.environ.get("WORKBENCH_EXPORT_DIR") or "").strip()
    if explicit:
        return Path(explicit).expanduser().resolve()
    if profile == "demo":
        return SPACE_ROOT / "demo" / "exports"
    if profile == "custom":
        return data_dir_for(profile).parent / "exports"
    return PERSONAL_EXPORT_DIR


def resolve_data_dir() -> Path:
    return data_dir_for(active_profile())


def resolve_export_dir() -> Path:
    return export_dir_for(active_profile())


def select_profile(profile: str) -> None:
    profile = (profile or "").strip().lower()
    if environment_override():
        raise RuntimeError("当前由 WORKBENCH_DATA_DIR 指定自定义空间，请先移除环境变量再切换")
    if profile not in MANAGED_PROFILES:
        raise ValueError("数据空间只能是 personal 或 demo")
    PROFILE_STATE_PATH.parent.mkdir(parents=True, exist_ok=True)
    temp = PROFILE_STATE_PATH.with_suffix(".tmp")
    temp.write_text(
        json.dumps({"active_profile": profile}, ensure_ascii=False, indent=2),
        encoding="utf-8",
    )
    temp.replace(PROFILE_STATE_PATH)


def space_info() -> dict:
    active = runtime_profile()
    selected = active_profile()
    spaces = []
    for profile, label, description in (
        ("personal", "个人空间", "你的项目、文献、笔记与设置"),
        ("demo", "演示空间", "独立的完整示例，可随时重建"),
    ):
        db_path = data_dir_for(profile) / "workbench.db"
        spaces.append({
            "id": profile,
            "label": label,
            "description": description,
            "active": active == profile,
            "exists": db_path.exists(),
            "size_bytes": db_path.stat().st_size if db_path.exists() else 0,
            "path_hint": "data/workbench.db" if profile == "personal" else ".workbench-spaces/demo/data/workbench.db",
        })
    return {
        "active_profile": active,
        "selected_profile": selected,
        "restart_pending": selected != active,
        "active_label": {"personal": "个人空间", "demo": "演示空间", "custom": "自定义空间"}[active],
        "managed": active != "custom",
        "custom_path": str(environment_override()) if active == "custom" else "",
        "spaces": spaces,
    }


def restart_process(delay: float = 0.65) -> None:
    """Replace the current Python process after the HTTP response is sent."""
    time.sleep(max(0.1, delay))
    from app.database import engine

    engine.dispose()
    if os.environ.get("WORKBENCH_DESKTOP_SERVER") == "1":
        # The desktop supervisor keeps the WebView alive and starts a fresh
        # backend against the newly selected data space.
        os._exit(75)
    args = [sys.executable] if getattr(sys, "frozen", False) else [sys.executable, *sys.argv]
    os.execv(sys.executable, args)
