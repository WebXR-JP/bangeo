"use client";

import { useEffect, useRef, useState } from "react";
import {
	type ExperimentReport,
	type ReportDevice,
	reportBrowser,
	reportDevice,
	reportDevices,
	type SessionReport,
} from "@/lib/experiment-report";
import type { SpecCheckId, SpecSupport } from "@/lib/webxr-spec-catalog";
import { webxrSpecCatalog } from "@/lib/webxr-spec-catalog";

type SummaryRow = {
	device: string;
	browser: string;
	version?: string | null;
	major?: number | null;
	stage: string;
	feature: string;
	result: string;
	reports: number;
};
type Summary = {
	total: number;
	days: number;
	rows: SummaryRow[];
	truncated: boolean;
};
type Receipt = {
	ok: true;
	reportId: string;
	requestId: string;
	accepted: number;
};
type Options = { key: string; ingest: string; api: string };
type SDK = {
	submitExperiment(
		options: Options,
		report: ExperimentReport,
		consent: boolean,
		reportId: string,
		signal?: AbortSignal,
	): Promise<Receipt>;
	getExperimentSummary(options: Options, days?: number): Promise<Summary>;
};
declare global {
	interface Window {
		bangeoExperiments?: SDK;
	}
}
const options: Options = {
	key: (process.env.NEXT_PUBLIC_BANGEO_ANALYTICS_KEY ?? "").trim(),
	ingest:
		process.env.NEXT_PUBLIC_BANGEO_ANALYTICS_INGEST?.trim() ||
		"https://bangeo-ingest.peraperapera.workers.dev",
	api:
		process.env.NEXT_PUBLIC_BANGEO_ANALYTICS_API?.trim() ||
		"https://analytics.bangeo.net",
};
let sdkPromise: Promise<SDK> | null = null;
function loadSDK(): Promise<SDK> {
	if (window.bangeoExperiments)
		return Promise.resolve(window.bangeoExperiments);
	if (sdkPromise) return sdkPromise;
	sdkPromise = new Promise<SDK>((resolve, reject) => {
		const origin = new URL(options.ingest);
		if (
			origin.protocol !== "https:" &&
			!["localhost", "127.0.0.1"].includes(origin.hostname)
		)
			throw new Error("Invalid SDK origin");
		const script = document.createElement("script");
		script.src = new URL("/sdk/experiments-v1.js", origin).href;
		script.async = true;
		script.referrerPolicy = "no-referrer";
		const timer = window.setTimeout(() => {
			script.remove();
			reject(new Error("SDK timeout"));
		}, 15000);
		script.onload = () => {
			clearTimeout(timer);
			window.bangeoExperiments
				? resolve(window.bangeoExperiments)
				: reject(new Error("SDK unavailable"));
		};
		script.onerror = () => {
			clearTimeout(timer);
			script.remove();
			reject(new Error("SDK unavailable"));
		};
		document.head.appendChild(script);
	}).catch((error) => {
		sdkPromise = null;
		throw error;
	});
	return sdkPromise;
}
const deviceLabels: Record<ReportDevice, string> = {
	unknown: "判別できない",
	"quest-2": "Meta Quest 2",
	"quest-3": "Meta Quest 3",
	"quest-3s": "Meta Quest 3S",
	"quest-pro": "Meta Quest Pro",
	"quest-other": "その他のMeta Quest",
	"pico-4": "PICO 4",
	"pico-4-ultra": "PICO 4 Ultra",
	"pico-other": "その他のPICO",
	other: "その他（スマートフォンなど）",
};
const resultLabels: Record<string, string> = {
	detected: "検出",
	"not-detected": "未検出",
	unknown: "未確認",
	observed: "取得できた",
	"not-observed": "取得未確認",
	granted: "許可",
	"not-granted": "未許可",
	ended: "終了",
	"request-failed": "開始失敗",
	"runtime-error": "実行エラー",
	error: "エラーあり",
	none: "エラーなし",
};
const stageLabels: Record<string, string> = {
	detection: "API検出",
	observation: "データ取得",
	enabled: "機能の許可",
	session: "セッション",
	"module-error": "機能のエラー",
};
const stageOrder = [
	"detection",
	"enabled",
	"session",
	"observation",
	"module-error",
];
const browserLabels: Record<string, string> = {
	"quest-browser": "Meta Quest Browser",
	"pico-browser": "PICO Browser",
	wolvic: "Wolvic",
	edge: "Microsoft Edge",
	chrome: "Chrome",
	firefox: "Firefox",
	safari: "Safari",
	other: "その他のブラウザ",
};
const featureLabels: Record<string, string> = Object.fromEntries(
	webxrSpecCatalog.map(({ id, name }) => [id, name]),
);
Object.assign(featureLabels, {
	inline: "通常のページ",
	"immersive-vr": "VR体験",
	"immersive-ar": "AR体験",
	viewer: "視点を基準にした空間",
	local: "開始位置を基準にした空間",
	"local-floor": "床を基準にした空間",
	"bounded-floor": "境界のある空間",
	unbounded: "広い空間",
	"hand-tracking": "ハンドトラッキング",
	"dom-overlay": "DOM Overlay",
	webgpu: "WebGPU",
	"light-estimation": "Lighting Estimation",
});

