---
name: 8thwall-demo-scaffold
description: BANGEOの8th WallカメラベースWebARデモを新規作成・機能変更するときに使う。WebXR APIそのものの実証には使わない。
metadata:
  author: bangeo-team
  version: "1.1.0"
  argument-hint: "<demo-name> [--effect face|image|sky|world]"
---

# 8th Wallデモ

指定されたカメラ効果と対象端末に合うデモを実装し、配信HTML・必要なアセット・MDXを揃える。目的・方式が未決の場合だけ `docs/agent-guides/demos.md` を参照する。

## 配置と動作の条件

- `apps/blog/public/demos/8thwall-<name>/demo.html` に配置する。URLは `/demos/8thwall-<name>/demo.html`。IWSDKの単数形 `/demo/` と区別する。
- 共通ランタイムは `../xr-standalone/` を参照し、デモごとに複製しない。A-Frame → XRExtras → xr.js の読み込み順を保つ。
- `data-preload-chunks` を使用効果に合わせる（face / image / sky / slam）。
- World EffectsではSLAMを含む配布バイナリが必要。既存ランタイム・配布元・利用条件を確認し、OSSのみという指定を勝手に変更しない。取得できない場合は依存関係を明示し、準備可能な実装を進める。
- カメラにはsecure contextとユーザーの許可が必要。対応端末を一律に保証せず、対象の環境で確認する。
- MDXは `apps/blog/content/experiments/8thwall-<name>.mdx`。`link` と画像を実在する配信先に合わせ、現行スキーマと導線を確認する。

## 必要な参照

[reference.md](reference.md) の効果・チャンク・HTML例・トラブルシューティングを必要に応じて読む。対応表は現状の保証ではなく調査の入口として扱う。

既存HTMLを使う場合は対象効果に近い実装だけを確認する。存在しない過去デモをコピー元として要求しない。

## 完了

HTML、チャンク、アセット、MDXの参照を確認し、利用可能な環境でカメラ効果を検証する。失敗を修正して再確認し、実機未確認・ランタイム不足を報告する。ローカル検証のために未承認の本番公開を行わない。
