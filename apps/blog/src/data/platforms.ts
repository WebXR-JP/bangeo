import { STEAM_FRAME_WEBXR } from "./steam-frame-webxr";

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
			"ヘッドセットや有線XRグラス向けにWebXRを案内しています（対応予定・対象例: Samsung Galaxy XR、XREAL AURA）",
			"公式ドキュメント記載のAPI: Device API / AR / Gamepads / Hit Test / Hand Input / Anchors / Depth Sensing / Light Estimation",
		],
		notes:
			"2026年10月13日確認。XREAL AURAは公式WebXRデモが公開されていますが、製品版での実機検証待ちです。プラットフォーム全体の一覧は、個別端末での動作を保証するものではありません。",
	},
	{
		id: "meta-quest-browser",
		name: "Meta Quest Browser",
		link: "https://developers.meta.com/horizon/release-notes/web/",
		category: "browser",
		features: [
			"ChromiumベースのMeta Questシリーズ標準ブラウザで、immersive-vrとimmersive-arに対応しています",
			"Hand Input Module（15.1+）、Depth Sensing（146.0+ / depth projection）、WebGPU composition layers（152.1 / 実験機能）に対応しています",
		],
		notes:
			"2026年10月14日確認。152.1のリリースノート（2026年10月2日）では、WebGPU composition layersを使うためにchrome://flagsでwebxr experimentsを有効にする必要があると案内されています。端末ごとの配布状況や実測結果は未確認です。一次情報: https://developers.meta.com/vr/downloads/package/browser/152.1/?view=full_width",
	},
	{
		id: "wolvic",
		name: "Wolvic",
		link: "https://wolvic.com/",
		category: "browser",
		features: [
			"Igaliaが開発するオープンソースのXRブラウザです（Firefox Realityの後継）",
			"Meta Quest、PICO、VIVE、Lynxなどの主要なスタンドアロン型ヘッドセットで利用できます",
		],
		notes:
			"Quest・PICO・VIVEの各公式ストアから導入できます。",
	},
	{
		id: "pico-browser",
		name: "PICO Browser",
		link: "https://www.pico-interactive.com/",
		category: "browser",
		features: [
			"ChromiumベースのPICOシリーズ標準ブラウザで、immersive-vrに対応しています",
			"PICO 4やPICO 4 UltraでWebXRのVRコンテンツを開けます",
		],
		notes:
			"PICOスタンドアロン機の標準ブラウザです。別ブラウザとしてWolvicをサイドロードして使う方法もあります。",
	},
	{
		id: "vive-browser",
		name: "VIVE Browser",
		link: "https://www.vive.com/",
		category: "browser",
		features: [
			"HTC VIVEスタンドアロン機の標準ブラウザで、WebXRに対応しています",
			"VIVE Focus VisionやVIVE XR EliteでそのままWebXRコンテンツを開けます",
		],
		notes: "VIVE Browserのほか、WolvicもVIVE公式ストアから導入できます。",
	},
	{
		id: "safari-visionos",
		name: "Safari（visionOS）",
		link: "https://developer.apple.com/visionos/",
		category: "browser",
		features: [
			"Apple Vision ProのSafariでimmersive-vrに対応しています（immersive-arは未確認）",
			"視線と手のジェスチャーでWebXRコンテンツを操作できます",
		],
		notes:
			"2026年10月14日確認。WebKit issue 305459で、visionOSでimmersive-ar未対応時に誤判定する不具合が修正されています。iOS・macOSのSafariとは仕様が異なるため、拡張機能の対応はOSとブラウザのバージョンごとに確認してください。一次情報: https://bugs.webkit.org/show_bug.cgi?id=305459",
	},
	{
		id: "chrome-android",
		name: "Google Chrome（Android）",
		link: "https://web.dev/articles/webxr",
		category: "browser",
		features: [
			"ARCore対応端末でWebXR AR Module（immersive-ar）に対応しています",
			"Hit Test、DOM Overlays、Anchors、Hand Input（131+）に対応しています",
		],
		notes:
			"ARCore対応端末が前提です。スマートフォン向けWebXR ARの代表的な実行環境です。",
	},
	{
		id: "samsung-internet",
		name: "Samsung Internet",
		link: "https://developer.samsung.com/internet",
		category: "browser",
		features: [
			"Android向けブラウザで、ARCore経由のWebXR ARに対応しています",
			"Samsung Galaxy XR（Android XR）向けにも提供されています",
		],
		notes: "Chromeと同じChromiumベースで動作します。",
	},
	{
		id: "chromium-steam-frame",
		name: "Chromium（Steam Frame / SteamOS Beta）",
		link: STEAM_FRAME_WEBXR.articleUrl,
		category: "browser",
		features: [
			STEAM_FRAME_WEBXR.summary,
			"OSのBeta切り替え: Settings > System > System Update Channel",
		],
		notes: `${STEAM_FRAME_WEBXR.limitations}（${STEAM_FRAME_WEBXR.lastChecked}に公式情報を確認）。一次情報: ${STEAM_FRAME_WEBXR.sourceUrl}`,
	},
	{
		id: "chrome-edge-desktop",
		name: "Google Chrome / Microsoft Edge（デスクトップ）",
		link: "https://chromestatus.com/features?q=webxr",
		category: "browser",
		features: [
			"PC接続型ヘッドセットとOpenXRランタイムを組み合わせてWebXRを利用できます",
			"Hand Input Module（131+）に対応しています。両ブラウザともChromiumベースです",
		],
		notes:
			"HTC VIVE Pro 2などのPCVRヘッドセットを接続したPCでWebXRコンテンツを開けます。",
	},
	{
		id: "xrift",
		name: "XRift",
		link: "https://xrift.net/",
		category: "service",
		features: [
			"アプリを入れずにブラウザから参加できるメタバースサービスです",
			"React Three Fiberベースでワールドを構築でき、URLを共有するだけで入れます",
		],
		notes:
			"PC・スマートフォン・VRヘッドセットから同じワールドへ入れる国内発のサービスです。",
	},
	{
		id: "deovr",
		name: "DeoVR",
		link: "https://deovr.com/",
		category: "service",
		features: [
			"360°・180°・3DのVR動画や写真を配信するメディアプラットフォームです",
			"8K・120fps再生やパススルー表示に対応しています",
		],
		notes: "Webブラウザと専用アプリの両方で利用できます。",
	},
];
