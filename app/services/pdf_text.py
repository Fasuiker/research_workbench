"""Full-PDF text extraction with optional soft limits."""

from __future__ import annotations

from pathlib import Path

from app.services.files import normalize_path


def extract_pdf_text(
    path: str,
    *,
    max_pages: int | None = None,
    max_chars: int | None = None,
) -> dict:
    """Extract plain text from a local PDF.

    ``max_pages`` / ``max_chars`` of ``None`` or ``<= 0`` means no limit
    (read the whole document). Soft limits are only for sampling callers.
    """
    try:
        from pypdf import PdfReader
    except ImportError as e:
        raise RuntimeError("缺少 pypdf，请执行 pip install pypdf") from e

    native = normalize_path(path)
    p = Path(native)
    if not p.is_file():
        raise FileNotFoundError(f"PDF 不存在: {path}")

    reader = PdfReader(str(p))
    page_count = len(reader.pages)
    if max_pages is None or int(max_pages) <= 0:
        limit = page_count
    else:
        limit = min(page_count, max(1, int(max_pages)))

    char_cap = None if (max_chars is None or int(max_chars) <= 0) else int(max_chars)

    chunks: list[str] = []
    total = 0
    pages_read = 0
    truncated = False

    for i in range(limit):
        try:
            raw = reader.pages[i].extract_text() or ""
        except Exception:
            raw = ""
        raw = raw.strip()
        piece = f"\n\n--- Page {i + 1} ---\n{raw}" if raw else f"\n\n--- Page {i + 1} ---\n"
        if char_cap is not None and total + len(piece) > char_cap:
            remain = char_cap - total
            if remain > 200:
                chunks.append(piece[:remain])
                total += remain
            truncated = True
            break
        chunks.append(piece)
        total += len(piece)
        pages_read += 1

    if page_count > pages_read:
        truncated = True

    text = "".join(chunks).strip()
    return {
        "text": text,
        "pages_read": pages_read,
        "page_count": page_count,
        "truncated": truncated,
        "char_count": len(text),
        "path": str(p),
    }


def chunk_text(text: str, *, chunk_chars: int = 56000, overlap: int = 800) -> list[str]:
    """Split long PDF text into overlapping chunks for map-reduce LLM reads."""
    text = (text or "").strip()
    if not text:
        return []
    size = max(4000, int(chunk_chars))
    ov = max(0, min(int(overlap), size // 4))
    if len(text) <= size:
        return [text]
    parts: list[str] = []
    start = 0
    n = len(text)
    while start < n:
        end = min(n, start + size)
        # Prefer cutting at a page marker near the end
        window = text[start:end]
        if end < n:
            cut = window.rfind("\n--- Page ")
            if cut > size * 0.55:
                end = start + cut
                window = text[start:end]
        parts.append(window.strip())
        if end >= n:
            break
        start = max(end - ov, start + 1)
    return [p for p in parts if p]
