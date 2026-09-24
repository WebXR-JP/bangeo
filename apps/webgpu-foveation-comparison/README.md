# WebGPU foveation comparison

WebXRの`XRGPUBinding`と`XRProjectionLayer.fixedFoveation`を使うBANGEOの比較デモです。`app.js`はセッションと背景、`fish.js`はUVテクスチャ付きglTFモデルのWebGPU描画を担当します。

- `node dev-server.mjs`: デスクトップ用の案内画面プレビュー（`http://127.0.0.1:8766/`）。WebXRの実機動作は確認できません。
- `node build.mjs`: `apps/blog/public/demos/webgpu-foveation-comparison/`へ配信ファイルをコピーします。
- Blender 5.1で`blender --background --python create-mascot.py`: `.blend`、GLB、胴体テクスチャ、回転GIFを生成します。GIFはシーンのプレビューで、Questでのfoveationを記録したものではありません。

Quest Browser 150.1以降のHTTPS環境で、`immersive-vr`と`webgpu`が許可された場合にVRを開始します。コントローラーの`select`で0と1を切り替えます。実機の画質、負荷、スクリーンショットは公開前に確認してください。