function formatBrowser(family: string, version: string | null): string {
	return `${browserLabels[family] ?? family}${version === null ? "" : ` ${version}`}`;
}

function summaryBrowserVersion(row: SummaryRow): string | null {
	return row.version ?? (row.major == null ? null : String(row.major));
}

function summaryGroups(rows: SummaryRow[]) {
	const groups = new Map<
		string,
		{ device: string; browser: string; rows: SummaryRow[] }
	>();
	for (const row of rows) {
		const version = summaryBrowserVersion(row);
		const key = `${row.device}:${row.browser}:${version ?? ""}`;
		const group = groups.get(key) ?? {
			device: deviceLabels[row.device as ReportDevice] ?? row.device,
			browser: formatBrowser(row.browser, version),
			rows: [],
		};
		group.rows.push(row);
		groups.set(key, group);
	}
	return [...groups.entries()].map(([key, group]) => ({ key, ...group }));
}

function stageGroups(rows: SummaryRow[]) {
	const groups = new Map<string, SummaryRow[]>();
	for (const row of rows) {
		const group = groups.get(row.stage) ?? [];
		group.push(row);
		groups.set(row.stage, group);
	}
	return [...groups.entries()]
		.sort(([a], [b]) => stageOrder.indexOf(a) - stageOrder.indexOf(b))
		.map(([stage, items]) => ({ stage, items }));
}

function ResultBadge({ result }: { result: string }) {
	const tone = ["detected", "observed", "granted", "ended", "none"].includes(
		result,
	)
		? "bg-emerald-50 text-emerald-800"
		: ["not-detected", "not-observed", "not-granted", "unknown"].includes(
					result,
				)
			? "bg-gray-100 text-gray-600"
			: "bg-rose-50 text-rose-800";
	return (
		<span className={`rounded-full px-2.5 py-1 text-xs font-bold ${tone}`}>
			{resultLabels[result] ?? result}
		</span>
	);
}
const button =
	"rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold hover:border-gray-900 focus-visible:outline-2 disabled:opacity-40";

function submissionError(error: unknown): string {
	const code =
		error && typeof error === "object" && "code" in error ? error.code : null;
	const message =
		code === "experiment_sharing_disabled"
			? "匿名データの受付がAnalytics側で無効です。管理者に設定を確認してください。"
			: code === "origin_not_allowed"
				? "BANGEOのURLがAnalytics側で許可されていません。管理者に設定を確認してください。"
				: code === "invalid_experiment_report"
					? "送信内容を確認できませんでした。ページを再読み込みしてください。"
					: code === "maintenance" || code === "queue_unavailable"
						? "受付を一時的に利用できません。時間をおいて再試行してください。"
						: code === "rate_limited"
							? "送信が集中しています。少し待ってから再試行してください。"
							: "送信を確認できませんでした。同じ内容で再試行できます。";
	const requestId =
		error && typeof error === "object" && "requestId" in error
			? error.requestId
			: null;
	return typeof requestId === "string" &&
		/^[a-zA-Z0-9_-]{1,80}$/.test(requestId)
		? `${message} 問い合わせID: ${requestId}`
		: message;
}

