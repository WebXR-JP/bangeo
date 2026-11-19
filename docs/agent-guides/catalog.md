# レポート・WebXR仕様カタログとスターター

以下のパスはリポジトリルート基準。

| 役割 | 参照先 |
| --- | --- |
| レポート共通のレイアウト（判定・結果画像・タブ） | `apps/blog/src/app/(report)/layout.tsx`、`apps/blog/src/components/report/` |
| 判定の要約、結果画像の描画、端末名の判定、WebGPUの取得 | `apps/blog/src/lib/report/` |
| /report（概要）のページ | `apps/blog/src/app/(report)/report/page.tsx` |
| /experiments（WebXR）のページ | `apps/blog/src/app/(report)/experiments/page.tsx` |
| /webgpu-report（WebGPU）のページ | `apps/blog/src/app/(report)/webgpu-report/page.tsx`、`apps/blog/src/components/webgpu-report.tsx`、`apps/blog/src/lib/webgpu-report-catalog.ts` |
| 仕様・参照URL・デモリンク | `apps/blog/src/lib/webxr-spec-catalog.ts` |
| 分類、簡易判定、構成選択 | `apps/blog/src/components/webxr-spec-list.tsx`、`apps/blog/src/lib/webxr-support.ts` |
| セッション開始・終了、機能ごとの処理 | `apps/blog/src/lib/webxr-starter/session.ts`、`modules/`、`types.ts` |
| 匿名送信（停止中） | `docs/experiment-analytics.md` |

## レポートの構成

/report・/experiments・/webgpu-report はルートグループ `(report)` の同じレイアウトを使う。判定はレイアウトの `ReportProvider` で1回だけ行い、結果画像・概要・WebXR・WebGPUの各タブは同じ結果を読む。タブごとに `navigator.xr` や `navigator.gpu` を呼び直さない。

結果画像（BANGEOレポート）はブラウザ内のCanvasで作り、サーバーには送らない。横長の見開き2ページで、左ページに確認した環境とWebXR、右ページにWebGPUを置く。画像の中央がページの境目で、幅の狭い画面では左右を切り出して1ページずつ見せるため、境目をまたぐ要素を描かない。文字の大きさ・太さ・字間は `apps/blog/src/lib/report/card-image.ts` の `type` にまとめ、描画の途中で個別の値を書かない。

画像と概要は `apps/blog/src/lib/report/summary.ts` の要約を共有するので、載せる内容を変えるときは要約・画像の描画・概要の表示を合わせて直す。isSessionSupported（セッションモード）とAPIの有無（機能モジュール）は意味が違うため、合算した数字を画像の主役にしない。

判定を表す色は `apps/blog/src/app/globals.css` の `data-*` トークン（対応=青、要確認=アンバー）と灰に限り、記号と文字を必ず添える。

## カタログ

カタログはsession mode、モジュール、Reference Spaceを扱う。表示区分や型はコードを正とし、文書に固定の対応表を複製しない。MDXを追加してもこのカタログへ自動掲載されない。

デモリンクは実在するURLと実装内容を確認する。WebXR APIを使う実証デモを該当項目に紐づけ、カメラベースWebARは含めない。空欄を埋めるための疑似デモは作らない。

API存在確認、isSessionSupported、セッションで許可された機能、実データ取得を区別する。簡易判定から実機動作を保証せず、unknownを検証成功として扱わない。

スターターを変更するときは構成選択から開始・終了・再開始まで確認し、未対応の構成でもコードの学習ができるようにする。
