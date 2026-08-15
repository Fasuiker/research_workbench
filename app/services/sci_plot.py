"""Publication-style matplotlib helpers — figures4papers / nature-figure conventions.

Not a full clone of every demo script; ports the house style that makes those demos
look publication-ready: thick spines, semantic per-method colors, legend panels,
editable SVG, and common chart archetypes.
"""

from __future__ import annotations

from pathlib import Path

# From nature-figure / figures4papers api.md
PALETTE = {
    "blue_main": "#0F4D92",
    "blue_secondary": "#3775BA",
    "green_1": "#DDF3DE",
    "green_2": "#AADCA9",
    "green_3": "#8BCF8B",
    "red_1": "#F6CFCB",
    "red_2": "#E9A6A1",
    "red_strong": "#B64342",
    "neutral_light": "#CFCECE",
    "neutral_mid": "#767676",
    "neutral_dark": "#4D4D4D",
    "neutral_black": "#272727",
    "teal": "#42949E",
    "violet": "#9A4D8E",
    "magenta": "#EA84DD",
    "gold": "#FFD700",
}

# CellSpliceNet-style: hero dark blue + warm pink fade for baselines
COMPARISON_COLORS = [
    "#0F4D92",
    "#F09F97",
    "#F1B3AC",
    "#EFBEB8",
    "#F0CDC8",
    "#F3D9D8",
    "#FCEEED",
]

DEFAULT_COLORS = [
    PALETTE["blue_main"],
    PALETTE["green_3"],
    PALETTE["red_strong"],
    PALETTE["teal"],
    PALETTE["violet"],
    PALETTE["neutral_light"],
]

DEFAULT_COLORS_NMI_PASTEL = [
    "#484878",
    "#7884B4",
    "#B4C0E4",
    "#E4E4F0",
    "#E4CCD8",
    "#F0C0CC",
]


def ensure_matplotlib():
    try:
        import matplotlib  # noqa: F401
        import matplotlib.pyplot as plt  # noqa: F401
        import numpy  # noqa: F401
    except ImportError as e:
        raise RuntimeError(
            "缺少绘图依赖：请在 phdbench 环境执行 pip install matplotlib numpy"
        ) from e


def is_dark(hex_color: str, threshold: int = 128) -> bool:
    c = hex_color.lstrip("#")
    if len(c) < 6:
        return False
    r, g, b = int(c[0:2], 16), int(c[2:4], 16), int(c[4:6], 16)
    return (0.299 * r + 0.587 * g + 0.114 * b) < threshold


def apply_publication_style(font_size: float = 14, axes_linewidth: float = 2.2, style: str = "paper") -> None:
    """figures4papers defaults: bold spines, no top/right, editable SVG text."""
    ensure_matplotlib()
    import matplotlib.pyplot as plt

    if style == "slide":
        font_size = max(font_size, 18)
        axes_linewidth = max(axes_linewidth, 2.8)
    plt.rcParams.update(
        {
            "font.family": "sans-serif",
            "font.sans-serif": ["Helvetica", "Arial", "DejaVu Sans", "Liberation Sans", "Noto Sans CJK SC", "sans-serif"],
            "svg.fonttype": "none",
            "pdf.fonttype": 42,
            "font.size": font_size,
            "axes.spines.right": False,
            "axes.spines.top": False,
            "axes.linewidth": axes_linewidth,
            "axes.labelpad": 8,
            "xtick.major.width": axes_linewidth * 0.85,
            "ytick.major.width": axes_linewidth * 0.85,
            "xtick.major.size": 5,
            "ytick.major.size": 5,
            "legend.frameon": False,
            "axes.unicode_minus": False,
            "figure.facecolor": "white",
            "axes.facecolor": "white",
            "savefig.facecolor": "white",
            "savefig.bbox": "tight",
            "savefig.pad_inches": 0.08,
        }
    )


