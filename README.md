# BANGEO（バンオ）

WebXR・VR/AR に関する日本語リソースサイトです。技術記事やデモを通じて、日本語での WebXR 情報発信を行っています。

**サイト**: [https://bangeo.net](https://bangeo.net)

## リポジトリ構成

このリポジトリは `apps/blog` を中心に管理しています。デモの静的ファイルも同じアプリ配下の `public/demos` に集約しています。

```
bangeo/
├── apps/
│   └── blog/          # ブログ・メインサイト
├── .github/           # CI / Issue / PR テンプレート
├── Glossary.md        # 用語集
├── Rules.md           # 表記・運用ルール
└── pnpm-workspace.yaml
```

## セットアップ

### 前提条件

- [Node.js](https://nodejs.org/) v20.9 以上
- [pnpm](https://pnpm.io/) v10 以上

### インストール

```bash
pnpm install
```

### よく使うコマンド

```bash
pnpm dev
pnpm build
pnpm preview:blog
pnpm ci
```

### 開発サーバーの起動

```bash
pnpm dev
```

ブログだけ起動する場合は `pnpm dev:blog` を使います。

## デプロイ

### ブログ（apps/blog）

```bash
pnpm -C apps/blog build
pnpm -C apps/blog preview
```

ブログアプリは [`apps/blog/vercel.json`](./apps/blog/vercel.json) を含む構成です。公開先に応じたデプロイ設定はこのディレクトリで管理してください。

Google Tag Manager と AdSense は `apps/blog/.env.example` を元に `NEXT_PUBLIC_*` 変数で設定します。未設定なら読み込みません。

## OSS メモ

- Issue / Pull Request ベースで公開運用しています
- コントリビューション文書と行動規範は後で整備予定です
- 用語・表記ルールは [`Glossary.md`](./Glossary.md) と [`Rules.md`](./Rules.md) を参照してください

## ライセンス

[MIT](./LICENSE)
