import json
from pathlib import Path

from sqlalchemy import text, inspect

from app.database import engine


# 固定保留的元分类维度（与「我的研究方向」平行，一篇文献可多挂）
# 旧的「研究方向 / 技术路线」包装层需拆掉；「文献性质」更名为「文献属性」
META_DIMENSIONS = ("文献属性", "阅读队列", "相关度")
LEGACY_TOPIC_WRAPPERS = ("研究方向", "技术路线")
LEGACY_META_RENAMES = (("文献性质", "文献属性"),)

# dimension, name, color
DEFAULT_TAXONOMY = [
    # 文献属性 — amber/brown
    ("文献属性", "理论", "#B86B2B"),
    ("文献属性", "算法方法", "#D4893A"),
    ("文献属性", "工程系统", "#8A5120"),
    ("文献属性", "综述", "#E0A25A"),
    ("文献属性", "数据集/基准", "#C97A35"),
    # 阅读队列 — purple
    ("阅读队列", "待读", "#6B5B95"),
    ("阅读队列", "待精读", "#8B7BB5"),
    ("阅读队列", "已精读", "#4A3F6B"),
    # 相关度 — crimson
    ("相关度", "核心", "#C23B22"),
    ("相关度", "相关", "#E05A40"),
    ("相关度", "背景", "#A33B3B"),
    ("相关度", "对照/反例", "#D4786A"),
]

# remap legacy / english tags into dimensions
TAG_DIMENSION_FIXUPS = {
    "影像处理": ("自定义", "#2F6FED"),
    "待读": ("阅读队列", "#6B5B95"),
    "待精读": ("阅读队列", "#8B7BB5"),
    "已精读": ("阅读队列", "#4A3F6B"),
    "核心文献": ("相关度", "#C23B22"),
    "方法参考": ("文献属性", "#D4893A"),
    "method": ("自定义", "#0F7B6C"),
    "dataset": ("文献属性", "#C97A35"),
    "baseline": ("相关度", "#E05A40"),
    "theory": ("文献属性", "#B86B2B"),
    "gap": ("相关度", "#A33B3B"),
    "SOTA": ("相关度", "#C23B22"),
}


def _repair_mojibake_labels(conn):
    """Fix labels corrupted to '??' (often from bad console encodings when seeding)."""
    tables = set(inspect(engine).get_table_names())
    if "watch_folders" in tables:
        rows = conn.execute(text("SELECT id, name, path FROM watch_folders")).fetchall()
        for row_id, name, path in rows:
            cleaned = (name or "").replace(" ", "")
            if not cleaned or set(cleaned) <= {"?"}:
                fallback = Path(path or "").name or "papers"
                conn.execute(
                    text("UPDATE watch_folders SET name=:name WHERE id=:id"),
                    {"name": fallback, "id": row_id},
                )
    if "papers" in tables:
        conn.execute(
            text(
                """
                UPDATE papers
                SET folder = '默认'
                WHERE folder IS NULL
                   OR REPLACE(TRIM(folder), ' ', '') = ''
                   OR REPLACE(REPLACE(TRIM(folder), ' ', ''), '?', '') = ''
                """
            )
        )
    if "leave_records" in tables:
        conn.execute(
            text(
                """
                UPDATE leave_records
                SET status_label = '外出'
                WHERE status_label IS NULL
                   OR REPLACE(REPLACE(TRIM(status_label), ' ', ''), '?', '') = ''
                """
            )
        )
    if "calendar_events" in tables:
        rows = conn.execute(text("SELECT id, title, notes, event_type FROM calendar_events")).fetchall()
        for eid, title, notes, etype in rows:
            t = title or ""
            if t.startswith("??"):
                reason = (notes or "").strip() or "个人状态"
                # leave chips used to be "{status}: {reason}"
                prefix = "外出" if etype == "leave" else "日程"
                conn.execute(
                    text("UPDATE calendar_events SET title=:title WHERE id=:id"),
                    {"title": f"{prefix}: {reason}" if etype == "leave" else t.replace("??", prefix, 1), "id": eid},
                )
            elif t and set(t.replace(" ", "").replace(":", "").replace("：", "")) <= {"?"}:
                conn.execute(
                    text("UPDATE calendar_events SET title=:title WHERE id=:id"),
                    {"title": "日程", "id": eid},
                )


