import { SITE_URL } from "@/lib/site-url";

type BreadcrumbItem = {
	name: string;
	path: string;
};

type BreadcrumbStructuredDataProps = {
	items: BreadcrumbItem[];
};

function absoluteUrl(pathOrUrl: string): string {
	return new URL(pathOrUrl, SITE_URL).toString();
}

function JsonLdScript({ data }: { data: object }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted local page metadata
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}

/**
 * 固定ページ・一覧ページ向けの BreadcrumbList 構造化データ。
 * 記事ページでは ArticleStructuredData が BreadcrumbList を出力済みなので不要。
 * 先頭に "BANGEO" (ホーム) が自動で付与される。
 */
export function BreadcrumbStructuredData({
	items,
}: BreadcrumbStructuredDataProps) {
	const itemListElement = [{ name: "BANGEO", path: "/" }, ...items].map(
		(item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: item.name,
			item: absoluteUrl(item.path),
		}),
	);

	const schema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement,
	};

	return <JsonLdScript data={schema} />;
}
