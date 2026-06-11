import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/_next/", "/api/", "/search"],
		},
		sitemap: "https://bangeo.net/sitemap.xml",
		host: "https://bangeo.net",
	};
}