def _seed_taxonomy(conn):
    tables = set(inspect(engine).get_table_names())
    if "tags" not in tables:
        return
    cols = {c["name"] for c in inspect(engine).get_columns("tags")}
    if "dimension" not in cols:
        return
    existing = {
        r[0]: r
        for r in conn.execute(text("SELECT name, color, dimension FROM tags")).fetchall()
    }
    for dimension, name, color in DEFAULT_TAXONOMY:
        if name in existing:
            dim = existing[name][2] or ""
            if not dim or dim == "自定义":
                conn.execute(
                    text("UPDATE tags SET dimension=:d, color=:c WHERE name=:n"),
                    {"d": dimension, "c": color, "n": name},
                )
            continue
        conn.execute(
            text("INSERT INTO tags (name, color, dimension) VALUES (:n, :c, :d)"),
            {"n": name, "c": color, "d": dimension},
        )
    for name, (dimension, color) in TAG_DIMENSION_FIXUPS.items():
        if name not in existing and name not in {t[1] for t in DEFAULT_TAXONOMY}:
            continue
        row = conn.execute(
            text("SELECT dimension FROM tags WHERE name=:n"), {"n": name}
        ).fetchone()
        if not row:
            continue
        if not row[0] or row[0] == "自定义":
            conn.execute(
                text("UPDATE tags SET dimension=:d, color=:c WHERE name=:n"),
                {"d": dimension, "c": color, "n": name},
            )


# Old preset category names under the discarded wrappers; unused ones can be dropped.
_LEGACY_WRAPPER_SEED_NAMES = {
    "医学影像",
    "多模态融合",
    "生成式模型",
    "临床应用",
    "CNN/传统视觉",
    "Transformer",
    "Diffusion",
    "图与时序",
}


def _rename_legacy_meta_dimensions(conn):
    """Rename legacy meta dimension labels (e.g. 文献性质 → 文献属性)."""
    tables = set(inspect(engine).get_table_names())
    if "tags" not in tables:
        return
    cols = {c["name"] for c in inspect(engine).get_columns("tags")}
    if "dimension" not in cols:
        return
    for old, new in LEGACY_META_RENAMES:
        conn.execute(
            text("UPDATE tags SET dimension=:n WHERE dimension=:o"),
            {"n": new, "o": old},
        )


def _migrate_reading_queue(conn):
    """Normalize the reading queue to unopened / opened / noted semantics."""
    tables = set(inspect(engine).get_table_names())
    if not {"papers", "tags", "paper_tags"}.issubset(tables):
        return

    targets = (
        ("待读", "#6B5B95"),
        ("待精读", "#8B7BB5"),
        ("已精读", "#4A3F6B"),
    )
    for name, color in targets:
        row = conn.execute(text("SELECT id FROM tags WHERE name=:n"), {"n": name}).fetchone()
        if row:
            conn.execute(
                text("UPDATE tags SET dimension='阅读队列', color=:c WHERE id=:id"),
                {"c": color, "id": row[0]},
            )
        else:
            conn.execute(
                text("INSERT INTO tags (name, color, dimension) VALUES (:n, :c, '阅读队列')"),
                {"n": name, "c": color},
            )

    note_fields = (
        "raw_markdown", "motivation", "problem", "method", "datasets", "metrics",
        "results", "limitations", "relation_to_my_work", "quotable", "next_actions",
    )
    has_note = " OR ".join(f"TRIM(COALESCE(pn.{field}, '')) != ''" for field in note_fields)
    if "paper_notes" in tables:
        conn.execute(text(f"""
            UPDATE papers SET status='deep'
            WHERE EXISTS (
                SELECT 1 FROM paper_notes pn
                WHERE pn.paper_id=papers.id AND ({has_note})
            )
        """))
        conn.execute(text(f"""
            UPDATE papers SET status='reading'
            WHERE status IN ('reading', 'read', 'deep')
              AND NOT EXISTS (
                SELECT 1 FROM paper_notes pn
                WHERE pn.paper_id=papers.id AND ({has_note})
              )
        """))

    queue_names = ("待读", "待精读", "已精读", "精读中", "已读归档")
    placeholders = ", ".join(f":q{i}" for i in range(len(queue_names)))
    params = {f"q{i}": name for i, name in enumerate(queue_names)}
    conn.execute(
        text(f"DELETE FROM paper_tags WHERE tag_id IN (SELECT id FROM tags WHERE dimension='阅读队列' OR name IN ({placeholders}))"),
        params,
    )
    for status_sql, tag_name in (("status='todo'", "待读"), ("status='reading'", "待精读"), ("status IN ('read','deep')", "已精读")):
        conn.execute(text(f"""
            INSERT OR IGNORE INTO paper_tags (paper_id, tag_id)
            SELECT p.id, t.id FROM papers p JOIN tags t ON t.name=:name
            WHERE {status_sql}
        """), {"name": tag_name})
    conn.execute(text("DELETE FROM tags WHERE name IN ('精读中', '已读归档')"))


