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

## 公開本文の読者向けチェック

調査メモ、イベントウォッチ、PR本文、エージェント出力をそのままMDXに移すと、読者ではなく編集者やAIエージェントに向いた文章が混ざりやすい。公開前に次を確認する。

### 残さない表現

- `回収メモ`、`拾う`、`候補`、`深追いしない` など、調査作業を説明する語
- `BANGEO向け`、`BANGEOでの評価`、`BANGEO内の置き場所` など、サイト運用側の判断
- `重要度`、`confidence`、`source_type`、`recommended_action`、`affected_bangeo_pages` など、エージェント出力の構造化項目
- `この記事から派生できる記事`、`次回確認`、`更新すべきページ` など、編集計画そのもの
- `扱うのが安全`、`書くべきではない` のような執筆判断。必要なら「現時点では断定できない」「実装状況を分けて確認する」と読者向けに言い換える

### 言い換えの型

| 内部メモ寄り | 公開本文向け |
| --- | --- |
| AWEからWebXR関連だけを回収する | AWEの発表からWebXR開発者に関係する論点を整理する |
| BANGEOでは深追いしない | この記事ではWeb技術と接続する話題に絞る |
| 見るべきポイント | 開発者が確認したいポイント |
| BANGEOでの評価 | 現時点での見方 |
| WebXRの代替として扱わない方が安全 | WebXRとはレイヤーが違うため、代替ではなく周辺構想として分けて読む |
| 派生できる記事 | 関連して理解したいテーマ |

### 仕上げ検索

記事公開前に対象MDXで次の語を検索し、読者向けの文脈になっているか確認する。

```bash
rg -n "回収|拾う|候補|BANGEO向け|BANGEOでの評価|置き場所|重要度|confidence|source_type|recommended_action|affected_bangeo_pages|派生|更新すべき|TODO|内部|社内" apps/blog/content/blog/<slug>.mdx
```

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

## 用語とSEO：公的技術名称を優先する

BANGEOは技術者が調べて使うサイトなので、記事・デモの用語は検索クエリに乗る公的な技術名称を優先する。和製語・独自の言い換えは避ける。

### 優先する公的名称

| 分類 | 公的名称 | 避ける和製語 |
| --- | --- | --- |
| WebXR ReferenceSpaceType | `local` / `local-floor` / `bounded-floor` / `unbounded` | ルームスケール境界、境界取得 |
| WebXR プロパティ | `boundsGeometry` / `featurePointCloud` / `motionVectorTexture` / `depthStencilTexture` | 境界形状、3D特徴点、動き |
| WebXR 機能Module | `Hit Test Module` / `Anchors Module` / `Hand Input Module` / `Depth Sensing Module` / `Lighting Estimation Module` / `DOM Overlays Module` / `Layers Module` | ヒットテスト、ヒット判定、空間アンカー、ハンドトラッキング、奥行き合成、奥行き表現 |
| WebXR session mode | `inline` / `immersive-vr` / `immersive-ar` / `inline-stereo` | ページ内モード、没入型表示 |
| WebXR Mesh | `XRMeshDetection` | シーンメッシュ、メッシュ取得 |
| Quest 公式実装名 | `scene capture` / `room mesh` / `depth projection` / `app space warp` / `passthrough` / `Spatial Anchors` | 空間スキャン、ルームスキャン、奥行き、パススルー（MR）、空間アンカー |
| 8th Wall 公式 | `world sensing` / `world tracking` / `SLAM` / `face mesh` / `face attachment` / `Face Effects` / `Image Targets` / `Sky Effects` / `World Effects` | ワールドトラッキング、特徴点、自動追従 |
| 業界標準 | `occlusion` / `depth occlusion` / `MR合成` / `passthrough` / `fallback` / `polyfill` / `hit test` / `hand tracking` / `eye tracking` / `spatial mapping` / `spatial UI` / `co-presence` / `VR sickness` / `stereo rendering` / `foveated rendering` / `artifact` | 奥行き合成、代替表示、代替ライブラリ、ヒット判定、ハンドトラッキング、視線追跡、空間認識、空間UI、共存、酔い、ステレオレンダリング、描画崩れ、破綻 |

### 和製語を使う場合のルール

どうしても和製語を使う場合は公的名称を併記する。和製語単独では使わない。

```
✕ ハンドトラッキングに対応
○ hand tracking（ハンドトラッキング）に対応
```

### 注釈の入れ方

公的技術名称のうち読者に説明が必要なもの（仕様プロパティ名・Module名・メーカー実装名）は、初出箇所の直後または「用語メモ」セクションに1-2行の注釈を入れる。毎回ではなく記事内で1回（初出または用語メモ）でよい。

```
boundsGeometry（XRBoundedReferenceSpace の境界ジオメトリ。プレイエリアの外周を表す点列）
depth projection（Quest Browser 146 で実装された WebXR Depth Sensing の実装名。depth テクスチャを使って仮想オブジェクトの前後関係を合成する）
app space warp（Meta のレイトレーシング負荷軽減機能。motion vector と depth を使って前フレームから現在フレームを外挿する）
scene capture（Quest の部屋形状取得機能。room mesh と semantic label をまとめて取得する）
```

### frontmatter tags

`tags` にも和製語を入れない。`代替表示` / `奥行き` / `境界` のような和製語タグは、`fallback` / `occlusion` / `bounded-floor` のような公的名称に置き換える。

### title と description

`title` は技術者が検索クエリに入れる公的名称を前半に配置する。説明的な和製語タイトル（「〇〇ビューア」「〇〇デモ」「〇〇実験」）は、公的名称を先にした形に作り直す。

```
✕ ルームスケール境界ビューア
○ WebXR Bounded Floor ビューア — boundsGeometry の可視化

✕ Quest奥行き合成デモ
○ WebXR Depth Occlusion デモ — Quest depth projection でMR合成を検証
```

## 公開記事に入れてよい注意書き

```md
WebGPU対応ブラウザであっても、端末、GPU、ドライバ、ブラウザバージョンによってWebGPU経路が無効化される場合があります。WebGPUが使えない場合にWebGLへフォールバックする設計にしておくと安全です。
```

```md
このデモは実験的なWeb APIやブラウザ機能を含みます。Engine、ブラウザ、GPU、端末、入力デバイスの組み合わせによって動作が変わる場合があります。
```

## 仕上げ

- `BANGEO用`, `BANGEO向け`, `更新すべき`, `TODO`, `内部`, `非公開`, `社内` などの語が記事に残っていないか確認する
- 参照リンクが実在するか確認する
- `pnpm -C apps/blog build` を実行できる場合は実行する
