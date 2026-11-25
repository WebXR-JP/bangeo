/**
 * User-Agent から「端末 / ブラウザ」の表示名を作る。
 *
 * レポート画面の見出しと結果画像に使う。User-Agent はブラウザの中で読むだけで、
 * どこにも送らない。機種を判別できないときは推測で埋めず、OS名までにとどめる。
 */
export interface ReportEnvironment {
	/** 機種が分かるヘッドセットは機種名、それ以外はOS・端末の種類 */
	device: string;
	/** ブラウザ名とバージョン */
	browser: string;
	/** 「端末 / ブラウザ」 */
	label: string;
}

function detectDevice(ua: string): string {
	// 機種名はUA先頭のプラットフォーム欄だけを見る。
	// PICOの「like Quest」やOculusBrowserは、Quest本体の根拠にならない。
	const fields = ua.match(/\(([^)]*)\)/)?.[1].split(";") ?? [];
	const models = fields.map((field) => field.trim());
	const pico = models.find((model) => /^PICO(?:\b|\d)/i.test(model));
	if (pico) {
		if (/^PICO\s*4\s*Ultra\b/i.test(pico)) return "PICO 4 Ultra";
		if (/^PICO\s*4\b/i.test(pico)) return "PICO 4";
		if (/^PICO$/i.test(pico)) return "PICO";
		return "不明な端末";
	}
	if (!/\bPico\s?Browser\/|\blike\s+Quest\b/i.test(ua)) {
		const quest = models.find((model) =>
			/^(?:Meta\s+|Oculus\s+)?Quest\b/i.test(model),
		);
		if (quest) {
			if (/^(?:Meta\s+|Oculus\s+)?Quest\s*3S\b/i.test(quest)) return "Meta Quest 3S";
			if (/^(?:Meta\s+|Oculus\s+)?Quest\s*Pro\b/i.test(quest)) return "Meta Quest Pro";
			if (/^(?:Meta\s+|Oculus\s+)?Quest\s*3\b/i.test(quest)) return "Meta Quest 3";
			if (/^(?:Meta\s+|Oculus\s+)?Quest\s*2\b/i.test(quest)) return "Meta Quest 2";
			if (/^(?:Meta\s+|Oculus\s+)?Quest$/i.test(quest)) return "Meta Quest";
			return "不明な端末";
		}
	}
	if (
		/\b(?:Pico\s?Browser|OculusBrowser|Wolvic)\/|(?:^|\s)VR\b|\blike\s+Quest\b/i.test(
			ua,
		)
	) {
		return "不明な端末";
	}
	if (/iPhone/i.test(ua)) return "iPhone";
	if (/iPad/i.test(ua)) return "iPad";
	if (/Android/i.test(ua)) return "Android";
	if (/Windows/i.test(ua)) return "Windows";
	if (/CrOS/i.test(ua)) return "ChromeOS";
	if (/Macintosh/i.test(ua)) return "macOS";
	if (/Linux/i.test(ua)) return "Linux";
	return "不明な端末";
}

/** 判定順に意味がある。Chromium系は UA に Chrome/ を含むので、派生ブラウザを先に見る */
const browserPatterns: [name: string, pattern: RegExp][] = [
	["PICO Browser", /Pico\s?Browser\/(\d{1,4})/i],
	["Quest Browser", /OculusBrowser\/(\d{1,4})(?:\.(\d{1,4}))?/i],
	["Wolvic", /Wolvic\/(\d{1,4})/i],
	["Edge", /(?:Edg|EdgA|EdgiOS)\/(\d{1,4})/i],
	["Samsung Internet", /SamsungBrowser\/(\d{1,4})/i],
	["Opera", /OPR\/(\d{1,4})/i],
	["Firefox", /(?:Firefox|FxiOS)\/(\d{1,4})/i],
	["Chrome", /(?:Chrome|CriOS)\/(\d{1,4})/i],
	["Safari", /Version\/(\d{1,4}).*Safari/i],
];

function detectBrowser(ua: string): string {
	for (const [name, pattern] of browserPatterns) {
		if (
			name === "Quest Browser" &&
			(/\((?:[^)]*;\s*)?\s*PICO(?:\b|\d)/i.test(ua) ||
				/\blike\s+Quest\b/i.test(ua))
		) {
			continue;
		}
		const match = ua.match(pattern);
		if (!match) continue;
		// Quest Browser はマイナーバージョンで WebXR の挙動が変わるため小数第1位まで出す
		const version =
			name === "Quest Browser" && match[2]
				? `${match[1]}.${match[2]}`
				: match[1];
		return `${name} ${version}`;
	}
	return "不明なブラウザ";
}

export function describeReportEnvironment(ua: string): ReportEnvironment {
	const device = detectDevice(ua);
	const browser = detectBrowser(ua);
	return { device, browser, label: `${device} / ${browser}` };
}
