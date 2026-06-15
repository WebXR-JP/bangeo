import type { Metadata } from "next";
import Link from "next/link";
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
	title: "WebXRイベントウォッチ",
	description:
		"WebXR / WebAR / Spatial Web 開発者が追うべきイベントと、BANGEOで更新されそうなページを整理しています。",
	alternates: { canonical: "/events" },
};

const statusGroups: { title: string; statuses: WebXREventStatus[] }[] = [
	{ title: "開催中", statuses: ["live"] },
	{ title: "発表回収が必要", statuses: ["recap-needed"] },
	{
		title: "今後の重要イベント",
		statuses: ["live-soon", "schedule-live", "upcoming", "announced"],
	},
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
	{ key: "standards", label: "Standards" },
	{ key: "browser", label: "Browser" },
	{ key: "device", label: "Device Hands-on" },
	{ key: "community", label: "Community" },
	{ key: "recap", label: "Recap Needed" },
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

function EventMetaBadges({ event }: { event: (typeof WEBXR_EVENTS)[number] }) {
	const derivedRegion =
		event.region ?? (event.category.includes("Japan") ? "japan" : "global");
	const badges: string[] = [
		regionLabels[derivedRegion],
		event.organizerType ? organizerLabels[event.organizerType] : undefined,
		event.hasHandsOn ? "🕶 Device Hands-on" : undefined,
		event.webxrRelevance ? relevanceLabels[event.webxrRelevance] : undefined,
		event.labCandidate ? "🧪 Lab candidate" : undefined,
		event.status === "recap-needed" || event.watchMode === "recap"
			? "📝 Recap needed"
			: undefined,
	].filter((badge): badge is string => Boolean(badge));

	return (
		<div className="mt-4 flex flex-wrap gap-2">
			{badges.map((badge) => (
				<span
					key={badge}
					className="rounded-full bg-gray-100 px-2.5 py-1 text-[11px] font-black text-gray-700"
				>
					{badge}
				</span>
			))}
		</div>
	);
}

function EventCard({ event }: { event: (typeof WEBXR_EVENTS)[number] }) {
	return (
		<article className="rounded-[2rem] border border-gray-100 bg-white/85 p-6 shadow-xs">
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
				<div>
					<h3 className="text-xl font-black tracking-tight text-gray-950">
						{event.title}
					</h3>
					<p className="mt-1 text-sm font-bold text-gray-500">
						{event.startDate}〜{event.endDate} / {event.location}
					</p>
				</div>
				<div className="flex flex-wrap gap-2">
					<span
						className={`rounded-full px-3 py-1 text-xs font-black ${statusBadgeClass[event.status]}`}
					>
						{WEBXR_EVENT_STATUS_LABELS[event.status]}
					</span>
					<span className="rounded-full bg-rose-50 px-3 py-1 text-xs font-black text-rose-700">
						重要度: {WEBXR_EVENT_IMPORTANCE_LABELS[event.importance]}
					</span>
				</div>
			</div>

			<p className="mt-4 text-sm font-bold text-gray-700">{event.category}</p>
			<EventMetaBadges event={event} />
			<div className="mt-5 grid gap-5 md:grid-cols-2">
				<div>
					<h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
						見るポイント
					</h4>
					<ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-gray-700">
						{event.watchTopics.map((topic) => (
							<li key={topic}>{topic}</li>
						))}
					</ul>
				</div>
				<div>
					<h4 className="text-xs font-black uppercase tracking-widest text-gray-400">
						BANGEO更新候補
					</h4>
					<ul className="mt-2 space-y-1 text-sm text-gray-700">
						{event.affectedBangeoPages.map((page) => (
							<li key={page} className="font-mono text-xs">
								{page}
							</li>
						))}
					</ul>
				</div>
			</div>
			<p className="mt-5 rounded-2xl bg-gray-50 p-4 text-sm leading-7 text-gray-700">
				{event.recommendedAction}
			</p>
			<div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
				<span>
					最終確認: {event.lastCheckedAt} / 次回確認: {event.nextCheckAt}
				</span>
				<a
					href={event.sourceUrl}
					target="_blank"
					rel="noopener noreferrer"
					className="font-bold text-gray-900 underline decoration-gray-200 underline-offset-4 hover:decoration-gray-900"
				>
					一次情報を見る
				</a>
			</div>
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
		<div className="mx-auto max-w-6xl px-5 py-16 md:px-8 md:py-20">
			<header className="mb-12 space-y-5">
				<p className="text-xs font-black uppercase tracking-[0.25em] text-rose-600">
					WebXR Event Watch
				</p>
				<h1 className="text-4xl font-black tracking-tighter text-gray-950 md:text-6xl">
					WebXRイベントウォッチ
				</h1>
				<p className="max-w-3xl text-base font-medium leading-8 text-gray-600 md:text-lg">
					WebXR / WebAR / Spatial Web
					開発者が追うべきグローバル/日本国内イベント、デバイスメーカー寄りの展示会を整理しています。イベントそのもののニュースではなく、BANGEOで更新すべき仕様・ブラウザ・フレームワーク・学習ページを見つけるための一覧です。
				</p>
				<div className="rounded-[2rem] border border-rose-100 bg-rose-50/60 p-5 text-sm leading-7 text-rose-950">
					直近30日以内のイベント、開催中イベント、開催後7日以内のイベントを重点確認します。イベント後は公式ブログ、動画、リリースノート、GitHub差分を回収し、必要に応じて
					<Link href="/webxr-status" className="font-black underline">
						/webxr-status
					</Link>
					や関連記事、実験ページへ反映します。
				</div>
				<p className="text-xs font-bold text-gray-400">
					Last updated: {WEBXR_EVENTS_LAST_UPDATED}
				</p>
				<div className="flex flex-wrap gap-2">
					{filters.map((filter) => (
						<Link
							key={filter.key}
							href={
								filter.key === "all"
									? "/events"
									: `/events?filter=${filter.key}`
							}
							className={`rounded-full px-4 py-2 text-xs font-black transition-colors ${
								selectedFilter === filter.key
									? "bg-gray-950 text-white"
									: "bg-white text-gray-600 hover:bg-gray-100"
							}`}
						>
							{filter.label}
						</Link>
					))}
				</div>
			</header>

			<section className="mb-12 rounded-[2rem] border border-gray-100 bg-white/80 p-6">
				<h2 className="text-lg font-black text-gray-950">
					Device Watch Targets
				</h2>
				<p className="mt-2 text-sm leading-7 text-gray-600">
					WebXRに直接関係しない発表でも、ブラウザ、WebView、WebGPU、OpenXR、空間UI、スマートグラス、MRヘッドセット、開発者向けSDKに関係する場合は
					adjacent として拾います。
				</p>
				<div className="mt-4 flex flex-wrap gap-2">
					{WEBXR_DEVICE_WATCH_TARGETS.map((target) => (
						<span
							key={target}
							className="rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-600"
						>
							{target}
						</span>
					))}
				</div>
			</section>

			<div className="space-y-12">
				{statusGroups.map((group) => {
					const events = filteredEvents.filter((event) =>
						group.statuses.includes(event.status),
					);
					if (events.length === 0) return null;
					return (
						<section key={group.title} className="space-y-5">
							<h2 className="text-2xl font-black tracking-tight text-gray-950">
								{group.title}
							</h2>
							<div className="grid gap-5">
								{events.map((event) => (
									<EventCard key={event.slug} event={event} />
								))}
							</div>
						</section>
					);
				})}
			</div>
		</div>
	);
}
