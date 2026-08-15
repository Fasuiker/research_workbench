from __future__ import annotations

import json
from datetime import date, datetime, timedelta

from sqlalchemy.orm import Session

from app import models
from app.services.backup import EXPORT_TABLES, seed_defaults
from app.services.journal_catalog import re_split_tags
from app.services.reading_state import sync_queue_tags_from_status


DEMO_PREFIX = "示例·"
DEMO_DATA_VERSION = "2026.08-llm"


def factory_reset(db: Session) -> dict:
    """Wipe app tables and restore the non-personal factory defaults."""
    for model in reversed(EXPORT_TABLES):
        db.query(model).delete()
    db.commit()
    seed_defaults(db)
    return {"ok": True, "mode": "factory_reset"}


def _setting(db: Session, key: str, value: str) -> None:
    row = db.query(models.Setting).filter_by(key=key).first()
    if row:
        row.value = value
    else:
        db.add(models.Setting(key=key, value=value))


def ensure_demo_settings(db: Session) -> None:
    """Keep distributable demo settings generic and free of personal accounts."""
    _setting(db, "email", "")
    _setting(db, "mail_accounts", "[]")
    for journal in db.query(models.Journal).all():
        tags = [tag for tag in re_split_tags(journal.tags) if tag != "最具"]
        journal.tags = ",".join(tags)
    db.commit()


def _tag(db: Session, name: str, dimension: str, color: str) -> models.Tag:
    row = db.query(models.Tag).filter_by(name=name).first()
    if not row:
        row = models.Tag(name=name, dimension=dimension, color=color)
        db.add(row)
        db.flush()
    return row


def _paper_tag(db: Session, paper: models.Paper, tag: models.Tag) -> None:
    if not db.query(models.PaperTag).filter_by(paper_id=paper.id, tag_id=tag.id).first():
        db.add(models.PaperTag(paper_id=paper.id, tag_id=tag.id))


def _project_link(db: Session, paper: models.Paper, project: models.Project) -> None:
    if not db.query(models.PaperProject).filter_by(paper_id=paper.id, project_id=project.id).first():
        db.add(models.PaperProject(paper_id=paper.id, project_id=project.id))


def _project(db: Session, title: str, **kwargs) -> tuple[models.Project, bool]:
    full_title = f"{DEMO_PREFIX}{title}"
    row = db.query(models.Project).filter_by(title=full_title).first()
    if row:
        return row, False
    row = models.Project(title=full_title, **kwargs)
    db.add(row)
    db.flush()
    return row, True


