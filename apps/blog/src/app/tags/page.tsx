import { blog, experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { getDocs } from "@/lib/fumadocs-utils";

export const metadata: Metadata = {
	title: "WebXRタグ一覧｜トピック別に記事・デモを探す",
	description:
		"WebXR、VR、AR、Meta Quest、iPhone、WebGPU、Three.js、PlayCanvas、IWSDK、8th Wallなどのタグから、BANGEOの技術記事・デモをトピック別に探せます。",
	alternates: { canonical: "/tags" },
};

export default function TagsPage() {
	const allDocs = [...getDocs(blog), ...getDocs(experiments)].filter(
		(doc) => !doc.draft,
	);

	const tagCounts = new Map<string, number>();
	for (const doc of allDocs) {
		if (doc.tags && Array.isArray(doc.tags)) {
			for (const tag of doc.tags) {
				tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
			}
		}
	}

	const sortedTags = Array.from(tagCounts.entries())
		.map(([tag, count]) => ({ tag, count }))
		.sort((a, b) => b.count - a.count);

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<BreadcrumbStructuredData items={[{ name: "タグ一覧", path: "/tags" }]} />
			<header className="mb-12">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-2">
					タグ一覧
				</h1>
				<p className="text-base text-gray-500">
					全 {sortedTags.length} 件のタグがあります
				</p>
			</header>

			{sortedTags.length === 0 ? (
				<p className="text-gray-500">タグが見つかりませんでした。</p>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
					{sortedTags.map(({ tag, count }) => (
						<Link
							key={tag}
							href={`/tags/${encodeURIComponent(tag)}`}
							className="group block p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300"
						>
							<div className="flex items-center justify-between">
								<h2 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors">
									{tag}
								</h2>
								<span className="inline-flex items-center justify-center w-8 h-8 text-xs font-black bg-rose-50 text-rose-700 rounded-full">
									{count}
								</span>
							</div>
							<p className="text-sm text-gray-500 mt-2">
								{count} 件のコンテンツ
							</p>
						</Link>
					))}
				</div>
			)}
		</div>
	);
}
