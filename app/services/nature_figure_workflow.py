"""Load nature-figure skill fragments and build the figure-workflow system prompt.

When the user starts a drawing flow in the workbench, the floating agent must follow
the same routing protocol as nature-figure (contract → backend gate → stance →
backend quick-start → QA), not free-form plotting advice.
"""

from __future__ import annotations

import os
from pathlib import Path

# Prefer installed Codex skill; allow override for other machines.
_SKILL_CANDIDATES = [
    Path(os.environ.get("NATURE_FIGURE_SKILL", "")),
    Path.home() / ".codex" / "skills" / "nature-figure",
    Path.home() / ".cursor" / "skills" / "nature-figure",
]


def nature_figure_root() -> Path | None:
    for p in _SKILL_CANDIDATES:
        if p and (p / "SKILL.md").is_file():
            return p
    return None


def _read(path: Path, max_chars: int = 24_000) -> str:
    if not path.is_file():
        return ""
    text = path.read_text(encoding="utf-8", errors="replace")
    if len(text) > max_chars:
        return text[:max_chars] + "\n\n…(truncated for context budget)"
    return text


def detect_backend(text: str) -> str:
    t = (text or "").strip().lower()
    if not t:
        return ""
    # explicit answers
    if t in ("python", "py", "matplotlib", "seaborn"):
        return "python"
    if t in ("r", "ggplot", "ggplot2"):
        return "r"
    # soft detect in longer messages
    if "python" in t or "matplotlib" in t or "seaborn" in t:
        return "python"
    if ("ggplot" in t) or t.startswith("r ") or t.endswith(" r") or t == "用r" or "用 r" in t:
        return "r"
    if "用python" in t or "用 python" in t:
        return "python"
    return ""


def build_figure_system_prompt(*, backend: str = "", include_api_palette: bool = True) -> str:
    """Assemble nature-figure workflow instructions for the LLM."""
    root = nature_figure_root()
    backend = (backend or "").strip().lower()
    if backend not in ("python", "r", ""):
        backend = ""

    parts: list[str] = [
        "你正在执行科研工作台的【nature-figure 画图流程】。必须严格按下列协议，不要凭记忆瞎画。",
        "",
        "## 路由协议（每次画图都要遵守）",
        "1. 若用户尚未明确选择后端：只问一句「Python or R?」，然后停止；不要生成假数据、不要写脚本。",
        "2. 后端一旦选定则独占：全部绘图/预览/导出/视觉 QA 只用该语言，禁止跨语言临时出图。",
        "3. 写代码前先完成 figure contract：核心结论一句、证据链/面板、archetype、导出规格。",
        "4. 应用 stance：hero 主面板、克制配色、白底（显微板除外）、能直接标注就不堆图例、统计与 n 属于图的一部分。",
        "5. 交付前按 QA 自检：字号可读、可编辑 SVG/PDF 文字、无彩虹色图、灰度可辨等。",
        "6. 若用户附带了 figures4papers 参考代码：复用其布局/配色/标注习惯，替换为用户数据；保留投稿导出习惯。",
        "回答用中文；给出可直接复制的完整脚本与简短使用说明。",
    ]

    if not root:
        parts.append("")
        parts.append("（警告：本机未找到 nature-figure skill 目录，仅按上述协议摘要执行。）")
        return "\n".join(parts)

    contract = _read(root / "static" / "core" / "contract.md")
    stance = _read(root / "static" / "core" / "stance.md")
    if contract:
        parts.extend(["", "## core/contract.md", contract])
    if stance:
        parts.extend(["", "## core/stance.md", stance])

    if not backend:
        parts.extend(
            [
                "",
                "## 当前状态：后端未选定",
                "你的下一则回复只能是：请用户选择 **Python** 或 **R**（一句即可）。不要写代码。",
            ]
        )
        return "\n".join(parts)

    frag = root / "static" / "fragments" / "backend" / ("python.md" if backend == "python" else "r.md")
    frag_text = _read(frag)
    if frag_text:
        parts.extend(["", f"## 已选定后端：{backend}", frag_text])

    if include_api_palette and backend == "python":
        api = _read(root / "references" / "api.md", max_chars=12_000)
        if api:
            parts.extend(["", "## references/api.md（配色与 helpers，按需使用）", api])

    qa = _read(root / "references" / "qa-contract.md", max_chars=8_000)
    if qa:
        parts.extend(["", "## references/qa-contract.md（交付前自检）", qa])

    parts.extend(
        [
            "",
            f"## 当前状态：后端已选定为 {backend}",
            "可以推进 contract → 写脚本 → 说明如何运行与导出。若信息不足，先补全结论/数据再画。",
        ]
    )
    return "\n".join(parts)


def figure_kickoff_user_message(*, backend: str = "", pack_prompt: str = "") -> str:
    be = (backend or "").strip().lower()
    lines = [
        "【启动 nature-figure 画图流程】",
        "请按 skill 协议执行。",
    ]
    if be in ("python", "r"):
        lines.append(f"我已选择后端：{be}")
    else:
        lines.append("我尚未选择后端。")
    if pack_prompt.strip():
        lines.extend(["", "【参考图 / 代码包 / 数据说明】", pack_prompt.strip()])
    else:
        lines.extend(
            [
                "",
                "请先完成后端门禁与 figure contract；我会补充结论、面板意图与数据（或文件路径）。",
            ]
        )
    return "\n".join(lines)
