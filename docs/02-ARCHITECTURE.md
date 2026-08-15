# 架构设计

## 1. 技术选型

| 层 | 技术 | 原因 |
|----|------|------|
| 运行时 | Python 3.10+（conda `phdbench`） | 用户本机已有 conda；无 Node |
| Web 框架 | FastAPI + Uvicorn | API 清晰、本地启动简单 |
| ORM / DB | SQLAlchemy 2 + SQLite | 单文件库，易备份 |
| 前端 | 静态 SPA（原生 JS + CSS） | 免构建；PDF.js CDN 阅读批注 |
| 文件 | 本地路径索引 + `FileResponse` 打开 PDF | 不强制复制文件 |

## 2. 目录结构

```
D:\Projects\cursor\
├── docs\                 # 开发文档
├── app\
│   ├── main.py           # FastAPI 入口
│   ├── config.py
│   ├── database.py
│   ├── models.py
│   ├── schemas.py
│   ├── routers\          # 按域拆分 API
│   └── services\         # 导入导出、目录扫描等
├── static\               # 前端
├── data\                 # SQLite 与运行时数据
├── .workbench-spaces\    # 演示空间等受管数据空间（Git 忽略）
├── exports\              # 导出临时目录
├── requirements.txt
├── environment.yml
└── run.py                # 一键启动
```

## 3. 运行时拓扑

```
浏览器 (localhost:8787)
    │
    ├─ static/*  (SPA)
    └─ /api/*    (JSON)
           │
      FastAPI + SQLAlchemy
           │
      当前数据空间 / workbench.db
           │
      本地 PDF / 实验路径（只读打开，元数据入库）
```

## 4. 设计决策

1. **本地路径为真源**：文献默认 `index_only`，批注存在 DB，不改写 PDF 文件（避免损坏原文；可后续做 sidecar）。
2. **实体关联用松耦合**：`links` 表或可空外键；任务用 `link_type + link_id`。
3. **日历为投影视图**：会议、请假、DDL 写入 `calendar_events`；任务 DDL 查询时合并。
4. **AI 学科默认模板**：研究笔记与实验 Run 字段贴合算法论文（方法、数据集、指标、消融）。
5. **数据空间隔离**：个人与演示空间只共享应用代码，不共享数据库、附件、AI 上传、实验图片或导出目录；切换通过进程重启重新绑定 SQLAlchemy 引擎。

## 5. 风险与缓解

| 风险 | 缓解 |
|------|------|
| PDF 移动导致断链 | 存 path + size + hash；设置页「修复断链」 |
| 批注锚点漂移 | 存选区文本 + 页码；坐标为辅 |
| 库损坏 | 导出 ZIP；启动时备份 `.bak` |
