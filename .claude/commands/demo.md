---
description: BANGEOブログ用のWebXR/WebARデモを新規作成する。モード判定（AR／VR／両対応）で8th WallかIWSDKを自動選択し、ヒアリング → Goサイン → スキャフォールド → 実装 → 配置 → experiments登録まで
argument-hint: "[テーマや demo-name の希望]"
---

# /demo — WebXR / WebAR デモ新規作成

ユーザーが `/demo` を実行した。`$ARGUMENTS` が渡されている場合はテーマや demo-name の希望として扱う（空の場合は最初にコンセプトから聞く）。

## 最重要: モード判定でスキルを分岐する

BANGEOではARとVR/両対応で使うフレームワーク・配置規約が違う。**ヒアリングで AR / VR / 両対応 のどれになるかを早期に判定し、対応するスキルに従って進める**。

| モード | 使うフレームワーク | 発動するスキル | 配置規約 |
| --- | --- | --- | --- |
| **AR のみ** | 8th Wall OSS（A-Frame 1.5.0 + XRExtras） | `8thwall-demo-scaffold` | `public/demos/8thwall-<name>/demo.html`（複数形・`demo.html`） |
| **VR のみ** | IWSDK（Vite + Three.js + ECS + IWER） | `iwsdk-demo-scaffold` | `public/demo/<name>/`（単数形・`index.html`） |
| **両対応** | IWSDK | `iwsdk-demo-scaffold` | VRと同じ |

AR を 8thWall にする理由: iOS Safari が WebXR AR Module に未対応なのに対し、8th Wall は `getUserMedia` ベースで iPhone でも動く。対応範囲が段違いに広い。

## 共通のヒアリングフロー

モード判定前に必ず聞く:

1. **コンセプト** — どんな体験を見せたいか（一言で）
2. **想定ユーザー操作** — コントローラー／ハンド／タップ／視線／顔認識／画像認識 など
3. **対応させたい環境** — iPhone 重視なら AR 必須、Quest 重視なら VR でも可

この回答と `$ARGUMENTS` から、AR / VR / 両対応 のどれに進むかを判定する。迷う場合はユーザーに確認する。

## モード判定後、対応スキルに従う

### AR と判定したら

`.claude/skills/8thwall-demo-scaffold/SKILL.md` と `reference.md` を読み、そのスキルの手順に従って進める。主なポイント:

- 使う効果タイプを確認（Face / Image / Sky / World）
- World Effects は配布バイナリ必須、OSS縛りなら除外
- `apps/blog/public/demos/xr-standalone/` の存在確認
- 既存デモ（`8thwall-sky-effects` 等）をコピーベースにする
- `data-preload-chunks` を効果に合わせる（`face` / `image` / `sky` / `slam`）
- 配置は `apps/blog/public/demos/8thwall-<name>/demo.html`
- experiments MDX の `link` は `/demos/8thwall-<name>/demo.html`

### VR / 両対応 と判定したら

`.claude/skills/iwsdk-demo-scaffold/SKILL.md` と `reference.md` を読み、そのスキルの手順に従って進める。主なポイント:

- `npm create @iwsdk@latest` でプロジェクト生成
- `vite.config.ts` に `base: './'` 必須
- spec依存（hit-test / anchors / hand-input 等）なら実装前にWebFetchで該当仕様を確認
- 配置は `apps/blog/public/demo/<name>/`
- experiments MDX の `link` は `/demo/<name>`

## 2段階の承認フロー（AR／VR 共通）

1. **対応環境の確認** — `apps/blog/src/data/devices.ts` と `apps/blog/src/data/webxr-status.ts` を Read し、「動くデバイス／動かない環境／MDX案／demo-name案」を提示して合意をとる
2. **デモ概要書の提示** — コンセプト／シーン構成／ユーザー操作／使う機能／完成イメージ／スコープ外 を書き出し、**明示的な Go サイン**（「Go」「OK」「進めて」など）をもらう

Go が出るまでスキャフォールドを始めない。曖昧な返答（「いいかも」「うーん」）は引っかかっている箇所を具体的に聞き返す。

## 最初に返す応答のテンプレート

### 引数なしの場合

> `/demo` を受け付けました。WebXR / WebAR デモを新規作成します。
>
> まず、どんなデモを作りたいか教えてください。
>
> - どんな体験を見せたいか（一言で）
> - 想定するユーザー操作（コントローラー／ハンド／タップ／顔認識／画像認識など）
> - 対応させたい主なデバイス（iPhone / Android / Meta Quest / PC など）
>
> 回答を基に、**AR（8th Wall）** または **VR/両対応（IWSDK）** のどちらのスキャフォールドが向いているかを判断します。

### 引数ありの場合

引数をテーマ／demo-name候補として解釈し、モード判定を試みる。

> `/demo $ARGUMENTS` を受け付けました。
>
> このテーマは **[AR / VR / 両対応]** として作るのが自然そうです。
> - AR なら **8th Wall OSS**（iPhone・Android・PCで動く）
> - VR なら **IWSDK**（Meta Quest・PC VR、IWERエミュレーターで確認可）
>
> この方針で合っていますか？違うなら、想定デバイスや操作のイメージを教えてください。

## 絵文字・スタイル

- 絵文字は使わない（BANGEOの既存MDXに合わせる）
- 記号（`-`、`|`、`:`）とMarkdown構造で整理する

## 完了条件（モード共通）

- [ ] 対応環境とデモ概要書の両方でユーザーの合意（Goサイン）を得ている
- [ ] 配置パスが正しい（AR → `public/demos/`、VR → `public/demo/`）
- [ ] experiments MDX が登録され、`/experiments` 一覧に表示される
- [ ] ローカルの dev サーバーで開き、期待する動作が確認できる（または未確認なら明示）
