/* title：オープニング。心電図のような「サービスの鼓動」ラインと回転するリング */
SCENES.title = function (root, d, ctx) {
  const { esc, rich, splitChars, charCount } = U;
  const W = 1920, base = 850;

  // 波形：左側はフラット、右側に鼓動のスパイク
  let p = `M-20 ${base}`;
  for (let x = 980; x < W - 160; x += 250) {
    p += ` L${x} ${base} l12 -14 l12 14 l14 0 l10 22 l14 -120 l14 150 l12 -52 l22 0 l18 -22 l22 22`;
  }
  p += ` L${W + 20} ${base}`;

  const titleDelay = 350, step = 55;
  const after = titleDelay + charCount(d.title) * step;

  root.innerHTML = `
    <svg class="t-wave" viewBox="0 0 ${W} 1080" aria-hidden="true">
      <defs>
        <linearGradient id="tw-fade" x1="0" x2="1">
          <stop offset="0" stop-color="#2BD566" stop-opacity="0"/>
          <stop offset=".35" stop-color="#2BD566" stop-opacity=".9"/>
          <stop offset="1" stop-color="#2BD566"/>
        </linearGradient>
        <filter id="tw-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
      </defs>
      <path class="w-base" d="${p}"/>
      <path class="w-trace glow" d="${p}" filter="url(#tw-glow)"/>
      <path class="w-trace" d="${p}"/>
      <circle class="w-dot-halo" r="22"/>
      <circle class="w-dot" r="6"/>
    </svg>

    <svg class="t-rings" viewBox="-400 -400 800 800" aria-hidden="true">
      <g class="r r1"><circle r="330"/></g>
      <g class="r r2"><circle r="270"/><circle class="sat" cx="270" r="7"/></g>
      <g class="r r3"><circle r="205"/><circle class="sat" cx="-205" r="5"/></g>
      <g class="r r4"><circle r="140"/></g>
      <circle class="core" r="104"/>
      <text class="ring-label" y="8">${esc(d.ringLabel || "")}</text>
    </svg>

    <div class="t-body">
      <div class="eyebrow rv" style="--d:150ms">${esc(d.eyebrow || "")}</div>
      <h1 class="t-headline">${splitChars(d.title, { delay: titleDelay, step })}</h1>
      <p class="lead rv" style="--d:${after + 150}ms">${rich(d.lead || "")}</p>
      <div class="tags">${(d.tags || []).map((t, i) => `<span class="tag rv" style="--d:${after + 450 + i * 110}ms">${esc(t)}</span>`).join("")}</div>
    </div>`;

  const traces = root.querySelectorAll(".w-trace");
  const dot = root.querySelector(".w-dot"), halo = root.querySelector(".w-dot-halo");
  const path = traces[0];
  const len = path.getTotalLength();
  const seg = 520, speed = len / 4200; // 4.2秒で横断
  traces.forEach((t) => (t.style.strokeDasharray = `${seg} ${len + seg}`));

  ctx.loop((t) => {
    if (t < 600) return;
    const pos = ((t - 600) * speed) % (len + seg);
    traces.forEach((tr) => (tr.style.strokeDashoffset = seg - pos));
    const pt = path.getPointAtLength(Math.min(pos, len));
    const vis = pos <= len ? 1 : 0;
    for (const c of [dot, halo]) { c.setAttribute("cx", pt.x); c.setAttribute("cy", pt.y); c.style.opacity = vis; }
  });
};
