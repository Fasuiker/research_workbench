from __future__ import annotations

from datetime import datetime, date
from typing import Any, Optional
from pydantic import BaseModel, Field, ConfigDict


class ORMModel(BaseModel):
    model_config = ConfigDict(from_attributes=True)


# ----- Settings / Dashboard -----
class SettingsOut(BaseModel):
    focus_project_id: Optional[int] = None
    personal_status: str = "在岗"
    watch_scan_depth: int = 4
    ai_note_template: str = "algorithm"
    workspace_name: str = "科研工作台"
    workspace_subtitle: str = "Research Workspace"
    quick_links: list[dict] = Field(default_factory=list)
    location_city: str = "上海"
    email: str = ""  # legacy primary address; prefer mail_accounts
    mail_accounts: list[dict] = Field(default_factory=list)  # {name, address, url}
    llm_base_url: str = "https://api.openai.com/v1"
    llm_model: str = "gpt-4o-mini"
    llm_api_key_set: bool = False
    llm_api_key_hint: str = ""
    llm_enabled: bool = True  # master switch for all LLM features
    # summary=摘要速览（快）；full=全文通读（慢、准）
    llm_read_mode: str = "summary"
    theme: str = "light"  # light | dark | pine | mist | bamboo | sky | amber
    # 文献 AI 提示词（已与默认合并；空键不会出现）
    llm_prompts: dict[str, str] = Field(default_factory=dict)
    llm_prompt_defaults: dict[str, str] = Field(default_factory=dict)
    llm_prompt_meta: list[dict] = Field(default_factory=list)
    # backup health
    last_backup_at: Optional[str] = None
    last_backup_file: Optional[str] = None
    backup_remind_enabled: bool = True
    auto_weekly_backup: bool = True
    backup_interval_days: int = 7
    backup_due: bool = False
    backup_days_since: Optional[int] = None


class SettingsUpdate(BaseModel):
    focus_project_id: Optional[int] = None
    personal_status: Optional[str] = None
    watch_scan_depth: Optional[int] = None
    ai_note_template: Optional[str] = None
    workspace_name: Optional[str] = None
    workspace_subtitle: Optional[str] = None
    quick_links: Optional[list[dict]] = None
    location_city: Optional[str] = None
    email: Optional[str] = None
    mail_accounts: Optional[list[dict]] = None
    llm_base_url: Optional[str] = None
    llm_model: Optional[str] = None
    llm_api_key: Optional[str] = None
    llm_enabled: Optional[bool] = None
    llm_read_mode: Optional[str] = None
    theme: Optional[str] = None
    llm_prompts: Optional[dict[str, str]] = None
    backup_remind_enabled: Optional[bool] = None
    auto_weekly_backup: Optional[bool] = None
    backup_interval_days: Optional[int] = None


# ----- Watch / Papers -----
class WatchFolderIn(BaseModel):
    name: str
    path: str
    enabled: bool = True


class WatchFolderOut(ORMModel):
    id: int
    name: str
    path: str
    enabled: bool
    created_at: datetime


class BrowseItem(BaseModel):
    name: str
    path: str
    is_dir: bool
    size: Optional[int] = None
    mtime: Optional[float] = None
    imported: bool = False
    paper_id: Optional[int] = None


class HideBrowseFileIn(BaseModel):
    """Hide a PDF from the left browse list without deleting the disk file."""
    path: str


class PaperIn(BaseModel):
    title: str = "Untitled"
    authors: str = ""
    year: Optional[int] = None
    venue: str = ""
    doi: str = ""
    paper_type: str = "conference"
    local_path: str = ""
    status: str = "todo"
    relevance: str = "related"
    folder: str = "默认"
    abstract: str = ""
    bibtex: str = ""
    project_id: Optional[int] = None  # legacy primary; synced from project_ids[0]
    project_ids: list[int] = Field(default_factory=list)
    tags: list[str] = Field(default_factory=list)  # 自定义分类标签，可多选
    reading_progress_page: int = 1
    reading_seconds: int = 0
    reading_depth: str = "skim"
    next_review_at: Optional[date] = None
    xp: int = 0


