export type WebXREventFocusPriority = "high" | "medium";

export interface WebXREventFocusItem {
	title: string;
	dates: string;
	location: string;
	phase: string;
	priority: WebXREventFocusPriority;
	summary: string;
	watch: string[];
	nextAction: string;
	sourceUrl: string;
}

export const WEBXR_EVENT_FOCUS_LAST_UPDATED = "2026-09-12";

export const WEBXR_EVENT_FOCUS: WebXREventFocusItem[] = [
	{
		title: "TOKYO GAME SHOW 2026",
		dates: "2026-09-17〜09-21",
		location: "幕張メッセ",
		phase: "開催直前",
		priority: "high",
		summary:
			"出展社一覧・AR/VRエリア・公式番組が公開済み。ゲーム一般ではなく、XRデバイス、プラットフォーム、ブラウザ、空間UIに関係する発表だけを回収する。",
		watch: [
			"AR/VRエリアとXRデバイス出展",
			"Quest / PICO / Sonyなどのプラットフォーム発表",
			"WebXRへ転用できる空間UI・入力設計",
		],
		nextAction:
			"9月15〜16日に出展社一覧と公式番組を最終確認し、会期中はXR関連発表のみ速報候補化する。終了後は公式動画・発表資料を回収する。",
		sourceUrl: "https://tgs.cesa.or.jp/2026/",
	},
	{
		title: "CEATEC 2026",
		dates: "2026-10-13〜10-16",
		location: "幕張メッセ",
		phase: "出展者・セッション公開",
		priority: "high",
		summary:
			"出展者一覧とコンファレンスが公開され、聴講予約も開始。スマートグラス、3Dスキャン、デジタルツイン、空間コンピューティングを優先して確認する。",
		watch: [
			"スマートグラス / 空間ディスプレイ",
			"3Dスキャン / デジタルツイン",
			"Web連携可能な産業AR / 空間コンピューティング",
		],
		nextAction:
			"出展者一覧をXR・AR・VR・3D・デジタルツイン・スマートグラスで絞り込み、BANGEOの/devicesと/platforms候補を作る。",
		sourceUrl: "https://www.ceatec.com/ja/",
	},
	{
		title: "XR産業活用展 2026 秋",
		dates: "2026-11-11〜11-13",
		location: "幕張メッセ",
		phase: "開催予定",
		priority: "high",
		summary:
			"NexTech Week秋展内の産業XR専門展示会。HMD・スマートグラス、空間コンピューティング、XR×AI、イマーシブ技術を公式カテゴリとして扱う。",
		watch: [
			"HMD / スマートグラス",
			"空間コンピューティング",
			"XR研修・遠隔支援・産業向けWeb 3D",
		],
		nextAction:
			"来場登録・出展者一覧・セミナー公開を確認し、実機体験できるデバイスとWeb技術へ接続できる展示を優先する。",
		sourceUrl: "https://www.nextech-week.jp/hub/ja-jp/about/xr.html",
	},
	{
		title: "Inter BEE 2026",
		dates: "2026-11-18〜11-20",
		location: "幕張メッセ",
		phase: "開催予定",
		priority: "medium",
		summary:
			"映像・音響・配信の大型展示会。WebXR直結より、イマーシブ映像、Spatial Audio、Volumetric、WebRTC / Streamingの実装材料を回収する。",
		watch: [
			"Immersive Video / Spatial Audio",
			"Volumetric / 3D映像",
			"WebRTC / Remote rendering / 配信",
		],
		nextAction:
			"10月初旬の来場登録・コンファレンス予約開始後に、XR / 3D / 配信に近いセッションと出展者を抽出する。",
		sourceUrl: "https://www.inter-bee.com/ja/welcome-guide/",
	},
	{
		title: "XR Kaigi 2026",
		dates: "2026-11-30〜12-02",
		location: "東京ポートシティ竹芝",
		phase: "開催予定・詳細公開待ち",
		priority: "high",
		summary:
			"国内XRの最重要カンファレンス。XR、スマートグラス、3D Gaussian Splatting、フィジカルAIなどを横断し、開発者・デバイスメーカーの一次情報を回収する。",
		watch: [
			"WebXR / WebARに近い開発者セッション",
			"スマートグラス / XRデバイス新製品",
			"three.js / Babylon.js / PlayCanvas / Web 3D関連登壇",
		],
		nextAction:
			"セッション一覧・出展社・企業キーノート公開を待ち、BANGEO向けの参加推奨セッションと会期後資料回収リストを作る。",
		sourceUrl: "https://xrkaigi.com/",
	},
];
