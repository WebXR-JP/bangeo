# 実験結果の匿名送信

`/experiments`に匿名送信と集計表示を追加しています。ブラウザだけで動き、BANGEOサーバーにDB・KV・秘密鍵・受信APIは追加しません。

配信環境で匿名レポート専用プロジェクトの公開キーを指定し、再ビルドしてください。本番のBANGEOではAnalyticsの「BANGEO WebXR 検証」プロジェクトのproduction公開キーを使います。通常のサイト計測に使う`NEXT_PUBLIC_BANGEO_SITE_ANALYTICS_KEY`とは別の設定です。`NEXT_PUBLIC_`の値はビルド時にブラウザへ組み込まれるため、既存のデプロイにキーを追加しただけでは反映されません。

```dotenv
NEXT_PUBLIC_BANGEO_ANALYTICS_KEY=bg_pk_プロジェクトの公開キー
```

受信先は`https://bangeo-ingest.peraperapera.workers.dev`、公開集計APIは`https://analytics.bangeo.net`を既定値として利用します。別の環境に接続するときだけ`NEXT_PUBLIC_BANGEO_ANALYTICS_INGEST`と`NEXT_PUBLIC_BANGEO_ANALYTICS_API`にそれぞれHTTPSのオリジンを設定してください。通常のアクセス解析用キーや管理用トークンではなく、`bg_pk_`で始まる専用プロジェクトの公開キーが必要です。

Analytics側で当該環境の匿名検証受付・集計公開を有効にし、BANGEOのオリジンを許可する必要があります。本番では`https://www.bangeo.net`と`https://bangeo.net`を許可します。管理用トークンはBANGEOに設定しません。公開キーは秘密情報ではなく、公開するデータセットの選択に使います。未設定時は検証・JSON確認ができ、送信・集計取得は無効になります。

端末とブラウザはUser-Agentをブラウザ内で分類します。曖昧な機種は「その他」または「判別できない」とし、利用者が端末を選び直せます。生のUser-Agentは送信しません。「送信内容を確認」でスナップショットを確認します。同意をチェックして「匿名データを送信する」を押したときだけ送信します。ページ表示・体験開始・同意チェックだけでは送信しません。同意は保存せず、再読み込みごとにオフです。

SDKは受信サービスの`/sdk/experiments-v1.js`から、送信または集計表示の操作時に読み込みます。この機能は通常のサイト計測とは別で、ここでは通常計測用SDKを初期化しません。送信は`submitExperiment`、取得は`getExperimentSummary`を利用します。送信失敗時は同じ受付IDで再試行し、二重集計を防ぎます。202は受付であり、集計への反映は非同期です。

APIの存在検出、セッションに許可された機能、実データを取得した機能を別に送ります。Reference Spaceの事前推定は送信時にunknownにし、実際に使われた空間はセッション結果に記録します。手・メッシュ・深度などは取得したかどうかだけを記録し、座標・画像・距離・形状は送りません。既存リストの簡易チェックを公式な対応保証として解釈しないでください。

API契約の公開部分は`apps/blog/src/lib/experiment-report.ts`です。Analytics側のschemaVersion 2と合わせて変更します。ブラウザはMeta Quest Browserのメジャー・マイナーバージョン（例: `150.1`）を保存し、その他はメジャーバージョンのみを保存します。ビルド番号や生のUser-Agentは送りません。旧schemaVersion 1の報告は受信側で読み取り互換を維持します。PrivateなサーバーコードをBANGEOへ取り込む必要はありません。

公開画面は報告数を表示します。人数や端末台数ではなく、同じ人が別の報告を送ることもできます。送信を選ばなくても実験機能は使えます。外部デモサイトでの操作結果は取得対象外で、このページのスターター体験のみを記録します。

## 変更時の参照先

- `apps/blog/src/components/experiment-report-panel.tsx`: 同意、プレビュー、SDKの遅延読込、再試行、集計取得。
- `apps/blog/src/lib/experiment-report.ts`: 公開する型と値の範囲。
- `apps/blog/src/lib/webxr-starter/session.ts`: セッションで許可された機能と実データ取得の記録。

ローカル検証で本番の集計へ試験データを送らない。未設定時の表示と、必要に応じてテスト用SDK・送信先で同意前の未送信、失敗時の再試行、受付後の表示を確認する。PrivateなAnalytics側の実装を確認できない場合は、クライアントで確認できた範囲とサーバー側の未確認事項を分けて報告する。
