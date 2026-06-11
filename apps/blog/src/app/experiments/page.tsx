import { experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { OptimizedImage } from "@/components/optimized-image";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { CARD_IMAGE_SIZES } from "@/lib/image-defaults";

export const metadata: Metadata = {
	title: "デモ",
	description: "公開中の WebXR デモを一覧で確認できるページです。",
	openGraph: {
		title: "WebXR デモ",
		description: "公開中の WebXR デモを一覧で確認できるページです。",
		type: "website",
	},
	alternates: { canonical: "/experiments" },
};

const difficultyLabel: Record<string, string> = {
	beginner: "初級",
	intermediate: "中級",
	advanced: "上級",
};

export default function ExperimentsIndexPage() {
	const allExperiments = getDocs(experiments).sort((a, b) => {
		const dateA = new Date(String(a.date || ""));
		const dateB = new Date(String(b.date || ""));
		return dateB.getTime() - dateA.getTime();
	});
	const hasExperiments = allExperiments.length > 0;

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<header className="mb-12">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-2">
					WebXR デモ
				</h1>
				<p className="text-base text-gray-500">
					公開できる状態になったデモから順次追加しています
				</p>
			</header>

			{hasExperiments ? (
				<div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
					{allExperiments.map((exp) => {
						const slug = getSlugFromPath(exp.info.path);
						const difficulty = String(exp.difficulty || "");
						return (
							<Link
								key={slug}
								href={`/experiments/${slug}`}
								className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300"
							>
								{exp.thumbnail ? (
									<div className="aspect-video bg-gray-100 relative overflow-hidden">
										<OptimizedImage
											src={String(exp.thumbnail)}
											alt={exp.title}
											fill
											sizes={CARD_IMAGE_SIZES}
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>
										{exp.category && (
											<span className="absolute top-4 left-4 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[10px] font-black text-rose-700 rounded-md uppercase tracking-wide">
												{String(exp.category)}
											</span>
										)}
									</div>
								) : (
									<div className="aspect-video bg-gray-50 flex items-center justify-center">
										<span className="text-4xl text-gray-200">&#x1f9ea;</span>
									</div>
								)}
								<div className="p-6">
									<div className="flex items-center gap-2 mb-3">
										{!exp.thumbnail && exp.category && (
											<span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-wide">
												{String(exp.category)}
											</span>
										)}
										{difficulty && (
											<span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold">
												{difficultyLabel[difficulty] || difficulty}
											</span>
										)}
									</div>
									<h2 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2 leading-snug">
										{exp.title}
									</h2>
									{exp.description && (
										<p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
											{exp.description}
										</p>
									)}
									<div className="flex items-center justify-between text-xs text-gray-500 font-medium">
										{exp.date && <time>{String(exp.date)}</time>}
										{exp.estimatedTime && (
											<span>約{String(exp.estimatedTime)}分</span>
										)}
									</div>
								</div>
							</Link>
						);
					})}
				</div>
			) : (
				<section className="rounded-[2rem] border border-dashed border-rose-200 bg-rose-50/50 px-8 py-16 text-center">
					<p className="text-xs font-black tracking-[0.3em] text-rose-500">
						準備中
					</p>
					<h2 className="mt-4 text-2xl font-black tracking-tight text-gray-950">
						公開中のデモはまだありません
					</h2>
					<p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-gray-500">
						このセクションは一度整理し直しています。内容が固まったデモだけを 1
						件ずつ追加し、準備が整ったものから順次公開しています。
					</p>
				</section>
			)}
		</div>
	);
}