class PaperOut(ORMModel):
    id: int
    title: str
    authors: str
    year: Optional[int]
    venue: str
    doi: str
    paper_type: str
    local_path: str
    file_size: Optional[int]
    file_mtime: Optional[float]
    file_hash: str
    status: str
    relevance: str
    folder: str
    abstract: str
    bibtex: str
    project_id: Optional[int]
    project_ids: list[int] = Field(default_factory=list)
    reading_progress_page: int
    reading_seconds: int
    reading_depth: str = "skim"
    next_review_at: Optional[date] = None
    xp: int = 0
    starred: bool = False
    created_at: datetime
    updated_at: datetime
    tags: list[str] = Field(default_factory=list)
    file_exists: Optional[bool] = None


class PaperBatchUpdate(BaseModel):
    ids: list[int]
    status: Optional[str] = None
    relevance: Optional[str] = None
    folder: Optional[str] = None
    project_id: Optional[int] = None
    project_ids: Optional[list[int]] = None  # replace set; empty list clears
    project_ids_add: list[int] = Field(default_factory=list)
    tags_add: list[str] = Field(default_factory=list)
    tags: Optional[list[str]] = None  # replace classification tags
    create_notes: bool = False


class AnnotationIn(BaseModel):
    page: int = 1
    color: str = "yellow"
    selected_text: str = ""
    comment: str = ""
    rect_json: str = "[]"
    tags: str = ""


class AnnotationOut(ORMModel):
    id: int
    paper_id: int
    page: int
    color: str
    selected_text: str
    comment: str
    rect_json: str
    tags: str
    created_at: datetime


class PaperNoteIn(BaseModel):
    motivation: str = ""
    problem: str = ""
    method: str = ""
    datasets: str = ""
    metrics: str = ""
    results: str = ""
    limitations: str = ""
    relation_to_my_work: str = ""
    quotable: str = ""
    next_actions: str = ""
    raw_markdown: str = ""


class PaperNoteOut(PaperNoteIn, ORMModel):
    id: int
    paper_id: int
    updated_at: datetime


class ReadingSessionIn(BaseModel):
    title: str
    theme_tags: str = ""
    paper_ids: list[int] = Field(default_factory=list)


class ReadingSessionOut(ORMModel):
    id: int
    title: str
    theme_tags: str
    summary: str
    status: str
    created_at: datetime
    paper_ids: list[int] = Field(default_factory=list)


# ----- Projects / Experiments -----
class ProjectIn(BaseModel):
    title: str
    project_type: str = "research"
    status: str = "active"
    research_question: str = ""
    contribution: str = ""
    success_criteria: str = ""
    notes: str = ""
    deadline: Optional[date] = None
    stage: str = "选题"
    progress: int = 0
    next_step: str = ""
    next_step_deadline: Optional[date] = None
    target_venue: str = ""
    overleaf_url: str = ""
    code_repo: str = ""
    folder_path: str = ""
    hidden: bool = False


class ProjectOut(ORMModel):
    id: int
    title: str
    project_type: str
    status: str
    research_question: str
    contribution: str
    success_criteria: str
    notes: str
    deadline: Optional[date]
    stage: str = "选题"
    progress: int = 0
    next_step: str = ""
    next_step_deadline: Optional[date] = None
    target_venue: str = ""
    overleaf_url: str = ""
    code_repo: str = ""
    folder_path: str = ""
    hidden: bool = False
    created_at: datetime
    updated_at: datetime
    # echo fields (computed)
    paper_count: int = 0
    focus_week_seconds: int = 0
    focus_week_sessions: int = 0
    recent_focus: list[dict] = Field(default_factory=list)
    is_focus_project: bool = False
    note_count: int = 0
    latest_note_at: Optional[datetime] = None
    latest_note_preview: str = ""


