/* cta：クロージング。中心から広がる波紋とブース案内 */
SCENES.cta = function (root, d) {
  const { esc, rich, splitChars, charCount, icon } = U;
  const step = 50, td = 400;
  const after = td + charCount(d.title) * step;

  root.innerHTML = `
    <svg class="cta-rings" viewBox="-960 -540 1920 1080" aria-hidden="true">
      ${[180, 300, 440, 600, 780].map((r, i) => `<circle class="ring" r="${r}" style="--i:${i}"/>`).join("")}
      ${[0, 1, 2].map((i) => `<circle class="wave" r="160" style="--i:${i}"/>`).join("")}
    </svg>
    <div class="cta-body">
      <div class="eyebrow rv center" style="--d:150ms">${esc(d.eyebrow || "")}</div>
      <h2 class="cta-title">${splitChars(d.title, { delay: td, step })}</h2>
      <p class="lead rv" style="--d:${after + 100}ms">${rich(d.lead || "")}</p>
      ${d.items && d.items.length ? `<div class="cta-items">
        ${d.items.map((it, i) => `
          <div class="it rv" style="--d:${after + 400 + i * 150}ms">
            <span class="ic">${icon(it.icon || "check")}</span>
            <div><div class="k mono">${esc(it.key || "")}</div><div class="v">${esc(it.value || "")}</div></div>
          </div>`).join("")}
      </div>` : ""}
    </div>`;
};
