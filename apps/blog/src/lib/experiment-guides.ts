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
	ready: "動作確認済",
	lab: "Lab",
	preview: "プレビュー可",
	limited: "条件付き",
	unsupported: "非対応",
	unknown: "要実機確認",
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
	"vr-basics": "VR動作チェック",
	"mr-lab": "MR / AR Lab",
	"smartphone-ar": "スマホWebAR",
};

export const trackDescription: Record<Track, string> = {
	"vr-basics":
		"新しいMeta QuestやPICOで最初に回す基本チェック。VR入室 → 音・入力 → 描画fallback → 境界の順で、端末の素性を切り分けます。",
	"mr-lab":
		"パススルーAR、hit-test、depth、room meshなど端末依存が強い機能のLab。事前判定パネルで対応可否を確認してから入ります。",
	"smartphone-ar":
		"WebXRではなくカメラベースWebARの枠。iPhone / Androidのブラウザで動かします。",
};

export const trackOrder: Track[] = ["vr-basics", "mr-lab", "smartphone-ar"];

const commonVrFlow = [
	"Meta Quest / PICO のブラウザでこのページを開く。PCで見ている場合は「ヘッドセットに送る」のQRコードかURLコピーを使う。",
	"「デモを全画面で開く」から開き、事前判定パネルで対応チェックがすべて✓になっているのを確認して開始する。",
	"入室できたら、頭を左右に振る・コントローラーで選択する・終了して戻れるかを確認する。",
];