class ProjectNoteIn(BaseModel):
    title: str = ""
    body: str = ""


class ProjectNoteOut(ORMModel):
    id: int
    project_id: int
    title: str
    body: str
    recorded_at: datetime
    created_at: datetime
    updated_at: datetime


class GeneralNoteIn(BaseModel):
    title: str = ""
    body: str = ""
    tags: str = ""


class GeneralNoteOut(ORMModel):
    id: int
    title: str
    body: str
    tags: str
    created_at: datetime
    updated_at: datetime


class EngineeringRecordIn(BaseModel):
    record_type: str = "learning"
    title: str = ""
    body: str = ""
    source_ref: str = ""
    code_ref: str = ""


class EngineeringRecordOut(ORMModel):
    id: int
    project_id: int
    record_type: str
    title: str
    body: str
    source_ref: str
    code_ref: str
    recorded_at: datetime
    created_at: datetime
    updated_at: datetime


class ChecklistIn(BaseModel):
    title: str
    done: bool = False
    due_date: Optional[date] = None
    notes: str = ""


class ChecklistOut(ORMModel):
    id: int
    project_id: int
    title: str
    done: bool
    due_date: Optional[date]
    notes: str


class ExperimentIn(BaseModel):
    project_id: Optional[int] = None
    title: str
    hypothesis: str = ""
    params_json: str = "{}"
    metrics_json: str = "{}"
    code_path: str = ""
    data_path: str = ""
    checkpoint_path: str = ""
    status: str = "planned"
    conclusion: str = ""
    failure_reason: str = ""
    started_at: Optional[datetime] = None
    ended_at: Optional[datetime] = None
    style_template_id: str = ""


class ExperimentOut(ExperimentIn, ORMModel):
    id: int
    created_at: datetime
    figure_count: int = 0
    preview_figure_id: Optional[int] = None
    style_preview: str = ""
    style_short_name: str = ""


class ExperimentFigureIn(BaseModel):
    short_name: str = ""
    caption: str = ""


class ExperimentFigureOut(ORMModel):
    id: int
    experiment_id: int
    kind: str
    short_name: str
    caption: str
    chart_type: str
    data_json: str = "{}"
    image_path: str = ""
    svg_path: str = ""
    source: str = "template"
    created_at: datetime
    updated_at: datetime
    has_png: bool = False
    has_svg: bool = False


class FigureGenerateIn(BaseModel):
    chart_type: str = "bar"  # bar | grouped_bar | line | heatmap
    data: dict = Field(default_factory=dict)
    short_name: str = ""
    caption: str = ""


class FigureSchematicIn(BaseModel):
    local_path: str = ""
    short_name: str = ""
    caption: str = ""


class ExperimentStyleLinkIn(BaseModel):
    style_template_id: str = ""


class FigureGenerateFromStyleIn(BaseModel):
    style_template_id: str = ""  # optional override; else use run.style_template_id
    data: dict = Field(default_factory=dict)  # empty → from metrics
    use_metrics: bool = True
    short_name: str = ""
    caption: str = ""


# ----- Tasks / Calendar -----
class TaskIn(BaseModel):
    title: str
    description: str = ""
    status: str = "todo"
    priority: str = "medium"
    due_date: Optional[date] = None
    project_id: Optional[int] = None
    link_type: str = ""
    link_id: Optional[int] = None
    estimate_minutes: Optional[int] = None


class TaskOut(TaskIn, ORMModel):
    id: int
    created_at: datetime
    completed_at: Optional[datetime]


class CalendarEventIn(BaseModel):
    title: str
    event_type: str = "custom"
    start_at: datetime
    end_at: Optional[datetime] = None
    all_day: bool = True
    project_id: Optional[int] = None
    link_type: str = ""
    link_id: Optional[int] = None
    notes: str = ""


class CalendarEventOut(CalendarEventIn, ORMModel):
    id: int
    created_at: datetime


