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
		whyNote:
			"没入モードはユーザー操作がないと開始できず、始まるまで中身が見えない。inlineがあると、同じ3Dシーンを没入前にページ内で見せてから誘導でき、プレビュー用の別実装が要らなくなる",
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
		whyNote:
			"ふつうのウィンドウ描画では、左右の目それぞれの視点や頭の動きに追従した描画ができない。ヘッドセットへの直接描画と姿勢追跡をまとめて引き受けるのがこのモード",
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
		whyNote:
			"VRと違って、現実の映像との合成や現実基準の座標の扱いが必要になる。その面倒な部分をブラウザ側が引き受けてくれる",
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
		whyNote:
			"HUDや照準を普通のワールド座標に置くと、頭を動かした瞬間に視界からズレてしまう。視点に張り付く座標系が別に必要",
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
		whyNote:
			"トラッキングの原点は端末任せで、何も指定しないと開始位置すら保証されない。「開始時の頭の位置」という分かりやすい基準を保証してくれる",
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
		whyNote:
			"localでは床の高さが分からないため、地面に置いたはずのオブジェクトが浮いたり埋まったりする。床基準の原点があればy=0に置くだけで済む",
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
		whyNote:
			"歩き回る体験で、安全に動ける範囲をコンテンツ側が知らないと、壁や家具に向かわせる配置をしてしまう。境界線が取れれば範囲内に収まる設計ができる",
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
		whyNote:
			"local系の空間は原点から離れるほどトラッキング誤差が積み重なる。長距離を歩くARでは、原点自体を調整し続ける仕組みが必要になる",
	},
	{
		id: "gamepads",
		name: "Gamepads",
		specName: "WebXR Gamepads Module - Level 1",
		specUrl: "https://www.w3.org/TR/webxr-gamepads-module-1/",
		maturity: "wd",
		description:
			"コントローラーのボタンやスティックが、いまどう押されているかを読み取る",
		whyNote:
			"コントローラーのボタン配置は機種ごとにバラバラ。既存のGamepad APIと同じ形式に揃えることで、機種差を吸収して入力を読める",
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
		whyNote:
			"コントローラーを持たない・持てない場面（展示、教育など）でも操作手段が要る。手そのものを入力デバイスとして使えるようにする",
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
		whyNote:
			"カメラ映像だけでは、アプリは「そこに面があるか」を知れない。端末の空間認識の結果を借りて、現実の面の位置を教えてもらう",
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
		whyNote:
			"トラッキングは常に裏で補正されるため、固定の座標に置いた物は現実に対して少しずつ流れる。目印を端末側に追従させれば補正後もその場に留まる",
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
		whyNote:
			"XRの画面は毎フレームWebGLで描かれ、HTMLは一切表示されない。ボタン1つでもWebGLで自作するのは大変なので、HTMLをそのまま重ねる口が必要",
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
		whyNote:
			"距離情報が無いと、3Dオブジェクトは常に現実の手前に描かれてしまう。机の後ろに置いたはずの物が手前に浮いて見える、が防げる",
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
		whyNote:
			"現実の壁や家具の形が分からないと、ボールが壁で跳ね返るような現実と絡む表現がつくれない",
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
		whyNote:
			"現実は明るいのに3Dだけ暗い、影の向きが違う、といった「合成っぽさ」が出てしまう。現実の光を測って合わせると馴染む",
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
		whyNote:
			"1枚のWebGLに全部を描くと、動画や文字は一度描いてから引き伸ばされてにじむ。ヘッドセットの合成器に直接渡せば劣化しない",
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
		whyNote:
			"WebGLは設計が古く、描画負荷の高いXRでは性能の限界が近い。WebGPUで描ければ重い表現やコンピュートシェーダーが使える",
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
		whyNote:
			"頭と手の位置だけでは腰や脚の動きが分からず、アバターの下半身は推測で動かすしかない。全身の関節が取れれば実際の動きを反映できる",
		demos: [{ label: "Babylon.js", href: `${BABYLONJS_PLAYGROUND}/#0FOISU#2` }],
	},
];
