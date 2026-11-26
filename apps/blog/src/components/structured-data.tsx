import { SITE_URL } from "@/lib/site-url";

const organizationSchema = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: "BANGEO（バンオ）",
	url: SITE_URL,
	logo: `${SITE_URL}/favicon.png`,
	sameAs: ["https://x.com/bangeo_jp"],
	description:
		"WebXRや空間コンピューティングの日本語情報サイト。技術記事やデモ、対応状況を公開しています。",
};

const websiteSchema = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: "BANGEO（バンオ）",
	url: SITE_URL,
	description:
		"WebXRや空間コンピューティングの日本語情報サイト。技術記事やデモ、対応状況を公開しています。",
	inLanguage: "ja",
};

function JsonLdScript({ data }: { data: object }) {
	return (
		<script
			type="application/ld+json"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD is serialized from trusted local constants
			dangerouslySetInnerHTML={{
				__html: JSON.stringify(data),
			}}
		/>
	);
}

export function StructuredData() {
	return (
		<>
			<JsonLdScript data={organizationSchema} />
			<JsonLdScript data={websiteSchema} />
		</>
	);
}
