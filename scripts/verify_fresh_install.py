"""Verify first-launch demo data in a temporary, isolated workspace."""

from __future__ import annotations

import os
import sys
import tempfile
import json
import zipfile
from pathlib import Path


ROOT_DIR = Path(__file__).resolve().parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))


def main() -> None:
    with tempfile.TemporaryDirectory(prefix="research-workbench-demo-") as tmp:
        root = Path(tmp)
        os.environ.pop("WORKBENCH_DATA_DIR", None)
        os.environ.pop("WORKBENCH_EXPORT_DIR", None)
        os.environ["WORKBENCH_PROFILE_STATE_PATH"] = str(root / "profile.json")
        os.environ["WORKBENCH_SPACE_ROOT"] = str(root / "spaces")
        os.environ["WORKBENCH_PERSONAL_DATA_DIR"] = str(root / "personal" / "data")
        os.environ["WORKBENCH_PERSONAL_EXPORT_DIR"] = str(root / "personal" / "exports")

        from app import models
        from app.config import DB_PATH
        from app.data_spaces import active_profile, runtime_profile, select_profile, space_info
        from app.database import SessionLocal, engine
        from app.main import app
        from app.services.backup import export_snapshot
        from app.services.demo_data import DEMO_DATA_VERSION, seed_demo_data

        # Invoke the same startup hook Uvicorn runs, without needing an HTTP test dependency.
        for startup in app.router.on_startup:
            startup()
        assert active_profile() == "demo", active_profile()
        assert runtime_profile() == "demo", runtime_profile()
        assert space_info()["spaces"][1]["active"] is True

        db = SessionLocal()
        try:
            first = {"created": {"startup": "verified"}}
            counts = {
                "projects": db.query(models.Project).count(),
                "engineering_projects": db.query(models.Project).filter_by(project_type="engineering").count(),
                "papers": db.query(models.Paper).count(),
                "paper_notes": db.query(models.PaperNote).count(),
                "general_notes": db.query(models.GeneralNote).count(),
                "engineering_records": db.query(models.EngineeringRecord).count(),
                "experiments": db.query(models.ExperimentRun).count(),
                "submissions": db.query(models.Submission).count(),
                "conversations": db.query(models.AgentConversation).count(),
            }
            assert all(value > 0 for value in counts.values()), counts
            assert counts["projects"] >= 2, counts
            assert counts["papers"] >= 3, counts
            assert counts["projects"] == 5, counts
            assert counts["papers"] == 12, counts
            assert counts["paper_notes"] == 5, counts
            assert counts["engineering_records"] == 6, counts
            assert counts["experiments"] == 6, counts
            assert counts["submissions"] == 6, counts
            assert db.query(models.Task).count() == 12
            assert {row.status for row in db.query(models.Task).all()} == {"todo", "doing", "blocked", "done"}
            assert {row.status for row in db.query(models.ExperimentRun).all()} == {"planned", "running", "done", "failed"}
            assert {row.status for row in db.query(models.Submission).all()} == {
                "writing", "internal_review", "submitted", "revision", "accepted", "rejected",
            }
            assert all(not (row.local_path or "") for row in db.query(models.Paper).all())
            assert all((row.title or "").startswith("示例·") for row in db.query(models.Paper).all())
            assert not db.query(models.Project).filter(models.Project.title.like("%CAD%")).first()
            demo_settings = {
                row.key: row.value
                for row in db.query(models.Setting).filter(
                    models.Setting.key.in_(["email", "mail_accounts"])
                ).all()
            }
            assert demo_settings.get("email", "") == "", demo_settings
            assert json.loads(demo_settings.get("mail_accounts", "[]")) == [], demo_settings

            milestone = db.query(models.ThesisMilestone).first()
            db.add(models.ThesisMilestoneAttachment(
                milestone_id=milestone.id,
                filename="demo.txt",
                content_type="text/plain",
                size=4,
                data=b"demo",
            ))
            db.commit()
            archive = export_snapshot(db)
            with zipfile.ZipFile(archive) as bundle:
                payload = json.loads(bundle.read("workbench.json"))
            attachment = payload["tables"]["thesis_milestone_attachments"][0]
            assert attachment["data"] == {"__base64__": "ZGVtbw=="}, attachment

            before = {model.__tablename__: db.query(model).count() for model in (
                models.Project, models.ProjectNote, models.EngineeringRecord,
                models.Paper, models.PaperNote, models.GeneralNote, models.Task,
                models.ExperimentRun, models.Submission, models.AgentConversation,
            )}
            second = seed_demo_data(db)
            after = {model.__tablename__: db.query(model).count() for model in (
                models.Project, models.ProjectNote, models.EngineeringRecord,
                models.Paper, models.PaperNote, models.GeneralNote, models.Task,
                models.ExperimentRun, models.Submission, models.AgentConversation,
            )}
            assert before == after, {"before": before, "after": after}
            assert DB_PATH.is_relative_to(root), DB_PATH
            assert DB_PATH.exists(), DB_PATH
            select_profile("personal")
            assert active_profile() == "personal", active_profile()
            assert runtime_profile() == "demo", runtime_profile()
            assert not (root / "personal" / "data" / "workbench.db").exists()
        finally:
            db.close()
            engine.dispose()

        print(f"fresh-install demo {DEMO_DATA_VERSION}: OK")
        print(f"database: {DB_PATH}")
        print(f"created first pass: {first['created']}")
        print(f"created second pass: {second['created']}")


if __name__ == "__main__":
    main()
