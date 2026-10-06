/* noise：アラートの洪水 → 1件のインシデントに集約 */
SCENES.noise = function (root, d, ctx) {
  const { esc, header, refs, rand, pick, num, easeOut, progress } = U;
  const total = d.totalAlerts || 1000;
  const visible = d.visibleAlerts || 60;
  const collapse = (d.collapseAt || 7) * 1000;
  const spawnFrom = 900, spawnTo = collapse - 500;
  const inc = d.incident || {};
  const samples = d.alertSamples || [["CRIT", "Alert"]];
  const sources = d.sources || ["monitor"];
  const hosts = d.hosts || ["service"];

  root.innerHTML = `
    <div class="col-l">
      ${header(d)}
      <div class="nz-metrics rv" style="--d:1500ms">
        <div class="m"><div class="k mono">ALERTS RECEIVED</div><div class="v mono" data-r="alerts">0</div></div>
        <div class="arrow">${U.icon("filter")}</div>
        <div class="m hl"><div class="k mono">INCIDENTS</div><div class="v mono" data-r="inc">0</div></div>
      </div>
      <div class="nz-reduce rv" style="--d:1650ms">
        <div class="bar"><i data-r="bar"></i></div>
        <div class="lbl mono"><span>NOISE REDUCTION</span><b data-r="pct">0.0%</b></div>
      </div>
    </div>
    <div class="nz-arena" data-r="arena">
      <div class="nz-core" data-r="core"><i></i><i></i><i></i></div>
      <div class="nz-card" data-r="card">
        <div class="top">
          <span class="prio">${esc(inc.priority || "P1")}</span>
          <span class="id mono">INCIDENT ${esc(inc.id || "")}</span>
          <span class="state mono">TRIGGERED</span>
        </div>
        <div class="ttl">${esc(inc.title || "")}</div>
        <dl>${(inc.rows || []).map(([k, v], i) => `<div style="--i:${i}"><dt class="mono">${esc(k)}</dt><dd class="mono">${esc(v)}</dd></div>`).join("")}</dl>
      </div>
    </div>`;

  const r = refs(root);
  const arena = r.arena;
  const AW = 880, AH = 680;
  const chips = [];

  function spawn(k) {
    const [sev, msg] = pick(samples);
    const chip = U.el("div", `chip sev-${sev.toLowerCase()}`,
      `<div class="l1 mono"><b>${esc(sev)}</b><span>${esc(pick(sources))}</span><span class="tm">${esc(pick(hosts))}</span></div><div class="l2">${esc(msg)}</div>`);
    const x = rand(0, AW - 330), y = rand(0, AH - 70), rot = rand(-5, 5);
    chip.style.left = `${x}px`;
    chip.style.top = `${y}px`;
    chip.style.zIndex = k;
    chip.dataset.rot = rot;
    arena.appendChild(chip);
    chip.animate(
      [{ opacity: 0, transform: `translateY(-30px) scale(.85) rotate(${rot * 2}deg)`, filter: "blur(6px)" },
       { opacity: 1, transform: `rotate(${rot}deg)`, filter: "blur(0)" }],
      { duration: 450, easing: "cubic-bezier(.2,.8,.2,1)", fill: "forwards" });
    chips.push({ chip, x, y, rot });
  }

  for (let k = 0; k < visible; k++) {
    // 前半はまばらに、後半は一気に押し寄せる
    const f = Math.pow(k / visible, 0.65);
    ctx.at(spawnFrom + f * (spawnTo - spawnFrom), () => spawn(k));
  }

  ctx.at(collapse, () => {
    const cx = AW / 2, cy = AH / 2;
    for (const { chip, x, y, rot } of chips) {
      const w = chip.offsetWidth, h = chip.offsetHeight;
      const dx = cx - (x + w / 2), dy = cy - (y + h / 2);
      chip.animate(
        [{ transform: `rotate(${rot}deg)`, opacity: 1 },
         { transform: `translate(${dx}px, ${dy}px) scale(.1) rotate(0deg)`, opacity: 0 }],
        { duration: rand(650, 1050), delay: rand(0, 350), easing: "cubic-bezier(.7,0,.3,1)", fill: "forwards" });
    }
    r.core.classList.add("on");
  });
  ctx.at(collapse + 1100, () => { r.card.classList.add("show"); r.core.classList.add("burst"); });

  const reduction = ((total - 1) / total) * 100;
  ctx.loop((t) => {
    const f = easeOut(progress(t, spawnFrom, spawnTo - spawnFrom + 300));
    r.alerts.textContent = num(Math.round(total * Math.pow(f, 1.4)));
    const g = easeOut(progress(t, collapse + 900, 1400));
    r.inc.textContent = t > collapse + 1000 ? "1" : "0";
    r.pct.textContent = `${(reduction * g).toFixed(1)}%`;
    r.bar.style.transform = `scaleX(${(reduction / 100) * g})`;
  });
};
