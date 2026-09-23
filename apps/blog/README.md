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
- RSS フィードは `/rss.xml` で配信し、公開済みの技術記事・デモ・ポッドキャストを更新日順に通知

## 環境変数

`apps/blog/.env.example` を元に `.env.local` を作成してください。

- `NEXT_PUBLIC_GTM_ID`: Google Tag Manager を有効にする場合のみ設定
- `NEXT_PUBLIC_ADSENSE_CLIENT`: AdSense を有効にする場合のみ設定
- `NEXT_PUBLIC_BANGEO_SITE_ANALYTICS_KEY`: 通常のサイト計測用公開キー。本番ビルドに設定し、`https://www.bangeo.net` からのアクセス時だけSDKを読み込みます。受信先は `https://bangeo-ingest.peraperapera.workers.dev` です。Analytics側でも `https://www.bangeo.net` を許可オリジンに登録してください。
- `NEXT_PUBLIC_BANGEO_ANALYTICS_KEY`: 任意の匿名実験レポート専用。通常のサイト計測には使用しません。

公開キーはビルド時に組み込まれるため、Vercel の Production 環境へ設定した後に再デプロイしてください。通常の計測は Next.js のページに適用されます。`public/demos/` の独立したHTMLには適用されません。

## デプロイ

```bash
pnpm build
pnpm preview
```
