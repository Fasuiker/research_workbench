"""Experiment figure CRUD, template plotting, schematic import."""

from __future__ import annotations

from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app import models
from app.schemas import (
    ExperimentFigureIn,
    ExperimentFigureOut,
    FigureGenerateIn,
    FigureSchematicIn,
    ExperimentStyleLinkIn,
    FigureGenerateFromStyleIn,
    ExperimentOut,
)
from app.services.experiment_figures import (
    figure_to_out,
    generate_from_template,
    add_schematic,
    delete_figure_files,
    update_figure_meta,
    metrics_to_bar_data,
)
from app.services.experiment_demo import seed_experiment_figure_demos
from app.services.figure_templates import list_templates
from app.services.skill_figure_catalog import (
    list_skill_figures,
    list_skill_boards,
    get_skill_figure,
    merge_style_into_data,
    data_from_run_metrics,
    build_figure_pack,
)
from app.services.experiment_serialize import experiment_out as _experiment_out

router = APIRouter(tags=["experiment-figures"])


@router.get("/skill-figures")
def skill_figures():
    """Gallery of nature-figure / figures4papers looks (preview + caption + style)."""
    return {
        "figures": list_skill_figures(),
        "boards": list_skill_boards(),
    }


@router.get("/skill-figures/{figure_id}")
def skill_figure_detail(figure_id: str):
    pack = build_figure_pack(figure_id)
    if not pack:
        raise HTTPException(404, "图库条目不存在")
    return pack


@router.get("/experiments/figure-templates")
def figure_templates():
    # keep for backward compat; prefer /skill-figures
    return {"templates": list_templates()}


@router.post("/experiments/seed-demo-figures")
def seed_demo_figures(force: bool = False, project_id: int | None = None, db: Session = Depends(get_db)):
    try:
        return seed_experiment_figure_demos(db, project_id=project_id, force=force)
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(500, f"示例出图失败：{e}") from e


def _load_run(db: Session, run_id: int) -> models.ExperimentRun:
    row = (
        db.query(models.ExperimentRun)
        .options(joinedload(models.ExperimentRun.figures))
        .filter(models.ExperimentRun.id == run_id)
        .first()
    )
    if not row:
        raise HTTPException(404, "实验 Run 不存在")
    return row


@router.put("/experiments/{run_id}/style", response_model=ExperimentOut)
def link_experiment_style(run_id: int, payload: ExperimentStyleLinkIn, db: Session = Depends(get_db)):
    run = _load_run(db, run_id)
    tid = (payload.style_template_id or "").strip()
    if tid and not get_skill_figure(tid):
        raise HTTPException(400, f"未知图库条目：{tid}")
    run.style_template_id = tid
    db.commit()
    db.refresh(run)
    return _experiment_out(run)


