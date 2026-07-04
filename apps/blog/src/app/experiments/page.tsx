import { experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { OptimizedImage } from "@/components/optimized-image";
import {
	WebXRChecker,
	type WebXRCheckerDemoLinks,
} from "@/components/webxr-checker";
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
	title: "WebXRデモ実験室｜対応チェックとデモを1ページで試すDemo Hub",
	description:
		"Meta Quest・PICO・PCブラウザで、WebXR対応状況の診断と各VR/AR/MRデモへの起動を1ページにまとめた実験室。実機で開いて、その場で確認して試せます。",
	openGraph: {
		title: "WebXRデモ実験室｜対応チェックとデモを1ページで試すDemo Hub",
		description:
			"Meta Quest・PICO・PCブラウザで、WebXR対応状況の診断と各VR/AR/MRデモへの起動を1ページにまとめた実験室。実機で開いて、その場で確認して試せます。",
		type: "website",
	},
	alternates: { canonical: "/experiments" },
};

const SUPPORT_CHECK_HREF = "#webxr-device-check";

const difficultyLabel: Record<string, string> = {
	beginner: "初級",
	intermediate: "中級",
	advanced: "上級",
};

const experienceSteps = [
	{
		label: "01",
		title: "対応状況を先に見る",
		description:
			"WebXR対応デバイスでこのページを開いたら、ページ内の診断パネルでVR/ARセッションの可否とブラウザ機能を確認します。",
	},
	{
		label: "02",
		title: "横のデモから入る",
		description:
			"診断パネルもカードも「対応状況」と「デモ」を並べています。別ページを挟まず、その場で確認して試せます。",
	},
	{
		label: "03",
		title: "結果を切り分ける",
		description:
			"失敗時は端末・ブラウザ・XRモード・fallbackのどこで止まったかをページ内で見て、次の制作メモへつなげます。",
	},
] as const;

interface ExperimentEntry {
	// biome-ignore lint/suspicious/noExplicitAny: fumadocs doc type
	exp: any;
	slug: string;
	guide: ExperimentGuide;
}

function StatusDemoLinks({
	title,
	demoHref,
	compact = false,
}: {
	title: string;
	demoHref?: string;
	compact?: boolean;
}) {
	const shellClass = compact
		? "grid grid-cols-2 gap-2"
		: "grid grid-cols-2 gap-2 rounded-2xl bg-gray-50 p-1";
	const baseClass = compact
		? "inline-flex min-h-11 flex-col items-center justify-center rounded-2xl border px-3 py-2 text-center transition"
		: "inline-flex min-h-12 flex-col items-center justify-center rounded-xl border px-3 py-2 text-center transition";

	return (
		<div className={shellClass}>
			<a
				href={SUPPORT_CHECK_HREF}
				className={`${baseClass} border-gray-200 bg-white text-gray-800 hover:border-rose-200 hover:text-[#e11d48]`}
				aria-label={`対応状況を確認: ${title}`}
			>
				<span className="text-[10px] font-black tracking-[0.18em] text-gray-400 uppercase">
					対応状況
				</span>
				<span className="text-xs font-black">この端末</span>
			</a>
			{demoHref ? (
				<a
					href={demoHref}
					className={`${baseClass} border-gray-950 bg-gray-950 text-white hover:border-[#e11d48] hover:bg-[#e11d48]`}
					aria-label={`デモを開く: ${title}`}
				>
					<span className="text-[10px] font-black tracking-[0.18em] text-white/60 uppercase">
						デモ
					</span>
					<span className="text-xs font-black">開く ↗</span>
				</a>
			) : (
				<span
					className={`${baseClass} cursor-not-allowed border-dashed border-gray-200 bg-gray-100 text-gray-400`}
					aria-disabled="true"
				>
					<span className="text-[10px] font-black tracking-[0.18em] uppercase">
						デモ
					</span>
					<span className="text-xs font-black">準備中</span>
				</span>
			)}
		</div>
	);
}

