"""Full-document PDF reading via chunked map-reduce when needed."""

from __future__ import annotations

import json

from app.services.llm import chat_completion, paper_analysis_prompt, corpus_synthesis_prompt
from app.services.pdf_text import chunk_text, extract_pdf_text
from app.services.prompt_defaults import DEFAULT_PROMPTS, merge_prompts


# Soft per-request budget so one call usually fits common 128k-context models.
# Longer PDFs are read in multiple passes then reduced — still full coverage.
DEFAULT_CHUNK_CHARS = 56000


def _chat(
    *,
    api_key: str,
    base_url: str,
    model: str,
    messages: list[dict],
    temperature: float = 0.25,
    should_abort=None,
) -> str:
    if callable(should_abort) and should_abort():
        raise ValueError("大模型赋能已关闭（设置中可重新开启）")
    return chat_completion(
        api_key=api_key,
        base_url=base_url,
        model=model,
        messages=messages,
        temperature=temperature,
        timeout=300,
    )


def read_full_pdf(path: str) -> dict:
    """Extract entire PDF text layer (all pages, no char cap)."""
    return extract_pdf_text(path, max_pages=None, max_chars=None)


def map_reduce_paper_digest(
    *,
    paper: dict,
    note: dict,
    pdf_text: str,
    api_key: str,
    base_url: str,
    model: str,
    prompts: dict | None = None,
    extra: str = "",
    chunk_chars: int = DEFAULT_CHUNK_CHARS,
    should_abort=None,
) -> tuple[str, dict]:
    """Read the full PDF text (chunked if needed) and produce a research note."""
    p = merge_prompts(prompts)
    chunks = chunk_text(pdf_text, chunk_chars=chunk_chars)
    meta = {
        "chunks": len(chunks),
        "char_count": len(pdf_text or ""),
        "map_reduce": len(chunks) > 1,
    }
    if not chunks:
        raise ValueError("PDF 无可用正文")

    if len(chunks) == 1:
        messages = paper_analysis_prompt(
            paper, note, "digest", pdf_excerpt=chunks[0], prompts=p
        )
        if (extra or "").strip():
            messages.append({"role": "user", "content": extra.strip()})
        text = _chat(
            api_key=api_key, base_url=base_url, model=model, messages=messages, should_abort=should_abort
        )
        return text, meta

    # Map: each chunk → structured partial notes
    partials: list[str] = []
    total = len(chunks)
    for i, chunk in enumerate(chunks, 1):
        messages = [
            {
                "role": "system",
                "content": p.get("paper_system") or DEFAULT_PROMPTS["paper_system"],
            },
            {
                "role": "user",
                "content": (
                    f"文献：{paper.get('title')}（{paper.get('year')} / {paper.get('venue')}）\n"
                    f"这是全文第 {i}/{total} 段 PDF 正文（保证分段覆盖全文，勿假设未出现内容）。\n\n"
                    f"{chunk}\n\n"
                    "请用中文 Markdown 提取本段中的：研究动机/问题、方法细节、实验与数据、"
                    "结果数字、局限、可引用句（尽量带页码）。没有的信息写「本段未出现」。"
                    "不要开场白。"
                ),
            },
        ]
        partials.append(
            _chat(
                api_key=api_key,
                base_url=base_url,
                model=model,
                messages=messages,
                temperature=0.2,
                should_abort=should_abort,
            )
        )

    joined = "\n\n".join(f"### 分段笔记 {i}/{total}\n\n{t}" for i, t in enumerate(partials, 1))
    # Reduce: merge partials into the final digest template
    ask = p.get("digest") or DEFAULT_PROMPTS["digest"]
    messages = [
        {"role": "system", "content": p.get("paper_system") or DEFAULT_PROMPTS["paper_system"]},
        {
            "role": "user",
            "content": (
                f"文献信息：\n标题：{paper.get('title')}\n作者：{paper.get('authors')}\n"
                f"年份/venue：{paper.get('year')} / {paper.get('venue')}\n"
                f"摘要：{paper.get('abstract') or '（无）'}\n"
                f"标签：{', '.join(paper.get('tags') or []) or '（无）'}\n\n"
                f"已有研究笔记：\n{json.dumps(note or {}, ensure_ascii=False, indent=2)}\n\n"
                f"以下是对该 PDF **全文**分段通读后的笔记（共 {total} 段，已覆盖全部页）：\n\n"
                f"{joined}\n\n"
                f"任务：合并为最终研究笔记。\n{ask}\n"
                + (f"\n补充要求：{extra.strip()}\n" if (extra or "").strip() else "")
            ),
        },
    ]
    text = _chat(
        api_key=api_key,
        base_url=base_url,
        model=model,
        messages=messages,
        temperature=0.25,
        should_abort=should_abort,
    )
    return text, meta


