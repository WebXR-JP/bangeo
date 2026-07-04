import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import type { MetadataRoute } from "next";
import { latestContentDate, sitemapDate } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { SITE_URL } from "@/lib/site-url";

type SitemapDoc = {
	date?: string;
	pubDate?: string;
	updated?: string;
	info: { path: string };
};

const SITE_STRUCTURE_UPDATED = new Date("2026-07-02T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
	const blogDocs = getDocs(blog);
	const experimentEntries = getDocs(experiments);
	const podcastEntries = getDocs(podcast);
	const publicDocs = [...blogDocs, ...experimentEntries];
	const latestContentModified = latestContentDate(
		[...publicDocs, ...podcastEntries].map(
			(doc) =>
				(doc as SitemapDoc).updated ?? (doc as SitemapDoc).pubDate ?? doc.date,
		),
	);

	const techArticleDocs = getDocs(blog).map((doc) => ({
		url: `${SITE_URL}/tech-articles/${getSlugFromPath(doc.info.path)}`,
		lastModified: sitemapDate(
			(doc as SitemapDoc).updated ?? (doc as SitemapDoc).pubDate ?? doc.date,
		),
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}));

	const experimentDocs = experimentEntries.map((doc) => ({
		url: `${SITE_URL}/experiments/${getSlugFromPath(doc.info.path)}`,
		lastModified: sitemapDate(
			(doc as SitemapDoc).updated ?? (doc as SitemapDoc).pubDate ?? doc.date,
		),
		changeFrequency: "monthly" as const,
		priority: 0.7,
	}));

	const podcastDocs = podcastEntries.map((doc) => ({
		url: `${SITE_URL}/podcast/${getSlugFromPath(doc.info.path)}`,
		lastModified: sitemapDate(
			(doc as SitemapDoc).updated ?? (doc as SitemapDoc).pubDate ?? doc.date,
		),
		changeFrequency: "monthly" as const,
		priority: 0.6,
	}));

	return [
		{
			url: SITE_URL,
			lastModified: latestContentModified,
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${SITE_URL}/tech-articles`,
			lastModified: latestContentDate(
				blogDocs.map((doc) => (doc as SitemapDoc).updated ?? doc.date),
			),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/experiments`,
			lastModified: latestContentDate(
				experimentEntries.map((doc) => (doc as SitemapDoc).updated ?? doc.date),
			),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/podcast`,
			lastModified: latestContentDate(
				podcastEntries.map(
					(doc) =>
						(doc as SitemapDoc).updated ??
						(doc as SitemapDoc).pubDate ??
						doc.date,
				),
			),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${SITE_URL}/about`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/webxr-explainer`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${SITE_URL}/webxr-status`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/events`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/platforms`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/devices`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/libraries`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${SITE_URL}/consulting`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${SITE_URL}/contact`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${SITE_URL}/faq`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${SITE_URL}/privacy-policy`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "yearly",
			priority: 0.3,
		},
		...techArticleDocs,
		...experimentDocs,
		...podcastDocs,
	];
}