# ----- Outputs -----
class JournalIn(BaseModel):
    name: str
    publisher: str = ""
    quartile: str = ""
    impact_factor: str = ""
    field: str = "AI"
    oa: bool = False
    notes: str = ""
    tier: str = "regular"  # top | trans | regular
    tags: str = ""  # e.g. 最具


class JournalOut(JournalIn, ORMModel):
    id: int


class JournalBulkIn(BaseModel):
    ids: list[int]
    publisher: Optional[str] = None
    quartile: Optional[str] = None
    impact_factor: Optional[str] = None
    field: Optional[str] = None
    oa: Optional[bool] = None
    notes: Optional[str] = None
    tier: Optional[str] = None
    tags: Optional[str] = None


class ConferenceIn(BaseModel):
    name: str
    short_name: str = ""
    rank: str = ""
    field: str = "AI"
    location: str = ""
    year: Optional[int] = None
    abstract_deadline: Optional[date] = None
    paper_deadline: Optional[date] = None
    notes: str = ""


class ConferenceOut(ConferenceIn, ORMModel):
    id: int


class ConferenceBulkIn(BaseModel):
    ids: list[int]
    rank: Optional[str] = None
    field: Optional[str] = None
    location: Optional[str] = None
    year: Optional[int] = None
    abstract_deadline: Optional[date] = None
    paper_deadline: Optional[date] = None
    notes: Optional[str] = None


class SubmissionIn(BaseModel):
    title: str
    target_type: str = "conference"
    journal_id: Optional[int] = None
    conference_id: Optional[int] = None
    project_id: Optional[int] = None
    authors: str = ""
    status: str = "writing"
    manuscript_path: str = ""
    deadline: Optional[date] = None
    notes: str = ""


