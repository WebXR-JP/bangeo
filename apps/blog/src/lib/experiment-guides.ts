export type Readiness =
	| "ready"
	| "lab"
	| "preview"
	| "limited"
	| "unsupported"
	| "unknown";

export type Track = "vr-basics" | "mr-lab" | "smartphone-ar";

export interface DeviceCheck {
	label: string;
	readiness: Readiness;
	note: string;
}

export interface ExperimentGuide {
	statusLabel: string;
	statusReadiness: Readiness;
	/** 1行で「このデモで何をするか」 */
	summary: string;
	intent: string;
	primaryDevice: string;
	track: Track;
	launchHref?: string;
	featuredOrder?: number;
	deviceChecks: DeviceCheck[];
	flow: string[];
	fallback: string;
	qualityCheck: string;
}

export const readinessLabel: Record<Readiness, string> = {
	ready: "体験可",
	lab: "検証中",
	preview: "通常表示可",
	limited: "条件あり",
	unsupported: "対象外",
	unknown: "確認中",
};

export const readinessClassName: Record<Readiness, string> = {
	ready: "bg-emerald-50 text-emerald-700 border-emerald-200",
	lab: "bg-violet-50 text-violet-700 border-violet-200",
	preview: "bg-sky-50 text-sky-700 border-sky-200",
	limited: "bg-amber-50 text-amber-700 border-amber-200",
	unsupported: "bg-gray-100 text-gray-600 border-gray-200",
	unknown: "bg-orange-50 text-orange-700 border-orange-200",
};

export const trackLabel: Record<Track, string> = {
	"vr-basics": "VRで体験する",
	"mr-lab": "MR / ARで体験する",
	"smartphone-ar": "スマホで体験する",
};

export const trackDescription: Record<Track, string> = {
	"vr-basics":
		"Meta QuestやPICOなどのヘッドセットで試しやすいVRデモです。空間音響、VRギャラリー、描画確認、プレイエリア表示などをブラウザから体験できます。",
	"mr-lab":
		"パススルーAR、現実空間への配置、Depth表示、部屋メッシュなど、対応端末で体験できるMR / ARデモです。デモの前に現在の端末で利用できる機能を確認できます。",
	"smartphone-ar":
		"iPhoneやAndroidのブラウザで試せるカメラベースのWebARです。ヘッドセットなしで、スマートフォンからすぐに体験できます。",
};

export const trackOrder: Track[] = ["vr-basics", "mr-lab", "smartphone-ar"];

const commonVrFlow = [
	"Meta QuestやPICOなどのヘッドセット、またはPCブラウザでデモページを開く。",
	"画面の案内に沿って、VRセッションの開始や音声・入力の許可を行う。",
	"表示、音、入力、終了ボタンの動作を確認し、環境に合うデモかを判断する。",
];

