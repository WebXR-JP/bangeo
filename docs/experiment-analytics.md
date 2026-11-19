# 実験結果の匿名送信（停止中）

`/experiments` にあった匿名送信と集計表示（「みんなの端末での検証結果」）は、2026-11-19 に画面から取り外しました。利用者に分かりにくかったためで、再開は未定です。現在、レポート画面から検証結果を送信・取得する処理はありません。

通常のサイト計測（`NEXT_PUBLIC_BANGEO_SITE_ANALYTICS_KEY`、`apps/blog/src/components/site-analytics.tsx`）は別の仕組みで、この停止の対象外です。

## いま残っているもの

- `apps/blog/src/lib/experiment-report.ts`: 送信していたデータの型と値の範囲（schemaVersion 2）。Analytics側の契約と対になるため残しています。
- `apps/blog/src/lib/webxr-starter/session.ts`: スターター体験の中で、許可された機能と実データを取得できたかを記録する処理。`onReport` を渡したときだけ結果を受け取れます。現在はどこからも渡していません。
- `apps/blog/tests/experiment-report.test.mjs`: 上記の型の検証。

## 取り外したもの

- `apps/blog/src/components/experiment-report-panel.tsx`（同意、プレビュー、SDKの遅延読込、再試行、集計取得）
- 環境変数 `NEXT_PUBLIC_BANGEO_ANALYTICS_KEY`、`NEXT_PUBLIC_BANGEO_ANALYTICS_INGEST`、`NEXT_PUBLIC_BANGEO_ANALYTICS_API`。読み取る処理がなくなったため、配信環境に残っていても使われません。
- プライバシーポリシーの、匿名のWebXR検証結果に関する記述

取り外し前の実装は、このファイルを書き換えたコミットの直前の履歴から参照できます。

## 再開するとき

- 送信は、利用者が内容を確認し、同意して操作したときだけ行う。ページ表示・体験開始・同意チェックだけでは送信しない。
- 生のUser-Agent、座標・画像・距離・形状などの生データは送らない。値の範囲は `experiment-report.ts` の許可リストに限る。
- APIの存在検出、セッションで許可された機能、実データを取得した機能を区別して扱う。簡易チェックを公式な対応保証として見せない。
- プライバシーポリシー、`apps/blog/.env.example`、`apps/blog/README.md` の記述を実装に合わせて戻す。
- ローカル検証で本番の集計へ試験データを送らない。PrivateなAnalytics側の実装を確認できない場合は、クライアントで確認できた範囲とサーバー側の未確認事項を分けて報告する。
