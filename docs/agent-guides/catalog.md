# WebXR仕様カタログとスターター

以下のパスはリポジトリルート基準。

| 役割 | 参照先 |
| --- | --- |
| /experimentsのページ | `apps/blog/src/app/experiments/page.tsx` |
| 仕様・参照URL・デモリンク | `apps/blog/src/lib/webxr-spec-catalog.ts` |
| 分類、簡易判定、構成選択 | `apps/blog/src/components/webxr-spec-list.tsx` |
| セッション開始・終了、機能ごとの処理 | `apps/blog/src/lib/webxr-starter/session.ts`、`modules/`、`types.ts` |
| 実験結果と匿名送信 | `docs/experiment-analytics.md` |

カタログはsession mode、モジュール、Reference Spaceを扱う。表示区分や型はコードを正とし、文書に固定の対応表を複製しない。MDXを追加してもこのカタログへ自動掲載されない。

デモリンクは実在するURLと実装内容を確認する。WebXR APIを使う実証デモを該当項目に紐づけ、カメラベースWebARは含めない。空欄を埋めるための疑似デモは作らない。

API存在確認、isSessionSupported、セッションで許可された機能、実データ取得を区別する。簡易判定から実機動作を保証せず、unknownを検証成功として扱わない。UIの表示と送信時の状態変換はそれぞれの実装を確認する。

スターターを変更するときは構成選択から開始・終了・再開始まで確認し、未対応の構成でもコードの学習ができるようにする。実測情報を変更する場合は匿名レポートとの対応も確認する。
