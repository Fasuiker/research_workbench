"""Default LLM prompts for literature AI features.

Stored overrides live in settings key ``llm_prompts`` (JSON object).
Empty / missing keys fall back to these defaults.
"""

from __future__ import annotations

import json
from copy import deepcopy

# Keys exposed in Settings → AI 提示词
PROMPT_KEYS = (
    "paper_system",
    "digest",
    "summary",
    "critique",
    "relate",
    "notes",
    "corpus_system",
    "corpus_survey",
    "corpus_gaps",
    "corpus_reading",
)

PROMPT_LABELS = {
    "paper_system": "单篇 · 系统角色",
    "digest": "单篇 · 通读成笔记",
    "summary": "单篇 · 一页摘要",
    "critique": "单篇 · 批判审稿",
    "relate": "单篇 · 关联课题",
    "notes": "单篇 · 补全笔记",
    "corpus_system": "整类/方向 · 系统角色",
    "corpus_survey": "整类/方向 · 综述笔记",
    "corpus_gaps": "整类/方向 · 空白与可做点",
    "corpus_reading": "整类/方向 · 精读路线",
}

DEFAULT_PROMPTS: dict[str, str] = {
    "paper_system": """你是顶尖 AI / 计算机方向博士生的科研精读助手。
输出使用简洁中文 Markdown，结构清晰，避免空话与客套开场。
优先关注：问题定义、方法贡献与关键技术点、实验设定与指标、消融/对比是否充分、局限、与用户课题的可连接点。
不确定时写「文中未明确」，不要编造数字、数据集规模或未出现的结论。""",
    "digest": """你已获得该 PDF 的正文摘录（可能截断）。请通读后输出一份可直接作为「研究笔记」的 Markdown。

必须包含以下二级标题（没有信息写「暂无 / 文中未明确」）：
## 研究动机
## 问题定义
## 方法
## 数据集
## 指标
## 结果
## 局限
## 与我课题关系
## 可引用句
## 下一步

要求：
1. 用中文、具体、可执行；方法段写清关键模块 / 损失 / 训练策略，避免只复述摘要。
2. 「可引用句」尽量贴近原文表述，并标注页码（若摘录中有 Page 标记）。
3. 「下一步」给出 2–4 条可立刻做的阅读或实验动作。
4. 不要输出开场白、结尾客套或与上述标题无关的内容。""",
    "summary": """请做一页纸精读摘要，使用中文 Markdown，建议结构：
## 一句话贡献
## 动机与问题
## 方法要点
## 实验与结论
## 局限
## 可引用点（2–3 条）
控制在一屏可读长度，突出可复用信息。""",
    "critique": """请做批判性审稿式分析（中文 Markdown）：
## 优点
## 漏洞与质疑（问题定义 / 基线 / 消融 / 可复现）
## 实验是否支撑结论
## 改进实验建议（可执行）
## 对我是否值得精读（是/否 + 理由）
语气直接，避免客套。""",
    "relate": """假设用户正在做 AI 算法 / 系统科研。请结合该文献给出：
## 与常见课题方向的关联
## 可复现 / 可扩展点
## 可迁移到我课题的技术点
## 下一步阅读或实验建议（3 条以内）
用中文 Markdown，尽量具体到模块或实验设计。""",
    "notes": """根据已有研究笔记查缺补漏。输出可直接粘贴进笔记的补充要点（中文 Markdown）。
优先补：问题定义、方法关键细节、实验设定、局限、与课题关系、下一步。
已有内容充分则简短说明「已覆盖」，不要重复粘贴原文。""",
    "corpus_system": """你是顶尖 AI / 计算机方向博士生的文献调研助手。
用户会提供一批已入库、已分类的文献（含标题、摘要、标签，以及可能的笔记/PDF 摘录）。
请做可执行的中文综述笔记：具体、可对照篇名、避免空话；不要编造论文中未出现的实验数字或结论。
若信息不足，明确写出依据不足，而不是脑补。""",
    "corpus_survey": """请写一份「分类 / 方向综述笔记」Markdown，必须包含：

## 范围与文献覆盖
## 问题谱系（这批文献在解决什么）
## 方法脉络（流派 / 技术路线对比）
## 代表工作速览（按篇：一句话贡献 + 局限）
## 共识与分歧
## 空白与可做点（面向我的课题）
## 建议阅读顺序
## 下一步行动（3–5 条可执行）

要求：
1. 代表工作须点名论文标题；方法对比优先用表格或清晰列表。
2. 「空白与可做点」要能落到实验/方法设计，而不是空泛趋势。
3. 不要开场白与客套结尾。""",
    "corpus_gaps": """聚焦空白与可做点，用中文 Markdown 输出：

## 尚未充分解决的问题
## 方法短板与可复现风险
## 课题 / 实验候选（恰好 5 条）
每条候选须含：动机、切入点、所需基线或对比、预期风险。
依据必须能对应到列表中的具体文献标题；不足处标明。""",
    "corpus_reading": """为这批文献规划精读路线，用中文 Markdown 输出：

## 阅读顺序（带依赖关系说明）
## 分篇建议（每篇：略读 / 精读 / 批判 + 理由）
## 读完应留下的笔记问题（清单）
## 本周可执行计划（若时间有限，标出最小必读集）

点名论文标题；顺序要体现概念依赖（先基础后进阶）。""",
}


def default_prompts() -> dict[str, str]:
    return deepcopy(DEFAULT_PROMPTS)


def merge_prompts(stored: dict | str | None) -> dict[str, str]:
    """Merge user overrides onto defaults. Blank strings keep default."""
    out = default_prompts()
    data = stored
    if isinstance(stored, str):
        raw = stored.strip()
        if not raw:
            return out
        try:
            data = json.loads(raw)
        except Exception:
            return out
    if not isinstance(data, dict):
        return out
    for key in PROMPT_KEYS:
        val = data.get(key)
        if isinstance(val, str) and val.strip():
            out[key] = val.strip()
    return out


def prompts_to_json(prompts: dict[str, str]) -> str:
    clean = {k: (prompts.get(k) or DEFAULT_PROMPTS[k]).strip() for k in PROMPT_KEYS}
    return json.dumps(clean, ensure_ascii=False, indent=2)


def prompt_meta() -> list[dict[str, str]]:
    return [{"key": k, "label": PROMPT_LABELS[k]} for k in PROMPT_KEYS]
