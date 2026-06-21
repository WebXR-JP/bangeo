import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import {
	WEBXR_DEVICE_WATCH_TARGETS,
	WEBXR_EVENT_IMPORTANCE_LABELS,
	WEBXR_EVENT_STATUS_LABELS,
	WEBXR_EVENTS,
	WEBXR_EVENTS_LAST_UPDATED,
	type WebXREventOrganizerType,
	type WebXREventRegion,
	type WebXREventStatus,
	type WebXRRelevance,
} from "@/data/webxr-events";

export const metadata: Metadata = {
	title: "WebXRイベントウォッチ｜Meta Connect・WWDC・AWE・XR Kaigi",
	description:
		"Meta Connect、Google I/O、Apple WWDC、AWE、W3C TPAC、XR Kaigiなど、WebXR / WebAR / Spatial Web 開発者が追うべきイベントと、BANGEOで更新されそうなページを整理しています。",
	alternates: { canonical: "/events" },
};

const statusGroups: { title: string; statuses: WebXREventStatus[] }[] = [
	{ title: "開催中・直近", statuses: ["live", "live-soon"] },
	{ title: "回収待ち", statuses: ["recap-needed"] },
	{
		title: "これから",
		statuses: ["schedule-live", "upcoming", "announced"],
	},
	{ title: "その他", statuses: ["archived"] },
];

const statusBadgeClass: Record<WebXREventStatus, string> = {
	announced: "bg-sky-100 text-sky-800",
	upcoming: "bg-indigo-100 text-indigo-800",
	"schedule-live": "bg-purple-100 text-purple-800",
	live: "bg-emerald-100 text-emerald-800",
	"live-soon": "bg-lime-100 text-lime-800",
	"recap-needed": "bg-amber-100 text-amber-900",
	archived: "bg-gray-100 text-gray-500",
};

const filters = [
	{ key: "all", label: "All" },
	{ key: "global", label: "Global" },
	{ key: "japan", label: "Japan" },
	{ key: "device", label: "Device" },
	{ key: "browser", label: "Browser" },
	{ key: "standards", label: "Standards" },
	{ key: "community", label: "Community" },
	{ key: "recap", label: "Recap" },
] as const;

type EventFilter = (typeof filters)[number]["key"];

const organizerLabels: Partial<Record<WebXREventOrganizerType, string>> = {
	standards: "Standards",
	browser_vendor: "Browser",
	device_maker: "Device",
	expo: "Expo",
	community: "Community",
	developer_conference: "Dev Conf",
};

const regionLabels: Record<WebXREventRegion, string> = {
	global: "Global",
	japan: "🇯🇵 Japan",
	"japan-local": "🇯🇵 Japan Local",
};

const relevanceLabels: Record<WebXRRelevance, string> = {
	direct: "🌐 WebXR direct",
	adjacent: "🔁 WebXR adjacent",
	weak: "WebXR weak",
	unknown: "WebXR unknown",
};

function matchesFilter(
	event: (typeof WEBXR_EVENTS)[number],
	filter: EventFilter,
) {
	switch (filter) {
		case "global":
			return (event.region ?? "global") === "global";
		case "japan":
			return (
				event.region === "japan" ||
				event.region === "japan-local" ||
				event.category.includes("Japan")
			);
		case "standards":
			return (
				event.organizerType === "standards" || event.category.includes("標準")
			);
		case "browser":
			return (
				event.organizerType === "browser_vendor" ||
				event.category.includes("Chrome") ||
				event.category.includes("Safari") ||
				event.category.includes("Quest Browser")
			);
		case "device":
			return (
				event.hasHandsOn ||
				event.organizerType === "device_maker" ||
				event.category.includes("Device") ||
				event.category.includes("Devices")
			);
		case "community":
			return (
				event.organizerType === "community" ||
				event.category.includes("Community")
			);
		case "recap":
			return event.status === "recap-needed" || event.watchMode === "recap";
		default:
			return true;
	}
}

