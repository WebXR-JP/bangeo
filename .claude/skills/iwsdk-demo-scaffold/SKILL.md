---
name: iwsdk-demo-scaffold
description: BANGEOブログの `/demo/<name>/` で公開するWebXRデモを、IWSDK（Meta Immersive Web SDK）ベースでスキャフォールドする。IWSDKプロジェクトを `apps/<demo-name>/` に作成し、ビルド成果物を `apps/blog/public/demo/<demo-name>/` に配置し、`apps/blog/content/experiments/<demo-name>.mdx` を登録するまでを一気通貫で行う。「新しいデモ」「WebXRデモ作って」「IWSDKデモ」「hit-testデモ」「anchorsデモ」「add demo」「scaffold demo」「create webxr demo」といった指示で発動する。
metadata:
  author: bangeo-team
  version: "1.1.0"
  argument-hint: "<demo-name> [--title <title>] [--category GUIDE|TECH|VR|AR]"
---

# IWSDK WebXR デモ スキャフォールド

BANGEOでは `http://localhost:3000/demo/<demo-name>/` でWebXRデモを配信する。Next.jsのpublicに静的ビルドを置くだけで動くため、IWSDK（Vite + Three.js + ECS + IWER）でビルドしたdistをコピーするのが最短ルート。

動作している参考実装: `apps/blog/public/demo/iwsdk-gallery/` （解説記事 `iwsdk-ai-vr-development.mdx`）

詳細仕様・MCPツール・WebXR仕様リンクは **reference.md** を参照。

## ディレクトリ配置規約

```
bangeo/
├── apps/
│   ├── blog/                                   # Next.js（配信側）
│   │   ├── content/experiments/
│   │   │   └── <demo-name>.mdx                 # デモ一覧に登録するMDX
│   │   └── public/demo/
│   │       └── <demo-name>/                    # ビルド済み dist を配置
│   │           ├── index.html
│   │           ├── assets/
│   │           └── ...
│   └── <demo-name>/                            # IWSDK開発プロジェクト
│       ├── src/
│       ├── ui/
│       ├── public/
│       ├── vite.config.ts                      # base: './' （相対パス固定）
│       └── package.json
```

## 必ず守ること（localhost で動かすための条件）

Next.js は `apps/blog/public/demo/<demo-name>/` をそのまま `/demo/<demo-name>/` として配信する。ビルド済みデモがルート絶対パス（`/assets/...`）でアセットを読むとNext.jsの404に吸われて真っ白になる（iwsdk-gallery を最初に配置したときに発生した既知の問題）。

**解決策: `vite.config.ts` に `base: './'` を設定する。**

```typescript
// apps/<demo-name>/vite.config.ts
import { defineConfig } from 'vite';
import { iwsdkDev } from '@iwsdk/core/vite';

export default defineConfig({
  base: './',                      // 相対パスにするだけ。デモ名に依存しない
  plugins: [iwsdkDev({ ai: {} })],
});
```

これで生成される `index.html` は `<script src="./assets/xxx.js">` のような相対パスになり、どのサブパスに置いても動く。デモごとに値を変える必要はない（`base: '/demo/<demo-name>/'` のようなハードコードは不要）。

### 注意: ランタイムでの絶対パス

JS/TS コードで `'/gltf/model.glb'` のような絶対パス文字列を書くと、相対パス化されないため壊れる。以下いずれかで書く:

- 相対パスで書く: `'gltf/model.glb'`
- `import.meta.env.BASE_URL` を前置: `` `${import.meta.env.BASE_URL}gltf/model.glb` ``
- ESM import で渡す: `import modelUrl from './gltf/model.glb?url';`

## 手順

### 1. ヒアリング（デバイス対応込みで要件を固める）

単に demo-name を聞くだけで進めない。まず何を見せるデモかを聞き、AR／VR／両対応のどれが自然かを判定し、BANGEO内のデバイスデータと照らし合わせて「どのデバイスで動くか」まで提案した上でユーザーに確認する。

#### 1-a. まずコンセプトを聞く

- どんな体験を見せたいか（一言で）
- どういうユーザー操作を想定しているか（コントローラー／ハンド／タップ／視線）
- 参考になるデモや記事があるか

#### 1-b. モードを判定

コンセプトから以下のどれに当てはまるかを判定する。

