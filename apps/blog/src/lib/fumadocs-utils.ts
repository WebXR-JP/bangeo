/**
 * Fumadocs MDX ユーティリティ
 *
 * DocsCollectionEntry からドキュメントを取得するヘルパー
 *
 * DocCollectionEntry の構造 (fumadocs-mdx v14):
 * - info: { path, fullPath } (FileInfo)
 * - body: React.FC (MDXコンポーネント)
 * - title, description 等 (Zodスキーマのフィールド)
 */

/** コレクションからドキュメント配列を取得 (型推論を維持) */
export function getDocs<T>(collection: { docs: T[] }): T[] {
	return collection.docs;
}

/** ファイルパスからスラッグを取得 (拡張子を除去) */
export function getSlugFromPath(path: string): string {
	return path.replace(/\.mdx?$/, "");
}
