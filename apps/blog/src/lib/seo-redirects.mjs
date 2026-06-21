import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appRoot = path.join(__dirname, "..", "..");

/** デモ slug があるが MDX ページがない /experiments/:slug を /demos/:slug へ */
export function buildExperimentDemoRedirects() {
	const experimentsDir = path.join(appRoot, "content/experiments");
	const demosDir = path.join(appRoot, "public/demos");

	const mdxSlugs = fs
		.readdirSync(experimentsDir)
		.filter((f) => f.endsWith(".mdx"))
		.map((f) => f.replace(/\.mdx$/, ""));

	const demoSlugs = fs
		.readdirSync(demosDir, { withFileTypes: true })
		.filter((d) => d.isDirectory())
		.map((d) => d.name);

	return demoSlugs
		.filter((slug) => !mdxSlugs.includes(slug))
		.map((slug) => ({
			source: `/experiments/${slug}`,
			destination: `/demos/${slug}`,
			permanent: true,
		}));
}

/** GSC で検出された旧 URL 向けの手動リダイレクト */
export const LEGACY_REDIRECTS = [
	{
		source: "/experiments/product-preview-ar",
		destination: "/demos/8thwall-product-preview/demo.html",
		permanent: true,
	},
	{
		source: "/experiments/hit-test-basic",
		destination: "/demos/hit-test-advanced",
		permanent: true,
	},
	{
		source: "/experiments/controller-input-basic",
		destination: "/demos/controller-input-advanced",
		permanent: true,
	},
	{
		source: "/experiments/sample-hand-tracking",
		destination: "/demos/hand-tracking-advanced",
		permanent: true,
	},
	{
		source: "/experiments/vr-sanpo",
		destination: "/experiments",
		permanent: true,
	},
	{
		source: "/experiments/depth-sensing",
		destination: "/experiments",
		permanent: true,
	},
	{
		source: "/experiments/spatial-audio-advanced",
		destination: "/demos/webxr-audio-space",
		permanent: true,
	},
	{
		source: "/experiments/face-tracking",
		destination: "/demos/8thwall-face",
		permanent: true,
	},
	{
		source: "/hand-mesh-visualization",
		destination: "/demos/hand-mesh-visualization",
		permanent: true,
	},
	{
		source: "/tech-articles/hand-tracking-basic-implementation",
		destination: "/tech-articles/threejs-r184-webxr-layers-hand-model-cache",
		permanent: true,
	},
	{
		source: "/tech-articles/8thwall-playcanvas-self-hosted",
		destination: "/tech-articles/8thwall-world-effects",
		permanent: true,
	},
	{
		source: "/tags/Controller",
		destination: "/tags",
		permanent: true,
	},
	{
		source: "/tags/Multiplayer",
		destination: "/tags",
		permanent: true,
	},
	{
		source: "/tags/セルフホスト",
		destination: "/tags",
		permanent: true,
	},
	{
		source: "/tags/移行ガイド",
		destination: "/tags",
		permanent: true,
	},
];
