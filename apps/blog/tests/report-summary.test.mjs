// Run with Node.js 22.18+ (native TypeScript stripping):
// node --test apps/blog/tests/report-summary.test.mjs
import assert from "node:assert/strict";
import { test } from "node:test";
import { describeReportEnvironment } from "../src/lib/report/environment.ts";
import {
	buildReportSummary,
	limitRatioToDefault,
	reportAltText,
	reportShareText,
} from "../src/lib/report/summary.ts";
import {
	webgpuFeatureCatalog,
	webgpuLimitCatalog,
} from "../src/lib/webgpu-report-catalog.ts";
import { webxrSpecCatalog } from "../src/lib/webxr-spec-catalog.ts";

const QUEST_3_UA =
	"Mozilla/5.0 (X11; Linux x86_64; Quest 3) AppleWebKit/537.36 (KHTML, like Gecko) OculusBrowser/150.1.0.23.53 Chrome/150.0.0.0 VR Safari/537.36";

const featureNames = webgpuFeatureCatalog.map((entry) => entry.name);

function summarize(overrides = {}) {
	return buildReportSummary({
		environment: describeReportEnvironment(QUEST_3_UA),
		date: new Date(2026, 10, 19, 23, 30),
		specs: webxrSpecCatalog,
		webxr: {},
		webgpuStatus: "unsupported",
		webgpuReport: null,
		webgpuFeatureNames: featureNames,
		webgpuLimits: webgpuLimitCatalog,
		...overrides,
	});
}

/** カタログの全項目に同じ判定を入れ、指定した項目だけ上書きする */
function webxrResults(fallback, overrides = {}) {
	return {
		...Object.fromEntries(
			webxrSpecCatalog.map((entry) => [entry.id, fallback]),
		),
		...overrides,
	};
}

test("headset models and the Quest Browser minor version are named", () => {
	assert.deepEqual(describeReportEnvironment(QUEST_3_UA), {
		device: "Meta Quest 3",
		browser: "Quest Browser 150.1",
		label: "Meta Quest 3 / Quest Browser 150.1",
	});
	assert.equal(
		describeReportEnvironment(
			"Mozilla/5.0 (X11; Linux x86_64; Quest 3S) OculusBrowser/41.0.0 Chrome/138.0.0.0 VR Safari/537.36",
		).device,
		"Meta Quest 3S",
	);
	assert.equal(
		describeReportEnvironment(
			"Mozilla/5.0 (Linux; Android 14; Quest) OculusBrowser/40.2 Chrome/136.0.0.0 Mobile VR Safari/537.36",
		).device,
		"Meta Quest",
	);
});

test("Chromium derivatives are not reported as Chrome", () => {
	const cases = [
		[
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36 Edg/142.0.0.0",
			"Windows / Edge 142",
		],
		[
			"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/142.0.0.0 Safari/537.36",
			"Windows / Chrome 142",
		],
		[
			"Mozilla/5.0 (Linux; Android 15; SM-S938B) AppleWebKit/537.36 (KHTML, like Gecko) SamsungBrowser/29.0 Chrome/136.0.0.0 Mobile Safari/537.36",
			"Android / Samsung Internet 29",
		],
		[
			"Mozilla/5.0 (iPhone; CPU iPhone OS 26_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.1 Mobile/15E148 Safari/604.1",
			"iPhone / Safari 26",
		],
		[
			"Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:145.0) Gecko/20100101 Firefox/145.0",
			"macOS / Firefox 145",
		],
	];
	for (const [ua, label] of cases) {
		assert.equal(describeReportEnvironment(ua).label, label);
	}
	assert.equal(
		describeReportEnvironment("").label,
		"不明な端末 / 不明なブラウザ",
	);
});

test("the summary is not ready until every check has settled", () => {
	assert.equal(summarize().ready, false);
	assert.equal(summarize({ webxr: webxrResults("unsupported") }).ready, true);
	assert.equal(
		summarize({
			webxr: webxrResults("unsupported"),
			webgpuStatus: "checking",
		}).ready,
		false,
	);
	assert.equal(
		summarize({ webxr: webxrResults("unsupported"), environment: null }).ready,
		false,
	);
});

