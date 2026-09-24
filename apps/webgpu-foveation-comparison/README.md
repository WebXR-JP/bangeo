# WebGPU foveation comparison

WebXRの`XRGPUBinding`と`XRProjectionLayer.fixedFoveation`を使うBANGEOの比較デモです。`index.html`で設定を選び、`minimum.html`と`maximum.html`を別々に起動します。`app.js`はWebXRセッション、`fish.js`はUVテクスチャ付きglTFモデルのWebGPU描画を担当します。

- `node dev-server.mjs`: デスクトップ用の案内画面プレビュー（`http://127.0.0.1:8766/`）。WebXRの実機動作は確認できません。
- `node build.mjs`: `apps/blog/public/demos/webgpu-foveation-comparison/`へ配信ファイルをコピーします。
- Blender 5.1で`blender --background --python create-mascot.py`: `.blend`、GLB、胴体テクスチャ、回転GIFを生成します。GIFはシーンのプレビューで、Questでのfoveationを記録したものではありません。

Quest Browser 150.1以降のHTTPS環境で、`immersive-vr`と`webgpu`が許可された場合にVRを開始します。各ページは固定値0または1で起動し、VR中のコントローラー操作では値を変えません。同心円とスクリーン固定の格子を外し、3Dモデルを視野の中央と左右に配置します。実機の画質と負荷はQuestで確認してください。