def seed_demo_data(db: Session) -> dict:
    """Create a complete, fictional LLM research workspace.

    Demo papers contain metadata, abstracts and notes only. No copyrighted PDF
    or pretend local path is bundled. Every business record starts with
    ``示例·`` and the seed is idempotent.
    """
    seed_defaults(db)
    ensure_demo_settings(db)
    today = date.today()
    now = datetime.utcnow().replace(microsecond=0)
    created: dict[str, int] = {}

    alignment, made = _project(
        db,
        "面向领域问答的大模型对齐研究",
        project_type="research", status="active", stage="分析", progress=48,
        research_question="如何用少量高质量偏好数据提升领域问答的可靠性，并减少幻觉？",
        contribution="分层偏好数据构建；事实一致性奖励；面向拒答边界的系统评测。",
        success_criteria="事实准确率提升 6%；幻觉率下降 20%；完成主实验与三组消融。",
        next_step="完成 DPO 与事实奖励联合训练的消融实验",
        next_step_deadline=today + timedelta(days=3), deadline=today + timedelta(days=80),
        target_venue="ACL 2027", code_repo="https://github.com/example/llm-alignment-demo",
        notes="演示主项目：文献、实验、任务、日程、投稿和 Scier 都围绕这条研究主线。",
    )
    if made:
        created["academic_projects"] = created.get("academic_projects", 0) + 1

    rag, made = _project(
        db,
        "长文档 RAG 的证据定位",
        project_type="research", status="writing", stage="写作", progress=72,
        research_question="如何在长文档问答中同时提高召回率、证据定位精度和答案可追溯性？",
        contribution="层级切分与混合检索；证据重排；引用一致性评估。",
        success_criteria="完成全部对比实验；形成可复现代码；论文初稿通过内部评审。",
        next_step="补齐不同 chunk 策略的对比表和错误分析",
        next_step_deadline=today + timedelta(days=2), deadline=today + timedelta(days=35),
        target_venue="EMNLP 2027", code_repo="https://github.com/example/long-rag-demo",
        notes="演示写作阶段项目。",
    )
    if made:
        created["academic_projects"] = created.get("academic_projects", 0) + 1

    agent, made = _project(
        db,
        "可验证的科研智能体",
        project_type="research", status="active", stage="R&R", progress=86,
        research_question="如何让大模型智能体在多步科研任务中保留证据、校验工具输出并恢复失败步骤？",
        contribution="执行轨迹验证器；失败恢复策略；过程级可靠性指标。",
        success_criteria="完成审稿人要求的强基线与跨模型实验，并提交逐点回复。",
        next_step="复现审稿人建议的反思型智能体基线",
        next_step_deadline=today + timedelta(days=5), deadline=today + timedelta(days=18),
        target_venue="NeurIPS 2026 R&R", code_repo="https://github.com/example/verifiable-agent-demo",
        notes="演示返修阶段项目。",
    )
    if made:
        created["academic_projects"] = created.get("academic_projects", 0) + 1

    efficiency, made = _project(
        db,
        "小模型推理效率研究",
        project_type="research", status="done", stage="发表", progress=100,
        research_question="如何在有限显存下保持小模型的推理质量与长上下文吞吐？",
        contribution="混合量化策略；KV Cache 压缩；部署侧基准。",
        success_criteria="论文接收、代码归档、复现实验和技术报告全部完成。",
        next_step="维护复现说明并收集后续问题", deadline=today - timedelta(days=60),
        target_venue="ICML 2026", code_repo="https://github.com/example/efficient-llm-demo",
        notes="演示已发表项目。",
    )
    if made:
        created["academic_projects"] = created.get("academic_projects", 0) + 1

    serving, made = _project(
        db,
        "学习并改造 vLLM 推理引擎",
        project_type="engineering", status="active", stage="最小复现", progress=55,
        research_question="掌握连续批处理、PagedAttention、KV Cache 管理和多卡推理链路。",
        contribution="能解释调度器与缓存管理，并完成一个请求优先级调度改造。",
        success_criteria="跑通最小服务；画出请求链路；完成吞吐基准；提交一个调度改造。",
        next_step="完成不同并发数下的吞吐与首 token 延迟测试",
        next_step_deadline=today + timedelta(days=6),
        code_repo="https://github.com/vllm-project/vllm", overleaf_url="https://docs.vllm.ai/",
        notes="演示工程项目：只记录公开仓库学习过程，不包含本地路径。",
    )
    if made:
        created["engineering_projects"] = 1

    _setting(db, "focus_project_id", str(alignment.id))
    _setting(db, "demo_data_version", DEMO_DATA_VERSION)
    _setting(db, "workspace_name", "科研工作台")
    _setting(db, "workspace_subtitle", "Research Workspace")

    project_notes = [
        (alignment, "本周对齐实验推进", """## 已完成

- 整理 2,400 条领域偏好对
- 跑通 SFT 与 DPO 基线
- 将事实一致性拆成可验证引用、实体一致和数值一致三项

## 下一步

固定数据版本与随机种子，完成事实奖励权重消融。"""),
        (rag, "论文写作清单", "- [x] 方法章节\n- [x] 主实验\n- [ ] 错误分析\n- [ ] Limitations\n- [ ] 附录复现细节"),
        (agent, "R&R 回应思路", "审稿人核心关切是强基线不足和失败恢复定义不清。先补实验，再重写评价协议说明。"),
        (serving, "源码阅读路线", "1. API Server → Engine\n2. Scheduler → Worker\n3. Block Manager → KV Cache\n4. 连续批处理与抢占策略"),
    ]
    for project, title, body in project_notes:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.ProjectNote).filter_by(project_id=project.id, title=full_title).first():
            db.add(models.ProjectNote(project_id=project.id, title=full_title, body=body, recorded_at=now - timedelta(days=1)))
            created["project_notes"] = created.get("project_notes", 0) + 1

    engineering_records = [
        ("architecture", "在线推理请求链路", "请求进入 API Server 后由引擎排队，调度器选择 sequence group，再交给 worker 执行模型前向。", "vLLM 官方架构文档", "vllm/engine/async_llm_engine.py"),
        ("technique", "PagedAttention 的核心作用", "把 KV Cache 切成固定大小块，避免连续显存分配造成碎片，并允许不同序列灵活映射。", "PagedAttention 设计说明", "vllm/attention/"),
        ("setup", "最小服务环境", "记录 CUDA、PyTorch、模型版本与启动参数；基准必须固定 warmup 次数。", "本地复现清单", "scripts/benchmark_serving.py"),
        ("issue", "高并发下首 token 延迟抖动", "吞吐升高时调度批次变大，短请求被长请求拖慢；需要拆分吞吐与尾延迟观察。", "压力测试记录", "vllm/core/scheduler.py"),
        ("decision", "优先做请求优先级而非换页算法", "改造边界更小，能直接验证调度策略对交互请求的影响。", "工程周会决策", "vllm/core/scheduler.py"),
        ("takeaway", "可复用基准模板", "统一记录并发数、输入/输出长度、TTFT、TPOT、吞吐和峰值显存。", "基准结果表", "benchmarks/"),
    ]
    for record_type, title, body, source_ref, code_ref in engineering_records:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.EngineeringRecord).filter_by(project_id=serving.id, title=full_title).first():
            db.add(models.EngineeringRecord(
                project_id=serving.id, record_type=record_type, title=full_title,
                body=body, source_ref=source_ref, code_ref=code_ref, recorded_at=now - timedelta(days=2),
            ))
            created["engineering_records"] = created.get("engineering_records", 0) + 1

    general_notes = [
        ("大模型研究路线图", "路线图,LLM", r"""# 大模型研究路线图

| 层次 | 关注点 | 当前项目 |
| --- | --- | --- |
| 数据 | 质量、偏好、污染 | 对齐研究 |
| 模型 | 训练、压缩、长上下文 | 小模型效率 |
| 系统 | 推理、缓存、吞吐 | vLLM 工程学习 |
| 应用 | RAG、Agent、评测 | 长文档 RAG / 科研智能体 |

核心目标不是只看最终分数，而是保留证据、成本和失败模式。"""),
        ("实验复现检查表", "实验,复现", "- [ ] 数据版本\n- [ ] 模型与 tokenizer\n- [ ] 随机种子\n- [ ] 训练参数\n- [ ] 推理参数\n- [ ] 成本与显存\n- [ ] 失败样例"),
        ("常用评测指标", "评测,Markdown", r"""# 大模型评测指标

| 任务 | 指标 | 备注 |
| --- | --- | --- |
| 生成 | Exact Match / F1 | 避免只看字符串匹配 |
| RAG | Recall@K / 引用准确率 | 检索与生成分开评估 |
| 推理 | TTFT / TPOT / tokens/s | 同时报告输入输出长度 |

$$
\mathrm{Recall@K}=\frac{\text{命中的相关证据数}}{\text{全部相关证据数}}.
$$"""),
    ]
    for title, tags, body in general_notes:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.GeneralNote).filter_by(title=full_title).first():
            db.add(models.GeneralNote(title=full_title, tags=tags, body=body))
            created["general_notes"] = created.get("general_notes", 0) + 1

    direction_llm = _tag(db, "大模型", "我的研究方向", "#0F7B6C")
    direction_rag = _tag(db, "RAG 与智能体", "我的研究方向", "#2563A5")
    direction_system = _tag(db, "大模型系统", "我的研究方向", "#7C5CFC")
    algorithm = _tag(db, "算法方法", "文献属性", "#D4893A")
    system_tag = _tag(db, "工程系统", "文献属性", "#8A5120")
    survey = _tag(db, "综述", "文献属性", "#E0A25A")
    benchmark = _tag(db, "数据集/基准", "文献属性", "#C97A35")
    core = _tag(db, "核心", "相关度", "#C23B22")
    related = _tag(db, "相关", "相关度", "#E05A40")
    background = _tag(db, "背景", "相关度", "#A33B3B")

    paper_specs = [
        ("Evidence-Grounded Preference Optimization for Domain Language Models", "Li Ming, Chen Yu", "ACL2027", "deep", True, "用可验证证据构造偏好信号，减少领域问答中的事实幻觉。", (direction_llm, algorithm, core), alignment),
        ("Layered Retrieval for Long-Context Question Answering", "Zhou Lin, Wang Qi", "EMNLP2027", "deep", True, "将章节级召回、段落级重排与引用校验组合为长文档 RAG 流程。", (direction_rag, algorithm, core), rag),
        ("Process Verification for Tool-Using Research Agents", "Demo Agent Lab", "NeurIPS2026", "deep", True, "对工具调用轨迹进行过程验证，并在失败节点触发局部恢复。", (direction_rag, algorithm, core), agent),
        ("Paged Memory Management for High-Throughput LLM Serving", "Systems Demo Group", "MLSys2026", "deep", True, "讨论面向大模型在线推理的分页 KV Cache 与连续批处理。", (direction_system, system_tag, core), serving),
        ("A Practical Survey of Post-Training Large Language Models", "Open Research Collective", "TACL2026", "reading", False, "梳理 SFT、偏好优化、奖励建模和安全对齐的常见实践。", (direction_llm, survey, related), alignment),
        ("Citation Faithfulness Benchmark for Retrieval-Augmented Generation", "Benchmark Team", "NAACL2027", "reading", False, "提供检索召回、引用正确性和回答支持度的分层评测集。", (direction_rag, benchmark, related), rag),
        ("KV Cache Compression under Long Contexts", "Huang Lei, Sun Fei", "ICML2026", "reading", True, "比较量化、淘汰与低秩缓存压缩对质量和吞吐的影响。", (direction_system, algorithm, related), efficiency),
        ("Failure Taxonomy of Autonomous Language Model Agents", "Reliable AI Group", "ICLR2027", "todo", False, "从规划、工具、记忆、验证和恢复五个环节整理智能体失败类型。", (direction_rag, benchmark, related), agent),
        ("Data Curation Recipes for Small-Scale Language Model Alignment", "Data Centric Lab", "COLM2027", "todo", False, "聚焦有限标注预算下的偏好数据筛选、去重和难例挖掘。", (direction_llm, algorithm, related), alignment),
        ("Efficient Decoding Methods: A Reproducibility Study", "Inference Study Group", "MLSys2027", "todo", False, "对推测解码、动态批处理和量化部署进行统一复现。", (direction_system, benchmark, background), serving),
        ("When Long Context Is Not Enough: Retrieval versus Memory", "Context Lab", "ACL2026", "todo", False, "比较长上下文、外部检索和压缩记忆在不同任务上的边界。", (direction_rag, algorithm, background), rag),
        ("Evaluating Refusal Boundaries in Specialized Language Models", "Safety Evaluation Lab", "EMNLP2026", "deep", False, "构造应该回答、应该拒绝和信息不足三类边界样例。", (direction_llm, benchmark, core), alignment),
    ]
    papers: list[models.Paper] = []
    for index, (title, authors, venue, status, starred, abstract, tags, project) in enumerate(paper_specs, 1):
        full_title = f"{DEMO_PREFIX}{title}"
        paper = db.query(models.Paper).filter_by(title=full_title).first()
        if not paper:
            paper = models.Paper(
                title=full_title, authors=authors, venue=venue,
                doi=f"10.0000/demo.llm.{index:03d}", status=status, starred=starred,
                abstract=f"演示摘要：{abstract} 本记录为虚构演示数据，不对应真实论文。",
                paper_type="conference", local_path="",
                reading_depth="intensive" if status == "deep" else "skim",
                reading_seconds=3600 if status == "deep" else (900 if status == "reading" else 0),
            )
            db.add(paper)
            db.flush()
            created["papers"] = created.get("papers", 0) + 1
        papers.append(paper)
        for tag in tags:
            _paper_tag(db, paper, tag)
        _project_link(db, paper, project)
        sync_queue_tags_from_status(db, paper)

    note_specs = {
        0: ("领域偏好数据不足且事实奖励难以稳定。", "证据化 DPO + 事实一致性奖励。", "领域问答演示集", "事实准确率、拒答准确率、幻觉率", "优先验证奖励权重和偏好数据规模。"),
        1: ("长文档切分会破坏跨章节证据。", "层级召回 + cross-encoder 重排 + 引用校验。", "LongDoc-Demo", "Recall@K、Citation F1、Answer F1", "补充不同 chunk 大小和 top-k 消融。"),
        2: ("智能体最终成功不代表过程可靠。", "轨迹验证器在每个工具步骤检查前置条件与输出。", "ResearchAgent-Demo", "任务成功率、恢复率、无效调用率", "实现反思基线并统一预算。"),
        3: ("KV Cache 的连续分配限制高并发吞吐。", "分页缓存 + 连续批处理。", "Serving-Demo", "TTFT、TPOT、tokens/s、显存", "固定输入输出长度重新跑并发曲线。"),
        11: ("专业模型的拒答边界容易过度保守。", "三分边界数据 + calibrated refusal head。", "Refusal-Demo", "回答准确率、拒答准确率、ECE", "检查信息不足样例的一致性。"),
    }
    paper_note_ids: dict[int, int] = {}
    for index, (motivation, method, datasets, metrics, next_actions) in note_specs.items():
        paper = papers[index]
        note = db.query(models.PaperNote).filter_by(paper_id=paper.id).first()
        if not note:
            note = models.PaperNote(
                paper_id=paper.id, motivation=motivation,
                problem="如何建立可复现且能解释失败原因的实验方案？",
                method=method, datasets=datasets, metrics=metrics,
                results="当前结果为演示占位，用于展示笔记与阅读状态联动。",
                limitations="演示文献和数值均为虚构内容，不可作为真实引用。",
                relation_to_my_work="已关联到对应的大模型演示项目。",
                next_actions=next_actions,
                raw_markdown=f"""# {paper.title.removeprefix(DEMO_PREFIX)}

## 一句话结论

{method}

| 维度 | 记录 |
| --- | --- |
| 数据 | {datasets} |
| 指标 | {metrics} |
| 下一步 | {next_actions} |

> 虚构演示文献，不对应真实论文或实验结果。
""",
            )
            db.add(note)
            db.flush()
            created["paper_notes"] = created.get("paper_notes", 0) + 1
        paper_note_ids[index] = note.id

    reading_sessions = [
        ("对齐与事实可靠性精读", "对齐,DPO,幻觉,拒答", "比较偏好数据、事实奖励和拒答边界。", [0, 4, 8, 11]),
        ("RAG 与智能体方法对比", "RAG,Agent,证据,验证", "分开观察检索、生成、工具调用与过程验证。", [1, 2, 5, 7, 10]),
    ]
    for title, tags, summary, indices in reading_sessions:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.ReadingSession).filter_by(title=full_title).first():
            session = models.ReadingSession(title=full_title, theme_tags=tags, summary=summary, status="active")
            db.add(session)
            db.flush()
            for index in indices:
                db.add(models.ReadingSessionPaper(
                    session_id=session.id, paper_id=papers[index].id,
                    one_liner="演示横向阅读条目，用于比较方法、证据和实验设计。",
                ))
            created["reading_sessions"] = created.get("reading_sessions", 0) + 1

    experiment_specs = [
        (alignment, "DPO 与事实奖励联合消融", "事实奖励能在保持偏好胜率的同时降低幻觉。", "running", {"beta": 0.1, "fact_weight": [0.0, 0.2, 0.5], "seed": 42}, {"win_rate": 0.64, "hallucination": 0.12}, "", "comparison_bar"),
        (alignment, "偏好数据规模曲线", "高质量难例比简单扩大数据量更有效。", "planned", {"samples": [300, 600, 1200, 2400]}, {}, "", "line"),
        (rag, "Chunk 与 Top-K 对比", "层级切分能提升跨章节证据召回。", "done", {"chunk": [256, 512, 1024], "top_k": [5, 10, 20]}, {"recall_at_10": 0.83, "citation_f1": 0.71}, "512 tokens + top-10 在成本与效果之间最好。", "heatmap"),
        (agent, "失败恢复策略对比", "局部回滚比整条轨迹重试更节省工具预算。", "failed", {"retry_budget": 3, "strategies": ["full", "local"]}, {}, "", "comparison_bar"),
        (serving, "并发吞吐与首 Token 延迟", "连续批处理提高吞吐，但高并发下尾延迟上升。", "done", {"concurrency": [1, 8, 16, 32], "input_len": 1024, "output_len": 256}, {"peak_tokens_s": 2840, "p95_ttft_ms": 780}, "并发 16 是当前显卡上的平衡点。", "line"),
        (efficiency, "4-bit 量化复现实验", "分层量化比统一量化更能保留长文本能力。", "done", {"bits": 4, "group_size": 128}, {"memory_gb": 7.8, "relative_score": 0.97}, "复现实验已归档。", "comparison_bar"),
    ]
    for project, title, hypothesis, status, params, metrics, conclusion, style in experiment_specs:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.ExperimentRun).filter_by(title=full_title).first():
            db.add(models.ExperimentRun(
                project_id=project.id, title=full_title, hypothesis=hypothesis,
                params_json=json.dumps(params, ensure_ascii=False), metrics_json=json.dumps(metrics, ensure_ascii=False),
                status=status, conclusion=conclusion,
                failure_reason="显存不足导致第三组配置未完成；需减小 batch 并重新排队。" if status == "failed" else "",
                started_at=now - timedelta(days=5) if status != "planned" else None,
                ended_at=now - timedelta(days=2) if status in ("done", "failed") else None,
                style_template_id=style,
            ))
            created["experiments"] = created.get("experiments", 0) + 1

    task_specs = [
        ("整理领域偏好数据难例", "todo", "high", today + timedelta(days=1), alignment, 90),
        ("跑完事实奖励权重消融", "doing", "urgent", today, alignment, 180),
        ("检查拒答边界标注一致性", "blocked", "high", today + timedelta(days=2), alignment, 60),
        ("精读一篇对齐综述", "done", "medium", today - timedelta(days=1), alignment, 50),
        ("补齐 RAG 错误分析表", "doing", "high", today + timedelta(days=2), rag, 120),
        ("重写论文 Limitations", "todo", "medium", today + timedelta(days=4), rag, 60),
        ("复现反思型 Agent 强基线", "doing", "urgent", today + timedelta(days=3), agent, 240),
        ("整理 R&R 逐点回复", "todo", "high", today + timedelta(days=6), agent, 120),
        ("定位失败实验的显存峰值", "blocked", "medium", today + timedelta(days=1), agent, 45),
        ("跑 vLLM 并发基准", "doing", "high", today + timedelta(days=2), serving, 120),
        ("画出 Scheduler 调用图", "todo", "medium", today + timedelta(days=5), serving, 90),
        ("归档小模型量化复现材料", "done", "low", today - timedelta(days=3), efficiency, 40),
    ]
    for title, status, priority, due, project, estimate in task_specs:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.Task).filter_by(title=full_title).first():
            db.add(models.Task(
                title=full_title, status=status, priority=priority, due_date=due,
                project_id=project.id, description=f"来自演示项目「{project.title}」",
                estimate_minutes=estimate,
                completed_at=now - timedelta(days=1) if status == "done" else None,
            ))
            created["tasks"] = created.get("tasks", 0) + 1

    event_specs = [
        ("组会：汇报事实奖励消融", "meeting", today + timedelta(days=1), 14, alignment),
        ("RAG 论文内部评审", "meeting", today + timedelta(days=3), 10, rag),
        ("智能体 R&R 补实验截止", "deadline", today + timedelta(days=7), 9, agent),
        ("vLLM 工程复盘", "meeting", today + timedelta(days=5), 16, serving),
        ("ACL 投稿截止", "deadline", today + timedelta(days=80), 23, alignment),
    ]
    for title, event_type, day, hour, project in event_specs:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.CalendarEvent).filter_by(title=full_title).first():
            db.add(models.CalendarEvent(
                title=full_title, event_type=event_type,
                start_at=datetime.combine(day, datetime.min.time()).replace(hour=hour),
                all_day=event_type == "deadline", project_id=project.id, notes="演示日程",
            ))
            created["events"] = created.get("events", 0) + 1

    conference_map = {row.short_name: row for row in db.query(models.Conference).all()}
    submission_specs = [
        ("Evidence-Grounded Alignment for Domain LLMs", alignment, "ACL", "writing", today + timedelta(days=80), "正在完成主实验与论文初稿。"),
        ("Layered Retrieval for Long Documents", rag, "ACL", "internal_review", today + timedelta(days=35), "初稿已完成，等待组内反馈。"),
        ("可验证的科研智能体", agent, "NeurIPS", "revision", today + timedelta(days=18), "已收到审稿意见，正在补强基线与跨模型实验。"),
        ("Memory-Efficient Inference for Small LMs", efficiency, "ICML", "accepted", today - timedelta(days=75), "已接收，代码和复现说明已公开。"),
        ("Adaptive Retrieval Budget for RAG", rag, "ICLR", "submitted", today - timedelta(days=12), "已投稿，等待评审结果。"),
        ("Early Study on Agent Memory", agent, "AAAI", "rejected", today - timedelta(days=120), "早期方案被拒，关键问题已整理为后续实验。"),
    ]
    for title, project, venue, status, deadline, notes in submission_specs:
        full_title = f"{DEMO_PREFIX}{title}"
        if db.query(models.Submission).filter_by(title=full_title).first():
            continue
        submission = models.Submission(
            title=full_title, target_type="conference",
            conference_id=conference_map.get(venue).id if conference_map.get(venue) else None,
            project_id=project.id, authors="Demo Author, Research Collaborator",
            status=status, deadline=deadline, notes=f"演示投稿：{notes}",
        )
        db.add(submission)
        db.flush()
        events = [("created", now - timedelta(days=120), "建立投稿记录。")]
        if status in ("submitted", "revision", "accepted", "rejected"):
            events.append(("submitted", now - timedelta(days=45), "完成投稿。"))
        if status == "revision":
            events.append(("decision", now - timedelta(days=8), "收到返修意见，进入补实验阶段。"))
        if status == "accepted":
            events.append(("accepted", now - timedelta(days=70), "论文接收，进入材料归档。"))
        if status == "rejected":
            events.append(("rejected", now - timedelta(days=90), "论文未接收，已整理失败原因。"))
        for event_type, happened_at, content in events:
            db.add(models.SubmissionEvent(
                submission_id=submission.id, event_type=event_type,
                happened_at=happened_at, content=content,
            ))
        created["submissions"] = created.get("submissions", 0) + 1

    meeting_specs = [
        ("大模型项目周会", alignment, "同步对齐、RAG 与智能体三条主线", "对齐主项目优先完成事实奖励消融；RAG 本周进入内部评审。", "冻结本周实验范围，新增想法先进入 Inbox。"),
        ("R&R 专项讨论", agent, "拆解审稿意见与补实验优先级", "强基线和评价协议是两个最高风险项。", "先复现强基线，再做跨模型扩展。"),
    ]
    for title, project, agenda, notes, decisions in meeting_specs:
        full_title = f"{DEMO_PREFIX}{title}"
        if db.query(models.Meeting).filter_by(title=full_title).first():
            continue
        meeting = models.Meeting(
            title=full_title, meeting_type="group", start_at=now - timedelta(days=3),
            project_id=project.id, agenda=agenda, notes=notes, decisions=decisions,
        )
        db.add(meeting)
        db.flush()
        db.add(models.MeetingActionItem(
            meeting_id=meeting.id, content="整理会议决策并更新项目下一步",
            due_date=today + timedelta(days=1), done=False,
        ))
        created["meetings"] = created.get("meetings", 0) + 1

    idea_specs = [
        ("用引用一致性作为偏好数据过滤器", "inspiration", "对齐,数据", alignment, papers[0]),
        ("让 Agent 在每次工具调用前声明可验证预期", "inspiration", "Agent,验证", agent, papers[2]),
        ("把 TTFT 和研究任务优先级结合做调度", "record", "推理系统,调度", serving, papers[3]),
        ("RAG 错误分析按检索失败和生成失败分层", "record", "RAG,评测", rag, papers[1]),
    ]
    for title, category, tags, project, paper in idea_specs:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.Idea).filter_by(title=full_title).first():
            db.add(models.Idea(
                title=full_title, content=f"{title}。先作为演示想法保留，验证后再转任务。",
                tags=tags, category=category, status="open",
                linked_project_ids=str(project.id), linked_paper_ids=str(paper.id),
            ))
            created["ideas"] = created.get("ideas", 0) + 1

    inbox_specs = [
        ("补查偏好数据去重是否会影响难例比例", alignment),
        ("记录一个关于长上下文与 RAG 边界的反例", rag),
        ("确认审稿人要求的基线是否有公开代码", agent),
        ("下次工程复盘加入 GPU 利用率曲线", serving),
    ]
    for content, project in inbox_specs:
        full_content = f"{DEMO_PREFIX}{content}"
        if not db.query(models.InboxItem).filter_by(content=full_content).first():
            db.add(models.InboxItem(content=full_content, item_type="note", processed=False, project_id=project.id))
            created["inbox"] = created.get("inbox", 0) + 1

    if not db.query(models.CheckIn).filter(models.CheckIn.note.like(f"{DEMO_PREFIX}%")).first():
        checkins = [
            (0, "experiment", 110, "事实奖励消融"),
            (1, "reading", 55, "文献阅读"),
            (2, "writing", 80, "RAG 错误分析"),
            (3, "experiment", 95, "智能体强基线复现"),
            (4, "reading", 45, "文献阅读"),
        ]
        for offset, kind, minutes, note in checkins:
            db.add(models.CheckIn(day=today - timedelta(days=offset), kind=kind, minutes=minutes, note=f"{DEMO_PREFIX}{note}"))
        created["checkins"] = len(checkins)

    focus_specs = [
        ("对齐消融实验", alignment, 90, "完成两组权重并记录异常样例。"),
        ("精读长文档 RAG", rag, 50, "整理检索与引用评价指标。"),
        ("vLLM 调度器源码", serving, 60, "画出 scheduler 到 worker 的调用路径。"),
    ]
    for offset, (title, project, minutes, outcome) in enumerate(focus_specs, 1):
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.FocusSession).filter_by(title=full_title).first():
            ended = now - timedelta(days=offset)
            db.add(models.FocusSession(
                title=full_title, link_type="project", link_id=project.id,
                started_at=ended - timedelta(minutes=minutes), ended_at=ended,
                duration_seconds=minutes * 60, planned_minutes=minutes,
                outcome=outcome, active=False,
            ))
            created["focus_sessions"] = created.get("focus_sessions", 0) + 1

    if not db.query(models.LifeEntry).filter_by(title=f"{DEMO_PREFIX}本周生活清单").first():
        db.add(models.LifeEntry(
            category="list", title=f"{DEMO_PREFIX}本周生活清单",
            content="运动两次 / 整理报销 / 周末留半天不看实验", day=today,
        ))
        created["life_entries"] = 1

    thesis = db.query(models.ThesisMeta).first()
    if thesis:
        thesis.title = "示例·面向可靠应用的大模型方法与系统研究"
        thesis.subtitle = "从对齐、检索增强到高效推理"
        thesis.research_question = "如何从数据、模型、系统和应用四个层面提升大模型的可靠性与效率？"
        thesis.contribution = "领域对齐方法、证据化 RAG、可验证智能体与高效推理系统。"
        thesis.notes = "演示论文总览，可在个人空间中建立自己的真实论文结构。"

    conversation_specs = [
        (
            "梳理本周大模型研究主线",
            "请根据对齐项目和文献笔记，把本周工作收敛成三个动作。",
            [
                {"type": "project", "id": alignment.id, "title": alignment.title},
                {"type": "paper_note", "id": paper_note_ids[0], "title": papers[0].title},
            ],
            "## 本周三个动作\n\n1. 固定偏好数据版本并完成事实奖励权重消融。\n2. 把拒答边界样例纳入统一评测。\n3. 将失败案例同步写入项目笔记和论文错误分析。\n\n> 这是离线演示对话，不会调用模型。",
        ),
        (
            "比较 RAG 与长上下文方案",
            "基于项目和笔记，给出下一轮对比实验最小集合。",
            [
                {"type": "project", "id": rag.id, "title": rag.title},
                {"type": "paper_note", "id": paper_note_ids[1], "title": papers[1].title},
            ],
            "## 最小对比集合\n\n- 固定生成模型，对比纯长上下文、单级检索、层级检索。\n- 统一报告答案 F1、证据 Recall@K、引用准确率与延迟。\n- 对跨章节问题单独做错误分析。",
        ),
    ]
    for title, prompt, contexts, reply in conversation_specs:
        full_title = f"{DEMO_PREFIX}{title}"
        if not db.query(models.AgentConversation).filter_by(title=full_title).first():
            db.add(models.AgentConversation(
                title=full_title, mode="general", backend="demo",
                messages_json=json.dumps([
                    {"role": "user", "content": prompt, "files": [], "contexts": contexts},
                    {"role": "assistant", "content": reply},
                ], ensure_ascii=False),
                created_at=now - timedelta(hours=2), updated_at=now - timedelta(hours=2),
            ))
            created["agent_conversations"] = created.get("agent_conversations", 0) + 1

    db.commit()
    return {"ok": True, "mode": "seed_demo", "version": DEMO_DATA_VERSION, "created": created}
