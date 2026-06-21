import { SITE_URL } from "@/lib/site-url";

type ArticleStructuredDataProps = {
	title: string;
	description?: string;
	path: string;
	image?: string;
	datePublished?: string;
	author?: string;
	categoryLabel: string;
	categoryPath: string;
	tags?: string[];
	faqs?: Array<{
		question: string;
		answer: string;
	}>;
};

function absoluteUrl(pathOrUrl: string): string {
	return new URL(pathOrUrl, SITE_URL).toString();
}

function parseJapaneseDate(value?: string): string | undefined {
	if (!value) return undefined;

	const match = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
	if (!match) return value;

	const [, year, month, day] = match;
	return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
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

export function ArticleStructuredData({
	title,
	description,
	path,
	image = "/ogp.png",
	datePublished,
	author = "BANGEO",
	categoryLabel,
	categoryPath,
	tags = [],
	faqs = [],
}: ArticleStructuredDataProps) {
	const url = absoluteUrl(path);
	const published = parseJapaneseDate(datePublished);
	const articleSchema = {
		"@context": "https://schema.org",
		"@type": "Article",
		headline: title,
		description,
		url,
		mainEntityOfPage: url,
		image: [absoluteUrl(image)],
		datePublished: published,
		dateModified: published,
		inLanguage: "ja",
		keywords: tags.join(", "),
		author: {
			"@type": "Organization",
			name: author,
			url: SITE_URL,
		},
		publisher: {
			"@type": "Organization",
			name: "BANGEO",
			logo: {
				"@type": "ImageObject",
				url: absoluteUrl("/favicon.png"),
			},
		},
	};
	const breadcrumbSchema = {
		"@context": "https://schema.org",
		"@type": "BreadcrumbList",
		itemListElement: [
			{
				"@type": "ListItem",
				position: 1,
				name: "BANGEO",
				item: SITE_URL,
			},
			{
				"@type": "ListItem",
				position: 2,
				name: categoryLabel,
				item: absoluteUrl(categoryPath),
			},
			{
				"@type": "ListItem",
				position: 3,
				name: title,
				item: url,
			},
		],
	};
	const faqSchema =
		faqs.length > 0
			? {
					"@context": "https://schema.org",
					"@type": "FAQPage",
					mainEntity: faqs.map((faq) => ({
						"@type": "Question",
						name: faq.question,
						acceptedAnswer: {
							"@type": "Answer",
							text: faq.answer,
						},
					})),
				}
			: null;

	return (
		<>
			<JsonLdScript data={articleSchema} />
			<JsonLdScript data={breadcrumbSchema} />
			{faqSchema && <JsonLdScript data={faqSchema} />}
		</>
	);
}
