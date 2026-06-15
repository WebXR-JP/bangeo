export type WebXREventStatus =
	| "announced"
	| "upcoming"
	| "schedule-live"
	| "live"
	| "live-soon"
	| "recap-needed"
	| "archived";

export type WebXREventImportance = "high" | "medium" | "low";
export type WebXREventConfidence = "high" | "medium" | "low";
export type WebXREventSourceType =
	| "primary"
	| "official_blog"
	| "docs"
	| "news";

export type WebXREventRegion = "global" | "japan" | "japan-local";
export type WebXREventOrganizerType =
	| "standards"
	| "browser_vendor"
	| "device_maker"
	| "expo"
	| "community"
	| "developer_conference";
export type WebXREventWatchMode = "primary" | "recap" | "discovery";
export type WebXRRelevance = "direct" | "adjacent" | "weak" | "unknown";
export type WebXRDeveloperRelevance = "high" | "medium" | "low";

export interface WebXREventWatchItem {
	title: string;
	slug: string;
	category: string;
	startDate: string;
	endDate: string;
	timezone: string;
	location: string;
	status: WebXREventStatus;
	importance: WebXREventImportance;
	confidence: WebXREventConfidence;
	sourceUrl: string;
	sourceType: WebXREventSourceType;
	entityTags: string[];
	watchTopics: string[];
	affectedBangeoPages: string[];
	recommendedAction: string;
	lastCheckedAt: string;
	nextCheckAt: string;
	notes: string;
	region?: WebXREventRegion;
	organizerType?: WebXREventOrganizerType;
	watchMode?: WebXREventWatchMode;
	manufacturerTags?: string[];
	deviceTags?: string[];
	hasHandsOn?: boolean;
	webxrRelevance?: WebXRRelevance;
	developerRelevance?: WebXRDeveloperRelevance;
	labCandidate?: boolean;
}

export const WEBXR_EVENT_STATUS_LABELS: Record<WebXREventStatus, string> = {
	announced: "日程発表",
	upcoming: "開催予定",
	"schedule-live": "セッション公開",
	live: "開催中",
	"live-soon": "まもなく開催",
	"recap-needed": "発表回収",
	archived: "反映済み",
};

export const WEBXR_EVENT_IMPORTANCE_LABELS: Record<
	WebXREventImportance,
	string
> = {
	high: "高",
	medium: "中",
	low: "低",
};

export const WEBXR_EVENTS_LAST_UPDATED = "2026-06-15";

export const WEBXR_DEVICE_WATCH_TARGETS = [
	"Meta / Quest / Quest Browser / Horizon OS",
	"Apple / Vision Pro / visionOS / Safari",
	"Sony / XYN / mocopi / Spatial Reality Display",
	"Canon / MREAL / EOS VR / Dual Pixel 3D",
	"HTC VIVE / HTC NIPPON",
	"XREAL",
	"PICO",
	"Shiftall / MeganeX / HaritoraX",
	"NTTコノキューデバイス / MiRZA",
	"Even Realities",
	"Epson MOVERIO",
	"Looking Glass",
	"VITURE",
	"Rokid",
	"RayNeo",
	"Varjo",
	"Lenovo",
	"Magic Leap",
];

