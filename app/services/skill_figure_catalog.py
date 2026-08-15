"""Skill figure gallery: real previews from nature-figure / figures4papers + style bindings.

Each entry is a *look* (preview image + short name + caption + chart recipe).
Experiments link to an entry, then generate with the experiment's own data.

Asset inventory lives in skill_figure_entries.json (synced from the nature-figure skill).
figures4papers is not a separate Codex skill — it is the demo/reference library inside nature-figure.
"""

from __future__ import annotations

import json
from copy import deepcopy
from pathlib import Path

from app.services.sci_plot import COMPARISON_COLORS, DEFAULT_COLORS, PALETTE

_ENTRIES_PATH = Path(__file__).with_name("skill_figure_entries.json")

SKILL_BOARDS = [
    {
        "id": "formal_demo",
        "name": "正式 demo",
        "blurb": (
            "figures4papers 正式示例：figure_*/figures 成品图，每张都挂了配套 plot_*.py（可一对多）。"
            "点「说明/代码」复制脚本给 Scier。"
        ),
    },
    {
        "id": "chart_family",
        "name": "图族 / 图例",
        "blurb": (
            "nature-figure chart-atlas 图型族 + gallery 多面板图例，以及 figures4papers/assets 示意拼版。"
            "这类本来就没有单文件画图脚本，只作视觉参考。"
        ),
    },
]


def _enrich(entry: dict) -> dict:
    """Attach default palette colors so generate-from-style stays styleful."""
    e = deepcopy(entry)
    if e.get("caption"):
        e["caption"] = str(e["caption"]).replace("Agent", "Scier")
    style = dict(e.get("style") or {})
    ct = e.get("chart_type") or "comparison_bar"
    if ct in ("comparison_bar", "bar") and "colors" not in style:
        style["colors"] = list(COMPARISON_COLORS[:6])
    elif ct in ("grouped_bar", "multi_metric") and "colors" not in style:
        style["colors"] = list(COMPARISON_COLORS[:5])
    elif ct == "line" and "colors" not in style:
        style["colors"] = list(DEFAULT_COLORS[:3])
    elif ct == "radar" and "colors" not in style:
        style["colors"] = [DEFAULT_COLORS[0], DEFAULT_COLORS[2]]
    elif ct in ("ablation_h", "ablation") and "color" not in style:
        style["color"] = PALETTE.get("blue_secondary", DEFAULT_COLORS[0])
    e["style"] = style
    preview = (e.get("preview") or "").strip()
    # card thumbs: /static/skill-gallery/foo.png -> /static/skill-gallery/thumbs/foo.jpg
    if preview.startswith("/static/skill-gallery/") and "/thumbs/" not in preview:
        name = Path(preview).stem + ".jpg"
        e["preview_thumb"] = f"/static/skill-gallery/thumbs/{name}"
    else:
        e["preview_thumb"] = preview
    return e


_ENTRIES_MTIME: float | None = None
_ENTRIES_CACHE: list[dict] = []


def _load_entries() -> list[dict]:
    global _ENTRIES_MTIME, _ENTRIES_CACHE
    if not _ENTRIES_PATH.is_file():
        return []
    mtime = _ENTRIES_PATH.stat().st_mtime
    if _ENTRIES_CACHE and _ENTRIES_MTIME == mtime:
        return _ENTRIES_CACHE
    raw = json.loads(_ENTRIES_PATH.read_text(encoding="utf-8"))
    if not isinstance(raw, list):
        _ENTRIES_CACHE = []
        _ENTRIES_MTIME = mtime
        return []
    _ENTRIES_CACHE = [_enrich(x) for x in raw if isinstance(x, dict) and x.get("id")]
    _ENTRIES_MTIME = mtime
    return _ENTRIES_CACHE


SKILL_FIGURES: list[dict] = _load_entries()


def list_skill_figures() -> list[dict]:
    # cache by JSON mtime; still picks up edits without full process restart
    return list(_load_entries())


def list_skill_boards() -> list[dict]:
    figs = list_skill_figures()
    out = []
    for b in SKILL_BOARDS:
        board_figs = [f for f in figs if f.get("board") == b["id"]]
        out.append({**deepcopy(b), "count": len(board_figs), "figures": board_figs})
    return out


def get_skill_figure(fid: str) -> dict | None:
    for x in list_skill_figures():
        if x["id"] == fid:
            return deepcopy(x)
    return None


