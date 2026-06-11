/** ブログ・デモ MDX の frontmatter からタグ一覧を収集する */
export function collectTags(
	docs: { tags?: unknown; draft?: unknown }[],
): string[] {
	const tags = new Set<string>();
	for (const doc of docs) {
		if (doc.draft) continue;
		if (doc.tags && Array.isArray(doc.tags)) {
			for (const tag of doc.tags) {
				if (typeof tag === "string") tags.add(tag);
			}
		}
	}
	return Array.from(tags).sort((a, b) => a.localeCompare(b, "ja"));
}

/** タグ名から URL パスを生成（canonical / sitemap 用） */
export function tagPath(tag: string): string {
	return `/tags/${encodeURIComponent(tag)}`;
}
