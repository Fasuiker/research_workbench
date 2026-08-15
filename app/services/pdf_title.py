"""Extract article titles from local PDFs (metadata + first-page text + DOI).

No OCR: scanned / image-only title blocks fall back to DOI lookup or stored title.
"""

from __future__ import annotations

import re
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path

from app.services.files import normalize_path, title_from_filename

_SKIP_LINE = re.compile(
    r"""(?ix)^(?:
        abstract|keywords?|introduction|references?|acknowledgements?|
        contents?|table\s+of\s+contents|figure|fig\.|doi:|
        original\s+paper|research\s+article|article|review|letter|
        open\s+access|received|accepted|published|advance\s+access|
        corresponding\s+author|correspondence|©|copyright|
        page\s+\d+|vol\.?\s*\d+|volume\s+\d+|supplementary|
        extended\s+abstract|motivation|method|results?|conclusion|
        autodesk\s+research|google\s+research
    )\b"""
)
_DOI_RE = re.compile(r"\b10\.\d{4,9}/[-._;()/:A-Z0-9]+\b", re.I)
_URL_RE = re.compile(r"https?://|www\.", re.I)
_EMAIL_RE = re.compile(r"\S+@\S+")
_AFFIL_RE = re.compile(
    r"(?i)\b(university|department|institute|school of|laboratory|college|faculty|republic of|china|korea|usa|uk)\b"
)
_AUTHORISH = re.compile(
    r"^[A-Z][a-zA-Z\-']+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-zA-Z\-']+){0,3}"
    r"(?:\s*[,，]\s*[A-Z][a-zA-Z\-']+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-zA-Z\-']+){0,3})*"
    r"(?:\s+(?:and|&)\s+[A-Z][a-zA-Z\-']+.*)?$"
)
_AUTHOR_LINE = re.compile(
    r"""(?x)
    (?:
      ^[\u4e00-\u9fff]{2,4}(?:\s*[，,]\s*[\u4e00-\u9fff*]{1,5})+\s*$   # 中文作者表
      |
      \bMember,\s*IEEE\b
    )
    """
)


_TRAILING_AUTHORS = re.compile(
    r"""(?x)
    \s+
    (?:
      (?:[A-Z][a-zA-Z\-']+(?:\s+[A-Z]\.)?(?:\s+[A-Z][a-zA-Z\-']+)?)
      (?:\s+(?:and|,|&)\s+)?
    ){2,}
    \s*$
    """
)


def _is_author_line(line: str) -> bool:
    s = _norm_title(line)
    if not s or len(s) > 220:
        return False
    # short affiliation-only lines
    if re.fullmatch(r"(?i)(autodesk research|google research|meta ai|microsoft research|openai)", s):
        return True
    if _AFFIL_RE.search(s) and len(s) < 160 and not re.search(r":|：", s):
        return True
    if _EMAIL_RE.search(s):
        return True
    # Name1,2* / Name† style
    if re.search(r"[A-Za-z\u4e00-\u9fff]\d{1,2}(?:\s*[,，]\s*\d{1,2})*\s*[\*†‡∗]?", s):
        if re.search(r"[A-Z][a-z]+|[\u4e00-\u9fff]{2,}", s) and len(s) < 180:
            return True
    if "‡" in s or "†" in s or "∗" in s:
        caps = re.findall(r"\b[A-Z][a-zA-Z\-']+\b", s)
        if len(caps) >= 4 and ":" not in s:
            return True
    # space-separated author list without commas: ≥5 Capitalized tokens, no colon
    if ":" not in s and "：" not in s and "," not in s and "，" not in s:
        caps = re.findall(r"\b[A-Z][a-zA-Z\-']+\b", s)
        small = re.findall(r"\b[a-z]{3,}\b", s)
        if len(caps) >= 5 and len(small) <= 1 and len(s) < 160:
            return True
    if _AUTHOR_LINE.search(s):
        return True
    # comma-separated personal names without title-like colon
    if ("," in s or "，" in s or " and " in s.lower()) and _AUTHORISH.match(s) and ":" not in s and "：" not in s:
        return True
    return False


