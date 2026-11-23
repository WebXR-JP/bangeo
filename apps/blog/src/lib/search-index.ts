import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import { contentDateValue } from "@/lib/content-dates";
import { getDemoCatalog } from "@/lib/demo-catalog";
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

// フロントマターの日付は "2026-11-18" と "2026年11月10日" の両方があるので、
// 両方を読める contentDateValue で並べる（new Date() は和文の日付を読めず、該当の記事が末尾に回る）
const getTimestamp = contentDateValue;

export function getSearchIndex(): SearchIndexItem[] {
	const blogItems = getDocs(blog)
		.filter((doc) => !doc.draft)
		.map((doc) => ({
			type: "blog" as const,
			typeLabel: "技術記事",
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

	const experimentSlugs = new Set(
		experimentItems.map((item) => item.slug.replace("/experiments/", "")),
	);
	const demoItems = getDemoCatalog()
		.filter((demo) => !experimentSlugs.has(demo.slug))
		.map((demo) => ({
			type: "experiment" as const,
			typeLabel: "デモ",
			title: demo.title,
			description: demo.description,
			slug: demo.href,
			date: undefined,
			tags: demo.tags,
			category: demo.category,
		}));

	return [...blogItems, ...experimentItems, ...demoItems, ...podcastItems].sort(
		(a, b) => getTimestamp(b.date) - getTimestamp(a.date),
	);
}
