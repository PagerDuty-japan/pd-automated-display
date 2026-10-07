# PagerDuty Booth Display

PagerDuty がイベントに出展するときに、会場モニターへ投影するための自動再生スライドショーです。
HTML / CSS / JavaScript だけで作られており、モーション・字幕・ライブ風のデモアニメーションで、通りがかった人にも内容が一目で伝わるようにしています。

- **ビルド不要**：`index.html` をブラウザで開くだけで再生されます（`file://` でも動作）
- **1920×1080 固定キャンバス**：どの解像度のモニターでも比率を保って拡縮
- **コンテンツは 1 ファイル**：`content/slides.js` を編集するだけで文言・順番・タイミング・字幕を更新可能
- **画像ファイルなし**：グラフィックはすべてテキストと SVG（ベクター）をコードで生成しているので、差し替えや修正が簡単

## 使い方

```bash
# ローカルで配信（推奨：1周ごとに自動リロードされ、更新が反映されます）
python3 -m http.server 8000
# → http://localhost:8000/ を開いて F キーで全画面
```

### キーボード操作

| キー | 動作 |
| --- | --- |
| `→` / `Space` / `PageDown` | 次のスライド |
| `←` / `PageUp` | 前のスライド |
| `1`〜`9` | 指定番号のスライドへジャンプ |
| `P` | 一時停止 / 再開 |
| `R` | 現在のスライドを最初から |
| `C` | 字幕の表示 / 非表示 |
| `F` | 全画面 |

画面の右側クリックで次へ、左側クリックで前へ戻ります。マウスカーソルは 2 秒で自動的に隠れます。

右下（進捗バーの下）の半透明のアイコンからも全画面にできます。全画面中はアイコンが隠れ、マウスを動かすと現れます。

### URL パラメータ

| パラメータ | 例 | 説明 |
| --- | --- | --- |
| `slide` | `?slide=3` | 指定スライドから再生 |
| `captions` | `?captions=0` | 字幕を非表示 |
| `chrome` | `?chrome=0` | ロゴ・時計・進捗バーを非表示 |
| `reload` | `?reload=0` | 1 周ごとの自動リロードを無効化 |

全画面表示中は、ページを再読み込みすると全画面が解除されるため、1 周ごとに `content/slides.js` だけを読み直します（シーンや CSS の変更は反映されません）。

## ファイル構成

```
index.html            エントリーポイント
content/slides.js     ★ スライドの内容（ここを編集）
css/base.css          デザイントークン・共通レイアウト・字幕・トランジション
css/scenes.css        シーンごとのスタイル
js/util.js            テキスト整形・アイコン・共通パーツ
js/engine.js          再生エンジン（切替・字幕・進捗・操作）
js/scenes/*.js        シーン（スライドのテンプレート）
```

## コンテンツの編集

`content/slides.js` の `slides` 配列に、スライドを上から順に並べます。

### 共通の項目

| 項目 | 説明 |
| --- | --- |
| `type` | シーンの種類（下表） |
| `label` | 進捗バー横に出る短い名前 |
| `duration` | 表示秒数 |
| `eyebrow` | 見出し上の小さなラベル |
| `title` | 見出し。`*強調*` でグリーン、`\n` で改行 |
| `lead` | リード文 |
| `captions` | 字幕。`{ at: 秒, ja: "日本語", en: "English" }` の配列。`at` 省略時は均等配置 |
| `hidden` | `true` で再生対象から外す |

> 見出しは 1 行あたり全角 10 文字程度までが目安です（2 カラムのシーン）。

### シーンの種類

| type | 内容 | 固有の項目 |
| --- | --- | --- |
| `title` | オープニング。鼓動ラインと回転リング | `tags`, `ringLabel` |
| `statement` | 汎用テキスト（お知らせ・セッション案内など） | `points`, `image`（SVG パス） |
| `noise` | アラートの洪水が少数のインシデントに集約 | `totalAlerts`, `incidents`, `visibleAlerts`, `collapseAt`, `alertSamples`, `sources`, `hosts`, `incident` |
| `flow` | 検知→学習のライフサイクル | `steps[{icon,label,en,time,status,desc}]`, `clockLabel` |
| `escalation` | オンコール通知とエスカレーション | `points`, `incident`, `tiers[{level,initials,name,role,channels,outcome}]`, `timeScale` |
| `ai` | AI エージェントとのチャット | `points`, `channel`, `messages[{at,from,name,text,bullets,action}]` |
| `dashboard` | サービス監視 → 自動修復 → 復旧 | `services[{name,team,base,unit}]`, `incident{service,at,remediateAt,resolveAt,runbook}`, `status` |
| `stats` | リングゲージ＋カウントアップ | `items[{value,prefix,suffix,decimals,label,desc,ring}]`, `footnote` |
| `cta` | クロージング／ブース案内 | `items[{icon,key,value}]` |
| `video` | 動画を全画面で再生し、終わったら次へ | `src`, `muted`, `fit` |

- `escalation` の `outcome`：`timeout`（未応答→次へ）/ `ack`（応答）/ `standby`（待機のまま）
- `ai` の `from`：`system` / `user` / `agent`
- 使えるアイコン名：`bell bolt users check search radar filter wrench book phone sms push mail sparkle clock shield layers play activity alert hash pin globe monitor`

### 動画

```js
{ type: "video", label: "紹介動画", src: "https://example.com/movie.mp4" }
```

- `src`：動画の URL（mp4 などのファイルを直接指すもの）またはローカルパス（例：`media/movie.mp4`）。YouTube などの共有ページの URL は使えません
- `duration` を省略すると動画の長さだけ再生して次へ進みます（指定するとその秒数で打ち切り）
- `muted`：既定は `true`。音を出すときは `false` にし、Chrome を `--autoplay-policy=no-user-gesture-required` 付きで起動します（自動再生がブロックされたらミュートで再生）
- `fit`：`contain`（既定・黒帯あり）/ `cover`（画面いっぱいにトリミング）
- 動画の再生中はロゴ・時計・進捗バーを隠します。`P` で一時停止できます

**リモート動画のキャッシュ**：リモート URL の動画は、起動時に裏でまるごとダウンロードしてブラウザ内（Cache Storage）に保存します。2 周目以降やページの再読み込み後は通信せずに再生します。

- `https://`（GitHub Pages など）または `http://localhost` で開いたときだけ有効です。`file://` で開くと毎回 URL から直接再生します
- 動画の配信元が CORS を許可している必要があります。許可されていない場合は保存せず、URL から直接再生します（ブラウザの通常のキャッシュが効く範囲でしか節約できません）。Apache のレンタルサーバーなら、動画を置いたディレクトリの `.htaccess` に次を追加します

  ```apache
  <IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
  </IfModule>
  ```

- 保存できたかは、開発者ツールのコンソールに `[media] cached: ...` と出るかで確認できます
- 同じ URL のまま動画を差し替えたときは、`?v=2` のように URL を変えると取り直します。スライドから外した動画は次回起動時に削除されます

### ロゴ

`settings.logo` に公式ロゴ SVG のパス（例：`assets/logo.svg`）を指定すると、左上のテキストのワードマークが置き換わります。

## 会場での運用メモ

- フォントは Google Fonts（Inter / Noto Sans JP / JetBrains Mono）を読み込みます。オフライン会場ではシステムフォントで代替表示されます。
- Screen Wake Lock API で画面のスリープを防ぎます（対応ブラウザのみ）。OS 側のスリープ設定も無効にしておくと安心です。
- Chrome のキオスクモードで起動する例：
  `chrome --kiosk --autoplay-policy=no-user-gesture-required http://localhost:8000/`
