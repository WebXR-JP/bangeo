"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
	type ReportItem,
	type ReportMark,
	sessionStatusLabel,
	webgpuStatusLabel,
} from "@/lib/report/summary";
import { webgpuFeatureCatalog } from "@/lib/webgpu-report-catalog";
import { MarkDot } from "./report-mark";
import { useReport } from "./report-provider";

const moduleStatusLabel: Record<ReportMark, string> = {
	yes: "対応",
	no: "未対応",
	unknown: "未確認",
	checking: "確認中",
};

const groupLabelClass =
	"mt-7 text-[11px] font-black tracking-[0.14em] text-gray-500";

const groupNoteClass = "mt-1.5 text-xs leading-relaxed text-gray-500";

const tileClass =
	"flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3";

const detailLinkClass =
	"inline-flex min-h-10 items-center whitespace-nowrap text-sm font-bold text-primary-600 underline decoration-primary-200 underline-offset-4 transition hover:decoration-primary-600";

function SectionHeader({
	id,
	title,
	href,
	linkLabel,
}: {
	id: string;
	title: string;
	href: string;
	linkLabel: string;
}) {
	return (
		<div className="flex flex-wrap items-center justify-between gap-x-4">
			<h2
				id={id}
				className="text-xl font-black tracking-tight text-gray-950 md:text-2xl"
			>
				{title}
			</h2>
			<Link href={href} className={detailLinkClass}>
				{linkLabel}
				<span aria-hidden="true" className="ml-1">
					→
				</span>
			</Link>
		</div>
	);
}

/** 項目1つ分の押せるピル。押すと詳細タブの該当行へ移動する */
function ItemPill({
	href,
	mark,
	status,
	mono = false,
	children,
}: {
	href: string;
	mark: ReportMark;
	status: string;
	mono?: boolean;
	children: ReactNode;
}) {
	return (
		<li className="min-w-0 max-w-full">
			<Link
				href={href}
				className={`inline-flex min-h-10 max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-2 pr-3.5 text-xs transition hover:border-gray-950 active:scale-[0.98] ${
					mark === "no" ? "text-gray-500" : "text-gray-950"
				}`}
			>
				<MarkDot mark={mark} />
				<span
					className={`min-w-0 truncate ${mono ? "font-mono text-[11px]" : "font-bold"}`}
				>
					{children}
				</span>
				<span className="sr-only">：{status}</span>
			</Link>
		</li>
	);
}

function PillList({ children }: { children: ReactNode }) {
	return <ul className="mt-3 flex flex-wrap gap-2">{children}</ul>;
}

/**
 * 「概要」タブ。WebXR と WebGPU の判定を1画面で見渡すための索引で、
 * 各項目の解説は詳細タブ（WebXR / WebGPU）に任せる。
 */
