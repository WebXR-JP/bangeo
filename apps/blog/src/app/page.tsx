import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { OptimizedImage } from "@/components/optimized-image";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { CARD_IMAGE_SIZES } from "@/lib/image-defaults";

function parseContentDate(value?: string): number {
	if (!value) return 0;

	const japaneseDate = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
	if (japaneseDate) {
		const [, year, month, day] = japaneseDate;
		return new Date(Number(year), Number(month) - 1, Number(day)).getTime();
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? 0 : date.getTime();
}

export const metadata: Metadata = {
	title: "WebXR日本語リソース｜VR・ARデモ、対応ブラウザ、実装ガイド",
	description:
		"BANGEOはWebXR（VR/AR/MR）を日本語で学ぶ技術ハブです。Meta Quest、iPhone、Android、PCブラウザで試せるデモ、対応ブラウザ、WebXR Device API、Three.js、PlayCanvas、WebGPUの実装ガイドを整理しています。",
	keywords: [
		"WebXR",
		"WebXR 日本語",
		"WebXR とは",
		"WebXR デモ",
		"WebXR iPhone",
		"WebXR iOS",
		"Meta Quest WebXR",
		"WebGPU WebXR",
		"Three.js WebXR",
	],
	openGraph: {
		title: "WebXR日本語リソース｜VR・ARデモ、対応ブラウザ、実装ガイド",
		description:
			"BANGEOはWebXR（VR/AR/MR）を日本語で学ぶ技術ハブです。Meta Quest、iPhone、Android、PCブラウザで試せるデモ、対応ブラウザ、WebXR Device API、Three.js、PlayCanvas、WebGPUの実装ガイドを整理しています。",
		type: "website",
		images: ["/ogp.png"],
	},
	twitter: {
		card: "summary_large_image",
		title: "WebXR日本語リソース｜VR・ARデモ、対応ブラウザ、実装ガイド",
		description:
			"WebXRの基礎、対応ブラウザ、Meta QuestやiPhoneで試せるVR/ARデモ、Three.js・PlayCanvas・WebGPUの実装ガイドを日本語で整理。",
		images: ["/ogp.png"],
	},
	alternates: { canonical: "/" },
};

const searchIntentLinks = [
	{ label: "WebXRとは", href: "/webxr-explainer" },
	{ label: "WebXR デモ", href: "/experiments" },
	{ label: "iPhone WebXR", href: "/tech-articles/ios-webxr-app-clip-guide" },
	{ label: "Meta Quest WebXR", href: "/devices/meta-quest" },
	{ label: "対応ブラウザ", href: "/webxr-status" },
	{
		label: "WebGPU WebXR",
		href: "/tech-articles/quest-browser-146-webgpu-webxr",
	},
] as const;

const startGuides = [
	{
		title: "WebXRとは",
		description:
			"WebXR Device API、immersive-vr、immersive-ar、ブラウザでVR/ARを動かす基本を整理。",
		href: "/webxr-explainer",
		label: "基礎から読む",
	},
	{
		title: "対応ブラウザとデバイス",
		description:
			"Meta Quest、iPhone、Android、PCブラウザでWebXRがどこまで使えるかを確認。",
		href: "/webxr-status",
		label: "対応状況を見る",
	},
	{
		title: "WebXRデモを試す",
		description:
			"ヘッドセット、スマートフォン、PCで動くBANGEOのWebXR実験を一覧から体験。",
		href: "/experiments",
		label: "デモへ進む",
	},
	{
		title: "iPhoneでWebXRを動かす",
		description:
			"iOS Safariの制約、App Clip、アプリ連携を含めたiPhone向けWebXR導線を解説。",
		href: "/tech-articles/ios-webxr-app-clip-guide",
		label: "iPhone対応を読む",
	},
] as const;

const trackedTopics = [
	{
		title: "WebXR Device API",
		description:
			"VR/AR/MRセッション、入力、空間トラッキング、ブラウザ実装の標準化を追います。",
	},
	{
		title: "Three.js / PlayCanvas",
		description:
			"WebXR実装で使われる主要ライブラリと、実機で詰まりやすい設定を整理します。",
	},
	{
		title: "Meta Quest Browser",
		description:
			"Quest Browser、WebGPU、ハンドトラッキング、没入型Webアプリの動作確認を扱います。",
	},
	{
		title: "iPhone / iOS WebXR",
		description:
			"Safari単体で難しい領域と、App Clipやネイティブ連携で補う実装方針を扱います。",
	},
] as const;

export default function HomePage() {
	const blogPosts = getDocs(blog)
		.filter((post) => !post.draft)
		.sort((a, b) => {
			const dateA = parseContentDate(a.date);
			const dateB = parseContentDate(b.date);
			return dateB - dateA;
		});

	const experimentsList = getDocs(experiments)
		.filter((exp) => !exp.draft)
		.sort((a, b) => {
			const dateA = parseContentDate(a.date);
			const dateB = parseContentDate(b.date);
			return dateB - dateA;
		});

	const podcastEpisodes = getDocs(podcast);
	const hasExperiments = experimentsList.length > 0;

	const formatCount = (count: number): string =>
		count >= 10 ? `${count}+` : `${count}`;

	return (
		<div className="overflow-x-hidden">
			{/* Hero */}
			<header className="relative pt-32 pb-24 md:pt-40 md:pb-32 overflow-hidden bg-rose-50/70">
				<div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,241,242,0.98),rgba(255,255,255,0.94)_46%,rgba(244,244,245,0.92))]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_48%_at_20%_8%,rgba(225,29,72,0.16),transparent_66%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_54%_42%_at_88%_34%,rgba(251,113,133,0.14),transparent_68%)]" />
				<div className="absolute inset-0 dot-pattern opacity-70" />

				<div className="relative max-w-6xl mx-auto px-6 md:px-8">
					<div className="grid lg:grid-cols-5 gap-16 lg:gap-20 items-center">
						{/* Left: Text */}
						<div className="lg:col-span-3 space-y-8">
							<div className="inline-flex items-center gap-2.5 px-4 py-2 bg-white/80 backdrop-blur-xs border border-rose-100 rounded-full shadow-sm shadow-rose-100/60">
								<span className="w-2 h-2 bg-[#e11d48] rounded-full animate-pulse" />
								<span className="text-xs font-semibold text-rose-700 tracking-wide">
									WebXR / VR / AR / MR
								</span>
							</div>
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.08] text-gray-950">
								WebXRを日本語で学び、
								<br />
								<span className="bg-gradient-to-r from-[#be123c] via-[#e11d48] to-rose-400 bg-clip-text text-transparent">
									VR/ARをブラウザで動かす
								</span>
							</h1>
							<p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-xl">
								BANGEOは WebXR Device API、Meta Quest、iPhone、
								Android、Three.js、PlayCanvas、WebGPU
								を横断して、ブラウザで動くVR/ARのデモと実装ガイドを
								<span className="text-gray-950 font-semibold">日本語</span>
								で整理する技術リソースです。
							</p>
							<div className="flex flex-wrap gap-2 max-w-2xl">
								{searchIntentLinks.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										className="inline-flex items-center rounded-full border border-rose-100 bg-white/75 px-3 py-1.5 text-xs font-bold text-gray-600 shadow-sm shadow-rose-100/40 transition-colors hover:border-rose-200 hover:text-[#e11d48]"
									>
										{link.label}
									</Link>
								))}
							</div>
							<div className="flex flex-col sm:flex-row gap-4 pt-2">
								<Link
									href="/experiments"
									className="inline-flex items-center justify-center gap-2 px-7 py-4 bg-[#e11d48] text-white text-sm font-bold rounded-xl hover:bg-[#be1b3e] transition-all duration-200 shadow-lg shadow-[#e11d48]/20"
								>
									{hasExperiments ? "デモを体験する" : "デモ一覧を見る"}
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M14 5l7 7m0 0l-7 7m7-7H3"
										/>
									</svg>
								</Link>
								<Link
									href="/webxr-explainer"
									className="inline-flex items-center justify-center px-7 py-4 bg-white/80 backdrop-blur-xs border border-rose-100 text-gray-950 text-sm font-bold rounded-xl hover:bg-white hover:border-rose-200 transition-all duration-200 shadow-sm"
								>
									WebXRを学ぶ
								</Link>
							</div>
						</div>

						{/* Right: Stats */}
						<div className="lg:col-span-2 grid grid-cols-2 gap-4">
							<Link
								href="/experiments"
								className="group p-6 bg-white/75 backdrop-blur-xs border border-rose-100/80 rounded-2xl shadow-sm shadow-rose-100/50 hover:bg-white hover:border-rose-200 hover:-translate-y-0.5 transition-all duration-200"
							>
								<div className="text-4xl font-black text-gray-950 mb-2 tracking-tight">
									{formatCount(experimentsList.length)}
								</div>
								<div className="text-sm text-gray-500 font-medium group-hover:text-[#e11d48] transition-colors">
									デモ
								</div>
							</Link>
							<Link
								href="/tech-articles"
								className="group p-6 bg-white/75 backdrop-blur-xs border border-rose-100/80 rounded-2xl shadow-sm shadow-rose-100/50 hover:bg-white hover:border-rose-200 hover:-translate-y-0.5 transition-all duration-200"
							>
								<div className="text-4xl font-black text-gray-950 mb-2 tracking-tight">
									{formatCount(blogPosts.length)}
								</div>
								<div className="text-sm text-gray-500 font-medium group-hover:text-[#e11d48] transition-colors">
									ブログ記事
								</div>
							</Link>
							<Link
								href="/podcast"
								className="group p-6 bg-white/75 backdrop-blur-xs border border-rose-100/80 rounded-2xl shadow-sm shadow-rose-100/50 hover:bg-white hover:border-rose-200 hover:-translate-y-0.5 transition-all duration-200"
							>
								<div className="text-4xl font-black text-gray-950 mb-2 tracking-tight">
									{formatCount(podcastEpisodes.length)}
								</div>
								<div className="text-sm text-gray-500 font-medium group-hover:text-[#e11d48] transition-colors">
									ポッドキャスト
								</div>
							</Link>
							<Link
								href="/tags"
								className="group p-6 bg-white/75 backdrop-blur-xs border border-rose-100/80 rounded-2xl shadow-sm shadow-rose-100/50 hover:bg-white hover:border-rose-200 hover:-translate-y-0.5 transition-all duration-200"
							>
								<div className="text-4xl font-black text-gray-950 mb-2 tracking-tight">
									3
								</div>
								<div className="text-sm text-gray-500 font-medium group-hover:text-[#e11d48] transition-colors">
									カテゴリ
								</div>
							</Link>
						</div>
					</div>
				</div>
			</header>

			{/* Start Guides */}
			<section className="py-16 md:py-20 bg-white">
				<div className="max-w-6xl mx-auto px-6 md:px-8">
					<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5 mb-10">
						<div>
							<p className="text-xs font-black tracking-[0.28em] text-rose-600 mb-3">
								START HERE
							</p>
							<h2 className="text-3xl font-black tracking-tight text-gray-950">
								WebXRを始める導線
							</h2>
						</div>
						<p className="max-w-2xl text-sm md:text-base text-gray-500 leading-relaxed">
							「WebXRとは何か」から「どのブラウザで動くか」「QuestやiPhoneでどう試すか」まで、検索で来た人が最短で目的の情報に届けるように整理しています。
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
						{startGuides.map((guide) => (
							<Link
								key={guide.href}
								href={guide.href}
								className="group flex h-full flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50/70 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-rose-100 hover:bg-white hover:shadow-2xl hover:shadow-gray-200/50"
							>
								<div>
									<h3 className="text-lg font-black text-gray-950 group-hover:text-[#e11d48] transition-colors">
										{guide.title}
									</h3>
									<p className="mt-3 text-sm leading-relaxed text-gray-500">
										{guide.description}
									</p>
								</div>
								<span className="mt-6 inline-flex text-xs font-black text-gray-600 group-hover:text-[#e11d48]">
									{guide.label}
								</span>
							</Link>
						))}
					</div>
				</div>
			</section>

			{/* Demos Section */}
			<section className="py-20 md:py-28 bg-gray-50/80">
				<div className="max-w-6xl mx-auto px-6 md:px-8">
					<div className="flex justify-between items-end mb-12">
						<div>
							<h2 className="text-3xl font-black tracking-tight text-gray-950">
								デモ
							</h2>
							<p className="text-base text-gray-500 mt-2">
								ヘッドセット・スマートフォン・PC で試せます
							</p>
						</div>
						<Link
							href="/experiments"
							className="text-sm font-bold text-gray-600 hover:text-[#e11d48] transition-colors hidden md:flex items-center gap-1"
						>
							すべて見る
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</Link>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
						{hasExperiments ? (
							experimentsList.slice(0, 6).map((exp) => {
								const slug = getSlugFromPath(exp.info.path);
								return (
									<Link
										href={`/experiments/${slug}`}
										className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300"
										key={slug}
									>
										<div className="aspect-video bg-gray-100 relative overflow-hidden">
											{exp.thumbnail ? (
												<OptimizedImage
													src={String(exp.thumbnail)}
													alt={exp.title}
													fill
													sizes={CARD_IMAGE_SIZES}
													className="object-cover group-hover:scale-105 transition-transform duration-500"
												/>
											) : (
												<div className="w-full h-full flex items-center justify-center">
													<span className="text-4xl text-gray-200">
														&#x1f9ea;
													</span>
												</div>
											)}
											{exp.category && (
												<span className="absolute top-4 left-4 px-2.5 py-1 bg-white/95 backdrop-blur-xs text-[10px] font-black text-rose-700 rounded-md uppercase tracking-wide">
													{String(exp.category)}
												</span>
											)}
										</div>
										<div className="p-6">
											<h3 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2 leading-snug">
												{exp.title}
											</h3>
											{exp.description && (
												<p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">
													{exp.description}
												</p>
											)}
										</div>
									</Link>
								);
							})
						) : (
							<div className="md:col-span-2 lg:col-span-3 rounded-[2rem] border border-dashed border-rose-200 bg-white px-8 py-14 text-center">
								<p className="text-xs font-black tracking-[0.3em] text-rose-500">
									準備中
								</p>
								<h3 className="mt-4 text-2xl font-black tracking-tight text-gray-950">
									デモはこれから順次公開します
								</h3>
								<p className="mt-4 max-w-2xl mx-auto text-base leading-relaxed text-gray-500">
									未完成のデモはいったん外しています。公開できる品質まで整ったものから、ここに
									1 件ずつ追加していきます。
								</p>
							</div>
						)}
					</div>

					<div className="mt-12 text-center md:hidden">
						<Link
							href="/experiments"
							className="inline-flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-[#e11d48] transition-colors"
						>
							すべて見る
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</Link>
					</div>
				</div>
			</section>

			{/* Blog / Tech Articles Section */}
			<section className="py-20 md:py-28">
				<div className="max-w-6xl mx-auto px-6 md:px-8">
					<div className="flex justify-between items-end mb-12">
						<div>
							<h2 className="text-3xl font-black tracking-tight text-gray-950">
								ブログ記事
							</h2>
							<p className="text-base text-gray-500 mt-2">
								WebXRの技術解説とニュース
							</p>
						</div>
						<Link
							href="/tech-articles"
							className="text-sm font-bold text-gray-600 hover:text-[#e11d48] transition-colors hidden md:flex items-center gap-1"
						>
							すべて見る
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</Link>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
						{blogPosts.slice(0, 3).map((post) => {
							const slug = getSlugFromPath(post.info.path);
							return (
								<Link
									href={`/tech-articles/${slug}`}
									key={slug}
									className="group block p-7 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300"
								>
									<div className="flex items-center gap-2 mb-5">
										{post.category && (
											<span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-wide">
												{String(post.category)}
											</span>
										)}
									</div>
									<h3 className="font-black text-xl text-gray-950 group-hover:text-[#e11d48] transition-colors mb-3 leading-snug">
										{post.title}
									</h3>
									{post.description && (
										<p className="text-sm text-gray-500 line-clamp-2 mb-5 leading-relaxed">
											{post.description}
										</p>
									)}
									<div className="text-xs text-gray-500 font-medium">
										{post.date ? String(post.date) : ""}
									</div>
								</Link>
							);
						})}
					</div>

					<div className="mt-12 text-center md:hidden">
						<Link
							href="/tech-articles"
							className="inline-flex items-center gap-1 text-sm font-bold text-gray-600 hover:text-[#e11d48] transition-colors"
						>
							すべて見る
							<svg
								className="w-4 h-4"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								aria-hidden="true"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</Link>
					</div>
				</div>
			</section>

			{/* Topics */}
			<section className="py-20 md:py-28 bg-white">
				<div className="max-w-6xl mx-auto px-6 md:px-8">
					<div className="max-w-3xl mb-12">
						<p className="text-xs font-black tracking-[0.28em] text-rose-600 mb-3">
							WEBXR TOPICS
						</p>
						<h2 className="text-3xl font-black tracking-tight text-gray-950">
							BANGEOで追うWebXRテーマ
						</h2>
						<p className="mt-4 text-base leading-relaxed text-gray-500">
							WebXRは対応ブラウザ、デバイス、ライブラリ、標準化の動きが密接に絡みます。BANGEOでは実機で試せる情報を軸に、開発者が判断しやすい形で更新していきます。
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
						{trackedTopics.map((topic) => (
							<div
								key={topic.title}
								className="rounded-2xl border border-gray-100 bg-gray-50/70 p-6"
							>
								<h3 className="text-base font-black text-gray-950">
									{topic.title}
								</h3>
								<p className="mt-3 text-sm leading-relaxed text-gray-500">
									{topic.description}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Resources */}
			<section className="py-20 md:py-28 bg-gray-50/80">
				<div className="max-w-6xl mx-auto px-6 md:px-8">
					<h2 className="text-3xl font-black tracking-tight text-gray-950 mb-12">
						リソース
					</h2>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
						<Link
							href="/podcast"
							className="group p-7 bg-white rounded-2xl hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 border border-gray-100"
						>
							<h3 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2">
								ポッドキャスト
							</h3>
							<p className="text-sm text-gray-500 leading-relaxed">
								WebXR JP のメンバーが XR の話題を語ります
							</p>
						</Link>
						<Link
							href="/tags"
							className="group p-7 bg-white rounded-2xl hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 border border-gray-100"
						>
							<h3 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2">
								タグ一覧
							</h3>
							<p className="text-sm text-gray-500 leading-relaxed">
								トピック別にコンテンツを探す
							</p>
						</Link>
						<Link
							href="/search"
							className="group p-7 bg-white rounded-2xl hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 border border-gray-100"
						>
							<h3 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2">
								検索
							</h3>
							<p className="text-sm text-gray-500 leading-relaxed">
								キーワードでコンテンツを検索
							</p>
						</Link>
						<Link
							href="/experiments"
							className="group p-7 bg-white rounded-2xl hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300 border border-gray-100"
						>
							<h3 className="font-black text-lg text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2">
								デモ一覧
							</h3>
							<p className="text-sm text-gray-500 leading-relaxed">
								公開中の WebXR デモを試す
							</p>
						</Link>
					</div>
				</div>
			</section>

			{/* Community CTA */}
			<section className="py-16 md:py-20 bg-gray-950">
				<div className="max-w-6xl mx-auto px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
					<div>
						<h3 className="text-xl font-black text-white mb-2">
							コミュニティに参加
						</h3>
						<p className="text-gray-400 font-medium">
							質問や情報交換は Discord でどうぞ
						</p>
					</div>
					<a
						href="https://discord.com/invite/9WyRvAwX7B"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 px-7 py-4 bg-white text-gray-950 text-sm rounded-xl font-bold hover:bg-[#e11d48] hover:text-white transition-all duration-200"
					>
						<svg
							className="w-5 h-5"
							fill="currentColor"
							viewBox="0 0 24 24"
							aria-hidden="true"
						>
							<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
						</svg>
						Discordに参加
					</a>
				</div>
			</section>
		</div>
	);
}
