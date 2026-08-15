from datetime import datetime, date
from sqlalchemy import (
    String,
    Text,
    Integer,
    Float,
    Boolean,
    DateTime,
    Date,
    ForeignKey,
    UniqueConstraint,
    LargeBinary,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def utcnow():
    return datetime.utcnow()


class Setting(Base):
    __tablename__ = "settings"
    key: Mapped[str] = mapped_column(String(100), primary_key=True)
    value: Mapped[str] = mapped_column(Text, default="")


class WatchFolder(Base):
    __tablename__ = "watch_folders"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    path: Mapped[str] = mapped_column(String(1000), unique=True)
    enabled: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class GeneralNote(Base):
    """Standalone Markdown note without a required project or paper source."""

    __tablename__ = "general_notes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[str] = mapped_column(String(500), default="")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300))
    project_type: Mapped[str] = mapped_column(String(50), default="research")
    # research | engineering | grant | ongoing | collab
    status: Mapped[str] = mapped_column(String(50), default="active")
    # incubating | applying | active | writing | done | paused
    research_question: Mapped[str] = mapped_column(Text, default="")
    contribution: Mapped[str] = mapped_column(Text, default="")
    success_criteria: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    stage: Mapped[str] = mapped_column(String(50), default="选题")
    # 选题|分析|写作|在投|R&R|接收|发表|搁置
    progress: Mapped[int] = mapped_column(Integer, default=0)
    next_step: Mapped[str] = mapped_column(String(400), default="")
    next_step_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    target_venue: Mapped[str] = mapped_column(String(300), default="")
    overleaf_url: Mapped[str] = mapped_column(String(500), default="")
    code_repo: Mapped[str] = mapped_column(String(500), default="")
    folder_path: Mapped[str] = mapped_column(String(1000), default="")
    hidden: Mapped[bool] = mapped_column(Boolean, default=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    papers = relationship("Paper", back_populates="project")
    paper_links = relationship("PaperProject", back_populates="project", cascade="all, delete-orphan")
    experiments = relationship("ExperimentRun", back_populates="project")
    tasks = relationship("Task", back_populates="project")
    checklist_items = relationship("GrantChecklistItem", back_populates="project")
    journal_notes = relationship(
        "ProjectNote",
        back_populates="project",
        cascade="all, delete-orphan",
    )
    engineering_records = relationship(
        "EngineeringRecord",
        back_populates="project",
        cascade="all, delete-orphan",
    )


class ProjectNote(Base):
    """Per-project journal entries (Markdown), each stamped to the hour."""
    __tablename__ = "project_notes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(300), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="journal_notes")


class EngineeringRecord(Base):
    """Structured learning and technical records for open-source projects."""

    __tablename__ = "engineering_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    record_type: Mapped[str] = mapped_column(String(50), default="learning")
    # learning | architecture | setup | technique | issue | decision | takeaway
    title: Mapped[str] = mapped_column(String(300), default="")
    body: Mapped[str] = mapped_column(Text, default="")
    source_ref: Mapped[str] = mapped_column(String(1000), default="")
    code_ref: Mapped[str] = mapped_column(String(1000), default="")
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="engineering_records")


class GrantChecklistItem(Base):
    __tablename__ = "grant_checklist_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))
    title: Mapped[str] = mapped_column(String(300))
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")

    project = relationship("Project", back_populates="checklist_items")


class Tag(Base):
    __tablename__ = "tags"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(100), unique=True)
    color: Mapped[str] = mapped_column(String(20), default="#3d5a5b")
    # 分类维度（彼此平行，可多挂）：我的研究方向 / 文献属性 / 阅读队列 / 相关度 / 自定义…
    dimension: Mapped[str] = mapped_column(String(80), default="自定义")


