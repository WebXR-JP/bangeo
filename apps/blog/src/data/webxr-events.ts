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
	endAt?: string;
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
	"live-soon": "開催直前",
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

export const WEBXR_EVENTS_LAST_UPDATED = "2026-09-28";

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
		title: "Sneeze / OMBI at AWE USA 2026",
		slug: "sneeze-ombi-awe-usa-2026",
		category: "Event / Spatial Web / Standards Watch",
		startDate: "2026-06-16",
		endDate: "2026-06-17",
		timezone: "America/Los_Angeles",
		location: "米国カリフォルニア州ロングビーチ",
		status: "recap-needed",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://metaverse-standards.org/event/awe-2026/",
		sourceType: "primary",
		entityTags: [
			"AWE USA 2026",
			"Sneeze",
			"OMBI",
			"Metaverse Standards Forum",
			"RP1",
			"Sean Mann",
			"Neil Trevett",
		],
		watchTopics: [
			"Webブラウザからメタバースブラウザへの移行議論",
			"Open Metaverse Browser Initiativeの円卓会議",
			"Sneezeのアーキテクチャとロードマップ",
			"SOM・RMAP・OpenXR・WASMの標準化動向",
		],
		affectedBangeoPages: [
			"/events",
			"/webxr-status",
			"/notes/open-metaverse-browser",
			"/articles/sneeze-open-metaverse-browser-engine",
		],
		recommendedAction:
			"AWE終了後、セッション資料、動画、GitHub更新、OMBIロードマップを確認する。",
		lastCheckedAt: "2026-06-21",
		nextCheckAt: "2026-06-25",
		notes:
			"AWE 2026内のSneeze・OMBI関連セッション（6月16〜17日）は開催済み。セッション資料や動画、GitHubの更新を確認中。",
		region: "global",
		organizerType: "standards",
		watchMode: "primary",
		webxrRelevance: "adjacent",
		developerRelevance: "medium",
		labCandidate: true,
	},
	{
		title: "AWE USA 2026",
		slug: "awe-usa-2026",
		category: "XR / Spatial AI / WebAR",
		startDate: "2026-06-15",
		endDate: "2026-06-18",
		timezone: "America/Los_Angeles",
		location: "米国カリフォルニア州ロングビーチ",
		status: "recap-needed",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.awexr.com/usa-2026",
		sourceType: "primary",
		entityTags: ["AWE", "XR", "Spatial AI", "WebAR", "Spatial Web"],
		watchTopics: [
			"WebAR関連ツール",
			"Spatial Web関連デモ",
			"ブラウザ・フレームワークの発表",
			"XR業界の最新動向",
		],
		affectedBangeoPages: ["/webxr-status", "/tech-articles", "/experiments"],
		recommendedAction:
			"録画と出展社発表を確認し、Spatial AI、WebAR、デバイス展示、ブラウザ実装に関する一次情報を整理する。",
		lastCheckedAt: "2026-06-27",
		nextCheckAt: "2026-07-04",
		notes:
			"AWE USA 2026は6月15〜18日に開催済み。公式の録画や出展社発表を確認中。",
	},
	{
		title: "Meta Connect 2026",
		slug: "meta-connect-2026",
		category: "Meta Quest / MR / AI Glasses / Quest Browser",
		startDate: "2026-09-23",
		endDate: "2026-09-24",
		timezone: "America/Los_Angeles",
		location: "オンライン配信",
		status: "recap-needed",
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
			"Quest Browserの更新内容",
			"WebXRの対応状況",
			"WebXR depth projection",
			"実験的なWebGPU対応",
			"MRブラウザUI",
			"AIグラスとWeb連携",
		],
		affectedBangeoPages: ["/webxr-status", "/notes/quest-browser"],
		recommendedAction:
			"公式オンデマンド配信と開発者資料からQuest Browser、Horizon OS、WebXR関連の発表を確認する。",
		lastCheckedAt: "2026-09-26",
		nextCheckAt: "2026-10-03",
		notes:
			"9月23〜24日の開催は終了。Meta公式ページから基調講演と開発者向けセッションをオンデマンドで視聴できる。",
	},
	{
		title: "Meta VR Start Developer Competition 2026",
		slug: "meta-vr-start-developer-competition-2026",
		endAt: "2026-11-18T20:00:00Z",
		category: "Meta VR Glasses / WebXR / Developer Competition",
		startDate: "2026-09-24",
		endDate: "2026-11-19",
		timezone: "Asia/Tokyo",
		location: "オンライン応募（締切: 11月19日午前5時・日本時間）",
		status: "live",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://start-developer-competition-26.devpost.com/rules",
		sourceType: "primary",
		entityTags: ["Meta VR Start", "Meta VR Glasses", "WebXR", "IWSDK"],
		watchTopics: [
			"IWSDKを使ったWebXR作品は公開URLで応募可能",
			"コントローラーなしで完結するHands-first操作が必須",
			"賞金総額100万ドル（提出までにMeta VR Start Programへの参加が必要）",
		],
		affectedBangeoPages: ["/events", "/devices", "/libraries"],
		recommendedAction: "応募規約でWebXRの提出方法、操作条件、締切を確認する。",
		lastCheckedAt: "2026-09-26",
		nextCheckAt: "2026-10-03",
		notes:
			"応募期間は9月24日から11月18日正午（太平洋時間）まで。日本時間では11月19日午前5時。IWSDK・WebXR作品は公開URLで提出できる。",
		region: "global",
		organizerType: "developer_conference",
		webxrRelevance: "direct",
		developerRelevance: "high",
	},
	{
		title: "W3C TPAC 2026",
		slug: "w3c-tpac-2026",
		category: "Web標準化 / Immersive Web",
		startDate: "2026-10-26",
		endDate: "2026-10-30",
		timezone: "Europe/Dublin",
		location: "アイルランド・ダブリン",
		status: "upcoming",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://www.w3.org/news-events/tpac/2026/",
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
			"会議アジェンダとImmersive Web関連ミーティングの議題公開を確認し、仕様差分を整理する。",
		lastCheckedAt: "2026-09-14",
		nextCheckAt: "2026-07-15",
		notes:
			"W3C公式イベントページでは2026年10月26〜30日にダブリンで開催予定と案内されている。",
	},
	{
		title: "Google I/O 2026",
		slug: "google-io-2026",
		category: "Chrome / Web Platform / Android XR",
		startDate: "2026-05-19",
		endDate: "2026-05-20",
		timezone: "America/Los_Angeles",
		location: "オンライン / 米国マウンテンビュー",
		status: "recap-needed",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://io.google/2026/",
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
			"ChromeのWebプラットフォーム更新",
			"HTML-in-Canvas",
			"Android XR",
			"WebGPU",
			"エージェント向けWebツール",
		],
		affectedBangeoPages: [
			"/webxr-status",
			"/tech-articles/webxr-html-ui-dom-overlay-html-in-canvas-spatial-css",
			"/tech-articles/playcanvas-html-in-canvas",
			"/experiments",
		],
		recommendedAction:
			"オンデマンド動画と発表資料を確認し、Chrome、Webプラットフォーム、WebGPU、Android XRの更新を整理する。",
		lastCheckedAt: "2026-06-27",
		nextCheckAt: "2026-07-15",
		notes:
			"Google I/O 2026は開催済み。公式ページのオンデマンド資料からWebプラットフォーム・WebGPU・Android XR関連の発表を確認できる。",
	},
	{
		title: "WWDC26",
		slug: "wwdc26",
		category: "Safari / WebKit / visionOS / Spatial Web",
		startDate: "2026-06-08",
		endDate: "2026-06-12",
		timezone: "America/Los_Angeles",
		location: "オンライン / Apple Park",
		status: "recap-needed",
		importance: "high",
		confidence: "high",
		sourceUrl: "https://developer.apple.com/wwdc26/",
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
			"Safariのリリースノート",
			"WebKitの更新内容",
			"visionOS 27",
			"空間ブラウジング機能",
			"3Dコンテンツの制作ワークフロー",
		],
		affectedBangeoPages: [
			"/webxr-status",
			"/tech-articles/safari-27-beta-visionos-immersive-website-environments-webxr",
			"/tech-articles/safari-27-html-model-element-spatial-web",
			"/devices",
		],
		recommendedAction:
			"Apple Developerのまとめ資料とvisionOS 27関連セッションを確認し、Spatial WebとWebXRの違いを整理する。",
		lastCheckedAt: "2026-06-27",
		nextCheckAt: "2026-07-15",
		notes:
			"WWDC26は開催済み。Apple Developerのセッション動画からSafariとvisionOSの更新を確認できる。",
	},
	{
		title: "XR・メタバース総合展 夏 / ∞mugen",
		slug: "xr-metaverse-fair-summer-2026-mugen",
		category: "Expo / Device Hands-on",
		startDate: "2026-06-17",
		endDate: "2026-06-19",
		timezone: "Asia/Tokyo",
		location: "東京ビッグサイト",
		status: "recap-needed",
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
			"夏展の国内デバイス発表と体験レポートを整理し、秋展は別イベントとして確認する。",
		lastCheckedAt: "2026-06-27",
		nextCheckAt: "2026-07-04",
		notes:
			"2026年6月17〜19日に東京ビッグサイトで開催済み。∞mugen出展社の発表や体験レポートを確認中。",
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
		location: "京都",
		status: "recap-needed",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.ivs.events/en/",
		sourceType: "primary",
		entityTags: ["IVS", "Japan", "startup", "spatial AI", "XR startup"],
		watchTopics: [
			"XR・AIスタートアップの出展・登壇",
			"空間コンピューティング関連プロダクト",
			"国内デバイスメーカーの発表",
			"WebAR・3Dコマース系サービス",
		],
		affectedBangeoPages: ["/tech-articles", "/libraries", "/platforms"],
		recommendedAction:
			"XR・Spatial AI・WebAR・3Dコマース・デバイス系の登壇と展示を確認する。",
		lastCheckedAt: "2026-06-27",
		nextCheckAt: "2026-06-30",
		notes:
			"2026年7月1〜3日に京都みやこめっせ・ホテルオークラ京都で開催。",
	},
	{
		title: "XR Kaigi Hub 2026 Nagoya",
		slug: "xr-kaigi-hub-2026-nagoya",
		category: "Japan / XR community / Device makers",
		startDate: "2026-08-06",
		endDate: "2026-08-06",
		timezone: "Asia/Tokyo",
		location: "名古屋（愛知）",
		status: "recap-needed",
		importance: "medium",
		confidence: "medium",
		sourceUrl: "https://xrkaigi.com/",
		sourceType: "primary",
		entityTags: ["XR Kaigi Hub", "Japan", "Nagoya", "XR", "device makers"],
		watchTopics: [
			"国内XR企業の展示",
			"デバイスメーカー・周辺機器メーカーの発表",
			"地域XRコミュニティの事例",
			"WebAR・ブラウザ体験に活かせるデモ",
		],
		affectedBangeoPages: ["/events", "/tech-articles", "/platforms"],
		recommendedAction:
			"出展者情報を確認し、国内XR企業やデバイスメーカーのWebXR・WebAR事例を整理する。",
		lastCheckedAt: "2026-09-14",
		nextCheckAt: "2026-07-06",
		notes:
			"2026年8月6日に名古屋のSTATION Aiで開催。",
	},
	{
		title: "Tokyo Game Show 2026",
		slug: "tokyo-game-show-2026",
		category: "Japan / Game / XR devices / Platform holders",
		startDate: "2026-09-17",
		endDate: "2026-09-21",
		timezone: "Asia/Tokyo",
		location: "幕張メッセ（千葉）",
		status: "recap-needed",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://tgs.cesa.or.jp/2026/en",
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
			"XR・VRゲームの展示",
			"国内外デバイスメーカーの出展",
			"プラットフォームホルダーの発表",
			"WebXRで参考になる体験設計",
		],
		affectedBangeoPages: ["/devices", "/platforms", "/tech-articles"],
		recommendedAction:
			"公式番組と出展社発表から、XRデバイス、ブラウザ対応、空間UI事例を確認する。",
		lastCheckedAt: "2026-09-28",
		nextCheckAt: "2026-10-05",
		notes:
			"公式日程は9月17〜21日。台風25号に伴う9月20〜21日の開催変更・払い戻し案内があるため、該当日の展示や発表は公式記録を確認する。",
	},
	{
		title: "CEATEC 2026",
		slug: "ceatec-2026",
		category: "Japan / Digital innovation / Smart glasses / Devices",
		startDate: "2026-10-13",
		endDate: "2026-10-16",
		timezone: "Asia/Tokyo",
		location: "幕張メッセ（千葉）",
		status: "upcoming",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.ceatec.com/ja/",
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
			"スマートグラス・ウェアラブルの展示",
			"国内メーカーの3D・空間UI技術",
			"エッジAI・IoTとWebの連携",
			"産業向けWebAR・WebXRの事例",
		],
		affectedBangeoPages: ["/devices", "/platforms", "/tech-articles"],
		recommendedAction:
			"出展者一覧とセッションを確認し、スマートグラスや産業向けARの発表を整理する。",
		lastCheckedAt: "2026-09-14",
		nextCheckAt: "2026-07-15",
		notes:
			"2026年10月13〜16日に幕張メッセで開催。",
	},
	{
		title: "XR & Metaverse Fair Tokyo 2026 Autumn",
		slug: "xr-metaverse-fair-tokyo-2026-autumn",
		category: "Japan / XR expo / Metaverse / Device makers",
		startDate: "2026-11-11",
		endDate: "2026-11-13",
		timezone: "Asia/Tokyo",
		location: "幕張メッセ（千葉）",
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
			"XRデバイス・ソリューションの出展",
			"WebAR・3Dコマース系サービス",
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
			"出展者一覧を確認し、国内デバイス、SDK、WebAR・3D配信サービスの動向を整理する。",
		lastCheckedAt: "2026-09-14",
		nextCheckAt: "2026-07-15",
		notes:
			"2026年11月11〜13日に幕張メッセで開催。",
	},
	{
		title: "Manufacturing World Tokyo 2026",
		slug: "manufacturing-world-tokyo-2026",
		category: "Japan / Manufacturing / Digital twin / Industrial XR",
		startDate: "2026-07-01",
		endDate: "2026-07-03",
		timezone: "Asia/Tokyo",
		location: "東京ビッグサイト",
		status: "recap-needed",
		importance: "medium",
		confidence: "high",
		sourceUrl: "https://www.manufacturing-world.jp/tokyo/ja-jp.html",
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
			"CAD・3Dデータの活用",
			"デジタルツイン",
			"MREAL関連の展示",
			"Web 3D・ARの業務利用",
		],
		affectedBangeoPages: ["/platforms", "/devices", "/tech-articles"],
		recommendedAction:
			"Web 3D、デジタルツイン、CAD、製造業ARに関連する出展事例を確認する。",
		lastCheckedAt: "2026-06-27",
		nextCheckAt: "2026-06-30",
		notes:
			"2026年7月1〜3日に東京ビッグサイトで開催。",
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
		location: "幕張メッセ（千葉）",
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
			"3D・ボリュメトリック映像",
		],
		affectedBangeoPages: ["/platforms", "/tech-articles", "/experiments"],
		recommendedAction:
			"空間映像、イマーシブ配信、バーチャルプロダクション、Web配信技術の発表を確認する。",
		lastCheckedAt: "2026-09-14",
		nextCheckAt: "2026-07-15",
		notes:
			"2026年11月18〜20日に幕張メッセで開催。",
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
		location: "パシフィコ横浜 / オンライン",
		status: "announced",
		importance: "low",
		confidence: "high",
		sourceUrl: "https://prtimes.jp/main/html/rd/p/000000040.000086300.html",
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
			"Webで扱える3D・VR素材",
		],
		affectedBangeoPages: ["/devices", "/platforms", "/tech-articles"],
		recommendedAction:
			"Canon EOS VR、MREAL、3D写真・空間映像系の展示を確認する。",
		lastCheckedAt: "2026-09-14",
		nextCheckAt: "2026-10-01",
		notes:
			"次回日程は公式ページとメーカー発表で確認。空間映像やVR素材制作の関連イベント。",
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
		title: "TOKYO DIGICONX 2027",
		slug: "tokyo-digiconx",
		category: "Japan / Content / XR / AI / Web3",
		startDate: "2027-01-13",
		endDate: "2027-01-15",
		timezone: "Asia/Tokyo",
		location: "有明GYM-EX（東京）",
		status: "announced",
		importance: "low",
		confidence: "high",
		sourceUrl: "https://prtimes.jp/main/html/rd/p/000000023.000131493.html",
		sourceType: "primary",
		entityTags: ["TOKYO DIGICONX", "Japan", "XR", "AI", "Web3", "game"],
		watchTopics: ["XR", "メタバース", "AI", "Web3", "ゲーム・コンテンツ横断"],
		affectedBangeoPages: ["/events", "/platforms", "/tech-articles"],
		recommendedAction:
			"公式の出展者・セッション情報から、WebXRやWebARに関連する内容を確認する。",
		lastCheckedAt: "2026-09-14",
		nextCheckAt: "2026-07-15",
		notes: "主催者発表で2027年1月13〜15日、有明GYM-EXでの開催を確認。",
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
		location: "東京ポートシティ竹芝",
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
			"国内XR企業・デバイスメーカーの発表",
			"スマートグラス・Spatial AIの事例",
			"WebXR・WebARに関わる開発者セッション",
			"A-Frame・Three.js・Babylon.js・PlayCanvas関連の登壇",
		],
		affectedBangeoPages: [
			"/events",
			"/webxr-status",
			"/devices",
			"/platforms",
			"/tech-articles",
		],
		recommendedAction:
			"セッション一覧、企業キーノート、出展社を確認し、国内WebXR・デバイスメーカーの発表を整理する。",
		lastCheckedAt: "2026-09-14",
		nextCheckAt: "2026-07-15",
		notes:
			"2026年11月30日〜12月2日に東京ポートシティ竹芝で開催予定。",
	},
];
