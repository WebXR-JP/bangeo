import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import {
	WEBXR_EVENT_FOCUS,
	WEBXR_EVENT_FOCUS_LAST_UPDATED,
} from "@/data/webxr-event-focus";
import {
	WEBXR_DEVICE_WATCH_TARGETS,
	WEBXR_EVENTS,
	WEBXR_EVENTS_LAST_UPDATED,
	type WebXREventOrganizerType,
	type WebXREventRegion,
	type WebXRRelevance,
} from "@/data/webxr-events";

export const metadata: Metadata = {
	title: "WebXRイベントウォッチ｜国内XRイベント・Meta Connect・WWDC・XR Kaigi",
	description:
		"国内XRイベント、Meta Connect、WWDC、W3C TPACなど、WebXR / WebAR / Spatial Web開発者向けに、開催日程・注目テーマ・公式情報をまとめています。",
	alternates: { canonical: "/events" },
};

/* BANGEO design · 骨格: 開催が近い3件（既存の暗い帯）→ 国内の注目イベントの行（淡い rose の面）→ 絞り込み + カードの一覧 ·
   自己採点は報告に記載 */

type WatchEvent = (typeof WEBXR_EVENTS)[number];

type EventPhase = "past" | "live" | "upcoming";

// Evaluate against each event's local calendar date so past events never remain upcoming.
function eventPhase(event: WatchEvent, now: Date): EventPhase {
	if (event.endAt && now >= new Date(event.endAt)) return "past";
	const today = new Intl.DateTimeFormat("en-CA", {
		timeZone: event.timezone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
	if (event.endDate < today) return "past";
	if (event.startDate <= today) return "live";
	return "upcoming";
}

const statusGroups = [
	{
		key: "live",
		title: "開催中",
		description: "いま開催期間に入っているイベントです。",
	},
	{
		key: "upcoming",
		title: "これからのイベント",
		description: "開催日が近い順に並べています。",
	},
	{
		key: "past",
		title: "過去のイベント",
		description:
			"新しい順に並べています。録画や公開資料の有無は、各イベントの公式情報で確認できます。",
	},
] as const;

const filters = [
	{ key: "all", label: "すべて" },
	{ key: "global", label: "海外" },
	{ key: "japan", label: "国内" },
	{ key: "device", label: "デバイス" },
	{ key: "browser", label: "ブラウザ" },
	{ key: "standards", label: "標準化" },
	{ key: "community", label: "コミュニティ" },
	{ key: "recap", label: "過去のイベント" },
] as const;

type EventFilter = (typeof filters)[number]["key"];

const organizerLabels: Partial<Record<WebXREventOrganizerType, string>> = {
	standards: "標準化",
	browser_vendor: "ブラウザ",
	device_maker: "デバイス",
	expo: "展示会",
	community: "コミュニティ",
	developer_conference: "開発者会議",
};

const regionLabels: Record<WebXREventRegion, string> = {
	global: "海外",
	japan: "国内",
	"japan-local": "国内",
};

const relevanceLabels: Record<WebXRRelevance, string> = {
	direct: "WebXR関連",
	adjacent: "周辺技術",
	weak: "周辺分野",
	unknown: "関連性確認中",
};

function matchesFilter(event: WatchEvent, filter: EventFilter, now: Date) {
	switch (filter) {
		case "global":
			return (
				(event.region ??
					(event.category.includes("Japan") ? "japan" : "global")) === "global"
			);
		case "japan":
			return (
				event.region === "japan" ||
				event.region === "japan-local" ||
				event.category.includes("Japan")
			);
		case "standards":
			return (
				event.organizerType === "standards" ||
				/標準|standards/i.test(event.category)
			);
		case "browser":
			return (
				event.organizerType === "browser_vendor" ||
				event.category.includes("Chrome") ||
				event.category.includes("Safari") ||
				event.entityTags.includes("Safari") ||
				event.category.includes("Quest Browser")
			);
		case "device":
			return (
				event.hasHandsOn ||
				event.organizerType === "device_maker" ||
				event.category.includes("Device") ||
				/devices/i.test(event.category)
			);
		case "community":
			return (
				event.organizerType === "community" || /community/i.test(event.category)
			);
		case "recap":
			return eventPhase(event, now) === "past";
		default:
			return true;
	}
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** 「2026-11-30」を「2026年11月30日」に。読めない値はそのまま */
function formatDay(value: string) {
	const match = ISO_DATE.exec(value);
	if (!match) return value;
	return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
}

/**
 * 期間を「2026年11月30日〜12月2日」の形にする。同じ年・同じ月は2回目を省く。
 * 1ページの中の日付をすべてこの形（年月日）にそろえる
 */
function formatRange(start: string, end?: string) {
	const s = ISO_DATE.exec(start);
	const e = end ? ISO_DATE.exec(end) : null;
	if (!s) return end && end !== start ? `${start}〜${end}` : start;
	const startText = formatDay(start);
	if (!e || end === start) return startText;
	if (e[1] !== s[1]) return `${startText}〜${formatDay(end ?? "")}`;
	if (e[2] !== s[2]) return `${startText}〜${Number(e[2])}月${Number(e[3])}日`;
	return `${startText}〜${Number(e[3])}日`;
}

/**
 * 国内の注目イベントの期間「2026-09-17〜09-21」を、開始日と終了日に分ける。
 * 終了日に年がなければ開始日の年（月が戻るときは翌年）とする
 */
function parseFocusDates(dates: string) {
	const match =
		/^(\d{4})-(\d{2})-(\d{2})(?:〜(?:(\d{4})-)?(\d{2})-(\d{2}))?$/.exec(dates);
	if (!match) return null;
	const [, sy, sm, sd, ey, em, ed] = match;
	const start = `${sy}-${sm}-${sd}`;
	if (!em || !ed) return { start, end: start };
	const endYear = ey ?? (Number(em) < Number(sm) ? String(Number(sy) + 1) : sy);
	return { start, end: `${endYear}-${em}-${ed}` };
}

function eventTags(event: WatchEvent) {
	const derivedRegion =
		event.region ?? (event.category.includes("Japan") ? "japan" : "global");
	return [
		regionLabels[derivedRegion],
		event.organizerType ? organizerLabels[event.organizerType] : undefined,
		event.hasHandsOn ? "体験展示" : undefined,
		event.webxrRelevance ? relevanceLabels[event.webxrRelevance] : undefined,
	]
		.filter((tag): tag is string => Boolean(tag))
		.filter((tag, index, tags) => tags.indexOf(tag) === index)
		.slice(0, 3);
}

/** 会期の状況の言葉。一覧のカードと国内の面で同じ言葉を使う */
const PHASE_LABELS: Record<EventPhase, string> = {
	past: "開催終了",
	live: "開催中",
	upcoming: "開催予定",
};

function phaseLabel(event: WatchEvent, now: Date) {
	const phase = eventPhase(event, now);
	if (phase === "past" && event.slug === "meta-connect-2026") {
		return "開催終了・オンデマンド公開";
	}
	return PHASE_LABELS[phase];
}

/** 国内の注目イベントの状況を、日本の日付（YYYY-MM-DD）と会期から判定する */
function focusPhase(
	dates: { start: string; end: string },
	today: string,
): EventPhase {
	if (dates.end < today) return "past";
	if (dates.start <= today) return "live";
	return "upcoming";
}

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

function EventCard({ event, now }: { event: WatchEvent; now: Date }) {
	const linkLabel =
		event.sourceType === "news" ? "紹介記事を読む" : "公式情報を見る";
	return (
		<article
			id={event.slug}
			aria-labelledby={`${event.slug}-title`}
			className="card flex h-full scroll-mt-24 flex-col p-5"
		>
			<h4
				id={`${event.slug}-title`}
				className="text-lg font-bold leading-snug text-gray-950"
			>
				{event.title}
			</h4>
			{/* 日程は開催地の日付なので、dateTime も時刻のない日付にする。場所の名前は途中で折らない */}
			<p className="mt-1 text-sm leading-[1.6] text-gray-600">
				<time dateTime={event.startDate}>
					{formatRange(event.startDate, event.endDate)}
				</time>
				・<span className="inline-block">{event.location}</span>
			</p>
			<p className="mt-3 flex flex-wrap gap-1.5">
				<span className="chip bg-white ring-1 ring-gray-300 ring-inset">
					{phaseLabel(event, now)}
				</span>
				{eventTags(event).map((tag) => (
					<span key={tag} className="chip">
						{tag}
					</span>
				))}
			</p>
			<p className="mt-3 text-sm leading-[1.7] text-gray-700">
				<span className="font-bold text-gray-950">注目テーマ: </span>
				{event.watchTopics
					.slice(
						0,
						event.slug === "meta-vr-start-developer-competition-2026" ? 3 : 2,
					)
					.join(" / ")}
			</p>
			<div className="mt-auto pt-4">
				<a
					href={event.sourceUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`${event.title}の${linkLabel}（新しいタブで開く）`}
					className="text-link inline-flex min-h-11 items-center text-sm font-bold md:min-h-8"
				>
					{linkLabel}
					<ExternalIcon />
				</a>
				<p className="text-[13px] leading-[1.6] text-gray-500">
					確認日: {formatDay(event.lastCheckedAt)}
				</p>
			</div>
		</article>
	);
}

type FocusItem = {
	event: (typeof WEBXR_EVENT_FOCUS)[number];
	dates: ReturnType<typeof parseFocusDates>;
	/** 会期から判定した状況。期間を読めないときは null（状況を出さない） */
	phase: EventPhase | null;
};

/** 国内の注目イベントの1行。左に 状況 → 名前 → 日付と場所、右に 概要 → 見どころ → 公式情報 */
function FocusRow({ item }: { item: FocusItem }) {
	const { event, dates, phase } = item;
	return (
		<li className="grid gap-x-10 gap-y-3 py-6 md:grid-cols-[15rem_minmax(0,1fr)]">
			<div className="min-w-0">
				{phase ? (
					<p>
						<span className="chip bg-white ring-1 ring-gray-300 ring-inset">
							{PHASE_LABELS[phase]}
						</span>
					</p>
				) : null}
				<h3 className="mt-2 text-lg font-bold leading-snug text-gray-950">
					{event.title}
				</h3>
				<p className="mt-1 text-sm leading-[1.6] text-gray-600">
					{dates ? (
						<time dateTime={dates.start}>
							{formatRange(dates.start, dates.end)}
						</time>
					) : (
						event.dates
					)}
					・<span className="inline-block">{event.location}</span>
				</p>
			</div>
			<div className="min-w-0">
				<p className="max-w-[44em] text-sm leading-[1.7] text-gray-700">
					{event.summary}
				</p>
				<p className="mt-3 text-[13px] font-bold leading-[1.6] text-gray-950">
					見どころ
				</p>
				<ul className="mt-1 space-y-1 text-sm leading-[1.7] text-gray-700">
					{event.watch.slice(0, 2).map((watchItem) => (
						<li key={watchItem} className="flex gap-2.5">
							<span
								aria-hidden="true"
								className="mt-[0.7em] size-1 shrink-0 rounded-full bg-gray-500"
							/>
							<span className="min-w-0">{watchItem}</span>
						</li>
					))}
				</ul>
				<a
					href={event.sourceUrl}
					target="_blank"
					rel="noopener noreferrer"
					aria-label={`${event.title}の公式情報を見る（新しいタブで開く）`}
					className="text-link mt-2 inline-flex min-h-11 items-center text-sm font-bold md:min-h-8"
				>
					公式情報を見る
					<ExternalIcon />
				</a>
			</div>
		</li>
	);
}

interface EventsPageProps {
	searchParams?: Promise<{ filter?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
	const params = await searchParams;
	const now = new Date();
	const selectedFilter = filters.some((filter) => filter.key === params?.filter)
		? (params?.filter as EventFilter)
		: "all";
	const selectedLabel =
		filters.find((filter) => filter.key === selectedFilter)?.label ?? "すべて";
	const filteredEvents = WEBXR_EVENTS.filter((event) =>
		matchesFilter(event, selectedFilter, now),
	);
	const nextEvents = WEBXR_EVENTS.filter(
		(event) => eventPhase(event, now) !== "past",
	)
		.sort((a, b) => a.startDate.localeCompare(b.startDate))
		.slice(0, 3);
	// 国内の注目イベントの状況は、日本の日付と会期から判定する（開催終了 / 開催中 / 開催予定）。
	// データの状況（phase）は更新日の時点のものなので出さない。会期を過ぎたものは分けて新しい順に畳む
	const todayInJapan = new Intl.DateTimeFormat("en-CA", {
		timeZone: "Asia/Tokyo",
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).format(now);
	const focusItems: FocusItem[] = WEBXR_EVENT_FOCUS.map((event) => {
		const dates = parseFocusDates(event.dates);
		return {
			event,
			dates,
			phase: dates ? focusPhase(dates, todayInJapan) : null,
		};
	});
	const activeFocus = focusItems.filter((item) => item.phase !== "past");
	const endedFocus = focusItems
		.filter((item) => item.phase === "past")
		.sort((a, b) => (b.dates?.start ?? "").localeCompare(a.dates?.start ?? ""));

	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "WebXRイベント", path: "/events" }]}
			/>
			<PageHeader
				title="WebXRイベント"
				lead="WebXRに関わる標準化会議、ブラウザやデバイスの発表、国内のXR展示会の日程と注目テーマを一覧にしています。"
				meta={
					<>
						一覧の更新日: {formatDay(WEBXR_EVENTS_LAST_UPDATED)}
						。イベントごとの確認日は各カードに記載しています。
					</>
				}
			/>

			{nextEvents.length > 0 ? (
				<section
					aria-labelledby="next-events"
					className="rounded-2xl bg-gray-950 p-5 text-white md:p-8"
				>
					<h2
						id="next-events"
						className="text-2xl font-black leading-snug md:text-[1.75rem]"
					>
						開催が近いイベント
					</h2>
					<ul className="mt-5 grid gap-3 md:grid-cols-3">
						{nextEvents.map((event) => (
							<li key={event.slug} className="min-w-0">
								<Link
									href={`/events#${event.slug}`}
									className="block h-full rounded-xl border border-white/20 p-4 transition-colors hover:border-white/50 hover:bg-white/5"
								>
									<p className="text-[13px] leading-[1.6] text-gray-300">
										<time dateTime={event.startDate}>
											{formatRange(event.startDate, event.endDate)}
										</time>
									</p>
									<h3 className="mt-1 text-base font-bold leading-snug">
										{event.title}
									</h3>
									<p className="mt-2 text-sm leading-[1.6] text-gray-300">
										{event.watchTopics[0]}
									</p>
								</Link>
							</li>
						))}
					</ul>
				</section>
			) : null}

			<section
				aria-labelledby="japan-focus"
				className="mt-12 rounded-2xl bg-primary-50 p-5 md:mt-16 md:p-8"
			>
				<h2
					id="japan-focus"
					className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
				>
					国内のXRイベントと見どころ
				</h2>
				<p className="mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-700">
					国内の展示会とカンファレンスから、XRデバイスとWeb技術、空間コンピューティングに関わるものを選んでいます。
				</p>
				<p className="mt-2 text-[13px] leading-[1.6] text-gray-600">
					更新日: {formatDay(WEBXR_EVENT_FOCUS_LAST_UPDATED)}
				</p>

				{activeFocus.length > 0 ? (
					<ul className="mt-6 divide-y divide-primary-100 border-y border-primary-100">
						{activeFocus.map((item) => (
							<FocusRow key={item.event.title} item={item} />
						))}
					</ul>
				) : (
					<p className="mt-6 text-base leading-[1.8] text-gray-700">
						開催予定の国内の注目イベントはありません。
					</p>
				)}

				{/* 会期を過ぎた国内イベントは「過去の国内イベント」に畳む（見どころと公式情報へのリンクは残す）。
				    一覧の見出しと絞り込みの「過去のイベント」と同じ言い方にそろえる */}
				{endedFocus.length > 0 ? (
					<details className="group mt-2">
						<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 [&::-webkit-details-marker]:hidden">
							<span className="text-base font-bold text-gray-950">
								過去の国内イベント
								<span className="ml-2 whitespace-nowrap text-sm text-gray-600 tabular-nums">
									{endedFocus.length}件
								</span>
							</span>
							<ChevronIcon />
						</summary>
						<ul className="divide-y divide-primary-100 border-t border-primary-100">
							{endedFocus.map((item) => (
								<FocusRow key={item.event.title} item={item} />
							))}
						</ul>
					</details>
				) : null}
			</section>

			<section aria-labelledby="event-list" className="mt-16 md:mt-20">
				<h2
					id="event-list"
					className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
				>
					イベントの日程と注目テーマ
				</h2>
				<p className="mt-3 max-w-[48em] text-[13px] leading-[1.6] text-gray-600">
					日程は開催地の日付です。注目テーマはBANGEOが選んだ観点で、登壇・出展やWebXR対応を保証するものではありません。参加条件と最新の日程は、各イベントの公式情報で確認してください。
				</p>

				<nav aria-label="イベントの絞り込み" className="mt-6">
					<ul className="flex flex-wrap gap-2">
						{filters.map((filter) => {
							const selected = selectedFilter === filter.key;
							const count = WEBXR_EVENTS.filter((event) =>
								matchesFilter(event, filter.key, now),
							).length;
							return (
								<li key={filter.key}>
									<Link
										href={
											filter.key === "all"
												? "/events"
												: `/events?filter=${filter.key}`
										}
										scroll={false}
										aria-current={selected ? "page" : undefined}
										className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-full border px-4 text-sm font-bold transition-colors ${
											selected
												? "border-gray-950 bg-gray-950 text-white"
												: "border-gray-300 bg-white text-gray-700 hover:border-gray-950 hover:text-gray-950"
										}`}
									>
										{filter.label}
										<span
											className={`tabular-nums ${selected ? "text-gray-300" : "text-gray-500"}`}
										>
											{count}
											<span className="sr-only">件</span>
										</span>
									</Link>
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="mt-8 space-y-12">
					{filteredEvents.length === 0 ? (
						<div className="rounded-2xl bg-gray-50 p-6">
							<p className="text-base leading-[1.8] text-gray-700">
								「{selectedLabel}」に一致するイベントはありません。
							</p>
							<Link
								href="/events"
								scroll={false}
								className="text-link mt-1 inline-flex min-h-11 items-center text-sm font-bold"
							>
								すべてのイベントを見る
							</Link>
						</div>
					) : null}
					{statusGroups.map((group) => {
						const events = filteredEvents
							.filter((event) => eventPhase(event, now) === group.key)
							.sort((a, b) =>
								group.key === "past"
									? b.startDate.localeCompare(a.startDate)
									: a.startDate.localeCompare(b.startDate),
							);
						if (events.length === 0) return null;
						return (
							<section key={group.key} aria-labelledby={`group-${group.key}`}>
								<h3
									id={`group-${group.key}`}
									className="flex items-baseline gap-3 text-xl font-bold leading-snug text-gray-950"
								>
									{group.title}
									<span className="text-sm font-bold text-gray-500 tabular-nums">
										{events.length}件
									</span>
								</h3>
								<p className="mt-1 text-sm leading-[1.7] text-gray-600">
									{group.description}
								</p>
								<ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
									{events.map((event) => (
										<li key={event.slug} className="min-w-0">
											<EventCard event={event} now={now} />
										</li>
									))}
								</ul>
							</section>
						);
					})}
				</div>
			</section>

			<details className="group mt-16 border-t border-gray-200 pt-2 md:mt-20">
				<summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-2 [&::-webkit-details-marker]:hidden">
					<span className="text-base font-bold text-gray-950">
						発表を確認しているメーカー
						<span className="ml-2 whitespace-nowrap text-sm text-gray-500 tabular-nums">
							{WEBXR_DEVICE_WATCH_TARGETS.length}社
						</span>
					</span>
					<ChevronIcon />
				</summary>
				<ul className="mt-2 grid gap-x-8 text-sm leading-[1.6] text-gray-700 sm:grid-cols-2 lg:grid-cols-3">
					{WEBXR_DEVICE_WATCH_TARGETS.map((target) => (
						<li key={target} className="border-b border-gray-200 py-2.5">
							{target}
						</li>
					))}
				</ul>
			</details>
		</div>
	);
}
