import { blog } from "fumadocs-mdx:collections/server";
import type { MetadataRoute } from "next";
import { latestContentDate, sitemapDate } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { SITE_URL } from "@/lib/site-url";

type SitemapDoc = {
	date?: string;
	pubDate?: string;
	updated?: string;
	draft?: boolean;
	info: { path: string };
};

const SITE_STRUCTURE_UPDATED = new Date("2026-07-04T00:00:00Z");

export default function sitemap(): MetadataRoute.Sitemap {
	const blogDocs = getDocs(blog);
	const publicBlogDocs = blogDocs.filter((doc) => !doc.draft);
	const latestContentModified = latestContentDate(
		publicBlogDocs.map(
			(doc) =>
				(doc as SitemapDoc).updated ?? (doc as SitemapDoc).pubDate ?? doc.date,
		),
	);

	const techArticleDocs = publicBlogDocs.map((doc) => ({
		url: `${SITE_URL}/tech-articles/${getSlugFromPath(doc.info.path)}`,
		lastModified: sitemapDate(
			(doc as SitemapDoc).updated ?? (doc as SitemapDoc).pubDate ?? doc.date,
		),
		changeFrequency: "monthly" as const,
		priority: 0.8,
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
				publicBlogDocs.map((doc) => (doc as SitemapDoc).updated ?? doc.date),
			),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${SITE_URL}/experiments`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.9,
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
			url: `${SITE_URL}/consulting`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${SITE_URL}/faq`,
			lastModified: SITE_STRUCTURE_UPDATED,
			changeFrequency: "monthly",
			priority: 0.5,
		},
		...techArticleDocs,
	];
}