function DeviceCheckPills({
	slug,
	guide,
}: {
	slug: string;
	guide: ExperimentGuide;
}) {
	return (
		<div className="flex flex-wrap gap-1.5">
			{guide.deviceChecks.map((check) => (
				<span
					key={`${slug}-${check.label}`}
					className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${readinessClassName[check.readiness]}`}
					title={check.note}
				>
					{check.label}
					<span className="opacity-70">{readinessLabel[check.readiness]}</span>
				</span>
			))}
		</div>
	);
}

function FeaturedLaunchRow({
	exp,
	guide,
	index,
}: ExperimentEntry & { index: number }) {
	return (
		<article className="rounded-3xl border border-white/10 bg-white/10 p-4 transition hover:bg-white/15">
			<div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_minmax(220px,0.42fr)] md:items-center">
				<div className="min-w-0">
					<div className="mb-3 flex flex-wrap items-center gap-2">
						<span className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-black text-gray-950">
							{index + 1}
						</span>
						<span
							className={`rounded-full border px-2 py-0.5 text-[10px] font-black ${readinessClassName[guide.statusReadiness]}`}
						>
							{readinessLabel[guide.statusReadiness]}
						</span>
						<span className="text-xs font-bold text-rose-100">
							{guide.primaryDevice}
						</span>
					</div>
					<h3 className="line-clamp-2 text-sm font-black leading-snug text-white">
						{exp.title}
					</h3>
					<p className="mt-2 text-xs leading-relaxed text-gray-300">
						{guide.summary}
					</p>
				</div>
				<StatusDemoLinks
					title={String(exp.title)}
					demoHref={guide.launchHref}
					compact
				/>
			</div>
		</article>
	);
}

function ExperimentCard({ exp, slug, guide }: ExperimentEntry) {
	const difficulty = String(exp.difficulty || "");
	return (
		<article className="group flex flex-col overflow-hidden rounded-2xl border border-gray-100 bg-white transition-all duration-300 hover:-translate-y-1 hover:border-transparent hover:shadow-2xl hover:shadow-gray-200/50">
			{exp.thumbnail ? (
				<div className="aspect-video bg-gray-100 relative overflow-hidden">
					<OptimizedImage
						src={String(exp.thumbnail)}
						alt={exp.title}
						fill
						sizes={CARD_IMAGE_SIZES}
						className="object-cover transition-transform duration-500 group-hover:scale-105"
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
				<Link
					href={`/experiments/${slug}`}
					className="mb-1.5 text-lg font-black leading-snug text-gray-950 transition-colors hover:text-[#e11d48]"
				>
					{exp.title}
				</Link>
				<p className="mb-2 text-sm font-bold leading-relaxed text-gray-700">
					{guide.summary}
				</p>
				{exp.description && (
					<p className="mb-4 line-clamp-2 text-xs leading-relaxed text-gray-500">
						{exp.description}
					</p>
				)}
				<div className="mt-auto space-y-4">
					<div>
						<p className="mb-1.5 text-[10px] font-black tracking-[0.14em] text-gray-400 uppercase">
							端末別の対応
						</p>
						<DeviceCheckPills slug={slug} guide={guide} />
					</div>
					<StatusDemoLinks
						title={String(exp.title)}
						demoHref={guide.launchHref}
					/>
					<Link
						href={`/experiments/${slug}`}
						className="inline-flex text-xs font-black text-gray-400 underline decoration-gray-200 underline-offset-4 transition hover:text-[#e11d48] hover:decoration-rose-300"
					>
						体験ガイドを見る
					</Link>
				</div>
			</div>
		</article>
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

	const entriesBySlug = new Map<string, ExperimentEntry>(
		allExperiments.map((item) => [item.slug, item]),
	);
	const demoFor = (slug: string, label: string, note: string) => ({
		href: entriesBySlug.get(slug)?.guide.launchHref,
		label,
		note,
	});
	const demoPlaceholder = (label: string, note: string) => ({ label, note });
	const checkerDemoLinks: WebXRCheckerDemoLinks = {
		inline: demoFor(
			"spatial-model-preview",
			"プレビュー",
			"inline表示や通常ブラウザでの3Dプレビュー確認に使うデモ",
		),
		"immersive-vr": demoFor(
			"webxr-audio-space",
			"VR入室",
			"immersive-vr の開始、視点追従、空間音響をまとめて確認するデモ",
		),
		"immersive-ar": demoFor(
			"hit-test-advanced",
			"AR配置",
			"immersive-ar と hit-test を使って現実空間への配置を確認するデモ",
		),
		"webxr-core": demoFor(
			"webxr-audio-space",
			"Core",
			"WebXR Device API の基本セッション開始を確認するデモ",
		),
		"webxr-gamepads": demoFor(
			"iwsdk-gallery",
			"入力",
			"VR空間内でカード選択とコントローラー入力を確認するデモ",
		),
		"webxr-ar": demoFor(
			"hit-test-advanced",
			"AR",
			"WebXR AR セッションの開始可否を確認するデモ",
		),
		"webxr-hit-test": demoFor(
			"hit-test-advanced",
			"Hit Test",
			"床や机への reticle 吸着と配置操作を確認するデモ",
		),
		"webxr-dom-overlays": demoPlaceholder(
			"Overlay",
			"DOM Overlay 用デモを制作したらここにリンクを差し込みます。",
		),
		"webxr-layers": demoPlaceholder(
			"Layers",
			"Layers 用デモを制作したらここにリンクを差し込みます。",
		),
		"webxr-anchors": demoPlaceholder(
			"Anchors",
			"Anchors 用デモを制作したらここにリンクを差し込みます。",
		),
		"webxr-lighting-estimation": demoPlaceholder(
			"Lighting",
			"Lighting Estimation 用デモを制作したらここにリンクを差し込みます。",
		),
		"webxr-hand-input": demoPlaceholder(
			"Hand",
			"Hand Input 用デモを制作したらここにリンクを差し込みます。",
		),
		"webxr-body-tracking": demoFor(
			"webxr-body-tracking",
			"Body",
			"body-tracking feature と関節pose取得を確認するデモ",
		),
		"webxr-webgpu-bindings": demoFor(
			"webgpu-fallback-lab",
			"WebGPU",
			"WebGPU と WebGL fallback の分岐を確認するデモ",
		),
	};

	const featuredExperiments = allExperiments
		.filter((item) => item.guide.featuredOrder)
		.sort(
			(a, b) => (a.guide.featuredOrder ?? 999) - (b.guide.featuredOrder ?? 999),
		);

	const quickLaunchExperiments = (
		featuredExperiments.length > 0 ? featuredExperiments : allExperiments
	).slice(0, 4);

	const byTrack = trackOrder
		.map((track) => ({
			track,
			items: allExperiments.filter((item) => item.guide.track === track),
		}))
		.filter((section) => section.items.length > 0);

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<CollectionStructuredData
				name="BANGEO WebXRデモ実験室"
				path="/experiments"
				description="Meta Quest、PICO、Android、PCブラウザで対応状況の診断とデモ起動を1ページで試せるWebXRデモ一覧。"
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

			<header className="mb-10 overflow-hidden rounded-[2.5rem] border border-rose-100 bg-white shadow-2xl shadow-rose-100/60">
				<div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
					<div className="relative overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-rose-950 p-7 text-white md:p-10">
						<div className="absolute -right-24 -top-24 h-56 w-56 rounded-full bg-rose-500/20 blur-3xl" />
						<div className="relative z-10">
							<p className="mb-3 text-xs font-black tracking-[0.26em] text-rose-200 uppercase">
								XR Demo Gateway
							</p>
							<h1 className="text-3xl font-black tracking-tight md:text-5xl">
								対応状況から、すぐデモへ
							</h1>
							<p className="mt-4 max-w-2xl text-sm leading-relaxed text-gray-300 md:text-base">
								WebXR対応デバイスでこのページを開いたら、ページ内で今のブラウザ・端末が使えるXR機能を確認し、そのまま各デモを起動できます。記事を読み込む前に「この環境で動くか」を試すための入口です。
							</p>
							<div className="mt-6 flex flex-col gap-3 sm:flex-row">
								<a
									href={SUPPORT_CHECK_HREF}
									className="inline-flex items-center justify-center rounded-full bg-white px-5 py-3 text-sm font-black text-gray-950 transition hover:bg-rose-50 hover:text-[#e11d48]"
								>
									ページ内で対応状況を見る
								</a>
								<a
									href="#demo-catalog"
									className="inline-flex items-center justify-center rounded-full border border-white/20 px-5 py-3 text-sm font-black text-white transition hover:bg-white/10"
								>
									デモ一覧へ
								</a>
							</div>
						</div>
					</div>
					<div className="grid gap-3 bg-rose-50/60 p-5 md:p-6">
						{experienceSteps.map((step) => (
							<div
								key={step.label}
								className="rounded-3xl bg-white p-5 shadow-xs"
							>
								<div className="mb-3 flex items-center gap-3">
									<span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-950 text-xs font-black text-white">
										{step.label}
									</span>
									<h2 className="text-sm font-black text-gray-950">
										{step.title}
									</h2>
								</div>
								<p className="text-xs leading-relaxed text-gray-500">
									{step.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</header>

			<section
				id="webxr-device-check"
				className="mb-12 scroll-mt-32 overflow-hidden rounded-[2rem] border border-gray-100 bg-gray-50/70 shadow-xl shadow-gray-100/70"
			>
				<div className="border-b border-gray-100 bg-white p-6 md:p-8">
					<div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
						<div>
							<p className="mb-2 text-xs font-black tracking-[0.24em] text-rose-600 uppercase">
								Device Status
							</p>
							<h2 className="text-2xl font-black tracking-tight text-gray-950 md:text-3xl">
								この端末の対応状況を、デモ一覧の前で確認
							</h2>
							<p className="mt-3 max-w-3xl text-sm leading-relaxed text-gray-500">
								対応状況チェックの体験をこのページ内に置きました。WebXR対応デバイスで開くと、VR/ARセッションや主要モジュールの可否を確認でき、各判定行の横から関連デモへ進めます。
							</p>
						</div>
						<a
							href="#demo-catalog"
							className="inline-flex shrink-0 items-center justify-center rounded-full bg-gray-950 px-5 py-3 text-sm font-black text-white transition hover:bg-[#e11d48]"
						>
							対応結果を見たらデモへ
						</a>
					</div>
				</div>
				<div className="space-y-6 p-4 md:p-6">
					<WebXRChecker demoLinks={checkerDemoLinks} showDemoLinks />
				</div>
			</section>

			{quickLaunchExperiments.length > 0 && (
				<section className="mb-12 overflow-hidden rounded-[2rem] border border-rose-100 bg-gradient-to-br from-gray-950 via-gray-900 to-rose-950 text-white shadow-2xl shadow-rose-100">
					<div className="grid gap-0 lg:grid-cols-[0.75fr_1.5fr]">
						<div className="border-b border-white/10 p-6 md:p-8 lg:border-r lg:border-b-0">
							<p className="text-xs font-black tracking-[0.24em] text-rose-200 uppercase">
								Recommended Flow
							</p>
							<h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
								新しいXRデバイスで試す順番
							</h2>
							<p className="mt-4 text-sm leading-relaxed text-gray-300">
								最初から尖ったMR機能へ進まず、VR入室 → 音と入力 → 描画fallback →
								境界確認の順に見ると、Meta
								QuestとPICOの差分を安全に切り分けられます。
							</p>
						</div>
						<div className="space-y-3 p-4 md:p-6">
							{quickLaunchExperiments.map((item, index) => (
								<FeaturedLaunchRow key={item.slug} {...item} index={index} />
							))}
						</div>
					</div>
				</section>
			)}

			<section className="mb-12">
				<div className="mb-5">
					<p className="mb-1 text-[11px] font-black tracking-[0.22em] text-rose-600 uppercase">
						Device Check
					</p>
					<h2 className="text-2xl font-black tracking-tight text-gray-950 mb-2">
						このブラウザのWebXR対応状況
					</h2>
					<p className="max-w-3xl text-sm leading-relaxed text-gray-500">
						デモを開く前に、今使っているブラウザ・デバイスでWebXRセッションや各モジュールが利用できるか確認できます。
					</p>
				</div>
				<WebXRChecker />
			</section>

			<section className="mb-12 rounded-2xl border border-gray-100 bg-gray-50/60 p-5 md:p-6">
				<div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
					<div>
						<h2 className="text-sm font-black text-gray-950 mb-2">
							バッジと導線の見方
						</h2>
						<p className="mb-3 max-w-3xl text-xs font-bold leading-relaxed text-gray-500">
							各カードの下部に「対応状況」と「デモ」を横並びで配置しています。「対応状況」はこのページ内の診断パネルへ戻り、「デモ」は実体験へ直接進みます。デモ未実装の項目は、今後リンクを差し替えるだけで同じ導線に乗せられます。
						</p>
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
						<a
							href={SUPPORT_CHECK_HREF}
							className="rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700 transition hover:border-rose-200 hover:text-[#e11d48]"
						>
							ページ内の対応状況へ →
						</a>
						<Link
							href="/webxr-status"
							className="rounded-full border border-gray-200 bg-white px-4 py-2 text-gray-700 transition hover:border-rose-200 hover:text-[#e11d48]"
						>
							標準化・ブラウザ対応状況 →
						</Link>
					</div>
				</div>
			</section>

			<section id="demo-catalog" className="scroll-mt-32">
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
			</section>
		</div>
	);
}
