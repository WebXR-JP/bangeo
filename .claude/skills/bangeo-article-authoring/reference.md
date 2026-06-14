# BANGEO 記事公開前チェック

このファイルは公開リポジトリに置くエージェント/コントリビューター向けガイド。秘密情報や非公開の運用情報は書かない。

## MDX frontmatter

既存記事に合わせて次の形にする。

```yaml
---
title: "..."
description: "..."
date: "YYYY年M月D日"
category: "NEWS"
tags:
  - "WebXR"
author: "BANGEO Team"
thumbnail: "/assets/tech/example.webp"
draft: false
---
```

- `NEWS`: リリース、発表、ブラウザ更新、仕様ステータスの変化
- `TECH`: 技術解説、実装背景、仕様比較
- `GUIDE`: 手順、チェックリスト、導入方法

## サムネイル

### スタイル（blob-v1）

参照テイスト: `unity-webxr-build-guide` / `webxr-colocation-meta-quest`

- パステル blob マスコット（mint green + sky blue）、ピンクチーク、白 VR ヘッドセット
- 淡い mint → lavender グラデ背景、浮遊する等角キューブ・ギア・六角形
- ダークグレーの丸みあるアウトライン、中央にソフトグロー
- **禁止**: 文字、数字、透かし、商標ロゴ
- 3:2 横長。縮小表示でも主題が判別できる構図

### 配置

1. PNG を `apps/blog/public/assets/{tech,news}/` に置く
2. 同名の WebP を用意する（`pnpm -C apps/blog run optimize:images` で生成可）
3. frontmatter の `thumbnail` を WebP パスに更新

### 新規記事

1. 近いテーマの既存記事とサムネイルを確認する
2. 画像を配置し frontmatter を更新する
3. `pnpm -C apps/blog build` で参照切れがないか確認する

## WebXR / WebGPU記事で確認すること

検証項目のテンプレートは、原則としてこのガイドに置く。記事本文には、具体的なデモや検証結果の再現に必要な場合だけ、読者向けの情報として短く入れる。

```md
### 検証環境

- Engine: PlayCanvas Engine v2.19.7
- Browser: Quest Browser 146.x / Chrome Stable / Chrome Canary
- Device: Meta Quest 3 / Android / Desktop
- Rendering path: WebGL / WebGPU
- XR mode: immersive-vr / immersive-ar / inline
- Input: controllers / hand tracking / gamepad without thumbstick axes
- Depth: enabled / disabled
- Fallback: WebGPU unavailable時はWebGLへ切り替え
```

記事本文に入れるかどうかは、読者の再現性に直接役立つかで判断する。編集者向け・エージェント向けの作業メモとしては入れない。

## PlayCanvas / WebXRデモの確認項目

- PlayCanvas Engineのバージョンを固定している
- `navigator.gpu` と `requestAdapter()` の失敗時に停止しない
- WebGPU不可の場合にWebGLへフォールバックする
- `navigator.xr` と `isSessionSupported()` を確認している
- WebXR不可の場合に通常3D表示または説明UIへ切り替える
- iframe埋め込みでXRが必要な場合は `allow="camera; microphone; xr-spatial-tracking; fullscreen"` を設定する
- iframe内XRが不安定な環境向けに別タブリンクを用意する
- XR入力処理でthumbstick axesが必ず存在する前提にしない
- depth/occlusionデモはdepthなしでも表示できる
- HTML-in-Canvasデモは `device.supportsHtmlTextures` を確認し、fallbackを用意する

## 公開記事に入れてよい注意書き

```md
WebGPU対応ブラウザであっても、端末、GPU、ドライバ、ブラウザバージョンによってWebGPU経路が無効化される場合があります。WebGPUが使えない場合にWebGLへフォールバックする設計にしておくと安全です。
```

```md
このデモは実験的なWeb APIやブラウザ機能を含みます。Engine、ブラウザ、GPU、端末、入力デバイスの組み合わせによって動作が変わる場合があります。
```

## 仕上げ

- `BANGEO用`, `更新すべき`, `TODO`, `内部`, `非公開`, `社内` などの語が記事に残っていないか確認する
- 参照リンクが実在するか確認する
- `pnpm -C apps/blog build` を実行できる場合は実行する
