from __future__ import annotations

from pathlib import Path

from app.models import Paper, PaperNote, ReadingSession, Meeting
from app.schemas import PaperOut, PaperNoteOut, ReadingSessionOut, MeetingOut, MeetingActionOut


def paper_to_out(p: Paper) -> PaperOut:
    tags = [link.tag.name for link in p.tag_links if link.tag]
    project_ids = [link.project_id for link in (getattr(p, "project_links", None) or [])]
    if not project_ids and p.project_id:
        project_ids = [p.project_id]
    exists = bool(p.local_path and Path(p.local_path).is_file())
    return PaperOut(
        id=p.id,
        title=p.title,
        authors=p.authors,
        year=p.year,
        venue=p.venue,
        doi=p.doi,
        paper_type=p.paper_type,
        local_path=p.local_path,
        file_size=p.file_size,
        file_mtime=p.file_mtime,
        file_hash=p.file_hash,
        status=p.status,
        relevance=p.relevance,
        folder=p.folder,
        abstract=p.abstract,
        bibtex=p.bibtex,
        project_id=project_ids[0] if project_ids else p.project_id,
        project_ids=project_ids,
        reading_progress_page=p.reading_progress_page,
        reading_seconds=p.reading_seconds,
        reading_depth=getattr(p, "reading_depth", None) or "skim",
        next_review_at=getattr(p, "next_review_at", None),
        xp=getattr(p, "xp", 0) or 0,
        starred=bool(getattr(p, "starred", False)),
        created_at=p.created_at,
        updated_at=p.updated_at,
        tags=tags,
        file_exists=exists,
    )


def note_to_out(n: PaperNote) -> PaperNoteOut:
    return PaperNoteOut.model_validate(n)


def session_to_out(s: ReadingSession) -> ReadingSessionOut:
    return ReadingSessionOut(
        id=s.id,
        title=s.title,
        theme_tags=s.theme_tags,
        summary=s.summary,
        status=s.status,
        created_at=s.created_at,
        paper_ids=[x.paper_id for x in s.papers],
    )


def meeting_to_out(m: Meeting) -> MeetingOut:
    return MeetingOut(
        id=m.id,
        title=m.title,
        meeting_type=m.meeting_type,
        start_at=m.start_at,
        end_at=m.end_at,
        project_id=m.project_id,
        agenda=m.agenda,
        notes=m.notes,
        decisions=m.decisions,
        attachment_path=m.attachment_path,
        created_at=m.created_at,
        action_items=[MeetingActionOut.model_validate(a) for a in m.action_items],
    )
