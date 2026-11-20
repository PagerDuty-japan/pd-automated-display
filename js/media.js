/* 動画などのメディアをブラウザ内（Cache Storage）に保存して、2回目以降は通信せずに再生する
 *
 *  - リモート URL（http/https）だけが対象。ローカルパスはそのまま使う
 *  - 起動時に MEDIA.preload() でスライドショーに含まれる動画を裏で先に取得しておく
 *  - 細い回線でも保存まで辿り着けるように、少しずつ（Range で分割して）ダウンロードし、
 *    取得済みの部分もブラウザ内に保存する。1周ごとのページ再読み込みで中断されても続きから再開する
 *  - 保存には配信元の CORS 許可（Access-Control-Allow-Origin）が必要。
 *    許可がない・file:// で開いている等で保存できないときは、URL を直接再生する（ブラウザの通常キャッシュ任せ）
 *  - 同じ URL のまま中身を差し替えたときは、URL に ?v=2 などを付けると取り直す
 */
(function () {
  const CACHE = "pd-display-media-v1";        // 完成した動画（キー＝元の URL）
  const PARTS = "pd-display-media-parts-v1";  // ダウンロード途中の断片
  const CHUNK = 2 * 1024 * 1024;              // 1回の取得サイズ（2MB）
  const canCache = () => typeof caches !== "undefined" && window.isSecureContext;
  const isRemote = (src) => /^https?:\/\//i.test(src || "");
  const partKey = (src, i) => `https://pd-display.invalid/part?i=${i}&src=${encodeURIComponent(src)}`;
  const partSrc = (key) => new URL(key).searchParams.get("src");

  const inflight = new Map(); // src -> Promise<boolean>（保存できたら true）
  const state = new Map();    // src -> "cached" | "pending" | "failed"

  async function fetchPart(src, start) {
    const res = await fetch(src, {
      mode: "cors",
      credentials: "omit",
      cache: "no-store", // 取得した断片は自前で保存するので、ブラウザの通常キャッシュには入れない
      headers: { Range: `bytes=${start}-${start + CHUNK - 1}` },
    });
    if (res.status === 416) return { done: true };
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return { res, whole: res.status === 200 };
  }

  async function download(src) {
    const cache = await caches.open(CACHE);
    if (await cache.match(src)) return true;
    const parts = await caches.open(PARTS);
    const blobs = [];
    let type = "";

    // 保存済みの断片を読み込む（前回の続きから再開）
    for (let i = 0; ; i++) {
      const r = await parts.match(partKey(src, i));
      if (!r) break;
      type = type || r.headers.get("content-type") || "";
      blobs.push(await r.blob());
    }

    let finished = blobs.length > 0 && blobs[blobs.length - 1].size < CHUNK;
    while (!finished) {
      const offset = blobs.length * CHUNK;
      let p;
      try {
        p = await fetchPart(src, offset);
      } catch (e) {
        // Range 付きの取得が CORS で拒否される配信元向け：最初の 1 回だけ、分割せずに全体を取りにいく
        if (offset > 0 || !(e instanceof TypeError)) throw e;
        const res = await fetch(src, { mode: "cors", credentials: "omit", cache: "no-store" });
        if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
        p = { res, whole: true };
      }
      if (p.done) break;
      type = type || p.res.headers.get("content-type") || "";
      if (p.whole) {
        // 配信元が分割取得に対応していない：全体を一度に保存する
        if (blobs.length) throw new Error("分割取得の途中で全体が返されました");
        await cache.put(src, p.res);
        await clearParts(src);
        return true;
      }
      const blob = await p.res.blob();
      await parts.put(partKey(src, blobs.length), new Response(blob, { headers: { "content-type": type } }));
      blobs.push(blob);
      finished = blob.size < CHUNK;
    }

    // 断片をつなげて 1 本の動画として保存し、断片は消す
    const whole = new Blob(blobs, { type: type || "video/mp4" });
    await cache.put(src, new Response(whole, { headers: { "content-type": whole.type, "content-length": String(whole.size) } }));
    await clearParts(src);
    return true;
  }

  async function clearParts(src) {
    const parts = await caches.open(PARTS);
    for (const req of await parts.keys()) if (partSrc(req.url) === src) await parts.delete(req);
  }

  function ensure(src) {
    if (!inflight.has(src)) {
      state.set(src, "pending");
      const p = download(src).then(
        () => {
          state.set(src, "cached");
          console.info("[media] cached:", src);
          return true;
        },
        (e) => {
          state.set(src, "failed");
          console.warn("[media] キャッシュできないため直接再生します:", src, e.message || e);
          return false;
        }
      );
      inflight.set(src, p);
    }
    return inflight.get(src);
  }

  window.MEDIA = {
    /** スライドショーで使う動画を裏で取得し、使われなくなった古い動画を削除する */
    async preload(srcs) {
      if (!canCache()) return;
      const keep = new Set(srcs.filter(isRemote));
      try {
        navigator.storage?.persist?.().catch(() => {});
        const cache = await caches.open(CACHE);
        for (const req of await cache.keys()) if (!keep.has(req.url)) await cache.delete(req);
        const parts = await caches.open(PARTS);
        for (const req of await parts.keys()) if (!keep.has(partSrc(req.url))) await parts.delete(req);
        // 保存済みかどうかを先に確定させる（再生時に「取得中」と誤判定しないため）
        for (const src of keep) if (await cache.match(src)) state.set(src, "cached");
      } catch (_) {}
      for (const src of keep) state.has(src) || state.set(src, "pending");
      for (const src of keep) await ensure(src); // 回線を食い合わないよう1本ずつ
    },

    /**
     * 動画の保存状況を返す（同期）
     *  "cached"：保存済み（通信なしで再生できる）
     *  "pending"：取得中・取得待ち
     *  "direct"：保存できない（直接再生する）
     */
    state(src) {
      if (!isRemote(src) || !canCache()) return "direct";
      const s = state.get(new URL(src, location.href).href);
      return s === "failed" || !s ? "direct" : s;
    },

    /**
     * 再生用の URL を返す。{ url, release }
     * 保存済みなら blob: URL（通信なし）。未保存ならダウンロード完了を待たずに元の URL を返す
     */
    async resolve(src) {
      const direct = { url: src, release() {} };
      if (!isRemote(src) || !canCache()) return direct;
      try {
        const res = await (await caches.open(CACHE)).match(src);
        if (!res) { ensure(src); return direct; }
        const url = URL.createObjectURL(await res.blob());
        return { url, release: () => URL.revokeObjectURL(url) };
      } catch (_) {
        return direct;
      }
    },
  };
})();
