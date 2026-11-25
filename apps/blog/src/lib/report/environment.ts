/**
 * User-Agent と、必要な場合だけ端末のクライアントヒントから表示名を作る。
 *
 * レポート画面の見出しと結果画像に使う。User-Agent はブラウザの中で読むだけで、
 * どこにも送らない。ブラウザが機種を公開しない場合は、分かる範囲だけ表示する。
 */
export interface ReportEnvironment {
	/** 機種が分かるヘッドセットは機種名、それ以外はOS・端末の種類 */
	device: string;
	/** ブラウザ名とバージョン */
	browser: string;
	/** 「端末 / ブラウザ」 */
	label: string;
}

interface LocalDeviceHints {
	model?: string;
	formFactors?: readonly string[];
}

// 製品名・型番だけを許可する。汎用の Android / Chrome / SamsungBrowser は機種の根拠にしない。
function detectNamedDevice(field: string): string | null {
	const model = field.replace(/\s+Build\/.*$/i, "").trim();
	if (/^(?:(?:Samsung\s+)?Galaxy\s+XR|SM-I610)$/i.test(model)) {
		return "Samsung Galaxy XR";
	}
	if (/^(?:XREAL\s+AURA|B6111)$/i.test(model)) return "XREAL AURA";
	if (/^(?:Apple\s+)?Vision\s+Pro$/i.test(model)) return "Apple Vision Pro";
	if (/^Steam\s+Frame$/i.test(model)) return "Steam Frame";
	return null;
}

function detectDevice(ua: string, hints: LocalDeviceHints = {}): string {
	// 機種名はUA先頭のプラットフォーム欄だけを見る。
	// PICOの「like Quest」やOculusBrowserは、Quest本体の根拠にならない。
	const fields = ua.match(/\(([^)]*)\)/)?.[1].split(";") ?? [];
	const models = fields.map((field) => field.trim());
	for (const model of models) {
		const device = detectNamedDevice(model);
		if (device) return device;
	}
	if (hints.formFactors?.includes("XR") && hints.model) {
		const device = detectNamedDevice(hints.model);
		if (device) return device;
	}
	const pico = models.find((model) => /^PICO(?:\b|\d)/i.test(model));
	if (pico) {
		if (/^PICO\s*4\s*Ultra\s+Enterprise\b/i.test(pico))
			return "PICO 4 Ultra Enterprise";
		if (/^PICO\s*4\s*Ultra\b/i.test(pico)) return "PICO 4 Ultra";
		if (/^PICO\s*4\s+Enterprise\b/i.test(pico)) return "PICO 4 Enterprise";
		if (/^PICO\s*4\b/i.test(pico)) return "PICO 4";
		if (/^PICO\s*Neo\s*3\b/i.test(pico)) return "PICO Neo3";
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
			if (/^(?:Meta\s+|Oculus\s+)?Quest\s*3\b/i.test(quest)) {
				return "Meta Quest 3系（3・3Sの区別不可）";
			}
			if (/^(?:Meta\s+|Oculus\s+)?Quest\s*2\b/i.test(quest)) return "Meta Quest 2";
			if (/^(?:Meta\s+|Oculus\s+)?Quest$/i.test(quest)) return "Meta Quest";
			return "不明な端末";
		}
	}
	if (
		hints.formFactors?.includes("XR") ||
		models.some((field) => /^(?:Android XR|visionOS)\b/i.test(field))
	) {
		return "XR端末（機種不明）";
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
	if (/Macintosh/i.test(ua)) {
		// macOS、iPadOS、visionOS の Safari で同じ形式になることがある。
		return /Version\/\d+.*Safari/i.test(ua) ? "Apple端末（機種不明）" : "macOS";
	}
	if (/Linux/i.test(ua)) return "Linux系（機種不明）";
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

export function describeReportEnvironment(
	ua: string,
	hints?: LocalDeviceHints,
): ReportEnvironment {
	const device = detectDevice(ua, hints);
	const browser = detectBrowser(ua);
	return { device, browser, label: `${device} / ${browser}` };
}

/**
 * Chromium系のデスクトップ形式UAは、Galaxy XR / AURAでも一般のLinuxと同じことがある。
 * フォームファクターを画面内でのみ取得し、XRの場合に限って機種ヒントを参照する。
 */
export async function resolveReportEnvironment(
	navigator: Navigator,
): Promise<ReportEnvironment> {
	const ua = navigator.userAgent;
	const fallback = describeReportEnvironment(ua);
	const clientHints = (
		navigator as Navigator & {
			userAgentData?: {
				getHighEntropyValues(keys: string[]): Promise<LocalDeviceHints>;
			};
		}
	).userAgentData;

	if (
		!clientHints ||
		!["Android", "Linux系（機種不明）", "XR端末（機種不明）"].includes(
			fallback.device,
		)
	) {
		return fallback;
	}
	try {
		const { formFactors } = await clientHints.getHighEntropyValues([
			"formFactors",
		]);
		if (!formFactors?.includes("XR")) return fallback;
		const { model }: LocalDeviceHints = await clientHints
			.getHighEntropyValues(["model"])
			.catch(() => ({}));
		return describeReportEnvironment(ua, { formFactors, model });
	} catch {
		return fallback;
	}
}
