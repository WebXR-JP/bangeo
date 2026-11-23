import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { MarkBadge } from "@/components/report/report-mark";
import { STEAM_FRAME_WEBXR } from "@/data/steam-frame-webxr";
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
import { contentDateTime, formatContentDate } from "@/lib/content-dates";

export const metadata: Metadata = {
	title: "WebXR標準化・対応状況｜W3C仕様ステージ・ブラウザ対応",
	description:
		"WebXR Device API と Hit Test / Anchors / Hand Input / DOM Overlays / Layers / Depth Sensing などのModule標準化ステージと、Chrome・Safari・Quest Browser・Edgeの対応状況を一覧で確認できます。",
	alternates: { canonical: "/webxr-status" },
};

/* BANGEO design · 骨格: 表（仕様 × ブラウザ）→ 番号の段（標準化の5段階）→ 変更点 → 論点の行 ·
   自己採点は報告に記載 */

const SECTION_HEADING =
	"text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]";
const SECTION_LEAD =
	"mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-700";
/** 注記と出典の補足。1行を和文40字ほどに収める */
const NOTE_BODY = "min-w-0 max-w-[40em] space-y-2";
const NOTE = "text-[13px] leading-[1.6] text-gray-600";
/** 注記と出典の1行（左に対象、右に補足） */
const NOTE_ROW = "grid gap-1 py-4 md:grid-cols-[14rem_minmax(0,1fr)] md:gap-6";
const NOTE_TERM = "break-phrase font-bold text-gray-950";
/** 行に単独で置くリンク。スマートフォンでは押せる高さ 44px を取る */
const NOTE_LINK = "text-link inline-flex min-h-11 items-center md:min-h-8";

/** 外向きの矢印（フッターと同じ形）。読み上げない */
function ExternalIcon() {
	return (
		<svg
			className="ml-0.5 inline-block size-3 shrink-0 align-[-0.05em]"
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
		</svg>
	);
}

/** 新しいタブで開く外部リンク。label は見えている文字を含める（読み上げ名と表示を一致させる） */
function ExternalLink({
	href,
	label,
	className = "text-link",
	children,
}: {
	href: string;
	label: string;
	className?: string;
	children: ReactNode;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={`${label}（新しいタブで開く）`}
			className={className}
		>
			{children}
			<ExternalIcon />
		</a>
	);
}

/** データの日付（「2026年10月14日」「2026-10-14」のどちらでも）を「2026年10月14日」にそろえる */
function DateText({ value }: { value: string }) {
	return (
		<time dateTime={contentDateTime(value)}>
			{formatContentDate(value) ?? value}
		</time>
	);
}

