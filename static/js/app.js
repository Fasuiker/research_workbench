const ICONS = {
  home: '<svg viewBox="0 0 24 24"><path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z"/></svg>',
  research: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="7" height="7" rx="1.5"/><rect x="14" y="4" width="7" height="7" rx="1.5"/><rect x="3" y="13" width="7" height="7" rx="1.5"/><rect x="14" y="13" width="7" height="7" rx="1.5"/></svg>',
  papers: '<svg viewBox="0 0 24 24"><path d="M7 4h7l3 3v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1z"/><path d="M14 4v4h4M9 12h6M9 16h6"/></svg>',
  outputs: '<svg viewBox="0 0 24 24"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 19h14"/></svg>',
  meetings: '<svg viewBox="0 0 24 24"><path d="M8 10a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM16 11a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z"/><path d="M3.5 19c.8-3 2.8-4.5 4.5-4.5S11.7 16 12.5 19M13 19c.5-2.2 1.8-3.5 3-3.5s2.6 1.2 3.2 3.5"/></svg>',
  ideas: '<svg viewBox="0 0 24 24"><path d="M9 18h6M10 21h4"/><path d="M8 14a5 5 0 1 1 8 0c-.8.9-1.3 1.6-1.5 2.5H9.5C9.3 15.6 8.8 14.9 8 14z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>',
  tasks: '<svg viewBox="0 0 24 24"><path d="m9 11 2.2 2.2L16 8.5"/><rect x="3" y="4" width="18" height="16" rx="2"/></svg>',
  projects: '<svg viewBox="0 0 24 24"><path d="M10 3h4v4h-4zM4 10h4v4H4zM16 10h4v4h-4zM10 17h4v4h-4z"/><path d="M12 7v3M8 12H6m12 0h-2m-4 2v3"/></svg>',
  thesis: '<svg viewBox="0 0 24 24"><path d="M4 5h10a3 3 0 0 1 3 3v12H7a3 3 0 0 0-3 3z"/><path d="M17 5h3v15a2 2 0 0 1-2 2h-1"/></svg>',
  life: '<svg viewBox="0 0 24 24"><path d="M12 21s-7-4.5-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.5-7 10-7 10z"/></svg>',
  settings: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M12 3v2M12 19v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M3 12h2M19 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
};

const ROUTES = [
  { id: "home", title: "今日", desc: "天气 · 日程 · 今日行动", icon: "home", group: "主线" },
  { id: "research", title: "研究", desc: "项目阶段看板与稿件", icon: "research", group: "科研" },
  { id: "papers", title: "文献", desc: "阅读批注 · AI 精读", icon: "papers", group: "科研" },
  { id: "outputs", title: "投稿", desc: "投稿状态与期刊会议库", icon: "outputs", group: "科研" },
  { id: "meetings", title: "会议", desc: "纪要与行动项", icon: "meetings", group: "科研" },
  { id: "ideas", title: "札记", desc: "笔记 · 想法 · Inbox", icon: "ideas", group: "科研" },
  { id: "calendar", title: "日程", desc: "月历 · DDL 与备注", icon: "calendar", group: "安排" },
  { id: "tasks", title: "任务", desc: "待办看板", icon: "tasks", group: "安排" },
  { id: "projects", title: "实验", desc: "研究项目与实验 Run", icon: "projects", group: "安排" },
  { id: "thesis", title: "论文", desc: "毕业论文章节", icon: "thesis", group: "安排" },
  { id: "life", title: "生活", desc: "仅存本机的生活线", icon: "life", group: "生活" },
  { id: "settings", title: "设置", desc: "SK · 邮箱 · 快捷网站 · 备份", icon: "settings", group: "系统" },
];

const ACADEMIC_PROJECT_STAGES = ["选题", "分析", "写作", "在投", "R&R", "接收", "发表", "搁置"];
const ENGINEERING_PROJECT_STAGES = ["待考察", "架构拆解", "环境搭建", "最小复现", "改造实践", "已沉淀", "搁置"];
const ACADEMIC_PROJECT_STATUSES = [
  ["incubating", "孵化"],
  ["active", "进行中"],
  ["writing", "写作中"],
  ["paused", "暂停"],
  ["done", "完成"],
  ["applying", "申请中（基金）"],
];
const ENGINEERING_PROJECT_STATUSES = [
  ["incubating", "考察中"],
  ["active", "学习中"],
  ["writing", "沉淀整理中"],
  ["paused", "已暂停"],
  ["done", "已完成"],
];

const state = {
  route: "home",
  projects: [],
  papers: [],
  selectedPaperId: null,
  selectedLocalPath: null,
  papersMode: "library", // library | workspace | reading
  watchFolderId: null,
  browseSub: "",
  browseScrollPositions: {},
  paperBoardReturnPosition: null,
  calendarMonth: null, // Date at month start
  settings: null,
  weatherCache: null, // { city, at, data }
  focusSession: null,
  focusTimer: null,
  focusNotified: false,
  ideaFilter: "all",
  notesTab: "notes", // notes | ideas | inbox
  noteSourceFilter: "all", // all | general | project | paper
  noteProjectFilter: null,
  selectedNoteKey: null,
  unifiedNoteDraft: null,
  selectedIdeaId: null,
  noteDraft: null,
  noteSourceInboxId: null,
  selectedInboxId: null,
  inboxFilter: "pending", // pending | archived | all
  // Research → drill-downs / cross-page filters
  researchPanel: null, // null | "projects"
  researchMode: "academic", // academic | engineering
  openProjectId: null,
  papersFilter: { projectId: null, statusGroup: null }, // statusGroup: null | "reading"
  aiJobs: [], // floating AI task chips
};

let _aiJobSeq = 1;

function beginAiJob({ title, kind = "ai" } = {}) {
  const job = {
    id: _aiJobSeq++,
    title: title || "AI 任务",
    kind,
    status: "running", // running | done | error
    startedAt: Date.now(),
    error: "",
    onOpen: null,
  };
  state.aiJobs = [job, ...state.aiJobs].slice(0, 6);
  renderAiJobDock();
  return job;
}

function finishAiJob(id, { ok = true, error = "", onOpen = null } = {}) {
  const job = state.aiJobs.find((j) => j.id === id);
  if (!job) return;
  job.status = ok ? "done" : "error";
  job.error = error || "";
  job.onOpen = typeof onOpen === "function" ? onOpen : null;
  job.finishedAt = Date.now();
  renderAiJobDock();
  if (ok && job.onOpen) {
    // 完成后可点开；若用户还在等待，轻微提示
    toast(`${job.title} · 完成，点右下角查看`);
  }
}

function updateAiJob(id, patch = {}) {
  const job = state.aiJobs.find((j) => j.id === id);
  if (!job) return;
  Object.assign(job, patch);
  renderAiJobDock();
}

function dismissAiJob(id) {
  state.aiJobs = state.aiJobs.filter((j) => j.id !== id);
  renderAiJobDock();
}

function aiJobMetaText(j) {
  const elapsed = Math.max(1, Math.round(((j.finishedAt || Date.now()) - j.startedAt) / 1000));
  if (j.status === "running") return `生成中 · ${elapsed}s`;
  if (j.status === "done") return "完成 · 点击查看";
  return `失败 · ${j.error || "出错"}`;
}

function renderAiJobDock() {
  const dock = document.getElementById("aiJobDock");
  if (!dock) return;
  const jobs = state.aiJobs || [];
  if (!jobs.length) {
    dock.classList.add("hidden");
    dock.innerHTML = "";
    return;
  }
  dock.classList.remove("hidden");
  dock.innerHTML = jobs.map((j) => `
    <div class="ai-job-chip ${j.status === "done" ? "is-done" : ""} ${j.status === "error" ? "is-error" : ""}" data-ai-job="${j.id}">
      <span class="ai-job-spin" aria-hidden="true"></span>
      <div class="ai-job-body">
        <div class="ai-job-title">${esc(j.title)}</div>
        <div class="ai-job-meta" data-ai-job-meta="${j.id}">${esc(aiJobMetaText(j))}</div>
      </div>
      <button type="button" class="ai-job-x" data-ai-job-x="${j.id}" title="关闭">×</button>
    </div>`).join("");
  dock.querySelectorAll("[data-ai-job-x]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      dismissAiJob(Number(btn.dataset.aiJobX));
    };
  });
  dock.querySelectorAll("[data-ai-job]").forEach((el) => {
    el.onclick = () => {
      const job = state.aiJobs.find((j) => String(j.id) === el.dataset.aiJob);
      if (!job) return;
      if (job.status === "running") {
        toast("仍在生成，请稍候…");
        return;
      }
      if (job.status === "error") {
        toast(job.error || "生成失败");
        return;
      }
      if (typeof job.onOpen === "function") {
        job.onOpen();
      } else {
        dismissAiJob(job.id);
      }
    };
  });
}

function tickAiJobDock() {
  const jobs = state.aiJobs || [];
  if (!jobs.some((j) => j.status === "running")) return;
  jobs.forEach((j) => {
    if (j.status !== "running") return;
    const el = document.querySelector(`[data-ai-job-meta="${j.id}"]`);
    if (el) el.textContent = aiJobMetaText(j);
  });
}

setInterval(tickAiJobDock, 1000);

function fmtMins(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  if (s < 60) return `${s}秒`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m} 分钟`;
  const h = Math.floor(m / 60);
  const rm = m % 60;
  return rm ? `${h} 小时 ${rm} 分` : `${h} 小时`;
}

function fmtClock(sec) {
  const s = Math.max(0, Math.floor(sec || 0));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

function parseServerUtcMs(value) {
  if (!value) return NaN;
  const str = String(value).trim();
  // 后端存 UTC naive；无时区后缀时按 UTC 解析，避免被当成本地时间导致倒计时瞬间归零
  if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(str) && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(str)) {
    return new Date(str.replace(" ", "T") + "Z").getTime();
  }
  return new Date(str).getTime();
}

function focusElapsedSec(session) {
  if (!session?.started_at) return 0;
  const start = parseServerUtcMs(session.started_at);
  if (!Number.isFinite(start)) return 0;
  return Math.max(0, Math.floor((Date.now() - start) / 1000));
}

function focusTimerText(session) {
  const elapsed = focusElapsedSec(session);
  const planned = Number(session?.planned_minutes || 0) * 60;
  if (planned > 0) {
    const left = planned - elapsed;
    return {
      elapsed,
      planned,
      left,
      text: left > 0 ? fmtClock(left) : "00:00",
      mode: "down",
      done: left <= 0,
    };
  }
  return { elapsed, planned: 0, left: 0, text: fmtClock(elapsed), mode: "up", done: false };
}

function updateFocusBar() {
  const bar = document.getElementById("focusBar");
  const s = state.focusSession;
  if (!s || !s.active) {
    bar?.classList.add("hidden");
    bar?.classList.remove("done");
    const live = document.getElementById("focusLiveCard");
    if (live) live.classList.add("hidden");
    return;
  }
  const clock = focusTimerText(s);
  if (bar) {
    bar.classList.remove("hidden");
    bar.classList.toggle("done", clock.done);
    const titleEl = document.getElementById("focusBarTitle");
    const timerEl = document.getElementById("focusBarTimer");
    if (titleEl) titleEl.textContent = s.title || "专注中";
    if (timerEl) timerEl.textContent = clock.text;
    const openBtn = document.getElementById("focusBarOpen");
    const badge = focusLinkBadge(s);
    if (openBtn) openBtn.title = badge ? `${s.title || "专注中"} · ${badge}` : "专注";
  }
  if (clock.done && clock.mode === "down" && !state.focusNotified) {
    state.focusNotified = true;
    toast("专注时间到");
  }
  const live = document.getElementById("focusLiveCard");
  const liveTimer = document.getElementById("focusLiveTimer");
  const liveLabel = document.getElementById("focusLiveLabel");
  const liveTitle = document.getElementById("focusLiveTitle");
  if (live) {
    live.classList.remove("hidden");
    live.classList.toggle("is-done", clock.done);
    if (liveTimer) liveTimer.textContent = clock.text;
    if (liveLabel) liveLabel.textContent = clock.mode === "down" ? (clock.done ? "已到时" : "剩余") : "已专注";
    if (liveTitle) liveTitle.textContent = s.title || "专注中";
    const liveLink = document.getElementById("focusLiveLink");
    const badge = focusLinkBadge(s);
    if (liveLink) {
      liveLink.textContent = badge;
      liveLink.classList.toggle("hidden", !badge);
    }
  }
  const btn = document.getElementById("startFocusHome");
  if (btn) {
    btn.classList.remove("secondary");
    btn.textContent = clock.mode === "down"
      ? (clock.done ? "专注已到时" : `专注 ${clock.text}`)
      : `专注 ${clock.text}`;
  }
}

function startFocusTicker() {
  if (state.focusTimer) clearInterval(state.focusTimer);
  updateFocusBar();
  state.focusTimer = setInterval(updateFocusBar, 1000);
}

async function refreshFocusSession() {
  try {
    const stats = await API.get("/focus/stats");
    state.focusSession = stats.active || null;
    state.focusNotified = false;
    startFocusTicker();
    return stats;
  } catch (_) {
    state.focusSession = null;
    updateFocusBar();
    return null;
  }
}

function focusLinkBadge(f) {
  if (!f?.link_type || !f?.link_id) return "";
  const kind = f.link_type === "project" ? "项目" : f.link_type === "paper" ? "文献" : f.link_type === "task" ? "任务" : f.link_type;
  const label = (f.link_label || "").trim() || `#${f.link_id}`;
  return `${kind} · ${label}`;
}

async function prepareFocusEditModal(rowOrId) {
  const id = typeof rowOrId === "object" ? rowOrId?.id : rowOrId;
  if (!id) return;
  try {
    if (!(state.projects || []).length) await refreshProjects();
  } catch (_) {}
  try {
    if (!state.settings) state.settings = await API.get("/settings");
  } catch (_) {}
  try {
    if (!(state.papers || []).length) await refreshPapersCache();
  } catch (_) {}
  try {
    state._focusTaskCache = await API.get("/tasks?view=open");
  } catch (_) {
    state._focusTaskCache = [];
  }
  let row = typeof rowOrId === "object" ? rowOrId : null;
  try {
    const list = await API.get("/focus");
    row = (list || []).find((x) => Number(x.id) === Number(id)) || row;
  } catch (_) {}
  if (!row) {
    toast("找不到该专注记录");
    return;
  }
  openFocusEditModal(row);
}

function openFocusEditModal(row) {
  const papers = (state.papers || []).slice(0, 80);
  const tasks = state._focusTaskCache || [];
  const projects = (state.projects || []).filter((p) => p.status !== "done" && !projectIsHidden(p));
  const linkType = row.link_type || "";
  const linkId = row.link_id || null;
  const durMin = Math.round((row.duration_seconds || 0) / 60);
  openModal(`
    <h3>${row.active ? "编辑进行中的专注" : "编辑专注记录"}</h3>
    <div class="field"><label>标题</label>
      <input id="focusEditTitle" value="${esc(row.title || "")}" /></div>
    <div class="field"><label>绑定</label>
      <select id="focusEditLinkType">
        <option value="">不绑定</option>
        <option value="project">项目</option>
        <option value="paper">文献</option>
        <option value="task">任务</option>
      </select>
    </div>
    <div class="field hidden" id="focusEditProjectWrap"><label>项目</label>
      ${entitySinglePickerHtml({
        id: "focusEditProjectPick",
        items: projects,
        selectedId: linkType === "project" ? linkId : null,
        labelFn: (p) => p.title || `项目 #${p.id}`,
        filterable: true,
        noneLabel: "选择项目",
      })}
    </div>
    <div class="field hidden" id="focusEditPaperWrap"><label>文献</label>
      ${entitySinglePickerHtml({
        id: "focusEditPaperPick",
        items: papers,
        selectedId: linkType === "paper" ? linkId : null,
        labelFn: (p) => p.title || `文献 #${p.id}`,
        filterable: true,
        noneLabel: "选择文献",
      })}
    </div>
    <div class="field hidden" id="focusEditTaskWrap"><label>任务</label>
      ${entitySinglePickerHtml({
        id: "focusEditTaskPick",
        items: tasks,
        selectedId: linkType === "task" ? linkId : null,
        labelFn: (t) => t.title || `任务 #${t.id}`,
        filterable: true,
        noneLabel: "选择任务",
      })}
    </div>
    <div class="field-row">
      <div class="field"><label>目标时长（分钟，0=不限）</label>
        <input id="focusEditPlanned" type="number" min="0" max="1440" value="${Number(row.planned_minutes || 0)}" /></div>
      ${row.active ? "" : `<div class="field"><label>实际时长（分钟）</label>
        <input id="focusEditDuration" type="number" min="0" max="1440" value="${durMin}" /></div>`}
    </div>
    <div class="field"><label>完成了什么</label>
      <textarea id="focusEditOutcome" rows="3" placeholder="可选">${esc(row.outcome || "")}</textarea></div>
    <p class="muted" style="margin:0 0 10px;font-size:0.75rem">${fmtDT(row.started_at)}${row.ended_at ? " → " + fmtDT(row.ended_at) : row.active ? " · 进行中" : ""}</p>
    <div class="toolbar" style="justify-content:space-between;margin-top:8px">
      <button class="btn danger" id="focusEditDelete">删除</button>
      <div style="display:flex;gap:8px">
        <button class="btn secondary" data-close="1">取消</button>
        <button class="btn" id="focusEditSave">保存</button>
      </div>
    </div>`);
  const syncLinkUI = () => {
    const t = document.getElementById("focusEditLinkType").value;
    document.getElementById("focusEditProjectWrap").classList.toggle("hidden", t !== "project");
    document.getElementById("focusEditPaperWrap").classList.toggle("hidden", t !== "paper");
    document.getElementById("focusEditTaskWrap").classList.toggle("hidden", t !== "task");
  };
  document.getElementById("focusEditLinkType").value = linkType || "";
  document.getElementById("focusEditLinkType").onchange = syncLinkUI;
  syncLinkUI();
  wireEntityPicker("focusEditProjectPick");
  wireEntityPicker("focusEditPaperPick");
  wireEntityPicker("focusEditTaskPick");

  const readLink = () => {
    const lt = document.getElementById("focusEditLinkType").value || "";
    let lid = null;
    if (lt === "project") lid = readEntityPickerId("focusEditProjectPick");
    if (lt === "paper") lid = readEntityPickerId("focusEditPaperPick");
    if (lt === "task") lid = readEntityPickerId("focusEditTaskPick");
    return { link_type: lt && lid ? lt : "", link_id: lt && lid ? lid : null };
  };

  document.getElementById("focusEditSave").onclick = async () => {
    const title = (document.getElementById("focusEditTitle").value || "专注").trim();
    const planned = Number(document.getElementById("focusEditPlanned").value);
    const outcome = document.getElementById("focusEditOutcome").value.trim();
    const link = readLink();
    const body = {
      title,
      planned_minutes: Number.isFinite(planned) ? planned : 0,
      outcome,
      ...link,
    };
    if (!row.active) {
      const dm = Number(document.getElementById("focusEditDuration")?.value);
      if (Number.isFinite(dm) && dm >= 0) body.duration_seconds = Math.round(dm * 60);
    }
    try {
      const updated = await API.put(`/focus/${row.id}`, body);
      if (updated.active) state.focusSession = updated;
      else if (state.focusSession?.id === row.id) state.focusSession = null;
      closeModal();
      toast("已保存");
      if (state.route === "home") navigate("home");
      else updateFocusBar();
    } catch (e) {
      toast(e.message || "保存失败");
    }
  };

    document.getElementById("focusEditDelete").onclick = async () => {
    if (!confirm(`删除这条专注记录「${row.title || ""}」？可在设置 · 回收站恢复。`)) return;
    try {
      await API.del(`/focus/${row.id}`);
      if (state.focusSession?.id === row.id) {
        state.focusSession = null;
        if (state.focusTimer) clearInterval(state.focusTimer);
        updateFocusBar();
      }
      closeModal();
      toast("已移入回收站");
      if (state.route === "home") navigate("home");
    } catch (e) {
      toast(e.message || "删除失败");
    }
  };
}

async function openFocusAllModal() {
  let rows = [];
  try {
    rows = await API.get("/focus");
  } catch (e) {
    toast(e.message || "加载失败");
    return;
  }
  openModal(`
    <h3>全部专注记录</h3>
    <p class="muted" style="margin:0 0 10px">最近 ${rows.length} 条 · 点一条可编辑或删除</p>
    <div class="focus-all-list">
      ${rows.map((f) => {
        const dur = f.active ? focusElapsedSec(f) : f.duration_seconds || 0;
        const bind = focusLinkBadge(f);
        return `<button type="button" class="focus-all-item" data-focus-edit="${f.id}">
          <div class="focus-rec-title">${esc(f.title)}${f.active ? '<span class="focus-rec-live">进行中</span>' : ""}</div>
          <div class="focus-rec-meta">${fmtDT(f.started_at)} · ${fmtMins(dur)}${bind ? " · " + esc(bind) : ""}${f.outcome ? " · " + esc(f.outcome) : ""}</div>
        </button>`;
      }).join("") || `<div class="empty">暂无记录</div>`}
    </div>
    <div class="toolbar" style="justify-content:flex-end;margin-top:12px">
      <button class="btn secondary" data-close="1">关闭</button>
    </div>`);
  document.querySelectorAll("[data-focus-edit]").forEach((el) => {
    el.onclick = () => {
      closeModal();
      prepareFocusEditModal(Number(el.dataset.focusEdit));
    };
  });
}

function openFocusStartModal(opts = {}) {
  const last = Number(localStorage.getItem("focus_planned_minutes") || 25);
  const papers = (state.papers || []).slice(0, 80);
  const tasks = state._focusTaskCache || [];
  const projects = (state.projects || []).filter((p) => p.status !== "done" && !projectIsHidden(p));
  const focusPid = state.settings?.focus_project_id ? Number(state.settings.focus_project_id) : null;
  let linkType = opts.link_type || "";
  let linkId = opts.link_id || null;
  // 默认绑到焦点项目（未显式指定绑定时）
  if (!linkType && focusPid && projects.some((p) => Number(p.id) === focusPid)) {
    linkType = "project";
    linkId = focusPid;
  }
  const projectTitle = opts.projectTitle
    || (linkType === "project" ? (projects.find((p) => Number(p.id) === Number(linkId))?.title || "") : "");
  const defaultTitle = opts.title || (linkType === "project" && projectTitle
    ? `推进：${projectTitle}`
    : linkType === "paper" && opts.paperTitle
      ? `精读：${opts.paperTitle}`
      : linkType === "task" && opts.taskTitle
        ? `推进：${opts.taskTitle}`
        : "专注推进");
  openModal(`
    <h3>开始专注</h3>
    <div class="field"><label>这次做什么</label>
      <input id="focusTitle" value="${esc(defaultTitle)}" placeholder="例如：推进项目 / 精读一篇 / 写实验" /></div>
    <div class="field-row">
      <div class="field"><label>绑定</label>
        <select id="focusLinkType">
          <option value="">不绑定</option>
          <option value="project">项目</option>
          <option value="paper">文献</option>
          <option value="task">任务</option>
        </select>
      </div>
    </div>
    <div class="field hidden" id="focusProjectWrap"><label>项目</label>
      ${entitySinglePickerHtml({
        id: "focusProjectPick",
        items: projects,
        selectedId: linkType === "project" ? linkId : null,
        labelFn: (p) => p.title || `项目 #${p.id}`,
        filterable: true,
        noneLabel: "选择项目",
      })}
      ${focusPid ? `<p class="muted" style="margin:6px 0 0;font-size:0.75rem">默认焦点项目已预选，可改。</p>` : ""}
    </div>
    <div class="field hidden" id="focusPaperWrap"><label>文献</label>
      ${entitySinglePickerHtml({
        id: "focusPaperPick",
        items: papers,
        selectedId: linkType === "paper" ? linkId : null,
        labelFn: (p) => p.title || `文献 #${p.id}`,
        filterable: true,
        noneLabel: "选择文献",
      })}
    </div>
    <div class="field hidden" id="focusTaskWrap"><label>任务</label>
      ${entitySinglePickerHtml({
        id: "focusTaskPick",
        items: tasks,
        selectedId: linkType === "task" ? linkId : null,
        labelFn: (t) => t.title || `任务 #${t.id}`,
        filterable: true,
        noneLabel: "选择任务",
      })}
    </div>
    <label style="font-size:0.82rem;color:var(--muted)">目标时长</label>
    <div class="focus-presets" id="focusPresets">
      ${[15, 25, 45, 60, 90].map((m) =>
        `<button type="button" data-m="${m}" class="${m === last ? "active" : ""}">${m} 分</button>`
      ).join("")}
      <button type="button" data-m="0" class="${last === 0 ? "active" : ""}">不限</button>
    </div>
    <div class="field"><label>自定义（分钟）</label>
      <input id="focusCustom" type="number" min="1" max="480" placeholder="例如 30" value="${last > 0 && ![15,25,45,60,90].includes(last) ? last : ""}" /></div>
    <div class="toolbar" style="justify-content:flex-end;margin-top:8px">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="focusConfirmStart">开始</button>
    </div>`);
  let planned = last;
  const syncLinkUI = () => {
    const t = document.getElementById("focusLinkType").value;
    document.getElementById("focusProjectWrap").classList.toggle("hidden", t !== "project");
    document.getElementById("focusPaperWrap").classList.toggle("hidden", t !== "paper");
    document.getElementById("focusTaskWrap").classList.toggle("hidden", t !== "task");
  };
  document.getElementById("focusLinkType").value = linkType || "";
  document.getElementById("focusLinkType").onchange = syncLinkUI;
  syncLinkUI();
  wireEntityPicker("focusProjectPick");
  wireEntityPicker("focusPaperPick");
  wireEntityPicker("focusTaskPick");
  const presets = document.getElementById("focusPresets");
  presets.querySelectorAll("button").forEach((b) => {
    b.onclick = () => {
      planned = Number(b.dataset.m);
      presets.querySelectorAll("button").forEach((x) => x.classList.toggle("active", x === b));
      document.getElementById("focusCustom").value = "";
    };
  });
  document.getElementById("focusCustom").oninput = (e) => {
    const v = Number(e.target.value);
    if (v > 0) {
      planned = v;
      presets.querySelectorAll("button").forEach((x) => x.classList.remove("active"));
    }
  };
  document.getElementById("focusConfirmStart").onclick = async () => {
    const title = (document.getElementById("focusTitle").value || "专注").trim();
    const custom = Number(document.getElementById("focusCustom").value);
    const mins = custom > 0 ? custom : planned;
    const lt = document.getElementById("focusLinkType").value || "";
    let lid = null;
    if (lt === "project") lid = readEntityPickerId("focusProjectPick");
    if (lt === "paper") lid = readEntityPickerId("focusPaperPick");
    if (lt === "task") lid = readEntityPickerId("focusTaskPick");
    localStorage.setItem("focus_planned_minutes", String(mins));
    try {
      const row = await API.post("/focus/start", {
        title,
        planned_minutes: mins,
        link_type: lt && lid ? lt : "",
        link_id: lt && lid ? lid : null,
      });
      state.focusSession = row;
      state.focusNotified = false;
      closeModal();
      startFocusTicker();
      toast(mins > 0 ? `专注开始 · ${mins} 分钟` : "专注开始 · 正计时");
      if (state.route === "home") navigate("home");
    } catch (e) {
      toast(e.message || "无法开始专注");
    }
  };
}

async function prepareFocusStartModal(opts = {}) {
  try {
    if (!(state.projects || []).length) await refreshProjects();
  } catch (_) {}
  try {
    if (!state.settings) state.settings = await API.get("/settings");
  } catch (_) {}
  try {
    if (!(state.papers || []).length) await refreshPapersCache();
  } catch (_) {}
  try {
    state._focusTaskCache = await API.get("/tasks?view=open");
  } catch (_) {
    state._focusTaskCache = [];
  }
  openFocusStartModal(opts);
}

function openFocusStopModal() {
  const elapsed = focusElapsedSec(state.focusSession);
  openModal(`
    <h3>结束专注</h3>
    <p class="muted" style="margin:0 0 12px">本次已专注 ${fmtMins(elapsed)}${state.focusSession?.planned_minutes ? `（目标 ${state.focusSession.planned_minutes} 分钟）` : ""}</p>
    <div class="field"><label>完成了什么？（可选）</label>
      <textarea id="focusOutcome" rows="3" placeholder="例如：写完方法节草稿 / 读完 Related Work"></textarea></div>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">继续专注</button>
      <button class="btn" id="focusConfirmStop">结束并记录</button>
    </div>`);
  document.getElementById("focusConfirmStop").onclick = async () => {
    const outcome = document.getElementById("focusOutcome").value.trim();
    try {
      const row = await API.post("/focus/stop", { outcome });
      state.focusSession = null;
      if (state.focusTimer) clearInterval(state.focusTimer);
      updateFocusBar();
      closeModal();
      const echo = focusLinkBadge(row);
      toast(`已记录 ${fmtMins(row.duration_seconds)}${echo ? " · " + echo : ""}${row.link_type === "project" ? "（可在项目详情查看回声）" : ""}`);
      if (state.route === "home") navigate("home");
    } catch (e) {
      toast(e.message || "结束失败");
    }
  };
}

function wireFocusBar() {
  const stop = document.getElementById("focusBarStop");
  if (stop) stop.onclick = () => openFocusStopModal();
  const open = document.getElementById("focusBarOpen");
  if (open) {
    open.onclick = async () => {
      try {
        const stats = await API.get("/focus/stats");
        const s = state.focusSession;
        const clock = focusTimerText(s);
        openModal(`
          <h3>专注中</h3>
          <p style="margin:0 0 8px;font-size:1.4rem;font-weight:700;font-variant-numeric:tabular-nums">${clock.text}${s?.planned_minutes ? ` <span class="muted" style="font-size:0.9rem">${clock.mode === "down" ? "剩余" : "已过"} · 目标 ${s.planned_minutes} 分</span>` : " <span class=\"muted\" style=\"font-size:0.9rem\">正计时</span>"}</p>
          <p class="muted" style="margin:0 0 14px">${esc(s?.title || "专注")}${focusLinkBadge(s) ? " · " + esc(focusLinkBadge(s)) : ""} · 今日累计 ${fmtMins(stats.today_seconds || 0)}</p>
          <div class="toolbar" style="justify-content:flex-end">
            <button class="btn secondary" data-close="1">继续</button>
            <button class="btn" id="focusModalStop">结束并记录</button>
          </div>`);
        document.getElementById("focusModalStop").onclick = () => {
          closeModal();
          openFocusStopModal();
        };
      } catch (_) {
        openFocusStopModal();
      }
    };
  }
}

function bindFocusHomeButton() {
  const btn = document.getElementById("startFocusHome");
  if (!btn) return;
  if (state.focusSession?.active) {
    btn.classList.remove("secondary");
    btn.onclick = () => openFocusStopModal();
    updateFocusBar();
  } else {
    btn.textContent = "开始专注";
    btn.classList.add("secondary");
    btn.onclick = () => prepareFocusStartModal();
  }
}

function setTopActions(html = "") {
  document.getElementById("topActions").innerHTML = html;
}

function renderNav() {
  const nav = document.getElementById("nav");
  let html = "";
  let lastGroup = "";
  ROUTES.forEach((r) => {
    if (r.group !== lastGroup) {
      html += `<div class="nav-section">${r.group}</div>`;
      lastGroup = r.group;
    }
    html += `<button data-route="${r.id}" class="${state.route === r.id ? "active" : ""}"><span class="nav-ico">${ICONS[r.icon] || ""}</span>${r.title}</button>`;
  });
  nav.innerHTML = html;
  nav.querySelectorAll("button").forEach((btn) => {
    btn.onclick = () => navigate(btn.dataset.route);
  });
}

async function navigate(route, opts = {}) {
  const viewEl = document.getElementById("view");
  if (typeof viewEl?._projNotesCleanup === "function") viewEl._projNotesCleanup();
  if (typeof viewEl?._notesCleanup === "function") viewEl._notesCleanup();
  state.route = route;
  syncAgentContext();
  if (opts.researchPanel !== undefined) state.researchPanel = opts.researchPanel;
  if (opts.openProjectId !== undefined) state.openProjectId = opts.openProjectId;
  if (opts.papersFilter) {
    state.papersFilter = {
      projectId: opts.papersFilter.projectId ?? null,
      statusGroup: opts.papersFilter.statusGroup ?? null,
      open: opts.papersFilter.open !== false,
    };
  } else if (route === "papers") {
    state.papersFilter = { projectId: null, statusGroup: null, open: false };
  }
  if (route !== "research" && opts.researchPanel === undefined) {
    state.researchPanel = null;
  }
  const meta = ROUTES.find((r) => r.id === route);
  let title = meta.title;
  let desc = meta.desc;
  if (route === "research" && state.researchPanel === "projects") {
    const engineering = state.researchMode === "engineering";
    title = engineering ? "工程项目" : "学术项目";
    desc = engineering ? "学习开源项目 · 沉淀关键技术" : "查看 · 编辑 · 删除研究项目";
  } else if (route === "research" && state.researchPanel === "project-notes") {
    title = "项目笔记";
    desc = "Markdown 源码与预览";
  } else if (route === "papers" && state.papersFilter?.statusGroup === "reading") {
    title = "阅读队列";
    desc = "待精读 / 已精读文献";
  } else if (route === "papers" && state.papersFilter?.projectId) {
    title = "项目文献库";
    desc = "按项目筛选并关联文献";
  } else if (route === "outputs" && opts.fromResearch) {
    title = "在投 / 返修";
    desc = "投稿与返修状态";
  }
  document.getElementById("pageTitle").textContent = title;
  document.getElementById("pageDesc").textContent = desc;
  renderNav();
  const view = document.getElementById("view");
  view.innerHTML = `<div class="empty">加载中…</div>`;
  try {
    if (route === "home") await renderHome(view);
    else if (route === "research") await renderResearch(view);
    else if (route === "papers") await renderPapers(view);
    else if (route === "projects") await renderProjects(view);
    else if (route === "tasks") await renderTasks(view);
    else if (route === "calendar") await renderCalendar(view);
    else if (route === "outputs") await renderOutputs(view);
    else if (route === "meetings") await renderMeetings(view);
    else if (route === "ideas") await renderIdeas(view);
    else if (route === "life") await renderLife(view);
    else if (route === "thesis") await renderThesis(view);
    else if (route === "settings") await renderSettings(view);
  } catch (e) {
    view.innerHTML = `<div class="empty">加载失败：${esc(e.message)}</div>`;
  }
  markWorkbenchContextSources(view);
}

function paperMatchesFilter(p, filter = state.papersFilter) {
  if (!filter) return true;
  if (filter.statusGroup === "reading") {
    if (!["reading", "deep"].includes(p.status)) return false;
  }
  if (filter.projectId) {
    const ids = p.project_ids?.length ? p.project_ids : (p.project_id ? [p.project_id] : []);
    if (!ids.map(String).includes(String(filter.projectId))) return false;
  }
  return true;
}

function filteredPapers() {
  return (state.papers || []).filter((p) => paperMatchesFilter(p));
}

async function refreshProjects() {
  state.projects = await API.get("/projects");
}

function projectIsHidden(p) {
  return !!(p && p.hidden);
}

/** Visible projects for lists/pickers; keep includeIds even if hidden (e.g. current selection). */
function listVisibleProjects({ includeHidden = false, includeIds = [] } = {}) {
  const keep = new Set((includeIds || []).filter((x) => x != null && x !== "").map(String));
  const showHidden = includeHidden || !!state.showHiddenProjects;
  return (state.projects || []).filter((p) => {
    if (showHidden || keep.has(String(p.id))) return true;
    return !projectIsHidden(p);
  });
}

function projectEyeBtn(p) {
  const hid = projectIsHidden(p);
  const title = hid ? "显示到研究看板" : "从研究看板隐藏";
  const ico = hid
    ? `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 6a9.8 9.8 0 0 0-8.9 5.5 9.8 9.8 0 0 0 17.8 0A9.8 9.8 0 0 0 12 6Zm0 9.2A3.7 3.7 0 1 1 12 8a3.7 3.7 0 0 1 0 7.2Zm0-2a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Z"/><path fill="currentColor" d="M3.2 4.5 4.5 3.2l16.3 16.3-1.3 1.3z"/></svg>`
    : `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path fill="currentColor" d="M12 5c-5 0-9.3 3.1-11 7 1.7 3.9 6 7 11 7s9.3-3.1 11-7c-1.7-3.9-6-7-11-7Zm0 11.5A4.5 4.5 0 1 1 12 7.5a4.5 4.5 0 0 1 0 9Zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"/></svg>`;
  return `<button type="button" class="btn-eye ${hid ? "is-off" : ""}" data-proj-eye="${p.id}" title="${title}" aria-label="${title}">${ico}</button>`;
}

async function toggleProjectHidden(projectId, ev) {
  if (ev) {
    ev.preventDefault();
    ev.stopPropagation();
  }
  const p = (state.projects || []).find((x) => String(x.id) === String(projectId));
  if (!p) return;
  const next = !projectIsHidden(p);
  try {
    const updated = await API.put(`/projects/${projectId}/hidden`, { hidden: next });
    const i = (state.projects || []).findIndex((x) => String(x.id) === String(projectId));
    if (i >= 0) state.projects[i] = updated;
    try { state.settings = await API.get("/settings"); } catch (_) {}
    toast(next ? "已隐藏（研究/实验默认不显示；若曾是焦点已取消）" : "已取消隐藏");
    if (state.route === "research") {
      await navigate("research", {
        researchPanel: state.researchPanel,
        openProjectId: state.openProjectId,
      });
    } else if (state.route === "projects") {
      await navigate("projects");
    }
  } catch (e) {
    toast(e.message || "切换失败");
  }
}

function bindProjectEyeButtons(root) {
  (root || document).querySelectorAll("[data-proj-eye]").forEach((btn) => {
    btn.onclick = (e) => toggleProjectHidden(btn.dataset.projEye, e);
  });
}

function projectOptions(selected) {
  const list = listVisibleProjects({ includeIds: selected != null && selected !== "" ? [selected] : [] });
  return `<option value="">无</option>` + list.map((p) =>
    `<option value="${p.id}" ${String(selected) === String(p.id) ? "selected" : ""}>${esc(p.title)}${projectIsHidden(p) ? "（已隐藏）" : ""}</option>`
  ).join("");
}

function projectCheckboxes(selectedIds = [], inputName = "projCheck") {
  // 兼容旧调用；新 UI 用项目标签 chips
  return projectTagPickerHtml(selectedIds, inputName);
}

function projectTagPickerHtml(selectedIds = [], inputId = "projTagPicker") {
  const selected = new Set((selectedIds || []).map(String));
  const list = listVisibleProjects({ includeIds: [...selected] });
  if (!list.length && !(state.projects || []).length) {
    return `<div class="empty" style="padding:6px 0">暂无项目，请先在「研究」页创建</div>`;
  }
  if (!list.length) {
    return `<div class="empty" style="padding:6px 0">可见项目为空（已隐藏的不会出现在此）</div>`;
  }
  return `
    <div class="tag-picker project-tag-picker" id="${inputId}">
      <p class="muted" style="margin:0 0 8px;font-size:0.75rem">点选项目标签挂到文献上（可多选）。</p>
      <div class="tag-picker-list">
        ${list.map((p) => `
          <button type="button" class="tag-chip project-tag-chip ${selected.has(String(p.id)) ? "on" : ""}" data-pid="${p.id}">${esc(p.title)}${projectIsHidden(p) ? " · 隐" : ""}</button>
        `).join("")}
      </div>
    </div>`;
}

function wireProjectTagPicker(inputId) {
  const root = document.getElementById(inputId);
  if (!root) return;
  root.querySelectorAll(".project-tag-chip").forEach((btn) => {
    btn.onclick = () => btn.classList.toggle("on");
  });
}

function readProjectTagPicker(inputId) {
  return [...document.querySelectorAll(`#${inputId} .project-tag-chip.on`)]
    .map((b) => Number(b.dataset.pid))
    .filter(Boolean);
}

const READING_QUEUE_TAGS = ["待读", "待精读", "已精读", "精读中", "已读归档"];
const STATUS_TO_QUEUE = { todo: "待读", reading: "待精读", read: "已精读", deep: "已精读" };
const QUEUE_TO_STATUS = { 待读: "todo", 待精读: "reading", 已精读: "deep" };
const PAPER_STATUS_LABEL = { todo: "待读", reading: "待精读", read: "已精读", deep: "已精读", dropped: "弃读" };

function paperStatusLabel(st) {
  return PAPER_STATUS_LABEL[st] || st || "待读";
}

function parseIdCsv(s) {
  return String(s || "")
    .split(/[,，\s]+/)
    .map((x) => Number(x))
    .filter((n) => Number.isFinite(n) && n > 0);
}

function joinIdCsv(ids) {
  return [...new Set((ids || []).map(Number).filter((n) => n > 0))].join(",");
}

function mergeReadingTags(tags, status) {
  const base = (tags || []).filter((t) => !READING_QUEUE_TAGS.includes(t));
  const q = status === "dropped" ? null : STATUS_TO_QUEUE[status || "todo"];
  if (q) base.push(q);
  return [...new Set(base)];
}

function entityMultiPickerHtml({ id, items, selectedIds, labelFn, empty = "暂无可选项", filterable = false }) {
  const selected = new Set((selectedIds || []).map(String));
  const list = items || [];
  return `
    <div class="entity-picker" id="${id}" data-multi="1">
      ${filterable ? `<input class="entity-picker-filter" type="search" placeholder="筛选…" />` : ""}
      <div class="entity-picker-list">
        ${list.length
          ? list.map((it) => {
              const lid = String(it.id);
              return `<button type="button" class="tag-chip entity-chip ${selected.has(lid) ? "on" : ""}" data-eid="${lid}" title="${esc(labelFn(it))}">${esc(labelFn(it))}</button>`;
            }).join("")
          : `<div class="empty" style="padding:6px 0">${esc(empty)}</div>`}
      </div>
      <input type="hidden" id="${id}_ids" value="${esc(joinIdCsv([...selected]))}" />
    </div>`;
}

function entitySinglePickerHtml({ id, items, selectedId, labelFn, empty = "暂无可选项", noneLabel = "不绑定", filterable = false }) {
  const sel = selectedId != null && selectedId !== "" ? String(selectedId) : "";
  const list = items || [];
  return `
    <div class="entity-picker" id="${id}" data-multi="0">
      ${filterable ? `<input class="entity-picker-filter" type="search" placeholder="筛选…" />` : ""}
      <div class="entity-picker-list">
        <button type="button" class="tag-chip entity-chip ${!sel ? "on" : ""}" data-eid="">${esc(noneLabel)}</button>
        ${list.map((it) => {
          const lid = String(it.id);
          return `<button type="button" class="tag-chip entity-chip ${sel === lid ? "on" : ""}" data-eid="${lid}" title="${esc(labelFn(it))}">${esc(labelFn(it))}</button>`;
        }).join("") || (list.length ? "" : `<div class="empty" style="padding:6px 0">${esc(empty)}</div>`)}
      </div>
      <input type="hidden" id="${id}_ids" value="${esc(sel)}" />
    </div>`;
}

function wireEntityPicker(inputId) {
  const root = document.getElementById(inputId);
  if (!root) return;
  const multi = root.dataset.multi === "1";
  const hidden = document.getElementById(`${inputId}_ids`);
  const sync = () => {
    if (!hidden) return;
    if (multi) {
      hidden.value = joinIdCsv([...root.querySelectorAll(".entity-chip.on")].map((b) => b.dataset.eid).filter(Boolean));
    } else {
      const on = root.querySelector(".entity-chip.on");
      hidden.value = on?.dataset.eid || "";
    }
  };
  root.querySelectorAll(".entity-chip").forEach((btn) => {
    btn.onclick = () => {
      if (multi) {
        btn.classList.toggle("on");
      } else {
        root.querySelectorAll(".entity-chip").forEach((x) => x.classList.remove("on"));
        btn.classList.add("on");
      }
      sync();
    };
  });
  const filter = root.querySelector(".entity-picker-filter");
  if (filter) {
    filter.oninput = () => {
      const q = filter.value.trim().toLowerCase();
      root.querySelectorAll(".entity-chip").forEach((btn) => {
        if (!btn.dataset.eid) {
          btn.style.display = "";
          return;
        }
        const t = (btn.textContent || "").toLowerCase();
        btn.style.display = !q || t.includes(q) ? "" : "none";
      });
    };
  }
  sync();
}

function readEntityPickerIds(inputId) {
  const hidden = document.getElementById(`${inputId}_ids`);
  return parseIdCsv(hidden?.value || "");
}

function readEntityPickerId(inputId) {
  const ids = readEntityPickerIds(inputId);
  return ids[0] || null;
}

function paperProjectIds(paper) {
  if (!paper) return [];
  if (paper.project_ids?.length) return paper.project_ids.map(Number);
  return paper.project_id ? [Number(paper.project_id)] : [];
}

function paperProjectTagsHtml(paper) {
  const names = paperProjectNames(paper);
  if (!names.length) return `<span class="proj-tags is-empty">无项目标签</span>`;
  return `<span class="proj-tags">${names.map((n) => `<span class="proj-tag">${esc(n)}</span>`).join("")}</span>`;
}

function readCheckedIds(cls) {
  return [...document.querySelectorAll(`.${cls}:checked`)].map((x) => Number(x.value)).filter(Boolean);
}

const META_DIRECTIONS = [
  { id: "阅读队列", color: "#6B5B95", hint: "未打开为待读；打开无笔记为待精读；有笔记为已精读" },
  { id: "文献属性", color: "#B86B2B", hint: "理论 / 工程 / 综述…（与其他维度平行）" },
];
const HIDDEN_PAPER_DIRECTIONS = new Set(["未分类", "自定义", "相关度"]);

function paperOtherCategoryTagsHtml(paper, currentCat = "") {
  const tags = (paper?.tags || []).filter((t) => {
    if (!t || t === currentCat) return false;
    if (READING_QUEUE_TAGS.includes(t)) return false;
    return !HIDDEN_PAPER_DIRECTIONS.has(tagByName(t)?.dimension || "");
  });
  if (!tags.length) return "";
  return `<span class="cat-more-tags" title="同时挂在其他维度/类别">${tags.map((t) => `<span class="cat-more-tag">${esc(t)}</span>`).join("")}</span>`;
}

function tagPickerHtml(selected = [], allTags = [], inputId = "tagPicker") {
  const sel = new Set((selected || []).map((t) => String(t)));
  const tags = [...(allTags || [])];
  const byDir = {};
  tags.forEach((t) => {
    const dir = t.dimension || "自定义";
    if (!byDir[dir]) byDir[dir] = [];
    byDir[dir].push(t);
  });
  // orphan selected names not in catalog
  sel.forEach((name) => {
    if (tags.some((t) => (t.name || t) === name)) return;
    if (!byDir["自定义"]) byDir["自定义"] = [];
    byDir["自定义"].push({ name, color: "#5C6B7A", dimension: "自定义" });
  });
  const dirOrder = [
    ...((state.tagDirections || []).filter((d) => d.kind === "topic").map((d) => d.name)),
    ...META_DIRECTIONS.map((d) => d.id),
    ...Object.keys(byDir).filter((k) => k !== "自定义" && !META_DIRECTIONS.some((d) => d.id === k)
      && !(state.tagDirections || []).some((d) => d.name === k)),
    ...(byDir["自定义"]?.length ? ["自定义"] : []),
  ].filter((v, i, a) => a.indexOf(v) === i && byDir[v]?.length);
  const groups = dirOrder.map((dir) => {
    const list = byDir[dir] || [];
    return `
      <div class="tag-picker-group">
        <div class="tag-picker-group-title">${esc(dir)}</div>
        <div class="tag-picker-list">
          ${list.map((t) => {
            const name = t.name || t;
            return `<button type="button" class="tag-chip ${sel.has(name) ? "on" : ""}" data-tag="${esc(name)}">${esc(name)}</button>`;
          }).join("")}
        </div>
      </div>`;
  }).join("");
  return `
    <div class="tag-picker" id="${inputId}">
      <p class="muted" style="margin:0 0 8px;font-size:0.75rem">可多选；维度彼此平行，同一文献可同时挂「方向 / 属性 / 队列 / 相关度」等。</p>
      ${groups || `<span class="muted" style="font-size:0.78rem">还没有类别，请先在分类板创建</span>`}
      <div class="toolbar" style="margin:8px 0 0">
        <input id="${inputId}_new" placeholder="临时类别名，回车添加" style="flex:1;min-width:140px" />
        <button type="button" class="btn small secondary" id="${inputId}_add">添加</button>
      </div>
    </div>`;
}

function wireTagPicker(inputId) {
  const root = document.getElementById(inputId);
  if (!root) return;
  const syncStatusFromQueue = () => {
    const statusEl = document.getElementById("f_status");
    if (!statusEl) return;
    const onQueue = [...root.querySelectorAll(".tag-chip.on")]
      .map((b) => b.dataset.tag)
      .find((t) => READING_QUEUE_TAGS.includes(t));
    if (onQueue && QUEUE_TO_STATUS[onQueue]) statusEl.value = QUEUE_TO_STATUS[onQueue];
  };
  const toggle = (btn) => {
    const name = btn.dataset.tag;
    if (READING_QUEUE_TAGS.includes(name)) {
      const turningOn = !btn.classList.contains("on");
      root.querySelectorAll(".tag-chip").forEach((b) => {
        if (READING_QUEUE_TAGS.includes(b.dataset.tag)) b.classList.remove("on");
      });
      if (turningOn) btn.classList.add("on");
      syncStatusFromQueue();
      return;
    }
    btn.classList.toggle("on");
  };
  root.querySelectorAll(".tag-chip").forEach((btn) => {
    btn.onclick = () => toggle(btn);
  });
  const statusEl = document.getElementById("f_status");
  if (statusEl && !statusEl.dataset.queueWired) {
    statusEl.dataset.queueWired = "1";
    statusEl.onchange = () => {
      const q = statusEl.value === "dropped" ? null : STATUS_TO_QUEUE[statusEl.value];
      root.querySelectorAll(".tag-chip").forEach((b) => {
        if (!READING_QUEUE_TAGS.includes(b.dataset.tag)) return;
        b.classList.toggle("on", !!q && b.dataset.tag === q);
      });
    };
  }
  const add = () => {
    const inp = document.getElementById(`${inputId}_new`);
    const name = (inp?.value || "").trim();
    if (!name) return;
    let btn = [...root.querySelectorAll(".tag-chip")].find((b) => b.dataset.tag === name);
    if (!btn) {
      let list = root.querySelector('.tag-picker-group[data-temp="1"] .tag-picker-list');
      if (!list) {
        const wrap = document.createElement("div");
        wrap.className = "tag-picker-group";
        wrap.dataset.temp = "1";
        wrap.innerHTML = `<div class="tag-picker-group-title">本次添加</div><div class="tag-picker-list"></div>`;
        root.insertBefore(wrap, root.querySelector(".toolbar"));
        list = wrap.querySelector(".tag-picker-list");
      }
      btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-chip on";
      btn.dataset.tag = name;
      btn.textContent = name;
      btn.onclick = () => toggle(btn);
      list.appendChild(btn);
    } else {
      btn.classList.add("on");
    }
    inp.value = "";
  };
  document.getElementById(`${inputId}_add`).onclick = add;
  document.getElementById(`${inputId}_new`).onkeydown = (e) => {
    if (e.key === "Enter") { e.preventDefault(); add(); }
  };
}

function readTagPicker(inputId) {
  return [...document.querySelectorAll(`#${inputId} .tag-chip.on`)].map((b) => b.dataset.tag);
}

/* ---------------- Home / 今日 ---------------- */
function weatherFromCache(city) {
  const c = state.weatherCache;
  if (!c || c.city !== city) return null;
  if (Date.now() - c.at > 30 * 60 * 1000) return null;
  return c.data;
}

function weatherSkyKind(weather) {
  if (!weather?.ok) return "cloudy";
  if (weather.sky) return weather.sky;
  const c = Number(weather.weather_code);
  const t = String(weather.weather_text || "");
  if ([95, 96, 99].includes(c) || /雷/.test(t)) return "storm";
  if ([71, 73, 75, 77, 85, 86].includes(c) || /雪/.test(t)) return "snow";
  if ([61, 63, 65, 66, 67, 80, 81, 82].includes(c) || /雨|阵雨/.test(t)) return "rain";
  if ([51, 53, 55, 56, 57].includes(c) || /毛毛雨/.test(t)) return "drizzle";
  if ([45, 48].includes(c) || /雾/.test(t)) return "fog";
  if (c === 3 || /^阴/.test(t)) return "overcast";
  if (c === 2 || /多云/.test(t)) return "cloudy";
  if (c === 1 || /晴间/.test(t)) return "partly";
  if (c === 0 || /^晴$/.test(t)) return "clear";
  return "cloudy";
}

function weatherChipEmoji(sky) {
  return ({
    clear: "☀️",
    partly: "🌤",
    cloudy: "☁️",
    overcast: "☁",
    fog: "🌫",
    drizzle: "🌦",
    rain: "🌧",
    storm: "⛈",
    snow: "❄️",
  })[sky] || "🌤";
}

function weatherHeroHtml(settings, weather) {
  const city = settings.location_city || "上海";
  const wOk = weather && weather.ok;
  const sky = weatherSkyKind(weather);
  const isNight = wOk && weather.is_day === false;
  const now = new Date();
  const dateLine = `${now.getMonth() + 1}月${now.getDate()}日 · ${["周日", "周一", "周二", "周三", "周四", "周五", "周六"][now.getDay()]}`;
  return {
    sky,
    isNight,
    html: `
    <div class="weather-sky" aria-hidden="true">
      <div class="wx-glow"></div>
      <div class="wx-sun"></div>
      <div class="wx-moon"></div>
      <div class="wx-cloud c1"></div>
      <div class="wx-cloud c2"></div>
      <div class="wx-cloud c3"></div>
      <div class="wx-fog"></div>
      <div class="wx-rain"></div>
      <div class="wx-snow"></div>
      <div class="wx-flash"></div>
    </div>
    <div class="weather-hero-body">
      <div class="meta-line">${esc(city)}${wOk && weather.admin ? " · " + esc(weather.admin) : ""}</div>
      <div class="temp">${wOk && weather.temp != null ? Math.round(weather.temp) + "°" : "--°"}</div>
      <div class="meta-line">${wOk ? `${weatherChipEmoji(sky)} ${esc(weather.weather_text)}` : "天气加载中…"}</div>
      <div class="meta-line">${wOk ? `湿度 ${weather.humidity ?? "-"}% · 降水概率 ${weather.precip_prob ?? "-"}%` : "可在设置中修改城市"}</div>
      <div class="meta-line weather-date">${dateLine}</div>
    </div>`,
  };
}

function paintWeatherUI(settings, weather) {
  const city = settings.location_city || "上海";
  const wOk = weather && weather.ok;
  const sky = weatherSkyKind(weather);
  const chip = document.getElementById("weatherChip");
  if (chip) {
    chip.textContent = wOk
      ? `${weatherChipEmoji(sky)} ${weather.weather_text} ${weather.temp}°C`
      : "🌤 天气暂不可用";
  }
  const hero = document.getElementById("weatherHero");
  if (!hero) return;
  const painted = weatherHeroHtml(settings, weather);
  hero.className = `weather-hero sky-${painted.sky}${painted.isNight ? " is-night" : ""}`;
  hero.dataset.sky = painted.sky;
  hero.innerHTML = painted.html;
}

async function loadWeatherLazy(settings) {
  const city = settings.location_city || "上海";
  const cached = weatherFromCache(city);
  if (cached) {
    paintWeatherUI(settings, cached);
    return cached;
  }
  if (state._weatherInflight?.city === city) {
    const weather = await state._weatherInflight.promise;
    if (state.route === "home") paintWeatherUI(settings, weather);
    return weather;
  }
  const promise = API.get(`/weather?city=${encodeURIComponent(city)}`)
    .then((weather) => {
      state.weatherCache = { city, at: Date.now(), data: weather };
      return weather;
    })
    .catch(() => ({ ok: false }))
    .finally(() => {
      if (state._weatherInflight?.city === city) state._weatherInflight = null;
    });
  state._weatherInflight = { city, promise };
  const weather = await promise;
  if (state.route === "home") paintWeatherUI(settings, weather);
  return weather;
}

function renderFocusRecordsHtml(stats) {
  const s = stats || {};
  const active = s.active || (state.focusSession?.active ? state.focusSession : null);
  const clock = active ? focusTimerText(active) : null;
  const rows = (s.recent || [])
    .map((f) => {
      const dur = f.active ? focusElapsedSec(f) : f.duration_seconds || 0;
      const bind = focusLinkBadge(f);
      return `<button type="button" class="focus-rec-item" data-focus-edit="${f.id}" title="编辑 / 删除">
        <div class="focus-rec-title">${esc(f.title)}${f.active ? '<span class="focus-rec-live">进行中</span>' : ""}</div>
        <div class="focus-rec-meta">${fmtDT(f.started_at)} · ${fmtMins(dur)}${f.planned_minutes ? ` / ${f.planned_minutes}分` : ""}${bind ? " · " + esc(bind) : ""}${f.outcome ? " · " + esc(f.outcome) : ""}</div>
      </button>`;
    })
    .join("") || `<div class="empty" style="padding:12px 0">暂无专注记录</div>`;
  return `
    <div class="focus-mini">
      <div class="focus-live ${active ? "" : "hidden"}" id="focusLiveCard">
        <div class="focus-live-top">
          <span class="focus-live-label" id="focusLiveLabel">${clock?.mode === "down" ? (clock.done ? "已到时" : "剩余") : "已专注"}</span>
          <span class="focus-live-title" id="focusLiveTitle">${esc(active?.title || "专注中")}</span>
        </div>
        ${focusLinkBadge(active) ? `<div class="focus-live-link muted" id="focusLiveLink">${esc(focusLinkBadge(active))}</div>` : `<div class="focus-live-link muted hidden" id="focusLiveLink"></div>`}
        <div class="focus-live-clock" id="focusLiveTimer">${clock?.text || "25:00"}</div>
        <div class="focus-live-actions">
          <button type="button" class="btn small ghost" id="focusLiveEdit">编辑</button>
          <button type="button" class="btn small secondary" id="focusLiveStop">结束并记录</button>
        </div>
      </div>
      <div class="focus-mini-head">
        <h3>专注记录</h3>
        <span class="focus-mini-sum">今日 ${fmtMins(s.today_seconds || 0)}</span>
      </div>
      <div class="focus-mini-chips">
        <span>周 ${fmtMins(s.week_seconds || 0)}</span>
        <span>月 ${fmtMins(s.month_seconds || 0)}</span>
        <span>${s.today_sessions || 0} 次</span>
        <button type="button" class="btn ghost small" id="focusAllBtn" style="margin-left:auto">全部</button>
      </div>
      <div class="focus-mini-scroll">${rows}</div>
    </div>`;
}

async function renderHome(view) {
  setTopActions(`
    <button class="btn secondary small" id="askAIHome">问 AI</button>
    <button class="btn secondary small" id="startFocusHome">开始专注</button>
    <button class="btn small" id="goResearch">进入研究</button>
  `);
  // settings / weather 不阻塞首屏：本地任务数据优先渲染
  const settingsP = state.settings
    ? Promise.resolve(state.settings)
    : API.get("/settings").then((s) => { state.settings = s; return s; });
  const homeToday = new Date();
  const homeMonth = monthStart(homeToday);
  const homeCells = buildMonthCells(homeMonth);
  const activityStart = dayKey(homeCells[0].date);
  const activityEnd = dayKey(homeCells[homeCells.length - 1].date);
  const [settings, d, quote, focusStats, ideas, researchDays] = await Promise.all([
    settingsP,
    API.get("/dashboard"),
    API.get("/quote"),
    API.get("/focus/stats").catch(() => null),
    API.get("/ideas?status=open").catch(() => []),
    API.get(`/calendar/research-days?start=${activityStart}&end=${activityEnd}`).catch(() => []),
  ]);
  const openIdeas = ideas || [];
  if (focusStats?.active) {
    state.focusSession = focusStats.active;
    startFocusTicker();
  } else if (!state.focusSession?.active) {
    state.focusSession = null;
    updateFocusBar();
  }
  const homeStatus = normalizePersonStatus(d.personal_status);
  {
    document.getElementById("statusPill").textContent = homeStatus;
    document.getElementById("statusPill").dataset.status = homeStatus;
  }
  const today = homeToday;
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startOfDay(today), i));
  const byDay = {};
  (d.upcoming_events || []).forEach((e) => {
    const k = dayKey(e.start_at);
    (byDay[k] ||= []).push({ ...e, title: cleanCalendarTitle(e.title, e.event_type) });
  });
  (d.next_tasks || []).forEach((t) => {
    if (!t.due_date) return;
    const k = String(t.due_date).slice(0, 10);
    if (!(byDay[k] || []).some((x) => x.link_type === "task" && x.link_id === t.id)) {
      (byDay[k] ||= []).push({ title: t.title, event_type: "task" });
    }
  });

  const month = homeMonth;
  const cells = homeCells;
  const eventDays = new Set(Object.keys(byDay));
  const activeDays = new Set((researchDays || []).map((item) => item.date));
  const tip =
    d.task_stats.overdue > 0
      ? `你有 ${d.task_stats.overdue} 项逾期任务，建议先清空阻塞再开新实验。`
      : d.paper_stats.active_reading > 0
        ? `今日可精读 1 篇在读文献，并写清「与我课题关系」。`
        : "建议：设定今日唯一焦点，完成一个可验证的下一步。";
  const cachedWeather = weatherFromCache(settings.location_city || "上海");
  const wOk = cachedWeather && cachedWeather.ok;
  const dateLine = today.toLocaleDateString("zh-CN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  view.innerHTML = `
    <div class="today-layout">
      <div>
        <div class="quote-card">
          <div class="q">“${esc(quote.content)}”</div>
          <div class="a">— ${esc(quote.author || "Workbench")}</div>
        </div>
        <div class="panel" style="margin-bottom:14px">
          <div class="toolbar" style="justify-content:space-between;align-items:flex-start">
            <div>
              <div class="today-title-row">
                <div style="font-size:1.35rem;font-weight:700;letter-spacing:-0.03em">${dateLine}</div>
                <div class="seg status-seg-mini" id="homeStatusSeg" title="个人状态">
                  <button type="button" data-st="在岗" class="${homeStatus==="在岗"?"active":""}">在岗</button>
                  <button type="button" data-st="休息" class="${homeStatus==="休息"?"active":""}">休息</button>
                  <button type="button" data-st="请假" class="${homeStatus==="请假"?"active":""}">请假</button>
                  <button type="button" data-st="外出" class="${homeStatus==="外出"?"active":""}">外出</button>
                </div>
              </div>
              <div class="day-context">
                <span class="day-chip">📍 ${esc(settings.location_city || "上海")}</span>
                <span class="day-chip" id="weatherChip">${wOk ? `${weatherChipEmoji(weatherSkyKind(cachedWeather))} ${esc(cachedWeather.weather_text)} ${cachedWeather.temp}°C` : "🌤 天气加载中…"}</span>
                <span class="day-chip">焦点：${d.focus_project ? esc(d.focus_project.title) : "未设置"}</span>
                ${mailAccountChipsHtml(settings)}
              </div>
              <div class="tip-banner">💡 今日提示：${esc(tip)}</div>
              ${settings.backup_due ? `<div class="tip-banner backup-due-banner" id="backupDueBanner">🗄 已超过 ${settings.backup_interval_days || 7} 天未备份${settings.backup_days_since != null ? `（距上次 ${settings.backup_days_since} 天）` : ""} · <button type="button" class="btn ghost small" id="homeBackupNow">立即导出</button> <button type="button" class="btn ghost small" id="homeBackupSettings">备份设置</button></div>` : ""}
            </div>
            <div class="toolbar" style="margin:0">
              <button class="btn small" data-check="reading">阅读打卡</button>
              <button class="btn small secondary" data-check="writing">写作打卡</button>
              <button class="btn small secondary" id="quickCaptureHome">快速捕获</button>
            </div>
          </div>
        </div>
        <div class="grid-4" style="margin-bottom:14px">
          <div class="stat" title="任务里截止日期早于今天、且尚未完成">
            <div class="label">逾期任务</div><div class="value">${d.task_stats.overdue}</div>
            <div class="stat-hint">截止日已过</div>
          </div>
          <div class="stat" title="截止日期是今天、且尚未完成的任务">
            <div class="label">今日任务</div><div class="value">${d.next_tasks.filter(t=>t.due_date&&String(t.due_date).slice(0,10)===dayKey(today)).length}</div>
            <div class="stat-hint">今天要做</div>
          </div>
          <div class="stat"><div class="label">在读文献</div><div class="value">${d.paper_stats.active_reading}</div></div>
          <div class="stat"><div class="label">连续打卡</div><div class="value">${d.streak_days}</div></div>
        </div>
        <div class="panel">
          <h2>本周一览</h2>
          <div class="week-strip">
            ${weekDays.map((dt) => {
              const k = dayKey(dt);
              const items = byDay[k] || [];
              return `<div class="week-day ${k===dayKey(today)?"is-today":""}">
                <div class="wd">${["日","一","二","三","四","五","六"][dt.getDay()]}</div>
                <div class="dn">${dt.getDate()}</div>
                ${items.slice(0,2).map(e=>`<div class="ev">${esc(e.title)}</div>`).join("")}
                ${items.length>2?`<div class="ev">+${items.length-2}</div>`:""}
              </div>`;
            }).join("")}
          </div>
        </div>
        <div class="panel" style="margin-top:14px">
          <h2>今天完成了什么 / Next Actions</h2>
          <div class="list">
            ${d.next_tasks.length ? d.next_tasks.slice(0,8).map((t)=>`
              <div class="list-item">
                <div><div class="title">${esc(t.title)}</div>
                <div class="meta">${esc(t.priority)} · ${fmtDate(t.due_date)}</div></div>
                <button class="btn small secondary" data-done="${t.id}">完成</button>
              </div>`).join("") : `<div class="empty">暂无待办 — 去任务页加一条，或点快速捕获</div>`}
          </div>
        </div>
      </div>
      <aside>
        ${(() => {
          const painted = weatherHeroHtml(settings, cachedWeather);
          return `<div class="weather-hero sky-${painted.sky}${painted.isNight ? " is-night" : ""}" id="weatherHero" data-sky="${painted.sky}">${painted.html}</div>`;
        })()}
        <div class="mini-cal">
          <div class="toolbar" style="justify-content:space-between;margin:0 0 4px">
            <strong>${month.getFullYear()}年${month.getMonth()+1}月</strong>
            <button class="btn ghost small" id="openFullCal">月历</button>
          </div>
          <div class="mini-cal-grid">
            ${["一","二","三","四","五","六","日"].map(w=>`<div class="mh">${w}</div>`).join("")}
            ${cells.map((c)=>{
              const k = dayKey(c.date);
              const cls = [
                c.inMonth ? "" : "is-out",
                k===dayKey(today) ? "today" : "",
                eventDays.has(k) ? "has" : "",
                activeDays.has(k) ? "is-active" : "",
              ].filter(Boolean).join(" ");
              return `<button class="md ${cls}" data-mini="${k}">${c.date.getDate()}</button>`;
            }).join("")}
          </div>
        </div>
        <div class="panel capture-panel" style="margin-top:12px">
          <div class="capture-head">
            <h3>快速记录</h3>
            <div class="seg" id="captureSeg" role="tablist">
              <button type="button" class="active" data-cap="idea">想法${openIdeas.length ? `<span class="seg-badge">${openIdeas.length}</span>` : ""}</button>
              <button type="button" data-cap="inbox">Inbox${(d.inbox || []).length ? `<span class="seg-badge">${(d.inbox || []).length}</span>` : ""}</button>
            </div>
          </div>
          <div class="field"><textarea id="captureQuick" rows="2" placeholder="写成想法，或丢进 Inbox 稍后再整理…"></textarea></div>
          <div class="toolbar capture-actions">
            <select id="ideaCat" class="cap-idea-only">
              <option value="inspiration">想法</option>
              <option value="record">记录</option>
              <option value="unsorted">待分类</option>
            </select>
            <span class="muted cap-inbox-only hidden" style="font-size:0.78rem">临时暂存，不进想法库</span>
            <button class="btn small" id="saveCaptureQuick">保存到想法</button>
          </div>
          <div id="capPaneIdea" class="capture-pane">
            <div class="capture-scroll">
              ${openIdeas.slice(0, 30).map((i) => `
                <div class="cap-item row">
                  <div>
                    <div class="cap-title">${esc(i.title || i.content)}</div>
                    <div class="cap-meta">${esc({ inspiration: "灵感", record: "记录", unsorted: "待分类" }[i.category] || i.category || "灵感")}</div>
                  </div>
                  <div class="cap-actions">
                    <button class="btn ghost small" data-idea-act="landed" data-idea-id="${i.id}">落实</button>
                    <button class="btn ghost small" data-idea-act="discarded" data-idea-id="${i.id}">丢弃</button>
                  </div>
                </div>`).join("") || `<div class="empty" style="padding:10px 0">没有进行中的想法</div>`}
            </div>
          </div>
          <div id="capPaneInbox" class="capture-pane hidden">
            <div class="capture-scroll">
              ${(d.inbox || []).slice(0, 30).map((i) => `
                <div class="cap-item row">
                  <div class="cap-title">${esc(i.content)}</div>
                  <div class="cap-actions">
                    <button class="btn ghost small" data-inbox-triage="idea" data-inbox="${i.id}" title="整理为想法">想法</button>
                    <button class="btn ghost small" data-inbox-triage="task" data-inbox="${i.id}" title="转为任务">任务</button>
                    <button class="btn ghost small" data-inbox-triage="note" data-inbox="${i.id}" title="写入文献笔记">笔记</button>
                    <button class="btn ghost small" data-inbox-triage="archive" data-inbox="${i.id}">归档</button>
                  </div>
                </div>`).join("") || `<div class="empty" style="padding:10px 0">Inbox 为空</div>`}
            </div>
          </div>
        </div>
        <div class="panel focus-mini-panel" style="margin-top:12px">
          ${renderFocusRecordsHtml(focusStats)}
        </div>
      </aside>
    </div>`;

  document.getElementById("goResearch").onclick = () => navigate("research");
  document.getElementById("openFullCal").onclick = () => navigate("calendar");
  document.getElementById("quickCaptureHome").onclick = () => document.getElementById("btnCapture").click();
  document.getElementById("askAIHome").onclick = async () => {
    if (!ensureLlmEnabled()) return;
    if (!settings.llm_api_key_set) {
      toast("请先在设置中填写大模型 SK");
      navigate("settings");
      return;
    }
    toast("正在生成今日建议…");
    try {
      const r = await API.post("/ai/today-brief", {});
      openModal(`<h3>今日 AI 建议</h3><div class="ai-msg">${esc(r.content)}</div><button class="btn secondary" data-close="1">关闭</button>`);
    } catch (e) {
      toast(e.message || "AI 调用失败");
    }
  };
  bindFocusHomeButton();
  document.getElementById("focusLiveStop")?.addEventListener("click", () => openFocusStopModal());
  document.getElementById("focusLiveEdit")?.addEventListener("click", () => {
    if (state.focusSession?.id) prepareFocusEditModal(state.focusSession);
  });
  document.getElementById("focusAllBtn")?.addEventListener("click", () => openFocusAllModal());
  document.querySelectorAll("[data-focus-edit]").forEach((el) => {
    el.onclick = () => prepareFocusEditModal(Number(el.dataset.focusEdit));
  });
  document.getElementById("homeBackupNow")?.addEventListener("click", () => exportBackup());
  document.getElementById("homeBackupSettings")?.addEventListener("click", () => navigate("settings"));
  if (state.focusSession?.active) updateFocusBar();
  document.getElementById("homeStatusSeg")?.querySelectorAll("[data-st]").forEach((btn) => {
    btn.onclick = async () => {
      const st = btn.dataset.st;
      document.getElementById("homeStatusSeg").querySelectorAll("button").forEach((b) => {
        b.classList.toggle("active", b.dataset.st === st);
      });
      try {
        await setPersonStatusForDay(st, dayKey(new Date()));
      } catch (e) {
        toast(e.message || "状态更新失败");
        navigate("home");
      }
    };
  });
  {
    let mode = "idea";
    const seg = document.getElementById("captureSeg");
    const saveBtn = document.getElementById("saveCaptureQuick");
    const applyCapMode = (m) => {
      mode = m;
      seg.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.cap === m));
      document.getElementById("capPaneIdea").classList.toggle("hidden", m !== "idea");
      document.getElementById("capPaneInbox").classList.toggle("hidden", m !== "inbox");
      document.querySelectorAll(".cap-idea-only").forEach((el) => el.classList.toggle("hidden", m !== "idea"));
      document.querySelectorAll(".cap-inbox-only").forEach((el) => el.classList.toggle("hidden", m !== "inbox"));
      saveBtn.textContent = m === "idea" ? "保存到想法" : "丢进 Inbox";
      document.getElementById("captureQuick").placeholder =
        m === "idea" ? "一条可沉淀的想法 / 问题 / 记录…" : "临时想法、链接、待办线索…";
    };
    seg.querySelectorAll("button").forEach((b) => {
      b.onclick = () => applyCapMode(b.dataset.cap);
    });
    saveBtn.onclick = async () => {
      const content = document.getElementById("captureQuick").value.trim();
      if (!content) return;
      if (mode === "idea") {
        await API.post("/ideas", {
          title: content.slice(0, 40),
          content,
          category: document.getElementById("ideaCat").value,
        });
        toast("已保存到想法");
      } else {
        await API.post("/inbox", { content, item_type: "note" });
        toast("已丢进 Inbox");
      }
      navigate("home");
    };
  }
  view.querySelectorAll("[data-done]").forEach((btn) => {
    btn.onclick = async () => {
      const t = d.next_tasks.find((x) => String(x.id) === btn.dataset.done);
      await API.put(`/tasks/${t.id}`, { ...t, status: "done" });
      navigate("home");
    };
  });
  view.querySelectorAll("[data-check]").forEach((btn) => {
    btn.onclick = async () => {
      await API.post("/checkins", { kind: btn.dataset.check, minutes: 30, note: "" });
      toast("打卡成功");
      navigate("home");
    };
  });
  view.querySelectorAll("[data-inbox]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.inbox);
      const item = (d.inbox || []).find((x) => String(x.id) === String(id));
      const content = (item?.content || "").trim();
      const mode = btn.dataset.inboxTriage || "archive";
      try {
        if (mode === "idea") {
          ideaForm(blankNoteDraft({
            title: content.slice(0, 40) || "Inbox 想法",
            content,
            category: "unsorted",
          }), { sourceInboxId: id });
        } else if (mode === "task") {
          await API.put(`/inbox/${id}?processed=true`);
          toast("已归档 · 请完善任务");
          taskForm({
            title: content.slice(0, 80) || "Inbox 任务",
            description: content,
            status: "todo",
            priority: "medium",
            due_date: "",
            project_id: null,
          });
        } else if (mode === "note") {
          await inboxAppendToPaperNote(id, content);
        } else {
          await API.put(`/inbox/${id}?processed=true`);
          navigate("home");
        }
      } catch (err) {
        toast(err.message || "处理失败");
      }
    };
  });
  view.querySelectorAll("[data-idea-act]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const status = btn.dataset.ideaAct;
      await API.put(`/ideas/${btn.dataset.ideaId}/status?status=${encodeURIComponent(status)}`);
      toast(status === "landed" ? "已落实" : "已丢弃");
      navigate("home");
    };
  });
  view.querySelectorAll("[data-mini]").forEach((btn) => {
    btn.onclick = () => {
      state.calendarMonth = monthStart(new Date(btn.dataset.mini + "T00:00:00"));
      navigate("calendar");
    };
  });
  // 天气不阻塞首屏
  loadWeatherLazy(settings);
}

function startOfDay(d = new Date()) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

async function inboxAppendToPaperNote(inboxId, content) {
  try {
    if (!(state.papers || []).length) await refreshPapersCache();
  } catch (_) {}
  const papers = state.papers || [];
  openModal(`
    <h3>写入文献笔记</h3>
    <p class="muted" style="margin:0 0 10px">将 Inbox 内容追加到所选文献的研究笔记。</p>
    <div class="field"><label>选择文献</label>
      ${entitySinglePickerHtml({
        id: "inboxNotePaper",
        items: papers,
        selectedId: null,
        labelFn: (p) => p.title || `文献 #${p.id}`,
        filterable: true,
        noneLabel: "请选择",
      })}
    </div>
    <div class="toolbar" style="justify-content:flex-end;margin-top:8px">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="inboxNoteConfirm">追加并归档</button>
    </div>`);
  wireEntityPicker("inboxNotePaper");
  document.getElementById("inboxNoteConfirm").onclick = async () => {
    const pid = readEntityPickerId("inboxNotePaper");
    if (!pid) return toast("请选择文献");
    try {
      const note = await API.get(`/papers/${pid}/note`);
      const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
      const block = `\n\n## Inbox · ${stamp}\n\n${content}\n`;
      const body = {
        motivation: note.motivation || "",
        problem: note.problem || "",
        method: note.method || "",
        datasets: note.datasets || "",
        metrics: note.metrics || "",
        results: note.results || "",
        limitations: note.limitations || "",
        relation_to_my_work: note.relation_to_my_work || "",
        quotable: note.quotable || "",
        next_actions: note.next_actions || "",
        raw_markdown: `${note.raw_markdown || ""}${block}`,
      };
      await API.put(`/papers/${pid}/note`, body);
      await syncPaperReadingState(pid);
      await API.put(`/inbox/${inboxId}?processed=true`);
      closeModal();
      toast("已写入笔记并归档");
      navigate("home");
    } catch (e) {
      toast(e.message || "写入失败");
    }
  };
}
function addDays(d, n) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

/* ---------------- Research 看板 ---------------- */
function researchModeSwitchHtml() {
  return `<div class="research-mode-switch" role="tablist" aria-label="项目类型">
    <button type="button" role="tab" data-research-mode="academic" class="${state.researchMode !== "engineering" ? "active" : ""}">学术项目</button>
    <button type="button" role="tab" data-research-mode="engineering" class="${state.researchMode === "engineering" ? "active" : ""}">工程项目</button>
  </div>`;
}

function wireResearchModeSwitch(root) {
  root.querySelectorAll("[data-research-mode]").forEach((btn) => {
    btn.onclick = () => {
      const mode = btn.dataset.researchMode === "engineering" ? "engineering" : "academic";
      if (mode === state.researchMode && state.researchPanel == null) return;
      state.researchMode = mode;
      state.researchPanel = null;
      state.openProjectId = null;
      navigate("research", { researchPanel: null, openProjectId: null });
    };
  });
}

async function renderResearch(view) {
  await refreshProjects();
  if (!state.settings) {
    try { state.settings = await API.get("/settings"); } catch (_) { state.settings = {}; }
  }
  if (state.researchPanel === "projects") {
    await renderResearchProjectsHub(view);
    return;
  }
  if (state.researchMode === "engineering") {
    await renderEngineeringResearch(view);
    return;
  }
  setTopActions(`<button class="btn" id="newResearchProj">+ 学术项目</button>`);
  const board = await API.get("/research-board");
  const stages = board.stages;
  const focusId = state.settings?.focus_project_id || null;
  view.innerHTML = `
    ${researchModeSwitchHtml()}
    <div class="flow-strip">选题 → 分析 → 写作 → 在投 → R&R → 接收 → <span>发表</span></div>
    <div class="hint-box">研究页是生产总起：把课题放进阶段看板，补「下一步」和目标期刊。阶段设为「在投 / R&R / 接收 / 发表」时会自动同步到「投稿」栏目。上方四个数字可点击进入对应列表。</div>
    <div class="grid-4" style="margin-bottom:14px">
      <div class="stat is-link" role="button" tabindex="0" data-jump="projects" title="查看进行中项目">
        <span class="label">进行中项目</span><span class="value">${board.stats.active_projects}</span>
        <span class="stat-hint">查看 / 编辑</span>
      </div>
      <div class="stat is-link" role="button" tabindex="0" data-jump="papers" title="打开文献库">
        <span class="label">文献库</span><span class="value">${board.stats.papers}</span>
        <span class="stat-hint">按项目关联</span>
      </div>
      <div class="stat is-link" role="button" tabindex="0" data-jump="reading" title="阅读中的文献">
        <span class="label">阅读中</span><span class="value">${board.stats.reading}</span>
        <span class="stat-hint">精读队列</span>
      </div>
      <div class="stat is-link" role="button" tabindex="0" data-jump="submissions" title="在投与返修">
        <span class="label">在投/返修</span><span class="value">${board.stats.active_submissions}</span>
        <span class="stat-hint">投稿管理</span>
      </div>
    </div>
    <div class="panel">
      <h2>阶段看板</h2>
      <div class="kanban">
        ${stages.map((s) => {
          const cards = board.board[s] || [];
          return `<div class="kanban-col" data-stage="${s}">
            <h4><span>${s}</span><span class="meta">${cards.length}</span></h4>
            ${cards.map((p)=>`<div class="kanban-card" data-pid="${p.id}">
              <div class="t">${esc(p.title)}</div>
              <div class="meta">${esc(p.next_step || "未写下一步")}</div>
              <div class="meta">${p.next_step_deadline ? "DDL "+fmtDate(p.next_step_deadline) : (p.target_venue||"")}</div>
            </div>`).join("") || `<div class="meta">空</div>`}
          </div>`;
        }).join("")}
      </div>
    </div>
    <div class="panel" style="margin-top:14px">
      <div class="toolbar" style="margin:0 0 10px;justify-content:space-between">
        <h2 style="margin:0">进行中项目</h2>
        <button type="button" class="btn ghost small" data-jump="projects">全部管理 →</button>
      </div>
      <div class="list">
        ${state.projects.filter((p) => p.project_type !== "engineering" && p.status !== "done" && !projectIsHidden(p)).map((p) => `
          <div class="list-item" data-openp="${p.id}">
            <div>
              <div class="title">${esc(p.title)}</div>
              <div class="meta">${esc(p.stage||"选题")} · 进度 ${p.progress||0}% · ${esc(p.next_step||"—")}</div>
            </div>
            <div class="list-item-side">
              ${projectEyeBtn(p)}
              <span class="badge">${esc(p.target_venue||"未定刊")}</span>
            </div>
          </div>`).join("") || `<div class="empty">还没有可见项目 · 点右上角新建，或到「全部管理」取消隐藏</div>`}
      </div>
    </div>`;
  wireResearchModeSwitch(view);
  document.getElementById("newResearchProj").onclick = () => projectForm(null, { projectType: "research" });
  bindProjectEyeButtons(view);
  const jump = async (kind) => {
    if (kind === "projects") {
      await navigate("research", { researchPanel: "projects", openProjectId: null });
    } else if (kind === "papers") {
      await navigate("papers", { papersFilter: { projectId: focusId, statusGroup: null, open: true } });
    } else if (kind === "reading") {
      await navigate("papers", { papersFilter: { projectId: null, statusGroup: "reading", open: true } });
    } else if (kind === "submissions") {
      await navigate("outputs", { fromResearch: true });
    }
  };
  view.querySelectorAll("[data-jump]").forEach((el) => {
    const go = (e) => {
      e.preventDefault();
      e.stopPropagation();
      jump(el.dataset.jump);
    };
    el.onclick = go;
    el.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") go(e);
    };
  });
  view.querySelectorAll("[data-pid], [data-openp]").forEach((el) => {
    el.onclick = () => {
      const id = Number(el.dataset.pid || el.dataset.openp);
      navigate("research", { researchPanel: "projects", openProjectId: id });
    };
  });
}

async function renderEngineeringResearch(view) {
  setTopActions(`<button class="btn" id="newEngineeringProj">+ 工程项目</button>`);
  const board = await API.get("/engineering-board");
  const stages = board.stages || ENGINEERING_PROJECT_STAGES.filter((stage) => stage !== "搁置");
  view.innerHTML = `
    ${researchModeSwitchHtml()}
    <div class="flow-strip is-engineering">待考察 → 架构拆解 → 环境搭建 → 最小复现 → 改造实践 → <span>已沉淀</span></div>
    <div class="hint-box engineering-hint">工程项目用于“学会一个优秀开源项目”，不是把仓库收藏起来。沿着源码理解、环境搭建、最小复现、动手改造推进，并把架构、关键技术、踩坑与决策沉淀成可复用记录。</div>
    <div class="grid-4" style="margin-bottom:14px">
      <div class="stat is-link" role="button" tabindex="0" data-eng-jump="projects">
        <span class="label">进行中工程</span><span class="value">${board.stats.active_projects || 0}</span>
        <span class="stat-hint">查看 / 推进</span>
      </div>
      <div class="stat">
        <span class="label">学习记录</span><span class="value">${board.stats.records || 0}</span>
        <span class="stat-hint">过程可回看</span>
      </div>
      <div class="stat">
        <span class="label">技术沉淀</span><span class="value">${board.stats.technical_records || 0}</span>
        <span class="stat-hint">架构 / 技术 / 决策</span>
      </div>
      <div class="stat">
        <span class="label">已完成</span><span class="value">${board.stats.completed_projects || 0}</span>
        <span class="stat-hint">形成可复用资产</span>
      </div>
    </div>
    <div class="panel">
      <h2>工程学习看板</h2>
      <div class="kanban engineering-kanban">
        ${stages.map((stage) => {
          const cards = board.board?.[stage] || [];
          return `<div class="kanban-col" data-stage="${esc(stage)}">
            <h4><span>${esc(stage)}</span><span class="meta">${cards.length}</span></h4>
            ${cards.map((p) => `<div class="kanban-card engineering-card" data-eng-pid="${p.id}">
              <div class="t">${esc(p.title)}</div>
              <div class="meta">${esc(p.next_step || "未写下一步")}</div>
              <div class="engineering-card-foot">
                <span>${p.record_count || 0} 条记录</span>
                <span>${p.progress || 0}%</span>
              </div>
            </div>`).join("") || `<div class="meta">空</div>`}
          </div>`;
        }).join("")}
      </div>
    </div>
    <div class="panel" style="margin-top:14px">
      <div class="toolbar" style="margin:0 0 10px;justify-content:space-between">
        <h2 style="margin:0">正在学习</h2>
        <button type="button" class="btn ghost small" data-eng-jump="projects">全部管理 →</button>
      </div>
      <div class="list">
        ${state.projects.filter((p) => isEngineeringProject(p) && p.status !== "done" && !projectIsHidden(p)).map((p) => `
          <div class="list-item" data-eng-open="${p.id}">
            <div>
              <div class="title">${esc(p.title)}</div>
              <div class="meta">${esc(p.stage || "待考察")} · ${p.progress || 0}% · ${esc(p.next_step || "—")}</div>
            </div>
            <div class="list-item-side">
              ${projectEyeBtn(p)}
              <span class="badge engineering-badge">${esc(repoDisplay(p.code_repo) || "开源项目")}</span>
            </div>
          </div>`).join("") || `<div class="empty">还没有工程项目 · 点右上角从一个优秀开源仓库开始</div>`}
      </div>
    </div>`;
  wireResearchModeSwitch(view);
  bindProjectEyeButtons(view);
  document.getElementById("newEngineeringProj").onclick = () => projectForm(null, { projectType: "engineering" });
  view.querySelectorAll("[data-eng-jump]").forEach((el) => {
    const go = () => navigate("research", { researchPanel: "projects", openProjectId: null });
    el.onclick = go;
    el.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") go();
    };
  });
  view.querySelectorAll("[data-eng-pid], [data-eng-open]").forEach((el) => {
    el.onclick = (e) => {
      if (e.target.closest("[data-proj-eye]")) return;
      const id = Number(el.dataset.engPid || el.dataset.engOpen);
      navigate("research", { researchPanel: "projects", openProjectId: id });
    };
  });
}

async function renderResearchProjectsHub(view) {
  await refreshProjects();
  const engineering = state.researchMode === "engineering";
  const showHidden = !!state.showHiddenProjects;
  const activeAll = state.projects.filter((p) => p.status !== "done" && isEngineeringProject(p) === engineering);
  const hiddenCount = activeAll.filter((p) => projectIsHidden(p)).length;
  const active = showHidden ? activeAll : activeAll.filter((p) => !projectIsHidden(p));
  setTopActions(`
    <button class="btn secondary" id="backResearch">← ${engineering ? "工程看板" : "学术看板"}</button>
    <button class="btn" id="newResearchProj">+ ${engineering ? "工程项目" : "学术项目"}</button>
  `);
  view.innerHTML = `
    ${researchModeSwitchHtml()}
    <div class="grid-2">
      <div class="panel">
        <div class="toolbar" style="margin:0 0 8px;gap:8px;align-items:center">
          <h2 style="margin:0;flex:1">${engineering ? "工程项目" : "进行中项目"} <span class="meta">${active.length}${hiddenCount && !showHidden ? ` · 隐藏 ${hiddenCount}` : ""}</span></h2>
          <button type="button" class="btn ghost small" id="toggleShowHidden" title="显示/隐藏已藏项目">${showHidden ? "收起隐藏" : "显示隐藏"}</button>
        </div>
        <p class="muted" style="margin:0 0 10px;font-size:0.78rem">${engineering ? "在详情中记录学习过程、源码架构、关键技术与踩坑。" : "点小眼睛可从研究看板隐藏/显示；隐藏项目不出现在阶段看板。"}</p>
        <div class="list" id="researchProjList">
          ${active.map((p) => `
            <div class="list-item ${state.openProjectId === p.id ? "active" : ""} ${projectIsHidden(p) ? "is-proj-hidden" : ""}" data-pr="${p.id}">
              <div>
                <div class="title">${esc(p.title)}</div>
                <div class="meta">${esc(p.stage || "选题")} · ${p.progress || 0}% · ${esc(p.next_step || "—")}</div>
              </div>
              <div class="list-item-side">
                ${projectEyeBtn(p)}
                <span class="badge ${engineering ? "engineering-badge" : ""}">${esc(engineering ? (repoDisplay(p.code_repo) || "开源项目") : (p.target_venue || "未定刊"))}</span>
              </div>
            </div>`).join("") || `<div class="empty">${hiddenCount ? "可见项目为空 · 点「显示隐藏」或小眼睛恢复" : "暂无进行中项目"}</div>`}
        </div>
      </div>
      <div class="panel" id="projDetail"><div class="empty">选择项目查看详情</div></div>
    </div>`;
  document.getElementById("backResearch").onclick = () => navigate("research", { researchPanel: null, openProjectId: null });
  document.getElementById("newResearchProj").onclick = () => projectForm(null, { projectType: engineering ? "engineering" : "research" });
  wireResearchModeSwitch(view);
  document.getElementById("toggleShowHidden").onclick = () => {
    state.showHiddenProjects = !showHidden;
    renderResearchProjectsHub(view);
  };
  bindProjectEyeButtons(view);
  view.querySelectorAll("[data-pr]").forEach((el) => {
    el.onclick = (e) => {
      if (e.target.closest("[data-proj-eye]")) return;
      state.openProjectId = Number(el.dataset.pr);
      view.querySelectorAll("[data-pr]").forEach((x) => x.classList.toggle("active", Number(x.dataset.pr) === state.openProjectId));
      showProject(state.openProjectId, { fromResearch: true });
    };
  });
  const openId = state.openProjectId && active.some((p) => p.id === state.openProjectId)
    ? state.openProjectId
    : active[0]?.id;
  if (openId) {
    state.openProjectId = openId;
    view.querySelectorAll("[data-pr]").forEach((x) => x.classList.toggle("active", Number(x.dataset.pr) === openId));
    await showProject(openId, { fromResearch: true });
  }
}

/* ---------------- 札记：笔记 + 想法 + Inbox ---------------- */
const NOTE_CATEGORY_LABELS = { inspiration: "灵感", record: "记录", unsorted: "待整理" };
const NOTE_STATUS_LABELS = { open: "进行中", landed: "已沉淀", discarded: "已归档" };

function blankNoteDraft(seed = {}) {
  return {
    title: "",
    content: "",
    category: "record",
    status: "open",
    tags: "",
    linked_paper_ids: "",
    linked_project_ids: "",
    linked_submission_ids: "",
    ...seed,
  };
}

function notePlainSnippet(content) {
  return String(content || "")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/[#>*_`~\[\]()!-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ideaForm(row = null, opts = {}) {
  state.notesTab = "ideas";
  if (row?.id) {
    state.selectedIdeaId = row.id;
    state.noteDraft = null;
    state.noteSourceInboxId = null;
  } else {
    state.selectedIdeaId = null;
    state.noteDraft = blankNoteDraft(row || {});
    state.noteSourceInboxId = opts.sourceInboxId || null;
  }
  navigate("ideas");
}

function notesHubTabsHtml(noteCount, ideaCount, pendingInboxCount) {
  return `<div class="notes-hub-tabs" role="tablist" aria-label="札记入口">
    <button type="button" data-notes-tab="notes" class="${state.notesTab === "notes" ? "active" : ""}">笔记 <span>${noteCount}</span></button>
    <button type="button" data-notes-tab="ideas" class="${state.notesTab === "ideas" ? "active" : ""}">想法 <span>${ideaCount}</span></button>
    <button type="button" data-notes-tab="inbox" class="${state.notesTab === "inbox" ? "active" : ""}">Inbox <span>${pendingInboxCount}</span></button>
  </div>`;
}

async function renderIdeas(view) {
  if (typeof view._notesCleanup === "function") view._notesCleanup();
  await Promise.all([
    refreshProjects(),
    (state.papers || []).length ? Promise.resolve() : refreshPapersCache().catch(() => null),
  ]);
  const [notes, ideas, inbox, submissions] = await Promise.all([
    API.get("/notes"),
    API.get("/ideas"),
    API.get("/inbox"),
    API.get("/submissions").catch(() => []),
  ]);
  const pendingInbox = inbox.filter((item) => !item.processed);
  const noteCount = notes.length;
  const newLabel = state.notesTab === "ideas" ? "+ 新想法" : state.notesTab === "notes" ? "+ 新建笔记" : "+ 新想法";
  setTopActions(`<button class="btn" id="newIdea">${newLabel}</button>`);

  if (state.notesTab === "inbox") {
    renderInboxWorkspace(view, { ideas, inbox, submissions, noteCount, pendingInbox });
  } else if (state.notesTab === "ideas") {
    renderIdeasWorkspace(view, { ideas, inbox, submissions, noteCount, pendingInbox });
  } else {
    renderUnifiedNotesWorkspace(view, { notes, ideas, pendingInbox });
  }

  document.getElementById("newIdea")?.addEventListener("click", () => {
    if (state.notesTab === "notes") {
      const sourceType = state.noteSourceFilter === "project" ? "project" : "general";
      state.unifiedNoteDraft = {
        source_type: sourceType,
        source_id: sourceType === "project" ? (state.noteProjectFilter || null) : null,
        title: "",
        content: "",
        tags: "",
      };
      state.selectedNoteKey = null;
      renderIdeas(view);
    } else {
      ideaForm();
    }
  });
  view.querySelectorAll("[data-notes-tab]").forEach((button) => {
    button.onclick = () => {
      state.notesTab = ["notes", "ideas", "inbox"].includes(button.dataset.notesTab) ? button.dataset.notesTab : "notes";
      state.noteDraft = null;
      state.noteSourceInboxId = null;
      state.unifiedNoteDraft = null;
      renderIdeas(view);
    };
  });
}

function unifiedNoteTypeLabel(sourceType) {
  return { general: "普通笔记", project: "项目笔记", paper: "文献笔记" }[sourceType] || "笔记";
}

function renderUnifiedNotesWorkspace(view, { notes, ideas, pendingInbox }) {
  const sourceFilter = state.noteSourceFilter || "all";
  const projectFilter = state.noteProjectFilter ? Number(state.noteProjectFilter) : null;
  const visible = notes.filter((note) => {
    if (sourceFilter !== "all" && note.source_type !== sourceFilter) return false;
    if (projectFilter && !(note.project_ids || []).map(Number).includes(projectFilter)) return false;
    return true;
  });
  let current = state.unifiedNoteDraft;
  const isNew = !!state.unifiedNoteDraft;
  if (!current && state.selectedNoteKey) {
    current = notes.find((note) => note.key === state.selectedNoteKey) || null;
  }
  if (!current && visible.length) {
    current = visible[0];
    state.selectedNoteKey = current.key;
  }
  const projectOptions = (state.projects || [])
    .slice()
    .sort((a, b) => String(a.title || "").localeCompare(String(b.title || ""), "zh-CN"));

  view.innerHTML = `
    <div class="notes-hub-page">
      <div class="notes-hub-head">
        <div>
          ${notesHubTabsHtml(notes.length, ideas.length, pendingInbox.length)}
          <p>普通笔记用于自由记录；项目笔记和文献笔记保留各自来源，并可按研究项目追踪关联内容。</p>
        </div>
      </div>
      <div class="notes-workspace">
        <aside class="notes-sidebar panel">
          <div class="notes-sidebar-tools">
            <input id="unifiedNoteSearch" placeholder="搜索笔记…" aria-label="搜索笔记" />
            <div class="seg note-filter" id="noteSourceFilter">
              <button type="button" data-note-source="all" class="${sourceFilter === "all" ? "active" : ""}">全部</button>
              <button type="button" data-note-source="general" class="${sourceFilter === "general" ? "active" : ""}" title="普通笔记" aria-label="普通笔记">普通</button>
              <button type="button" data-note-source="project" class="${sourceFilter === "project" ? "active" : ""}" title="项目笔记" aria-label="项目笔记">项目</button>
              <button type="button" data-note-source="paper" class="${sourceFilter === "paper" ? "active" : ""}" title="文献笔记" aria-label="文献笔记">文献</button>
            </div>
            <label class="notes-project-filter"><span>关联项目</span>
              <select id="noteProjectFilter">
                <option value="">全部项目</option>
                ${projectOptions.map((project) => `<option value="${project.id}" ${projectFilter === project.id ? "selected" : ""}>${esc(project.title || `项目 #${project.id}`)}</option>`).join("")}
              </select>
            </label>
          </div>
          <div class="notes-list" id="unifiedNotesList">
            ${isNew ? `<button type="button" class="note-list-item active is-draft" data-unified-note-draft="1">
              <span class="note-list-title">新建${unifiedNoteTypeLabel(current.source_type)}</span>
              <span class="note-list-meta">${current.source_type === "project" ? "选择所属项目后保存" : "自由 Markdown 笔记"}</span>
            </button>` : ""}
            ${visible.map((note) => {
              const active = !isNew && current?.key === note.key;
              const title = note.title || note.source_title || "未命名笔记";
              const projectText = (note.project_titles || []).join(" / ") || "未关联项目";
              const searchText = `${title} ${note.content || ""} ${note.tags || ""} ${note.source_title || ""} ${projectText}`.toLowerCase();
              const contextType = { general: "general_note", project: "project_note", paper: "paper_note" }[note.source_type] || "general_note";
              return `<button type="button" class="note-list-item ${active ? "active" : ""}" data-unified-note-key="${esc(note.key)}" data-context-type="${contextType}" data-context-id="${note.note_id}" data-note-search="${esc(searchText)}">
                <span class="note-list-title">${esc(title)}</span>
                <span class="note-list-snippet">${esc(notePlainSnippet(note.content).slice(0, 100) || "空白笔记")}</span>
                <span class="note-list-meta"><span>${unifiedNoteTypeLabel(note.source_type)}</span><span>${note.source_type === "general" ? esc(note.tags || "无标签") : esc(projectText)}</span></span>
              </button>`;
            }).join("") || (!isNew ? `<div class="empty">当前条件下没有笔记</div>` : "")}
          </div>
        </aside>
        <section class="notes-editor-panel panel">
          ${current ? unifiedNoteEditorHtml(current, { isNew, projectOptions }) : `
            <div class="notes-blank-state">
              <div class="notes-blank-mark">记</div>
              <h2>汇总你的三类笔记</h2>
              <p>普通笔记用于自由记录；项目和文献笔记会保留来源与研究项目关联。</p>
              <button type="button" class="btn" id="emptyNewUnifiedNote">+ 新建${sourceFilter === "project" ? "项目笔记" : "普通笔记"}</button>
            </div>`}
        </section>
      </div>
    </div>`;

  document.getElementById("emptyNewUnifiedNote")?.addEventListener("click", () => {
    const sourceType = sourceFilter === "project" ? "project" : "general";
    state.unifiedNoteDraft = { source_type: sourceType, source_id: sourceType === "project" ? projectFilter : null, title: "", content: "", tags: "" };
    state.selectedNoteKey = null;
    renderIdeas(view);
  });
  document.getElementById("noteSourceFilter")?.querySelectorAll("button").forEach((button) => {
    button.onclick = () => {
      state.noteSourceFilter = button.dataset.noteSource || "all";
      if (state.noteSourceFilter === "general") state.noteProjectFilter = null;
      state.selectedNoteKey = null;
      state.unifiedNoteDraft = null;
      renderIdeas(view);
    };
  });
  document.getElementById("noteProjectFilter")?.addEventListener("change", (event) => {
    state.noteProjectFilter = event.target.value ? Number(event.target.value) : null;
    state.selectedNoteKey = null;
    state.unifiedNoteDraft = null;
    renderIdeas(view);
  });
  document.getElementById("unifiedNoteSearch")?.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    view.querySelectorAll("[data-note-search]").forEach((item) => {
      item.classList.toggle("hidden", !!query && !item.dataset.noteSearch.includes(query));
    });
  });
  view.querySelectorAll("[data-unified-note-key]").forEach((button) => {
    button.onclick = () => {
      state.selectedNoteKey = button.dataset.unifiedNoteKey;
      state.unifiedNoteDraft = null;
      renderIdeas(view);
    };
  });

  if (!current) return;
  wireNoteEditor("unifiedNoteMd");
  if (isNew && current.source_type === "project") wireEntityPicker("newNoteProject");
  const saveCurrent = async () => {
    const content = document.getElementById("unifiedNoteMdSource")?.value || "";
    const title = document.getElementById("unifiedNoteTitle")?.value || "";
    const tags = document.getElementById("unifiedNoteTags")?.value || "";
    try {
      if (isNew && current.source_type === "general") {
        const created = await API.post("/general-notes", { title, body: content, tags });
        state.selectedNoteKey = `general:${created.id}`;
        state.noteSourceFilter = "general";
        state.noteProjectFilter = null;
        toast("普通笔记已创建");
      } else if (isNew) {
        const projectId = readEntityPickerId("newNoteProject");
        if (!projectId) return toast("请选择笔记所属项目");
        const created = await API.post(`/projects/${projectId}/notes`, {
          title,
          body: content,
        });
        state.selectedNoteKey = `project:${created.id}`;
        state.noteSourceFilter = "project";
        state.noteProjectFilter = projectId;
        toast("项目笔记已创建");
      } else if (current.source_type === "general") {
        await API.put(`/general-notes/${current.note_id}`, { title, body: content, tags });
        toast("普通笔记已保存");
      } else if (current.source_type === "project") {
        await API.put(`/projects/${current.source_id}/notes/${current.note_id}`, {
          title,
          body: content,
        });
        toast("项目笔记已保存");
      } else {
        const base = await API.get(`/papers/${current.source_id}/note`);
        await API.put(`/papers/${current.source_id}/note`, {
          ...collectNoteFromEditor("unifiedNoteMd", base),
          raw_markdown: content,
        });
        await syncPaperReadingState(current.source_id);
        toast("文献笔记已保存");
      }
      state.unifiedNoteDraft = null;
      await renderIdeas(view);
    } catch (error) {
      toast(error.message || "保存失败");
    }
  };
  document.getElementById("saveUnifiedNoteTop")?.addEventListener("click", saveCurrent);
  document.getElementById("unifiedNoteMdSave")?.addEventListener("click", saveCurrent);
  document.getElementById("cancelUnifiedNote")?.addEventListener("click", () => {
    state.unifiedNoteDraft = null;
    renderIdeas(view);
  });
  document.getElementById("deleteUnifiedNote")?.addEventListener("click", async () => {
    if (current.source_type === "paper") return;
    const typeLabel = unifiedNoteTypeLabel(current.source_type);
    const action = current.source_type === "general" ? "移入回收站" : "删除";
    if (!confirm(`将${typeLabel}「${current.title || current.source_title || "未命名"}」${action}？`)) return;
    if (current.source_type === "general") await API.del(`/general-notes/${current.note_id}`);
    else await API.del(`/projects/${current.source_id}/notes/${current.note_id}`);
    state.selectedNoteKey = null;
    toast(current.source_type === "general" ? "普通笔记已移入回收站" : "项目笔记已删除");
    await renderIdeas(view);
  });
  document.getElementById("openUnifiedNoteSource")?.addEventListener("click", async () => {
    if (current.source_type === "project") {
      await openProjectNotes(current.source_id, { noteId: current.note_id, fromResearch: true });
    } else {
      await openPaper(current.source_id);
    }
  });
  const onKey = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveCurrent();
    }
  };
  document.addEventListener("keydown", onKey);
  view._notesCleanup = () => {
    document.removeEventListener("keydown", onKey);
    view._notesCleanup = null;
  };
}

function unifiedNoteEditorHtml(note, { isNew, projectOptions }) {
  const projectText = (note.project_titles || []).join(" / ") || "未关联项目";
  const title = note.source_type === "paper" ? (note.source_title || "") : (note.title || "");
  const typeLabel = unifiedNoteTypeLabel(note.source_type);
  const sourcePanel = note.source_type === "general"
    ? `<div class="notes-new-source"><div class="field"><label>标签</label><input id="unifiedNoteTags" value="${esc(note.tags || "")}" placeholder="逗号分隔，可选" /></div></div>`
    : isNew
      ? `<div class="notes-new-source"><div class="field"><label>所属项目</label>${entitySinglePickerHtml({
          id: "newNoteProject",
          items: projectOptions,
          selectedId: note.source_id || null,
          labelFn: (project) => project.title || `项目 #${project.id}`,
          filterable: true,
          noneLabel: "请选择研究项目",
        })}</div></div>`
      : `<div class="notes-source-strip"><span>关联项目</span><strong>${esc(projectText)}</strong></div>`;
  return `
    <div class="notes-editor-head">
      <div class="notes-title-field">
        <span class="meta">${isNew ? `新建${typeLabel}` : note.source_type === "general" ? `${typeLabel} · 更新于 ${fmtDT(note.updated_at)}` : `${typeLabel} · ${esc(note.source_title || "")}`}</span>
        <input id="unifiedNoteTitle" value="${esc(title)}" placeholder="笔记标题" ${!isNew && note.source_type === "paper" ? "disabled" : ""} />
      </div>
      <div class="notes-editor-actions">
        ${isNew ? `<button type="button" class="btn danger small" id="cancelUnifiedNote">取消</button>` : note.source_type !== "paper" ? `<button type="button" class="btn danger small" id="deleteUnifiedNote">删除</button>` : ""}
        ${!isNew && note.source_type !== "general" ? `<button type="button" class="btn secondary small" id="openUnifiedNoteSource">打开来源</button>` : ""}
        <button type="button" class="btn small" id="saveUnifiedNoteTop">保存</button>
      </div>
    </div>
    ${sourcePanel}
    <div class="notes-markdown-wrap">
      ${mdEditorHtml(note.content || "", "unifiedNoteMd", { page: true, showSave: true })}
    </div>`;
}

function renderIdeasWorkspace(view, { ideas, submissions, noteCount, pendingInbox }) {
  const filter = state.ideaFilter || "all";
  const visible = filter === "all" ? ideas : ideas.filter((note) => note.status === filter);
  let current = state.noteDraft;
  let isNew = !!state.noteDraft;
  if (!current && state.selectedIdeaId) {
    current = ideas.find((note) => String(note.id) === String(state.selectedIdeaId)) || null;
  }
  if (!current && visible.length) {
    current = visible[0];
    state.selectedIdeaId = current.id;
  }

  view.innerHTML = `
    <div class="notes-hub-page">
      <div class="notes-hub-head">
        <div>
          ${notesHubTabsHtml(noteCount, ideas.length, pendingInbox.length)}
          <p>这里保留独立的想法库；灵感、问题和判断都可以用 Markdown 持续整理。</p>
        </div>
      </div>
      <div class="notes-workspace">
        <aside class="notes-sidebar panel">
          <div class="notes-sidebar-tools">
            <input id="noteListSearch" placeholder="搜索想法…" aria-label="搜索想法" />
            <div class="seg note-filter" id="ideaFilter">
              <button type="button" data-if="all" class="${filter === "all" ? "active" : ""}">全部</button>
              <button type="button" data-if="open" class="${filter === "open" ? "active" : ""}">进行中</button>
              <button type="button" data-if="landed" class="${filter === "landed" ? "active" : ""}">已沉淀</button>
              <button type="button" data-if="discarded" class="${filter === "discarded" ? "active" : ""}">归档</button>
            </div>
          </div>
          <div class="notes-list" id="notesList">
            ${isNew ? `<button type="button" class="note-list-item active is-draft" data-note-draft="1">
              <span class="note-list-title">${esc(current.title || "未命名想法")}</span>
              <span class="note-list-meta">新建中 · 尚未保存</span>
            </button>` : ""}
            ${visible.map((note) => {
              const snippet = notePlainSnippet(note.content);
              const active = !isNew && String(current?.id) === String(note.id);
              const searchText = `${note.title || ""} ${note.content || ""} ${note.tags || ""}`.toLowerCase();
              return `<button type="button" class="note-list-item ${active ? "active" : ""}" data-note-id="${note.id}" data-note-search="${esc(searchText)}">
                <span class="note-list-title">${esc(note.title || "未命名想法")}</span>
                <span class="note-list-snippet">${esc(snippet || "空白想法")}</span>
                <span class="note-list-meta"><span>${esc(NOTE_CATEGORY_LABELS[note.category] || note.category || "记录")}</span><span>${fmtDT(note.updated_at)}</span></span>
              </button>`;
            }).join("") || (!isNew ? `<div class="empty">当前筛选下没有想法</div>` : "")}
          </div>
        </aside>
        <section class="notes-editor-panel panel">
          ${current ? noteEditorWorkspaceHtml(current, { isNew, submissions }) : `
            <div class="notes-blank-state">
              <div class="notes-blank-mark">札</div>
              <h2>记下一条想法</h2>
              <p>可以直接新建，也可以切到 Inbox，把一条临时捕获整理为想法。</p>
              <button type="button" class="btn" id="emptyNewNote">+ 新想法</button>
            </div>`}
        </section>
      </div>
    </div>`;

  document.getElementById("emptyNewNote")?.addEventListener("click", () => ideaForm());
  document.getElementById("ideaFilter")?.querySelectorAll("button").forEach((button) => {
    button.onclick = () => {
      state.ideaFilter = button.dataset.if || "all";
      state.noteDraft = null;
      state.selectedIdeaId = null;
      renderIdeas(view);
    };
  });
  document.getElementById("noteListSearch")?.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    view.querySelectorAll("[data-note-search]").forEach((item) => {
      item.classList.toggle("hidden", !!query && !item.dataset.noteSearch.includes(query));
    });
  });
  view.querySelectorAll("[data-note-id]").forEach((button) => {
    button.onclick = () => {
      state.selectedIdeaId = Number(button.dataset.noteId);
      state.noteDraft = null;
      state.noteSourceInboxId = null;
      renderIdeas(view);
    };
  });

  if (!current) return;
  wireNoteEditor("ideaMd");
  wireEntityPicker("iProjPick");
  wireEntityPicker("iPaperPick");
  wireEntityPicker("iSubPick");

  const saveCurrent = async () => {
    const content = document.getElementById("ideaMdSource")?.value || "";
    const titleInput = document.getElementById("i_title");
    const title = (titleInput?.value || "").trim() || notePlainSnippet(content).slice(0, 40) || "未命名想法";
    const body = {
      title,
      content,
      category: document.getElementById("i_cat")?.value || "record",
      status: document.getElementById("i_status")?.value || "open",
      tags: document.getElementById("i_tags")?.value || "",
      linked_project_ids: joinIdCsv(readEntityPickerIds("iProjPick")),
      linked_paper_ids: joinIdCsv(readEntityPickerIds("iPaperPick")),
      linked_submission_ids: joinIdCsv(readEntityPickerIds("iSubPick")),
    };
    try {
      const saved = isNew ? await API.post("/ideas", body) : await API.put(`/ideas/${current.id}`, body);
      if (state.noteSourceInboxId) {
        await API.put(`/inbox/${state.noteSourceInboxId}?processed=true`);
      }
      state.selectedIdeaId = saved.id;
      state.noteDraft = null;
      state.noteSourceInboxId = null;
      toast(isNew ? "想法已创建" : "想法已保存");
      await renderIdeas(view);
    } catch (error) {
      toast(error.message || "保存失败");
    }
  };
  document.getElementById("saveNoteTop")?.addEventListener("click", saveCurrent);
  document.getElementById("ideaMdSave")?.addEventListener("click", saveCurrent);
  document.getElementById("delIdea")?.addEventListener("click", async () => {
    if (isNew) {
      state.noteDraft = null;
      state.noteSourceInboxId = null;
      await renderIdeas(view);
      return;
    }
    if (!confirm(`将想法「${current.title || "未命名想法"}」移入回收站？`)) return;
    await API.del(`/ideas/${current.id}`);
    state.selectedIdeaId = null;
    toast("已移入回收站");
    await renderIdeas(view);
  });

  const onKey = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
      event.preventDefault();
      saveCurrent();
    }
  };
  document.addEventListener("keydown", onKey);
  view._notesCleanup = () => {
    document.removeEventListener("keydown", onKey);
    view._notesCleanup = null;
  };
}

function noteEditorWorkspaceHtml(note, { isNew, submissions }) {
  return `
    <div class="notes-editor-head">
      <div class="notes-title-field">
        <span class="meta">${isNew ? (state.noteSourceInboxId ? "整理自 Inbox" : "新想法") : `更新于 ${fmtDT(note.updated_at)}`}</span>
        <input id="i_title" value="${esc(note.title || "")}" placeholder="未命名想法" aria-label="想法标题" />
      </div>
      <div class="notes-editor-actions">
        <button type="button" class="btn danger small" id="delIdea">${isNew ? "取消" : "删除"}</button>
        <button type="button" class="btn small" id="saveNoteTop">保存</button>
      </div>
    </div>
    <div class="notes-meta-row">
      <label><span>类型</span><select id="i_cat">
        ${Object.entries(NOTE_CATEGORY_LABELS).map(([value, label]) => `<option value="${value}" ${note.category === value ? "selected" : ""}>${label}</option>`).join("")}
      </select></label>
      <label><span>状态</span><select id="i_status">
        ${Object.entries(NOTE_STATUS_LABELS).map(([value, label]) => `<option value="${value}" ${note.status === value ? "selected" : ""}>${label}</option>`).join("")}
      </select></label>
      <label class="notes-tags-field"><span>标签</span><input id="i_tags" value="${esc(note.tags || "")}" placeholder="逗号分隔" /></label>
    </div>
    <div class="notes-markdown-wrap">
      ${mdEditorHtml(note.content || "", "ideaMd", { page: true, showSave: true })}
    </div>
    <details class="notes-links-panel">
      <summary>关联项目、文献与投稿</summary>
      <div class="notes-links-grid">
        <div class="field"><label>关联项目</label>${entityMultiPickerHtml({
          id: "iProjPick",
          items: state.projects || [],
          selectedIds: parseIdCsv(note.linked_project_ids),
          labelFn: (project) => project.title || `#${project.id}`,
          empty: "暂无项目",
        })}</div>
        <div class="field"><label>关联文献</label>${entityMultiPickerHtml({
          id: "iPaperPick",
          items: state.papers || [],
          selectedIds: parseIdCsv(note.linked_paper_ids),
          labelFn: (paper) => paper.title || `#${paper.id}`,
          filterable: true,
          empty: "暂无文献",
        })}</div>
        <div class="field"><label>关联投稿</label>${entityMultiPickerHtml({
          id: "iSubPick",
          items: submissions || [],
          selectedIds: parseIdCsv(note.linked_submission_ids),
          labelFn: (submission) => submission.title || `#${submission.id}`,
          empty: "暂无投稿",
        })}</div>
      </div>
    </details>`;
}

function renderInboxWorkspace(view, { ideas, inbox, noteCount, pendingInbox }) {
  const filter = state.inboxFilter || "pending";
  const visible = inbox.filter((item) => filter === "all" || (filter === "pending" ? !item.processed : item.processed));
  let current = visible.find((item) => String(item.id) === String(state.selectedInboxId)) || visible[0] || null;
  state.selectedInboxId = current?.id || null;
  view.innerHTML = `
    <div class="notes-hub-page">
      <div class="notes-hub-head">
        <div>
          ${notesHubTabsHtml(noteCount, ideas.length, pendingInbox.length)}
          <p>Inbox 只负责快速接住碎片；在这里把它转成想法、任务或文献笔记。</p>
        </div>
      </div>
      <div class="notes-workspace">
        <aside class="notes-sidebar panel">
          <div class="notes-sidebar-tools">
            <input id="inboxListSearch" placeholder="搜索 Inbox…" aria-label="搜索 Inbox" />
            <div class="seg note-filter" id="inboxFilter">
              <button type="button" data-inbox-filter="pending" class="${filter === "pending" ? "active" : ""}">待整理</button>
              <button type="button" data-inbox-filter="archived" class="${filter === "archived" ? "active" : ""}">已归档</button>
              <button type="button" data-inbox-filter="all" class="${filter === "all" ? "active" : ""}">全部</button>
            </div>
          </div>
          <div class="notes-list">
            ${visible.map((item) => `<button type="button" class="note-list-item ${String(current?.id) === String(item.id) ? "active" : ""}" data-inbox-note-id="${item.id}" data-inbox-search="${esc(`${item.content || ""} ${item.item_type || ""}`.toLowerCase())}">
              <span class="note-list-title">${esc(notePlainSnippet(item.content).slice(0, 70) || "空 Inbox")}</span>
              <span class="note-list-snippet">${esc(item.content || "")}</span>
              <span class="note-list-meta"><span>${esc(item.item_type || "note")}</span><span>${fmtDT(item.created_at)}</span></span>
            </button>`).join("") || `<div class="empty">${filter === "pending" ? "Inbox 已清空" : "没有归档内容"}</div>`}
          </div>
        </aside>
        <section class="notes-editor-panel panel">
          ${current ? inboxDetailHtml(current) : `<div class="notes-blank-state"><div class="notes-blank-mark">✓</div><h2>Inbox 已清空</h2><p>新的临时想法仍可从顶部“快速捕获”进入这里。</p></div>`}
        </section>
      </div>
    </div>`;

  hydrateMarkdown(view.querySelector(".inbox-content"));
  document.getElementById("inboxFilter")?.querySelectorAll("button").forEach((button) => {
    button.onclick = () => {
      state.inboxFilter = button.dataset.inboxFilter || "pending";
      state.selectedInboxId = null;
      renderIdeas(view);
    };
  });
  document.getElementById("inboxListSearch")?.addEventListener("input", (event) => {
    const query = event.target.value.trim().toLowerCase();
    view.querySelectorAll("[data-inbox-search]").forEach((item) => {
      item.classList.toggle("hidden", query && !item.dataset.inboxSearch.includes(query));
    });
  });
  view.querySelectorAll("[data-inbox-note-id]").forEach((button) => {
    button.onclick = () => {
      state.selectedInboxId = Number(button.dataset.inboxNoteId);
      renderIdeas(view);
    };
  });
  if (!current) return;
  document.getElementById("inboxToNote")?.addEventListener("click", () => {
    ideaForm(blankNoteDraft({
      title: notePlainSnippet(current.content).slice(0, 40) || "Inbox 想法",
      content: current.content || "",
      category: "unsorted",
    }), { sourceInboxId: current.id });
  });
  document.getElementById("inboxToTask")?.addEventListener("click", async () => {
    await API.put(`/inbox/${current.id}?processed=true`);
    taskForm({
      title: notePlainSnippet(current.content).slice(0, 80) || "Inbox 任务",
      description: current.content || "",
      status: "todo",
      priority: "medium",
      due_date: "",
      project_id: current.project_id || null,
    });
  });
  document.getElementById("inboxToPaperNote")?.addEventListener("click", () => inboxAppendToPaperNote(current.id, current.content || ""));
  document.getElementById("archiveInbox")?.addEventListener("click", async () => {
    await API.put(`/inbox/${current.id}?processed=${current.processed ? "false" : "true"}`);
    state.selectedInboxId = null;
    toast(current.processed ? "已恢复到待整理" : "已归档");
    await renderIdeas(view);
  });
  document.getElementById("deleteInbox")?.addEventListener("click", async () => {
    if (!confirm("彻底删除这条 Inbox 内容？")) return;
    await API.del(`/inbox/${current.id}`);
    state.selectedInboxId = null;
    toast("Inbox 已删除");
    await renderIdeas(view);
  });
}

function inboxDetailHtml(item) {
  const project = (state.projects || []).find((row) => String(row.id) === String(item.project_id));
  return `
    <div class="inbox-detail">
      <div class="notes-editor-head">
        <div><span class="meta">${item.processed ? "已归档" : "待整理"} · ${fmtDT(item.created_at)}</span><h2>Inbox</h2></div>
        <button type="button" class="btn danger small" id="deleteInbox">删除</button>
      </div>
      <div class="inbox-content md-body">${renderMarkdown(item.content || "")}</div>
      <div class="inbox-detail-meta">
        <span class="tag">${esc(item.item_type || "note")}</span>
        ${project ? `<span class="tag">项目 · ${esc(project.title)}</span>` : ""}
      </div>
      <div class="inbox-triage-bar">
        <button type="button" class="btn" id="inboxToNote">整理为想法</button>
        <button type="button" class="btn secondary" id="inboxToTask">转为任务</button>
        <button type="button" class="btn secondary" id="inboxToPaperNote">写入文献笔记</button>
        <button type="button" class="btn ghost" id="archiveInbox">${item.processed ? "恢复待整理" : "直接归档"}</button>
      </div>
    </div>`;
}

/* ---------------- Life ---------------- */
const LIFE_CATS = [
  { id: "diet", title: "饮食记录", empty: "今天还没记" },
  { id: "exercise", title: "运动记录", empty: "还没有记录" },
  { id: "list", title: "清单", empty: "加一条生活待办" },
  { id: "date", title: "重要日子", empty: "生日、纪念日…" },
  { id: "admin", title: "生活事务", empty: "缴费、行政…" },
];

function parseLifeMeta(entry) {
  try {
    const m = JSON.parse(entry?.meta_json || "{}");
    return m && typeof m === "object" ? m : {};
  } catch (_) {
    return {};
  }
}

function lifeEntrySubline(e) {
  const meta = parseLifeMeta(e);
  const bits = [];
  if (e.category === "diet" && meta.meal) bits.push(meta.meal);
  if (e.category === "exercise" && meta.amount) bits.push(meta.amount);
  if (e.category === "date" && meta.yearly) bits.push("每年");
  if (e.content) bits.push(e.content);
  if (e.day) bits.push(fmtDate(e.day));
  if (e.done) bits.push("已完成");
  return bits.join(" · ");
}

function openLifeEntryModal(category, entry = null) {
  const cat = LIFE_CATS.find((c) => c.id === category) || { id: category, title: category };
  const editing = !!(entry && entry.id);
  const meta = parseLifeMeta(entry);
  const today = dayKey(new Date());
  const dayVal = entry?.day ? String(entry.day).slice(0, 10) : today;

  let fields = "";
  if (category === "diet") {
    const meal = meta.meal || "午餐";
    fields = `
      <div class="field"><label>餐次</label>
        <select id="lf_meal">
          ${["早餐", "午餐", "晚餐", "加餐"].map((m) =>
            `<option value="${m}" ${meal === m ? "selected" : ""}>${m}</option>`).join("")}
        </select>
      </div>
      <div class="field"><label>吃了什么</label><input id="lf_title" value="${esc(entry?.title || "")}" placeholder="例如：牛肉面 + 水果" /></div>
      <div class="field"><label>备注</label><textarea id="lf_content" rows="2" placeholder="口味、份量、感受…">${esc(entry?.content || "")}</textarea></div>
      <div class="field"><label>日期</label><input id="lf_day" type="date" value="${esc(dayVal)}" /></div>`;
  } else if (category === "exercise") {
    fields = `
      <div class="field"><label>运动项目</label><input id="lf_title" value="${esc(entry?.title || "")}" placeholder="例如：跑步 / 力量 / 骑行" /></div>
      <div class="field"><label>时长或距离</label><input id="lf_amount" value="${esc(meta.amount || "")}" placeholder="例如：40 分钟 / 5 km" /></div>
      <div class="field"><label>备注</label><textarea id="lf_content" rows="2" placeholder="强度、配速、地点…">${esc(entry?.content || "")}</textarea></div>
      <div class="field-row">
        <div class="field"><label>日期</label><input id="lf_day" type="date" value="${esc(dayVal)}" /></div>
        <div class="field"><label>&nbsp;</label><label class="check-inline"><input type="checkbox" id="lf_done" ${entry?.done ? "checked" : ""} /> 已完成</label></div>
      </div>`;
  } else if (category === "list") {
    fields = `
      <div class="field"><label>事项</label><input id="lf_title" value="${esc(entry?.title || "")}" placeholder="例如：买日用品" /></div>
      <div class="field"><label>备注</label><textarea id="lf_content" rows="2" placeholder="细节、清单分项…">${esc(entry?.content || "")}</textarea></div>
      <div class="field-row">
        <div class="field"><label>截止日期（可选）</label><input id="lf_day" type="date" value="${esc(entry?.day ? String(entry.day).slice(0, 10) : "")}" /></div>
        <div class="field"><label>&nbsp;</label><label class="check-inline"><input type="checkbox" id="lf_done" ${entry?.done ? "checked" : ""} /> 已完成</label></div>
      </div>`;
  } else if (category === "date") {
    fields = `
      <div class="field"><label>名称</label><input id="lf_title" value="${esc(entry?.title || "")}" placeholder="例如：妈妈生日 / 结婚纪念日" /></div>
      <div class="field"><label>日期</label><input id="lf_day" type="date" value="${esc(entry?.day ? String(entry.day).slice(0, 10) : today)}" /></div>
      <div class="field"><label>备注</label><textarea id="lf_content" rows="2" placeholder="礼物、习俗…">${esc(entry?.content || "")}</textarea></div>
      <div class="field"><label class="check-inline"><input type="checkbox" id="lf_yearly" ${(editing ? !!meta.yearly : true) ? "checked" : ""} /> 每年提醒（按月日）</label></div>`;
  } else {
    // admin + fallback
    fields = `
      <div class="field"><label>事务</label><input id="lf_title" value="${esc(entry?.title || "")}" placeholder="例如：缴电费 / 办证件" /></div>
      <div class="field"><label>说明</label><textarea id="lf_content" rows="3" placeholder="地点、材料、账号提示…">${esc(entry?.content || "")}</textarea></div>
      <div class="field-row">
        <div class="field"><label>截止日期（可选）</label><input id="lf_day" type="date" value="${esc(entry?.day ? String(entry.day).slice(0, 10) : "")}" /></div>
        <div class="field"><label>&nbsp;</label><label class="check-inline"><input type="checkbox" id="lf_done" ${entry?.done ? "checked" : ""} /> 已完成</label></div>
      </div>`;
  }

  openModal(`
    <h3>${editing ? "编辑" : "添加"} · ${esc(cat.title)}</h3>
    ${fields}
    <div class="toolbar" style="justify-content:flex-end;gap:8px;margin-top:8px">
      <button class="btn secondary" data-close="1">取消</button>
      ${editing ? `<button class="btn danger" id="lf_del">删除</button>` : ""}
      <button class="btn" id="lf_save">${editing ? "保存" : "添加"}</button>
    </div>`);

  document.getElementById("lf_save").onclick = async () => {
    const title = (document.getElementById("lf_title")?.value || "").trim();
    if (!title) return toast("请填写标题");
    const content = (document.getElementById("lf_content")?.value || "").trim();
    const dayEl = document.getElementById("lf_day");
    const day = (dayEl?.value || "").trim() || null;
    if (category === "date" && !day) return toast("请选择日期");
    const done = !!document.getElementById("lf_done")?.checked;
    const nextMeta = { ...meta };
    if (category === "diet") nextMeta.meal = document.getElementById("lf_meal")?.value || "";
    if (category === "exercise") {
      const amount = (document.getElementById("lf_amount")?.value || "").trim();
      if (amount) nextMeta.amount = amount;
      else delete nextMeta.amount;
    }
    if (category === "date") nextMeta.yearly = !!document.getElementById("lf_yearly")?.checked;
    const body = {
      category,
      title,
      content,
      day,
      done: category === "diet" || category === "date" ? false : done,
      meta_json: JSON.stringify(nextMeta),
    };
    if (editing) await API.put(`/life/${entry.id}`, body);
    else await API.post("/life", body);
    closeModal();
    toast(editing ? "已保存" : "已添加");
    navigate("life");
  };
  const del = document.getElementById("lf_del");
  if (del) {
    del.onclick = async () => {
      if (!confirm("删除这条记录？")) return;
      await API.del(`/life/${entry.id}`);
      closeModal();
      toast("已删除");
      navigate("life");
    };
  }
}

async function renderLife(view) {
  setTopActions("");
  const entries = await API.get("/life");
  const group = (cat) => entries.filter((e) => e.category === cat);
  const block = (cat, title, placeholder) => {
    const list = group(cat);
    return `<div class="panel">
      <div class="toolbar"><h2 style="margin:0;flex:1">${title}</h2>
        <button class="btn small" data-addlife="${cat}">+ 添加</button></div>
      <div class="list">
        ${list.length ? list.map((e) => {
          const sub = lifeEntrySubline(e);
          return `<div class="list-item life-item ${e.done ? "is-done" : ""}" data-editlife="${e.id}" data-lifecat="${cat}">
          <div style="min-width:0;flex:1">
            <div class="title">${esc(e.title)}</div>
            ${sub ? `<div class="meta">${esc(sub)}</div>` : ""}
          </div>
          <button class="btn ghost small" data-dellife="${e.id}">删</button>
        </div>`;
        }).join("") : `<div class="empty">${placeholder}</div>`}
      </div>
    </div>`;
  };
  view.innerHTML = `
    <div class="hint-box">生活线只存本机。点「+ 添加」按类别填表；点条目可再编辑。</div>
    <div class="life-grid">
      ${LIFE_CATS.map((c) => block(c.id, c.title, c.empty)).join("")}
    </div>`;
  view.querySelectorAll("[data-addlife]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openLifeEntryModal(btn.dataset.addlife);
    };
  });
  view.querySelectorAll("[data-editlife]").forEach((el) => {
    el.onclick = (e) => {
      if (e.target.closest("[data-dellife]")) return;
      const id = Number(el.dataset.editlife);
      const row = entries.find((x) => x.id === id);
      if (row) openLifeEntryModal(row.category || el.dataset.lifecat, row);
    };
  });
  view.querySelectorAll("[data-dellife]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm("删除这条记录？")) return;
      await API.del(`/life/${btn.dataset.dellife}`);
      navigate("life");
    };
  });
}

/* ---------------- Papers ---------------- */
function paperProjectNames(p) {
  const ids = p?.project_ids?.length ? p.project_ids : (p?.project_id ? [p.project_id] : []);
  return ids.map((id) => {
    const hit = state.projects.find((x) => String(x.id) === String(id));
    return hit ? hit.title : `#${id}`;
  });
}

function paperHoverSummary(p) {
  if (!p) {
    return { title: "尚未打开", line: "双击打开阅读；拖到右侧类别框追加维度标签" };
  }
  const tags = (p.tags || []).join(" · ") || "待分类（尚未挂类别）";
  const projs = paperProjectNames(p).join("、") || "无项目标签";
  return {
    title: p.title || "未命名",
    line: `${p.year || "—"} · ${paperStatusLabel(p.status)} / ${p.relevance || "related"} · ${tags} · 项目：${projs}`,
  };
}

function paperHoverPlain(p) {
  const s = paperHoverSummary(p);
  return `${s.title} · ${s.line}`;
}

async function refreshPapersCache() {
  state.papers = await API.get("/papers");
  return state.papers;
}

function updatePaperCache(paper) {
  if (!paper?.id) return paper;
  const papers = state.papers || [];
  const index = papers.findIndex((item) => String(item.id) === String(paper.id));
  if (index >= 0) papers[index] = paper;
  else papers.push(paper);
  state.papers = papers;
  return paper;
}

async function syncPaperReadingState(paperId, paper = null, { redraw = false } = {}) {
  const current = updatePaperCache(paper || await API.get(`/papers/${paperId}`));
  if (!redraw || state.route !== "papers") return current;
  if (state.papersMode === "library") await renderCategoryBoard();
  else if (state.papersMode === "reading") await renderReadingList();
  return current;
}

async function syncPaperAndRedraw(paper, { browse = true } = {}) {
  updatePaperCache(paper);
  if (state.route === "papers") {
    if (state.papersMode === "library") await renderCategoryBoard();
    else if (state.papersMode === "reading") await renderReadingList();
  }
  if (browse && state.watchFolderId) await browseWatch();
  return paper;
}

function pathNorm(s) {
  return String(s || "").replaceAll("/", "\\").toLowerCase();
}

function findPaperByPath(path) {
  return (state.papers || []).find((p) => pathNorm(p.local_path) === pathNorm(path));
}

/** 正式入库 = 至少挂一个非阅读队列类别；打开/写笔记产生的队列标签不算入库。 */
function paperIsCatalogued(paper) {
  return !!(paper && (paper.tags || []).some((tag) => !READING_QUEUE_TAGS.includes(tag)));
}

function resolveBrowsePaper(it) {
  if (it.imported || it.paper_id) {
    return (state.papers || []).find((p) => p.id === it.paper_id) || findPaperByPath(it.path);
  }
  return findPaperByPath(it.path);
}

function paperPutBody(paper, patch = {}) {
  const project_ids = patch.project_ids
    || paper.project_ids
    || (paper.project_id ? [paper.project_id] : []);
  return {
    title: paper.title || "Untitled",
    authors: paper.authors || "",
    year: paper.year ?? null,
    venue: paper.venue || "",
    doi: paper.doi || "",
    paper_type: paper.paper_type || "conference",
    local_path: paper.local_path || "",
    status: paper.status || "todo",
    relevance: paper.relevance || "related",
    folder: paper.folder || "默认",
    abstract: paper.abstract || "",
    bibtex: paper.bibtex || "",
    project_id: project_ids[0] || null,
    project_ids,
    tags: paper.tags || [],
    reading_progress_page: paper.reading_progress_page || 1,
    reading_seconds: paper.reading_seconds || 0,
    reading_depth: paper.reading_depth || "skim",
    ...patch,
    project_ids: patch.project_ids || project_ids,
    project_id: (patch.project_ids || project_ids)[0] || null,
  };
}

async function ensurePaperFromPath(path, tags = []) {
  let paper = findPaperByPath(path);
  if (paper) {
    if (tags?.length) {
      const merged = [...new Set([...(paper.tags || []), ...tags])];
      paper = await API.put(`/papers/${paper.id}`, paperPutBody(paper, {
        tags: merged,
        folder: tags[0] || paper.folder || "默认",
      }));
      await refreshPapersCache();
      paper = findPaperByPath(path) || paper;
    }
    return paper;
  }
  if (!state.watchFolderId) throw new Error("请先选择本地目录");
  const filterPid = state.papersFilter?.projectId ? [Number(state.papersFilter.projectId)] : [];
  const created = await API.post(`/watch-folders/${state.watchFolderId}/import`, {
    paths: [path],
    folder_name: tags[0] || "默认",
    tags: tags || [],
    project_ids: filterPid,
  });
  await refreshPapersCache();
  paper = created?.[0] || findPaperByPath(path);
  if (!paper) throw new Error("入库失败");
  return paper;
}

async function assignSelectedToCategory(catName) {
  const path = state.selectedLocalPath;
  if (!path) {
    toast("请先在左侧点选一个 PDF");
    return;
  }
  try {
    let paper = await ensurePaperFromPath(path, [catName]);
    state.selectedPaperId = paper.id;
    // 正式挂类别后左侧默认隐藏，并清掉左侧选中
    if (!state.showImportedFiles) state.selectedLocalPath = null;
    toast(`已加入「${catName}」（可继续追加其他维度）`);
    await refreshPapersCache();
    state.allTags = await API.get("/tags").catch(() => state.allTags || []);
    browseWatch();
    if (state.papersMode === "library") await renderCategoryBoard();
    else if (state.papersMode === "reading") await renderReadingList();
    // 入库后挂项目标签（可跳过）
    paper = (state.papers || []).find((p) => p.id === paper.id) || paper;
    await openPaperProjectTagsModal(paper, { afterCatalog: true, category: catName });
  } catch (err) {
    toast(err.message || "入库失败");
  }
}

async function openPaperProjectTagsModal(paper, opts = {}) {
  if (!paper?.id) return;
  await refreshProjects();
  if (!(state.projects || []).length) {
    if (opts.afterCatalog) toast("还没有项目；可先在「研究」页创建，再给文献加项目标签");
    return;
  }
  const current = paperProjectIds(paper);
  const pre = new Set(current.map(String));
  const filterPid = state.papersFilter?.projectId ? Number(state.papersFilter.projectId) : null;
  const focusPid = state.settings?.focus_project_id ? Number(state.settings.focus_project_id) : null;
  if (opts.afterCatalog) {
    if (filterPid) pre.add(String(filterPid));
    else if (focusPid) pre.add(String(focusPid));
  }
  openModal(`
    <h3>${opts.afterCatalog ? "添加入库项目标签" : "项目标签"}</h3>
    <p class="muted" style="margin:0 0 10px;font-size:0.8rem">
      ${opts.afterCatalog
        ? `「${esc(paper.title || "未命名")}」已入库${opts.category ? `到「${esc(opts.category)}」` : ""}。请选择要挂上的项目标签。`
        : `为「${esc(paper.title || "未命名")}」设置项目标签。`}
    </p>
    ${projectTagPickerHtml([...pre], "paperProjTags")}
    <div class="toolbar" style="justify-content:flex-end;margin-top:12px">
      <button class="btn secondary" id="projTagsSkip">${opts.afterCatalog ? "跳过" : "取消"}</button>
      <button class="btn" id="projTagsSave">保存标签</button>
    </div>`);
  wireProjectTagPicker("paperProjTags");
  document.getElementById("projTagsSkip").onclick = () => closeModal();
  document.getElementById("projTagsSave").onclick = async () => {
    const project_ids = readProjectTagPicker("paperProjTags");
    const updated = await API.put(`/papers/${paper.id}`, paperPutBody(paper, { project_ids }));
    closeModal();
    toast(project_ids.length ? "项目标签已更新" : "已清除项目标签");
    await syncPaperAndRedraw(updated);
  };
}

async function removePaperFromCategory(paperId, catName) {
  const paper = (state.papers || []).find((p) => String(p.id) === String(paperId));
  if (!paper) return;
  const tags = (paper.tags || []).filter((t) => t !== catName);
  await API.put(`/papers/${paper.id}`, paperPutBody(paper, {
    tags,
    folder: tags[0] || paper.folder || "默认",
  }));
  await refreshPapersCache();
  toast(`已从「${catName}」移出`);
  if (state.papersMode === "library") await renderCategoryBoard();
  else if (state.papersMode === "reading") await renderReadingList();
  if (state.watchFolderId) browseWatch();
}

async function movePaperToCategory(paperId, sourceName, targetName) {
  const paper = (state.papers || []).find((p) => String(p.id) === String(paperId));
  if (!paper || !targetName || sourceName === targetName) return;

  const sourceTag = tagByName(sourceName);
  const targetTag = tagByName(targetName);
  const sourceDir = sourceTag?.dimension || "自定义";
  const targetDir = targetTag?.dimension || "自定义";
  const targetStatus = QUEUE_TO_STATUS[targetName];
  const sourceIsQueue = READING_QUEUE_TAGS.includes(sourceName);
  const targetIsQueue = READING_QUEUE_TAGS.includes(targetName);
  let tags = [...(paper.tags || [])];
  let status = paper.status || "todo";
  let replaced = false;

  if (targetIsQueue && targetStatus) {
    // 阅读队列是由阅读状态派生的系统维度，切换队列不能移除研究分类。
    status = targetStatus;
  } else {
    // 同一维度内是“换分类”；跨维度则是增加一个并行分类。
    replaced = !sourceIsQueue && sourceDir === targetDir;
    if (replaced) tags = tags.filter((name) => name !== sourceName);
    if (!tags.includes(targetName)) tags.push(targetName);
  }

  const updated = await API.put(`/papers/${paper.id}`, paperPutBody(paper, {
    tags,
    status,
    folder: replaced && paper.folder === sourceName ? targetName : paper.folder,
  }));
  updatePaperCache(updated);
  await refreshPapersCache();
  state.selectedPaperId = paper.id;

  if (targetIsQueue) toast(`已移到「${targetName}」`);
  else if (replaced) toast(`已从「${sourceName}」移到「${targetName}」`);
  else toast(`已添加到「${targetName}」（原分类保留）`);

  if (state.papersMode === "library") await renderCategoryBoard();
  else if (state.papersMode === "reading") await renderReadingList();
  if (state.watchFolderId) browseWatch();
}

async function deletePaperFromLibrary(paperId, title = "") {
  const tip = title
    ? `从文献库删除「${title}」？\n本地 PDF 不会被删除，可重新入库。`
    : "从文献库删除？本地 PDF 不会被删除，可重新入库。";
  if (!confirm(tip)) return false;
  await API.del(`/papers/${paperId}`);
  if (state.selectedPaperId === Number(paperId)) state.selectedPaperId = null;
  toast("已从文献库删除");
  await refreshPapersCache();
  if (state.watchFolderId) browseWatch();
  if (state.papersMode === "library") await renderCategoryBoard();
  else if (state.papersMode === "reading") await renderReadingList();
  return true;
}

function ensureLlmEnabled() {
  if (state.settings && state.settings.llm_enabled === false) {
    toast("大模型赋能已关闭，请到设置中开启");
    return false;
  }
  return true;
}

function getLlmReadMode() {
  const m = (state.settings?.llm_read_mode || "summary").toLowerCase();
  return m === "full" ? "full" : "summary";
}

function llmReadModeLabel(mode) {
  return mode === "full" ? "全文通读" : mode === "notes" ? "已有笔记" : "摘要速览";
}

function currentLlmPrompt(key) {
  return state.settings?.llm_prompts?.[key]
    || state.settings?.llm_prompt_defaults?.[key]
    || "";
}

function readModePickerHtml(selected = "", name = "read_mode", opts = {}) {
  const allowNotes = !!opts.allowNotes;
  const cur = selected === "full" || selected === "summary" || (allowNotes && selected === "notes") ? selected : getLlmReadMode();
  return `
    <div class="field"><label>阅读深度</label>
      <div class="seg read-mode-seg" id="${name}_seg">
        <button type="button" data-rm="summary" class="${cur === "summary" ? "active" : ""}">摘要速览</button>
        <button type="button" data-rm="full" class="${cur === "full" ? "active" : ""}">全文通读</button>
        ${allowNotes ? `<button type="button" data-rm="notes" class="${cur === "notes" ? "active" : ""}">已有笔记</button>` : ""}
      </div>
      <input type="hidden" id="${name}" value="${cur}" />
      <p class="muted" style="margin:6px 0 0;font-size:0.75rem">
        速览：摘要/笔记（+少量 PDF）· 快省 token。全文：整本通读（长文分段）· 慢但更准。${allowNotes ? "已有笔记：只使用每篇已保存的笔记，不读取摘要或 PDF。" : ""}
      </p>
    </div>`;
}

function wireReadModePicker(name = "read_mode") {
  const seg = document.getElementById(`${name}_seg`);
  const hidden = document.getElementById(name);
  if (!seg || !hidden) return;
  seg.querySelectorAll("button").forEach((btn) => {
    btn.onclick = () => {
      hidden.value = btn.dataset.rm;
      seg.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b === btn));
    };
  });
}

async function aiCorpusSynthesize(opts = {}) {
  if (!ensureLlmEnabled()) return null;
  const scope = opts.scope === "dimension" ? "dimension" : "tag";
  const name = (opts.name || "").trim();
  if (!name) {
    toast("未指定类别或研究方向");
    return null;
  }
  const mode = opts.mode || "survey";
  const modeLabel = { survey: "综述", gaps: "空白与可做点", reading: "阅读路线" }[mode] || "综述";
  const scopeLabel = scope === "dimension" ? "研究方向" : "类别";
  const count = opts.count != null ? opts.count : "?";
  const readMode = ["full", "summary", "notes"].includes(opts.readMode) ? opts.readMode : getLlmReadMode();
  const depthLabel = llmReadModeLabel(readMode);
  if (!opts.silent && !confirm(
    readMode === "full"
      ? `对${scopeLabel}「${name}」下 ${count} 篇做 AI ${modeLabel}（${depthLabel}）？\n每篇本地 PDF 全文通读后再汇总，耗时可能较长。`
      : readMode === "notes"
        ? `对${scopeLabel}「${name}」下 ${count} 篇做 AI ${modeLabel}（${depthLabel}）？\n只使用每篇文献已保存的笔记；没有笔记的文献会跳过。`
        : `对${scopeLabel}「${name}」下 ${count} 篇做 AI ${modeLabel}（${depthLabel}）？\n主要用标题/摘要/已有笔记，速度快。`
  )) {
    return null;
  }
  const job = beginAiJob({ title: `AI${modeLabel}·${depthLabel} · ${name}`, kind: "corpus" });
  try {
    const r = await API.post("/ai/corpus/synthesize", {
      scope,
      name,
      mode,
      prompt_override: opts.promptOverride || "",
      extra: opts.extra || "",
      use_pdf: true,
      max_papers: opts.maxPapers || 40,
      max_pages_per_paper: 3,
      save_idea: opts.saveIdea !== false,
      read_mode: readMode,
    });
    finishAiJob(job.id, {
      ok: true,
      onOpen: () => {
        showCorpusResultModal(r);
        dismissAiJob(job.id);
      },
    });
    return r;
  } catch (e) {
    const msg = e.message || "AI 综述失败，请检查设置中的 SK / Base URL";
    finishAiJob(job.id, { ok: false, error: msg });
    toast(msg);
    return null;
  }
}

function showCorpusResultModal(r) {
  if (!r?.content) return;
  const scopeLabel = r.scope === "dimension" ? "研究方向" : "类别";
  const draft = { ...r, content: r.content };
  openModal(`
    <h3>AI 综述 · ${esc(r.name || "")}</h3>
    <p class="muted" style="margin:-6px 0 10px;font-size:0.8rem">
      ${esc(scopeLabel)} · ${r.paper_count || 0} 篇 · ${esc(r.mode || "survey")}
      · ${esc(llmReadModeLabel(r.read_mode || "summary"))}
      ${r.saved_idea ? " · 已保存到想法" : ""}
      ${r.model ? " · " + esc(r.model) : ""}
      · 可编辑 Markdown
    </p>
    ${mdEditorHtml(draft.content, "corpusMd", { modal: true, showSave: false })}
    <div class="toolbar" style="justify-content:flex-end;margin-top:12px;gap:8px">
      <button class="btn secondary" data-close="1">关闭</button>
      <button class="btn secondary" id="corpusCopy">复制</button>
      ${r.idea_id
        ? `<button class="btn secondary" id="corpusGoIdea">打开想法</button>
           <button class="btn" id="corpusSaveIdea">保存修改</button>`
        : `<button class="btn" id="corpusSaveIdea">存到想法</button>`}
    </div>`, { wide: true });
  wireNoteEditor("corpusMd");
  const readContent = () => document.getElementById("corpusMdSource")?.value || "";
  document.getElementById("corpusCopy").onclick = async () => {
    try {
      await navigator.clipboard.writeText(readContent());
      toast("已复制");
    } catch (_) {
      toast("复制失败，请手动选择文本");
    }
  };
  const go = document.getElementById("corpusGoIdea");
  if (go) {
    go.onclick = () => {
      closeModal();
      state.ideaFilter = "all";
      state.notesTab = "ideas";
      state.selectedIdeaId = r.idea_id;
      state.noteDraft = null;
      navigate("ideas");
    };
  }
  document.getElementById("corpusSaveIdea").onclick = async () => {
    const content = readContent().trim();
    if (!content) return toast("内容为空");
    draft.content = content;
    if (r.idea_id) {
      const idea = await API.get("/ideas").then((list) => list.find((x) => x.id === r.idea_id)).catch(() => null);
      await API.put(`/ideas/${r.idea_id}`, {
        title: idea?.title || `AI综述 · ${r.name}`,
        content,
        tags: idea?.tags || `AI综述,${r.name}`,
        category: idea?.category || "record",
        status: idea?.status || "open",
        linked_paper_ids: idea?.linked_paper_ids || (r.paper_ids || []).join(","),
        linked_project_ids: idea?.linked_project_ids || "",
        linked_submission_ids: idea?.linked_submission_ids || "",
      });
      toast("想法已更新");
    } else {
      const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
      const created = await API.post("/ideas", {
        title: `AI综述 · ${r.name}（${stamp}）`,
        content,
        tags: `AI综述,${r.name}`,
        category: "record",
        status: "open",
        linked_paper_ids: (r.paper_ids || []).join(","),
      });
      r.idea_id = created.id;
      toast("已存到想法");
    }
  };
}

async function openCorpusAiModal(opts = {}) {
  const scope = opts.scope === "dimension" ? "dimension" : "tag";
  const name = (opts.name || "").trim();
  const count = opts.count || 0;
  if (!name) return;
  if (!count) return toast("该范围内没有文献");
  if (!ensureLlmEnabled()) return;
  const scopeLabel = scope === "dimension" ? "研究方向" : "类别";
  openModal(`
    <h3>AI · ${esc(scopeLabel)}「${esc(name)}」</h3>
    <p class="muted" style="margin:-6px 0 12px;font-size:0.8rem">
      对这 ${count} 篇做整体分析。开始后可关窗，看右下角进度。
    </p>
    ${readModePickerHtml(getLlmReadMode(), "corpus_read_mode", { allowNotes: true })}
    <div class="field"><label>模式</label>
      <select id="corpus_mode">
        <option value="survey">综述笔记（问题谱系 · 方法对比 · 阅读顺序）</option>
        <option value="gaps">空白与可做点</option>
        <option value="reading">精读路线规划</option>
      </select>
    </div>
    <div class="field"><label>本次执行提示词（可编辑）</label>
      <textarea id="corpus_prompt" rows="12">${esc(currentLlmPrompt("corpus_survey"))}</textarea>
      <p class="muted" style="margin:6px 0 0;font-size:0.75rem">已载入当前默认提示词；修改只对本次综述生效，不会覆盖“设置”中的默认值。</p>
    </div>
    <div class="field"><label>补充要求（可选）</label>
      <textarea id="corpus_extra" rows="2" placeholder="例如：偏 CAD 可编辑性 / 关注弱监督与数据效率"></textarea>
    </div>
    <div class="toolbar" style="justify-content:flex-end;gap:8px">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="corpus_run">开始生成</button>
    </div>`);
  wireReadModePicker("corpus_read_mode");
  const corpusPromptKeys = {
    survey: "corpus_survey",
    gaps: "corpus_gaps",
    reading: "corpus_reading",
  };
  document.getElementById("corpus_mode").onchange = (event) => {
    const key = corpusPromptKeys[event.target.value] || "corpus_survey";
    document.getElementById("corpus_prompt").value = currentLlmPrompt(key);
  };
  document.getElementById("corpus_run").onclick = async () => {
    const payload = {
      scope,
      name,
      count,
      mode: document.getElementById("corpus_mode").value,
      readMode: document.getElementById("corpus_read_mode").value,
      promptOverride: document.getElementById("corpus_prompt").value.trim(),
      extra: document.getElementById("corpus_extra").value || "",
      silent: true,
    };
    closeModal();
    await aiCorpusSynthesize(payload);
  };
}

function downloadTextFile(filename, content, mime = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mime });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = filename || "export.txt";
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1500);
}

function openAiDigestModal(paperId, opts = {}) {
  if (!ensureLlmEnabled()) return;
  const paper = (state.papers || []).find((item) => String(item.id) === String(paperId));
  if (!paper?.local_path || paper.file_exists === false) return toast("该文献没有可用的本地 PDF，无法生成 AI 笔记");
  const selectedReadMode = ["full", "summary"].includes(opts.readMode) ? opts.readMode : getLlmReadMode();
  const selectedWriteMode = opts.writeMode === "replace" ? "replace" : "append";
  openModal(`
    <h3>AI 笔记 · ${esc(paper.title || "未命名")}</h3>
    <p class="muted" style="margin:-6px 0 12px;font-size:0.8rem">先检查并修改提示词，点击“开始执行”后才会读取 PDF 和调用 AI。</p>
    ${readModePickerHtml(selectedReadMode, "digest_read_mode")}
    <div class="field"><label>写入方式</label>
      <select id="digest_write_mode">
        <option value="append" ${selectedWriteMode === "append" ? "selected" : ""}>追加到已有笔记</option>
        <option value="replace" ${selectedWriteMode === "replace" ? "selected" : ""}>覆盖已有笔记</option>
      </select>
    </div>
    <div class="field"><label>本次执行提示词（可编辑）</label>
      <textarea id="digest_prompt" rows="12">${esc(currentLlmPrompt("digest"))}</textarea>
      <p class="muted" style="margin:6px 0 0;font-size:0.75rem">已载入当前 AI 笔记默认提示词；修改只对本次执行生效，不会覆盖“设置”中的默认值。</p>
    </div>
    <div class="field"><label>补充要求（可选）</label>
      <textarea id="digest_extra" rows="2" placeholder="例如：重点记录 CAD 表示、损失函数、训练细节和可复现性">${esc(opts.extra || "")}</textarea>
    </div>
    <div class="toolbar" style="justify-content:flex-end;gap:8px">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="digest_run">开始执行</button>
    </div>`);
  wireReadModePicker("digest_read_mode");
  document.getElementById("digest_run").onclick = async () => {
    const runOptions = {
      readMode: document.getElementById("digest_read_mode").value,
      writeMode: document.getElementById("digest_write_mode").value,
      promptOverride: document.getElementById("digest_prompt").value.trim(),
      extra: document.getElementById("digest_extra").value.trim(),
      silent: true,
    };
    closeModal();
    const result = await aiDigestPaper(paperId, runOptions);
    if (result && typeof opts.onComplete === "function") await opts.onComplete(result);
  };
}

const TITLE_SOURCE_LABEL = {
  metadata: "PDF元数据",
  page: "首页文字",
  doi: "DOI",
  stored: "库内标题",
  filename: "文件名",
};

async function openExportTitlesModal(opts = {}) {
  const scope = opts.scope === "dimension" ? "dimension" : "tag";
  const name = (opts.name || "").trim();
  const count = opts.count || 0;
  if (!name) return;
  if (!count) return toast("该范围内没有文献");
  const scopeLabel = scope === "dimension" ? "研究方向" : "类别";
  openModal(`
    <h3>导出标题 · ${esc(scopeLabel)}「${esc(name)}」</h3>
    <p class="muted" style="margin:-6px 0 12px;font-size:0.8rem">
      共 ${count} 篇。默认从 PDF 取<strong>文章标题</strong>（元数据 → 首页文字 → DOI），不是文件名。扫描件无文字层时不做 OCR，会尽量用 DOI。
    </p>
    <div class="field"><label>格式</label>
      <select id="ex_fmt">
        <option value="txt">纯文本 .txt（标题列表）</option>
        <option value="md">Markdown .md</option>
        <option value="csv">CSV（含来源/DOI）</option>
        <option value="json">JSON</option>
      </select>
    </div>
    <label class="check-row" style="display:flex;gap:8px;align-items:flex-start;margin:8px 0">
      <input type="checkbox" id="ex_from_pdf" checked style="margin-top:3px" />
      <span>从 PDF / DOI 解析文章标题（关闭则只用库内已存标题）</span>
    </label>
    <label class="check-row" style="display:flex;gap:8px;align-items:flex-start;margin:8px 0 14px">
      <input type="checkbox" id="ex_update_db" style="margin-top:3px" />
      <span>同时写回文献库标题（方便看板显示也变成文章名）</span>
    </label>
    <div class="toolbar" style="justify-content:flex-end;gap:8px">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="ex_run">导出</button>
    </div>`);
  document.getElementById("ex_run").onclick = async () => {
    const btn = document.getElementById("ex_run");
    btn.disabled = true;
    btn.textContent = "解析中…";
    try {
      const r = await API.post("/papers/export-titles", {
        scope,
        name,
        from_pdf: !!document.getElementById("ex_from_pdf")?.checked,
        use_doi: true,
        update_db: !!document.getElementById("ex_update_db")?.checked,
        fmt: document.getElementById("ex_fmt")?.value || "txt",
      });
      const mime =
        r.fmt === "csv"
          ? "text/csv;charset=utf-8"
          : r.fmt === "json"
            ? "application/json;charset=utf-8"
            : r.fmt === "md"
              ? "text/markdown;charset=utf-8"
              : "text/plain;charset=utf-8";
      downloadTextFile(r.filename || "titles.txt", r.content || "", mime);
      const srcStats = {};
      (r.items || []).forEach((it) => {
        const k = it.source || "stored";
        srcStats[k] = (srcStats[k] || 0) + 1;
      });
      const srcHint = Object.entries(srcStats)
        .map(([k, n]) => `${TITLE_SOURCE_LABEL[k] || k} ${n}`)
        .join(" · ");
      closeModal();
      toast(`已导出 ${r.count || 0} 篇${r.updated ? ` · 写回 ${r.updated}` : ""}`);
      if (r.updated) {
        try {
          state.papers = await API.get("/papers");
          renderCategoryBoard();
        } catch (_) {}
      }
      // keep a peek of sources in console for debugging
      console.info("export-titles", name, srcHint, r.note || "");
    } catch (e) {
      btn.disabled = false;
      btn.textContent = "导出";
      toast(e.message || "导出失败");
    }
  };
}

async function aiDigestPaper(paperId, opts = {}) {
  if (!ensureLlmEnabled()) return null;
  const paper = (state.papers || []).find((p) => String(p.id) === String(paperId));
  const title = paper?.title || `#${paperId}`;
  if (!paper?.local_path) {
    toast("该文献没有本地 PDF，无法通读");
    return null;
  }
  const writeMode = opts.writeMode || "append";
  const readMode = opts.readMode === "full" || opts.readMode === "summary" ? opts.readMode : getLlmReadMode();
  const depthLabel = llmReadModeLabel(readMode);
  const tip = writeMode === "replace"
    ? `对「${title}」生成笔记并覆盖（${depthLabel}）？`
    : `对「${title}」生成研究笔记并追加（${depthLabel}）？\n${readMode === "full" ? "将提取整本 PDF（超长分段）。" : "将用前约 12 页抽样 + 元数据，更快。"}`;
  if (!opts.silent && !confirm(tip)) return null;
  const short = title.length > 22 ? `${title.slice(0, 22)}…` : title;
  const job = beginAiJob({ title: `AI笔记·${depthLabel} · ${short}`, kind: "digest" });
  try {
    const r = await API.post(`/ai/papers/${paperId}/digest`, {
      write_note: opts.writeNote !== false,
      write_mode: writeMode,
      max_pages: 0,
      prompt_override: opts.promptOverride || "",
      extra: opts.extra || "",
      read_mode: readMode,
    });
    if (r?.written) await syncPaperReadingState(paperId, null, { redraw: true });
    finishAiJob(job.id, {
      ok: true,
      onOpen: () => {
        dismissAiJob(job.id);
        if (state.papersMode === "workspace" && state.selectedPaperId === Number(paperId)) {
          openPaper(Number(paperId));
        } else {
          openPaperNotesModal(Number(paperId));
        }
      },
    });
    return r;
  } catch (e) {
    const msg = e.message || "AI 通读失败，请检查设置中的 SK / Base URL";
    finishAiJob(job.id, { ok: false, error: msg });
    toast(msg);
    return null;
  }
}

function paperNoteHasContentClient(note) {
  return [
    "motivation", "problem", "method", "datasets", "metrics", "results",
    "limitations", "relation_to_my_work", "quotable", "next_actions", "raw_markdown",
  ].some((key) => String(note?.[key] || "").trim());
}

function showBatchAiNotesResult(result) {
  const failed = result.failed || [];
  openModal(`
    <h3>批量 AI 笔记 · ${esc(result.name || "")}</h3>
    <div class="stats-row" style="margin:10px 0 14px">
      <span class="pill">完成 ${result.completed || 0}</span>
      <span class="pill">已有笔记跳过 ${result.skipped || 0}</span>
      <span class="pill">无可用 PDF ${result.unavailable || 0}</span>
      <span class="pill">失败 ${failed.length}</span>
    </div>
    ${failed.length ? `
      <div class="field"><label>失败文献</label>
        <div class="list" style="max-height:260px;overflow:auto">
          ${failed.map((item) => `<div class="list-item"><div><div class="title">${esc(item.title)}</div><div class="meta">${esc(item.error)}</div></div></div>`).join("")}
        </div>
      </div>` : `<div class="hint-box">本批次已处理完成。</div>`}
    <div class="toolbar" style="justify-content:flex-end;margin-top:14px">
      <button class="btn" data-close="1">关闭</button>
    </div>`);
}

async function runBatchAiNotes({ name, papers, readMode, notePolicy, promptOverride, extra }) {
  const job = beginAiJob({ title: `批量AI笔记 · ${name}`, kind: "batch-digest" });
  const result = { name, completed: 0, skipped: 0, unavailable: 0, failed: [] };
  const candidates = papers.filter((paper) => {
    if (!paper.local_path || paper.file_exists === false) {
      result.unavailable += 1;
      return false;
    }
    return true;
  });
  const total = candidates.length;
  for (let index = 0; index < candidates.length; index += 1) {
    const paper = candidates[index];
    const short = (paper.title || `#${paper.id}`).slice(0, 18);
    updateAiJob(job.id, { title: `批量AI笔记 ${index + 1}/${total} · ${short}` });
    try {
      if (notePolicy === "skip") {
        const note = await API.get(`/papers/${paper.id}/note`);
        if (paperNoteHasContentClient(note)) {
          result.skipped += 1;
          continue;
        }
      }
      const response = await API.post(`/ai/papers/${paper.id}/digest`, {
        write_note: true,
        write_mode: notePolicy === "replace" ? "replace" : "append",
        max_pages: 0,
        prompt_override: promptOverride || "",
        extra: extra || "",
        read_mode: readMode,
      });
      if (response?.written) result.completed += 1;
      else result.failed.push({ title: paper.title || `#${paper.id}`, error: "未写入笔记" });
    } catch (error) {
      result.failed.push({ title: paper.title || `#${paper.id}`, error: error.message || "生成失败" });
    }
  }
  await refreshPapersCache();
  if (state.route === "papers" && state.papersMode === "library") await renderCategoryBoard();
  const handled = result.completed + result.skipped;
  finishAiJob(job.id, {
    ok: handled > 0 || (!total && result.unavailable > 0),
    error: handled ? "" : (result.failed[0]?.error || "没有可处理的 PDF"),
    onOpen: () => showBatchAiNotesResult(result),
  });
  if (handled || result.unavailable) {
    toast(`批量 AI 笔记完成 · 生成 ${result.completed} · 跳过 ${result.skipped} · 失败 ${result.failed.length}`);
  }
  return result;
}

function openBatchAiNotesModal(name) {
  if (!ensureLlmEnabled()) return;
  const papers = filteredPapers().filter((paper) => (paper.tags || []).includes(name));
  if (!papers.length) return toast("该分类中没有文献");
  const available = papers.filter((paper) => paper.local_path && paper.file_exists !== false).length;
  openModal(`
    <h3>批量 AI 笔记 · ${esc(name)}</h3>
    <p class="muted" style="margin:-6px 0 12px;font-size:0.8rem">
      共 ${papers.length} 篇，${available} 篇有可用 PDF。任务将逐篇执行，可关闭窗口并在右下角查看进度。
    </p>
    ${readModePickerHtml(getLlmReadMode(), "batch_notes_read_mode")}
    <div class="field"><label>已有笔记如何处理</label>
      <select id="batch_notes_policy">
        <option value="skip">跳过已有笔记（推荐）</option>
        <option value="append">追加到已有笔记</option>
        <option value="replace">覆盖已有笔记</option>
      </select>
    </div>
    <div class="field"><label>本次执行提示词（可编辑）</label>
      <textarea id="batch_notes_prompt" rows="12">${esc(currentLlmPrompt("digest"))}</textarea>
      <p class="muted" style="margin:6px 0 0;font-size:0.75rem">已载入当前 AI 笔记默认提示词；修改只对本批任务生效。</p>
    </div>
    <div class="field"><label>补充要求（可选）</label>
      <textarea id="batch_notes_extra" rows="2" placeholder="例如：重点记录 CAD 表示、数据集、训练细节和可复现性"></textarea>
    </div>
    <div class="hint-box">全文通读质量更高，但 ${available} 篇会耗时较长；批量任务采用串行处理，单篇失败不会中断后续文献。</div>
    <div class="toolbar" style="justify-content:flex-end;gap:8px;margin-top:12px">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="batch_notes_run" ${available ? "" : "disabled"}>开始批量生成</button>
    </div>`);
  wireReadModePicker("batch_notes_read_mode");
  document.getElementById("batch_notes_run").onclick = () => {
    const options = {
      name,
      papers: [...papers],
      readMode: document.getElementById("batch_notes_read_mode").value,
      notePolicy: document.getElementById("batch_notes_policy").value,
      promptOverride: document.getElementById("batch_notes_prompt").value.trim(),
      extra: document.getElementById("batch_notes_extra").value.trim(),
    };
    closeModal();
    runBatchAiNotes(options);
  };
}

async function hideBrowsePdf(path, label = "") {
  if (!state.watchFolderId || !path) return false;
  const name = label || path.split(/[/\\]/).pop() || path;
  if (!confirm(`从左侧列表移除「${name}」？\n不会删除磁盘上的 PDF，仅在本应用中隐藏。`)) return false;
  try {
    await API.post(`/watch-folders/${state.watchFolderId}/hide`, { path });
    if (pathNorm(state.selectedLocalPath) === pathNorm(path)) {
      state.selectedLocalPath = null;
    }
    toast("已从左侧列表移除");
    await browseWatch();
    return true;
  } catch (e) {
    toast(e.message || "移除失败");
    return false;
  }
}

function isBrokenLabel(s) {
  const t = String(s || "").replaceAll(" ", "");
  return !t || [...t].every((ch) => ch === "?");
}

function dirMeta(name) {
  const fromApi = (state.tagDirections || []).find((d) => d.name === name);
  if (fromApi) {
    const hint = fromApi.kind === "meta"
      ? (META_DIRECTIONS.find((d) => d.id === name)?.hint || "系统保留")
      : fromApi.kind === "other" ? "临时/未归入方向" : "自建研究方向";
    return { id: name, color: fromApi.color || "#5C6B7A", hint, kind: fromApi.kind, locked: !!fromApi.locked };
  }
  const meta = META_DIRECTIONS.find((d) => d.id === name);
  if (meta) return { ...meta, kind: "meta", locked: true };
  return { id: name, color: "#5C6B7A", hint: "", kind: "topic", locked: false };
}

function tagByName(name) {
  return (state.allTags || []).find((t) => (t.name || t) === name);
}

function listDirections() {
  const fromApi = (state.tagDirections || []).map((d) => d.name);
  const fromTags = [...new Set((state.allTags || []).map((t) => t.dimension).filter(Boolean))];
  return [...fromApi, ...META_DIRECTIONS.map((d) => d.id), ...fromTags]
    .filter((v) => !HIDDEN_PAPER_DIRECTIONS.has(v))
    .filter((v, i, a) => a.indexOf(v) === i);
}

async function refreshTagDirections() {
  const data = await API.get("/tags/dimensions").catch(() => null);
  state.tagDirections = data?.directions || [];
  return state.tagDirections;
}

function openCategoryModal(tag = null, opts = {}) {
  const editing = !!(tag && tag.id);
  const existingDirs = listDirections().filter((d) => d !== "自定义" || editing);
  const preferred = opts.dimension
    || tag?.dimension
    || (state.tagDirections || []).find((d) => d.kind === "topic")?.name
    || META_DIRECTIONS[0].id;
  openModal(`
    <h3>${editing ? "编辑类别" : "新建类别"}</h3>
    <p class="muted" style="margin:-6px 0 12px;font-size:0.8rem">
      维度彼此平行：我的研究方向 / 文献属性 / 阅读队列 / 相关度 可同时挂在同一篇文献上。
    </p>
    <div class="field"><label>所属维度</label>
      <select id="nc_dim">
        ${existingDirs.map((d) => {
          const m = dirMeta(d);
          const sel = preferred === d ? "selected" : "";
          const mark = m.kind === "meta" ? "（系统）" : m.kind === "topic" ? "（我的方向）" : "";
          return `<option value="${esc(d)}" ${sel}>${esc(d)}${mark}${m.hint ? " · " + esc(m.hint) : ""}</option>`;
        }).join("")}
        <option value="__new__">＋ 新建我的方向…</option>
      </select>
    </div>
    <div class="field hidden" id="nc_dim_new_wrap">
      <label>新方向名称</label>
      <input id="nc_dim_new" placeholder="例如：医学影像分割 / 多模态融合" />
    </div>
    <div class="field"><label>类别名称</label><input id="nc_name" value="${esc(tag?.name || "")}" placeholder="例如：弱监督 / U-Net 变体" /></div>
    <div class="field"><label>颜色</label><input id="nc_color" type="color" value="${esc(tag?.color || dirMeta(preferred).color || "#2F6FED")}" /></div>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      ${editing ? `<button class="btn danger" id="nc_del">删除类别</button>` : ""}
      <button class="btn" id="nc_save">${editing ? "保存" : "创建"}</button>
    </div>`);
  const dimEl = document.getElementById("nc_dim");
  const dimNewWrap = document.getElementById("nc_dim_new_wrap");
  const dimNewEl = document.getElementById("nc_dim_new");
  const colorEl = document.getElementById("nc_color");
  const nameEl = document.getElementById("nc_name");
  if (tag?.dimension && !existingDirs.includes(tag.dimension) && tag.dimension !== "自定义") {
    dimEl.value = "__new__";
    dimNewEl.value = tag.dimension;
  }
  const syncDirUi = () => {
    const isNew = dimEl.value === "__new__";
    dimNewWrap.classList.toggle("hidden", !isNew);
    if (!isNew && !editing) colorEl.value = dirMeta(dimEl.value).color;
  };
  dimEl.onchange = syncDirUi;
  syncDirUi();
  document.getElementById("nc_save").onclick = async () => {
    const name = (nameEl.value || "").trim();
    if (!name) return toast("请填写类别名称");
    let dimension = dimEl.value;
    if (dimension === "__new__") {
      dimension = (dimNewEl.value || "").trim();
      if (!dimension) return toast("请填写新大方向名称");
      await API.post(`/tags/dimensions?name=${encodeURIComponent(dimension)}&color=${encodeURIComponent(colorEl.value)}`);
    }
    const q = `name=${encodeURIComponent(name)}&color=${encodeURIComponent(colorEl.value)}&dimension=${encodeURIComponent(dimension)}`;
    if (editing) await API.put(`/tags/${tag.id}?${q}`);
    else await API.post(`/tags?${q}`);
    closeModal();
    state.allTags = await API.get("/tags");
    await refreshTagDirections();
    toast(editing ? "类别已更新" : `已创建「${dimension} / ${name}」`);
    await refreshPapersCache();
    renderCategoryBoard();
  };
  const del = document.getElementById("nc_del");
  if (del) {
    del.onclick = async () => {
      if (!confirm(`删除类别「${tag.name}」？文献上的该标签会一并去掉。`)) return;
      await API.del(`/tags/${tag.id}`);
      closeModal();
      toast("已删除类别");
      state.allTags = await API.get("/tags");
      await refreshTagDirections();
      await refreshPapersCache();
      renderCategoryBoard();
    };
  }
}

function openCreateDirectionModal() {
  openModal(`
    <h3>新建我的研究方向</h3>
    <p class="muted" style="margin:-6px 0 12px;font-size:0.8rem">
      与「阅读队列 / 文献属性」平行；一篇文献可同时挂多个维度下的类别。
    </p>
    <div class="field"><label>方向名称</label>
      <input id="nd_name" placeholder="例如：CAD / 医学影像分割" /></div>
    <div class="field"><label>颜色</label>
      <input id="nd_color" type="color" value="#2F6FED" /></div>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="nd_create">创建</button>
    </div>`);
  document.getElementById("nd_create").onclick = async () => {
    const name = (nd_name.value || "").trim();
    if (!name) return toast("请填写方向名称");
    if (name === "研究方向" || name === "技术路线") {
      return toast("请填写具体课题名，不要使用「研究方向/技术路线」作为方向名");
    }
    await API.post(`/tags/dimensions?name=${encodeURIComponent(name)}&color=${encodeURIComponent(nd_color.value)}`);
    closeModal();
    await refreshTagDirections();
    toast(`已创建方向「${name}」`);
    renderCategoryBoard();
  };
}

function openDirectionModal(dirName) {
  const meta = dirMeta(dirName);
  if (meta.locked || meta.kind === "meta") {
    toast("系统保留维度不可重命名");
    return;
  }
  openModal(`
    <h3>编辑研究方向</h3>
    <p class="muted" style="margin:-6px 0 12px;font-size:0.8rem">重命名后，该方向下所有类别会一起更新。</p>
    <div class="field"><label>方向名称</label><input id="nd_name" value="${esc(dirName || "")}" /></div>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn danger" id="nd_del">删除方向</button>
      <button class="btn" id="nd_save">保存</button>
    </div>`);
  document.getElementById("nd_save").onclick = async () => {
    const newName = (nd_name.value || "").trim();
    if (!newName) return toast("请填写方向名称");
    if (newName === "研究方向" || newName === "技术路线") {
      return toast("请使用具体课题名");
    }
    if (newName === dirName) {
      closeModal();
      return;
    }
    await API.post(`/tags/rename-dimension?old_name=${encodeURIComponent(dirName)}&new_name=${encodeURIComponent(newName)}`);
    closeModal();
    state.allTags = await API.get("/tags");
    await refreshTagDirections();
    toast(`方向已改为「${newName}」`);
    renderCategoryBoard();
  };
  document.getElementById("nd_del").onclick = async () => {
    const count = (state.allTags || []).filter((t) => t.dimension === dirName).length;
    const tip = count
      ? `删除研究方向「${dirName}」？其下 ${count} 个类别将移到「自定义」。`
      : `删除空方向「${dirName}」？`;
    if (!confirm(tip)) return;
    const delCats = count ? confirm("是否连同类别一起删除？\n确定=删除类别；取消=仅移除方向、类别改挂「自定义」。") : false;
    await API.del(`/tags/dimensions?name=${encodeURIComponent(dirName)}&delete_categories=${delCats ? "true" : "false"}`);
    closeModal();
    state.allTags = await API.get("/tags");
    await refreshTagDirections();
    toast("方向已删除");
    await refreshPapersCache();
    renderCategoryBoard();
  };
}

function openNewCategoryModal() {
  return openCategoryModal(null);
}

function papersFilterBarHtml() {
  const f = state.papersFilter || {};
  const projOpts = `<option value="">全部项目</option>` + (state.projects || []).map((p) =>
    `<option value="${p.id}" ${String(f.projectId || "") === String(p.id) ? "selected" : ""}>${esc(p.title)}</option>`
  ).join("");
  const readingOn = f.statusGroup === "reading";
  return `
    <div class="papers-filter-bar">
      <div class="toolbar" style="margin:0;gap:8px;flex-wrap:wrap;align-items:center">
        <button type="button" class="btn ghost small" id="backFromPapersFilter">← 研究</button>
        <label class="meta" style="display:flex;align-items:center;gap:6px">项目
          <select id="papersProjFilter" style="min-width:140px">${projOpts}</select>
        </label>
        <div class="seg" id="papersStatusSeg">
          <button type="button" data-ps="" class="${!readingOn ? "active" : ""}">文献库</button>
          <button type="button" data-ps="reading" class="${readingOn ? "active" : ""}">阅读中</button>
        </div>
        <span class="meta">${filteredPapers().length} 篇</span>
      </div>
      <p class="muted" style="margin:8px 0 0;font-size:0.75rem">
        ${readingOn
          ? "显示已经打开过的待精读 / 已精读文献；项目标签可在编辑中维护。"
          : "可按项目筛选；入库后可在编辑中维护项目标签。"}
      </p>
    </div>`;
}

async function renderReadingList() {
  const right = document.getElementById("papersRight");
  if (!right) return;
  state.papersMode = "reading";
  await refreshProjects();
  const list = filteredPapers();
  right.innerHTML = `
    ${papersFilterBarHtml()}
    <div class="list" style="margin-top:12px">
      ${list.map((p) => `
        <div class="list-item" data-read-paper="${p.id}">
          <div>
            <div class="title">${esc(p.title || "未命名")}</div>
            <div class="meta">${esc(paperStatusLabel(p.status))} · ${(p.tags || []).filter((tag) => !READING_QUEUE_TAGS.includes(tag)).slice(0, 3).map(esc).join(" / ") || "无类别"}</div>
            <div style="margin-top:4px">${paperProjectTagsHtml(p)}</div>
          </div>
          <div class="toolbar" style="margin:0;gap:4px">
            <button type="button" class="btn ghost small" data-proj-paper="${p.id}">项目</button>
            <button type="button" class="btn ghost small" data-edit-paper="${p.id}">编辑</button>
            <button type="button" class="btn small" data-open-paper="${p.id}">打开</button>
          </div>
        </div>`).join("") || `<div class="empty">当前没有「阅读中 / 深读」文献</div>`}
    </div>`;
  bindPapersFilterBar();
  right.querySelectorAll("[data-open-paper]").forEach((btn) => {
    btn.onclick = (e) => { e.stopPropagation(); openPaper(Number(btn.dataset.openPaper)); };
  });
  right.querySelectorAll("[data-edit-paper]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const paper = (state.papers || []).find((x) => String(x.id) === btn.dataset.editPaper);
      if (paper) paperForm(paper);
    };
  });
  right.querySelectorAll("[data-proj-paper]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const paper = (state.papers || []).find((x) => String(x.id) === btn.dataset.projPaper);
      if (paper) openPaperProjectTagsModal(paper);
    };
  });
  right.querySelectorAll("[data-read-paper]").forEach((el) => {
    el.onclick = () => openPaper(Number(el.dataset.readPaper));
  });
}

function bindPapersFilterBar() {
  const back = document.getElementById("backFromPapersFilter");
  if (back) back.onclick = () => navigate("research", { researchPanel: null });
  const sel = document.getElementById("papersProjFilter");
  if (sel) {
    sel.onchange = () => {
      state.papersFilter = {
        ...(state.papersFilter || {}),
        projectId: sel.value ? Number(sel.value) : null,
      };
      if (state.papersFilter.statusGroup === "reading") renderReadingList();
      else renderCategoryBoard();
    };
  }
  document.getElementById("papersStatusSeg")?.querySelectorAll("[data-ps]").forEach((btn) => {
    btn.onclick = () => {
      state.papersFilter = {
        ...(state.papersFilter || {}),
        statusGroup: btn.dataset.ps || null,
      };
      if (state.papersFilter.statusGroup === "reading") renderReadingList();
      else renderCategoryBoard();
    };
  });
}

async function renderCategoryBoard() {
  const right = document.getElementById("papersRight");
  if (!right) return;
  if (state.papersFilter?.statusGroup === "reading") {
    await renderReadingList();
    return;
  }
  state.papersMode = "library";
  await refreshProjects();
  const [tags, dirs] = await Promise.all([
    API.get("/tags").catch(() => state.allTags || []),
    refreshTagDirections(),
  ]);
  state.allTags = tags || [];
  const scope = filteredPapers();
  const selectedName = state.selectedLocalPath
    ? (findPaperByPath(state.selectedLocalPath)?.title || state.selectedLocalPath.split(/[/\\]/).pop())
    : "";

  const byDir = {};
  (state.allTags || []).forEach((t) => {
    const dir = t.dimension || "自定义";
    if (!byDir[dir]) byDir[dir] = [];
    byDir[dir].push(t);
  });
  scope.forEach((p) => {
    (p.tags || []).forEach((name) => {
      if (tagByName(name)) return;
      if (!byDir["自定义"]) byDir["自定义"] = [];
      if (!byDir["自定义"].some((t) => (t.name || t) === name)) {
        byDir["自定义"].push({ name, color: "#5C6B7A", dimension: "自定义" });
      }
    });
  });

  const topicDirs = (dirs || []).filter((d) => d.kind === "topic").map((d) => d.name);
  const metaDirs = META_DIRECTIONS.map((d) => d.id);
  const otherDirs = Object.keys(byDir).filter(
    (k) => !HIDDEN_PAPER_DIRECTIONS.has(k) && !topicDirs.includes(k) && !metaDirs.includes(k)
  );

  const boxHtml = (tag, opts = {}) => {
    const name = tag.name || tag;
    const color = tag.color || opts.color || "#5C6B7A";
    const tid = tag.id || "";
    const list = opts.uncat
      ? uncategorized
      : scope.filter((p) => (p.tags || []).includes(name));
    const deepReadCount = list.filter((p) => paperStatusLabel(p.status) === "已精读").length;
    return `
    <div class="cat-box ${opts.uncat ? "is-uncat" : ""}" data-cat="${esc(name)}" style="--cat:${esc(color)}">
      <div class="cat-box-head">
        <div class="cat-box-head-main">
          <div class="cat-box-title"><span class="cat-dot" style="background:${esc(color)}"></span>${esc(name)}<span class="meta cat-box-count" title="已精读 / 总数">${deepReadCount}/${list.length} 篇</span></div>
        </div>
        <div class="cat-box-actions">
          ${!opts.uncat && list.length ? `<button type="button" class="btn small secondary" data-cat-batch-notes="${esc(name)}" title="先编辑提示词，再批量生成 AI 笔记">批量笔记</button>` : ""}
          ${!opts.uncat && list.length ? `<button type="button" class="btn small" data-cat-ai="${esc(name)}" data-cat-ai-count="${list.length}" title="先编辑提示词，再对本类文献生成综述">综述</button>` : ""}
          ${!opts.uncat && list.length ? `<button type="button" class="btn ghost small" data-cat-export="${esc(name)}" data-cat-export-count="${list.length}" title="导出本类文献文章标题">导出</button>` : ""}
          ${tid ? `<button type="button" class="btn ghost small" data-edit-cat="${tid}" title="编辑类别">编辑</button>` : ""}
        </div>
      </div>
      <div class="cat-box-body">
        ${list.map((p) => `
          <div class="cat-chip ${state.selectedPaperId === p.id ? "active" : ""} ${p.file_exists === false ? "is-missing" : ""}" draggable="true" data-pid="${p.id}" data-path="${esc(p.local_path || "")}" data-cat-name="${opts.uncat ? "" : esc(name)}">
            <button type="button" class="paper-star ${p.starred ? "is-starred" : ""}" data-chip-star="${p.id}" data-starred="${p.starred ? "true" : "false"}" aria-label="${p.starred ? "取消重要标记" : "标记为重要文献"}" aria-pressed="${p.starred ? "true" : "false"}" title="${p.starred ? "取消重要标记" : "标记为重要文献"}">${p.starred ? "★" : "☆"}</button>
            <button type="button" class="cat-chip-main" data-chip-open="${p.id}">
              <span class="cat-chip-title">${esc(p.title || "未命名")}${p.file_exists === false ? ` <span class="path-warn" title="本地 PDF 路径失效">⚠</span>` : ""}</span>
              <span class="cat-chip-sub">
                <span class="meta cat-chip-status">${esc(paperStatusLabel(p.status))}${p.venue ? " · " + esc(p.venue) : (p.year ? " · " + p.year : "")}</span>
                ${paperProjectTagsHtml(p)}
              </span>
              ${opts.uncat ? "" : paperOtherCategoryTagsHtml(p, name)}
            </button>
            <div class="cat-chip-actions">
              ${p.file_exists === false ? `<button type="button" class="btn small" data-chip-relocate="${p.id}" title="重新指定 PDF 路径">重指路径</button>` : ""}
              ${p.local_path && p.file_exists !== false ? `<button type="button" class="btn small secondary" data-chip-ai="${p.id}" title="先编辑提示词，再读取 PDF 生成研究笔记">AI笔记</button>` : ""}
              <button type="button" class="btn ghost small" data-chip-edit="${p.id}" title="编辑">编辑</button>
              ${opts.uncat ? "" : `<button type="button" class="btn ghost small" data-chip-untag="${p.id}" title="仅移出此类别，其他维度保留">移出</button>`}
              <button type="button" class="btn ghost small" data-chip-del="${p.id}" title="从文献库删除">删除</button>
            </div>
          </div>`).join("") || `<div class="cat-empty">${opts.uncat ? "没有未分类文献" : "从左侧拖入 PDF 即可入库"}</div>`}
      </div>
    </div>`;
  };

  const dirSection = (dir, opts = {}) => {
    const tagsInDir = dir === "阅读队列"
      ? ["待读", "待精读", "已精读"].map((name) => tagByName(name)).filter(Boolean)
      : (byDir[dir] || []);
    const meta = dirMeta(dir);
    const editable = !meta.locked && meta.kind !== "meta";
    const kindLabel = meta.kind === "meta" ? "系统维度" : meta.kind === "other" ? "其他" : "我的方向";
    const dirPaperIds = new Set();
    tagsInDir.forEach((t) => {
      scope.forEach((p) => {
        if ((p.tags || []).includes(t.name)) dirPaperIds.add(p.id);
      });
    });
    const dirCount = dirPaperIds.size;
    return `
      <section class="cat-dim ${opts.meta ? "is-meta-dim" : ""} ${meta.kind === "topic" ? "is-topic-dim" : ""}" style="--dim:${esc(meta.color)}" data-dir="${esc(dir)}">
        <div class="cat-dim-head">
          <span class="cat-dim-kind">${esc(kindLabel)}</span>
          <span class="cat-dim-title">${esc(dir)}</span>
          <span class="meta">${esc(opts.hint || meta.hint || "与其他维度平行，可多选")}${dirCount ? ` · ${dirCount} 篇` : ""}</span>
          <div class="cat-dim-actions">
            ${dirCount ? `<button type="button" class="btn small" data-dir-ai="${esc(dir)}" data-dir-ai-count="${dirCount}" title="先编辑提示词，再对本方向文献生成综述">综述</button>` : ""}
            ${dirCount ? `<button type="button" class="btn ghost small" data-dir-export="${esc(dir)}" data-dir-export-count="${dirCount}" title="导出本方向文献文章标题">导出</button>` : ""}
            <button type="button" class="btn ghost small" data-add-cat-dir="${esc(dir)}">+ 类别</button>
            ${editable ? `<button type="button" class="btn ghost small" data-edit-dir="${esc(dir)}">编辑</button>` : ""}
          </div>
        </div>
        <div class="cat-grid">
          ${tagsInDir.length
            ? tagsInDir.map((t) => boxHtml(t)).join("")
            : `<div class="cat-empty-dir">此维度下还没有类别 · 点「+ 类别」添加</div>`}
        </div>
      </section>`;
  };

  const myDirs = [...topicDirs, ...otherDirs].filter((d) => d !== "研究方向" && d !== "技术路线" && d !== "文献性质");
  const showJumpBar = !!(state.papersFilter?.open || state.papersFilter?.projectId || state.papersFilter?.statusGroup);
  right.innerHTML = `
    ${showJumpBar ? papersFilterBarHtml() : ""}
    <div class="cat-board">
      <div class="cat-board-head">
        <div>
          <h3 style="margin:0">文献分类</h3>
          <p class="muted" style="margin:4px 0 0;font-size:0.78rem">
            ${selectedName
              ? `已选：<strong>${esc(selectedName)}</strong> · 拖到类别框入库；文献卡片也可拖动换分类`
              : "拖左侧 PDF 到类别框入库；拖动已入库文献卡片可直接换分类。"}
          </p>
        </div>
        <div class="toolbar" style="margin:0;gap:6px">
          ${!showJumpBar ? `<button type="button" class="btn ghost small" id="btnPapersFilter">按项目筛选</button>` : ""}
          <button type="button" class="btn ghost small" id="btnPathHealth" title="检查本地 PDF 路径是否有效">路径体检</button>
          <button type="button" class="btn ghost small" id="btnNewDirection">+ 我的方向</button>
          <button type="button" class="btn small" id="btnNewCategory">+ 类别</button>
        </div>
      </div>

      ${dirSection("阅读队列", { meta: true })}

      ${myDirs.length
        ? myDirs.map((d) => dirSection(d)).join("")
        : `<section class="cat-dim"><div class="cat-empty-dir">还没有「我的研究方向」。点右上角「+ 我的方向」开始，例如「CAD」。它与文献属性等维度平行，不是互斥选项。</div></section>`}

      ${metaDirs.filter((d) => d !== "阅读队列").map((d) => dirSection(d, { meta: true })).join("")}
    </div>`;

  if (showJumpBar) bindPapersFilterBar();
  else {
    const bf = document.getElementById("btnPapersFilter");
    if (bf) {
      bf.onclick = () => {
        state.papersFilter = { ...(state.papersFilter || {}), projectId: state.settings?.focus_project_id || null, statusGroup: null };
        renderCategoryBoard();
      };
    }
  }
  document.getElementById("btnNewCategory").onclick = () => openCategoryModal(null);
  document.getElementById("btnNewDirection").onclick = () => openCreateDirectionModal();
  document.getElementById("btnPathHealth")?.addEventListener("click", () => openPathHealthModal());
  right.querySelectorAll("[data-add-cat-dir]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openCategoryModal(null, { dimension: btn.dataset.addCatDir });
    };
  });
  right.querySelectorAll("[data-edit-dir]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openDirectionModal(btn.dataset.editDir);
    };
  });
  right.querySelectorAll("[data-edit-cat]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const tag = (state.allTags || []).find((t) => String(t.id) === btn.dataset.editCat);
      if (tag) openCategoryModal(tag);
    };
  });
  right.querySelectorAll("[data-cat-ai]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openCorpusAiModal({
        scope: "tag",
        name: btn.dataset.catAi,
        count: Number(btn.dataset.catAiCount || 0),
      });
    };
  });
  right.querySelectorAll("[data-dir-ai]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openCorpusAiModal({
        scope: "dimension",
        name: btn.dataset.dirAi,
        count: Number(btn.dataset.dirAiCount || 0),
      });
    };
  });
  right.querySelectorAll("[data-cat-export]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openExportTitlesModal({
        scope: "tag",
        name: btn.dataset.catExport,
        count: Number(btn.dataset.catExportCount || 0),
      });
    };
  });
  right.querySelectorAll("[data-dir-export]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openExportTitlesModal({
        scope: "dimension",
        name: btn.dataset.dirExport,
        count: Number(btn.dataset.dirExportCount || 0),
      });
    };
  });
  right.querySelectorAll(".cat-box:not(.is-uncat)").forEach((box) => {
    box.ondragover = (e) => {
      e.preventDefault();
      const isPaperMove = Array.from(e.dataTransfer.types || []).includes("application/x-workbench-paper");
      e.dataTransfer.dropEffect = isPaperMove ? "move" : "copy";
      box.classList.add("drop-hover");
    };
    box.ondragleave = () => box.classList.remove("drop-hover");
    box.ondrop = async (e) => {
      e.preventDefault();
      box.classList.remove("drop-hover");
      const paperPayload = e.dataTransfer.getData("application/x-workbench-paper");
      if (paperPayload) {
        try {
          const dragged = JSON.parse(paperPayload);
          await movePaperToCategory(dragged.paperId, dragged.sourceCategory || "", box.dataset.cat);
        } catch (error) {
          toast(error.message || "移动分类失败");
        }
        return;
      }
      const path = e.dataTransfer.getData("text/plain") || state.selectedLocalPath;
      if (path) {
        state.selectedLocalPath = path;
        assignSelectedToCategory(box.dataset.cat);
      }
    };
  });
  let clickTimer = null;
  right.querySelectorAll(".cat-chip").forEach((el) => {
    el.ondragstart = (e) => {
      if (e.target.closest?.(".cat-chip-actions, .paper-star")) {
        e.preventDefault();
        return;
      }
      clearTimeout(clickTimer);
      const payload = JSON.stringify({
        paperId: Number(el.dataset.pid),
        sourceCategory: el.dataset.catName || "",
      });
      e.dataTransfer.setData("application/x-workbench-paper", payload);
      e.dataTransfer.setData("text/plain", `paper:${el.dataset.pid}`);
      e.dataTransfer.effectAllowed = "move";
      el.classList.add("is-dragging");
    };
    el.ondragend = () => {
      el.classList.remove("is-dragging");
      right.querySelectorAll(".cat-box.drop-hover").forEach((box) => box.classList.remove("drop-hover"));
    };
    const selectChip = () => {
      state.selectedPaperId = Number(el.dataset.pid);
      if (el.dataset.path) state.selectedLocalPath = el.dataset.path;
      right.querySelectorAll(".cat-chip").forEach((x) => x.classList.toggle("active", x === el));
      browseWatch();
    };
    el.querySelector("[data-chip-open]")?.addEventListener("click", () => {
      clearTimeout(clickTimer);
      clickTimer = setTimeout(selectChip, 200);
    });
    el.querySelector("[data-chip-open]")?.addEventListener("dblclick", async (e) => {
      e.preventDefault();
      clearTimeout(clickTimer);
      rememberPaperBoardPosition(el);
      await openPaper(Number(el.dataset.pid), { fromBoard: true });
    });
  });
  right.querySelectorAll("[data-chip-edit]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const paper = (state.papers || []).find((x) => String(x.id) === btn.dataset.chipEdit);
      if (paper) paperForm(paper);
    };
  });
  right.querySelectorAll("[data-chip-relocate]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      const paper = (state.papers || []).find((x) => String(x.id) === btn.dataset.chipRelocate);
      if (paper) relocatePaperPath(paper);
    };
  });
  right.querySelectorAll("[data-chip-ai]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      document.getElementById("paperHoverTip")?.classList.add("hidden");
      const id = Number(btn.dataset.chipAi);
      openAiDigestModal(id);
    };
  });
  right.querySelectorAll("[data-chip-untag]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const chip = btn.closest(".cat-chip");
      const catName = chip?.dataset.catName || "";
      if (!catName) return;
      await removePaperFromCategory(btn.dataset.chipUntag, catName);
    };
  });
  right.querySelectorAll("[data-chip-del]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const paper = (state.papers || []).find((x) => String(x.id) === btn.dataset.chipDel);
      await deletePaperFromLibrary(btn.dataset.chipDel, paper?.title || "");
    };
  });
  right.querySelectorAll("[data-cat-batch-notes]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openBatchAiNotesModal(btn.dataset.catBatchNotes);
    };
  });
  right.querySelectorAll("[data-chip-star]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const id = Number(btn.dataset.chipStar);
      const starred = btn.dataset.starred !== "true";
      btn.disabled = true;
      try {
        const updated = await API.post(`/papers/${id}/star?starred=${starred}`);
        updatePaperCache(updated);
        right.querySelectorAll(`[data-chip-star="${id}"]`).forEach((star) => {
          star.dataset.starred = updated.starred ? "true" : "false";
          star.classList.toggle("is-starred", !!updated.starred);
          star.textContent = updated.starred ? "★" : "☆";
          star.setAttribute("aria-pressed", updated.starred ? "true" : "false");
          star.setAttribute("aria-label", updated.starred ? "取消重要标记" : "标记为重要文献");
          star.title = updated.starred ? "取消重要标记" : "标记为重要文献";
        });
        toast(updated.starred ? "已标记为重要文献" : "已取消重要标记");
      } catch (error) {
        toast(error.message || "星标更新失败");
      } finally {
        right.querySelectorAll(`[data-chip-star="${id}"]`).forEach((star) => { star.disabled = false; });
      }
    };
  });
}

function rememberPaperBoardPosition(chip) {
  const right = document.getElementById("papersRight");
  const body = chip?.closest(".cat-box-body");
  if (!right || !chip || !body) return;
  const chipRect = chip.getBoundingClientRect();
  const bodyRect = body.getBoundingClientRect();
  const rightRect = right.getBoundingClientRect();
  state.paperBoardReturnPosition = {
    paperId: Number(chip.dataset.pid),
    category: chip.dataset.catName || "",
    rightScrollTop: right.scrollTop,
    categoryScrollTop: body.scrollTop,
    chipOffsetInBody: chipRect.top - bodyRect.top,
    chipOffsetInRight: chipRect.top - rightRect.top,
  };
}

async function restorePaperBoardPosition() {
  const saved = state.paperBoardReturnPosition;
  const right = document.getElementById("papersRight");
  if (!saved || !right) return;
  await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  if (state.papersMode !== "library") return;

  const chips = [...right.querySelectorAll(".cat-chip")];
  const exact = chips.find((chip) =>
    Number(chip.dataset.pid) === saved.paperId
    && (chip.dataset.catName || "") === saved.category
  );
  const chip = exact || chips.find((item) => Number(item.dataset.pid) === saved.paperId);
  if (!chip) {
    right.scrollTop = saved.rightScrollTop || 0;
    return;
  }

  const body = chip.closest(".cat-box-body");
  right.scrollTop = exact ? (saved.rightScrollTop || 0) : 0;
  if (body) {
    if (exact) {
      body.scrollTop = saved.categoryScrollTop || 0;
    } else {
      const bodyRect = body.getBoundingClientRect();
      const chipRect = chip.getBoundingClientRect();
      body.scrollTop += chipRect.top - bodyRect.top - body.clientHeight * 0.3;
    }
  }

  await new Promise((resolve) => requestAnimationFrame(resolve));
  const bodyRect = body?.getBoundingClientRect();
  const chipRect = chip.getBoundingClientRect();
  if (body && bodyRect && (chipRect.bottom < bodyRect.top || chipRect.top > bodyRect.bottom)) {
    body.scrollTop += chipRect.top - bodyRect.top - body.clientHeight * 0.3;
  }
  await new Promise((resolve) => requestAnimationFrame(resolve));
  const currentChipRect = chip.getBoundingClientRect();
  const rightRect = right.getBoundingClientRect();
  const wantedOffset = exact ? saved.chipOffsetInRight : right.clientHeight * 0.3;
  right.scrollTop += currentChipRect.top - rightRect.top - wantedOffset;
}

async function renderPapers(view) {
  await refreshProjects();
  state.papersMode = "library";
  setTopActions(`<button class="btn ghost" id="btnBackLibrary" style="display:none">返回分类</button>`);
  const [papers, folders, allTags] = await Promise.all([
    API.get("/papers"),
    API.get("/watch-folders"),
    API.get("/tags").catch(() => []),
  ]);
  state.papers = papers;
  state.allTags = allTags || [];
  if (!state.watchFolderId && folders.length) state.watchFolderId = folders[0].id;

  view.innerHTML = `
    <div class="papers-layout">
      <aside class="panel papers-left" id="papersBrowse">
        <div class="toolbar" style="margin:0 0 8px;justify-content:space-between;align-items:center">
          <h3 style="margin:0">本地目录</h3>
          <div class="toolbar" style="gap:4px">
            <button type="button" class="btn ghost small" id="refreshWatch" title="重新扫描当前目录中的 PDF" ${state.watchFolderId ? "" : "disabled"}>刷新</button>
            <button class="btn ghost small" id="addWatch">+ 目录</button>
          </div>
        </div>
        <div class="meta" style="margin:0 0 6px">${folders.length} 个根目录 · 点击切换</div>
        <div class="list watch-path-list" id="watchList">
          ${folders.map((f) => {
            const label = isBrokenLabel(f.name) ? (f.path || "").split(/[/\\]/).pop() : f.name;
            return `<div class="list-item ${state.watchFolderId===f.id?"active":""}" data-wf="${f.id}">
              <div style="min-width:0;flex:1">
                <div class="title">${esc(label)}</div>
                <div class="meta">${esc(f.path)}</div>
              </div>
              <button type="button" class="btn ghost small" data-rm-wf="${f.id}" title="移除此目录">×</button>
            </div>`;
          }).join("") || `<div class="empty">添加一个或多个论文根目录</div>`}
        </div>
        <div id="fileStage" class="file-list-scroll"><div class="empty">选择上方目录</div></div>
        <p class="muted papers-hint">支持多个根目录切换浏览<br/>双击打开阅读 · 拖到右侧类别框入库（可多维）</p>
      </aside>
      <section class="panel papers-right" id="papersRight"></section>
    </div>
    <div id="paperHoverTip" class="paper-hover-tip hidden"></div>`;

  document.getElementById("addWatch").onclick = async () => {
    const path = prompt("再添加一个本地论文根目录（绝对路径）\n例如 D:\\\\Papers\\\\CV 或 D:\\\\Projects\\\\cursor\\\\papers");
    if (!path) return;
    const name = path.split(/[/\\]/).filter(Boolean).pop() || "papers";
    try {
      await API.post("/watch-folders", { name, path, enabled: true });
      toast(`已添加目录「${name}」`);
      navigate("papers");
    } catch (e) {
      toast(e.message || "添加失败");
    }
  };
  document.getElementById("refreshWatch").onclick = async (event) => {
    const btn = event.currentTarget;
    btn.disabled = true;
    btn.textContent = "刷新中…";
    try {
      await browseWatch();
      toast("目录已刷新");
    } catch (e) {
      toast(e.message || "目录刷新失败");
    } finally {
      const liveBtn = document.getElementById("refreshWatch");
      if (liveBtn) {
        liveBtn.disabled = !state.watchFolderId;
        liveBtn.textContent = "刷新";
      }
    }
  };
  document.querySelectorAll("[data-rm-wf]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm("从监视列表移除该目录？（不删除磁盘文件）")) return;
      await API.del(`/watch-folders/${btn.dataset.rmWf}`);
      if (state.watchFolderId === Number(btn.dataset.rmWf)) state.watchFolderId = null;
      navigate("papers");
    };
  });
  document.getElementById("btnBackLibrary").onclick = () => {
    state.papersMode = "library";
    document.getElementById("btnBackLibrary").style.display = "none";
    renderCategoryBoard();
  };

  document.querySelectorAll("[data-wf]").forEach((el) => {
    el.onclick = () => {
      state.watchFolderId = Number(el.dataset.wf);
      state.browseSub = "";
      document.querySelectorAll("[data-wf]").forEach((x) => x.classList.toggle("active", Number(x.dataset.wf) === state.watchFolderId));
      browseWatch();
    };
  });
  await renderCategoryBoard();
  if (state.watchFolderId) browseWatch();
}

async function browseWatch(opts = {}) {
  if (!state.watchFolderId) return;
  const focusSelected = !!opts.focusSelected;
  const forcedScrollTop = Number.isFinite(opts.restoreScrollTop) ? opts.restoreScrollTop : null;
  const previousGrid = document.getElementById("fileGrid");
  if (previousGrid?.dataset.scrollKey) {
    state.browseScrollPositions[previousGrid.dataset.scrollKey] = previousGrid.scrollTop;
  }
  if (!state.papers?.length) await refreshPapersCache();
  const stage = document.getElementById("fileStage");
  if (!stage) return;
  const items = await API.get(`/watch-folders/${state.watchFolderId}/browse?sub=${encodeURIComponent(state.browseSub || "")}`);
  const crumbs = ["根目录", ...(state.browseSub || "").split("/").filter(Boolean)];
  const showImported = !!state.showImportedFiles;
  const allPdfs = items.filter((i) => !i.is_dir);
  const dirs = items.filter((i) => i.is_dir);
  const cataloguedCount = allPdfs.filter((i) => paperIsCatalogued(resolveBrowsePaper(i))).length;
  // 默认只隐藏「已挂类别」的；双击打开但未分类的仍留在左侧
  const pdfs = showImported
    ? allPdfs
    : allPdfs.filter((i) => !paperIsCatalogued(resolveBrowsePaper(i)));

  stage.innerHTML = `
    <div class="file-stage-head">
      <div class="file-crumbs">
        <button class="btn ghost small" id="upDir" ${state.browseSub ? "" : "disabled"}>上级</button>
        <span class="file-crumb-path">${crumbs.map((c) => esc(c)).join(" / ")}</span>
      </div>
      <div class="file-stage-tools">
        <button type="button" class="btn ghost small ${showImported ? "active" : ""}" id="toggleImported" title="默认隐藏已分类入库的 PDF；双击打开未分类的仍显示">
          ${showImported ? "含已分类" : "待分类"}
        </button>
        <span class="meta">${pdfs.length}${showImported ? "" : ` / ${allPdfs.length}`} PDF${cataloguedCount && !showImported ? ` · 已藏 ${cataloguedCount}` : ""}</span>
      </div>
    </div>
    <div class="file-rows" id="fileGrid">
      ${dirs.map((it) => `
        <button type="button" class="file-row is-dir" data-dir="${esc(it.path)}">
          <span class="file-ico file-ico-dir" aria-hidden="true"></span>
          <span class="file-row-main">
            <span class="file-name">${esc(it.name)}</span>
            <span class="file-meta">文件夹</span>
          </span>
        </button>`).join("")}
      ${pdfs.map((it) => {
        const paper = resolveBrowsePaper(it);
        const catalogued = paperIsCatalogued(paper);
        const opened = !!(paper || it.imported);
        const status = catalogued ? "已分类" : opened ? "待分类" : "未打开";
        const tip = paperHoverSummary(paper);
        const selected = state.selectedLocalPath && pathNorm(state.selectedLocalPath) === pathNorm(it.path);
        const label = paper?.title || it.name.replace(/\.pdf$/i, "");
        const pid = paper?.id || it.paper_id || "";
        return `
        <div class="file-row is-pdf ${catalogued ? "is-ready" : opened ? "is-opened" : ""} ${selected ? "active" : ""}" draggable="true" data-path="${esc(it.path)}" data-pid="${pid}" data-name="${esc(label)}" data-tip-title="${esc(tip.title)}" data-tip-line="${esc(tip.line)}" role="button" tabindex="0">
          <span class="file-ico file-ico-pdf" aria-hidden="true"></span>
          <span class="file-row-main">
            <span class="file-name">${esc(label)}</span>
            <span class="file-meta">${status}${it.size ? " · " + Math.round(it.size / 1024) + " KB" : ""}</span>
          </span>
          <span class="file-row-actions">
            ${catalogued ? "" : `<button type="button" class="btn ghost small file-row-reveal" data-file-action="reveal" data-reveal-pdf="${esc(it.path)}" title="在本地文件夹中打开">目录</button>`}
            <button type="button" class="btn ghost small file-row-del" data-file-action="remove" data-del-pdf="${esc(it.path)}" title="从左侧列表移除（不删磁盘文件）">移除</button>
          </span>
        </div>`;
      }).join("")}
      ${!dirs.length && !pdfs.length
        ? `<div class="empty">${allPdfs.length && !showImported ? "本页 PDF 均已分类入库 · 点上方「待分类」可显示已分类" : "此目录没有 PDF"}</div>`
        : ""}
    </div>`;

  const grid = document.getElementById("fileGrid");
  const scrollKey = `${state.watchFolderId}:${state.browseSub || ""}:${showImported ? 1 : 0}`;
  if (grid) {
    grid.dataset.scrollKey = scrollKey;
    grid.addEventListener("scroll", () => {
      state.browseScrollPositions[scrollKey] = grid.scrollTop;
    }, { passive: true });
  }

  requestAnimationFrame(() => {
    const liveGrid = document.getElementById("fileGrid");
    if (!liveGrid || liveGrid.dataset.scrollKey !== scrollKey) return;
    if (focusSelected) {
      const selectedRow = liveGrid.querySelector(".file-row.is-pdf.active");
      if (!selectedRow) return;
      const gridRect = liveGrid.getBoundingClientRect();
      const rowRect = selectedRow.getBoundingClientRect();
      const target = liveGrid.scrollTop + rowRect.top - gridRect.top - liveGrid.clientHeight * 0.3;
      const maxScroll = Math.max(0, liveGrid.scrollHeight - liveGrid.clientHeight);
      liveGrid.scrollTop = Math.max(0, Math.min(maxScroll, target));
    } else {
      liveGrid.scrollTop = forcedScrollTop ?? state.browseScrollPositions[scrollKey] ?? 0;
    }
  });

  const tipEl = document.getElementById("paperHoverTip");
  const up = document.getElementById("upDir");
  if (up) {
    up.onclick = () => {
      const parts = (state.browseSub || "").split("/").filter(Boolean);
      parts.pop();
      state.browseSub = parts.join("/");
      browseWatch();
    };
  }
  const tog = document.getElementById("toggleImported");
  if (tog) {
    tog.onclick = () => {
      state.showImportedFiles = !state.showImportedFiles;
      browseWatch();
    };
  }
  stage.querySelectorAll("[data-dir]").forEach((el) => {
    el.onclick = () => {
      state.browseSub = el.dataset.dir;
      browseWatch();
    };
  });

  let clickTimer = null;
  stage.querySelectorAll(".file-row.is-pdf").forEach((el) => {
    el.ondragstart = (e) => {
      if (e.target.closest?.("[data-file-action]")) {
        e.preventDefault();
        return;
      }
      state.selectedLocalPath = el.dataset.path;
      e.dataTransfer.setData("text/plain", el.dataset.path);
      e.dataTransfer.effectAllowed = "copy";
    };
    el.onmouseenter = () => {
      if (!tipEl) return;
      tipEl.innerHTML = `<div class="tip-title">${esc(el.dataset.tipTitle || "")}</div><div class="tip-line">${esc(el.dataset.tipLine || "")}</div>`;
      tipEl.classList.remove("hidden");
      const r = el.getBoundingClientRect();
      const tw = tipEl.offsetWidth || 280;
      let left = Math.min(r.right + 10, window.innerWidth - tw - 12);
      if (left < 12) left = 12;
      tipEl.style.left = `${left}px`;
      tipEl.style.top = `${Math.max(8, r.top + (r.height - tipEl.offsetHeight) / 2)}px`;
    };
    el.onmouseleave = () => tipEl?.classList.add("hidden");
    el.onclick = (e) => {
      if (e.target.closest?.("[data-file-action]")) return;
      e.preventDefault();
      clearTimeout(clickTimer);
      clickTimer = setTimeout(() => {
        tipEl?.classList.add("hidden");
        state.selectedLocalPath = el.dataset.path;
        if (el.dataset.pid) state.selectedPaperId = Number(el.dataset.pid);
        browseWatch();
        if (state.papersMode === "library") renderCategoryBoard();
      }, 200);
    };
    el.ondblclick = async (e) => {
      if (e.target.closest?.("[data-file-action]")) return;
      e.preventDefault();
      clearTimeout(clickTimer);
      tipEl?.classList.add("hidden");
      try {
        state.selectedLocalPath = el.dataset.path;
        // 双击只是打开阅读；挂上任意类别后左侧才默认隐藏
        const paper = await ensurePaperFromPath(el.dataset.path);
        state.selectedPaperId = paper.id;
        await refreshPapersCache();
        await browseWatch({ focusSelected: true });
        await openPaper(paper.id);
      } catch (err) {
        toast(err.message || "打开失败");
      }
    };
    el.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        el.click();
      }
    };
  });
  stage.querySelectorAll("[data-reveal-pdf]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      tipEl?.classList.add("hidden");
      clearTimeout(clickTimer);
      try {
        await API.post(`/watch-folders/${state.watchFolderId}/reveal`, { path: btn.dataset.revealPdf });
        toast("已在本地文件夹中定位");
      } catch (error) {
        toast(error.message || "无法打开本地文件夹");
      }
    };
  });
  stage.querySelectorAll("[data-del-pdf]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.preventDefault();
      e.stopPropagation();
      tipEl?.classList.add("hidden");
      clearTimeout(clickTimer);
      const row = btn.closest(".file-row");
      await hideBrowsePdf(btn.dataset.delPdf, row?.dataset.name || "");
    };
  });
}

async function quickPaperMetaForm(paper) {
  await refreshProjects();
  await Promise.all([
    (async () => { state.allTags = await API.get("/tags").catch(() => state.allTags || []); })(),
    refreshTagDirections(),
  ]);
  const p = paper || {
    title: "", year: "", status: "todo", relevance: "related",
    folder: "默认", project_ids: [], tags: [], local_path: "",
    doi: "", paper_type: "conference", authors: "", venue: "", abstract: "", bibtex: "",
  };
  const pids = p.project_ids?.length ? p.project_ids : (p.project_id ? [p.project_id] : []);
  openModal(`
    <h3>${paper?.id ? "设置文献" : "新建文献"}</h3>
    <div class="field"><label>标题</label><input id="f_title" value="${esc(p.title || "")}" /></div>
    <div class="field-row">
      <div class="field"><label>来源</label><input id="f_source" value="${esc(p.venue || "")}" placeholder="例如 ICCV2026" /></div>
      <div class="field"><label>类型</label>
        <select id="f_type"><option>conference</option><option>journal</option><option>preprint</option><option>thesis</option><option>book</option><option>techreport</option></select>
      </div>
    </div>
    <div class="field-row">
      <div class="field"><label>阅读队列</label>
        <select id="f_status">
          <option value="todo">待读</option>
          <option value="reading">待精读</option>
          <option value="deep">已精读</option>
          <option value="dropped">弃读</option>
        </select>
      </div>
      <div class="field"><label>相关度</label>
        <select id="f_rel"><option>core</option><option>related</option><option>background</option><option>counter</option></select>
      </div>
    </div>
    <div class="field"><label>分类类别（可多选）</label>${tagPickerHtml(p.tags || [], (state.allTags || []).filter((tag) => !HIDDEN_PAPER_DIRECTIONS.has(tag.dimension || "")), "fTagPicker")}</div>
    <div class="field"><label>项目标签（可多选）</label>${projectTagPickerHtml(pids, "fProjTags")}</div>
    <div class="toolbar" style="justify-content:flex-end;margin-top:8px">
      <button class="btn secondary" data-close="1">取消</button>
      ${paper?.id ? `<button class="btn danger" id="delPaper">删除</button>` : ""}
      ${paper?.id ? `<button class="btn ghost" id="f_toNotes">笔记/批注</button>` : ""}
      <button class="btn" id="savePaper">保存</button>
    </div>`);
  document.getElementById("f_status").value = p.status === "read" ? "deep" : (p.status || "todo");
  document.getElementById("f_rel").value = p.relevance || "related";
  document.getElementById("f_type").value = p.paper_type || "conference";
  wireTagPicker("fTagPicker");
  wireProjectTagPicker("fProjTags");
  document.getElementById("savePaper").onclick = async () => {
    const tags = readTagPicker("fTagPicker").filter((tag) => !READING_QUEUE_TAGS.includes(tag));
    const project_ids = readProjectTagPicker("fProjTags");
    const body = {
      title: f_title.value || p.title || "Untitled",
      authors: p.authors || "",
      year: p.year ?? null,
      venue: f_source.value.trim(),
      doi: p.doi || "",
      paper_type: f_type.value || "conference",
      local_path: p.local_path || "",
      status: f_status.value,
      relevance: f_rel.value,
      folder: tags[0] || p.folder || "默认",
      abstract: p.abstract || "",
      bibtex: p.bibtex || "",
      project_id: project_ids[0] || null,
      project_ids,
      tags,
      reading_progress_page: p.reading_progress_page || 1,
      reading_seconds: p.reading_seconds || 0,
      reading_depth: p.reading_depth || "skim",
    };
    const updated = paper?.id
      ? await API.put(`/papers/${paper.id}`, body)
      : await API.post("/papers", body);
    closeModal();
    toast("已保存");
    await syncPaperAndRedraw(updated);
  };
  const toNotes = document.getElementById("f_toNotes");
  if (toNotes) {
    toNotes.onclick = () => {
      closeModal();
      openPaperNotesModal(paper.id);
    };
  }
  const del = document.getElementById("delPaper");
  if (del) {
    del.onclick = async () => {
      const ok = await deletePaperFromLibrary(paper.id, paper.title || "");
      if (ok) closeModal();
    };
  }
}

async function openPaperNotesModal(id) {
  const [paper, note, anns] = await Promise.all([
    API.post(`/papers/${id}/mark-opened`),
    API.get(`/papers/${id}/note`),
    API.get(`/papers/${id}/annotations`).catch(() => []),
  ]);
  await syncPaperReadingState(id, paper, { redraw: true });
  openModal(`
    <h3>笔记 / 批注 · ${esc(paper.title)}</h3>
    <p class="muted" style="margin:-4px 0 12px">${esc(paperHoverPlain(paper))}</p>
    <div class="notes-split">
      <div>
        <h4 style="margin:0 0 8px;font-size:0.92rem">批注</h4>
        <div class="ann-list" id="annList">
          ${(anns || []).map((a) => `
            <div class="ann-item">
              <div class="meta">p.${a.page} · ${esc(a.color || "")}</div>
              <div class="ann-text">${esc(a.selected_text || a.comment || "")}</div>
              ${a.comment && a.selected_text ? `<div class="meta">${esc(a.comment)}</div>` : ""}
              <button class="btn ghost small" data-del-ann="${a.id}">删除</button>
            </div>`).join("") || `<div class="empty">暂无批注</div>`}
        </div>
        <div class="field" style="margin-top:10px"><label>新增批注</label>
          <textarea id="ann_text" rows="2" placeholder="摘录或想法…"></textarea></div>
        <div class="field-row">
          <div class="field"><label>页码</label><input id="ann_page" type="number" min="1" value="1" /></div>
          <div class="field"><label>备注</label><input id="ann_comment" placeholder="可选" /></div>
        </div>
        <button class="btn small secondary" id="addAnn">添加批注</button>
      </div>
      <div>
        <h4 style="margin:0 0 8px;font-size:0.92rem">研究笔记</h4>
        ${noteEditorHtml(note, "noteMdModal")}
        <div class="toolbar" style="margin-top:10px;justify-content:flex-end">
          <button class="btn ghost" id="openReaderFromNotes">阅读 PDF</button>
          <button class="btn secondary" data-close="1">关闭</button>
          <button class="btn" id="saveNoteModal">保存笔记</button>
        </div>
      </div>
    </div>`, { wide: true });

  wireNoteEditor("noteMdModal");
  const saveModalNote = async () => {
    await API.put(`/papers/${id}/note`, collectNoteFromEditor("noteMdModal", note));
    await syncPaperReadingState(id, null, { redraw: true });
    toast("笔记已保存");
  };
  document.getElementById("noteMdModalSave").onclick = saveModalNote;
  document.getElementById("addAnn").onclick = async () => {
    const selected_text = ann_text.value.trim();
    if (!selected_text) return toast("请填写批注内容");
    await API.post(`/papers/${id}/annotations`, {
      page: Number(ann_page.value || 1),
      color: "yellow",
      selected_text,
      comment: ann_comment.value.trim(),
      rect_json: "[]",
      tags: "",
    });
    toast("批注已添加");
    openPaperNotesModal(id);
  };
  document.querySelectorAll("[data-del-ann]").forEach((btn) => {
    btn.onclick = async () => {
      await API.del(`/annotations/${btn.dataset.delAnn}`);
      openPaperNotesModal(id);
    };
  });
  document.getElementById("saveNoteModal").onclick = saveModalNote;
  document.getElementById("openReaderFromNotes").onclick = () => {
    closeModal();
    openPaper(id);
  };
}

function goToSkillGallery() {
  const panel = document.getElementById("skillBoardPanel");
  if (panel) {
    panel.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }
  state._scrollToGallery = true;
  navigate("projects", state.openProjectId ? { openProjectId: state.openProjectId } : {});
}

function wireColSplit({ rootId, splitId, leftId, storageKey, minLeft = 220, minRight = 280 }) {
  const root = document.getElementById(rootId);
  const split = document.getElementById(splitId);
  const left = document.getElementById(leftId);
  if (!root || !split || !left) return;

  const applyWidth = (px) => {
    const maxLeft = Math.max(minLeft, root.clientWidth - minRight - split.offsetWidth);
    const w = Math.max(minLeft, Math.min(maxLeft, px));
    left.style.width = `${w}px`;
    left.style.flex = `0 0 ${w}px`;
    try { localStorage.setItem(storageKey, String(Math.round(w))); } catch (_) {}
  };

  try {
    const saved = Number(localStorage.getItem(storageKey));
    if (saved >= minLeft) applyWidth(saved);
  } catch (_) {}

  split.onpointerdown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    split.classList.add("is-dragging");
    split.setPointerCapture?.(e.pointerId);
    const onMove = (ev) => {
      const rect = root.getBoundingClientRect();
      applyWidth(ev.clientX - rect.left - split.offsetWidth / 2);
    };
    const onUp = (ev) => {
      split.classList.remove("is-dragging");
      split.releasePointerCapture?.(ev.pointerId);
      split.removeEventListener("pointermove", onMove);
      split.removeEventListener("pointerup", onUp);
      split.removeEventListener("pointercancel", onUp);
    };
    split.addEventListener("pointermove", onMove);
    split.addEventListener("pointerup", onUp);
    split.addEventListener("pointercancel", onUp);
  };
}

function wireProjSplit() {
  wireColSplit({
    rootId: "projSplit",
    splitId: "projColSplit",
    leftId: "projListPanel",
    storageKey: "wb_proj_list_width",
    minLeft: 220,
    minRight: 280,
  });
}

function wireReaderSplit() {
  const body = document.getElementById("readerSplitBody");
  const split = document.getElementById("readerSplit");
  const note = document.getElementById("paperNote");
  if (!body || !split || !note) return;

  const applyWidth = (px) => {
    const minNote = 240;
    const minPdf = 280;
    const maxNote = Math.max(minNote, body.clientWidth - minPdf - split.offsetWidth);
    const w = Math.max(minNote, Math.min(maxNote, px));
    note.style.width = `${w}px`;
    body.style.setProperty("--reader-note-width", `${w}px`);
    try { localStorage.setItem("wb_reader_note_width", String(Math.round(w))); } catch (_) {}
  };

  try {
    const saved = Number(localStorage.getItem("wb_reader_note_width"));
    if (saved >= 240) applyWidth(saved);
  } catch (_) {}

  split.onpointerdown = (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    split.classList.add("is-dragging");
    split.setPointerCapture?.(e.pointerId);
    const onMove = (ev) => {
      const rect = body.getBoundingClientRect();
      // 拖的是分隔条：笔记宽度 = 容器右缘 - 指针位置
      applyWidth(rect.right - ev.clientX - split.offsetWidth / 2);
    };
    const onUp = (ev) => {
      split.classList.remove("is-dragging");
      split.releasePointerCapture?.(ev.pointerId);
      split.removeEventListener("pointermove", onMove);
      split.removeEventListener("pointerup", onUp);
      split.removeEventListener("pointercancel", onUp);
    };
    split.addEventListener("pointermove", onMove);
    split.addEventListener("pointerup", onUp);
    split.addEventListener("pointercancel", onUp);
  };
}

async function openPaper(id, opts = {}) {
  if (!opts.fromBoard && state.papersMode !== "workspace") {
    state.paperBoardReturnPosition = null;
  }
  state.selectedPaperId = id;
  state.papersMode = "workspace";
  if (state.route !== "papers") {
    await navigate("papers");
  }
  const host = document.getElementById("papersRight") || document.getElementById("view");
  if (!host) return;
  const backBtn = document.getElementById("btnBackLibrary");
  if (backBtn) backBtn.style.display = "";
  const paper = await API.post(`/papers/${id}/mark-opened`);
  updatePaperCache(paper);
  const note = await API.get(`/papers/${id}/note`);
  host.innerHTML = `
    <div class="paper-reader-shell">
      <div class="toolbar paper-reader-bar">
        <button class="btn ghost small" id="backToFiles">← 分类看板</button>
        <strong class="paper-reader-title">${esc(paper.title)}</strong>
        <button type="button" class="btn ghost small reader-star-btn ${paper.starred ? "is-starred" : ""}" id="readerPaperStar" aria-label="${paper.starred ? "取消重要标记" : "标记为重要文献"}" aria-pressed="${paper.starred ? "true" : "false"}" title="${paper.starred ? "取消重要标记" : "标记为重要文献"}"></button>
        <div class="depth-pills">
          <button class="btn small secondary ${paper.reading_depth==="skim"?"active":""}" data-depth="skim">略读</button>
          <button class="btn small secondary ${paper.reading_depth==="intensive"?"active":""}" data-depth="intensive">精读</button>
          <button class="btn small secondary ${paper.reading_depth==="critical"?"active":""}" data-depth="critical">批判</button>
        </div>
        <button class="btn secondary small" id="editPaper">设置</button>
        <button class="btn ghost small" id="focusThisPaper" title="绑定本文献开始专注">专注</button>
        <button class="btn ghost small" id="openOs">系统打开</button>
      </div>
      <div class="paper-reader-body" id="readerSplitBody">
        <div class="panel" id="paperMain"><div id="readerMount"></div></div>
        <div class="reader-split" id="readerSplit" title="拖动调整 PDF / 笔记宽度" role="separator" aria-orientation="vertical"></div>
        <div class="panel" id="paperNote">
          <div class="toolbar" style="margin-bottom:8px">
            <button class="btn small" id="tabNote">笔记</button>
            <button class="btn small secondary" id="tabAI">AI 精读</button>
          </div>
          <div id="notePane" class="note-pane">
            ${noteEditorHtml(note, "noteMd")}
          </div>
          <div id="aiPane" class="ai-panel note-pane hidden">
            <div class="meta" style="flex-shrink:0">需配置 SK。默认深度可在设置改；下方可临时切换。</div>
            ${readModePickerHtml(getLlmReadMode(), "reader_read_mode")}
            <div class="ai-actions" style="flex-shrink:0">
              <button class="btn small" id="aiDigest" title="按所选深度生成研究笔记">通读成笔记</button>
              <button class="btn small secondary" data-aimode="summary">一页摘要</button>
              <button class="btn small secondary" data-aimode="critique">批判审稿</button>
              <button class="btn small secondary" data-aimode="relate">关联课题</button>
              <button class="btn small secondary" data-aimode="notes">补全笔记</button>
            </div>
            <div class="field" style="flex-shrink:0"><textarea id="aiExtra" rows="2" placeholder="补充问题（可选）"></textarea></div>
            <div class="ai-chat" id="aiChat"><div class="empty">「通读成笔记」写入笔记；其余能力在此预览</div></div>
            <button class="btn secondary small" id="aiToQuotable" style="flex-shrink:0;margin-top:8px">把结果追加到笔记</button>
          </div>
        </div>
      </div>
    </div>`;
  const noteEl = document.getElementById("paperNote");
  const notePaneEl = document.getElementById("notePane");
  const aiPaneEl = document.getElementById("aiPane");
  const tabNoteEl = document.getElementById("tabNote");
  const tabAIEl = document.getElementById("tabAI");
  wireReaderSplit();
  wireNoteEditor("noteMd");
  wireReadModePicker("reader_read_mode");
  const showNote = () => {
    notePaneEl.classList.remove("hidden");
    aiPaneEl.classList.add("hidden");
    tabNoteEl.className = "btn small";
    tabAIEl.className = "btn small secondary";
  };
  const showAI = () => {
    aiPaneEl.classList.remove("hidden");
    notePaneEl.classList.add("hidden");
    tabAIEl.className = "btn small";
    tabNoteEl.className = "btn small secondary";
  };
  tabNoteEl.onclick = showNote;
  tabAIEl.onclick = showAI;
  document.getElementById("readerPaperStar").onclick = async (event) => {
    const btn = event.currentTarget;
    const nextStarred = btn.getAttribute("aria-pressed") !== "true";
    btn.disabled = true;
    try {
      const updated = await API.post(`/papers/${id}/star?starred=${nextStarred}`);
      updatePaperCache(updated);
      btn.classList.toggle("is-starred", !!updated.starred);
      btn.setAttribute("aria-pressed", updated.starred ? "true" : "false");
      btn.setAttribute("aria-label", updated.starred ? "取消重要标记" : "标记为重要文献");
      btn.title = updated.starred ? "取消重要标记" : "标记为重要文献";
      toast(updated.starred ? "已标记为重要文献" : "已取消重要标记");
    } catch (error) {
      toast(error.message || "星标更新失败");
    } finally {
      btn.disabled = false;
    }
  };
  document.getElementById("backToFiles").onclick = async () => {
    const grid = document.getElementById("fileGrid");
    const returnScrollTop = grid?.scrollTop ?? 0;
    if (grid?.dataset.scrollKey) {
      state.browseScrollPositions[grid.dataset.scrollKey] = returnScrollTop;
    }
    state.papersMode = "library";
    if (backBtn) backBtn.style.display = "none";
    await renderCategoryBoard();
    await restorePaperBoardPosition();
    await browseWatch({ restoreScrollTop: returnScrollTop });
  };
  document.getElementById("editPaper").onclick = () => quickPaperMetaForm(paper);
  document.getElementById("focusThisPaper")?.addEventListener("click", () => {
    prepareFocusStartModal({
      link_type: "paper",
      link_id: id,
      paperTitle: paper.title || "",
      title: `精读：${(paper.title || "").slice(0, 40)}`,
    });
  });
  document.getElementById("openOs").onclick = async () => {
    await API.post(`/papers/${id}/open-os`);
    toast("已请求系统打开");
  };
  host.querySelectorAll("[data-depth]").forEach((btn) => {
    btn.onclick = async () => {
      await API.post(`/papers/${id}/mark-depth?depth=${btn.dataset.depth}`);
      toast("已标记阅读深度");
      openPaper(id);
    };
  });
  document.getElementById("noteMdSave").onclick = async () => {
    await API.put(`/papers/${id}/note`, collectNoteFromEditor("noteMd", note));
    await syncPaperReadingState(id);
    Object.assign(note, collectNoteFromEditor("noteMd", note));
    toast("笔记已保存");
  };
  let lastAI = "";
  const paintAiResult = (text, meta = "") => {
    lastAI = text || "";
    const chat = document.getElementById("aiChat");
    if (!chat) return;
    chat.innerHTML = `
      ${mdEditorHtml(lastAI, "aiResult", { modal: true, showSave: false })}
      ${meta ? `<div class="meta" style="margin-top:8px">${meta}</div>` : ""}`;
    wireNoteEditor("aiResult");
  };
  const readAiResult = () => document.getElementById("aiResultSource")?.value || lastAI || "";
  document.getElementById("aiDigest").onclick = () => {
    openAiDigestModal(id, {
      extra: document.getElementById("aiExtra").value || "",
      readMode: document.getElementById("reader_read_mode")?.value || getLlmReadMode(),
      onComplete: async (r) => {
      const pages = r.pdf ? `${r.pdf.pages_read}/${r.pdf.page_count} 页` : "";
      paintAiResult(
        r.content || "",
        `model: ${esc(r.model || "")}${pages ? " · " + pages : ""}${r.written ? " · 已写入笔记" : ""}`,
      );
      if (r.written) {
        await syncPaperReadingState(id);
        const n = await API.get(`/papers/${id}/note`);
        const src = document.getElementById("noteMdSource");
        if (src) {
          src.value = noteToMarkdown(n);
          refreshNotePreview("noteMd");
        }
        showNote();
      }
      },
    });
  };
  noteEl.querySelectorAll("[data-aimode]").forEach((btn) => {
    btn.onclick = async () => {
      if (!ensureLlmEnabled()) return;
      const chat = document.getElementById("aiChat");
      const mode = btn.dataset.aimode;
      const labels = { summary: "一页摘要", critique: "批判审稿", relate: "关联课题", notes: "补全笔记" };
      const job = beginAiJob({ title: `${labels[mode] || "AI"} · ${(paper.title || "").slice(0, 18)}`, kind: "analyze" });
      chat.innerHTML = `<div class="empty">分析中…可看右下角进度</div>`;
      try {
        const r = await API.post(`/ai/papers/${id}/analyze`, {
          mode,
          extra: document.getElementById("aiExtra").value || "",
        });
        paintAiResult(r.content || "", `model: ${esc(r.model || "")}`);
        finishAiJob(job.id, {
          ok: true,
          onOpen: () => {
            dismissAiJob(job.id);
            showAI();
            paintAiResult(r.content || "", `model: ${esc(r.model || "")}`);
          },
        });
      } catch (e) {
        const msg = e.message || "失败，请检查设置中的 SK / Base URL";
        chat.innerHTML = `<div class="empty">${esc(msg)}</div>`;
        finishAiJob(job.id, { ok: false, error: msg });
      }
    };
  });
  document.getElementById("aiToQuotable").onclick = () => {
    const text = readAiResult();
    if (!text.trim()) return toast("还没有 AI 结果");
    appendToNoteEditor("noteMd", `\n\n## AI 摘录\n\n${text}\n`);
    showNote();
    toast("已追加到笔记，记得保存");
  };
  if (paper.local_path && paper.file_exists !== false) {
    try {
      await Reader.open(id, document.getElementById("readerMount"), async () => {
        const n = await API.get(`/papers/${id}/note`);
        const src = document.getElementById("noteMdSource");
        if (src) src.value = noteToMarkdown(n);
        refreshNotePreview("noteMd");
      });
      if (paper.reading_progress_page > 1) await Reader.go(paper.reading_progress_page);
    } catch (e) {
      document.getElementById("readerMount").innerHTML = `<div class="empty">无法打开 PDF：${esc(e.message)}</div>`;
    }
  } else {
    document.getElementById("readerMount").innerHTML = `
      <div class="empty path-missing-box">
        <p>${paper.local_path ? "本地文件不存在或路径已失效" : "尚未设置本地 PDF 路径"}</p>
        ${paper.local_path ? `<p class="meta" style="word-break:break-all">${esc(paper.local_path)}</p>` : ""}
        <button type="button" class="btn" id="relocateFromReader">重新指定路径</button>
      </div>`;
    document.getElementById("relocateFromReader")?.addEventListener("click", () => relocatePaperPath(paper, { reopen: true }));
  }
}

async function relocatePaperPath(paper, opts = {}) {
  if (!paper?.id) return;
  const next = prompt("新的 PDF 完整路径（支持 WSL 的 /mnt/d/...）", paper.local_path || "");
  if (next == null) return;
  const path = String(next).trim();
  if (!path) return toast("路径不能为空");
  try {
    const updated = await API.post(`/papers/${paper.id}/relocate`, { local_path: path });
    toast("路径已更新");
    await refreshPapersCache();
    if (opts.reopen || state.papersMode === "workspace") openPaper(paper.id);
    else if (state.route === "papers") renderCategoryBoard();
    return updated;
  } catch (e) {
    toast(e.message || "更新失败");
  }
}

async function openPathHealthModal() {
  try {
    const data = await API.get("/papers/path-health");
    const missing = data.missing || [];
    openModal(`
      <h3>PDF 路径体检</h3>
      <p class="muted" style="margin:0 0 10px">有路径文献 ${data.total_with_path || 0} 篇 · 失效 ${data.missing_count || 0} 篇</p>
      <div class="list" style="max-height:50vh;overflow:auto">
        ${missing.map((m) => `
          <div class="list-item">
            <div style="flex:1;min-width:0">
              <div class="title">${esc(m.title || "未命名")}</div>
              <div class="meta" style="word-break:break-all">${esc(m.local_path || "")}</div>
            </div>
            <button type="button" class="btn small" data-fix-path="${m.id}">重指</button>
          </div>`).join("") || `<div class="empty">全部路径有效</div>`}
      </div>
      <div class="toolbar" style="justify-content:flex-end;margin-top:10px">
        <button class="btn secondary" data-close="1">关闭</button>
      </div>`);
    document.querySelectorAll("[data-fix-path]").forEach((btn) => {
      btn.onclick = async () => {
        const paper = (state.papers || []).find((p) => String(p.id) === btn.dataset.fixPath)
          || { id: Number(btn.dataset.fixPath), local_path: missing.find((m) => String(m.id) === btn.dataset.fixPath)?.local_path || "" };
        await relocatePaperPath(paper);
        closeModal();
        openPathHealthModal();
      };
    });
  } catch (e) {
    toast(e.message || "体检失败");
  }
}

const NOTE_SECTION_FIELDS = [
  ["motivation", "研究动机"],
  ["problem", "问题定义"],
  ["method", "方法"],
  ["datasets", "数据集"],
  ["metrics", "指标"],
  ["results", "结果"],
  ["limitations", "局限"],
  ["relation_to_my_work", "与我课题关系"],
  ["quotable", "可引用要点"],
  ["next_actions", "后续动作"],
];

function noteToMarkdown(n) {
  const raw = (n?.raw_markdown || "").trim();
  if (raw) return n.raw_markdown;
  const parts = [];
  NOTE_SECTION_FIELDS.forEach(([k, label]) => {
    const v = (n?.[k] || "").trim();
    if (v) parts.push(`## ${label}\n\n${v}`);
  });
  return parts.join("\n\n") || "# 研究笔记\n\n";
}

function renderMathMarkup(source) {
  const value = String(source || "");
  let latex = value;
  let displayMode = false;
  if (value.startsWith("$$") && value.endsWith("$$")) {
    latex = value.slice(2, -2);
    displayMode = true;
  } else if (value.startsWith("\\[") && value.endsWith("\\]")) {
    latex = value.slice(2, -2);
    displayMode = true;
  } else if (value.startsWith("\\(") && value.endsWith("\\)")) {
    latex = value.slice(2, -2);
  } else if (value.startsWith("$") && value.endsWith("$")) {
    latex = value.slice(1, -1);
  }
  // AI 输出的 cases/aligned 等多行公式常把 LaTeX 换行 `\\` 写成行末单个 `\`。
  // 单个行末反斜杠本身不是有效命令，预览时宽容修正，保存的 Markdown 源码保持原样。
  latex = latex.replace(/(^|[^\\])\\(?=\r?\n)/gm, (_, prefix) => `${prefix}\\\\`);
  // LaTeX 中 `%` 会注释掉该行余下内容；笔记和 AI 输出通常表达百分比，自动补转义。
  latex = latex.replace(/(^|[^\\])%/g, (_, prefix) => `${prefix}\\%`);
  if (typeof window.katex?.renderToString !== "function") return esc(value);
  try {
    return window.katex.renderToString(latex.trim(), {
      displayMode,
      throwOnError: false,
      strict: false,
      output: "htmlAndMathml",
    });
  } catch (_) {
    return esc(value);
  }
}

function renderMarkdown(src) {
  const text = String(src || "");
  try {
    if (window.marked?.parse) {
      window.marked.setOptions({ breaks: true, gfm: true });
      const normalizedText = text.replace(
        /(^|\n)[ \t]*\[[ \t]*\n([\s\S]*?)\n[ \t]*\][ \t]*(?=\n|$)/g,
        (whole, prefix, body) => {
          const formula = String(body || "").trim();
          const looksLikeLatex = /\\[A-Za-z]+|[_^]\s*(?:\{|[A-Za-z0-9])/.test(formula);
          return looksLikeLatex ? `${prefix}\\[\n${formula}\n\\]` : whole;
        },
      );
      const math = [];
      const protectedText = normalizedText.replace(
        /\$\$[\s\S]+?\$\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\)|\$(?!\s)(?:\\.|[^$\n])*?\S\$/g,
        (value) => {
          const token = `WBMARKDOWNMATH${math.length}TOKEN`;
          math.push(value);
          return token;
        },
      );
      const html = window.marked.parse(protectedText);
      return html.replace(/WBMARKDOWNMATH(\d+)TOKEN/g, (_, index) => renderMathMarkup(math[Number(index)] || ""));
    }
  } catch (_) {}
  return `<pre class="md-fallback">${esc(text)}</pre>`;
}

function hydrateMarkdown(root) {
  if (!root) return;
  root.querySelectorAll("table").forEach((table) => {
    if (table.parentElement?.classList.contains("md-table-wrap")) return;
    const wrap = document.createElement("div");
    wrap.className = "md-table-wrap";
    table.parentNode?.insertBefore(wrap, table);
    wrap.appendChild(table);
  });
  if (typeof window.renderMathInElement !== "function") return;
  try {
    window.renderMathInElement(root, {
      delimiters: [
        { left: "$$", right: "$$", display: true },
        { left: "\\[", right: "\\]", display: true },
        { left: "\\(", right: "\\)", display: false },
        { left: "$", right: "$", display: false },
      ],
      throwOnError: false,
      strict: false,
      ignoredTags: ["script", "noscript", "style", "textarea", "pre", "code", "option"],
      ignoredClasses: ["katex"],
    });
  } catch (_) {}
}

function mdEditorHtml(text = "", prefix = "noteMd", opts = {}) {
  const showSave = opts.showSave !== false;
  const pageClass = opts.page ? " is-page" : "";
  const modalClass = opts.modal ? " is-modal" : "";
  return `
    <div class="md-note${modalClass}${pageClass}" id="${prefix}Root" data-mode="edit">
      <div class="md-note-toolbar">
        <div class="seg" id="${prefix}Mode">
          <button type="button" class="active" data-md-mode="edit">源码</button>
          <button type="button" data-md-mode="preview">预览</button>
        </div>
        ${showSave ? `<button type="button" class="btn small" id="${prefix}Save" title="Ctrl+S / Cmd+S">保存</button>` : `<span class="meta" style="margin:0">Markdown</span>`}
      </div>
      <textarea id="${prefix}Source" class="md-note-source" spellcheck="false" placeholder="# 标题&#10;&#10;写 Markdown…">${esc(text)}</textarea>
      <div id="${prefix}Preview" class="md-note-preview md-body hidden"></div>
    </div>`;
}

function noteEditorHtml(n, prefix = "noteMd") {
  return mdEditorHtml(noteToMarkdown(n), prefix, { showSave: true });
}

function refreshNotePreview(prefix) {
  const src = document.getElementById(`${prefix}Source`);
  const preview = document.getElementById(`${prefix}Preview`);
  if (!src || !preview) return;
  preview.innerHTML = renderMarkdown(src.value) || `<div class="empty">暂无内容</div>`;
  hydrateMarkdown(preview);
}

function wireNoteEditor(prefix) {
  const root = document.getElementById(`${prefix}Root`);
  const modeSeg = document.getElementById(`${prefix}Mode`);
  const src = document.getElementById(`${prefix}Source`);
  const preview = document.getElementById(`${prefix}Preview`);
  if (!root || !modeSeg || !src || !preview) return;
  const setMode = (mode) => {
    root.dataset.mode = mode;
    modeSeg.querySelectorAll("button").forEach((b) => b.classList.toggle("active", b.dataset.mdMode === mode));
    const isEdit = mode === "edit";
    src.classList.toggle("hidden", !isEdit);
    preview.classList.toggle("hidden", isEdit);
    if (!isEdit) refreshNotePreview(prefix);
  };
  modeSeg.querySelectorAll("button").forEach((btn) => {
    btn.onclick = () => setMode(btn.dataset.mdMode || "edit");
  });
  setMode("edit");
}

function appendToNoteEditor(prefix, chunk) {
  const src = document.getElementById(`${prefix}Source`);
  if (!src) return;
  src.value = `${(src.value || "").replace(/\s+$/, "")}${chunk}`;
  refreshNotePreview(prefix);
}

function collectNoteFromEditor(prefix, base = {}) {
  const src = document.getElementById(`${prefix}Source`);
  const raw = src ? src.value : (base.raw_markdown || "");
  return {
    motivation: base.motivation || "",
    problem: base.problem || "",
    method: base.method || "",
    datasets: base.datasets || "",
    metrics: base.metrics || "",
    results: base.results || "",
    limitations: base.limitations || "",
    relation_to_my_work: base.relation_to_my_work || "",
    quotable: base.quotable || "",
    next_actions: base.next_actions || "",
    raw_markdown: raw,
  };
}

async function paperForm(paper) {
  return quickPaperMetaForm(paper || null);
}

async function openSession(id) {
  const data = await API.get(`/reading-sessions/${id}`);
  openModal(`
    <h3>${esc(data.session.title)}</h3>
    <div class="meta">主题标签：${esc(data.session.theme_tags || "—")}</div>
    <div class="list" style="margin:12px 0">
      ${data.papers.map((p)=>`<div class="list-item"><div class="title">${esc(p.title)}</div>
        <button class="btn ghost small" data-gop="${p.id}">打开</button></div>`).join("")}
    </div>
    <h4>聚合批注</h4>
    <div class="list" style="max-height:240px;overflow:auto">
      ${data.annotations.map((a)=>`<div class="list-item"><div>
        <div class="meta">#${a.paper_id} p.${a.page} ${esc(a.tags)}</div>
        <div>${esc(a.selected_text || a.comment)}</div>
      </div></div>`).join("") || `<div class="empty">暂无匹配批注</div>`}
    </div>
    <div class="field"><label>主题备忘</label><textarea id="sessSummary" rows="4">${esc(data.session.summary||"")}</textarea></div>
    <button class="btn" id="saveSess">保存备忘</button>
  `);
  document.querySelectorAll("[data-gop]").forEach((btn) => {
    btn.onclick = () => { closeModal(); openPaper(Number(btn.dataset.gop)); };
  });
  document.getElementById("saveSess").onclick = async () => {
    await API.put(`/reading-sessions/${id}?summary=${encodeURIComponent(sessSummary.value)}&status=done`);
    toast("已保存");
    closeModal();
  };
}

/* ---------------- Projects ---------------- */
function projectTypeLabel(t) {
  const map = { research: "研究发文", engineering: "工程学习", grant: "基金申请", collab: "合作", ongoing: "长期" };
  return map[t] || t || "研究发文";
}

function projectStatusLabel(status, engineering = false) {
  const rows = engineering ? ENGINEERING_PROJECT_STATUSES : ACADEMIC_PROJECT_STATUSES;
  return rows.find(([value]) => value === status)?.[1] || status || (engineering ? "学习中" : "进行中");
}

function isEngineeringProject(project) {
  return (project?.project_type || "") === "engineering";
}

function repoDisplay(value) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    const bits = url.pathname.replace(/^\/+|\/+$/g, "").split("/").filter(Boolean);
    return bits.length >= 2 ? `${bits[0]}/${bits[1]}` : url.hostname;
  } catch (_) {
    const bits = raw.replace(/\\/g, "/").replace(/\/$/, "").split("/").filter(Boolean);
    return bits.slice(-2).join("/") || raw;
  }
}

function engineeringRecordTypeLabel(type) {
  const labels = {
    learning: "学习进展",
    architecture: "架构拆解",
    setup: "环境搭建",
    technique: "关键技术",
    issue: "问题与踩坑",
    decision: "工程决策",
    takeaway: "可复用结论",
  };
  return labels[type] || "学习进展";
}

function engineeringRefHtml(value, label) {
  const raw = String(value || "").trim();
  if (!raw) return "";
  if (/^https?:\/\//i.test(raw)) {
    return `<a href="${esc(raw)}" target="_blank" rel="noopener">${esc(label || raw)}</a>`;
  }
  return `<span class="engineering-ref"><span>${esc(label || "位置")}</span><code>${esc(raw)}</code></span>`;
}

function listVisibleExperiments(experiments) {
  const showHidden = !!state.showHiddenProjects;
  const hiddenIds = new Set((state.projects || []).filter(projectIsHidden).map((p) => p.id));
  if (showHidden) return experiments || [];
  return (experiments || []).filter((e) => !e.project_id || !hiddenIds.has(e.project_id));
}

function recentExperimentsRowsHtml(experiments) {
  const visibleExps = listVisibleExperiments(experiments);
  return visibleExps.slice(0, 12).map((e) => `<tr class="clickable-row" data-open-exp="${e.id}" title="点击编辑">
        <td>${esc(e.title)}</td><td>${esc(e.status)}</td>
        <td class="meta">${e.style_preview ? `<img class="run-style-mini" src="${esc(e.style_preview)}" alt="" loading="lazy" decoding="async" /> ${esc(e.style_short_name || "")}` : "—"}</td>
        <td><code>${esc(e.metrics_json)}</code></td>
        <td><button type="button" class="btn ghost small" data-edexp="${e.id}">编辑</button></td></tr>`).join("")
    || `<tr><td colspan="5">暂无实验</td></tr>`;
}

function wireRecentExperimentsRows(root) {
  if (!root) return;
  root.querySelectorAll("[data-open-exp]").forEach((tr) => {
    tr.onclick = (ev) => {
      if (ev.target.closest("button, a, input")) return;
      const exp = (state._allExperiments || []).find((x) => String(x.id) === tr.dataset.openExp);
      if (exp) experimentForm(exp);
    };
  });
  root.querySelectorAll("[data-edexp]").forEach((btn) => {
    btn.onclick = (ev) => {
      ev.stopPropagation();
      const exp = (state._allExperiments || []).find((x) => String(x.id) === btn.dataset.edexp);
      if (exp) experimentForm(exp);
    };
  });
}

async function refreshRecentExperimentsPanel() {
  if (state.route !== "projects") return;
  try {
    const experiments = await API.get("/experiments");
    state._allExperiments = experiments;
    const tbody = document.querySelector("#recentExpTable tbody");
    if (!tbody) return;
    tbody.innerHTML = recentExperimentsRowsHtml(experiments);
    wireRecentExperimentsRows(tbody);
  } catch (_) { /* ignore */ }
}

async function renderProjects(view) {
  await refreshProjects();
  setTopActions(`<button class="btn" id="newProject">新建项目</button>`);

  const applySkillPack = (skillPack) => {
    const skillFigs = skillPack?.figures || [];
    const boards = skillPack?.boards?.length
      ? skillPack.boards
      : [
          { id: "formal_demo", name: "正式 demo", blurb: "", figures: skillFigs.filter((f) => f.board === "formal_demo" || f.has_code) },
          { id: "chart_family", name: "图族 / 图例", blurb: "", figures: skillFigs.filter((f) => f.board === "chart_family" || !f.has_code) },
        ];
    state._skillFigures = skillFigs;
    state._skillBoards = boards;
    state._skillBoardId = state._skillBoardId === "figures4papers" || state._skillBoardId === "nature-figure"
      ? "formal_demo"
      : (state._skillBoardId || boards[0]?.id || "formal_demo");
    return boards;
  };

  const cachedBoards = (state._skillBoards || []).length
    ? applySkillPack({ figures: state._skillFigures || [], boards: state._skillBoards })
    : null;

  // 先画项目 / Run，图库不阻塞首屏；有缓存则立刻画图库
    const paintShell = (experiments, boards, galleryPending) => {
    const showHidden = !!state.showHiddenProjects;
    const visibleProjects = listVisibleProjects({ includeHidden: showHidden });
    const hiddenCount = (state.projects || []).filter(projectIsHidden).length;
    const b = boards || [
      { id: "formal_demo", name: "正式 demo", blurb: "", figures: [] },
      { id: "chart_family", name: "图族 / 图例", blurb: "", figures: [] },
    ];
    view.innerHTML = `
    <div class="proj-split" id="projSplit">
      <div class="panel proj-split-list" id="projListPanel">
        <div class="toolbar" style="margin:0 0 8px;gap:8px;align-items:center">
          <h2 style="margin:0;flex:1">项目 <span class="meta">${visibleProjects.length}${hiddenCount && !showHidden ? ` · 隐藏 ${hiddenCount}` : ""}</span></h2>
          ${hiddenCount ? `<button type="button" class="btn ghost small" id="toggleShowHiddenExps">${showHidden ? "收起隐藏" : "显示隐藏"}</button>` : ""}
        </div>
        <p class="muted" style="margin:0 0 10px;font-size:0.78rem">学术项目在这里管理实验 Run；工程项目也可按需挂验证实验。研究页隐藏的项目不会出现在此。</p>
        <div class="list" id="projList">
          ${visibleProjects.map((p)=>`<div class="list-item ${projectIsHidden(p) ? "is-proj-hidden" : ""}" data-pr="${p.id}">
            <div><div class="title">${esc(p.title)}</div>
            <div class="meta">${esc(projectTypeLabel(p.project_type))} · ${esc(p.stage || p.status)} · ${p.progress||0}%</div>
            <div class="meta">${esc(p.research_question || (isEngineeringProject(p) ? "未填写学习目标" : "未填写研究问题"))}</div></div>
          </div>`).join("") || `<div class="empty">${hiddenCount ? "可见项目为空 · 点「显示隐藏」可查看" : "还没有项目"}</div>`}
        </div>
      </div>
      <div class="col-split" id="projColSplit" title="拖动调整列表 / 详情宽度" role="separator" aria-orientation="vertical"></div>
      <div class="panel proj-split-detail" id="projDetail"><div class="empty">选择项目查看详情</div></div>
    </div>
    <div class="panel">
      <h2>最近实验 Run</h2>
      <p class="muted" style="margin:0 0 8px;font-size:0.78rem">点击行或「编辑」可修改；删除后此处会同步更新。</p>
      <table class="table" id="recentExpTable"><thead><tr><th>标题</th><th>状态</th><th>参考图</th><th>指标</th><th></th></tr></thead>
      <tbody>${recentExperimentsRowsHtml(experiments)}</tbody></table>
    </div>
    <div class="panel skill-board-panel" id="skillBoardPanel">
      <div class="toolbar" style="margin:0 0 8px;align-items:flex-end;gap:10px;flex-wrap:wrap">
        <div style="flex:1;min-width:200px">
          <h2 style="margin:0">图库</h2>
          <p class="muted" style="margin:4px 0 0;font-size:0.78rem">
            底部图板 · 按「正式 demo / 图族」切换 ·「说明/代码」可复制或启动 nature-figure 画图流程。
          </p>
        </div>
        <button type="button" class="btn small" id="startFigureFlow">启动画图流程</button>
        <div class="skill-board-tabs" id="skillBoardTabs" role="tablist">
          ${b.map((board) => `
            <button type="button" class="skill-board-tab ${state._skillBoardId === board.id ? "active" : ""}" data-skill-board="${esc(board.id)}" role="tab">
              ${esc(board.name)} <span class="badge">${galleryPending ? "…" : (board.figures || []).length}</span>
            </button>`).join("")}
        </div>
      </div>
      <p class="meta" id="skillBoardBlurb" style="margin:0 0 10px"></p>
      <div class="skill-fig-gallery ${galleryPending ? "is-loading" : ""}" id="skillFigGallery">
        ${galleryPending ? `<div class="empty" style="padding:24px 0;grid-column:1/-1">图库加载中…</div>` : ""}
      </div>
    </div>`;
    document.getElementById("newProject").onclick = () => projectForm();
    document.getElementById("toggleShowHiddenExps")?.addEventListener("click", () => {
      state.showHiddenProjects = !state.showHiddenProjects;
      renderProjects(view);
    });
    document.getElementById("startFigureFlow")?.addEventListener("click", () => startNatureFigureWorkflow());
    view.querySelectorAll("[data-pr]").forEach((el) => {
      el.onclick = () => {
        state.openProjectId = Number(el.dataset.pr);
        view.querySelectorAll("[data-pr]").forEach((x) => x.classList.toggle("active", Number(x.dataset.pr) === state.openProjectId));
        showProject(state.openProjectId);
      };
    });
    wireRecentExperimentsRows(view.querySelector("#recentExpTable"));
    wireProjSplit();
    if (!galleryPending) wireSkillBoardGallery(view, experiments);
    if (state._scrollToGallery) {
      state._scrollToGallery = false;
      requestAnimationFrame(() => {
        document.getElementById("skillBoardPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  };

  const experimentsP = API.get("/experiments");
  const skillP = API.get("/skill-figures").catch(() => ({ figures: [], boards: [] }));

  // 有缓存：先用缓存画满页；无缓存：先画壳，再填图库
  if (cachedBoards) {
    const experiments = await experimentsP;
    state._allExperiments = experiments;
    paintShell(experiments, cachedBoards, false);
    skillP.then((pack) => {
      if (state.route !== "projects") return;
      applySkillPack(pack);
      const host = view.querySelector("#skillBoardPanel");
      if (!host) return;
      const tabs = view.querySelector("#skillBoardTabs");
      if (tabs) {
        tabs.innerHTML = (state._skillBoards || []).map((board) => `
          <button type="button" class="skill-board-tab ${state._skillBoardId === board.id ? "active" : ""}" data-skill-board="${esc(board.id)}" role="tab">
            ${esc(board.name)} <span class="badge">${(board.figures || []).length}</span>
          </button>`).join("");
      }
      wireSkillBoardGallery(view, experiments);
    });
  } else {
    const experiments = await experimentsP;
    state._allExperiments = experiments;
    paintShell(experiments, null, true);
    const pack = await skillP;
    if (state.route !== "projects") return;
    const boards = applySkillPack(pack);
    const tabs = view.querySelector("#skillBoardTabs");
    if (tabs) {
      tabs.innerHTML = boards.map((board) => `
        <button type="button" class="skill-board-tab ${state._skillBoardId === board.id ? "active" : ""}" data-skill-board="${esc(board.id)}" role="tab">
          ${esc(board.name)} <span class="badge">${(board.figures || []).length}</span>
        </button>`).join("");
    }
    const gal = view.querySelector("#skillFigGallery");
    if (gal) gal.classList.remove("is-loading");
    wireSkillBoardGallery(view, experiments);
  }
  if (state.openProjectId && (state.projects || []).some((p) => p.id === state.openProjectId)) {
    await showProject(state.openProjectId);
  }
}

function skillBoardById(id) {
  return (state._skillBoards || []).find((b) => b.id === id) || null;
}

function skillFigThumb(f) {
  return (f && (f.preview_thumb || f.preview)) || "";
}

function renderSkillFigCards(figs) {
  if (!(figs || []).length) return `<div class="empty">该 skill 暂无图例</div>`;
  return figs.map((f) => `
    <article class="skill-fig-card" data-skill-id="${esc(f.id)}">
      <button type="button" class="skill-fig-preview" data-skill-zoom="${esc(f.id)}" title="放大预览">
        <img src="${esc(skillFigThumb(f))}" alt="${esc(f.short_name)}" loading="lazy" decoding="async" width="480" height="360" />
      </button>
      <div class="skill-fig-body">
        <div class="skill-fig-name">${esc(f.short_name)}</div>
        <div class="skill-fig-cap meta">${esc(f.caption)}</div>
        <div class="skill-fig-src meta">${esc(f.source || f.skill || "")}${f.has_code ? ` · ${esc(f.code_name || "含代码")}` : " · 无脚本"}</div>
        <div class="skill-fig-actions">
          <button type="button" class="btn small" data-skill-open="${esc(f.id)}">说明/代码</button>
          <button type="button" class="btn ghost small" data-skill-link="${esc(f.id)}">标记到 Run</button>
        </div>
      </div>
    </article>`).join("");
}

function wireSkillBoardGallery(root, runs) {
  const paint = () => {
    const board = skillBoardById(state._skillBoardId) || (state._skillBoards || [])[0];
    if (!board) return;
    state._skillBoardId = board.id;
    const blurb = root.querySelector("#skillBoardBlurb");
    if (blurb) blurb.textContent = board.blurb || "";
    const host = root.querySelector("#skillFigGallery");
    if (host) host.innerHTML = renderSkillFigCards(board.figures || []);
    root.querySelectorAll("[data-skill-board]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.skillBoard === board.id);
    });
    host?.querySelectorAll("[data-skill-zoom]").forEach((btn) => {
      btn.onclick = () => {
        const f = (state._skillFigures || []).find((x) => x.id === btn.dataset.skillZoom);
        if (f) openSkillFigureLightbox(f);
      };
    });
    host?.querySelectorAll("[data-skill-open]").forEach((btn) => {
      btn.onclick = () => openSkillFigurePack(btn.dataset.skillOpen);
    });
    host?.querySelectorAll("[data-skill-link]").forEach((btn) => {
      btn.onclick = () => openLinkStyleToRunModal(
        btn.dataset.skillLink,
        runs || state._allExperiments || [],
        () => {
          if (state.route === "projects") renderProjects(document.getElementById("view"));
          else if (state.openProjectId) showProject(state.openProjectId, { fromResearch: state.route === "research" });
        },
      );
    });
  };
  root.querySelectorAll("[data-skill-board]").forEach((btn) => {
    btn.onclick = () => {
      state._skillBoardId = btn.dataset.skillBoard;
      paint();
    };
  });
  paint();
}

async function copyText(text, okMsg = "已复制") {
  const t = String(text || "");
  if (!t) return toast("无内容可复制");
  try {
    await navigator.clipboard.writeText(t);
    toast(okMsg);
  } catch (_) {
    const ta = document.createElement("textarea");
    ta.value = t;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand("copy");
    ta.remove();
    toast(okMsg);
  }
}

async function openSkillFigurePack(figureId) {
  let pack;
  try {
    pack = await API.get(`/skill-figures/${encodeURIComponent(figureId)}`);
  } catch (e) {
    return toast(e.message || "加载失败");
  }
  openModal(`
    <h3>${esc(pack.short_name || figureId)}</h3>
    <div class="skill-pack-layout">
      <div>
        <button type="button" class="skill-pack-preview" id="skillPackZoom">
          <img src="${esc(pack.preview)}" alt="" />
        </button>
        <div class="meta" style="margin-top:8px">${esc(pack.source || "")} · ${esc(pack.chart_type || "")}${pack.has_code ? " · 含脚本" : ""}</div>
      </div>
      <div>
        <h4 style="margin:0 0 6px">说明</h4>
        <p class="muted" style="margin:0 0 10px">${esc(pack.caption || "")}</p>
        <h4 style="margin:0 0 6px">风格参数</h4>
        <pre class="code-block" style="max-height:100px;overflow:auto">${esc(JSON.stringify(pack.style || {}, null, 2))}</pre>
        <h4 style="margin:12px 0 6px">代码 ${pack.code_name ? `· ${esc(pack.code_name)}` : ""}</h4>
        ${pack.code
          ? `<pre class="code-block skill-pack-code" id="skillPackCode">${esc(pack.code)}</pre>`
          : `<div class="empty" style="padding:8px 0">无配套 demo 脚本 · 可复制说明+风格给 Scier 按图复刻</div>`}
      </div>
    </div>
    <div class="toolbar" style="justify-content:flex-end;gap:8px;margin-top:12px;flex-wrap:wrap">
      <button class="btn secondary" data-close="1">关闭</button>
      <button class="btn ghost" id="skillCopyCode" ${pack.code ? "" : "disabled"}>复制代码</button>
      <button class="btn ghost" id="skillCopyBundle">复制说明+代码包</button>
      <button class="btn" id="skillSendAgent">启动画图流程</button>
      <button class="btn ghost" id="skillLinkRun">标记到 Run…</button>
    </div>
  `, { wide: true });
  document.getElementById("skillPackZoom")?.addEventListener("click", () => openSkillFigureLightbox(pack));
  document.getElementById("skillCopyCode")?.addEventListener("click", () => copyText(pack.code, "代码已复制"));
  document.getElementById("skillCopyBundle")?.addEventListener("click", () => copyText(pack.agent_prompt || pack.copy_bundle, "说明+代码包已复制"));
  document.getElementById("skillSendAgent")?.addEventListener("click", () => {
    closeModal();
    startNatureFigureWorkflow({ packPrompt: pack.agent_prompt || "" });
  });
  document.getElementById("skillLinkRun")?.addEventListener("click", () => {
    closeModal();
    openLinkStyleToRunModal(pack.id, state._allExperiments || [], () => {
      if (state.route === "projects") renderProjects(document.getElementById("view"));
    });
  });
}

async function openProjectNotes(id, opts = {}) {
  const view = document.getElementById("view");
  if (!view) return;
  const fromResearch = !!opts.fromResearch || state.route === "research";
  let p;
  let notes = [];
  let activeId = opts.noteId || null;
  try {
    p = await API.get(`/projects/${id}`);
    notes = await API.get(`/projects/${id}/notes`);
  } catch (e) {
    return toast(e.message || "加载项目失败");
  }
  state.openProjectId = id;
  state._projectNotesReturn = {
    route: state.route === "projects" || state.route === "research" ? state.route : (fromResearch ? "research" : "projects"),
    fromResearch,
  };
  const pageTitle = document.getElementById("pageTitle");
  const pageDesc = document.getElementById("pageDesc");
  if (pageTitle) pageTitle.textContent = "项目笔记";
  if (pageDesc) pageDesc.textContent = p.title || "";

  const fmtHour = (d) => {
    if (!d) return "—";
    const s = String(d).replace("T", " ");
    return s.slice(0, 13) + ":00";
  };
  const noteLabel = (n) => {
    const t = (n.title || "").trim();
    return t || fmtHour(n.recorded_at);
  };
  const notePreview = (n) => {
    const body = (n.body || "").trim().replace(/\s+/g, " ");
    return body ? body.slice(0, 72) + (body.length > 72 ? "…" : "") : "空笔记";
  };

  const leaveNotes = async () => {
    const ret = state._projectNotesReturn || {};
    state._projectNotesReturn = null;
    if (ret.fromResearch || ret.route === "research") {
      await navigate("research", { researchPanel: "projects", openProjectId: id });
    } else {
      await navigate("projects", { openProjectId: id });
    }
  };

  const paint = () => {
    if (!activeId && notes.length) activeId = notes[0].id;
    if (activeId && !notes.some((n) => n.id === activeId)) {
      activeId = notes[0]?.id || null;
    }
    const current = notes.find((n) => n.id === activeId) || null;
    setTopActions(`
      <button class="btn secondary" id="backFromProjNotes">← 返回项目</button>
      <button class="btn ghost" id="newProjNote">新建笔记</button>
      <button class="btn" id="saveProjNotesTop" ${current ? "" : "disabled"}>保存</button>
    `);
    view.innerHTML = `
      <div class="proj-notes-page is-multi">
        <div class="proj-notes-head">
          <div>
            <h2 style="margin:0">${esc(p.title || "项目")}</h2>
            <p class="muted" style="margin:6px 0 0;font-size:0.82rem">多条 Markdown 笔记 · 新建时自动记下当前整点时间</p>
          </div>
          <div class="meta">${esc(projectTypeLabel(p.project_type))} · ${esc(p.stage || "选题")} · ${notes.length} 条</div>
        </div>
        <div class="proj-notes-split">
          <aside class="proj-notes-list panel">
            <div class="toolbar" style="margin:0 0 8px">
              <strong style="flex:1">笔记列表</strong>
              <button type="button" class="btn small" id="newProjNoteSide">新建</button>
            </div>
            <div class="list" id="projNoteList">
              ${notes.map((n) => `
                <div class="list-item ${n.id === activeId ? "active" : ""}" data-note-id="${n.id}">
                  <div style="flex:1;min-width:0">
                    <div class="title">${esc(noteLabel(n))}</div>
                    <div class="meta">${esc(fmtHour(n.recorded_at))}${n.title ? "" : ""}</div>
                    <div class="meta">${esc(notePreview(n))}</div>
                  </div>
                </div>`).join("") || `<div class="empty">还没有笔记 · 点「新建」开始</div>`}
            </div>
          </aside>
          <section class="proj-notes-editor panel">
            ${current ? `
              <div class="field-row" style="margin-bottom:8px">
                <div class="field" style="flex:1"><label>标题（可选）</label>
                  <input id="projNoteTitle" value="${esc(current.title || "")}" placeholder="默认显示为 ${esc(fmtHour(current.recorded_at))}" /></div>
                <div class="field" style="max-width:160px"><label>记录时间</label>
                  <input value="${esc(fmtHour(current.recorded_at))}" disabled /></div>
              </div>
              ${mdEditorHtml(current.body || "", "projNoteMd", { showSave: true, page: true })}
              <div class="toolbar" style="margin-top:10px;justify-content:flex-end">
                <button type="button" class="btn danger small" id="delProjNote">删除本条</button>
              </div>
            ` : `<div class="empty" style="padding:48px 12px">点左侧新建一条笔记</div>`}
          </section>
        </div>
      </div>`;

    const saveCurrent = async () => {
      if (!current) return;
      const src = document.getElementById("projNoteMdSource");
      const titleEl = document.getElementById("projNoteTitle");
      try {
        const updated = await API.put(`/projects/${id}/notes/${current.id}`, {
          title: titleEl?.value || "",
          body: src ? src.value : current.body || "",
        });
        notes = notes.map((n) => (n.id === updated.id ? updated : n));
        toast("笔记已保存");
        paint();
      } catch (e) {
        toast(e.message || "保存失败");
      }
    };

    const createNote = async () => {
      try {
        const created = await API.post(`/projects/${id}/notes`, { title: "", body: "" });
        notes = [created, ...notes.filter((n) => n.id !== created.id)];
        activeId = created.id;
        toast(`已新建 · ${fmtHour(created.recorded_at)}`);
        paint();
      } catch (e) {
        toast(e.message || "新建失败");
      }
    };

    document.getElementById("backFromProjNotes").onclick = leaveNotes;
    document.getElementById("newProjNote").onclick = createNote;
    document.getElementById("newProjNoteSide")?.addEventListener("click", createNote);
    document.getElementById("saveProjNotesTop").onclick = saveCurrent;
    document.getElementById("projNoteMdSave")?.addEventListener("click", saveCurrent);
    document.getElementById("delProjNote")?.addEventListener("click", async () => {
      if (!current) return;
      if (!confirm(`删除笔记「${noteLabel(current)}」？`)) return;
      try {
        await API.del(`/projects/${id}/notes/${current.id}`);
        notes = notes.filter((n) => n.id !== current.id);
        activeId = notes[0]?.id || null;
        toast("已删除");
        paint();
      } catch (e) {
        toast(e.message || "删除失败");
      }
    });
    view.querySelectorAll("[data-note-id]").forEach((el) => {
      el.onclick = () => {
        activeId = Number(el.dataset.noteId);
        paint();
      };
    });
    if (current) wireNoteEditor("projNoteMd");
  };

  paint();

  const onKey = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      e.preventDefault();
      document.getElementById("saveProjNotesTop")?.click();
    }
  };
  if (typeof view._projNotesCleanup === "function") view._projNotesCleanup();
  document.addEventListener("keydown", onKey);
  view._projNotesCleanup = () => {
    document.removeEventListener("keydown", onKey);
    view._projNotesCleanup = null;
  };
}

async function showEngineeringProject(p, opts, box) {
  const id = p.id;
  const [records, linkedPapers] = await Promise.all([
    API.get(`/projects/${id}/engineering-records`),
    API.get(`/papers?project_id=${id}`).catch(() => []),
  ]);
  const noteCount = p.note_count || 0;
  const noteSnippet = (p.latest_note_preview || "").trim();
  const fromResearch = !!opts.fromResearch;
  const technicalCount = records.filter((record) => ["architecture", "technique", "decision", "takeaway"].includes(record.record_type)).length;
  box.innerHTML = `
    <div class="toolbar">
      <h2 style="margin:0;flex:1">${esc(p.title)}</h2>
      <span class="badge engineering-badge">工程学习</span>
    </div>
    <div class="toolbar" style="margin-top:8px;flex-wrap:wrap;gap:6px">
      <button class="btn secondary small" id="editProj">编辑</button>
      <button class="btn small" id="addEngineeringRecord">+ 学习记录</button>
      <button class="btn ghost small" id="openProjNotes" title="项目级 Markdown 长笔记">长笔记${noteCount ? ` <span class="badge">${noteCount}</span>` : ""}</button>
      <button class="btn ghost small" id="setFocus">设为焦点</button>
      <button class="btn ghost small" id="focusThisProject">专注</button>
      <button class="btn ghost small" id="goProjPapers">相关文献 (${linkedPapers.length})</button>
      <button class="btn danger small" id="delProjDetail">删除</button>
    </div>
    <div class="engineering-overview">
      <div class="engineering-overview-main">
        <div class="meta">阶段 ${esc(p.stage || "待考察")} · 进度 ${p.progress || 0}% · 状态 ${esc(projectStatusLabel(p.status, true))}</div>
        <div><strong>学习目标</strong><p>${esc(p.research_question || "尚未填写：为什么值得学习、希望获得什么能力？")}</p></div>
        <div><strong>预期收获</strong><p>${esc(p.contribution || "—")}</p></div>
        <div><strong>完成标准</strong><p>${esc(p.success_criteria || "—")}</p></div>
        <div><strong>下一步</strong><p>${esc(p.next_step || "—")}${p.next_step_deadline ? ` · DDL ${fmtDate(p.next_step_deadline)}` : ""}${p.next_step ? ` <button type="button" class="btn ghost small" id="nextToTask">→ 任务</button>` : ""}</p></div>
      </div>
      <div class="engineering-source-card">
        <span class="meta">项目入口</span>
        ${p.code_repo ? `<div>${engineeringRefHtml(p.code_repo, "源代码仓库")}</div>` : `<div class="muted">未填写源代码仓库</div>`}
        ${p.overleaf_url ? `<div>${engineeringRefHtml(p.overleaf_url, "文档 / 项目主页")}</div>` : ""}
        ${p.folder_path ? `<div>${engineeringRefHtml(p.folder_path, "本地工作区")}</div>` : ""}
      </div>
    </div>
    <div class="echo-card engineering-echo">
      <div class="echo-title">学习回声 ${p.is_focus_project ? '<span class="badge">焦点项目</span>' : ""}</div>
      <div class="echo-chips">
        <span>结构化记录 ${records.length}</span>
        <span>技术沉淀 ${technicalCount}</span>
        <span>相关文献 ${p.paper_count ?? linkedPapers.length}</span>
        <span>本周专注 ${fmtMins(p.focus_week_seconds || 0)} · ${p.focus_week_sessions || 0} 次</span>
      </div>
      ${(p.recent_focus || []).length ? `<div class="echo-focus-list">${(p.recent_focus || []).slice(0, 3).map((focus) => `
        <div class="echo-focus-item"><div class="title">${esc(focus.title || "工程学习")}${focus.active ? ' <span class="focus-rec-live">进行中</span>' : ""}</div>
        <div class="meta">${focus.started_at ? fmtDT(focus.started_at) : ""} · ${fmtMins(focus.duration_seconds || 0)}${focus.outcome ? " · " + esc(focus.outcome) : ""}</div></div>
      `).join("")}</div>` : ""}
    </div>
    <div class="engineering-record-head">
      <div>
        <h3 style="margin:0">学习过程与关键技术</h3>
        <p class="muted" style="margin:5px 0 0;font-size:0.78rem">一条记录只讲清一个问题；来源指向文档/Issue，代码位置精确到文件、类或函数。</p>
      </div>
      <div class="engineering-quick-actions">
        <button type="button" class="btn ghost small" data-new-record="architecture">记架构</button>
        <button type="button" class="btn ghost small" data-new-record="technique">记技术</button>
        <button type="button" class="btn ghost small" data-new-record="issue">记踩坑</button>
      </div>
    </div>
    <div class="engineering-records">
      ${records.map((record) => `
        <article class="engineering-record type-${esc(record.record_type)}">
          <div class="engineering-record-top">
            <span class="engineering-record-type">${esc(engineeringRecordTypeLabel(record.record_type))}</span>
            <span class="meta">${fmtDT(record.recorded_at)}</span>
            <div class="engineering-record-actions">
              <button type="button" class="btn ghost small" data-edit-eng-record="${record.id}">编辑</button>
              <button type="button" class="btn danger small" data-del-eng-record="${record.id}">删除</button>
            </div>
          </div>
          <h4>${esc(record.title || engineeringRecordTypeLabel(record.record_type))}</h4>
          <div class="engineering-record-body">${esc(record.body || "暂无正文").replace(/\n/g, "<br>")}</div>
          ${record.source_ref || record.code_ref ? `<div class="engineering-record-refs">
            ${record.source_ref ? engineeringRefHtml(record.source_ref, "来源") : ""}
            ${record.code_ref ? engineeringRefHtml(record.code_ref, "代码位置") : ""}
          </div>` : ""}
        </article>`).join("") || `<div class="empty engineering-empty">先记录一次“为什么学这个项目”，再逐步补架构、环境、关键技术和踩坑。</div>`}
    </div>
    <h3 style="margin-top:18px">相关文献</h3>
    <div class="list">
      ${linkedPapers.slice(0, 8).map((paper) => `<div class="list-item" data-open-paper="${paper.id}">
        <div><div class="title">${esc(paper.title || "未命名")}</div><div class="meta">${esc(paperStatusLabel(paper.status))}${paper.year ? " · " + paper.year : ""}</div></div>
      </div>`).join("") || `<div class="empty">可把原论文、架构解析或关键算法文献关联到本工程项目</div>`}
    </div>
    <div class="meta" style="margin-top:12px">长笔记：${noteCount ? `${noteCount} 条${noteSnippet ? " · " + esc(noteSnippet) : ""}` : "暂无 · 适合周复盘与完整源码阅读笔记"}</div>`;

  const refresh = () => showProject(id, opts);
  document.getElementById("editProj").onclick = () => projectForm(p);
  document.getElementById("addEngineeringRecord").onclick = () => engineeringRecordForm(id, null, opts);
  box.querySelectorAll("[data-new-record]").forEach((btn) => {
    btn.onclick = () => engineeringRecordForm(id, { record_type: btn.dataset.newRecord }, opts);
  });
  document.getElementById("openProjNotes").onclick = () => openProjectNotes(id, { fromResearch });
  document.getElementById("setFocus").onclick = async () => {
    state.settings = await API.put("/settings", { focus_project_id: id });
    toast("已设为焦点工程项目");
    refresh();
  };
  document.getElementById("focusThisProject").onclick = () => prepareFocusStartModal({
    link_type: "project",
    link_id: id,
    projectTitle: p.title || "",
    title: `学习：${(p.title || "").slice(0, 40)}`,
  });
  document.getElementById("goProjPapers").onclick = () => navigate("papers", { papersFilter: { projectId: id, statusGroup: null } });
  document.getElementById("nextToTask")?.addEventListener("click", () => taskForm({
    title: p.next_step,
    description: `来自工程项目「${p.title}」下一步`,
    status: "todo",
    priority: "high",
    due_date: p.next_step_deadline ? String(p.next_step_deadline).slice(0, 10) : "",
    project_id: id,
    link_type: "project",
    link_id: id,
  }));
  document.getElementById("delProjDetail").onclick = async () => {
    if (!confirm(`将工程项目「${p.title}」移入回收站？`)) return;
    await API.del(`/projects/${id}`);
    toast("已移入回收站");
    state.openProjectId = null;
    navigate(fromResearch || state.route === "research" ? "research" : "projects", fromResearch ? { researchPanel: "projects", openProjectId: null } : {});
  };
  box.querySelectorAll("[data-edit-eng-record]").forEach((btn) => {
    btn.onclick = () => engineeringRecordForm(id, records.find((record) => String(record.id) === btn.dataset.editEngRecord), opts);
  });
  box.querySelectorAll("[data-del-eng-record]").forEach((btn) => {
    btn.onclick = async () => {
      const record = records.find((item) => String(item.id) === btn.dataset.delEngRecord);
      if (!record || !confirm(`删除记录「${record.title || engineeringRecordTypeLabel(record.record_type)}」？`)) return;
      await API.del(`/projects/${id}/engineering-records/${record.id}`);
      toast("记录已删除");
      refresh();
    };
  });
  box.querySelectorAll("[data-open-paper]").forEach((el) => {
    el.onclick = () => openPaper(Number(el.dataset.openPaper));
  });
}

function engineeringRecordForm(projectId, record, projectOpts = {}) {
  const row = {
    record_type: "learning",
    title: "",
    body: "",
    source_ref: "",
    code_ref: "",
    ...(record || {}),
  };
  const saved = !!record?.id;
  openModal(`
    <h3>${saved ? "编辑工程记录" : "新建工程记录"}</h3>
    <div class="field-row">
      <div class="field"><label>记录类型</label><select id="er_type">
        ${["learning", "architecture", "setup", "technique", "issue", "decision", "takeaway"].map((type) => `<option value="${type}">${engineeringRecordTypeLabel(type)}</option>`).join("")}
      </select></div>
      <div class="field" style="flex:2"><label>标题</label><input id="er_title" value="${esc(row.title)}" placeholder="一条记录只讲清一个问题" /></div>
    </div>
    <div class="field"><label>记录内容</label><textarea id="er_body" rows="10" placeholder="现象 / 原理 / 实现方式 / 我的理解 / 可复用结论">${esc(row.body)}</textarea></div>
    <div class="field"><label>来源</label><input id="er_source" value="${esc(row.source_ref)}" placeholder="README、官方文档、论文、Issue 或网页 URL" /></div>
    <div class="field"><label>代码位置</label><input id="er_code" value="${esc(row.code_ref)}" placeholder="例如 src/core/model.py:L120 · Engine.build()" /></div>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="saveEngineeringRecord">保存记录</button>
    </div>`);
  document.getElementById("er_type").value = row.record_type || "learning";
  document.getElementById("saveEngineeringRecord").onclick = async () => {
    const payload = {
      record_type: er_type.value,
      title: er_title.value.trim(),
      body: er_body.value,
      source_ref: er_source.value.trim(),
      code_ref: er_code.value.trim(),
    };
    if (!payload.title && !payload.body.trim()) return toast("请填写标题或记录内容");
    if (saved) await API.put(`/projects/${projectId}/engineering-records/${record.id}`, payload);
    else await API.post(`/projects/${projectId}/engineering-records`, payload);
    closeModal();
    toast(saved ? "工程记录已更新" : "工程记录已保存");
    showProject(projectId, projectOpts);
  };
}

async function showProject(id, opts = {}) {
  const box = document.getElementById("projDetail");
  if (!box) return;
  state.openProjectId = id;
  const p = await API.get(`/projects/${id}`);
  if (isEngineeringProject(p)) {
    return showEngineeringProject(p, opts, box);
  }
  const isGrant = (p.project_type || "research") === "grant";
  const checklist = isGrant ? await API.get(`/projects/${id}/checklist`) : [];
  const [runs, skillPack] = await Promise.all([
    API.get(`/experiments?project_id=${id}`),
    API.get("/skill-figures").catch(() => ({ figures: [], boards: [] })),
  ]);
  const skillFigs = skillPack.figures || [];
  state._skillFigures = skillFigs;
  if (skillPack.boards?.length) state._skillBoards = skillPack.boards;
  const linkedPapers = await API.get(`/papers?project_id=${id}`).catch(() => []);
  const fromResearch = !!opts.fromResearch;
  const noteCount = p.note_count || 0;
  const noteSnippet = (p.latest_note_preview || "").trim();
  box.innerHTML = `
    <div class="toolbar">
      <h2 style="margin:0;flex:1">${esc(p.title)}</h2>
      <span class="badge">${esc(projectTypeLabel(p.project_type))}</span>
    </div>
    <div class="toolbar" style="margin-top:8px;flex-wrap:wrap;gap:6px">
      <button class="btn secondary small" id="editProj">编辑</button>
      <button class="btn ghost small" id="openProjNotes" title="全页 Markdown 多条笔记">笔记${noteCount ? ` <span class="badge">${noteCount}</span>` : ""}</button>
      <button class="btn ghost small" id="setFocus">设为焦点</button>
      <button class="btn ghost small" id="focusThisProject" title="绑定本项目开始专注">专注</button>
      <button class="btn ghost small" id="goProjPapers">项目文献 (${linkedPapers.length})</button>
      <button class="btn danger small" id="delProjDetail">删除</button>
    </div>
    <div class="meta" style="margin-top:10px">状态 ${esc(p.status)} · 阶段 ${esc(p.stage || "选题")} · 进度 ${p.progress || 0}% · ${esc(p.target_venue || "未定刊")}</div>
    <div class="meta">问题：${esc(p.research_question || "—")}</div>
    <div class="meta">贡献：${esc(p.contribution || "—")}</div>
    <div class="meta">下一步：${esc(p.next_step || "—")}${p.next_step_deadline ? " · DDL " + fmtDate(p.next_step_deadline) : ""}${p.next_step ? ` <button type="button" class="btn ghost small" id="nextToTask" title="一键生成任务">→ 任务</button>` : ""}</div>
    <div class="meta">笔记：${noteCount ? `${noteCount} 条${noteSnippet ? " · " + esc(noteSnippet) : ""}${p.latest_note_at ? " · " + esc(String(p.latest_note_at).replace("T", " ").slice(0, 13) + ":00") : ""}` : "暂无 · 点「笔记」新建多条 Markdown"}</div>
    <div class="echo-card">
      <div class="echo-title">回声 ${p.is_focus_project ? '<span class="badge">焦点项目</span>' : ""}</div>
      <div class="echo-chips">
        <span>文献 ${p.paper_count ?? linkedPapers.length} 篇</span>
        <span>本周专注 ${fmtMins(p.focus_week_seconds || 0)} · ${p.focus_week_sessions || 0} 次</span>
        <span>Run ${runs.length}</span>
      </div>
      ${(p.recent_focus || []).length ? `<div class="echo-focus-list">${(p.recent_focus || []).slice(0, 4).map((f) => `
        <div class="echo-focus-item">
          <div class="title">${esc(f.title || "专注")}${f.active ? ' <span class="focus-rec-live">进行中</span>' : ""}</div>
          <div class="meta">${f.started_at ? fmtDT(f.started_at) : ""} · ${fmtMins(f.duration_seconds || 0)}${f.outcome ? " · " + esc(f.outcome) : ""}</div>
        </div>`).join("")}</div>` : `<p class="muted" style="margin:6px 0 0;font-size:0.75rem">暂无绑定本项目的专注记录 · 点「专注」开始一次</p>`}
    </div>
    ${p.overleaf_url || p.code_repo || p.folder_path ? `
    <div class="meta">链接：${p.overleaf_url ? `<a href="${esc(p.overleaf_url)}" target="_blank" rel="noopener">Overleaf</a> · ` : ""}${p.code_repo ? `<a href="${esc(p.code_repo)}" target="_blank" rel="noopener">代码</a> · ` : ""}${p.folder_path ? esc(p.folder_path) : ""}</div>` : ""}
    ${isGrant ? `
    <h3 style="margin-top:14px">申请材料清单</h3>
    <div class="list">${checklist.map((c)=>`<div class="check-row">
      <input type="checkbox" ${c.done?"checked":""} data-ck="${c.id}" />
      <span>${esc(c.title)}</span></div>`).join("") || `<div class="empty">无清单项</div>`}
    </div>
    <div class="toolbar">
      <input id="ckTitle" placeholder="新材料项" />
      <button class="btn small secondary" id="addCk">添加</button>
    </div>` : ""}
    <h3 style="margin-top:14px">关联文献</h3>
    <div class="list">
      ${linkedPapers.slice(0, 8).map((paper) => `
        <div class="list-item" data-open-paper="${paper.id}">
          <div>
            <div class="title">${esc(paper.title || "未命名")}</div>
            <div class="meta">${esc(paperStatusLabel(paper.status))}${paper.year ? " · " + paper.year : ""}${paper.file_exists === false ? " · ⚠ 路径失效" : ""}</div>
          </div>
        </div>`).join("") || `<div class="empty">尚未关联文献 · 点「项目文献」去入库并挂上本项目标签</div>`}
    </div>

    <h3 style="margin-top:18px">实验 Run</h3>
    <p class="muted" style="margin:0 0 8px;font-size:0.78rem">
      参考图在本页下方图库。点「说明/代码」复制给 Scier；「标记到 Run」只记录选用哪张图。
    </p>
    <div class="toolbar" style="margin:0 0 8px;gap:6px">
      <button class="btn small" id="addRun">新建 Run</button>
      <button class="btn ghost small" id="compareRuns" ${runs.length < 2 ? "disabled" : ""}>对比所选</button>
    </div>
    <div class="list" style="margin-top:8px">
      ${runs.map((r)=>`<div class="list-item run-item">
        <label class="check-inline" style="margin-right:8px" title="选中对比"><input type="checkbox" class="run-cmp" value="${r.id}" /></label>
        ${r.style_preview
          ? `<button type="button" class="run-fig-thumb" data-style-zoom="${esc(r.style_template_id)}" title="已标记参考图"><img src="${esc(r.style_preview)}" alt="" /></button>`
          : (r.preview_figure_id ? `<button type="button" class="run-fig-thumb" data-fig-preview="${r.preview_figure_id}" title="已有图"><img src="/api/figures/${r.preview_figure_id}/file?fmt=png" alt="" /></button>` : `<span class="run-fig-thumb is-empty meta">未标记</span>`)}
        <div style="flex:1;min-width:0">
        <div class="title">${esc(r.title)}${(r.figure_count || 0) ? ` <span class="badge">${r.figure_count} 图</span>` : ""}</div>
        <div class="meta">${esc(r.status)} · ${esc(r.style_short_name || "未标记参考图")}</div>
        <div class="meta">metrics: ${esc(r.metrics_json || "{}")}</div>
      </div>
      <button class="btn ghost small" data-figrun="${r.id}">管理</button>
      <button class="btn ghost small" data-edrun="${r.id}">编辑</button>
      <button class="btn danger small" data-delrun="${r.id}" title="删除 Run">删除</button></div>`).join("") || `<div class="empty">暂无 Run</div>`}
    </div>`;
  document.getElementById("editProj").onclick = () => projectForm(p);
  document.getElementById("openProjNotes").onclick = () => openProjectNotes(id, { fromResearch });
  const nextBtn = document.getElementById("nextToTask");
  if (nextBtn) {
    nextBtn.onclick = (e) => {
      e.stopPropagation();
      taskForm({
        title: p.next_step,
        description: `来自项目「${p.title}」下一步`,
        status: "todo",
        priority: "high",
        due_date: p.next_step_deadline ? String(p.next_step_deadline).slice(0, 10) : "",
        project_id: id,
        link_type: "project",
        link_id: id,
      });
    };
  }
  document.getElementById("setFocus").onclick = async () => {
    const s = await API.put("/settings", { focus_project_id: id });
    state.settings = s;
    toast("已设为焦点项目");
    showProject(id, opts);
  };
  document.getElementById("focusThisProject")?.addEventListener("click", () => {
    prepareFocusStartModal({
      link_type: "project",
      link_id: id,
      projectTitle: p.title || "",
      title: `推进：${(p.title || "").slice(0, 40)}`,
    });
  });
  document.getElementById("goProjPapers").onclick = () => {
    navigate("papers", { papersFilter: { projectId: id, statusGroup: null } });
  };
  document.getElementById("delProjDetail").onclick = async () => {
    if (!confirm(`将项目「${p.title}」移入回收站？可在设置中恢复；彻底清除前关联仍可找回。`)) return;
    await API.del(`/projects/${id}`);
    toast("已移入回收站");
    state.openProjectId = null;
    if (fromResearch || state.route === "research") {
      navigate("research", { researchPanel: "projects", openProjectId: null });
    } else {
      navigate("projects");
    }
  };
  box.querySelectorAll("[data-open-paper]").forEach((el) => {
    el.onclick = () => openPaper(Number(el.dataset.openPaper));
  });
  if (isGrant) {
    document.getElementById("addCk").onclick = async () => {
      const title = document.getElementById("ckTitle").value.trim();
      if (!title) return;
      await API.post(`/projects/${id}/checklist`, { title });
      showProject(id, opts);
    };
    box.querySelectorAll("[data-ck]").forEach((ck) => {
      ck.onchange = async () => {
        const item = checklist.find((x) => String(x.id) === ck.dataset.ck);
        await API.put(`/checklist/${item.id}`, { ...item, done: ck.checked });
      };
    });
  }

  box.querySelectorAll("[data-style-zoom]").forEach((btn) => {
    btn.onclick = () => {
      const f = skillFigs.find((x) => x.id === btn.dataset.styleZoom);
      if (f) openSkillFigureLightbox(f);
    };
  });

  document.getElementById("addRun").onclick = () => experimentForm({ project_id: id });
  document.getElementById("compareRuns").onclick = () => {
    const ids = [...box.querySelectorAll(".run-cmp:checked")].map((x) => Number(x.value));
    const selected = runs.filter((r) => ids.includes(r.id));
    if (selected.length < 2) return toast("请至少勾选 2 个 Run");
    openExperimentCompare(selected);
  };
  box.querySelectorAll("[data-edrun]").forEach((btn) => {
    btn.onclick = () => experimentForm(runs.find((r) => String(r.id) === btn.dataset.edrun));
  });
  box.querySelectorAll("[data-delrun]").forEach((btn) => {
    btn.onclick = async () => {
      const run = runs.find((r) => String(r.id) === btn.dataset.delrun);
      if (!run) return;
      if (!confirm(`将实验 Run「${run.title}」移入回收站？可在设置中恢复。`)) return;
      try {
        await API.del(`/experiments/${run.id}`);
        toast("已移入回收站");
        await Promise.all([showProject(id, opts), refreshRecentExperimentsPanel()]);
      } catch (e) {
        toast(e.message || "删除失败");
      }
    };
  });
  box.querySelectorAll("[data-figrun]").forEach((btn) => {
    btn.onclick = () => {
      const run = runs.find((r) => String(r.id) === btn.dataset.figrun);
      if (run) openExperimentFigureStudio(run);
    };
  });
  box.querySelectorAll("[data-fig-preview]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openFigureLightbox({ id: Number(btn.dataset.figPreview), has_png: true, short_name: "出图预览", caption: "" });
    };
  });
}

function openExperimentCompare(runs) {
  const parseObj = (raw) => {
    try {
      const o = JSON.parse(raw || "{}");
      return o && typeof o === "object" && !Array.isArray(o) ? o : {};
    } catch (_) {
      return {};
    }
  };
  const metricsKeys = [...new Set(runs.flatMap((r) => Object.keys(parseObj(r.metrics_json))))];
  const paramsKeys = [...new Set(runs.flatMap((r) => Object.keys(parseObj(r.params_json))))];
  const cell = (obj, k) => {
    const v = obj[k];
    if (v == null) return "—";
    if (typeof v === "object") return esc(JSON.stringify(v));
    return esc(String(v));
  };
  const colHead = runs.map((r) => `<th>${esc(r.title || `#${r.id}`)}</th>`).join("");
  const section = (title, keys, getter) => {
    if (!keys.length) return `<tr><td colspan="${runs.length + 1}" class="meta">${esc(title)}：无字段</td></tr>`;
    return keys.map((k) => `
      <tr>
        <td class="meta">${esc(k)}</td>
        ${runs.map((r) => `<td>${cell(getter(r), k)}</td>`).join("")}
      </tr>`).join("");
  };
  openModal(`
    <h3>实验 Run 对比</h3>
    <div class="table-wrap" style="overflow:auto;max-height:60vh">
      <table class="data run-compare-table">
        <thead><tr><th>字段</th>${colHead}</tr></thead>
        <tbody>
          <tr><td class="meta">状态</td>${runs.map((r) => `<td>${esc(r.status || "—")}</td>`).join("")}</tr>
          <tr><td class="meta">假设</td>${runs.map((r) => `<td>${esc(r.hypothesis || "—")}</td>`).join("")}</tr>
          <tr><td colspan="${runs.length + 1}"><strong>指标</strong></td></tr>
          ${section("指标", metricsKeys, (r) => parseObj(r.metrics_json))}
          <tr><td colspan="${runs.length + 1}"><strong>参数</strong></td></tr>
          ${section("参数", paramsKeys, (r) => parseObj(r.params_json))}
          <tr><td class="meta">结论</td>${runs.map((r) => `<td>${esc(r.conclusion || "—")}</td>`).join("")}</tr>
        </tbody>
      </table>
    </div>
    <div class="toolbar" style="justify-content:flex-end;margin-top:10px">
      <button class="btn secondary" data-close="1">关闭</button>
    </div>
  `, { wide: true });
}

function projectForm(p, opts = {}) {
  const defaultType = opts.projectType === "engineering" ? "engineering" : "research";
  const row = p || {
    title: "", project_type: defaultType, status: "active", research_question: "", contribution: "",
    success_criteria: "", notes: "", deadline: "", stage: defaultType === "engineering" ? "待考察" : "选题", progress: 0, next_step: "",
    next_step_deadline: "", target_venue: "", overleaf_url: "", code_repo: "", folder_path: "",
  };
  const initialEngineering = isEngineeringProject(row);
  const initialStages = initialEngineering ? ENGINEERING_PROJECT_STAGES : ACADEMIC_PROJECT_STAGES;
  const initialStatuses = initialEngineering ? ENGINEERING_PROJECT_STATUSES : ACADEMIC_PROJECT_STATUSES;
  openModal(`
    <h3>${p ? "编辑项目" : (initialEngineering ? "新建工程项目" : "新建学术项目")}</h3>
    <div class="field"><label>标题</label><input id="p_title" value="${esc(row.title)}" placeholder="${initialEngineering ? "例如：学习并改造 vLLM" : "项目标题"}" /></div>
    <div class="field-row">
      <div class="field"><label id="p_type_label">${initialEngineering ? "工程项目类型" : "项目类型"}</label>
        <select id="p_type" ${!p && initialEngineering ? "disabled" : ""}>
          <option value="research" ${row.project_type === "research" ? "selected" : ""}>研究发文（默认）</option>
          <option value="engineering" ${row.project_type === "engineering" ? "selected" : ""}>工程学习（开源项目）</option>
          <option value="grant" ${row.project_type === "grant" ? "selected" : ""}>基金申请</option>
          <option value="collab" ${row.project_type === "collab" ? "selected" : ""}>合作</option>
          <option value="ongoing" ${row.project_type === "ongoing" ? "selected" : ""}>长期</option>
        </select>
      </div>
      <div class="field"><label id="p_status_label">${initialEngineering ? "工程状态" : "状态"}</label>
        <select id="p_status">
          ${initialStatuses.map(([value, label]) => `<option value="${value}" ${row.status === value ? "selected" : ""}>${label}</option>`).join("")}
        </select>
      </div>
    </div>
    <div class="field-row">
      <div class="field"><label id="p_stage_label">${initialEngineering ? "学习阶段" : "论文阶段"}</label>
        <select id="p_stage">${initialStages.map((stage) => `<option>${stage}</option>`).join("")}</select>
      </div>
      <div class="field"><label>进度 %</label><input id="p_progress" type="number" min="0" max="100" value="${row.progress||0}" /></div>
    </div>
    <div class="field-row">
      <div class="field"><label>下一步</label><input id="p_next" value="${esc(row.next_step||"")}" /></div>
      <div class="field"><label>下一步 DDL</label><input type="date" id="p_next_ddl" value="${fmtDate(row.next_step_deadline).replace('—','')}" /></div>
    </div>
    <div class="field" id="p_venue_wrap"><label>目标期刊/会议</label><input id="p_venue" value="${esc(row.target_venue||"")}" /></div>
    <div class="field"><label id="p_rq_label">${initialEngineering ? "学习目标 / 为什么学" : "研究问题"}</label><textarea id="p_rq" rows="3">${esc(row.research_question||"")}</textarea></div>
    <div class="field-row">
      <div class="field"><label id="p_contribution_label">${initialEngineering ? "希望掌握的能力" : "预期贡献"}</label><textarea id="p_contribution" rows="3">${esc(row.contribution||"")}</textarea></div>
      <div class="field"><label>完成标准</label><textarea id="p_success" rows="3" placeholder="${initialEngineering ? "例如：独立部署、复现样例、修改一个模块并形成技术卡片" : "什么结果算完成"}">${esc(row.success_criteria||"")}</textarea></div>
    </div>
    <div class="field"><label id="p_links_label">${initialEngineering ? "源仓库 / 文档主页" : "Overleaf / 代码仓库"}</label>
      <input id="p_code" value="${esc(row.code_repo||"")}" placeholder="${initialEngineering ? "GitHub / GitLab 源仓库 URL" : "Code repo"}" />
      <input id="p_ol" style="margin-top:6px" value="${esc(row.overleaf_url||"")}" placeholder="${initialEngineering ? "官方文档或项目主页" : "Overleaf URL"}" /></div>
    <div class="field"><label>本地文件夹</label><input id="p_folder" value="${esc(row.folder_path||"")}" /></div>
    <p class="muted" id="p_form_hint" style="margin:0 0 10px;font-size:0.75rem"></p>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      ${p?`<button class="btn danger" id="delProj">删除</button>`:""}
      ${p?`<button class="btn ghost" id="projFormNotes">打开笔记</button>`:""}
      <button class="btn" id="saveProj">保存</button>
    </div>
  `);
  document.getElementById("p_type").value = row.project_type || "research";
  document.getElementById("p_stage").value = row.stage || initialStages[0];
  document.getElementById("p_status").value = row.status || "active";
  const syncProjectFormType = (preserveStage = true) => {
    const engineering = p_type.value === "engineering";
    const stages = engineering ? ENGINEERING_PROJECT_STAGES : ACADEMIC_PROJECT_STAGES;
    const statuses = engineering ? ENGINEERING_PROJECT_STATUSES : ACADEMIC_PROJECT_STATUSES;
    const current = preserveStage ? (p_stage.value || row.stage || "") : "";
    const currentStatus = p_status.value || row.status || "active";
    p_stage.innerHTML = stages.map((stage) => `<option>${stage}</option>`).join("");
    p_stage.value = stages.includes(current) ? current : stages[0];
    p_status.innerHTML = statuses.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
    p_status.value = statuses.some(([value]) => value === currentStatus) ? currentStatus : "active";
    p_type_label.textContent = engineering ? "工程项目类型" : "项目类型";
    p_status_label.textContent = engineering ? "工程状态" : "状态";
    p_stage_label.textContent = engineering ? "学习阶段" : "论文阶段";
    p_rq_label.textContent = engineering ? "学习目标 / 为什么学" : "研究问题";
    p_contribution_label.textContent = engineering ? "希望掌握的能力" : "预期贡献";
    p_links_label.textContent = engineering ? "源仓库 / 文档主页" : "Overleaf / 代码仓库";
    p_venue_wrap.classList.toggle("hidden", engineering);
    p_code.placeholder = engineering ? "GitHub / GitLab 源仓库 URL" : "Code repo";
    p_ol.placeholder = engineering ? "官方文档或项目主页" : "Overleaf URL";
    p_form_hint.textContent = engineering
      ? "保存后在工程项目详情中，用结构化记录持续写下学习进展、架构、环境、关键技术、踩坑、工程决策与可复用结论。"
      : "长笔记可在项目详情中维护；阶段为在投 / R&R / 接收 / 发表时会自动同步到投稿。";
  };
  syncProjectFormType(true);
  p_type.onchange = () => syncProjectFormType(true);
  document.getElementById("projFormNotes")?.addEventListener("click", () => {
    closeModal();
    openProjectNotes(p.id, { fromResearch: state.route === "research" });
  });
  document.getElementById("saveProj").onclick = async () => {
    if (!p_title.value.trim()) return toast("请填写项目标题");
    const body = {
      title: p_title.value.trim(),
      project_type: p_type.value || "research",
      status: p_status.value,
      research_question: p_rq.value,
      contribution: p_contribution.value,
      success_criteria: p_success.value,
      notes: row.notes || "",
      deadline: row.deadline || null,
      stage: p_stage.value,
      progress: Number(p_progress.value || 0),
      next_step: p_next.value,
      next_step_deadline: p_next_ddl.value || null,
      target_venue: p_venue.value,
      overleaf_url: p_ol.value,
      code_repo: p_code.value,
      folder_path: p_folder.value,
      hidden: !!(p && p.hidden),
    };
    if (p) await API.put(`/projects/${p.id}`, body);
    else {
      const created = await API.post("/projects", body);
      if (created?.id) state.openProjectId = created.id;
    }
    closeModal();
    if (state.route === "research") {
      state.researchMode = body.project_type === "engineering" ? "engineering" : "academic";
      navigate("research", {
        researchPanel: state.researchPanel || "projects",
        openProjectId: state.openProjectId || p?.id || null,
      });
    } else {
      navigate("projects");
    }
  };
  const d = document.getElementById("delProj");
  if (d) d.onclick = async () => {
    await API.del(`/projects/${p.id}`);
    closeModal();
    state.openProjectId = null;
    if (state.route === "research") {
      navigate("research", { researchPanel: state.researchPanel || "projects", openProjectId: null });
    } else {
      navigate("projects");
    }
  };
}

function experimentForm(row) {
  const r = row.id ? row : {
    project_id: row.project_id || null, title: "", hypothesis: "", params_json: "{}", metrics_json: "{}",
    code_path: "", data_path: "", checkpoint_path: "", status: "planned", conclusion: "", failure_reason: "",
  };
  const saved = !!row.id;
  openModal(`
    <h3>${saved ? "编辑实验" : "新建实验 Run"}</h3>
    <div class="field"><label>标题</label><input id="e_title" value="${esc(r.title)}" /></div>
    <div class="field"><label>假设</label><textarea id="e_hyp" rows="2">${esc(r.hypothesis||"")}</textarea></div>
    <div class="field-row">
      <div class="field"><label>参数 JSON</label><textarea id="e_params" rows="3">${esc(r.params_json||"{}")}</textarea></div>
      <div class="field"><label>指标 JSON</label><textarea id="e_metrics" rows="3">${esc(r.metrics_json||"{}")}</textarea></div>
    </div>
    <div class="field"><label>代码路径</label><input id="e_code" value="${esc(r.code_path||"")}" /></div>
    <div class="field"><label>数据路径</label><input id="e_data" value="${esc(r.data_path||"")}" /></div>
    <div class="field"><label>Checkpoint</label><input id="e_ckpt" value="${esc(r.checkpoint_path||"")}" /></div>
    <div class="field-row">
      <div class="field"><label>状态</label>
        <select id="e_status"><option>planned</option><option>running</option><option>done</option><option>failed</option></select>
      </div>
      <div class="field"><label>项目</label><select id="e_proj">${projectOptions(r.project_id)}</select></div>
    </div>
    <div class="field"><label>结论</label><textarea id="e_conc" rows="2">${esc(r.conclusion||"")}</textarea></div>
    <div class="field"><label>失败原因</label><textarea id="e_fail" rows="2">${esc(r.failure_reason||"")}</textarea></div>
    <div class="toolbar" style="justify-content:flex-end;gap:8px;margin-top:10px">
      <button class="btn secondary" data-close="1">取消</button>
      ${saved ? `<button class="btn danger" id="delExp">删除</button>` : ""}
      ${saved ? `<button class="btn ghost" id="openFigStudio">管理图片</button>` : ""}
      <button class="btn" id="saveExp">保存</button>
    </div>
    ${saved ? "" : `<p class="muted" style="margin:8px 0 0;font-size:0.78rem">保存后可在实验页图库标记参考图，或用说明/代码发给 Scier。</p>`}
  `);
  e_status.value = r.status || "planned";
  document.getElementById("openFigStudio")?.addEventListener("click", () => {
    closeModal();
    openExperimentFigureStudio({ ...r, id: row.id });
  });
  document.getElementById("delExp")?.addEventListener("click", async () => {
    if (!confirm(`将实验 Run「${r.title || row.title}」移入回收站？可在设置中恢复。`)) return;
    try {
      await API.del(`/experiments/${row.id}`);
      closeModal();
      toast("已移入回收站");
      if (state.openProjectId && document.getElementById("projDetail")) {
        await Promise.all([
          showProject(state.openProjectId, { fromResearch: state.route === "research" }),
          refreshRecentExperimentsPanel(),
        ]);
      } else {
        navigate(state.route === "research" ? "research" : "projects");
      }
    } catch (e) {
      toast(e.message || "删除失败");
    }
  });
  document.getElementById("saveExp").onclick = async () => {
    const body = {
      project_id: e_proj.value ? Number(e_proj.value) : null,
      title: e_title.value, hypothesis: e_hyp.value,
      params_json: e_params.value || "{}", metrics_json: e_metrics.value || "{}",
      code_path: e_code.value, data_path: e_data.value, checkpoint_path: e_ckpt.value,
      status: e_status.value, conclusion: e_conc.value, failure_reason: e_fail.value,
      style_template_id: r.style_template_id || "",
    };
    try {
      let savedRow;
      if (row.id) savedRow = await API.put(`/experiments/${row.id}`, body);
      else savedRow = await API.post("/experiments", body);
      closeModal();
      toast("已保存");
      if (state.openProjectId && document.getElementById("projDetail")) {
        await Promise.all([
          showProject(state.openProjectId, { fromResearch: state.route === "research" }),
          refreshRecentExperimentsPanel(),
        ]);
      } else {
        navigate(state.route === "research" ? "research" : "projects");
      }
    } catch (e) {
      toast(e.message || "保存失败");
    }
  };
}

function figFileUrl(fid, fmt = "png") {
  return `/api/figures/${fid}/file?fmt=${encodeURIComponent(fmt)}&t=${Date.now()}`;
}

function _ensureFigLightbox() {
  let overlay = document.getElementById("figLightboxOverlay");
  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "figLightboxOverlay";
    overlay.className = "fig-lightbox-overlay";
    document.body.appendChild(overlay);
  }
  return overlay;
}

function openFigureLightbox(fig) {
  if (!fig?.has_png && !fig?.image_path) return toast("无可预览图片");
  const url = figFileUrl(fig.id, "png");
  const overlay = _ensureFigLightbox();
  overlay.innerHTML = `
    <div class="fig-lightbox-panel">
      <div class="toolbar" style="margin-bottom:8px">
        <strong style="flex:1">${esc(fig.short_name || "图")}</strong>
        ${fig.has_svg ? `<a class="btn ghost small" href="${figFileUrl(fig.id, "svg")}" target="_blank" rel="noopener">SVG</a>` : ""}
        <button type="button" class="btn secondary small" id="figLbClose">关闭</button>
      </div>
      ${fig.caption ? `<p class="muted" style="margin:0 0 8px">${esc(fig.caption)}</p>` : ""}
      <div class="fig-lightbox"><img src="${url}" alt="" /></div>
    </div>`;
  overlay.classList.remove("hidden");
  const close = () => overlay.classList.add("hidden");
  document.getElementById("figLbClose").onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

function openSkillFigureLightbox(skill) {
  if (!skill?.preview) return toast("无预览图");
  const overlay = _ensureFigLightbox();
  overlay.innerHTML = `
    <div class="fig-lightbox-panel">
      <div class="toolbar" style="margin-bottom:8px">
        <strong style="flex:1">${esc(skill.short_name || "图库")}</strong>
        <button type="button" class="btn secondary small" id="figLbClose">关闭</button>
      </div>
      <p class="muted" style="margin:0 0 4px">${esc(skill.caption || "")}</p>
      <p class="meta" style="margin:0 0 8px">${esc(skill.source || "")} · ${esc(skill.chart_type || "")}</p>
      <div class="fig-lightbox"><img src="${esc(skill.preview)}" alt="" /></div>
    </div>`;
  overlay.classList.remove("hidden");
  const close = () => overlay.classList.add("hidden");
  document.getElementById("figLbClose").onclick = close;
  overlay.onclick = (e) => { if (e.target === overlay) close(); };
}

function openLinkStyleToRunModal(skillId, runs, onDone) {
  const skill = (state._skillFigures || []).find((x) => x.id === skillId)
    || { id: skillId, short_name: skillId, caption: "", preview: "" };
  if (!(runs || []).length) return toast("请先新建一个实验 Run");
  const projName = (pid) => {
    const p = (state.projects || []).find((x) => x.id === pid);
    return p ? p.title : (pid ? `项目#${pid}` : "未挂项目");
  };
  openModal(`
    <h3>标记参考图 → Run</h3>
    <p class="muted" style="margin:0 0 10px">只记录本 Run 选用哪张示例图；出图请用「说明/代码」发给 Scier。</p>
    <div class="skill-link-preview">
      ${skill.preview ? `<img src="${esc(skill.preview)}" alt="" />` : ""}
      <div>
        <div class="title">${esc(skill.short_name || skillId)}</div>
        <div class="meta">${esc(skill.caption || "")}</div>
        <div class="meta">${esc(skill.skill || skill.source || "")}${skill.has_code ? " · 含代码" : ""}</div>
      </div>
    </div>
    <div class="field" style="margin-top:12px"><label>选择实验 Run</label>
      <select id="skillLinkRun">
        ${runs.map((r) => `<option value="${r.id}">${esc(projName(r.project_id))} · ${esc(r.title)}${r.style_template_id === skillId ? " · 已标记此图" : ""}</option>`).join("")}
      </select>
    </div>
    <div class="toolbar" style="justify-content:flex-end;margin-top:12px;gap:8px;flex-wrap:wrap">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="skillLinkOnly">标记</button>
    </div>
  `);
  document.getElementById("skillLinkOnly").onclick = async () => {
    const runId = Number(document.getElementById("skillLinkRun").value);
    try {
      await API.put(`/experiments/${runId}/style`, { style_template_id: skillId });
      toast("已标记参考图");
      closeModal();
      if (typeof onDone === "function") onDone();
    } catch (e) {
      toast(e.message || "操作失败");
    }
  };
}

function renderFigGallery(figs) {
  if (!(figs || []).length) return `<div class="empty" style="padding:12px 0">还没有图 · 可加入示意图，或用图库代码包让 Scier 出图后导入</div>`;
  return `<div class="fig-gallery">${figs.map((f) => `
    <div class="fig-card" data-fig-id="${f.id}">
      <button type="button" class="fig-thumb" data-fig-open="${f.id}" title="点击放大">
        ${f.has_png
          ? `<img src="${figFileUrl(f.id, "png")}" alt="" />`
          : `<span class="meta">无预览</span>`}
      </button>
      <div class="fig-card-meta">
        <div class="fig-card-title">${esc(f.short_name || f.chart_type || "未命名")} <span class="badge">${esc(f.kind === "schematic" ? "示意" : f.chart_type || "图")}</span></div>
        <div class="fig-card-cap meta">${esc(f.caption || "无说明")}</div>
        <div class="fig-card-actions">
          ${f.has_svg ? `<a class="btn ghost small" href="${figFileUrl(f.id, "svg")}" target="_blank" rel="noopener">SVG</a>` : ""}
          <button type="button" class="btn ghost small" data-fig-del="${f.id}">删除</button>
        </div>
      </div>
    </div>`).join("")}</div>`;
}

async function openExperimentFigureStudio(run) {
  if (!run?.id) return toast("请先保存实验 Run");
  let figures = [];
  let skillFigs = state._skillFigures || [];
  try {
    const [figs, pack, fresh] = await Promise.all([
      API.get(`/experiments/${run.id}/figures`),
      skillFigs.length ? Promise.resolve({ figures: skillFigs }) : API.get("/skill-figures").catch(() => ({ figures: [] })),
      API.get(`/experiments?project_id=${run.project_id}`).catch(() => []),
    ]);
    figures = figs || [];
    skillFigs = pack.figures || skillFigs;
    state._skillFigures = skillFigs;
    const updated = (fresh || []).find((r) => r.id === run.id);
    if (updated) run = updated;
  } catch (e) {
    toast(e.message || "加载失败");
  }
  const linked = skillFigs.find((x) => x.id === run.style_template_id) || null;

  openModal(`
    <h3>出图管理 · ${esc(run.title || "Run")}</h3>
    <p class="muted" style="margin:0 0 12px">
      参考图与代码在「实验」页底部图库。此处只管理已保存图片与示意图；出图请用 Scier。
    </p>
    <section class="fig-studio-pane" style="margin-bottom:12px">
      <h4>已标记参考图</h4>
      ${linked ? `
        <div class="skill-link-preview">
          <button type="button" class="skill-link-thumb" id="studioStyleZoom" title="放大参考图">
            <img src="${esc(linked.preview)}" alt="" />
          </button>
          <div>
            <div class="title">${esc(linked.short_name)}</div>
            <div class="meta">${esc(linked.caption)}</div>
            <div class="meta">${esc(linked.skill || linked.source || "")}${linked.has_code ? " · 含代码" : ""}</div>
          </div>
        </div>
        <div class="toolbar" style="gap:6px;margin-top:10px;flex-wrap:wrap">
          <button type="button" class="btn small" id="studioOpenPack">打开说明/代码</button>
          <button type="button" class="btn ghost small" id="studioUnlink">取消标记</button>
          <button type="button" class="btn ghost small" id="studioGoGallery">去图库</button>
        </div>
      ` : `
        <div class="empty" style="padding:8px 0">尚未标记参考图。</div>
        <button type="button" class="btn small" id="studioGoGallery">打开实验图库</button>
      `}
    </section>
    <div class="fig-studio">
      <section class="fig-studio-pane">
        <h4>示意图 / 成品图导入</h4>
        <div class="field"><label>本地图片路径</label>
          <input id="fig_sch_path" placeholder="/mnt/d/.../method.png" /></div>
        <div class="field-row">
          <div class="field"><label>简称</label><input id="fig_sch_name" value="Fig.A" /></div>
          <div class="field"><label>说明</label><input id="fig_sch_cap" value="" /></div>
        </div>
        <button type="button" class="btn small" id="figAddSchematic">加入图片</button>
      </section>
      <section class="fig-studio-pane">
        <h4>Run metrics</h4>
        <pre class="code-block" style="max-height:160px;overflow:auto;margin:0">${esc(run.metrics_json || "{}")}</pre>
        <p class="meta" style="margin:8px 0 0">可复制到 Scier，与图库代码包一起使用。</p>
      </section>
    </div>
    <h4 style="margin:16px 0 8px">已保存图 <span class="meta" id="figGalleryCount">${figures.length} 张</span></h4>
    <div id="figGalleryHost">${renderFigGallery(figures)}</div>
    <div class="toolbar" style="justify-content:flex-end;margin-top:12px">
      <button class="btn secondary" data-close="1">关闭</button>
    </div>
  `, { wide: true });

  const refreshGallery = async () => {
    figures = await API.get(`/experiments/${run.id}/figures`);
    const host = document.getElementById("figGalleryHost");
    if (host) host.innerHTML = renderFigGallery(figures);
    const cnt = document.getElementById("figGalleryCount");
    if (cnt) cnt.textContent = `${figures.length} 张`;
    wireGallery();
  };
  const wireGallery = () => {
    document.querySelectorAll("[data-fig-open]").forEach((btn) => {
      btn.onclick = () => {
        const fig = figures.find((f) => String(f.id) === btn.dataset.figOpen);
        if (fig) openFigureLightbox(fig);
      };
    });
    document.querySelectorAll("[data-fig-del]").forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm("删除这张图？")) return;
        try {
          await API.del(`/figures/${btn.dataset.figDel}`);
          toast("已删除");
          await refreshGallery();
        } catch (e) {
          toast(e.message || "删除失败");
        }
      };
    });
  };
  wireGallery();

  document.getElementById("studioStyleZoom")?.addEventListener("click", () => {
    if (linked) openSkillFigureLightbox(linked);
  });
  document.getElementById("studioOpenPack")?.addEventListener("click", () => {
    if (run.style_template_id) {
      closeModal();
      openSkillFigurePack(run.style_template_id);
    }
  });
  document.getElementById("studioUnlink")?.addEventListener("click", async () => {
    try {
      await API.put(`/experiments/${run.id}/style`, { style_template_id: "" });
      toast("已取消标记");
      closeModal();
      openExperimentFigureStudio({ ...run, style_template_id: "", style_preview: "", style_short_name: "" });
    } catch (e) {
      toast(e.message || "失败");
    }
  });
  document.getElementById("studioGoGallery")?.addEventListener("click", () => {
    closeModal();
    goToSkillGallery();
  });
  document.getElementById("figAddSchematic").onclick = async () => {
    const local_path = document.getElementById("fig_sch_path").value.trim();
    if (!local_path) return toast("请填写本地图片路径");
    try {
      await API.post(`/experiments/${run.id}/figures/schematic`, {
        local_path,
        short_name: document.getElementById("fig_sch_name").value.trim(),
        caption: document.getElementById("fig_sch_cap").value.trim(),
      });
      toast("示意图已加入");
      document.getElementById("fig_sch_path").value = "";
      await refreshGallery();
    } catch (e) {
      toast(e.message || "导入失败");
    }
  };
}

/* ---------------- Tasks ---------------- */
async function renderTasks(view) {
  await refreshProjects();
  setTopActions(`<button class="btn" id="newTask">新建任务</button>`);
  const tasks = await API.get("/tasks?view=all");
  const groups = { todo: [], doing: [], blocked: [], done: [] };
  tasks.forEach((t) => (groups[t.status] || groups.todo).push(t));
  view.innerHTML = `
    <div class="toolbar">
      <button class="btn ghost small" data-view="open">未完成</button>
      <button class="btn ghost small" data-view="today">今日</button>
      <button class="btn ghost small" data-view="overdue">逾期</button>
      <button class="btn ghost small" data-view="all">全部</button>
    </div>
    <div class="grid-4" id="board">
      ${["todo","doing","blocked","done"].map((st)=>`
        <div class="panel tight"><h3>${st}</h3>
          <div class="list">${(groups[st]||[]).map(taskCard).join("") || `<div class="empty">空</div>`}</div>
        </div>`).join("")}
    </div>`;
  document.getElementById("newTask").onclick = () => taskForm();
  view.querySelectorAll("[data-tid]").forEach((el) => {
    el.onclick = () => taskForm(tasks.find((t) => String(t.id) === el.dataset.tid));
  });
  view.querySelectorAll("[data-view]").forEach((btn) => {
    btn.onclick = async () => {
      const list = await API.get(`/tasks?view=${btn.dataset.view}`);
      document.getElementById("board").innerHTML = `<div class="panel" style="grid-column:1/-1"><div class="list">${list.map(taskCard).join("") || `<div class="empty">无任务</div>`}</div></div>`;
      document.querySelectorAll("[data-tid]").forEach((el) => {
        el.onclick = () => taskForm(list.find((t) => String(t.id) === el.dataset.tid));
      });
    };
  });
}

function taskCard(t) {
  return `<div class="list-item" data-tid="${t.id}"><div>
    <div class="title">${esc(t.title)}</div>
    <div class="meta">${esc(t.priority)} · ${fmtDate(t.due_date)}</div>
  </div><span class="badge ${t.status==='done'?'good':''}">${esc(t.status)}</span></div>`;
}

function taskForm(t) {
  const row = t || { title: "", description: "", status: "todo", priority: "medium", due_date: "", project_id: null, link_type: "", link_id: null, estimate_minutes: null };
  openModal(`
    <h3>${t?"编辑任务":"新建任务"}</h3>
    <div class="field"><label>标题</label><input id="t_title" value="${esc(row.title)}" /></div>
    <div class="field"><label>描述</label><textarea id="t_desc" rows="3">${esc(row.description||"")}</textarea></div>
    <div class="field-row">
      <div class="field"><label>状态</label>
        <select id="t_status"><option>todo</option><option>doing</option><option>blocked</option><option>done</option></select></div>
      <div class="field"><label>优先级</label>
        <select id="t_pri"><option>low</option><option>medium</option><option>high</option><option>urgent</option></select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>DDL</label><input type="date" id="t_due" value="${fmtDate(row.due_date).replace('—','')}" /></div>
      <div class="field"><label>项目</label><select id="t_proj">${projectOptions(row.project_id)}</select></div>
    </div>
    <button class="btn" id="saveTask">保存</button>
    ${t?`<button class="btn danger" id="delTask">删除</button>`:""}
  `);
  t_status.value = row.status; t_pri.value = row.priority;
  document.getElementById("saveTask").onclick = async () => {
    const body = {
      title: t_title.value, description: t_desc.value, status: t_status.value, priority: t_pri.value,
      due_date: t_due.value || null, project_id: t_proj.value ? Number(t_proj.value) : null,
      link_type: row.link_type || "", link_id: row.link_id || null, estimate_minutes: row.estimate_minutes || null,
    };
    if (t) await API.put(`/tasks/${t.id}`, body); else await API.post("/tasks", body);
    closeModal();
    navigate(state.route === "calendar" ? "calendar" : "tasks");
  };
  const d = document.getElementById("delTask");
  if (d) {
    d.onclick = async () => {
      await API.del(`/tasks/${t.id}`);
      closeModal();
      navigate(state.route === "calendar" ? "calendar" : "tasks");
    };
  }
}

/* ---------------- Calendar (Month Grid) ---------------- */
const CAL_TYPE_META = {
  deadline: { label: "DDL", short: "DDL", color: "#ff3b30" },
  meeting: { label: "会议", short: "会", color: "#007acc" },
  focus: { label: "专注", short: "专", color: "#af52de" },
  leave: { label: "请假", short: "假", color: "#c47b3c" },
  away: { label: "外出", short: "外", color: "#007acc" },
  rest: { label: "休息", short: "休", color: "#8e8e93" },
  thesis_milestone: { label: "论文", short: "论", color: "#ff9f0a" },
  custom: { label: "备注", short: "备", color: "#86868b" },
  task: { label: "任务", short: "任", color: "#5856d6" },
  advance: { label: "推进", short: "推", color: "#af52de" },
  reading: { label: "阅读", short: "阅", color: "#2f7d6d" },
  duty: { label: "在岗", short: "岗", color: "#34c759" },
};

function normalizePersonStatus(s) {
  const v = String(s || "").trim();
  if (!v || /^[?\s]+$/.test(v)) return "在岗";
  if (v === "休息") return "休息";
  if (v === "请假") return "请假";
  if (v === "外出" || v === "外出实验" || v === "会议日") return "外出";
  if (v === "在岗") return "在岗";
  return "在岗";
}

/** 周一至周五默认在岗，周六周日默认休息 */
function defaultDayStatus(dateStr) {
  const d = new Date(`${String(dateStr).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(d.getTime())) return "在岗";
  const wd = d.getDay(); // 0=日 … 6=六
  return wd === 0 || wd === 6 ? "休息" : "在岗";
}

function statusFromLeaveTitle(title) {
  const t = String(title || "").trim();
  if (t.startsWith("休息")) return "休息";
  if (t.startsWith("在岗")) return "在岗";
  if (t.startsWith("请假")) return "请假";
  if (t.startsWith("外出")) return "外出";
  return "外出";
}

function cleanCalendarTitle(title, eventType = "") {
  let t = String(title || "").trim();
  if (!t) return eventType === "leave" ? "外出" : "日程";
  if (/^\?+/.test(t)) {
    const rest = t.replace(/^\?+\s*[:：]?\s*/, "");
    const prefix = eventType === "leave" ? "外出" : "日程";
    return rest ? `${prefix}: ${rest}` : prefix;
  }
  return t;
}

function statusMeta(status) {
  const s = normalizePersonStatus(status || defaultDayStatus(dayKey(new Date())));
  if (s === "请假") return { key: "leave", ...CAL_TYPE_META.leave, cls: "is-leave", short: "假" };
  if (s === "外出") return { key: "away", ...CAL_TYPE_META.away, cls: "is-away", short: "外" };
  if (s === "休息") return { key: "rest", ...CAL_TYPE_META.rest, cls: "is-rest", short: "休" };
  return { key: "duty", ...CAL_TYPE_META.duty, cls: "is-duty", short: "岗" };
}

/** 有登记用登记；今天优先跟设置；否则周内在岗 / 周末休息 */
function resolveDayPersonStatus(dateStr, statusByDay = state._statusByDay) {
  const today = dayKey(new Date());
  const recorded = statusByDay?.[dateStr];
  if (recorded === "请假" || recorded === "外出" || recorded === "休息" || recorded === "在岗") {
    return recorded;
  }
  if (dateStr === today && state.settings?.personal_status) {
    return normalizePersonStatus(state.settings.personal_status);
  }
  return defaultDayStatus(dateStr);
}

async function setPersonStatusForDay(status, dateStr = dayKey(new Date())) {
  const today = dayKey(new Date());
  const st = normalizePersonStatus(status);
  const def = defaultDayStatus(dateStr);
  let leaves = state._calLeaves;
  if (!leaves) {
    try { leaves = await API.get("/leave"); } catch (_) { leaves = []; }
    state._calLeaves = leaves;
  }
  const hits = (leaves || []).filter((l) => eachDayInclusive(l.start_date, l.end_date).includes(dateStr));
  for (const l of hits) {
    if (String(l.start_date).slice(0, 10) === dateStr && String(l.end_date).slice(0, 10) === dateStr) {
      await API.del(`/leave/${l.id}`);
    }
  }
  // 与默认相同则只清覆盖记录；不同则写入当天状态（含周末改在岗 / 工作日改休息）
  if (st !== def) {
    await API.post("/leave", {
      start_date: dateStr,
      end_date: dateStr,
      reason: "",
      status_label: st,
    });
  }
  if (dateStr === today) {
    const s = await API.put("/settings", { personal_status: st });
    await applyChrome(s);
  }
  try { state._calLeaves = await API.get("/leave"); } catch (_) {}
  toast(`状态：${st}${st === def ? "（默认）" : ""}`);
  return st;
}

function dayKey(d) {
  const x = d instanceof Date ? d : new Date(String(d).includes("T") ? d : `${d}T00:00:00`);
  const y = x.getFullYear();
  const m = String(x.getMonth() + 1).padStart(2, "0");
  const day = String(x.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function monthStart(d = new Date()) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function eachDayInclusive(startStr, endStr) {
  const out = [];
  const a = new Date(`${String(startStr).slice(0, 10)}T00:00:00`);
  const b = new Date(`${String(endStr || startStr).slice(0, 10)}T00:00:00`);
  if (Number.isNaN(a.getTime())) return out;
  const end = Number.isNaN(b.getTime()) || b < a ? a : b;
  for (let d = new Date(a); d <= end; d.setDate(d.getDate() + 1)) {
    out.push(dayKey(d));
  }
  return out;
}

function buildStatusByDay(leaves, events) {
  /** @type {Record<string, string>} */
  const labels = {};
  (leaves || []).forEach((l) => {
    const st = normalizePersonStatus(l.status_label);
    eachDayInclusive(l.start_date, l.end_date).forEach((k) => {
      // 仅保留相对默认的覆盖（以及请假/外出）
      if (st !== defaultDayStatus(k)) labels[k] = st;
    });
  });
  (events || [])
    .filter((e) => e.event_type === "leave")
    .forEach((e) => {
      const title = cleanCalendarTitle(e.title, "leave");
      const st = normalizePersonStatus(statusFromLeaveTitle(title));
      const end = e.end_at || e.start_at;
      eachDayInclusive(e.start_at, end).forEach((k) => {
        if (!labels[k] && st !== defaultDayStatus(k)) labels[k] = st;
      });
    });
  return labels;
}

function buildDayItems(events, tasks, projects, experiments, activities = []) {
  const map = {};
  const push = (date, item) => {
    if (!date) return;
    if (!map[date]) map[date] = [];
    map[date].push(item);
  };
  (events || []).forEach((e) => {
    const type = e.event_type || "custom";
    const title = cleanCalendarTitle(e.title, type);
    const days =
      type === "leave" && e.end_at
        ? eachDayInclusive(e.start_at, e.end_at)
        : [dayKey(e.start_at)];
    // avoid duplicating leave chips on every day if also shown as status — keep one chip on start only for leave
    if (type === "leave") {
      const st = normalizePersonStatus(statusFromLeaveTitle(title));
      const chipType = st === "外出" ? "away" : st === "休息" ? "rest" : st === "在岗" ? "duty" : "leave";
      push(dayKey(e.start_at), {
        kind: "event",
        id: e.id,
        title,
        type: chipType,
        notes: e.notes || "",
        raw: e,
      });
      return;
    }
    days.forEach((k) => {
      push(k, {
        kind: "event",
        id: e.id,
        title,
        type,
        notes: e.notes || "",
        raw: e,
      });
    });
  });
  (tasks || [])
    .filter((t) => t.due_date && t.status !== "done")
    .forEach((t) => {
      push(String(t.due_date).slice(0, 10), {
        kind: "task",
        id: t.id,
        title: t.title,
        type: "task",
        notes: t.description || "",
        raw: t,
      });
    });

  // 项目被编辑/推进：按 updated_at 落在当天（仅进行中项目，避免 done 重复项刷屏）
  const seenProj = new Set();
  (projects || []).forEach((p) => {
    if (!p.updated_at) return;
    if (p.status === "done" || p.status === "paused") return;
    const k = dayKey(p.updated_at);
    const sig = `${k}:p:${p.id}`;
    if (seenProj.has(sig)) return;
    seenProj.add(sig);
    const created = p.created_at ? dayKey(p.created_at) : "";
    const label = created && created === k ? "新建" : "推进";
    push(k, {
      kind: "advance",
      id: p.id,
      title: `${label}·${p.title}`,
      type: "advance",
      notes: `阶段 ${p.stage || "—"} · 进度 ${p.progress ?? 0}%${p.next_step ? " · " + p.next_step : ""}`,
      raw: p,
    });
  });

  (experiments || []).forEach((r) => {
    if (!r.created_at) return;
    const k = dayKey(r.created_at);
    const proj = (projects || []).find((p) => p.id === r.project_id);
    push(k, {
      kind: "advance",
      id: `exp-${r.id}`,
      title: `实验·${r.title}`,
      type: "advance",
      notes: proj ? `项目：${proj.title}` : "实验 Run",
      raw: r,
    });
  });

  (activities || []).forEach((activity) => {
    if (activity.kind === "advance") {
      const existing = (map[activity.date] || []).find(
        (item) => item.kind === "advance" && String(item.id) === String(activity.id)
      );
      if (existing) {
        const project = (projects || []).find((p) => String(p.id) === String(activity.id));
        existing.title = `项目推进·${project?.title || activity.title.split("·").slice(1).join("·") || activity.title}`;
        existing.notes = [existing.notes, activity.notes].filter(Boolean).join(" · ");
        existing.raw = activity;
        return;
      }
    }
    push(activity.date, {
      kind: activity.kind || "advance",
      id: activity.id,
      title: activity.title,
      type: activity.kind === "reading" ? "reading" : "advance",
      notes: activity.notes || "",
      raw: activity,
    });
  });

  return map;
}

function buildMonthCells(monthDate) {
  // 列：周一 ... 周日
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();
  const first = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0).getDate();
  const firstWeekday = (first.getDay() + 6) % 7; // Mon = 0
  const cells = [];
  for (let i = 0; i < firstWeekday; i++) {
    cells.push({ date: new Date(year, month, 1 - (firstWeekday - i)), inMonth: false });
  }
  for (let day = 1; day <= lastDay; day++) {
    cells.push({ date: new Date(year, month, day), inMonth: true });
  }
  let next = 1;
  while (cells.length % 7 !== 0) {
    cells.push({ date: new Date(year, month + 1, next++), inMonth: false });
  }
  return cells;
}

async function renderCalendar(view) {
  await refreshProjects();
  if (!state.calendarMonth) state.calendarMonth = monthStart(new Date());
  const monthDate = state.calendarMonth;
  const y = monthDate.getFullYear();
  const m = monthDate.getMonth();
  const start = dayKey(new Date(y, m, 1));
  const end = dayKey(new Date(y, m + 1, 0));

  setTopActions(`
    <button class="btn secondary" id="calToday">回到本月</button>
    <button class="btn" id="newEvent">添加事项</button>
  `);

  const [events, tasks, leaves, experiments, activities, tips, conferences] = await Promise.all([
    API.get(`/calendar?start=${start}&end=${end}`),
    API.get("/tasks?view=open"),
    API.get("/leave").catch(() => []),
    API.get("/experiments").catch(() => []),
    API.get(`/calendar/activity?start=${start}&end=${end}`).catch(() => []),
    API.get("/ddl-tips?within_days=21").catch(() => []),
    API.get("/conferences").catch(() => []),
  ]);
  state._calEvents = events;
  state._calTasks = tasks;
  state._calLeaves = leaves || [];
  state._conferencesCache = conferences || [];
  const statusByDay = buildStatusByDay(leaves, events);
  state._statusByDay = statusByDay;
  const byDay = buildDayItems(events, tasks, state.projects, experiments || [], activities || []);
  const cells = buildMonthCells(monthDate);
  const todayKey = dayKey(new Date());
  const weekLabels = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];
  const legendKeys = ["duty", "rest", "leave", "away", "advance", "reading", "deadline", "meeting", "task"];

  view.innerHTML = `
    ${ddlTipsHtml(tips, { empty: "近三周暂无会议/投稿 DDL · 可在「投稿 → 会议库」填写截止日" })}
    <div class="month-cal">
      <div class="month-cal-toolbar">
        <div class="month-nav">
          <button class="btn secondary small" id="calPrev" aria-label="上一月">‹</button>
          <h2 class="month-cal-title">${y}年${m + 1}月</h2>
          <button class="btn secondary small" id="calNext" aria-label="下一月">›</button>
        </div>
        <div class="month-legend">
          ${legendKeys
            .map((k) => {
              const v = CAL_TYPE_META[k];
              return `<span class="month-legend-item"><i style="background:${v.color}"></i>${v.label}</span>`;
            })
            .join("")}
        </div>
      </div>
      <div class="month-grid">
        ${weekLabels.map((w) => `<div class="month-weekday">${w}</div>`).join("")}
        ${cells
          .map((cell) => {
            const key = dayKey(cell.date);
            const items = byDay[key] || [];
            const isToday = key === todayKey;
            const dayStatus = resolveDayPersonStatus(key, statusByDay);
            const sm = statusMeta(dayStatus);
            const statusCls = cell.inMonth ? sm.cls : "";
            // prefer advance + deadlines; cell body scrolls when crowded
            const ordered = [...items].sort((a, b) => {
              const rank = (t) => (t === "advance" ? 0 : t === "deadline" ? 1 : t === "leave" || t === "away" ? 2 : 3);
              return rank(a.type) - rank(b.type);
            });
            return `
              <div class="month-cell ${cell.inMonth ? "" : "is-out"} ${isToday ? "is-today" : ""} ${statusCls}" role="button" tabindex="0" data-day="${key}">
                <div class="month-cell-top">
                  <span class="month-daynum">${cell.date.getDate()}</span>
                  <span class="month-flag ${sm.key}" title="${esc(dayStatus)}">${sm.short}</span>
                </div>
                <div class="month-cell-events" data-cell-scroll="1">
                  ${ordered
                    .map((it) => {
                      const meta = CAL_TYPE_META[it.type] || CAL_TYPE_META.custom;
                      return `<div class="month-chip" style="--c:${meta.color}" title="${esc(it.title)}${it.notes ? " · " + esc(it.notes) : ""}">
                        <span class="month-chip-dot"></span>
                        <span class="month-chip-text">${esc(it.title)}</span>
                      </div>`;
                    })
                    .join("")}
                </div>
                ${ordered.length > 3 ? `<div class="month-more">${ordered.length} 条 · 可滚动</div>` : ""}
              </div>`;
          })
          .join("")}
      </div>
    </div>`;

  bindDdlTips(view, { conferences: conferences || [], submissions: [] });
  document.getElementById("calPrev").onclick = () => {
    state.calendarMonth = new Date(y, m - 1, 1);
    navigate("calendar");
  };
  document.getElementById("calNext").onclick = () => {
    state.calendarMonth = new Date(y, m + 1, 1);
    navigate("calendar");
  };
  document.getElementById("calToday").onclick = () => {
    state.calendarMonth = monthStart(new Date());
    navigate("calendar");
  };
  document.getElementById("newEvent").onclick = () => eventForm(null, todayKey);

  view.querySelectorAll(".month-cell").forEach((cell) => {
    const open = () => openDayDrawer(cell.dataset.day, byDay[cell.dataset.day] || []);
    cell.onclick = () => open();
    cell.onkeydown = (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        open();
      }
    };
  });
}

function openDayDrawer(dateStr, items) {
  const d = new Date(`${dateStr}T00:00:00`);
  const title = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日`;
  const statusLabel = resolveDayPersonStatus(dateStr, state._statusByDay);
  const sm = statusMeta(statusLabel);
  const def = defaultDayStatus(dateStr);
  const advances = items.filter((i) => i.type === "advance");
  openModal(`
    <div class="day-drawer">
      <h3>${title}</h3>
      <div class="day-status-bar ${sm.key}">
        <span>个人状态：<strong>${esc(statusLabel)}</strong><span class="meta"> · 默认${esc(def)}（工作日在岗 / 周末休息）</span></span>
        <div class="seg" id="dayStatusSeg">
          <button type="button" data-set-status="在岗" class="${statusLabel==="在岗"?"active":""}">在岗</button>
          <button type="button" data-set-status="休息" class="${statusLabel==="休息"?"active":""}">休息</button>
          <button type="button" data-set-status="请假" class="${statusLabel==="请假"?"active":""}">请假</button>
          <button type="button" data-set-status="外出" class="${statusLabel==="外出"?"active":""}">外出</button>
        </div>
      </div>
      ${
        advances.length
          ? `<div class="day-advance-box"><div class="meta" style="margin-bottom:6px">当日项目推进</div>
            ${advances
              .map(
                (a) =>
                  `<div class="day-advance-row"><strong>${esc(a.title)}</strong><div class="meta">${esc(a.notes || "")}</div></div>`
              )
              .join("")}</div>`
          : `<p class="muted" style="margin:0 0 12px">当日暂无项目编辑推进记录</p>`
      }
      <div class="month-day-scroll">
        <div class="month-day-list">
          ${
            items.length
              ? items
                  .map((it) => {
                    const meta = CAL_TYPE_META[it.type] || CAL_TYPE_META.custom;
                    return `<div class="month-day-item" data-kind="${it.kind}" data-id="${esc(String(it.id))}">
                      <span class="month-day-tag" style="background:${meta.color}">${meta.short}</span>
                      <div class="month-day-body">
                        <div class="month-day-title">${esc(it.title)}</div>
                        ${it.notes ? `<div class="meta">${esc(it.notes)}</div>` : ""}
                      </div>
                    </div>`;
                  })
                  .join("")
              : `<div class="empty">这一天还没有安排</div>`
          }
        </div>
      </div>
      <div class="toolbar day-drawer-actions">
        <button class="btn" id="dayAddDdl">加 DDL</button>
        <button class="btn secondary" id="dayAddMeet">加会议</button>
        <button class="btn secondary" id="dayAddNote">加备注</button>
        <button class="btn ghost" id="dayAddTask">加任务</button>
      </div>
    </div>
  `);

  document.querySelectorAll(".month-day-item").forEach((el) => {
    el.onclick = async () => {
      const kind = el.dataset.kind;
      const id = el.dataset.id;
      closeModal();
      if (kind === "advance") {
        if (String(id).startsWith("exp-")) {
          toast("实验推进记录，可在「实验」页查看");
          return;
        }
        const p = state.projects.find((x) => String(x.id) === String(id));
        if (p) projectForm(p);
        return;
      }
      if (kind === "reading") {
        state.selectedPaperId = Number(id);
        await navigate("papers");
        await openPaper(Number(id));
        return;
      }
      if (kind === "event") {
        const ev = state._calEvents.find((x) => String(x.id) === id);
        if (ev) eventForm(ev, dateStr);
      } else {
        const t = state._calTasks.find((x) => String(x.id) === id);
        if (t) taskForm(t);
      }
    };
  });

  document.getElementById("dayStatusSeg")?.querySelectorAll("[data-set-status]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      try {
        await setPersonStatusForDay(btn.dataset.setStatus, dateStr);
        closeModal();
        navigate("calendar");
      } catch (err) {
        toast(err.message || "状态更新失败");
      }
    };
  });

  const addEvent = (type, placeholder) => {
    closeModal();
    eventForm(
      {
        title: "",
        event_type: type,
        start_at: `${dateStr}T09:00:00`,
        end_at: null,
        all_day: true,
        notes: "",
        project_id: null,
        link_type: "",
        link_id: null,
        _placeholder: placeholder,
      },
      dateStr
    );
  };
  document.getElementById("dayAddDdl").onclick = () => addEvent("deadline", "例如：投稿截止");
  document.getElementById("dayAddMeet").onclick = () => addEvent("meeting", "例如：组会");
  document.getElementById("dayAddNote").onclick = () => addEvent("custom", "备注内容");
  document.getElementById("dayAddTask").onclick = () => {
    closeModal();
    taskForm({
      title: "",
      description: "",
      status: "todo",
      priority: "medium",
      due_date: dateStr,
      project_id: null,
      link_type: "",
      link_id: null,
    });
  };
}

function eventForm(e, presetDate) {
  const now = new Date();
  const fallback = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
  const preset = presetDate ? `${presetDate}T09:00` : "";
  const row = e || {
    title: "",
    event_type: "deadline",
    start_at: preset || fallback,
    end_at: null,
    all_day: true,
    notes: "",
    project_id: null,
    link_type: "",
    link_id: null,
  };
  let startVal = String(row.start_at).replace(" ", "T").slice(0, 16);
  if (startVal.length < 16 && presetDate) startVal = `${presetDate}T09:00`;
  openModal(`
    <h3>${e && e.id ? "编辑事项" : "添加事项"}</h3>
    <div class="field"><label>标题</label><input id="c_title" value="${esc(row.title)}" placeholder="${esc(row._placeholder || "事项标题")}" /></div>
    <div class="field-row">
      <div class="field"><label>类型 / 标志</label>
        <select id="c_type">
          <option value="deadline">DDL 截止</option>
          <option value="meeting">会议</option>
          <option value="thesis_milestone">论文节点</option>
          <option value="custom">备注</option>
          <option value="leave">请假</option>
          <option value="away">外出</option>
          <option value="focus">专注</option>
        </select>
      </div>
      <div class="field"><label>日期时间</label><input id="c_start" type="datetime-local" value="${startVal}" /></div>
    </div>
    <div class="field"><label>项目</label><select id="c_proj">${projectOptions(row.project_id)}</select></div>
    <div class="field"><label>备注</label><textarea id="c_notes" rows="3" placeholder="补充说明（可选）">${esc(row.notes || "")}</textarea></div>
    <div class="toolbar">
      <button class="btn" id="saveEv">保存</button>
      <button class="btn secondary" data-close="1">取消</button>
      ${e && e.id ? `<button class="btn danger" id="delEv">删除</button>` : ""}
    </div>
  `);
  c_type.value = row.event_type || "deadline";
  document.getElementById("saveEv").onclick = async () => {
    const type = c_type.value;
    const startLocal = c_start.value;
    const day = String(startLocal).slice(0, 10);
    if ((type === "leave" || type === "away") && !(e && e.id)) {
      await API.post("/leave", {
        start_date: day,
        end_date: day,
        reason: c_notes.value || c_title.value,
        status_label: type === "away" ? "外出" : "请假",
      });
      closeModal();
      navigate("calendar");
      return;
    }
    const body = {
      title: c_title.value,
      event_type: type === "away" ? "leave" : type,
      start_at: new Date(startLocal).toISOString(),
      end_at: row.end_at,
      all_day: true,
      notes: c_notes.value,
      project_id: c_proj.value ? Number(c_proj.value) : null,
      link_type: row.link_type || "",
      link_id: row.link_id,
    };
    if (e && e.id) await API.put(`/calendar/${e.id}`, body);
    else await API.post("/calendar", body);
    closeModal();
    navigate("calendar");
  };
  const d = document.getElementById("delEv");
  if (d) {
    d.onclick = async () => {
      await API.del(`/calendar/${e.id}`);
      closeModal();
      navigate("calendar");
    };
  }
}

/* ---------------- Outputs ---------------- */
function ddlTipsHtml(tips = [], opts = {}) {
  const list = tips || [];
  if (!list.length) {
    return `<div class="ddl-tips empty-soft">${opts.empty || "近三周暂无会议/投稿 DDL · 在会议库填写摘要/全文截止后会自动写入日程"}</div>`;
  }
  return `
    <div class="ddl-tips">
      <div class="ddl-tips-head">
        <strong>DDL 提示</strong>
        <span class="meta">同步自会议库 / 投稿 · 已写入日程</span>
        ${opts.showCal ? `<button type="button" class="btn ghost small" id="ddlGoCal">打开日程</button>` : ""}
      </div>
      <div class="ddl-tips-list">
        ${list.map((t) => {
          const urgent = t.days_left <= 3 ? "is-urgent" : t.days_left <= 7 ? "is-soon" : "";
          const left = t.days_left === 0 ? "今天截止" : `还有 ${t.days_left} 天`;
          const kind = t.kind === "conference" ? "会议" : "投稿";
          return `<button type="button" class="ddl-chip ${urgent}" data-ddl-kind="${esc(t.kind)}" data-ddl-id="${t.id}">
            <span class="ddl-chip-main">${esc(t.label)} · ${esc(t.detail || kind)}</span>
            <span class="ddl-chip-meta">${fmtDate(t.deadline)} · ${left}${t.rank ? " · " + esc(t.rank) : ""}</span>
          </button>`;
        }).join("")}
      </div>
    </div>`;
}

function bindDdlTips(root, { conferences = [], submissions = [] } = {}) {
  root?.querySelectorAll("[data-ddl-kind]").forEach((el) => {
    el.onclick = () => {
      const kind = el.dataset.ddlKind;
      const id = Number(el.dataset.ddlId);
      if (kind === "conference") {
        const c = (conferences.length ? conferences : state._conferencesCache || []).find((x) => x.id === id);
        if (c) conferenceForm(c);
        else navigate("outputs");
      } else {
        const s = (submissions || []).find((x) => x.id === id);
        if (s) {
          submissionForm(s, state._journalsCache || [], state._conferencesCache || conferences);
        } else {
          navigate("outputs");
        }
      }
    };
  });
  const go = document.getElementById("ddlGoCal");
  if (go) go.onclick = () => navigate("calendar");
}

/** Lower = higher prestige / sooner. Empty → large. */
function venueRankSortKey(raw) {
  const s = String(raw || "").trim().toUpperCase().replace(/\s+/g, "");
  if (!s) return 900;
  const ccf = s.match(/CCF[-–]?([ABC])/);
  if (ccf) return { A: 10, B: 20, C: 30 }[ccf[1]] || 40;
  if (/^A\*?$/.test(s) || s === "A*" || s.includes("A*")) return s.includes("*") ? 8 : 12;
  if (/^B\*?$/.test(s)) return 22;
  if (/^C\*?$/.test(s)) return 32;
  const q = s.match(/Q([1-4])/) || s.match(/([一二三四])区/);
  if (q) {
    const map = { 1: 10, 2: 20, 3: 30, 4: 40, 一: 10, 二: 20, 三: 30, 四: 40 };
    return map[q[1]] || 50;
  }
  if (s.includes("TOP") || s.includes("特")) return 5;
  return 500 + s.charCodeAt(0);
}

function dateSortKey(d, { missing = 9e15 } = {}) {
  if (!d) return missing;
  const t = Date.parse(String(d).slice(0, 10));
  return Number.isFinite(t) ? t : missing;
}

function impactSortKey(raw) {
  const n = parseFloat(String(raw || "").replace(/[^\d.]/g, ""));
  return Number.isFinite(n) ? -n : 0; // higher IF first → negative
}

function venueNameKey(row) {
  return String(row.short_name || row.name || "").trim().toLowerCase();
}

/** Row tint by 全文 DDL (fallback 摘要): past gray; future soft deep→light by urgency. */
function confDdlRowClass(c) {
  const raw = c?.paper_deadline || c?.abstract_deadline;
  if (!raw) return "conf-ddl-none";
  const t = Date.parse(String(raw).slice(0, 10) + "T12:00:00");
  if (!Number.isFinite(t)) return "conf-ddl-none";
  const days = (t - Date.now()) / 86400000;
  if (days < 0) return "conf-ddl-past";
  if (days <= 14) return "conf-ddl-soon";
  if (days <= 45) return "conf-ddl-near";
  if (days <= 120) return "conf-ddl-mid";
  return "conf-ddl-far";
}

function sortConferences(list, mode) {
  const arr = [...(list || [])];
  const m = mode || "paper_ddl";
  arr.sort((a, b) => {
    if (m === "rank") {
      const d = venueRankSortKey(a.rank) - venueRankSortKey(b.rank);
      if (d) return d;
    } else if (m === "name") {
      return venueNameKey(a).localeCompare(venueNameKey(b), "en", { sensitivity: "base" });
    } else {
      // paper_ddl: soonest first; no DDL last
      const d = dateSortKey(a.paper_deadline) - dateSortKey(b.paper_deadline);
      if (d) return d;
    }
    return venueNameKey(a).localeCompare(venueNameKey(b), "en", { sensitivity: "base" })
      || (a.id || 0) - (b.id || 0);
  });
  return arr;
}

function sortJournals(list, mode) {
  const arr = [...(list || [])];
  const m = mode || "tier";
  const tierOrd = { top: 0, trans: 1, regular: 2 };
  arr.sort((a, b) => {
    if (m === "name") {
      return String(a.name || "").localeCompare(String(b.name || ""), "en", { sensitivity: "base" });
    }
    if (m === "impact") {
      const d = impactSortKey(a.impact_factor) - impactSortKey(b.impact_factor);
      if (d) return d;
    } else if (m === "quartile") {
      const d = venueRankSortKey(a.quartile) - venueRankSortKey(b.quartile);
      if (d) return d;
    } else {
      // tier: 顶刊 → Trans → 普通
      const d = (tierOrd[a.tier] ?? 9) - (tierOrd[b.tier] ?? 9);
      if (d) return d;
    }
    return String(a.name || "").localeCompare(String(b.name || ""), "en", { sensitivity: "base" })
      || (a.id || 0) - (b.id || 0);
  });
  return arr;
}

function journalTierLabel(tier) {
  const t = String(tier || "regular").toLowerCase();
  if (t === "top") return "顶刊";
  if (t === "trans") return "Trans";
  return "普通";
}

function journalTierClass(tier) {
  const t = String(tier || "regular").toLowerCase();
  if (t === "top") return "jou-tier-top";
  if (t === "trans") return "jou-tier-trans";
  return "jou-tier-regular";
}

function journalTagsHtml(tags) {
  const parts = String(tags || "")
    .replaceAll("，", ",")
    .replaceAll("、", ",")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  if (!parts.length) return "";
  return parts
    .map((t) => {
      const cls = t === "最具" ? "jou-tag jou-tag-excel" : "jou-tag";
      return `<span class="${cls}">${esc(t)}</span>`;
    })
    .join("");
}

async function renderOutputs(view) {
  await refreshProjects();
  setTopActions(`
    <button class="btn" id="newSub">新建投稿</button>
    <button class="btn secondary" id="newPatent">新建专利</button>
  `);
  const [subs, patents, journals, conferences, tips] = await Promise.all([
    API.get("/submissions"), API.get("/patents"), API.get("/journals"), API.get("/conferences"),
    API.get("/ddl-tips?within_days=21").catch(() => []),
  ]);
  state._journalsCache = journals;
  state._conferencesCache = conferences;
  const confSort = state.confSortMode || "paper_ddl";
  const jouSort = state.journalSortMode || "tier";
  const confSorted = sortConferences(conferences, confSort);
  const jouSorted = sortJournals(journals, jouSort);
  const confQuery = String(state.confLibraryQuery || "").trim().toLowerCase();
  const journalQuery = String(state.journalLibraryQuery || "").trim().toLowerCase();
  const confVisible = confQuery
    ? confSorted.filter((c) => `${c.name || ""} ${c.short_name || ""} ${c.rank || ""} ${c.field || ""} ${c.location || ""}`.toLowerCase().includes(confQuery))
    : confSorted;
  const journalVisible = journalQuery
    ? jouSorted.filter((j) => `${j.name || ""} ${j.publisher || ""} ${j.quartile || ""} ${j.field || ""} ${j.tags || ""}`.toLowerCase().includes(journalQuery))
    : jouSorted;
  state.outputConferenceSelection = new Set(
    [...(state.outputConferenceSelection || [])].filter((id) => conferences.some((c) => Number(c.id) === Number(id)))
  );
  state.outputJournalSelection = new Set(
    [...(state.outputJournalSelection || [])].filter((id) => journals.some((j) => Number(j.id) === Number(id)))
  );
  view.innerHTML = `
    ${ddlTipsHtml(tips, { showCal: true })}
    <div class="grid-2">
      <div class="panel">
        <h2>投稿管理</h2>
        <div class="list">${subs.map((s)=>`<div class="list-item" data-sid="${s.id}">
          <div><div class="title">${esc(s.title)}</div>
          <div class="meta">${esc(s.status)} · DDL ${fmtDate(s.deadline)}</div></div>
          <span class="badge">${esc(s.target_type)}</span>
        </div>`).join("") || `<div class="empty">暂无投稿</div>`}</div>
      </div>
      <div class="panel">
        <h2>专利</h2>
        <div class="list">${patents.map((p)=>`<div class="list-item" data-pid="${p.id}">
          <div><div class="title">${esc(p.title)}</div><div class="meta">${esc(p.status)}</div></div>
        </div>`).join("") || `<div class="empty">暂无专利</div>`}</div>
      </div>
    </div>
    <div class="grid-2">
      <div class="panel">
        <div class="toolbar" style="gap:8px;align-items:center">
          <h2 style="margin:0;flex:1">会议库</h2>
          <button class="btn small secondary" id="addConf">添加</button>
        </div>
        <div class="toolbar output-library-tools">
          <input id="confLibrarySearch" value="${esc(state.confLibraryQuery || "")}" placeholder="筛选名称、领域" />
          <select id="confSort" title="排序方式" style="max-width:9.5rem">
            <option value="paper_ddl" ${confSort === "paper_ddl" ? "selected" : ""}>全文 DDL</option>
            <option value="rank" ${confSort === "rank" ? "selected" : ""}>会议等级</option>
            <option value="name" ${confSort === "name" ? "selected" : ""}>名称 A–Z</option>
          </select>
          <button class="btn ghost small" id="bulkEditConf" title="批量编辑所选会议" disabled>编辑</button>
          <button class="btn danger small" id="bulkDeleteConf" title="批量删除所选会议" disabled>删除</button>
        </div>
        <p class="muted" id="confBulkHint" style="margin:0 0 8px;font-size:0.75rem">筛选后可全选当前结果；填写 DDL 后自动同步到日程</p>
        <table class="table"><thead><tr><th style="width:34px"><input type="checkbox" id="selectAllConf" aria-label="全选当前会议" /></th><th>名称</th><th>级别</th><th>摘要 DDL</th><th>全文 DDL</th></tr></thead>
        <tbody>${confVisible.map((c)=>`<tr class="clickable-row ${confDdlRowClass(c)}" data-cid="${c.id}">
          <td><input type="checkbox" class="output-row-check" data-conf-check="${c.id}" ${state.outputConferenceSelection.has(Number(c.id)) ? "checked" : ""} aria-label="选择 ${esc(c.short_name || c.name)}" /></td>
          <td>${esc(c.short_name||c.name)}</td><td>${esc(c.rank)}</td>
          <td>${fmtDate(c.abstract_deadline)}</td><td>${fmtDate(c.paper_deadline)}</td>
        </tr>`).join("") || `<tr><td colspan="5" class="empty">${confQuery ? "没有匹配的会议" : "暂无会议"}</td></tr>`}</tbody></table>
      </div>
      <div class="panel">
        <div class="toolbar" style="gap:8px;align-items:center">
          <h2 style="margin:0;flex:1">期刊库</h2>
          <button class="btn ghost small" id="seedJournals" title="导入毕业神刊与 AI+CAD 推荐刊">推荐刊</button>
          <button class="btn small secondary" id="addJournal">添加</button>
        </div>
        <div class="toolbar output-library-tools">
          <input id="journalLibrarySearch" value="${esc(state.journalLibraryQuery || "")}" placeholder="筛选名称、领域" />
          <select id="journalSort" title="排序方式" style="max-width:9.5rem">
            <option value="tier" ${jouSort === "tier" ? "selected" : ""}>档次</option>
            <option value="quartile" ${jouSort === "quartile" ? "selected" : ""}>分区</option>
            <option value="impact" ${jouSort === "impact" ? "selected" : ""}>影响因子</option>
            <option value="name" ${jouSort === "name" ? "selected" : ""}>名称 A–Z</option>
          </select>
          <button class="btn ghost small" id="bulkEditJournal" title="批量编辑所选期刊" disabled>编辑</button>
          <button class="btn danger small" id="bulkDeleteJournal" title="批量删除所选期刊" disabled>删除</button>
        </div>
        <p class="muted" id="journalBulkHint" style="margin:0 0 8px;font-size:0.75rem">可按“医学”等领域筛选后全选并批量删除；点击行编辑单条</p>
        <table class="table"><thead><tr><th style="width:34px"><input type="checkbox" id="selectAllJournal" aria-label="全选当前期刊" /></th><th>名称</th><th>档次</th><th>分区</th><th>领域</th></tr></thead>
        <tbody>${journalVisible.map((j)=>`<tr class="clickable-row ${journalTierClass(j.tier)}" data-jid="${j.id}">
          <td><input type="checkbox" class="output-row-check" data-journal-check="${j.id}" ${state.outputJournalSelection.has(Number(j.id)) ? "checked" : ""} aria-label="选择 ${esc(j.name)}" /></td>
          <td><span class="jou-name-cell">${esc(j.name)}${journalTagsHtml(j.tags)}</span></td>
          <td><span class="jou-tier-badge ${journalTierClass(j.tier)}">${esc(journalTierLabel(j.tier))}</span></td>
          <td>${esc(j.quartile)}</td><td>${esc(j.field)}</td>
        </tr>`).join("") || `<tr><td colspan="5" class="empty">${journalQuery ? "没有匹配的期刊" : "暂无期刊"}</td></tr>`}</tbody></table>
      </div>
    </div>`;
  bindDdlTips(view, { conferences, submissions: subs });
  document.getElementById("newSub").onclick = () => submissionForm(null, journals, conferences);
  document.getElementById("newPatent").onclick = () => patentForm();
  view.querySelectorAll("[data-sid]").forEach((el) => {
    el.onclick = () => submissionForm(subs.find((s)=>String(s.id)===el.dataset.sid), journals, conferences);
  });
  view.querySelectorAll("[data-pid]").forEach((el) => {
    el.onclick = () => patentForm(patents.find((p)=>String(p.id)===el.dataset.pid));
  });
  document.getElementById("addConf").onclick = () => conferenceForm(null);
  document.getElementById("addJournal").onclick = () => journalForm(null);
  document.getElementById("seedJournals").onclick = async () => {
    try {
      const r = await API.post("/journals/seed-recommended", {});
      toast(`推荐刊已同步 · 新增 ${r.added || 0} · 更新 ${r.updated || 0}`);
      renderOutputs(view);
    } catch (e) {
      toast(e.message || "导入失败");
    }
  };
  document.getElementById("confSort").onchange = (e) => {
    state.confSortMode = e.target.value || "paper_ddl";
    renderOutputs(view);
  };
  document.getElementById("journalSort").onchange = (e) => {
    state.journalSortMode = e.target.value || "tier";
    renderOutputs(view);
  };
  document.getElementById("confLibrarySearch").onchange = (e) => {
    state.confLibraryQuery = e.target.value || "";
    renderOutputs(view);
  };
  document.getElementById("confLibrarySearch").onkeydown = (e) => {
    if (e.key === "Enter") e.target.blur();
  };
  document.getElementById("journalLibrarySearch").onchange = (e) => {
    state.journalLibraryQuery = e.target.value || "";
    renderOutputs(view);
  };
  document.getElementById("journalLibrarySearch").onkeydown = (e) => {
    if (e.key === "Enter") e.target.blur();
  };
  wireOutputLibraryBulk({ view, kind: "conference", visible: confVisible });
  wireOutputLibraryBulk({ view, kind: "journal", visible: journalVisible });
  view.querySelectorAll("[data-cid]").forEach((el) => {
    el.onclick = (event) => {
      if (event.target.closest("input[type=checkbox]")) return;
      conferenceForm(conferences.find((c) => String(c.id) === el.dataset.cid));
    };
  });
  view.querySelectorAll("[data-jid]").forEach((el) => {
    el.onclick = (event) => {
      if (event.target.closest("input[type=checkbox]")) return;
      journalForm(journals.find((j) => String(j.id) === el.dataset.jid));
    };
  });
}

function wireOutputLibraryBulk({ view, kind, visible }) {
  const conference = kind === "conference";
  const selection = conference ? state.outputConferenceSelection : state.outputJournalSelection;
  const checkAttr = conference ? "data-conf-check" : "data-journal-check";
  const selectAll = document.getElementById(conference ? "selectAllConf" : "selectAllJournal");
  const editBtn = document.getElementById(conference ? "bulkEditConf" : "bulkEditJournal");
  const deleteBtn = document.getElementById(conference ? "bulkDeleteConf" : "bulkDeleteJournal");
  const hint = document.getElementById(conference ? "confBulkHint" : "journalBulkHint");
  const update = () => {
    const visibleIds = visible.map((item) => Number(item.id));
    const selectedVisible = visibleIds.filter((id) => selection.has(id)).length;
    if (selectAll) {
      selectAll.checked = !!visibleIds.length && selectedVisible === visibleIds.length;
      selectAll.indeterminate = selectedVisible > 0 && selectedVisible < visibleIds.length;
    }
    editBtn.disabled = selection.size === 0;
    deleteBtn.disabled = selection.size === 0;
    if (hint && selection.size) hint.textContent = `已选择 ${selection.size} 项；全选只作用于当前筛选结果`;
  };
  view.querySelectorAll(`[${checkAttr}]`).forEach((checkbox) => {
    checkbox.onclick = (event) => event.stopPropagation();
    checkbox.onchange = () => {
      const id = Number(conference ? checkbox.dataset.confCheck : checkbox.dataset.journalCheck);
      if (checkbox.checked) selection.add(id);
      else selection.delete(id);
      update();
    };
  });
  if (selectAll) selectAll.onchange = () => {
    visible.forEach((item) => {
      if (selectAll.checked) selection.add(Number(item.id));
      else selection.delete(Number(item.id));
    });
    view.querySelectorAll(`[${checkAttr}]`).forEach((checkbox) => { checkbox.checked = selectAll.checked; });
    update();
  };
  editBtn.onclick = () => outputLibraryBulkForm(kind, [...selection]);
  deleteBtn.onclick = async () => {
    const label = conference ? "会议" : "期刊";
    if (!confirm(`确认删除选中的 ${selection.size} 个${label}？关联投稿会保留，但目标${label}将被清空。`)) return;
    await API.del(`/${conference ? "conferences" : "journals"}/bulk`, { ids: [...selection] });
    selection.clear();
    toast(`已批量删除${label}`);
    navigate("outputs");
  };
  update();
}

function outputLibraryBulkForm(kind, ids) {
  const conference = kind === "conference";
  openModal(`
    <h3>批量编辑${conference ? "会议" : "期刊"}</h3>
    <p class="muted">已选择 ${ids.length} 项。留空字段保持原值不变。</p>
    ${conference ? `
      <div class="field"><label>级别</label><input id="bulkOutRank" placeholder="例如 CCF-A；留空不修改" /></div>
      <div class="field"><label>领域</label><input id="bulkOutField" placeholder="例如 AI / 医学；留空不修改" /></div>
      <div class="field"><label>地点</label><input id="bulkOutLocation" placeholder="留空不修改" /></div>
    ` : `
      <div class="field"><label>档次</label><select id="bulkOutTier"><option value="">保持原值</option><option value="top">顶刊</option><option value="trans">Trans</option><option value="regular">普通</option></select></div>
      <div class="field"><label>分区</label><input id="bulkOutQuartile" placeholder="例如 Q1；留空不修改" /></div>
      <div class="field"><label>领域</label><input id="bulkOutField" placeholder="例如 AI / CAD；留空不修改" /></div>
      <div class="field"><label>标签</label><input id="bulkOutTags" placeholder="留空不修改；填写后覆盖所选期刊标签" /></div>
    `}
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn" id="saveOutputBulk">应用到 ${ids.length} 项</button>
    </div>`);
  document.getElementById("saveOutputBulk").onclick = async () => {
    const body = { ids };
    if (conference) {
      const rank = document.getElementById("bulkOutRank").value.trim();
      const field = document.getElementById("bulkOutField").value.trim();
      const location = document.getElementById("bulkOutLocation").value.trim();
      if (rank) body.rank = rank;
      if (field) body.field = field;
      if (location) body.location = location;
    } else {
      const tier = document.getElementById("bulkOutTier").value;
      const quartile = document.getElementById("bulkOutQuartile").value.trim();
      const field = document.getElementById("bulkOutField").value.trim();
      const tags = document.getElementById("bulkOutTags").value.trim();
      if (tier) body.tier = tier;
      if (quartile) body.quartile = quartile;
      if (field) body.field = field;
      if (tags) body.tags = tags;
    }
    if (Object.keys(body).length === 1) return toast("请至少填写一个要修改的字段");
    await API.put(`/${conference ? "conferences" : "journals"}/bulk`, body);
    closeModal();
    toast(`已更新 ${ids.length} 项`);
    navigate("outputs");
  };
}

function conferenceForm(c) {
  const row = c || {
    name: "", short_name: "", rank: "CCF-A", field: "AI", location: "", year: null,
    abstract_deadline: null, paper_deadline: null, notes: "",
  };
  openModal(`
    <h3>${c ? "编辑会议" : "添加会议"}</h3>
    <div class="field"><label>全称</label><input id="cf_name" value="${esc(row.name || "")}" /></div>
    <div class="field-row">
      <div class="field"><label>简称</label><input id="cf_short" value="${esc(row.short_name || "")}" placeholder="如 CVPR" /></div>
      <div class="field"><label>级别</label><input id="cf_rank" value="${esc(row.rank || "")}" placeholder="CCF-A / A*" /></div>
    </div>
    <div class="field-row">
      <div class="field"><label>领域</label><input id="cf_field" value="${esc(row.field || "AI")}" /></div>
      <div class="field"><label>年份</label><input id="cf_year" type="number" value="${esc(row.year || "")}" /></div>
    </div>
    <div class="field"><label>地点</label><input id="cf_loc" value="${esc(row.location || "")}" /></div>
    <div class="field-row">
      <div class="field"><label>摘要 DDL</label><input id="cf_abs" type="date" value="${fmtDate(row.abstract_deadline).replace("—","")}" /></div>
      <div class="field"><label>全文 DDL</label><input id="cf_paper" type="date" value="${fmtDate(row.paper_deadline).replace("—","")}" /></div>
    </div>
    <p class="muted" style="margin:0 0 10px;font-size:0.75rem">保存后会写入「日程」：截止当天标为 DDL，截止前 7 天标为「推进」提醒。</p>
    <div class="field"><label>备注</label><textarea id="cf_notes" rows="2">${esc(row.notes || "")}</textarea></div>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      ${c ? `<button class="btn danger" id="delConf">删除</button>` : ""}
      <button class="btn" id="saveConf">保存</button>
    </div>`);
  document.getElementById("saveConf").onclick = async () => {
    const name = cf_name.value.trim();
    if (!name) return toast("请填写会议全称");
    const body = {
      name,
      short_name: cf_short.value.trim() || name,
      rank: cf_rank.value.trim(),
      field: cf_field.value.trim() || "AI",
      location: cf_loc.value.trim(),
      year: cf_year.value ? Number(cf_year.value) : null,
      abstract_deadline: cf_abs.value || null,
      paper_deadline: cf_paper.value || null,
      notes: cf_notes.value,
    };
    if (c) await API.put(`/conferences/${c.id}`, body);
    else await API.post("/conferences", body);
    closeModal();
    toast(body.paper_deadline || body.abstract_deadline ? "已保存，DDL 已同步到日程" : "已保存");
    navigate("outputs");
  };
  const del = document.getElementById("delConf");
  if (del) {
    del.onclick = async () => {
      if (!confirm("确认删除该会议？")) return;
      await API.del(`/conferences/${c.id}`);
      closeModal();
      toast("已删除");
      navigate("outputs");
    };
  }
}

function journalForm(j) {
  const row = j || {
    name: "", publisher: "", quartile: "Q1", impact_factor: "", field: "AI", oa: false, notes: "", tier: "regular", tags: "",
  };
  const tier = (row.tier || "regular").toLowerCase();
  openModal(`
    <h3>${j ? "编辑期刊" : "添加期刊"}</h3>
    <div class="field"><label>期刊名</label><input id="jf_name" value="${esc(row.name || "")}" /></div>
    <div class="field-row">
      <div class="field"><label>档次</label>
        <select id="jf_tier">
          <option value="top" ${tier === "top" ? "selected" : ""}>顶刊</option>
          <option value="trans" ${tier === "trans" ? "selected" : ""}>Trans</option>
          <option value="regular" ${tier !== "top" && tier !== "trans" ? "selected" : ""}>普通</option>
        </select>
      </div>
      <div class="field"><label>分区</label><input id="jf_q" value="${esc(row.quartile || "")}" placeholder="Q1 / 一区" /></div>
    </div>
    <div class="field-row">
      <div class="field"><label>影响因子</label><input id="jf_if" value="${esc(row.impact_factor || "")}" /></div>
      <div class="field"><label>出版社</label><input id="jf_pub" value="${esc(row.publisher || "")}" /></div>
    </div>
    <div class="field-row">
      <div class="field"><label>领域</label><input id="jf_field" value="${esc(row.field || "AI")}" placeholder="AI / CAD / Graphics" /></div>
      <div class="field"><label>标签</label><input id="jf_tags" value="${esc(row.tags || "")}" placeholder="最具（逗号分隔）" /></div>
    </div>
    <label class="check-row" style="margin:0 0 10px">
      <input type="checkbox" id="jf_oa" ${row.oa ? "checked" : ""} /> Open Access
    </label>
    <div class="field"><label>备注</label><textarea id="jf_notes" rows="2">${esc(row.notes || "")}</textarea></div>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      ${j ? `<button class="btn danger" id="delJournal">删除</button>` : ""}
      <button class="btn" id="saveJournal">保存</button>
    </div>`);
  document.getElementById("saveJournal").onclick = async () => {
    const name = jf_name.value.trim();
    if (!name) return toast("请填写期刊名");
    const body = {
      name,
      publisher: jf_pub.value.trim(),
      quartile: jf_q.value.trim(),
      impact_factor: jf_if.value.trim(),
      field: jf_field.value.trim() || "AI",
      oa: !!document.getElementById("jf_oa").checked,
      notes: jf_notes.value,
      tier: document.getElementById("jf_tier").value || "regular",
      tags: document.getElementById("jf_tags").value.trim(),
    };
    if (j) await API.put(`/journals/${j.id}`, body);
    else await API.post("/journals", body);
    closeModal();
    toast("已保存");
    navigate("outputs");
  };
  const del = document.getElementById("delJournal");
  if (del) {
    del.onclick = async () => {
      if (!confirm("确认删除该期刊？")) return;
      await API.del(`/journals/${j.id}`);
      closeModal();
      toast("已删除");
      navigate("outputs");
    };
  }
}

function submissionForm(s, journals, conferences) {
  const row = s || { title: "", target_type: "conference", journal_id: null, conference_id: null, project_id: null, authors: "", status: "writing", manuscript_path: "", deadline: "", notes: "" };
  openModal(`
    <h3>${s?"编辑投稿":"新建投稿"}</h3>
    <div class="field"><label>标题</label><input id="s_title" value="${esc(row.title)}" /></div>
    <div class="field-row">
      <div class="field"><label>类型</label><select id="s_type"><option value="conference">会议</option><option value="journal">期刊</option></select></div>
      <div class="field"><label>状态</label>
        <select id="s_status"><option>writing</option><option>internal_review</option><option>submitted</option>
        <option>revision</option><option>accepted</option><option>rejected</option><option>published</option></select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>会议</label><select id="s_conf"><option value="">—</option>${conferences.map(c=>`<option value="${c.id}">${esc(c.short_name||c.name)}${c.paper_deadline ? " · " + fmtDate(c.paper_deadline) : ""}</option>`).join("")}</select></div>
      <div class="field"><label>期刊</label><select id="s_jou"><option value="">—</option>${journals.map(j=>`<option value="${j.id}">${esc(j.name)}</option>`).join("")}</select></div>
    </div>
    <div class="field-row">
      <div class="field"><label>DDL</label><input type="date" id="s_ddl" value="${fmtDate(row.deadline).replace('—','')}" />
        <div class="meta" id="s_ddl_hint" style="margin-top:4px"></div></div>
      <div class="field"><label>项目</label><select id="s_proj">${projectOptions(row.project_id)}</select></div>
    </div>
    <p class="muted" style="margin:0 0 10px;font-size:0.75rem">选择会议可自动填入全文 DDL；保存后同步到日程，截止前 7 天提醒。</p>
    <div class="field"><label>稿件路径</label><input id="s_path" value="${esc(row.manuscript_path||"")}" /></div>
    <div class="field"><label>备注</label><textarea id="s_notes" rows="2">${esc(row.notes||"")}</textarea></div>
    ${s?`<div class="field"><label>追加流转事件</label>
      <div class="toolbar"><select id="sev"><option>submitted</option><option>revision</option><option>accepted</option><option>rejected</option><option>published</option></select>
      <input id="sev_c" placeholder="说明/审稿意见摘要" style="flex:1;min-width:180px" />
      <button class="btn small secondary" id="addSev">记录</button></div></div>`:""}
    <button class="btn" id="saveSub">保存</button>
  `);
  s_type.value = row.target_type; s_status.value = row.status;
  if (row.conference_id) s_conf.value = row.conference_id;
  if (row.journal_id) s_jou.value = row.journal_id;
  const fillDdlFromConf = () => {
    const conf = conferences.find((c) => String(c.id) === String(s_conf.value));
    const hint = document.getElementById("s_ddl_hint");
    if (!conf) {
      if (hint) hint.textContent = "";
      return;
    }
    const d = conf.paper_deadline || conf.abstract_deadline;
    if (d && !s_ddl.value) {
      s_ddl.value = String(d).slice(0, 10);
    }
    if (hint) {
      hint.textContent = conf.paper_deadline
        ? `会议全文 DDL：${fmtDate(conf.paper_deadline)}${conf.abstract_deadline ? " · 摘要 " + fmtDate(conf.abstract_deadline) : ""}`
        : (conf.abstract_deadline ? `会议摘要 DDL：${fmtDate(conf.abstract_deadline)}` : "该会议尚未填写 DDL");
    }
    if (s_type.value === "journal") s_type.value = "conference";
  };
  s_conf.onchange = fillDdlFromConf;
  fillDdlFromConf();
  document.getElementById("saveSub").onclick = async () => {
    const body = {
      title: s_title.value, target_type: s_type.value, status: s_status.value,
      conference_id: s_conf.value ? Number(s_conf.value) : null,
      journal_id: s_jou.value ? Number(s_jou.value) : null,
      project_id: s_proj.value ? Number(s_proj.value) : null,
      authors: row.authors || "", manuscript_path: s_path.value,
      deadline: s_ddl.value || null, notes: s_notes.value,
    };
    if (s) await API.put(`/submissions/${s.id}`, body); else await API.post("/submissions", body);
    closeModal();
    toast(body.deadline ? "已保存，DDL 已同步到日程" : "已保存");
    navigate("outputs");
  };
  const add = document.getElementById("addSev");
  if (add) add.onclick = async () => {
    await API.post(`/submissions/${s.id}/events`, { event_type: sev.value, content: sev_c.value });
    toast("事件已记录");
  };
}

function patentForm(p) {
  const row = p || { title: "", status: "idea", inventors: "", application_no: "", project_id: null, deadline: "", notes: "", file_path: "" };
  openModal(`
    <h3>${p?"编辑专利":"新建专利"}</h3>
    <div class="field"><label>标题</label><input id="pt_title" value="${esc(row.title)}" /></div>
    <div class="field-row">
      <div class="field"><label>状态</label>
        <select id="pt_status"><option>idea</option><option>disclosure</option><option>filed</option>
        <option>published</option><option>granted</option><option>rejected</option></select></div>
      <div class="field"><label>项目</label><select id="pt_proj">${projectOptions(row.project_id)}</select></div>
    </div>
    <div class="field"><label>备注</label><textarea id="pt_notes" rows="3">${esc(row.notes||"")}</textarea></div>
    <button class="btn" id="savePt">保存</button>
  `);
  pt_status.value = row.status;
  document.getElementById("savePt").onclick = async () => {
    const body = {
      title: pt_title.value, status: pt_status.value, inventors: row.inventors || "",
      application_no: row.application_no || "", project_id: pt_proj.value ? Number(pt_proj.value) : null,
      deadline: row.deadline || null, notes: pt_notes.value, file_path: row.file_path || "",
    };
    if (p) await API.put(`/patents/${p.id}`, body); else await API.post("/patents", body);
    closeModal(); navigate("outputs");
  };
}

/* ---------------- Meetings ---------------- */
async function renderMeetings(view) {
  await refreshProjects();
  setTopActions(`<button class="btn" id="newMeeting">新建会议</button>`);
  const meetings = await API.get("/meetings");
  view.innerHTML = `<div class="panel"><div class="list">
    ${meetings.map((m)=>`<div class="list-item" data-mid="${m.id}">
      <div><div class="title">${esc(m.title || "未命名会议")}</div>
      <div class="meta">${esc(m.meeting_type)} · ${fmtDT(m.start_at)} · 待办 ${(m.action_items||[]).length}</div></div>
      <div class="toolbar" style="margin:0;gap:6px">
        <button class="btn ghost small" data-totask="${m.id}">转任务</button>
        <button class="btn danger small" data-del-meet="${m.id}">删除</button>
      </div>
    </div>`).join("") || `<div class="empty">暂无会议记录</div>`}
  </div></div>`;
  document.getElementById("newMeeting").onclick = () => meetingForm();
  view.querySelectorAll("[data-mid]").forEach((el) => {
    el.onclick = (e) => {
      if (e.target.closest("[data-totask],[data-del-meet]")) return;
      meetingForm(meetings.find((m)=>String(m.id)===el.dataset.mid));
    };
  });
  view.querySelectorAll("[data-totask]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      const r = await API.post(`/meetings/${btn.dataset.totask}/to-tasks`);
      toast(`已创建 ${r.created_task_ids.length} 个任务`);
    };
  });
  view.querySelectorAll("[data-del-meet]").forEach((btn) => {
    btn.onclick = async (e) => {
      e.stopPropagation();
      if (!confirm("确认删除该会议？关联日历事项也会移除。")) return;
      await API.del(`/meetings/${btn.dataset.delMeet}`);
      toast("已删除");
      navigate("meetings");
    };
  });
}

function meetingForm(m) {
  const row = m || { title: "", meeting_type: "group", start_at: new Date().toISOString(), end_at: null, project_id: null, agenda: "", notes: "", decisions: "", attachment_path: "", action_items: [] };
  const actionsText = (row.action_items || []).map((a) => a.content).join("\n");
  openModal(`
    <h3>${m?"编辑会议":"新建会议"}</h3>
    <div class="field"><label>标题</label><input id="m_title" value="${esc(row.title)}" /></div>
    <div class="field-row">
      <div class="field"><label>类型</label>
        <select id="m_type"><option>group</option><option>advisor</option><option>collab</option><option>talk</option><option>defense</option></select></div>
      <div class="field"><label>时间</label><input type="datetime-local" id="m_start" value="${String(row.start_at).slice(0,16)}" /></div>
    </div>
    <div class="field"><label>项目</label><select id="m_proj">${projectOptions(row.project_id)}</select></div>
    <div class="field"><label>议程</label><textarea id="m_agenda" rows="2">${esc(row.agenda||"")}</textarea></div>
    <div class="field"><label>纪要</label><textarea id="m_notes" rows="3">${esc(row.notes||"")}</textarea></div>
    <div class="field"><label>决策</label><textarea id="m_dec" rows="2">${esc(row.decisions||"")}</textarea></div>
    <div class="field"><label>待办（每行一条）</label><textarea id="m_actions" rows="3">${esc(actionsText)}</textarea></div>
    <div class="toolbar" style="justify-content:flex-end;margin-top:8px">
      <button class="btn secondary" data-close="1">取消</button>
      ${m ? `<button class="btn danger" id="delMeet">删除</button>` : ""}
      <button class="btn" id="saveMeet">保存</button>
    </div>
  `);
  document.getElementById("m_type").value = row.meeting_type;
  document.getElementById("saveMeet").onclick = async () => {
    const action_items = m_actions.value.split("\n").map((s)=>s.trim()).filter(Boolean).map((content)=>({content, done:false}));
    const body = {
      title: m_title.value, meeting_type: m_type.value,
      start_at: new Date(m_start.value).toISOString(), end_at: null,
      project_id: m_proj.value ? Number(m_proj.value) : null,
      agenda: m_agenda.value, notes: m_notes.value, decisions: m_dec.value,
      attachment_path: row.attachment_path || "", action_items,
    };
    if (m) await API.put(`/meetings/${m.id}`, body); else await API.post("/meetings", body);
    closeModal(); navigate("meetings");
  };
  const del = document.getElementById("delMeet");
  if (del) {
    del.onclick = async () => {
      if (!confirm("确认删除该会议？关联日历事项也会移除。")) return;
      await API.del(`/meetings/${m.id}`);
      closeModal();
      toast("已删除");
      navigate("meetings");
    };
  }
}

/* ---------------- Thesis ---------------- */
const CHAPTER_STATUS = [
  { value: "todo", label: "待写" },
  { value: "draft", label: "初稿" },
  { value: "revising", label: "修改中" },
  { value: "done", label: "完成" },
];

function chapterStatusLabel(status) {
  return CHAPTER_STATUS.find((s) => s.value === status)?.label || status || "待写";
}

function chapterStatusClass(status) {
  if (status === "done") return "good";
  if (status === "revising") return "warn";
  if (status === "draft") return "";
  return "";
}

function buildChapterTree(chapters) {
  const byParent = new Map();
  chapters.forEach((c) => {
    const key = c.parent_id == null ? "root" : String(c.parent_id);
    if (!byParent.has(key)) byParent.set(key, []);
    byParent.get(key).push(c);
  });
  byParent.forEach((arr) => arr.sort((a, b) => (a.order_index - b.order_index) || (a.id - b.id)));
  const flat = [];
  const walk = (parentKey, depth) => {
    (byParent.get(parentKey) || []).forEach((c, idx, arr) => {
      flat.push({
        node: c,
        depth,
        indexAmongSiblings: idx,
        siblingCount: arr.length,
        siblingIds: arr.map((x) => x.id),
      });
      walk(String(c.id), depth + 1);
    });
  };
  walk("root", 0);
  // orphan nodes (broken parent) append at end
  const seen = new Set(flat.map((x) => x.node.id));
  chapters.filter((c) => !seen.has(c.id)).forEach((c) => {
    flat.push({ node: c, depth: 0, indexAmongSiblings: 0, siblingCount: 1, siblingIds: [c.id] });
  });
  return flat;
}

function chapterDescendantIds(chapters, rootId) {
  const children = new Map();
  chapters.forEach((c) => {
    const key = c.parent_id == null ? null : c.parent_id;
    if (!children.has(key)) children.set(key, []);
    children.get(key).push(c.id);
  });
  const out = new Set();
  const stack = [...(children.get(rootId) || [])];
  while (stack.length) {
    const id = stack.pop();
    if (out.has(id)) continue;
    out.add(id);
    (children.get(id) || []).forEach((cid) => stack.push(cid));
  }
  return out;
}

function nextChapterOrder(chapters, parentId) {
  const siblings = chapters.filter((c) => (c.parent_id ?? null) === (parentId ?? null));
  if (!siblings.length) return 0;
  return Math.max(...siblings.map((c) => c.order_index || 0)) + 1;
}

function openChapterModal(chapters, chapter = null, opts = {}) {
  const editing = !!(chapter && chapter.id);
  const defaultParent = opts.parentId ?? chapter?.parent_id ?? null;
  const blocked = editing ? chapterDescendantIds(chapters, chapter.id) : new Set();
  if (editing) blocked.add(chapter.id);
  const parentOptions = chapters
    .filter((c) => !blocked.has(c.id))
    .map((c) => {
      const sel = (defaultParent ?? null) === c.id ? "selected" : "";
      return `<option value="${c.id}" ${sel}>${esc(c.title)}</option>`;
    })
    .join("");
  openModal(`
    <h3>${editing ? "编辑章节" : "添加章节"}</h3>
    <div class="field"><label>标题</label>
      <input id="ch_title" value="${esc(chapter?.title || "")}" placeholder="例如：第3章 方法" /></div>
    <div class="field"><label>父章节</label>
      <select id="ch_parent">
        <option value="" ${defaultParent == null ? "selected" : ""}>（顶层）</option>
        ${parentOptions}
      </select>
    </div>
    <div class="field"><label>状态</label>
      <select id="ch_status">
        ${CHAPTER_STATUS.map((s) => `<option value="${s.value}" ${(chapter?.status || "todo") === s.value ? "selected" : ""}>${s.label}</option>`).join("")}
      </select>
    </div>
    <div class="field"><label>字数目标</label>
      <input id="ch_words" type="number" min="0" step="100" value="${chapter?.word_target ?? ""}" placeholder="可选" /></div>
    <div class="field"><label>摘要</label>
      <textarea id="ch_summary" rows="3" placeholder="本章要点">${esc(chapter?.summary || "")}</textarea></div>
    <div class="field"><label>问题清单</label>
      <textarea id="ch_issues" rows="3" placeholder="待解决的问题">${esc(chapter?.issues || "")}</textarea></div>
    <div class="toolbar" style="justify-content:flex-end">
      <button class="btn secondary" data-close="1">取消</button>
      ${editing ? `<button class="btn danger" id="ch_del">删除</button>` : ""}
      <button class="btn" id="ch_save">${editing ? "保存" : "创建"}</button>
    </div>`);
  document.getElementById("ch_save").onclick = async () => {
    const title = (ch_title.value || "").trim();
    if (!title) return toast("请填写章节标题");
    const parentRaw = ch_parent.value;
    const parent_id = parentRaw === "" ? null : Number(parentRaw);
    const wordRaw = (ch_words.value || "").trim();
    const word_target = wordRaw === "" ? null : Number(wordRaw);
    const payload = {
      title,
      parent_id,
      order_index: editing
        ? ((chapter.parent_id ?? null) === parent_id ? chapter.order_index : nextChapterOrder(chapters, parent_id))
        : nextChapterOrder(chapters, parent_id),
      status: ch_status.value || "todo",
      summary: ch_summary.value || "",
      issues: ch_issues.value || "",
      related_paper_ids: chapter?.related_paper_ids || "",
      related_experiment_ids: chapter?.related_experiment_ids || "",
      word_target: Number.isFinite(word_target) ? word_target : null,
    };
    if (editing) await API.put(`/thesis/chapters/${chapter.id}`, payload);
    else await API.post("/thesis/chapters", payload);
    closeModal();
    toast(editing ? "章节已保存" : "章节已添加");
    navigate("thesis");
  };
  const del = document.getElementById("ch_del");
  if (del) {
    del.onclick = async () => {
      const kids = chapterDescendantIds(chapters, chapter.id).size;
      const tip = kids
        ? `删除「${chapter.title}」及其 ${kids} 个子章节？`
        : `删除章节「${chapter.title}」？`;
      if (!confirm(tip)) return;
      await API.del(`/thesis/chapters/${chapter.id}`);
      closeModal();
      toast("章节已删除");
      navigate("thesis");
    };
  }
}

function chapterPayload(c, patch = {}) {
  return {
    title: c.title,
    parent_id: c.parent_id ?? null,
    order_index: c.order_index ?? 0,
    status: c.status || "todo",
    summary: c.summary || "",
    issues: c.issues || "",
    related_paper_ids: c.related_paper_ids || "",
    related_experiment_ids: c.related_experiment_ids || "",
    word_target: c.word_target ?? null,
    ...patch,
  };
}

async function swapChapterOrder(chapters, idA, idB) {
  const a = chapters.find((c) => c.id === idA);
  const b = chapters.find((c) => c.id === idB);
  if (!a || !b) return;
  await API.put(`/thesis/chapters/${a.id}`, chapterPayload(a, { order_index: b.order_index }));
  await API.put(`/thesis/chapters/${b.id}`, chapterPayload(b, { order_index: a.order_index }));
}

async function openMilestoneModal(milestone) {
  let m = milestone;
  try {
    m = await API.get(`/thesis/milestones/${milestone.id}`);
  } catch (_) { /* use list snapshot */ }
  const statusOpts = [
    ["pending", "未开始"],
    ["preparing", "准备中"],
    ["done", "已完成"],
    ["postponed", "延期"],
  ];
  const fmtSize = (n) => {
    const x = Number(n) || 0;
    if (x < 1024) return `${x} B`;
    if (x < 1024 * 1024) return `${(x / 1024).toFixed(1)} KB`;
    return `${(x / (1024 * 1024)).toFixed(1)} MB`;
  };
  const renderAttList = (atts) => {
    if (!(atts || []).length) return `<div class="empty" style="padding:8px 0">暂无附件 · 可拖入多个文件</div>`;
    return `<div class="list ms-attach-list">${atts.map((a) => `
      <div class="list-item" data-aid="${a.id}">
        <div style="flex:1;min-width:0">
          <div class="title">${esc(a.filename)}</div>
          <div class="meta">${fmtSize(a.size)} · ${a.created_at ? fmtDT(a.created_at) : ""}</div>
        </div>
        <a class="btn ghost small" href="/api/thesis/milestones/${m.id}/attachments/${a.id}/file" download="${esc(a.filename)}">下载</a>
        <button type="button" class="btn danger small" data-del-att="${a.id}">删除</button>
      </div>`).join("")}</div>`;
  };

  openModal(`
    <h3>节点 · ${esc(m.title)}</h3>
    <p class="muted" style="margin:0 0 10px;font-size:0.78rem">开题 / 中期考核 / 预答辩 / 答辩各自独立记录信息与附件。</p>
    <div class="field"><label>名称</label><input id="ms_title" value="${esc(m.title)}" /></div>
    <div class="field-row">
      <div class="field"><label>日期</label><input id="ms_due" type="date" value="${esc((m.due_date || "").toString().slice(0, 10))}" /></div>
      <div class="field"><label>状态</label>
        <select id="ms_status">${statusOpts.map(([v, lab]) =>
          `<option value="${v}" ${m.status === v ? "selected" : ""}>${lab}</option>`).join("")}</select>
      </div>
    </div>
    <div class="field"><label>地点 / 形式</label><input id="ms_loc" value="${esc(m.location || "")}" placeholder="如：学院会议室 / 腾讯会议" /></div>
    <div class="field"><label>节点信息</label><textarea id="ms_notes" rows="4" placeholder="材料清单、评委、准备事项、注意事项…">${esc(m.notes || "")}</textarea></div>
    <div class="field"><label>结果 / 反馈</label><textarea id="ms_outcome" rows="3" placeholder="结论、修改意见、后续动作…">${esc(m.outcome || "")}</textarea></div>
    <h4 style="margin:14px 0 8px">附件 <span class="meta" id="msAttCount">${(m.attachments || []).length}</span></h4>
    <div class="ms-dropzone" id="msDropzone" tabindex="0">
      <div class="ms-dropzone-title">拖入文件到此处，或点击选择</div>
      <div class="meta">支持多文件 · 单文件 ≤ 40MB · 存入本地数据库</div>
      <input type="file" id="msFileInput" multiple hidden />
    </div>
    <div id="msAttHost">${renderAttList(m.attachments || [])}</div>
    <div class="toolbar" style="justify-content:flex-end;gap:8px;margin-top:14px;flex-wrap:wrap">
      <button class="btn secondary" data-close="1">取消</button>
      <button class="btn danger" id="delMs" title="删除此节点">删除节点</button>
      <button class="btn" id="saveMs">保存</button>
    </div>
  `, { wide: true });

  const refreshAtt = async () => {
    const fresh = await API.get(`/thesis/milestones/${m.id}`);
    m = fresh;
    document.getElementById("msAttHost").innerHTML = renderAttList(fresh.attachments || []);
    document.getElementById("msAttCount").textContent = String((fresh.attachments || []).length);
    wireAttActions();
  };

  const wireAttActions = () => {
    document.querySelectorAll("[data-del-att]").forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm("删除该附件？")) return;
        try {
          await API.del(`/thesis/milestones/${m.id}/attachments/${btn.dataset.delAtt}`);
          toast("附件已删除");
          await refreshAtt();
        } catch (e) {
          toast(e.message || "删除失败");
        }
      };
    });
  };
  wireAttActions();

  const uploadFiles = async (fileList) => {
    const files = [...(fileList || [])];
    if (!files.length) return;
    const fd = new FormData();
    files.forEach((f) => fd.append("files", f));
    try {
      await API.post(`/thesis/milestones/${m.id}/attachments`, fd);
      toast(`已上传 ${files.length} 个附件`);
      await refreshAtt();
    } catch (e) {
      toast(e.message || "上传失败");
    }
  };

  const zone = document.getElementById("msDropzone");
  const fileInput = document.getElementById("msFileInput");
  zone.onclick = () => fileInput.click();
  fileInput.onchange = () => uploadFiles(fileInput.files);
  zone.ondragover = (e) => { e.preventDefault(); zone.classList.add("drop-hover"); };
  zone.ondragleave = () => zone.classList.remove("drop-hover");
  zone.ondrop = (e) => {
    e.preventDefault();
    zone.classList.remove("drop-hover");
    uploadFiles(e.dataTransfer?.files);
  };

  document.getElementById("saveMs").onclick = async () => {
    try {
      await API.put(`/thesis/milestones/${m.id}`, {
        title: ms_title.value.trim() || m.title,
        due_date: ms_due.value || null,
        status: ms_status.value,
        notes: ms_notes.value,
        location: ms_loc.value,
        outcome: ms_outcome.value,
      });
      closeModal();
      toast("节点已保存");
      navigate("thesis");
    } catch (e) {
      toast(e.message || "保存失败");
    }
  };
  document.getElementById("delMs").onclick = async () => {
    if (!confirm(`删除节点「${m.title}」及其全部附件？`)) return;
    try {
      await API.del(`/thesis/milestones/${m.id}`);
      closeModal();
      toast("节点已删除");
      navigate("thesis");
    } catch (e) {
      toast(e.message || "删除失败");
    }
  };
}

function milestoneStatusLabel(s) {
  return ({ pending: "未开始", preparing: "准备中", done: "已完成", postponed: "延期" })[s] || s || "未开始";
}

async function renderThesis(view) {
  setTopActions("");
  const [meta, chapters, milestones] = await Promise.all([
    API.get("/thesis"), API.get("/thesis/chapters"), API.get("/thesis/milestones"),
  ]);
  let checklist = [];
  try { checklist = JSON.parse(meta.checklist_json || "[]"); } catch (_) {}
  const tree = buildChapterTree(chapters);
  view.innerHTML = `
    <div class="grid-2">
      <div class="panel">
        <h2>论文信息</h2>
        <div class="field"><label>标题</label><input id="th_title" value="${esc(meta.title)}" /></div>
        <div class="field"><label>副标题</label><input id="th_sub" value="${esc(meta.subtitle)}" /></div>
        <div class="field"><label>研究问题</label><textarea id="th_rq" rows="2">${esc(meta.research_question)}</textarea></div>
        <div class="field"><label>贡献</label><textarea id="th_c" rows="2">${esc(meta.contribution)}</textarea></div>
        <button class="btn" id="saveThesis">保存</button>
        <h3 style="margin-top:16px">规范 Checklist</h3>
        <div id="thChecks">${checklist.map((c,i)=>`<div class="check-row">
          <input type="checkbox" data-i="${i}" ${c.done?"checked":""}/><span>${esc(c.item)}</span></div>`).join("")}</div>
      </div>
      <div class="panel">
        <h2>关键节点</h2>
        <p class="muted" style="margin:0 0 10px;font-size:0.78rem">开题、中期考核、预答辩、答辩：点条目编辑信息与附件。</p>
        <div class="list">${milestones.map((m)=>`<div class="list-item clickable" data-ms="${m.id}" title="编辑节点">
          <div style="flex:1;min-width:0">
            <div class="title">${esc(m.title)}${(m.attachments || []).length ? ` <span class="badge">${m.attachments.length} 附件</span>` : ""}</div>
            <div class="meta">${fmtDate(m.due_date)} · ${esc(milestoneStatusLabel(m.status))}${m.location ? " · " + esc(m.location) : ""}</div>
            ${m.notes ? `<div class="meta">${esc(m.notes).slice(0, 80)}${m.notes.length > 80 ? "…" : ""}</div>` : ""}
          </div>
          <button type="button" class="btn ghost small" data-ms-edit="${m.id}">编辑</button>
        </div>`).join("") || `<div class="empty">暂无节点</div>`}</div>
        <button class="btn secondary small" id="addMs" style="margin-top:8px">添加节点</button>
      </div>
    </div>
    <div class="panel">
      <div class="toolbar">
        <h2 style="margin:0;flex:1">章节树</h2>
        <button class="btn small" id="addCh">添加章节</button>
      </div>
      <div class="chapter-tree" id="chapterTree">
        ${tree.length ? tree.map(({ node: c, depth, indexAmongSiblings, siblingCount, siblingIds }) => `
          <div class="chapter-row" data-id="${c.id}" style="--depth:${depth}">
            <div class="chapter-main">
              <span class="chapter-branch" aria-hidden="true"></span>
              <div class="chapter-body">
                <div class="chapter-title-row">
                  <span class="chapter-title">${esc(c.title)}</span>
                  <span class="badge ${chapterStatusClass(c.status)}">${esc(chapterStatusLabel(c.status))}</span>
                  ${c.word_target ? `<span class="meta">目标 ${c.word_target} 字</span>` : ""}
                </div>
                ${c.summary ? `<div class="meta chapter-summary">${esc(c.summary)}</div>` : ""}
                ${c.issues ? `<div class="meta chapter-issues">问题：${esc(c.issues)}</div>` : ""}
              </div>
            </div>
            <div class="chapter-actions">
              <button class="btn ghost small" data-ch-up="${c.id}" ${indexAmongSiblings === 0 ? "disabled" : ""} title="上移">↑</button>
              <button class="btn ghost small" data-ch-down="${c.id}" ${indexAmongSiblings >= siblingCount - 1 ? "disabled" : ""} title="下移">↓</button>
              <button class="btn ghost small" data-ch-child="${c.id}">子节</button>
              <button class="btn ghost small" data-ch-edit="${c.id}">编辑</button>
              <button class="btn ghost small" data-ch-del="${c.id}">删除</button>
            </div>
            <span class="hidden" data-siblings="${siblingIds.join(",")}"></span>
          </div>`).join("") : `<div class="muted" style="padding:12px 0">暂无章节，点击「添加章节」开始搭大纲。</div>`}
      </div>
    </div>`;
  document.getElementById("saveThesis").onclick = async () => {
    const checks = checklist.map((c, i) => ({
      item: c.item,
      done: !!document.querySelector(`[data-i="${i}"]`)?.checked,
    }));
    await API.put("/thesis", {
      title: th_title.value, subtitle: th_sub.value,
      research_question: th_rq.value, contribution: th_c.value,
      notes: meta.notes || "", checklist_json: JSON.stringify(checks),
    });
    toast("论文信息已保存");
  };
  document.getElementById("addMs").onclick = async () => {
    const title = prompt("节点名称"); if (!title) return;
    const due_date = prompt("日期 YYYY-MM-DD（可空）", "") || null;
    const created = await API.post("/thesis/milestones", { title, due_date, status: "pending", notes: "", location: "", outcome: "" });
    openMilestoneModal(created);
  };
  const openMs = (id) => {
    const m = milestones.find((x) => String(x.id) === String(id));
    if (m) openMilestoneModal(m);
  };
  view.querySelectorAll("[data-ms]").forEach((el) => {
    el.onclick = (e) => {
      if (e.target.closest("button, a")) return;
      openMs(el.dataset.ms);
    };
  });
  view.querySelectorAll("[data-ms-edit]").forEach((btn) => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openMs(btn.dataset.msEdit);
    };
  });
  document.getElementById("addCh").onclick = () => openChapterModal(chapters);
  view.querySelectorAll("[data-ch-edit]").forEach((btn) => {
    btn.onclick = () => {
      const c = chapters.find((x) => String(x.id) === btn.dataset.chEdit);
      if (c) openChapterModal(chapters, c);
    };
  });
  view.querySelectorAll("[data-ch-child]").forEach((btn) => {
    btn.onclick = () => openChapterModal(chapters, null, { parentId: Number(btn.dataset.chChild) });
  });
  view.querySelectorAll("[data-ch-del]").forEach((btn) => {
    btn.onclick = async () => {
      const c = chapters.find((x) => String(x.id) === btn.dataset.chDel);
      if (!c) return;
      const kids = chapterDescendantIds(chapters, c.id).size;
      const tip = kids
        ? `删除「${c.title}」及其 ${kids} 个子章节？`
        : `删除章节「${c.title}」？`;
      if (!confirm(tip)) return;
      await API.del(`/thesis/chapters/${c.id}`);
      toast("章节已删除");
      navigate("thesis");
    };
  });
  view.querySelectorAll("[data-ch-up],[data-ch-down]").forEach((btn) => {
    btn.onclick = async () => {
      const id = Number(btn.dataset.chUp || btn.dataset.chDown);
      const row = btn.closest(".chapter-row");
      const siblings = (row?.querySelector("[data-siblings]")?.dataset.siblings || "")
        .split(",").filter(Boolean).map(Number);
      const idx = siblings.indexOf(id);
      if (idx < 0) return;
      const swapWith = btn.dataset.chUp != null ? siblings[idx - 1] : siblings[idx + 1];
      if (swapWith == null) return;
      await swapChapterOrder(chapters, id, swapWith);
      navigate("thesis");
    };
  });
}

const THEME_ORDER = ["light", "dark", "pine", "mist", "bamboo", "sky", "amber"];
const THEME_META = {
  light: { label: "浅色", toast: "已切换到浅色主题", nextHint: "切换主题（当前：浅色）" },
  dark: { label: "深色", toast: "已切换到深色主题", nextHint: "切换主题（当前：深色）" },
  pine: { label: "青松", toast: "已切换到青松主题", nextHint: "切换主题（当前：青松）" },
  mist: { label: "雾蓝", toast: "已切换到雾蓝主题", nextHint: "切换主题（当前：雾蓝）" },
  bamboo: { label: "竹影", toast: "已切换到竹影主题", nextHint: "切换主题（当前：竹影）" },
  sky: { label: "晴空", toast: "已切换到晴空主题", nextHint: "切换主题（当前：晴空）" },
  amber: { label: "琥珀", toast: "已切换到琥珀主题", nextHint: "切换主题（当前：琥珀）" },
};

function normalizeTheme(theme) {
  return THEME_ORDER.includes(theme) ? theme : "light";
}

function applyTheme(theme) {
  const t = normalizeTheme(theme);
  document.documentElement.setAttribute("data-theme", t);
  try { localStorage.setItem("wb_theme", t); } catch (_) {}
  if (state.settings) state.settings.theme = t;
  syncThemeToggle(t);
}

function syncThemeToggle(theme) {
  const btn = document.getElementById("btnTheme");
  if (!btn) return;
  const t = normalizeTheme(theme);
  const meta = THEME_META[t];
  btn.dataset.theme = t;
  btn.title = meta.nextHint;
  btn.setAttribute("aria-label", meta.nextHint);
  const label = btn.querySelector(".theme-toggle-label");
  if (label) label.textContent = meta.label;
}

async function toggleTheme() {
  const cur = normalizeTheme(
    state.settings?.theme ||
    document.documentElement.getAttribute("data-theme") ||
    localStorage.getItem("wb_theme") ||
    "light"
  );
  const idx = THEME_ORDER.indexOf(cur);
  const next = THEME_ORDER[(idx + 1) % THEME_ORDER.length];
  applyTheme(next);
  try {
    const s = await API.put("/settings", { theme: next });
    // 若后端尚未支持该主题会被打回 light，仍以本地已应用的 next 为准
    const saved = normalizeTheme(s?.theme);
    if (saved === next || THEME_ORDER.includes(s?.theme)) {
      await applyChrome({ ...s, theme: next });
    } else {
      if (state.settings) state.settings.theme = next;
      toast(THEME_META[next].toast);
      return;
    }
    toast(THEME_META[next].toast);
  } catch (e) {
    toast(e.message || "主题保存失败");
  }
  if (state.route === "settings") {
    document.querySelectorAll("[data-theme-pick]").forEach((b) => {
      b.classList.toggle("active", b.dataset.themePick === next);
    });
  }
}

/* ---------------- Settings ---------------- */
function dataSpaceSize(bytes) {
  const value = Number(bytes || 0);
  if (!value) return "尚未创建";
  if (value < 1024 * 1024) return `${Math.max(1, Math.round(value / 1024))} KB`;
  return `${(value / 1024 / 1024).toFixed(1)} MB`;
}

function showDataSpaceRestart(targetLabel, targetProfile) {
  const overlay = document.createElement("div");
  overlay.className = "data-space-restart";
  overlay.innerHTML = `<div class="data-space-restart-card">
    <span class="data-space-spinner" aria-hidden="true"></span>
    <strong>正在切换到${esc(targetLabel)}</strong>
    <p>应用正在安全重启，两个空间的数据不会合并。</p>
    <button type="button" class="btn secondary hidden" id="dataSpaceRetry">重新检查</button>
  </div>`;
  document.body.appendChild(overlay);
  let stopped = false;
  const check = async () => {
    if (stopped) return;
    try {
      const response = await fetch(`/api/data-spaces?_=${Date.now()}`, { cache: "no-store" });
      if (response.ok) {
        const info = await response.json();
        if (info.active_profile === targetProfile) {
          stopped = true;
          location.reload();
          return;
        }
      }
    } catch (_) {
      // A short connection failure is expected while the local process restarts.
    }
    setTimeout(check, 550);
  };
  setTimeout(check, 500);
  setTimeout(() => {
    if (stopped) return;
    const retry = overlay.querySelector("#dataSpaceRetry");
    retry?.classList.remove("hidden");
    if (retry) retry.onclick = check;
  }, 12000);
}

async function renderSettings(view) {
  setTopActions("");
  const settings = await API.get("/settings");
  state.settings = settings;
  await refreshProjects();
  const folders = await API.get("/watch-folders");
  const [guidePack, recyclePack, dataSpaces] = await Promise.all([
    API.get("/guide").catch(() => ({ sections: [] })),
    API.get("/recycle").catch(() => ({ items: [] })),
    API.get("/data-spaces").catch(() => ({ active_profile: "personal", active_label: "个人空间", managed: true, spaces: [] })),
  ]);
  const guideSections = guidePack.sections || [];
  const recycleItems = recyclePack.items || [];
  const theme = normalizeTheme(settings.theme);
  applyTheme(theme);
  const linksText = (settings.quick_links || [])
    .map((l) => `${l.name} | ${l.url}`)
    .join("\n");
  const guideNav = guideSections.map((s, i) =>
    `<button type="button" class="guide-tab ${i === 0 ? "active" : ""}" data-guide="${esc(s.id)}">${esc(s.title)}</button>`
  ).join("");
  const guideBodies = guideSections.map((s, i) =>
    `<div class="guide-pane ${i === 0 ? "" : "hidden"}" data-guide-pane="${esc(s.id)}"><pre class="guide-body">${esc(s.body || "")}</pre></div>`
  ).join("") || `<div class="empty">暂无说明</div>`;
  const dataSpaceCards = (dataSpaces.spaces || []).map((space) => `
    <article class="data-space-card ${space.active ? "active" : ""}">
      <div class="data-space-card-head">
        <span class="data-space-mark" aria-hidden="true">${space.id === "personal" ? "个" : "演"}</span>
        <div><strong>${esc(space.label)}</strong><div class="meta">${esc(space.description)}</div></div>
        ${space.active ? `<span class="badge">当前</span>` : ""}
      </div>
      <div class="data-space-card-meta"><span>${dataSpaceSize(space.size_bytes)}</span><code>${esc(space.path_hint || "")}</code></div>
      ${dataSpaces.managed
        ? (space.active
          ? `<button type="button" class="btn secondary small" disabled>正在使用</button>`
          : `<button type="button" class="btn secondary small" data-space-switch="${esc(space.id)}" data-space-label="${esc(space.label)}">切换到此空间</button>`)
        : ""}
    </article>`).join("");
  view.innerHTML = `
    <div class="panel" id="guidePanel">
      <h2>使用说明</h2>
      <p class="muted" style="margin:0 0 10px">隐藏 / 焦点 / 关联一致性、回声、回收站与每周备份——可在此随时查阅。</p>
      <div class="guide-tabs">${guideNav}</div>
      <div class="guide-panes">${guideBodies}</div>
    </div>
    <div class="panel data-space-panel">
      <div class="data-space-title-row">
        <div>
          <h2>数据空间</h2>
          <p class="muted">当前：<strong>${esc(dataSpaces.active_label || "个人空间")}</strong>。项目、文献、笔记、附件、AI 上传与实验图片按空间完全隔离。</p>
        </div>
        <span class="badge">${esc(dataSpaces.active_label || "个人空间")}</span>
      </div>
      ${dataSpaces.managed
        ? `<div class="data-space-grid">${dataSpaceCards}</div>
           <p class="data-space-safety">切换只改变下一次启动使用的目录，不复制、不覆盖，也不会把演示内容加入个人空间。</p>
           ${dataSpaces.active_profile === "demo" ? `<button type="button" class="btn danger small" id="resetDemoSpace">重建演示空间</button>` : ""}`
        : `<div class="hint-box">当前由 <code>WORKBENCH_DATA_DIR</code> 指定自定义目录：<code>${esc(dataSpaces.custom_path || "")}</code>。为避免切换到错误目录，界面切换已停用；移除环境变量并重启后即可恢复。</div>`}
    </div>
    <div class="panel">
      <h2>备份健康</h2>
      <p class="muted" style="margin:0 0 8px">
        上次备份：${settings.last_backup_at ? esc(settings.last_backup_at) : "尚未备份"}
        ${settings.last_backup_file ? ` · ${esc(settings.last_backup_file)}` : ""}
        ${settings.backup_due ? ` · <strong style="color:var(--danger,#c23b22)">已到期</strong>` : " · 正常"}
      </p>
      <div class="backup-prefs-row">
        <label class="backup-days-field">提醒间隔（天）
          <input id="st_backup_days" type="number" min="1" max="90" value="${Number(settings.backup_interval_days || 7)}" />
        </label>
        <label class="check-inline"><input type="checkbox" id="st_backup_remind" ${settings.backup_remind_enabled !== false ? "checked" : ""} /> 到期提醒</label>
        <label class="check-inline"><input type="checkbox" id="st_backup_auto" ${settings.auto_weekly_backup !== false ? "checked" : ""} /> 到期自动写入 exports/</label>
      </div>
      <div class="toolbar" style="margin-top:8px">
        <button class="btn" id="doExport">导出备份</button>
        <label class="btn secondary">导入 ZIP<input type="file" id="importFile" accept=".zip" hidden /></label>
        <select id="importMode"><option value="replace">替换当前库</option><option value="merge">合并</option></select>
        <button class="btn secondary" id="saveBackupPrefs">保存备份偏好</button>
      </div>
    </div>
    <div class="panel">
      <h2>回收站</h2>
      <p class="muted" style="margin:0 0 8px">项目 / 实验 Run / 专注 / 任务 / 普通笔记 / 想法删除后先在这里，可恢复或彻底清除。</p>
      <div class="list" id="recycleList">
        ${recycleItems.map((it) => `
          <div class="list-item">
            <div>
              <div class="title">${esc(it.title)}</div>
              <div class="meta">${esc(it.type_label || it.type)} · ${esc(it.deleted_at || "")}</div>
            </div>
            <div class="toolbar" style="margin:0;gap:6px">
              <button class="btn ghost small" data-recycle-restore="${esc(it.type)}" data-rid="${it.id}">恢复</button>
              <button class="btn danger small" data-recycle-purge="${esc(it.type)}" data-rid="${it.id}">彻底清除</button>
            </div>
          </div>`).join("") || `<div class="empty">回收站为空</div>`}
      </div>
    </div>
    <div class="panel theme-panel">
      <h2>主题</h2>
      <p class="muted" style="margin:0 0 12px">立即生效并保存。也可点顶部右侧主题按钮在 浅色 → 深色 → 青松 间循环切换。</p>
      <div class="theme-row">
        <button type="button" class="theme-card ${theme==="light"?"active":""}" data-theme-pick="light">
          <div class="theme-swatch" aria-hidden="true">
            <span style="background:#f3f3f3"></span>
            <span style="background:#ffffff"></span>
            <span style="background:#007acc"></span>
            <span style="background:#1e1e1e"></span>
          </div>
          <strong>Light</strong>
          <div class="meta">浅色工作区 · VS Code Light+</div>
        </button>
        <button type="button" class="theme-card ${theme==="dark"?"active":""}" data-theme-pick="dark">
          <div class="theme-swatch" aria-hidden="true">
            <span style="background:#1e1e1e"></span>
            <span style="background:#252526"></span>
            <span style="background:#007acc"></span>
            <span style="background:#cccccc"></span>
          </div>
          <strong>Dark</strong>
          <div class="meta">深色工作区 · VS Code Dark+</div>
        </button>
        <button type="button" class="theme-card ${theme==="pine"?"active":""}" data-theme-pick="pine">
          <div class="theme-swatch" aria-hidden="true">
            <span style="background:#e6eef0"></span>
            <span style="background:#f4f8f9"></span>
            <span style="background:#0f766e"></span>
            <span style="background:#1b2c2f"></span>
          </div>
          <strong>青松</strong>
          <div class="meta">冷雾灰底 · 松柏青绿强调</div>
        </button>
        <button type="button" class="theme-card ${theme==="mist"?"active":""}" data-theme-pick="mist">
          <div class="theme-swatch" aria-hidden="true">
            <span style="background:#e8eef6"></span>
            <span style="background:#f5f8fc"></span>
            <span style="background:#2f5c94"></span>
            <span style="background:#1a2433"></span>
          </div>
          <strong>雾蓝</strong>
          <div class="meta">霜雾灰蓝 · 钢青强调</div>
        </button>
        <button type="button" class="theme-card ${theme==="bamboo"?"active":""}" data-theme-pick="bamboo">
          <div class="theme-swatch" aria-hidden="true">
            <span style="background:#ebf0e8"></span>
            <span style="background:#f7f9f4"></span>
            <span style="background:#4a6b3a"></span>
            <span style="background:#1f2a1c"></span>
          </div>
          <strong>竹影</strong>
          <div class="meta">浅雾灰青 · 竹叶绿强调</div>
        </button>
        <button type="button" class="theme-card ${theme==="sky"?"active":""}" data-theme-pick="sky">
          <div class="theme-swatch" aria-hidden="true">
            <span style="background:#e9f3fb"></span>
            <span style="background:#f7fbfe"></span>
            <span style="background:#0b8fdc"></span>
            <span style="background:#132536"></span>
          </div>
          <strong>晴空</strong>
          <div class="meta">冰雾浅底 · 鲜明晴空蓝</div>
        </button>
        <button type="button" class="theme-card ${theme==="amber"?"active":""}" data-theme-pick="amber">
          <div class="theme-swatch" aria-hidden="true">
            <span style="background:#f1ece6"></span>
            <span style="background:#faf7f3"></span>
            <span style="background:#c46224"></span>
            <span style="background:#2a2118"></span>
          </div>
          <strong>琥珀</strong>
          <div class="meta">暖雾石灰 · 琥珀橙强调</div>
        </button>
      </div>
    </div>
    <div class="grid-2">
      <div class="panel">
        <h2>装修与账户</h2>
        <div class="field"><label>工作台名称</label><input id="st_name" value="${esc(settings.workspace_name||"科研工作台")}" /></div>
        <div class="field"><label>副标题</label><input id="st_sub" value="${esc(settings.workspace_subtitle||"")}" /></div>
        <div class="field-row">
          <div class="field"><label>所在城市（天气）</label><input id="st_city" value="${esc(settings.location_city||"上海")}" placeholder="上海" /></div>
          <div class="field"><label>个人状态</label>
            <select id="st_status"><option>在岗</option><option>休息</option><option>请假</option><option>外出</option></select>
          </div>
        </div>
        <div class="field" style="margin-top:4px"><label>邮箱（网页入口可直接打开）</label></div>
        ${mailAccountsEditorHtml(settings.mail_accounts || [])}
        <p class="muted" style="margin:6px 0 0;font-size:0.75rem">保存后，顶部快捷栏与今日页可一点打开对应网页邮箱（不要只填地址不填网址）。</p>
        <div class="field" style="margin-top:12px"><label>焦点项目</label><select id="st_focus">${projectOptions(settings.focus_project_id)}</select></div>
        <div class="field"><label>自定义网站快捷入口（每行：名称 | URL）</label>
          <textarea id="st_links" rows="6" placeholder="arXiv | https://arxiv.org">${esc(linksText)}</textarea></div>
        <button class="btn" id="saveSettings">保存设置</button>
      </div>
      <div class="panel">
        <h2>大模型 SK（文献 AI / 今日建议）</h2>
        <p class="muted">兼容 OpenAI Chat Completions。Key 仅存本机 SQLite，接口返回时脱敏。</p>
        <div class="llm-switch-row">
          <div>
            <div class="llm-switch-title">大模型赋能</div>
            <div class="meta" style="margin:0">关闭后立即拒绝新的 AI 请求，进行中的分段通读也会在下一段停止，避免空耗 token。</div>
          </div>
          <label class="switch" title="一键开关大模型">
            <input type="checkbox" id="st_llm_enabled" ${settings.llm_enabled !== false ? "checked" : ""} />
            <span class="switch-slider"></span>
          </label>
        </div>
        <div class="field"><label>默认阅读深度（AI笔记 / AI综述）</label>
          <select id="st_llm_read_mode">
            <option value="summary" ${(settings.llm_read_mode || "summary") !== "full" ? "selected" : ""}>摘要速览 · 快、省 token</option>
            <option value="full" ${settings.llm_read_mode === "full" ? "selected" : ""}>全文通读 · 慢、更准</option>
          </select>
          <p class="muted" style="margin:6px 0 0;font-size:0.75rem">单次任务仍可在弹窗里临时改；此处是默认值。</p>
        </div>
        <div class="field"><label>API Base URL</label>
          <input id="st_llm_base" value="${esc(settings.llm_base_url||"https://api.openai.com/v1")}" /></div>
        <div class="field"><label>Model</label>
          <input id="st_llm_model" value="${esc(settings.llm_model||"gpt-4o-mini")}" placeholder="gpt-4o-mini / deepseek-chat …" /></div>
        <div class="field"><label>API Key / SK ${settings.llm_api_key_set ? `（已配置 ${esc(settings.llm_api_key_hint)}）` : "（未配置）"}</label>
          <input id="st_llm_key" type="password" placeholder="${settings.llm_api_key_set ? "留空则保持原 Key 不变" : "sk-..."}" autocomplete="off" /></div>
        <button class="btn secondary small" id="testLLM">测试连通</button>
      </div>
    </div>
    <div class="panel" id="promptPanel">
      <h2>AI 提示词</h2>
      <p class="muted" style="margin:0 0 12px">
        文献「通读成笔记 / AI综述」等会使用这里的提示词。下方已写入一套默认稿，可按课题改写；清空某条并保存即恢复该条默认。
      </p>
      <div class="field"><label>选择提示词</label>
        <select id="st_prompt_key">
          ${(settings.llm_prompt_meta || []).map((m) =>
            `<option value="${esc(m.key)}">${esc(m.label || m.key)}</option>`
          ).join("")}
        </select>
      </div>
      <div class="field"><label>内容</label>
        <textarea id="st_prompt_body" rows="14" class="prompt-editor" spellcheck="false"></textarea>
      </div>
      <div class="toolbar" style="margin:0;gap:8px">
        <button type="button" class="btn secondary small" id="promptResetOne">恢复本条默认</button>
        <button type="button" class="btn secondary small" id="promptResetAll">全部恢复默认</button>
        <button type="button" class="btn" id="savePrompts">保存提示词</button>
      </div>
    </div>
    <div class="panel">
      <h2>监视目录</h2>
      <div class="list">${folders.map((f)=>`<div class="list-item"><div>
        <div class="title">${esc(isBrokenLabel(f.name) ? (f.path || "").split(/[/\\]/).pop() : f.name)}</div><div class="meta">${esc(f.path)}</div></div>
        <button class="btn danger small" data-dwf="${f.id}">移除</button></div>`).join("") || `<div class="empty">无</div>`}
      </div>
    </div>`;
  st_status.value = normalizePersonStatus(settings.personal_status);
  document.getElementById("statusPill").textContent = normalizePersonStatus(settings.personal_status);
  document.getElementById("statusPill").dataset.status = normalizePersonStatus(settings.personal_status);

  view.querySelectorAll("[data-guide]").forEach((btn) => {
    btn.onclick = () => {
      const id = btn.dataset.guide;
      view.querySelectorAll("[data-guide]").forEach((b) => b.classList.toggle("active", b === btn));
      view.querySelectorAll("[data-guide-pane]").forEach((pane) => {
        pane.classList.toggle("hidden", pane.dataset.guidePane !== id);
      });
    };
  });
  view.querySelectorAll("[data-space-switch]").forEach((btn) => {
    btn.onclick = async () => {
      const target = btn.dataset.spaceSwitch;
      const label = btn.dataset.spaceLabel || "目标空间";
      if (!confirm(`切换到${label}？\n\n当前空间会原样保留，应用将自动重启。`)) return;
      btn.disabled = true;
      try {
        const result = await API.post("/data-spaces/switch", { profile: target });
        if (result.restarting) showDataSpaceRestart(label, target);
        else location.reload();
      } catch (e) {
        btn.disabled = false;
        toast(e.message || "数据空间切换失败");
      }
    };
  });
  document.getElementById("resetDemoSpace")?.addEventListener("click", async () => {
    if (!confirm("重建演示空间会清空当前演示空间并恢复完整默认示例。个人空间不会受影响。继续？")) return;
    if (!confirm("再次确认：只重建演示空间？")) return;
    try {
      await API.post("/data-spaces/demo/reset", {});
      state.settings = null;
      toast("演示空间已重建");
      location.reload();
    } catch (e) {
      toast(e.message || "演示空间重建失败");
    }
  });
  document.getElementById("saveBackupPrefs").onclick = async () => {
    try {
      const s = await API.put("/settings", {
        backup_interval_days: Number(document.getElementById("st_backup_days").value) || 7,
        backup_remind_enabled: !!document.getElementById("st_backup_remind").checked,
        auto_weekly_backup: !!document.getElementById("st_backup_auto").checked,
      });
      state.settings = s;
      toast("备份偏好已保存");
      navigate("settings");
    } catch (e) {
      toast(e.message || "保存失败");
    }
  };
  view.querySelectorAll("[data-recycle-restore]").forEach((btn) => {
    btn.onclick = async () => {
      try {
        await API.post(`/recycle/${btn.dataset.recycleRestore}/${btn.dataset.rid}/restore`, {});
        toast("已恢复");
        navigate("settings");
      } catch (e) {
        toast(e.message || "恢复失败");
      }
    };
  });
  view.querySelectorAll("[data-recycle-purge]").forEach((btn) => {
    btn.onclick = async () => {
      if (!confirm("彻底清除后无法恢复，确认？")) return;
      try {
        await API.del(`/recycle/${btn.dataset.recyclePurge}/${btn.dataset.rid}`);
        toast("已彻底清除");
        navigate("settings");
      } catch (e) {
        toast(e.message || "清除失败");
      }
    };
  });

  const promptDraft = { ...(settings.llm_prompts || {}) };
  const promptDefaults = { ...(settings.llm_prompt_defaults || {}) };
  const promptKeyEl = document.getElementById("st_prompt_key");
  const promptBodyEl = document.getElementById("st_prompt_body");
  const syncPromptBody = () => {
    const key = promptKeyEl?.value;
    if (!key || !promptBodyEl) return;
    promptBodyEl.value = promptDraft[key] || promptDefaults[key] || "";
  };
  const stashPromptBody = () => {
    const key = promptKeyEl?.value;
    if (!key || !promptBodyEl) return;
    promptDraft[key] = promptBodyEl.value;
  };
  if (promptKeyEl) {
    promptKeyEl.onchange = () => {
      const prev = promptKeyEl.dataset.prevKey;
      if (prev) promptDraft[prev] = promptBodyEl.value;
      promptKeyEl.dataset.prevKey = promptKeyEl.value;
      syncPromptBody();
    };
    promptKeyEl.dataset.prevKey = promptKeyEl.value;
    syncPromptBody();
  }
  document.getElementById("promptResetOne").onclick = () => {
    const key = promptKeyEl.value;
    promptDraft[key] = promptDefaults[key] || "";
    syncPromptBody();
    toast("已填入本条默认（记得保存）");
  };
  document.getElementById("promptResetAll").onclick = () => {
    if (!confirm("将全部提示词恢复为内置默认稿？未保存的修改会丢失。")) return;
    Object.keys(promptDefaults).forEach((k) => { promptDraft[k] = promptDefaults[k]; });
    syncPromptBody();
    toast("已全部填入默认（记得保存）");
  };
  document.getElementById("savePrompts").onclick = async () => {
    stashPromptBody();
    const body = {};
    (settings.llm_prompt_meta || []).forEach((m) => {
      body[m.key] = promptDraft[m.key] ?? promptDefaults[m.key] ?? "";
    });
    const s = await API.put("/settings", { llm_prompts: body });
    Object.assign(promptDraft, s.llm_prompts || {});
    await applyChrome(s);
    toast("提示词已保存");
    syncPromptBody();
  };

  view.querySelectorAll("[data-theme-pick]").forEach((btn) => {
    btn.onclick = async () => {
      const t = btn.dataset.themePick;
      applyTheme(t);
      view.querySelectorAll("[data-theme-pick]").forEach((b) => b.classList.toggle("active", b.dataset.themePick === t));
      try {
        const s = await API.put("/settings", { theme: t });
        await applyChrome({ ...s, theme: t });
        toast(THEME_META[t]?.toast || "主题已切换");
      } catch (e) {
        toast(e.message || "主题保存失败");
      }
    };
  });
  document.getElementById("st_llm_enabled").onchange = async (e) => {
    const on = !!e.target.checked;
    try {
      const s = await API.put("/settings", { llm_enabled: on });
      state.settings = s;
      if (!on) {
        (state.aiJobs || []).forEach((j) => {
          if (j.status === "running") {
            j.status = "error";
            j.error = "已关闭大模型";
            j.onOpen = null;
            j.finishedAt = Date.now();
          }
        });
        renderAiJobDock();
        toast("大模型赋能已关闭 · 进行中任务将尽快停止");
      } else {
        toast("大模型赋能已开启");
      }
    } catch (err) {
      e.target.checked = !on;
      toast(err.message || "切换失败");
    }
  };
  document.getElementById("st_llm_read_mode").onchange = async (e) => {
    const mode = e.target.value === "full" ? "full" : "summary";
    try {
      const s = await API.put("/settings", { llm_read_mode: mode });
      state.settings = s;
      toast(mode === "full" ? "默认：全文通读" : "默认：摘要速览");
    } catch (err) {
      e.target.value = getLlmReadMode();
      toast(err.message || "阅读深度保存失败");
    }
  };
  document.getElementById("saveSettings").onclick = async () => {
    const quick_links = st_links.value
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, ...rest] = line.split("|");
        return { name: (name || "").trim(), url: rest.join("|").trim() };
      })
      .filter((l) => l.name && l.url);
    const mail_accounts = readMailAccountsFromForm();
    const body = {
      personal_status: st_status.value,
      focus_project_id: st_focus.value ? Number(st_focus.value) : null,
      workspace_name: st_name.value,
      workspace_subtitle: st_sub.value,
      location_city: st_city.value || "上海",
      email: mail_accounts[0]?.address || "",
      mail_accounts,
      llm_base_url: st_llm_base.value.trim(),
      llm_model: st_llm_model.value.trim(),
      llm_enabled: !!document.getElementById("st_llm_enabled")?.checked,
      llm_read_mode: document.getElementById("st_llm_read_mode")?.value || "summary",
      quick_links,
    };
    const key = st_llm_key.value.trim();
    if (key) body.llm_api_key = key;
    const s = await API.put("/settings", body);
    await applyChrome(s);
    toast("设置已保存");
    navigate("settings");
  };
  document.getElementById("testLLM").onclick = async () => {
    if (!ensureLlmEnabled()) return;
    try {
      const r = await API.post("/ai/chat", {
        messages: [
          { role: "system", content: "只回复：ok" },
          { role: "user", content: "ping" },
        ],
      });
      toast("连通成功：" + (r.content || "").slice(0, 40));
    } catch (e) {
      toast(e.message || "连通失败");
    }
  };
  document.getElementById("doExport").onclick = exportBackup;
  document.getElementById("importFile").onchange = async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    if (importMode.value === "replace" && !confirm("替换将覆盖当前数据库，确认？")) return;
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch(`/api/import?mode=${importMode.value}`, { method: "POST", body: fd });
    if (!res.ok) return toast("导入失败");
    toast("导入完成，请刷新");
    location.reload();
  };
  view.querySelectorAll("[data-dwf]").forEach((btn) => {
    btn.onclick = async () => { await API.del(`/watch-folders/${btn.dataset.dwf}`); navigate("settings"); };
  });
}

async function exportBackup() {
  const res = await fetch("/api/export", { method: "POST" });
  if (!res.ok) return toast("导出失败");
  const blob = await res.blob();
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `research_workbench_${new Date().toISOString().slice(0,10)}.zip`;
  a.click();
  toast("导出完成 · 已记备份时间");
  try { state.settings = await API.get("/settings"); } catch (_) {}
  if (state.route === "settings" || state.route === "home") navigate(state.route);
}

function normalizeMailUrl(url, address = "") {
  let u = String(url || "").trim();
  if (!u && address) {
    const lower = address.toLowerCase();
    if (lower.includes("gmail.com")) u = "https://mail.google.com/";
    else u = `mailto:${address}`;
  }
  if (u && !/^(https?:|mailto:)/i.test(u)) u = `https://${u.replace(/^\/+/, "")}`;
  return u;
}

function getMailAccounts(settings = state.settings) {
  const list = settings?.mail_accounts;
  if (Array.isArray(list) && list.length) {
    return list
      .map((a) => ({
        name: (a.name || a.address || "邮箱").trim(),
        address: (a.address || "").trim(),
        url: normalizeMailUrl(a.url, a.address || ""),
      }))
      .filter((a) => a.name || a.address);
  }
  if (settings?.email) {
    return [{
      name: settings.email.toLowerCase().includes("gmail") ? "Gmail" : "邮箱",
      address: settings.email,
      url: normalizeMailUrl("", settings.email),
    }];
  }
  return [];
}

function mailAccountsEditorHtml(accounts = []) {
  const defaults = [
    { name: "学校邮箱", address: "", url: "" },
    { name: "Gmail", address: "", url: "https://mail.google.com/" },
  ];
  const rows = [...accounts];
  while (rows.length < 2) rows.push({ ...defaults[rows.length] });
  return rows.slice(0, 2).map((a, i) => {
    const d = defaults[i] || { name: "邮箱", address: "", url: "" };
    return `
      <div class="mail-account-row" data-mail-idx="${i}">
        <div class="field-row">
          <div class="field"><label>${i === 0 ? "学校邮箱名称" : "Gmail 名称"}</label>
            <input class="mail-name" value="${esc(a.name || d.name)}" placeholder="${esc(d.name)}" /></div>
          <div class="field"><label>邮箱地址</label>
            <input class="mail-address" value="${esc(a.address || "")}" placeholder="${i === 0 ? "name@university.edu" : "name@gmail.com"}" /></div>
        </div>
        <div class="field"><label>网页邮箱网址（点击打开这个）</label>
          <input class="mail-url" value="${esc(a.url || d.url)}" placeholder="${esc(d.url)}" /></div>
        ${(a.address || a.url) ? `<div class="email-bar">
          <a class="btn secondary small" href="${esc(normalizeMailUrl(a.url || d.url, a.address))}" target="_blank" rel="noopener noreferrer">打开网页邮箱</a>
          ${a.address ? `<a class="btn ghost small" href="mailto:${esc(a.address)}">用客户端写信</a>` : ""}
        </div>` : ""}
      </div>`;
  }).join('<hr style="border:none;border-top:1px solid var(--line);margin:12px 0" />');
}

function readMailAccountsFromForm() {
  return [...document.querySelectorAll(".mail-account-row")].map((row) => {
    const name = row.querySelector(".mail-name")?.value.trim() || "";
    const address = row.querySelector(".mail-address")?.value.trim() || "";
    const url = normalizeMailUrl(row.querySelector(".mail-url")?.value || "", address);
    return { name: name || address || "邮箱", address, url };
  }).filter((a) => a.address || (a.url && !a.url.startsWith("mailto:")));
}

function mailAccountChipsHtml(settings) {
  const accounts = getMailAccounts(settings);
  if (!accounts.length) return `<span class="day-chip">✉ 设置中绑定邮箱</span>`;
  return accounts.map((a) => {
    const href = normalizeMailUrl(a.url, a.address);
    const label = a.name || a.address || "邮箱";
    return `<a class="day-chip" href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="${esc(a.address || href)}">✉ ${esc(label)}</a>`;
  }).join("");
}

async function applyChrome(settings) {
  if (!settings) return;
  const prevCity = state.settings?.location_city;
  state.settings = settings;
  if (settings.theme) applyTheme(settings.theme);
  if (prevCity && prevCity !== settings.location_city) state.weatherCache = null;
  const bn = document.getElementById("brandName");
  const bs = document.getElementById("brandSub");
  if (bn) bn.textContent = settings.workspace_name || "科研工作台";
  if (bs) bs.textContent = settings.workspace_subtitle || "Research Workspace";
  document.title = settings.workspace_name || "科研工作台";
  const st = normalizePersonStatus(settings.personal_status);
  document.getElementById("statusPill").textContent = st;
  document.getElementById("statusPill").dataset.status = st;
  const colors = ["#e85d4c", "#10a37f", "#4285f4", "#47a141", "#0b3d91", "#af52de", "#ff9f0a"];
  const links = settings.quick_links || [];
  let html = links
    .map((l, i) => `<a class="quick-pill" href="${esc(l.url)}" target="_blank" rel="noopener noreferrer">
      <span class="dot" style="background:${colors[i % colors.length]}"></span>${esc(l.name)}</a>`)
    .join("");
  const mails = getMailAccounts(settings);
  mails.forEach((a, i) => {
    const href = normalizeMailUrl(a.url, a.address);
    html += `<a class="quick-pill" href="${esc(href)}" target="_blank" rel="noopener noreferrer" title="${esc(a.address || href)}">
      <span class="dot" style="background:${i === 0 ? "#0f766e" : "#ea4335"}"></span>${esc(a.name || "邮箱")}</a>`;
  });
  document.getElementById("quickLinks").innerHTML = html;
}

async function runGlobalSearch(q) {
  const drop = document.getElementById("searchDrop");
  if (!q.trim()) {
    drop.classList.add("hidden");
    drop.innerHTML = "";
    return;
  }
  const data = await API.get(`/search?q=${encodeURIComponent(q.trim())}`);
  const blocks = [];
  const push = (label, items, kind, titleFn) => {
    (items || []).forEach((it) => {
      blocks.push(`<div class="hit" data-kind="${kind}" data-id="${it.id}" data-paper-id="${it.paper_id || ""}" data-note-key="${esc(it.key || "")}">
        <div class="hit-type">${label}</div>
        <div>${esc(titleFn(it))}</div>
      </div>`);
    });
  };
  push("文献", data.papers, "paper", (x) => x.title);
  push("项目", data.projects, "project", (x) => x.title);
  push("任务", data.tasks, "task", (x) => x.title);
  push("想法", data.ideas, "idea", (x) => x.title || x.content);
  push("投稿", data.submissions, "submission", (x) => x.title);
  push("笔记", data.notes, "note", (x) => `${x.title}${x.snippet ? " · " + x.snippet : ""}`);
  push("批注", data.annotations, "annotation", (x) => `${x.title} p.${x.page || "?"}${x.snippet ? " · " + x.snippet : ""}`);
  push("会议", data.meetings, "meeting", (x) => x.title);
  drop.innerHTML = blocks.length ? blocks.join("") : `<div class="meta" style="padding:8px">无结果</div>`;
  drop.classList.remove("hidden");
  drop.querySelectorAll(".hit").forEach((el) => {
    el.onclick = () => {
      drop.classList.add("hidden");
      openSearchHit(el.dataset.kind, el.dataset.id, el.dataset.paperId, el.dataset.noteKey);
    };
  });
}

async function openSearchHit(kind, id, paperId, noteKey = "") {
  const nid = Number(id);
  const pid = paperId ? Number(paperId) : null;
  try {
    if (kind === "paper") {
      await openPaper(nid);
    } else if (kind === "note") {
      state.notesTab = "notes";
      state.selectedNoteKey = noteKey || (pid ? `paper:${pid}` : "");
      state.unifiedNoteDraft = null;
      await navigate("ideas");
    } else if (kind === "annotation") {
      await navigate("papers");
      await openPaper(pid || nid);
    } else if (kind === "project") {
      await navigate("research", { researchPanel: "projects", openProjectId: nid });
    } else if (kind === "task") {
      await navigate("tasks");
      const tasks = await API.get("/tasks?view=all");
      const t = tasks.find((x) => x.id === nid);
      if (t) taskForm(t);
    } else if (kind === "idea") {
      const ideas = await API.get("/ideas");
      const idea = ideas.find((x) => x.id === nid);
      if (idea) ideaForm(idea);
    } else if (kind === "submission") {
      await navigate("outputs");
    } else if (kind === "meeting") {
      await navigate("meetings");
      const meetings = await API.get("/meetings");
      const m = meetings.find((x) => x.id === nid);
      if (m) meetingForm(m);
    }
  } catch (e) {
    toast(e.message || "无法打开");
  }
}

async function boot() {
  renderNav();
  // apply cached theme before settings load so toggle label is correct
  try {
    const cached = localStorage.getItem("wb_theme");
    if (THEME_ORDER.includes(cached)) syncThemeToggle(cached);
  } catch (_) {}
  document.getElementById("btnTheme").onclick = () => toggleTheme();
  document.getElementById("btnExport").onclick = exportBackup;
  document.getElementById("btnCapture").onclick = async () => {
    const content = prompt("快速捕获到 Inbox");
    if (!content) return;
    await API.post("/inbox", { content, item_type: "note" });
    toast("已捕获");
    if (state.route === "home") navigate("home");
  };
  const search = document.getElementById("globalSearch");
  let timer;
  search.oninput = () => {
    clearTimeout(timer);
    timer = setTimeout(() => runGlobalSearch(search.value), 200);
  };
  search.onkeydown = (e) => {
    if (e.key === "Escape") {
      document.getElementById("searchDrop").classList.add("hidden");
    }
  };
  document.addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s") {
      const modal = document.getElementById("modal");
      const modalOpen = modal && !modal.classList.contains("hidden");
      if (modalOpen) {
        const savePaperNote = modal.querySelector("#saveNoteModal");
        e.preventDefault();
        e.stopImmediatePropagation();
        if (savePaperNote && !savePaperNote.disabled) savePaperNote.click();
        return;
      }
      const saveReaderNote = state.route === "papers" && state.papersMode === "workspace"
        ? document.getElementById("noteMdSave")
        : null;
      if (saveReaderNote) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (!saveReaderNote.disabled) saveReaderNote.click();
        return;
      }
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
      e.preventDefault();
      search.focus();
    }
  });
  wireFocusBar();
  renderAiJobDock();
  wireFloatingAgent();
  try {
    const s = await API.get("/settings");
    await applyChrome(s);
    // 预热天气缓存，进入今日页时几乎不卡
    loadWeatherLazy(s);
    refreshFocusSession();
    const hint = document.getElementById("agentModelHint");
    if (hint) {
      hint.dataset.model = s.llm_model || "LLM";
      hint.textContent = s.llm_model || "LLM";
    }
  } catch (_) {}
  try {
    await navigate("home");
  } catch (error) {
    console.error("Workspace boot failed", error);
    const view = document.getElementById("view");
    if (view) {
      view.innerHTML = `
        <section class="empty-state">
          <h2>工作空间暂时没有加载完成</h2>
          <p>${esc(error.message || "请稍后重试")}</p>
          <button type="button" class="btn" id="retryWorkspaceBoot">重新加载</button>
        </section>`;
      document.getElementById("retryWorkspaceBoot").onclick = () => location.reload();
    }
    toast(error.message || "工作空间加载失败，请重试");
  } finally {
    finishBootSplash();
  }
}

function finishBootSplash() {
  const splash = document.getElementById("bootSplash");
  if (!splash) return;
  splash.classList.add("is-done");
  window.setTimeout(() => splash.remove(), 260);
}

boot();

/* -------- Floating Agent (workspace LLM) -------- */
function wireFloatingAgent() {
  const fab = document.getElementById("agentFab");
  const panel = document.getElementById("agentPanel");
  if (!fab || !panel) return;
  state._agentHistories = state._agentHistories || { general: state._agentHistory || [], figure: [] };
  state._agentFiles = state._agentFiles || [];
  state._agentContexts = state._agentContexts || [];
  state._agentConversationIds = state._agentConversationIds || { general: null, figure: null };
  state._agentConversationCatalog = state._agentConversationCatalog || [];
  state._agentMode = agentModeForRoute();
  state._agentBackend = state._agentBackend || "";
  fab.onclick = (event) => {
    event.stopPropagation();
    if (panel.classList.contains("hidden")) openFloatingAgent();
    else closeFloatingAgent();
  };
  fab.addEventListener("dragover", handleAgentContextDragOver);
  fab.addEventListener("dragleave", () => fab.classList.remove("is-context-drop"));
  fab.addEventListener("drop", (event) => {
    event.preventDefault();
    fab.classList.remove("is-context-drop");
    const context = readDraggedWorkbenchContext(event.dataTransfer);
    if (!context) return;
    addAgentContext(context);
    openFloatingAgent();
  });
  document.getElementById("agentClose")?.addEventListener("click", (event) => {
    event.stopPropagation();
    closeFloatingAgent();
  });
  document.addEventListener("click", (event) => {
    if (panel.classList.contains("hidden")) return;
    // 上下文切换会在目标按钮的 click 回调中立即重绘 DOM。此时 event.target
    // 已脱离 panel，但浏览器为本次点击保存的传播路径仍能准确表明它来自面板内部。
    const eventPath = typeof event.composedPath === "function" ? event.composedPath() : [];
    const clickedInside = eventPath.length
      ? eventPath.includes(panel) || eventPath.includes(fab)
      : panel.contains(event.target) || fab.contains(event.target);
    if (clickedInside) return;
    closeFloatingAgent();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !panel.classList.contains("hidden")) closeFloatingAgent();
  });
  document.getElementById("agentAddContext")?.addEventListener("click", () => openAgentContextPicker());
  document.getElementById("agentContextClose")?.addEventListener("click", () => closeAgentContextPicker());
  document.getElementById("agentContextDone")?.addEventListener("click", () => closeAgentContextPicker());
  document.getElementById("agentContextSearch")?.addEventListener("input", () => renderAgentContextPicker());
  document.getElementById("agentHistory")?.addEventListener("click", () => toggleAgentHistory());
  document.getElementById("agentHistoryClose")?.addEventListener("click", () => closeAgentHistory());
  document.getElementById("agentNew")?.addEventListener("click", () => startNewAgentConversation());
  const fileInput = document.getElementById("agentFileInput");
  document.getElementById("agentAddFile")?.addEventListener("click", () => fileInput?.click());
  if (fileInput) fileInput.onchange = async () => {
    await uploadAgentFiles(fileInput.files);
    fileInput.value = "";
  };
  document.getElementById("agentClear")?.addEventListener("click", () => startNewAgentConversation());
  document.getElementById("agentSend")?.addEventListener("click", () => sendFloatingAgent());
  document.querySelectorAll("[data-agent-be]").forEach((btn) => {
    btn.onclick = () => {
      state._agentBackend = btn.dataset.agentBe;
      syncAgentModeUi();
      toast(`后端：${state._agentBackend}`);
    };
  });
  const input = document.getElementById("agentInput");
  input?.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey && !e.isComposing) {
      e.preventDefault();
      sendFloatingAgent();
    }
  });
  input?.addEventListener("input", resizeAgentInput);
  const composer = panel.querySelector(".agent-panel-foot");
  composer?.addEventListener("dragover", (e) => {
    const types = Array.from(e.dataTransfer?.types || []);
    if (!types.includes("Files") && !types.includes("application/x-workbench-context")) return;
    e.preventDefault();
    composer.classList.add("is-drop-target");
  });
  composer?.addEventListener("dragleave", () => composer.classList.remove("is-drop-target"));
  composer?.addEventListener("drop", async (e) => {
    e.preventDefault();
    composer.classList.remove("is-drop-target");
    const context = readDraggedWorkbenchContext(e.dataTransfer);
    if (context) {
      addAgentContext(context);
      return;
    }
    if (e.dataTransfer?.files?.length) await uploadAgentFiles(e.dataTransfer.files);
  });
  document.addEventListener("dragstart", handleWorkbenchContextDragStart, true);
  document.addEventListener("dragend", () => {
    document.body.classList.remove("is-dragging-workbench-context");
    fab.classList.remove("is-context-drop");
    composer?.classList.remove("is-drop-target");
  }, true);
  const view = document.getElementById("view");
  if (view && !state._agentContextObserver) {
    state._agentContextObserver = new MutationObserver(() => markWorkbenchContextSources(view));
    state._agentContextObserver.observe(view, { childList: true, subtree: true });
  }
  syncAgentModeUi();
}

const WORKBENCH_CONTEXT_META = {
  project: ["研究", "项目"],
  project_note: ["研究", "项目笔记"],
  paper: ["文献", "文献"],
  paper_note: ["文献", "文献笔记"],
  submission: ["投稿", "投稿"],
  meeting: ["会议", "会议"],
  general_note: ["札记", "普通笔记"],
  idea: ["札记", "想法"],
  inbox: ["札记", "Inbox"],
  task: ["任务", "任务"],
  experiment: ["实验", "实验 Run"],
  thesis_chapter: ["论文", "论文章节"],
  thesis_milestone: ["论文", "论文节点"],
  life: ["生活", "生活记录"],
};

function contextTitleFromElement(element) {
  return (element.querySelector(".title, .t, .note-list-title, .chapter-title")?.textContent || element.textContent || "未命名")
    .replace(/\s+/g, " ").trim().slice(0, 160);
}

function setWorkbenchContextSource(element, type, id) {
  if (!element || !type || !id) return;
  const [group, typeLabel] = WORKBENCH_CONTEXT_META[type] || ["工作台", "上下文"];
  element.draggable = true;
  element.classList.add("wb-context-source");
  element.dataset.wbContextType = type;
  element.dataset.wbContextId = String(id);
  element.dataset.wbContextTitle = contextTitleFromElement(element);
  element.dataset.wbContextGroup = group;
  element.dataset.wbContextTypeLabel = typeLabel;
  element.dataset.wbContextHasPdf = type === "paper" && Boolean((element.dataset.path || "").trim()) ? "true" : "false";
}

function markWorkbenchContextSources(root = document.getElementById("view")) {
  if (!root) return;
  const markAll = (selector, type, idAttr) => root.querySelectorAll(selector).forEach((element) => {
    setWorkbenchContextSource(element, type, element.dataset[idAttr]);
  });
  if (state.route === "research") {
    markAll(".kanban-card[data-pid], [data-openp], [data-pr]", "project", "pid");
    root.querySelectorAll("[data-openp]").forEach((element) => setWorkbenchContextSource(element, "project", element.dataset.openp));
    root.querySelectorAll("[data-pr]").forEach((element) => setWorkbenchContextSource(element, "project", element.dataset.pr));
    if (root.querySelector(".proj-notes-page")) markAll(".proj-notes-list [data-note-id]", "project_note", "noteId");
  } else if (state.route === "papers") {
    markAll(".cat-chip[data-pid]", "paper", "pid");
  } else if (state.route === "outputs") {
    markAll(".list-item[data-sid]", "submission", "sid");
  } else if (state.route === "meetings") {
    markAll(".list-item[data-mid]", "meeting", "mid");
  } else if (state.route === "ideas") {
    root.querySelectorAll("[data-unified-note-key][data-context-type]").forEach((element) => {
      setWorkbenchContextSource(element, element.dataset.contextType, element.dataset.contextId);
    });
    markAll("[data-note-id]", "idea", "noteId");
    markAll("[data-inbox-note-id]", "inbox", "inboxNoteId");
  } else if (state.route === "tasks") {
    markAll(".list-item[data-tid]", "task", "tid");
  } else if (state.route === "projects") {
    markAll("[data-pr]", "project", "pr");
    markAll("[data-open-exp]", "experiment", "openExp");
  } else if (state.route === "thesis") {
    markAll("[data-ms]", "thesis_milestone", "ms");
    markAll(".chapter-row[data-id]", "thesis_chapter", "id");
  } else if (state.route === "life") {
    markAll("[data-editlife]", "life", "editlife");
  }
}

function handleWorkbenchContextDragStart(event) {
  const source = event.target.closest?.(".wb-context-source");
  const interactive = event.target.closest?.("button, input, textarea, select, a");
  if (!source || (interactive && interactive !== source && !interactive.matches("[data-chip-open]"))) return;
  const context = {
    type: source.dataset.wbContextType,
    id: Number(source.dataset.wbContextId),
    title: source.dataset.wbContextTitle,
    group: source.dataset.wbContextGroup,
    type_label: source.dataset.wbContextTypeLabel,
    has_pdf: source.dataset.wbContextHasPdf === "true",
  };
  if (!context.type || !context.id) return;
  event.dataTransfer.setData("application/x-workbench-context", JSON.stringify(context));
  event.dataTransfer.effectAllowed = "copy";
  document.body.classList.add("is-dragging-workbench-context");
  source.classList.add("is-context-dragging");
  setTimeout(() => source.classList.remove("is-context-dragging"), 0);
}

function readDraggedWorkbenchContext(dataTransfer) {
  const raw = dataTransfer?.getData("application/x-workbench-context");
  if (!raw) return null;
  try {
    const context = JSON.parse(raw);
    return context?.type && Number(context?.id) ? { ...context, id: Number(context.id) } : null;
  } catch (_) {
    return null;
  }
}

function handleAgentContextDragOver(event) {
  if (!Array.from(event.dataTransfer?.types || []).includes("application/x-workbench-context")) return;
  event.preventDefault();
  event.currentTarget.classList.add("is-context-drop");
  event.dataTransfer.dropEffect = "copy";
}

function addAgentContext(context) {
  state._agentContexts = state._agentContexts || [];
  if (state._agentContexts.some((item) => agentContextKey(item) === agentContextKey(context))) return toast("该上下文已添加");
  if (state._agentContexts.length >= 12) return toast("每轮最多选择 12 项上下文");
  state._agentContexts.push(context);
  renderAgentContexts();
  toast(context.type === "paper" && context.has_pdf
    ? `已添加文献：${context.title}（发送时自动读取 PDF）`
    : `已添加上下文：${context.title}`);
}

function agentModeForRoute() {
  return state.route === "projects" ? "figure" : "general";
}

function currentAgentHistory() {
  const mode = state._agentMode || agentModeForRoute();
  state._agentHistories = state._agentHistories || { general: [], figure: [] };
  state._agentHistories[mode] = state._agentHistories[mode] || [];
  return state._agentHistories[mode];
}

function agentConversationBusy() {
  return Object.values(state._agentHistories || {}).some((history) => (history || []).some((message) => message.pending));
}

function cleanAgentHistoryForSave(history) {
  return (history || []).filter((message) => !message.pending && message.content).map((message) => ({
    role: message.role,
    content: message.content,
    ...(message.error ? { error: true } : {}),
    ...(message.role === "user" ? {
      files: (message.files || []).slice(0, 8),
      contexts: (message.contexts || []).slice(0, 12),
    } : {}),
  }));
}

function agentConversationTitle(messages) {
  const first = (messages || []).find((message) => message.role === "user");
  const contextTitle = first?.contexts?.[0]?.title || "";
  const content = (first?.content || "").replace(/^请分析已选择的.+$/, "").replace(/\s+/g, " ").trim();
  return (content || contextTitle || "新对话").slice(0, 48);
}

async function saveAgentConversation(mode, history) {
  const messages = cleanAgentHistoryForSave(history);
  if (!messages.some((message) => message.role === "user")) return null;
  state._agentConversationIds = state._agentConversationIds || { general: null, figure: null };
  const payload = {
    title: agentConversationTitle(messages),
    mode,
    backend: mode === "figure" ? (state._agentBackend || "") : "",
    messages,
  };
  try {
    const currentId = state._agentConversationIds[mode];
    const saved = currentId
      ? await API.put(`/ai/conversations/${currentId}`, payload)
      : await API.post("/ai/conversations", payload);
    state._agentConversationIds[mode] = saved.id;
    return saved;
  } catch (error) {
    toast(`历史保存失败：${error.message || "未知错误"}`);
    return null;
  }
}

function startNewAgentConversation() {
  if (agentConversationBusy()) return toast("Scier 正在回复，请等待完成后再新建对话");
  const mode = state._agentMode || "general";
  state._agentHistories[mode] = [];
  state._agentConversationIds[mode] = null;
  state._agentFiles = [];
  state._agentContexts = [];
  const input = document.getElementById("agentInput");
  if (input) input.value = "";
  closeAgentHistory();
  closeAgentContextPicker();
  renderAgentMessages();
  renderAgentFiles();
  renderAgentContexts();
  resizeAgentInput();
  input?.focus();
}

async function toggleAgentHistory() {
  const drawer = document.getElementById("agentHistoryDrawer");
  if (!drawer) return;
  if (!drawer.classList.contains("hidden")) return closeAgentHistory();
  closeAgentContextPicker();
  drawer.classList.remove("hidden");
  drawer.setAttribute("aria-hidden", "false");
  document.getElementById("agentHistory")?.classList.add("active");
  await refreshAgentHistory();
}

function closeAgentHistory() {
  const drawer = document.getElementById("agentHistoryDrawer");
  drawer?.classList.add("hidden");
  drawer?.setAttribute("aria-hidden", "true");
  document.getElementById("agentHistory")?.classList.remove("active");
}

async function refreshAgentHistory() {
  const list = document.getElementById("agentHistoryList");
  if (list) list.innerHTML = `<div class="empty">正在加载…</div>`;
  try {
    state._agentConversationCatalog = await API.get("/ai/conversations?limit=100");
    renderAgentHistory();
  } catch (error) {
    if (list) list.innerHTML = `<div class="empty">历史加载失败：${esc(error.message || "未知错误")}</div>`;
  }
}

function renderAgentHistory() {
  const list = document.getElementById("agentHistoryList");
  if (!list) return;
  const rows = state._agentConversationCatalog || [];
  const activeIds = new Set(Object.values(state._agentConversationIds || {}).filter(Boolean).map(Number));
  document.getElementById("agentHistoryCount").textContent = rows.length ? `${rows.length} 条 · 保存在科研工作台中` : "还没有历史对话";
  list.innerHTML = rows.map((row) => `
    <div class="agent-history-row ${activeIds.has(Number(row.id)) ? "is-active" : ""}" data-agent-history-row="${row.id}">
      <div class="agent-history-main" data-agent-history-open="${row.id}" title="打开并继续对话">
        <div class="agent-history-title">${esc(row.title || "新对话")}</div>
        <div class="agent-history-preview">${esc(row.preview || "暂无摘要")}</div>
        <div class="agent-history-meta">${row.mode === "figure" ? "实验绘图" : "通用对话"} · ${row.message_count || 0} 条消息 · ${esc(fmtDT(row.updated_at))}</div>
      </div>
      <button type="button" class="agent-history-delete" data-agent-history-delete="${row.id}" title="删除历史对话" aria-label="删除历史对话">×</button>
    </div>`).join("") || `<div class="empty">还没有历史对话。发送第一条消息后会自动保存。</div>`;
  list.querySelectorAll("[data-agent-history-open]").forEach((element) => {
    element.onclick = () => loadAgentConversation(Number(element.dataset.agentHistoryOpen));
  });
  list.querySelectorAll("[data-agent-history-delete]").forEach((button) => {
    button.onclick = () => deleteAgentConversation(Number(button.dataset.agentHistoryDelete));
  });
}

async function loadAgentConversation(id) {
  if (agentConversationBusy()) return toast("Scier 正在回复，请等待完成后再切换历史");
  try {
    const conversation = await API.get(`/ai/conversations/${id}`);
    if (conversation.mode === "figure" && state.route !== "projects") {
      return toast("实验绘图历史请在「实验」页面打开");
    }
    const mode = conversation.mode === "figure" ? "figure" : "general";
    state._agentMode = mode;
    state._agentHistories[mode] = Array.isArray(conversation.messages) ? conversation.messages : [];
    state._agentConversationIds[mode] = conversation.id;
    if (mode === "figure") state._agentBackend = conversation.backend || "";
    state._agentFiles = [];
    state._agentContexts = [];
    closeAgentHistory();
    renderAgentMessages();
    renderAgentFiles();
    renderAgentContexts();
    syncAgentModeUi();
  } catch (error) {
    toast(error.message || "历史对话加载失败");
  }
}

async function deleteAgentConversation(id) {
  if (agentConversationBusy()) return toast("Scier 正在回复，请等待完成后再删除历史");
  if (!confirm("删除这条 Scier 历史对话？")) return;
  try {
    await API.del(`/ai/conversations/${id}`);
    for (const mode of ["general", "figure"]) {
      if (Number(state._agentConversationIds?.[mode]) === id) {
        state._agentConversationIds[mode] = null;
        state._agentHistories[mode] = [];
      }
    }
    state._agentConversationCatalog = (state._agentConversationCatalog || []).filter((row) => Number(row.id) !== id);
    renderAgentHistory();
    renderAgentMessages();
    toast("历史对话已删除");
  } catch (error) {
    toast(error.message || "删除失败");
  }
}

function syncAgentContext() {
  const next = agentModeForRoute();
  if (state._agentMode === next) return;
  state._agentMode = next;
  state._agentFiles = [];
  state._agentContexts = [];
  syncAgentModeUi();
  renderAgentMessages();
  renderAgentFiles();
  renderAgentContexts();
}

function setAgentMode(mode) {
  state._agentMode = mode === "figure" && state.route === "projects" ? "figure" : "general";
  syncAgentModeUi();
  renderAgentMessages();
}

function syncAgentModeUi() {
  const panel = document.getElementById("agentPanel");
  const mode = state._agentMode || agentModeForRoute();
  const be = state._agentBackend || "";
  panel?.classList.toggle("is-figure", mode === "figure");
  document.getElementById("agentFigureTools")?.classList.toggle("hidden", mode !== "figure");
  document.querySelectorAll("[data-agent-be]").forEach((b) => {
    b.classList.toggle("active", mode === "figure" && b.dataset.agentBe === be);
  });
  const title = document.getElementById("agentTitle");
  if (title) title.textContent = "Scier";
  const badge = document.getElementById("agentContextBadge");
  if (badge) badge.textContent = mode === "figure" ? "实验绘图" : "通用对话";
  const input = document.getElementById("agentInput");
  if (input) input.placeholder = mode === "figure" ? "告诉 Scier 要表达的结论、数据和图形要求" : "给 Scier 发送消息";
  const attachHint = document.getElementById("agentAttachHint");
  if (attachHint) attachHint.textContent = mode === "figure" ? "数据、代码或实验上下文" : "文件或工作台记录";
  const fab = document.getElementById("agentFab");
  if (fab) {
    const action = panel?.classList.contains("hidden") ? "打开" : "关闭";
    const label = mode === "figure" ? `${action} Scier（实验绘图）` : `${action} Scier`;
    fab.title = label;
    fab.setAttribute("aria-label", label);
  }
  const hint = document.getElementById("agentModelHint");
  if (hint) {
    const base = hint.dataset.model || (hint.textContent || "LLM").split("·")[0].trim();
    hint.dataset.model = base;
    hint.textContent = mode === "figure" ? `${base} · ${be || "选择 Python/R"}` : base;
  }
}

function startNatureFigureWorkflow(opts = {}) {
  if (!ensureLlmEnabled()) return;
  if (state.route !== "projects") return toast("Scier 的科研绘图模式仅在「实验」页面启用");
  setAgentMode("figure");
  const pack = (opts.packPrompt || "").trim();
  const be = state._agentBackend || "";
  const lines = [
    "【启动 nature-figure 画图流程】",
    "请严格按 skill 协议：后端门禁 → figure contract → stance → 写脚本 → QA。",
  ];
  if (be) lines.push(`我已选择后端：${be}`);
  else lines.push("我尚未选择后端（请先问 Python or R?）。");
  if (pack) {
    lines.push("", "【参考图 / 代码包】", pack, "", "【请继续】请先走协议；我会补充/已附上数据说明。");
  } else {
    lines.push("", "请先完成后端门禁与 figure contract，再向我要结论、面板与数据。");
  }
  openFloatingAgent({ seed: "", autoSend: lines.join("\n") });
}

function openFloatingAgent(opts = {}) {
  const panel = document.getElementById("agentPanel");
  if (!panel) return;
  panel.classList.remove("hidden");
  panel.setAttribute("aria-hidden", "false");
  const fab = document.getElementById("agentFab");
  fab?.classList.add("is-open");
  fab?.setAttribute("aria-expanded", "true");
  syncAgentContext();
  if (opts.mode) setAgentMode(opts.mode);
  if (opts.backend) {
    state._agentBackend = opts.backend;
    syncAgentModeUi();
  }
  if (opts.seed) {
    const inp = document.getElementById("agentInput");
    if (inp) {
      inp.value = opts.seed;
      inp.focus();
      inp.scrollTop = 0;
    }
  }
  renderAgentMessages();
  renderAgentFiles();
  renderAgentContexts();
  syncAgentModeUi();
  resizeAgentInput();
  document.getElementById("agentInput")?.focus();
  if (opts.autoSend) {
    const inp = document.getElementById("agentInput");
    if (inp) inp.value = opts.autoSend;
    sendFloatingAgent();
  }
}

function closeFloatingAgent() {
  const panel = document.getElementById("agentPanel");
  if (!panel) return;
  panel.classList.add("hidden");
  panel.setAttribute("aria-hidden", "true");
  const fab = document.getElementById("agentFab");
  fab?.classList.remove("is-open");
  fab?.setAttribute("aria-expanded", "false");
  closeAgentHistory();
  closeAgentContextPicker();
  syncAgentModeUi();
}

function agentContextKey(context) {
  return `${context.type}:${context.id}`;
}

function agentContextQueryUrl() {
  const params = new URLSearchParams({ route: state.route || "" });
  if (state.openProjectId) params.set("project_id", String(state.openProjectId));
  if (state.selectedPaperId) params.set("paper_id", String(state.selectedPaperId));
  const noteId = state.selectedIdeaId || state.selectedInboxId;
  if (noteId) params.set("note_id", String(noteId));
  return `/ai/contexts?${params.toString()}`;
}

async function openAgentContextPicker() {
  closeAgentHistory();
  const picker = document.getElementById("agentContextPicker");
  if (!picker) return;
  picker.classList.remove("hidden");
  picker.setAttribute("aria-hidden", "false");
  document.getElementById("agentContextList").innerHTML = `<div class="empty">正在读取工作台内容…</div>`;
  try {
    state._agentContextCatalog = await API.get(agentContextQueryUrl());
    const routeGroups = { research: "研究", papers: "文献", outputs: "投稿", meetings: "会议", ideas: "札记", tasks: "任务", projects: "实验", thesis: "论文", life: "生活" };
    state._agentContextGroup = routeGroups[state.route] || "研究";
    const preferredOrder = {
      research: ["project", "project_note", "engineering_record"], papers: ["paper", "paper_note"],
      outputs: ["submission"], meetings: ["meeting"], ideas: [state.notesTab === "ideas" ? "idea" : state.notesTab === "inbox" ? "inbox" : "general_note", "project_note", "paper_note"],
      tasks: ["task"], projects: ["experiment", "project"], thesis: ["thesis_chapter", "thesis_milestone", "thesis"], life: ["life"],
    };
    state._agentContextType = (preferredOrder[state.route] || []).find((type) => (state._agentContextCatalog.items || []).some((item) => item.group === state._agentContextGroup && item.type === type)) || "";
    renderAgentContextPicker();
    document.getElementById("agentContextSearch")?.focus();
  } catch (error) {
    document.getElementById("agentContextList").innerHTML = `<div class="empty">加载失败：${esc(error.message || "未知错误")}</div>`;
  }
}

function closeAgentContextPicker() {
  const picker = document.getElementById("agentContextPicker");
  if (!picker) return;
  picker.classList.add("hidden");
  picker.setAttribute("aria-hidden", "true");
}

function renderAgentContextPicker() {
  const catalog = state._agentContextCatalog || { items: [], preferred_types: [], max_selected: 12 };
  const selected = new Set((state._agentContexts || []).map(agentContextKey));
  const groups = [...new Set((catalog.items || []).map((item) => item.group))];
  const currentGroup = state._agentContextGroup || groups[0] || "研究";
  const filters = document.getElementById("agentContextFilters");
  if (filters) {
    const groupOrder = ["研究", "文献", "投稿", "会议", "札记", "任务", "实验", "论文", "生活"];
    const orderedGroups = groupOrder.filter((group) => groups.includes(group));
    filters.innerHTML = orderedGroups.map((group) => `<button type="button" class="${currentGroup === group ? "active" : ""}" data-agent-context-group="${esc(group)}">${esc(group)}</button>`).join("");
    filters.querySelectorAll("[data-agent-context-group]").forEach((btn) => {
      btn.onclick = () => {
        state._agentContextGroup = btn.dataset.agentContextGroup;
        state._agentContextType = "";
        renderAgentContextPicker();
      };
    });
  }
  const types = [...new Map((catalog.items || []).filter((item) => item.group === currentGroup).map((item) => [item.type, item.type_label])).entries()];
  if (!types.some(([type]) => type === state._agentContextType)) state._agentContextType = types[0]?.[0] || "";
  const typeHost = document.getElementById("agentContextTypes");
  if (typeHost) {
    typeHost.innerHTML = types.map(([type, label]) => {
      const count = (catalog.items || []).filter((item) => item.group === currentGroup && item.type === type).length;
      return `<button type="button" class="${state._agentContextType === type ? "active" : ""}" data-agent-context-type="${esc(type)}">${esc(label)} <span>${count}</span></button>`;
    }).join("");
    typeHost.querySelectorAll("[data-agent-context-type]").forEach((btn) => {
      btn.onclick = () => {
        state._agentContextType = btn.dataset.agentContextType;
        renderAgentContextPicker();
      };
    });
  }
  const query = (document.getElementById("agentContextSearch")?.value || "").trim().toLowerCase();
  const visible = (catalog.items || []).filter((item) => {
    if (item.group !== currentGroup || item.type !== state._agentContextType) return false;
    return !query || `${item.title} ${item.subtitle} ${item.type_label} ${item.group}`.toLowerCase().includes(query);
  });
  const list = document.getElementById("agentContextList");
  if (list) {
    list.innerHTML = visible.map((item) => {
      const key = agentContextKey(item);
      return `<button type="button" class="agent-context-row ${selected.has(key) ? "is-selected" : ""}" data-agent-context-key="${esc(key)}">
        <span class="agent-context-check">${selected.has(key) ? "✓" : "+"}</span>
        <span class="agent-context-row-main"><span class="agent-context-row-title">${esc(item.title)}</span><span class="agent-context-row-sub">${esc(item.type_label)}${item.has_pdf ? " + PDF（发送时自动读取）" : ""}${item.subtitle ? " · " + esc(item.subtitle) : ""}</span></span>
      </button>`;
    }).join("") || `<div class="empty">没有匹配的工作台内容</div>`;
    list.querySelectorAll("[data-agent-context-key]").forEach((row) => {
      row.onclick = () => {
        const item = (catalog.items || []).find((candidate) => agentContextKey(candidate) === row.dataset.agentContextKey);
        if (!item) return;
        const index = state._agentContexts.findIndex((context) => agentContextKey(context) === row.dataset.agentContextKey);
        if (index >= 0) state._agentContexts.splice(index, 1);
        else if (state._agentContexts.length >= Number(catalog.max_selected || 12)) return toast(`每轮最多选择 ${catalog.max_selected || 12} 项上下文`);
        else state._agentContexts.push(item);
        renderAgentContexts();
        renderAgentContextPicker();
      };
    });
  }
  const count = document.getElementById("agentContextCount");
  if (count) count.textContent = `已选择 ${state._agentContexts.length}/${catalog.max_selected || 12}`;
  const hint = document.getElementById("agentContextPickerHint");
  if (hint) hint.textContent = `${currentGroup} · ${types.find(([type]) => type === state._agentContextType)?.[1] || "请选择类型"} · 也可直接把工作台卡片拖到 Scier`;
}

function renderAgentContexts() {
  const host = document.getElementById("agentContexts");
  if (!host) return;
  const contexts = state._agentContexts || [];
  host.innerHTML = contexts.map((context, index) => `
    <span class="agent-context-chip" title="${esc(context.group)} · ${esc(context.title)}${context.has_pdf ? " · 发送时自动读取 PDF" : ""}"><b>${esc(context.type_label || context.group)}${context.has_pdf ? " + PDF" : ""}</b>${esc(context.title)}
      <button type="button" data-agent-context-x="${index}" title="移除">×</button>
    </span>`).join("");
  host.querySelectorAll("[data-agent-context-x]").forEach((btn) => {
    btn.onclick = () => {
      state._agentContexts.splice(Number(btn.dataset.agentContextX), 1);
      renderAgentContexts();
      renderAgentContextPicker();
    };
  });
}

function renderAgentFiles() {
  const host = document.getElementById("agentFiles");
  if (!host) return;
  const files = state._agentFiles || [];
  if (!files.length) {
    host.innerHTML = "";
    return;
  }
  host.innerHTML = files.map((file, i) => `
    <span class="agent-file-chip" title="${esc(file.name || file.path)}">${esc(file.name || file.path)} · ${formatAgentFileSize(file.size)}
      <button type="button" data-af-x="${i}" title="移除">×</button>
    </span>`).join("");
  host.querySelectorAll("[data-af-x]").forEach((btn) => {
    btn.onclick = () => {
      state._agentFiles.splice(Number(btn.dataset.afX), 1);
      renderAgentFiles();
    };
  });
}

function formatAgentFileSize(size) {
  const n = Number(size || 0);
  if (!n) return "文件";
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${Math.ceil(n / 1024)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

async function uploadAgentFiles(fileList) {
  const files = [...(fileList || [])];
  if (!files.length) return;
  const fd = new FormData();
  files.forEach((file) => fd.append("files", file));
  const add = document.getElementById("agentAddFile");
  if (add) add.disabled = true;
  try {
    const result = await API.post("/ai/agent/files", fd);
    const existing = new Set((state._agentFiles || []).map((file) => file.path));
    (result.files || []).forEach((file) => {
      if (!existing.has(file.path)) state._agentFiles.push(file);
    });
    renderAgentFiles();
    toast(`已添加 ${result.files?.length || 0} 个文件`);
  } catch (error) {
    toast(error.message || "文件添加失败");
  } finally {
    if (add) add.disabled = false;
  }
}

function resizeAgentInput() {
  const input = document.getElementById("agentInput");
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${Math.min(150, Math.max(38, input.scrollHeight))}px`;
}

function agentPendingLabel(message) {
  const elapsed = Math.max(0, Math.floor((Date.now() - Number(message.startedAt || Date.now())) / 1000));
  if (elapsed < 3) return "正在理解你的问题";
  if ((message.paperContextCount || 0) > 0 && elapsed < 12) return "正在解析文献 PDF";
  if ((message.contextCount || 0) > 0 && elapsed < 9) return "正在读取工作台上下文";
  if ((message.attachmentCount || 0) > 0 && elapsed < 9) return "正在读取并分析附件";
  if (elapsed < 12) return "正在分析关键信息";
  if (elapsed < 25) return "正在组织 Markdown 回答";
  return "仍在处理较复杂的内容";
}

function stopAgentPendingTicker() {
  if (state._agentPendingTimer) clearInterval(state._agentPendingTimer);
  state._agentPendingTimer = null;
}

function startAgentPendingTicker(pendingId, history) {
  stopAgentPendingTicker();
  const paint = () => {
    const pending = history.find((message) => message.pendingId === pendingId);
    if (!pending) return stopAgentPendingTicker();
    const elapsed = Math.max(0, Math.floor((Date.now() - pending.startedAt) / 1000));
    document.querySelectorAll(`[data-agent-pending-status="${pendingId}"]`).forEach((el) => {
      el.textContent = agentPendingLabel(pending);
    });
    document.querySelectorAll(`[data-agent-pending-time="${pendingId}"]`).forEach((el) => {
      el.textContent = `${elapsed}s`;
    });
  };
  paint();
  state._agentPendingTimer = setInterval(paint, 1000);
}

function editAgentMessage(index) {
  const history = currentAgentHistory();
  const message = history[index];
  if (!message || message.role !== "user" || history.some((item) => item.pending)) return;
  history.forEach((item) => { delete item.editing; });
  message.editing = true;
  renderAgentMessages();
  const editor = document.querySelector(`[data-agent-edit-text="${index}"]`);
  editor?.focus();
  editor?.setSelectionRange(editor.value.length, editor.value.length);
}

function cancelAgentMessageEdit(index) {
  const message = currentAgentHistory()[index];
  if (message) delete message.editing;
  renderAgentMessages();
}

function resendEditedAgentMessage(index) {
  const history = currentAgentHistory();
  const message = history[index];
  const editor = document.querySelector(`[data-agent-edit-text="${index}"]`);
  const content = (editor?.value || "").trim();
  if (!message || !content) return toast("消息不能为空");
  const files = [...(message.files || [])];
  const contexts = [...(message.contexts || [])];
  history.splice(index);
  state._agentFiles = files;
  state._agentContexts = contexts;
  const input = document.getElementById("agentInput");
  if (input) input.value = content;
  renderAgentFiles();
  renderAgentContexts();
  resizeAgentInput();
  sendFloatingAgent();
}

function renderAgentMessages() {
  const host = document.getElementById("agentMessages");
  if (!host) return;
  const hist = currentAgentHistory();
  const mode = state._agentMode || "general";
  if (!hist.length) {
    host.innerHTML = mode === "figure"
      ? `<div class="empty" style="padding:20px 12px">Scier 已进入实验绘图模式。请选择 Python 或 R，然后描述图要表达的结论；也可以附加数据、代码或参考 PDF。</div>`
      : `<div class="empty" style="padding:20px 12px">Scier 可以协助梳理问题、分析材料、写作与编程。可直接提问，或点击输入框左下角的“＋”添加文件。</div>`;
    return;
  }
  const hasPending = hist.some((message) => message.pending);
  host.innerHTML = hist.map((m, index) => `
    <div class="agent-msg ${m.role === "user" ? "is-user" : "is-bot"} ${m.pending ? "is-pending" : ""}" data-agent-index="${index}">
      <div class="agent-msg-role">${m.role === "user" ? "你" : "Scier"}</div>
      ${(m.contexts || []).length ? `<div class="agent-msg-contexts">${m.contexts.map((context) => `<span class="agent-msg-context"><b>${esc(context.type_label || context.group)}</b>${esc(context.title)}</span>`).join("")}</div>` : ""}
      ${(m.files || []).length ? `<div class="agent-msg-attachments">${m.files.map((file) => `<span class="agent-msg-attachment">${esc(file.name || "附件")}</span>`).join("")}</div>` : ""}
      ${m.editing
        ? `<div class="agent-edit-wrap">
            <textarea data-agent-edit-text="${index}" rows="4">${esc(m.content || "")}</textarea>
            <div class="agent-edit-actions"><button type="button" class="btn ghost small" data-agent-edit-cancel="${index}">取消</button><button type="button" class="btn small" data-agent-edit-send="${index}">保存并重新发送</button></div>
          </div>`
        : m.pending
          ? `<div class="agent-msg-body agent-thinking">
              <span class="agent-thinking-dots" aria-hidden="true"><i></i><i></i><i></i></span>
              <span data-agent-pending-status="${m.pendingId}">${esc(agentPendingLabel(m))}</span>
              <span class="agent-thinking-time" data-agent-pending-time="${m.pendingId}">0s</span>
            </div>`
          : `<div class="agent-msg-body ${m.role === "assistant" ? "md-body" : ""}">${m.role === "assistant" ? renderMarkdown(m.content || "") : esc(m.content || "").replace(/\n/g, "<br>")}</div>`}
      ${!m.editing && !m.pending ? `<div class="agent-msg-actions">
        ${m.role === "user" && !hasPending ? `<button type="button" data-agent-edit="${index}" title="编辑并从这里重新发送">编辑并重发</button>` : ""}
        ${m.role === "assistant" && !m.error ? `<button type="button" data-agent-copy="${index}" title="复制原始 Markdown">复制 Markdown</button>` : ""}
      </div>` : ""}
    </div>`).join("");
  host.querySelectorAll(".agent-msg-body.md-body").forEach((body) => hydrateMarkdown(body));
  host.querySelectorAll("[data-agent-edit]").forEach((btn) => {
    btn.onclick = () => editAgentMessage(Number(btn.dataset.agentEdit));
  });
  host.querySelectorAll("[data-agent-copy]").forEach((btn) => {
    btn.onclick = () => copyText(hist[Number(btn.dataset.agentCopy)]?.content || "", "Markdown 已复制");
  });
  host.querySelectorAll("[data-agent-edit-cancel]").forEach((btn) => {
    btn.onclick = () => cancelAgentMessageEdit(Number(btn.dataset.agentEditCancel));
  });
  host.querySelectorAll("[data-agent-edit-send]").forEach((btn) => {
    btn.onclick = () => resendEditedAgentMessage(Number(btn.dataset.agentEditSend));
  });
  host.scrollTop = host.scrollHeight;
}

async function sendFloatingAgent() {
  if (!ensureLlmEnabled()) return;
  const inp = document.getElementById("agentInput");
  const text = (inp?.value || "").trim();
  const files = [...(state._agentFiles || [])];
  const contexts = [...(state._agentContexts || [])];
  if (!text && !files.length && !contexts.length) return toast("输入内容、添加文件或选择工作台上下文");
  const btn = document.getElementById("agentSend");
  if (btn) btn.disabled = true;
  const history = currentAgentHistory();
  const fallback = [files.length ? `${files.length} 个文件` : "", contexts.length ? `${contexts.length} 项工作台上下文` : ""].filter(Boolean).join("和");
  history.push({ role: "user", content: text || `请分析已选择的${fallback}`, files, contexts });
  const requestHistory = history.slice(0, -1).map((m) => ({ role: m.role, content: m.content }));
  const activeContexts = [];
  const activeContextKeys = new Set();
  const activeFiles = [];
  const activeFileKeys = new Set();
  for (const message of [...history].reverse()) {
    for (const context of (message.contexts || [])) {
      const key = agentContextKey(context);
      if (activeContextKeys.has(key) || activeContexts.length >= 12) continue;
      activeContextKeys.add(key);
      activeContexts.push(context);
    }
    for (const file of (message.files || [])) {
      const key = file.path || file.name;
      if (!key || activeFileKeys.has(key) || activeFiles.length >= 8) continue;
      activeFileKeys.add(key);
      activeFiles.push(file);
    }
  }
  const pendingId = `agent-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  history.push({
    role: "assistant", content: "", pending: true, pendingId, startedAt: Date.now(),
    attachmentCount: activeFiles.length,
    contextCount: contexts.length,
    paperContextCount: activeContexts.filter((context) => context.type === "paper").length,
  });
  renderAgentMessages();
  startAgentPendingTicker(pendingId, history);
  if (inp) inp.value = "";
  state._agentFiles = [];
  state._agentContexts = [];
  renderAgentFiles();
  renderAgentContexts();
  closeAgentContextPicker();
  resizeAgentInput();
  const mode = state._agentMode || "general";
  await saveAgentConversation(mode, history);
  // auto-capture backend from short replies
  if (mode === "figure" && !state._agentBackend) {
    const low = text.toLowerCase();
    if (low === "python" || low === "py" || low.includes("用python") || low.includes("matplotlib")) {
      state._agentBackend = "python";
      syncAgentModeUi();
    } else if (low === "r" || low.includes("ggplot") || low.includes("用r")) {
      state._agentBackend = "r";
      syncAgentModeUi();
    }
  }
  try {
    const r = await API.post("/ai/agent", {
      message: text,
      file_paths: activeFiles.map((file) => file.path),
      context_refs: activeContexts.map((context) => ({ type: context.type, id: context.id })),
      mode,
      backend: state._agentBackend || "",
      history: requestHistory,
    });
    const pendingIndex = history.findIndex((message) => message.pendingId === pendingId);
    const reply = { role: "assistant", content: r.content || "" };
    if (pendingIndex >= 0) history.splice(pendingIndex, 1, reply);
    else history.push(reply);
    if (r.backend && !state._agentBackend) {
      state._agentBackend = r.backend;
    }
    const hint = document.getElementById("agentModelHint");
    if (hint && r.model) {
      hint.dataset.model = r.model;
      hint.textContent = r.model;
    }
    syncAgentModeUi();
    renderAgentMessages();
    if (mode === "figure" && r.nature_figure_loaded === false) {
      toast("未找到本机 nature-figure skill，已用协议摘要");
    }
  } catch (e) {
    const pendingIndex = history.findIndex((message) => message.pendingId === pendingId);
    const failure = { role: "assistant", content: `错误：${e.message || "请求失败"}`, error: true };
    if (pendingIndex >= 0) history.splice(pendingIndex, 1, failure);
    else history.push(failure);
    renderAgentMessages();
    toast(e.message || "Scier 请求失败");
  } finally {
    stopAgentPendingTicker();
    await saveAgentConversation(mode, history);
    if (btn) btn.disabled = false;
  }
}
