import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const APP_HTML_DEMOS = new Set([
	"anchors-basic",
	"ar-lighting-est",
	"audio-context-xr",
	"controller-haptics-test",
	"controller-input-advanced",
	"dom-overlay-ar",
	"foveated-rendering",
	"frame-timing",
	"gamepad-api-xr",
	"grab-interaction",
	"hand-mesh-visualization",
	"hand-tracking-advanced",
	"haptics-pulse",
	"head-tracking",
	"immersive-ar-basic",
	"inline-session",
	"lod-system",
	"persistent-anchors",
	"playcanvas-html-in-canvas",
	"ray-casting",
	"reference-space",
	"render-optimization",
	"session-end-events",
	"session-features",
	"session-lifecycle",
	"session-modes",
	"stereo-rendering",
	"tracked-pointer",
	"ui-interaction",
	"webgl-xr-integration",
	"world-effects",
	"xr-frame-loop",
]);

const DEMO_HTML_DEMOS = new Set([
	"8thwall-aframe",
	"8thwall-business-card",
	"8thwall-education-ar",
	"8thwall-face",
	"8thwall-face-glasses",
	"8thwall-poster-ar",
	"8thwall-product-preview",
	"8thwall-sky-effects",
	"8thwall-virtual-tryon",
]);

const GONE_PATHS = new Set([
	"/articles/webxr-advent-calendar-2025",
	"/blog/webxr-advent-calendar-2025",
	"/experiments/vr-sanpo",
	"/tech-articles/webxr-advent-calendar-2025",
]);

const GONE_DEMO_SLUGS = new Set([
	"camera-access",
	"composition-layers",
	"geo-anchors",
	"layers-api",
	"viewer-pose",
]);

export function middleware(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl;

	if (GONE_PATHS.has(pathname)) {
		return new NextResponse(null, {
			status: 410,
			headers: { "X-Robots-Tag": "noindex" },
		});
	}

	const retiredDemoMatch = pathname.match(
		/^\/(?:demos|experiments)\/([^/]+)(?:\/.*)?$/,
	);
	if (retiredDemoMatch && GONE_DEMO_SLUGS.has(retiredDemoMatch[1])) {
		return new NextResponse(null, {
			status: 410,
			headers: { "X-Robots-Tag": "noindex" },
		});
	}

	// クエリ付き URL の重複を防ぐ（?author=, ?q= など）
	if (
		["/tech-articles", "/experiments", "/experimentals"].includes(pathname) &&
		searchParams.size > 0
	) {
		const url = request.nextUrl.clone();
		url.search = "";
		return NextResponse.redirect(url, 301);
	}

	// /demos/:slug は壊れやすいラッパーではなく実体HTMLへ直行させる。
	// WebXR は iframe 内だと Permission Policy の影響を受けやすいため、
	// Meta Quest / PICO では app.html / demo.html の全画面起動を正規ルートにする。
	// 事前判定ゲート（bangeo-xr.js）を組み込んだ再実装デモは index.html が正規ルート。
	const demoMatch = pathname.match(/^\/demos\/([^/.]+)\/?$/);
	if (demoMatch) {
		const slug = demoMatch[1];
		const url = request.nextUrl.clone();

		if (APP_HTML_DEMOS.has(slug)) {
			url.pathname = `/demos/${slug}/app.html`;
			return NextResponse.rewrite(url);
		}

		if (DEMO_HTML_DEMOS.has(slug)) {
			url.pathname = `/demos/${slug}/demo.html`;
			return NextResponse.rewrite(url);
		}

		url.pathname = `/demos/${slug}/index.html`;
		return NextResponse.rewrite(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		"/articles/:path*",
		"/tech-articles",
		"/tech-articles/:path*",
		"/blog/:path*",
		"/experiments/:path*",
		"/experimentals",
		"/demos/:path*",
	],
};
