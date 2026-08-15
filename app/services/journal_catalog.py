"""Curated journal catalog: graduation-friendly + AI/CAD-adjacent venues.

Entries with tags containing「最具」come from the 2022「理工最具国际影响力」list
(filtered for AI / vision / graphics / CAD / design / manufacturing).
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app import models


def _j(
    name: str,
    *,
    tier: str,
    field: str,
    publisher: str = "",
    quartile: str = "Q1",
    notes: str = "",
    excel: bool = False,
) -> dict:
    tags = "最具" if excel else ""
    note = notes
    if excel and "理工最具" not in note:
        note = (note + " · 2022理工最具").strip(" ·")
    return {
        "name": name,
        "tier": tier,
        "quartile": quartile,
        "field": field,
        "publisher": publisher,
        "notes": note,
        "tags": tags,
    }


# tier: top | trans | regular
JOURNAL_CATALOG: list[dict] = [
    # —— 顶刊 ——
    _j("IEEE TPAMI", tier="top", field="AI/CV", publisher="IEEE", excel=True,
       notes="顶刊 · IEEE Transactions on Pattern Analysis and Machine Intelligence"),
    _j("IJCV", tier="top", field="AI/CV", publisher="Springer", excel=True,
       notes="顶刊 · International Journal of Computer Vision"),
    _j("JMLR", tier="top", field="AI/ML", publisher="JMLR", excel=True,
       notes="顶刊 · Journal of Machine Learning Research"),
    _j("Artificial Intelligence", tier="top", field="AI", publisher="Elsevier", excel=True,
       notes="顶刊 · AI Journal"),
    _j("ACM TOG", tier="top", field="Graphics", publisher="ACM", excel=True,
       notes="顶刊 · ACM Transactions on Graphics · 图形学旗舰"),
    _j("ACM Computing Surveys", tier="top", field="CS", publisher="ACM", excel=True,
       notes="顶刊 · 综述类高引用"),
    _j("IEEE TVCG", tier="top", field="Graphics", publisher="IEEE", excel=True,
       notes="顶刊向 · Visualization and Computer Graphics"),
    _j("Science Robotics", tier="top", field="Robotics", publisher="AAAS", excel=True,
       notes="顶刊向 · 机器人 / 具身智能"),
    _j("Nature Machine Intelligence", tier="top", field="AI", publisher="Nature",
       notes="顶刊 · 毕业/代表作向 · AI 交叉（非理工最具表）"),
    # —— Trans ——
    _j("IEEE TNNLS", tier="trans", field="AI/ML", publisher="IEEE", excel=True,
       notes="Trans · Neural Networks and Learning Systems"),
    _j("IEEE TIP", tier="trans", field="AI/CV", publisher="IEEE", excel=True,
       notes="Trans · Image Processing"),
    _j("IEEE TMM", tier="trans", field="AI/MM", publisher="IEEE", excel=True,
       notes="Trans · Multimedia"),
    _j("IEEE TEVC", tier="trans", field="AI", publisher="IEEE", excel=True,
       notes="Trans · Evolutionary Computation"),
    _j("IEEE TCI", tier="trans", field="AI/Imaging", publisher="IEEE", excel=True,
       notes="Trans · Computational Imaging"),
    _j("IEEE TAFFC", tier="trans", field="AI", publisher="IEEE", excel=True,
       notes="Trans · Affective Computing"),
    _j("IEEE TRO", tier="trans", field="Robotics", publisher="IEEE", excel=True,
       notes="Trans · Robotics"),
    _j("IEEE TCyb", tier="trans", field="AI", publisher="IEEE", excel=True,
       notes="Trans · Cybernetics · 智能系统"),
    _j("IEEE TFS", tier="trans", field="AI", publisher="IEEE", excel=True,
       notes="Trans · Fuzzy Systems"),
    _j("IEEE TII", tier="trans", field="AI/Industrial", publisher="IEEE", excel=True,
       notes="Trans · Industrial Informatics · 工业智能"),
    _j("IEEE TKDE", tier="trans", field="AI/Data", publisher="IEEE", excel=True,
       notes="Trans · Knowledge and Data Engineering"),
    _j("IEEE TSMC", tier="trans", field="AI/Systems", publisher="IEEE", excel=True,
       notes="Trans · Systems, Man, and Cybernetics"),
    _j("IEEE THMS", tier="trans", field="HMI", publisher="IEEE", excel=True,
       notes="Trans · Human-Machine Systems"),
    _j("IEEE TASE", tier="trans", field="Automation", publisher="IEEE", excel=True,
       notes="Trans · Automation Science and Engineering"),
    _j("IEEE TCSVT", tier="trans", field="AI/CV", publisher="IEEE", excel=True,
       notes="Trans · Circuits and Systems for Video Technology"),
    _j("IEEE/ASME Mechatronics", tier="trans", field="Mechatronics", publisher="IEEE/ASME", excel=True,
       notes="Trans · 机电一体化 · 设计制造交叉"),
    _j("ASME JMSE", tier="trans", field="CAD/Mfg", publisher="ASME", excel=True,
       notes="Trans · Manufacturing Science and Engineering"),
    _j("CMAME", tier="trans", field="CAD/CAE", publisher="Elsevier", excel=True,
       notes="准 Trans · Computer Methods in Applied Mechanics and Engineering"),
    _j("ACM TIST", tier="trans", field="AI", publisher="ACM", excel=True,
       notes="Trans · Intelligent Systems and Technology"),
    _j("ACM TKDD", tier="trans", field="AI/Data", publisher="ACM", excel=True,
       notes="Trans · Knowledge Discovery from Data"),
    _j("Fuzzy Sets and Systems", tier="regular", field="AI", publisher="Elsevier", excel=True,
       notes="模糊系统经典刊 · 软计算/不确定性建模"),
    _j("IEEE Robotics & Automation Magazine", tier="regular", field="Robotics", publisher="IEEE", excel=True,
       notes="机器人与自动化杂志 · 综述/应用向"),
    # —— 普通 / 毕业神刊 + CAD 沾边 ——
    _j("Computer-Aided Design", tier="regular", field="CAD", publisher="Elsevier", excel=True,
       notes="CAD 主场刊 · AI+CAD 首选"),
    _j("Computer-Aided Geometric Design", tier="regular", field="CAD", publisher="Elsevier",
       notes="CAGD · B-rep/曲线曲面 · AI+CAD 强相关（非理工最具表）"),
    _j("Journal of Computational Design and Engineering", tier="regular", field="CAD", publisher="OUP",
       notes="JCDE · CAD/特征识别常见出口（非理工最具表）"),
    _j("Computer Graphics Forum", tier="regular", field="Graphics", publisher="Wiley",
       notes="Eurographics 刊（非理工最具表）"),
    _j("Computers & Graphics", tier="regular", field="Graphics", publisher="Elsevier", quartile="Q2",
       notes="图形学常规刊（非理工最具表）"),
    _j("The Visual Computer", tier="regular", field="Graphics", publisher="Springer", quartile="Q2",
       notes="图形学 · 几何/视觉交叉（非理工最具表）"),
    _j("Graphical Models", tier="regular", field="Graphics", publisher="Elsevier", quartile="Q2",
       notes="几何建模（非理工最具表）"),
    _j("Engineering with Computers", tier="regular", field="CAD/CAE", publisher="Springer",
       notes="工程计算/CAD·CAE（非理工最具表）"),
    _j("Advances in Engineering Software", tier="regular", field="CAD/Soft", publisher="Elsevier", excel=True,
       notes="工程软件 · CAD 系统可投"),
    _j("Automation in Construction", tier="regular", field="CAD/AEC", publisher="Elsevier", excel=True,
       notes="建筑/土木自动化 · BIM·CAD 沾边"),
    _j("Computer-Aided Civil and Infrastructure Engineering", tier="regular", field="CAD/AEC",
       publisher="Wiley", excel=True, notes="土木智能"),
    _j("ASME Journal of Mechanical Design", tier="regular", field="Design", publisher="ASME", excel=True,
       notes="机械设计 · CAD/设计方法"),
    _j("Journal of Mechanisms and Robotics", tier="regular", field="Robotics/Design", publisher="ASME",
       excel=True, notes="机构与机器人"),
    _j("IJMTM", tier="regular", field="Mfg/CAD", publisher="Elsevier", excel=True,
       notes="International Journal of Machine Tools & Manufacture"),
    _j("Materials & Design", tier="regular", field="Design/Mfg", publisher="Elsevier", excel=True,
       notes="材料与设计交叉"),
    _j("CIRP Annals", tier="regular", field="Mfg", publisher="CIRP", excel=True,
       notes="制造顶刊向 · CAD/CAM 沾边"),
    _j("Additive Manufacturing", tier="regular", field="Mfg/CAD", publisher="Elsevier",
       notes="增材制造（非理工最具表）"),
    _j("Pattern Recognition", tier="regular", field="AI/CV", publisher="Elsevier", excel=True,
       notes="毕业神刊向 · 模式识别"),
    _j("Neural Networks", tier="regular", field="AI/ML", publisher="Elsevier", excel=True,
       notes="毕业神刊向"),
    _j("Neurocomputing", tier="regular", field="AI/ML", publisher="Elsevier", excel=True,
       notes="毕业神刊 · 周期相对友好"),
    _j("Expert Systems with Applications", tier="regular", field="AI", publisher="Elsevier", excel=True,
       notes="毕业神刊 · 应用向"),
    _j("Knowledge-Based Systems", tier="regular", field="AI", publisher="Elsevier", excel=True,
       notes="毕业神刊"),
    _j("Information Sciences", tier="regular", field="AI", publisher="Elsevier", excel=True,
       notes="毕业神刊 · 宽口径"),
    _j("Applied Soft Computing", tier="regular", field="AI", publisher="Elsevier", excel=True,
       notes="毕业神刊 · 软计算/智能优化"),
    _j("Machine Learning", tier="regular", field="AI/ML", publisher="Springer", excel=True,
       notes="ML 期刊"),
    _j("Evolutionary Computation", tier="regular", field="AI", publisher="MIT Press", excel=True,
       notes="进化计算"),
    _j("Neural Computation", tier="regular", field="AI/ML", publisher="MIT Press", excel=True,
       notes="神经计算理论"),
    _j("Computer Vision and Image Understanding", tier="regular", field="AI/CV", publisher="Elsevier",
       excel=True, notes="CVIU"),
    _j("Data Mining and Knowledge Discovery", tier="regular", field="AI/Data", publisher="Springer",
       excel=True, notes="数据挖掘"),
    _j("IEEE Intelligent Systems", tier="regular", field="AI", publisher="IEEE", excel=True,
       notes="智能系统杂志"),
    _j("International Journal of Intelligent Systems", tier="regular", field="AI", publisher="Wiley",
       excel=True, notes="智能系统"),
    _j("International Journal of Neural Systems", tier="regular", field="AI/ML", publisher="World Scientific",
       excel=True, notes="神经系统"),
    _j("IJRR", tier="regular", field="Robotics", publisher="SAGE", excel=True,
       notes="International Journal of Robotics Research"),
    _j("Soft Robotics", tier="regular", field="Robotics", publisher="Mary Ann Liebert", excel=True,
       notes="软体机器人"),
    _j("Science China Information Sciences", tier="regular", field="CS/AI", publisher="Science China",
       excel=True, notes="国内信息科学旗舰刊之一"),
]

TIER_ORDER = {"top": 0, "trans": 1, "regular": 2}
TIER_LABEL = {"top": "顶刊", "trans": "Trans", "regular": "普通"}


def normalize_tier(value: str | None) -> str:
    v = (value or "").strip().lower()
    if v in ("top", "顶刊", "flagship"):
        return "top"
    if v in ("trans", "transaction", "transactions", "汇刊"):
        return "trans"
    return "regular"


def merge_tags(*parts: str) -> str:
    seen: list[str] = []
    for p in parts:
        for t in re_split_tags(p):
            if t not in seen:
                seen.append(t)
    return ",".join(seen)


def re_split_tags(raw: str | None) -> list[str]:
    out: list[str] = []
    for t in str(raw or "").replace("，", ",").replace("、", ",").split(","):
        s = t.strip()
        if s and s not in out:
            out.append(s)
    return out


def upsert_journal_catalog(db: Session, *, only_missing: bool = False) -> dict:
    """Insert curated journals; refresh tier/tags for known names."""
    existing = {((j.name or "").strip().lower()): j for j in db.query(models.Journal).all()}
    aliases = {
        "ieee tpami": "ieee tpami",
        "jmlr": "jmlr",
        "artificial intelligence": "artificial intelligence",
        "neural networks": "neural networks",
        "ijmtm": "ijmtm",
        "international journal of machine tools & manufacture": "ijmtm",
        "international journal of machine tools and manufacture": "ijmtm",
        "ijrr": "ijrr",
        "international journal of robotics research": "ijrr",
        "asme journal of mechanical design": "asme journal of mechanical design",
        "journal of mechanical design": "asme journal of mechanical design",
    }
    added = 0
    updated = 0
    for item in JOURNAL_CATALOG:
        name = item["name"]
        key = name.strip().lower()
        row = existing.get(key)
        if not row:
            for ak, canon in aliases.items():
                if canon == key and ak in existing:
                    row = existing[ak]
                    break
                if key == ak and canon in existing:
                    row = existing[canon]
                    break
        tier = normalize_tier(item.get("tier"))
        want_tags = item.get("tags") or ""
        if row:
            if only_missing:
                if not (getattr(row, "tier", None) or "").strip():
                    row.tier = tier
                    updated += 1
                # still ensure 最具 tag when catalog says so
                if want_tags and "最具" in want_tags:
                    merged = merge_tags(getattr(row, "tags", ""), want_tags)
                    if merged != (getattr(row, "tags", "") or ""):
                        row.tags = merged
                        updated += 1
                continue
            row.tier = tier
            if item.get("quartile"):
                row.quartile = item["quartile"]
            if item.get("field"):
                row.field = item["field"]
            if item.get("publisher") and not (row.publisher or "").strip():
                row.publisher = item["publisher"]
            if item.get("notes") and not (row.notes or "").strip():
                row.notes = item["notes"]
            # tags: ensure 最具 present for excel sources; don't strip user tags
            if want_tags:
                row.tags = merge_tags(getattr(row, "tags", ""), want_tags)
            elif "最具" in (getattr(row, "tags", "") or "") and not want_tags:
                # catalog says not from excel — leave user's tags alone
                pass
            updated += 1
        else:
            db.add(
                models.Journal(
                    name=name,
                    publisher=item.get("publisher") or "",
                    quartile=item.get("quartile") or "",
                    impact_factor="",
                    field=item.get("field") or "AI",
                    oa=False,
                    notes=item.get("notes") or "",
                    tier=tier,
                    tags=want_tags,
                )
            )
            existing[key] = None
            added += 1
    db.commit()
    return {"added": added, "updated": updated, "total": len(JOURNAL_CATALOG)}
