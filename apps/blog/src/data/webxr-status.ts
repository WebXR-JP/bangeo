export type Stage = 1 | 2 | 3 | 4 | 5;

export type BrowserKey = "chromeDesktop" | "chromeAndroid" | "quest" | "safari";

export type WebXRCategory = "Core" | "AR" | "Input" | "Rendering" | "Session";

export interface BrowserSupport {
	chromeDesktop: string;
	chromeAndroid: string;
	quest: string;
	safari: string;
}

export interface WebXRFeature {
	name: string;
	stage: Stage;
	category: WebXRCategory;
	support: BrowserSupport;
	description: string;
	specUrl?: string;
}

export interface WebXRSpecUpdate {
	specName: string;
	publishedAt: string;
	docType: string;
	specUrl: string;
	summary: string;
	changes: string[];
}

export type WebXRWgDiscussionStatus = "議論中" | "追跡中";

export interface WebXRWgDiscussion {
	title: string;
	publishedAt: string;
	status: WebXRWgDiscussionStatus;
	sourceUrl: string;
	issueUrl?: string;
	summary: string;
	topics: string[];
	relatedFeatures: string[];
	articleCandidate: boolean;
}

export interface StageInfo {
	id: Stage;
	name: string;
	desc: string;
	barClass: string;
	badgeClass: string;
	circleClass: string;
}

export const WEBXR_BROWSER_COLUMNS: Array<{ key: BrowserKey; label: string }> =
	[
		{ key: "chromeDesktop", label: "Chrome（デスクトップ）" },
		{ key: "chromeAndroid", label: "Chrome（Android）" },
		{ key: "quest", label: "Quest Browser" },
		{ key: "safari", label: "Safari（iOS/macOS）" },
	];

export const WEBXR_SPEC_UPDATES: WebXRSpecUpdate[] = [
	{
		specName: "WebXR Device API",
		publishedAt: "2026-06-09",
		docType: "勧告候補草案（CRD）",
		specUrl: "https://www.w3.org/TR/2026/CRD-webxr-20260609/",
		summary:
			"WebXR Device API は W3C Recommendation を目指している段階の Candidate Recommendation Draft です。実装状況を確認しながら利用する必要があります。",
		changes: [
			"inline-stereo session features の追加",
			"XRSession の granted features（enabledFeatures）の公開",
			"isSystemKeyboardSupported による system keyboard 対応の確認",
			"visible-blurred 時の getPose() 挙動の整理",
			"transient intent / transient-pointer 入力の追加",
			"XRInputSource の visible elsewhere プロパティ（初稿）",
			"RGB / sRGB の色空間に関する記述の明確化",
		],
	},
];

export const WEBXR_WG_DISCUSSIONS: WebXRWgDiscussion[] = [
	{
		title: "WebXR integration with HTML-in-canvas",
		publishedAt: "2026-05-19",
		status: "議論中",
		sourceUrl: "https://www.w3.org/2026/05/19-immersive-web-minutes.html",
		issueUrl: "https://github.com/immersive-web/webxr/issues/1414",
		summary:
			"Immersive Web F2F Day 1 では、HTML-in-canvas を WebXR の空間UIに応用できるかが議論されました。DOMをそのままXR空間に置くというより、canvas・texture・layer・入力イベントをどう接続するかが焦点です。",
		topics: [
			"HTML-in-canvas の canvas 子要素配置と 3D CSS transform による DOM 表示",
			"WebXR 固有の入力（target ray、teleportation、ユーザーエージェント提供のカーソル）",
			"2D quad layer への raycast と x/y 座標マッピング（「html on a ball」は当面対象外）",
			"layers を使わず CSS transform で quad を表現する案との比較",
			"HTML-in-canvas 側との追加ミーティング（action item）",
		],
		relatedFeatures: ["WebXR DOM Overlays Module", "WebXR Layers API Level 1"],
		articleCandidate: true,
	},
	{
		title: "How can we expose foveation?",
		publishedAt: "2026-05-19",
		status: "追跡中",
		sourceUrl: "https://www.w3.org/2026/05/19-immersive-web-minutes.html",
		issueUrl: "https://github.com/immersive-web/webxr/issues/32",
		summary:
			"WebXR の foveation 議論では、WebGPU や variable-rate shading との関係に加え、視線情報を扱うことによるプライバシー面が重要な論点になっています。当面は fixed foveated rendering のような形から検討される可能性があります。",
		topics: [
			"WebGPU / variable-rate shading（gpuweb/gpuweb#450）との連携",
			"foveation map texture の expose と readback 制限",
			"eye-tracked foveation の privacy リスク（視線データ漏洩の懸念）",
			"まず fixed foveated rendering を優先し、eye-tracked は別 extension の可能性",
			"onFoveationChange など将来の dynamic foveation 向けフック",
		],
		relatedFeatures: [
			"WebXR Device API",
			"WebXR/WebGPU Binding Module - Level 1",
		],
		articleCandidate: false,
	},
	{
		title: "Add attribute/setter for opacity",
		publishedAt: "2026-05-20",
		status: "議論中",
		sourceUrl: "https://www.w3.org/2026/05/20-immersive-web-minutes.html",
		issueUrl: "https://github.com/immersive-web/webxr-ar-module/issues/93",
		summary:
			"ARグラスでは、現実背景をどの程度暗く見せるかをWebXR側から制御したい場面があります。Immersive Webでは、opacity / dimming のような制御をどこまでWebに許すかが議論されています。",
		topics: [
			"additive display（Android XR AR グラス等）向けの dimming 需要",
			"feature detect（非対応デバイスでは無効）",
			"updateRenderState 経由の opacity getter/setter 案",
			"UA による clamp / ignore（要求値と実際の見え方の差）",
			"数値 range の future-proof 化（デバイス間で同じ値が同程度の効果）",
		],
		relatedFeatures: ["WebXR Augmented Reality Module - Level 1"],
		articleCandidate: false,
	},
];

