import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { PageHeader } from "@/components/page-header";
import { contentDateValue } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { NO_IMAGE } from "@/lib/image-defaults";

export const metadata: Metadata = {
	title: "WebXR技術記事・ニュース｜実装ガイド・ブラウザ更新",
	description:
		"WebXRの仕様更新、ブラウザ対応、Meta Quest・iOS Safari・WebGPUの実装ノウハウ、イベント情報を日本語で整理した技術記事一覧です。",
	openGraph: {
		title: "WebXR技術記事・ニュース｜実装ガイド・ブラウザ更新",
		description:
			"WebXRの仕様更新、ブラウザ対応、Meta Quest・iOS Safari・WebGPUの実装ノウハウ、イベント情報を日本語で整理した技術記事一覧です。",
		type: "website",
	},
	alternates: { canonical: "/tech-articles" },
};

export default function TechArticlesIndexPage() {
	const posts = getDocs(blog)
		.filter((post) => !post.draft)
		.sort((a, b) => {
			const dateA = contentDateValue(a.updated ?? a.date);
			const dateB = contentDateValue(b.updated ?? b.date);
			return dateB - dateA;
		});

	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<CollectionStructuredData
				name="BANGEO 技術記事一覧"
				path="/tech-articles"
				description="WebXRに関する技術記事、ニュース、イベント情報をまとめています。"
				breadcrumbs={[{ name: "技術記事", path: "/tech-articles" }]}
				items={posts.map((post) => {
					const slug = getSlugFromPath(post.info.path);
					return {
						name: post.title,
						path: `/tech-articles/${slug}`,
						description: post.description,
						image: post.thumbnail ? String(post.thumbnail) : NO_IMAGE,
						datePublished: post.date ? String(post.date) : undefined,
						dateModified: post.updated
							? String(post.updated)
							: post.date
								? String(post.date)
								: undefined,
					};
				})}
			/>
			<PageHeader
				kicker={posts.length > 0 ? `全${posts.length}本` : undefined}
				title="WebXR技術記事・ニュース"
				lead="ブラウザやライブラリのニュース、実装の技術解説、実機で試すガイドを新しい順に並べています。"
				actions={
					<Link
						href="/tech-articles/categories"
						className="text-link inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-bold"
					>
						カテゴリ一覧を見る
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

			{posts.length > 0 ? (
				<ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
					{posts.map((post, index) => {
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
									headingLevel="h2"
									priority={index === 0}
								/>
							</li>
						);
					})}
				</ul>
			) : (
				<div>
					<p className="text-base leading-[1.8] text-gray-700">
						公開している技術記事はまだありません。
					</p>
					<Link
						href="/report"
						className="text-link mt-2 inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold"
					>
						この端末のレポートを見る
					</Link>
				</div>
			)}
		</div>
	);
}
