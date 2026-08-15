# 数据模型

## 实体一览

| 表 | 说明 |
|----|------|
| settings | 键值配置（监视目录 JSON、焦点项目等） |
| watch_folders | 本地文献根目录 |
| general_notes | 独立普通 Markdown 笔记（标题、正文、标签、回收站） |
| papers | 文献条目 |
| paper_annotations | PDF 批注 |
| paper_notes | 结构化研究笔记 |
| tags / paper_tags | 标签 |
| reading_sessions / reading_session_papers | 批量主题阅读 |
| projects | 项目 |
| project_notes | 项目级 Markdown 长笔记 |
| engineering_records | 工程项目结构化学习与技术记录 |
| grant_checklists | 申请材料清单项 |
| experiment_runs | 实验记录 |
| tasks | 任务 |
| calendar_events | 日历事件 |
| journals / conferences | 期刊/会议库 |
| submissions / submission_events | 投稿与流转 |
| patents | 专利 |
| meetings / meeting_action_items | 会议与待办 |
| thesis_meta / thesis_chapters / thesis_milestones | 毕业论文 |
| checkins / focus_sessions / leave_records | 打卡/专注/请假 |
| inbox_items | 快速捕获 |

## papers 核心字段

- title, authors, year, venue, doi, paper_type
- local_path, file_size, file_mtime, file_hash
- status: todo|reading|read|deep|dropped
- relevance: core|related|background|counter
- folder, abstract, bibtex
- project_id (主关联，可空)
- reading_progress_page, reading_seconds

## paper_annotations

- paper_id, page, color, selected_text, comment
- rect_json (归一化坐标数组)
- tags (逗号或 JSON)

## paper_notes（AI 算法模板）

- motivation, problem, method, datasets, metrics
- results, limitations, relation_to_my_work
- quotable, next_actions, raw_markdown

## experiment_runs

- project_id, title, hypothesis
- params_json, metrics_json
- code_path, data_path, checkpoint_path
- status: planned|running|done|failed
- conclusion, failure_reason, started_at, ended_at

## projects 双轨语义

- `project_type=research|grant|collab|ongoing`：使用学术阶段，`research_question` 表示研究问题
- `project_type=engineering`：使用工程阶段，`research_question` 表示学习目标，`contribution` 表示希望掌握的能力
- `code_repo`：学术项目为代码仓库，工程项目为上游开源仓库
- `overleaf_url`：学术项目为 Overleaf，工程项目为官方文档或项目主页
- `folder_path`：本地项目工作区

## engineering_records

- project_id, record_type, title, body
- record_type: learning|architecture|setup|technique|issue|decision|takeaway
- source_ref：README、官方文档、论文、Issue 或网页
- code_ref：文件、类、函数或代码行位置
- recorded_at, created_at, updated_at
