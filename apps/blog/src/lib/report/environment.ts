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
	if (/Quest\s?3S\b/i.test(ua)) return "Meta Quest 3S";
	if (/Quest\s?Pro\b/i.test(ua)) return "Meta Quest Pro";
	if (/Quest\s?3\b/i.test(ua)) return "Meta Quest 3";
	if (/Quest\s?2\b/i.test(ua)) return "Meta Quest 2";
	if (/OculusBrowser|Quest\b|Oculus\b/i.test(ua)) return "Meta Quest";
	if (/PICO\s?4\s?Ultra\b/i.test(ua)) return "PICO 4 Ultra";
	if (/PICO\s?4\b/i.test(ua)) return "PICO 4";
	if (/PicoBrowser|Pico\s?Browser|PICO\b/i.test(ua)) return "PICO";
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
	["Quest Browser", /OculusBrowser\/(\d{1,4})(?:\.(\d{1,4}))?/i],
	["PICO Browser", /Pico\s?Browser\/(\d{1,4})/i],
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
