# WebGPU foveation comparison

WebXRの`XRGPUBinding`と`XRProjectionLayer.fixedFoveation`を使うBANGEOの比較デモです。`index.html`で初期値を選び、`minimum.html`または`maximum.html`からVRを開始します。`app.js`はWebXRセッションと値の切り替え、`fish.js`はUVテクスチャ付きglTFモデル、`patterns.js`は高密度の背景をWebGPUで描画します。

- `node dev-server.mjs`: デスクトップ用の案内画面プレビュー（`http://127.0.0.1:8766/`）。WebXRの実機動作は確認できません。
- `node build.mjs`: `apps/blog/public/demos/webgpu-foveation-comparison/`へ配信ファイルをコピーします。
- Blender 5.1で`blender --background --python create-mascot.py`: `.blend`、GLB、胴体テクスチャ、回転GIFを生成します。GIFはシーンのプレビューで、Questでのfoveationを記録したものではありません。

Quest Browser 150.1以降のHTTPS環境で、`immersive-vr`と`webgpu`が許可された場合にVRを開始します。各ページは0または1を初期値として設定し、VR中のコントローラーのトリガーで値を切り替えます。背景には細線の格子、同心円、斜線と複数回のシェーダー計算を使い、視野の中央と端を比べられるようにします。VR内の数字とページの読取値はAPIの状態を示すもので、描画効果の証明ではありません。実機の画質と負荷はQuestで確認してください。
