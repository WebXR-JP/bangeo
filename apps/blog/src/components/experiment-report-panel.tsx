"use client";

import { useEffect, useRef, useState } from "react";
import {
	type ExperimentReport,
	type ReportDevice,
	reportBrowser,
	reportDevices,
	type SessionReport,
} from "@/lib/experiment-report";
import type { SpecCheckId, SpecSupport } from "@/lib/webxr-spec-catalog";

type SummaryRow = {
	device: string;
	browser: string;
	major: number | null;
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
	key: process.env.NEXT_PUBLIC_BANGEO_ANALYTICS_KEY ?? "",
	ingest: process.env.NEXT_PUBLIC_BANGEO_ANALYTICS_INGEST ?? "",
	api: process.env.NEXT_PUBLIC_BANGEO_ANALYTICS_API ?? "",
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
	unknown: "選択しない",
	"quest-2": "Meta Quest 2",
	"quest-3": "Meta Quest 3",
	"quest-3s": "Meta Quest 3S",
	"quest-pro": "Meta Quest Pro",
	"quest-other": "その他のMeta Quest",
	"pico-4": "PICO 4",
	"pico-4-ultra": "PICO 4 Ultra",
	"pico-other": "その他のPICO",
	other: "その他",
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
const button =
	"rounded-lg border border-gray-300 px-4 py-2 text-sm font-bold hover:border-gray-900 focus-visible:outline-2 disabled:opacity-40";

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
	const configured = Boolean(options.key && options.ingest && options.api);
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
			schemaVersion: 1,
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
		} catch {
			setNotice(
				allowed.current
					? "送信を確認できませんでした。同じ内容で再試行できます。"
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
			className="mt-10 rounded-xl border border-gray-200 p-5"
			aria-labelledby="anonymous-report-title"
		>
			<h2 id="anonymous-report-title" className="text-lg font-bold">
				みんなの端末での検証結果
			</h2>
			<p className="mt-2 text-sm text-gray-600">
				APIの検出結果と、このページで最後に終了した体験の結果を匿名で提供できます。送信は任意です。
			</p>
			<p className="mt-2 text-xs leading-relaxed text-gray-500">
				端末の種類・ブラウザのメジャーバージョン・検証結果を保存し、集計を公開します。氏名・IPアドレス・部屋や手の座標・生のUser-Agentは検証データに含めません。通信時のIPなどは配信事業者に届きます。
			</p>
			{!configured && (
				<p className="mt-3 text-sm text-gray-600">
					匿名データの受付は準備中です。送信内容の確認はできます。
				</p>
			)}
			<div className="mt-4 flex flex-wrap items-end gap-3">
				<label className="text-sm">
					試した端末
					<select
						value={device}
						disabled={sending}
						onChange={(e) => setDevice(e.target.value as ReportDevice)}
						className="ml-2 rounded border p-2"
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
			{running && (
				<p className="mt-2 text-sm">体験を終了すると結果を確認できます。</p>
			)}
			{preview && (
				<div className="mt-4 space-y-3">
					<p className="text-sm">
						{preview.session
							? "最後の体験の結果を含みます。"
							: "体験は未実施です。APIの検出結果のみ送信します。"}{" "}
						APIの検出や許可だけでは、実データの取得を確認したことにはなりません。
					</p>
					<details open>
						<summary className="cursor-pointer text-sm font-bold">
							送信するJSON
						</summary>
						<pre className="mt-2 max-h-64 overflow-auto rounded bg-gray-50 p-3 text-xs">
							{JSON.stringify(preview, null, 2)}
						</pre>
					</details>
					<label className="flex items-start gap-2 text-sm">
						<input
							type="checkbox"
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
			<div className="mt-6 border-t border-gray-100 pt-4">
				<button
					type="button"
					className={button}
					disabled={!configured || loading}
					onClick={readSummary}
				>
					{loading ? "取得中…" : "匿名の集計結果を表示・更新"}
				</button>
				<p role="status" className="mt-2 text-sm">
					{summaryError}
				</p>
				{summary && (
					<>
						<p className="my-3 text-sm">
							{summary.truncated ? "表示上限に達しています。" : ""}直近
							{summary.days}日：{summary.total}
							件の報告。人数・端末台数ではありません。
						</p>
						{summary.total === 0 ? (
							<p className="text-sm text-gray-500">まだ報告がありません。</p>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full text-left text-xs">
									<thead>
										<tr>
											{[
												"端末",
												"ブラウザ",
												"確認内容",
												"API・機能",
												"結果",
												"件数",
											].map((h) => (
												<th key={h} className="whitespace-nowrap border-b p-2">
													{h}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{summary.rows.map((row) => (
											<tr
												key={[
													row.device,
													row.browser,
													row.major,
													row.stage,
													row.feature,
													row.result,
												].join(":")}
											>
												<td className="p-2">
													{deviceLabels[row.device as ReportDevice] ??
														row.device}
												</td>
												<td className="p-2">
													{row.browser} {row.major ?? ""}
												</td>
												<td className="p-2">
													{stageLabels[row.stage] ?? row.stage}
												</td>
												<td className="p-2">{row.feature}</td>
												<td className="p-2">
													{resultLabels[row.result] ?? row.result}
												</td>
												<td className="p-2 tabular-nums">{row.reports}</td>
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</>
				)}
			</div>
		</section>
	);
}
