export type DeviceWebxrSummary = {
	id: string;
	name: string;
	type: string;
	manufacturer: string;
	webxrSupport: {
		status: "対応" | "非対応";
		detail: string;
	};
	browsers: string[];
	connectionType: string;
	priceRange: string;
	availability: string;
	notes: string[];
};

export const VR_DEVICES: DeviceWebxrSummary[] = [
	{
		id: "meta-quest-3",
		name: "Meta Quest 3",
		type: "VR/MR",
		manufacturer: "Meta",
		webxrSupport: {
			status: "対応",
			detail: "標準ブラウザ「Oculus Browser」でWebXRコンテンツのVR表示が可能。",
		},
		browsers: [
			"Oculus Browser（Chromium系）",
			"Wolvic（旧Firefox Reality後継）",
			"PC接続時はChrome/EdgeなどPCブラウザ",
		],
		connectionType:
			"スタンドアロン。Meta Quest Link/Air LinkでPC接続すればPCVRとしても利用可。",
		priceRange: "74,800円（128GB）〜81,400円（512GB）",
		availability: "販売中（2023年10月発売）。",
		notes: [
			"現行スタンドアロン機の中でも高い処理性能を備えたモデル。",
			"カラーのパススルーカメラでMR体験に対応。",
			"Quest 2比で解像度・視野角・処理性能が向上。",
			"PC接続でSteamVRの高品質VRゲームも利用可能。",
		],
	},
	{
		id: "meta-quest-3s",
		name: "Meta Quest 3S",
		type: "VR/MR",
		manufacturer: "Meta",
		webxrSupport: {
			status: "対応",
			detail: "Quest 3と同じブラウザ環境でWebXRが利用可能。",
		},
		browsers: [
			"Oculus Browser（Chromium系）",
			"WolvicなどサードパーティVRブラウザ",
		],
		connectionType: "スタンドアロン。PC接続（Link/Air Link）対応。",
		priceRange: "48,400円（128GB）、64,900円（256GB）",
		availability: "販売中（2024年9月発売のQuest 3シリーズ）。",
		notes: [
			"Quest 3の性能を踏襲しつつ価格を抑えたモデル。",
			"解像度/レンズはQuest 2と同等の仕様。",
			"処理性能はQuest 3と同等とされる。",
			"手頃な価格でVRを始められるモデル。",
		],
	},
	{
		id: "meta-quest-2",
		name: "Meta Quest 2",
		type: "VR",
		manufacturer: "Meta",
		webxrSupport: {
			status: "対応",
			detail: "標準のOculus BrowserでWebXR利用可。",
		},
		browsers: [
			"Oculus Browser",
			"Firefox Reality（現在はWolvicへ移行）",
			"PC接続時はChrome/EdgeなどPCブラウザ",
		],
		connectionType: "スタンドアロン。PC有線/無線接続でPCVRも利用可。",
		priceRange: "発売時37,000円〜（128GB税込59,400円→後に64,405円へ改定）",
		availability: "在庫限り販売中（2020年発売、後継登場で生産終了見込み）。",
		notes: [
			"スタンドアロンVRの普及に大きく貢献したモデル。",
			"ユーザ数が多く、幅広いVRアプリに対応。",
			"Quest 3系と比べると解像度・性能は控えめな仕様。",
			"現在は価格重視の場合に有力な選択肢。",
		],
	},
	{
		id: "meta-quest-pro",
		name: "Meta Quest Pro",
		type: "VR/MR",
		manufacturer: "Meta",
		webxrSupport: {
			status: "対応",
			detail: "Questシリーズ共通のOculus BrowserでWebXR利用可。",
		},
		browsers: [
			"Oculus Browser（標準）",
			"WolvicなどのVRブラウザ",
			"PC接続時はPCブラウザ",
		],
		connectionType: "スタンドアロン。PC接続（Link）対応。",
		priceRange: "159,500円（税込、発売当初226,800円から値下げ）",
		availability: "販売中（2022年10月発売）。価格改定後は量販店でも取扱い。",
		notes: [
			"企業向けを意識した高性能モデル。",
			"高解像度パススルーセンサー搭載でMR対応。",
			"視線追跡・表情トラッキングを標準装備。",
			"高価格・重量のため、業務用途で特に活用されるモデル。",
		],
	},
	{
		id: "vive-focus-vision",
		name: "HTC VIVE Focus Vision",
		type: "VR/MR",
		manufacturer: "HTC",
		webxrSupport: {
			status: "対応",
			detail:
				"内蔵のVIVE BrowserでWebXRコンテンツを直接閲覧可能。Wolvicにも対応。",
		},
		browsers: ["VIVE Browser（公式）", "Wolvic（Vive公式ストアから導入）"],
		connectionType:
			"スタンドアロン。無線/有線でSteamVR接続可能（インサイドアウト）。",
		priceRange: "169,000円（税込）",
		availability: "販売中（2025年1月発売）。",
		notes: [
			"片目2448×2448の高解像度・最大120度視野角。",
			"標準でアイトラッキング、オプションでフェイストラッカー対応。",
			"単体で高品質VR/MR、PC接続で高品質PCVR。",
			"価格は非常に高く、重量や発熱に注意。",
		],
	},
	{
		id: "vive-xr-elite",
		name: "HTC VIVE XR Elite",
		type: "VR/MR",
		manufacturer: "HTC",
		webxrSupport: {
			status: "対応",
			detail: "VIVE BrowserやWolvicでWebXR利用可。",
		},
		browsers: ["VIVE Browser", "Wolvic"],
		connectionType:
			"スタンドアロン。PC接続（SteamVR/Viveport）対応、インサイドアウト方式。",
		priceRange: "164,000円（税込）",
		availability: "販売中（2023年発売）。",
		notes: [
			"コンパクトなゴーグル型デザインで軽量。",
			"バッテリーストラップを外すと眼鏡のように軽量。",
			"軽量モードでは明るさ制限などの制約あり。",
			"総合性能の割に価格が高めで、特定用途に活用するケースが多い。",
		],
	},
	{
		id: "vive-pro-2",
		name: "HTC VIVE Pro 2",
		type: "PCVR",
		manufacturer: "HTC",
		webxrSupport: {
			status: "対応",
			detail:
				"PC接続型のため、PC側ブラウザ経由でSteamVR/OpenXRからWebXR利用可。",
		},
		browsers: [
			"PC上のChrome/Edge/Firefox等",
			"SteamVRをOpenXRランタイムに設定して利用",
		],
		connectionType:
			"PC接続型（DisplayPort/USB、有線）。SteamVRベースステーション方式。",
		priceRange: "ヘッドセット単体103,400円前後、フルセットで約15万円",
		availability: "販売中（2021年6月発売）。",
		notes: [
			"両眼合計5K相当の超高解像度、120Hz対応。",
			"外部センサー方式で精密な6DoFトラッキング。",
			"高性能PCと周辺機器が必須で手軽さは低い。",
		],
	},
	{
		id: "pico-4",
		name: "Pico 4",
		type: "VR",
		manufacturer: "Pico",
		webxrSupport: {
			status: "対応",
			detail: "標準「Pico Browser」でWebXRコンテンツのVR表示が可能。",
		},
		browsers: [
			"Pico Browser（Chromiumベース）",
			"WolvicなどXRブラウザをサイドロード可能",
		],
		connectionType: "スタンドアロン。PC接続でSteamVR利用可。",
		priceRange: "約47,000〜59,000円（128GB: 49,000円、256GB: 59,400円）",
		availability: "販売中（2022年10月発売）。",
		notes: [
			"片目2160×2160、最大90Hz駆動。",
			"パススルーはモノクロでMR用途は限定的。",
			"公式ストアのアプリラインナップは拡大中。",
			"別売のPICOモーショントラッカーで全身トラッキングに対応。",
		],
	},
	{
		id: "pico-4-ultra",
		name: "Pico 4 Ultra",
		type: "VR/MR",
		manufacturer: "Pico",
		webxrSupport: {
			status: "対応",
			detail: "Pico BrowserでWebXR利用可。",
		},
		browsers: ["Pico Browser（Chromium系）"],
		connectionType: "スタンドアロン。PC接続（SteamVR）対応。",
		priceRange: "89,800円（256GBモデルのみ）",
		availability: "販売中（2024年9月発売）。",
		notes: [
			"Pico 4の上位モデルでカラーMR対応カメラ搭載。",
			"Snapdragon XR2 Gen2により高い処理能力。",
			"公式ストアのコンテンツラインナップは成長中。",
			"モーショントラッカー対応など独自の強み。",
		],
	},
];

