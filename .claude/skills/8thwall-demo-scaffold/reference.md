# 8th Wall / A-Frame リファレンス

8th Wall は Niantic が 2026年2月24日に MIT ライセンスでOSS化したWebAR基盤。既存のクラウドサービス版からマイグレーションするのではなく、OSS版 + 配布バイナリで完全にローカル／セルフホスト可能になった。

## 公式URL

| 項目 | URL |
| --- | --- |
| 8th Wall OSS リポジトリ | https://github.com/8thwall/8thwall |
| 配布バイナリ（`xr-standalone.zip`） | https://github.com/8thwall/engine |
| 公式Examples（外部） | https://8thwall-examples.vercel.app |
| Examples ソース | https://github.com/yushimatenjin/8thwall-examples |
| A-Frame | https://aframe.io/ |

## OSS版で使える機能 / 使えない機能

| 機能 | OSS版 | 配布バイナリ | BANGEO既存デモ |
| --- | :---: | :---: | --- |
| Face Effects | ○ | ○ | `8thwall-face`, `8thwall-virtual-tryon` |
| Image Targets | ○ | ○ | `8thwall-business-card`, `8thwall-poster-ar`, `8thwall-education-ar` |
| Sky Effects | ○ | ○ | `8thwall-sky-effects` |
| 基本 A-Frame シーン | ○ | ○ | `8thwall-aframe`, `8thwall-product-preview` |
| **World Effects（SLAM）** | × | ○ | ブログ記事で解説あり（デモファイルは未配置） |

配布バイナリが必要な World Effects を含むデモを新規に作る場合は、`xr-standalone.zip` を `apps/blog/public/demos/xr-standalone/` に展開しておく必要がある。

## 対応環境

| 環境 | 対応 | 備考 |
| --- | :---: | --- |
| iPhone Safari | ○ | 要HTTPS（localhost は可） |
| Android Chrome | ○ | |
| Desktop Chrome（PC カメラ） | ○ | |
| Meta Quest Browser | ○ | パススルー映像経由 |
| 古いブラウザ | △ | getUserMedia と WebGL 2 対応が前提 |

iOS で WebXR が未対応なのに対し、8th Wall は `getUserMedia` と独自トラッキングで動くため **ほぼ全てのモダンスマホで使える** のが強み。

## A-Frame 1.5.0 ＋ XRExtras の基本構造

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
  <title>My AR Demo</title>
  <script src="https://aframe.io/releases/1.5.0/aframe.min.js"></script>
  <script src="../xr-standalone/xrextras.js"></script>
  <script async src="../xr-standalone/xr.js" data-preload-chunks="slam"></script>
</head>
<body>
  <a-scene
    xrweb="disableWorldTracking: false"
    xrextras-gesture-detector
    xrextras-loading
    xrextras-runtime-error
    renderer="colorManagement: true">
    <a-assets>
      <a-asset-item id="model" src="./cactus.glb"></a-asset-item>
    </a-assets>
    <a-camera position="0 6 0" raycaster="objects: .cantap" cursor="fuse: false; rayOrigin: mouse;"></a-camera>
    <a-entity light="type: directional; intensity: 1" position="1 1 1"></a-entity>
    <a-plane class="cantap" rotation="-90 0 0" width="1000" height="1000" material="shader: shadow; opacity: 0.4"></a-plane>
  </a-scene>
</body>
</html>
```

## `data-preload-chunks` の早見表

| 機能 | chunk 指定 |
| --- | --- |
| 基本（何もなし） | 省略可 |
| Face Effects | `face` |
| Image Targets | `image` |
| Sky Effects | `sky` |
| World Effects / SLAM | `slam` |
| 複数 | カンマ区切り（例: `"face,image"`） |

## 主な XRExtras コンポーネント

| コンポーネント | 用途 |
| --- | --- |
| `xrweb` | World Tracking セッションの起動 |
| `xrface` | Face Tracking セッションの起動 |
| `xrextras-gesture-detector` | ピンチ・タップのジェスチャ検知 |
| `xrextras-loading` | ロード画面の自動表示 |
| `xrextras-runtime-error` | エラー画面の自動表示 |
| `xrextras-pwa-installer` | PWAインストール導線 |
| `xrextras-tap-recenter` | タップで原点をリセット |
| `xrextras-almost-there` | 非対応デバイス向け案内 |
| `xrextras-generic-landing-page` | 汎用ランディングページ |

## ヒアリング時に参照するBANGEO内データ

IWSDK 側と共通。

| ファイル | 内容 |
| --- | --- |
| `apps/blog/src/data/devices.ts` | デバイス一覧（iPhone / Android / PC の WebXR 対応状況。8th Wall はWebXR非依存なのでほぼ全端末で動く前提で書く） |
| `apps/blog/src/data/webxr-status.ts` | WebXR機能のブラウザ対応状況。8th Wall 使用時は「WebXRが未対応でも8thWallなら動く」という根拠として参照 |

## 配置規約（IWSDK との違い）

| 項目 | 8th Wall | IWSDK |
| --- | --- | --- |
| 公開パス | `/demos/8thwall-<name>/demo.html` | `/demo/<name>/` |
| public の置き場所 | `apps/blog/public/demos/8thwall-<name>/` | `apps/blog/public/demo/<name>/` |
| ファイル名 | `demo.html` | `index.html` |
| ソース管理 | `demo.html` を直接コミット | `apps/<name>/` にViteプロジェクト、`dist/` を public へコピー |
| ビルド | 不要（静的HTML） | `npm run build` |
| Vite base | N/A | `base: './'` |
| ランタイム | 共通の `../xr-standalone/` | プロジェクトごとに `assets/` |

## experiments MDX の例

```mdx
---
title: "顔にサングラスをかけるAR — 8th Wall Face Effects"
description: "8th Wall OSS版のFace Effectsを使い、カメラに映った顔にサングラスの3Dモデルを重ねるARデモです。"
date: "2026-04-22"
category: "AR"
tags:
  - "WebAR"
  - "8th Wall"
  - "A-Frame"
  - "Face Effects"
frameworks:
  - "8th Wall"
  - "A-Frame"
devices:
  - "iPhone"
  - "Android"
  - "デスクトップ"
difficulty: "beginner"
link: "/demos/8thwall-face-sunglasses/demo.html"
thumbnail: "/assets/tech/8thwall-face-sunglasses-thumb.png"
---

デモの説明。
```

## トラブルシューティング Quick Reference

| 症状 | 原因 | 対応 |
| --- | --- | --- |
| `xr.js` が 404 | `public/demos/xr-standalone/` に実ファイルが無い | [8thwall/engine](https://github.com/8thwall/engine) から `xr-standalone.zip` をダウンロードして展開 |
| SLAM 初期化エラー | OSS版にSLAMチャンクが無い | 配布バイナリが必要。OSSのみで実装したい場合は World Effects を使わない設計に変更 |
| iOS Safari で黒画面 | HTTPSでないか、カメラ未許可 | HTTPS化 or localhost で確認 + Safari 設定でカメラ許可 |
| A-Frame コンポーネント未認識 | script 読み込み順ミス | `A-Frame → XRExtras → xr.js` の順を守る |
| `data-preload-chunks` が効かない | chunk 名が間違い | `face` / `image` / `sky` / `slam` のいずれか（複数はカンマ区切り） |