test("session modes, modules and reference spaces are counted separately", () => {
	const summary = summarize({
		webxr: webxrResults("unsupported", {
			"immersive-vr": "supported",
			inline: "supported",
			viewer: "supported",
			"local-floor": "unknown",
			"hit-test": "supported",
			anchors: "supported",
		}),
	});

	assert.deepEqual(
		summary.webxr.sessions.map((item) => [item.name, item.mark]),
		[
			["VR", "yes"],
			["AR", "no"],
			["inline", "yes"],
		],
	);
	// セッションモードや体験スペースの「対応」は、機能モジュールの数に入れない
	assert.equal(summary.webxr.moduleYes, 2);
	assert.equal(
		summary.webxr.sessions.length +
			summary.webxr.modules.length +
			summary.webxr.spaces.length,
		webxrSpecCatalog.length,
	);
	assert.equal(
		summary.webxr.spaces.find((item) => item.id === "local-floor").mark,
		"unknown",
	);
	assert.equal(summary.webxr.supported, 5);
	assert.equal(summary.dateLabel, "2026-11-19");
});

test("WebGPU counts only catalog features and limits above the spec default", () => {
	const limits = Object.fromEntries(
		webgpuLimitCatalog.map((entry) => [entry.name, entry.default]),
	);
	limits.maxTextureDimension2D = 16384;
	// alignment は小さいほど余裕がある
	limits.minUniformBufferOffsetAlignment = 64;

	const summary = summarize({
		webxr: webxrResults("unsupported"),
		webgpuStatus: "ready",
		webgpuReport: {
			info: { vendor: "qualcomm", architecture: "adreno-7xx" },
			isFallbackAdapter: false,
			features: ["shader-f16", "timestamp-query", "vendor-private-extension"],
			limits,
			preferredCanvasFormat: "rgba8unorm",
			wgslFeatures: [],
		},
	});

	assert.equal(summary.webgpu.mark, "yes");
	assert.equal(summary.webgpu.featureYes, 2);
	assert.equal(summary.webgpu.featureTotal, webgpuFeatureCatalog.length);
	assert.equal(summary.webgpu.limitsAboveDefault, 2);
	assert.equal(summary.webgpu.adapterVendor, "qualcomm");
	assert.equal(summary.webgpu.adapterDetail, "adreno-7xx");
	assert.equal(
		limitRatioToDefault({ default: 256, limitClass: "alignment" }, 64),
		4,
	);
});

test("a failed adapter request is reported as inconclusive, not unsupported", () => {
	const failed = summarize({
		webxr: webxrResults("unsupported"),
		webgpuStatus: "error",
	});
	assert.equal(failed.webgpu.mark, "unknown");
	assert.equal(failed.webgpu.featureYes, 0);
	assert.equal(failed.ready, true);
	assert.equal(
		summarize({ webxr: webxrResults("unsupported") }).webgpu.mark,
		"no",
	);
});

test("alt text and share text describe the environment without raw identifiers", () => {
	const summary = summarize({
		webxr: webxrResults("unsupported", { "immersive-vr": "supported" }),
	});
	const alt = reportAltText(summary);
	assert.match(
		alt,
		/^Meta Quest 3 \/ Quest Browser 150\.1 のWebXR・WebGPU対応レポート。/,
	);
	assert.match(alt, /VRは開始できる、ARは開始できない、inlineは開始できない/);
	assert.match(alt, /WebGPUは利用できない/);
	assert.equal(
		reportShareText(summary),
		"Meta Quest 3 / Quest Browser 150.1 のWebXR・WebGPU対応を、BANGEOのレポートで確認しました",
	);
	// ビルド番号などUser-Agentの生の値は出さない
	assert.doesNotMatch(alt, /150\.1\.0\.23/);
});