def _flatten_legacy_topic_wrappers(conn):
    """Remove obsolete wrapper dims 研究方向/技术路线.

    Self-built directions (e.g. CAD) stay. Wrapper seed categories that are
    unused are deleted; any remaining wrapper tags fall back to 自定义.
    """
    tables = set(inspect(engine).get_table_names())
    if "tags" not in tables:
        return
    cols = {c["name"] for c in inspect(engine).get_columns("tags")}
    if "dimension" not in cols:
        return

    for wrapper in LEGACY_TOPIC_WRAPPERS:
        rows = conn.execute(
            text("SELECT id, name FROM tags WHERE dimension=:d"),
            {"d": wrapper},
        ).fetchall()
        for tid, name in rows:
            name = (name or "").strip()
            in_use = False
            if "paper_tags" in tables:
                in_use = bool(
                    conn.execute(
                        text("SELECT 1 FROM paper_tags WHERE tag_id=:id LIMIT 1"),
                        {"id": tid},
                    ).fetchone()
                )
            if name in _LEGACY_WRAPPER_SEED_NAMES and not in_use:
                conn.execute(text("DELETE FROM tags WHERE id=:id"), {"id": tid})
            else:
                conn.execute(
                    text("UPDATE tags SET dimension='自定义' WHERE id=:id"),
                    {"id": tid},
                )

    # Also drop leftover self-named dirs created by an earlier promote pass
    # when they are unused seed leftovers.
    for name in list(_LEGACY_WRAPPER_SEED_NAMES):
        row = conn.execute(
            text("SELECT id FROM tags WHERE name=:n AND dimension=:d"),
            {"n": name, "d": name},
        ).fetchone()
        if not row:
            continue
        tid = row[0]
        in_use = False
        if "paper_tags" in tables:
            in_use = bool(
                conn.execute(
                    text("SELECT 1 FROM paper_tags WHERE tag_id=:id LIMIT 1"),
                    {"id": tid},
                ).fetchone()
            )
        if not in_use:
            conn.execute(text("DELETE FROM tags WHERE id=:id"), {"id": tid})

    if "settings" not in tables:
        return
    row = conn.execute(
        text("SELECT value FROM settings WHERE key='tag_directions'")
    ).fetchone()
    dirs = []
    if row and row[0]:
        try:
            data = json.loads(row[0])
            if isinstance(data, list):
                dirs = data
        except Exception:
            dirs = []
    cleaned = []
    seen: set[str] = set()
    for item in dirs:
        if isinstance(item, str):
            name, color = item.strip(), "#2F6FED"
        elif isinstance(item, dict):
            name = str(item.get("name") or "").strip()
            color = str(item.get("color") or "#2F6FED")
        else:
            continue
        if (
            not name
            or name in LEGACY_TOPIC_WRAPPERS
            or name in META_DIMENSIONS
            or name in _LEGACY_WRAPPER_SEED_NAMES
            or name == "自定义"
        ):
            continue
        if name in seen:
            continue
        seen.add(name)
        cleaned.append({"name": name, "color": color or "#2F6FED"})
    payload = json.dumps(cleaned, ensure_ascii=False)
    exists = conn.execute(
        text("SELECT 1 FROM settings WHERE key='tag_directions'")
    ).fetchone()
    if exists:
        conn.execute(
            text("UPDATE settings SET value=:v WHERE key='tag_directions'"),
            {"v": payload},
        )
    else:
        conn.execute(
            text("INSERT INTO settings (key, value) VALUES ('tag_directions', :v)"),
            {"v": payload},
        )


