# 8th Wall ランタイム配布物 — 著作権・ライセンス表示

このディレクトリは BANGEO ブログの `/demos/8thwall-*/` デモが共通で利用する 8th Wall AR ランタイムの配布物です。
構成要素はそれぞれ別個のライセンスで配布されており、改変はしていません（原状のまま配布）。

## 含まれるソフトウェアと帰属

### 1. 8th Wall Engine (`xr.js`, `xr-face.js`, `xr-slam.js`, `resources/` のうちエンジン配布物)

- Copyright © 2026 Niantic Spatial, Inc. All rights reserved.
- 作成者: Niantic Spatial, Inc.
- ライセンス: XR Engine License Agreement (限定利用・proprietary)
- ライセンス本文: `./LICENSE-xr-engine.txt`
- 取得元: https://github.com/8thwall/engine のリポジトリ直下 `xr-standalone.zip`
- 利用条件: 原形でのみ再配布可。改変・リバースエンジニアリング・派生物作成は禁止。
- 免責: 本ソフトウェアは "AS IS" で提供され、Niantic Spatial は一切の保証を行いません。
  詳細は `./LICENSE-xr-engine.txt` の DISCLAIMERS (§4) および LIMITATION ON LIABILITY (§6) を参照してください。

### 2. @8thwall/xrextras (`xrextras.js`, `resources/` のうちハッシュ付きアセット)

- Copyright © 2026 Niantic Spatial, Inc.
- 作成者: 8th Wall Team (Niantic Spatial, Inc.)
- ライセンス: MIT License
- ライセンス本文: `./LICENSE-xrextras.txt`
- 取得元: https://github.com/8thwall/8thwall の `packages/xrextras` をソースから webpack でビルドしたもの
- 備考: ビルドスクリプト `npm run build` による成果物 `dist/xrextras.js` と `dist/resources/` を未改変でそのまま配置しています。

## BANGEO 側の扱い

- このディレクトリ以下のファイルは `apps/blog/public/demos/8thwall-*/demo.html` から `../xr-standalone/xr.js` と `../xr-standalone/xrextras.js` として参照されます。
- BANGEO は非営利の情報ブログで、AR 機能そのものを課金対象にしていません。XR Engine License Agreement §1.2 の "value derives, entirely or substantially, from the functionality of the Software" に該当する商用利用はしていません。
- 本ディレクトリを更新する場合は、上記2点の取得元から最新版を取得し、改変せずに配置し直してください。
