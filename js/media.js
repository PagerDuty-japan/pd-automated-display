/* 動画などのメディアをブラウザ内（Cache Storage）に保存して、2回目以降は通信せずに再生する
 *
 *  - リモート URL（http/https）だけが対象。ローカルパスはそのまま使う
 *  - 起動時に MEDIA.preload() でスライドショーに含まれる動画を裏で先に取得しておく
 *  - 保存には配信元の CORS 許可（Access-Control-Allow-Origin）が必要。
 *    許可がない・file:// で開いている等で保存できないときは、URL を直接再生する（ブラウザの通常キャッシュ任せ）
 *  - 同じ URL のまま中身を差し替えたときは、URL に ?v=2 などを付けると取り直す
 */
(function () {
  const CACHE = "pd-display-media-v1";
  const canCache = () => typeof caches !== "undefined" && window.isSecureContext;
  const isRemote = (src) => /^https?:\/\//i.test(src || "");
  const inflight = new Map(); // src -> Promise<boolean>（保存できたら true）

  function download(src) {
    if (!inflight.has(src)) {
      const p = (async () => {
        const cache = await caches.open(CACHE);
        if (await cache.match(src)) return true;
        // CORS が許可されているかを 1 バイトだけ取って確かめる（不許可なら全体をダウンロードしない）
        const probe = await fetch(src, { mode: "cors", credentials: "omit", headers: { Range: "bytes=0-0" } });
        await probe.body?.cancel();
        const res = await fetch(src, { mode: "cors", credentials: "omit" });
        if (!res.ok || res.status !== 200) throw new Error(`HTTP ${res.status}`);
        await cache.put(src, res);
        console.info("[media] cached:", src);
        return true;
      })().catch((e) => {
        console.warn("[media] キャッシュできないため直接再生します:", src, e.message || e);
        return false;
      });
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
      } catch (_) {}
      for (const src of keep) await download(src); // 回線を食い合わないよう1本ずつ
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
        if (!res) { download(src); return direct; }
        const url = URL.createObjectURL(await res.blob());
        return { url, release: () => URL.revokeObjectURL(url) };
      } catch (_) {
        return direct;
      }
    },
  };
})();
