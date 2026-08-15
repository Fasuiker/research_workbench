"""Experiment figure storage, schematic import, and template plotting."""

from __future__ import annotations

import json
import shutil
from pathlib import Path

from sqlalchemy.orm import Session

from app import models
from app.config import DATA_DIR
from app.services.files import normalize_path
from app.services.sci_plot import render_chart


FIGURE_ROOT = DATA_DIR / "experiment_figures"


def run_dir(run_id: int) -> Path:
    d = FIGURE_ROOT / str(run_id)
    d.mkdir(parents=True, exist_ok=True)
    return d


def figure_to_out(row: models.ExperimentFigure) -> dict:
    png = Path(row.image_path) if row.image_path else None
    svg = Path(row.svg_path) if row.svg_path else None
    return {
        "id": row.id,
        "experiment_id": row.experiment_id,
        "kind": row.kind,
        "short_name": row.short_name or "",
        "caption": row.caption or "",
        "chart_type": row.chart_type or "",
        "data_json": row.data_json or "{}",
        "image_path": row.image_path or "",
        "svg_path": row.svg_path or "",
        "source": row.source or "template",
        "created_at": row.created_at,
        "updated_at": row.updated_at,
        "has_png": bool(png and png.is_file()),
        "has_svg": bool(svg and svg.is_file()),
    }


def metrics_to_bar_data(metrics_json: str) -> dict:
    try:
        obj = json.loads(metrics_json or "{}")
    except json.JSONDecodeError:
        obj = {}
    if not isinstance(obj, dict):
        return {"categories": [], "values": []}
    nums = {}
    for k, v in obj.items():
        try:
            nums[str(k)] = float(v)
        except (TypeError, ValueError):
            continue
    return {
        "categories": list(nums.keys()),
        "values": list(nums.values()),
        "ylabel": "Metric",
    }


def _safe_stem(short_name: str, prefix: str, fid: int) -> str:
    raw = (short_name or prefix).strip() or prefix
    cleaned = "".join(c if c.isalnum() or c in "-_" else "_" for c in raw)[:40]
    return f"{cleaned}_{fid}"


def generate_from_template(
    db: Session,
    run: models.ExperimentRun,
    *,
    chart_type: str,
    data: dict,
    short_name: str = "",
    caption: str = "",
) -> models.ExperimentFigure:
    chart_type = (chart_type or "bar").strip().lower()
    allowed = {
        "bar",
        "comparison_bar",
        "grouped_bar",
        "multi_metric",
        "comparison_panel",
        "ablation_h",
        "ablation",
        "line",
        "heatmap",
        "radar",
    }
    if chart_type not in allowed:
        raise ValueError(
            "chart_type 须为 comparison_bar / multi_metric / grouped_bar / ablation_h / line / heatmap / radar"
        )
    if not isinstance(data, dict) or not data:
        raise ValueError("请提供 data（JSON 对象）")

    row = models.ExperimentFigure(
        experiment_id=run.id,
        kind="plot",
        short_name=(short_name or chart_type).strip()[:120],
        caption=(caption or "").strip(),
        chart_type=chart_type,
        data_json=json.dumps(data, ensure_ascii=False),
        source="template",
    )
    db.add(row)
    db.flush()

    stem = run_dir(run.id) / _safe_stem(row.short_name, chart_type, row.id)
    png, svg = render_chart(chart_type, data, stem)
    row.image_path = str(png)
    row.svg_path = str(svg)
    db.commit()
    db.refresh(row)
    return row


def add_schematic(
    db: Session,
    run: models.ExperimentRun,
    *,
    local_path: str,
    short_name: str = "",
    caption: str = "",
) -> models.ExperimentFigure:
    raw = (local_path or "").strip()
    if not raw:
        raise ValueError("请提供本地图片路径")
    src = Path(normalize_path(raw))
    if not src.is_file():
        raise ValueError(f"文件不存在：{src}")
    suffix = src.suffix.lower()
    if suffix not in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".bmp", ".tif", ".tiff"):
        raise ValueError("示意图仅支持常见图片格式（png/jpg/svg/webp 等）")

    row = models.ExperimentFigure(
        experiment_id=run.id,
        kind="schematic",
        short_name=(short_name or src.stem).strip()[:120],
        caption=(caption or "").strip(),
        chart_type="image",
        data_json=json.dumps({"source_path": str(src)}, ensure_ascii=False),
        source="upload",
    )
    db.add(row)
    db.flush()

    dest_dir = run_dir(run.id)
    base = _safe_stem(row.short_name, "schematic", row.id)
    dest = dest_dir / f"{base}{suffix}"
    shutil.copy2(src, dest)

    # Prefer PNG preview for lightbox; keep SVG as svg_path when source is svg
    if suffix == ".svg":
        row.svg_path = str(dest)
        row.image_path = str(dest)
    elif suffix in (".png", ".jpg", ".jpeg", ".webp", ".gif", ".bmp"):
        row.image_path = str(dest)
        row.svg_path = ""
    else:
        # tiff etc. — store as image_path; browsers may not preview all
        row.image_path = str(dest)
        row.svg_path = ""

    db.commit()
    db.refresh(row)
    return row


def delete_figure_files(row: models.ExperimentFigure) -> None:
    for p in (row.image_path, row.svg_path):
        if not p:
            continue
        path = Path(p)
        try:
            if not path.is_file():
                continue
            # only delete under data/experiment_figures
            resolved = path.resolve()
            root = FIGURE_ROOT.resolve()
            if root == resolved or root in resolved.parents:
                path.unlink()
        except OSError:
            pass


def update_figure_meta(
    db: Session,
    row: models.ExperimentFigure,
    *,
    short_name: str | None = None,
    caption: str | None = None,
) -> models.ExperimentFigure:
    if short_name is not None:
        row.short_name = short_name.strip()[:120]
    if caption is not None:
        row.caption = caption.strip()
    db.commit()
    db.refresh(row)
    return row
