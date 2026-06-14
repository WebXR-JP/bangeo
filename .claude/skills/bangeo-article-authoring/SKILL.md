---
name: bangeo-article-authoring
description: BANGEOブログのMDX記事を作成・修正・レビューするときに使う。対象は `apps/blog/content/blog/*.mdx` のfrontmatter、本文構成、出典、サムネイル、公開リポジトリに置いてよい編集ガイドの分離、WebXR/WebGPU/PlayCanvas記事の公開前確認。「記事を書いて」「記事を直して」「サムネイルを作って」「PlayCanvas記事」「WebXRニュース」などで参照する。
metadata:
  author: bangeo-team
  version: "1.0.0"
  argument-hint: "<article-slug>"
---

# BANGEO 記事作成ガイド

BANGEO はOSSの公開リポジトリなので、記事本文・スキル・README・ガイド類はすべて公開される前提で書く。非公開情報、個人情報、未公開の内部事情、秘密の運用メモを置かない。

詳細な公開前チェックは `reference.md` を参照する。

## 基本方針

1. 既存記事を先に読む
   - `apps/blog/content/blog/*.mdx` から近いテーマの記事を確認する
   - frontmatter、見出し、出典リンク、サムネイル指定、文体を既存記事に合わせる

2. 公開記事と作業ガイドを分ける
   - MDX記事には読者に役立つ内容を書く
   - エージェント向けの再利用手順や編集チェックは `.claude/skills/` や `CLAUDE.md` に置く
   - 「BANGEOで更新すべきページ」「エージェントは次回こうする」など、読者向けでない節を記事に入れない

3. 出典を確認する
   - リリース日、ブラウザバージョン、仕様ステータス、価格、最新情報は一次情報で確認する
   - 公式リリースノート、GitHub releases/PR、標準仕様、ベンダー公式ページを優先する
   - 出典形式は既存記事に合わせる

4. サムネイルを用意する
   - まず既存サムネイルを見て、構図・色・密度を合わせる
   - 既存画像の流用で内容が伝わらない場合は、Codex Imageで新規生成する
   - 文字・透かし・商標ロゴは入れない
   - 画像は `apps/blog/public/assets/tech/` または `apps/blog/public/assets/news/` に PNG + WebP で保存し、frontmatter の `thumbnail` では WebP を優先する

5. 公開前に確認する
   - 記事にOSS公開向けでない表現が残っていないか検索する
   - `thumbnail` の参照先が実在するか確認する
   - 可能なら `pnpm -C apps/blog build` を実行する

## サムネイル生成方針

Codex Image を使う場合は、既存のBANGEOサムネイルに合わせる。詳細は `reference.md` のサムネイル節を参照する。

- 参照: `unity-webxr-build-guide` / `webxr-colocation-meta-quest`
- mint green / sky blue の丸い blob キャラ、ピンクのチーク、白 VR ヘッドセット
- 淡い mint → lavender グラデーション背景、浮遊する等角キューブ・ギア・六角形
- 文字・透かし・商標ロゴなし
- 3:2 横長。記事カードで縮小されても主題が分かる中央構図

PlayCanvas 系は公式ロゴの精密再現ではなく、オレンジのエンジンキューブ + WebGL/WebGPU/XR/HTML UI の抽象表現を使う。

配置後は `pnpm -C apps/blog run optimize:images` で最適化する。

## 記事の型

NEWS記事:
- 冒頭で何がいつ公開されたかを書く
- 開発者に関係する変更点を2-4個に絞る
- 互換性、実験機能、フォールバックの注意を書く
- 最後に実務上の見方を短くまとめる

TECH/GUIDE記事:
- 課題と対象環境を最初に書く
- 実装例は最小限にする
- 対応環境、未対応環境、フォールバックを明記する
- チェックリストは読者が使える形にする