def save_pub(fig, stem: Path, dpi: int = 300) -> tuple[Path, Path]:
    ensure_matplotlib()
    stem = Path(stem)
    stem.parent.mkdir(parents=True, exist_ok=True)
    svg = stem.with_suffix(".svg")
    png = stem.with_suffix(".png")
    fig.savefig(svg, bbox_inches="tight")
    fig.savefig(png, dpi=dpi, bbox_inches="tight")
    return png, svg


def _tighten_ylim(ax, values, pad_ratio: float = 0.12, floor_zero: bool = False):
    import numpy as np

    vals = np.asarray(values, dtype=float).ravel()
    vals = vals[np.isfinite(vals)]
    if vals.size == 0:
        return
    lo, hi = float(vals.min()), float(vals.max())
    span = max(hi - lo, 1e-6)
    pad = span * pad_ratio
    y0 = 0.0 if floor_zero and lo >= 0 else lo - pad
    y1 = hi + pad
    if floor_zero and lo >= 0:
        y0 = max(0.0, lo - pad * 0.5)
    ax.set_ylim(y0, y1)


def make_comparison_bar(
    ax,
    methods,
    values,
    colors=None,
    ylabel="Score",
    errors=None,
    annotate=True,
    hide_xticks=True,
):
    """Single-metric method comparison — CellSpliceNet / ImmunoStruct style."""
    import numpy as np

    methods = list(methods)
    values = np.asarray(values, dtype=float)
    n = len(methods)
    if colors is None:
        colors = (COMPARISON_COLORS + DEFAULT_COLORS * 3)[:n]
    err_kw = {"elinewidth": 1.6, "capthick": 1.6, "capsize": 8}
    yerr = None
    if errors is not None:
        yerr = np.asarray(errors, dtype=float)
    bars = ax.bar(
        np.arange(n),
        values,
        yerr=yerr,
        error_kw=err_kw if yerr is not None else None,
        color=colors,
        edgecolor="none",
        width=0.72,
        zorder=3,
    )
    if annotate:
        for i, (bar, val) in enumerate(zip(bars, values)):
            tc = "white" if is_dark(colors[i]) else "#1a1a1a"
            # put label inside tall bars, above short ones
            if val > (ax.get_ylim()[1] - ax.get_ylim()[0]) * 0.25 + ax.get_ylim()[0]:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bar.get_height() * 0.92,
                    f"{val:.2f}",
                    ha="center",
                    va="top",
                    fontsize=11,
                    color=tc,
                    fontweight="bold",
                    zorder=4,
                )
            else:
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bar.get_height(),
                    f"{val:.2f}",
                    ha="center",
                    va="bottom",
                    fontsize=10,
                    color="#1a1a1a",
                    zorder=4,
                )
    if hide_xticks:
        ax.set_xticks([])
    else:
        ax.set_xticks(np.arange(n))
        ax.set_xticklabels(methods, rotation=20, ha="right")
    ax.set_ylabel(ylabel, fontsize=13)
    ax.tick_params(axis="y", labelsize=11)
    _tighten_ylim(ax, values if yerr is None else np.concatenate([values - yerr, values + yerr]), floor_zero=True)
    return bars