def _strip_trailing_authors(title: str) -> str:
    s = _norm_title(title)
    # Chinese: cut before author/affiliation block
    m_cn = re.search(r"^(.*[\u4e00-\u9fffA-Za-z0-9])\s+([\u4e00-\u9fff]{2,4}\s*[，,].*)$", s)
    if m_cn and re.search(r"(大学|学院|研究所|\()", m_cn.group(2)):
        head = m_cn.group(1).strip()
        if _looks_like_title(head):
            return head
    m_cn2 = re.search(r"^(.*?)[\u4e00-\u9fff]{2,4}\s*[，,]\s*[\u4e00-\u9fff]{2,4}", s)
    if m_cn2 and re.search(r"[\u4e00-\u9fff]{6,}", m_cn2.group(1)):
        head = m_cn2.group(1).strip()
        if _looks_like_title(head) and re.search(r"(方法|模型|生成|识别|网络)", head):
            return head
    # Find a run of First Last (First Last)+ at the end
    m = re.search(
        r"^(.*?)(?:\s+((?:[A-Z][a-zA-Z\-']+)(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-zA-Z\-']+)"
        r"(?:\s+[A-Z][a-zA-Z\-']+(?:\s+[A-Z]\.?)?(?:\s+[A-Z][a-zA-Z\-']+))*))\s*$",
        s,
    )
    if m:
        head, tail = m.group(1).strip(), m.group(2).strip()
        # require at least 2 people worth of tokens in tail
        if len(tail.split()) >= 4 and head and _looks_like_title(head) and ":" in head:
            return head
        if len(tail.split()) >= 4 and head and _looks_like_title(head) and len(head) >= 24:
            return head
    m2 = _TRAILING_AUTHORS.search(s)
    if m2 and m2.start() > 20:
        head = s[: m2.start()].strip()
        if _looks_like_title(head):
            return head
    return s


def _is_bio_or_noise(line: str) -> bool:
    s = _norm_title(line)
    if re.search(r"(主要研究方向|硕士研究|博士生导师|通信作者|收稿日期|基金项目|男,|女,)", s):
        return True
    if re.search(r"(?i)\b(extended abstract|building blocks for|in this project)\b", s):
        return True
    # mid-sentence leftovers
    if re.match(r"(?i)^(for|with|from|and|or|to|by|using|via)\b", s):
        return True
    if re.search(r"^\dD\s+data\b", s, re.I):
        return True
    return False


def _is_journal_header(line: str) -> bool:
    s = _norm_title(line)
    if not s:
        return True
    if re.search(r"(?i)\b(vol\.?|volume|no\.?|pp\.?|pages?)\b", s) and len(s) < 120:
        return True
    if re.search(r"第\s*\d*\*?卷|学报|journal\s+of|transactions\s+on|ieee\s+trans", s, re.I):
        return True
    if re.search(r"\d{4}\s*,\s*\d+|DOI:\s*10\.", s, re.I):
        return True
    if s.count("*") >= 3:
        return True
    return False


def _clean_ws(s: str) -> str:
    s = (s or "").replace("\u00ad", "").replace("ﬁ", "fi").replace("ﬂ", "fl")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\s*\n\s*", "\n", s)
    return s.strip()


def _norm_title(s: str) -> str:
    s = _clean_ws(s)
    s = re.sub(r"\s+", " ", s)
    s = s.strip(" \t.,;:|-–—")
    return s


def _looks_like_title(s: str) -> bool:
    s = _norm_title(s)
    if len(s) < 8 or len(s) > 300:
        return False
    if _SKIP_LINE.match(s):
        return False
    if _URL_RE.search(s) or _EMAIL_RE.search(s):
        return False
    if _DOI_RE.search(s) and len(s) < 60:
        return False
    # body continuations / mid-paragraph scrapes
    if s[:1].islower():
        return False
    if re.match(
        r"(?i)^(however|therefore|moreover|furthermore|these|this|that|thus|also|in recent|in this|we propose|our|learning to|by training)\b",
        s,
    ):
        return False
    if _is_journal_header(s):
        return False
    if _is_bio_or_noise(s):
        return False
    words = re.findall(r"[A-Za-z\u4e00-\u9fff]{2,}", s)
    if len(words) < 2 and not re.search(r"[\u4e00-\u9fff]{4,}", s):
        return False
    # mostly digits / page junk
    if sum(c.isdigit() for c in s) > len(s) * 0.45:
        return False
    return True


