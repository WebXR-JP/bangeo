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
		| "公式サンプル"
		| "Three.js"
		| "Babylon.js"
		| "A-Frame"
		| "PlayCanvas"
		| "BANGEO";
	href: string;
}

export interface WebXRSpecEntry {
	id: SpecCheckId;
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

export const webxrSpecCatalog: WebXRSpecEntry[] = [
	{
		id: "immersive-vr",
		name: "immersive-vr",
		specName: "WebXR Device API",
		specUrl: "https://www.w3.org/TR/webxr/",
		maturity: "cr",
		description: "ヘッドセットでVR表示をはじめる",
		demos: [
			{
				label: "公式サンプル",
				href: `${OFFICIAL_SAMPLES}/immersive-vr-session.html`,
			},
			{
				label: "Three.js",
				href: `${THREEJS_EXAMPLES}/webxr_xr_ballshooter.html`,
			},
		],
		articleSlug: "webxr-audio-space",
	},
	{
		id: "immersive-ar",
		name: "immersive-ar",
		specName: "WebXR Augmented Reality Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-ar-module-1/",
		maturity: "cr",
		description: "現実の風景に映像を重ねるARをはじめる",
		demos: [
			{
				label: "公式サンプル",
				href: `${OFFICIAL_SAMPLES}/immersive-ar-session.html`,
			},
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_cones.html` },
		],
		articleSlug: "hit-test-advanced",
	},
	{
		id: "bounded-floor",
		name: "bounded-floor",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description: "安全に動けるプレイエリアの境界を知る",
		demos: [
			{ label: "公式サンプル", href: `${OFFICIAL_SAMPLES}/room-scale.html` },
		],
		articleSlug: "room-scale-bounds-viewer",
	},
	{
		id: "gamepads",
		name: "Gamepads",
		specName: "WebXR Gamepads Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-gamepads-module-1/",
		maturity: "wd",
		description: "コントローラーのボタンやスティックを扱う",
		demos: [
			{
				label: "公式サンプル",
				href: `${OFFICIAL_SAMPLES}/controller-state.html`,
			},
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_xr_haptics.html` },
		],
		articleSlug: "iwsdk-gallery",
	},
	{
		id: "hand-input",
		name: "Hand Input",
		specName: "WebXR Hand Input Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-hand-input-1/",
		maturity: "wd",
		description: "コントローラーなしで手の動きを使う",
		demos: [
			{
				label: "公式サンプル",
				href: `${OFFICIAL_SAMPLES}/immersive-hands.html`,
			},
			{
				label: "Three.js",
				href: `${THREEJS_EXAMPLES}/webxr_vr_handinput.html`,
			},
		],
	},
	{
		id: "hit-test",
		name: "Hit Test",
		specName: "WebXR Hit Test Module",
		specUrl: "https://www.w3.org/TR/webxr-hit-test-1/",
		maturity: "wd",
		description: "床や机を見つけてものを置く",
		demos: [
			{ label: "公式サンプル", href: `${OFFICIAL_SAMPLES}/hit-test.html` },
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_hittest.html` },
		],
		articleSlug: "hit-test-advanced",
	},
	{
		id: "anchors",
		name: "Anchors",
		specName: "WebXR Anchors Module",
		specUrl: "https://immersive-web.github.io/anchors/",
		maturity: "draft",
		description: "置いたものの位置を現実空間に固定する",
		demos: [
			{ label: "公式サンプル", href: `${OFFICIAL_SAMPLES}/anchors.html` },
		],
	},
	{
		id: "dom-overlays",
		name: "DOM Overlays",
		specName: "WebXR DOM Overlays Module",
		specUrl: "https://www.w3.org/TR/webxr-dom-overlays-1/",
		maturity: "wd",
		description: "AR画面の上にHTMLのUIを重ねる",
	},
	{
		id: "depth-sensing",
		name: "Depth Sensing",
		specName: "WebXR Depth Sensing Module",
		specUrl: "https://www.w3.org/TR/webxr-depth-sensing-1/",
		maturity: "wd",
		description: "現実の奥行きを読み取って前後を正しく合成する",
		demos: [
			{
				label: "公式サンプル",
				href: `${OFFICIAL_SAMPLES}/proposals/phone-ar-depth.html`,
			},
		],
		articleSlug: "quest-depth-projection-box",
	},
	{
		id: "mesh-detection",
		name: "Mesh Detection",
		specName: "WebXR Mesh Detection Module",
		specUrl: "https://immersive-web.github.io/real-world-meshing/",
		maturity: "draft",
		description: "部屋の形をメッシュとして読み取る",
		demos: [
			{
				label: "公式サンプル",
				href: `${OFFICIAL_SAMPLES}/proposals/mesh-detection.html`,
			},
		],
		articleSlug: "xr-mesh-export",
	},
	{
		id: "lighting-estimation",
		name: "Lighting Estimation",
		specName: "WebXR Lighting Estimation API Level 1",
		specUrl: "https://www.w3.org/TR/webxr-lighting-estimation-1/",
		maturity: "wd",
		description: "現実の光に合わせて3Dの見た目をなじませる",
		demos: [
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_lighting.html` },
		],
	},
	{
		id: "layers",
		name: "Layers",
		specName: "WebXR Layers API Level 1",
		specUrl: "https://www.w3.org/TR/webxrlayers-1/",
		maturity: "wd",
		description: "文字や動画をくっきり表示する",
		demos: [
			{ label: "公式サンプル", href: `${OFFICIAL_SAMPLES}/layers-samples/` },
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_vr_layers.html` },
		],
	},
	{
		id: "webgpu-binding",
		name: "WebGPU Binding",
		specName: "WebXR/WebGPU Binding",
		specUrl: "https://immersive-web.github.io/WebXR-WebGPU-Binding/",
		maturity: "draft",
		description: "WebGPUでXRを描画する",
		demos: [
			{ label: "公式サンプル", href: `${OFFICIAL_SAMPLES}/webgpu/` },
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webgpu_xr_cubes.html` },
		],
		articleSlug: "webgpu-fallback-lab",
	},
	{
		id: "body-tracking",
		name: "Body Tracking",
		specName: "WebXR Body Tracking（ベンダー拡張）",
		maturity: "vendor",
		description: "全身の動きを読み取る",
		articleSlug: "webxr-body-tracking",
	},
];