def make_multi_metric_panel(data: dict, style: str = "paper"):
    """Wide multi-metric bars + dedicated legend panel (figures4papers Pattern 1/2)."""
    ensure_matplotlib()
    import numpy as np
    import matplotlib.pyplot as plt
    from matplotlib import gridspec

    methods = list(data.get("methods") or data.get("categories") or [])
    metrics = data.get("metrics") or {}
    if isinstance(metrics, list):
        # [{name, values, errors?}, ...]
        metric_items = [(m.get("name") or f"M{i}", m.get("values") or [], m.get("errors")) for i, m in enumerate(metrics)]
    elif isinstance(metrics, dict):
        metric_items = [(k, v if not isinstance(v, dict) else v.get("values", []), None if not isinstance(v, dict) else v.get("errors")) for k, v in metrics.items()]
    else:
        raise ValueError("multi_metric 需要 metrics 字典或列表")

    if not methods or not metric_items:
        raise ValueError("multi_metric 需要 methods 与 metrics")

    colors = data.get("colors") or (COMPARISON_COLORS + DEFAULT_COLORS * 3)[: len(methods)]
    n = len(metric_items)
    apply_publication_style(font_size=13, axes_linewidth=2.4, style=style)
    fig = plt.figure(figsize=(max(3.2 * (n + 1), 8), 3.8))
    gs = gridspec.GridSpec(1, n + 1, width_ratios=[1] * n + [0.85], wspace=0.35)
    handles = labels = None
    for i, (name, vals, errs) in enumerate(metric_items):
        ax = fig.add_subplot(gs[i])
        bars = make_comparison_bar(
            ax,
            methods,
            vals,
            colors=colors,
            ylabel=name,
            errors=errs,
            annotate=bool(data.get("annotate", True)),
            hide_xticks=True,
        )
        if i == 0:
            # proxy handles for legend
            handles = [plt.Rectangle((0, 0), 1, 1, color=c) for c in colors[: len(methods)]]
            labels = methods
    ax_leg = fig.add_subplot(gs[n])
    ax_leg.axis("off")
    if handles and labels:
        ax_leg.legend(handles, labels, loc="center", fontsize=11, frameon=False, handlelength=1.2)
    if data.get("title"):
        fig.suptitle(data["title"], fontsize=14, y=1.02)
    return fig


def make_grouped_bar(ax, categories, series, labels, ylabel="Value", colors=None, annotate=False, errors=None):
    import numpy as np

    if colors is None:
        colors = DEFAULT_COLORS
    n_groups = len(series)
    n_cats = len(categories)
    bar_width = 0.78
    w = bar_width / max(n_groups, 1)
    x = np.arange(n_cats)
    for i, (vals, label, color) in enumerate(zip(series, labels, colors)):
        offset = (i - (n_groups - 1) / 2) * w
        yerr = None
        if errors and i < len(errors) and errors[i] is not None:
            yerr = np.asarray(errors[i], dtype=float)
        bars = ax.bar(
            x + offset,
            vals,
            width=w * 0.92,
            label=label,
            color=color,
            edgecolor="none",
            yerr=yerr,
            error_kw={"elinewidth": 1.4, "capthick": 1.4, "capsize": 6},
            zorder=3,
        )
        if annotate:
            for bar, val in zip(bars, vals):
                ax.text(
                    bar.get_x() + bar.get_width() / 2,
                    bar.get_height(),
                    f"{val:.2f}",
                    ha="center",
                    va="bottom",
                    fontsize=9,
                    color="#222",
                )
    ax.set_xticks(x)
    ax.set_xticklabels(list(categories))
    ax.set_ylabel(ylabel)
    flat = [v for s in series for v in s]
    _tighten_ylim(ax, flat, floor_zero=True)
    if labels:
        ax.legend(fontsize=10, loc="upper left", bbox_to_anchor=(1.01, 1.0))
    return ax


def make_ablation_hbar(ax, labels, values, ylabel=None, xlabel="Score", color="#3775BA"):
    """Alpha-graduated horizontal ablation bars (figures4papers Pattern 5)."""
    import numpy as np

    n = len(labels)
    alphas = np.linspace(0.28, 1.0, n)
    # parse hex to rgb
    c = color.lstrip("#")
    rgb = tuple(int(c[i : i + 2], 16) / 255 for i in (0, 2, 4))
    colors = [(*rgb, a) for a in alphas]
    y = np.arange(n)
    ax.barh(y, values, color=colors, edgecolor="none", height=0.7, zorder=3)
    ax.set_yticks(y)
    ax.set_yticklabels(list(labels), fontsize=10)
    ax.set_xlabel(xlabel)
    if ylabel:
        ax.set_ylabel(ylabel)
    vals = np.asarray(values, dtype=float)
    span = max(float(vals.max() - vals.min()), 1e-6)
    ax.set_xlim(max(0.0, float(vals.min()) - span * 0.15), float(vals.max()) + span * 0.08)
    ax.invert_yaxis()
    return ax


