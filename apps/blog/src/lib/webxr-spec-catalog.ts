/**
 * /experiments のカタログデータ。1行 = 1仕様。
 *
 * デモは仕様を検証するための従属物として扱い、
 * 公式仕様名・成熟度・仕様URLを一次情報として持つ。
 * 成熟度は W3C Immersive Web WG の公開情報で確認する（最終確認: 2026-07-04）。
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
	/** 仕様を検証できるデモ。未実装なら undefined（「近日」表示） */
	demoHref?: string;
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

export const webxrSpecCatalog: WebXRSpecEntry[] = [
	{
		id: "immersive-vr",
		name: "immersive-vr",
		specName: "WebXR Device API",
		specUrl: "https://www.w3.org/TR/webxr/",
		maturity: "cr",
		description: "VRセッションの開始",
		demoHref: "/demos/webxr-audio-space",
		articleSlug: "webxr-audio-space",
	},
	{
		id: "immersive-ar",
		name: "immersive-ar",
		specName: "WebXR Augmented Reality Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-ar-module-1/",
		maturity: "cr",
		description: "ARセッションの開始",
		demoHref: "/demos/hit-test-advanced",
		articleSlug: "hit-test-advanced",
	},
	{
		id: "bounded-floor",
		name: "bounded-floor",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description: "プレイエリア境界の取得",
		demoHref: "/demos/room-tracking",
		articleSlug: "room-scale-bounds-viewer",
	},
	{
		id: "gamepads",
		name: "Gamepads",
		specName: "WebXR Gamepads Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-gamepads-module-1/",
		maturity: "wd",
		description: "コントローラー入力",
		demoHref: "/demo/iwsdk-gallery",
		articleSlug: "iwsdk-gallery",
	},
	{
		id: "hand-input",
		name: "Hand Input",
		specName: "WebXR Hand Input Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-hand-input-1/",
		maturity: "wd",
		description: "ハンドトラッキング",
	},
	{
		id: "hit-test",
		name: "Hit Test",
		specName: "WebXR Hit Test Module",
		specUrl: "https://www.w3.org/TR/webxr-hit-test-1/",
		maturity: "wd",
		description: "面の検出と配置",
		demoHref: "/demos/hit-test-advanced",
		articleSlug: "hit-test-advanced",
	},
	{
		id: "anchors",
		name: "Anchors",
		specName: "WebXR Anchors Module",
		specUrl: "https://immersive-web.github.io/anchors/",
		maturity: "draft",
		description: "空間アンカー",
	},
	{
		id: "dom-overlays",
		name: "DOM Overlays",
		specName: "WebXR DOM Overlays Module",
		specUrl: "https://www.w3.org/TR/webxr-dom-overlays-1/",
		maturity: "wd",
		description: "XR中のHTML UI表示",
	},
	{
		id: "depth-sensing",
		name: "Depth Sensing",
		specName: "WebXR Depth Sensing Module",
		specUrl: "https://www.w3.org/TR/webxr-depth-sensing-1/",
		maturity: "wd",
		description: "深度による前後合成",
		demoHref: "/demos/quest-depth-projection-box/xr.html",
		articleSlug: "quest-depth-projection-box",
	},
	{
		id: "mesh-detection",
		name: "Mesh Detection",
		specName: "WebXR Mesh Detection Module",
		specUrl: "https://immersive-web.github.io/real-world-meshing/",
		maturity: "draft",
		description: "部屋メッシュの取得",
		demoHref: "/demo/xr-mesh-export",
		articleSlug: "xr-mesh-export",
	},
	{
		id: "lighting-estimation",
		name: "Lighting Estimation",
		specName: "WebXR Lighting Estimation API Level 1",
		specUrl: "https://www.w3.org/TR/webxr-lighting-estimation-1/",
		maturity: "wd",
		description: "照明推定",
	},
	{
		id: "layers",
		name: "Layers",
		specName: "WebXR Layers API Level 1",
		specUrl: "https://www.w3.org/TR/webxrlayers-1/",
		maturity: "wd",
		description: "高品質なレイヤー合成",
	},
	{
		id: "webgpu-binding",
		name: "WebGPU Binding",
		specName: "WebXR/WebGPU Binding",
		specUrl: "https://immersive-web.github.io/WebXR-WebGPU-Binding/",
		maturity: "draft",
		description: "WebGPUでのXR描画",
		demoHref: "/demos/webgpu-fallback-lab/xr.html",
		articleSlug: "webgpu-fallback-lab",
	},
	{
		id: "body-tracking",
		name: "Body Tracking",
		specName: "WebXR Body Tracking（ベンダー拡張）",
		maturity: "vendor",
		description: "全身トラッキング",
		demoHref: "/demos/webxr-body-tracking",
		articleSlug: "webxr-body-tracking",
	},
];
