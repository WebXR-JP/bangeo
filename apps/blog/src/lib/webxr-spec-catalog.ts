/**
 * /experiments のカタログデータ。1行 = 1仕様。
 *
 * デモは仕様を検証するための従属物として扱い、
 * 公式仕様名・成熟度・仕様URLを一次情報として持つ。
 * 成熟度は W3C Immersive Web WG の公開情報で確認する（最終確認: 2026-07-04）。
 *
 * demos には実在を確認したデモページのみを載せる（URL検証日: 2026-07-04）。
 * BANGEO自前デモが公開されたら、同じ配列に label: "BANGEO" で追加する。
 */

export type SpecMaturity = "cr" | "wd" | "draft" | "vendor";

export type SpecSupport = "supported" | "unsupported" | "unknown" | "checking";

export type SpecCheckId =
	| "inline"
	| "immersive-vr"
	| "immersive-ar"
	| "bounded-floor"
	| "gamepads"
	| "hand-input"
	| "hit-test"
	| "anchors"
	| "dom-overlays"
	| "depth-sensing"
	| "mesh-detection"
	| "lighting-estimation"
	| "layers"
	| "webgpu-binding"
	| "body-tracking";

export interface SpecDemoLink {
	/** リンクの表示ラベル（提供元） */
	label:
		| "WebXR Samples"
		| "Three.js"
		| "Babylon.js"
		| "A-Frame"
		| "PlayCanvas"
		| "BANGEO";
	href: string;
}

export interface WebXRSpecEntry {
	id: SpecCheckId;
	/** requestSession に渡すモード名、または requiredFeatures / optionalFeatures に渡す機能名 */
	featureName?: string;
	/** リストの見出しに使う短い名称（機能名） */
	name: string;
	/** 公式仕様名 */
	specName: string;
	/** 仕様の一次情報URL（TR優先、未発行はEditor's Draft） */
	specUrl?: string;
	maturity: SpecMaturity;
	/** 何ができる仕様かの1行説明 */
	description: string;
	/** 仕様を動かして確かめられるデモ。空なら「近日」表示 */
	demos?: SpecDemoLink[];
	/** 解説記事（/experiments/[slug]） */
	articleSlug?: string;
}

export const maturityLabel: Record<SpecMaturity, string> = {
	cr: "W3C CR",
	wd: "W3C WD",
	draft: "Draft",
	vendor: "Vendor",
};

export const maturityTitle: Record<SpecMaturity, string> = {
	cr: "W3C Candidate Recommendation（勧告候補）",
	wd: "W3C Working Draft（作業草案）",
	draft: "Editor's Draft（TR未発行の草案）",
	vendor: "ベンダー拡張（標準仕様ではありません）",
};

const OFFICIAL_SAMPLES = "https://immersive-web.github.io/webxr-samples";
const THREEJS_EXAMPLES = "https://threejs.org/examples";
const PLAYCANVAS_DEMOS = "https://playcanv.as/p";
const PLAYCANVAS_TUTORIALS = "https://developer.playcanvas.com/tutorials";
const AFRAME_EXAMPLES = "https://aframe.io/aframe/examples";
const BABYLONJS_PLAYGROUND = "https://playground.babylonjs.com";

