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
		description: "Meta VR Glasses向け公式WebXR開発経路。WebXRコンテストでは公開URLで作品を提出可能。新規作成: npm create @iwsdk@latest",
		repositoryUrl: "https://github.com/facebook/immersive-web-sdk",
		documentationUrl: "https://developers.meta.com/horizon/documentation/iwsdk/guides/get-started-glasses/",
	},
	{
		id: "three-js",
		name: "Three.js",
		description: "JavaScript 3D ライブラリ",
		repositoryUrl: "https://github.com/mrdoob/three.js",
		documentationUrl: "https://threejs.org/",
	},
	{
		id: "babylon-js",
		name: "Babylon.js",
		description: "フル機能の 3D エンジン",
		repositoryUrl: "https://github.com/BabylonJS/Babylon.js",
		documentationUrl: "https://doc.babylonjs.com/",
	},
	{
		id: "a-frame",
		name: "A-Frame",
		description: "WebVR フレームワーク",
		repositoryUrl: "https://github.com/aframevr/aframe",
		documentationUrl: "https://aframe.io/",
	},
	{
		id: "playcanvas",
		name: "PlayCanvas",
		description: "WebGL ゲームエンジン",
		repositoryUrl: "https://github.com/playcanvas/engine",
		documentationUrl: "https://developer.playcanvas.com/",
	},
];
