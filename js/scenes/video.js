/* video：動画を全画面で再生し、終わったら次のスライドへ
 *  src はリモート URL（初回にブラウザ内へ保存）またはローカルパス
 *  duration を省略すると動画の長さに合わせる */
SCENES.video = function (root, d, ctx) {
  root.innerHTML = `<div class="vd-wrap"><video class="vd" playsinline preload="auto"></video></div>`;
  const v = root.querySelector("video");
  v.muted = d.muted !== false;
  v.style.objectFit = d.fit || "contain";

  const fixed = d.duration != null;
  let release = () => {}, gone = false, ready = false;
  // 長さが分かるまで（読み込み中・バッファ待ちの間も）スライドを終わらせない
  if (!fixed) ctx.setDuration(Infinity);

  const skip = (why) => {
    console.warn("[video] スキップ:", d.src, why);
    ctx.at(ctx.t + 1000, () => ctx.next());
  };

  v.addEventListener("loadedmetadata", () => {
    ready = true;
    if (!fixed) ctx.setDuration(v.duration * 1000);
  });
  v.addEventListener("ended", () => ctx.next());
  v.addEventListener("error", () => skip(v.error && v.error.message));

  ctx.loop((t, dt) => {
    // バッファ待ちで止まっている間は、その分だけ終了時刻を延ばす
    if (!fixed && ready && (v.readyState < 3 || v.paused) && !v.ended) ctx.setDuration(ctx.dur + dt);
  });
  ctx.onDestroy(() => { gone = true; v.pause(); v.removeAttribute("src"); v.load(); release(); });

  if (!d.src) return skip("src がありません");
  MEDIA.resolve(d.src).then((r) => {
    if (gone) return r.release();
    release = r.release;
    v.src = r.url;
    v.play().catch(() => {
      // 音あり自動再生がブロックされたらミュートで再生し、最初のクリック／キー操作で音を戻す
      console.warn("[video] 音ありの自動再生がブロックされたためミュートで再生します。画面をクリックすると音が出ます");
      v.muted = true;
      v.play().catch((e) => skip(e.message));
      if (d.muted === false) {
        const unmute = () => { if (!gone) v.muted = false; off(); };
        const off = () => ["pointerdown", "keydown"].forEach((ev) => removeEventListener(ev, unmute, true));
        ["pointerdown", "keydown"].forEach((ev) => addEventListener(ev, unmute, true));
        ctx.onDestroy(off);
      }
    });
  });
};
