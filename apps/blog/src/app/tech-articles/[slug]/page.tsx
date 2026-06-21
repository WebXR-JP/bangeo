import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleStructuredData } from "@/components/article-structured-data";
import { mdxComponents } from "@/components/mdx-components";
import { OptimizedImage } from "@/components/optimized-image";
import { SocialShare } from "@/components/social-share";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { NO_IMAGE, THUMB_IMAGE_SIZES } from "@/lib/image-defaults";
import { SITE_URL } from "@/lib/site-url";

const BASE_PATH = "/tech-articles";
const ARTICLE_FAQS: Record<
	string,
	Array<{ question: string; answer: string }>
> = {
	"ios-webxr-app-clip-guide": [
		{
			question: "iPhoneのSafariはWebXRに対応していますか？",
			answer:
				"2026年時点では、iPhoneのSafariだけでWebXRのimmersive-arを本番利用する前提にはしない方が安全です。visionOS SafariのWebXR対応とは別に、iOS SafariではWebXR Device APIを直接使えない前提で設計します。",
		},
		{
			question: "iOSでWebXRを使うには何が必要ですか？",
			answer:
				"WebXR API互換のAR体験をiPhoneで見せたい場合は、App Clipや専用ビューアのように、ARKitを使うネイティブ層とWebViewを組み合わせる必要があります。",
		},
		{
			question: "Safari WebXRとApp Clip WebXRは同じですか？",
			answer:
				"同じではありません。Safari WebXRはブラウザがWebXR APIを直接実装している状態です。App Clipを使う方法は、ARKitでカメラやトラッキングを処理し、その上にWebViewとWebXR風のAPIを組み合わせる回避策です。",
		},
	],
};

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
		twitter: {
			card: "summary_large_image",
			title: doc.title,
			description: doc.description,
			images: [ogImage],
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
	const image = doc.thumbnail ? String(doc.thumbnail) : "/ogp.png";
	const allDocs = getDocs(blog);
	const otherArticles = allDocs
		.filter(
			(a) => a.author === doc.author && getSlugFromPath(a.info.path) !== slug,
		)
		.slice(0, 3);

	const shareUrl = `${SITE_URL}${BASE_PATH}/${slug}`;

	return (
		<div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
			<ArticleStructuredData
				title={doc.title}
				description={doc.description}
				path={`${BASE_PATH}/${slug}`}
				image={image}
				datePublished={doc.date ? String(doc.date) : undefined}
				author={doc.author ? String(doc.author) : undefined}
				categoryLabel="技術記事"
				categoryPath={BASE_PATH}
				tags={tags}
				faqs={ARTICLE_FAQS[slug]}
			/>
			<article>
				{/* Header */}
				<header className="mb-12">
					<div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start">
						<div className="w-full md:w-56 md:min-w-56 aspect-video overflow-hidden rounded-xl bg-gray-100 shrink-0 relative">
							<OptimizedImage
								src={doc.thumbnail ? String(doc.thumbnail) : NO_IMAGE}
								alt={doc.title}
								fill
								sizes={THUMB_IMAGE_SIZES}
								priority
								className="object-cover"
							/>
						</div>
						<div className="flex-1 min-w-0">
							<div className="mb-4 flex flex-wrap items-center gap-3">
								{doc.category && (
									<span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-widest">
										{String(doc.category)}
									</span>
								)}
								{doc.date && (
									<time className="text-[11px] text-gray-500 font-medium tracking-wide">
										{String(doc.date)}
									</time>
								)}
								{doc.author && (
									<span className="text-[11px] text-gray-500 font-medium tracking-wide">
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
							<div className="w-16 h-16 rounded-full overflow-hidden bg-white border-2 border-gray-100 flex-shrink-0 relative">
								<OptimizedImage
									src="/images/authors/bangeo-team.webp"
									alt={doc.author ? String(doc.author) : "BANGEO"}
									fill
									sizes="64px"
									className="object-cover"
								/>
							</div>
							<div className="flex-1">
								<p className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-0.5">
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
								<h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">
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
													<p className="text-[10px] text-gray-500">
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

				<SocialShare url={shareUrl} title={doc.title} className="mt-12" />

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
