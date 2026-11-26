/**
 * /experiments のカタログデータ。1行 = 1仕様。
 *
 * デモは仕様を検証するための従属物として扱い、
 * 公式仕様名・成熟度・仕様URLを一次情報として持つ。
 * 成熟度は W3C Immersive Web WG の公開情報で確認する（最終確認: 2026-07-04）。
 *
 * demos には実在を確認したデモページのみを載せる（URL検証日: 2026-07-05。PlayCanvasは playcanvas.vercel.app のエンジンexamplesを使う）。
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
	/** ボタンに表示する名前（省略時は label を表示） */
	name?: string;
	/** リンクの提供元 */
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
	/** なぜこの仕様が必要か（無いと何に困るか） */
	whyNote?: string;
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
	wd: "W3C Working Draft（ワーキングドラフト）",
	draft: "Editor's Draft（TR未発行の草案）",
	vendor: "ベンダー拡張（標準仕様ではありません）",
};

const OFFICIAL_SAMPLES = "https://immersive-web.github.io/webxr-samples";
const THREEJS_EXAMPLES = "https://threejs.org/examples";
const PLAYCANVAS_EXAMPLES = "https://playcanvas.vercel.app/#/xr";
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
			"ヘッドセットをかぶらずに、通常のWebページ内で3Dシーンを表示するモードです。",
		whyNote:
			"没入モードはユーザー操作がないと開始できず、始まるまで中身が見えません。inlineを使うと、同じ3Dシーンを没入前にページ内で見せてから誘導でき、プレビュー用の別実装が不要になります。",
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
			"ヘッドセットをかぶり、視界全体をVR空間へ切り替えるモードです。",
		whyNote:
			"通常のウィンドウ描画では、左右それぞれの目への立体表示や頭の動きへの追従ができません。ヘッドセットへの描画と姿勢追跡をまとめて扱うのがこのモードです。",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/immersive-vr-session.html`,
			},
			{
				label: "Three.js",
				href: `${THREEJS_EXAMPLES}/webxr_xr_ballshooter.html`,
			},
			{ label: "PlayCanvas", href: `${PLAYCANVAS_EXAMPLES}/vr-basic` },
			{ label: "A-Frame", href: `${AFRAME_EXAMPLES}/boilerplate/hello-world/` },
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#9K3MRA#1` },
			{
				name: "360 Stereo Photos",
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/360-photos.html`,
			},
			{
				name: "Stereo Video",
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/stereo-video.html`,
			},
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
			"カメラで映した現実の風景に、3Dオブジェクトを重ねて表示するモードです。",
		whyNote:
			"VRとは異なり、現実の映像との合成や現実空間を基準にした座標管理が必要です。その処理をブラウザ側が担ってくれます。",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/immersive-ar-session.html`,
			},
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_cones.html` },
			{ label: "PlayCanvas", href: `${PLAYCANVAS_EXAMPLES}/ar-basic` },
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
			"頭（視点）そのものを座標の原点にします。どこを向いても視界の同じ位置に留まるため、メニューや照準の固定に使います。",
		whyNote:
			"HUDや照準を通常のワールド座標に置くと、頭を動かした瞬間に視界から外れてしまいます。視点に追従する座標系が別に必要です。",
	},
	{
		id: "local",
		featureName: "local",
		name: "local",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"体験を始めた瞬間の頭の位置を原点にします。床の高さは取得しないため、座ったままや立ち止まったままの体験に向いています。",
		whyNote:
			"トラッキングの原点は端末によって異なり、何も指定しないと開始位置すら定まりません。開始時の頭の位置を基準として扱えるようにします。",
	},
	{
		id: "local-floor",
		featureName: "local-floor",
		name: "local-floor",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"足元の床（y=0）を原点とし、床の高さを現実と一致させます。地面に物を置いたり、立って見下ろしたりするコンテンツに使います。",
		whyNote:
			"localでは床の高さが分からないため、地面に置いたつもりのオブジェクトが浮いたり埋まったりします。床を基準にできればy=0に配置するだけで済みます。",
	},
	{
		id: "bounded-floor",
		featureName: "bounded-floor",
		name: "bounded-floor",
		specName: "WebXR Device API（Reference Spaces）",
		specUrl: "https://www.w3.org/TR/webxr/#xrreferencespace",
		maturity: "cr",
		description:
			"床を原点にしつつ、ヘッドセットに設定された安全に歩ける範囲の境界線を取得できます。室内を歩き回るコンテンツに使います。",
		whyNote:
			"歩き回る体験で安全範囲を把握できないと、壁や家具の先にオブジェクトを置いてしまう恐れがあります。境界線を取得すれば範囲内に収まる配置ができます。",
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
			"大きく移動してもトラッキングが破綻しないよう座標を調整し続ける空間です。建物内や屋外など広い場所を歩くARに使います。",
		whyNote:
			"local系の空間では原点から離れるほどトラッキング誤差が積み重なります。長距離を移動するARでは、原点側を調整し続ける仕組みが必要です。",
	},
	{
		id: "gamepads",
		name: "Gamepads",
		specName: "WebXR Gamepads Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-gamepads-module-1/",
		maturity: "wd",
		description:
			"コントローラーのボタンやスティックの入力状態を読み取る仕様です。",
		whyNote:
			"コントローラーのボタン配置は機種ごとに異なります。既存のGamepad APIと同じ形式で受け取れるようにすることで、機種差を吸収できます。",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/controller-state.html`,
			},
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_xr_haptics.html` },
			{ label: "PlayCanvas", href: `${PLAYCANVAS_EXAMPLES}/vr-controllers` },
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/showcase/tracked-controls/`,
			},
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#28EKWI#37` },
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
			"カメラで手を認識し、指の関節の位置や動きを取得する仕様です。素手での選択やつかむ操作を実装できます。",
		whyNote:
			"展示や教育など、コントローラーを持たない場面でも操作手段が必要です。手そのものを入力として扱えるようにします。",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/immersive-hands.html`,
			},
			{
				label: "Three.js",
				href: `${THREEJS_EXAMPLES}/webxr_vr_handinput.html`,
			},
			{ label: "PlayCanvas", href: `${PLAYCANVAS_EXAMPLES}/xr-hands` },
			{
				label: "A-Frame",
				href: `${AFRAME_EXAMPLES}/showcase/hand-tracking/`,
			},
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
			"現実の床や机の面を検出し、3Dオブジェクトを置ける位置を取得する仕様です。",
		whyNote:
			"カメラ映像だけでは、アプリ側でそこに平面があるか判断できません。端末の空間認識の結果を使って、現実の面の位置を取得します。",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/hit-test.html` },
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_hittest.html` },
			{ label: "PlayCanvas", href: `${PLAYCANVAS_EXAMPLES}/ar-hit-test` },
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#XWBES1` },
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
			"現実空間に基準点（アンカー）を置き、配置したオブジェクトが時間経過でずれないよう固定する仕様です。",
		whyNote:
			"端末のトラッキングは裏側で絶えず補正されるため、固定座標に置いたオブジェクトは少しずつ現実とずれていきます。アンカーを端末側に追従させることで位置を保てます。",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/anchors.html` },
			{
				label: "PlayCanvas",
				href: `${PLAYCANVAS_EXAMPLES}/ar-hit-test-anchors`,
			},
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
			"AR映像の上にボタンやメニューなどのHTML要素を重ねて表示する仕様です。",
		whyNote:
			"通常の没入セッション中はWebGLなどの描画だけが表示され、HTMLは見えなくなります。ボタンやフォームを3D描画で作り直さずに済むよう、HTMLをそのまま重ねる仕組みです。",
		demos: [
			{ label: "WebXR Samples", href: `${OFFICIAL_SAMPLES}/ar-barebones.html` },
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
			"現実の物体までの距離（深度）を取得し、3Dオブジェクトが現実の物の後ろに隠れる表現を作る仕様です。",
		whyNote:
			"距離情報が無いと3Dオブジェクトは常に現実の手前に描かれてしまいます。深度データを使えば、机の後ろに置いた物が手前に浮いて見える違和感を防げます。",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/proposals/phone-ar-depth.html`,
			},
			{ label: "PlayCanvas", href: `${PLAYCANVAS_EXAMPLES}/ar-camera-depth` },
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#KDWCZY#601` },
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
			"デバイスが部屋をスキャンして生成した、壁・床・家具の立体メッシュを受け取る仕様です。",
		whyNote:
			"現実の壁や家具の形が分からないと、ボールが壁で跳ね返るような現実空間と連動した表現を作れません。",
		demos: [
			{
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/proposals/mesh-detection.html`,
			},
			{
				label: "PlayCanvas",
				href: `${PLAYCANVAS_EXAMPLES}/ar-mesh-detection`,
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
			"部屋の明るさや光の向きを推定して取得し、3Dオブジェクトの影や色味を現実の光に合わせる仕様です。",
		whyNote:
			"現実の明るさや影の向きと3D描画が合っていないと、浮いた合成のように見えます。周囲の光を推定して反映すると現実になじみやすくなります。",
		demos: [
			{ label: "Three.js", href: `${THREEJS_EXAMPLES}/webxr_ar_lighting.html` },
			{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#NAZYHG#5` },
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
			"動画や文字を専用のレイヤーに分けてヘッドセットへ直接渡し、にじみを抑えてくっきり表示する仕様です。",
		whyNote:
			"1枚のWebGLテクスチャにすべてを描くと、文字や動画が再サンプリングされてにじみやすくなります。ヘッドセットのコンポジターに直接渡すことで画質の劣化を抑えられます。",
		demos: [
			{
				name: "Quad Layer",
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/layers-samples/quad-layer.html`,
			},
			{
				name: "Cylinder Layer",
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/layers-samples/cyld-layer.html`,
			},
			{
				name: "Media Layer",
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/layers-samples/media-layer-sample.html`,
			},
			{
				name: "Equirect Video",
				label: "WebXR Samples",
				href: `${OFFICIAL_SAMPLES}/layers-samples/eqrt-video.html`,
			},
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
			"WebGPUで描いた映像をWebXRセッションへ出力するための連携仕様です。",
		whyNote:
			"WebGPUにはコンピュートシェーダーなどWebGLにはない機能があります。それらをXR描画でも使えるようにする接続層です。",
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
			"ヘッドセットやトラッカーで体の動きを読み取り、全身の姿勢を取得する拡張機能です。アバターの動作反映に使います。",
		whyNote:
			"頭と手の位置だけでは腰や脚の動きが分からず、アバターの下半身は推測で補うしかありません。全身の関節を取得できれば実際の動きをそのまま反映できます。",
	},
];