class Paper(Base):
    __tablename__ = "papers"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500), default="Untitled")
    authors: Mapped[str] = mapped_column(Text, default="")
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    venue: Mapped[str] = mapped_column(String(300), default="")
    doi: Mapped[str] = mapped_column(String(200), default="")
    paper_type: Mapped[str] = mapped_column(String(50), default="conference")
    # conference | journal | preprint | thesis | book | techreport
    local_path: Mapped[str] = mapped_column(String(1000), default="")
    file_size: Mapped[int | None] = mapped_column(Integer, nullable=True)
    file_mtime: Mapped[float | None] = mapped_column(Float, nullable=True)
    file_hash: Mapped[str] = mapped_column(String(64), default="")
    status: Mapped[str] = mapped_column(String(30), default="todo")
    # todo | reading | read | deep | dropped
    relevance: Mapped[str] = mapped_column(String(30), default="related")
    # core | related | background | counter
    folder: Mapped[str] = mapped_column(String(200), default="默认")
    abstract: Mapped[str] = mapped_column(Text, default="")
    bibtex: Mapped[str] = mapped_column(Text, default="")
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    reading_progress_page: Mapped[int] = mapped_column(Integer, default=1)
    reading_seconds: Mapped[int] = mapped_column(Integer, default=0)
    reading_depth: Mapped[str] = mapped_column(String(30), default="skim")
    # skim | intensive | critical  略读/精读/批判
    next_review_at: Mapped[date | None] = mapped_column(Date, nullable=True)
    xp: Mapped[int] = mapped_column(Integer, default=0)
    starred: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    project = relationship("Project", back_populates="papers")
    annotations = relationship("PaperAnnotation", back_populates="paper", cascade="all, delete-orphan")
    note = relationship("PaperNote", back_populates="paper", uselist=False, cascade="all, delete-orphan")
    tag_links = relationship("PaperTag", back_populates="paper", cascade="all, delete-orphan")
    project_links = relationship("PaperProject", back_populates="paper", cascade="all, delete-orphan")


