# CLAUDE.md

PagerDuty のイベント出展用・会場モニター向け自動再生スライドショー。依存なし・ビルドなしの静的サイト。

## 原則

- 内容の更新は `content/slides.js` だけで完結させる。新しい表現が必要なときだけ `js/scenes/` にシーンを追加する。
- 画像（PNG/JPG）は使わない。テキスト・CSS・インライン SVG をコードで生成する。
- 1920×1080 の固定キャンバス上でピクセル指定でレイアウトする（エンジンが拡縮）。
  - コンテンツの安全領域：上 170px〜下 850px（下は字幕、上はロゴ・時計）。左右の余白は `--pad-x`（140px）。
- `file://` でも動くように ES Modules や fetch は使わず、`<script>` の順読み込みにする。

## シーンの作り方

`js/scenes/<name>.js` で `SCENES.<name> = function (root, data, ctx) { ... }` を定義し、`index.html` に `<script>` を追加。

- `root`：スライドの `<section>`（すでに DOM に追加済み）
- `data`：`content/slides.js` のスライドオブジェクト
- `ctx.at(ms, fn)`：スライド開始から ms 後に実行（一時停止に追従）。`setTimeout` は使わない
- `ctx.loop((t, dt) => {})`：毎フレーム実行
- `ctx.dur`：スライドの長さ（ms）
- 出現アニメーションは `.rv` クラス＋`style="--d:300ms"`、見出しは `U.header(data)` / `U.splitChars()`

## デザイン

- トークンは `css/base.css` の `:root`。アクセントは `--g2`、状態色は `--red`（triggered）/ `--amber`（acknowledged）/ `--g2`（resolved）で PagerDuty の状態表現に合わせる。
- 見出しは Noto Sans JP 900、ラベル類は JetBrains Mono の大文字＋広めのトラッキング。
- 実在の顧客名や未確認の数値を書かない。数値はサンプルである旨を明記する。

## 確認

`python3 -m http.server` で配信し、`?slide=N&reload=0` で個別スライドを確認。Playwright で 1920×1080 のスクリーンショットを撮って崩れ（字幕との重なり等）をチェックする。
