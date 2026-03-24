# 用語集（日本語表記の統一）

このプロジェクトで使う日本語表記の統一用語集です。
**原則: 開発者が普段使っている表現を優先する。** 堅い正式訳よりも、伝わりやすさを重視します。

## 標準化・組織

| 推奨表記 | 英語/略語 | 備考 |
| --- | --- | --- |
| W3C | World Wide Web Consortium | そのまま使う。説明が必要なら「Web標準化団体」と補足 |
| ワーキンググループ | Working Group / WG | 「作業部会」は使わない |
| コミュニティグループ | Community Group / CG | |
| W3C勧告 | Recommendation / REC | 「レコメンデーション」でも可。文脈で使い分け |
| 勧告候補 | Candidate Recommendation / CR | |
| ワーキングドラフト | Working Draft / WD | 「作業草案」より自然 |
| エディターズドラフト | Editor's Draft / ED | 「編集者草案」より自然 |
| CGドラフト | CG Draft | コミュニティグループのドラフト |
| 仕様 / スペック | Specification / Spec | どちらでも可 |

## 実装・対応表記

| 推奨表記 | 英語/略語 | 備考 |
| --- | --- | --- |
| 対応 | Supported | バージョン不明だが動く場合 |
| 未対応 | Not supported | 公式に未実装と明記されている場合 |
| 未確認 | Unknown | 情報が見つからない場合 |
| 79+ | Minimum version | バージョン表記。`v`は付けない |
| オリジントライアル / OT | Origin Trial | |
| フラグ必須 | Flag | chrome://flags等で有効化が必要 |
| 実験的 / Exp | Experimental | |

## 技術・製品

| 推奨表記 | 英語 | 備考 |
| --- | --- | --- |
| WebXR | WebXR | 半角スペースなし |
| WebXR Device API | WebXR Device API | |
| VR/AR/MR | VR/AR/MR | そのまま。「仮想現実」等は説明時のみ |
| Quest Browser | Quest Browser | 製品名は英語のまま |
| Chrome / Safari | Chrome / Safari | |
| ハンドトラッキング | Hand Tracking | |
| ヒットテスト | Hit Test | |
| アンカー | Anchors | |
| 平面検出 | Plane Detection | |
| 深度センシング | Depth Sensing | |

## 一般用語

| 推奨表記 | 英語 | 備考 |
| --- | --- | --- |
| デバイス | Device | |
| ブラウザ | Browser | |
| セッション | Session | |
| フレームレート | Frame Rate | |
| レンダリング | Rendering | |
| トラッキング | Tracking | |

## 避ける表現

以下は堅すぎる・伝わりにくいので避ける：

- ❌ 作業草案 → ⭕ ワーキングドラフト
- ❌ 編集者草案 → ⭕ エディターズドラフト
- ❌ 作業部会 → ⭕ ワーキンググループ
- ❌ 規格 → ⭕ 仕様 / スペック
- ❌ 実装状況 → ⭕ 対応状況（より直感的）
