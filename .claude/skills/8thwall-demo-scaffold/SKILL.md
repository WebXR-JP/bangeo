---
name: 8thwall-demo-scaffold
description: BANGEOブログの `/demos/8thwall-<name>/demo.html` で公開するAR WebXRデモを、OSS化された8th Wall（A-Frame 1.5.0 + XRExtras）ベースでスキャフォールドする。iOS Safari や Android Chrome など幅広いカメラ端末で動くことを強みとするAR専用のパス。「ARデモ作って」「8thWallデモ」「Face Effectsデモ」「Image Targetsデモ」「Sky Effectsデモ」「World Effectsデモ」「tap-placeデモ」などで発動する。
metadata:
  author: bangeo-team
  version: "1.0.0"
  argument-hint: "<demo-name> [--effect face|image|sky|world]"
---

# 8th Wall WebAR デモ スキャフォールド

BANGEO の AR デモは、2026年2月にMITライセンスでOSS化された **8th Wall**（A-Frame 1.5.0 ベース）で作る。WebXR の AR Module（`immersive-ar`）は iOS Safari・Desktop Chrome で未対応なのに対し、8th Wall は `getUserMedia` ベースの独自実装なので **iOS Safari でもそのまま動く** のが最大の利点。

動作している参考実装: `apps/blog/public/demos/8thwall-sky-effects/demo.html`、`8thwall-aframe/demo.html` など計8デモ

詳細仕様・機能差分・配布バイナリの扱いは **reference.md** を参照。

## なぜ AR は IWSDK ではなく 8th Wall なのか

| 項目 | IWSDK（WebXR AR Module） | 8th Wall OSS |
| --- | --- | --- |
| iOS Safari | 未対応 | **対応** |
| Android Chrome | 対応（ARCore） | 対応 |
| Meta Quest Browser | 対応（MR） | 対応 |
| Desktop Chrome | 未対応 | 対応（PCカメラ） |
| 実装 | WebXR Device API | getUserMedia + 独自トラッキング |
| 基盤 | Three.js + ECS | A-Frame 1.5.0 + XRExtras |

iPhone ユーザーを含む一般ユーザーに AR を届けたいケースでは、8th Wall を選ぶ。

## ディレクトリ配置規約

IWSDK 系の `public/demo/`（単数）と異なり、8th Wall は既存 BANGEO デモの慣例にあわせて `public/demos/`（複数）に置く。

```
bangeo/
└── apps/blog/
    ├── content/experiments/
    │   └── 8thwall-<demo-name>.mdx         # experiments登録MDX
    └── public/demos/
        ├── xr-standalone/                  # 8th Wall ランタイム（全8thwallデモで共用）
        │   ├── xr.js
        │   └── xrextras.js
        └── 8thwall-<demo-name>/
            └── demo.html                   # 単一HTMLで完結（ビルド不要）
```

`link` は `/demos/8thwall-<demo-name>/demo.html`（末尾に `/demo.html` が付く点に注意、IWSDK の `/demo/<name>/` とは違う）。

## 絶対に守ること

1. **配置パスは `public/demos/`（複数形）** — IWSDKと取り違えない
2. **ファイル名は `demo.html`** — `index.html` ではない
3. **ランタイムは共通の `../xr-standalone/` を相対パスで参照** — デモごとにコピーしない
4. **絵文字は使わない**

## OSS版で使える機能と、配布バイナリが必要な機能

| 機能 | OSS版 | 配布バイナリ（`xr-standalone.zip`） |
| --- | :---: | :---: |
| Face Effects | ○ | ○ |
| Image Targets | ○ | ○ |
| Sky Effects | ○ | ○ |
| **World Effects（SLAM）** | × | ○ |

World Effects（地面タップ配置、空間アンカーなど）を使うデモは、OSS版だけでは動かない。`https://github.com/8thwall/engine` の `xr-standalone.zip` が必要。

## ランタイム（`xr-standalone/`）のセットアップ

新規プロジェクトで `apps/blog/public/demos/xr-standalone/` が存在しない場合は、以下のいずれかで用意する。

