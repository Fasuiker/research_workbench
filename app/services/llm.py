from __future__ import annotations

import json
import urllib.error
import urllib.request

from app.services.prompt_defaults import DEFAULT_PROMPTS, merge_prompts


def chat_completion(
    *,
    api_key: str,
    base_url: str,
    model: str,
    messages: list[dict],
    temperature: float = 0.3,
    timeout: int = 180,
) -> str:
    if not api_key:
        raise ValueError("未配置大模型 API Key（SK），请到设置中填写")
    base = (base_url or "https://api.openai.com/v1").rstrip("/")
    url = f"{base}/chat/completions"
    payload = {
        "model": model or "gpt-4o-mini",
        "messages": messages,
        "temperature": temperature,
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}",
        },
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=max(60, int(timeout or 180))) as resp:
            data = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        raise RuntimeError(f"LLM HTTP {e.code}: {body[:500]}") from e
    except Exception as e:
        raise RuntimeError(f"LLM 请求失败: {e}") from e
    try:
        return data["choices"][0]["message"]["content"]
    except Exception as e:
        raise RuntimeError(f"LLM 返回格式异常: {data}") from e


def _prompts(overrides: dict | None) -> dict[str, str]:
    return merge_prompts(overrides)


def paper_analysis_prompt(
    paper: dict,
    note: dict,
    mode: str,
    pdf_excerpt: str = "",
    prompts: dict | None = None,
) -> list[dict]:
    p = _prompts(prompts)
    mode_key = mode if mode in ("summary", "critique", "relate", "notes", "digest") else "summary"
    ask = p.get(mode_key) or DEFAULT_PROMPTS.get(mode_key) or DEFAULT_PROMPTS["summary"]
    excerpt = (pdf_excerpt or "").strip()
    excerpt_block = ""
    if excerpt:
        excerpt_block = f"\n\nPDF 正文摘录（可能截断）：\n{excerpt}\n"
    elif mode_key == "digest":
        excerpt_block = "\n\n（警告：未能提取到 PDF 正文，请仅依据元数据尽力完成，并在笔记中注明依据不足。）\n"
    user = f"""文献信息：
标题：{paper.get('title')}
作者：{paper.get('authors')}
年份/venue：{paper.get('year')} / {paper.get('venue')}
摘要：{paper.get('abstract') or '（无）'}
标签：{', '.join(paper.get('tags') or []) or '（无）'}

已有研究笔记：
{json.dumps(note or {}, ensure_ascii=False, indent=2)}
{excerpt_block}
任务：
{ask}
"""
    return [
        {"role": "system", "content": p["paper_system"]},
        {"role": "user", "content": user},
    ]


def corpus_synthesis_prompt(
    *,
    scope: str,
    scope_name: str,
    papers: list[dict],
    mode: str = "survey",
    extra: str = "",
    prompts: dict | None = None,
) -> list[dict]:
    p = _prompts(prompts)
    mode_key = {
        "survey": "corpus_survey",
        "gaps": "corpus_gaps",
        "reading": "corpus_reading",
    }.get(mode, "corpus_survey")
    ask = p.get(mode_key) or DEFAULT_PROMPTS[mode_key]
    compact = []
    for i, paper in enumerate(papers, 1):
        note = (paper.get("note_excerpt") or "").strip()
        excerpt = (paper.get("pdf_excerpt") or "").strip()
        compact.append(
            {
                "n": i,
                "id": paper.get("id"),
                "title": paper.get("title"),
                "authors": (paper.get("authors") or "")[:160],
                "year": paper.get("year"),
                "venue": paper.get("venue"),
                "status": paper.get("status"),
                "tags": paper.get("tags") or [],
                "abstract": (paper.get("abstract") or "")[:1200],
                "note_excerpt": note[:1800] if note else "",
                "pdf_excerpt": excerpt[:2500] if excerpt else "",
            }
        )
    scope_label = "类别" if scope == "tag" else "研究方向/维度"
    user = f"""综述对象：{scope_label}「{scope_name}」
文献数量：{len(compact)}

文献列表（JSON）：
{json.dumps(compact, ensure_ascii=False, indent=2)}

任务：
{ask}
"""
    if (extra or "").strip():
        user += f"\n补充要求：{extra.strip()}\n"
    return [
        {"role": "system", "content": p["corpus_system"]},
        {"role": "user", "content": user},
    ]