class SubmissionOut(SubmissionIn, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class SubmissionEventIn(BaseModel):
    event_type: str
    happened_at: Optional[datetime] = None
    content: str = ""
    attachment_path: str = ""


class SubmissionEventOut(ORMModel):
    id: int
    submission_id: int
    event_type: str
    happened_at: datetime
    content: str
    attachment_path: str


class PatentIn(BaseModel):
    title: str
    status: str = "idea"
    inventors: str = ""
    application_no: str = ""
    project_id: Optional[int] = None
    deadline: Optional[date] = None
    notes: str = ""
    file_path: str = ""


class PatentOut(PatentIn, ORMModel):
    id: int
    created_at: datetime


# ----- Meetings -----
class MeetingActionIn(BaseModel):
    content: str
    due_date: Optional[date] = None
    done: bool = False


class MeetingIn(BaseModel):
    title: str
    meeting_type: str = "group"
    start_at: datetime
    end_at: Optional[datetime] = None
    project_id: Optional[int] = None
    agenda: str = ""
    notes: str = ""
    decisions: str = ""
    attachment_path: str = ""
    action_items: list[MeetingActionIn] = Field(default_factory=list)


class MeetingActionOut(ORMModel):
    id: int
    meeting_id: int
    content: str
    due_date: Optional[date]
    done: bool
    task_id: Optional[int]


class MeetingOut(ORMModel):
    id: int
    title: str
    meeting_type: str
    start_at: datetime
    end_at: Optional[datetime]
    project_id: Optional[int]
    agenda: str
    notes: str
    decisions: str
    attachment_path: str
    created_at: datetime
    action_items: list[MeetingActionOut] = Field(default_factory=list)


# ----- Thesis -----
class ThesisMetaIn(BaseModel):
    title: str = "博士学位论文"
    subtitle: str = ""
    research_question: str = ""
    contribution: str = ""
    notes: str = ""
    checklist_json: str = "[]"


class ThesisMetaOut(ThesisMetaIn, ORMModel):
    id: int


class ThesisChapterIn(BaseModel):
    parent_id: Optional[int] = None
    order_index: int = 0
    title: str
    status: str = "todo"
    summary: str = ""
    issues: str = ""
    related_paper_ids: str = ""
    related_experiment_ids: str = ""
    word_target: Optional[int] = None


class ThesisChapterOut(ThesisChapterIn, ORMModel):
    id: int


class ThesisMilestoneIn(BaseModel):
    title: str
    due_date: Optional[date] = None
    status: str = "pending"
    notes: str = ""
    location: str = ""
    outcome: str = ""


class ThesisMilestoneAttachmentOut(ORMModel):
    id: int
    milestone_id: int
    filename: str
    content_type: str
    size: int
    created_at: datetime


class ThesisMilestoneOut(ThesisMilestoneIn, ORMModel):
    id: int
    attachments: list[ThesisMilestoneAttachmentOut] = Field(default_factory=list)


# ----- Habits -----
class CheckInIn(BaseModel):
    day: Optional[date] = None
    kind: str = "reading"
    note: str = ""
    minutes: int = 0


class CheckInOut(ORMModel):
    id: int
    day: date
    kind: str
    note: str
    minutes: int
    created_at: datetime


class FocusStartIn(BaseModel):
    title: str = "专注"
    link_type: str = ""
    link_id: Optional[int] = None
    planned_minutes: int = 25  # 0 = open-ended count-up


class FocusStopIn(BaseModel):
    outcome: str = ""


class FocusUpdateIn(BaseModel):
    title: Optional[str] = None
    link_type: Optional[str] = None
    link_id: Optional[int] = None
    planned_minutes: Optional[int] = None
    outcome: Optional[str] = None
    duration_seconds: Optional[int] = None  # only for completed sessions


class FocusOut(ORMModel):
    id: int
    title: str
    link_type: str
    link_id: Optional[int]
    started_at: datetime
    ended_at: Optional[datetime]
    duration_seconds: int
    planned_minutes: int = 25
    outcome: str
    active: bool
    link_label: str = ""  # resolved project/paper/task title for UI


class FocusStatsOut(BaseModel):
    today_seconds: int = 0
    week_seconds: int = 0
    month_seconds: int = 0
    today_sessions: int = 0
    week_sessions: int = 0
    avg_session_seconds: int = 0
    active: Optional[FocusOut] = None
    recent: list[FocusOut] = []


class LeaveIn(BaseModel):
    start_date: date
    end_date: date
    reason: str = ""
    status_label: str = "请假"


class LeaveOut(ORMModel):
    id: int
    start_date: date
    end_date: date
    reason: str
    status_label: str
    calendar_event_id: Optional[int]
    created_at: datetime


class InboxIn(BaseModel):
    content: str
    item_type: str = "note"
    project_id: Optional[int] = None


class InboxOut(ORMModel):
    id: int
    content: str
    item_type: str
    processed: bool
    project_id: Optional[int]
    created_at: datetime


class IdeaIn(BaseModel):
    title: str = ""
    content: str = ""
    tags: str = ""
    category: str = "inspiration"
    status: str = "open"  # open | landed | discarded
    linked_paper_ids: str = ""
    linked_project_ids: str = ""
    linked_submission_ids: str = ""


class IdeaOut(IdeaIn, ORMModel):
    id: int
    created_at: datetime
    updated_at: datetime


class LifeEntryIn(BaseModel):
    category: str = "list"
    title: str = ""
    content: str = ""
    meta_json: str = "{}"
    day: Optional[date] = None
    done: bool = False


class LifeEntryOut(LifeEntryIn, ORMModel):
    id: int
    created_at: datetime


class DashboardOut(BaseModel):
    personal_status: str
    focus_project: Optional[ProjectOut]
    next_tasks: list[TaskOut]
    task_stats: dict[str, Any]
    upcoming_events: list[CalendarEventOut]
    recent_checkins: list[CheckInOut]
    active_focus: Optional[FocusOut]
    inbox: list[InboxOut]
    paper_stats: dict[str, Any]
    streak_days: int
