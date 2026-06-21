import type { Metadata } from "next";
import {
	type BrowserKey,
	type Stage,
	WEBXR_BROWSER_COLUMNS,
	WEBXR_FEATURES,
	WEBXR_SPEC_UPDATES,
	WEBXR_STAGE_BY_ID,
	WEBXR_STAGES,
	WEBXR_STATUS_META,
	WEBXR_WG_DISCUSSIONS,
	type WebXRWgDiscussionStatus,
} from "@/data/webxr-status";

export const metadata: Metadata = {
	title: "標準化・対応状況",
	description:
		"WebXR 関連仕様の標準化状況と、主要ブラウザ・デバイスの対応状況を一覧で確認できます。",
	alternates: { canonical: "/webxr-status" },
};

function ProgressBar({ stage }: { stage: Stage }) {
	const stageInfo = WEBXR_STAGE_BY_ID[stage];
	return (
		<div className="flex items-center gap-3">
			<div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
				<div
					className={`h-full rounded-full ${stageInfo.barClass}`}
					style={{ width: `${(stage / 5) * 100}%` }}
				/>
			</div>
			<span
				className={`text-[11px] sm:text-xs font-bold ${stageInfo.badgeClass} px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full whitespace-nowrap`}
			>
				{stageInfo.name}
			</span>
		</div>
	);
}

function BrowserCell({ value }: { value: string }) {
	const normalized = value === "-" ? "未確認" : value;
	const isUnknown = normalized === "未確認";
	const isUnsupported = normalized === "未対応";
	const isTrial = ["Flag", "OT", "Exp"].includes(normalized);
	const isSupported =
		normalized === "対応" || /\+$/.test(normalized) || /^\d/.test(normalized);

	let badgeClass = "bg-gray-100 text-gray-400";
	if (isTrial) badgeClass = "bg-amber-100 text-amber-900";
	if (isSupported && !isTrial) badgeClass = "bg-emerald-100 text-emerald-900";
	if (isUnsupported) badgeClass = "bg-gray-100 text-gray-400";
	if (isUnknown) badgeClass = "bg-gray-50 text-gray-400";

	return (
		<td className="px-2 py-4 text-center">
			<span
				className={`text-[10px] font-bold px-2 py-1 rounded-full ${badgeClass}`}
			>
				{normalized}
			</span>
		</td>
	);
}

function WgDiscussionStatusBadge({
	status,
}: {
	status: WebXRWgDiscussionStatus;
}) {
	switch (status) {
		case "議論中":
			return (
				<span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-1 text-[10px] font-black text-amber-900">
					{status}
				</span>
			);
		case "追跡中":
			return (
				<span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[10px] font-black text-slate-700">
					{status}
				</span>
			);
		default: {
			const exhaustiveCheck: never = status;
			return exhaustiveCheck;
		}
	}
}

