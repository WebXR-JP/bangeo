import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { contentDateValue } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

export const metadata: Metadata = {
	title: "WebXR技術記事のカテゴリ一覧",
	description:
		"BANGEOの技術記事をNEWS、TECH、GUIDE、チュートリアルなどのカテゴリ別に一覧できます。",
	alternates: { canonical: "/tech-articles/categories" },
};

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
		const category = post.category ? String(post.category) : "未分類";
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
		<div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<BreadcrumbStructuredData
				items={[
					{ name: "技術記事", path: "/tech-articles" },
					{ name: "カテゴリ", path: "/tech-articles/categories" },
				]}
			/>

			<header className="mb-10">
				<p className="mb-3 text-xs font-black tracking-[0.28em] text-rose-600">
					CATEGORIES
				</p>
				<h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
					技術記事のカテゴリ一覧
				</h1>
				<p className="mt-3 text-sm leading-relaxed text-gray-500">
					BANGEOの技術記事を、{sortedCategories.length}
					種類のカテゴリ別にまとめています。
				</p>
			</header>

			<nav
				aria-label="カテゴリ"
				className="mb-10 flex flex-wrap gap-2 border-b border-gray-100 pb-6"
			>
				{sortedCategories.map(([category, categoryPosts], index) => (
					<a
						key={category}
						href={`#category-${index}`}
						className="inline-flex min-h-9 items-center gap-2 rounded-full border border-gray-100 bg-white px-4 py-1.5 text-sm font-bold text-gray-700 transition-colors hover:border-rose-200 hover:text-[#e11d48]"
					>
						{category}
						<span className="text-xs font-black text-gray-400">
							{categoryPosts.length}
						</span>
					</a>
				))}
			</nav>

			<div className="space-y-12">
				{sortedCategories.map(([category, categoryPosts], index) => (
					<section
						key={category}
						id={`category-${index}`}
						className="scroll-mt-28"
					>
						<div className="mb-4 flex items-baseline justify-between gap-4">
							<h2 className="text-2xl font-black tracking-tight text-gray-950">
								{category}
							</h2>
							<span className="text-sm font-bold text-gray-400">
								{categoryPosts.length} 件
							</span>
						</div>
						<div className="divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
							{categoryPosts.map((post) => {
								const slug = getSlugFromPath(post.info.path);
								return (
									<Link
										key={slug}
										href={`/tech-articles/${slug}`}
										className="group block px-5 py-4 transition-colors hover:bg-rose-50/40"
									>
										<div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
											<h3 className="text-base font-black leading-snug text-gray-950 transition-colors group-hover:text-[#e11d48]">
												{post.title}
											</h3>
											{post.date && (
												<time className="shrink-0 text-xs font-medium text-gray-400">
													{String(post.date)}
												</time>
											)}
										</div>
										{post.description && (
											<p className="mt-1 line-clamp-2 text-sm leading-relaxed text-gray-500">
												{post.description}
											</p>
										)}
									</Link>
								);
							})}
						</div>
					</section>
				))}
			</div>

			<footer className="mt-12 border-t border-gray-100 pt-6">
				<Link
					href="/tech-articles"
					className="text-sm font-bold text-gray-600 transition-colors hover:text-[#e11d48]"
				>
					← 技術記事一覧に戻る
				</Link>
			</footer>
		</div>
	);
}
