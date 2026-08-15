const API = {
  async request(path, options = {}) {
    const opts = { ...options };
    opts.headers = { ...(options.headers || {}) };
    if (opts.body && typeof opts.body === "object" && !(opts.body instanceof FormData)) {
      opts.headers["Content-Type"] = "application/json";
      opts.body = JSON.stringify(opts.body);
    }
    const res = await fetch(`/api${path}`, opts);
    if (!res.ok) {
      let detail = res.statusText;
      try {
        const data = await res.json();
        detail = data.detail || JSON.stringify(data);
      } catch (_) {}
      throw new Error(detail);
    }
    if (res.status === 204) return null;
    const ct = res.headers.get("content-type") || "";
    if (ct.includes("application/json")) return res.json();
    return res;
  },
  get: (p) => API.request(p),
  post: (p, body) => API.request(p, { method: "POST", body }),
  put: (p, body) => API.request(p, { method: "PUT", body }),
  del: (p, body) => API.request(p, { method: "DELETE", ...(body !== undefined ? { body } : {}) }),
};

function toast(msg) {
  const el = document.getElementById("toast");
  el.textContent = msg;
  el.classList.remove("hidden");
  clearTimeout(window.__toastTimer);
  window.__toastTimer = setTimeout(() => el.classList.add("hidden"), 2200);
}

function esc(s) {
  return String(s ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function fmtDate(d) {
  if (!d) return "—";
  return String(d).slice(0, 10);
}

function fmtDT(d) {
  if (!d) return "—";
  return String(d).replace("T", " ").slice(0, 16);
}

function openModal(html, opts = {}) {
  const modal = document.getElementById("modal");
  const card = document.getElementById("modalCard");
  card.innerHTML = html;
  card.classList.toggle("modal-wide", !!opts.wide);
  modal.classList.remove("hidden");
}

function closeModal() {
  document.getElementById("modal").classList.add("hidden");
  document.getElementById("modalCard")?.classList.remove("modal-wide");
}

document.addEventListener("click", (e) => {
  if (e.target?.dataset?.close) closeModal();
});