class PaperTag(Base):
    __tablename__ = "paper_tags"
    __table_args__ = (UniqueConstraint("paper_id", "tag_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    paper_id: Mapped[int] = mapped_column(ForeignKey("papers.id", ondelete="CASCADE"))
    tag_id: Mapped[int] = mapped_column(ForeignKey("tags.id", ondelete="CASCADE"))

    paper = relationship("Paper", back_populates="tag_links")
    tag = relationship("Tag")


class PaperProject(Base):
    """Many-to-many: a paper can link to multiple projects."""
    __tablename__ = "paper_projects"
    __table_args__ = (UniqueConstraint("paper_id", "project_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    paper_id: Mapped[int] = mapped_column(ForeignKey("papers.id", ondelete="CASCADE"))
    project_id: Mapped[int] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"))

    paper = relationship("Paper", back_populates="project_links")
    project = relationship("Project", back_populates="paper_links")


class PaperAnnotation(Base):
    __tablename__ = "paper_annotations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    paper_id: Mapped[int] = mapped_column(ForeignKey("papers.id", ondelete="CASCADE"))
    page: Mapped[int] = mapped_column(Integer, default=1)
    color: Mapped[str] = mapped_column(String(30), default="yellow")
    selected_text: Mapped[str] = mapped_column(Text, default="")
    comment: Mapped[str] = mapped_column(Text, default="")
    rect_json: Mapped[str] = mapped_column(Text, default="[]")
    tags: Mapped[str] = mapped_column(String(300), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    paper = relationship("Paper", back_populates="annotations")


class PaperNote(Base):
    __tablename__ = "paper_notes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    paper_id: Mapped[int] = mapped_column(ForeignKey("papers.id", ondelete="CASCADE"), unique=True)
    motivation: Mapped[str] = mapped_column(Text, default="")
    problem: Mapped[str] = mapped_column(Text, default="")
    method: Mapped[str] = mapped_column(Text, default="")
    datasets: Mapped[str] = mapped_column(Text, default="")
    metrics: Mapped[str] = mapped_column(Text, default="")
    results: Mapped[str] = mapped_column(Text, default="")
    limitations: Mapped[str] = mapped_column(Text, default="")
    relation_to_my_work: Mapped[str] = mapped_column(Text, default="")
    quotable: Mapped[str] = mapped_column(Text, default="")
    next_actions: Mapped[str] = mapped_column(Text, default="")
    raw_markdown: Mapped[str] = mapped_column(Text, default="")
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    paper = relationship("Paper", back_populates="note")


class ReadingSession(Base):
    __tablename__ = "reading_sessions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300))
    theme_tags: Mapped[str] = mapped_column(String(300), default="")
    summary: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(30), default="active")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    papers = relationship("ReadingSessionPaper", back_populates="session", cascade="all, delete-orphan")


class ReadingSessionPaper(Base):
    __tablename__ = "reading_session_papers"
    __table_args__ = (UniqueConstraint("session_id", "paper_id"),)
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    session_id: Mapped[int] = mapped_column(ForeignKey("reading_sessions.id", ondelete="CASCADE"))
    paper_id: Mapped[int] = mapped_column(ForeignKey("papers.id", ondelete="CASCADE"))
    one_liner: Mapped[str] = mapped_column(Text, default="")

    session = relationship("ReadingSession", back_populates="papers")
    paper = relationship("Paper")


class ExperimentRun(Base):
    __tablename__ = "experiment_runs"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    title: Mapped[str] = mapped_column(String(300))
    hypothesis: Mapped[str] = mapped_column(Text, default="")
    params_json: Mapped[str] = mapped_column(Text, default="{}")
    metrics_json: Mapped[str] = mapped_column(Text, default="{}")
    code_path: Mapped[str] = mapped_column(String(1000), default="")
    data_path: Mapped[str] = mapped_column(String(1000), default="")
    checkpoint_path: Mapped[str] = mapped_column(String(1000), default="")
    status: Mapped[str] = mapped_column(String(30), default="planned")
    conclusion: Mapped[str] = mapped_column(Text, default="")
    failure_reason: Mapped[str] = mapped_column(Text, default="")
    started_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    # link to skill gallery entry id (nature-figure / figures4papers look)
    style_template_id: Mapped[str] = mapped_column(String(80), default="")
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    project = relationship("Project", back_populates="experiments")
    figures = relationship(
        "ExperimentFigure",
        back_populates="experiment",
        cascade="all, delete-orphan",
        order_by="ExperimentFigure.id",
    )


class ExperimentFigure(Base):
    __tablename__ = "experiment_figures"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    experiment_id: Mapped[int] = mapped_column(ForeignKey("experiment_runs.id", ondelete="CASCADE"))
    kind: Mapped[str] = mapped_column(String(30), default="plot")  # schematic | plot
    short_name: Mapped[str] = mapped_column(String(120), default="")
    caption: Mapped[str] = mapped_column(Text, default="")
    chart_type: Mapped[str] = mapped_column(String(40), default="bar")
    # bar | grouped_bar | line | heatmap | image
    data_json: Mapped[str] = mapped_column(Text, default="{}")
    image_path: Mapped[str] = mapped_column(String(1000), default="")
    svg_path: Mapped[str] = mapped_column(String(1000), default="")
    source: Mapped[str] = mapped_column(String(30), default="template")  # upload | template
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    experiment = relationship("ExperimentRun", back_populates="figures")


class Task(Base):
    __tablename__ = "tasks"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(400))
    description: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(30), default="todo")
    # todo | doing | done | blocked
    priority: Mapped[str] = mapped_column(String(20), default="medium")
    # low | medium | high | urgent
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    link_type: Mapped[str] = mapped_column(String(50), default="")
    # paper | experiment | chapter | submission | meeting | ""
    link_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    estimate_minutes: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    completed_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)

    project = relationship("Project", back_populates="tasks")


class CalendarEvent(Base):
    __tablename__ = "calendar_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300))
    event_type: Mapped[str] = mapped_column(String(50), default="custom")
    # deadline | meeting | focus | leave | thesis_milestone | custom
    start_at: Mapped[datetime] = mapped_column(DateTime)
    end_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    all_day: Mapped[bool] = mapped_column(Boolean, default=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    link_type: Mapped[str] = mapped_column(String(50), default="")
    link_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Journal(Base):
    __tablename__ = "journals"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(300), unique=True)
    publisher: Mapped[str] = mapped_column(String(200), default="")
    quartile: Mapped[str] = mapped_column(String(50), default="")
    impact_factor: Mapped[str] = mapped_column(String(50), default="")
    field: Mapped[str] = mapped_column(String(200), default="AI")
    oa: Mapped[bool] = mapped_column(Boolean, default=False)
    notes: Mapped[str] = mapped_column(Text, default="")
    # top=顶刊 | trans=Trans 汇刊 | regular=普通/毕业神刊
    tier: Mapped[str] = mapped_column(String(20), default="regular")
    # comma-separated labels, e.g. 最具
    tags: Mapped[str] = mapped_column(String(200), default="")


class Conference(Base):
    __tablename__ = "conferences"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    name: Mapped[str] = mapped_column(String(300), unique=True)
    short_name: Mapped[str] = mapped_column(String(50), default="")
    rank: Mapped[str] = mapped_column(String(50), default="")  # CCF-A etc
    field: Mapped[str] = mapped_column(String(200), default="AI")
    location: Mapped[str] = mapped_column(String(200), default="")
    year: Mapped[int | None] = mapped_column(Integer, nullable=True)
    abstract_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    paper_deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")


class Submission(Base):
    __tablename__ = "submissions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(400))
    target_type: Mapped[str] = mapped_column(String(30), default="conference")
    # conference | journal
    journal_id: Mapped[int | None] = mapped_column(ForeignKey("journals.id"), nullable=True)
    conference_id: Mapped[int | None] = mapped_column(ForeignKey("conferences.id"), nullable=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    authors: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(50), default="writing")
    # writing | internal_review | submitted | revision | accepted | rejected | published
    manuscript_path: Mapped[str] = mapped_column(String(1000), default="")
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    events = relationship("SubmissionEvent", back_populates="submission", cascade="all, delete-orphan")


class SubmissionEvent(Base):
    __tablename__ = "submission_events"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    submission_id: Mapped[int] = mapped_column(ForeignKey("submissions.id", ondelete="CASCADE"))
    event_type: Mapped[str] = mapped_column(String(50))
    happened_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    content: Mapped[str] = mapped_column(Text, default="")
    attachment_path: Mapped[str] = mapped_column(String(1000), default="")

    submission = relationship("Submission", back_populates="events")


class Patent(Base):
    __tablename__ = "patents"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(400))
    status: Mapped[str] = mapped_column(String(50), default="idea")
    # idea | disclosure | filed | published | granted | rejected
    inventors: Mapped[str] = mapped_column(Text, default="")
    application_no: Mapped[str] = mapped_column(String(100), default="")
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    deadline: Mapped[date | None] = mapped_column(Date, nullable=True)
    notes: Mapped[str] = mapped_column(Text, default="")
    file_path: Mapped[str] = mapped_column(String(1000), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Meeting(Base):
    __tablename__ = "meetings"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300))
    meeting_type: Mapped[str] = mapped_column(String(50), default="group")
    # group | advisor | collab | talk | defense
    start_at: Mapped[datetime] = mapped_column(DateTime)
    end_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    agenda: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    decisions: Mapped[str] = mapped_column(Text, default="")
    attachment_path: Mapped[str] = mapped_column(String(1000), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    action_items = relationship("MeetingActionItem", back_populates="meeting", cascade="all, delete-orphan")


class MeetingActionItem(Base):
    __tablename__ = "meeting_action_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    meeting_id: Mapped[int] = mapped_column(ForeignKey("meetings.id", ondelete="CASCADE"))
    content: Mapped[str] = mapped_column(Text)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    task_id: Mapped[int | None] = mapped_column(ForeignKey("tasks.id"), nullable=True)

    meeting = relationship("Meeting", back_populates="action_items")


class ThesisMeta(Base):
    __tablename__ = "thesis_meta"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(500), default="博士学位论文")
    subtitle: Mapped[str] = mapped_column(String(500), default="")
    research_question: Mapped[str] = mapped_column(Text, default="")
    contribution: Mapped[str] = mapped_column(Text, default="")
    notes: Mapped[str] = mapped_column(Text, default="")
    checklist_json: Mapped[str] = mapped_column(Text, default="[]")