export default function WebXRStatusPage() {
	const sortedFeatures = [...WEBXR_FEATURES].sort((a, b) => b.stage - a.stage);

	return (
		<div className="relative px-4 md:px-6 py-16 md:py-20 max-w-6xl mx-auto overflow-hidden">
			<div className="space-y-12 relative z-10">
				{/* Header */}
				<div className="space-y-6 text-center">
					<h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900">
						標準化・対応状況
					</h1>
					<p className="text-lg text-gray-700 font-medium max-w-2xl mx-auto">
						WebXR
						関連仕様の標準化状況と、主要ブラウザ・デバイスの対応状況を一覧で確認できます。中核の
						WebXR Device API は W3C Recommendation
						ではなく、勧告候補草案（CRD）段階です。
					</p>
				</div>

				{/* Main Table Section */}
				<section className="space-y-8">
					<div className="flex flex-col gap-4 border-b border-gray-200 pb-4 md:flex-row md:items-end md:justify-between">
						<div>
							<h2 className="text-3xl font-black tracking-tight text-gray-950">
								まず一覧で見る
							</h2>
							<p className="mt-2 text-sm font-medium text-gray-600">
								仕様名、標準化ステージ、主要ブラウザの対応状況を先に確認できます。
							</p>
						</div>
						<span className="inline-flex w-fit items-center px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-black">
							{WEBXR_FEATURES.length} 機能
						</span>
					</div>
					<div className="text-xs text-gray-500 space-y-1">
						<p>最終確認: {WEBXR_STATUS_META.lastChecked}</p>
						<p>
							凡例: 79+ = 対応を確認できる最小バージョン、OT = Origin
							Trial、Flag = フラグ有効、Exp = 実験的機能、対応 =
							対応済み（版数不明）、未対応 = 未実装、未確認 = 公開情報なし
						</p>
					</div>

					<div className="bg-white/80 border border-white rounded-[2.5rem] shadow-xs overflow-hidden">
						<div className="overflow-x-auto">
							<table className="w-full text-sm">
								<thead>
									<tr className="bg-gray-50 border-b border-gray-200">
										<th className="px-6 py-4 text-left font-black text-gray-700">
											機能
										</th>
										<th className="px-6 py-4 text-left font-black text-gray-700">
											ステータス
										</th>
										{WEBXR_BROWSER_COLUMNS.map((column) => (
											<th
												key={column.key}
												className="px-2 py-4 text-center font-black text-gray-700"
											>
												{column.label}
											</th>
										))}
									</tr>
								</thead>
								<tbody className="divide-y divide-gray-100">
									{sortedFeatures.map((f) => (
										<tr
											key={f.name}
											className="hover:bg-red-50 transition-colors group"
										>
											<td className="px-6 py-4">
												<div className="flex flex-col gap-1">
													{f.specUrl ? (
														<a
															href={f.specUrl}
															target="_blank"
															rel="noopener noreferrer"
															className="text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors"
														>
															{f.name}
														</a>
													) : (
														<span className="text-base font-bold text-gray-900">
															{f.name}
														</span>
													)}
													<span className="text-xs text-gray-500 font-medium">
														{f.description}
													</span>
												</div>
											</td>
											<td className="px-6 py-4">
												<ProgressBar stage={f.stage} />
											</td>
											{WEBXR_BROWSER_COLUMNS.map((column) => (
												<BrowserCell
													key={column.key}
													value={f.support[column.key as BrowserKey]}
												/>
											))}
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</section>

				{/* Standards Process Card */}
				<div className="p-8 bg-white/80 border border-white rounded-[2.5rem] shadow-xs">
					<h2 className="text-2xl font-black text-gray-950 mb-6">
						標準化プロセス
					</h2>
					<p className="text-gray-700 text-sm mb-8 font-medium">
						WebXR 関連仕様は、W3C
						の勧告トラックやコミュニティグループの提案を通じて段階的に整備されます。ここでは、公開されている文書の成熟度を
						5 段階で整理しています。
					</p>
					<div className="grid grid-cols-2 md:grid-cols-5 gap-4">
						{WEBXR_STAGES.map((stage) => (
							<div
								key={stage.id}
								className="text-center p-4 bg-gray-50 rounded-2xl"
							>
								<div
									className={`w-12 h-12 mx-auto rounded-full ${stage.circleClass} flex items-center justify-center font-black mb-3`}
								>
									{stage.id}
								</div>
								<div className="font-bold text-sm text-gray-950 mb-1">
									{stage.name}
								</div>
								<div className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">
									{stage.desc}
								</div>
							</div>
						))}
					</div>
					<div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-5 text-sm text-gray-700">
						<p className="font-bold text-gray-900 mb-2">
							用語解説（W3Cの文書種別）
						</p>
						<ul className="list-disc pl-5 space-y-1">
							<li>
								ED（Editor&apos;s Draft）:
								エディターズドラフト。編集者が継続的に更新している作業中の最新版です。
							</li>
							<li>
								WD（Working Draft）:
								ワーキングドラフト。ワーキンググループが公開している検討中の草案です。
							</li>
							<li>
								CRD（Candidate Recommendation Draft）:
								勧告候補草案。勧告候補（CR）に向けて変更を取り込む作業中の草案です。WebXR
								Device API の現行版はこの段階です。
							</li>
							<li>
								CR（Candidate Recommendation）:
								勧告候補。実装やレビューを通じて、勧告に向けた最終確認を進める段階です。
							</li>
							<li>
								REC（Recommendation）: W3C
								勧告。正式な標準仕様として公開された状態です。
							</li>
						</ul>
						<p className="mt-3 text-xs text-gray-500">
							詳しくは{" "}
							<a
								href={WEBXR_STATUS_META.sources.docTypes}
								target="_blank"
								rel="noopener noreferrer"
								className="text-gray-900 font-bold underline decoration-gray-200 underline-offset-4 hover:decoration-gray-900 transition-all"
							>
								W3C文書種別ガイド
							</a>{" "}
							をご覧ください。
						</p>
					</div>
				</div>

				{/* Spec Updates */}
				<section className="space-y-6">
					<h2 className="text-2xl font-black text-gray-950">仕様差分メモ</h2>
					<p className="text-sm text-gray-600 font-medium">
						W3C TR の Changes
						セクションをもとに、直近の仕様更新を短く整理しています。
					</p>
					<div className="space-y-4">
						{WEBXR_SPEC_UPDATES.map((update) => (
							<div
								key={`${update.specName}-${update.publishedAt}`}
								className="rounded-[2rem] border border-gray-100 bg-white/80 p-6 shadow-xs"
							>
								<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
									<h3 className="text-lg font-black text-gray-900">
										<a
											href={update.specUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="hover:text-red-600 transition-colors"
										>
											{update.specName}
										</a>
									</h3>
									<p className="text-xs font-bold text-gray-500">
										{update.docType} / {update.publishedAt}
									</p>
								</div>
								<p className="mt-3 text-sm text-gray-700 leading-relaxed">
									{update.summary}
								</p>
								<ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-gray-700">
									{update.changes.map((change) => (
										<li key={change}>{change}</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</section>

				{/* WG Discussions */}
				<section className="space-y-6">
					<h2 className="text-2xl font-black text-gray-950">
						WG議論・記事候補の短い一覧
					</h2>
					<p className="text-sm text-gray-600 font-medium">
						Immersive Web WG の議事録で議論されているが、W3C TR
						としては未確定のトピックです。大きな詳細カードではなく、追うべき論点だけを短く記録しています。
					</p>
					<div className="overflow-hidden rounded-[2rem] border border-amber-100 bg-white/80 shadow-xs">
						{WEBXR_WG_DISCUSSIONS.map((discussion) => (
							<div
								key={`${discussion.title}-${discussion.publishedAt}`}
								className="border-b border-amber-100/70 p-5 last:border-b-0"
							>
								<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
									<div className="min-w-0">
										<div className="flex flex-wrap items-center gap-2">
											{discussion.issueUrl ? (
												<a
													href={discussion.issueUrl}
													target="_blank"
													rel="noopener noreferrer"
													className="text-base font-black text-gray-900 hover:text-red-600 transition-colors"
												>
													{discussion.title}
												</a>
											) : (
												<h3 className="text-base font-black text-gray-900">
													{discussion.title}
												</h3>
											)}
											<WgDiscussionStatusBadge status={discussion.status} />
											{discussion.articleCandidate ? (
												<span className="inline-flex items-center rounded-full bg-rose-50 px-2 py-1 text-[10px] font-black text-rose-700">
													記事候補
												</span>
											) : null}
										</div>
										<p className="mt-2 text-sm leading-relaxed text-gray-700">
											{discussion.summary}
										</p>
										<p className="mt-2 text-xs leading-relaxed text-gray-500">
											論点: {discussion.topics.slice(0, 2).join(" / ")}
										</p>
									</div>
									<div className="flex flex-wrap gap-3 text-xs font-bold text-gray-500 md:justify-end">
										<span>{discussion.publishedAt}</span>
										<a
											href={discussion.sourceUrl}
											target="_blank"
											rel="noopener noreferrer"
											className="text-gray-900 underline decoration-gray-200 underline-offset-4 hover:decoration-gray-900 transition-all"
										>
											議事録
										</a>
									</div>
								</div>
							</div>
						))}
					</div>
				</section>

				{/* Footer Sources */}
				<div className="text-center py-12 border-t border-gray-200 space-y-4">
					<p className="text-gray-500 text-xs font-bold uppercase tracking-widest">
						情報ソース
					</p>
					<div className="flex flex-wrap justify-center gap-6 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
						<a
							href={WEBXR_STATUS_META.sources.standards}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-red-600 transition-colors"
						>
							W3C TR（WebXR）
						</a>
						<a
							href={WEBXR_STATUS_META.sources.docTypes}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-red-600 transition-colors"
						>
							W3C 文書種別
						</a>
						<a
							href={WEBXR_STATUS_META.sources.proposals}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-red-600 transition-colors"
						>
							Proposals (GitHub)
						</a>
						<a
							href={WEBXR_STATUS_META.sources.chromeStatus}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-red-600 transition-colors"
						>
							Chrome Platform Status
						</a>
						<a
							href={WEBXR_STATUS_META.sources.mdnBcd}
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-red-600 transition-colors"
						>
							MDN BCD
						</a>
						<a
							href="https://www.w3.org/groups/wg/immersive-web/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-red-600 transition-colors"
						>
							W3C ワーキンググループ
						</a>
					</div>
				</div>
			</div>
		</div>
	);
}
