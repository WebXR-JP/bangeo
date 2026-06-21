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
		id: "meta-quest-browser",
		name: "Meta Quest Browser",
		link: "https://developers.meta.com/horizon/release-notes/web/",
		category: "browser",
		features: [
			"Chromium ベースの Quest シリーズ標準ブラウザ。immersive-vr / immersive-ar に対応",
			"Hand Input Module（15.1+）、Depth Sensing（146.0+ / depth projection）、Experimental WebGPU（146.0+）に対応",
		],
		notes:
			"Meta Quest 2 / 3 / 3S / Pro に標準搭載。WebXR コンテンツの主要な配信先として継続的に更新されています。",
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
			"Apple Vision Pro の Safari で immersive-vr / immersive-ar に対応",
			"視線・ジェスチャー操作による WebXR 体験が可能",
		],
		notes:
			"iOS Safari は WebXR AR 非対応。Apple Vision Pro の Safari 経由で WebXR を体験できます。",
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
