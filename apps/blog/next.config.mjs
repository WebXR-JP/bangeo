import { createMDX } from "fumadocs-mdx/next";

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
