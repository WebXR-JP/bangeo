# BANGEO プロジェクトガイド

BANGEOはWebXRに関する日本語情報サイト（OSS）。`apps/blog/` が配信側のNext.jsアプリで、記事MDXとWebXRデモを配信している。

## デモ制作のデフォルト方針

ブログ記事に紐づくインタラクティブデモを追加する場合、**モードによって使うフレームワークを使い分ける**。

| モード | フレームワーク | 理由 |
| --- | --- | --- |
| **AR のみ** | **8th Wall OSS**（A-Frame 1.5.0 + XRExtras） | iPhone Safari でも動く（getUserMediaベース）。WebXR AR Module のブラウザ未対応を回避 |
| **VR のみ** | **IWSDK**（Vite + Three.js + ECS + IWER） | Meta Quest 系・PC VRが対象。IWERエミュレーターでヘッドセットなしでも確認可能 |
| **両対応** | **IWSDK** | VRをメインに両対応を兼ねる |

### モード別の呼び出しスキル

**AR の場合**

1. `8thwall-demo-scaffold` スキル（`.claude/skills/8thwall-demo-scaffold/SKILL.md`）に従って進める
2. 大きなタスクはサブエージェント `8thwall-demo-builder` に委譲できる
3. 8th Wall OSS の仕様・対応機能は `.claude/skills/8thwall-demo-scaffold/reference.md`
4. OSS版で完結する機能: Face Effects / Image Targets / Sky Effects
5. World Effects（SLAM）を使うなら配布バイナリ `xr-standalone.zip` が必要

**VR / 両対応 の場合**

1. `iwsdk-demo-scaffold` スキル（`.claude/skills/iwsdk-demo-scaffold/SKILL.md`）に従って進める
2. 大きなタスクはサブエージェント `iwsdk-demo-builder` に委譲できる
3. IWSDK の仕様は `.claude/skills/iwsdk-demo-scaffold/reference.md`（iwsdk.dev公式の要約）
4. WebXR仕様（hit-test／anchors／hand-input など）に依存するデモは、実装前に reference.md の「WebXR 仕様リンク集」から該当仕様を WebFetch で読む

### ヒアリング時の必須ステップ（モード共通）

「デモを作って」と言われたら、すぐにコードを書き始めない。必ず以下の順で要件を固め、**ユーザーから明示的な Go サインが出てから** スキャフォールドに進む。

1. 何を見せるデモか／想定するユーザー操作／対応させたいデバイス をユーザーに聞く
2. AR／VR／両対応のどれが自然かを判定し、**使うフレームワーク（8th Wall or IWSDK）を確定**する
3. AR なら使う効果（Face / Image / Sky / World）、VR なら使うWebXRモジュール を決める
4. `apps/blog/src/data/devices.ts` と `apps/blog/src/data/webxr-status.ts` を Read して、対応デバイス・対応ブラウザ・非対応環境を整理する
5. 「動くデバイス」「動かない環境」「MDX frontmatter 案」「demo-name 案」をまとめてユーザーに提示し、対応環境の合意をとる
6. デモ概要書（コンセプト／シーン構成／ユーザー操作／使う機能／完成イメージ／スコープ外）を書き出して提示し、Go サインを得る

曖昧な返答のときは Go と判断せず、引っかかっている箇所を具体的に聞き返す。

### 配信パスの規約

AR と VR で置き場所・URLパターンが違うので注意する。

| 項目 | AR（8th Wall） | VR/両対応（IWSDK） |
| --- | --- | --- |
| ソース | `apps/blog/public/demos/8thwall-<name>/demo.html` に直接配置（ビルド不要） | `apps/<name>/`（Viteプロジェクト）→ dist を public に手動コピー |
| 配信ディレクトリ | `apps/blog/public/demos/8thwall-<name>/` | `apps/blog/public/demo/<name>/` |
| 配信URL | `/demos/8thwall-<name>/demo.html`（複数形・`demo.html`） | `/demo/<name>/`（単数形・`index.html`） |
| 共通ランタイム | `public/demos/xr-standalone/`（`../xr-standalone/` で参照） | なし |
| experiments登録 | `content/experiments/8thwall-<name>.mdx` | `content/experiments/<name>.mdx` |

