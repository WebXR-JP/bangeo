import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

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
	matcher: ["/demos/:path*"],
};
