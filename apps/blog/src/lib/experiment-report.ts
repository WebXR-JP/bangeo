/** Public, allowlisted wire format. Never add raw sensor data or identifiers here. */
export const reportDevices = [
	"unknown",
	"quest-2",
	"quest-3",
	"quest-3s",
	"quest-pro",
	"quest-other",
	"pico-4",
	"pico-4-ultra",
	"pico-other",
	"other",
] as const;
export const reportBrowsers = [
	"quest-browser",
	"pico-browser",
	"wolvic",
	"edge",
	"chrome",
	"firefox",
	"safari",
	"other",
] as const;
export const reportChecks = [
	"inline",
	"immersive-vr",
	"immersive-ar",
	"viewer",
	"local",
	"local-floor",
	"bounded-floor",
	"unbounded",
	"gamepads",
	"hand-input",
	"hit-test",
	"anchors",
	"dom-overlays",
	"depth-sensing",
	"mesh-detection",
	"lighting-estimation",
	"layers",
	"webgpu-binding",
	"body-tracking",
] as const;
export const reportFeatures = [
	"viewer",
	"local",
	"local-floor",
	"bounded-floor",
	"unbounded",
	"hand-tracking",
	"hit-test",
	"anchors",
	"dom-overlay",
	"depth-sensing",
	"mesh-detection",
	"light-estimation",
	"layers",
	"webgpu",
	"body-tracking",
] as const;
export const reportModules = [
	"hand-tracking",
	"hit-test",
	"anchors",
	"depth-sensing",
	"mesh-detection",
	"light-estimation",
	"body-tracking",
	"bounded-floor",
] as const;
export type ReportDevice = (typeof reportDevices)[number];
export type ReportBrowser = (typeof reportBrowsers)[number];
export type DetectionResult = "detected" | "not-detected" | "unknown";
export type ModuleEvidence = { dataObserved: boolean; error: boolean };
export interface SessionReport {
	mode: "inline" | "immersive-vr" | "immersive-ar";
	requestedReferenceSpace: string;
	actualReferenceSpace: string | null;
	requestedFeatures: string[];
	enabledFeatures: string[] | null;
	outcome: "ended" | "request-failed" | "runtime-error";
	frameReceived: boolean;
	poseReceived: boolean;
	modules: Partial<Record<(typeof reportModules)[number], ModuleEvidence>>;
}
export interface ExperimentReport {
	schemaVersion: 2;
	device: ReportDevice;
	browser: { family: ReportBrowser; version: string | null };
	checks: Partial<Record<(typeof reportChecks)[number], DetectionResult>>;
	session: SessionReport | null;
}
/** Parse only locally; the full UA never becomes part of the report. */
export function reportBrowser(ua: string): ExperimentReport["browser"] {
	const patterns: [ReportBrowser, RegExp][] = [
		["quest-browser", /OculusBrowser\/(\d{1,4})(?:\.(\d{1,4}))?/i],
		["pico-browser", /Pico\s?Browser\/(\d+)/i],
		["wolvic", /Wolvic\/(\d+)/i],
		["edge", /(?:Edg|EdgiOS|EdgA)\/(\d+)/i],
		["firefox", /(?:Firefox|FxiOS)\/(\d+)/i],
		["chrome", /(?:Chrome|CriOS)\/(\d+)/i],
		["safari", /Version\/(\d+).*Safari/i],
	];
	for (const [family, pattern] of patterns) {
		const match = ua.match(pattern);
		if (match)
			return {
				family,
				version:
					match[1] && Number(match[1]) <= 9999
						? family === "quest-browser" && match[2]
							? `${match[1]}.${match[2]}`
							: match[1]
						: null,
			};
	}
	return { family: "other", version: null };
}
/** Best-effort model detection; ambiguous UA strings remain unclassified. */
export function reportDevice(ua: string): ReportDevice {
	if (/Quest\s?3S\b/i.test(ua)) return "quest-3s";
	if (/Quest\s?Pro\b/i.test(ua)) return "quest-pro";
	if (/Quest\s?3\b/i.test(ua)) return "quest-3";
	if (/Quest\s?2\b/i.test(ua)) return "quest-2";
	if (/OculusBrowser|Quest\b|Oculus\b/i.test(ua)) return "quest-other";
	if (/PICO\s?4\s?Ultra\b/i.test(ua)) return "pico-4-ultra";
	if (/PICO\s?4\b/i.test(ua)) return "pico-4";
	if (/PicoBrowser|Pico\s?Browser|PICO\b/i.test(ua)) return "pico-other";
	if (/iPhone|iPad|iPod|Android/i.test(ua)) return "other";
	return "unknown";
}
function object(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === "object" && !Array.isArray(value);
}
function fields(
	value: unknown,
	keys: string[],
): value is Record<string, unknown> {
	return (
		object(value) &&
		Object.keys(value).length === keys.length &&
		keys.every((k) => Object.hasOwn(value, k))
	);
}
function member(value: unknown, choices: readonly string[]): boolean {
	return typeof value === "string" && choices.includes(value);
}
function featureList(value: unknown): value is string[] {
	return (
		Array.isArray(value) &&
		value.length <= reportFeatures.length &&
		new Set(value).size === value.length &&
		value.every((v) => member(v, reportFeatures))
	);
}
export function isExperimentReport(value: unknown): value is ExperimentReport {
	if (
		!fields(value, [
			"schemaVersion",
			"device",
			"browser",
			"checks",
			"session",
		]) ||
		value.schemaVersion !== 2 ||
		!member(value.device, reportDevices)
	)
		return false;
	const b = value.browser;
	if (
		!fields(b, ["family", "version"]) ||
		!member(b.family, reportBrowsers) ||
		!(
			b.version === null ||
			(typeof b.version === "string" &&
				(b.family === "quest-browser"
					? /^[1-9]\d{0,3}(?:\.\d{1,4})?$/.test(b.version)
					: /^[1-9]\d{0,3}$/.test(b.version)))
		)
	)
		return false;
	if (
		!object(value.checks) ||
		!Object.keys(value.checks).length ||
		!Object.entries(value.checks).every(
			([k, v]) =>
				member(k, reportChecks) &&
				member(v, ["detected", "not-detected", "unknown"]),
		)
	)
		return false;
	const s = value.session;
	if (s === null) return true;
	if (
		!fields(s, [
			"mode",
			"requestedReferenceSpace",
			"actualReferenceSpace",
			"requestedFeatures",
			"enabledFeatures",
			"outcome",
			"frameReceived",
			"poseReceived",
			"modules",
		])
	)
		return false;
	const spaces = [
		"viewer",
		"local",
		"local-floor",
		"bounded-floor",
		"unbounded",
	];
	if (
		!member(s.mode, ["inline", "immersive-vr", "immersive-ar"]) ||
		!member(s.requestedReferenceSpace, spaces) ||
		!(s.actualReferenceSpace === null || member(s.actualReferenceSpace, spaces))
	)
		return false;
	if (
		!featureList(s.requestedFeatures) ||
		!(s.enabledFeatures === null || featureList(s.enabledFeatures)) ||
		!member(s.outcome, ["ended", "request-failed", "runtime-error"])
	)
		return false;
	if (
		typeof s.frameReceived !== "boolean" ||
		typeof s.poseReceived !== "boolean" ||
		(s.poseReceived && !s.frameReceived)
	)
		return false;
	if (
		s.outcome === "request-failed" &&
		(s.frameReceived ||
			s.actualReferenceSpace !== null ||
			s.enabledFeatures !== null)
	)
		return false;
	return (
		object(s.modules) &&
		Object.entries(s.modules).every(
			([k, v]) =>
				member(k, reportModules) &&
				fields(v, ["dataObserved", "error"]) &&
				typeof v.dataObserved === "boolean" &&
				typeof v.error === "boolean",
		)
	);
}
