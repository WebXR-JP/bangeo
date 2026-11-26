export interface Library {
	id: string;
	name: string;
	description: string;
	repositoryUrl: string;
	documentationUrl: string;
}

export const LIBRARIES: Library[] = [
	{
		id: "immersive-web-sdk",
		name: "Immersive Web SDK（IWSDK）",
		description:
			"Metaが提供するWebXR向けSDKです。Meta QuestやMeta VR Glasses向けの空間UI・入力処理を備えています。2026年9月28日時点ではnpmのlatestが1.0.0-rc.2、nextが1.0.0のため、1.0.0を明示して作る場合はnpm create @iwsdk@1.0.0を使い、バージョンを固定して運用してください。",
		repositoryUrl: "https://github.com/facebook/immersive-web-sdk",
		documentationUrl:
			"https://developers.meta.com/horizon/documentation/iwsdk/guides/get-started-glasses/",
	},
	{
		id: "three-js",
		name: "Three.js",
		description:
			"JavaScript向けの代表的な3D描画ライブラリです。WebGLとWebGPUの両方に対応し、WebXRの公式サンプルや関連ツールが豊富にそろっています。",
		repositoryUrl: "https://github.com/mrdoob/three.js",
		documentationUrl: "https://threejs.org/",
	},
	{
		id: "babylon-js",
		name: "Babylon.js",
		description:
			"WebGLとWebGPUに対応した多機能な3Dエンジンです。WebXRのVR・AR・ハンドトラッキング・コントローラー処理を標準機能として組み込んでいます。",
		repositoryUrl: "https://github.com/BabylonJS/Babylon.js",
		documentationUrl: "https://doc.babylonjs.com/",
	},
	{
		id: "a-frame",
		name: "A-Frame",
		description:
			"HTMLのカスタム要素でVR/ARシーンを記述できるWebXRフレームワークです。Three.jsを土台にしており、少ないコードでプロトタイプを組み立てられます。",
		repositoryUrl: "https://github.com/aframevr/aframe",
		documentationUrl: "https://aframe.io/",
	},
	{
		id: "playcanvas",
		name: "PlayCanvas",
		description:
			"WebGLとWebGPUに対応したブラウザ向け3D・ゲームエンジンです。WebXRのVR/AR機能を備え、ブラウザ上で使えるビジュアルエディタと組み合わせて開発できます。",
		repositoryUrl: "https://github.com/playcanvas/engine",
		documentationUrl: "https://developer.playcanvas.com/",
	},
];
