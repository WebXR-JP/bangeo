import { blog } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

export const metadata: Metadata = {
	title: "ブログ",
	description:
		"WebXR に関する技術記事、ニュース、イベント情報をまとめています。",
	openGraph: {
		title: "ブログ",
		description:
			"WebXR に関する技術記事、ニュース、イベント情報をまとめています。",
		type: "website",
	},
	alternates: { canonical: "/tech-articles" },
};

export default function TechArticlesIndexPage() {
	const posts = getDocs(blog).sort((a, b) => {
		const parseDate = (d: string) => {
			const m = d.match(/(\d+)年(\d+)月(\d+)日/);
			return m ? new Date(+m[1], +m[2] - 1, +m[3]).getTime() : 0;
		};
		return parseDate(String(b.date || "")) - parseDate(String(a.date || ""));
	});

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<header className="mb-12">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-2">
					ブログ
				</h1>
				<p className="text-base text-gray-500">
					WebXR に関する技術記事、ニュース、イベント情報をまとめています
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
							<div className="aspect-video bg-gray-100 overflow-hidden">
								<img
									src={
										post.thumbnail ? String(post.thumbnail) : "/no-image.png"
									}
									alt={post.title}
									className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
								/>
							</div>
							<div className="p-6">
								<div className="flex items-center gap-2 mb-4">
									{post.category && (
										<span className="px-2.5 py-1 bg-rose-50 text-[#e11d48] rounded-md text-[10px] font-black uppercase tracking-wide">
											{String(post.category)}
										</span>
									)}
									{post.date && (
										<time className="text-xs text-gray-400 font-medium">
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
											<span className="text-xs text-gray-400">
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
