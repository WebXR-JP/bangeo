import { experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { WebXRChecker } from "@/app/devices/submit/webxr-checker";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { OptimizedImage } from "@/components/optimized-image";
import { contentDateTime, contentDateValue } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { CARD_IMAGE_SIZES } from "@/lib/image-defaults";

export const metadata: Metadata = {
	title: "WebXRデモ一覧｜VR・ARをブラウザで試す",
	description:
		"Meta Quest 3・Android Chrome・PCブラウザで試せるWebXRデモ一覧。immersive-vr / immersive-ar、Hit Test、Hand Input、Depth Occlusion、WebGPU、8th Wall、IWSDKの実験を日本語で整理しています。",
	openGraph: {
		title: "WebXRデモ一覧｜VR・ARをブラウザで試す",
		description:
			"Meta Quest 3・Android Chrome・PCブラウザで試せるWebXRデモ一覧。immersive-vr / immersive-ar、Hit Test、Hand Input、Depth Occlusion、WebGPU、8th Wall、IWSDKの実験を日本語で整理しています。",
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
	const allExperiments = getDocs(experiments)
		.filter((exp) => !exp.draft)
		.sort((a, b) => {
			const dateA = contentDateValue(a.updated ?? a.date);
			const dateB = contentDateValue(b.updated ?? b.date);
			return dateB - dateA;
		});
	const hasExperiments = allExperiments.length > 0;

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<CollectionStructuredData
				name="BANGEO WebXRデモ一覧"
				path="/experiments"
				description="Meta Quest、Android、PCブラウザで試せるWebXRデモ一覧。"
				breadcrumbs={[{ name: "デモ", path: "/experiments" }]}
				items={allExperiments.map((exp) => {
					const slug = getSlugFromPath(exp.info.path);
					return {
						name: exp.title,
						path: `/experiments/${slug}`,
						description: exp.description,
						image: exp.thumbnail ? String(exp.thumbnail) : undefined,
						datePublished: exp.date ? String(exp.date) : undefined,
						dateModified: exp.updated
							? String(exp.updated)
							: exp.date
								? String(exp.date)
								: undefined,
					};
				})}
			/>
			<header className="mb-12">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-2">
					WebXRデモ一覧
				</h1>
				<p className="text-base text-gray-500 leading-relaxed max-w-3xl">
					VR/AR/MRをブラウザで試せるWebXRデモをまとめています。Meta
					Questでのimmersive-vr /
					immersive-ar、スマートフォン向けAR、WebGPUやDepth
					Occlusionの検証など、実装前に挙動を確認するためのサンプル集です。
				</p>
				<div className="mt-5 flex flex-wrap gap-2">
					{["WebXR AR", "WebXR VR", "Meta Quest", "WebGPU", "MR"].map(
						(label) => (
							<span
								key={label}
								className="rounded-full bg-gray-100 px-3 py-1 text-xs font-bold text-gray-600"
							>
								{label}
							</span>
						),
					)}
				</div>
			</header>

			<section className="mb-12">
				<WebXRChecker />
			</section>

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
										{exp.date && (
											<time
												dateTime={contentDateTime(
													exp.date ? String(exp.date) : undefined,
												)}
											>
												{String(exp.date)}
											</time>
										)}
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
