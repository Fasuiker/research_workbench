from pathlib import Path
import sys

from app.data_spaces import resolve_data_dir, resolve_export_dir

ROOT_DIR = Path(getattr(sys, "_MEIPASS", Path(__file__).resolve().parent.parent))
DATA_DIR = resolve_data_dir()
EXPORT_DIR = resolve_export_dir()
STATIC_DIR = ROOT_DIR / "static"
DB_PATH = DATA_DIR / "workbench.db"

DATA_DIR.mkdir(parents=True, exist_ok=True)
EXPORT_DIR.mkdir(parents=True, exist_ok=True)

HOST = "127.0.0.1"
PORT = 8787
APP_TITLE = "科研工作台"
APP_VERSION = "1.16.0"
