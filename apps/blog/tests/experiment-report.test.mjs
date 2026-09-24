import assert from "node:assert/strict";
import { test } from "node:test";
import {
	isExperimentReport,
	reportBrowser,
} from "../src/lib/experiment-report.ts";

test("Quest Browser keeps its minor version without retaining the build number", () => {
	assert.deepEqual(
		reportBrowser(
			"Mozilla/5.0 (X11; Linux x86_64; Quest 3) OculusBrowser/150.1.0.23.53 Chrome/150.0.0.0 VR Safari/537.36",
		),
		{ family: "quest-browser", version: "150.1" },
	);
	assert.deepEqual(reportBrowser("Chrome/153.0.0.0"), {
		family: "chrome",
		version: "153",
	});
});

test("the anonymous report contract accepts the minor version", () => {
	const report = {
		schemaVersion: 2,
		device: "quest-3",
		browser: { family: "quest-browser", version: "150.1" },
		checks: { "immersive-vr": "detected" },
		session: null,
	};
	assert.equal(isExperimentReport(report), true);
	assert.equal(
		isExperimentReport({
			...report,
			browser: { ...report.browser, version: "150.1.0.23" },
		}),
		false,
	);
});
