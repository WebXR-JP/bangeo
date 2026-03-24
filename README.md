# BANGEO（バンオ）

WebXR・VR/AR に関する日本語リソースサイトです。

**サイト**: [https://bangeo.net](https://bangeo.net)

## リポジトリ構成

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

- [Node.js](https://nodejs.org/) v20.9 以上
- [pnpm](https://pnpm.io/) v10 以上

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

## デプロイ

```bash
pnpm -C apps/blog build
pnpm -C apps/blog preview
```

用語・表記ルールは [`Glossary.md`](./Glossary.md) と [`Rules.md`](./Rules.md) を参照してください。

## ライセンス

[MIT](./LICENSE)
