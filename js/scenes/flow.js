/* flow：インシデントライフサイクル。ステップが順に点灯し、光のパルスが進む */
SCENES.flow = function (root, d, ctx) {
  const { esc, rich, header, refs, icon, lerp, easeInOut, progress, parseMs, hms } = U;
  const steps = d.steps || [];
  const n = steps.length;
  const x0 = 260, x1 = 1660, y = 585;
  const xs = steps.map((_, i) => (n > 1 ? x0 + (i * (x1 - x0)) / (n - 1) : (x0 + x1) / 2));
  const first = 1700;
  const interval = (ctx.dur - first - 2600) / Math.max(n, 1);
  const startOf = (i) => first + i * interval;

  root.innerHTML = `
    <div class="fl-head">${header(d)}</div>
    <div class="fl-clock rv" style="--d:900ms">
      <div class="k mono">${esc(d.clockLabel || "ELAPSED")}</div>
      <div class="v mono" data-r="clock">00:00:00</div>
      <div class="s" data-r="status"><i></i><span>待機中</span></div>
    </div>
    <svg class="fl-svg" viewBox="0 0 1920 1080" aria-hidden="true">
      <defs>
        <linearGradient id="fl-g" x1="0" x2="1"><stop offset="0" stop-color="#06AC38"/><stop offset="1" stop-color="#2BD566"/></linearGradient>
        <filter id="fl-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="8"/></filter>
      </defs>
      <line class="base" x1="${x0}" y1="${y}" x2="${x1}" y2="${y}"/>
      ${xs.map((x) => `<line class="tick" x1="${x}" y1="${y - 96}" x2="${x}" y2="${y - 84}"/>`).join("")}
      <line class="prog glow" data-r="glow" x1="${x0}" y1="${y}" x2="${x0}" y2="${y}" filter="url(#fl-glow)"/>
      <line class="prog" data-r="prog" x1="${x0}" y1="${y}" x2="${x0}" y2="${y}"/>
      <circle class="head-halo" data-r="halo" cx="${x0}" cy="${y}" r="26"/>
      <circle class="head" data-r="head" cx="${x0}" cy="${y}" r="7"/>
    </svg>
    ${steps.map((s, i) => `
      <div class="fl-node" data-i="${i}" style="left:${xs[i]}px; top:${y}px">
        <div class="disc">${icon(s.icon || "check")}<i class="pulse"></i></div>
        <div class="txt">
          <div class="lb">${esc(s.label || "")}</div>
          <div class="ds">${rich(s.desc || "")}</div>
        </div>
      </div>`).join("")}`;

  const r = refs(root);
  const nodes = [...root.querySelectorAll(".fl-node")];
  const times = steps.map((s) => parseMs(s.time));
  const statusText = r.status.querySelector("span");

  steps.forEach((s, i) => {
    ctx.at(startOf(i), () => {
      nodes.forEach((nd, k) => { nd.classList.toggle("done", k < i); });
      nodes[i].classList.add("on");
      statusText.textContent = s.status || s.label;
      r.status.classList.toggle("ok", i >= n - 2);
    });
  });

  ctx.loop((t) => {
    // 線の進捗：各ステップへ向かって滑らかに伸びる
    let px = x0;
    for (let i = 1; i < n; i++) {
      const p = easeInOut(progress(t, startOf(i) - interval * 0.75, interval * 0.75));
      if (p > 0) px = lerp(xs[i - 1], xs[i], p);
    }
    if (t < startOf(0)) px = x0;
    r.prog.setAttribute("x2", px);
    r.glow.setAttribute("x2", px);
    r.head.setAttribute("cx", px);
    r.halo.setAttribute("cx", px);

    // 経過時間（ステップ間の時刻を補間）
    let sec = 0;
    for (let i = 0; i < n; i++) {
      if (t < startOf(i) || times[i] == null) continue;
      const next = times.slice(i + 1).find((v) => v != null);
      const p = i + 1 < n ? progress(t, startOf(i), interval) : 0;
      sec = next != null && i + 1 < n && times[i + 1] != null ? lerp(times[i], next, p) : times[i];
    }
    r.clock.textContent = hms(sec);
  });
};
