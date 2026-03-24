# @bangeo/blog

Next.js と Fumadocs で構成された BANGEO のメインサイトです。

## 主要ディレクトリ

```text
apps/blog/
├── content/          # blog / experiments / podcast のMDX
├── public/           # 画像、OGP、静的デモ
├── src/app/          # Next.js App Router
├── src/components/   # UIコンポーネント
├── src/data/         # devices / libraries / platforms / webxr-status
└── src/lib/          # ナビゲーションや補助関数
```

## コマンド

```bash
pnpm dev
pnpm build
pnpm preview
pnpm lint
pnpm format
pnpm check
```

## コンテンツ運用

- 記事は `content/blog/*.mdx`
- デモは `content/experiments/*.mdx`
- ポッドキャストは `content/podcast/*.mdx`
- `draft: true` を付けたコンテンツは公開対象から除外

## 環境変数

`apps/blog/.env.example` を元に `.env.local` を作成してください。

- `NEXT_PUBLIC_GTM_ID`: Google Tag Manager を有効にする場合のみ設定
- `NEXT_PUBLIC_ADSENSE_CLIENT`: AdSense を有効にする場合のみ設定

## デプロイ

```bash
pnpm build
pnpm preview
```