function formatEventDate(event: (typeof WEBXR_EVENTS)[number]) {
	const format = (date: string) => {
		const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
		if (!match) return date;
		return `${Number(match[2])}/${Number(match[3])}`;
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
		event.hasHandsOn ? "Device" : undefined,
		event.webxrRelevance ? relevanceLabels[event.webxrRelevance] : undefined,
		...event.entityTags,
	]
		.filter((tag): tag is string => Boolean(tag))
		.filter((tag, index, tags) => tags.indexOf(tag) === index);
}

function EventCard({ event }: { event: (typeof WEBXR_EVENTS)[number] }) {
	return (
		<article className="rounded-2xl border border-gray-100 bg-white/85 p-4 shadow-xs">
			<div className="space-y-2">
				<h3 className="text-base font-black tracking-tight text-gray-950 md:text-lg">
					{event.title}
				</h3>
				<p className="text-sm font-bold text-gray-600">
					{formatEventDate(event)}・{event.location}
				</p>
				<div className="flex flex-wrap gap-1.5 text-[11px] font-black">
					<span
						className={`rounded-full px-2.5 py-1 ${statusBadgeClass[event.status]}`}
					>
						{WEBXR_EVENT_STATUS_LABELS[event.status]}
					</span>
					<span className="rounded-full bg-rose-50 px-2.5 py-1 text-rose-700">
						重要度: {WEBXR_EVENT_IMPORTANCE_LABELS[event.importance]}
					</span>
					<span className="rounded-full bg-gray-100 px-2.5 py-1 text-gray-700">
						{regionLabels[event.region ?? "global"]}
					</span>
				</div>
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
					<span className="font-black text-gray-950">見る: </span>
					{event.watchTopics.slice(0, 2).join(" / ")}
				</p>
			</div>

			<details className="mt-3 border-t border-gray-100 pt-3 text-sm">
				<summary className="cursor-pointer font-black text-gray-700">
					詳細
				</summary>
				<div className="mt-3 space-y-3 text-gray-700">
					<p className="leading-7">{event.recommendedAction}</p>
					<div>
						<p className="text-xs font-black uppercase tracking-widest text-gray-400">
							BANGEO更新候補
						</p>
						<div className="mt-2 flex flex-wrap gap-2">
							{event.affectedBangeoPages.map((page) => (
								<span key={page} className="font-mono text-xs text-gray-600">
									{page}
								</span>
							))}
						</div>
					</div>
					<p className="text-xs text-gray-500">
						最終確認: {event.lastCheckedAt} / 次回確認: {event.nextCheckAt}
					</p>
					<a
						href={event.sourceUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex font-black text-gray-950 underline decoration-gray-200 underline-offset-4 hover:decoration-gray-900"
					>
						一次情報
					</a>
				</div>
			</details>
		</article>
	);
}

interface EventsPageProps {
	searchParams?: Promise<{ filter?: string }>;
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
	const params = await searchParams;
	const selectedFilter = filters.some((filter) => filter.key === params?.filter)
		? (params?.filter as EventFilter)
		: "all";
	const filteredEvents = WEBXR_EVENTS.filter((event) =>
		matchesFilter(event, selectedFilter),
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
					開発者向けに、標準化・ブラウザ・国内XRイベント・デバイス展示を追跡しています。
				</p>
				<p className="text-xs font-bold text-gray-400">
					更新: {WEBXR_EVENTS_LAST_UPDATED}
				</p>
			</header>

			<nav className="sticky top-0 z-20 -mx-4 mb-6 overflow-x-auto bg-white/90 px-4 py-2 backdrop-blur md:-mx-8 md:px-8">
				<div className="flex min-w-max gap-2 pb-1">
					{filters.map((filter) => (
						<Link
							key={filter.key}
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

			<div className="space-y-8">
				{statusGroups.map((group) => {
					const events = filteredEvents.filter((event) =>
						group.statuses.includes(event.status),
					);
					if (events.length === 0) return null;
					return (
						<section key={group.title} className="space-y-3">
							<h2 className="text-xl font-black tracking-tight text-gray-950">
								{group.title}
							</h2>
							<div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
								{events.map((event) => (
									<EventCard key={event.slug} event={event} />
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