| モード | 典型用途 | 主要ターゲット | 主な非対応環境 |
| --- | --- | --- | --- |
| VR のみ | 没入シーン、空間UI、ハンドトラッキング、グラブ | Meta Quest、Pico、PC VR | iOS Safari（WebXR未対応） |
| AR のみ | hit-test、anchors、実空間配置、平面検出 | Android Chrome（ARCore）、Meta Quest 3 のMR | Desktop Chrome（AR Module未対応）、iOS Safari |
| 両対応 | 3D閲覧、基本的なシーン探索 | Quest + Android + デスクトップ | iOS Safari |

ARか VR かで使える WebXR モジュール、ターゲットデバイス、ブラウザが大きく変わる。この判定を最初にやる。

#### 1-c. 使う WebXR モジュールを列挙

hit-test／anchors／hand-input／depth-sensing／lighting-estimation／layers／DOM-overlays／gamepads など。どれを使うかが決まったら、spec URL を `reference.md` の「WebXR 仕様リンク集」から引く。

#### 1-d. デバイス対応状況を BANGEO 内データで確認

以下の2ファイルを必ず Read して、どのデバイス／ブラウザで動くかを整理する。

- `apps/blog/src/data/devices.ts` — デバイス一覧と各デバイスの `webxrSupport.status`（「対応」「非対応」）
- `apps/blog/src/data/webxr-status.ts` — 各WebXRモジュールの Chrome Desktop／Chrome Android／Quest Browser／Safari 対応状況

1-c で決めたモジュールの行を探し、「対応」「未対応」の欄からターゲットデバイス／ブラウザを決める。

#### 1-e. 対応環境を整理してユーザーに返す

以下のテンプレートで、まず**対応環境**の確認を取る。

> このデモは **[AR / VR / 両対応]** で作るのが自然そうです。使う WebXR モジュールは **[hit-test, anchors, ...]** です。
>
> BANGEO のデバイス／機能対応データ（`devices.ts`・`webxr-status.ts`）を確認しました。
>
> - **動くデバイス**: Meta Quest 3, Meta Quest 3S, Android Chrome（ARCore）
> - **動かないデバイス**: iOS Safari（WebXR 全般未対応）、Desktop Chrome（AR Module 未対応）
>
> MDX frontmatter の `devices` は `["Meta Quest", "Android"]`、`category` は `"AR"`、`tags` に `"WebXR"`, `"IWSDK"`, `"Hit Test"` を入れる想定です。
> demo-name は `xr-hit-test-basic` を提案します。

#### 1-f. デモ概要書を提示して Go サインをもらう

対応環境の確認が取れたら、**実装に入る前にデモ概要書を書き出してユーザーに見せる**。ここで方向性を合わせておくと、スキャフォールド後の手戻りが減る。

以下の項目を埋める形で提示する。

> **デモ概要: `<demo-name>`**
>
> **コンセプト**
> 1〜2文で何を体験するデモか。
>
> **シーン構成**
> - 環境：どんな空間か（暗い室内／明るい屋外／スタジオなど）
> - 配置オブジェクト：テーブル、カード、パーティクルなど何が置かれるか
> - ライティング：基本光源、追加演出があれば
>
> **ユーザー操作**
> - 入力：コントローラー／ハンド／視線／タップのどれを使うか
> - アクション：選択、掴む、移動、配置など主なインタラクション
> - フィードバック：選択時の視覚・音・ハプティクスの反応
>
> **WebXR モジュールの使い方**
> - 使うモジュールと、どこでどう呼ぶか（例: hit-test で画面中央の線を出し、タップで配置）
>
> **完成イメージ**
> - 起動直後に何が見えるか
> - 操作後に何が起きるか
>
> **スコープ外（今回やらないこと）**
> - マルチプレイヤー、永続化、音声認識など機能拡張の除外項目
>
> この内容で進めて良ければ「Go」で返してください。変更したい点があれば教えてください。

ユーザーから **Go サイン**（「OK」「進めて」「Go」など明示的な承認）が出てからスキャフォールドに入る。曖昧な返答（「いいかも」「うーん」など）のときは具体箇所を確認し直す。

### 2. WebXR 仕様の確認（spec依存デモの場合のみ）

デモが特定のWebXRモジュール（hit-test、anchors、hand-input、depth-sensing、lighting-estimation、layers、DOM-overlays など）に依存する場合、**実装前に該当 spec を WebFetch で確認する**。IWSDKのAPIが未対応だったり、ブラウザ実装が限定的なケースを先に潰しておく。