def build_figure_pack(fid: str) -> dict | None:
    """Caption + code + agent prompt bundle for copying / external agent."""
    fig = get_skill_figure(fid)
    if not fig:
        return None
    code = ""
    code_name = ""
    # prefer cached static copy
    code_url = (fig.get("code_url") or "").strip()
    if code_url.startswith("/static/"):
        root = Path(__file__).resolve().parents[2]
        local = root / code_url.lstrip("/")
        if local.is_file():
            code = local.read_text(encoding="utf-8", errors="replace")
            code_name = local.name
    if not code and fig.get("code_path"):
        p = Path(fig["code_path"])
        if p.is_file():
            code = p.read_text(encoding="utf-8", errors="replace")
            code_name = p.name
    agent_prompt = _agent_prompt_for(fig, code, code_name)
    return {
        **fig,
        "code": code,
        "code_name": code_name,
        "agent_prompt": agent_prompt,
        "copy_bundle": agent_prompt,
    }


def _agent_prompt_for(fig: dict, code: str, code_name: str) -> str:
    style = fig.get("style") or {}
    parts = [
        "请按下列参考图的画法/配色/标注习惯，用我提供的数据重画一张投稿级图。",
        f"参考图：{fig.get('short_name')}",
        f"来源：{fig.get('source') or fig.get('skill')}",
        f"说明：{fig.get('caption')}",
        f"建议图型 chart_type：{fig.get('chart_type')}",
        f"风格参数 style：{json.dumps(style, ensure_ascii=False)}",
        "要求：保留参考图的颜色语义、线宽/轴样式、注释位置习惯；替换为下面的数据；导出可编辑 SVG/PDF。",
        "",
        "【我的数据 / 指标】",
        "（在此粘贴 metrics / CSV / 表格）",
        "",
    ]
    if code:
        parts.extend(
            [
                f"【参考代码 · {code_name or 'plot.py'}】",
                "```python",
                code,
                "```",
            ]
        )
    else:
        parts.append("（该条目无配套 demo 脚本；请依据预览图说明与 chart_type/style 复刻。）")
    return "\n".join(parts)


def merge_style_into_data(skill: dict, data: dict) -> tuple[str, dict]:
    """Merge skill style defaults into user/experiment data; return (chart_type, data)."""
    chart_type = skill.get("chart_type") or "comparison_bar"
    style = skill.get("style") or {}
    out = dict(data or {})
    for k, v in style.items():
        if k not in out or out[k] in (None, "", [], {}):
            out[k] = deepcopy(v)
    if "colors" in style:
        out["colors"] = deepcopy(style["colors"])
    if "color" in style:
        out["color"] = style["color"]
    if "cmap" in style:
        out["cmap"] = style["cmap"]
    if "hide_xticks" in style:
        out["hide_xticks"] = style["hide_xticks"]
    if "annotate" in style:
        out.setdefault("annotate", style["annotate"])
    return chart_type, out


def data_from_run_metrics(metrics_json: str, chart_type: str) -> dict:
    """Build a minimal data payload from flat metrics for the given chart type."""
    try:
        obj = json.loads(metrics_json or "{}")
    except json.JSONDecodeError:
        obj = {}
    nums = {}
    if isinstance(obj, dict):
        for k, v in obj.items():
            try:
                nums[str(k)] = float(v)
            except (TypeError, ValueError):
                continue
    keys = list(nums.keys())
    vals = list(nums.values())

    if chart_type in ("comparison_bar", "bar"):
        return {"methods": keys, "values": vals, "ylabel": "Score", "title": "From metrics"}
    if chart_type == "grouped_bar":
        return {
            "categories": keys,
            "series": [vals],
            "labels": ["Value"],
            "ylabel": "Score",
        }
    if chart_type in ("ablation_h", "ablation"):
        return {"labels": keys, "values": vals, "xlabel": "Score"}
    if chart_type == "line":
        return {
            "x": list(range(1, len(vals) + 1)),
            "y_series": [vals],
            "labels": ["metrics"],
            "xlabel": "Index",
            "ylabel": "Value",
        }
    if chart_type == "radar":
        while len(keys) < 3:
            keys.append(f"m{len(keys)+1}")
            vals.append(0.0)
        return {"categories": keys, "series": [vals], "labels": ["Run"]}
    if chart_type == "multi_metric":
        return {
            "methods": ["This run"],
            "metrics": {k: [v] for k, v in nums.items()} or {"Score": [0.0]},
            "annotate": True,
        }
    if chart_type == "heatmap":
        import math

        n = max(len(vals), 1)
        side = max(2, int(math.ceil(math.sqrt(n))))
        matrix = []
        idx = 0
        for _ in range(side):
            row = []
            for _ in range(side):
                row.append(vals[idx % len(vals)] if vals else 0.0)
                idx += 1
            matrix.append(row)
        return {
            "matrix": matrix,
            "row_labels": [f"r{i}" for i in range(side)],
            "col_labels": [f"c{i}" for i in range(side)],
        }
    return {"methods": keys, "values": vals}
