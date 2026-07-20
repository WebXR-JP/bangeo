import { blog } from "fumadocs-mdx:collections/server";
import { notFound, permanentRedirect } from "next/navigation";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return getDocs(blog)
		.filter((doc) => !doc.draft)
		.map((doc) => ({
			slug: getSlugFromPath(doc.info.path),
		}));
}

export default async function ArticleRedirectPage({ params }: PageProps) {
	const { slug } = await params;
	const isPublished = getDocs(blog).some(
		(doc) => !doc.draft && getSlugFromPath(doc.info.path) === slug,
	);
	if (!isPublished) notFound();
	permanentRedirect(`/tech-articles/${slug}`);
}
