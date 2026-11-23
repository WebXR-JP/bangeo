import { blog, experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { getDocs } from "@/lib/fumadocs-utils";

export const metadata: Metadata = {
	title: "WebXRタグ一覧｜トピック別に記事・デモを探す",
	description:
		"WebXR、VR、AR、Meta Quest、iPhone、WebGPU、Three.js、PlayCanvas、IWSDK、8th Wallなどのタグから、BANGEOの技術記事・デモをトピック別に探せます。",
	robots: { index: false, follow: true },
	alternates: { canonical: "/tags" },
};

export default function TagsPage() {
	const publishedPosts = getDocs(blog).filter((doc) => !doc.draft);
	const publishedDemos = getDocs(experiments).filter((doc) => !doc.draft);
	const allDocs = [...publishedPosts, ...publishedDemos];

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

	// タグが付いている中身を、実際にあるものだけで言う（いまデモにタグはない）。
	// 記事だけなら数は「本」、デモも含むなら「件」で数える
	const demoHasTags = publishedDemos.some(
		(doc) => Array.isArray(doc.tags) && doc.tags.length > 0,
	);
	const lead = demoHasTags
		? `技術記事とデモに付いているタグ${sortedTags.length}件を、付いている数の多い順に並べています。タグの横の数字が、その件数です。`
		: `技術記事に付いているタグ${sortedTags.length}件を、付いている本数の多い順に並べています。タグの横の数字が、その本数です。`;
	const countUnit = demoHasTags ? "件" : "本";

	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<BreadcrumbStructuredData items={[{ name: "タグ一覧", path: "/tags" }]} />
			<PageHeader
				title="タグ一覧"
				lead={sortedTags.length > 0 ? lead : undefined}
				className="mb-8 md:mb-10"
			/>

			{sortedTags.length === 0 ? (
				<div>
					<p className="text-base leading-[1.8] text-gray-700">
						タグの付いた技術記事はまだありません。
					</p>
					<Link
						href="/tech-articles"
						className="text-link mt-2 inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold"
					>
						技術記事の一覧を見る
					</Link>
				</div>
			) : (
				<ul className="flex flex-wrap gap-x-2">
					{sortedTags.map(({ tag, count }) => (
						<li key={tag}>
							{/* 押せる範囲は高さ 44px（PCは 40px）、見た目はチップ。輪はチップに出す */}
							<Link
								href={`/tags/${encodeURIComponent(tag)}`}
								prefetch={false}
								className="group inline-flex min-h-11 items-center rounded-full focus-visible:outline-none md:min-h-10"
							>
								<span className="chip min-h-8 gap-1.5 px-3 text-[13px] transition-colors group-hover:bg-gray-200 group-hover:text-gray-950 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary-600">
									{tag}
									{/* チップの灰の地の上でも 4.5:1 を超える濃さ（gray-600） */}
									<span className="font-medium tabular-nums text-gray-600">
										{count}
										<span className="sr-only">{countUnit}</span>
									</span>
								</span>
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
