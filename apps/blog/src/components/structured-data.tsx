const BASE_URL = "https://bangeo.net";

const organizationSchema = {
	"@context": "https://schema.org",
	"@type": "Organization",
	name: "BANGEO（バンオ）",
	url: BASE_URL,
	logo: `${BASE_URL}/favicon.png`,
	sameAs: ["https://x.com/bangeo_jp"],
	description:
		"WebXR や空間コンピュータの日本語リソースサイト。デモや技術情報を公開しています。",
};

const websiteSchema = {
	"@context": "https://schema.org",
	"@type": "WebSite",
	name: "BANGEO（バンオ）",
	url: BASE_URL,
	description:
		"WebXR や空間コンピュータの日本語リソースサイト。デモや技術情報を公開しています。",
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
