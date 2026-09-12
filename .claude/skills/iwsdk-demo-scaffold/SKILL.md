---
name: iwsdk-demo-scaffold
description: BANGEOでIWSDKデモを新規作成・機能変更するときに使う。WebXR APIの実証、VR、Quest MRが対象。
metadata:
  author: bangeo-team
  version: "1.2.0"
  argument-hint: "<demo-name>"
---

# IWSDKデモ

指定されたAPI・対象端末・操作を満たすデモを実装し、ソースから再ビルドできる状態で配信ファイルとMDXを揃える。目的・方式が未決の場合だけ `docs/agent-guides/demos.md` を参照する。

## 配置と動作の条件

- ソースは `apps/<demo-name>/`。配信ビルドは `apps/blog/public/demo/<demo-name>/`、URLは `/demo/<demo-name>/`。
- Viteに `base: './'` を設定する。JS内のモデルや画像も相対URLか `import.meta.env.BASE_URL` を使い、ビルド後の参照を確認する。
- MDXは `apps/blog/content/experiments/<demo-name>.mdx`。`link` と画像を実在する配信先に合わせる。スキーマと表示先は現行の `apps/blog/source.config.ts` とルート実装を確認する。
- 既存デモの修正ではその依存バージョンとlockfileを維持する。新規生成時は利用可能なCLIオプションを確認し、使うエージェントに合う設定を選ぶ。
- WebXRの要求機能、開始・終了処理、未対応時の表示を実装する。対象APIを使わない描画で代用しない。

## 必要な参照

[reference.md](reference.md) はCLI、ECS、UI、WebXR仕様リンクを調べるときに該当節だけ読む。記載されたバージョンやMCPツールの存在は現環境で確認する。

既存ソースの例は `apps/xr-mesh-export/`。登録形式は現在のMDX・スキーマを優先する。

## 完了

対象アプリをビルドし、生成物を対応する配信ディレクトリへ反映する。アセット参照、配信ルート、MDXからの導線を確認し、可能ならローカルで表示・操作を検証する。不具合を修正して再確認し、実機確認とエミュレーター確認を分けて報告する。未検証の機能を対応済みと断定しない。