def make_trend(ax, x, y_series, labels, colors=None, ylabel=None, xlabel=None):
    if colors is None:
        colors = DEFAULT_COLORS
    for ys, label, color in zip(y_series, labels, colors):
        ax.plot(x, ys, label=label, color=color, lw=2.4, marker="o", markersize=6, markerfacecolor="white", markeredgewidth=1.8, markeredgecolor=color)
    if ylabel:
        ax.set_ylabel(ylabel)
    if xlabel:
        ax.set_xlabel(xlabel)
    if labels:
        ax.legend(fontsize=10)
    flat = [v for s in y_series for v in s]
    _tighten_ylim(ax, flat)
    return ax


def make_heatmap(ax, matrix, row_labels=None, col_labels=None, cmap="Blues"):
    import numpy as np

    arr = np.asarray(matrix, dtype=float)
    im = ax.imshow(arr, cmap=cmap, aspect="auto")
    if col_labels:
        ax.set_xticks(range(len(col_labels)))
        ax.set_xticklabels(list(col_labels), rotation=30, ha="right")
    if row_labels:
        ax.set_yticks(range(len(row_labels)))
        ax.set_yticklabels(list(row_labels))
    for i in range(arr.shape[0]):
        for j in range(arr.shape[1]):
            ax.text(j, i, f"{arr[i, j]:.2f}", ha="center", va="center", fontsize=9, color="#111")
    for spine in ax.spines.values():
        spine.set_visible(True)
        spine.set_linewidth(1.0)
    return im


def make_radar(ax, categories, series, labels, colors=None):
    """Simple radar — VIGIL-style polar comparison."""
    import numpy as np

    if colors is None:
        colors = DEFAULT_COLORS
    cats = list(categories)
    n = len(cats)
    angles = np.linspace(0, 2 * np.pi, n, endpoint=False).tolist()
    angles += angles[:1]
    ax.set_theta_offset(np.pi / 2)
    ax.set_theta_direction(-1)
    ax.set_thetagrids(np.degrees(angles[:-1]), cats, fontsize=10)
    for vals, label, color in zip(series, labels, colors):
        v = list(vals) + [vals[0]]
        ax.plot(angles, v, color=color, lw=2.2, label=label)
        ax.fill(angles, v, color=color, alpha=0.15)
    ax.legend(loc="upper right", bbox_to_anchor=(1.35, 1.1), fontsize=9)
    return ax


