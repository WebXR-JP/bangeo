"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { MarkDot } from "@/components/report/report-mark";
import {
	type ReportEnvironment,
	resolveReportEnvironment,
} from "@/lib/report/environment";
import {
	buildReportSummary,
	type ReportMark,
	reportStatusLabel,
} from "@/lib/report/summary";
import { collectWebGPUReport, type WebGPUStatus } from "@/lib/report/webgpu";
import type { SpecCheckId, SpecSupport } from "@/lib/webxr-spec-catalog";
import { checkWebXRSupport } from "@/lib/webxr-support";

/** トップに出すのはセッションモードの2つだけ。ほかの判定結果は受け取っても捨てる */
const SESSION_IDS: readonly SpecCheckId[] = ["immersive-vr", "immersive-ar"];

type Row = {
	key: string;
	name: string;
	/** 名前の後ろに小さく添える仕様上の名前 */
	code?: string;
	mark: ReportMark;
};

function ChevronIcon() {
	return (
		<svg
			className="size-4 shrink-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 5l7 7-7 7"
			/>
		</svg>
	);
}

/**
 * トップのヒーローに置く「この端末の結果」。/report の結論の出張所で、
 * VR・AR（WebXR のセッションモード）と WebGPU の3つだけを、開いた端末でその場で判定して見せる。
 *
 * 判定は /report の ReportProvider と同じ関数（checkWebXRSupport・collectWebGPUReport）を呼び、
 * 判定の言葉と印も buildReportSummary・reportStatusLabel・MarkDot に任せるので、同じ端末なら /report と同じ結果になる。
 * トップの JS を重くしないよう、仕様カタログ本体は読み込まない（buildReportSummary には空のカタログを渡し、
 * カタログに依らないセッションモードと WebGPU の判定だけを使う）。
 */
export function HomeDevicePanel({ checkCount }: { checkCount: number }) {
	const [environment, setEnvironment] = useState<ReportEnvironment | null>(
		null,
	);
	const [webxr, setWebxr] = useState<Partial<Record<SpecCheckId, SpecSupport>>>(
		{},
	);
	const [webgpuStatus, setWebgpuStatus] = useState<WebGPUStatus>("checking");

	useEffect(() => {
		let cancelled = false;
		resolveReportEnvironment(navigator).then((result) => {
			if (!cancelled) setEnvironment(result);
		});
		checkWebXRSupport((id, support) => {
			if (cancelled || !SESSION_IDS.includes(id)) return;
			setWebxr((previous) => ({ ...previous, [id]: support }));
		});
		// /report の既定と同じ high-performance。上限値は使わないので読み取らない
		collectWebGPUReport("high-performance", []).then((result) => {
			if (!cancelled) setWebgpuStatus(result.status);
		});
		return () => {
			cancelled = true;
		};
	}, []);

	const summary = useMemo(
		() =>
			buildReportSummary({
				environment,
				date: new Date(0),
				specs: [],
				webxr,
				webgpuStatus,
				webgpuReport: null,
				webgpuFeatureNames: [],
				webgpuLimits: [],
			}),
		[environment, webxr, webgpuStatus],
	);

	const sessionMark = (id: SpecCheckId): ReportMark =>
		summary.webxr.sessions.find((item) => item.id === id)?.mark ?? "checking";

	const rows: Row[] = [
		{
			key: "vr",
			name: "VR",
			code: "immersive-vr",
			mark: sessionMark("immersive-vr"),
		},
		{
			key: "ar",
			name: "AR",
			code: "immersive-ar",
			mark: sessionMark("immersive-ar"),
		},
		{ key: "webgpu", name: "WebGPU", mark: summary.webgpu.mark },
	];

	return (
		<div className="card p-6">
			<h2 className="text-lg font-bold leading-snug text-gray-950">
				この端末の結果
			</h2>
			<p className="mt-1 min-h-[1.6em] text-sm leading-[1.6] text-gray-600 [overflow-wrap:anywhere]">
				{environment ? environment.label : "端末とブラウザを確認中"}
			</p>
			<dl className="mt-4 border-b border-gray-100">
				{rows.map((row) => (
					// 行ごとの読み上げ領域。結果に変わった行だけを、名前と判定を続けて読む
					<div
						key={row.key}
						aria-live="polite"
						aria-atomic="true"
						className="flex min-h-12 items-center justify-between gap-3 border-t border-gray-100 py-2"
					>
						<dt className="min-w-0 text-[15px] font-bold leading-snug text-gray-950">
							{row.name}
							{row.code ? (
								<span className="text-[13px] font-normal text-gray-500">
									（{row.code}）
								</span>
							) : null}
						</dt>
						<dd className="shrink-0">
							{/* 判定が変わると差し替わり、200ms で現れる（確認中の表示は動かさない）。
							    印と言葉の幅は判定の前後で同じなので、行の位置はずれない */}
							<span
								key={row.mark}
								className={`flex items-center gap-2 ${
									row.mark === "checking"
										? ""
										: "transition-opacity duration-200 starting:opacity-0"
								}`}
							>
								<MarkDot mark={row.mark} />
								<span
									className={`min-w-[3em] text-sm font-bold ${
										row.mark === "yes" || row.mark === "unknown"
											? "text-gray-950"
											: "text-gray-600"
									}`}
								>
									{reportStatusLabel(row.mark)}
								</span>
							</span>
						</dd>
					</div>
				))}
			</dl>
			<Link
				href="/report"
				className="text-link mt-3 inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-bold"
			>
				{checkCount}件の結果をすべて見る
				<ChevronIcon />
			</Link>
		</div>
	);
}
