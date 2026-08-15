/* global pdfjsLib */

pdfjsLib.GlobalWorkerOptions.workerSrc =
  "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

const Reader = {
  pdf: null,
  paperId: null,
  page: 1,
  /** user zoom multiplier on top of fit-width */
  zoom: 1,
  color: "yellow",
  annotations: [],
  annOpen: false,
  _pending: null,
  _resizeObs: null,
  _wheelAcc: 0,
  _pageFlipLock: false,
  _onWheel: null,
  _renderToken: 0,
  _renderTask: null,
  _lastWrapWidth: 0,
  _drag: null,
  _annPos: null, // {left, top, width, height}

  async open(paperId, mountEl, onChange) {
    this.paperId = paperId;
    this.onChange = onChange;
    this.page = 1;
    this.zoom = 1;
    this.annOpen = false;
    this._wheelAcc = 0;
    this._pageFlipLock = false;
    this._renderToken = 0;
    this._annPos = null;
    if (this._renderTask) {
      try { this._renderTask.cancel(); } catch (_) {}
      this._renderTask = null;
    }
    if (this._resizeObs) {
      this._resizeObs.disconnect();
      this._resizeObs = null;
    }
    if (this._textSelDocUp) {
      document.removeEventListener("mouseup", this._textSelDocUp);
      this._textSelDocUp = null;
    }
    const url = `/api/papers/${paperId}/file`;
    this.pdf = await pdfjsLib.getDocument(url).promise;
    this.annotations = await API.get(`/papers/${paperId}/annotations`);
    mountEl.innerHTML = `
      <div class="reader">
        <div class="reader-toolbar">
          <button class="btn secondary small" id="prevPage">上一页</button>
          <button class="btn secondary small" id="nextPage">下一页</button>
          <span class="meta" id="pageInfo"></span>
          <button class="btn ghost small" id="zoomOut" title="缩小">−</button>
          <button class="btn ghost small" id="zoomFit" title="按阅读区宽度适配">适合宽</button>
          <button class="btn ghost small" id="zoomIn" title="放大">+</button>
          <label class="zoom-pct" title="相对「适合宽」的缩放百分比，可直接输入">
            <input type="number" id="zoomPct" min="50" max="300" step="1" value="100" />
            <span>%</span>
          </label>
          <label class="meta">高亮色
            <select id="hlColor">
              <option value="yellow">黄·要点</option>
              <option value="green">绿·方法</option>
              <option value="red">红·质疑</option>
              <option value="blue">蓝·可引用</option>
            </select>
          </label>
          <span class="meta reader-scroll-hint">选中文字后点 ✎ 添加批注 · 滚轮到底/顶翻页</span>
        </div>
        <div class="reader-stage" id="readerStage">
          <div class="pdf-wrap" id="pdfWrap" tabindex="0"></div>
          <button type="button" class="ann-fab" id="annFab" title="批注列表">
            <span class="ann-fab-ico" aria-hidden="true">✎</span>
            <span class="ann-fab-badge hidden" id="annBadge">0</span>
          </button>
          <div class="ann-float" id="annDrawer" hidden>
            <div class="ann-float-head" id="annDragHandle">
              <h3>批注</h3>
              <button type="button" class="btn ghost small" id="reloadAnn">刷新</button>
              <button type="button" class="btn ghost small" id="closeAnn">收起</button>
            </div>
            <div id="annList" class="ann-float-body"></div>
            <div class="ann-float-resizer" aria-hidden="true"></div>
          </div>
          <button type="button" class="sel-ann-marker" id="selAnnMarker" hidden title="添加批注">✎</button>
          <div class="sel-ann-pop" id="selAnnPop" hidden>
            <div class="sel-ann-quote" id="selAnnQuote"></div>
            <label class="meta sel-ann-label">高亮色
              <select id="selAnnColor">
                <option value="yellow">黄·要点</option>
                <option value="green">绿·方法</option>
                <option value="red">红·质疑</option>
                <option value="blue">蓝·可引用</option>
              </select>
            </label>
            <textarea id="selAnnComment" rows="3" placeholder="备注 / 批注（可选）"></textarea>
            <input id="selAnnTags" type="text" placeholder="标签（可选，逗号分隔）" />
            <div class="sel-ann-actions">
              <button type="button" class="btn ghost small" id="selAnnCancel">取消</button>
              <button type="button" class="btn small" id="selAnnSave">保存批注</button>
            </div>
          </div>
        </div>
      </div>`;
    mountEl.querySelector("#prevPage").onclick = () => this.go(this.page - 1, { fromScroll: "up" });
    mountEl.querySelector("#nextPage").onclick = () => this.go(this.page + 1, { fromScroll: "down" });
    mountEl.querySelector("#hlColor").onchange = (e) => {
      this.color = e.target.value;
      const sc = document.getElementById("selAnnColor");
      if (sc) sc.value = this.color;
    };
    mountEl.querySelector("#zoomIn").onclick = () => this.setZoom(this.zoom * 1.15);
    mountEl.querySelector("#zoomOut").onclick = () => this.setZoom(this.zoom / 1.15);
    mountEl.querySelector("#zoomFit").onclick = () => this.setZoom(1);
    this._bindZoomInput(mountEl.querySelector("#zoomPct"));
    this._bindSelAnnotUI(mountEl);
    mountEl.querySelector("#annFab").onclick = (e) => {
      e.stopPropagation();
      this.toggleAnnDrawer(true);
    };
    mountEl.querySelector("#closeAnn").onclick = (e) => {
      e.stopPropagation();
      this.toggleAnnDrawer(false);
    };
    mountEl.querySelector("#reloadAnn").onclick = async (e) => {
      e.stopPropagation();
      this.annotations = await API.get(`/papers/${paperId}/annotations`);
      this.renderAnnList();
      this.renderPage({ keepScrollRatio: true });
    };
    const wrap = mountEl.querySelector("#pdfWrap");
    const drawer = mountEl.querySelector("#annDrawer");
    this._bindWheel(wrap);
    this._bindAnnWindow(drawer, mountEl.querySelector("#readerStage"));
    // 点 PDF 空白处关闭悬浮批注（选文字时不关）
    wrap.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      const onSelUi = e.target.closest?.("#selAnnMarker, #selAnnPop");
      if (!onSelUi) {
        // 开始新选区时收起旧气泡（保留 pending 直到新选区捕获）
        const pop = document.getElementById("selAnnPop");
        if (pop && !pop.hidden) this._hideSelAnnot({ keepPending: true });
      }
      if (!this.annOpen) return;
      this._pdfPointerDown = { x: e.clientX, y: e.clientY, t: Date.now() };
    });
    wrap.addEventListener("pointerup", (e) => {
      if (!this.annOpen || !this._pdfPointerDown) return;
      const dx = Math.abs(e.clientX - this._pdfPointerDown.x);
      const dy = Math.abs(e.clientY - this._pdfPointerDown.y);
      const moved = dx > 4 || dy > 4;
      const sel = window.getSelection();
      const hasSel = sel && !sel.isCollapsed && String(sel).trim();
      this._pdfPointerDown = null;
      if (!moved && !hasSel) this.toggleAnnDrawer(false);
    });
    wrap.addEventListener("scroll", () => {
      if (this._pending?.anchor) this._placeSelMarker();
    }, { passive: true });
    if (window.ResizeObserver && wrap) {
      let t = null;
      this._resizeObs = new ResizeObserver(() => {
        if (this._suppressResize) return;
        const w = Math.round(wrap.clientWidth);
        if (Math.abs(w - this._lastWrapWidth) < 12) return;
        clearTimeout(t);
        t = setTimeout(() => {
          if (this._suppressResize) return;
          this._lastWrapWidth = w;
          this.renderPage({ keepScrollRatio: true });
        }, 200);
      });
      this._resizeObs.observe(wrap);
      this._lastWrapWidth = Math.round(wrap.clientWidth);
    }
    await this.renderPage();
    this.renderAnnList();
  },

  toggleAnnDrawer(open) {
    this.annOpen = open ?? !this.annOpen;
    const drawer = document.getElementById("annDrawer");
    const fab = document.getElementById("annFab");
    if (!drawer || !fab) return;
    drawer.hidden = !this.annOpen;
    fab.classList.toggle("is-open", this.annOpen);
    if (this.annOpen) {
      this._placeAnnWindow(drawer);
      this.renderAnnList();
    }
  },

  _placeAnnWindow(drawer) {
    const stage = document.getElementById("readerStage");
    if (!stage || !drawer) return;
    const sr = stage.getBoundingClientRect();
    const pos = this._annPos || {
      left: Math.max(16, sr.width - 360),
      top: 36,
      width: 320,
      height: Math.min(440, Math.max(240, sr.height - 72)),
    };
    this._annPos = pos;
    drawer.style.left = `${pos.left}px`;
    drawer.style.top = `${pos.top}px`;
    drawer.style.width = `${pos.width}px`;
    drawer.style.height = `${pos.height}px`;
  },

  _bindAnnWindow(drawer, stage) {
    if (!drawer || !stage) return;
    const handle = drawer.querySelector("#annDragHandle");
    const onMove = (e) => {
      if (!this._drag) return;
      const sr = stage.getBoundingClientRect();
      let left = e.clientX - this._drag.ox;
      let top = e.clientY - this._drag.oy;
      const maxL = sr.width - drawer.offsetWidth - 8;
      const maxT = sr.height - 48;
      left = Math.max(8, Math.min(maxL, left));
      top = Math.max(8, Math.min(maxT, top));
      drawer.style.left = `${left}px`;
      drawer.style.top = `${top}px`;
      this._annPos = {
        ...(this._annPos || {}),
        left,
        top,
        width: drawer.offsetWidth,
        height: drawer.offsetHeight,
      };
    };
    const onUp = () => {
      this._drag = null;
      document.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerup", onUp);
      handle?.classList.remove("is-dragging");
    };
    handle?.addEventListener("pointerdown", (e) => {
      if (e.target.closest("button")) return;
      e.preventDefault();
      const left = parseFloat(drawer.style.left) || drawer.offsetLeft;
      const top = parseFloat(drawer.style.top) || drawer.offsetTop;
      this._drag = { ox: e.clientX - left, oy: e.clientY - top };
      handle.classList.add("is-dragging");
      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    });
    // 右下角拖拽改尺寸
    const resizer = drawer.querySelector(".ann-float-resizer");
    let resizing = null;
    const onResizeMove = (e) => {
      if (!resizing) return;
      const w = Math.max(240, Math.min(stage.clientWidth - 16, e.clientX - resizing.startX + resizing.w0));
      const h = Math.max(180, Math.min(stage.clientHeight - 16, e.clientY - resizing.startY + resizing.h0));
      drawer.style.width = `${w}px`;
      drawer.style.height = `${h}px`;
      this._annPos = {
        ...(this._annPos || {}),
        left: parseFloat(drawer.style.left) || 0,
        top: parseFloat(drawer.style.top) || 0,
        width: w,
        height: h,
      };
    };
    const onResizeUp = () => {
      resizing = null;
      document.removeEventListener("pointermove", onResizeMove);
      document.removeEventListener("pointerup", onResizeUp);
    };
    resizer?.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      resizing = {
        startX: e.clientX,
        startY: e.clientY,
        w0: drawer.offsetWidth,
        h0: drawer.offsetHeight,
      };
      document.addEventListener("pointermove", onResizeMove);
      document.addEventListener("pointerup", onResizeUp);
    });
    drawer.addEventListener("pointerdown", (e) => e.stopPropagation());
  },

  _bindWheel(wrap) {
    if (this._onWheel && wrap) wrap.removeEventListener("wheel", this._onWheel);
    this._onWheel = (e) => {
      if (!this.pdf || this._pageFlipLock) return;
      if (e.ctrlKey) return;
      const el = wrap;
      const delta = e.deltaY;
      const eps = 2;
      const canScrollY = el.scrollHeight > el.clientHeight + eps;
      const canScrollX = el.scrollWidth > el.clientWidth + eps;
      // 容器尚未正确限高时不要拦截滚轮，否则既滚不动又误翻页
      if (!canScrollY && !canScrollX) return;
      const atTop = el.scrollTop <= eps;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - eps;

      if (delta > 0 && canScrollY && atBottom) {
        e.preventDefault();
        this._wheelAcc += delta;
        if (this._wheelAcc > 60) {
          this._wheelAcc = 0;
          this.go(this.page + 1, { fromScroll: "down" });
        }
      } else if (delta < 0 && canScrollY && atTop) {
        e.preventDefault();
        this._wheelAcc += delta;
        if (this._wheelAcc < -60) {
          this._wheelAcc = 0;
          this.go(this.page - 1, { fromScroll: "up" });
        }
      } else {
        this._wheelAcc = 0;
      }
    };
    wrap.addEventListener("wheel", this._onWheel, { passive: false });
  },

  _bindZoomInput(input) {
    if (!input) return;
    const apply = () => {
      const raw = String(input.value ?? "").trim();
      if (!raw) {
        this._syncZoomInput();
        return;
      }
      const pct = Number(raw);
      if (!Number.isFinite(pct)) {
        this._syncZoomInput();
        return;
      }
      this.setZoom(pct / 100);
    };
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        apply();
        input.blur();
      } else if (e.key === "Escape") {
        e.preventDefault();
        this._syncZoomInput();
        input.blur();
      }
    });
    input.addEventListener("change", apply);
    input.addEventListener("focus", () => input.select());
  },

  _syncZoomInput() {
    const input = document.getElementById("zoomPct");
    if (!input || document.activeElement === input) return;
    input.value = String(Math.round(this.zoom * 100));
  },

  async setZoom(z) {
    const next = Math.min(3, Math.max(0.5, z));
    if (Math.abs(next - this.zoom) < 0.001) {
      this._syncZoomInput();
      return;
    }
    this.zoom = next;
    await this.renderPage({ keepScrollRatio: true });
  },

  /** 进度后台保存，不阻塞翻页 */
  _saveProgress(p) {
    const id = this.paperId;
    clearTimeout(this._progressTimer);
    this._progressTimer = setTimeout(async () => {
      try {
        const paper = await API.get(`/papers/${id}`);
        if (this.paperId !== id) return;
        await API.put(`/papers/${id}`, { ...paper, reading_progress_page: p });
      } catch (_) {}
    }, 400);
  },

  async go(p, opts = {}) {
    if (!this.pdf) return;
    if (p < 1 || p > this.pdf.numPages) return;
    if (p === this.page && !opts.force) return;
    this._pageFlipLock = true;
    this.page = p;
    this._wheelAcc = 0;
    this._hideSelAnnot();
    this._saveProgress(p);
    try {
      await this.renderPage({
        scrollTo: opts.fromScroll === "up" ? "bottom" : "top",
      });
    } finally {
      this._pageFlipLock = false;
    }
  },

  _fitScale(page, wrapEl) {
    const base = page.getViewport({ scale: 1 });
    const pad = 28;
    // 优先用实际可见宽度；为 0 时等布局后再渲染，避免按过大宽度裁切
    const cw = wrapEl?.clientWidth || 0;
    const avail = Math.max(240, (cw || 640) - pad);
    return avail / base.width;
  },

  async _waitForWrapSize(wrap, tries = 12) {
    for (let i = 0; i < tries; i++) {
      if (wrap.clientWidth >= 160 && wrap.clientHeight >= 120) return true;
      await new Promise((r) => requestAnimationFrame(r));
    }
    return wrap.clientWidth > 0;
  },

  async renderPage(opts = {}) {
    const wrap = document.getElementById("pdfWrap");
    if (!wrap || !this.pdf) return;
    if (!opts._sized) {
      await this._waitForWrapSize(wrap);
      opts = { ...opts, _sized: true };
    }
    const token = ++this._renderToken;
    if (this._renderTask) {
      try { this._renderTask.cancel(); } catch (_) {}
      this._renderTask = null;
    }

    const maxScroll = Math.max(1, wrap.scrollHeight - wrap.clientHeight);
    const prevRatio = opts.keepScrollRatio ? wrap.scrollTop / maxScroll : null;
    const prevScroll = opts.keepScroll ? wrap.scrollTop : null;

    const page = await this.pdf.getPage(this.page);
    if (token !== this._renderToken) return;

    const fit = this._fitScale(page, wrap);
    const scale = fit * this.zoom;
    const viewport = page.getViewport({ scale });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // 离屏画好再替换，避免清空导致黑闪
    const pageWrap = document.createElement("div");
    pageWrap.className = "pdf-page-wrap";
    pageWrap.id = "pageWrap";
    pageWrap.style.width = `${viewport.width}px`;
    pageWrap.style.height = `${viewport.height}px`;

    const canvas = document.createElement("canvas");
    canvas.id = "pdfCanvas";
    const textLayerDiv = document.createElement("div");
    textLayerDiv.className = "textLayer";
    textLayerDiv.id = "textLayer";
    textLayerDiv.style.width = `${viewport.width}px`;
    textLayerDiv.style.height = `${viewport.height}px`;
    const hlLayer = document.createElement("div");
    hlLayer.className = "hl-layer";
    hlLayer.id = "hlLayer";
    pageWrap.append(canvas, textLayerDiv, hlLayer);

    const ctx = canvas.getContext("2d", { alpha: false });
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = false;

    const task = page.render({ canvasContext: ctx, viewport });
    this._renderTask = task;
    try {
      await task.promise;
    } catch (err) {
      if (err?.name === "RenderingCancelledException") return;
      throw err;
    }
    if (token !== this._renderToken) return;
    this._renderTask = null;

    this.drawHighlights(viewport, hlLayer);
    this._suppressResize = true;
    wrap.replaceChildren(pageWrap);
    this._lastWrapWidth = Math.round(wrap.clientWidth);
    requestAnimationFrame(() => {
      this._suppressResize = false;
    });

    document.getElementById("pageInfo").textContent = `${this.page} / ${this.pdf.numPages}`;
    this._syncZoomInput();

    if (opts.scrollTo === "bottom") wrap.scrollTop = wrap.scrollHeight;
    else if (opts.scrollTo === "top") wrap.scrollTop = 0;
    else if (prevRatio != null) {
      const nextMax = Math.max(1, wrap.scrollHeight - wrap.clientHeight);
      wrap.scrollTop = prevRatio * nextMax;
    } else if (prevScroll != null) wrap.scrollTop = prevScroll;

    pageWrap.onmouseup = () => this.captureSelection(viewport);

    // 文字层异步补上（旧画面已替换为完整 canvas，不会黑闪）
    try {
      if (token !== this._renderToken) return;
      if (!textLayerDiv.isConnected) return;
      await this._attachTextLayer(page, textLayerDiv, viewport, token);
    } catch (_) {}
  },

  async _attachTextLayer(page, textLayerDiv, viewport, token) {
    textLayerDiv.style.setProperty("--scale-factor", String(viewport.scale));
    textLayerDiv.replaceChildren();

    const textContent = await page.getTextContent();
    if (token !== this._renderToken || !textLayerDiv.isConnected) return;

    if (pdfjsLib.TextLayer) {
      const source = typeof page.streamTextContent === "function"
        ? page.streamTextContent({ includeMarkedContent: true })
        : textContent;
      const tl = new pdfjsLib.TextLayer({
        textContentSource: source,
        container: textLayerDiv,
        viewport,
      });
      await tl.render();
    } else if (pdfjsLib.renderTextLayer) {
      await pdfjsLib.renderTextLayer({
        textContentSource: textContent,
        container: textLayerDiv,
        viewport,
        textDivs: [],
      }).promise;
    } else {
      this._renderTextLayerFallback(textContent, textLayerDiv, viewport);
    }
    if (token !== this._renderToken || !textLayerDiv.isConnected) return;
    this._bindTextSelectionGuard(textLayerDiv);
  },

  _bindTextSelectionGuard(textLayerDiv) {
    // pdf.js 官方技巧：拖选时激活 endOfContent，挡住空白处的“选飞”
    let eoc = textLayerDiv.querySelector(".endOfContent");
    if (!eoc) {
      eoc = document.createElement("div");
      eoc.className = "endOfContent";
      textLayerDiv.appendChild(eoc);
    }
    const activate = () => eoc.classList.add("active");
    const deactivate = () => eoc.classList.remove("active");
    textLayerDiv.onmousedown = (e) => {
      // 点在空白/endOfContent 上不开启选区，避免一拖就整页
      const onText = e.target && e.target !== textLayerDiv && !e.target.classList?.contains("endOfContent");
      if (!onText) {
        e.preventDefault();
        deactivate();
        return;
      }
      activate();
    };
    if (this._textSelDocUp) {
      document.removeEventListener("mouseup", this._textSelDocUp);
    }
    this._textSelDocUp = () => {
      document.querySelectorAll(".textLayer .endOfContent.active").forEach((el) => {
        el.classList.remove("active");
      });
    };
    document.addEventListener("mouseup", this._textSelDocUp);
  },

  _renderTextLayerFallback(textContent, container, viewport) {
    textContent.items.forEach((item) => {
      if (!item.str) return;
      const tx = pdfjsLib.Util.transform(viewport.transform, item.transform);
      const span = document.createElement("span");
      span.textContent = item.str;
      span.style.left = `${tx[4]}px`;
      span.style.top = `${tx[5] - item.height * viewport.scale}px`;
      span.style.fontSize = `${item.height * viewport.scale}px`;
      span.style.fontFamily = "sans-serif";
      container.appendChild(span);
    });
  },

  drawHighlights(viewport, layerEl = null) {
    const layer = layerEl || document.getElementById("hlLayer");
    if (!layer) return;
    layer.innerHTML = "";
    this.annotations
      .filter((a) => a.page === this.page)
      .forEach((a) => {
        let rects = [];
        try { rects = JSON.parse(a.rect_json || "[]"); } catch (_) {}
        rects.forEach((r) => {
          const box = document.createElement("div");
          box.className = `hl-box ${a.color || "yellow"}`;
          box.style.left = `${r.x * viewport.width}px`;
          box.style.top = `${r.y * viewport.height}px`;
          box.style.width = `${r.w * viewport.width}px`;
          box.style.height = `${r.h * viewport.height}px`;
          layer.appendChild(box);
        });
      });
  },

  _bindSelAnnotUI(mountEl) {
    const marker = mountEl.querySelector("#selAnnMarker");
    const pop = mountEl.querySelector("#selAnnPop");
    if (!marker || !pop) return;
    marker.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      this._openSelAnnotPop();
    };
    mountEl.querySelector("#selAnnCancel").onclick = (e) => {
      e.stopPropagation();
      this._hideSelAnnot();
    };
    mountEl.querySelector("#selAnnSave").onclick = (e) => {
      e.stopPropagation();
      this.saveSelection();
    };
    mountEl.querySelector("#selAnnColor").onchange = (e) => {
      this.color = e.target.value;
      const hl = document.getElementById("hlColor");
      if (hl) hl.value = this.color;
    };
    pop.addEventListener("pointerdown", (e) => e.stopPropagation());
    if (this._selEscHandler) {
      document.removeEventListener("keydown", this._selEscHandler);
    }
    this._selEscHandler = (e) => {
      if (e.key === "Escape") this._hideSelAnnot();
    };
    document.addEventListener("keydown", this._selEscHandler);
  },

  _hideSelAnnot(opts = {}) {
    const marker = document.getElementById("selAnnMarker");
    const pop = document.getElementById("selAnnPop");
    if (marker) {
      marker.hidden = true;
      marker.classList.remove("is-open");
    }
    if (pop) pop.hidden = true;
    if (!opts.keepPending) this._pending = null;
  },

  _placeSelMarker() {
    const marker = document.getElementById("selAnnMarker");
    const stage = document.getElementById("readerStage");
    const pageWrap = document.getElementById("pageWrap");
    const anchor = this._pending?.anchor;
    if (!marker || !stage || !pageWrap || !anchor) return;
    const pr = pageWrap.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    let left = pr.left - sr.left + anchor.x + 6;
    let top = pr.top - sr.top + anchor.y - 6;
    left = Math.max(8, Math.min(sr.width - 36, left));
    top = Math.max(8, Math.min(sr.height - 36, top));
    marker.style.left = `${left}px`;
    marker.style.top = `${top}px`;
    marker.hidden = false;
    marker.classList.toggle("is-open", !document.getElementById("selAnnPop")?.hidden);
  },

  _openSelAnnotPop() {
    const pop = document.getElementById("selAnnPop");
    const marker = document.getElementById("selAnnMarker");
    const stage = document.getElementById("readerStage");
    if (!pop || !marker || !stage || !this._pending?.text) return;
    const quote = document.getElementById("selAnnQuote");
    const comment = document.getElementById("selAnnComment");
    const tags = document.getElementById("selAnnTags");
    const color = document.getElementById("selAnnColor");
    if (quote) {
      const t = this._pending.text;
      quote.textContent = t.length > 160 ? `${t.slice(0, 160)}…` : t;
      quote.title = t;
    }
    if (comment) comment.value = "";
    if (tags) tags.value = "";
    if (color) color.value = this.color || "yellow";
    pop.hidden = false;
    marker.classList.add("is-open");
    // 气泡贴在标记旁，避免溢出阅读区
    const mr = marker.getBoundingClientRect();
    const sr = stage.getBoundingClientRect();
    const pw = Math.min(320, sr.width - 24);
    let left = mr.left - sr.left + 34;
    let top = mr.top - sr.top - 8;
    if (left + pw > sr.width - 8) left = Math.max(8, mr.left - sr.left - pw - 8);
    if (top + 220 > sr.height - 8) top = Math.max(8, sr.height - 228);
    pop.style.width = `${pw}px`;
    pop.style.left = `${left}px`;
    pop.style.top = `${top}px`;
    requestAnimationFrame(() => comment?.focus());
  },

  captureSelection(viewport) {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      // 点空白清空时收起标记（若气泡已开则保留，由取消关闭）
      const pop = document.getElementById("selAnnPop");
      if (!pop || pop.hidden) this._hideSelAnnot();
      return;
    }
    const text = sel.toString().trim();
    if (!text) return;
    const range = sel.getRangeAt(0);
    const pageWrap = document.getElementById("pageWrap");
    if (!pageWrap) return;
    const prect = pageWrap.getBoundingClientRect();
    const clientRects = [...range.getClientRects()].filter((r) => r.width > 0 && r.height > 0);
    const rects = clientRects
      .map((r) => ({
        x: (r.left - prect.left) / viewport.width,
        y: (r.top - prect.top) / viewport.height,
        w: r.width / viewport.width,
        h: r.height / viewport.height,
      }))
      .filter((r) => r.w > 0 && r.h > 0);
    if (!rects.length) return;
    const last = clientRects[clientRects.length - 1];
    this._pending = {
      text,
      rects,
      viewportW: viewport.width,
      viewportH: viewport.height,
      anchor: {
        x: last.right - prect.left,
        y: last.top - prect.top + last.height / 2,
      },
    };
    this._placeSelMarker();
  },

  async saveSelection() {
    const text = this._pending?.text;
    const rects = this._pending?.rects || [];
    if (!text) {
      toast("请先在 PDF 文本上选择一段文字");
      return;
    }
    const commentEl = document.getElementById("selAnnComment");
    const tagsEl = document.getElementById("selAnnTags");
    const colorEl = document.getElementById("selAnnColor");
    const comment = (commentEl?.value || "").trim();
    const tags = (tagsEl?.value || "").trim();
    const color = colorEl?.value || this.color || "yellow";
    this.color = color;
    const hl = document.getElementById("hlColor");
    if (hl) hl.value = color;
    await API.post(`/papers/${this.paperId}/annotations`, {
      page: this.page,
      color,
      selected_text: text,
      comment,
      rect_json: JSON.stringify(rects),
      tags,
    });
    this._hideSelAnnot();
    try {
      window.getSelection()?.removeAllRanges();
    } catch (_) {}
    this.annotations = await API.get(`/papers/${this.paperId}/annotations`);
    await this.renderPage({ keepScrollRatio: true });
    this.renderAnnList();
    this.toggleAnnDrawer(true);
    toast("批注已保存");
    if (this.onChange) this.onChange();
  },

  syncAnnBadge() {
    const badge = document.getElementById("annBadge");
    const fab = document.getElementById("annFab");
    if (!badge || !fab) return;
    const n = this.annotations.length;
    badge.textContent = String(n);
    badge.classList.toggle("hidden", n === 0);
    fab.classList.toggle("has-items", n > 0);
  },

  renderAnnList() {
    this.syncAnnBadge();
    const el = document.getElementById("annList");
    if (!el) return;
    if (!this.annotations.length) {
      el.innerHTML = `<div class="empty">暂无批注。选中 PDF 文本后点 ✎ 即可添加。</div>`;
      return;
    }
    el.innerHTML = this.annotations
      .map(
        (a) => `<div class="ann-item" data-id="${a.id}" data-page="${a.page}">
          <div class="meta">p.${a.page} · ${esc(a.color)} ${a.tags ? "· " + esc(a.tags) : ""}</div>
          <div>${esc(a.selected_text || a.comment || "(无文本)")}</div>
          <div class="toolbar" style="margin-top:6px">
            <button class="btn ghost small" data-promote="${a.id}">写入笔记</button>
            <button class="btn danger small" data-del="${a.id}">删</button>
          </div>
        </div>`
      )
      .join("");
    el.querySelectorAll(".ann-item").forEach((node) => {
      node.onclick = (e) => {
        if (e.target.dataset.del || e.target.dataset.promote) return;
        this.go(Number(node.dataset.page), { force: true });
      };
    });
    el.querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        await API.del(`/annotations/${btn.dataset.del}`);
        this.annotations = await API.get(`/papers/${this.paperId}/annotations`);
        this.renderAnnList();
        this.renderPage({ keepScrollRatio: true });
      };
    });
    el.querySelectorAll("[data-promote]").forEach((btn) => {
      btn.onclick = async (e) => {
        e.stopPropagation();
        await API.post(`/annotations/${btn.dataset.promote}/promote?field=raw_markdown`);
        toast("已写入 Markdown 笔记");
        if (this.onChange) this.onChange();
      };
    });
  },
};