/** 説明文の `code` を等幅の小さな囲みにする（データの文字は変えない） */
function withCode(text: string) {
	return text.split(/(`[^`]+`)/).map((part, index) =>
		part.startsWith("`") && part.endsWith("`") ? (
			<code
				// biome-ignore lint/suspicious/noArrayIndexKey: 同じ文の中で順番が変わらない断片
				key={index}
				className="rounded bg-gray-100 px-1 py-0.5 font-mono text-[0.9em] text-gray-800"
			>
				{part.slice(1, -1)}
			</code>
		) : (
			part
		),
	);
}

/** 「Chrome（デスクトップ）」を「Chrome」と「デスクトップ」に分ける。表の見出しで2行にするため */
function splitLabel(label: string) {
	const match = /^(.+?)（(.+)）$/.exec(label);
	return match ? { main: match[1], sub: match[2] } : { main: label };
}

/**
 * 標準化の段階。色で序列を付けず、5つの並びの中の位置（どこまで進んだか）と段階名で示す
 */
function StageMeter({ stage }: { stage: Stage }) {
	return (
		<div className="flex flex-wrap items-center gap-x-2.5 gap-y-1.5">
			<span aria-hidden="true" className="flex gap-1">
				{WEBXR_STAGES.map((step) => (
					<span
						key={step.id}
						className={`h-1.5 w-4 rounded-full ${step.id <= stage ? "bg-gray-800" : "bg-gray-200"}`}
					/>
				))}
			</span>
			<span className="text-sm font-bold leading-[1.5] text-gray-800">
				<span className="sr-only">{`${WEBXR_STAGES.length}段階中${stage}段階目、`}</span>
				{WEBXR_STAGE_BY_ID[stage].name}
			</span>
		</div>
	);
}

const TRIAL_VALUES = ["Flag", "OT", "Exp"];

/**
 * ブラウザの対応。/report と同じ印（対応=青の✓ / 未対応=灰の– / 未確認=アンバーの?）にそろえる。
 * 「152.1（Experimental）」のような版番号 + 補足は、印に版番号を入れ、補足を下に添える
 */
function SupportBadge({ value }: { value: string }) {
	const normalized = value === "-" ? "未確認" : value;
	if (normalized === "未確認") {
		return <MarkBadge mark="unknown">未確認</MarkBadge>;
	}
	if (normalized === "未対応") {
		return <MarkBadge mark="no">未対応</MarkBadge>;
	}
	const isSupported =
		normalized === "対応" || /\+$/.test(normalized) || /^\d/.test(normalized);
	if (TRIAL_VALUES.includes(normalized) || !isSupported) {
		return <span className="chip">{normalized}</span>;
	}
	const match = /^(.+?)（(.+)）$/.exec(normalized);
	const version = match ? match[1] : normalized;
	const note = match?.[2];
	return (
		<span className="inline-flex flex-col items-start gap-1">
			<MarkBadge mark="yes">
				{version === "対応" ? (
					"対応"
				) : (
					<>
						<span className="sr-only">対応 </span>
						<span className="tabular-nums">{version}</span>
					</>
				)}
			</MarkBadge>
			{note ? (
				<span className="text-xs leading-[1.5] text-gray-500">{note}</span>
			) : null}
		</span>
	);
}

const WG_STATUS_LABELS: Record<WebXRWgDiscussionStatus, string> = {
	議論中: "WGで議論中",
	追跡中: "経過を確認中",
};

function ChevronIcon() {
	return (
		<svg
			className="size-5 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M5 7.5l5 5 5-5" />
		</svg>
	);
}

export default function WebXRStatusPage() {
	const sortedFeatures = [...WEBXR_FEATURES].sort((a, b) => b.stage - a.stage);
	const deviceApi = WEBXR_FEATURES.find(
		(feature) => feature.name === "WebXR Device API",
	);
	const stageCounts = new Map<Stage, number>();
	for (const feature of WEBXR_FEATURES) {
		stageCounts.set(feature.stage, (stageCounts.get(feature.stage) ?? 0) + 1);
	}
	const aura = WEBXR_STATUS_META.deviceNotes.xrealAura;
	const sources = [
		{ href: WEBXR_STATUS_META.sources.standards, label: "W3C TR（WebXR）" },
		{ href: WEBXR_STATUS_META.sources.docTypes, label: "W3C文書種別" },
		{ href: WEBXR_STATUS_META.sources.proposals, label: "Proposals（GitHub）" },
		{
			href: WEBXR_STATUS_META.sources.chromeStatus,
			label: "Chrome Platform Status",
		},
		{ href: WEBXR_STATUS_META.sources.mdnBcd, label: "MDN BCD" },
		{
			href: "https://www.w3.org/groups/wg/immersive-web/",
			label: "W3Cワーキンググループ",
		},
	];

	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "標準化・対応状況", path: "/webxr-status" }]}
			/>
			<PageHeader
				title="標準化・対応状況"
				lead={`WebXR関連の${WEBXR_FEATURES.length}件の仕様について、W3Cでの標準化の段階と、${WEBXR_BROWSER_COLUMNS.length}つのブラウザの対応状況を一覧にしています。中核のWebXR Device APIは、W3C勧告（Recommendation）ではなく、勧告候補草案（CRD）の段階です。`}
				meta={
					<>
						<p className="break-phrase">
							ブラウザ対応の確認日:{" "}
							<DateText
								value={WEBXR_STATUS_META.browserReferencesLastChecked}
							/>
							（参照: Quest
							Browserの公式リリースノートなど）。仕様の確認日は各項目に記載しています。
						</p>
						<p>
							確認対象: Quest Browser 152.1（公式リリースノート:
							2026年10月2日）。
						</p>
					</>
				}
			/>

			<div className="space-y-16 md:space-y-20">
				{/* 仕様 × ブラウザの表 */}
				<section aria-labelledby="status-table">
					<h2 id="status-table" className={SECTION_HEADING}>
						仕様ごとの標準化の段階とブラウザ対応
					</h2>
					<p className={SECTION_LEAD}>
						{WEBXR_FEATURES.length}
						件を、標準化の段階が進んだ順に並べています。
					</p>

					<div className="mt-6">
						<dl className="flex flex-wrap gap-x-5 gap-y-2.5">
							<div className="flex items-center gap-2">
								<dt>
									<MarkBadge mark="yes">79+</MarkBadge>
								</dt>
								<dd className={NOTE}>対応を確認できる最小バージョン</dd>
							</div>
							<div className="flex items-center gap-2">
								<dt>
									<MarkBadge mark="yes">対応</MarkBadge>
								</dt>
								<dd className={NOTE}>対応情報あり（版数は不明）</dd>
							</div>
							<div className="flex items-center gap-2">
								<dt>
									<MarkBadge mark="no">未対応</MarkBadge>
								</dt>
								<dd className={NOTE}>対象の環境で未実装</dd>
							</div>
							<div className="flex items-center gap-2">
								<dt>
									<MarkBadge mark="unknown">未確認</MarkBadge>
								</dt>
								<dd className={NOTE}>対応を判断できる根拠が未確認</dd>
							</div>
						</dl>
						<p className={`mt-3 max-w-[48em] ${NOTE}`}>
							OT = Origin Trial、Flag = フラグ有効、Exp =
							実験的機能。「公式発表あり・実機未検証」は、発表を確認できても、BANGEOでの動作確認は行っていない状態です。ブラウザ対応の個別確認日が未記録の項目は、今回再確認したものではありません。対応表は各端末での実測を保証しません。
						</p>
					</div>

					{/* PC幅は表。見出し行はヘッダーの下に固定する（overflow-clip はスクロールの枠を作らないので固定が効く）。
					    1024px 未満は行ごとの縦積みにし、各セルにブラウザ名を出す */}
					<div className="card mt-6 overflow-clip">
						<table className="block w-full text-left lg:table lg:table-fixed">
							<thead className="hidden lg:table-header-group">
								<tr>
									<th
										scope="col"
										className="sticky top-20 z-10 bg-gray-50 px-5 py-3 align-bottom text-[13px] font-bold leading-[1.5] text-gray-700 shadow-[inset_0_-1px_0_var(--color-gray-200)]"
									>
										仕様
									</th>
									<th
										scope="col"
										className="sticky top-20 z-10 w-44 bg-gray-50 px-4 py-3 align-bottom text-[13px] font-bold leading-[1.5] text-gray-700 shadow-[inset_0_-1px_0_var(--color-gray-200)]"
									>
										標準化の段階
									</th>
									{WEBXR_BROWSER_COLUMNS.map((column) => {
										const label = splitLabel(column.label);
										return (
											<th
												key={column.key}
												scope="col"
												className="sticky top-20 z-10 w-28 bg-gray-50 px-3 py-3 align-bottom text-[13px] font-bold leading-[1.5] text-gray-700 shadow-[inset_0_-1px_0_var(--color-gray-200)]"
											>
												{label.main}
												{label.sub ? (
													<span className="block text-xs font-normal text-gray-500">
														{label.sub}
													</span>
												) : null}
											</th>
										);
									})}
								</tr>
							</thead>
							<tbody className="block lg:table-row-group">
								{sortedFeatures.map((feature) => (
									<tr
										key={feature.name}
										className="grid grid-cols-2 gap-x-4 gap-y-4 border-b border-gray-200 px-5 py-6 last:border-b-0 md:grid-cols-4 lg:table-row lg:p-0"
									>
										<td className="col-span-2 block md:col-span-4 lg:table-cell lg:px-5 lg:py-5 lg:align-top">
											<h3 className="text-base font-bold leading-snug text-gray-950">
												{feature.specUrl ? (
													<ExternalLink
														href={feature.specUrl}
														label={`${feature.name}の仕様`}
														className="text-gray-950 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-primary-700 hover:decoration-current"
													>
														{feature.name}
													</ExternalLink>
												) : (
													feature.name
												)}
											</h3>
											<p className="mt-1.5 text-sm leading-[1.7] text-gray-600">
												{withCode(feature.description)}
											</p>
											{/* 2つの確認日は、それぞれの中では折らない（折るなら「 / 」のところで） */}
											<p className="mt-2 text-xs leading-[1.6] text-gray-500">
												<span className="inline-block">
													仕様の確認日:{" "}
													<DateText value={feature.specLastChecked} />
												</span>
												{" / "}
												<span className="inline-block">
													ブラウザ対応の個別確認日:{" "}
													{feature.supportLastChecked ? (
														<DateText value={feature.supportLastChecked} />
													) : (
														"未記録"
													)}
												</span>
											</p>
										</td>
										<td className="col-span-2 block md:col-span-4 lg:table-cell lg:px-4 lg:py-5 lg:align-top">
											<span className="mb-1.5 block text-xs font-bold text-gray-500 lg:hidden">
												標準化の段階
											</span>
											<StageMeter stage={feature.stage} />
										</td>
										{WEBXR_BROWSER_COLUMNS.map((column) => (
											<td
												key={column.key}
												className="block min-w-0 lg:table-cell lg:px-3 lg:py-5 lg:align-top"
											>
												<span className="mb-1.5 block text-xs font-bold text-gray-500 lg:hidden">
													{column.label}
												</span>
												<SupportBadge
													value={feature.support[column.key as BrowserKey]}
												/>
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>

					{/* 長い補足と出典。表を読むのに要る注意は上の凡例に残し、デバイスごとの補足はここに畳む */}
					<details className="group mt-6 rounded-2xl bg-gray-50">
						<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-5 py-4 [&::-webkit-details-marker]:hidden">
							<span className="min-w-0">
								<span className="block text-base font-bold text-gray-950">
									注記と出典
								</span>
								<span className="mt-0.5 block text-[13px] leading-[1.6] text-gray-600">
									Steam Frame、XREAL AURA、Quest Browser、Meta VR
									Glassesの補足と、参照した資料
								</span>
							</span>
							<ChevronIcon />
						</summary>
						<dl className="divide-y divide-gray-200 px-5 pb-5 text-sm leading-[1.7] text-gray-700">
							<div className={NOTE_ROW}>
								<dt className={NOTE_TERM}>Steam Frame（Beta・条件付き）</dt>
								<dd className={NOTE_BODY}>
									<p>
										{STEAM_FRAME_WEBXR.summary}
										{STEAM_FRAME_WEBXR.limitations}（
										<DateText value={STEAM_FRAME_WEBXR.lastChecked} />
										に公式情報を確認）
									</p>
									<p>
										Chrome（デスクトップ）欄の版数を、Steam
										FrameやすべてのOSでの動作条件として読み替えないでください。
									</p>
									<p className="flex flex-wrap gap-x-5">
										<ExternalLink
											href={STEAM_FRAME_WEBXR.sourceUrl}
											label="Valveの公式発表"
											className={NOTE_LINK}
										>
											Valveの公式発表
										</ExternalLink>
										<Link
											href={STEAM_FRAME_WEBXR.articleUrl}
											className={NOTE_LINK}
										>
											利用条件と実機報告の解説を読む
										</Link>
									</p>
								</dd>
							</div>
							<div className={NOTE_ROW}>
								<dt className={NOTE_TERM}>XREAL AURA</dt>
								<dd className={NOTE_BODY}>
									<p>
										{aura.summary}（<DateText value={aura.lastChecked} />
										に確認）
									</p>
									<p>
										<ExternalLink
											href={aura.sourceUrl}
											label="XREALの公式デモ報告"
											className={NOTE_LINK}
										>
											XREALの公式デモ報告
										</ExternalLink>
									</p>
								</dd>
							</div>
							<div className={NOTE_ROW}>
								<dt className={NOTE_TERM}>Quest Browser</dt>
								<dd className={NOTE_BODY}>
									<p>
										WebGPU composition layersは実験機能で、chrome://flagsのwebxr
										experimentsが必要です。Metaのv207は開発用SDKの版数で、Quest
										Browserの版数ではありません。
									</p>
									<p>
										<ExternalLink
											href={WEBXR_STATUS_META.sources.metaHorizonReleaseNotes}
											label="Quest Browser 152.1のリリースノート"
											className={NOTE_LINK}
										>
											Quest Browser 152.1のリリースノート
										</ExternalLink>
									</p>
								</dd>
							</div>
							<div className={NOTE_ROW}>
								<dt className={NOTE_TERM}>Meta VR Glasses</dt>
								<dd className={NOTE_BODY}>
									<p>
										Meta VR
										Glassesは発売前のデバイスで、MetaがWebXRへの対応を予定しています。実機未検証のため、現在利用可能な対応デバイスには含めません。
									</p>
									<p>
										入力互換性: Meta VR Glassesの2D Webページでは、視線によるCSS
										:hoverやpointer
										hoverイベントが発火しません。hoverに依存する操作を避けてください。IWSDKの3D操作には独自のHovered状態があります。
									</p>
									<p className="flex flex-wrap items-center gap-x-5">
										<span className="text-gray-500">出典:</span>
										<ExternalLink
											href="https://developers.meta.com/horizon/documentation/web/2d-web/"
											label="MetaのWeb向けガイド"
											className={NOTE_LINK}
										>
											MetaのWeb向けガイド
										</ExternalLink>
										<ExternalLink
											href="https://developers.meta.com/horizon/documentation/iwsdk/guides/get-started-glasses/"
											label="IWSDKのVR Glassesガイド"
											className={NOTE_LINK}
										>
											IWSDKのVR Glassesガイド
										</ExternalLink>
									</p>
								</dd>
							</div>
							<div className={NOTE_ROW}>
								<dt className={NOTE_TERM}>参照した資料</dt>
								<dd className="min-w-0">
									<ul className="flex flex-wrap gap-x-5">
										{sources.map((source) => (
											<li key={source.href}>
												<ExternalLink
													href={source.href}
													label={source.label}
													className={NOTE_LINK}
												>
													{source.label}
												</ExternalLink>
											</li>
										))}
									</ul>
								</dd>
							</div>
						</dl>
					</details>
				</section>

				{/* 標準化の5段階 */}
				<section aria-labelledby="stages">
					<h2 id="stages" className={SECTION_HEADING}>
						標準化の{WEBXR_STAGES.length}つの段階
					</h2>
					<p className={SECTION_LEAD}>
						WebXR関連の仕様は、W3Cの勧告トラックやコミュニティグループの提案を通じて段階的に整備されます。上の表では、公開されている文書の成熟度を
						{WEBXR_STAGES.length}段階に分けています。
					</p>
					{deviceApi ? (
						<p className="mt-2 max-w-[40em] text-base leading-[1.8] text-gray-700">
							中核のWebXR Device APIは{deviceApi.stage}段階目の「
							{WEBXR_STAGE_BY_ID[deviceApi.stage].name}
							」にあり、現行版は勧告候補草案（CRD）です。
						</p>
					) : null}

					<ol className="mt-8 grid gap-4 lg:grid-cols-5 lg:gap-3">
						{WEBXR_STAGES.map((stage) => {
							const count = stageCounts.get(stage.id) ?? 0;
							const isDeviceApiStage = deviceApi?.stage === stage.id;
							return (
								<li
									key={stage.id}
									className={`border-l-2 pl-4 lg:border-l-0 lg:border-t-2 lg:pl-0 lg:pt-4 ${isDeviceApiStage ? "border-gray-950" : "border-gray-200"}`}
								>
									<p className="text-[13px] font-bold leading-[1.6] text-gray-500 tabular-nums">
										{stage.id}段階目
									</p>
									<p className="mt-0.5 text-base font-bold leading-snug text-gray-950">
										{stage.name}
									</p>
									<p className="text-xs leading-[1.6] text-gray-500">
										{stage.desc}
									</p>
									<p className="mt-2 text-[13px] leading-[1.6] text-gray-600">
										{count > 0 ? `該当する仕様 ${count}件` : "該当する仕様なし"}
									</p>
									{isDeviceApiStage ? (
										<p className="mt-2 text-[13px] font-bold leading-[1.6] text-gray-950">
											WebXR Device APIはこの段階
										</p>
									) : null}
								</li>
							);
						})}
					</ol>

					<div className="mt-10 rounded-2xl bg-gray-50 p-5 md:p-6">
						<h3 className="text-base font-bold text-gray-950">W3Cの文書種別</h3>
						<dl className="mt-3 divide-y divide-gray-200 text-sm leading-[1.7] text-gray-700">
							{[
								{
									term: "ED（Editor's Draft）",
									body: "エディターズドラフト。編集者が継続的に更新している作業中の最新版です。",
								},
								{
									term: "WD（Working Draft）",
									body: "ワーキングドラフト。ワーキンググループが公開している検討中の草案です。",
								},
								{
									term: "CRD（Candidate Recommendation Draft）",
									body: "勧告候補草案。勧告候補（CR）に向けて変更を取り込む作業中の草案です。WebXR Device APIの現行版はこの段階です。",
								},
								{
									term: "CR（Candidate Recommendation）",
									body: "勧告候補。実装やレビューを通じて、勧告に向けた最終確認を進める段階です。",
								},
								{
									term: "REC（Recommendation）",
									body: "W3C勧告。正式な標準仕様として公開された状態です。",
								},
							].map((item) => (
								<div
									key={item.term}
									className="grid gap-0.5 py-3 md:grid-cols-[18rem_minmax(0,1fr)] md:gap-6"
								>
									<dt className="font-bold text-gray-950">{item.term}</dt>
									<dd className="max-w-[40em]">{item.body}</dd>
								</div>
							))}
						</dl>
						<p className={`mt-3 flex flex-wrap items-center gap-x-2 ${NOTE}`}>
							定義の原文:
							<ExternalLink
								href={WEBXR_STATUS_META.sources.docTypes}
								label="W3C文書種別ガイド"
								className={NOTE_LINK}
							>
								W3C文書種別ガイド
							</ExternalLink>
						</p>
					</div>
				</section>

				{/* 仕様の公開版と変更点 */}
				<section aria-labelledby="spec-updates">
					<h2 id="spec-updates" className={SECTION_HEADING}>
						公開された仕様の変更点
					</h2>
					<p className={SECTION_LEAD}>
						W3C
						TRで公開された版と、そのChanges節に書かれた変更点です。仕様への記載とブラウザへの実装は別です。
					</p>
					<div className="mt-6 space-y-4">
						{WEBXR_SPEC_UPDATES.map((update) => (
							<article
								key={`${update.specName}-${update.publishedAt}`}
								className="card p-5 md:p-6"
							>
								<div className="flex flex-col gap-1 md:flex-row md:items-baseline md:justify-between md:gap-6">
									<h3 className="text-lg font-bold leading-snug text-gray-950">
										<ExternalLink
											href={update.specUrl}
											label={update.specName}
											className="underline decoration-gray-300 underline-offset-4 transition-colors hover:text-primary-700 hover:decoration-current"
										>
											{update.specName}
										</ExternalLink>
									</h3>
									<p className="shrink-0 text-[13px] leading-[1.6] text-gray-500">
										{update.docType}・<DateText value={update.publishedAt} />
										公開
									</p>
								</div>
								<p className="mt-3 max-w-[48em] text-sm leading-[1.7] text-gray-700">
									{update.summary}
								</p>
								<ul className="mt-4 grid gap-x-8 gap-y-2 text-sm leading-[1.7] text-gray-700 md:grid-cols-2">
									{update.changes.map((change) => (
										<li key={change} className="flex gap-2.5">
											<span
												aria-hidden="true"
												className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-gray-400"
											/>
											<span className="min-w-0">{change}</span>
										</li>
									))}
								</ul>
							</article>
						))}
					</div>
				</section>

				{/* ワーキンググループの論点 */}
				<section aria-labelledby="wg-discussions">
					<h2 id="wg-discussions" className={SECTION_HEADING}>
						ワーキンググループで議論中の論点
					</h2>
					<p className={SECTION_LEAD}>
						Immersive Web WGの議事録やIssueで議論されている、W3C
						TRでは未確定の論点です。
					</p>
					<ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
						{WEBXR_WG_DISCUSSIONS.map((discussion) => (
							<li
								key={`${discussion.title}-${discussion.publishedAt}`}
								className="grid gap-3 py-6 md:grid-cols-[minmax(0,1fr)_11rem] md:gap-10"
							>
								<div className="min-w-0">
									<div className="flex flex-wrap items-center gap-x-3 gap-y-2">
										<h3 className="text-lg font-bold leading-snug text-gray-950">
											{discussion.issueUrl ? (
												<ExternalLink
													href={discussion.issueUrl}
													label={discussion.title}
													className="underline decoration-gray-300 underline-offset-4 transition-colors hover:text-primary-700 hover:decoration-current"
												>
													{discussion.title}
												</ExternalLink>
											) : (
												discussion.title
											)}
										</h3>
										<span className="chip">
											{WG_STATUS_LABELS[discussion.status]}
										</span>
									</div>
									<p className="mt-2 max-w-[48em] text-sm leading-[1.7] text-gray-700">
										{discussion.summary}
									</p>
									<p className={`mt-2 max-w-[48em] ${NOTE}`}>
										論点: {discussion.topics.slice(0, 2).join(" / ")}
									</p>
								</div>
								<div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] leading-[1.6] md:flex-col md:items-end md:text-right">
									<span className="text-gray-500">
										<DateText value={discussion.publishedAt} />
									</span>
									<ExternalLink
										href={discussion.sourceUrl}
										label={`${discussion.title}の${/minutes/.test(discussion.sourceUrl) ? "議事録" : "出典"}`}
										className="text-link inline-flex min-h-11 items-center font-bold md:min-h-0"
									>
										{/minutes/.test(discussion.sourceUrl) ? "議事録" : "出典"}
									</ExternalLink>
								</div>
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}