参照先は `reference.md` の「WebXR 仕様リンク集」にまとまっている。

例: hit-test デモを頼まれたら、まず `https://www.w3.org/TR/webxr-hit-test-1/` を開いて `XRSession.requestHitTestSource()` の引数形状や `XRHitTestResult.getPose()` の戻り値を確認してから実装に入る。

### 3. IWSDK プロジェクトをスキャフォールド

```bash
cd apps
npm create @iwsdk@latest
# プロジェクト名に <demo-name> を入力、AIツールは Claude を選択
cd <demo-name>
```

要件: Node.js 20.19.0 以上。生成物には `CLAUDE.md` / `AGENTS.md` / `.mcp.json` が含まれ、Claude Code が自動検出する。

### 4. vite.config.ts に `base: './'` を追加

上述の通り。生成直後にこれだけ済ませておく。

### 5. 開発

```bash
cd apps/<demo-name>
npm run dev        # https://localhost:8081
```

Claude Code からは MCP ツール（`browser_screenshot` / `scene_get_hierarchy` / `xr_accept_session` など）でシーンを観察しながら実装する。ツール一覧は reference.md を参照。

### 6. ビルドと配置

```bash
cd apps/<demo-name>
npm run build
rm -rf ../blog/public/demo/<demo-name>
cp -r dist ../blog/public/demo/<demo-name>
```

配置後、`apps/blog/public/demo/<demo-name>/index.html` を開いて `<script src="./assets/..."` のように相対パスで書かれていることを確認する。

### 7. experiments に登録

`apps/blog/content/experiments/<demo-name>.mdx` を作成する。

```mdx
---
title: "タイトル"
description: "1〜2文の説明"
date: "YYYY-MM-DD"
category: "VR"
tags:
  - "WebXR"
  - "IWSDK"
  - "Three.js"
frameworks:
  - "IWSDK"
  - "Three.js"
devices:
  - "Meta Quest"
  - "PC VR"
  - "デスクトップ"
difficulty: "intermediate"
link: "/demo/<demo-name>"
thumbnail: "/assets/tech/<demo-name>-thumb.png"
---

デモの説明を1〜2段落で書く。
```

### 8. ローカル検証

```bash
cd apps/blog
pnpm dev
# http://localhost:3000/demo/<demo-name>/        で動作確認
# http://localhost:3000/experiments              で一覧に出るか確認
```

### 9. コミット前チェック

- [ ] `apps/<demo-name>/vite.config.ts` に `base: './'` がある
- [ ] `apps/blog/public/demo/<demo-name>/index.html` が相対パスで書かれている（`./assets/...`）
- [ ] `/demo/<demo-name>/` でアセットが全てロードされる（DevToolsのNetworkタブで404ゼロ）
- [ ] `/experiments` 一覧にサムネイル付きで表示される
- [ ] `/experiments/<demo-name>` の個別ページが開く

## よくあるハマりどころ

| 症状 | 原因 | 対応 |
| --- | --- | --- |
| `/demo/xxx/` が真っ白 | `vite.config.ts` に `base: './'` が無い | `base: './'` を追加して再ビルド |
| `/assets/index-xxx.js` が404 | ビルド済みHTMLが `/assets/...` 絶対パスを参照している | 同上 |
| 画像・モデルが読めない | JS/TS内で `/foo.glb` のような絶対パスを書いている | 相対パス、または `import.meta.env.BASE_URL` を使う |
| サムネイルが出ない | `thumbnail` のパスが `public/` に存在しない | `apps/blog/public/assets/tech/` に画像を配置 |
| `/experiments` 一覧に出ない | `_meta.json` で除外されている／frontmatter の不備 | `date` / `link` / `thumbnail` を確認 |
| WebXR APIが未定義エラー | ブラウザがそのモジュールに未対応、またはフラグが必要 | reference.md の「WebXR 仕様リンク集」でブラウザ対応状況を確認 |

## 関連ファイル

- **reference.md** — IWSDK CLI／MCPツール／主要API／WebXR 仕様リンク集
- `apps/blog/content/experiments/iwsdk-gallery.mdx` — 登録MDXの参考例
- `apps/blog/public/demo/iwsdk-gallery/` — 配置済みデモの参考例
- `apps/blog/content/blog/iwsdk-ai-vr-development.mdx` — IWSDK全体の解説記事
