import { blog } from "fumadocs-mdx:collections/server";
import { redirect } from "next/navigation";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return getDocs(blog).map((doc) => ({
		slug: getSlugFromPath(doc.info.path),
	}));
}

/**
 * /blog/[slug] は /tech-articles/[slug] へリダイレクトする。
 * 旧URLからのアクセスを維持するための互換ルート。
 */
export default async function BlogPostPage({ params }: PageProps) {
	const { slug } = await params;
	redirect(`/tech-articles/${slug}`);
}