`/demo/`（単数、IWSDK）と `/demos/`（複数、8th Wall）を取り違えないように。

### localhost で動かすための必須設定

**IWSDK**: `vite.config.ts` に `base: './'` を必ず設定する。これが無いとビルド済み `index.html` が `/assets/xxx.js` のようなルート絶対パスを参照し、Next.jsの404に吸われてデモが真っ白になる。

**8th Wall**: 静的HTMLなのでビルド不要だが、`public/demos/xr-standalone/` に `xr.js` と `xrextras.js` が配置されていることを前提とする。無ければ [8thwall/engine](https://github.com/8thwall/engine) の `xr-standalone.zip` をダウンロードして展開する。

動作している参考実装:

- AR: `apps/blog/public/demos/8thwall-sky-effects/demo.html` 他8デモ
- VR: `apps/blog/public/demo/iwsdk-gallery/` と `apps/blog/content/experiments/iwsdk-gallery.mdx`

## スラッシュコマンド

- `/demo [テーマ]` — モード判定 → 対応スキルへ分岐して新規デモを作成

## サイトマップ優先ページ（SEO）

`apps/blog/src/app/sitemap.ts` で最優先扱いする8ページ。BANGEOのSEO上「一番勝ち」があるページで、記事・デモ・メンテ作業でも優先して扱う。

| URL | priority | 役割 |
| --- | --- | --- |
| `/` | 1.0 | トップページ |
| `/tech-articles` | 0.9 | 記事一覧 |
| `/experiments` | 0.9 | デモ一覧 |
| `/about` | 0.9 | サイト概要 |
| `/devices` | 0.9 | 対応デバイス一覧 |
| `/webxr-status` | 0.9 | ブラウザ対応状況 |
| `/events` | 0.9 | イベントウォッチ |
| `/platforms` | 0.9 | プラットフォーム一覧 |

運用ルール:

- これら8ページの内容・メタデータ・内部リンク構造を更新したときは `SITE_STRUCTURE_UPDATED` を当日に更新する
- 新規記事・デモを増やすより、まずこれら8ページの充実・最新化を優先する
- 新ページを設けるなら、この8ページの文脈（内部リンク・パンくず・frontmatter）に繋がるものを優先する
- priority を変更するときはこの表も併せて更新する

## 文章スタイル

- 絵文字は使わない（既存のMDX記事群に合わせる）
- 日付は和暦との混在を避け、MDXでは `"YYYY-MM-DD"` または `"YYYY年M月D日"` 形式で書く
- タグ・カテゴリはブログ側の既存分類を踏襲する（GUIDE / TECH / NEWS / VR / AR）
- 技術名称はWebXR仕様・メーカー公式・業界標準の公的名称を優先し、和製語（奥行き合成/代替表示/ヒット判定/ハンドトラッキング 等）は避ける。公的名称は初出で注釈を入れる。詳細は `.claude/skills/bangeo-article-authoring/reference.md` の「用語とSEO」
- 記事本文は読者向けの解説として書く。調査メモ、イベントウォッチ、PR説明、エージェント向け判断をそのまま残さず、「読者が何を理解できるか」「開発者が何を確認すべきか」に言い換える
- `回収メモ`、`BANGEO向け`、`BANGEOでの評価`、`置き場所`、`重要度`、`confidence`、`source_type`、`派生記事` のような運用・編集用語はMDX本文に入れない。必要な判断基準は `.claude/skills/bangeo-article-authoring/` に置く

## 記事制作・サムネイル

ブログ記事の作成・修正・レビューでは、`.claude/skills/bangeo-article-authoring/SKILL.md` と `reference.md` を参照する。

- BANGEOはOSSなので、記事・README・スキル・ガイドは公開される前提で書く
- 読者向けでない編集チェックやエージェント向け手順は、記事MDXではなく `.claude/skills/` に置く
- サムネイルは既存画像の雰囲気を確認し、必要ならCodex Imageで新規生成して `apps/blog/public/assets/` に保存する

## /experiments 仕様カタログとスターターコードビルダー

`/experiments` は「1行 = 1つのWebXR仕様」のカタログページ。データは `apps/blog/src/lib/webxr-spec-catalog.ts` に集約し、UIは `apps/blog/src/components/webxr-spec-list.tsx` が担う。

- セクションは「セッションモード」「モジュール」「体験スペース（Reference Spaces）」の3つ。分類は `webxr-spec-list.tsx` の `sessionIds` / `referenceSpaceIds` で行う
- 対応判定はブラウザのAPI実装有無と `isSessionSupported` による簡易チェックで、ロジックは `specChecks` にある。バッジは「対応 / 未対応」の2値のみ（「実機」等の中間状態は置かない）
- 各仕様エントリは `featureName`（`requestSession` に渡す文字列）、`description`（主語と述語が通る日常語の1行）、`whyNote`（無いと何に困るか）、`demos`（実在確認済みURLのみ）を持つ
- `demos` の `label` は提供元（WebXR Samples / Three.js / Babylon.js / A-Frame / PlayCanvas / BANGEO）。同一提供元から複数載せるときは `name` で表示名を分ける
- デモURLは掲載前に必ず実在確認する（リンク切れ厳禁）。W3C成熟度を変更したときはファイル冒頭コメントの確認日を更新する
- ページ最下部の「スターターコードを組み立てる」は、モード・機能・体験スペースの選択から `requestSession` の開始コードを生成するプレイグラウンド。未対応端末でもコードの学習が完結することを重視する

### BANGEO自前デモの制作方針（このページ起点）

**`/experiments` のカタログとスターターコードビルダーが、BANGEOのデモ体験の中心である。** 読者は「リストで仕様を調べる → ビルダーで自分の構成を組み立てる」で完結する。ここは現状で十分に機能しているので、作り替えない。

そのうえで、自前デモを増やすことは**優先タスクではない**。

- `demos` が「近日」のままの仕様を埋めることを目的化しない。空欄は空欄のままでよい
- 記事数・デモ数を増やすこと自体を目標にしない
- 「解説付きデモ記事」を新規に量産しない

自前デモを作るのは、**実機でしか確認できない挙動があり、かつ実装が本物である**場合に限る。次のいずれかに当てはまるものは作らない・残さない。

- 実際のAPIを呼ばず、Canvas 2Dなどで「それらしい絵」を描いただけのもの
- タイトルや本文が、実装が実際にやっていることより誇張されているもの（例: Depth APIを使わずに「Depthデモ」と名乗る）
- 対応端末が無く、概念プレビューにしかならないもの

デモを公開したら `webxr-spec-catalog.ts` の該当エントリに `{ label: "BANGEO", name: "…", href: "/demo/…" }` を追加する。配列の先頭に置くと一番目のボタンとして表示される。

#### 2026-08-11 の整理

実装が伴っていなかった4本（`quest-depth-projection-box` / `spatial-model-preview` / `webgpu-fallback-lab` / `room-scale-bounds-viewer`）を削除し、`/experiments` の記事は実装が本物の6本に絞った。参照していた `experiment-guides.ts` / `middleware.ts` / `seo-redirects.mjs` / `webxr-explainer` / `webxr-events.ts` / Quest Browser 146記事も併せて整理済み。同種のページを再び増やさないこと。

### 拡張ロードマップ: ビルダーからの体験開始（着手予定なし）

以下は将来的なアイデアであり、**現時点で着手すべきタスクではない**。ビルダーは現状で十分に機能している。勝手に実装を始めないこと。

1. ビルダーの構成をURLクエリで表現する（例: `/demo/starter/?mode=immersive-vr&ref=local-floor&features=hit-test,hand-tracking`）
2. IWSDKベースの汎用ランナーデモ `apps/starter`（配信は `/demo/starter/`）を作り、クエリを読んで `requestSession` を実行する。選択された各featureの動作可視化（hit-testなら面マーカー、hand-trackingなら関節表示、depth-sensingなら深度の可視化など）を同一シーンに合成する
3. feature可視化は「1機能 = 1モジュール」で追加できる構造にし、カタログと同じ増分方針を保つ
4. ランナーが動いたら、ビルダーに「この構成で体験を開始」ボタンを追加する。構成に未対応が含まれる端末ではボタンを出さず、コード学習のみとする

これで「リストで調べる → デモで試す → ビルダーで書く → 組んだ構成を体験する」が1ページから一本につながる。

## 毎日のWebXRウォッチ: イベントウォッチ更新

毎日のWebXR更新確認では、通常の仕様・ブラウザ・ライブラリ確認に加えて、BANGEOのWebXRイベントウォッチも確認する。

対象は Meta Connect、Google I/O、Apple WWDC、W3C TPAC、AWE、Chrome / Web Platform系イベント、Immersive Web WG/CG会議、Meta Quest / Horizon OS開発者イベント、Safari / WebKit / visionOS関連イベント、three.js / A-Frame / Babylon.js / PlayCanvas の公式発表イベントに加えて、日本国内のXR Kaigi、XR Kaigi Hub、XR・メタバース総合展、XR & Metaverse Fair Tokyo、∞mugen、TOKYO DIGICONX、CEATEC、Inter BEE、Tokyo Game Show、CP+、Manufacturing World、NexTech Week、Japan IT Week、AWS Summit Japan、DroidKaigi、XR Tokyo、xR Tech Tokyo、XRMTG、visionOS / Apple Developer Japan 関連イベント、国内ハッカソン・勉強会。

また、デバイスメーカーや関連企業の公式ニュース・イベント・体験会も確認する。対象は Meta Quest、Apple Vision Pro、Sony XYN / mocopi / Spatial Reality Display、Canon MREAL / EOS VR、HTC VIVE、XREAL、PICO、Shiftall、NTTコノキューデバイス MiRZA、Even Realities、Epson MOVERIO、Looking Glass、VITURE、Rokid、RayNeo、Varjo、Lenovo、Magic Leap など。

イベントについては、イベント日程、公式ページ更新、セッション一覧、登壇者、アジェンダ、ライブ配信、展示社/スポンサー一覧、デバイスメーカーの出展・製品発表、体験会、主催者プレスリリース、メーカー公式ニュース、SDK / ブラウザ / WebView / WebXR / WebGPU / OpenXR / visionOS / Quest Browser に関係する発表、発表後の公式ブログ・リリースノート・GitHub更新を確認する。ニュース記事、X、個人ブログ、イベントまとめ記事は発見用として扱い、公開本文の根拠には公式ページ・メーカー公式ニュース・主催者発表を優先する。直近30日以内のイベント、開催中イベント、開催後7日以内のイベントは重点確認する。

イベント由来の更新候補がある場合は、`/events`、`/webxr-status`、関連notes、experiments、articlesのどこを更新すべきかを明記する。出力には「イベントウォッチ更新」と「日本イベント・デバイスウォッチ更新」を追加し、各項目に `title`、`event_name`、`region`、`organizer_type`、`manufacturer_tags`、`device_tags`、`event_status`、`importance`、`confidence`、`source_type`、`source_url`、`event_date`、`published_or_updated_at`、`entity_tags`、`what_changed`、`why_it_matters`、`affected_bangeo_pages`、`recommended_action`、`draft_text_ja`、`needs_verification` を含める。WebXRに直接関係しないイベントでも、ブラウザ、WebView、WebGPU、OpenXR、空間UI、スマートグラス、MRヘッドセット、開発者向けSDK、3D Web学習に関係しそうな場合は adjacent として拾う。ただし、VRゲーム単体、行政・政策資料、営業色の強い展示、出典がない噂、SEOまとめ記事は除外する。
