import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { OptimizedImage } from "@/components/optimized-image";
import { contentDateTime, contentDateValue } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { CARD_IMAGE_SIZES, NO_IMAGE } from "@/lib/image-defaults";

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
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<CollectionStructuredData
				name="BANGEO 技術記事一覧"
				path="/tech-articles"
				description="WebXR に関する技術記事、ニュース、イベント情報をまとめています。"
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
			<header className="mb-12">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-2">
					WebXR技術記事・ニュース
				</h1>
				<p className="text-base text-gray-500">
					WebXRの仕様更新、ブラウザ対応、Meta Quest・iOS
					Safari・WebGPUの実装ノウハウ、イベント情報を日本語で整理しています
				</p>
			</header>

			<div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
				{posts.map((post) => {
					const slug = getSlugFromPath(post.info.path);
					const tags = post.tags as string[] | undefined;
					return (
						<Link
							key={slug}
							href={`/tech-articles/${slug}`}
							className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300"
						>
							<div className="aspect-video bg-gray-100 overflow-hidden relative">
								<OptimizedImage
									src={post.thumbnail ? String(post.thumbnail) : NO_IMAGE}
									alt={post.title}
									fill
									sizes={CARD_IMAGE_SIZES}
									className="object-cover group-hover:scale-105 transition-transform duration-500"
								/>
							</div>
							<div className="p-6">
								<div className="flex items-center gap-2 mb-4">
									{post.category && (
										<span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-wide">
											{String(post.category)}
										</span>
									)}
									{post.date && (
										<time
											dateTime={contentDateTime(
												post.date ? String(post.date) : undefined,
											)}
											className="text-xs text-gray-500 font-medium"
										>
											{String(post.date)}
										</time>
									)}
								</div>
								<h2 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2 leading-snug">
									{post.title}
								</h2>
								{post.description && (
									<p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
										{post.description}
									</p>
								)}
								{tags && tags.length > 0 && (
									<div className="flex flex-wrap gap-1.5">
										{tags.slice(0, 3).map((tag) => (
											<span
												key={tag}
												className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs font-medium"
											>
												#{tag}
											</span>
										))}
										{tags.length > 3 && (
											<span className="text-xs text-gray-500">
												+{tags.length - 3}
											</span>
										)}
									</div>
								)}
							</div>
						</Link>
					);
				})}
			</div>

			{posts.length === 0 && (
				<div className="py-12 text-center">
					<p className="text-gray-500">まだブログ記事がありません。</p>
				</div>
			)}
		</div>
	);
}
