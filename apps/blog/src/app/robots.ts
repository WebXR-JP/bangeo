import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site-url";

export default function robots(): MetadataRoute.Robots {
	return {
		rules: {
			userAgent: "*",
			allow: "/",
			disallow: ["/_next/", "/api/", "/search"],
		},
		sitemap: `${SITE_URL}/sitemap.xml`,
		host: SITE_URL,
	};
}