export function ExperimentReportPanel({
	checks,
	session,
	running,
}: {
	checks: Partial<Record<SpecCheckId, SpecSupport>>;
	session: SessionReport | null;
	running: boolean;
}) {
	const [device, setDevice] = useState<ReportDevice>("unknown");
	const [consent, setConsent] = useState(false);
	const [preview, setPreview] = useState<ExperimentReport | null>(null);
	const [receipt, setReceipt] = useState<Receipt | null>(null);
	const [sending, setSending] = useState(false);
	const [notice, setNotice] = useState("");
	const [summary, setSummary] = useState<Summary | null>(null);
	const [loading, setLoading] = useState(false);
	const [summaryError, setSummaryError] = useState("");
	const reportId = useRef<string | null>(null);
	const abort = useRef<AbortController | null>(null);
	const allowed = useRef(false);
	const configured = /^bg_pk_[a-zA-Z0-9_-]{1,80}$/.test(options.key);
	useEffect(() => {
		setDevice(reportDevice(navigator.userAgent));
	}, []);
	useEffect(
		() => () => {
			allowed.current = false;
			abort.current?.abort();
		},
		[],
	);
	function prepare() {
		const normalized: ExperimentReport["checks"] = {};
		for (const [key, value] of Object.entries(checks)) {
			normalized[key as SpecCheckId] = [
				"viewer",
				"local",
				"local-floor",
				"bounded-floor",
				"unbounded",
			].includes(key)
				? "unknown"
				: value === "supported"
					? "detected"
					: value === "unsupported"
						? "not-detected"
						: "unknown";
		}
		setPreview({
			schemaVersion: 2,
			device,
			browser: reportBrowser(navigator.userAgent),
			checks: normalized,
			session,
		});
		reportId.current = crypto.randomUUID();
		setReceipt(null);
		setNotice("");
		setConsent(false);
		allowed.current = false;
	}
	async function send() {
		if (!consent || !preview || !reportId.current || sending || receipt) return;
		setSending(true);
		setNotice("");
		abort.current = new AbortController();
		const timer = window.setTimeout(() => abort.current?.abort(), 20000);
		try {
			const sdk = await loadSDK();
			if (!allowed.current || abort.current.signal.aborted) return;
			const accepted = await sdk.submitExperiment(
				options,
				preview,
				true,
				reportId.current,
				abort.current.signal,
			);
			if (
				accepted.ok !== true ||
				accepted.accepted !== 1 ||
				accepted.reportId !== reportId.current
			)
				throw new Error("Unexpected response");
			setReceipt(accepted);
			setNotice("受け付けました。集計への反映には少し時間がかかります。");
		} catch (error) {
			setNotice(
				allowed.current
					? submissionError(error)
					: "送信を中止しました。すでに受け付けたデータは取り消されません。",
			);
		} finally {
			clearTimeout(timer);
			setSending(false);
		}
	}
	async function readSummary() {
		setLoading(true);
		setSummaryError("");
		try {
			setSummary(await (await loadSDK()).getExperimentSummary(options, 30));
		} catch {
			setSummaryError(
				"集計を取得できませんでした。時間をおいて再度お試しください。",
			);
		} finally {
			setLoading(false);
		}
	}
	return (
		<section
			className="mt-10 rounded-2xl border border-gray-200 bg-white p-5 sm:p-7"
			aria-labelledby="anonymous-report-title"
		>
			<h2
				id="anonymous-report-title"
				className="text-xl font-bold text-gray-950"
			>
				みんなの端末での検証結果
			</h2>
			<p className="mt-2 text-sm leading-relaxed text-gray-600">
				ほかの端末で確認された結果を見られます。自分の結果の提供は任意です。
			</p>
			<section
				className="mt-6 rounded-2xl bg-gray-50 p-4 sm:p-5"
				aria-labelledby="public-results-title"
			>
				<div className="flex flex-wrap items-center justify-between gap-3">
					<div>
						<h3
							id="public-results-title"
							className="text-base font-bold text-gray-950"
						>
							公開された結果
						</h3>
						<p className="mt-1 text-sm text-gray-600">
							端末とブラウザごとに確認できます。
						</p>
					</div>
					<button
						type="button"
						className={button}
						disabled={!configured || loading}
						onClick={readSummary}
					>
						{loading ? "取得中…" : summary ? "結果を更新" : "結果を見る"}
					</button>
				</div>
				<p role="status" className="mt-3 text-sm text-rose-700">
					{summaryError}
				</p>
				{summary && (
					<div className="mt-5">
						<p className="text-sm text-gray-600">直近{summary.days}日</p>
						<p className="mt-1 text-3xl font-bold tabular-nums text-gray-950">
							{summary.total}
							<span className="ml-1 text-base font-medium">件の報告</span>
						</p>
						<p className="mt-1 text-sm text-gray-600">
							人数や端末台数ではありません。
						</p>
						{summary.truncated && (
							<p className="mt-2 text-sm text-amber-800">
								表示上限に達しています。
							</p>
						)}
						{summary.total === 0 ? (
							<p className="mt-4 text-sm text-gray-600">
								まだ報告がありません。
							</p>
						) : (
							<ul className="mt-5 space-y-3">
								{summaryGroups(summary.rows).map((group) => (
									<li key={group.key}>
										<details className="group rounded-xl border border-gray-200 bg-white">
											<summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-4 focus-visible:outline-2 [&::-webkit-details-marker]:hidden">
												<span className="min-w-0">
													<strong className="block text-base text-gray-950">
														{group.device}
													</strong>
													<span className="mt-0.5 block text-sm text-gray-600">
														{group.browser}
													</span>
												</span>
												<span className="shrink-0 text-sm font-bold text-gray-700 group-open:hidden">
													結果を見る ＋
												</span>
												<span className="hidden shrink-0 text-sm font-bold text-gray-700 group-open:inline">
													閉じる −
												</span>
											</summary>
											<div className="space-y-5 border-t border-gray-100 px-4 py-4">
												{stageGroups(group.rows).map(({ stage, items }) => (
													<div key={stage}>
														<h4 className="text-sm font-bold text-gray-900">
															{stageLabels[stage] ?? stage}
														</h4>
														<ul className="mt-2 divide-y divide-gray-100">
															{items.map((row) => (
																<li
																	key={`${row.feature}:${row.result}`}
																	className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm"
																>
																	<span className="font-medium text-gray-800">
																		{featureLabels[row.feature] ?? row.feature}
																	</span>
																	<span className="flex items-center gap-2">
																		<ResultBadge result={row.result} />
																		<span className="tabular-nums text-gray-600">
																			{row.reports}件
																		</span>
																	</span>
																</li>
															))}
														</ul>
													</div>
												))}
											</div>
										</details>
									</li>
								))}
							</ul>
						)}
					</div>
				)}
			</section>
			<section
				className="mt-6 border-t border-gray-200 pt-6"
				aria-labelledby="send-results-title"
			>
				<h3
					id="send-results-title"
					className="text-base font-bold text-gray-950"
				>
					自分の結果を送る
				</h3>
				<p className="mt-1 text-sm leading-relaxed text-gray-600">
					このページで確認したAPIと、最後に終了した体験の結果を送れます。送信は任意です。
				</p>
				{!configured && (
					<p className="mt-3 text-sm text-gray-600">
						公開キーが未設定のため送信できません。送信内容の確認はできます。
					</p>
				)}
				<div className="mt-4 flex flex-wrap items-end gap-3">
					<label className="text-sm font-medium text-gray-800">
						<span className="mb-1 block">試した端末</span>
						<select
							value={device}
							disabled={sending}
							onChange={(e) => {
								setDevice(e.target.value as ReportDevice);
								setPreview(null);
								setConsent(false);
								allowed.current = false;
								abort.current?.abort();
							}}
							className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm"
						>
							{reportDevices.map((d) => (
								<option key={d} value={d}>
									{deviceLabels[d]}
								</option>
							))}
						</select>
					</label>
					<button
						type="button"
						className={button}
						disabled={running || sending || Object.keys(checks).length === 0}
						onClick={prepare}
					>
						送信内容を確認
					</button>
				</div>
				<p className="mt-2 text-sm text-gray-600">
					機種が違う場合は選び直してください。判別できない場合はそのまま送信できます。
				</p>
				{running && (
					<p className="mt-2 text-sm text-gray-600">
						体験を終了すると結果を確認できます。
					</p>
				)}
				{preview && (
					<div className="mt-5 space-y-4 rounded-xl border border-gray-200 p-4 sm:p-5">
						<h4 className="text-base font-bold text-gray-950">送信する内容</h4>
						<dl className="grid gap-3 text-sm sm:grid-cols-2">
							<div>
								<dt className="text-gray-500">端末</dt>
								<dd className="mt-0.5 font-medium">
									{deviceLabels[preview.device]}
								</dd>
							</div>
							<div>
								<dt className="text-gray-500">ブラウザ</dt>
								<dd className="mt-0.5 font-medium">
									{formatBrowser(
										preview.browser.family,
										preview.browser.version,
									)}
								</dd>
							</div>
							<div>
								<dt className="text-gray-500">APIの検出結果</dt>
								<dd className="mt-0.5 font-medium">
									{Object.keys(preview.checks).length}項目
								</dd>
							</div>
							<div>
								<dt className="text-gray-500">体験結果</dt>
								<dd className="mt-0.5 font-medium">
									{preview.session
										? `${preview.session.mode}・${resultLabels[preview.session.outcome] ?? preview.session.outcome}`
										: "体験なし"}
								</dd>
							</div>
						</dl>
						<p className="text-sm leading-relaxed text-gray-600">
							APIの検出や機能の許可だけでは、実データの取得を確認したことにはなりません。
						</p>
						<details className="rounded-lg border border-gray-200 p-3">
							<summary className="cursor-pointer text-sm font-medium text-gray-800">
								APIの検出結果を確認
							</summary>
							<ul className="mt-3 divide-y divide-gray-100">
								{Object.entries(preview.checks).map(([feature, result]) => (
									<li
										key={feature}
										className="flex items-center justify-between gap-2 py-2 text-sm"
									>
										<span>{featureLabels[feature] ?? feature}</span>
										<ResultBadge result={result ?? "unknown"} />
									</li>
								))}
							</ul>
						</details>
						<details className="rounded-lg bg-gray-50 p-3">
							<summary className="cursor-pointer text-sm font-medium text-gray-700">
								送信データの詳細を見る
							</summary>
							<pre className="mt-3 max-h-64 overflow-auto text-xs">
								{JSON.stringify(preview, null, 2)}
							</pre>
						</details>
						<label className="flex items-start gap-2 text-sm leading-relaxed">
							<input
								type="checkbox"
								className="mt-1"
								checked={consent}
								disabled={Boolean(receipt)}
								onChange={(e) => {
									const checked = e.target.checked;
									setConsent(checked);
									allowed.current = checked;
									if (!checked) abort.current?.abort();
								}}
							/>
							この内容の保存と、匿名の集計結果の公開に同意します。
						</label>
						<button
							type="button"
							className={button}
							disabled={!configured || !consent || sending || Boolean(receipt)}
							onClick={send}
						>
							{sending
								? "送信中…"
								: receipt
									? "受付済み"
									: "匿名データを送信する"}
						</button>
						<p role="status" className="break-all text-sm">
							{notice}
							{receipt && ` 受付ID: ${receipt.reportId}`}
						</p>
					</div>
				)}
			</section>
			<details className="mt-5 border-t border-gray-100 pt-4">
				<summary className="cursor-pointer text-sm font-medium text-gray-600">
					保存される情報について
				</summary>
				<p className="mt-2 text-sm leading-relaxed text-gray-600">
					端末の種類・ブラウザのバージョン・検証結果を保存し、集計を公開します。氏名・IPアドレス・部屋や手の座標・生のUser-Agentは検証データに含めません。通信時のIPなどは配信事業者に届きます。
				</p>
			</details>
		</section>
	);
}