export const WEBXR_EVENTS: WebXREventWatchItem[] = [
	{
		title: "AWE USA 2026",
		slug: "awe-usa-2026",
		category: "XR / Spatial AI / WebAR",
		startDate: "2026-06-15",
		endDate: "2026-06-18",
		timezone: "America/Los_Angeles",
		location: "Long Beach, California",
		status: "live",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.awexr.com/",
		sourceType: "primary",
		entityTags: ["AWE", "XR", "Spatial AI", "WebAR", "Spatial Web"],
		watchTopics: [
			"WebAR系ツール",
			"Spatial Web関連デモ",
			"ブラウザ/フレームワーク発表",
			"XR業界ニュース",
		],
		affectedBangeoPages: ["/webxr-status", "/tech-articles", "/experiments"],
		recommendedAction:
			"開催中は公式セッション、出展者発表、XR/Spatial AI関連の一次情報を確認し、WebARやブラウザ実装に関係する発表を回収する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-06-16",
		notes:
			"AWE公式ページではLong Beachで2026年6月15〜18日開催と案内されているため、開催中〜開催後7日間を重点確認期間にする。",
	},
	{
		title: "Meta Connect 2026",
		slug: "meta-connect-2026",
		category: "Meta Quest / MR / AI Glasses / Quest Browser",
		startDate: "2026-09-23",
		endDate: "2026-09-24",
		timezone: "America/Los_Angeles",
		location: "Menlo Park, California",
		status: "upcoming",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://www.meta.com/connect/",
		sourceType: "primary",
		entityTags: [
			"Meta Connect",
			"Meta Quest",
			"Quest Browser",
			"WebXR",
			"WebGPU",
			"AI glasses",
			"Horizon OS",
		],
		watchTopics: [
			"Quest Browser release notes",
			"WebXR support",
			"WebXR depth projection",
			"Experimental WebGPU",
			"MR browser UI",
			"AI glasses web integration",
		],
		affectedBangeoPages: [
			"/webxr-status",
			"/notes/quest-browser",
			"/experiments/webgpu-detector",
			"/experiments/quest-depth-projection-box",
		],
		recommendedAction:
			"イベント前は公式ページと開発者セッションを確認。イベント後はQuest Browser、Horizon OS、WebXR関連発表を一次情報で確認して記事化する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-15",
		notes:
			"Meta公式Connectページでは2026年9月23〜24日開催とライブ配信登録が案内されている。",
	},
	{
		title: "W3C TPAC 2026",
		slug: "w3c-tpac-2026",
		category: "Web標準化 / Immersive Web",
		startDate: "2026-10-26",
		endDate: "2026-10-30",
		timezone: "Europe/Dublin",
		location: "Dublin, Ireland",
		status: "upcoming",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://www.w3.org/events/tpac/2026/tpac-2026/",
		sourceType: "primary",
		entityTags: ["W3C", "TPAC", "Immersive Web", "WebXR", "Web standards"],
		watchTopics: [
			"Immersive Web WG/CGの会議",
			"WebXR Device API",
			"WebXR Layers",
			"DOM Overlay",
			"Hit Test",
			"WebXR AR Module",
		],
		affectedBangeoPages: [
			"/webxr-status",
			"/tech-articles/immersive-web-meeting-notes",
		],
		recommendedAction:
			"登録開始、会議アジェンダ、Immersive Web関連ミーティングの議題公開を確認し、仕様差分メモと標準化ページの更新候補を整理する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-15",
		notes:
			"W3C公式イベントページではDublinで2026年10月26〜30日開催、登録は7月中旬開始予定、議題詳細は後日とされている。",
	},
	{
		title: "Google I/O 2026",
		slug: "google-io-2026",
		category: "Chrome / Web Platform / Android XR",
		startDate: "2026-05-19",
		endDate: "2026-05-20",
		timezone: "America/Los_Angeles",
		location: "Online / Mountain View",
		status: "recap-needed",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://io.google/",
		sourceType: "primary",
		entityTags: [
			"Google I/O",
			"Chrome",
			"Web Platform",
			"Android XR",
			"HTML-in-Canvas",
			"WebGPU",
		],
		watchTopics: [
			"Chrome Web Platform updates",
			"HTML-in-Canvas",
			"Android XR",
			"WebGPU",
			"agentic web tooling",
		],
		affectedBangeoPages: ["/webxr-status", "/tech-articles", "/experiments"],
		recommendedAction:
			"Chrome公式ブログ、Google Developers Blog、セッション動画を確認し、WebXR周辺のHTML-in-Canvas、WebGPU、Android XR関連更新を回収する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-06-16",
		notes:
			"Google I/O 2026は開催済み。Chrome公式ブログでHTML-in-CanvasなどのWeb Platform更新が紹介されているため、発表回収対象にする。",
	},
	{
		title: "WWDC26",
		slug: "wwdc26",
		category: "Safari / WebKit / visionOS / Spatial Web",
		startDate: "2026-06-08",
		endDate: "2026-06-12",
		timezone: "America/Los_Angeles",
		location: "Online / Apple Park",
		status: "recap-needed",
		importance: "high",
		confidence: "high",
		sourceUrl:
			"https://www.apple.com/newsroom/2026/05/apple-kicks-off-worldwide-developers-conference-on-june-8/",
		sourceType: "official_blog",
		entityTags: [
			"WWDC",
			"Apple",
			"Safari",
			"WebKit",
			"visionOS",
			"Spatial Web",
		],
		watchTopics: [
			"Safari release notes",
			"WebKit updates",
			"visionOS 27",
			"spatial browsing",
			"3D content workflows",
		],
		affectedBangeoPages: ["/webxr-status", "/tech-articles", "/devices"],
		recommendedAction:
			"Apple Developerのセッション動画、Safari/WebKitリリースノート、visionOS 27関連資料を確認し、Spatial Webや3Dコンテンツに関係する更新を整理する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-06-16",
		notes:
			"Apple公式ニュースルームではWWDC26が2026年6月8日にキックオフし、100本以上の新しいセッションが公開されると案内されている。",
	},
	{
		title: "XR・メタバース総合展 夏 / ∞mugen",
		slug: "xr-metaverse-fair-summer-2026-mugen",
		category: "Expo / Device Hands-on",
		startDate: "2026-06-17",
		endDate: "2026-06-19",
		timezone: "Asia/Tokyo",
		location: "東京ビッグサイト",
		status: "live-soon",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://www.xr-fair.jp/hub/ja-jp.html",
		sourceType: "primary",
		entityTags: [
			"XR・メタバース総合展",
			"∞mugen",
			"HTC NIPPON",
			"XREAL",
			"Shiftall",
			"NTTコノキューデバイス",
			"MiRZA",
			"Even Realities",
			"PICO",
			"Canon",
		],
		watchTopics: [
			"スマートグラス",
			"VR/MRヘッドセット",
			"ハンドトラッキング",
			"Webブラウザ対応",
			"WebXR対応",
			"OpenXR対応",
			"空間UI",
		],
		affectedBangeoPages: [
			"/events",
			"/webxr-status",
			"/notes/japan-xr-events",
			"/notes/device-watch",
		],
		recommendedAction:
			"/eventsではまもなく開催のDevice Hands-onイベントとして扱う。開催後7日間は出展社ニュース、体験レポート、デバイス仕様、ブラウザ/WebView/WebXR/OpenXR対応を確認する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-06-17",
		notes:
			"公式ページでは2026年6月17〜19日に東京ビッグサイトで開催予定。∞mugenはHTC NIPPON、XREAL、Shiftall、NTTコノキューデバイス、Even Realities、PICOなどデバイス体験の発表回収候補にする。",
		region: "japan",
		organizerType: "expo",
		watchMode: "recap",
		manufacturerTags: [
			"HTC NIPPON",
			"XREAL",
			"Shiftall",
			"NTTコノキューデバイス",
			"Even Realities",
			"PICO",
			"Canon",
		],
		deviceTags: ["smart_glasses", "vr_headset", "mr_headset"],
		hasHandsOn: true,
		webxrRelevance: "adjacent",
		developerRelevance: "high",
		labCandidate: true,
	},
	{
		title: "IVS2026",
		slug: "ivs-2026",
		category: "Japan / Startup / Spatial AI / Device startups",
		startDate: "2026-07-01",
		endDate: "2026-07-03",
		timezone: "Asia/Tokyo",
		location: "Kyoto, Japan",
		status: "upcoming",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.ivs.events/en/",
		sourceType: "primary",
		entityTags: ["IVS", "Japan", "startup", "spatial AI", "XR startup"],
		watchTopics: [
			"XR/AIスタートアップの出展・登壇",
			"空間コンピューティング関連プロダクト",
			"国内デバイスメーカー/アクセラレーター発表",
			"WebAR/3Dコマース系サービス",
		],
		affectedBangeoPages: ["/tech-articles", "/libraries", "/platforms"],
		recommendedAction:
			"開催前はXR/AI/デバイス系セッションと出展企業を確認。開催後は国内スタートアップやデバイスメーカー由来のWebXR/WebAR活用事例を回収する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-06-22",
		notes:
			"IVS公式ページでは2026年7月1〜3日に京都で開催予定と案内されている。WebXRそのもののイベントではないが、国内XR/AIスタートアップやデバイス周辺の発表を拾う候補にする。",
	},
	{
		title: "XR Kaigi Hub 2026 Nagoya",
		slug: "xr-kaigi-hub-2026-nagoya",
		category: "Japan / XR community / Device makers",
		startDate: "2026-08-06",
		endDate: "2026-08-06",
		timezone: "Asia/Tokyo",
		location: "Nagoya, Aichi",
		status: "upcoming",
		importance: "medium",
		confidence: "medium",
		sourceUrl: "https://www.moguravr.com/xr-kaigi-hub-2026-nagoya-en/",
		sourceType: "news",
		entityTags: ["XR Kaigi Hub", "Japan", "Nagoya", "XR", "device makers"],
		watchTopics: [
			"国内XR企業の展示",
			"デバイスメーカー/周辺機器メーカー発表",
			"地域XRコミュニティの事例",
			"WebAR/ブラウザ体験に転用できるデモ",
		],
		affectedBangeoPages: ["/events", "/tech-articles", "/platforms"],
		recommendedAction:
			"スポンサー・出展者更新を確認し、国内XR企業やデバイスメーカーの発表からBANGEOで紹介すべきWebXR/WebAR活用事例を探す。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-06",
		notes:
			"Mogura VRの記事では2026年8月6日に名古屋のSTATION Aiで開催予定とされている。公式ページ側の詳細公開も継続確認する。",
	},
	{
		title: "Tokyo Game Show 2026",
		slug: "tokyo-game-show-2026",
		category: "Japan / Game / XR devices / Platform holders",
		startDate: "2026-09-17",
		endDate: "2026-09-21",
		timezone: "Asia/Tokyo",
		location: "Makuhari Messe, Chiba",
		status: "upcoming",
		importance: "medium",
		confidence: "high",
		sourceUrl:
			"https://4c281b16296b2ab02a4e0b2e3f75446d.cdnext.stream.ne.jp/tgs/2026/exhibition/common/press/tgs26_0210_01news_en.pdf",
		sourceType: "primary",
		entityTags: [
			"TGS",
			"Japan",
			"game",
			"XR devices",
			"Sony",
			"Meta Quest",
			"PICO",
		],
		watchTopics: [
			"XR/VRゲーム展示",
			"国内外デバイスメーカーの出展",
			"プラットフォームホルダー発表",
			"WebXRで参考になる体験設計",
		],
		affectedBangeoPages: ["/devices", "/platforms", "/tech-articles"],
		recommendedAction:
			"出展社一覧と公式番組を確認し、XRデバイス、ブラウザ対応、ゲーム由来の空間UI事例、国内向けデバイス販売情報を回収する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-15",
		notes:
			"CESA/Nikkei BPの公式発表PDFでは2026年9月17〜21日に幕張メッセで開催予定とされている。",
	},
	{
		title: "CEATEC 2026",
		slug: "ceatec-2026",
		category: "Japan / Digital innovation / Smart glasses / Devices",
		startDate: "2026-10-13",
		endDate: "2026-10-16",
		timezone: "Asia/Tokyo",
		location: "Makuhari Messe, Chiba",
		status: "upcoming",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.ceatec.com/en/application/outline/",
		sourceType: "primary",
		entityTags: [
			"CEATEC",
			"Japan",
			"smart glasses",
			"IoT",
			"device makers",
			"spatial computing",
		],
		watchTopics: [
			"スマートグラス/ウェアラブル展示",
			"国内メーカーの3D/空間UI技術",
			"エッジAI/IoTとWeb連携",
			"産業向けWebAR/WebXR事例",
		],
		affectedBangeoPages: ["/devices", "/platforms", "/tech-articles"],
		recommendedAction:
			"出展者一覧とセッションを確認し、スマートグラス、3D表示、産業向けAR、Web連携可能なデバイス発表をBANGEOのデバイス/活用事例候補として整理する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-15",
		notes:
			"CEATEC公式ページでは2026年10月13〜16日に幕張メッセで開催予定と案内されている。",
	},
	{
		title: "XR & Metaverse Fair Tokyo 2026 Autumn",
		slug: "xr-metaverse-fair-tokyo-2026-autumn",
		category: "Japan / XR expo / Metaverse / Device makers",
		startDate: "2026-11-11",
		endDate: "2026-11-13",
		timezone: "Asia/Tokyo",
		location: "Makuhari Messe, Chiba",
		status: "upcoming",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.xr-fair.jp/hub/en-gb.html",
		sourceType: "primary",
		entityTags: [
			"XR & Metaverse Fair",
			"Japan",
			"XR",
			"metaverse",
			"device makers",
			"enterprise XR",
		],
		watchTopics: [
			"XRデバイス/ソリューション出展",
			"WebAR/3Dコマース系サービス",
			"法人向けXRプラットフォーム",
			"国内メーカーの新製品・導入事例",
		],
		affectedBangeoPages: [
			"/devices",
			"/platforms",
			"/libraries",
			"/tech-articles",
		],
		recommendedAction:
			"出展者一覧を定期確認し、WebXR開発者が比較すべき国内デバイス、SDK、WebAR/3D配信サービスを候補化する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-15",
		notes:
			"RX Japan公式ページでは2026年11月11〜13日に幕張メッセで開催予定と案内されている。",
	},
	{
		title: "Manufacturing World Tokyo 2026",
		slug: "manufacturing-world-tokyo-2026",
		category: "Japan / Manufacturing / Digital twin / Industrial XR",
		startDate: "2026-07-01",
		endDate: "2026-07-03",
		timezone: "Asia/Tokyo",
		location: "Tokyo Big Sight",
		status: "upcoming",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.manufacturing-world.jp/tokyo/en-gb.html",
		sourceType: "primary",
		entityTags: [
			"Manufacturing World",
			"Japan",
			"industrial XR",
			"CAD",
			"digital twin",
			"MREAL",
		],
		watchTopics: [
			"製造業向けXR",
			"CAD/3D",
			"デジタルツイン",
			"MREAL系導線",
			"Web 3D/ARの業務利用",
		],
		affectedBangeoPages: ["/platforms", "/devices", "/tech-articles"],
		recommendedAction:
			"製造業向けXR、3Dデータ活用、CAD/デジタルツイン、MREAL系ソリューションの出展を確認し、WebXR/WebAR学習に転用できる業務事例を拾う。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-06-22",
		notes:
			"公式ページでは2026年7月1〜3日に東京ビッグサイトで開催予定と案内されている。",
		region: "japan",
		organizerType: "expo",
		watchMode: "discovery",
		manufacturerTags: ["Canon"],
		deviceTags: ["mr_headset", "spatial_display"],
		hasHandsOn: true,
		webxrRelevance: "adjacent",
		developerRelevance: "medium",
	},
	{
		title: "Inter BEE 2026",
		slug: "inter-bee-2026",
		category: "Japan / Immersive media / Virtual production",
		startDate: "2026-11-18",
		endDate: "2026-11-20",
		timezone: "Asia/Tokyo",
		location: "Makuhari Messe, Chiba",
		status: "upcoming",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.inter-bee.com/en/",
		sourceType: "primary",
		entityTags: [
			"Inter BEE",
			"Japan",
			"immersive media",
			"virtual production",
			"spatial video",
		],
		watchTopics: [
			"空間映像",
			"イマーシブ映像",
			"バーチャルプロダクション",
			"Web配信技術",
			"3D/ボリュメトリック映像",
		],
		affectedBangeoPages: ["/platforms", "/tech-articles", "/experiments"],
		recommendedAction:
			"空間映像、イマーシブ配信、バーチャルプロダクション、Web配信技術の発表を確認し、WebXR/3D Webの学習題材にできるものを拾う。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-15",
		notes:
			"公式ページでは2026年11月18〜20日に幕張メッセで開催予定と案内されている。",
		region: "japan",
		organizerType: "expo",
		watchMode: "discovery",
		deviceTags: ["spatial_display"],
		hasHandsOn: true,
		webxrRelevance: "adjacent",
		developerRelevance: "medium",
	},
	{
		title: "CP+ 2027",
		slug: "cp-plus-2027",
		category: "Japan / Camera / Spatial video / Device makers",
		startDate: "2027-02-25",
		endDate: "2027-02-28",
		timezone: "Asia/Tokyo",
		location: "Pacifico Yokohama / Online",
		status: "announced",
		importance: "low",
		confidence: "medium",
		sourceUrl: "https://www.cpplus.jp/",
		sourceType: "primary",
		entityTags: [
			"CP+",
			"Canon",
			"EOS VR",
			"MREAL",
			"spatial video",
			"3D photo",
		],
		watchTopics: [
			"Canon EOS VR",
			"MREAL",
			"3D写真",
			"空間映像",
			"Webで扱える3D/VR素材",
		],
		affectedBangeoPages: ["/devices", "/platforms", "/tech-articles"],
		recommendedAction:
			"Canon EOS VR、MREAL、3D写真・空間映像系の展示を確認し、WebXR/3D Web素材制作への接続点がある場合だけ拾う。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-10-01",
		notes:
			"次回日程は公式ページとメーカーのCP+レポートで継続確認する。WebXR直接ではなく素材制作・空間映像側の隣接イベントとして扱う。",
		region: "japan",
		organizerType: "expo",
		watchMode: "discovery",
		manufacturerTags: ["Canon"],
		deviceTags: ["spatial_display", "mr_headset"],
		hasHandsOn: true,
		webxrRelevance: "adjacent",
		developerRelevance: "low",
	},
	{
		title: "TOKYO DIGICONX",
		slug: "tokyo-digiconx",
		category: "Japan / Content / XR / AI / Web3",
		startDate: "2026-01-01",
		endDate: "2026-12-31",
		timezone: "Asia/Tokyo",
		location: "Tokyo, Japan",
		status: "announced",
		importance: "low",
		confidence: "low",
		sourceUrl: "https://www.digiconx.tokyo/",
		sourceType: "primary",
		entityTags: ["TOKYO DIGICONX", "Japan", "XR", "AI", "Web3", "game"],
		watchTopics: ["XR", "メタバース", "AI", "Web3", "ゲーム/コンテンツ横断"],
		affectedBangeoPages: ["/events", "/platforms", "/tech-articles"],
		recommendedAction:
			"次回日程と出展内容が公式に出たら更新。XR/AI/Web3/ゲーム横断の中からWebXR開発者に近い発表だけ拾う。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-15",
		notes: "次回日程要確認。発見用の低優先度イベントとして扱う。",
		region: "japan-local",
		organizerType: "expo",
		watchMode: "discovery",
		webxrRelevance: "unknown",
		developerRelevance: "low",
	},
	{
		title: "XR Kaigi 2026",
		slug: "xr-kaigi-2026",
		category: "Japan / XR conference / Device makers / Spatial Web",
		startDate: "2026-11-30",
		endDate: "2026-12-02",
		timezone: "Asia/Tokyo",
		location: "Tokyo Port City Takeshiba, Tokyo",
		status: "upcoming",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://xrkaigi.com/",
		sourceType: "primary",
		entityTags: [
			"XR Kaigi",
			"Japan",
			"XR",
			"metaverse",
			"smart glasses",
			"device makers",
			"WebXR",
		],
		watchTopics: [
			"国内XR企業・デバイスメーカー発表",
			"スマートグラス/Spatial AI事例",
			"WebXR/WebARに近い開発者セッション",
			"A-Frame/three.js/Babylon.js/PlayCanvas関連登壇",
		],
		affectedBangeoPages: [
			"/events",
			"/webxr-status",
			"/devices",
			"/platforms",
			"/tech-articles",
		],
		recommendedAction:
			"セッション一覧、企業キーノート、展示社、XR Kaigi Hubの派生イベントを確認し、国内WebXR/デバイスメーカーの更新候補を記事化する。",
		lastCheckedAt: "2026-06-15",
		nextCheckAt: "2026-07-15",
		notes:
			"XR Kaigi公式サイトでは2026年11月30日〜12月2日に東京ポートシティ竹芝で開催予定と案内されている。",
	},
];
