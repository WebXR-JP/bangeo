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
	specLastChecked: string;
	supportLastChecked?: string;
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
		publishedAt: "2026-10-29",
		docType: "勧告候補草案（CRD）",
		specUrl: "https://www.w3.org/TR/2026/CRD-webxr-20261029/",
		summary:
			"2026年10月29日公開の勧告候補草案です。以下はChanges節にある2022年3月31日の勧告候補スナップショットからの累積差分で、今回の版だけで追加された機能ではありません。ブラウザでの実装や利用可能時期は別途確認が必要です。",
		changes: [
			"inline-stereoセッション機能の追加",
			"XRSessionで有効化された機能一覧（enabledFeatures）の公開",
			"isSystemKeyboardSupportedによるシステムキーボード対応の確認",
			"visible-blurred状態でのgetPose()の挙動整理",
			"一時的なポインター入力（transient-pointer）の追加",
			"XRInputSourceのvisible elsewhereプロパティ（初稿）",
			"RGB / sRGB色空間の記述の明確化",
		],
	},
];

export const WEBXR_WG_DISCUSSIONS: WebXRWgDiscussion[] = [
	{
		title: "Layersの立体映像（packed stereo）におけるビューポート計算",
		publishedAt: "2026-10-14",
		status: "議論中",
		sourceUrl: "https://github.com/immersive-web/layers/issues/343",
		summary:
			"左右・上下に並べた立体映像のgetSubImage手順で、両眼とも先頭側の領域が返ってしまう記述ミスがあるという仕様上の指摘です。修正済みの仕様や、全ブラウザで再現する不具合とは区別して見ています。",
		topics: [
			"stereo-left-right / stereo-top-bottomの両眼ビューポート計算",
			"eye=noneとinvertStereoの定義",
			"各ブラウザ実装への影響と修正案は未確認",
		],
		relatedFeatures: ["WebXR Layers API Level 1"],
		articleCandidate: false,
	},
	{
		title: "HTML model要素の物理単位とCSSサイズ",
		publishedAt: "2026-10-14",
		status: "追跡中",
		sourceUrl: "https://www.w3.org/2026/10/13-immersive-web-minutes.html",
		issueUrl: "https://github.com/immersive-web/model-element/issues/155",
		summary:
			"2026年10月13日（日本時間10月14日）のコミュニティグループ会議の議事録草案では、3Dモデル内のメートル単位とCSS上の要素サイズを分けて扱う方針が議論されています。WebXR本体の新仕様や正式決議ではありません。",
		topics: [
			"width/heightをCSSピクセルの非負整数とするPR #159が仕様リポジトリへマージ済み",
			"表示枠への収め方（fitting）の計算修正PR #158は提案段階",
			"Bikeshed形式への移行PR #156がマージ済み",
			"CSSサイズと物理的な表示サイズを固定対応させない方向で議論",
		],
		relatedFeatures: ["HTML model element", "Immersive Web CG"],
		articleCandidate: false,
	},

	{
		title: "Sneeze（Open Metaverse Browser Engine）",
		publishedAt: "2026-06-15",
		status: "追跡中",
		sourceUrl: "https://omb.wiki/sneeze",
		issueUrl: "https://github.com/MetaverseStandards/sneeze",
		summary:
			"Metaverse Standards ForumとRP1がOMBIの一環として発表したオープンソースのメタバースブラウザエンジンです。WebXR Device APIの更新ではなく、SOMやWebAssemblyサンドボックス、OpenXR、ANARIなどを組み合わせるSpatial Webの周辺動向として見ています。",
		topics: [
			"Scene Object Model（SOM）による複数オリジン・複数サービスの3Dシーン合成",
			"URL遷移ではなく、位置や距離をもとに周囲の空間サービスを見つける仕組み",
			"サービスごとのWebAssemblyサンドボックスと権限モデル",
			"OpenXR、ANARI、glTF、SPIR-V、RMAPを組み合わせたネイティブ寄りの構成",
			"現時点では初期公開の参照・実験実装という位置づけ",
		],
		relatedFeatures: [
			"Spatial Web",
			"Open Metaverse Browser Initiative",
			"WebXR Device API",
		],
		articleCandidate: true,
	},
	{
		title: "HTML-in-CanvasとWebXRの連携",
		publishedAt: "2026-05-19",
		status: "議論中",
		sourceUrl: "https://www.w3.org/2026/05/19-immersive-web-minutes.html",
		issueUrl: "https://github.com/immersive-web/webxr/issues/1414",
		summary:
			"Immersive Webの対面会議（Day 1）で、HTML-in-CanvasをWebXRの空間UIに応用できるかが議論されました。DOMをそのままXR空間に置くというより、canvas・テクスチャ・レイヤー・入力イベントをどう結びつけるかが論点です。",
		topics: [
			"HTML-in-Canvasによるcanvas子要素の描画と3D CSS transformを使ったDOM表示",
			"WebXR固有の入力（target ray、テレポート、ブラウザ提供カーソル）との連携",
			"2Dクワッドレイヤーへのレイキャストとx/y座標の対応づけ（球面への貼り付けは当面対象外）",
			"Layers APIを使わずCSS transformで平面UIを作る案との比較",
			"HTML-in-Canvas側との追加協議を予定",
		],
		relatedFeatures: ["WebXR DOM Overlays Module", "WebXR Layers API Level 1"],
		articleCandidate: true,
	},
	{
		title: "フォービエーション（中心窩レンダリング）のAPI公開方法",
		publishedAt: "2026-05-19",
		status: "追跡中",
		sourceUrl: "https://www.w3.org/2026/05/19-immersive-web-minutes.html",
		issueUrl: "https://github.com/immersive-web/webxr/issues/32",
		summary:
			"WebXRにおけるフォービエーションの議論では、WebGPUや可変レートシェーディング（VRS）との関係に加え、視線情報に伴うプライバシー保護が大きな論点です。まずは固定フォービエーションから仕様化する案が検討されています。",
		topics: [
			"WebGPUの可変レートシェーディング（gpuweb/gpuweb#450）との連携",
			"フォービエーションマップ用テクスチャの公開範囲と読み戻し制限",
			"視線連動フォービエーションによる視線情報漏洩リスクへの配慮",
			"固定フォービエーションを先行し、視線連動は別拡張とする案",
			"将来の動的フォービエーション向けイベント（onFoveationChangeなど）の検討",
		],
		relatedFeatures: [
			"WebXR Device API",
			"WebXR/WebGPU Binding Module - Level 1",
		],
		articleCandidate: false,
	},
	{
		title: "ARグラス向けの背景透過度（opacity）制御",
		publishedAt: "2026-05-20",
		status: "議論中",
		sourceUrl: "https://www.w3.org/2026/05/20-immersive-web-minutes.html",
		issueUrl: "https://github.com/immersive-web/webxr-ar-module/issues/93",
		summary:
			"光学シースルー型のARグラスでは、現実の背景をどの程度暗く見せるか（調光）をWebXR側から制御したい要望があります。opacityや調光の制御をどこまでWebに許可するかが議論されています。",
		topics: [
			"光学シースルー型（Android XR対応ARグラスなど）向けの調光ニーズ",
			"非対応デバイスでは無効になる機能検出の仕組み",
			"updateRenderState経由でopacityを取得・設定する案",
			"ブラウザ側で設定値を制限・無視できる仕組み",
			"デバイスが違っても同じ値で近い効果を得られる数値範囲の設計",
		],
		relatedFeatures: ["WebXR Augmented Reality Module - Level 1"],
		articleCandidate: false,
	},
];