export const WEBXR_STATUS_META = {
	lastChecked: "2026年6月11日",
	sources: {
		standards: "https://www.w3.org/TR/?filter-tr-name=webxr",
		docTypes: "https://www.w3.org/TR/tr/",
		proposals: "https://github.com/immersive-web/proposals/issues",
		chromeStatus: "https://chromestatus.com/features?q=webxr",
		mdnBcd: "https://github.com/mdn/browser-compat-data",
	},
};

export const WEBXR_STAGES: StageInfo[] = [
	{
		id: 1,
		name: "アイデア",
		desc: "Idea",
		barClass: "bg-gray-300",
		badgeClass: "bg-gray-300",
		circleClass: "bg-gray-300 text-gray-950",
	},
	{
		id: 2,
		name: "エディターズドラフト",
		desc: "ED/CG",
		barClass: "bg-slate-300",
		badgeClass: "bg-slate-300",
		circleClass: "bg-slate-300 text-gray-950",
	},
	{
		id: 3,
		name: "ワーキングドラフト",
		desc: "WD/DS",
		barClass: "bg-red-600",
		badgeClass: "bg-red-600 text-white",
		circleClass: "bg-red-600 text-gray-950",
	},
	{
		id: 4,
		name: "勧告候補",
		desc: "CRD/CR/CS",
		barClass: "bg-emerald-300",
		badgeClass: "bg-emerald-300",
		circleClass: "bg-emerald-300 text-gray-950",
	},
	{
		id: 5,
		name: "勧告",
		desc: "REC",
		barClass: "bg-emerald-400",
		badgeClass: "bg-emerald-400",
		circleClass: "bg-emerald-400 text-gray-950",
	},
];

export const WEBXR_STAGE_BY_ID = WEBXR_STAGES.reduce(
	(acc, stage) => {
		acc[stage.id] = stage;
		return acc;
	},
	{} as Record<Stage, StageInfo>,
);