def _title_quality_ok(title: str, source: str) -> bool:
    t = _norm_title(title)
    if not _looks_like_title(t):
        return False
    if source == "page":
        # Prefer concise article titles; long prose is usually body text
        if len(t) > 220:
            return False
        if t.count(".") >= 1 and len(t) > 80:
            return False
        if re.search(r"\b(however|significant|methods? introduces|for the|we sample|open cascade)\b", t, re.I):
            return False
        if re.search(r"\(\d{4}\)", t) and len(t) > 60:
            return False
    return True


def _meta_title(reader) -> str:
    meta = getattr(reader, "metadata", None) or {}
    raw = ""
    for key in ("/Title", "Title", "title"):
        try:
            if hasattr(meta, "get"):
                raw = meta.get(key) or raw
            else:
                raw = getattr(meta, key.lstrip("/").lower(), None) or raw
        except Exception:
            pass
    if hasattr(meta, "title") and meta.title:
        raw = meta.title or raw
    title = _norm_title(str(raw or ""))
    if not _looks_like_title(title):
        return ""
    # discard filename-like metadata
    low = title.lower()
    if low.endswith(".pdf") or re.fullmatch(r"[\w.\-]+\.pdf", low):
        return ""
    return title


def _meta_doi(reader) -> str:
    meta = getattr(reader, "metadata", None) or {}
    candidates: list[str] = []
    try:
        if hasattr(meta, "get"):
            for k in meta.keys() if hasattr(meta, "keys") else []:
                v = meta.get(k)
                if v:
                    candidates.append(str(v))
        for attr in ("doi",):
            v = getattr(meta, attr, None)
            if v:
                candidates.append(str(v))
    except Exception:
        pass
    blob = " ".join(candidates)
    m = _DOI_RE.search(blob)
    return m.group(0).rstrip(").,;") if m else ""


def _first_page_text(reader, max_pages: int = 1) -> str:
    chunks: list[str] = []
    n = min(len(reader.pages), max(1, max_pages))
    for i in range(n):
        try:
            raw = reader.pages[i].extract_text() or ""
        except Exception:
            raw = ""
        if raw.strip():
            chunks.append(raw)
    return _clean_ws("\n".join(chunks))


def _doi_from_text(text: str) -> str:
    m = _DOI_RE.search(text or "")
    return m.group(0).rstrip(").,;") if m else ""


def _title_from_page_text(text: str) -> str:
    if not text:
        return ""
    lines = [ln.strip() for ln in text.splitlines() if ln.strip()]
    # Cut before Abstract / Introduction body
    cut = len(lines)
    for i, ln in enumerate(lines):
        if re.match(
            r"(?i)^(abstract|keywords?|1[\.\s]|1\s+introduction|摘\s*要|关键\s*键\s*词)\b",
            ln,
        ) or re.match(r"^摘\s*要", ln):
            cut = i
            break
    head = lines[: min(cut, 28)]

    best = ""
    best_score = -1e9
    i = 0
    while i < len(head):
        ln = head[i]
        if (
            _SKIP_LINE.match(ln)
            or _DOI_RE.fullmatch(ln.strip())
            or _URL_RE.search(ln)
            or _is_author_line(ln)
            or _is_journal_header(ln)
            or _is_bio_or_noise(ln)
        ):
            i += 1
            continue
        block = [ln]
        j = i + 1
        while j < len(head) and j <= i + 2:
            nxt = head[j]
            if (
                _SKIP_LINE.match(nxt)
                or _is_author_line(nxt)
                or _AUTHORISH.match(nxt)
                or _AFFIL_RE.search(nxt)
            ):
                break
            if len(nxt) > 120:
                break
            if len(block[-1]) < 90 and (
                nxt[:1].islower()
                or nxt.endswith("*")
                or (len(nxt) < 70 and not _is_author_line(nxt))
            ):
                block.append(nxt.rstrip("*").strip())
                j += 1
                continue
            break
        candidate = _strip_trailing_authors(_norm_title(" ".join(block)))
        if _is_author_line(candidate):
            i = max(j, i + 1)
            continue
        sc = _score_line(candidate, i)
        if sc > best_score:
            best_score = sc
            best = candidate
        i = max(j, i + 1)

    if best_score < 0:
        return ""
    return best


