import { experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { OptimizedImage } from "@/components/optimized-image";
import { contentDateValue } from "@/lib/content-dates";
import {
	type ExperimentGuide,
	getExperimentGuideOrDefault,
	readinessClassName,
	readinessLabel,
	trackDescription,
	trackLabel,
	trackOrder,
} from "@/lib/experiment-guides";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { CARD_IMAGE_SIZES } from "@/lib/image-defaults";

export const metadata: Metadata = {
	title: "WebXRデモ一覧｜Meta Quest・PICOで試すVR/AR Lab",
	description:
		"Meta Quest・PICO・PCブラウザで試せるWebXRデモ一覧。全デモに事前対応判定つき。端末別の対応状況、体験フロー、失敗時の見方を整理しています。",
	openGraph: {
		title: "WebXRデモ一覧｜Meta Quest・PICOで試すVR/AR Lab",
		description:
			"Meta Quest・PICO・PCブラウザで試せるWebXRデモ一覧。全デモに事前対応判定つき。端末別の対応状況、体験フロー、失敗時の見方を整理しています。",
		type: "website",
	},
	alternates: { canonical: "/experiments" },
};

const difficultyLabel: Record<string, string> = {
	beginner: "初級",
	intermediate: "中級",
	advanced: "上級",
};

interface ExperimentEntry {
	// biome-ignore lint/suspicious/noExplicitAny: fumadocs doc type
	exp: any;
	slug: string;
	guide: ExperimentGuide;
}

function ExperimentCard({ exp, slug, guide }: ExperimentEntry) {
	const difficulty = String(exp.difficulty || "");
	return (
		<div className="group relative flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300">
			<Link
				href={`/experiments/${slug}`}
				className="absolute inset-0 z-10"
				aria-label={exp.title}
			/>
			{exp.thumbnail ? (
				<div className="aspect-video bg-gray-100 relative overflow-hidden">
					<OptimizedImage
						src={String(exp.thumbnail)}
						alt={exp.title}
						fill
						sizes={CARD_IMAGE_SIZES}
						className="object-cover group-hover:scale-105 transition-transform duration-500"
					/>
					<span
						className={`absolute top-4 right-4 rounded-full border px-2.5 py-1 text-[10px] font-black shadow-sm ${readinessClassName[guide.statusReadiness]}`}
					>
						{readinessLabel[guide.statusReadiness]}
					</span>
				</div>
			) : (
				<div className="aspect-video bg-gray-50 flex items-center justify-center relative">
					<span className="text-4xl text-gray-200">&#x1f9ea;</span>
					<span
						className={`absolute top-4 right-4 rounded-full border px-2.5 py-1 text-[10px] font-black shadow-sm ${readinessClassName[guide.statusReadiness]}`}
					>
						{readinessLabel[guide.statusReadiness]}
					</span>
				</div>
			)}
			<div className="flex flex-1 flex-col p-6">
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
					{exp.estimatedTime && (
						<span className="ml-auto text-[11px] text-gray-400 font-medium">
							約{String(exp.estimatedTime)}分
						</span>
					)}
				</div>
				<h3 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-1.5 leading-snug">
					{exp.title}
				</h3>
				<p className="text-sm font-bold text-gray-700 mb-2 leading-relaxed">
					{guide.summary}
				</p>
				{exp.description && (
					<p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
						{exp.description}
					</p>
				)}
				<div className="mt-auto">
					<p className="mb-1.5 text-[10px] font-black tracking-[0.14em] text-gray-400 uppercase">
						端末別の対応
					</p>
					<div className="flex flex-wrap gap-1.5 mb-4">
						{guide.deviceChecks.map((check) => (
							<span
								key={`${slug}-${check.label}`}
								className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${readinessClassName[check.readiness]}`}
								title={check.note}
							>
								{check.label}
								<span className="opacity-70">
									{readinessLabel[check.readiness]}
								</span>
							</span>
						))}
					</div>
					<div className="flex items-center gap-2">
						<span className="inline-flex items-center rounded-full bg-gray-950 px-4 py-2 text-xs font-black text-white group-hover:bg-[#e11d48] transition-colors">
							体験ガイドを見る
						</span>
						{guide.launchHref && (
							<a
								href={guide.launchHref}
								className="relative z-20 inline-flex items-center rounded-full border border-gray-200 px-4 py-2 text-xs font-black text-gray-700 hover:border-rose-300 hover:text-[#e11d48] transition-colors"
							>
								デモを直接開く ↗
							</a>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

export default function ExperimentsIndexPage() {
	const allExperiments = getDocs(experiments)
		.filter((exp) => !exp.draft)
		.sort((a, b) => {
			const dateA = contentDateValue(a.updated ?? a.date);
			const dateB = contentDateValue(b.updated ?? b.date);
			return dateB - dateA;
		})
		.map((exp): ExperimentEntry => {
			const slug = getSlugFromPath(exp.info.path);
			const devices = exp.devices as string[] | undefined;
			return {
				exp,
				slug,
				guide: getExperimentGuideOrDefault(slug, {
					href: exp.link ? String(exp.link) : undefined,
					devices,
				}),
			};
		});

	const featuredExperiments = allExperiments
		.filter((item) => item.guide.featuredOrder)
		.sort(
			(a, b) => (a.guide.featuredOrder ?? 999) - (b.guide.featuredOrder ?? 999),
		);

	const byTrack = trackOrder
		.map((track) => ({
			track,
			items: allExperiments.filter((item) => item.guide.track === track),
		}))
		.filter((section) => section.items.length > 0);

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<CollectionStructuredData
				name="BANGEO WebXRデモ一覧"
				path="/experiments"
				description="Meta Quest、PICO、Android、PCブラウザで試せるWebXRデモ一覧。"
				breadcrumbs={[{ name: "デモ", path: "/experiments" }]}
				items={allExperiments.map(({ exp, slug }) => ({
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
				}))}
			/>

			<header className="mb-10">
				<p className="mb-3 text-xs font-black tracking-[0.26em] text-rose-600 uppercase">
					Quest / PICO First
				</p>
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-3 md:text-4xl">
					WebXRデモ一覧
				</h1>
				<p className="text-base text-gray-500 leading-relaxed max-w-3xl">
					VR/AR/MRをブラウザで試せるWebXRデモをまとめています。すべてのデモに「対応端末かどうかをImmersiveセッションに入る前に判定するパネル」があり、非対応の環境では理由が表示されて停止します。サイレントに失敗するデモはありません。
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
								最初から尖ったMR機能に行かず、VR入室 → 音と入力 → 描画fallback →
								境界確認の順に見ると、Meta
								QuestとPICOの差分を安全に切り分けられます。
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
										<span
											className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${readinessClassName[guide.statusReadiness]}`}
										>
											{readinessLabel[guide.statusReadiness]}
										</span>
									</div>
									<h3 className="line-clamp-2 text-sm font-black leading-snug text-white group-hover:text-rose-100">
										{exp.title}
									</h3>
									<p className="mt-2 text-xs leading-relaxed text-gray-300">
										{guide.summary}
									</p>
									<p className="mt-2 text-xs font-bold text-rose-100">
										{guide.primaryDevice}
									</p>
								</Link>
							))}
						</div>
					</div>
				</section>
			)}

			<section className="mb-12 rounded-2xl border border-gray-100 bg-gray-50/60 p-5 md:p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
						<h2 className="text-sm font-black text-gray-950 mb-2">
							バッジの見方
						</h2>
						<div className="flex flex-wrap gap-2">
							{(
								[
									["ready", "実機で動作確認済み"],
									["lab", "実機検証用のLab（結果の記録が目的）"],
									["preview", "非XR環境でもプレビュー可"],
									["limited", "対応端末・条件が限定される"],
									["unknown", "実機での確認待ち"],
									["unsupported", "その端末では非対応"],
								] as const
							).map(([key, desc]) => (
								<span
									key={key}
									className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold ${readinessClassName[key]}`}
								>
									{readinessLabel[key]}
									<span className="font-medium opacity-80">— {desc}</span>
								</span>
							))}
						</div>
					</div>
					<div className="flex shrink-0 flex-col gap-2 text-xs font-bold">
						<Link
							href="/devices"
							className="rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700 transition hover:border-rose-200 hover:text-[#e11d48]"
						>
							対応デバイス一覧 →
						</Link>
						<Link
							href="/webxr-status"
							className="rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700 transition hover:border-rose-200 hover:text-[#e11d48]"
						>
							ブラウザ対応状況 →
						</Link>
					</div>
				</div>
			</section>

			{byTrack.length > 0 ? (
				<div className="space-y-14">
					{byTrack.map(({ track, items }, sectionIndex) => (
						<section key={track}>
							<div className="mb-6">
								<p className="mb-1 text-[11px] font-black tracking-[0.22em] text-rose-600 uppercase">
									Track {sectionIndex + 1}
								</p>
								<h2 className="text-2xl font-black tracking-tight text-gray-950 mb-2">
									{trackLabel[track]}
								</h2>
								<p className="max-w-3xl text-sm leading-relaxed text-gray-500">
									{trackDescription[track]}
								</p>
							</div>
							<div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
								{items.map((item) => (
									<ExperimentCard key={item.slug} {...item} />
								))}
							</div>
						</section>
					))}
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