export const AR_DEVICES: DeviceWebxrSummary[] = [
	{
		id: "android-arcore",
		name: "Androidスマートフォン（ARCore対応）",
		type: "AR",
		manufacturer: "Google/各社",
		webxrSupport: {
			status: "対応",
			detail:
				"Android版ChromeでWebXR AR Moduleが利用可能。ARCore対応端末が前提。",
		},
		browsers: ["Chrome for Android", "Samsung Internet（対応端末のみ）"],
		connectionType: "スマートフォン単体（背面カメラ）",
		priceRange: "端末により異なる",
		availability: "販売中（端末により異なる）",
		notes: [
			"ARCore対応端末が必須。",
			"カメラ越しに現実空間へオブジェクトを配置。",
			"OS/ブラウザの更新状況で挙動が変わる場合がある。",
		],
	},
	{
		id: "ios-arkit",
		name: "iPhone / iPad（ARKit対応）",
		type: "AR",
		manufacturer: "Apple",
		webxrSupport: {
			status: "非対応",
			detail: "iOS SafariはWebXR AR非対応。WebXR ViewerやApp Clipで体験可能。",
		},
		browsers: [
			"Safari（iOS）: WebXR AR非対応",
			"WebXR Viewer（アプリ）",
			"App Clip（EyeJack/Variant Launchなど）",
		],
		connectionType: "スマートフォン/タブレット単体（背面カメラ）",
		priceRange: "端末により異なる",
		availability: "販売中（端末により異なる）",
		notes: [
			"Safari単体ではWebXR ARが利用できない。",
			"App Clipを使えばインストール不要で体験可能。",
			"ARKit対応機種が前提。",
		],
	},
	{
		id: "apple-vision-pro",
		name: "Apple Vision Pro",
		type: "MR",
		manufacturer: "Apple",
		webxrSupport: {
			status: "対応",
			detail: "visionOSのSafariでWebXR体験が可能。",
		},
		browsers: ["Safari on visionOS"],
		connectionType: "スタンドアロン（visionOS）",
		priceRange: "公式価格を参照",
		availability: "販売中（地域により異なる）",
		notes: [
			"視線・ジェスチャー中心の操作体験。",
			"WebXRのimmersive-vr/immersive-arに対応。",
		],
	},
];
