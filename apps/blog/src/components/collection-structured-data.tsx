import { contentDateTime } from "@/lib/content-dates";
import { SITE_URL } from "@/lib/site-url";

type CollectionItem = {
	name: string;
	path: string;
	description?: string;
	image?: string;
	datePublished?: string;
	dateModified?: string;
};

type CollectionStructuredDataProps = {
	name: string;
	path: string;
	description?: string;
	items: CollectionItem[];
	breadcrumbs?: Array<{ name: string; path: string }>;
};

function absoluteUrl(pathOrUrl: string): string {
	return new URL(pathOrUrl, SITE_URL).toString();
}

function JsonLdScript({ data }: { data: object }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted local content metadata
			dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
		/>
	);
}

export function CollectionStructuredData({
	name,
	path,
	description,
	items,
	breadcrumbs = [],
}: CollectionStructuredDataProps) {
	const url = absoluteUrl(path);
	const itemListSchema = {
		"@context": "https://schema.org",
		"@type": "ItemList",
		"@id": `${url}#itemlist`,
		name,
		description,
		url,
		inLanguage: "ja",
		numberOfItems: items.length,
		itemListElement: items.map((item, index) => ({
			"@type": "ListItem",
			position: index + 1,
			url: absoluteUrl(item.path),
			item: {
				"@type": "Article",
				headline: item.name,
				description: item.description,
				url: absoluteUrl(item.path),
				image: item.image ? absoluteUrl(item.image) : undefined,
				datePublished: contentDateTime(item.datePublished),
				dateModified: contentDateTime(item.dateModified ?? item.datePublished),
			},
		})),
	};
	const breadcrumbItems = [{ name: "BANGEO", path: "/" }, ...breadcrumbs].map(
		(breadcrumb, index) => ({
			"@type": "ListItem",
			position: index + 1,
			name: breadcrumb.name,
			item: absoluteUrl(breadcrumb.path),
		}),
	);
	const breadcrumbSchema =
		breadcrumbItems.length > 1
			? {
					"@context": "https://schema.org",
					"@type": "BreadcrumbList",
					itemListElement: breadcrumbItems,
				}
			: null;

	return (
		<>
			<JsonLdScript data={itemListSchema} />
			{breadcrumbSchema && <JsonLdScript data={breadcrumbSchema} />}
		</>
	);
}
