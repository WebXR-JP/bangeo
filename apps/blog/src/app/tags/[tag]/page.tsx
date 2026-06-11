import { blog, experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { collectTags, tagPath } from "@/lib/collect-tags";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

interface PageProps {
	params: Promise<{ tag: string }>;
}

export async function generateStaticParams() {
	return collectTags([...getDocs(blog), ...getDocs(experiments)]).map(
		(tag) => ({ tag }),
	);
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { tag } = await params;
	const blogCount = getDocs(blog).filter(
		(p) => !p.draft && p.tags && Array.isArray(p.tags) && p.tags.includes(tag),
	).length;
	const expCount = getDocs(experiments).filter(
		(e) => !e.draft && e.tags && Array.isArray(e.tags) && e.tags.includes(tag),
	).length;
	const description = `「${tag}」タグの記事一覧（全${blogCount + expCount}件）`;

	return {
		title: `タグ: ${tag}`,
		description,
		alternates: { canonical: tagPath(tag) },
	};
}

export default async function TagDetailPage({ params }: PageProps) {
	const { tag } = await params;

	const blogPosts = getDocs(blog)
		.filter(
			(p) =>
				!p.draft && p.tags && Array.isArray(p.tags) && p.tags.includes(tag),
		)
		.sort((a, b) => {
			const dA = a.date ? new Date(a.date).getTime() : 0;
			const dB = b.date ? new Date(b.date).getTime() : 0;
			return dB - dA;
		});

	const experimentsList = getDocs(experiments)
		.filter(
			(e) =>
				!e.draft && e.tags && Array.isArray(e.tags) && e.tags.includes(tag),
		)
		.sort((a, b) => {
			const dA = a.date ? new Date(a.date).getTime() : 0;
			const dB = b.date ? new Date(b.date).getTime() : 0;
			return dB - dA;
		});

	if (blogPosts.length === 0 && experimentsList.length === 0) {
		notFound();
	}

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<div className="mb-8">
				<Link
					href="/tags"
					className="text-sm font-bold text-gray-400 hover:text-[#e11d48] transition-colors mb-4 inline-block"
				>
					← すべてのタグに戻る
				</Link>
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-2">
					タグ: {tag}
				</h1>
				<p className="text-base text-gray-500">
					全{blogPosts.length + experimentsList.length}件の記事
				</p>
			</div>

			{blogPosts.length > 0 && (
				<section className="mb-16">
					<h2 className="text-xl font-black text-gray-950 mb-6">
						ブログ記事 ({blogPosts.length}件)
					</h2>
					<div className="space-y-4">
						{blogPosts.map((post) => {
							const slug = getSlugFromPath(post.info.path);
							return (
								<Link
									key={slug}
									href={`/tech-articles/${slug}`}
									className="group block p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300"
								>
									<div className="mb-3 flex items-center gap-2">
										{post.category && (
											<span className="px-2.5 py-1 bg-rose-50 text-[#e11d48] rounded-md text-[10px] font-black uppercase tracking-wide">
												{post.category}
											</span>
										)}
										{post.date && (
											<time className="text-xs text-gray-400 font-medium">
												{post.date}
											</time>
										)}
									</div>
									<h3 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2">
										{post.title}
									</h3>
									{post.description && (
										<p className="text-sm text-gray-500 line-clamp-2">
											{post.description}
										</p>
									)}
								</Link>
							);
						})}
					</div>
				</section>
			)}

			{experimentsList.length > 0 && (
				<section>
					<h2 className="text-xl font-black text-gray-950 mb-6">
						デモ ({experimentsList.length}件)
					</h2>
					<div className="space-y-4">
						{experimentsList.map((exp) => {
							const slug = getSlugFromPath(exp.info.path);
							return (
								<Link
									key={slug}
									href={`/experiments/${slug}`}
									className="group block p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300"
								>
									<div className="mb-3 flex items-center gap-2 flex-wrap">
										{exp.category && (
											<span className="px-2.5 py-1 bg-rose-50 text-[#e11d48] rounded-md text-[10px] font-black uppercase tracking-wide">
												{exp.category}
											</span>
										)}
										{exp.difficulty && (
											<span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">
												{String(exp.difficulty)}
											</span>
										)}
										{exp.date && (
											<time className="text-xs text-gray-400 font-medium">
												{exp.date}
											</time>
										)}
									</div>
									<h3 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2">
										{exp.title}
									</h3>
									{exp.description && (
										<p className="text-sm text-gray-500 line-clamp-2 mb-3">
											{exp.description}
										</p>
									)}
									{exp.estimatedTime && (
										<span className="text-xs text-gray-400 font-medium">
											約{exp.estimatedTime}分
										</span>
									)}
								</Link>
							);
						})}
					</div>
				</section>
			)}
		</div>
	);
}
