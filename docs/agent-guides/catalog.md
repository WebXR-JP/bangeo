## /experiments 仕様カタログとスターターコードビルダー

`/experiments` は「1行 = 1つのWebXR仕様」のカタログページ。データは `apps/blog/src/lib/webxr-spec-catalog.ts` に集約し、UIは `apps/blog/src/components/webxr-spec-list.tsx` が担う。

- セクションは「セッションモード」「モジュール」「体験スペース（Reference Spaces）」の3つ。分類は `webxr-spec-list.tsx` の `sessionIds` / `referenceSpaceIds` で行う
- 対応判定はブラウザのAPI実装有無と `isSessionSupported` による簡易チェックで、ロジックは `specChecks` にある。バッジは「対応 / 未対応」の2値のみ（「実機」等の中間状態は置かない）
- 各仕様エントリは `featureName`（`requestSession` に渡す文字列）、`description`（主語と述語が通る日常語の1行）、`whyNote`（無いと何に困るか）、`demos`（実在確認済みURLのみ）を持つ
- `demos` の `label` は提供元（WebXR Samples / Three.js / Babylon.js / A-Frame / PlayCanvas / BANGEO）。同一提供元から複数載せるときは `name` で表示名を分ける
- デモURLは掲載前に必ず実在確認する（リンク切れ厳禁）。W3C成熟度を変更したときはファイル冒頭コメントの確認日を更新する
- ページ最下部の「スターターコードを組み立てる」は、モード・機能・体験スペースの選択から `requestSession` の開始コードを生成するプレイグラウンド。未対応端末でもコードの学習が完結することを重視する


## 変更範囲

カタログとスターターコードビルダーを中心に、依頼された機能や不具合を改善する。デモ数を増やすことや空欄を埋めることは目標にしない。APIを呼ばない模擬表示を実機能のデモと表示しない。

旧ガイドの「ビルダーからの体験開始は未着手」は現状と一致しない。実装は `apps/blog/src/lib/webxr-starter/` と呼び出し側を確認する。履歴にある削除済みデモを指示だけで復活させない。
