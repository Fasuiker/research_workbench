# 模块实现说明（开发对照）

## 已实现模块

| 模块 | 后端 | 前端 | 说明 |
|------|------|------|------|
| 总览 | `/api/dashboard` 等 | `home` | 打卡、专注、请假、Inbox、任务进度 |
| 文献 | `/api/papers*` `/watch-folders*` | `papers` | 本地目录、批注、研究笔记、批量、主题会话 |
| 项目 | `/api/projects*` `/research-board` `/engineering-board` | `research` / `projects` | 学术/工程双轨看板、工程技术记录、申请清单、实验 Run |
| 札记 | `/api/notes` `/api/general-notes*` `/api/ideas*` `/api/inbox*` | `general_notes` `project_notes` `paper_notes` `ideas` `inbox_items` | 三类笔记聚合与项目筛选、独立想法库、Inbox 整理 |
| 任务 | `/api/tasks*` | `tasks` | 看板 + 筛选视图 |
| 日历 | `/api/calendar*` | `calendar` | 事件 CRUD；会议/投稿/请假自动写入 |
| 产出 | journals/conferences/submissions/patents | `outputs` | 投稿状态机 + 主数据库 |
| 会议 | `/api/meetings*` | `meetings` | 待办转任务 |
| 论文 | `/api/thesis*` | `thesis` | 章节、里程碑、Checklist |
| 设置 | settings/export/import、`/api/data-spaces*` | `settings` | 本地备份 ZIP、个人/演示空间切换与演示空间重建 |

## AI 算法向默认数据

- 会议库预置 NeurIPS/ICML/ICLR/CVPR/AAAI/ACL/KDD
- 期刊库预置 TPAMI/JMLR 等
- 研究笔记字段含 datasets / metrics
- 实验 Run 含 params_json / metrics_json / checkpoint_path

## 本地文件约定

- 监视目录只索引路径，默认不复制 PDF
- 批注保存在 SQLite，不写回 PDF 文件
- 导出 ZIP：`workbench.db` + `workbench.json`
- 个人空间沿用 `data/`；演示空间使用 `.workbench-spaces/demo/`，当前选择保存在 Git 忽略的 `.workbench-profile.json`