@router.post("/experiments/{run_id}/figures/generate-from-style", response_model=ExperimentFigureOut)
def generate_from_style(run_id: int, payload: FigureGenerateFromStyleIn, db: Session = Depends(get_db)):
    run = _load_run(db, run_id)
    tid = (payload.style_template_id or run.style_template_id or "").strip()
    if not tid:
        raise HTTPException(400, "请先关联图库中的一张图（风格）")
    skill = get_skill_figure(tid)
    if not skill:
        raise HTTPException(400, f"未知图库条目：{tid}")

    raw = payload.data or {}
    if (not raw) and payload.use_metrics:
        raw = data_from_run_metrics(run.metrics_json or "{}", skill["chart_type"])
    if not raw:
        raise HTTPException(400, "请提供 data，或在 Run 中填写 metrics_json")

    chart_type, data = merge_style_into_data(skill, raw)
    short = (payload.short_name or skill.get("short_name") or chart_type).strip()
    cap = (payload.caption or skill.get("caption") or "").strip()
    # persist association (generate_from_template commits the session)
    run.style_template_id = tid
    try:
        row = generate_from_template(
            db,
            run,
            chart_type=chart_type,
            data=data,
            short_name=short,
            caption=cap,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except RuntimeError as e:
        raise HTTPException(503, str(e)) from e
    except Exception as e:
        raise HTTPException(500, f"出图失败：{e}") from e
    return ExperimentFigureOut(**figure_to_out(row))


@router.get("/experiments/{run_id}/figures", response_model=list[ExperimentFigureOut])
def list_figures(run_id: int, db: Session = Depends(get_db)):
    run = _load_run(db, run_id)
    return [ExperimentFigureOut(**figure_to_out(f)) for f in run.figures]


@router.post("/experiments/{run_id}/figures/generate", response_model=ExperimentFigureOut)
def generate_figure(run_id: int, payload: FigureGenerateIn, db: Session = Depends(get_db)):
    run = _load_run(db, run_id)
    data = payload.data or {}
    try:
        row = generate_from_template(
            db,
            run,
            chart_type=payload.chart_type,
            data=data,
            short_name=payload.short_name,
            caption=payload.caption,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except RuntimeError as e:
        raise HTTPException(503, str(e)) from e
    except Exception as e:
        raise HTTPException(500, f"出图失败：{e}") from e
    return ExperimentFigureOut(**figure_to_out(row))


@router.post("/experiments/{run_id}/figures/schematic", response_model=ExperimentFigureOut)
def import_schematic(run_id: int, payload: FigureSchematicIn, db: Session = Depends(get_db)):
    run = _load_run(db, run_id)
    try:
        row = add_schematic(
            db,
            run,
            local_path=payload.local_path,
            short_name=payload.short_name,
            caption=payload.caption,
        )
    except ValueError as e:
        raise HTTPException(400, str(e)) from e
    except Exception as e:
        raise HTTPException(500, f"导入示意图失败：{e}") from e
    return ExperimentFigureOut(**figure_to_out(row))


@router.get("/experiments/{run_id}/figures/metrics-preset")
def metrics_preset(run_id: int, db: Session = Depends(get_db)):
    run = _load_run(db, run_id)
    data = metrics_to_bar_data(run.metrics_json or "{}")
    return {"chart_type": "bar", "data": data, "short_name": "metrics", "caption": "从 metrics 预填"}


@router.put("/figures/{fid}", response_model=ExperimentFigureOut)
def update_figure(fid: int, payload: ExperimentFigureIn, db: Session = Depends(get_db)):
    row = db.get(models.ExperimentFigure, fid)
    if not row:
        raise HTTPException(404)
    row = update_figure_meta(db, row, short_name=payload.short_name, caption=payload.caption)
    return ExperimentFigureOut(**figure_to_out(row))


@router.delete("/figures/{fid}")
def delete_figure(fid: int, db: Session = Depends(get_db)):
    row = db.get(models.ExperimentFigure, fid)
    if not row:
        raise HTTPException(404)
    delete_figure_files(row)
    db.delete(row)
    db.commit()
    return {"ok": True}


@router.get("/figures/{fid}/file")
def figure_file(fid: int, fmt: str = Query("png"), db: Session = Depends(get_db)):
    row = db.get(models.ExperimentFigure, fid)
    if not row:
        raise HTTPException(404)
    fmt = (fmt or "png").lower()
    path = row.svg_path if fmt == "svg" else row.image_path
    if fmt == "svg" and not path:
        path = row.image_path
    if not path or not Path(path).is_file():
        raise HTTPException(404, "文件不存在")
    media = "image/svg+xml" if path.lower().endswith(".svg") else "image/png"
    if path.lower().endswith((".jpg", ".jpeg")):
        media = "image/jpeg"
    elif path.lower().endswith(".webp"):
        media = "image/webp"
    elif path.lower().endswith(".gif"):
        media = "image/gif"
    return FileResponse(path, media_type=media, filename=Path(path).name)
