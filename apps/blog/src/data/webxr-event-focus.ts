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
			"AR/VRコーナーや公式番組が用意される国内最大級のゲーム展示会です。XRデバイスやプラットフォーム、ブラウザ、空間UIに関する発表が注目されます。",
		watch: [
			"AR/VRコーナーとXRデバイスの展示",
			"Quest・PICO・Sonyなどのプラットフォーム関連発表",
			"WebXRの設計にも活かせる空間UIや入力方式の事例",
		],
		nextAction:
			"出展社一覧と公式番組を確認し、XR関連の発表と公開資料を整理する。",
		sourceUrl: "https://tgs.cesa.or.jp/2026/",
	},
	{
		title: "CEATEC 2026",
		dates: "2026-10-13〜10-16",
		location: "幕張メッセ",
		phase: "出展者・セッション公開",
		priority: "high",
		summary:
			"デジタル技術全般の総合展示会です。スマートグラスや3Dスキャン、デジタルツイン、空間コンピューティング関連の展示と講演が予定されています。",
		watch: [
			"スマートグラスと空間ディスプレイの展示",
			"3Dスキャンとデジタルツインの活用事例",
			"Web技術と連携する産業向けAR・空間コンピューティング",
		],
		nextAction:
			"XR・スマートグラス・3D関連の出展者を確認し、対応デバイスやプラットフォーム情報を更新する。",
		sourceUrl: "https://www.ceatec.com/ja/",
	},
	{
		title: "XR産業活用展 2026 秋",
		dates: "2026-11-11〜11-13",
		location: "幕張メッセ",
		phase: "開催予定",
		priority: "high",
		summary:
			"NexTech Week秋展の中で開かれる産業XRの専門展示会です。ヘッドセットやスマートグラス、空間コンピューティング、XRとAIの組み合わせなどが主な分野です。",
		watch: [
			"ヘッドセットとスマートグラスの実機展示",
			"空間コンピューティングの導入事例",
			"XR研修・遠隔支援・産業向けWeb 3Dの活用",
		],
		nextAction:
			"出展者一覧とセミナー情報を確認し、実機展示やWeb連携事例を整理する。",
		sourceUrl: "https://www.nextech-week.jp/hub/ja-jp/about/xr.html",
	},
	{
		title: "Inter BEE 2026",
		dates: "2026-11-18〜11-20",
		location: "幕張メッセ",
		phase: "開催予定",
		priority: "medium",
		summary:
			"映像・音響・放送・配信の展示会です。WebXRそのものだけでなく、イマーシブ映像や立体音響、ボリュメトリック映像、WebRTC配信などの周辺技術が集まります。",
		watch: [
			"イマーシブ映像と立体音響（Spatial Audio）",
			"ボリュメトリック映像と3D映像制作",
			"WebRTCやリモートレンダリングなどの配信技術",
		],
		nextAction:
			"XR・3D映像・配信技術に関連するセッションと出展者を確認する。",
		sourceUrl: "https://www.inter-bee.com/ja/welcome-guide/",
	},
	{
		title: "XR Kaigi 2026",
		dates: "2026-11-30〜12-02",
		location: "東京ポートシティ竹芝",
		phase: "開催予定・詳細公開待ち",
		priority: "high",
		summary:
			"国内のXR開発者やデバイスメーカーが集まるカンファレンスです。XRデバイスやスマートグラス、3D Gaussian Splatting、フィジカルAIなど幅広いテーマが扱われます。",
		watch: [
			"WebXR・WebARに関わる開発者セッション",
			"スマートグラスやXRデバイスの新製品展示",
			"Three.js・Babylon.js・PlayCanvasなどWeb 3D関連の登壇",
		],
		nextAction:
			"セッション一覧と出展社情報を確認し、WebXR関連の登壇と公開資料を整理する。",
		sourceUrl: "https://xrkaigi.com/",
	},
];