def _score_line(line: str, idx: int) -> float:
    s = _norm_title(line)
    if not _looks_like_title(s):
        return -1e9
    if _is_author_line(s):
        return -1e9
    score = 0.0
    score += max(0, 18 - idx) * 1.2
    score += min(len(s), 120) * 0.08
    if ":" in s or "—" in s or "–" in s or "：" in s:
        score += 2
    if re.search(r"[A-Za-z]", s) and re.search(r"[a-z]", s):
        score += 3
    if re.search(r"[\u4e00-\u9fff]{6,}", s):
        score += 6
        if re.search(r"(方法|模型|生成|识别|网络|算法)", s):
            score += 8
    if _is_bio_or_noise(s):
        return -1e9
    if s.isupper() and len(s) > 40:
        score -= 4
    if _AFFIL_RE.search(s):
        score -= 12
    if _is_author_line(s):
        score -= 20
    return score

def resolve_doi_title(doi: str, *, timeout: float = 6.0) -> str:
    doi = (doi or "").strip().rstrip(").,;")
    if not doi:
        return ""
    url = "https://api.crossref.org/works/" + urllib.parse.quote(doi)
    req = urllib.request.Request(
        url,
        headers={"User-Agent": "research-workbench/1.0 (mailto:local@localhost)", "Accept": "application/json"},
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            import json

            data = json.loads(resp.read().decode("utf-8", errors="replace"))
        title_list = (data.get("message") or {}).get("title") or []
        if title_list:
            return _norm_title(str(title_list[0]))
    except (urllib.error.URLError, urllib.error.HTTPError, TimeoutError, ValueError, KeyError):
        return ""
    return ""


def extract_article_title(path: str, *, use_doi: bool = True) -> dict:
    """Return article title guess for a local PDF.

    Keys: title, source (metadata|page|doi|filename|empty), doi, path, error
    """
    native = normalize_path(path)
    p = Path(native)
    out = {
        "title": "",
        "source": "empty",
        "doi": "",
        "path": str(p),
        "error": "",
        "has_text": False,
    }
    if not p.is_file():
        out["error"] = "PDF 不存在"
        out["title"] = title_from_filename(str(p))
        out["source"] = "filename"
        return out

    try:
        from pypdf import PdfReader
    except ImportError as e:
        out["error"] = f"缺少 pypdf: {e}"
        out["title"] = title_from_filename(str(p))
        out["source"] = "filename"
        return out

    try:
        reader = PdfReader(str(p))
    except Exception as e:
        out["error"] = f"无法打开 PDF: {e}"
        out["title"] = title_from_filename(str(p))
        out["source"] = "filename"
        return out

    doi = _meta_doi(reader)
    meta = _meta_title(reader)
    if meta:
        out["title"] = meta
        out["source"] = "metadata"
        out["doi"] = doi
        return out

    text = _first_page_text(reader, max_pages=1)
    out["has_text"] = bool(text.strip())
    if not doi:
        doi = _doi_from_text(text)
    out["doi"] = doi

    page_title = _title_from_page_text(text)
    if page_title and _title_quality_ok(page_title, "page"):
        out["title"] = page_title
        out["source"] = "page"
        return out

    if use_doi and doi:
        resolved = resolve_doi_title(doi)
        if resolved and _title_quality_ok(resolved, "doi"):
            out["title"] = resolved
            out["source"] = "doi"
            return out

    # Keep weak page guess only if clearly better than filename
    fn = title_from_filename(str(p))
    if page_title and _looks_like_title(page_title):
        # Prefer filename when it looks like a real article name
        fn_ok = bool(re.search(r"[\u4e00-\u9fff]{4,}", fn) or (" " in fn and len(fn) >= 12))
        weak = (
            len(page_title) > 160
            or _is_bio_or_noise(page_title)
            or _is_journal_header(page_title)
            or page_title.count(".") >= 1
            or re.search(r"(?i)\b(for the|we sample|open cascade)\b", page_title)
        )
        if fn_ok and weak:
            out["title"] = fn
            out["source"] = "filename"
            out["error"] = "首页未可靠识别，使用文件名"
            return out
        out["title"] = page_title
        out["source"] = "page"
        out["error"] = "首页标题置信度偏低"
        return out

    out["title"] = fn
    out["source"] = "filename"
    if not out["has_text"]:
        out["error"] = (
            "无文字层（扫描件需 OCR；已尝试 DOI，未取到标题）"
            if doi
            else "无文字层；无 DOI 可解析"
        )
    else:
        out["error"] = "首页未识别到标题"
    return out