export const WEBXR_STATUS_META = {
	browserReferencesLastChecked: "2026年10月14日",
	deviceNotes: {
		xrealAura: {
			lastChecked: "2026年10月13日",
			summary:
				"XREAL AURAは公式WebXRデモあり・製品版の実機検証待ち。Android XRのAPI対応一覧は、AURAの各モードや実データ取得を実測した結果ではありません。",
			sourceUrl: "https://www.xreal.com/uk/blog/project-aura-google-io-2026",
		},
	},
	sources: {
		standards: "https://www.w3.org/TR/?filter-tr-name=webxr",
		docTypes: "https://www.w3.org/TR/tr/",
		proposals: "https://github.com/immersive-web/proposals/issues",
		chromeStatus: "https://chromestatus.com/features?q=webxr",
		mdnBcd: "https://github.com/mdn/browser-compat-data",
		metaHorizonReleaseNotes:
			"https://developers.meta.com/vr/downloads/package/browser/152.1/?view=full_width",
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
		specLastChecked: "2026年11月5日",
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
			"W3Cの勧告候補草案（CRD、2026年10月29日）。VR/ARデバイスのセンサーやヘッドマウントディスプレイへアクセスする仕組みを定める中核仕様です。正式なW3C勧告ではなく、実装とテストを通じて勧告に向けた確認を進めている段階です。",
		specUrl: "https://www.w3.org/TR/2026/CRD-webxr-20261029/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"W3Cの勧告候補草案（2025年4月25日）。WebXR Device APIにAR向けの機能を追加する拡張仕様です。WGでは光学シースルー型ARグラス向けの背景透過度（opacity / dimming）制御も議論されています（未確定）。",
		specUrl: "https://www.w3.org/TR/webxr-ar-module-1/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"W3Cのワーキングドラフト（2025年7月7日）。XRコントローラーのボタン、トリガー、スティックなどの入力を扱う仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-gamepads-module-1/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"W3Cのワーキングドラフト（2025年12月11日）。現実空間の平面や物体に対してヒットテストを行う方法を定める仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-hit-test-1/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"W3Cのワーキングドラフト（2024年9月24日）。没入型セッション中に単一のDOM要素を2Dオーバーレイとして重ねて表示する仕様です。WGではHTML-in-Canvasとの連携も議論されています（未確定）。",
		specUrl: "https://www.w3.org/TR/webxr-dom-overlays-1/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"W3Cのワーキングドラフト（2026年8月11日）。コンポジターが管理するレイヤーを使い、描画効率や視認性、遅延の改善を目指す仕様です。Space Warp（space-warp）の記述も更新されています。",
		specUrl: "https://www.w3.org/TR/webxrlayers-1/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"WGのエディターズドラフト（2026年4月27日）。空間内に基準点となるアンカーを作成し、オブジェクトの位置を安定して固定するための仕様です。",
		specUrl: "https://immersive-web.github.io/anchors/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"W3Cのワーキングドラフト（2025年12月11日）。周囲の明るさや光の色を推定して取得し、XRの描画に反映する仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-lighting-estimation-1/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"W3Cのワーキングドラフト（2024年6月5日）。手や指の関節位置を追跡し、ハンドトラッキング入力を扱う仕様です。",
		specUrl: "https://www.w3.org/TR/webxr-hand-input-1/",
	},
	{
		specLastChecked: "2026年10月14日",
		name: "WebXR/WebGPU Binding Module - Level 1",
		stage: 2,
		category: "Rendering",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "未対応",
			quest: "152.1（Experimental）",
			safari: "未対応",
		},
		description:
			"WGのエディターズドラフト（2026年8月12日）。WebGPUを使ってWebXRセッションへ描画するための連携仕様です。Quest Browser 152.1（2026年10月2日）のリリースノートではWebGPU composition layersが実験機能として案内されており、chrome://flagsでwebxr experimentsを有効にする必要があります。通常のWebGPU対応とWebXR連携は分けて確認します。",
		specUrl: "https://immersive-web.github.io/webxr-webgpu-binding/",
	},
	{
		specLastChecked: "2026年10月14日",
		name: "WebXR Depth Sensing Module",
		stage: 3,
		category: "AR",
		support: {
			chromeDesktop: "未対応",
			chromeAndroid: "90+",
			quest: "146.0+（Lab / depth projection）",
			safari: "未対応",
		},
		description:
			"W3Cのワーキングドラフト（2026年8月25日）。周囲の深度情報を取得し、現実の物体による遮蔽（オクルージョン）などに使う仕様です。Quest Browser 146.0（2026年4月21日）でdepth projectionの対応が追加されましたが、現時点では実験機能として扱うのが安全です。",
		specUrl: "https://www.w3.org/TR/webxr-depth-sensing-1/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"WGのエディターズドラフト（2026年3月30日）。デバイスが検出した床や壁などの平面情報を取得する拡張仕様です。",
		specUrl: "https://immersive-web.github.io/plane-detection/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"コミュニティグループの草案（2026年2月2日）。周囲の環境メッシュを取得し、遮蔽や衝突判定に使う拡張仕様です。",
		specUrl: "https://immersive-web.github.io/real-world-meshing/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"コミュニティグループの草案（2025年12月11日）。immersive-arセッション中の背面カメラ映像へ直接アクセスする拡張仕様です。",
		specUrl: "https://immersive-web.github.io/raw-camera-access/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"設計文書ベースの提案です。ブラウザ側の判断で没入セッションを引き継ぎ、`sessiongranted`イベントなどを使って没入状態のままページ遷移できる仕組みを目指しています。",
		specUrl:
			"https://github.com/immersive-web/webxr/blob/master/designdocs/navigation.md",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"非公式の提案草案（2024年9月8日）。全身の関節情報を取得し、アバターの動きなどに反映することを想定した提案です。",
		specUrl: "https://immersive-web.github.io/body-tracking/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"提案段階の仕様です。表情や視線に関する係数データを取得し、アバター表現などに使うことを想定しています。",
		specUrl: "https://github.com/immersive-web/webxr-face-tracking-1/",
	},
	{
		specLastChecked: "2026年10月14日",
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
			"提案段階の議論（Issue #79）です。視線入力の要件やプライバシーへの配慮について検討しています。",
		specUrl: "https://github.com/immersive-web/proposals/issues/79",
	},
];