def render_chart(chart_type: str, data: dict, stem: Path) -> tuple[Path, Path]:
    ensure_matplotlib()
    import matplotlib.pyplot as plt

    chart_type = (chart_type or "bar").strip().lower()
    style = data.get("style") or "paper"
    apply_publication_style(style=style)

    if chart_type in ("multi_metric", "comparison_panel"):
        fig = make_multi_metric_panel(data, style=style)
        try:
            return save_pub(fig, stem)
        finally:
            plt.close(fig)

    if chart_type == "radar":
        fig = plt.figure(figsize=(5.2, 4.6))
        ax = fig.add_subplot(111, polar=True)
        cats = data.get("categories") or []
        series = data.get("series") or data.get("y_series") or []
        labels = data.get("labels") or [f"S{i+1}" for i in range(len(series))]
        if not cats or not series:
            plt.close(fig)
            raise ValueError("radar 需要 categories 与 series")
        make_radar(ax, cats, series, labels, colors=data.get("colors"))
        if data.get("title"):
            ax.set_title(data["title"], fontsize=13, pad=16)
        try:
            return save_pub(fig, stem)
        finally:
            plt.close(fig)

    fig, ax = plt.subplots(figsize=(5.6, 3.8) if chart_type != "ablation_h" else (6.2, 4.2))

    if chart_type in ("bar", "comparison_bar"):
        methods = data.get("methods") or data.get("categories")
        vals = data.get("values")
        if isinstance(vals, dict):
            methods = list(vals.keys())
            values = list(vals.values())
        elif vals is not None:
            values = list(vals)
        else:
            series = data.get("series") or []
            values = list(series[0]) if series else []
        if not methods or not values:
            plt.close(fig)
            raise ValueError("bar/comparison_bar 需要 methods/categories + values")
        colors = data.get("colors")
        if not colors and len(methods) >= 2:
            colors = (COMPARISON_COLORS + DEFAULT_COLORS * 3)[: len(methods)]
        make_comparison_bar(
            ax,
            methods,
            values,
            colors=colors,
            ylabel=data.get("ylabel") or "Score",
            errors=data.get("errors"),
            annotate=data.get("annotate", True),
            hide_xticks=bool(data.get("hide_xticks", False)),
        )
        if not data.get("hide_xticks", False):
            pass
        else:
            # legend for methods when xticks hidden
            handles = [plt.Rectangle((0, 0), 1, 1, color=c) for c in (colors or COMPARISON_COLORS)[: len(methods)]]
            ax.legend(handles, methods, fontsize=9, loc="upper left", bbox_to_anchor=(1.01, 1.0))

    elif chart_type == "grouped_bar":
        cats = data.get("categories") or []
        series = data.get("series") or []
        labels = data.get("labels") or [f"S{i+1}" for i in range(len(series))]
        if not cats or not series:
            plt.close(fig)
            raise ValueError("grouped_bar 需要 categories 与 series")
        make_grouped_bar(
            ax,
            cats,
            series,
            labels,
            ylabel=data.get("ylabel") or "Value",
            colors=data.get("colors") or DEFAULT_COLORS,
            annotate=bool(data.get("annotate", True)),
            errors=data.get("errors"),
        )

    elif chart_type in ("ablation_h", "ablation"):
        labels = data.get("labels") or data.get("categories") or []
        values = data.get("values") or []
        if not labels or not values:
            plt.close(fig)
            raise ValueError("ablation_h 需要 labels 与 values")
        make_ablation_hbar(
            ax,
            labels,
            values,
            xlabel=data.get("xlabel") or data.get("ylabel") or "Score",
            color=data.get("color") or PALETTE["blue_secondary"],
        )

    elif chart_type == "line":
        x = data.get("x") or data.get("categories") or []
        y_series = data.get("y_series") or data.get("series") or []
        labels = data.get("labels") or [f"S{i+1}" for i in range(len(y_series))]
        if not x or not y_series:
            plt.close(fig)
            raise ValueError("line 需要 x（或 categories）与 y_series/series")
        make_trend(
            ax,
            x,
            y_series,
            labels,
            colors=data.get("colors") or DEFAULT_COLORS,
            ylabel=data.get("ylabel"),
            xlabel=data.get("xlabel"),
        )

    elif chart_type == "heatmap":
        matrix = data.get("matrix") or data.get("values")
        if matrix is None:
            plt.close(fig)
            raise ValueError("heatmap 需要 matrix（二维数组）")
        im = make_heatmap(
            ax,
            matrix,
            row_labels=data.get("row_labels"),
            col_labels=data.get("col_labels") or data.get("categories"),
            cmap=data.get("cmap") or "Blues",
        )
        fig.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    else:
        plt.close(fig)
        raise ValueError(
            f"不支持的图类型：{chart_type}（支持 comparison_bar / multi_metric / grouped_bar / "
            "ablation_h / line / heatmap / radar）"
        )

    title = (data.get("title") or "").strip()
    if title:
        ax.set_title(title, fontsize=13, pad=10)

    fig.tight_layout()
    try:
        return save_pub(fig, stem)
    finally:
        plt.close(fig)
