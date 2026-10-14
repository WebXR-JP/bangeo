export interface PlatformProfile {
	id: string;
	name: string;
	link: string;
	category: "browser" | "service";
	features: string[];
	notes?: string;
}

export const WEBXR_PLATFORMS: PlatformProfile[] = [
	{
		id: "chrome-android-xr",
		name: "Google Chrome（Android XR）",
		link: "https://developer.android.com/develop/xr/web",
		category: "browser",
		features: [
			"ヘッドセットと有線XRグラスを対象にWebXRを案内。機器例はSamsung Galaxy XR、XREAL AURA",
			"公式一覧: Device API / AR / Gamepads / Hit Test / Hand Input / Anchors / Depth Sensing / Light Estimation",
		],
		notes:
			"2026年10月13日確認。AURAは公式WebXRデモあり・製品版の実機検証待ち。プラットフォーム対応は各機器・モード・機能の実測を保証しません。",
	},
	{
		id: "meta-quest-browser",
		name: "Meta Quest Browser",
		link: "https://developers.meta.com/horizon/release-notes/web/",
		category: "browser",
		features: [
			"Chromium ベースの Quest シリーズ標準ブラウザ。immersive-vr / immersive-ar に対応",
			"Hand Input Module（15.1+）、Depth Sensing（146.0+ / depth projection）、WebGPU composition layers（152.1 / 実験機能）を案内",
		],
		notes:
			"2026年10月14日確認。152.1の公式リリースノート（10月2日）は WebGPU composition layers に chrome://flags の webxr experiments を要求します。端末別の配布・実測は未確認。一次情報: https://developers.meta.com/vr/downloads/package/browser/152.1/?view=full_width",
	},
	{
		id: "wolvic",
		name: "Wolvic",
		link: "https://wolvic.com/",
		category: "browser",
		features: [
			"Igalia が開発するオープンソースの XR ブラウザ（旧 Firefox Reality 後継）",
			"Meta Quest / Pico / VIVE / Lynx など主要スタンドアロン HMD で利用可能",
		],
		notes:
			"Firefox Reality の後継として開発され、Quest・Pico・VIVE の各ストアで配信されています。",
	},
	{
		id: "pico-browser",
		name: "Pico Browser",
		link: "https://www.pico-interactive.com/",
		category: "browser",
		features: [
			"Chromium ベースの Pico シリーズ標準ブラウザ。immersive-vr に対応",
			"Pico 4 / Pico 4 Ultra で WebXR コンテンツの VR 表示が可能",
		],
		notes:
			"Pico スタンドアロン機の標準ブラウザ。Wolvic をサイドロードして利用することもできます。",
	},
	{
		id: "vive-browser",
		name: "VIVE Browser",
		link: "https://www.vive.com/",
		category: "browser",
		features: [
			"HTC VIVE スタンドアロン機の標準ブラウザ。WebXR に対応",
			"VIVE Focus Vision / VIVE XR Elite で直接 WebXR コンテンツを閲覧可能",
		],
		notes: "VIVE Browser に加え、Wolvic も Vive 公式ストアから導入できます。",
	},
	{
		id: "safari-visionos",
		name: "Safari（visionOS）",
		link: "https://developer.apple.com/visionos/",
		category: "browser",
		features: [
			"Apple Vision Pro の Safari で immersive-vr に対応。immersive-ar は対応未確認",
			"視線・ジェスチャー操作による WebXR 体験が可能",
		],
		notes:
			"2026年10月14日確認。WebKit issue 305459 は visionOS の immersive-ar 未対応時の誤判定修正を記録しています。iOS/macOS の Safari とは区別し、拡張機能は OS・ブラウザ版ごとに確認してください。一次情報: https://bugs.webkit.org/show_bug.cgi?id=305459",
	},
	{
		id: "chrome-android",
		name: "Google Chrome（Android）",
		link: "https://web.dev/articles/webxr",
		category: "browser",
		features: [
			"ARCore 対応端末で WebXR AR Module（immersive-ar）に対応",
			"Hit Test / DOM Overlays / Anchors / Hand Input（131+）をサポート",
		],
		notes: "ARCore 対応端末が前提。スマートフォン AR の主要な配信先です。",
	},
	{
		id: "samsung-internet",
		name: "Samsung Internet",
		link: "https://developer.samsung.com/internet",
		category: "browser",
		features: [
			"Android 向けブラウザ。ARCore 経由で WebXR AR に対応",
			"Samsung Galaxy XR（Android XR）でも WebXR 体験を提供",
		],
		notes:
			"Chrome と同じ Chromium ベースで、Android 端末での WebXR 体験を広げています。",
	},
	{
		id: "chrome-edge-desktop",
		name: "Google Chrome / Microsoft Edge（デスクトップ）",
		link: "https://chromestatus.com/features?q=webxr",
		category: "browser",
		features: [
			"PC 接続型 HMD と OpenXR ランタイムを組み合わせて WebXR を体験",
			"Hand Input Module（131+）に対応。Chrome / Edge は同じ Chromium ベース",
		],
		notes:
			"HTC VIVE Pro 2 などの PCVR ヘッドセットを接続した PC で WebXR コンテンツを利用できます。",
	},
	{
		id: "xrift",
		name: "XRift",
		link: "https://xrift.net/",
		category: "service",
		features: [
			"インストール不要でアクセスできるクロスプラットフォームメタバース",
			"React Three Fiber ベースでワールドを構築し、URL 共有だけで参加できます",
		],
		notes:
			"PC・スマートフォン・VR ヘッドセットをまたいで同じワールド体験を提供する国内発のサービスです。",
	},
	{
		id: "deovr",
		name: "DeoVR",
		link: "https://deovr.com/",
		category: "service",
		features: [
			"360° / 180° / 3D の VR 動画と写真を配信する没入型メディアプラットフォーム",
			"8K・120fps・パススルー対応など、高品質な VR 視聴体験を継続的に提供しています",
		],
		notes:
			"Web と専用アプリの両方で展開されている、没入型動画視聴の代表的なプラットフォームです。",
	},
];
