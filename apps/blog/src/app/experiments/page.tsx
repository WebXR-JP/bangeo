import { experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { OptimizedImage } from "@/components/optimized-image";
import { contentDateTime, contentDateValue } from "@/lib/content-dates";
import {
	getExperimentGuide,
	readinessClassName,
	readinessLabel,
} from "@/lib/experiment-guides";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { CARD_IMAGE_SIZES } from "@/lib/image-defaults";

export const metadata: Metadata = {
	title: "WebXRデモ一覧｜Meta Quest・PICOで試すVR/AR Lab",
	description:
		"Meta Quest・PICO・PCブラウザで試せるWebXRデモ一覧。端末別の試し方、失敗時の見方、VR/AR/MRデモの体験フローを整理しています。",
	openGraph: {
		title: "WebXRデモ一覧｜Meta Quest・PICOで試すVR/AR Lab",
		description:
			"Meta Quest・PICO・PCブラウザで試せるWebXRデモ一覧。端末別の試し方、失敗時の見方、VR/AR/MRデモの体験フローを整理しています。",
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
	const featuredExperiments = allExperiments
		.map((exp) => {
			const slug = getSlugFromPath(exp.info.path);
			return { exp, slug, guide: getExperimentGuide(slug) };
		})
		.filter((item) => item.guide?.featuredOrder)
		.sort(
			(a, b) =>
				(a.guide?.featuredOrder ?? 999) - (b.guide?.featuredOrder ?? 999),
		);

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<CollectionStructuredData
				name="BANGEO WebXRデモ一覧"
				path="/experiments"
				description="Meta Quest、PICO、Android、PCブラウザで試せるWebXRデモ一覧。"
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

			<header className="mb-10">
				<p className="mb-3 text-xs font-black tracking-[0.26em] text-rose-600 uppercase">
					Quest / PICO First
				</p>
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-3 md:text-4xl">
					WebXRデモ一覧
				</h1>
				<p className="text-base text-gray-500 leading-relaxed max-w-3xl">
					VR/AR/MRをブラウザで試せるWebXRデモをまとめています。新しいMeta QuestやPICOで、まず「VRに入れるか」「入力できるか」「fallbackが見えるか」を確認し、その後にMRやARのLabへ進める流れに整理しました。
				</p>
			</header>

			{featuredExperiments.length > 0 && (
				<section className="mb-12 overflow-hidden rounded-[2rem] border border-rose-100 bg-gradient-to-br from-gray-950 via-gray-900 to-rose-950 text-white shadow-2xl shadow-rose-100">
					<div className="grid gap-0 lg:grid-cols-[0.9fr_1.4fr]">
						<div className="border-b border-white/10 p-6 md:p-8 lg:border-r lg:border-b-0">
							<p className="text-xs font-black tracking-[0.24em] text-rose-200 uppercase">
								Recommended Flow
							</p>
							<h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
								新しいVRデバイスで試す順番
							</h2>
							<p className="mt-4 text-sm leading-relaxed text-gray-300">
								最初から尖ったMR機能に行かず、VR入室、入力、描画fallback、境界確認の順に見ると、Meta QuestとPICOの差分を安全に切り分けられます。
							</p>
						</div>
						<div className="grid gap-3 p-4 md:grid-cols-2 md:p-6">
							{featuredExperiments.map(({ exp, slug, guide }, index) => (
								<Link
									key={slug}
									href={`/experiments/${slug}`}
									className="group rounded-2xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/20"
								>
									<div className="mb-3 flex items-center justify-between gap-3">
										<span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-gray-950">
											{index + 1}
										</span>
										{guide && (
											<span
												className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${readinessClassName[guide.statusReadiness]}`}
											>
												{readinessLabel[guide.statusReadiness]}
											</span>
										)}
									</div>
									<h3 className="line-clamp-2 text-sm font-black leading-snug text-white group-hover:text-rose-100">
										{exp.title}
									</h3>
									{guide && (
										<p className="mt-2 text-xs font-bold text-rose-100">
											{guide.primaryDevice}
										</p>
									)}
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			{allExperiments.length > 0 ? (
				<div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
					{allExperiments.map((exp) => {
						const slug = getSlugFromPath(exp.info.path);
						const difficulty = String(exp.difficulty || "");
						const guide = getExperimentGuide(slug);
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
										{guide && (
											<span
												className={`absolute top-4 right-4 rounded-full border px-2.5 py-1 text-[10px] font-black shadow-sm ${readinessClassName[guide.statusReadiness]}`}
											>
												{readinessLabel[guide.statusReadiness]}
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
										{exp.category && (
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
									{guide && (
										<div className="mb-3 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2">
											<p className="text-[11px] font-black tracking-[0.12em] text-gray-400 uppercase">
												推奨端末
											</p>
											<p className="mt-0.5 text-xs font-bold text-gray-700">
												{guide.primaryDevice}
											</p>
										</div>
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
				</section>
			)}
		</div>
	);
}
