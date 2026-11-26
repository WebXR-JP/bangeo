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

## レポートの端末名

端末名とブラウザ名は別に判定する。機種の根拠は UA の明示的な機種名・既知の型番か、ブラウザが返す XR の機種ヒントに限定する。端末のヒントはブラウザ内で判定にだけ使い、サーバーへ送るヘッダーの設定や匿名レポートの項目は追加しない。WebXR/WebGPU 対応は機種名ではなく従来の機能確認で判定する。

| 対象 | 根拠と表示方針 |
| --- | --- |
| PICO 4 / Ultra / Enterprise / Neo3 | 明示的な機種表記がある場合のみ機種名を表示。PICO Browser を Quest 互換トークンより優先する。機種ラインナップは [PICO Business](https://business.picoxr.com/ch/doc/43j3qcoq) を参照。 |
| Meta Quest | [Meta の UA 仕様](https://developers.meta.com/vr/documentation/web/browser-specs/)では Quest 3 と 3S（Xbox Edition 含む）が `Quest 3` を共有する。明示的な `Quest 3S` がなければ 3 系として表示する。 |
| Galaxy XR | [Samsung Browser の公式仕様](https://developer.samsung.com/browser/user-agent-string-format.html)ではデスクトップ形式 UA を他端末と共有し、フォームファクターには `XR` が返る。型番の根拠がなければ「XR端末（機種不明）」。 |
| XREAL AURA | [XREAL の資料](https://tutorials.xreal.com/docs/aura/safety-warranty/)にある Compute Puck `B6111` または製品名が端末情報に明示された場合のみ AURA と表示する。製品版 Chrome がその型番を返すとは未確認。Chrome や Linux 形式、XR のヒントだけでは AURA としない。Air / One / Beam 等も一括判定しない。 |
| Vision Pro / Steam Frame / その他 | Safari のデスクトップ形式や SteamOS の Chromium、複数社の端末で動く [Wolvic](https://github.com/Igalia/wolvic) だけでは機種を特定できない。Apple／Linux 系または不明と表示する。Safari は [WebKit の機能説明](https://webkit.org/blog/15162/introducing-natural-input-for-webxr-in-apple-vision-pro/)、Steam Frame は [Valve のリリース情報](https://store.steampowered.com/news/app/4165890) を参照。 |

[Chromium の UA ヒント実装](https://chromium.googlesource.com/chromium/src/+/main/components/embedder_support/user_agent_utils.cc)を参照。機種ヒントが省略・拒否された場合は、取得できた情報に戻す。

## レポートの構成

/report・/experiments・/webgpu-report はルートグループ `(report)` の同じレイアウトを使う。判定はレイアウトの `ReportProvider` で1回だけ行い、結果画像・概要・WebXR・WebGPUの各タブは同じ結果を読む。タブごとに `navigator.xr` や `navigator.gpu` を呼び直さない。

各ページは先頭に `ReportTopAnchor`（`apps/blog/src/components/report/report-top-anchor.tsx`）を描く。Next.jsはリンクで開いたページの先頭要素までスクロールするため、これが無いと共通レイアウトの結果画像を飛び越えて本文から始まる。`(report)` にページを足すときも同じようにする。

結果画像は、開いた直後に判定の段階（端末とブラウザ、WebXR、WebGPU、画像の作成）を上から順に見せ、すべて終わってから出す。段階の印は実際の完了を追い越さない。動きの長さは `apps/blog/src/app/globals.css` の `--animate-report-*` と `report-card.tsx` の定数で合わせ、`prefers-reduced-motion` では間を空けずに結果を出す。GPUの切り替えなど2回目以降の作り直しでは、段階を見せ直さず画像だけを差し替える。

結果画像（BANGEOレポート）はブラウザ内のCanvasで作り、サーバーには送らない。横長の見開き2ページで、左ページに確認した環境とWebXR、右ページにWebGPUを置く。画像の中央がページの境目で、幅の狭い画面では左右を切り出して1ページずつ見せるため、境目をまたぐ要素を描かない。文字の大きさ・太さ・字間は `apps/blog/src/lib/report/card-image.ts` の `type` にまとめ、描画の途中で個別の値を書かない。

画像と概要は `apps/blog/src/lib/report/summary.ts` の要約を共有するので、載せる内容を変えるときは要約・画像の描画・概要の表示を合わせて直す。isSessionSupported（セッションモード）とAPIの有無（機能モジュール）は意味が違うため、合算した数字を画像の主役にしない。

判定を表す色は `apps/blog/src/app/globals.css` の `data-*` トークン（対応=青、要確認=アンバー）と灰に限り、記号と文字を必ず添える。

## カタログ

カタログはsession mode、モジュール、Reference Spaceを扱う。表示区分や型はコードを正とし、文書に固定の対応表を複製しない。MDXを追加してもこのカタログへ自動掲載されない。

デモリンクは実在するURLと実装内容を確認する。WebXR APIを使う実証デモを該当項目に紐づけ、カメラベースWebARは含めない。空欄を埋めるための疑似デモは作らない。

API存在確認、isSessionSupported、セッションで許可された機能、実データ取得を区別する。簡易判定から実機動作を保証せず、unknownを検証成功として扱わない。

スターターを変更するときは構成選択から開始・終了・再開始まで確認し、未対応の構成でもコードの学習ができるようにする。
