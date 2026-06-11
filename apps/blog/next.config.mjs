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
		remotePatterns: [],
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
	experimental: {
		optimizePackageImports: ["fumadocs-ui", "fumadocs-core"],
	},
});
