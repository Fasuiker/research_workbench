"""Serialize ExperimentRun → ExperimentOut (avoids router circular imports)."""

from __future__ import annotations

from app import models
from app.schemas import ExperimentOut
from app.services.skill_figure_catalog import get_skill_figure


def experiment_out(row: models.ExperimentRun) -> ExperimentOut:
    figs = list(getattr(row, "figures", None) or [])
    preview_id = None
    for f in figs:
        if f.image_path:
            preview_id = f.id
            break
    style_preview = ""
    style_short = ""
    tid = getattr(row, "style_template_id", "") or ""
    if tid:
        skill = get_skill_figure(tid)
        if skill:
            style_preview = skill.get("preview") or ""
            style_short = skill.get("short_name") or ""
    base = ExperimentOut.model_validate(row)
    return base.model_copy(
        update={
            "figure_count": len(figs),
            "preview_figure_id": preview_id,
            "style_template_id": tid,
            "style_preview": style_preview,
            "style_short_name": style_short,
        }
    )