class ThesisChapter(Base):
    __tablename__ = "thesis_chapters"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("thesis_chapters.id"), nullable=True)
    order_index: Mapped[int] = mapped_column(Integer, default=0)
    title: Mapped[str] = mapped_column(String(300))
    status: Mapped[str] = mapped_column(String(30), default="todo")
    # todo | draft | revising | done
    summary: Mapped[str] = mapped_column(Text, default="")
    issues: Mapped[str] = mapped_column(Text, default="")
    related_paper_ids: Mapped[str] = mapped_column(Text, default="")  # csv
    related_experiment_ids: Mapped[str] = mapped_column(Text, default="")
    word_target: Mapped[int | None] = mapped_column(Integer, nullable=True)


class ThesisMilestone(Base):
    __tablename__ = "thesis_milestones"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(200))
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(30), default="pending")
    notes: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str] = mapped_column(String(300), default="")
    outcome: Mapped[str] = mapped_column(Text, default="")
    attachments = relationship(
        "ThesisMilestoneAttachment",
        back_populates="milestone",
        cascade="all, delete-orphan",
        order_by="ThesisMilestoneAttachment.id",
    )


class ThesisMilestoneAttachment(Base):
    __tablename__ = "thesis_milestone_attachments"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    milestone_id: Mapped[int] = mapped_column(ForeignKey("thesis_milestones.id", ondelete="CASCADE"))
    filename: Mapped[str] = mapped_column(String(500))
    content_type: Mapped[str] = mapped_column(String(200), default="application/octet-stream")
    size: Mapped[int] = mapped_column(Integer, default=0)
    data: Mapped[bytes] = mapped_column(LargeBinary, default=b"")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)

    milestone = relationship("ThesisMilestone", back_populates="attachments")

