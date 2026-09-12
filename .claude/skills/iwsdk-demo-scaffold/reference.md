# IWSDK実装リファレンス

以下のリポジトリ内パスはルート基準。対象の実装に関係する項目だけ読む。

## 既存実装を変更する

| 確認すること | 参照先 |
| --- | --- |
| 依存関係・ビルド | `apps/xr-mesh-export/package.json`、`package-lock.json` |
| Viteプラグインと相対URL | `apps/xr-mesh-export/vite.config.ts` |
| 初期化とシステム登録 | `apps/xr-mesh-export/src/index.ts` |
| セッション要求 | `apps/xr-mesh-export/src/xr-session.ts` |
| ECSによる描画 | `apps/xr-mesh-export/src/systems/MeshVisualizerSystem.ts` |

既存プロジェクトと最新SDKのAPIを混ぜない。たとえば、このプロジェクトのViteプラグインは `@iwsdk/vite-plugin-dev` からimportしている。依存更新が依頼されていなければ、導入済みのバージョンを基準に修正する。

## 新規作成・SDKの調査

[IWSDK公式ドキュメント](https://iwsdk.dev/)からセットアップ・API・AI連携の該当ページを開く。CLI生成は公式の `npm create @iwsdk@latest` が入口。生成されるファイル、Node要件、MCP設定はそのバージョンの案内を確認する。

MCPのツール一覧や設定をこの文書に複製しない。接続されている機能を確認し、シーン・入力・セッションの検証に必要なものだけ使う。MCPがなければビルドや通常のブラウザで確認できる範囲を進める。

## WebXR機能

セッションの基本は [WebXR Device API](https://www.w3.org/TR/webxr/)。各モジュールは `apps/blog/src/lib/webxr-spec-catalog.ts` の仕様リンクを入口に、対象APIの引数、要求するfeature、対応するsession modeを確認する。仕様の存在とブラウザ実装の有無は別に調べる。

`requiredFeatures` と `optionalFeatures` はデモの目的に合わせる。必要な実データが取得できなかった場合は、その機能が動いたように表示しない。開始、終了、再開始、権限拒否、未対応時の表示を対象の変更に応じて確認する。

## ビルドと配信

配置規約は [SKILL.md](SKILL.md)、登録・導線はルートの `docs/agent-guides/demos.md` を参照する。

配信先のサブパスで画像・モデル・スクリプトが解決することを確認する。`base: './'` はアセットURLの設定であり、Next.jsがディレクトリURLをindex.htmlへ配信する保証ではない。配信ルートのrewriteまたは明示的なHTMLリンクを確認する。

| 症状 | 確認する箇所 |
| --- | --- |
| 画面が白い、アセットが404 | ビルド済みHTMLのURL、JS内のアセット参照、配信ルート |
| ビルドが失敗 | 対象アプリのlockfile、導入済みSDKの型、Viteプラグイン |
| セッションが開始しない | 要求機能、ユーザー操作、権限、対象ブラウザ |
| MDXから起動できない | MDXのlink、ExperimentLaunchPanel、experiment-guidesのlaunchHref |
