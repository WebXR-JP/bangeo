import { contentDateTime } from "@/lib/content-dates";
import { SITE_URL } from "@/lib/site-url";

type ArticleStructuredDataProps = {
	title: string;
	description?: string;
	path: string;
	image?: string;
	datePublished?: string;
	dateModified?: string;
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
	dateModified,
	author = "BANGEO",
	categoryLabel,
	categoryPath,
	tags = [],
	faqs = [],
}: ArticleStructuredDataProps) {
	const url = absoluteUrl(path);
	const published = contentDateTime(datePublished);
	const modified = contentDateTime(dateModified ?? datePublished);
	const articleSchema = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		"@id": `${url}#article`,
		headline: title,
		description,
		url,
		mainEntityOfPage: url,
		image: [absoluteUrl(image)],
		datePublished: published,
		dateModified: modified,
		inLanguage: "ja",
		keywords: tags.join(", "),
		articleSection: categoryLabel,
		author: {
			"@type": "Organization",
			name: author,
			url: absoluteUrl("/about"),
		},
		publisher: {
			"@type": "Organization",
			name: "BANGEO",
			url: SITE_URL,
			logo: {
				"@type": "ImageObject",
				url: absoluteUrl("/favicon.png"),
			},
		},
		isPartOf: {
			"@type": "WebSite",
			name: "BANGEO",
			url: SITE_URL,
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
