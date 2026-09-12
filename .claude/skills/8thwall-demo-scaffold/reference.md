# 8th Wall実装リファレンス

以下のリポジトリ内パスはルート基準。対象効果に近い既存HTMLを起点にする。

## ランタイム

[配布エンジン](https://github.com/8thwall/engine)とMIT版のソースは別の配布物。配布エンジンをMITライセンスと記載しない。入手方法・含まれる効果・利用条件は配布元のREADMEとLICENSEを確認する。

BANGEOの共通ランタイム配置は `apps/blog/public/demos/xr-standalone/`。使用する `xr.js`、`xrextras.js` と関連ファイルがあるかを確認し、不足を空のファイルで埋めない。World Effectsでは必要なSLAM機能を含む配布物を使う。OSSのみの指定がある場合は目的との両立を確認する。

## 既存HTMLの参照先

| 効果 | ファイル |
| --- | --- |
| 顔への装着 | `apps/blog/public/demos/8thwall-face-glasses/demo.html` |
| 画像ターゲット | `apps/blog/public/demos/8thwall-poster-ar/demo.html` |
| 商品表示 | `apps/blog/public/demos/8thwall-product-preview/demo.html` |

HTMLのサンプルを別に複製せず、対象の読み込み順、初期化、効果コンポーネントを確認する。既存例ではA-Frame、XRExtras、xr.jsの順に読み込む。効果に応じた `data-preload-chunks`（face / image / sky / slam）と、そのランタイムが提供する機能を照合する。

## カメラと端末

カメラの許可、secure context、使用効果の対応を対象端末で確認する。PCのlocalhostでの成功は、スマートフォンからHTTPのLANアドレスへ接続した場合の成功を意味しない。端末テストには利用可能なHTTPS環境を使う。

WebXRの対応表から8th Wallの動作を推定しない。Questのpassthrough表示とWebページのカメラ画像アクセスを混同しない。

## 登録と検証

配置は [SKILL.md](SKILL.md)、MDXと導線はルートの `docs/agent-guides/demos.md` を参照する。カメラベースWebARはWebXR仕様カタログの対象外。

| 症状 | 確認する箇所 |
| --- | --- |
| xr.jsやチャンクが404 | 共通ランタイムの実ファイルと相対パス |
| カメラ映像が出ない | HTTPS、権限拒否、ブラウザ・端末の対応 |
| 効果が始まらない | 初期化エラー、使用チャンク、配布物の機能 |
| モデルが出ない | URL、読み込み完了、対象コンポーネント |

検証は使える環境で進め、対象端末がない場合は未確認と報告する。単なるHTML表示をトラッキング成功として扱わない。
