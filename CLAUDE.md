# BANGEO プロジェクトガイド

BANGEOはWebXRに関する日本語情報サイト（OSS）。`apps/blog/` が配信側のNext.jsアプリで、記事MDXとWebXRデモを配信している。

## デモ制作のデフォルト方針

ブログ記事に紐づくインタラクティブデモを追加する場合は、**IWSDK（Meta Immersive Web SDK）** をデフォルトのフレームワークとする。理由は以下の通り。

- ブラウザ単体で動作確認できる（Questなしでも IWER エミュレーターで確認可能）
- Vite ＋ Three.js ＋ ECS という構成で安定している
- Claude Code／Codex向けのMCPツールが標準同梱されており、シーンをAIから直接確認・操作できる
- `npm create @iwsdk@latest` の1コマンドでセットアップが完了する

### デモ制作を依頼されたとき

「新しいデモ」「WebXRデモ作って」「IWSDKデモ」「hit-testデモ」のように依頼された場合:

1. `iwsdk-demo-scaffold` スキル（`.claude/skills/iwsdk-demo-scaffold/SKILL.md`）に従って進める
2. 大きなタスクはサブエージェント `iwsdk-demo-builder` に委譲できる
3. IWSDKの仕様は `.claude/skills/iwsdk-demo-scaffold/reference.md` にまとまっている（iwsdk.dev 公式の要約）
4. WebXR仕様（hit-test／anchors／hand-input など）に依存するデモを作る場合は、実装に入る前に reference.md の「WebXR 仕様リンク集」から該当仕様を WebFetch で読む

### ヒアリング時の必須ステップ

「デモを作って」と言われたら、すぐにコードを書き始めない。必ず以下の順で要件を固め、**ユーザーから明示的な Go サインが出てから** スキャフォールドに進む。

1. 何を見せるデモかをユーザーに聞く
2. AR／VR／両対応のどれが自然かを判定する
3. 使う WebXR モジュール（hit-test／anchors／hand-input など）を決める
4. `apps/blog/src/data/devices.ts` と `apps/blog/src/data/webxr-status.ts` を Read して、対応デバイス・対応ブラウザ・非対応環境を整理する
5. 「動くデバイス」「動かない環境」「MDX frontmatter 案」「demo-name 案」をまとめてユーザーに提示し、対応環境の合意をとる
6. デモ概要書（コンセプト／シーン構成／ユーザー操作／WebXRモジュールの使い方／完成イメージ／スコープ外）を書き出して提示し、Go サインを得る

iOS Safari や Desktop Chrome が対象外になる AR デモなどは、この段階で先に伝えて認識を合わせておく。曖昧な返答のときは Go と判断せず、引っかかっている箇所を具体的に聞き返す。

### 配信パスの規約

- IWSDKプロジェクトソース: `apps/<demo-name>/`
- 配信ビルド: `apps/blog/public/demo/<demo-name>/`（Next.jsが `/demo/<demo-name>/` で配信）
- experiments登録MDX: `apps/blog/content/experiments/<demo-name>.mdx`（`link: "/demo/<demo-name>"`）

### localhost で動かすための必須設定

IWSDKプロジェクトの `vite.config.ts` に `base: './'` を必ず設定する。これを忘れるとビルド済み `index.html` が `/assets/xxx.js` のようなルート絶対パスを参照し、Next.jsの404に吸われてデモが真っ白になる。`base: './'` にしておけばデモ名に依存せず、同じ設定を全デモで使い回せる。

動作している参考実装: `apps/blog/public/demo/iwsdk-gallery/` と `apps/blog/content/experiments/iwsdk-gallery.mdx`

## 文章スタイル

- 絵文字は使わない（既存のMDX記事群に合わせる）
- 日付は和暦との混在を避け、MDXでは `"YYYY-MM-DD"` または `"YYYY年M月D日"` 形式で書く
- タグ・カテゴリはブログ側の既存分類を踏襲する（GUIDE / TECH / NEWS / VR / AR）
