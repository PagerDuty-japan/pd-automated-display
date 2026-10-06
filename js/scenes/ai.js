/* ai：インシデントチャンネルでAIエージェントが要約・提案・Runbook実行 */
SCENES.ai = function (root, d, ctx) {
  const { esc, rich, header, points, refs, icon } = U;
  const CPS = 42; // タイピング速度（文字/秒）

  root.innerHTML = `
    <div class="col-l">${header(d)}${points(d.points, 1500)}</div>
    <div class="ai-win rv" style="--d:500ms">
      <div class="bar">
        <span class="dots"><i></i><i></i><i></i></span>
        <span class="ch mono">${icon("hash")}${esc(d.channel || "incident")}</span>
      </div>
      <div class="feed" data-r="feed"></div>
    </div>`;

  const r = refs(root);
  const feed = r.feed;
  const add = (node) => { feed.appendChild(node); requestAnimationFrame(() => node.classList.add("in")); return node; };

  (d.messages || []).forEach((m, idx) => {
    const at = (m.at || 0) * 1000;
    if (m.from === "system") {
      ctx.at(at, () => add(U.el("div", "msg sys", `<span class="ico">${icon("alert")}</span><span>${rich(m.text)}</span>`)));
      return;
    }
    if (m.from === "user") {
      ctx.at(at, () => add(U.el("div", "msg user", `
        <div class="av">${esc(m.initials || "")}</div>
        <div class="body"><div class="meta"><b>${esc(m.name || "")}</b></div>
        <div class="text">${rich(m.text)}</div></div>`)));
      return;
    }
    // agent：入力中 → タイピング → 箇条書き → アクション
    let node, textEl, typeStart;
    const full = Array.from(m.text || "");
    ctx.at(at, () => {
      node = add(U.el("div", "msg agent typing", `
        <div class="av">${icon("sparkle")}</div>
        <div class="body"><div class="meta"><b>${esc(m.name || "AI")}</b></div>
        <div class="text"><span class="typing"><i></i><i></i><i></i></span><span class="tx"></span></div></div>`));
      textEl = node.querySelector(".tx");
    });
    typeStart = at + 900;
    const typeEnd = typeStart + (full.length / CPS) * 1000;
    ctx.at(typeStart, () => node.classList.remove("typing"));
    ctx.loop((t) => {
      if (!textEl || t < typeStart) return;
      const k = Math.min(full.length, Math.floor(((t - typeStart) / 1000) * CPS));
      if (textEl.dataset.k != k) { textEl.dataset.k = k; textEl.textContent = full.slice(0, k).join(""); }
      textEl.classList.toggle("caret", k < full.length);
    });
    (m.bullets || []).forEach((b, k) => ctx.at(typeEnd + 250 + k * 450, () => {
      let ul = node.querySelector("ul");
      if (!ul) { ul = U.el("ul", "bul"); node.querySelector(".body").appendChild(ul); }
      const li = U.el("li", "", rich(b));
      ul.appendChild(li);
      requestAnimationFrame(() => li.classList.add("in"));
    }));
    if (m.action) {
      const a = m.action;
      ctx.at(typeEnd + 300, () => {
        const btn = U.el("div", "act", `<span class="ic">${icon("play")}</span><span class="lb">${esc(a.label)}</span><span class="pr"><i></i></span>`);
        node.querySelector(".body").appendChild(btn);
        requestAnimationFrame(() => btn.classList.add("in"));
      });
      const at2 = (a.at || 0) * 1000 || typeEnd + 2500;
      ctx.at(at2, () => node.querySelector(".act")?.classList.add("press"));
      ctx.at(at2 + 1700, () => {
        const btn = node.querySelector(".act");
        if (!btn) return;
        btn.classList.add("done");
        btn.querySelector(".ic").innerHTML = icon("check");
        btn.querySelector(".lb").textContent = a.done || "Done";
      });
    }
  });
};
