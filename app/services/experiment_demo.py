"""Seed CAD-style demo experiment runs and publication figures for preview."""

from __future__ import annotations

import json

from sqlalchemy.orm import Session

from app import models
from app.services.experiment_figures import generate_from_template, add_schematic
from app.services.figure_templates import get_template, FIGURE_TEMPLATES


DEMO_MARKER = "示例·出图"


def _demo_runs() -> list[dict]:
    # Pick strong archetypes for two demo runs
    t_cmp = get_template("comparison_bar")
    t_multi = get_template("multi_metric")
    t_line = get_template("line")
    t_abl = get_template("ablation_h")
    t_heat = get_template("heatmap")
    t_radar = get_template("radar")
    return [
        {
            "title": f"{DEMO_MARKER}·CAD 重建对比",
            "hypothesis": "结构感知编码在 IoU / CD 上优于纯点云基线。",
            "status": "done",
            "params_json": json.dumps(
                {"backbone": "BRepGAT", "epochs": 120, "lr": 1e-4, "seed": 42},
                ensure_ascii=False,
            ),
            "metrics_json": json.dumps(
                {"IoU": 0.86, "F1": 0.84, "CD": 0.014, "Acc": 0.89},
                ensure_ascii=False,
            ),
            "conclusion": "Ours 在重建精度与拓扑一致性上均更优。",
            "figures": [t_cmp, t_multi, t_radar],
        },
        {
            "title": f"{DEMO_MARKER}·训练曲线与消融",
            "hypothesis": "几何先验正则可稳定后期收敛。",
            "status": "done",
            "params_json": json.dumps(
                {"lambda_geo": 0.2, "batch": 16, "scheduler": "cosine"},
                ensure_ascii=False,
            ),
            "metrics_json": json.dumps(
                {"best_epoch": 94, "val_IoU": 0.838, "train_loss": 0.112},
                ensure_ascii=False,
            ),
            "conclusion": "加几何正则后验证集 IoU 提升约 3pt。",
            "figures": [t_line, t_abl, t_heat],
        },
    ]


def seed_experiment_figure_demos(db: Session, *, project_id: int | None = None, force: bool = False) -> dict:
    if project_id is None:
        proj = db.query(models.Project).filter(models.Project.title == "CAD-Agent").first()
        if not proj:
            proj = (
                db.query(models.Project)
                .filter(models.Project.status != "done")
                .order_by(models.Project.id.asc())
                .first()
            )
        if not proj:
            proj = models.Project(
                title="CAD-Agent",
                project_type="research",
                status="active",
                stage="分析",
                progress=40,
                next_step="查看示例出图效果",
                research_question="CAD 重建与生成",
            )
            db.add(proj)
            db.flush()
        project_id = proj.id
    else:
        proj = db.get(models.Project, project_id)
        if not proj:
            raise ValueError(f"项目不存在：{project_id}")

    existing = (
        db.query(models.ExperimentRun)
        .filter(models.ExperimentRun.title.like(f"{DEMO_MARKER}%"))
        .all()
    )
    if existing and not force:
        return {
            "ok": True,
            "skipped": True,
            "project_id": project_id,
            "project_title": proj.title,
            "runs": [{"id": r.id, "title": r.title, "figures": len(r.figures or [])} for r in existing],
            "message": "示例已存在；传 force=true 可重建",
            "templates": len(FIGURE_TEMPLATES),
        }

    if force and existing:
        for r in existing:
            db.delete(r)
        db.commit()

    created_runs = []
    first_png = None
    for payload in _demo_runs():
        figs_spec = payload.pop("figures")
        run = models.ExperimentRun(project_id=project_id, **payload)
        db.add(run)
        db.flush()
        fig_ids = []
        for spec in figs_spec:
            if not spec:
                continue
            row = generate_from_template(
                db,
                run,
                chart_type=spec["chart_type"],
                data=spec["data"],
                short_name=spec["short_name"],
                caption=spec["caption"],
            )
            fig_ids.append(row.id)
            if first_png is None and row.image_path:
                first_png = row.image_path

        if first_png:
            try:
                sch = add_schematic(
                    db,
                    run,
                    local_path=first_png,
                    short_name="Fig.0 流程示意（样例）",
                    caption="用已生成图占位；可换成真实方法框图路径。",
                )
                fig_ids.append(sch.id)
            except Exception:
                pass

        created_runs.append({"id": run.id, "title": run.title, "figures": fig_ids})

    return {
        "ok": True,
        "skipped": False,
        "project_id": project_id,
        "project_title": proj.title,
        "runs": created_runs,
        "templates": len(FIGURE_TEMPLATES),
        "message": f"已在「{proj.title}」下创建示例 Run 与出图（{len(FIGURE_TEMPLATES)} 类模板）",
    }
