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
	| "viewer"
	| "local"
	| "local-floor"
	| "bounded-floor"
	| "unbounded"
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
			"ヘッドセットをかぶらずに、ふつうのWebページの中で3Dシーンを動かして表示するモード",
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
		description: "ヘッドセットをかぶって、視界全体をVRの世界に切り替えるモード",
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
			"デバイスのカメラで映した現実の風景に、3Dオブジェクトを重ねて表示するモード",
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
		id: "viewer",
		featureName: "viewer",
		name: "viewer",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"座標の原点が頭（視点）そのものになる。どこを向いてもオブジェクトが視界の同じ位置に居続けるので、メニューや照準の固定に使う",
	},
	{
		id: "local",
		featureName: "local",
		name: "local",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"体験を始めた瞬間の頭の位置が原点になる。床の高さは分からないので、椅子に座ったまま・立ち止まったままの体験に向く",
	},
	{
		id: "local-floor",
		featureName: "local-floor",
		name: "local-floor",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"原点が足元の床（y=0）になり、床の高さが現実と一致する。地面にものを置いたり、立って見下ろすコンテンツがつくれる",
	},
	{
		id: "bounded-floor",
		featureName: "bounded-floor",
		name: "bounded-floor",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"原点は床のままで、さらにヘッドセットに設定した「安全に歩ける範囲」の境界線が取れる。境界の中を実際に歩き回る前提のコンテンツに使う",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/room-scale.html` },
		],
	},
	{
		id: "unbounded",
		featureName: "unbounded",
		name: "unbounded",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"どこまで移動してもトラッキングが破綻しないように座標を調整し続ける空間。建物や屋外など、広い場所を歩き回るARに使う",
	},
	{
		id: "gamepads",
		name: "Gamepads",
		specName: "WebXR Gamepads Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-gamepads-module-1/",
		maturity: "wd",
		description:
			"コントローラーのボタンやスティックが、いまどう押されているかを読み取る",
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
			"デバイスのカメラで手を認識して、指の関節の位置や動きを取得する。素手での選択やつかむ操作がつくれる",
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
			"デバイスのカメラで現実の床や机を見つけて、3Dオブジェクトを置ける位置を教えてくれる",
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
			"現実の空間に目印を打ち込んで、置いたオブジェクトが時間が経ってもずれないように固定する",
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
			"XR中はふつうのHTMLが見えなくなるので、ボタンやメニューなどのHTMLをAR映像の上に重ねて表示する",
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
			"デバイスのカメラで現実の物までの距離を測って、3Dオブジェクトが現実の物の後ろに隠れる表現をつくる",
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
			"デバイスが部屋をスキャンして作った、壁・床・家具の立体データを受け取る",
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
			"デバイスのカメラで部屋の明るさや光の向きを読み取って、3Dオブジェクトの影や色を現実の光に合わせる",
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
			"動画や文字を専用のレイヤーに分けてヘッドセットに直接渡して、にじみを減らしてくっきり表示する",
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
			"XRの映像を、WebGLよりあたらしく高速なWebGPUで描けるようにする",
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
			"ヘッドセットやトラッカーで体の動きを読み取って、全身のポーズを取得する。アバターを動かすのに使う",
		demos: [{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#0FOISU#2` }],
	},
];