export const webxrSpecCatalog: WebXRSpecEntry[] = [
	{
		id: "inline",
		featureName: "inline",
		name: "inline",
		specName: "WebXR Device API",
		specUrl: "https://www.w3.org/TR/webxr/#xrsessionmode-enum",
		maturity: "cr",
		description:
			"通常のページ内のcanvasでXRの描画ループとポーズ追跡を動かすモード。没入せずに内容をプレビューできる",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/inline-session.html`,
			},
		],
	},
	{
		id: "immersive-vr",
		featureName: "immersive-vr",
		name: "immersive-vr",
		specName: "WebXR Device API",
		specUrl: "https://www.w3.org/TR/webxr/",
		maturity: "cr",
		description:
			"描画をヘッドセットのステレオ表示に切り替えるセッション。すべてのVR体験の入口になる",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/immersive-vr-session.html`,
			},
			{
				label: "Three.js",
				href: `${THREEJS_EXAMPLES}/webxr_xr_ballshooter.html`,
			},
			{ label: "PlayCanvas", href: `${PLAYCANVAS_DEMOS}/z7myUkHP/` },
			{ label: "A-Frame", href: `${AFRAME_EXAMPLES}/boilerplate/hello-world/` },
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#F41V6N#134` },
		],
	},
	{
		id: "immersive-ar",
		featureName: "immersive-ar",
		name: "immersive-ar",
		specName: "WebXR Augmented Reality Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-ar-module-1/",
		maturity: "cr",
		description:
			"カメラ映像やパススルーの上に3D描画を合成するセッション。AR系モジュールの前提になる",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/immersive-ar-session.html`,
			},
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_cones.html` },
			{ label: "PlayCanvas", href: `${PLAYCANVAS_DEMOS}/AOYF3YyG/` },
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/boilerplate/ar-hello-world/`,
			},
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#F41V6N#32` },
		],
	},
	{
		id: "bounded-floor",
		featureName: "bounded-floor",
		name: "bounded-floor",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"ユーザーが設定したプレイエリアの境界ポリゴンを座標系として取得する。ルームスケール体験で安全に歩ける範囲が分かる",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/room-scale.html` },
		],
	},
	{
		id: "gamepads",
		name: "Gamepads",
		specName: "WebXR Gamepads Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-gamepads-module-1/",
		maturity: "wd",
		description:
			"XRコントローラーのボタン・スティック入力をGamepad APIの形式で読み取る。入力ソースごとにgamepadが付与される",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/controller-state.html`,
			},
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_xr_haptics.html` },
			{ label: "PlayCanvas", href: `${PLAYCANVAS_DEMOS}/TUBZkBEl/` },
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/showcase/tracked-controls/`,
			},
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#F41V6N#134` },
		],
	},
	{
		id: "hand-input",
		featureName: "hand-tracking",
		name: "Hand Input",
		specName: "WebXR Hand Input Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-hand-input-1/",
		maturity: "wd",
		description:
			"手の25関節のポーズを毎フレーム取得する。コントローラーの代わりに素手での選択・つかみ操作を実装できる",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/immersive-hands.html`,
			},
			{
				label: "Three.js",
				href: `${THREEJS_EXAMPLES}/webxr_vr_handinput.html`,
			},
			{ label: "PlayCanvas", href: `${PLAYCANVAS_DEMOS}/VmHVW3Wb/` },
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/showcase/hand-tracking/`,
			},
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#X7Y4H8#16` },
		],
	},
	{
		id: "hit-test",
		featureName: "hit-test",
		name: "Hit Test",
		specName: "WebXR Hit Test Module",
		specUrl: "https://www.w3.org/TR/webxr-hit-test-1/",
		maturity: "wd",
		description:
			"現実の面（床・机・壁）にレイを飛ばして交点を取得する。ARでオブジェクトを現実に沿って配置する基本手段",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/hit-test.html` },
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_hittest.html` },
			{ label: "PlayCanvas", href: `${PLAYCANVAS_DEMOS}/Kjol3uRS/` },
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#F41V6N#32` },
		],
	},
	{
		id: "anchors",
		featureName: "anchors",
		name: "Anchors",
		specName: "WebXR Anchors Module",
		specUrl: "https://immersive-web.github.io/anchors/",
		maturity: "draft",
		description:
			"空間上の点をトラッキングへ追従する固定点として登録する。時間が経ってもオブジェクトの位置が現実からずれにくくなる",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/anchors.html` },
			{ label: "PlayCanvas", href: `${PLAYCANVAS_DEMOS}/Skq3Ry1K/` },
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/mixed-reality/anchor/`,
			},
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#KDWCZY` },
		],
	},
	{
		id: "dom-overlays",
		featureName: "dom-overlay",
		name: "DOM Overlays",
		specName: "WebXR DOM Overlays Module",
		specUrl: "https://www.w3.org/TR/webxr-dom-overlays-1/",
		maturity: "wd",
		description:
			"没入セッション中は通常のHTMLが見えなくなるため、指定したDOM要素をAR表示の上に合成する。UIをWebGLで描かずHTML/CSSのまま使える",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/ar-barebones.html` },
			{
				label: "PlayCanvas",
				href: `${PLAYCANVAS_TUTORIALS}/webxr-ar-dom-overlay/`,
			},
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/boilerplate/webxr-dom-overlay/`,
			},
		],
	},
	{
		id: "depth-sensing",
		featureName: "depth-sensing",
		name: "Depth Sensing",
		specName: "WebXR Depth Sensing Module",
		specUrl: "https://www.w3.org/TR/webxr-depth-sensing-1/",
		maturity: "wd",
		description:
			"カメラから見た現実の深度マップを毎フレーム取得する。仮想オブジェクトが現実の物に隠れるオクルージョン表現に使う",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/proposals/phone-ar-depth.html`,
			},
			{ label: "PlayCanvas", href: `${PLAYCANVAS_DEMOS}/UN0z1XE2/` },
		],
	},
	{
		id: "mesh-detection",
		featureName: "mesh-detection",
		name: "Mesh Detection",
		specName: "WebXR Mesh Detection Module",
		specUrl: "https://immersive-web.github.io/real-world-meshing/",
		maturity: "draft",
		description:
			"端末が空間スキャンで生成した部屋のメッシュ（壁・床・家具）を取得する。現実の形状に沿った衝突判定や配置ができる",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/proposals/mesh-detection.html`,
			},
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/mixed-reality/real-world-meshing/`,
			},
		],
	},
	{
		id: "lighting-estimation",
		featureName: "light-estimation",
		name: "Lighting Estimation",
		specName: "WebXR Lighting Estimation API Level 1",
		specUrl: "https://www.w3.org/TR/webxr-lighting-estimation-1/",
		maturity: "wd",
		description:
			"現実の環境光の強さ・向き・環境マップを推定して取得する。3Dオブジェクトの陰影を現実の光と揃えて違和感を減らす",
		demos: [
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_lighting.html` },
			{ label: "PlayCanvas", href: `${PLAYCANVAS_DEMOS}/AOYF3YyG/` },
		],
	},
	{
		id: "layers",
		featureName: "layers",
		name: "Layers",
		specName: "WebXR Layers API Level 1",
		specUrl: "https://www.w3.org/TR/webxrlayers-1/",
		maturity: "wd",
		description:
			"通常は毎フレーム1枚のWebGLへ全てを描くが、動画や文字をコンポジターへ直接渡す専用レイヤーに分離できる。再サンプリングが減り高解像度でくっきり表示される",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/layers-samples/` },
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_vr_layers.html` },
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/showcase/layer-cubemap/`,
			},
		],
	},
	{
		id: "webgpu-binding",
		featureName: "webgpu",
		name: "WebGPU Binding",
		specName: "WebXR/WebGPU Binding",
		specUrl: "https://immersive-web.github.io/WebXR-WebGPU-Binding/",
		maturity: "draft",
		description:
			"XRの描画をWebGLではなくWebGPUで行うための接続層。コンピュートシェーダーなどWebGPUの機能をXR描画に使える",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/webgpu/` },
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webgpu_xr_cubes.html` },
		],
	},
	{
		id: "body-tracking",
		featureName: "body-tracking",
		name: "Body Tracking",
		specName: "WebXR Body Tracking（ベンダー拡張）",
		maturity: "vendor",
		description:
			"ヘッドセットやトラッカーから全身の関節ポーズを取得するベンダー拡張。アバターの全身表現に使う",
		demos: [{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#0FOISU#2` }],
	},
];
