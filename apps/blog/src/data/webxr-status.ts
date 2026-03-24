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

export const WEBXR_STATUS_META = {
	lastChecked: "2026年1月8日",
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
			"W3C の勧告候補草案（2025-10-01）。VR/AR デバイスのセンサーやヘッドマウントディスプレイへのアクセス方法を定める中核仕様です。",
		specUrl: "https://www.w3.org/TR/webxr/",
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
			"W3C の勧告候補草案（2025-04-25）。WebXR Device API に AR 向けの機能を追加する拡張仕様です。",
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
			"W3C のワーキングドラフト（2024-09-24）。没入型セッション中に単一の DOM 要素を 2D オーバーレイとして重ねて表示する仕組みを定める仕様です。",
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
			"W3C のワーキングドラフト（2025-12-11）。コンポジターが管理するレイヤーを使い、描画効率や視認性、遅延の改善を目指す仕様です。",
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
		specUrl: "https://immersive-web.github.io/webxr-body-tracking/",
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
