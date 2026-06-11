import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname, searchParams } = request.nextUrl;

	// クエリ付き URL の重複を防ぐ（?author=, ?q= など）
	if (
		(pathname === "/tech-articles" || pathname === "/experiments") &&
		searchParams.size > 0
	) {
		const url = request.nextUrl.clone();
		url.search = "";
		return NextResponse.redirect(url, 301);
	}

	// /demos/:slug (no trailing slash, no file extension) -> serve index.html
	const demoMatch = pathname.match(/^\/demos\/([^/.]+)$/);
	if (demoMatch) {
		const url = request.nextUrl.clone();
		url.pathname = `/demos/${demoMatch[1]}/index.html`;
		return NextResponse.rewrite(url);
	}

	return NextResponse.next();
}

export const config = {
	matcher: ["/tech-articles", "/experiments", "/demos/:path*"],
};
