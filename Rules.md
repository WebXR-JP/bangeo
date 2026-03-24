# 用語運用・確認ルール

## 目的
日本語表記の揺れをなくし、標準化ステータスと実装状況を事実ベースで保守できるようにする。

## 1. 用語運用
- すべてのUI/ドキュメントは `Glossary.md` の推奨表記に合わせる。
- 新しい用語が必要になったら、先に `Glossary.md` を更新してから本文に反映する。
- 同じ概念に複数表記を使わない（例: 「作業草案」は使わず「ワーキングドラフト」）。

## 2. 日本語表記ルール
- 初出は「日本語（英語/略語）」で表記し、以降は短い表記に統一する。
  - 例: 「W3C（World Wide Web Consortium）」→ 以降は「W3C」
  - 例: 「ワーキンググループ（WG）」→ 以降は「WG」
- 文体は「です・ます」を基本にする。見出しは体言止めで統一する。
- 句読点は「、。」を使う（「，．」は使わない）。
- 括弧は全角「（ ）」を使い、括弧内外に空白を入れない。
- 英数字は半角で統一し、原則として日本語との間に空白を入れない（読みやすさのための半角スペースは許容）。
- 日付は `YYYY年M月D日` の `ja-JP` 形式で統一する。
- バージョン表記は `79+` 形式を基本とし、`v` は付けない。
- 並列表記は「・」、対比は「/」で統一する（例: VR/AR）。

## 3. 標準化ステージの対応表
W3C/ED/CGの公開ステータスは、以下の5段階に対応させる。

| ステージ | 表示名 | 典型的な表記 |
| --- | --- | --- |
| 1 | アイデア/提案 | Issue/Proposal段階 |
| 2 | エディターズドラフト | Editor's Draft / CG Draft |
| 3 | ワーキングドラフト | Working Draft / Draft Standard |
| 4 | 勧告候補 | Candidate Recommendation / Candidate Standard (CR/CRD) |
| 5 | 勧告 / W3C勧告 | Recommendation (REC) |

補足: W3C TRのDraft Standard/Candidate Standardはそれぞれワーキングドラフト/勧告候補として扱う。Candidate Recommendation Snapshotは履歴情報として注記し、現行ステージの決定には使わない。Proposed Recommendation（PR）は省略される場合があるため、必要なときのみ「勧告案」として注記する。

## 4. 出典ルール
- **標準化ステージ**: W3C TR（Recommendation Track、Draft Standard/Candidate Standardを含む）と Editor's Draft / CG Draft を参照する。
- **Chrome/Android**: Chrome Platform Status を優先し、MDN BCDで裏取りする。
- **Safari**: MDN BCD を基本とする（未対応が続く場合は `未対応`）。
- **Quest**: MDN BCD（Oculus Browser）を基本とし、不明な場合は `未確認`。
- **提案段階**: `immersive-web/proposals` の Issue を参照する。

## 5. 更新・確認手順
1) 仕様URLを開き、`Status of This Document` の記載でステージを確定。
2) Chrome Platform Status と MDN BCD を確認し、対応状況を更新。
3) 版数が分からない場合は `対応`、情報が無ければ `未確認`。
4) `WEBXR_STATUS_META.lastChecked` を更新。
5) 表記が `Glossary.md` に一致しているか検索で確認。

### 確認コマンド例
```bash
rg -n "作業草案|編集者草案" apps/blog/src apps/blog/content docs
rg -n "Working Group|Community Group" apps/blog/src apps/blog/content docs
rg -n "未対応|未確認|OT|Flag|Exp" apps/blog/src/data/webxr-status.ts
rg -n "\\bv\\d" docs
```
