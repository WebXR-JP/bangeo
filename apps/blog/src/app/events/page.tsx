import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
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

// Evaluate against each event's local calendar date so past events never remain upcoming.
function eventPhase(event: (typeof WEBXR_EVENTS)[number], now: Date) {
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
		description: "現在の開催日程に該当するイベントです。",
	},
	{
		key: "upcoming",
		title: "これからのイベント",
		description: "開催日の近い順に掲載しています。",
	},
	{
		key: "past",
		title: "過去のイベント",
		description:
			"発表内容や公開資料を振り返るための一覧です。録画の有無はリンク先で確認できます。",
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

function matchesFilter(
	event: (typeof WEBXR_EVENTS)[number],
	filter: EventFilter,
	now: Date,
) {
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

function formatEventDate(event: (typeof WEBXR_EVENTS)[number]) {
	const format = (date: string) => {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
		if (!match) return date;
		return `${match[1]}年${Number(match[2])}月${Number(match[3])}日`;
	};

	return event.endDate && event.endDate !== event.startDate
		? `${format(event.startDate)}〜${format(event.endDate)}`
		: format(event.startDate);
}

function eventTags(event: (typeof WEBXR_EVENTS)[number]) {
	const derivedRegion =
		event.region ?? (event.category.includes("Japan") ? "japan" : "global");
	return [
		regionLabels[derivedRegion],
		event.organizerType ? organizerLabels[event.organizerType] : undefined,
		event.hasHandsOn ? "体験展示" : undefined,
		event.webxrRelevance ? relevanceLabels[event.webxrRelevance] : undefined,
		...event.entityTags,
	]
		.filter((tag): tag is string => Boolean(tag))
		.filter((tag, index, tags) => tags.indexOf(tag) === index);
}

function EventCard({
	event,
	now,
}: {
	event: (typeof WEBXR_EVENTS)[number];
	now: Date;
}) {
	const phase = eventPhase(event, now);
	return (
		<article
			id={event.slug}
			className="scroll-mt-24 rounded-2xl border border-gray-100 bg-white/85 p-4 shadow-xs"
		>
			<div className="space-y-2">
				<h3 className="text-base font-black tracking-tight text-gray-950 md:text-lg">
					{event.title}
				</h3>
				<p className="text-sm font-bold text-gray-600">
					{formatEventDate(event)}・{event.location}
				</p>
				<p className="text-xs font-bold text-rose-700">
					{phase === "past"
						? event.slug === "meta-connect-2026" ? "開催終了／オンデマンド公開" : "開催日程終了"
						: phase === "live"
							? "開催中"
							: "開催予定"}
				</p>
				<div className="flex flex-wrap gap-1.5">
					{eventTags(event)
						.slice(0, 3)
						.map((tag) => (
							<span
								key={tag}
								className="rounded-full border border-gray-200 px-2 py-0.5 text-[11px] font-bold text-gray-600"
							>
								{tag}
							</span>
						))}
				</div>
				<p className="text-sm leading-6 text-gray-700">
					<span className="font-black text-gray-950">注目テーマ: </span>
					{event.watchTopics.slice(0, event.slug === "meta-vr-start-developer-competition-2026" ? 3 : 2).join(" / ")}
				</p>
			</div>

			<div className="mt-4 border-t border-gray-100 pt-4">
				<a
					href={event.sourceUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="inline-flex text-sm font-black text-gray-950 underline underline-offset-4 hover:text-rose-700"
				>
					{event.sourceType === "news" ? "紹介記事を見る" : "公式情報を見る"}{" "}
					<span className="sr-only">
						（{event.title}・新しいタブで開きます）
					</span>
				</a>
				<p className="mt-2 text-xs text-gray-500">
					情報確認: {event.lastCheckedAt}
				</p>
			</div>
		</article>
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
	const filteredEvents = WEBXR_EVENTS.filter((event) =>
		matchesFilter(event, selectedFilter, now),
	);

	return (
		<div className="mx-auto max-w-6xl px-4 py-8 md:px-8 md:py-14">
			<BreadcrumbStructuredData
				items={[{ name: "WebXRイベントウォッチ", path: "/events" }]}
			/>
			<header className="mb-6 space-y-3">
				<p className="text-xs font-black uppercase tracking-[0.25em] text-rose-600">
					WebXR Event Watch
				</p>
				<h1 className="text-3xl font-black tracking-tighter text-gray-950 md:text-5xl">
					WebXRイベント
				</h1>
				<p className="max-w-3xl text-sm font-medium leading-7 text-gray-600 md:text-base">
					WebXR / WebAR / Spatial Web
					開発者向けに、標準化・ブラウザ・国内XRイベント・デバイス展示を追跡しています。開催日だけでなく、出展者・セッション公開や会期後の公式資料まで確認します。
				</p>
				<p className="text-xs font-bold text-gray-400">
					国内重点更新: {WEBXR_EVENT_FOCUS_LAST_UPDATED} / 一覧データ:{" "}
					{WEBXR_EVENTS_LAST_UPDATED}
				</p>
			</header>

			<section className="mb-8 rounded-3xl bg-gray-950 p-6 text-white md:p-8">
				<p className="text-xs font-bold tracking-widest text-rose-300">
					NEXT EVENTS
				</p>
				<h2 className="mt-2 text-2xl font-black">次にチェックするイベント</h2>
				<div className="mt-5 grid gap-5 md:grid-cols-3">
					{WEBXR_EVENTS.filter((event) => eventPhase(event, now) !== "past")
						.sort((a, b) => a.startDate.localeCompare(b.startDate))
						.slice(0, 3)
						.map((event) => (
							<a
								key={event.slug}
								href={`/events#${event.slug}`}
								className="rounded-xl border border-white/20 p-4 transition-colors hover:bg-white/10"
							>
								<p className="text-xs text-rose-200">
									{formatEventDate(event)}
								</p>
								<h3 className="mt-2 font-bold">{event.title}</h3>
								<p className="mt-2 text-sm text-gray-300">
									{event.watchTopics[0]}
								</p>
							</a>
						))}
				</div>
			</section>

			<section className="mb-8 rounded-3xl border border-rose-100 bg-rose-50/60 p-5 md:p-6">
				<div className="mb-5 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
					<div>
						<p className="text-xs font-black uppercase tracking-[0.25em] text-rose-700">
							Japan XR Focus
						</p>
						<h2 className="mt-2 text-xl font-black tracking-tight text-gray-950 md:text-2xl">
							いま追う国内XRイベント
						</h2>
						<p className="mt-2 max-w-3xl text-sm leading-7 text-gray-700">
							開催予定を並べるだけでなく、BANGEO読者が見るべきXRデバイス、Web技術、空間コンピューティング、会期後の公式資料まで追跡します。
						</p>
					</div>
					<p className="text-xs font-bold text-gray-500">
						更新: {WEBXR_EVENT_FOCUS_LAST_UPDATED}
					</p>
				</div>

				<div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
					{WEBXR_EVENT_FOCUS.map((event) => (
						<article
							key={event.title}
							className="rounded-2xl border border-white bg-white/90 p-4 shadow-xs"
						>
							<div className="flex flex-wrap gap-2 text-[11px] font-black">
								<span
									className={
										event.priority === "high"
											? "rounded-full bg-rose-100 px-2.5 py-1 text-rose-700"
											: "rounded-full bg-amber-100 px-2.5 py-1 text-amber-800"
									}
								>
									{event.priority === "high" ? "重点" : "監視"}
								</span>
								<span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
									{event.phase}
								</span>
							</div>
							<h3 className="mt-3 text-base font-black text-gray-950 md:text-lg">
								{event.title}
							</h3>
							<p className="mt-1 text-xs font-bold text-gray-500">
								{event.dates}・{event.location}
							</p>
							<p className="mt-3 text-sm leading-6 text-gray-700">
								{event.summary}
							</p>
							<ul className="mt-3 space-y-1 text-xs leading-5 text-gray-600">
								{event.watch.slice(0, 2).map((item) => (
									<li key={item}>・{item}</li>
								))}
							</ul>
							<details className="mt-3 border-t border-gray-100 pt-3 text-sm">
								<summary className="cursor-pointer font-black text-gray-700">
									次に確認すること
								</summary>
								<p className="mt-2 leading-6 text-gray-700">
									{event.nextAction}
								</p>
							</details>
							<a
								href={event.sourceUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="mt-3 inline-flex text-sm font-black text-gray-950 underline decoration-gray-200 underline-offset-4 hover:decoration-gray-900"
							>
								公式情報
							</a>
						</article>
					))}
				</div>
			</section>

			<nav
				aria-label="イベントの絞り込み"
				className="sticky top-0 z-20 -mx-4 mb-6 overflow-x-auto bg-white/90 px-4 py-2 backdrop-blur md:-mx-8 md:px-8"
			>
				<div className="flex min-w-max gap-2 pb-1">
					{filters.map((filter) => (
						<Link
							key={filter.key}
							aria-current={selectedFilter === filter.key ? "page" : undefined}
							href={
								filter.key === "all"
									? "/events"
									: `/events?filter=${filter.key}`
							}
							className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-black transition-colors ${
								selectedFilter === filter.key
									? "border-gray-950 bg-gray-950 text-white"
									: "border-gray-200 bg-white text-gray-600 hover:bg-gray-100"
							}`}
						>
							{filter.label}
						</Link>
					))}
				</div>
			</nav>

			<p className="mb-5 text-xs leading-6 text-gray-500">
				日程は開催地の現地日付です。注目テーマはBANGEOの編集観点で、登壇・出展やWebXR対応を保証するものではありません。参加条件・最新の日程は公式情報をご確認ください。
			</p>
			<div className="space-y-8">
				{filteredEvents.length === 0 && (
					<p className="rounded-2xl bg-gray-50 p-6 text-gray-600">
						この条件に一致するイベントはありません。
					</p>
				)}
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
						<section key={group.title} className="space-y-3">
							<h2 className="text-xl font-black tracking-tight text-gray-950">
								{group.title}{" "}
								<span className="text-sm text-gray-500">{events.length}件</span>
							</h2>
							<p className="text-sm text-gray-600">{group.description}</p>
							<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
								{events.map((event) => (
									<EventCard key={event.slug} event={event} now={now} />
								))}
							</div>
						</section>
					);
				})}
			</div>

			<details className="mt-8 rounded-2xl border border-gray-100 bg-white/80 p-4 text-sm">
				<summary className="cursor-pointer font-black text-gray-900">
					追跡中のデバイスメーカー
				</summary>
				<div className="mt-3 flex flex-wrap gap-2">
					{WEBXR_DEVICE_WATCH_TARGETS.map((target) => (
						<span
							key={target}
							className="rounded-full border border-gray-200 px-2 py-1 text-xs text-gray-600"
						>
							{target}
						</span>
					))}
				</div>
			</details>
		</div>
	);
}
