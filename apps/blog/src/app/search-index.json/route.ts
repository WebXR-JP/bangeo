import { getSearchIndex } from "@/lib/search-index";

export const dynamic = "force-static";

export function GET() {
	return Response.json(getSearchIndex());
}