const experimentGuides: Record<string, ExperimentGuide> = {
	"webxr-audio-space": {
		statusLabel: "空間音響をVRで体験",
		statusReadiness: "ready",
		summary: "頭の向きや距離によって、音の聞こえ方が変わる様子を確認できます",
		intent:
			"WebXRとWeb Audio APIを組み合わせた空間音響デモです。ヘッドセットで開くと、視点の向きや音源との距離に合わせて音の定位が変わる様子を体験できます。PCブラウザでも、イヤホンやヘッドホンを使うと違いが分かりやすくなります。",
		primaryDevice: "Meta Quest / PICO / PCブラウザ",
		track: "vr-basics",
		launchHref: "/demos/webxr-audio-space",
		featuredOrder: 1,
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "ready",
				note: "Quest BrowserでVR入室と空間音響を体験できます。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "PICO Browserでは、まずVR入室と音の定位をご確認ください。",
			},
			{
				label: "PC",
				readiness: "preview",
				note: "ブラウザ上で音の定位や画面表示を確認できます。PC VRは環境により異なります。",
			},
		],
		flow: [
			"デモを開き、音声の再生とVRセッションの開始を許可する。",
			"表示された音源に顔を向け、左右・前後で聞こえ方が変わるか確認する。",
			"ヘッドセットを外す前に、終了操作でページへ戻れるか確認する。",
		],
		fallback:
			"VRに入れない場合でも、PCブラウザでは通常表示で音の定位を確認できます。音が鳴らない場合は、ブラウザの自動再生制限や音量設定をご確認ください。",
		qualityCheck:
			"確認ポイントは、VRに入れること、音が再生されること、頭の向きに合わせて音の位置が変わること、終了してページに戻れることです。",
	},
	"iwsdk-gallery": {
		statusLabel: "VR空間で記事カードを読む",
		statusReadiness: "ready",
		summary: "VR空間内でカードを選び、ブラウザ遷移なしで本文まで閲覧できます",
		intent:
			"BANGEOの記事カードをVR空間に並べ、選択するとその場で本文を読めるデモです。VR内で情報コンテンツをどう見せるか、距離感・文字サイズ・操作感を確認できます。",
		primaryDevice: "Meta Quest / PC VR",
		track: "vr-basics",
		launchHref: "/demo/iwsdk-gallery",
		featuredOrder: 2,
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "ready",
				note: "カード選択、本文表示、戻る操作をヘッドセットで体験できます。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "起動可否とコントローラー選択の動作をご確認ください。",
			},
			{
				label: "デスクトップ",
				readiness: "preview",
				note: "通常表示でカードの内容とレイアウトを確認できます。",
			},
		],
		flow: commonVrFlow,
		fallback:
			"VRに入れない場合は、通常ブラウザでカードの見た目を確認できます。ヘッドセットでは、カードが読みやすい距離に表示されるかをご確認ください。",
		qualityCheck:
			"確認ポイントは、カードが読める距離に表示されること、選択時に本文が開くこと、戻る操作で迷わないことです。",
	},
	"webxr-body-tracking": {
		statusLabel: "全身トラッキングを可視化",
		statusReadiness: "lab",
		summary: "対応ヘッドセットで、取得できた関節を点と線で表示します",
		intent:
			"Body Tracking対応ブラウザで、取得できた全身関節をシンプルな点と線で可視化するデモです。アバター表現の前段階として、どの関節が取得できるかを確認できます。",
		primaryDevice: "PICO + Motion Tracker / WebXR対応ヘッドセット",
		track: "vr-basics",
		launchHref: "/demos/webxr-body-tracking",
		deviceChecks: [
			{
				label: "PICO",
				readiness: "lab",
				note: "PICO BrowserやPICO Web App、Motion Tracker設定での確認に向いています。",
			},
			{
				label: "その他XR",
				readiness: "unknown",
				note: "Body Tracking対応の有無は端末とブラウザによって異なります。",
			},
			{
				label: "Desktop",
				readiness: "preview",
				note: "UI表示の確認のみ可能です。実際のトラッキングには対応ヘッドセットが必要です。",
			},
		],
		flow: [
			"対応ヘッドセットで必要なトラッカー設定を行い、デモページを開く。",
			"XR開始後、画面上の状態表示を確認する。",
			"体を動かして、点や線が追従するか確認する。",
		],
		fallback:
			"Body Trackingが使えない場合は、未対応状態が画面に表示されます。通常のVR入室とは別の対応条件が必要です。",
		qualityCheck:
			"確認ポイントは、XRセッションが始まること、関節の状態が画面に出ること、体の動きに合わせて表示が更新されることです。",
	},
	"hit-test-advanced": {
		statusLabel: "現実空間へのAR配置を試す",
		statusReadiness: "limited",
		summary: "床や机などの面を検出し、3Dオブジェクトを現実空間に配置します",
		intent:
			"現実空間の床や机を検出し、目印に合わせて3Dオブジェクトを置くARデモです。商品プレビュー、展示、教育向けARなどで必要になる配置の安定感を確認できます。",
		primaryDevice: "Meta Quest 3系 / Android Chrome",
		track: "mr-lab",
		launchHref: "/demos/hit-test-advanced",
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "limited",
				note: "パススルーAR対応モデルでの確認に向いています。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "ARセッションと面検出の利用可否をご確認ください。",
			},
			{
				label: "Android",
				readiness: "limited",
				note: "ChromeとARCore対応端末でご確認ください。",
			},
		],
		flow: [
			"明るく特徴のある床や机の前でデモを開く。",
			"ARを開始し、目印が面に合うまでゆっくり端末を動かす。",
			"タップや選択操作でオブジェクトを置き、位置が大きくずれないか確認する。",
		],
		fallback:
			"ARが開始できない端末では、対応状況の表示をご確認ください。VRヘッドセットの場合は、まずVR向けデモから試すと状態を確認しやすくなります。",
		qualityCheck:
			"確認ポイントは、AR開始、面の検出、オブジェクト配置、配置後の安定性です。",
	},
	"xr-mesh-export": {
		statusLabel: "Questの部屋形状を書き出す",
		statusReadiness: "lab",
		summary: "Questで取得した部屋の形状を確認し、GLBファイルとして保存できます",
		intent:
			"Meta Questの部屋スキャン情報を使い、壁・床・天井などの形状を可視化してGLBとして書き出すデモです。空間データを使った制作や検証の入口として利用できます。",
		primaryDevice: "Meta Quest 3 / 3S / Pro",
		track: "mr-lab",
		launchHref: "/demo/xr-mesh-export",
		deviceChecks: [
			{
				label: "Meta Quest 3系",
				readiness: "lab",
				note: "部屋スキャン情報とメッシュ表示を確認できます。",
			},
			{
				label: "PICO",
				readiness: "unsupported",
				note: "Quest向けの機能確認として扱います。",
			},
			{
				label: "Desktop",
				readiness: "unsupported",
				note: "実機専用です。説明ページで手順を確認できます。",
			},
		],
		flow: [
			"Questで部屋のスキャン設定を済ませてからデモを開く。",
			"メッシュや平面が表示されるか確認する。",
			"書き出しボタンを押し、保存されたGLBをあとで確認する。",
		],
		fallback:
			"部屋メッシュが取得できない環境では、Quest向け機能として案内します。一般的なVRデモとは対応条件が異なります。",
		qualityCheck:
			"確認ポイントは、部屋形状が表示されること、分類ラベルが確認できること、GLBを書き出せることです。",
	},
	"8thwall-face-glasses": {
		statusLabel: "スマホで顔ARを体験",
		statusReadiness: "ready",
		summary: "スマートフォンのカメラで、顔にサングラスを重ねて表示します",
		intent:
			"iPhoneやAndroidのブラウザで、顔に3Dサングラスを重ねるWebARデモです。カメラ許可後、顔の動きに合わせてサングラスが追従します。",
		primaryDevice: "iPhone / Android",
		track: "smartphone-ar",
		launchHref: "/demos/8thwall-face-glasses/demo.html",
		deviceChecks: [
			{
				label: "iPhone",
				readiness: "ready",
				note: "SafariなどのブラウザでカメラベースのWebARを体験できます。",
			},
			{
				label: "Android",
				readiness: "ready",
				note: "カメラ許可後、顔追従と色の切り替えを確認できます。",
			},
			{
				label: "Meta Quest / PICO",
				readiness: "unsupported",
				note: "スマートフォン向けの顔ARデモです。",
			},
		],
		flow: [
			"スマートフォンのブラウザでデモを開き、カメラを許可する。",
			"顔を正面に入れ、サングラスが目元に追従するか確認する。",
			"色の切り替えや、明るさの違う場所での見え方を確認する。",
		],
		fallback:
			"カメラが利用できない環境では、デモを開始できません。ブラウザのカメラ権限や別の端末をご確認ください。",
		qualityCheck:
			"確認ポイントは、カメラ許可、顔追従、色の切り替え、暗い場所や横向きでの見え方です。",
	},
};

