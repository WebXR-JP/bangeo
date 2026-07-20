import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleStructuredData } from "@/components/article-structured-data";
import { mdxComponents } from "@/components/mdx-components";
import { OptimizedImage } from "@/components/optimized-image";
import { SocialShare } from "@/components/social-share";
import { contentDateTime, contentDateValue } from "@/lib/content-dates";
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
			question: "Variant Launchは何に使いますか？",
			answer:
				"Variant Launchは、商用向けにApp Clip経由のWebXR AR配信を整えたい場合の候補です。ブランド表現、運用、サポート、既存WebXRコンテンツとの接続を重視する案件で検討します。",
		},
		{
			question: "Safari WebXRとApp Clip WebXRは同じですか？",
			answer:
				"同じではありません。Safari WebXRはブラウザがWebXR APIを直接実装している状態です。App Clipを使う方法は、ARKitでカメラやトラッキングを処理し、その上にWebViewとWebXR風のAPIを組み合わせる回避策です。",
		},
		{
			question: "iPhone向けARはWebXRで作るべきですか？",
			answer:
				"既存のWebXRコンテンツをiPhoneでも見せたい場合はApp Clip型の方法を検討できます。商品プレビューや画像認識などで十分なら、WebXR以外のWebARやAR Quick Lookの方が運用しやすい場合があります。",
		},
	],
};

interface PageProps {
	params: Promise<{ slug: string }>;
}

function findDoc(slug: string) {
	return getDocs(blog).find(
		(d) => !d.draft && getSlugFromPath(d.info.path) === slug,
	);
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return getDocs(blog)
		.filter((doc) => !doc.draft)
		.map((doc) => ({
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
	const publishedDate = doc.date ? String(doc.date) : undefined;
	const modifiedDate = doc.updated ? String(doc.updated) : publishedDate;

	return {
		title: doc.title,
		description: doc.description,
		openGraph: {
			title: doc.title,
			description: doc.description,
			type: "article",
			publishedTime: contentDateTime(publishedDate),
			modifiedTime: contentDateTime(modifiedDate),
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
	const publishedDate = doc.date ? String(doc.date) : undefined;
	const modifiedDate = doc.updated ? String(doc.updated) : publishedDate;
	const currentTags = new Set((doc.tags as string[] | undefined) ?? []);
	const relatedArticles = getDocs(blog)
		.filter(
			(article) =>
				!article.draft && getSlugFromPath(article.info.path) !== slug,
		)
		.map((article) => ({
			article,
			relevance: ((article.tags as string[] | undefined) ?? []).filter((tag) =>
				currentTags.has(tag),
			).length,
		}))
		.sort(
			(a, b) =>
				b.relevance - a.relevance ||
				contentDateValue(b.article.updated ?? b.article.date) -
					contentDateValue(a.article.updated ?? a.article.date),
		)
		.map(({ article }) => article)
		.slice(0, 3);

	const shareUrl = `${SITE_URL}${BASE_PATH}/${slug}`;

	return (
		<div className="max-w-3xl mx-auto px-5 md:px-8 py-16 md:py-24">
			<ArticleStructuredData
				title={doc.title}
				description={doc.description}
				path={`${BASE_PATH}/${slug}`}
				image={image}
				datePublished={publishedDate}
				dateModified={modifiedDate}
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
									<time
										dateTime={contentDateTime(publishedDate)}
										className="text-[11px] text-gray-500 font-medium tracking-wide"
									>
										{String(doc.date)}
									</time>
								)}
								{doc.updated && doc.updated !== doc.date && (
									<time
										dateTime={contentDateTime(modifiedDate)}
										className="text-[11px] text-gray-500 font-medium tracking-wide"
									>
										更新: {String(doc.updated)}
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

						{relatedArticles.length > 0 && (
							<div className="mt-6 pt-6 border-t border-gray-200/60">
								<h4 className="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-3">
									関連する記事
								</h4>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
									{relatedArticles.map((a) => {
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
