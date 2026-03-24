import { createMDX } from "fumadocs-mdx/next";

const withMDX = createMDX();

export default withMDX({
	allowedDevOrigins: ["localhost", "127.0.0.1"],
	reactStrictMode: true,
	images: {
		remotePatterns: [],
	},
	trailingSlash: false,
	experimental: {
		optimizePackageImports: ["fumadocs-ui", "fumadocs-core"],
	},
});
