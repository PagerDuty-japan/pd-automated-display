/* 再生エンジン：スライド切替・字幕・進捗・キーボード操作・キオスク対応 */
(function () {
  const DECK = window.DECK || { settings: {}, slides: [] };
  const S = DECK.settings || {};
  const W = 1920, H = 1080;
  const $ = (s) => document.querySelector(s);
  const stage = $("#stage"), slidesEl = $("#slides"), capEl = $("#captions"),
        progEl = $("#progress"), nowEl = $("#now"), wipe = $("#wipe");
  const params = new URLSearchParams(location.search);
  const slides = DECK.slides.filter((s) => !s.hidden);
  if (!slides.length) return;

  /* ---- 画面サイズに合わせて 1920x1080 のステージを拡縮 ---- */
  function fit() {
    const s = Math.min(innerWidth / W, innerHeight / H);
    stage.style.transform = `translate(-50%, -50%) scale(${s})`;
  }
  addEventListener("resize", fit);
  fit();

  /* ---- 上部クローム ---- */
  $("#brand").innerHTML = S.logo
    ? `<img src="${U.esc(S.logo)}" alt="${U.esc(S.eventName || "")}">`
    : `<span class="mark"></span><span class="word">${U.esc(S.eventName || "PagerDuty")}</span>`;
  $("#booth").textContent = S.boothLabel || "";
  const clockEl = $("#clock");
  const tickClock = () => {
    const d = new Date();
    clockEl.textContent = `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
  };
  tickClock();
  setInterval(tickClock, 5000);

  /* ---- 進捗バー ---- */
  progEl.innerHTML = slides.map(() => '<div class="seg"><i></i></div>').join("");
  const segs = [...progEl.querySelectorAll(".seg i")];

  /* ---- シーンに渡すコンテキスト（スライド内の時計に同期したタイマー） ---- */
  function makeCtx(el, slide, dur) {
    const tasks = [], loops = [];
    return {
      el, slide, dur, t: 0,
      /** スライド開始から ms ミリ秒後に fn を実行（一時停止に追従） */
      at(msec, fn) { tasks.push({ msec, fn, done: false }); },
      /** 毎フレーム fn(t, dt) を実行 */
      loop(fn) { loops.push(fn); },
      _tick(t, dt) {
        this.t = t;
        for (const k of tasks) if (!k.done && t >= k.msec) { k.done = true; safe(k.fn, t); }
        for (const f of loops) safe(f, t, dt);
      },
      _destroy() { tasks.length = 0; loops.length = 0; },
    };
  }
  const safe = (fn, ...a) => { try { fn(...a); } catch (e) { console.error(e); } };

  /* ---- 字幕 ---- */
  let captionsOn = S.captions !== false && params.get("captions") !== "0";
  function buildCaps(slide, dur) {
    const list = (slide.captions || []).map((c) => (typeof c === "string" ? { ja: c } : { ...c }));
    const n = list.length;
    list.forEach((c, i) => { if (c.at == null) c.at = 0.8 + (i * (dur / 1000 - 1.6)) / Math.max(n, 1); });
    list.sort((a, b) => a.at - b.at);
    return list.map((c, i) => ({
      ...c,
      start: c.at * 1000,
      end: c.until != null ? c.until * 1000 : (i < n - 1 ? list[i + 1].at * 1000 - 150 : dur - 500),
    }));
  }
  function showCaption(c) {
    capEl.querySelectorAll(".cap").forEach((old) => {
      old.classList.add("out");
      setTimeout(() => old.remove(), 400);
    });
    if (!c || !captionsOn) return;
    const en = S.captionsEnglish !== false && c.en ? `<div class="en">${U.esc(c.en)}</div>` : "";
    capEl.appendChild(U.el("div", "cap", `<div class="ja">${U.rich(c.ja || c.text || "")}</div>${en}`));
  }

  /* ---- スライド切替 ---- */
  let idx = U.clamp((parseInt(params.get("slide"), 10) || 1) - 1, 0, slides.length - 1);
  let cur = null, paused = false, pausedAnims = [];

  function go(i, dir = 1) {
    const n = slides.length;
    const wrapped = cur && dir > 0 && idx === n - 1;
    if (wrapped && S.reloadOnLoop && /^https?:/.test(location.protocol) && params.get("reload") !== "0") {
      // 1周したら最新のコンテンツを読み直す
      const p = new URLSearchParams(location.search);
      p.delete("slide");
      location.search = p.toString() || "?";
      return;
    }
    i = ((i % n) + n) % n;

    if (cur) {
      const old = cur;
      old.el.classList.remove("is-in");
      old.el.classList.add("is-out");
      setTimeout(() => { old.ctx._destroy(); old.el.remove(); }, 1000);
    }
    wipe.classList.remove("go");
    void wipe.offsetWidth;
    wipe.classList.add("go");

    idx = i;
    const slide = slides[i];
    const dur = (slide.duration || S.defaultDuration || 15) * 1000;
    const el = U.el("section", `slide type-${slide.type}`);
    slidesEl.appendChild(el);
    const ctx = makeCtx(el, slide, dur);
    const scene = window.SCENES[slide.type] || window.SCENES.statement;
    try { scene(el, slide, ctx); }
    catch (e) { console.error(e); el.innerHTML = `<div class="scene-error mono">Scene error: ${U.esc(e.message)}</div>`; }

    cur = { el, ctx, slide, t: 0, dur, caps: buildCaps(slide, dur), capIdx: -1 };
    requestAnimationFrame(() => requestAnimationFrame(() => el.classList.add("is-in")));

    showCaption(null);
    segs.forEach((s, k) => (s.style.transform = `scaleX(${k < i ? 1 : 0})`));
    nowEl.innerHTML = `<b>${String(i + 1).padStart(2, "0")}</b> / ${String(n).padStart(2, "0")}<span>${U.esc(slide.label || "")}</span>`;
    if (paused) setPaused(false);
  }

  /* ---- メインループ ---- */
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(100, now - last);
    last = now;
    if (cur && !paused) {
      cur.t += dt;
      cur.ctx._tick(cur.t, dt);
      let ci = -1;
      cur.caps.forEach((c, k) => { if (cur.t >= c.start && cur.t < c.end) ci = k; });
      if (ci !== cur.capIdx) { cur.capIdx = ci; showCaption(cur.caps[ci]); }
      segs[idx].style.transform = `scaleX(${U.clamp(cur.t / cur.dur, 0, 1)})`;
      if (cur.t >= cur.dur) go(idx + 1, 1);
    }
    requestAnimationFrame(frame);
  }

  /* ---- 一時停止（CSS/WAAPI アニメーションも止める） ---- */
  function setPaused(p) {
    paused = p;
    stage.classList.toggle("is-paused", p);
    if (p) {
      pausedAnims = document.getAnimations().filter((a) => a.playState === "running");
      pausedAnims.forEach((a) => a.pause());
    } else {
      pausedAnims.forEach((a) => { try { a.play(); } catch (_) {} });
      pausedAnims = [];
    }
  }

  /* ---- 操作 ---- */
  addEventListener("keydown", (e) => {
    const k = e.key;
    if (k === "ArrowRight" || k === "PageDown" || k === " ") { e.preventDefault(); go(idx + 1, 1); }
    else if (k === "ArrowLeft" || k === "PageUp") { e.preventDefault(); go(idx - 1, -1); }
    else if (k === "p" || k === "P") setPaused(!paused);
    else if (k === "f" || k === "F") toggleFullscreen();
    else if (k === "c" || k === "C") { captionsOn = !captionsOn; showCaption(captionsOn && cur ? cur.caps[cur.capIdx] : null); }
    else if (k === "r" || k === "R") go(idx, 0);
    else if (/^[1-9]$/.test(k) && +k <= slides.length) go(+k - 1, 0);
  });
  stage.addEventListener("click", (e) => {
    const rect = stage.getBoundingClientRect();
    go(e.clientX - rect.left < rect.width * 0.3 ? idx - 1 : idx + 1, e.clientX - rect.left < rect.width * 0.3 ? -1 : 1);
  });
  function toggleFullscreen() {
    if (document.fullscreenElement) document.exitFullscreen();
    else document.documentElement.requestFullscreen?.().catch(() => {});
  }

  // カーソルを自動で隠す
  let cursorTimer;
  addEventListener("mousemove", () => {
    document.body.classList.remove("hide-cursor");
    clearTimeout(cursorTimer);
    cursorTimer = setTimeout(() => document.body.classList.add("hide-cursor"), 2000);
  });
  document.body.classList.add("hide-cursor");

  // 画面スリープ防止
  const wake = () => navigator.wakeLock?.request("screen").catch(() => {});
  wake();
  document.addEventListener("visibilitychange", () => document.visibilityState === "visible" && wake());

  if (params.get("chrome") === "0") stage.classList.add("no-chrome");

  const start = () => { go(idx, 0); requestAnimationFrame(frame); };
  // Webフォントの読み込みを少し待ってから開始（オフラインでも1.5秒で開始）
  Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(start);
})();