def ensure_schema():
    """Add new columns to existing SQLite tables without wiping data."""
    insp = inspect(engine)
    with engine.begin() as conn:
        if "papers" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("papers")}
            alters = []
            if "reading_depth" not in cols:
                alters.append("ALTER TABLE papers ADD COLUMN reading_depth VARCHAR(30) DEFAULT 'skim'")
            if "next_review_at" not in cols:
                alters.append("ALTER TABLE papers ADD COLUMN next_review_at DATE")
            if "xp" not in cols:
                alters.append("ALTER TABLE papers ADD COLUMN xp INTEGER DEFAULT 0")
            if "starred" not in cols:
                alters.append("ALTER TABLE papers ADD COLUMN starred BOOLEAN DEFAULT 0")
            for sql in alters:
                conn.execute(text(sql))

        if "projects" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("projects")}
            mapping = {
                "stage": "ALTER TABLE projects ADD COLUMN stage VARCHAR(50) DEFAULT '选题'",
                "progress": "ALTER TABLE projects ADD COLUMN progress INTEGER DEFAULT 0",
                "next_step": "ALTER TABLE projects ADD COLUMN next_step VARCHAR(400) DEFAULT ''",
                "next_step_deadline": "ALTER TABLE projects ADD COLUMN next_step_deadline DATE",
                "target_venue": "ALTER TABLE projects ADD COLUMN target_venue VARCHAR(300) DEFAULT ''",
                "overleaf_url": "ALTER TABLE projects ADD COLUMN overleaf_url VARCHAR(500) DEFAULT ''",
                "code_repo": "ALTER TABLE projects ADD COLUMN code_repo VARCHAR(500) DEFAULT ''",
                "folder_path": "ALTER TABLE projects ADD COLUMN folder_path VARCHAR(1000) DEFAULT ''",
                "hidden": "ALTER TABLE projects ADD COLUMN hidden BOOLEAN DEFAULT 0",
                "deleted_at": "ALTER TABLE projects ADD COLUMN deleted_at DATETIME",
            }
            for name, sql in mapping.items():
                if name not in cols:
                    conn.execute(text(sql))

        if "focus_sessions" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("focus_sessions")}
            if "planned_minutes" not in cols:
                conn.execute(text("ALTER TABLE focus_sessions ADD COLUMN planned_minutes INTEGER DEFAULT 25"))
            if "deleted_at" not in cols:
                conn.execute(text("ALTER TABLE focus_sessions ADD COLUMN deleted_at DATETIME"))

        if "ideas" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("ideas")}
            if "status" not in cols:
                conn.execute(text("ALTER TABLE ideas ADD COLUMN status VARCHAR(30) DEFAULT 'open'"))
            if "deleted_at" not in cols:
                conn.execute(text("ALTER TABLE ideas ADD COLUMN deleted_at DATETIME"))

        if "journals" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("journals")}
            if "tier" not in cols:
                conn.execute(text("ALTER TABLE journals ADD COLUMN tier VARCHAR(20) DEFAULT 'regular'"))
            if "tags" not in cols:
                conn.execute(text("ALTER TABLE journals ADD COLUMN tags VARCHAR(200) DEFAULT ''"))

        if "experiment_runs" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("experiment_runs")}
            if "style_template_id" not in cols:
                conn.execute(
                    text("ALTER TABLE experiment_runs ADD COLUMN style_template_id VARCHAR(80) DEFAULT ''")
                )
            if "deleted_at" not in cols:
                conn.execute(text("ALTER TABLE experiment_runs ADD COLUMN deleted_at DATETIME"))

        if "tasks" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("tasks")}
            if "deleted_at" not in cols:
                conn.execute(text("ALTER TABLE tasks ADD COLUMN deleted_at DATETIME"))

        if "tags" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("tags")}
            if "dimension" not in cols:
                conn.execute(
                    text("ALTER TABLE tags ADD COLUMN dimension VARCHAR(80) DEFAULT '自定义'")
                )

        if "thesis_milestones" in insp.get_table_names():
            cols = {c["name"] for c in insp.get_columns("thesis_milestones")}
            if "location" not in cols:
                conn.execute(text("ALTER TABLE thesis_milestones ADD COLUMN location VARCHAR(300) DEFAULT ''"))
            if "outcome" not in cols:
                conn.execute(text("ALTER TABLE thesis_milestones ADD COLUMN outcome TEXT DEFAULT ''"))

        # paper_projects created via metadata.create_all; backfill from papers.project_id
        tables = set(insp.get_table_names())
        if "paper_projects" in tables and "papers" in tables:
            conn.execute(
                text(
                    """
                    INSERT OR IGNORE INTO paper_projects (paper_id, project_id)
                    SELECT id, project_id FROM papers
                    WHERE project_id IS NOT NULL
                    """
                )
            )

        _repair_mojibake_labels(conn)
        _rename_legacy_meta_dimensions(conn)
        _seed_taxonomy(conn)
        _migrate_reading_queue(conn)
        _flatten_legacy_topic_wrappers(conn)
