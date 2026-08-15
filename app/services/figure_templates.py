"""Figure template catalog — figures4papers / nature-figure archetypes with CAD demo data."""

from __future__ import annotations

from copy import deepcopy

from app.services.sci_plot import COMPARISON_COLORS, DEFAULT_COLORS

# Visual picker cards shown in the 出图 modal
FIGURE_TEMPLATES: list[dict] = [
    {
        "id": "comparison_bar",
        "chart_type": "comparison_bar",
        "title": "方法对比柱图",
        "blurb": "单指标 · 每方法一色 · 柱内数值（CellSpliceNet）",
        "family": "bars",
        "demo": "figures4papers / CellSpliceNet",
        "short_name": "Fig.B 方法对比",
        "caption": "Ours（深蓝）相对基线在 IoU 上的优势。",
        "data": {
            "methods": ["Ours", "BRepGAT", "MeshCNN", "PointNet", "MLP"],
            "values": [0.86, 0.78, 0.71, 0.62, 0.55],
            "errors": [0.01, 0.015, 0.02, 0.02, 0.025],
            "ylabel": "IoU",
            "title": "Method comparison",
            "colors": COMPARISON_COLORS[:5],
            "hide_xticks": True,
            "annotate": True,
        },
    },
    {
        "id": "multi_metric",
        "chart_type": "multi_metric",
        "title": "多指标宽面板",
        "blurb": "多 metric 横排 + 独立图例面板（ImmunoStruct）",
        "family": "bars",
        "demo": "figures4papers / ImmunoStruct",
        "short_name": "Fig.C 多指标对比",
        "caption": "IoU / F1 / CD 三项并排，颜色对应方法。",
        "data": {
            "methods": ["Ours", "BRepGAT", "MeshCNN", "PointNet"],
            "colors": COMPARISON_COLORS[:4],
            "annotate": True,
            "title": "Multi-metric comparison",
            "metrics": {
                "IoU ↑": [0.86, 0.78, 0.71, 0.62],
                "F1 ↑": [0.84, 0.75, 0.69, 0.58],
                "CD ↓": [0.014, 0.021, 0.028, 0.041],
            },
        },
    },
    {
        "id": "grouped_bar",
        "chart_type": "grouped_bar",
        "title": "分组柱图",
        "blurb": "同一方法下多指标并排",
        "family": "bars",
        "demo": "nature-figure api",
        "short_name": "Fig.D 分组对比",
        "caption": "各方法在 IoU 与 F1 上的分组对比。",
        "data": {
            "categories": ["PointNet", "MeshCNN", "BRepGAT", "Ours"],
            "series": [[0.62, 0.71, 0.78, 0.86], [0.58, 0.69, 0.75, 0.84]],
            "labels": ["IoU", "F1"],
            "ylabel": "Score",
            "title": "Grouped metrics",
            "colors": [DEFAULT_COLORS[0], DEFAULT_COLORS[2]],
            "annotate": True,
        },
    },
    {
        "id": "ablation_h",
        "chart_type": "ablation_h",
        "title": "消融水平条",
        "blurb": "同色透明度递进 · 消融堆叠（ImmunoStruct）",
        "family": "ablation",
        "demo": "figures4papers / ImmunoStruct",
        "short_name": "Fig.E 消融",
        "caption": "逐步去掉模块后的 IoU 变化。",
        "data": {
            "labels": [
                "Full model",
                "− Refiner",
                "− Geo-reg",
                "− Edge attn",
                "− B-rep encoder",
                "Point-only",
            ],
            "values": [0.86, 0.83, 0.80, 0.76, 0.71, 0.62],
            "xlabel": "IoU",
            "title": "Ablation",
            "color": "#3775BA",
        },
    },
    {
        "id": "line",
        "chart_type": "line",
        "title": "训练 / 趋势折线",
        "blurb": "粗线 + 空心标记（VIGIL / ophthal）",
        "family": "trend",
        "demo": "figures4papers / VIGIL",
        "short_name": "Fig.F 训练曲线",
        "caption": "验证 IoU 随 epoch 变化。",
        "data": {
            "x": [10, 20, 40, 60, 80, 100, 120],
            "y_series": [
                [0.42, 0.51, 0.60, 0.66, 0.70, 0.72, 0.73],
                [0.45, 0.55, 0.66, 0.74, 0.79, 0.82, 0.84],
            ],
            "labels": ["Baseline", "Ours"],
            "xlabel": "Epoch",
            "ylabel": "Val IoU",
            "title": "Validation IoU",
            "colors": [DEFAULT_COLORS[2], DEFAULT_COLORS[0]],
        },
    },
    {
        "id": "heatmap",
        "chart_type": "heatmap",
        "title": "矩阵热力图",
        "blurb": "格内数值 · 适合消融/相关矩阵",
        "family": "matrix",
        "demo": "figures4papers / RNAGenScape",
        "short_name": "Fig.G 消融热力",
        "caption": "去掉模块后的相对掉点。",
        "data": {
            "matrix": [
                [0.0, 0.04, 0.07],
                [0.05, 0.0, 0.09],
                [0.08, 0.06, 0.0],
            ],
            "row_labels": ["w/o Enc", "w/o Reg", "w/o Ref"],
            "col_labels": ["IoU↓", "F1↓", "CD↑"],
            "title": "Ablation drop",
            "cmap": "Reds",
        },
    },
    {
        "id": "radar",
        "chart_type": "radar",
        "title": "雷达图",
        "blurb": "多维能力对比（VIGIL polar）",
        "family": "radar",
        "demo": "figures4papers / VIGIL",
        "short_name": "Fig.H 雷达对比",
        "caption": "多维指标上 Ours 更均衡。",
        "data": {
            "categories": ["IoU", "F1", "Acc", "Precision", "Recall", "Topo"],
            "series": [
                [0.86, 0.84, 0.89, 0.87, 0.82, 0.80],
                [0.71, 0.69, 0.74, 0.72, 0.68, 0.60],
            ],
            "labels": ["Ours", "Baseline"],
            "title": "Capability radar",
            "colors": [DEFAULT_COLORS[0], DEFAULT_COLORS[2]],
        },
    },
]


def list_templates() -> list[dict]:
    out = []
    for t in FIGURE_TEMPLATES:
        out.append(
            {
                "id": t["id"],
                "chart_type": t["chart_type"],
                "title": t["title"],
                "blurb": t["blurb"],
                "family": t["family"],
                "demo": t["demo"],
                "short_name": t["short_name"],
                "caption": t["caption"],
                "data": deepcopy(t["data"]),
            }
        )
    return out


def get_template(template_id: str) -> dict | None:
    for t in list_templates():
        if t["id"] == template_id or t["chart_type"] == template_id:
            return t
    return None
