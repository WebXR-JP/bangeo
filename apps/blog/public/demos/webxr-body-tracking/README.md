# WebXR Body Tracking Sample

WebXR Body Tracking proposal の `body-tracking` feature を使って、全身トラッキング関節を WebGL で点と線として表示する最小サンプルです。PICO Browser / PICO Web App など、proposal に対応したWebXR環境での検証を想定しています。

## 使い方

1. このフォルダを HTTPS で配信します。
2. 対応するWebXRブラウザから `index.html` を開きます。
3. `対応チェック` を押して `immersive-vr` / `immersive-ar` を確認します。
4. `XR開始` を押します。

`navigator.xr.requestSession()` では次の feature を要求しています。

```js
await navigator.xr.requestSession("immersive-vr", {
  requiredFeatures: ["local-floor", "body-tracking"],
  optionalFeatures: ["hand-tracking"],
});
```

各フレームでは、`frame.body` の `XRBodySpace` を `frame.getPose(bodySpace, referenceSpace)` に渡して関節位置を取得します。

```js
for (const jointName of JOINTS) {
  const bodySpace = frame.body.get(jointName);
  const pose = frame.getPose(bodySpace, referenceSpace);
  console.log(jointName, pose.transform.position);
}
```

## 注意

- WebXR は secure context が必要なので、実機で開く URL は HTTPS にしてください。
- `body-tracking` は experimental proposal です。PICO OS / Browser のバージョン、対象デバイス、Motion Tracker の設定状態によって `requestSession()` が失敗したり、`frame.body` が `null` になることがあります。
- `immersive-vr` でまず確認し、MR パススルーが必要な場合だけ `immersive-ar` を試すのがおすすめです。
