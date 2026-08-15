from fastapi import APIRouter

from app.routers import dashboard, papers, projects, tasks_calendar, outputs, meetings, thesis, extras, ai, experiment_figures


api_router = APIRouter(prefix="/api")
api_router.include_router(dashboard.router)
api_router.include_router(papers.router)
api_router.include_router(projects.router)
api_router.include_router(experiment_figures.router)
api_router.include_router(tasks_calendar.router)
api_router.include_router(outputs.router)
api_router.include_router(meetings.router)
api_router.include_router(thesis.router)
api_router.include_router(extras.router)
api_router.include_router(ai.router)
