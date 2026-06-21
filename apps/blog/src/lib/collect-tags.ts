/** ブログ・デモ MDX の frontmatter からタグ一覧を収集する */
export function collectTags(
	docs: { tags?: unknown; draft?: unknown }[],
): string[] {
	return Array.from(collectTagCounts(docs).keys()).sort((a, b) =>
		a.localeCompare(b, "ja"),
	);
}

export function collectTagCounts(
	docs: { tags?: unknown; draft?: unknown }[],
): Map<string, number> {
	const tagCounts = new Map<string, number>();
	for (const doc of docs) {
		if (doc.draft) continue;
		if (doc.tags && Array.isArray(doc.tags)) {
			for (const tag of doc.tags) {
				if (typeof tag === "string") {
					tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
				}
			}
		}
	}
	return tagCounts;
}

/** タグ名から URL パスを生成（canonical / sitemap 用） */
export function tagPath(tag: string): string {
	return `/tags/${encodeURIComponent(tag)}`;
}