export function ReportOverview() {
	const { summary, webgpu } = useReport();
	const supportedFeatures = new Set(webgpu.report?.features ?? []);
	const featureMark = (name: string): ReportMark => {
		if (webgpu.status === "ready") {
			return supportedFeatures.has(name) ? "yes" : "no";
		}
		if (webgpu.status === "unsupported") return "no";
		return webgpu.status === "error" ? "unknown" : "checking";
	};
	const xrItemHref = (item: ReportItem) => `/experiments#spec-${item.id}`;

	return (
		<div>
			<section aria-labelledby="overview-webxr">
				<SectionHeader
					id="overview-webxr"
					title="WebXR"
					href="/experiments#report-content"
					linkLabel="仕様ごとの解説とデモを見る"
				/>

				<h3 className={groupLabelClass}>セッションモード</h3>
				<p className={groupNoteClass}>
					この端末とブラウザで、そのモードの体験を開始できるかどうかです。
				</p>
				<ul className="mt-3 grid gap-2 sm:grid-cols-3">
					{summary.webxr.sessions.map((item) => (
						<li key={item.id} className="min-w-0">
							<Link
								href={xrItemHref(item)}
								className={`${tileClass} transition hover:border-gray-950 active:scale-[0.99]`}
							>
								<MarkDot mark={item.mark} />
								<span className="min-w-0">
									<span className="block text-base font-black leading-tight text-gray-950">
										{item.name}
									</span>
									<span className="mt-0.5 block text-xs text-gray-600">
										{sessionStatusLabel(item.mark)}
									</span>
								</span>
							</Link>
						</li>
					))}
				</ul>

				<h3 className={groupLabelClass}>機能モジュール</h3>
				<p className={groupNoteClass}>
					{summary.ready
						? `${summary.webxr.modules.length}件のうち${summary.webxr.moduleYes}件のAPIを検出しました。`
						: "確認中です。"}
					ブラウザにAPIがあるかを見た簡易チェックで、実際に動くかどうかはセッションを開始して確かめます。
				</p>
				<PillList>
					{summary.webxr.modules.map((item) => (
						<ItemPill
							key={item.id}
							href={xrItemHref(item)}
							mark={item.mark}
							status={moduleStatusLabel[item.mark]}
						>
							{item.name}
						</ItemPill>
					))}
				</PillList>

				<h3 className={groupLabelClass}>体験スペース</h3>
				<p className={groupNoteClass}>
					体験の基準になる座標系です。「?」の項目は、セッションを開始するまで使えるかどうかが決まりません。
				</p>
				<PillList>
					{summary.webxr.spaces.map((item) => (
						<ItemPill
							key={item.id}
							href={xrItemHref(item)}
							mark={item.mark}
							status={moduleStatusLabel[item.mark]}
							mono
						>
							{item.name}
						</ItemPill>
					))}
				</PillList>
			</section>

			<section aria-labelledby="overview-webgpu" className="mt-14">
				<SectionHeader
					id="overview-webgpu"
					title="WebGPU"
					href="/webgpu-report#report-content"
					linkLabel="features・limitsの全項目を見る"
				/>

				<ul className="mt-5 grid gap-2 sm:grid-cols-3">
					<li className={tileClass}>
						<MarkDot mark={summary.webgpu.mark} />
						<span className="min-w-0">
							<span className="block text-base font-black leading-tight text-gray-950">
								WebGPU
							</span>
							<span className="mt-0.5 block text-xs text-gray-600">
								{webgpuStatusLabel(summary.webgpu.mark)}
							</span>
						</span>
					</li>
					<li className={tileClass}>
						<span className="min-w-0">
							<span className="block text-base font-black leading-tight text-gray-950">
								{summary.webgpu.mark === "yes"
									? `${summary.webgpu.featureYes} / ${summary.webgpu.featureTotal}`
									: "—"}
							</span>
							<span className="mt-0.5 block text-xs text-gray-600">
								機能（features）
							</span>
						</span>
					</li>
					<li className={tileClass}>
						<span className="min-w-0">
							<span className="block truncate text-base font-black leading-tight text-gray-950">
								{summary.webgpu.mark === "yes"
									? (summary.webgpu.adapterVendor ?? "非公開")
									: "—"}
							</span>
							<span className="mt-0.5 block truncate text-xs text-gray-600">
								{summary.webgpu.mark === "yes" &&
								(summary.webgpu.isFallbackAdapter ||
									summary.webgpu.adapterDetail)
									? `GPU・${
											summary.webgpu.isFallbackAdapter
												? "ソフトウェア描画"
												: summary.webgpu.adapterDetail
										}`
									: "GPU"}
							</span>
						</span>
					</li>
				</ul>

				{webgpu.status === "unsupported" && (
					<p className="mt-4 rounded-2xl bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-600">
						このブラウザでは navigator.gpu
						が見つかりませんでした。WebGPUに対応したブラウザで開くと、GPUが持つ機能と上限値を確認できます。
					</p>
				)}
				{webgpu.status === "error" && webgpu.errorMessage && (
					<p className="mt-4 rounded-2xl border border-amber-200 bg-data-ask-soft px-5 py-4 text-sm leading-relaxed text-amber-900">
						{webgpu.errorMessage}
					</p>
				)}

				<h3 className={groupLabelClass}>機能（features）</h3>
				<p className={groupNoteClass}>
					requestDevice の requiredFeatures
					に渡せる名前です。押すと、その機能の解説へ移動します。
				</p>
				<PillList>
					{webgpuFeatureCatalog.map((entry) => {
						const mark = featureMark(entry.name);
						return (
							<ItemPill
								key={entry.name}
								href={`/webgpu-report#feature-${entry.name}`}
								mark={mark}
								status={moduleStatusLabel[mark]}
								mono
							>
								{entry.name}
							</ItemPill>
						);
					})}
				</PillList>

				<h3 className={groupLabelClass}>上限値（limits）</h3>
				<p className="mt-1.5 text-sm leading-relaxed text-gray-700">
					{summary.webgpu.mark === "yes"
						? `${summary.webgpu.limitTotal}項目のうち${summary.webgpu.limitsAboveDefault}項目が、仕様の既定値を上回っています。`
						: summary.webgpu.mark === "checking"
							? "確認中です。"
							: "WebGPUを利用できる環境で開くと、上限値を仕様の既定値と比べて確認できます。"}
				</p>
			</section>
		</div>
	);
}
