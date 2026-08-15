# API 一览（前缀 `/api`）

## 通用
- `GET /health` 健康检查
- `GET /dashboard` 首页聚合
- `GET|PUT /settings` 设置

## 文献
- `GET|POST /papers` · `GET|PUT|DELETE /papers/{id}`
- `POST /papers/{id}/mark-opened`：打开文献时自动同步阅读队列（无笔记为待精读，有笔记为已精读）
- `GET|POST /papers/{id}/annotations` · `PUT|DELETE /annotations/{id}`
- `GET|PUT /papers/{id}/note`
- `POST /papers/batch` 批量更新
- `GET|POST /watch-folders` · `DELETE /watch-folders/{id}`
- `GET /watch-folders/{id}/browse?sub=` 浏览本地 PDF
- `POST /watch-folders/{id}/import` 入库；默认识别 PDF 文章标题并写入文献库
- `GET /papers/{id}/file` 打开 PDF 流
- `GET|POST /reading-sessions` · 会话详情与聚合批注

## 项目 / 实验
- `GET|POST /projects` · `GET|PUT|DELETE /projects/{id}`
- `GET|POST /projects/{id}/notes` · `PUT|DELETE /projects/{id}/notes/{note_id}`
- `GET|POST /projects/{id}/engineering-records` · `PUT|DELETE /projects/{id}/engineering-records/{record_id}`
- `GET|POST /projects/{id}/checklist`
- `GET|POST /experiments` · `PUT|DELETE /experiments/{id}`
- `GET /research-board` 学术项目阶段看板
- `GET /engineering-board` 工程项目学习阶段看板与记录统计

## 任务 / 日历
- `GET|POST /tasks` · `PUT|DELETE /tasks/{id}`
- `GET|POST /calendar` · `PUT|DELETE /calendar/{id}`

## 札记 / Inbox
- `GET /notes`：聚合普通、项目与有实际内容的文献笔记，返回来源和关联项目；文献笔记标题取文献库标题
- `GET|POST /general-notes` · `PUT|DELETE /general-notes/{id}`：普通笔记 CRUD 与软删除
- `GET|POST /ideas` · `PUT|DELETE /ideas/{id}`：独立的想法库
- `PUT /ideas/{id}/status`：进行中 / 已沉淀 / 已归档状态流转
- `GET|POST /inbox` · `PUT|DELETE /inbox/{id}`：临时捕获与归档

## 产出
- `CRUD /journals` · `/conferences` · `/submissions` · `/patents`
- `POST /submissions/{id}/events`

## 会议 / 论文
- `CRUD /meetings` · `POST /meetings/{id}/to-tasks`
- `GET|PUT /thesis` · `CRUD /thesis/chapters` · `/thesis/milestones`

## 习惯
- `POST /checkins` · `GET /checkins`
- `POST /focus/start` · `/focus/stop` · `GET /focus`
- `CRUD /leave`
- `CRUD /inbox`

## 导入导出
- `POST /export` → 下载 ZIP
- `POST /import` multipart 上传 ZIP（mode=replace|merge）
