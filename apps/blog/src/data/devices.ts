import { STEAM_FRAME_WEBXR } from "./steam-frame-webxr";

export type DeviceWebxrSummary = {
	id: string;
	name: string;
	type: string;
	manufacturer: string;
	webxrSupport: {
		status: "対応" | "条件付き対応" | "非対応" | "未確認";
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
		id: "steam-frame",
		name: "Steam Frame",
		type: "VR",
		manufacturer: "Valve",
		webxrSupport: {
			status: "条件付き対応",
			detail: `${STEAM_FRAME_WEBXR.summary} ${STEAM_FRAME_WEBXR.limitations}（${STEAM_FRAME_WEBXR.lastChecked}に公式情報を確認）`,
		},
		browsers: [
			"Chromium 157以降（SteamOS 0.5.7 Beta。配布元や設定条件は個別確認が必要）",
		],
		connectionType:
			"スタンドアロン（SteamOS）。PCからVRコンテンツを無線ストリーミングできます。",
		priceRange: "地域・構成によって異なります（公式ストアで確認が必要）",
		availability: "販売状況は地域によって異なります（公式ストアで確認が必要）。",
		notes: [
			"Valveはスタンドアロン動作とSteamVR・OpenXRへの対応を案内しています。",
			"Preview CandidateとChrome 157試験ビルド・権限調整による第三者の起動報告がありますが、Betaの標準状態での動作保証ではありません。",
			`WebXR対応の公式発表: ${STEAM_FRAME_WEBXR.sourceUrl}`,
			"出典: https://partner.steamgames.com/doc/steamhardware/steamframe",
		],
	},
	{
		id: "meta-vr-glasses",
		name: "Meta VR Glasses",
		type: "VRグラス（発売前）",
		manufacturer: "Meta",
		webxrSupport: {
			status: "未確認",
			detail:
				"MetaがWebXRへの対応を予定していますが、発売前のため実機での動作は未確認です。",
		},
		browsers: ["WebXR対応予定（実機のブラウザバージョンは未確認）"],
		connectionType:
			"開発環境はIWSDK Emulator（IWER）を使用します。Quest 3・3Sでも入力や視野の一部を確認できます。",
		priceRange: "1,299.99米ドル（日本円価格は未定）",
		availability: "発売前（2027年春予定）。",
		notes: [
			"ハンドトラッキング中心（Hands-first）の設計です。視線による対象指定と手のピンチ操作を想定しており、視線情報の扱いにはプライバシー上の制約があります。",
			"2D Webページでは視線によるCSS :hoverやpointer hoverイベントが発火しないため、hoverに依存するUIは使えません。IWSDKの3D操作には別途Hovered状態が用意されています。",
			"WebXR Layers、Depth、Anchors、WebGPU XR、immersive-arの対応状況は未確認です。",
			"出典: https://developers.meta.com/horizon/documentation/iwsdk/guides/get-started-glasses/",
			"出典: https://developers.meta.com/horizon/documentation/web/2d-web/",
			"価格の出典: https://about.fb.com/ja/news/2026/09/meta-vr-glasses/",
		],
	},
	{
		id: "meta-quest-3",
		name: "Meta Quest 3",
		type: "VR/MR",
		manufacturer: "Meta",
		webxrSupport: {
			status: "対応",
			detail:
				"標準のMeta Quest Browserで、WebXRのVR・MRコンテンツを開けます。",
		},
		browsers: [
			"Meta Quest Browser（Chromium系）",
			"Wolvic（Firefox Realityの後継）",
			"PC接続時はChrome・EdgeなどのPCブラウザ",
		],
		connectionType:
			"スタンドアロン。Meta Quest Link・Air LinkでPCに接続すればPCVRとしても使えます。",
		priceRange: "102,300円（512GB、税込／2026年4月19日改定）",
		availability:
			"販売中（2023年10月発売）。2026年4月19日に日本国内価格が改定されました。",
		notes: [
			"カラーのパススルーカメラを備え、MR体験に対応しています。",
			"Quest 2と比べて解像度・視野角・処理性能が引き上げられています。",
			"PCに接続すれば、SteamVR向けのVRコンテンツも利用できます。",
		],
	},
	{
		id: "meta-quest-3s",
		name: "Meta Quest 3S",
		type: "VR/MR",
		manufacturer: "Meta",
		webxrSupport: {
			status: "対応",
			detail: "Quest 3と同じブラウザ環境でWebXRを利用できます。",
		},
		browsers: [
			"Meta Quest Browser（Chromium系）",
			"Wolvicなどのサードパーティ製VRブラウザ",
		],
		connectionType: "スタンドアロン。PC接続（Link・Air Link）に対応しています。",
		priceRange:
			"59,400円（128GB）、77,000円（256GB）（税込／2026年4月19日改定）",
		availability:
			"販売中（2024年9月発売）。2026年4月19日に日本国内価格が改定されました。",
		notes: [
			"Quest 3と同等のチップを搭載しつつ、価格を抑えたモデルです。",
			"ディスプレイ解像度とレンズはQuest 2と同等の仕様です。",
			"手頃な価格でカラーパススルー対応のVR/MRを始められます。",
		],
	},
	{
		id: "meta-quest-2",
		name: "Meta Quest 2",
		type: "VR",
		manufacturer: "Meta",
		webxrSupport: {
			status: "対応",
			detail: "標準のMeta Quest BrowserでWebXRを利用できます。",
		},
		browsers: [
			"Meta Quest Browser",
			"Firefox Reality（現在はWolvicへ移行）",
			"PC接続時はChrome・EdgeなどのPCブラウザ",
		],
		connectionType: "スタンドアロン。PCとの有線・無線接続でPCVRにも対応します。",
		priceRange: "発売時37,000円〜（128GB税込59,400円→後に64,405円へ改定）",
		availability: "在庫限りで販売中（2020年発売、後継機の登場に伴い生産終了見込み）。",
		notes: [
			"広く普及したスタンドアロンVRヘッドセットで、対応アプリが豊富です。",
			"ユーザー数が多く、既存のWebXRコンテンツでも動作確認の対象になりやすい機種です。",
			"Quest 3シリーズと比べると解像度や処理性能は控えめです。",
		],
	},
	{
		id: "meta-quest-pro",
		name: "Meta Quest Pro",
		type: "VR/MR",
		manufacturer: "Meta",
		webxrSupport: {
			status: "対応",
			detail: "Questシリーズ共通のMeta Quest BrowserでWebXRを利用できます。",
		},
		browsers: [
			"Meta Quest Browser（標準）",
			"WolvicなどのVRブラウザ",
			"PC接続時はPCブラウザ",
		],
		connectionType: "スタンドアロン。PC接続（Link）に対応しています。",
		priceRange: "販売終了（終売時価格 159,500円）",
		availability:
			"2024年9月に公式販売を終了しました。現在は中古・在庫限りの流通です。",
		notes: [
			"法人用途も想定した上位モデルです。",
			"カラーパススルーカメラによるMR表示に対応しています。",
			"視線追跡と表情トラッキングを標準で備えています。",
			"現行のラインナップはQuest 3とQuest 3Sに一本化されています。",
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
				"内蔵のVIVE BrowserでWebXRコンテンツをそのまま開けます。Wolvicにも対応しています。",
		},
		browsers: ["VIVE Browser（公式）", "Wolvic（VIVE公式ストアから導入）"],
		connectionType:
			"スタンドアロン。無線・有線（DisplayPort対応）でSteamVRに接続できます。",
		priceRange: "169,000円（税込）",
		availability: "販売中（2025年1月発売）。",
		notes: [
			"片目2448×2448の高解像度と最大120度の視野角を備えています。",
			"標準でアイトラッキングに対応し、オプションでフェイストラッカーも追加できます。",
			"単体でのVR/MRだけでなく、PC接続でPCVRとしても使えます。",
			"本体価格が高く、重量や発熱には注意が必要です。",
		],
	},
	{
		id: "vive-xr-elite",
		name: "HTC VIVE XR Elite",
		type: "VR/MR",
		manufacturer: "HTC",
		webxrSupport: {
			status: "対応",
			detail: "VIVE BrowserやWolvicでWebXRを利用できます。",
		},
		browsers: ["VIVE Browser", "Wolvic"],
		connectionType:
			"スタンドアロン。PC接続（SteamVR・Viveport）に対応しています。",
		priceRange: "164,000円（税込）",
		availability: "販売中（2023年発売）。",
		notes: [
			"コンパクトなゴーグル型で軽量な設計です。",
			"バッテリークレードルを外して眼鏡型モードに切り替えられます。",
			"眼鏡型モードでは画面の明るさに制限がかかります。",
			"価格が高めのため、軽量さや携帯性を重視する用途で選ばれます。",
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
				"PC接続型のため、PCブラウザからSteamVR・OpenXR経由でWebXRを利用できます。",
		},
		browsers: [
			"PC上のChrome・Edge・Firefoxなど",
			"SteamVRをOpenXRランタイムに設定して利用",
		],
		connectionType:
			"PC有線接続（DisplayPort・USB）。SteamVRベースステーション方式。",
		priceRange: "ヘッドセット単体103,400円前後、フルセットで約15万円",
		availability: "販売中（2021年6月発売）。",
		notes: [
			"両眼合計5K相当の高解像度と120Hz表示に対応しています。",
			"外部ベースステーション方式で精度の高い6DoFトラッキングが行えます。",
			"高性能なPCと周辺機器の設置が必要になるため、導入の手間は大きめです。",
		],
	},
	{
		id: "pico-4",
		name: "PICO 4",
		type: "VR",
		manufacturer: "PICO",
		webxrSupport: {
			status: "対応",
			detail: "標準のPICO BrowserでWebXRのVRコンテンツを開けます。",
		},
		browsers: [
			"PICO Browser（Chromiumベース）",
			"WolvicなどのXRブラウザをサイドロード可能",
		],
		connectionType: "スタンドアロン。PC接続でSteamVRも利用できます。",
		priceRange: "約47,000〜59,000円（128GB: 49,000円、256GB: 59,400円）",
		availability: "販売中（2022年10月発売）。",
		notes: [
			"片目2160×2160、最大90Hz駆動のディスプレイを備えています。",
			"パススルーは単眼カラーで歪みが出やすく、MR用途は限定的です。",
			"別売のPICO Motion Trackerと組み合わせると全身トラッキングに対応します。",
		],
	},
	{
		id: "pico-4-ultra",
		name: "PICO 4 Ultra",
		type: "VR/MR",
		manufacturer: "PICO",
		webxrSupport: {
			status: "対応",
			detail: "PICO BrowserでWebXRを利用できます。",
		},
		browsers: ["PICO Browser（Chromium系）"],
		connectionType: "スタンドアロン。PC接続（SteamVR）に対応しています。",
		priceRange: "104,900円（256GBモデルのみ、税込／2026年5月1日改定）",
		availability:
			"販売中（2024年9月発売）。2026年5月1日に日本国内価格が改定されました。",
		notes: [
			"PICO 4の上位モデルで、ステレオカラーカメラによるMR表示に対応しています。",
			"Snapdragon XR2 Gen 2を搭載しています。",
			"PICO Motion Trackerと組み合わせた全身トラッキングに対応しています。",
		],
	},
	{
		id: "samsung-galaxy-xr",
		name: "Samsung Galaxy XR",
		type: "VR/MR",
		manufacturer: "Samsung",
		webxrSupport: {
			status: "対応",
			detail:
				"Chrome on Android XRの公式API一覧ではWebXRに対応しています。端末ごとのモードや機能の取得条件は個別の確認が必要です（2026年10月14日確認）。",
		},
		browsers: ["Chrome for Android XR", "Samsung Internet（Android XR向け）"],
		connectionType: "スタンドアロン（Android XR）。",
		priceRange: "米国希望小売価格 $1,799.99（日本国内価格は未発表）",
		availability:
			"米国・韓国で2025年10月22日発売。日本国内での発売日と価格は未発表です。",
		notes: [
			"GoogleのAndroid XRを初めて搭載したヘッドセットです。",
			"公式WebXR API一覧: https://developer.android.com/develop/xr/web （端末別の実測結果ではありません）。",
			"Snapdragon XR2+ Gen 2と片目4K Micro-OLEDを採用しています。",
			"コントローラー、ハンドトラッキング、視線とピンチ操作の3方式に対応しています。",
			"Geminiが統合されており、音声アシスタント機能を備えています。",
		],
	},
];

