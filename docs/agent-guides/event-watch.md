# WebXR・イベントウォッチ

定期ウォッチでは仕様・ブラウザ・ライブラリの更新と、国内外のXRイベント・メーカー発表を確認する。特定イベントだけの更新依頼ではその範囲を扱う。

## 確認対象

`apps/blog/src/data/webxr-events.ts` の登録項目と `apps/blog/src/data/webxr-event-focus.ts` を入口にする。直近30日以内、開催中、開催後7日以内を重点確認し、開催日だけでなくセッション・配信・公式recap・SDKやブラウザの発表を調べる。

公式ページ・主催者発表・メーカーのリリースノートを根拠にし、SNSやまとめサイトは発見用に使う。前回確認以降の差分を記録し、根拠なく確認日だけ更新しない。取得できないページは未確認とする。

## 対象の例

対象は Meta Connect、Google I/O、Apple WWDC、W3C TPAC、AWE、Chrome / Web Platform系イベント、Immersive Web WG/CG会議、Meta Quest / Horizon OS開発者イベント、Safari / WebKit / visionOS関連イベント、three.js / A-Frame / Babylon.js / PlayCanvas の公式発表イベントに加えて、日本国内のXR Kaigi、XR Kaigi Hub、XR・メタバース総合展、XR & Metaverse Fair Tokyo、∞mugen、TOKYO DIGICONX、CEATEC、Inter BEE、Tokyo Game Show、CP+、Manufacturing World、NexTech Week、Japan IT Week、AWS Summit Japan、DroidKaigi、XR Tokyo、xR Tech Tokyo、XRMTG、visionOS / Apple Developer Japan 関連イベント、国内ハッカソン・勉強会。

また、デバイスメーカーや関連企業の公式ニュース・イベント・体験会も確認する。対象は Meta Quest、Apple Vision Pro、Sony XYN / mocopi / Spatial Reality Display、Canon MREAL / EOS VR、HTC VIVE、XREAL、PICO、Shiftall、NTTコノキューデバイス MiRZA、Even Realities、Epson MOVERIO、Looking Glass、VITURE、Rokid、RayNeo、Varjo、Lenovo、Magic Leap など。

## 反映先と記録

WebXRとの直接の関係、WebGPU・OpenXR・空間UIなどの周辺技術との関係を分ける。VRゲーム単体、根拠のない噂、営業情報だけの展示、SEOまとめは対象にしない。

サイト更新では `webxr-events.ts` のWebXREventWatchItemと列挙型に従う。sourceUrl、startDate / endDate、timezone、status、lastCheckedAtなどを公式情報と照合する。JSON風の調査用フィールドをそのままTypeScriptデータに追加しない。

調査結果には、イベント名・変更点・根拠URL・開催日と発表日・技術的な関係・反映先・未確認事項を示す。日次の報告では海外を含むイベントウォッチと日本のイベント・デバイス更新を区別する。指定された出力形式があればそれを使う。

反映先は /events、対応状況、関連する記事などから選ぶ。記事本文には運用上のimportanceやconfidenceを転記せず、読者が理解できる技術情報へ書き直す。更新依頼だけで新規記事やデモの量産に広げない。
