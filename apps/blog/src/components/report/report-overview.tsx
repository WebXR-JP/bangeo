"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
	type ReportItem,
	type ReportMark,
	reportStatusLabel,
} from "@/lib/report/summary";
import { MarkDot } from "./report-mark";
import { useReport } from "./report-provider";

const groupLabelClass = "mt-8 text-sm font-bold text-gray-950";

// 注記は文節で折る（「ます。」だけの行や語の途中での改行を出さない）
const groupNoteClass =
	"mt-1 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500";

const tileClass =
	"flex min-h-[4.5rem] items-center gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3";

const detailLinkClass =
	"text-link inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold";

const codeClass =
	"rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-gray-700";

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
				className="text-xl font-bold text-gray-950 md:text-2xl md:font-black"
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
				// タッチで押しやすいよう、スマートフォンでは高さ44px
				className={`inline-flex min-h-11 max-w-full items-center gap-2 rounded-full border border-gray-200 bg-white py-1.5 pl-2 pr-3.5 text-xs transition-[border-color,transform] hover:border-gray-950 active:scale-[0.98] sm:min-h-10 ${
					mark === "no" ? "text-gray-500" : "text-gray-950"
				}`}
			>
				<MarkDot mark={mark} />
				<span
					className={`min-w-0 truncate ${mono ? "font-mono" : "font-bold"}`}
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
					この端末とブラウザで、そのモードの体験を開始できるかを判定した結果です。
				</p>
				<ul className="mt-3 grid gap-2 sm:grid-cols-3">
					{summary.webxr.sessions.map((item) => (
						<li key={item.id} className="min-w-0">
							<Link
								href={xrItemHref(item)}
								className={`${tileClass} transition-[border-color,transform] hover:border-gray-950 active:scale-[0.99]`}
							>
								<MarkDot mark={item.mark} />
								<span className="min-w-0">
									<span className="block text-base font-bold leading-tight text-gray-950">
										{item.name}
									</span>
									<span className="mt-0.5 block text-xs text-gray-600">
										{reportStatusLabel(item.mark)}
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
					ブラウザにAPIがあるかを見た簡易判定で、実際に動くかどうかはセッションを開始して確かめます。
				</p>
				<PillList>
					{summary.webxr.modules.map((item) => (
						<ItemPill
							key={item.id}
							href={xrItemHref(item)}
							mark={item.mark}
							status={reportStatusLabel(item.mark)}
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
							status={reportStatusLabel(item.mark)}
							mono
						>
							{item.name}
						</ItemPill>
					))}
				</PillList>
			</section>

			<section aria-labelledby="overview-webgpu" className="mt-16">
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
							<span className="block text-base font-bold leading-tight text-gray-950">
								WebGPU
							</span>
							<span className="mt-0.5 block text-xs text-gray-600">
								{reportStatusLabel(summary.webgpu.mark)}
							</span>
						</span>
					</li>
					<li className={tileClass}>
						<span className="min-w-0">
							<span className="block text-base font-bold leading-tight text-gray-950">
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
							<span className="block truncate text-base font-bold leading-tight text-gray-950">
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
					<p className="mt-4 break-phrase rounded-2xl bg-gray-50 px-5 py-4 text-sm leading-relaxed text-gray-600">
						このブラウザでは<code className={codeClass}>navigator.gpu</code>
						が見つかりませんでした。WebGPUに対応したブラウザで開くと、GPUが持つ機能と上限値を確認できます。
					</p>
				)}
				{webgpu.status === "error" && webgpu.errorMessage && (
					<p className="mt-4 break-phrase rounded-2xl bg-data-ask-soft px-5 py-4 text-sm leading-relaxed text-data-ask">
						{webgpu.errorMessage}
					</p>
				)}

				<h3 className={groupLabelClass}>機能（features）</h3>
				<p className={groupNoteClass}>
					<code className={codeClass}>requestDevice</code>の
					<code className={codeClass}>requiredFeatures</code>
					に渡せる名前です。押すと、その機能の解説へ移動します。
				</p>
				<PillList>
					{summary.webgpu.features.map((item) => (
						<ItemPill
							key={item.id}
							href={`/webgpu-report#feature-${item.id}`}
							mark={item.mark}
							status={reportStatusLabel(item.mark)}
							mono
						>
							{item.name}
						</ItemPill>
					))}
				</PillList>

				<h3 className={groupLabelClass}>上限値（limits）</h3>
				<p className="mt-1 max-w-[40em] break-phrase text-sm leading-relaxed text-gray-700">
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
