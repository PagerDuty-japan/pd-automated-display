/* =====================================================================
 *  スライドの内容はこのファイルだけで管理します。
 *
 *  - テキスト内の *強調*  → アクセントカラー（グリーン）で表示
 *  - テキスト内の \n      → 改行
 *  - 時間（at / duration）はすべて「秒」
 *  - captions: 字幕。{ at: 表示開始秒, ja: "日本語", en: "English" }
 *              at を省略するとスライドの長さに合わせて均等に配置されます
 *  - hidden: true を付けたスライドは再生されません
 *
 *  各 type（シーン）で使える項目は README.md を参照してください。
 * ===================================================================== */

window.DECK = {
  settings: {
    eventName: "PagerDuty",
    // 左上のロゴ（暗背景用の白抜き SVG）。null にするとテキストのワードマーク
    logo: "assets/logo.svg",
    defaultDuration: 15,
    captions: true,          // 字幕を表示
    captionsEnglish: true,   // 英語字幕を併記
    reloadOnLoop: true,      // 1周したらページを再読み込み（http(s) 配信時のみ）＝更新内容を自動反映
  },

  slides: [
    /* ------------------------------------------------------------ 00 */
    {
      type: "title",
      label: "オープニング",
      duration: 14,
      eyebrow: "PagerDuty Operations Cloud",
      title: "止まらないビジネスを、\n*リアルタイム*で守る。",
      lead: "検知・対応・解決、そして再発防止まで。\nインシデント運用のすべてを、ひとつのプラットフォームで。",
      tags: ["Incident Response", "AIOps", "Automation", "On-call"],
      ringLabel: "ALWAYS ON",
      captions: [
        { at: 1.2, ja: "システム障害は、いつ・どこで起きるかわかりません。", en: "Outages can happen anytime, anywhere." },
        { at: 6.5, ja: "PagerDuty は、初動の1秒から解決までを支えます。", en: "PagerDuty is with you from the first second to resolution." },
      ],
    },

    /* ------------------------------------------------------------ 01 */
    {
      type: "noise",
      label: "ノイズ削減",
      duration: 16,
      eyebrow: "01 — Signal Intelligence",
      title: "アラートの洪水を、\n*必要な通知*だけに。",
      lead: "関連アラートをAIが自動で集約・ノイズ削減。\n本当に対応が必要なインシデントだけを届けます。",
      totalAlerts: 100,      // カウンターの最終値
      incidents: 9,          // まとめた後のインシデント数（削減率はここから計算）
      visibleAlerts: 48,     // 画面に降ってくるアラートチップの数
      collapseAt: 7.5,       // グルーピングが始まる秒
      alertSamples: [
        ["CRIT", "p99 latency > 2.0s"],
        ["CRIT", "HTTP 5xx rate spike"],
        ["CRIT", "DB connection pool exhausted"],
        ["WARN", "CPU usage > 95%"],
        ["WARN", "Pod CrashLoopBackOff"],
        ["WARN", "Queue depth > 10k"],
        ["WARN", "Disk I/O wait high"],
        ["INFO", "Health check flapping"],
        ["CRIT", "Synthetic check failed"],
        ["WARN", "Memory pressure"],
        ["INFO", "TLS handshake errors"],
        ["WARN", "Error budget burn x14"],
      ],
      incident: {
        id: "#4821",
        priority: "P1",
        title: "checkout-api 応答遅延",
        rows: [
          ["集約したアラート", "24件"],
          ["原因候補", "payments-db"],
        ],
      },
      captions: [
        { at: 0.8, ja: "障害が起きると、監視ツールからアラートの嵐が押し寄せます。", en: "When things break, an alert storm floods in from every monitoring tool." },
        { at: 7.6, ja: "PagerDuty が関連アラートをAIで自動集約。", en: "PagerDuty automatically groups related alerts with AI." },
        { at: 11.6, ja: "担当者は、本当に対応すべきインシデントに集中できます。", en: "Responders focus only on the incidents that matter." },
      ],
    },

    /* ------------------------------------------------------------ 02 */
    {
      type: "flow",
      label: "対応フロー",
      duration: 17,
      eyebrow: "02 — Incident Lifecycle",
      title: "検知から再発防止まで、\n*途切れない*対応フロー。",
      clockLabel: "経過時間",
      steps: [
        { icon: "radar",  label: "検知",       en: "Detect",   time: "00:00", status: "アラート受信",       desc: "あらゆる監視ツールの\nシグナルを集約" },
        { icon: "filter", label: "トリアージ", en: "Triage",   time: "00:45", status: "影響範囲を特定中",   desc: "優先度と影響範囲を\n自動で判定" },
        { icon: "users",  label: "招集",       en: "Mobilize", time: "01:30", status: "対応チーム招集済み", desc: "適切な担当者を\n即座に自動招集" },
        { icon: "wrench", label: "解決",       en: "Resolve",  time: "08:20", status: "復旧済み",           desc: "自動化とRunbookで\n迅速に復旧" },
        { icon: "book",   label: "学習",       en: "Learn",    time: "—",     status: "ポストインシデントレビュー作成", desc: "ポストインシデント\nレビューを自動生成" },
      ],
      captions: [
        { at: 1.0, ja: "インシデント対応は、検知から始まり再発防止で完結します。", en: "Incident response starts with detection and ends with prevention." },
        { at: 6.5, ja: "各ステップを連携し、チームの対応を停滞させません。", en: "Every step connects seamlessly so your response never stalls." },
        { at: 12.0, ja: "解決後は自動でポストインシデントレビュー作成。二度と同じ障害を起こさない組織へ。", en: "Automate post-incident reviews so the same outage never happens twice." },
      ],
    },

    /* ------------------------------------------------------------ 03 */
    {
      type: "escalation",
      label: "オンコール",
      duration: 16,
      eyebrow: "03 — On-call & Escalation",
      title: "誰かが必ず、\n*応答する*仕組み。",
      points: [
        { icon: "clock", text: "スケジュールに基づき、*今の当番*へ自動ルーティング" },
        { icon: "phone", text: "電話・SMS・プッシュ・チャットで確実に通知" },
        { icon: "layers", text: "応答がなければ、*自動でエスカレーション*" },
      ],
      incident: { priority: "P1", title: "checkout-api 応答遅延" },
      timeScale: 60, // 画面上のタイマーの早回し倍率
      tiers: [
        { level: "L1", initials: "KT", name: "Kenta T.", role: "Primary On-call",   channels: ["push", "sms", "phone"], outcome: "timeout" },
        { level: "L2", initials: "MS", name: "Misaki S.", role: "Secondary On-call", channels: ["push", "sms", "phone"], outcome: "ack" },
        { level: "L3", initials: "YH", name: "Yuki H.", role: "Engineering Manager", channels: ["push", "phone"],        outcome: "standby" },
      ],
      captions: [
        { at: 1.0, ja: "深夜や休日でも、インシデントを今の当番へ確実に通知。", en: "Day or night, incidents reach whoever is on call." },
        { at: 6.0, ja: "応答がなければ、次の担当者へ自動でエスカレーション。", en: "No response? It escalates to the next responder automatically." },
        { at: 10.5, ja: "インシデントの見逃しや放置をゼロにする体制へ。", en: "Zero missed incidents. Total on-call confidence." },
      ],
    },

    /* ------------------------------------------------------------ 04 */
    {
      type: "ai",
      label: "AIエージェント",
      duration: 18,
      eyebrow: "04 — AI Agents",
      title: "AIが、チームの\n*もう一人*の対応者に。",
      points: [
        { icon: "search", text: "影響範囲と*原因候補*を数秒で要約" },
        { icon: "book", text: "過去の類似事例から*最適な対処法*を提案" },
        { icon: "play", text: "推奨Runbookを*1クリック*で実行" },
      ],
      channel: "inc-4821-checkout-latency",
      messages: [
        { at: 0.8, from: "system", text: "インシデント #4821 が発生しました — checkout-api 応答遅延（P1）" },
        { at: 2.2, from: "user", name: "Misaki S.", initials: "MS", text: "@PagerDuty 状況を要約して" },
        { at: 3.2, from: "agent", name: "PagerDuty AI", text: "影響範囲と原因候補をまとめました。",
          bullets: ["影響: 決済APIの p99 レイテンシが 4.2s に上昇", "起点: 14:02 の payments-db 設定変更", "類似: 先月のインシデント #4610（類似度 94%）"] },
        { at: 9.4, from: "user", name: "Misaki S.", initials: "MS", text: "推奨アクションは？" },
        { at: 10.4, from: "agent", name: "PagerDuty AI", text: "#4610 で有効だった手順を提案します。",
          action: { label: "Runbook: コネクションプールを再起動", at: 13.8, done: "実行完了 — レイテンシの正常化を確認" } },
      ],
      captions: [
        { at: 1.0, ja: "AIエージェントが、レスポンダーの頼れる相棒に。", en: "AI agents work right alongside your responders." },
        { at: 4.5, ja: "状況の要約・原因推定・過去事例の参照を数秒で完了。", en: "Summaries, probable causes, and past incidents — in seconds." },
        { at: 11.0, ja: "推奨されたRunbookは、その場で1クリック実行。", en: "Run the recommended runbook with a single click." },
      ],
    },

    /* ------------------------------------------------------------ 05 */
    {
      type: "dashboard",
      label: "自動化",
      duration: 17,
      eyebrow: "05 — Automation",
      title: "検知した瞬間に、\n*自動で*自己修復。",
      services: [
        { name: "checkout-api", base: 120, unit: "ms" },
        { name: "auth-gateway", base: 46,  unit: "ms" },
        { name: "cart-service", base: 88,  unit: "ms" },
        { name: "search-api", base: 64,  unit: "ms" },
        { name: "payments-db", base: 12,  unit: "ms" },
        { name: "orders-worker", base: 210, unit: "ms" },
        { name: "edge-tokyo", base: 24,  unit: "ms" },
        { name: "notify-svc", base: 52,  unit: "ms" },
      ],
      incident: {
        service: 0,          // services の何番目で障害を起こすか（0始まり）
        at: 4.0,             // 障害発生
        remediateAt: 7.5,    // 自動修復開始
        resolveAt: 11.5,     // 復旧
        runbook: "自動修復 Runbook を実行中…",
      },
      status: {
        ok: "すべてのサービスが正常に稼働中",
        incident: "重大インシデント発生",
        remediating: "自動修復を実行中",
        resolved: "復旧済み（3分42秒）",
      },
      captions: [
        { at: 1.0, ja: "全サービスの稼働状況を、リアルタイムに可視化。", en: "See the health of every service in real time." },
        { at: 4.4, ja: "異常を検知した瞬間、自動修復アクションが即座に起動。", en: "The moment an anomaly occurs, auto-remediation kicks in." },
        { at: 11.8, ja: "担当者が招集される前に、自動で復旧が完了することも。", en: "Sometimes it's fixed before anyone even gets paged." },
      ],
    },

    /* ------------------------------------------------------------ 06 */
    {
      type: "stats",
      label: "成果",
      duration: 14,
      eyebrow: "06 — Outcomes",
      title: "チームの時間を、\n*価値ある仕事*へ。",
      items: [
        { value: 91, suffix: "%", label: "アラートノイズ削減", desc: "自動集約と抑制で", ring: 0.91 },
        { value: 77, suffix: "%", label: "復旧時間を大幅短縮", desc: "自動化とAI支援で", ring: 0.77 },
        { value: 249, suffix: "%", label: "1年間のROI",       desc: "投資を大きく上回る効果", ring: 1 },
        { value: 750, suffix: "+", label: "インテグレーション", desc: "主要ツールと柔軟に連携", ring: 1 },
      ],
      captions: [
        { at: 1.0, ja: "ノイズ削減と復旧迅速化で、チームを疲弊から守る。", en: "Less noise. Faster recovery. Healthier on-call teams." },
        { at: 7.5, ja: "今お使いの監視・チャットツールとも、シームレスに連携。", en: "Connects seamlessly with the tools you already use." },
      ],
    },

    /* ------------------------------------------------------------ 07 */
    {
      type: "cta",
      label: "ご案内",
      duration: 13,
      eyebrow: "Live Demo at Our Booth",
      title: "実際の画面を、\nぜひ*ブースでご体験*ください。",
      lead: "ブースにて実機ライブデモを随時開催中。\n貴社の運用課題に合わせた最適な活用法をご紹介します。",
      items: [
        { icon: "pin",   key: "BOOTH",     value: "A-12" },
        { icon: "play",  key: "LIVE DEMO", value: "毎時 00分 / 30分" },
      ],
      captions: [
        { at: 1.0, ja: "ブースにて実機ライブデモを随時開催中です。", en: "Live demos are running at our booth." },
        { at: 6.5, ja: "運用の課題やお悩みなど、お気軽にスタッフへご相談ください。", en: "Come talk to our team about your operational challenges!" },
      ],
    },

    /* ------------------------------------------------------------ 08 */
    {
      type: "video",
      label: "紹介動画",
      // リモート URL は初回だけダウンロードしてブラウザ内に保存（2周目以降は通信なし）
      // ローカルパス（例: "media/ltu.mp4"）も指定可能
      src: "https://www.pagerduty.co.jp/assets/images/ltu.mp4",
      muted: true,           // 音を出すときは false（キオスク起動時の自動再生フラグが必要）
      // duration を省略すると動画の長さだけ再生して次へ進みます
    },

    /* ------------------------------------------------------------ 例：汎用テキストスライド（非表示） */
    {
      type: "statement",
      hidden: true,
      label: "お知らせ",
      duration: 10,
      eyebrow: "Announcement",
      title: "セッション情報を\n*ここに*追加できます。",
      lead: "type: \"statement\" は、見出し・本文・箇条書きだけで作れる汎用スライドです。",
      points: [
        { icon: "clock", text: "15:00〜 *Room B* でセッション登壇" },
        { icon: "users", text: "ブースでノベルティを配布中" },
      ],
    },
  ],
};
