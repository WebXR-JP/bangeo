import { createMDX } from "fumadocs-mdx/next";
import {
	buildExperimentDemoRedirects,
	LEGACY_REDIRECTS,
} from "./src/lib/seo-redirects.mjs";

const withMDX = createMDX();

export default withMDX({
	allowedDevOrigins: ["localhost", "127.0.0.1"],
	reactStrictMode: true,
	images: {
		formats: ["image/avif", "image/webp"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "i.ytimg.com",
				pathname: "/vi/**",
			},
		],
	},
	trailingSlash: false,
	async rewrites() {
		return {
			beforeFiles: [
				{
					source: "/demos/:slug",
					destination: "/demos/:slug/index.html",
				},
			],
		};
	},
	async redirects() {
		return [
			{
				source: "/:path*",
				has: [{ type: "host", value: "bangeo.net" }],
				destination: "https://www.bangeo.net/:path*",
				permanent: true,
			},
			...LEGACY_REDIRECTS,
			...buildExperimentDemoRedirects(),
			{
				source: "/tech-articles/playcanvas-html-in-canvas-guide",
				destination: "/tech-articles/playcanvas-html-in-canvas",
				permanent: true,
			},
			{
				source:
					"/tech-articles/playcanvas-html-in-canvas-texture-webgpu-webxr-ui",
				destination: "/tech-articles/playcanvas-html-in-canvas",
				permanent: true,
			},
		];
	},
	async headers() {
		return [
			{
				source: "/sitemap.xml",
				headers: [
					{
						key: "X-Robots-Tag",
						value: "noindex, follow",
					},
				],
			},
			{
				source: "/rss.xml",
				headers: [
					{
						key: "X-Robots-Tag",
						value: "noindex, follow",
					},
				],
			},
			{
				source: "/search-index.json",
				headers: [
					{
						key: "X-Robots-Tag",
						value: "noindex, follow",
					},
				],
			},
			{
				source: "/demos/:path*",
				headers: [
					{
						key: "X-Robots-Tag",
						value: "noindex, follow",
					},
				],
			},
			{
				source: "/demo/:path*",
				headers: [
					{
						key: "X-Robots-Tag",
						value: "noindex, follow",
					},
				],
			},
		];
	},
	experimental: {
		optimizePackageImports: ["fumadocs-ui", "fumadocs-core"],
	},
});
