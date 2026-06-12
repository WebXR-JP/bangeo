import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { SITE_URL } from "@/lib/site-url";

export const dynamic = "force-static";

const FEED_TITLE = "BANGEO 更新情報";
const FEED_DESCRIPTION =
	"BANGEO の WebXR 技術記事、デモ、ポッドキャストの更新情報";
const FEED_PATH = "/rss.xml";
const MAX_ITEMS = 50;

type FeedItem = {
	title: string;
	description?: string;
	url: string;
	date: Date;
	categories: string[];
};

type DatedDoc = {
	title: string;
	description?: string;
	date?: string;
	pubDate?: string;
	category?: string;
	tags?: string[];
	draft?: boolean;
	info: { path: string };
};

function parseDate(value?: string): Date {
	if (!value) {
		return new Date(0);
	}

	const japaneseDate = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
	if (japaneseDate) {
		const [, year, month, day] = japaneseDate;
		return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? new Date(0) : date;
}

function escapeXml(value: string): string {
	return value
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&apos;");
}

function absoluteUrl(path: string): string {
	return new URL(path, SITE_URL).toString();
}

function collectionItems(
	docs: DatedDoc[],
	sectionPath: "tech-articles" | "experiments" | "podcast",
): FeedItem[] {
	return docs
		.filter((doc) => !doc.draft)
		.map((doc) => {
			const slug = getSlugFromPath(doc.info.path);
			const categories = [doc.category, ...(doc.tags ?? [])].filter(
				(category): category is string => Boolean(category),
			);

			return {
				title: doc.title,
				description: doc.description,
				url: absoluteUrl(`/${sectionPath}/${slug}`),
				date: parseDate(doc.pubDate ?? doc.date),
				categories,
			};
		});
}

function buildFeed(items: FeedItem[]): string {
	const sortedItems = items
		.toSorted((a, b) => b.date.getTime() - a.date.getTime())
		.slice(0, MAX_ITEMS);
	const latestDate = sortedItems[0]?.date ?? new Date();

	return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
	<channel>
		<title>${escapeXml(FEED_TITLE)}</title>
		<link>${escapeXml(SITE_URL)}</link>
		<description>${escapeXml(FEED_DESCRIPTION)}</description>
		<language>ja</language>
		<lastBuildDate>${latestDate.toUTCString()}</lastBuildDate>
		<ttl>60</ttl>
		<atom:link href="${escapeXml(absoluteUrl(FEED_PATH))}" rel="self" type="application/rss+xml" />
${sortedItems
	.map(
		(item) => `		<item>
			<title>${escapeXml(item.title)}</title>
			<link>${escapeXml(item.url)}</link>
			<guid isPermaLink="true">${escapeXml(item.url)}</guid>
			<pubDate>${item.date.toUTCString()}</pubDate>${
				item.description
					? `\n\t\t\t<description>${escapeXml(item.description)}</description>`
					: ""
			}${item.categories
				.map(
					(category) => `\n\t\t\t<category>${escapeXml(category)}</category>`,
				)
				.join("")}
		</item>`,
	)
	.join("\n")}
	</channel>
</rss>
`;
}

export function GET(): Response {
	const items = [
		...collectionItems(getDocs(blog) as DatedDoc[], "tech-articles"),
		...collectionItems(getDocs(experiments) as DatedDoc[], "experiments"),
		...collectionItems(getDocs(podcast) as DatedDoc[], "podcast"),
	];

	return new Response(buildFeed(items), {
		headers: {
			"Cache-Control": "public, max-age=3600, s-maxage=3600",
			"Content-Type": "application/rss+xml; charset=utf-8",
		},
	});
}
