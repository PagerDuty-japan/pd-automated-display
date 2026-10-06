/* stats：リングゲージと数値のカウントアップ */
SCENES.stats = function (root, d, ctx) {
  const { esc, rich, header, num, easeOut, progress } = U;
  const items = d.items || [];
  const R = 104, C = 2 * Math.PI * R;
  const start = 1500;

  root.innerHTML = `
    <div class="sx-head">${header(d)}</div>
    <div class="sx-row" style="--n:${items.length}">
      ${items.map((it, i) => `
        <div class="sx rv" style="--d:${1100 + i * 180}ms">
          <div class="gauge">
            <svg viewBox="-130 -130 260 260">
              <circle class="trk" r="${R}"/>
              <circle class="ticks" r="122"/>
              <circle class="arc" r="${R}" stroke-dasharray="${C}" stroke-dashoffset="${C}" transform="rotate(-90)"/>
            </svg>
            <div class="val mono">${esc(it.prefix || "")}<span class="n">0</span><small>${esc(it.suffix || "")}</small></div>
          </div>
          <div class="lb">${esc(it.label || "")}</div>
          <div class="ds">${rich(it.desc || "")}</div>
        </div>`).join("")}
    </div>
    ${d.footnote ? `<div class="sx-foot rv" style="--d:2400ms">${esc(d.footnote)}</div>` : ""}`;

  const blocks = [...root.querySelectorAll(".sx")];
  ctx.loop((t) => {
    blocks.forEach((b, i) => {
      const it = items[i];
      const p = easeOut(progress(t, start + i * 250, 2000));
      b.querySelector(".n").textContent = num(it.value * p, it.decimals || 0);
      b.querySelector(".arc").setAttribute("stroke-dashoffset", C * (1 - (it.ring ?? 1) * p));
    });
  });
};