1. [8thwall/engine](https://github.com/8thwall/engine) の releases から `xr-standalone.zip` をダウンロードし、`apps/blog/public/demos/xr-standalone/` に展開
2. 既存の BANGEO 8thwall デモが動作している別環境（本番など）からコピーしてくる

初回だけの作業で、以降の 8thwall デモは同じディレクトリを使い回せる。

## 手順

### 1. ヒアリング（モード確定済みの前提）

`/demo` コマンドからの呼び出しでは、すでに AR と判定済み。このスキル側でさらに詰めるのは以下。

- **使う効果のタイプ** — Face / Image / Sky / World のどれか
- **配布バイナリ依存の可否** — World を使うなら配布バイナリが前提。OSS縛りにしたい場合は Face/Image/Sky の範囲で設計
- **対応デバイス** — 基本 `["iPhone", "Android", "PC"]` を想定できるが、`devices.ts` を読んで実態に即した devices フィールドを組む

### 2. demo-name を決める

`8thwall-<feature>-<variant>` の形で統一する。例:

- `8thwall-image-tracking-basic`
- `8thwall-face-filter-glasses`
- `8thwall-sky-swap`
- `8thwall-tap-place-cactus`（World Effects、配布バイナリ必須）

### 3. ベースとなる既存デモを選んでコピー

新規 `demo.html` をゼロから書くより、似た目的の既存デモを丸ごとコピーして書き換える方が早く、事故も少ない。

| 作りたい効果 | コピー元の推奨デモ |
| --- | --- |
| 基本の A-Frame シーン | `apps/blog/public/demos/8thwall-aframe/demo.html` |
| Face Effects | `apps/blog/public/demos/8thwall-face/demo.html` |
| Image Targets | `apps/blog/public/demos/8thwall-business-card/demo.html`, `8thwall-poster-ar/demo.html` |
| Sky Effects | `apps/blog/public/demos/8thwall-sky-effects/demo.html` |
| 商品プレビュー系 | `apps/blog/public/demos/8thwall-product-preview/demo.html` |
| 試着系（Face）| `apps/blog/public/demos/8thwall-virtual-tryon/demo.html` |

```bash
mkdir -p apps/blog/public/demos/8thwall-<demo-name>
cp apps/blog/public/demos/8thwall-sky-effects/demo.html \
   apps/blog/public/demos/8thwall-<demo-name>/demo.html
```

### 4. demo.html の必須構造を維持

以下の3行は必ず残す（順番も固定）。

```html
<script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
<script src="../xr-standalone/xrextras.js"></script>
<script async src="../xr-standalone/xr.js" data-preload-chunks="<chunk>"></script>
```

`data-preload-chunks` に指定するチャンクは機能ごとに異なる。

| 機能 | chunk |
| --- | --- |
| 何もしない / 基本 | 省略 |
| Face Effects | `face` |
| Image Targets | `image` |
| Sky Effects | `sky` |
| World Effects | `slam` |

複数必要なら `data-preload-chunks="sky,face"` のようにカンマ区切り。

### 5. A-Frameシーンをカスタマイズ

`<a-scene>` に `xrweb` / `xrface` などの XRExtras コンポーネントを組み合わせる。シーン内の 3D オブジェクト（`<a-box>` / `<a-entity gltf-model="...">`）を目的に合わせて書き換える。

3D アセット（glb/png など）を読ませる場合は、以下いずれかで配置する。

- 同じデモディレクトリ内: `apps/blog/public/demos/8thwall-<demo-name>/<file>.glb` に置き、HTMLから `./file.glb` で参照
- リポジトリの共有パス: `apps/blog/public/assets/` に置き、HTMLから `/assets/...` で参照

### 6. 動作確認

```bash
cd apps/blog
pnpm dev
# iPhone / Android から http://<PCのLAN IP>:3000/demos/8thwall-<demo-name>/demo.html を開く
# Chromeの場合は chrome://flags/#unsafely-treat-insecure-origin-as-secure に IP を追加するとカメラが有効化される
```

`localhost` アクセスでは Chrome は自動的に `getUserMedia` を許可するが、**iPhone でテストするには HTTPS または 「安全とみなす」設定が必要**。最終的な動作確認は本番（Vercel）へのデプロイ後に行う運用でも良い。

### 7. experiments MDX を登録

```mdx
---
title: "タイトル"
description: "1〜2文の説明"
date: "YYYY-MM-DD"
category: "AR"
tags:
  - "WebAR"
  - "8th Wall"
  - "A-Frame"
  - "Face Effects"           # 使った機能を入れる
frameworks:
  - "8th Wall"
  - "A-Frame"
devices:
  - "iPhone"
  - "Android"
  - "デスクトップ"
difficulty: "beginner"
link: "/demos/8thwall-<demo-name>/demo.html"
thumbnail: "/assets/tech/8thwall-<demo-name>-thumb.png"
---

デモの説明を1〜2段落で書く。
```

`/demos/` 複数形と、末尾の `/demo.html` を忘れない。

### 8. コミット前チェック

- [ ] `apps/blog/public/demos/8thwall-<demo-name>/demo.html` が存在する
- [ ] スクリプト読み込み3行が残っており、`data-preload-chunks` が機能に合っている
- [ ] `../xr-standalone/xr.js` と `../xr-standalone/xrextras.js` への相対参照になっている
- [ ] experiments MDX の `link` が `/demos/8thwall-<demo-name>/demo.html` になっている
- [ ] `/experiments` 一覧にサムネイル付きで表示される
- [ ] PC の localhost でカメラがオンになり、想定する効果が動作する

## よくあるハマりどころ

| 症状 | 原因 | 対応 |
| --- | --- | --- |
| カメラ映像が出ない | ブラウザが `getUserMedia` を拒否している | `localhost` または HTTPS で開く。iOS では設定からカメラ許可を確認 |
| World Effects が動かない | OSS版には SLAM チャンクが無い | 配布バイナリ `xr-standalone.zip` をダウンロードして `public/demos/xr-standalone/` に展開 |
| `xr.js` が404 | `public/demos/xr-standalone/` が未配置 | 上記のランタイムセットアップ手順で設置 |
| iPhone Safari で真っ黒 | HTTPS でない、またはカメラ権限拒否 | デプロイしてHTTPS化、Safariの設定でカメラを許可 |
| A-Frame コンポーネントが認識されない | script読み込み順が違う | A-Frame → XRExtras → XR Engine の順を厳守 |
| `/experiments` に出ない | `date` / `link` / `thumbnail` 不備 | frontmatter を確認 |

## 関連ファイル

- **reference.md** — 8th Wall OSS 構成、XRExtras コンポーネント、OSS/バイナリ機能差分
- `apps/blog/public/demos/8thwall-*/demo.html` — 既存8デモ、コピーベースとして活用
- `apps/blog/content/blog/8thwall-world-effects.mdx` — World Effectsチュートリアル記事（配布バイナリの扱い含む）
