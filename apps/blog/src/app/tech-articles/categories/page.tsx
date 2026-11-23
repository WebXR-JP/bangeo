import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import {
	articleCategoryLabel,
	articleListDate,
} from "@/components/article-card";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { contentDateTime, contentDateValue } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

export const metadata: Metadata = {
	title: "WebXR技術記事のカテゴリ一覧",
	description:
		"BANGEOの技術記事をNEWS、TECH、GUIDE、チュートリアルなどのカテゴリ別に一覧できます。",
	alternates: { canonical: "/tech-articles/categories" },
};

const UNCATEGORIZED = "未分類";

/**
 * カテゴリごとに、どんな記事が入っているか（フロントマターの値で引く）。
 * 公開中の記事の中身から書いている。表にないカテゴリは説明を出さない
 */
const CATEGORY_DESCRIPTIONS = new Map<string, string>([
	[
		"NEWS",
		"ブラウザやライブラリの更新、デバイスやイベントを取り上げる記事です。",
	],
	["TECH", "仕様や実装の仕組みを掘り下げる記事です。"],
	["GUIDE", "手元の環境で実際に試す手順をまとめた記事です。"],
	["チュートリアル", "デモを作りながら学ぶ記事です。"],
]);

export default function TechArticleCategoriesPage() {
	const posts = getDocs(blog)
		.filter((post) => !post.draft)
		.sort((a, b) => {
			const dateA = contentDateValue(a.updated ?? a.date);
			const dateB = contentDateValue(b.updated ?? b.date);
			return dateB - dateA;
		});

	const categories = new Map<string, (typeof posts)[number][]>();
	for (const post of posts) {
		const category = post.category ? String(post.category) : UNCATEGORIZED;
		const group = categories.get(category);
		if (group) {
			group.push(post);
		} else {
			categories.set(category, [post]);
		}
	}

	const sortedCategories = [...categories.entries()].sort((a, b) => {
		if (a[1].length !== b[1].length) return b[1].length - a[1].length;
		return a[0].localeCompare(b[0], "ja");
	});

	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[
					{ name: "技術記事", path: "/tech-articles" },
					{ name: "カテゴリ", path: "/tech-articles/categories" },
				]}
			/>

			<PageHeader
				title="技術記事のカテゴリ一覧"
				lead={
					posts.length > 0
						? `技術記事${posts.length}本を${sortedCategories.length}つのカテゴリに分け、それぞれ新しい順に並べています。`
						: undefined
				}
				className="mb-6"
			/>

			{sortedCategories.length > 0 ? (
				<nav aria-label="カテゴリ" className="mb-12 md:mb-16">
					<ul className="flex flex-wrap gap-2">
						{sortedCategories.map(([category, categoryPosts], index) => (
							<li key={category}>
								<a
									href={`#category-${index}`}
									className="btn btn-secondary px-4"
								>
									{category === UNCATEGORIZED
										? category
										: articleCategoryLabel(category)}
									<span className="font-medium tabular-nums text-gray-500">
										{categoryPosts.length}
										<span className="sr-only">本</span>
									</span>
								</a>
							</li>
						))}
					</ul>
				</nav>
			) : null}

			{sortedCategories.length > 0 ? (
				<div className="space-y-16 md:space-y-24">
					{sortedCategories.map(([category, categoryPosts], index) => {
						const label =
							category === UNCATEGORIZED
								? category
								: articleCategoryLabel(category);
						const description = CATEGORY_DESCRIPTIONS.get(
							category.trim().toUpperCase(),
						);
						return (
							<section
								key={category}
								id={`category-${index}`}
								aria-labelledby={`category-${index}-heading`}
								className="scroll-mt-24 md:scroll-mt-32 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12"
							>
								{/* PCでは見出しを左に置き、行を読み進めるあいだ見えるようにする */}
								<div className="mb-4 lg:sticky lg:top-32 lg:mb-0 lg:self-start">
									<h2
										id={`category-${index}-heading`}
										className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
									>
										{label}
									</h2>
									<p className="mt-1 text-[13px] leading-[1.6] text-gray-500 tabular-nums">
										{categoryPosts.length}本
									</p>
									{description ? (
										<p className="mt-2 max-w-[40em] break-phrase text-sm leading-[1.7] text-gray-600">
											{description}
										</p>
									) : null}
								</div>
								<ul className="card divide-y divide-gray-100 overflow-hidden">
									{categoryPosts.map((post) => {
										const slug = getSlugFromPath(post.info.path);
										const date = articleListDate(
											post.date ? String(post.date) : undefined,
											post.updated ? String(post.updated) : undefined,
										);
										return (
											<li key={slug}>
												<Link
													href={`/tech-articles/${slug}`}
													prefetch={false}
													className="group block px-5 py-4 transition-colors hover:bg-gray-50 focus-visible:-outline-offset-2 md:px-6 md:py-5"
												>
													{date.text ? (
														<p className="mb-1 text-[13px] leading-[1.6] text-gray-500">
															<time dateTime={contentDateTime(date.value)}>
																{date.text}
															</time>
															{date.isRevised ? "更新" : null}
														</p>
													) : null}
													<h3 className="text-base font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700 md:text-lg">
														{post.title}
													</h3>
													{post.description ? (
														<p className="mt-1.5 line-clamp-2 max-w-[40em] break-phrase text-sm leading-[1.7] text-gray-600">
															{post.description}
														</p>
													) : null}
												</Link>
											</li>
										);
									})}
								</ul>
							</section>
						);
					})}
				</div>
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

			<p className="mt-12 md:mt-16">
				<Link
					href="/tech-articles"
					className="text-link inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold"
				>
					技術記事の一覧を見る
				</Link>
			</p>
		</div>
	);
}
