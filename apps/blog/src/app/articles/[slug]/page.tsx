import { permanentRedirect } from "next/navigation";

interface PageProps {
	params: Promise<{ slug: string }>;
}

export default async function ArticleRedirectPage({ params }: PageProps) {
	const { slug } = await params;
	permanentRedirect(`/tech-articles/${slug}`);
}