const experimentGuides: Record<string, ExperimentGuide> = {
	"webxr-audio-space": {
		statusLabel: "Quest / PICO のVR入門テスト向き",
		statusReadiness: "ready",
		summary: "VRに入って、頭を動かすと音の定位が変わるかを確かめる",
		intent:
			"まず新しいVRデバイスで WebXR のセッション開始、視点更新、音の定位が最低限成立するかを見る入口デモです。開始ボタンを押すと音が鳴り、頭の向きで左右・前後・距離が変わります。",
		primaryDevice: "Meta Quest / PICO / PC Browser",
		track: "vr-basics",
		launchHref: "/demos/webxr-audio-space",
		featuredOrder: 1,
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "ready",
				note: "Quest Browserで immersive-vr と空間音響の体感確認。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "PICO BrowserでまずVR入室と音の左右差を確認。事前判定パネルで失敗理由が表示される。",
			},
			{
				label: "PC",
				readiness: "preview",
				note: "ドラッグ視点＋イヤホンでWeb Audioの定位を確認。PC VRは環境依存。",
			},
		],
		flow: [
			"デモを開くと事前判定パネルが出る。すべて✓なら「VRを開始する」を押す（同時に音が鳴る）。",
			"前後左右の音源（4色の球体）に頭を向けて、定位が変わるか確認する。",
			"PICOでは、音が鳴る / 鳴らない、定位が左右だけか、頭向きに追従するかを記録する。",
		],
		fallback:
			"VRに入れない環境では、事前判定パネルにどのチェックで止まったかが表示されます。PCブラウザでは背景クリックで音を開始し、ドラッグ視点で定位を確認できます。",
		qualityCheck:
			"合格ラインは「VRに入れる」「開始と同時に音が鳴る」「頭の向きで定位が変わる」「終了してページに戻れる」の4点です。",
	},
	"iwsdk-gallery": {
		statusLabel: "Quest中心のVR体験デモ",
		statusReadiness: "ready",
		summary: "VR空間内で記事カードを選び、遷移なしで本文まで読む",
		intent:
			"記事カードをVR空間内で選び、遷移せずに本文まで読む導線を確認するデモです。BANGEOの“体験として見える”代表枠に置きます。",
		primaryDevice: "Meta Quest / PC VR",
		track: "vr-basics",
		launchHref: "/demo/iwsdk-gallery",
		featuredOrder: 2,
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "ready",
				note: "本命。カード選択、本文パネル、戻る操作を確認。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "IWSDK依存部分があるため、まず起動可否とコントローラー選択を実機確認。",
			},
			{
				label: "デスクトップ",
				readiness: "preview",
				note: "通常表示でレイアウトとカード内容を確認。",
			},
		],
		flow: commonVrFlow,
		fallback:
			"VRに入れない端末では、通常ブラウザでカードの見た目だけを確認します。コントローラー入力が取れない場合は、ポインタークリックで最低限の選択導線を検証します。",
		qualityCheck:
			"合格ラインは「カードが読める距離に出る」「選択時に本文が出る」「VR内で迷子にならない」「フレーム落ちで酔わない」です。",
	},
	"webgpu-fallback-lab": {
		statusLabel: "描画経路の診断デモ",
		statusReadiness: "lab",
		summary: "WebGPUが使えるか、WebGLに落ちるかを画面上で診断する",
		intent:
			"新しいVRデバイスで WebGPU を前提にしてよいか、WebGL fallback に落とすべきかを判断する検査デモです。",
		primaryDevice: "Meta Quest / PICO / Desktop",
		track: "vr-basics",
		launchHref: "/demos/webgpu-fallback-lab/xr.html",
		featuredOrder: 3,
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "lab",
				note: "WebGPU有無とWebXR表示を分けて確認。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "navigator.gpu / requestAdapter の結果とWebGL fallbackを記録。",
			},
			{
				label: "Desktop",
				readiness: "ready",
				note: "Chrome / EdgeでWebGPUまたはWebGL fallbackを確認。",
			},
		],
		flow: [
			"通常プレビューで navigator.gpu と adapter 取得結果を見る。",
			"WebGPU優先 / WebGL固定を切り替え、fallbackの表示が破綻しないか確認する。",
			"VRデモで、WebXR表示はWebGLで成立しつつ、WebGPUの可否を画面上に出す。",
		],
		fallback:
			"WebGPUが使えない端末ではWebGL表示を正解扱いにします。重要なのは“失敗”ではなく、ユーザーに落ちた理由が見えることです。",
		qualityCheck:
			"合格ラインは「対応検出が表示される」「WebGPU不可でも描画が残る」「XRに入れない時も診断結果が読める」です。",
	},
	"room-scale-bounds-viewer": {
		statusLabel: "Questの境界確認Lab",
		statusReadiness: "lab",
		summary: "プレイエリア境界（boundsGeometry）を床に描画して確認する",
		intent:
			"ルームスケール境界、床基準、再センタリング後のずれを確認するための実機検査デモです。bounded-floorが取れない場合はlocal-floorへのフォールバックを明示します。",
		primaryDevice: "Meta Quest",
		track: "vr-basics",
		launchHref: "/demos/room-tracking",
		featuredOrder: 4,
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "lab",
				note: "bounded-floor / local-floor と境界形状を確認。Quest Browser 146以降推奨。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "bounded-floorが取れない場合はlocal-floor fallbackの見え方を確認。",
			},
			{
				label: "Desktop",
				readiness: "preview",
				note: "概念プレビュー。実境界の評価はヘッドセット必須。",
			},
		],
		flow: [
			"プレイエリアを設定済みのMeta Questで開く。",
			"事前判定パネルからVRを開始し、境界線・頂点マーカー・床高さを確認する。",
			"再センタリング後に境界表示がどれだけずれるか（resetイベント）を見る。",
		],
		fallback:
			"bounded-floorが使えない場合はlocal-floorに自動で落とし、画面上に“フォールバック中”と明示します。境界なしでも床基準のずれが見える状態を最低ラインにします。",
		qualityCheck:
			"合格ラインは「bounded-floorが取れる、またはlocal-floor fallbackが明示される」「境界頂点数が表示される」「終了後に説明ページへ戻れる」です。",
	},
	"hit-test-advanced": {
		statusLabel: "AR配置の実機テスト",
		statusReadiness: "limited",
		summary: "現実の床や机にreticleを吸着させ、オブジェクトを置く",
		intent:
			"現実空間の床・机・壁を検出し、reticleと配置操作が安定するかを見るARデモです。immersive-ar非対応の環境では、事前判定パネルが理由を表示して停止します。",
		primaryDevice: "Meta Quest 3系 / Android Chrome",
		track: "mr-lab",
		launchHref: "/demos/hit-test-advanced",
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "limited",
				note: "パススルーARとHit Testの実機確認向け（Quest 3 / 3S / Pro）。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "PICOでimmersive-ar / hit-testが使えるかをまず事前判定パネルで確認。使えなければVR系へ。",
			},
			{
				label: "Android",
				readiness: "limited",
				note: "Chrome + ARCore対応端末で確認。",
			},
		],
		flow: [
			"明るく特徴点のある床や机の前で開き、事前判定パネルの結果を見る。",
			"AR開始後、reticle（リング）が面に吸着するまでゆっくり頭や端末を動かす。",
			"トリガー / タップでオブジェクトを置き、数秒後に位置が大きく漂わないか見る。",
		],
		fallback:
			"ARに入れない端末では、事前判定パネルの表示そのものが“非対応の判定結果”です。VRヘッドセットではAudio SpaceやGalleryへ戻る導線を使ってください。",
		qualityCheck:
			"合格ラインは「AR開始」「reticle追従」「配置」「漂いが少ない」の4点です。",
	},
	"quest-depth-projection-box": {
		statusLabel: "Quest MR専用Lab",
		statusReadiness: "lab",
		summary: "現実物体と仮想物体の前後関係（depth）の差を見る",
		intent:
			"現実物体と仮想物体の前後関係を、depthが使える時 / 使えない時の両方で確認するMR合成デモです。",
		primaryDevice: "Meta Quest 3 / 3S / Pro",
		track: "mr-lab",
		launchHref: "/demos/quest-depth-projection-box/xr.html",
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "lab",
				note: "depth projection / MR合成の検証向け。",
			},
			{
				label: "PICO",
				readiness: "unsupported",
				note: "Questのdepth projection検証として扱い、PICOは代替プレビューのみ。",
			},
			{
				label: "Desktop",
				readiness: "preview",
				note: "depth occlusionの概念プレビュー。",
			},
		],
		flow: [
			"通常プレビューで、箱と机エッジの前後関係を先に理解する。",
			"QuestでWebXRデモを開き、depthの有無と表示差分を確認する。",
			"depthが取れない場合でも、オクルージョンなし表示として破綻しないか見る。",
		],
		fallback:
			"depth情報が取れない時は通常3D合成に落とし、ユーザーには“depthなし表示”として明示します。",
		qualityCheck:
			"合格ラインは「depthあり / なしの差が説明できる」「depth不可でも絵が残る」「Quest以外ではLab扱いが明確」です。",
	},
	"xr-mesh-export": {
		statusLabel: "Quest部屋メッシュ専用",
		statusReadiness: "lab",
		summary: "部屋のroom meshを取得してGLBに書き出す",
		intent:
			"Meta Questのscene captureからroom meshを取得し、GLBとして書き出せるか確認する上級デモです。",
		primaryDevice: "Meta Quest 3 / 3S / Pro",
		track: "mr-lab",
		launchHref: "/demo/xr-mesh-export",
		deviceChecks: [
			{
				label: "Meta Quest 3系",
				readiness: "lab",
				note: "scene capture / mesh detection / GLB export確認。",
			},
			{
				label: "PICO",
				readiness: "unsupported",
				note: "Quest固有のroom mesh検証として扱う。",
			},
			{
				label: "Desktop",
				readiness: "unsupported",
				note: "実機専用。説明ページで手順確認のみ。",
			},
		],
		flow: [
			"Questで部屋のscene capture / 空間設定を済ませる。",
			"デモを開いてメッシュと平面数が増えるかを見る。",
			"EXPORT GLBを押し、保存されたGLBを後でビューワで開く。",
		],
		fallback:
			"mesh detectionが使えない場合は非対応として扱い、VR一般デモへ戻します。無理に疑似メッシュを成功扱いにしません。",
		qualityCheck:
			"合格ラインは「メッシュ数が増える」「semantic labelが視認できる」「GLBが保存できる」です。",
	},
	"spatial-model-preview": {
		statusLabel: "通常Web + 空間表示の入口",
		statusReadiness: "preview",
		summary: "3Dモデルのfallback（native / polyfill / 画像）を切り替えて見る",
		intent:
			"Webページ内3Dモデルのfallback設計を確認し、空間表示へ持ち込む前の見え方を整理するデモです。",
		primaryDevice: "Desktop / Mobile / Vision Pro",
		track: "mr-lab",
		launchHref: "/demos/spatial-model-preview/xr.html",
		deviceChecks: [
			{
				label: "Desktop",
				readiness: "ready",
				note: "fallbackプレビューと回転操作を確認。",
			},
			{
				label: "Meta Quest / PICO",
				readiness: "preview",
				note: "WebXR版で空間内カードの大きさだけ確認。",
			},
			{
				label: "iOS / visionOS",
				readiness: "preview",
				note: "model要素・空間Webの検証候補。",
			},
		],
		flow: [
			"通常プレビューでnative / polyfill / image fallbackを切り替える。",
			"3Dが使えない環境でも商品やモデルの意味が伝わるか確認する。",
			"WebXR版では空間内に置いた時の距離感を確認する。",
		],
		fallback:
			"3D表示に失敗してもimage fallbackを正規ルートにします。非対応環境で空白にしないことを優先します。",
		qualityCheck:
			"合格ラインは「fallbackの違いが分かる」「非対応でも内容が読める」「空間表示は補助扱い」です。",
	},
	"8thwall-face-glasses": {
		statusLabel: "スマホWebAR向け",
		statusReadiness: "ready",
		summary: "スマホのカメラで顔にサングラスを重ねる",
		intent:
			"iPhone / AndroidのカメラベースWebARで顔追従と装飾切り替えを確認するデモです。VRヘッドセットの本命枠ではなく、スマホWebAR枠として見ます。",
		primaryDevice: "iPhone / Android",
		track: "smartphone-ar",
		launchHref: "/demos/8thwall-face-glasses/demo.html",
		deviceChecks: [
			{
				label: "iPhone",
				readiness: "ready",
				note: "WebXRではなくカメラベースWebARとして確認。",
			},
			{
				label: "Android",
				readiness: "ready",
				note: "カメラ許可後、顔追従と色切替を確認。",
			},
			{
				label: "Meta Quest / PICO",
				readiness: "unsupported",
				note: "VRデバイス検証の本命からは外す。",
			},
		],
		flow: [
			"スマホブラウザで開き、カメラ許可を出す。",
			"顔を正面に入れ、サングラスが目元に追従するか見る。",
			"色切替ボタンが押せるか、照明が暗い時に崩れないか確認する。",
		],
		fallback:
			"カメラが使えない端末では説明ページで止め、WebXRデモとは別枠として案内します。",
		qualityCheck:
			"合格ラインは「カメラ許可」「顔追従」「色切替」「暗所や横向きでの崩れ具合が分かる」です。",
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
		statusLabel: "要実機確認",
		statusReadiness: "unknown",
		summary: "起動可否・入力・終了導線をまず確認する",
		intent:
			"このデモは端末ごとの対応差が出やすいため、まず起動可否・入力・終了導線を確認します。",
		primaryDevice: deviceList,
		track: "vr-basics",
		launchHref: options.href,
		deviceChecks: [
			{
				label: "Meta Quest",
				readiness: "unknown",
				note: "WebXRセッション開始とコントローラー入力を確認。",
			},
			{
				label: "PICO",
				readiness: "unknown",
				note: "起動可否とfallback表示を実機確認。",
			},
			{
				label: "Desktop",
				readiness: "preview",
				note: "概念プレビューまたはWebXR Emulatorで確認。",
			},
		],
		flow: commonVrFlow,
		fallback:
			"動かない場合は“非対応”ではなく、どの段階で止まったかを記録します。入口、権限、XR開始、入力、描画の順に切り分けます。",
		qualityCheck:
			"合格ラインは「起動」「入力」「終了」「失敗時の説明が見える」の4点です。",
	};
}
