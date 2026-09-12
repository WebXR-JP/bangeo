# デモ制作

依頼されたテーマ・操作・対象端末から方式を選ぶ。すでに決まった条件は聞き直さず、実装・配置・登録・検証まで進める。対象端末や実APIの指定が両立しないなど、目的に関わる不明点だけ確認する。

| 目的 | 方式とスキル |
| --- | --- |
| カメラベースのWebAR、8th Wall既存デモ | `.claude/skills/8thwall-demo-scaffold/SKILL.md` |
| WebXR APIの実証、VR、Quest MR、IWSDK既存デモ | `.claude/skills/iwsdk-demo-scaffold/SKILL.md` |

「AR」という語だけで8th Wallを選ばない。Hit TestなどWebXR API自体を示す依頼を独自トラッキングに置き換えない。指定フレームワークがあれば尊重する。

ブラウザ対応は `apps/blog/src/data/devices.ts` と `apps/blog/src/data/webxr-status.ts` の該当箇所を参考にし、必要なAPIとバージョンを公式情報で確認する。ローカルデータだけで動作を保証しない。

実機能を実装し、未対応環境では理由を表示する。カタログの空欄を埋めるために疑似デモを量産しない。デモ追加が依頼された場合は正しい配信URLとMDX、必要な画像を揃え、カタログに該当する実証デモなら `webxr-spec-catalog.ts` の該当項目に実在するURLを登録する。

ローカルへの成果物配置と本番公開を区別する。検証は利用できる環境で最後まで行い、ヘッドセット・カメラ未確認を明示する。共通の承認境界はルートのAGENTS.mdに従う。

## 配信と登録

以下のパスはリポジトリルート基準。

| 対象 | 確認箇所 |
| --- | --- |
| MDXフィールド | `apps/blog/source.config.ts` のexperimentsSchema |
| 個別の説明ページ | `apps/blog/src/app/experiments/[slug]/page.tsx` |
| 起動先・案内 | `apps/blog/src/components/experiment-launch-panel.tsx`、`apps/blog/src/lib/experiment-guides.ts` |
| デモURLのrewrite・廃止URL | `apps/blog/src/middleware.ts`、`apps/blog/next.config.mjs`、`apps/blog/src/lib/seo-redirects.mjs` |
| WebXR仕様カタログ | `apps/blog/src/lib/webxr-spec-catalog.ts` |

MDXのtitleは必須。link、devices、frameworks、thumbnailなどは内容に合う値を設定する。実際に起動するURLはMDXだけでなくlaunchHrefの上書きも確認する。

/experimentsはMDXカード一覧ではない。WebXRデモは該当する仕様のリンクへ登録し、8th Wallは関連する記事などから導線を用意する。個別説明ページの公開状態・robotsは現行のページ実装に従う。

publicへの配置だけでディレクトリURLの配信が成立するとは限らない。index.htmlなどの実ファイル、rewrite、リンク先を組み合わせて確認し、不要なルート変更を増やさない。
