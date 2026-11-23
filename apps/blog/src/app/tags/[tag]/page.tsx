import { blog, experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleCard } from "@/components/article-card";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { PageHeader } from "@/components/page-header";
import { collectTags, tagPath } from "@/lib/collect-tags";
import { contentDateValue } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

interface PageProps {
	params: Promise<{ tag: string }>;
}

function normalizeTagParam(tag: string): string {
	if (!tag.includes("%")) return tag;
	try {
		return decodeURIComponent(tag);
	} catch {
		return tag;
	}
}

export async function generateStaticParams() {
	return collectTags([...getDocs(blog), ...getDocs(experiments)]).map(
		(tag) => ({ tag }),
	);
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { tag: rawTag } = await params;
	const tag = normalizeTagParam(rawTag);
	const blogCount = getDocs(blog).filter(
		(p) => !p.draft && p.tags && Array.isArray(p.tags) && p.tags.includes(tag),
	).length;
	const expCount = getDocs(experiments).filter(
		(e) => !e.draft && e.tags && Array.isArray(e.tags) && e.tags.includes(tag),
	).length;
	const total = blogCount + expCount;
	const description = `BANGEOの「${tag}」タグ一覧。WebXRの技術記事、ニュース、デモをトピック別にまとめています（全${total}件）。`;

	return {
		title: `${tag} の記事・デモ一覧`,
		description,
		alternates: { canonical: tagPath(tag) },
		robots: { index: false, follow: true },
		openGraph: {
			title: `${tag} の記事・デモ一覧`,
			description,
			type: "website",
		},
	};
}

/** 1 / 2 / 3列のカードのグリッド（/tech-articles と同じ） */
const GRID_CLASS = "grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3";

export default async function TagDetailPage({ params }: PageProps) {
	const { tag: rawTag } = await params;
	const tag = normalizeTagParam(rawTag);

	const blogPosts = getDocs(blog)
		.filter(
			(p) =>
				!p.draft && p.tags && Array.isArray(p.tags) && p.tags.includes(tag),
		)
		.sort((a, b) => {
			const dA = contentDateValue(a.updated ?? a.date);
			const dB = contentDateValue(b.updated ?? b.date);
			return dB - dA;
		});

	const experimentsList = getDocs(experiments)
		.filter(
			(e) =>
				!e.draft && e.tags && Array.isArray(e.tags) && e.tags.includes(tag),
		)
		.sort((a, b) => {
			const dA = contentDateValue(a.updated ?? a.date);
			const dB = contentDateValue(b.updated ?? b.date);
			return dB - dA;
		});

	// 0件のタグ（存在しないタグ、下書きにだけ付いたタグ）は not-found.tsx を出す
	if (blogPosts.length === 0 && experimentsList.length === 0) {
		notFound();
	}

	const hasBoth = blogPosts.length > 0 && experimentsList.length > 0;
	// 見出しは中身を言う（記事だけなら「◯◯の技術記事」）
	const subject = hasBoth
		? "技術記事とデモ"
		: blogPosts.length > 0
			? "技術記事"
			: "デモ";
	const countText = hasBoth
		? `技術記事${blogPosts.length}本とデモ${experimentsList.length}件`
		: blogPosts.length > 0
			? `技術記事${blogPosts.length}本`
			: `デモ${experimentsList.length}件`;

	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<CollectionStructuredData
				name={`${tag} の記事・デモ一覧`}
				path={tagPath(tag)}
				description={`WebXRの技術記事、ニュース、デモを「${tag}」タグでまとめています。`}
				breadcrumbs={[
					{ name: "タグ一覧", path: "/tags" },
					{ name: tag, path: tagPath(tag) },
				]}
				items={[
					...blogPosts.map((post) => {
						const slug = getSlugFromPath(post.info.path);
						return {
							name: post.title,
							path: `/tech-articles/${slug}`,
							description: post.description,
							datePublished: post.date ? String(post.date) : undefined,
							dateModified: post.updated
								? String(post.updated)
								: post.date
									? String(post.date)
									: undefined,
						};
					}),
					...experimentsList.map((exp) => {
						const slug = getSlugFromPath(exp.info.path);
						return {
							name: exp.title,
							path: `/experiments/${slug}`,
							description: exp.description,
							datePublished: exp.date ? String(exp.date) : undefined,
							dateModified: exp.updated
								? String(exp.updated)
								: exp.date
									? String(exp.date)
									: undefined,
						};
					}),
				]}
			/>
			<PageHeader
				kicker="タグ"
				title={`${tag}の${subject}`}
				lead={`「${tag}」タグが付いた${countText}を、新しい順に並べています。`}
				actions={
					<Link
						href="/tags"
						className="text-link inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-bold"
					>
						タグ一覧を見る
						<svg
							className="size-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</Link>
				}
			/>

			{blogPosts.length > 0 ? (
				<section
					aria-labelledby={hasBoth ? "tag-articles" : undefined}
					className={hasBoth ? "mb-16 md:mb-24" : undefined}
				>
					{hasBoth ? (
						<h2
							id="tag-articles"
							className="mb-6 text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
						>
							技術記事
							<span className="ml-2 text-base font-bold text-gray-500 tabular-nums">
								{blogPosts.length}本
							</span>
						</h2>
					) : null}
					<ul className={GRID_CLASS}>
						{blogPosts.map((post, index) => {
							const slug = getSlugFromPath(post.info.path);
							return (
								<li key={slug} className="min-w-0">
									<ArticleCard
										href={`/tech-articles/${slug}`}
										title={post.title}
										description={post.description}
										thumbnail={
											post.thumbnail ? String(post.thumbnail) : undefined
										}
										category={post.category ? String(post.category) : undefined}
										date={post.date ? String(post.date) : undefined}
										updated={post.updated ? String(post.updated) : undefined}
										tags={post.tags}
										headingLevel={hasBoth ? "h3" : "h2"}
										priority={index === 0}
									/>
								</li>
							);
						})}
					</ul>
				</section>
			) : null}

			{experimentsList.length > 0 ? (
				<section aria-labelledby={hasBoth ? "tag-demos" : undefined}>
					{hasBoth ? (
						<h2
							id="tag-demos"
							className="mb-6 text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
						>
							デモ
							<span className="ml-2 text-base font-bold text-gray-500 tabular-nums">
								{experimentsList.length}件
							</span>
						</h2>
					) : null}
					<ul className={GRID_CLASS}>
						{experimentsList.map((exp, index) => {
							const slug = getSlugFromPath(exp.info.path);
							return (
								<li key={slug} className="min-w-0">
									<ArticleCard
										href={`/experiments/${slug}`}
										title={exp.title}
										description={exp.description}
										thumbnail={
											exp.thumbnail ? String(exp.thumbnail) : undefined
										}
										category={exp.category ? String(exp.category) : undefined}
										date={exp.date ? String(exp.date) : undefined}
										updated={exp.updated ? String(exp.updated) : undefined}
										tags={exp.tags}
										headingLevel={hasBoth ? "h3" : "h2"}
										priority={!hasBoth && index === 0}
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
