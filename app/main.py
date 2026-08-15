from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.config import DB_PATH, STATIC_DIR, APP_TITLE, APP_VERSION
from app.data_spaces import active_profile
from app.database import init_db, SessionLocal
from app.routers import api_router
from app.services.backup import seed_defaults
from app.services.migrate import ensure_schema
from app.services.submission_sync import backfill_project_submissions
from app.services.calendar_sync import backfill_venue_deadlines
from app.services.classic_quotes import ensure_classic_quotes


def create_app() -> FastAPI:
    app = FastAPI(title=APP_TITLE, version=APP_VERSION)

    app.add_middleware(
        CORSMiddleware,
        allow_origins=["*"],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @app.on_event("startup")
    def _startup():
        first_launch = not DB_PATH.exists()
        init_db()
        ensure_schema()
        db = SessionLocal()
        try:
            if active_profile() == "demo":
                from app.services.demo_data import ensure_demo_settings, seed_demo_data

                if first_launch:
                    seed_demo_data(db)
                else:
                    ensure_demo_settings(db)
            else:
                seed_defaults(db)
            ensure_classic_quotes(db)
            backfill_project_submissions(db)
            backfill_venue_deadlines(db)
        finally:
            db.close()

    app.include_router(api_router)
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

    @app.get("/")
    def index():
        return FileResponse(STATIC_DIR / "index.html")

    return app


app = create_app()
