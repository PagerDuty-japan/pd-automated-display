/* escalation：オンコール通知 → 未応答なら次の担当者へ → ACK → 解決 */
SCENES.escalation = function (root, d, ctx) {
  const { esc, header, points, refs, icon, ms } = U;
  const tiers = d.tiers || [];
  const inc = d.incident || {};
  const scale = d.timeScale || 60;
  const CH = { push: ["push", "Push"], sms: ["sms", "SMS"], phone: ["phone", "Call"], mail: ["mail", "Email"], chat: ["hash", "Chat"] };

  root.innerHTML = `
    <div class="col-l">${header(d)}${points(d.points, 1500)}</div>
    <div class="es">
      <div class="es-inc rv" style="--d:700ms" data-r="inc">
        <span class="dot"></span>
        <span class="state mono" data-r="state">TRIGGERED</span>
        <span class="prio">${esc(inc.priority || "P1")}</span>
        <span class="ttl">${esc(inc.title || "")}</span>
        <span class="timer mono" data-r="timer">00:00</span>
      </div>
      <div class="es-tiers">
        <div class="es-rail"><i data-r="rail"></i></div>
        ${tiers.map((t, i) => `
          <div class="tier rv" style="--d:${900 + i * 150}ms">
            <div class="lv mono">${esc(t.level || "L" + (i + 1))}</div>
            <div class="av"><span>${esc(t.initials || "")}</span><i class="ring"></i><i class="ring r2"></i></div>
            <div class="who"><b>${esc(t.name || "")}</b><small class="mono">${esc(t.role || "")}</small></div>
            <div class="chs">${(t.channels || []).map((c) => `<span class="c" title="${esc(c)}">${icon((CH[c] || CH.push)[0])}<em class="mono">${(CH[c] || [, c])[1]}</em></span>`).join("")}</div>
            <div class="st mono"><span>STANDBY</span></div>
          </div>`).join("")}
      </div>
    </div>`;

  const r = refs(root);
  const rows = [...root.querySelectorAll(".tier")];
  const setSt = (row, txt) => (row.querySelector(".st span").textContent = txt);
  const railTo = (i) => {
    const row = rows[i];
    r.rail.style.height = `${row.offsetTop + row.offsetHeight / 2}px`;
  };

  // タイムライン
  const t0 = 1800;
  let T = t0, ackAt = null, resolveAt = null;
  ctx.at(t0, () => r.inc.classList.add("live"));
  tiers.forEach((tier, i) => {
    if (ackAt != null || tier.outcome === "standby") return;
    const row = rows[i];
    const start = T;
    ctx.at(start, () => { railTo(i); row.classList.add("notify"); setSt(row, "NOTIFYING"); });
    row.querySelectorAll(".c").forEach((c, k) => ctx.at(start + 350 + k * 420, () => c.classList.add("on")));
    if (tier.outcome === "ack") {
      ackAt = start + 2200;
      ctx.at(ackAt, () => {
        row.classList.remove("notify"); row.classList.add("ack"); setSt(row, "ACKNOWLEDGED");
        r.inc.classList.add("acked"); r.state.textContent = "ACKNOWLEDGED";
      });
      resolveAt = ackAt + 3000;
      ctx.at(resolveAt, () => { r.inc.classList.add("resolved"); r.state.textContent = "RESOLVED"; row.classList.add("resolved"); });
    } else {
      ctx.at(start + 3000, () => { row.classList.remove("notify"); row.classList.add("timeout"); setSt(row, "NO RESPONSE"); });
      T = start + 3500;
    }
  });

  ctx.loop((t) => {
    if (t < t0) return;
    const end = resolveAt ?? Infinity;
    r.timer.textContent = ms(((Math.min(t, end) - t0) / 1000) * scale);
  });
};
