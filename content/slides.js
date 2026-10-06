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
    boothLabel: "BOOTH  A-12",
    // 公式ロゴSVGを置いた場合はパスを指定（例: "assets/logo.svg"）。null ならテキストのワードマーク
    logo: null,
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
      lead: "検知・対応・解決、そして学習まで。\nインシデント対応のすべてを、ひとつのプラットフォームで。",
      tags: ["Incident Response", "AIOps", "Automation", "On-call"],
      ringLabel: "ALWAYS ON",
      captions: [
        { at: 1.2, ja: "システム障害は、いつ・どこで起きるかわかりません。", en: "Outages can happen anytime, anywhere." },
        { at: 6.5, ja: "PagerDuty は、最初の1秒から解決までを支えます。", en: "PagerDuty is with you from the first second to resolution." },
      ],
    },

    /* ------------------------------------------------------------ 01 */
    {
      type: "noise",
      label: "ノイズ削減",
      duration: 16,
      eyebrow: "01 — Event Intelligence",
      title: "1,000のアラートも、\n*1件*のインシデントへ。",
      lead: "関連するアラートを自動でグルーピング。\n本当に重要なシグナルだけが、担当者に届きます。",
      totalAlerts: 1284,     // カウンターの最終値
      visibleAlerts: 64,     // 画面に降ってくるアラートチップの数
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
      sources: ["datadog", "prometheus", "cloudwatch", "new relic", "grafana", "sentry", "dynatrace"],
      hosts: ["checkout-api", "payments-db", "edge-tokyo-2", "cart-svc", "auth-gw", "k8s-prod-03", "orders-worker"],
      incident: {
        id: "#4821",
        priority: "P1",
        title: "checkout-api 応答遅延",
        rows: [
          ["GROUPED ALERTS", "1,284 → 1"],
          ["SERVICE", "checkout-api"],
          ["PROBABLE ORIGIN", "payments-db"],
          ["RELATED CHANGE", "14:02 config deploy"],
        ],
      },
      captions: [
        { at: 0.8, ja: "障害が起きると、監視ツールから大量のアラートが押し寄せます。", en: "When things break, alerts flood in from every monitoring tool." },
        { at: 7.6, ja: "PagerDuty が関連するアラートを自動でひとつにまとめます。", en: "PagerDuty automatically groups related alerts together." },
        { at: 11.6, ja: "担当者が見るべきは、この1件だけ。", en: "Responders see just the one incident that matters." },
      ],
    },

    /* ------------------------------------------------------------ 02 */
    {
      type: "flow",
      label: "対応フロー",
      duration: 17,
      eyebrow: "02 — Incident Lifecycle",
      title: "検知から学習まで、\n*途切れない*対応フロー。",
      clockLabel: "ELAPSED",
      steps: [
        { icon: "radar",  label: "検知",       en: "Detect",   time: "00:00", status: "アラート受信",       desc: "あらゆる監視ツールの\nシグナルを集約" },
        { icon: "filter", label: "トリアージ", en: "Triage",   time: "00:45", status: "影響範囲を特定中",   desc: "優先度と影響範囲を\n自動で判定" },
        { icon: "users",  label: "招集",       en: "Mobilize", time: "01:30", status: "対応チーム招集済み", desc: "適切な担当者に\n即座に通知" },
        { icon: "wrench", label: "解決",       en: "Resolve",  time: "08:20", status: "復旧済み",           desc: "Runbookと自動化で\n迅速に復旧" },
        { icon: "book",   label: "学習",       en: "Learn",    time: "—",     status: "ポストモーテム作成", desc: "振り返りを自動生成し\n再発を防止" },
      ],
      captions: [
        { at: 1.0, ja: "インシデント対応は、検知から始まり学習で終わります。", en: "Incident response starts with detection and ends with learning." },
        { at: 6.5, ja: "各ステップをつなぎ、チームの動きを止めません。", en: "PagerDuty connects every step so your team never stalls." },
        { at: 12.0, ja: "解決後は振り返りまで。同じ障害を繰り返さないために。", en: "Then postmortems — so the same outage never happens twice." },
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
        { at: 1.0, ja: "深夜でも休日でも、インシデントは当番に確実に届きます。", en: "Day or night, incidents reach whoever is on call." },
        { at: 6.0, ja: "応答がなければ、次の担当者へ自動でエスカレーション。", en: "No response? It escalates to the next responder automatically." },
        { at: 10.5, ja: "取りこぼしのないオンコール体制を実現します。", en: "No incident falls through the cracks." },
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
        { icon: "book", text: "過去の類似インシデントから学習" },
        { icon: "play", text: "推奨Runbookを*ワンクリック*で実行" },
      ],
      channel: "inc-4821-checkout-latency",
      messages: [
        { at: 0.8, from: "system", text: "インシデント #4821 が発生しました — checkout-api 応答遅延（P1）" },
        { at: 2.2, from: "user", name: "Misaki S.", initials: "MS", text: "@PagerDuty 状況を要約して" },
        { at: 3.2, from: "agent", name: "PagerDuty AI", text: "影響範囲と原因候補をまとめました。",
          bullets: ["影響: 決済APIの p99 レイテンシが 4.2s に上昇", "起点: 14:02 の payments-db 設定変更", "類似: 先月のインシデント #4610 と高い一致"] },
        { at: 9.4, from: "user", name: "Misaki S.", initials: "MS", text: "推奨アクションは？" },
        { at: 10.4, from: "agent", name: "PagerDuty AI", text: "#4610 で有効だった手順を提案します。",
          action: { label: "Runbook: コネクションプールを再起動", at: 13.8, done: "実行完了 — レイテンシの正常化を確認" } },
      ],
      captions: [
        { at: 1.0, ja: "AIエージェントが、対応チームと一緒に動きます。", en: "AI agents work right alongside your responders." },
        { at: 4.5, ja: "状況の要約、原因の推定、過去事例の参照まで数秒で。", en: "Summaries, probable causes, and past incidents — in seconds." },
        { at: 11.0, ja: "推奨されたRunbookは、その場でワンクリック実行。", en: "Run the recommended runbook with a single click." },
      ],
    },

    /* ------------------------------------------------------------ 05 */
    {
      type: "dashboard",
      label: "自動化",
      duration: 17,
      eyebrow: "05 — Automation",
      title: "検知した瞬間に、\n*自動で*手を打つ。",
      services: [
        { name: "checkout-api", team: "Payments",  base: 120, unit: "ms" },
        { name: "auth-gateway", team: "Identity",  base: 46,  unit: "ms" },
        { name: "cart-service", team: "Commerce",  base: 88,  unit: "ms" },
        { name: "search-api",   team: "Discovery", base: 64,  unit: "ms" },
        { name: "payments-db",  team: "Payments",  base: 12,  unit: "ms" },
        { name: "orders-worker", team: "Fulfillment", base: 210, unit: "ms" },
        { name: "edge-tokyo",   team: "Platform",  base: 24,  unit: "ms" },
        { name: "notify-svc",   team: "Messaging", base: 52,  unit: "ms" },
      ],
      incident: {
        service: 0,          // services の何番目で障害を起こすか（0始まり）
        at: 4.0,             // 障害発生
        remediateAt: 7.5,    // 自動修復開始
        resolveAt: 11.5,     // 復旧
        runbook: "Runbook: payments-db のコネクションプールを再起動",
      },
      status: {
        ok: "すべてのサービスが正常に稼働中",
        incident: "重大インシデント発生",
        remediating: "自動修復を実行中",
        resolved: "復旧済み — 所要時間 3分42秒",
      },
      captions: [
        { at: 1.0, ja: "サービスの健全性を、リアルタイムで可視化。", en: "See the health of every service in real time." },
        { at: 4.4, ja: "異常を検知すると、すぐに自動修復が走ります。", en: "The moment something breaks, automation kicks in." },
        { at: 11.8, ja: "人が呼ばれる前に、復旧が終わっていることも。", en: "Sometimes it's fixed before anyone gets paged." },
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
        { value: 98, suffix: "%", label: "アラートノイズ削減", desc: "グルーピングと抑制で", ring: 0.98 },
        { value: 50, suffix: "%", label: "MTTR 短縮",         desc: "自動化とAI支援で",     ring: 0.5 },
        { value: 24, suffix: "/7", label: "オンコール体制",     desc: "スケジュールと\nエスカレーション", ring: 1 },
        { value: 700, suffix: "+", label: "インテグレーション", desc: "既存ツールとそのまま連携", ring: 0.82 },
      ],
      footnote: "※ 表示中の数値はデザイン用のサンプルです。展示前に公式データへ差し替えてください。",
      captions: [
        { at: 1.0, ja: "ノイズを減らし、対応を速く、チームを燃え尽きから守る。", en: "Less noise. Faster response. Healthier on-call teams." },
        { at: 7.5, ja: "使い慣れたツールとも、そのままつながります。", en: "And it connects with the tools you already use." },
      ],
    },

    /* ------------------------------------------------------------ 07 */
    {
      type: "cta",
      label: "ご案内",
      duration: 13,
      eyebrow: "Live Demo at Our Booth",
      title: "まずは、*触って*みてください。",
      lead: "ブースでライブデモを実施中。あなたの環境に合わせた活用法をご紹介します。",
      items: [
        { icon: "pin",   key: "BOOTH",     value: "A-12" },
        { icon: "play",  key: "LIVE DEMO", value: "毎時 00分 / 30分" },
        { icon: "globe", key: "WEB",       value: "pagerduty.com" },
      ],
      captions: [
        { at: 1.0, ja: "ブースでライブデモを実施中です。", en: "Live demos are running at our booth." },
        { at: 6.5, ja: "お気軽にスタッフへお声がけください。", en: "Come say hello to our team!" },
      ],
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
