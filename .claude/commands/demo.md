---
description: BANGEOブログ用のWebXRデモをIWSDKベースで新規作成する。ヒアリング → Goサイン → スキャフォールド → 実装 → 配置 → experiments登録まで
argument-hint: "[テーマや demo-name の希望]"
---

# /demo — WebXRデモ新規作成

ユーザーが `/demo` を実行した。`$ARGUMENTS` が渡されている場合はテーマや demo-name の希望として扱う（空の場合は最初にコンセプトから聞く）。

**必ず `iwsdk-demo-scaffold` スキルに従って進める。** スキルは `.claude/skills/iwsdk-demo-scaffold/SKILL.md` にあり、参照ドキュメント `reference.md` と一緒に読む。

## この `/demo` コマンドで守ること

1. **ヒアリングフェーズを必ず通る** — スキャフォールドを先走らない
   - コンセプト → モード判定（AR/VR/両対応）→ 使うWebXRモジュール → 対応デバイス整理 の順
   - `apps/blog/src/data/devices.ts` と `apps/blog/src/data/webxr-status.ts` を必ず Read
2. **対応環境の確認とデモ概要書の提示を2段階で行う**
   - まず「動くデバイス／動かない環境／MDX案／demo-name案」を提示して対応環境の合意をとる
   - 続いて「コンセプト／シーン構成／ユーザー操作／WebXRモジュールの使い方／完成イメージ／スコープ外」の**デモ概要書**を提示
3. **明示的な Go サインが出るまで `npm create @iwsdk@latest` を実行しない**
   - 「Go」「OK」「進めて」など明確な承認を待つ
   - 曖昧な返答（「いいかも」「うーん」）は引っかかりを聞き返す
4. **spec依存デモ（hit-test / anchors / hand-input / depth / layers など）は、Goサイン後に該当 WebXR 仕様を WebFetch で読んでから実装に入る**
   - spec URL は `reference.md` の「WebXR 仕様リンク集」
5. **Vite設定** — `vite.config.ts` に `base: './'` を必ず追加（デモ名に依存しない相対パス固定）
6. **配置規約**
   - ソース: `apps/<demo-name>/`
   - 配信ビルド: `apps/blog/public/demo/<demo-name>/`（`dist` の中身をコピー）
   - 登録MDX: `apps/blog/content/experiments/<demo-name>.mdx`
7. **絵文字は使わない**（BANGEOのMDXスタイルに合わせる）

## 最初に返す応答のテンプレート

引数 `$ARGUMENTS` の有無で分岐する。

### 引数なしの場合

> `/demo` を受け付けました。IWSDK ベースで WebXR デモを作ります。
>
> まず、どんなデモを作りたいか教えてください。
>
> - どんな体験を見せたいか（一言で）
> - 想定するユーザー操作（コントローラー／ハンド／タップ／視線など）
> - 参考にしたいデモや記事があれば

### 引数ありの場合

引数をそのままテーマ／demo-name 候補として解釈し、モード判定とデバイス対応確認から入る。例:

> `/demo $ARGUMENTS` を受け付けました。テーマから推測すると **[AR / VR / 両対応]** のデモになりそうです。
>
> `apps/blog/src/data/devices.ts` と `apps/blog/src/data/webxr-status.ts` を確認して、対応デバイスとMDX案を整理します。

（続けて Read → 対応環境確認 → デモ概要書 → Goサイン の流れに進む）

## 完了条件

以下が満たされた状態で「完了」と報告する。

- [ ] `apps/<demo-name>/` に IWSDK プロジェクトが作成されている
- [ ] `vite.config.ts` に `base: './'` が入っている
- [ ] `apps/blog/public/demo/<demo-name>/` に dist がコピーされている
- [ ] `apps/blog/public/demo/<demo-name>/index.html` が相対パス（`./assets/...`）になっている
- [ ] `apps/blog/content/experiments/<demo-name>.mdx` が登録されている
- [ ] `http://localhost:3000/demo/<demo-name>/` と `/experiments/<demo-name>` で動作確認済み

未確認項目があれば、その旨をユーザーに明示して報告する。