export function getExperimentGuide(slug: string): ExperimentGuide | undefined {
	return experimentGuides[slug];
}

export function getExperimentGuideOrDefault(
	slug: string,
	options: { href?: string; devices?: string[] } = {},
): ExperimentGuide {
	const guide = getExperimentGuide(slug);
	if (guide) return guide;

	const deviceList = options.devices?.length
		? options.devices.join(" / ")
		: "Meta Quest / PICO / Desktop";

	return {
		statusLabel: "対応状況を確認して体験",
		statusReadiness: "unknown",
		summary: "現在の端末で起動できるかを確認してからデモへ進めます",
		intent:
			"このデモは端末やブラウザによって体験できる範囲が変わります。まずページ内の対応状況を確認し、利用できる環境でデモをお試しください。",
		primaryDevice: deviceList,
		track: "vr-basics",
		launchHref: options.href,
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "unknown",
				note: "WebXRセッション開始と入力の動作をご確認ください。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "ブラウザでの起動可否をご確認ください。",
			},
			{
				label: "Desktop",
				readiness: "preview",
				note: "通常表示またはプレビューとして確認できます。",
			},
		],
		flow: commonVrFlow,
		fallback:
			"うまく動かない場合は、現在のブラウザや端末が必要なWebXR機能に対応しているかをご確認ください。",
		qualityCheck:
			"確認ポイントは、デモを開けること、操作できること、終了してページに戻れることです。",
	};
}
