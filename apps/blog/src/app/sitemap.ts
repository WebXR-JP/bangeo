import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import type { MetadataRoute } from "next";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

const BASE_URL = "https://bangeo.net";

export default function sitemap(): MetadataRoute.Sitemap {
	const techArticleDocs = getDocs(blog).map((doc) => ({
		url: `${BASE_URL}/tech-articles/${getSlugFromPath(doc.info.path)}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.8,
	}));

	const experimentDocs = getDocs(experiments).map((doc) => ({
		url: `${BASE_URL}/experiments/${getSlugFromPath(doc.info.path)}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.7,
	}));

	const podcastDocs = getDocs(podcast).map((doc) => ({
		url: `${BASE_URL}/podcast/${getSlugFromPath(doc.info.path)}`,
		lastModified: new Date(),
		changeFrequency: "monthly" as const,
		priority: 0.6,
	}));

	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/tech-articles`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/experiments`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.9,
		},
		{
			url: `${BASE_URL}/podcast`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
		{
			url: `${BASE_URL}/about`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/webxr-explainer`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/webxr-status`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/platforms`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/devices`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.7,
		},
		{
			url: `${BASE_URL}/libraries`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/consulting`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.6,
		},
		{
			url: `${BASE_URL}/contact`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${BASE_URL}/faq`,
			lastModified: new Date(),
			changeFrequency: "monthly",
			priority: 0.5,
		},
		{
			url: `${BASE_URL}/privacy-policy`,
			lastModified: new Date(),
			changeFrequency: "yearly",
			priority: 0.3,
		},
		{
			url: `${BASE_URL}/tags`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.5,
		},
		...techArticleDocs,
		...experimentDocs,
		...podcastDocs,
	];
}
