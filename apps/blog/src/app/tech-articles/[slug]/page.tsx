import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx-components";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

const BASE_PATH = "/tech-articles";

interface PageProps {
	params: Promise<{ slug: string }>;
}

function findDoc(slug: string) {
	return getDocs(blog).find((d) => getSlugFromPath(d.info.path) === slug);
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return getDocs(blog).map((doc) => ({
		slug: getSlugFromPath(doc.info.path),
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const doc = findDoc(slug);
	if (!doc) return {};

	const ogImage = doc.thumbnail ? String(doc.thumbnail) : "/ogp.png";

	return {
		title: doc.title,
		description: doc.description,
		openGraph: {
			title: doc.title,
			description: doc.description,
			type: "article",
			publishedTime: doc.date ? String(doc.date) : undefined,
			authors: doc.author ? [String(doc.author)] : undefined,
			tags: (doc.tags as string[] | undefined) || [],
			images: [{ url: ogImage, width: 1200, height: 630, alt: doc.title }],
		},
		alternates: { canonical: `${BASE_PATH}/${slug}` },
	};
}

export default async function TechArticlePage({ params }: PageProps) {
	const { slug } = await params;
	const doc = findDoc(slug);
	if (!doc) notFound();

	const MDX = doc.body;
	const tags = doc.tags as string[] | undefined;
	const allDocs = getDocs(blog);
	const otherArticles = allDocs
		.filter(
			(a) => a.author === doc.author && getSlugFromPath(a.info.path) !== slug,
		)
		.slice(0, 3);

	const shareUrl = `https://bangeo.net${BASE_PATH}/${slug}`;
	const shareText = encodeURIComponent(doc.title);
	const shareUrlEncoded = encodeURIComponent(shareUrl);

	return (
		<div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
			<article>
				{/* Header */}
				<header className="mb-12">
					<div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
						<div className="w-full md:w-56 md:min-w-56 aspect-video overflow-hidden rounded-xl bg-gray-100 shrink-0">
							<img
								src={doc.thumbnail ? String(doc.thumbnail) : "/no-image.png"}
								alt={doc.title}
								className="w-full h-full object-cover"
							/>
						</div>
						<div className="flex-1 min-w-0">
							<div className="mb-4 flex flex-wrap items-center gap-3">
								{doc.category && (
									<span className="px-2.5 py-1 bg-rose-50 text-[#e11d48] rounded-md text-[10px] font-black uppercase tracking-widest">
										{String(doc.category)}
									</span>
								)}
								{doc.date && (
									<time className="text-[11px] text-gray-400 font-medium tracking-wide">
										{String(doc.date)}
									</time>
								)}
								{doc.author && (
									<span className="text-[11px] text-gray-400 font-medium tracking-wide">
										{String(doc.author)}
									</span>
								)}
							</div>
							<h1 className="text-2xl md:text-[1.75rem] font-black tracking-[-0.02em] text-gray-950 mb-4 leading-[1.35]">
								{doc.title}
							</h1>
							{doc.description && (
								<p className="text-[14px] text-gray-500 leading-[1.9] tracking-[0.02em]">
									{doc.description}
								</p>
							)}
						</div>
					</div>
					{tags && tags.length > 0 && (
						<div className="flex flex-wrap gap-1.5 mt-6 pt-6 border-t border-gray-100">
							{tags.map((tag) => (
								<Link
									key={tag}
									href={`/tags/${encodeURIComponent(tag)}`}
									className="px-2.5 py-0.5 bg-gray-50 text-gray-500 rounded-md text-xs font-medium hover:bg-rose-50 hover:text-[#e11d48] transition-colors"
								>
									#{tag}
								</Link>
							))}
						</div>
					)}
				</header>

				{/* Content */}
				<div className="tech-article-content">
					<MDX components={mdxComponents} />
				</div>

				{/* Author Section */}
				<section className="mt-20 pt-10 border-t border-gray-100">
					<div className="p-8 bg-gray-50/80 rounded-2xl">
						<div className="flex items-center gap-5">
							<div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-gray-100 flex-shrink-0">
								<img
									src="/images/authors/bangeo-team.png"
									alt={doc.author ? String(doc.author) : "BANGEO"}
									className="w-full h-full object-cover"
								/>
							</div>
							<div className="flex-1">
								<p className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-0.5">
									この記事を書いた人
								</p>
								<h3 className="text-lg font-black text-gray-900 mb-1">
									{doc.author ? String(doc.author) : "BANGEO"}
								</h3>
								<p className="text-[13px] text-gray-500 leading-relaxed">
									WebXRの技術情報を日本語でまとめているチームです。デモやガイドを公開しています。
								</p>
							</div>
						</div>

						{otherArticles.length > 0 && (
							<div className="mt-6 pt-6 border-t border-gray-200/60">
								<h4 className="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-3">
									{doc.author ? String(doc.author) : "BANGEO"}
									の他の記事
								</h4>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									{otherArticles.map((a) => {
										const aSlug = getSlugFromPath(a.info.path);
										return (
											<Link
												key={aSlug}
												href={`${BASE_PATH}/${aSlug}`}
												className="group block p-3.5 bg-white rounded-xl border border-gray-100 hover:border-[#e11d48]/30 hover:shadow-sm transition-all"
											>
												<h5 className="font-bold text-[13px] text-gray-900 group-hover:text-[#e11d48] transition-colors line-clamp-2 mb-1.5 leading-snug">
													{a.title}
												</h5>
												{a.date && (
													<p className="text-[10px] text-gray-400">
														{String(a.date)}
													</p>
												)}
											</Link>
										);
									})}
								</div>
							</div>
						)}
					</div>
				</section>

				{/* X Share */}
				<section className="mt-12 flex justify-center">
					<a
						href={`https://x.com/intent/tweet?text=${shareText}&url=${shareUrlEncoded}`}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2.5 px-5 py-2.5 bg-white border border-gray-200 text-gray-800 rounded-full text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-xs hover:shadow-sm"
					>
						<svg
							className="w-4 h-4"
							viewBox="0 0 24 24"
							fill="currentColor"
							aria-hidden="true"
						>
							<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
						</svg>
						この記事をXでシェア
					</a>
				</section>

				{/* Footer CTA */}
				<footer className="mt-12 pt-10 border-t border-gray-100">
					<div className="bg-gray-50 p-8 md:p-10 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
						<div className="space-y-1.5 text-center md:text-left">
							<h3 className="text-xl font-black tracking-tight">
								デモを実際に試してみる
							</h3>
							<p className="text-sm text-gray-500">
								この技術を使用した実例を、ブラウザですぐに体験できます。
							</p>
						</div>
						<Link
							href="/experiments"
							className="px-6 py-3 bg-gray-950 text-white rounded-full font-bold text-sm hover:bg-[#e11d48] transition-all shadow-lg whitespace-nowrap"
						>
							デモを見る →
						</Link>
					</div>
				</footer>
			</article>
		</div>
	);
}
