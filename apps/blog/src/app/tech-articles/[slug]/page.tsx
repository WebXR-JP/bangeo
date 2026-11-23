import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
	ArticleCard,
	articleCategoryLabel,
	articleListDate,
} from "@/components/article-card";
import { ArticleStructuredData } from "@/components/article-structured-data";
import { mdxComponents } from "@/components/mdx-components";
import { OptimizedImage } from "@/components/optimized-image";
import { SocialShare } from "@/components/social-share";
import {
	contentDateTime,
	contentDateValue,
	formatContentDate,
} from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { NO_IMAGE } from "@/lib/image-defaults";
import { SITE_URL } from "@/lib/site-url";

const BASE_PATH = "/tech-articles";

/**
 * 記事の頭の画像の表示幅。本文カラム（40rem = 640px）と同じ幅で、
 * それより狭い画面ではコンテナの左右 20px を引いた幅
 */
const HERO_IMAGE_SIZES = "(min-width: 680px) 640px, calc(100vw - 40px)";
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
	const categoryLabel = doc.category
		? articleCategoryLabel(String(doc.category))
		: "";
	const publishedText = formatContentDate(publishedDate);
	// 公開日より後の更新日があるときだけ「◯年◯月◯日更新」を添える（一覧のカードと同じ決まり）
	const revision = articleListDate(
		publishedDate,
		doc.updated ? String(doc.updated) : undefined,
	);
	const uniqueTags = tags ? [...new Set(tags)] : [];
	const authorName = doc.author ? String(doc.author) : "BANGEO";
	const demoUrl = doc.demoUrl ? String(doc.demoUrl) : undefined;

	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
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
			<article className="mx-auto max-w-[40rem]">
				<header>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-[1.6] text-gray-500">
						{categoryLabel ? (
							<span className="chip chip-brand">{categoryLabel}</span>
						) : null}
						{publishedText ? (
							<time dateTime={contentDateTime(publishedDate)}>
								{publishedText}
							</time>
						) : null}
						{revision.isRevised && revision.text ? (
							<span>
								<time dateTime={contentDateTime(revision.value)}>
									{revision.text}
								</time>
								更新
							</span>
						) : null}
						{doc.author ? <span>{String(doc.author)}</span> : null}
					</div>
					<h1 className="mt-3 text-2xl font-black leading-snug text-gray-950 md:text-[2rem]">
						{doc.title}
					</h1>
					{doc.description ? (
						<p className="mt-4 text-base leading-[1.8] text-gray-700 md:text-lg">
							{doc.description}
						</p>
					) : null}
					{uniqueTags.length > 0 ? (
						<ul aria-label="タグ" className="mt-3 flex flex-wrap gap-x-2">
							{uniqueTags.map((tag) => (
								<li key={tag}>
									{/* 押せる範囲は高さ 44px（PCは 36px）、見た目はチップ。輪はチップに出す */}
									<Link
										href={`/tags/${encodeURIComponent(tag)}`}
										prefetch={false}
										className="group inline-flex min-h-11 items-center rounded-full focus-visible:outline-none md:min-h-9"
									>
										<span className="chip transition-colors group-hover:bg-gray-200 group-hover:text-gray-950 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary-600">
											{tag}
										</span>
									</Link>
								</li>
							))}
						</ul>
					) : null}
				</header>

				{/* 最初の1画面でいちばん大きい画像なので、ここだけ優先して読み込む */}
				<div className="relative mt-6 aspect-video overflow-hidden rounded-2xl bg-gray-100">
					<OptimizedImage
						src={doc.thumbnail ? String(doc.thumbnail) : NO_IMAGE}
						alt=""
						fill
						sizes={HERO_IMAGE_SIZES}
						priority
						className="object-cover"
					/>
				</div>

				<div className="tech-article-content mt-10 md:mt-12">
					<MDX components={mdxComponents} />
				</div>

				<footer className="mt-16 border-t border-gray-200 pt-8">
					<SocialShare url={shareUrl} title={doc.title} align="start" />

					<div className="mt-10 flex items-start gap-4">
						<div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-gray-200 bg-white">
							<OptimizedImage
								src="/images/authors/bangeo-team.webp"
								alt=""
								fill
								sizes="48px"
								className="object-cover"
							/>
						</div>
						<div className="min-w-0">
							<p className="text-[13px] leading-[1.6] text-gray-500">
								この記事を書いた人
							</p>
							<p className="text-base font-bold leading-snug text-gray-950">
								{authorName}
							</p>
							<p className="mt-1 break-phrase text-sm leading-[1.7] text-gray-600">
								WebXRの技術情報を日本語でまとめているチームです。デモやガイドを公開しています。
							</p>
						</div>
					</div>

					<section
						aria-labelledby="article-next-step"
						className="card mt-12 flex flex-col gap-5 p-6 md:flex-row md:items-center md:justify-between md:p-8"
					>
						<div className="min-w-0">
							<h2
								id="article-next-step"
								className="text-lg font-bold leading-snug text-gray-950"
							>
								{demoUrl ? "この記事のデモ" : "この端末でWebXRが動くか確かめる"}
							</h2>
							<p className="mt-1 break-phrase text-sm leading-[1.7] text-gray-600">
								{demoUrl
									? "記事で取り上げた内容を、ブラウザで動かして確かめられます。"
									: "WebXR対応レポートは、仕様ごとにこの端末の対応を判定します。デモがある仕様は、その場で動かして確かめられます。"}
							</p>
						</div>
						{demoUrl ? (
							<a
								href={demoUrl}
								className="btn btn-dark shrink-0 self-start md:self-auto"
							>
								デモを開く
							</a>
						) : (
							<Link
								href="/experiments"
								className="btn btn-dark shrink-0 self-start md:self-auto"
							>
								WebXR対応レポートを見る
							</Link>
						)}
					</section>
				</footer>
			</article>

			{relatedArticles.length > 0 ? (
				<section
					aria-labelledby="related-articles"
					className="mt-16 border-t border-gray-200 pt-12 md:mt-24 md:pt-16"
				>
					<h2
						id="related-articles"
						className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
					>
						関連する技術記事
					</h2>
					<ul className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{relatedArticles.map((article) => {
							const articleSlug = getSlugFromPath(article.info.path);
							return (
								<li key={articleSlug} className="min-w-0">
									<ArticleCard
										href={`${BASE_PATH}/${articleSlug}`}
										title={article.title}
										description={article.description}
										thumbnail={
											article.thumbnail ? String(article.thumbnail) : undefined
										}
										category={
											article.category ? String(article.category) : undefined
										}
										date={article.date ? String(article.date) : undefined}
										updated={
											article.updated ? String(article.updated) : undefined
										}
										tags={article.tags}
									/>
								</li>
							);
						})}
					</ul>
				</section>
			) : null}
		</div>
	);
}
