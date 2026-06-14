# BANGEO プロジェクトガイド

BANGEOはWebXRに関する日本語情報サイト（OSS）。`apps/blog/` が配信側のNext.jsアプリで、記事MDXとWebXRデモを配信している。

## デモ制作のデフォルト方針

ブログ記事に紐づくインタラクティブデモを追加する場合、**モードによって使うフレームワークを使い分ける**。

| モード | フレームワーク | 理由 |
| --- | --- | --- |
| **AR のみ** | **8th Wall OSS**（A-Frame 1.5.0 + XRExtras） | iPhone Safari でも動く（getUserMediaベース）。WebXR AR Module のブラウザ未対応を回避 |
| **VR のみ** | **IWSDK**（Vite + Three.js + ECS + IWER） | Meta Quest 系・PC VRが対象。IWERエミュレーターでヘッドセットなしでも確認可能 |
| **両対応** | **IWSDK** | VRをメインに両対応を兼ねる |

### モード別の呼び出しスキル

**AR の場合**

1. `8thwall-demo-scaffold` スキル（`.claude/skills/8thwall-demo-scaffold/SKILL.md`）に従って進める
2. 大きなタスクはサブエージェント `8thwall-demo-builder` に委譲できる
3. 8th Wall OSS の仕様・対応機能は `.claude/skills/8thwall-demo-scaffold/reference.md`
4. OSS版で完結する機能: Face Effects / Image Targets / Sky Effects
5. World Effects（SLAM）を使うなら配布バイナリ `xr-standalone.zip` が必要

**VR / 両対応 の場合**

1. `iwsdk-demo-scaffold` スキル（`.claude/skills/iwsdk-demo-scaffold/SKILL.md`）に従って進める
2. 大きなタスクはサブエージェント `iwsdk-demo-builder` に委譲できる
3. IWSDK の仕様は `.claude/skills/iwsdk-demo-scaffold/reference.md`（iwsdk.dev公式の要約）
4. WebXR仕様（hit-test／anchors／hand-input など）に依存するデモは、実装前に reference.md の「WebXR 仕様リンク集」から該当仕様を WebFetch で読む

### ヒアリング時の必須ステップ（モード共通）

「デモを作って」と言われたら、すぐにコードを書き始めない。必ず以下の順で要件を固め、**ユーザーから明示的な Go サインが出てから** スキャフォールドに進む。

1. 何を見せるデモか／想定するユーザー操作／対応させたいデバイス をユーザーに聞く
2. AR／VR／両対応のどれが自然かを判定し、**使うフレームワーク（8th Wall or IWSDK）を確定**する
3. AR なら使う効果（Face / Image / Sky / World）、VR なら使うWebXRモジュール を決める
4. `apps/blog/src/data/devices.ts` と `apps/blog/src/data/webxr-status.ts` を Read して、対応デバイス・対応ブラウザ・非対応環境を整理する
5. 「動くデバイス」「動かない環境」「MDX frontmatter 案」「demo-name 案」をまとめてユーザーに提示し、対応環境の合意をとる
6. デモ概要書（コンセプト／シーン構成／ユーザー操作／使う機能／完成イメージ／スコープ外）を書き出して提示し、Go サインを得る

曖昧な返答のときは Go と判断せず、引っかかっている箇所を具体的に聞き返す。

### 配信パスの規約

AR と VR で置き場所・URLパターンが違うので注意する。

| 項目 | AR（8th Wall） | VR/両対応（IWSDK） |
| --- | --- | --- |
| ソース | `apps/blog/public/demos/8thwall-<name>/demo.html` に直接配置（ビルド不要） | `apps/<name>/`（Viteプロジェクト）→ dist を public に手動コピー |
| 配信ディレクトリ | `apps/blog/public/demos/8thwall-<name>/` | `apps/blog/public/demo/<name>/` |
| 配信URL | `/demos/8thwall-<name>/demo.html`（複数形・`demo.html`） | `/demo/<name>/`（単数形・`index.html`） |
| 共通ランタイム | `public/demos/xr-standalone/`（`../xr-standalone/` で参照） | なし |
| experiments登録 | `content/experiments/8thwall-<name>.mdx` | `content/experiments/<name>.mdx` |

`/demo/`（単数、IWSDK）と `/demos/`（複数、8th Wall）を取り違えないように。

### localhost で動かすための必須設定

**IWSDK**: `vite.config.ts` に `base: './'` を必ず設定する。これが無いとビルド済み `index.html` が `/assets/xxx.js` のようなルート絶対パスを参照し、Next.jsの404に吸われてデモが真っ白になる。

**8th Wall**: 静的HTMLなのでビルド不要だが、`public/demos/xr-standalone/` に `xr.js` と `xrextras.js` が配置されていることを前提とする。無ければ [8thwall/engine](https://github.com/8thwall/engine) の `xr-standalone.zip` をダウンロードして展開する。

動作している参考実装:

- AR: `apps/blog/public/demos/8thwall-sky-effects/demo.html` 他8デモ
- VR: `apps/blog/public/demo/iwsdk-gallery/` と `apps/blog/content/experiments/iwsdk-gallery.mdx`

## スラッシュコマンド

- `/demo [テーマ]` — モード判定 → 対応スキルへ分岐して新規デモを作成

## 文章スタイル

- 絵文字は使わない（既存のMDX記事群に合わせる）
- 日付は和暦との混在を避け、MDXでは `"YYYY-MM-DD"` または `"YYYY年M月D日"` 形式で書く
- タグ・カテゴリはブログ側の既存分類を踏襲する（GUIDE / TECH / NEWS / VR / AR）

## 記事制作・サムネイル

ブログ記事の作成・修正・レビューでは、`.claude/skills/bangeo-article-authoring/SKILL.md` と `reference.md` を参照する。

- BANGEOはOSSなので、記事・README・スキル・ガイドは公開される前提で書く
- 読者向けでない編集チェックやエージェント向け手順は、記事MDXではなく `.claude/skills/` に置く
- サムネイルは既存画像の雰囲気を確認し、必要ならCodex Imageで新規生成して `apps/blog/public/assets/` に保存する