export const AR_DEVICES: DeviceWebxrSummary[] = [
	{
		id: "xreal-aura",
		name: "XREAL AURA（旧Project Aura）",
		type: "光学シースルーXRグラス",
		manufacturer: "XREAL",
		webxrSupport: {
			status: "未確認",
			detail:
				"公式のWebXR 3Dペイントデモは公開されていますが、製品版での実機検証待ちです（2026年10月13日確認）。Android XRの対応一覧とAURAでの実測結果は分けて確認します。",
		},
		browsers: ["Chrome（製品ページのアプリ一覧に記載。OSとChromeのバージョンは未確認）"],
		connectionType: "専用コンピュートパックとの有線接続（Android XR）。",
		priceRange: "地域・構成によって異なります（公式案内で確認が必要）",
		availability: "予約・出荷状況は地域ごとの公式案内で確認が必要です。",
		notes: [
			"視野角70°の光学シースルー方式で、6DoFとハンドトラッキングが案内されています。カメラパススルーとは表示方式が異なります。",
			"immersive-ar・immersive-vr、フラグ設定、入力プロファイル、コントローラー、Depth・Anchorsの取得条件は実機未確認です。",
			"LayersとWebGPUのWebXR連携は未確認です。通常ページのWebGPU対応からそのまま推測することはできません。",
			"出典: https://www.xreal.com/us/aura",
			"公式デモ: https://www.xreal.com/uk/blog/project-aura-google-io-2026",
		],
	},
	{
		id: "android-arcore",
		name: "Androidスマートフォン（ARCore対応）",
		type: "AR",
		manufacturer: "Google / 各社",
		webxrSupport: {
			status: "対応",
			detail:
				"Android版ChromeでWebXR AR Moduleを利用できます。ARCore対応端末が前提です。",
		},
		browsers: ["Chrome for Android", "Samsung Internet（対応端末のみ）"],
		connectionType: "スマートフォン単体（背面カメラ）",
		priceRange: "端末によって異なります",
		availability: "販売中（端末によって異なります）",
		notes: [
			"ARCoreに対応した機種が必要です。",
			"背面カメラの映像に重ねて現実空間へ3Dオブジェクトを配置できます。",
			"OSやブラウザの更新によって挙動が変わることがあります。",
		],
	},
	{
		id: "ios-arkit",
		name: "iPhone / iPad（ARKit対応）",
		type: "AR",
		manufacturer: "Apple",
		webxrSupport: {
			status: "非対応",
			detail:
				"iOS SafariはWebXR ARに未対応です。WebXR ViewerやApp Clip経由で体験する方法があります。",
		},
		browsers: [
			"Safari（iOS）: WebXR AR未対応",
			"WebXR Viewer（専用アプリ）",
			"App Clip（EyeJack・Variant Launchなど）",
		],
		connectionType: "スマートフォン・タブレット単体（背面カメラ）",
		priceRange: "端末によって異なります",
		availability: "販売中（端末によって異なります）",
		notes: [
			"Safari単体ではWebXR ARを使えません。",
			"App Clipを組み合わせれば、アプリのフルインストールなしで体験を届けられます。",
			"ARKitに対応した機種が前提です。",
		],
	},
	{
		id: "apple-vision-pro",
		name: "Apple Vision Pro（M5）",
		type: "MR",
		manufacturer: "Apple",
		webxrSupport: {
			status: "対応",
			detail:
				"visionOSのSafariでimmersive-vrを利用できます。immersive-arや各拡張機能の対応は個別に確認が必要です。",
		},
		browsers: ["Safari on visionOS"],
		connectionType: "スタンドアロン（visionOS）",
		priceRange:
			"599,800円（256GB）、634,800円（512GB）、669,800円（1TB）（税込）",
		availability: "販売中（2025年10月22日にM5チップ搭載モデルが発売）。",
		notes: [
			"視線と手のジェスチャーを中心に操作します。",
			"一次情報: https://bugs.webkit.org/show_bug.cgi?id=305459 （2026年1月にimmersive-ar未対応時の誤判定を修正）",
			"visionOSのSafariはimmersive-vrに対応していますが、immersive-arの対応は確認できていません（2026年10月14日確認）。",
			"M5チップを搭載し、最大120Hzのリフレッシュレートに対応しています。",
			"デュアルニットバンドにより装着感が見直されています。",
		],
	},
];