class CheckIn(Base):
    __tablename__ = "checkins"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    day: Mapped[date] = mapped_column(Date, default=date.today)
    kind: Mapped[str] = mapped_column(String(50), default="reading")
    # reading | experiment | writing | custom
    note: Mapped[str] = mapped_column(Text, default="")
    minutes: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class FocusSession(Base):
    __tablename__ = "focus_sessions"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300), default="专注")
    link_type: Mapped[str] = mapped_column(String(50), default="")
    link_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    ended_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)
    duration_seconds: Mapped[int] = mapped_column(Integer, default=0)
    planned_minutes: Mapped[int] = mapped_column(Integer, default=25)  # 目标时长，0=正计时不限
    outcome: Mapped[str] = mapped_column(Text, default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class LeaveRecord(Base):
    __tablename__ = "leave_records"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    start_date: Mapped[date] = mapped_column(Date)
    end_date: Mapped[date] = mapped_column(Date)
    reason: Mapped[str] = mapped_column(Text, default="")
    status_label: Mapped[str] = mapped_column(String(50), default="请假")
    # 在岗 | 休息 | 请假 | 外出
    calendar_event_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class InboxItem(Base):
    __tablename__ = "inbox_items"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content: Mapped[str] = mapped_column(Text)
    item_type: Mapped[str] = mapped_column(String(50), default="note")
    # note | link | todo
    processed: Mapped[bool] = mapped_column(Boolean, default=False)
    project_id: Mapped[int | None] = mapped_column(ForeignKey("projects.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class Idea(Base):
    __tablename__ = "ideas"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(400), default="")
    content: Mapped[str] = mapped_column(Text, default="")
    tags: Mapped[str] = mapped_column(String(300), default="")
    # inspiration | record | unsorted
    category: Mapped[str] = mapped_column(String(50), default="inspiration")
    # open | landed | discarded
    status: Mapped[str] = mapped_column(String(30), default="open")
    linked_paper_ids: Mapped[str] = mapped_column(Text, default="")
    linked_project_ids: Mapped[str] = mapped_column(Text, default="")
    linked_submission_ids: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime, nullable=True)


class LifeEntry(Base):
    __tablename__ = "life_entries"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    category: Mapped[str] = mapped_column(String(50), default="list")
    # diet | exercise | list | date | admin
    title: Mapped[str] = mapped_column(String(400), default="")
    content: Mapped[str] = mapped_column(Text, default="")
    meta_json: Mapped[str] = mapped_column(Text, default="{}")
    day: Mapped[date | None] = mapped_column(Date, nullable=True)
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)


class DailyQuote(Base):
    __tablename__ = "daily_quotes"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    content: Mapped[str] = mapped_column(Text)
    author: Mapped[str] = mapped_column(String(200), default="")
    active: Mapped[bool] = mapped_column(Boolean, default=True)


class AgentConversation(Base):
    """Persisted Scier conversation with message attachments and workspace contexts."""

    __tablename__ = "agent_conversations"
    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    title: Mapped[str] = mapped_column(String(300), default="新对话")
    mode: Mapped[str] = mapped_column(String(30), default="general")
    backend: Mapped[str] = mapped_column(String(30), default="")
    messages_json: Mapped[str] = mapped_column(Text, default="[]")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow, index=True)