def map_reduce_paper_brief(
    *,
    paper: dict,
    pdf_text: str,
    note_excerpt: str = "",
    api_key: str,
    base_url: str,
    model: str,
    prompts: dict | None = None,
    chunk_chars: int = DEFAULT_CHUNK_CHARS,
    should_abort=None,
) -> str:
    """Full-read one paper into a compact brief for corpus synthesis."""
    p = merge_prompts(prompts)
    chunks = chunk_text(pdf_text, chunk_chars=chunk_chars)
    if not chunks:
        # fall back to metadata + note
        return (
            f"标题：{paper.get('title')}\n摘要：{(paper.get('abstract') or '')[:1500]}\n"
            f"已有笔记：{(note_excerpt or '')[:1500]}\n（无 PDF 正文）"
        )

    if len(chunks) == 1:
        messages = [
            {"role": "system", "content": p.get("corpus_system") or DEFAULT_PROMPTS["corpus_system"]},
            {
                "role": "user",
                "content": (
                    f"请通读以下完整 PDF 正文，输出该文精简卡片（中文 Markdown）：\n"
                    f"## 一句话贡献\n## 问题\n## 方法要点\n## 实验/数据\n## 结论\n## 局限\n## 与综述相关的要点\n"
                    f"文献：{paper.get('title')} ({paper.get('year')})\n摘要：{paper.get('abstract') or '（无）'}\n"
                    f"已有笔记摘录：{(note_excerpt or '')[:1200]}\n\nPDF 全文：\n{chunks[0]}"
                ),
            },
        ]
        return _chat(
            api_key=api_key,
            base_url=base_url,
            model=model,
            messages=messages,
            temperature=0.2,
            should_abort=should_abort,
        )

    partials = []
    total = len(chunks)
    for i, chunk in enumerate(chunks, 1):
        messages = [
            {"role": "system", "content": p.get("corpus_system") or DEFAULT_PROMPTS["corpus_system"]},
            {
                "role": "user",
                "content": (
                    f"文献「{paper.get('title')}」全文第 {i}/{total} 段。提取本段关键贡献/方法/实验/局限，"
                    f"中文要点列表，勿编造。\n\n{chunk}"
                ),
            },
        ]
        partials.append(
            _chat(
                api_key=api_key,
                base_url=base_url,
                model=model,
                messages=messages,
                temperature=0.2,
                should_abort=should_abort,
            )
        )

    joined = "\n\n".join(f"### 段 {i}/{total}\n{t}" for i, t in enumerate(partials, 1))
    messages = [
        {"role": "system", "content": p.get("corpus_system") or DEFAULT_PROMPTS["corpus_system"]},
        {
            "role": "user",
            "content": (
                f"合并下列分段通读结果为该文精简卡片（中文 Markdown）：\n"
                f"## 一句话贡献\n## 问题\n## 方法要点\n## 实验/数据\n## 结论\n## 局限\n## 与综述相关的要点\n"
                f"文献：{paper.get('title')} ({paper.get('year')})\n摘要：{paper.get('abstract') or '（无）'}\n\n{joined}"
            ),
        },
    ]
    return _chat(
        api_key=api_key,
        base_url=base_url,
        model=model,
        messages=messages,
        temperature=0.2,
        should_abort=should_abort,
    )


def synthesize_from_briefs(
    *,
    scope: str,
    scope_name: str,
    briefs: list[dict],
    mode: str,
    extra: str,
    api_key: str,
    base_url: str,
    model: str,
    prompts: dict | None = None,
    should_abort=None,
    source_mode: str = "full",
) -> str:
    """Final corpus synthesis from per-paper full-read briefs."""
    # Reuse corpus prompt but put brief text into note_excerpt / abstract fields
    papers = []
    for b in briefs:
        papers.append(
            {
                "id": b.get("id"),
                "title": b.get("title"),
                "authors": b.get("authors"),
                "year": b.get("year"),
                "venue": b.get("venue"),
                "status": b.get("status"),
                "tags": b.get("tags") or [],
                "abstract": (b.get("abstract") or "")[:800],
                "note_excerpt": b.get("brief") or "",
                "pdf_excerpt": "",  # already fully read into brief
            }
        )
    if source_mode == "notes":
        source_notice = "\n注意：每篇「note_excerpt」来自用户已保存的文献笔记；只能依据这些笔记做综述，勿假设读取过摘要或 PDF，勿补写笔记中不存在的事实。"
    elif source_mode == "full":
        source_notice = "\n注意：每篇「note_excerpt」已是对该 PDF **全文通读**后的精简卡片，请据此做综述。"
    else:
        source_notice = "\n注意：每篇「note_excerpt」来自摘要、已有笔记和少量 PDF 抽样，并非全文通读；请明确证据边界。"
    messages = corpus_synthesis_prompt(
        scope=scope,
        scope_name=scope_name,
        papers=papers,
        mode=mode,
        extra=(extra or "") + source_notice,
        prompts=prompts,
    )
    return _chat(
        api_key=api_key,
        base_url=base_url,
        model=model,
        messages=messages,
        temperature=0.3,
        should_abort=should_abort,
    )
