import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

export interface SearchIndexItem {
	type: "blog" | "experiment" | "podcast";
	typeLabel: string;
	title: string;
	description: string;
	slug: string;
	date?: string;
	tags?: string[];
	category?: string;
}

function getTimestamp(date?: string): number {
	return date ? new Date(date).getTime() || 0 : 0;
}

export function getSearchIndex(): SearchIndexItem[] {
	const blogItems = getDocs(blog)
		.filter((doc) => !doc.draft)
		.map((doc) => ({
			type: "blog" as const,
			typeLabel: "ブログ",
			title: doc.title,
			description: String(doc.description || ""),
			slug: `/tech-articles/${getSlugFromPath(doc.info.path)}`,
			date: doc.date ? String(doc.date) : undefined,
			tags: doc.tags as string[] | undefined,
			category: doc.category ? String(doc.category) : undefined,
		}));

	const experimentItems = getDocs(experiments)
		.filter((doc) => !doc.draft)
		.map((doc) => ({
			type: "experiment" as const,
			typeLabel: "デモ",
			title: doc.title,
			description: String(doc.description || ""),
			slug: `/experiments/${getSlugFromPath(doc.info.path)}`,
			date: doc.date ? String(doc.date) : undefined,
			tags: doc.tags as string[] | undefined,
			category: doc.category ? String(doc.category) : undefined,
		}));

	const podcastItems = getDocs(podcast)
		.filter((doc) => !doc.draft)
		.map((doc) => ({
			type: "podcast" as const,
			typeLabel: "ポッドキャスト",
			title: doc.title,
			description: String(doc.description || ""),
			slug: `/podcast/${getSlugFromPath(doc.info.path)}`,
			date: doc.date ? String(doc.date) : undefined,
			tags: doc.tags as string[] | undefined,
		}));

	return [...blogItems, ...experimentItems, ...podcastItems].sort(
		(a, b) => getTimestamp(b.date) - getTimestamp(a.date),
	);
}
