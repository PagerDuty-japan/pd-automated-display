/* dashboard：サービスのライブ監視 → 異常検知 → 自動修復 → 復旧 */
SCENES.dashboard = function (root, d, ctx) {
  const { esc, header, refs, icon, rand, clamp, progress } = U;
  const svcs = d.services || [];
  const inc = d.incident || {};
  const st = d.status || {};
  const tInc = (inc.at ?? 4) * 1000, tFix = (inc.remediateAt ?? 7.5) * 1000, tOk = (inc.resolveAt ?? 11.5) * 1000;
  const SW = 350, SH = 70, N = 48;

  root.innerHTML = `
    <div class="db-head">${header(d)}</div>
    <div class="db-status rv" style="--d:800ms" data-r="status">
      <span class="dot"></span><span class="tx" data-r="stx">${esc(st.ok || "")}</span>
    </div>
    <div class="db-toast" data-r="toast">
      <span class="ic">${icon("bolt")}</span>
      <div><div class="k mono">AUTOMATION</div><div class="t">${esc(inc.runbook || "")}</div><div class="pb"><i data-r="pb"></i></div></div>
    </div>
    <div class="db-grid">
      ${svcs.map((s, i) => `
        <div class="svc rv" style="--d:${600 + i * 70}ms">
          <div class="row"><b class="mono">${esc(s.name)}</b><span class="st-badge mono">OK</span></div>
          <div class="team">${esc(s.team || "")}</div>
          <div class="val mono"><span class="n">0</span><small>${esc(s.unit || "")}</small></div>
          <svg class="spark" viewBox="0 0 ${SW} ${SH}" preserveAspectRatio="none">
            <defs><linearGradient id="sg${i}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="currentColor" stop-opacity=".35"/><stop offset="1" stop-color="currentColor" stop-opacity="0"/></linearGradient></defs>
            <path class="area" fill="url(#sg${i})"/><path class="line"/>
          </svg>
        </div>`).join("")}
    </div>`;

  const r = refs(root);
  const cards = [...root.querySelectorAll(".svc")];
  const series = svcs.map((s) => Array.from({ length: N }, () => s.base * rand(0.85, 1.15)));
  const target = cards[inc.service ?? 0];

  function draw(i) {
    const v = series[i], c = cards[i];
    const max = Math.max(svcs[i].base * 2.2, ...v) * 1.05;
    const pts = v.map((y, k) => [(k / (N - 1)) * SW, SH - (y / max) * (SH - 6) - 3]);
    const line = pts.map((p, k) => `${k ? "L" : "M"}${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" ");
    c.querySelector(".line").setAttribute("d", line);
    c.querySelector(".area").setAttribute("d", `${line} L${SW} ${SH} L0 ${SH} Z`);
    c.querySelector(".n").textContent = Math.round(v[N - 1]);
  }
  svcs.forEach((_, i) => draw(i));

  const setState = (cls, text, chip) => {
    r.status.className = `db-status rv ${cls}`;
    r.stx.textContent = text;
    target.className = `svc rv ${cls}`;
    target.querySelector(".st-badge").textContent = chip;
  };
  ctx.at(tInc, () => setState("bad", `${st.incident || "Incident"} — ${svcs[inc.service ?? 0]?.name || ""}`, "INCIDENT"));
  ctx.at(tFix, () => { setState("fix", st.remediating || "Remediating", "AUTO-FIX"); r.toast.classList.add("show"); });
  ctx.at(tOk, () => { setState("ok", st.resolved || "Resolved", "RESOLVED"); r.toast.classList.add("done"); });
  ctx.at(tOk + 2600, () => r.toast.classList.remove("show"));

  let acc = 0;
  ctx.loop((t, dt) => {
    r.pb.style.transform = `scaleX(${progress(t, tFix, tOk - tFix)})`;
    acc += dt;
    if (acc < 110) return;
    acc = 0;
    svcs.forEach((s, i) => {
      let m = 1;
      if (i === (inc.service ?? 0)) {
        if (t >= tInc && t < tFix) m = 1 + 5.5 * clamp((t - tInc) / 1400, 0, 1);
        else if (t >= tFix && t < tOk) m = 6.5 - 5 * progress(t, tFix + 800, tOk - tFix - 800);
        else if (t >= tOk) m = 1 + 0.5 * Math.max(0, 1 - (t - tOk) / 1500);
      }
      const last = series[i][N - 1];
      const next = last + (s.base * m - last) * 0.45 + s.base * rand(-0.09, 0.09) * Math.sqrt(m);
      series[i].push(Math.max(1, next));
      series[i].shift();
      draw(i);
    });
  });
};
