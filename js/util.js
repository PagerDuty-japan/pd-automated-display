/* 共通ユーティリティ：テキスト整形・アイコン・アニメーション補助 */
window.SCENES = {};

window.U = (function () {
  const esc = (s) =>
    String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /** *強調* と \n を HTML に変換 */
  const rich = (s) => esc(s).replace(/\*(.+?)\*/g, "<em>$1</em>").replace(/\n/g, "<br>");

  /**
   * 見出しを1文字ずつのspanに分割（文字ごとの時差アニメーション用）
   * 英単語は折り返されないよう単語単位でまとめる
   */
  function splitChars(s, opts = {}) {
    const base = opts.delay || 0;
    const step = opts.step || 30;
    let i = 0;
    let html = "";
    for (const part of String(s ?? "").split(/(\*[^*]+\*|\n)/)) {
      if (!part) continue;
      if (part === "\n") { html += "<br>"; continue; }
      const accent = /^\*.*\*$/.test(part);
      const text = accent ? part.slice(1, -1) : part;
      let inner = "";
      for (const tok of text.match(/[A-Za-z0-9][A-Za-z0-9.,%'’\-/+]*|./gsu) || []) {
        const chars = Array.from(tok).map((ch) => {
          if (ch === " ") return '<span class="ch sp"> </span>';
          return `<span class="ch" style="--d:${base + i++ * step}ms">${esc(ch)}</span>`;
        }).join("");
        inner += tok.length > 1 ? `<span class="w">${chars}</span>` : chars;
      }
      html += accent ? `<em>${inner}</em>` : inner;
    }
    return html;
  }
  const charCount = (s) => Array.from(String(s ?? "").replace(/[*\n ]/g, "")).length;

  /* ---- アイコン（24x24 ストローク） ---- */
  const ICONS = {
    bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9 M10.3 21a1.94 1.94 0 0 0 3.4 0",
    bolt: "M13 2 3 14h9l-1 8 10-12h-9l1-8z",
    users: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2 M9 3a4 4 0 1 1 0 8a4 4 0 1 1 0-8 M22 21v-2a4 4 0 0 0-3-3.87 M16 3.13a4 4 0 0 1 0 7.75",
    check: "M20 6 9 17l-5-5",
    search: "M11 4a7 7 0 1 1 0 14a7 7 0 1 1 0-14 M21 21l-4.35-4.35",
    radar: "M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0 M16.24 7.76a6 6 0 0 1 0 8.49 M7.76 16.24a6 6 0 0 1 0-8.49 M19.07 4.93a10 10 0 0 1 0 14.14 M4.93 19.07a10 10 0 0 1 0-14.14",
    filter: "M22 3H2l8 9.46V19l4 2v-8.54L22 3z",
    wrench: "M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z",
    book: "M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z",
    phone: "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z",
    sms: "M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z",
    push: "M7 2h10a2 2 0 0 1 2 2v16a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z M12 18h.01",
    mail: "M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z M22 6l-10 7L2 6",
    sparkle: "M12 3l1.9 5.8L20 11l-6.1 2.2L12 19l-1.9-5.8L4 11l6.1-2.2z M19 2v4 M21 4h-4",
    clock: "M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20 M12 6v6l4 2",
    shield: "M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z",
    layers: "M12 2 2 7l10 5 10-5-10-5z M2 17l10 5 10-5 M2 12l10 5 10-5",
    play: "M6 3l14 9-14 9V3z",
    activity: "M22 12h-4l-3 9L9 3l-3 9H2",
    alert: "M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z M12 9v4 M12 17h.01",
    hash: "M4 9h16 M4 15h16 M10 3 8 21 M16 3l-2 18",
    pin: "M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z M12 7a3 3 0 1 1 0 6a3 3 0 1 1 0-6",
    globe: "M12 2a10 10 0 1 1 0 20a10 10 0 1 1 0-20 M2 12h20 M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z",
    monitor: "M3 4h18v12H3z M8 20h8 M12 16v4",
  };
  const icon = (name, cls = "") =>
    `<svg class="i ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[name] || ICONS.check}"/></svg>`;

  /* ---- 共通パーツ ---- */
  /** eyebrow + 見出し + リード文。見出しは1文字ずつ現れる */
  function header(d, o = {}) {
    const d0 = o.delay ?? 150;
    const step = o.step ?? 32;
    const tStart = d0 + 250;
    const tEnd = Math.min(tStart + charCount(d.title) * step + 150, 1600);
    return `<div class="hd ${o.cls || ""}">
      ${d.eyebrow ? `<div class="eyebrow rv" style="--d:${d0}ms">${esc(d.eyebrow)}</div>` : ""}
      ${d.title ? `<h2 class="title ${o.size || ""}">${splitChars(d.title, { delay: tStart, step })}</h2>` : ""}
      ${d.lead && !o.noLead ? `<p class="lead rv" style="--d:${tEnd}ms">${rich(d.lead)}</p>` : ""}
    </div>`;
  }

  function points(list, delay = 1200) {
    if (!list || !list.length) return "";
    return `<ul class="pts">${list.map((p, i) => {
      const it = typeof p === "string" ? { text: p } : p;
      return `<li class="rv" style="--d:${delay + i * 160}ms"><span class="ic">${icon(it.icon || "check")}</span><span>${rich(it.text)}</span></li>`;
    }).join("")}</ul>`;
  }

  /** data-r="name" を持つ要素をまとめて取得 */
  function refs(root) {
    const r = {};
    root.querySelectorAll("[data-r]").forEach((e) => (r[e.dataset.r] = e));
    return r;
  }

  const el = (tag, cls, html) => {
    const e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  };

  /* ---- 数値・イージング ---- */
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const rand = (a, b) => a + Math.random() * (b - a);
  const pick = (a) => a[Math.floor(Math.random() * a.length)];
  const easeOut = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
  const easeInOut = (t) => { t = clamp(t, 0, 1); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
  const progress = (t, start, dur) => clamp((t - start) / dur, 0, 1);
  const num = (v, dec = 0) => Number(v).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const pad = (n) => String(Math.floor(n)).padStart(2, "0");
  const hms = (sec) => `${pad(sec / 3600)}:${pad((sec % 3600) / 60)}:${pad(sec % 60)}`;
  const ms = (sec) => `${pad(sec / 60)}:${pad(sec % 60)}`;
  const parseMs = (s) => { const m = /^(\d+):(\d+)$/.exec(s || ""); return m ? +m[1] * 60 + +m[2] : null; };

  return { esc, rich, splitChars, charCount, icon, header, points, refs, el, clamp, lerp, rand, pick, easeOut, easeInOut, progress, num, hms, ms, parseMs };
})();