export const WEBXR_FEATURES: WebXRFeature[] = [
	{
		name: "WebXR Device API",
		stage: 4,
		category: "Core",
		support: {
			chromeDesktop: "79+",
			chromeAndroid: "79+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"W3C の勧告候補草案（CRD、2026-06-09）。VR/AR デバイスのセンサーやヘッドマウントディスプレイへのアクセス方法を定める中核仕様です。W3C Recommendation ではなく、実装とテストを通じて勧告に向けた確認段階にあります。",
		specUrl: "https://www.w3.org/TR/2026/CRD-webxr-20260609/",
	},
	{
		name: "WebXR Augmented Reality Module - Level 1",
		stage: 4,
		category: "Core",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "81+",
			quest: "未確認",
			safari: "未対応",
		},
		description:
			"W3C の勧告候補草案（2025-04-25）。WebXR Device API に AR 向けの機能を追加する拡張仕様です。WG では additive display 向けの opacity / dimming 制御も議論中です（仕様未確定）。",
		specUrl: "https://www.w3.org/TR/webxr-ar-module-1/",
	},
	{
		name: "WebXR Gamepads Module - Level 1",
		stage: 3,
		category: "Input",
		support: {
			chromeDesktop: "79+",
			chromeAndroid: "79+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"W3C のワーキングドラフト（2025-07-07）。XR コントローラーのボタン、トリガー、スティックなどの入力を扱う仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-gamepads-module-1/",
	},
	{
		name: "WebXR Hit Test Module",
		stage: 3,
		category: "AR",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "81+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"W3C のワーキングドラフト（2025-12-11）。現実空間の平面や実在物に対してヒットテストを行う方法を定める仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-hit-test-1/",
	},
	{
		name: "WebXR DOM Overlays Module",
		stage: 3,
		category: "AR",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "83+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"W3C のワーキングドラフト（2024-09-24）。没入型セッション中に単一の DOM 要素を 2D オーバーレイとして重ねて表示する仕組みを定める仕様です。WG では HTML-in-canvas との統合も議論中です（仕様未確定）。",
		specUrl: "https://www.w3.org/TR/webxr-dom-overlays-1/",
	},
	{
		name: "WebXR Layers API Level 1",
		stage: 3,
		category: "Rendering",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "未対応",
			quest: "未確認",
			safari: "未対応",
		},
		description:
			"W3C のワーキングドラフト（2026-06-01）。コンポジターが管理するレイヤーを使い、描画効率や視認性、遅延の改善を目指す仕様です。Space Warp（space-warp）の記述も更新されています。",
		specUrl: "https://www.w3.org/TR/webxrlayers-1/",
	},
	{
		name: "Anchors",
		stage: 2,
		category: "AR",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "79+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"エディターズドラフト（2025-12-11）。空間内に基準点となるアンカーを作成し、オブジェクトの位置を安定して固定するための仕様です。",
		specUrl: "https://immersive-web.github.io/anchors/",
	},
	{
		name: "WebXR Lighting Estimation API Level 1",
		stage: 3,
		category: "AR",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "90+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"W3C のワーキングドラフト（2025-12-11）。周囲の明るさや光の色の推定値を取得し、XR 表現に反映するための仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-lighting-estimation-1/",
	},
	{
		name: "WebXR Hand Input Module - Level 1",
		stage: 3,
		category: "Input",
		support: {
			chromeDesktop: "131+",
			chromeAndroid: "131+",
			quest: "15.1+",
			safari: "未対応",
		},
		description:
			"W3C のワーキングドラフト（2024-06-05）。手や指の関節位置を追跡し、ハンドトラッキング入力を扱えるようにする仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-hand-input-1/",
	},
	{
		name: "WebXR/WebGPU Binding Module - Level 1",
		stage: 2,
		category: "Rendering",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "未対応",
			quest: "未確認",
			safari: "未対応",
		},
		description:
			"エディターズドラフト（2025-04-09）。WebGPU を使って WebXR セッションに描画するための連携方法を定める仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-webgpu-binding-1/",
	},
	{
		name: "WebXR Depth Sensing Module",
		stage: 3,
		category: "AR",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "90+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"W3C のワーキングドラフト（2025-12-10）。深度情報を取得し、オクルージョンなどの表現に活用するための仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-depth-sensing-1/",
	},
	{
		name: "Plane Detection",
		stage: 2,
		category: "AR",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "77+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"Community Group の草案（2025-12-10）。デバイスが検出した床や壁などの平面情報を取得するための拡張仕様です。",
		specUrl: "https://immersive-web.github.io/plane-detection/",
	},
	{
		name: "Mesh Detection",
		stage: 2,
		category: "AR",
		support: {
			chromeDesktop: "未確認",
			chromeAndroid: "未確認",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"Community Group の草案（2023-08-08）。周囲の環境メッシュを取得し、遮蔽や衝突判定に使うための拡張仕様です。",
		specUrl: "https://github.com/immersive-web/real-world-meshing/",
	},
	{
		name: "Raw Camera Access",
		stage: 2,
		category: "AR",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "107+",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"Community Group の草案（2025-12-11）。immersive-ar セッション中の背面カメラ映像へ直接アクセスするための拡張仕様です。",
		specUrl: "https://immersive-web.github.io/raw-camera-access/",
	},
	{
		name: "Navigation",
		stage: 2,
		category: "Session",
		support: {
			chromeDesktop: "未確認",
			chromeAndroid: "未確認",
			quest: "未確認",
			safari: "未対応",
		},
		description:
			"設計文書ベースの提案です。ユーザーエージェント主導で没入セッションを許可し、`sessiongranted` などを通じてシームレスな遷移を目指しています。",
		specUrl:
			"https://github.com/immersive-web/webxr/blob/master/designdocs/navigation.md",
	},
	{
		name: "Body Tracking",
		stage: 1,
		category: "Input",
		support: {
			chromeDesktop: "未確認",
			chromeAndroid: "未確認",
			quest: "対応",
			safari: "未対応",
		},
		description:
			"非公式の提案草案（2024-09-08）。全身の関節情報を取得し、アバターの動きなどに反映することを想定した提案です。",
		specUrl: "https://immersive-web.github.io/body-tracking/",
	},
	{
		name: "Face Tracking",
		stage: 1,
		category: "Input",
		support: {
			chromeDesktop: "未確認",
			chromeAndroid: "未確認",
			quest: "未確認",
			safari: "未対応",
		},
		description:
			"提案段階の仕様です。表情や視線に関する係数データを取得し、アバター表現などに活用することを想定しています。",
		specUrl: "https://github.com/immersive-web/webxr-face-tracking-1/",
	},
	{
		name: "Eye Tracking",
		stage: 1,
		category: "Input",
		support: {
			chromeDesktop: "未確認",
			chromeAndroid: "未確認",
			quest: "未確認",
			safari: "未対応",
		},
		description:
			"提案段階の議論（Issue #79）です。視線入力の必要性やプライバシーへの配慮について検討しています。",
		specUrl: "https://github.com/immersive-web/proposals/issues/79",
	},
];
