import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import type { MetadataRoute } from "next";
import { collectTagCounts, tagPath } from "@/lib/collect-tags";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { SITE_URL } from "@/lib/site-url";

type SitemapDoc = {
	date?: string;
	pubDate?: string;
	info: { path: string };
};

function parseDate(value?: string): Date {
	if (!value) return new Date("2026-06-15");

	const japaneseDate = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
	if (japaneseDate) {
		const [, year, month, day] = japaneseDate;
		return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? new Date("2026-06-15") : date;
}

export default function sitemap(): MetadataRoute.Sitemap {
	const techArticleDocs = getDocs(blog).map((doc) => ({
		url: `${SITE_URL}/tech-articles/${getSlugFromPath(doc.info.path)}`,
		lastModified: parseDate((doc as SitemapDoc).pubDate ?? doc.date),
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}));

	const experimentDocs = getDocs(experiments).map((doc) => ({
		url: `${SITE_URL}/experiments/${getSlugFromPath(doc.info.path)}`,
		lastModified: parseDate((doc as SitemapDoc).pubDate ?? doc.date),
		changeFrequency: "monthly" as const,
		priority: 0.7,
	}));

	const podcastDocs = getDocs(podcast).map((doc) => ({
		url: `${SITE_URL}/podcast/${getSlugFromPath(doc.info.path)}`,
		lastModified: parseDate((doc as SitemapDoc).pubDate ?? doc.date),
		changeFrequency: "monthly" as const,
		priority: 0.6,
	}));

	const tagDocs = Array.from(
		collectTagCounts([...getDocs(blog), ...getDocs(experiments)]).entries(),
	)
		.filter(([, count]) => count >= 2)
		.map(([tag]) => ({
			url: `${SITE_URL}${tagPath(tag)}`,
			lastModified: new Date(),
			changeFrequency: "weekly" as const,
			priority: 0.4,
		}));

	return [
		{
			url: SITE_URL,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${SITE_URL}/tech-articles`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/experiments`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/podcast`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${SITE_URL}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/webxr-explainer`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/webxr-status`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/events`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/platforms`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/devices`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/libraries`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${SITE_URL}/consulting`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${SITE_URL}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${SITE_URL}/faq`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${SITE_URL}/privacy-policy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${SITE_URL}/tags`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.5,
		},
		...techArticleDocs,
		...experimentDocs,
		...podcastDocs,
		...tagDocs,
	];
}
