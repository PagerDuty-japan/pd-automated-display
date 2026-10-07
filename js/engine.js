/* 再生エンジン：スライド切替・字幕・進捗・キーボード操作・キオスク対応 */
(function () {
  const DECK = window.DECK || { settings: {}, slides: [] };
  const S = DECK.settings || {};
  const W = 1920, H = 1080;
  const $ = (s) => document.querySelector(s);
  const stage = $("#stage"), slidesEl = $("#slides"), capEl = $("#captions"),
        progEl = $("#progress"), wipe = $("#wipe");
  const params = new URLSearchParams(location.search);
  let slides = DECK.slides.filter((s) => !s.hidden);
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

  /* ---- 進捗バー ---- */
  let segs;
  function buildProgress() {
    progEl.innerHTML = slides.map(() => '<div class="seg"><i></i></div>').join("");
    segs = [...progEl.querySelectorAll(".seg i")];
  }
  buildProgress();

  /* ---- シーンに渡すコンテキスト（スライド内の時計に同期したタイマー） ---- */
  function makeCtx(el, slide, dur) {
    const tasks = [], loops = [], cleanups = [];
    const ctx = {
      el, slide, dur, t: 0,
      /** スライド開始から ms ミリ秒後に fn を実行（一時停止に追従） */
      at(msec, fn) { tasks.push({ msec, fn, done: false }); },
      /** 毎フレーム fn(t, dt) を実行 */
      loop(fn) { loops.push(fn); },
      /** スライドの長さを変更（動画の長さに合わせるときなど。Infinity で自動では進まない） */
      setDuration(msec) { this.dur = msec; },
      /** 次のスライドへ進む（このスライドが表示中のときだけ） */
      next() { if (cur && cur.ctx === ctx) go(idx + 1, 1); },
      /** スライドが片付けられるときに fn を実行 */
      onDestroy(fn) { cleanups.push(fn); },
      _tick(t, dt) {
        this.t = t;
        for (const k of tasks) if (!k.done && t >= k.msec) { k.done = true; safe(k.fn, t); }
        for (const f of loops) safe(f, t, dt);
      },
      _destroy() { tasks.length = 0; loops.length = 0; cleanups.splice(0).forEach((f) => safe(f)); },
    };
    return ctx;
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
  let cur = null, paused = false, pausedAnims = [], loading = false;

  // コンテンツ（content/slides.js）だけを読み直す。ページを再読み込みすると全画面が解除されるため
  function reloadContent(done) {
    loading = true;
    const s = document.createElement("script");
    s.src = "content/slides.js?t=" + Date.now();
    s.onload = s.onerror = () => {
      s.remove();
      loading = false;
      const next = ((window.DECK || {}).slides || []).filter((x) => !x.hidden);
      if (next.length) { slides = next; buildProgress(); }
      done();
    };
    document.head.appendChild(s);
  }

  function go(i, dir = 1) {
    if (loading) return;
    const n = slides.length;
    const wrapped = cur && dir > 0 && idx === n - 1;
    if (wrapped && S.reloadOnLoop && /^https?:/.test(location.protocol) && params.get("reload") !== "0") {
      // 1周したら最新のコンテンツを読み直す（全画面中はページを再読み込みしない）
      if (document.fullscreenElement) { reloadContent(() => go(0, 0)); return; }
      const p = new URLSearchParams(location.search);
      p.delete("slide");
      location.search = p.toString() || "?";
      return;
    }
    i = ((i % n) + n) % n;

    if (cur) {
      const old = cur;
      old.el.querySelectorAll("video").forEach((v) => v.pause());
      pausedAnims = pausedAnims.filter((a) => !(a instanceof HTMLMediaElement));
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
      const dur = cur.ctx.dur;
      segs[idx].style.transform = `scaleX(${U.clamp(cur.slide.type === "video" && cur.slide.duration == null ? videoProgress() : cur.t / dur, 0, 1)})`;
      if (cur.t >= dur) go(idx + 1, 1);
    }
    requestAnimationFrame(frame);
  }

  function videoProgress() {
    const v = cur.el.querySelector("video");
    return v && v.duration ? v.currentTime / v.duration : 0;
  }

  /* ---- 一時停止（CSS/WAAPI アニメーションも止める） ---- */
  function setPaused(p) {
    paused = p;
    stage.classList.toggle("is-paused", p);
    if (p) {
      pausedAnims = document.getAnimations().filter((a) => a.playState === "running");
      pausedAnims.push(...[...slidesEl.querySelectorAll("video")].filter((v) => !v.paused));
      pausedAnims.forEach((a) => a.pause());
    } else {
      pausedAnims.forEach((a) => { try { a.play()?.catch?.(() => {}); } catch (_) {} });
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

  // 右下の全画面アイコン（全画面中はカーソルを動かしたときだけ出る）
  const fsBtn = $("#fsBtn");
  const renderFsBtn = () => {
    const on = !!document.fullscreenElement;
    document.body.classList.toggle("is-fs", on);
    fsBtn.innerHTML = U.icon(on ? "shrink" : "expand");
    fsBtn.title = fsBtn.ariaLabel = on ? "全画面を終了" : "全画面で表示";
  };
  if (document.fullscreenEnabled) {
    fsBtn.addEventListener("click", (e) => { e.stopPropagation(); fsBtn.blur(); toggleFullscreen(); });
    document.addEventListener("fullscreenchange", renderFsBtn);
    renderFsBtn();
  } else {
    fsBtn.remove();
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

  const start = () => {
    go(idx, 0);
    requestAnimationFrame(frame);
    // 動画は裏で先に取得してブラウザ内に保存しておく（2周目以降は通信なし）
    window.MEDIA?.preload(slides.filter((s) => s.type === "video" && s.src).map((s) => new URL(s.src, location.href).href));
  };
  // Webフォントの読み込みを少し待ってから開始（オフラインでも1.5秒で開始）
  Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 1500))]).then(start);
})();
