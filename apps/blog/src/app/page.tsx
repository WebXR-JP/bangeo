import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { ArticleCard } from "@/components/article-card";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { HomeDevicePanel } from "@/components/home-device-panel";
import { collectTagCounts, tagPath } from "@/lib/collect-tags";
import { contentDateValue } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { NO_IMAGE } from "@/lib/image-defaults";
import { DISCORD_URL, GITHUB_URL } from "@/lib/navigation";
import {
	webgpuFeatureCatalog,
	webgpuLimitCatalog,
} from "@/lib/webgpu-report-catalog";
import { webxrSpecCatalog } from "@/lib/webxr-spec-catalog";

export const metadata: Metadata = {
	title: "WebXRを日本語で学ぶ｜VR・ARデモ・対応ブラウザ・実装ガイド",
	description:
		"WebXR（VR/AR/MR）の基礎、対応ブラウザ、Meta Quest・iPhoneでの動かし方、ブラウザで試せるデモ、実装ガイド、標準化の動きを日本語で整理する技術リソース。Three.js・PlayCanvas・8th Wall・IWSDKのサンプルも公開。",
	keywords: [
		"WebXR",
		"WebXR 日本語",
		"WebXR とは",
		"WebXR デモ",
		"WebXR 対応ブラウザ",
		"WebXR 実装ガイド",
		"VR ブラウザ",
		"AR ブラウザ",
		"Meta Quest WebXR",
		"iPhone WebXR",
	],
	openGraph: {
		title: "WebXRを日本語で学ぶ｜VR・ARデモ・対応ブラウザ・実装ガイド",
		description:
			"WebXR（VR/AR/MR）の基礎、対応ブラウザ、Meta Quest・iPhoneでの動かし方、ブラウザで試せるデモ、実装ガイド、標準化の動きを日本語で整理する技術リソース。",
		type: "website",
		images: ["/ogp.png"],
	},
	twitter: {
		card: "summary_large_image",
		title: "WebXRを日本語で学ぶ｜VR・ARデモ・対応ブラウザ・実装ガイド",
		description:
			"WebXRの基礎、対応ブラウザ、VR/ARデモ、実装ガイド、標準化の動きを日本語で整理。",
		images: ["/ogp.png"],
	},
	alternates: { canonical: "/" },
};

/** 改行させない空白。「Meta Quest」のような2語の固有名詞を、狭い幅でも行末で分けない */
const NBSP = String.fromCharCode(0xa0);

/**
 * 構造化データ（CollectionStructuredData）に渡す主要ページ。画面の文言とは別に持ち、ここは変えない
 */
const collectionGuides = [
	{
		title: "WebXRとは",
		description:
			"WebXR Device API、immersive-vr、immersive-ar、ブラウザでVR/ARを動かす基本を整理。",
		href: "/webxr-explainer",
	},
	{
		title: "対応ブラウザとデバイス",
		description:
			"ヘッドセット、スマートフォン、PCブラウザでWebXRがどこまで使えるかを確認。",
		href: "/webxr-status",
	},
	{
		title: "この端末の対応を確かめる",
		description:
			"いま開いている端末でWebXRとWebGPUのどの機能が使えるかを判定し、共有できる1枚の画像にまとめます。",
		href: "/report",
	},
	{
		title: "iPhoneでWebXRを動かす",
		description:
			"iOS Safariの制約やApp Clip、アプリ連携など、iPhoneでWebXRを動かす方法を解説。",
		href: "/tech-articles/ios-webxr-app-clip-guide",
	},
] as const;

/** はじめての方へ: 読む順の3段 */
const startSteps = [
	{
		title: "WebXRとは",
		description: "WebXRの意味、基本用語、最小のコードを順に説明しています。",
		href: "/webxr-explainer",
	},
	{
		title: "対応ブラウザとデバイス",
		description: `PC版とAndroid版のChrome、Quest${NBSP}Browser、Safariで使えるWebXRの機能を一覧にしています。`,
		href: "/webxr-status",
	},
	{
		title: "この端末の対応を確かめる",
		description:
			"いま開いている端末で、WebXRとWebGPUのどの機能が使えるかを判定します。結果は1枚の画像にして共有できます。",
		href: "/report",
	},
] as const;

/** WebXRを選ぶ前に知っておくこと: 3つの論点（各2文まで） */
const webxrPerspectives = [
	{
		title: "アプリを入れずに、URLからXRを始められる",
		description:
			"VR/ARの体験を、URLや検索、QRコードからそのまま開けます。展示や教育、技術デモのように、まず触ってもらう場面に向いています。",
	},
	{
		title: "対応はブラウザ名だけでは決まらない",
		description:
			"同じChrome系でも、PCとスマートフォンとヘッドセットでは使える機能が違います。iPhoneのSafariには独自の制約もあります。",
	},
	{
		title: "ライブラリと標準化の両方を見る",
		description:
			"ライブラリの使い方と、仕様やブラウザの実装は別の知識です。動かない原因は、ライブラリの設定にもブラウザの未実装にもあり得ます。",
	},
] as const;

/** 技術記事の一覧と同じ並び（更新日か公開日の新しい順） */
function getLatestPosts() {
	return getDocs(blog)
		.filter((post) => !post.draft)
		.sort((a, b) => {
			const dateA = contentDateValue(a.updated ?? a.date);
			const dateB = contentDateValue(b.updated ?? b.date);
			return dateB - dateA;
		});
}

/** レポートが1台の端末について確かめる項目の数（カタログの実数） */
const reportCheckCount =
	webxrSpecCatalog.length +
	webgpuFeatureCatalog.length +
	webgpuLimitCatalog.length;

const reportLinks = [
	{
		title: "概要",
		description:
			"WebXRとWebGPUの判定を1画面で見渡し、結果を画像で保存・共有できます。",
		href: "/report",
	},
	{
		title: "WebXR対応レポート",
		description: `${webxrSpecCatalog.length}件の仕様ごとに、この端末での対応と、動かして確かめられるデモを並べています。`,
		href: "/experiments",
	},
	{
		title: "WebGPU対応レポート",
		description: `機能（features）${webgpuFeatureCatalog.length}件と上限値（limits）${webgpuLimitCatalog.length}件を、1項目ずつ日本語の解説つきで確かめられます。`,
		href: "/webgpu-report",
	},
] as const;

const sectionHeadingClass =
	"text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]";

/** 「知りたいことから探す」から開くタグ */
const QUEST_TAG = "Meta Quest";

function ChevronIcon({ className = "size-4" }: { className?: string }) {
	return (
		<svg
			className={`shrink-0 ${className}`}
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
	);
}

function ArrowIcon({ className = "size-5" }: { className?: string }) {
	return (
		<svg
			className={`shrink-0 ${className}`}
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
	);
}

/** 新しいタブで開く外部リンクの印（ヘッダー・フッターと同じ形） */
function ExternalIcon() {
	return (
		<svg
			className="size-3 shrink-0 opacity-70"
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
		</svg>
	);
}

function DiscordIcon() {
	return (
		<svg
			className="size-5 shrink-0"
			fill="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
		</svg>
	);
}

export default function HomePage() {
	const blogPosts = getLatestPosts();
	const latestPosts = blogPosts.slice(0, 3);
	const podcastCount = getDocs(podcast).length;
	// タグのページは、そのタグの記事・デモが1件もないと 404 になるので、あるときだけ問いに出す
	const hasQuestTag = collectTagCounts([
		...getDocs(blog),
		...getDocs(experiments),
	]).has(QUEST_TAG);

	/** 知りたいことから探す: 問い → 実在するページ。行き先の名前を添えて、押す前にわかるようにする */
	const questions = [
		{
			question: "ブラウザでVRデモを動かしたい",
			destination: "WebXR対応レポート（immersive-vr）",
			href: "/experiments#spec-immersive-vr",
		},
		{
			question: "iPhoneでXR体験を届けたい",
			destination: "技術記事（iPhone向けのガイド）",
			href: "/tech-articles/ios-webxr-app-clip-guide",
		},
		{
			question: "3Dライブラリを選びたい",
			destination: "ライブラリ",
			href: "/libraries",
		},
		{
			question: "標準化と対応状況を追いたい",
			destination: "標準化・対応状況",
			href: "/webxr-status",
		},
		{
			question: "AR機能のHit Testを試したい",
			destination: "WebXR対応レポート（Hit Test）",
			href: "/experiments#spec-hit-test",
		},
		...(hasQuestTag
			? [
					{
						question: `Meta${NBSP}Questの記事を読みたい`,
						destination: `タグ「${QUEST_TAG}」`,
						href: tagPath(QUEST_TAG),
					},
				]
			: []),
	];

	const exploreLinks = [
		{
			name: "ポッドキャスト",
			count: podcastCount > 0 ? `全${podcastCount}回` : undefined,
			description: `WebXR${NBSP}JPのメンバーがXRの話題を話す音声番組を聴けます。`,
			href: "/podcast",
		},
		{
			name: "タグ一覧",
			description: `Three.jsやMeta${NBSP}Questなどのタグから記事を探せます。`,
			href: "/tags",
		},
		{
			name: "検索",
			description: "技術記事、デモ、ポッドキャストをキーワードで探せます。",
			href: "/search",
		},
		{
			name: "対応デバイス一覧",
			description:
				"ヘッドセットとスマートフォンのWebXR対応をデバイスごとに見られます。",
			href: "/devices",
		},
	];

	const articleLinkClass =
		"text-link inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-bold";
	const articleLinks = (
		<>
			<Link href="/tech-articles" className={articleLinkClass}>
				技術記事{blogPosts.length}本の一覧を見る
				<ChevronIcon />
			</Link>
			<Link href="/tech-articles/categories" className={articleLinkClass}>
				カテゴリ一覧を見る
				<ChevronIcon />
			</Link>
		</>
	);

	return (
		<div className="overflow-x-clip">
			<CollectionStructuredData
				name="BANGEO WebXR主要コンテンツ"
				path="/"
				description="WebXRの基礎、対応状況、技術記事、この端末の対応レポートへの主要導線。"
				items={[
					...collectionGuides.map((guide) => ({
						name: guide.title,
						path: guide.href,
						description: guide.description,
					})),
					...latestPosts.map((post) => {
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
					}),
				]}
			/>

			{/* ヒーロー: 約束（h1）→ その場の証拠（この端末の結果）→ 行動1つ */}
			<header className="pt-8 pb-14 md:pt-12 md:pb-20">
				<div className="mx-auto grid max-w-6xl gap-8 px-5 md:px-8 lg:grid-cols-12 lg:items-center lg:gap-12">
					<div className="lg:col-span-7">
						{/* 句ごとに1行。長いほうの句（約11.6字幅）が行に収まる大きさにする:
						    1023px までは画面の幅（左右の余白40px）、1024px からは左の7列（最大615px）に合わせる */}
						<h1 className="text-[clamp(1.5rem,8.4vw_-_0.25rem,3.5rem)] font-black leading-[1.25] text-gray-950 lg:text-[clamp(2rem,5vw_-_0.375rem,3.25rem)]">
							<span className="inline-block">WebXRを日本語で学び、</span>
							<span className="inline-block text-primary-600">
								VR/ARをブラウザで動かす
							</span>
						</h1>
						<p className="mt-6 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-700 md:text-lg">
							ブラウザで動くVR/AR（WebXR）の基本、対応状況、実装の注意点を日本語でまとめています。まずは、この端末で何が動くかを確かめてください。
						</p>
						<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
							<Link href="/report" className="btn btn-primary btn-lg">
								この端末のレポートを見る
								<ArrowIcon className="size-4" />
							</Link>
							<Link
								href="/webxr-explainer"
								className="btn btn-secondary btn-lg"
							>
								WebXRの基本を読む
							</Link>
						</div>
					</div>
					{/* 1023px までは文章の下に置く。全幅に伸ばすと名前と判定が離れすぎるので、PC 幅の列と同じくらいの幅で止める */}
					<div className="max-w-md lg:col-span-5">
						<HomeDevicePanel checkCount={reportCheckCount} />
					</div>
				</div>
			</header>

			{/* はじめての方へ: 番号の段 */}
			<section aria-labelledby="home-start" className="pb-14 md:pb-20">
				<div className="mx-auto max-w-6xl px-5 md:px-8">
					<h2 id="home-start" className={sectionHeadingClass}>
						はじめての方へ
					</h2>
					<p className="mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-700">
						WebXRの基本、対応状況、手元の端末での確かめ方を順に読めます。
					</p>
					{/* 1024px から横に3段。それより狭いと段の幅が足りないので、番号を左に置いて縦に並べる */}
					<ol className="mt-8 grid lg:grid-cols-3 lg:gap-x-8">
						{startSteps.map((step, index) => (
							<li key={step.href} className="border-t border-gray-200">
								<Link
									href={step.href}
									className="group grid grid-cols-[2.25rem_minmax(0,1fr)] gap-x-3 py-4 md:py-5 lg:block lg:py-6"
								>
									<span
										aria-hidden="true"
										className="text-[2rem] font-black leading-none text-gray-950"
									>
										{index + 1}
									</span>
									<div className="lg:mt-4">
										<h3 className="text-lg font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700 group-active:text-primary-800">
											{step.title}
											<ChevronIcon className="ml-1 inline-block size-4 align-[-0.125em] text-gray-400 transition-[color,translate] group-hover:translate-x-0.5 group-hover:text-primary-700" />
										</h3>
										<p className="mt-2 max-w-[40em] break-phrase text-sm leading-[1.7] text-gray-600">
											{step.description}
										</p>
									</div>
								</Link>
							</li>
						))}
					</ol>
					<Link
						href="/tech-articles/ios-webxr-app-clip-guide"
						className="text-link mt-2 inline-flex min-h-11 items-center gap-1 text-sm font-bold"
					>
						iPhoneでWebXRを動かす方法を読む
						<ChevronIcon />
					</Link>
				</div>
			</section>

			{/* 新着の技術記事: 画像つきカード3枚（768〜1023px は2列なので2枚） */}
			<section aria-labelledby="home-latest" className="pb-14 md:pb-20">
				<div className="mx-auto max-w-6xl px-5 md:px-8">
					<div className="flex items-end justify-between gap-6">
						<h2 id="home-latest" className={sectionHeadingClass}>
							新着の技術記事
						</h2>
						<div className="hidden items-center gap-x-6 md:flex">
							{articleLinks}
						</div>
					</div>
					<ul className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
						{latestPosts.map((post, index) => {
							const slug = getSlugFromPath(post.info.path);
							return (
								<li
									key={slug}
									className={`min-w-0 ${index === 2 ? "md:max-lg:hidden" : ""}`}
								>
									<ArticleCard
										href={`/tech-articles/${slug}`}
										title={post.title}
										description={post.description}
										thumbnail={
											post.thumbnail ? String(post.thumbnail) : undefined
										}
										category={post.category ? String(post.category) : undefined}
										date={post.date ? String(post.date) : undefined}
										updated={post.updated ? String(post.updated) : undefined}
										prefetch
									/>
								</li>
							);
						})}
					</ul>
					{/* スマートフォンではカードの下に置く */}
					<div className="mt-4 flex flex-wrap gap-x-6 md:hidden">
						{articleLinks}
					</div>
				</div>
			</section>

			{/* この端末のレポートでわかること: 行の一覧 */}
			<section
				aria-labelledby="home-report"
				className="bg-gray-50 py-14 md:py-20"
			>
				<div className="mx-auto max-w-6xl px-5 md:px-8">
					<h2 id="home-report" className={sectionHeadingClass}>
						この端末のレポートでわかること
					</h2>
					<p className="mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-700">
						{`レポートは、WebXRとWebGPUの確認項目${reportCheckCount}件をその場で判定します。確かめたいヘッドセットやスマートフォンのブラウザで開くと、その端末の結果になります。`}
					</p>
					<ul className="mt-8 border-b border-gray-200">
						{reportLinks.map((link) => (
							<li key={link.href} className="border-t border-gray-200">
								<Link
									href={link.href}
									className="group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-x-4 gap-y-1 py-4 md:grid-cols-[15rem_minmax(0,1fr)_auto] md:gap-x-8 md:py-5"
								>
									<span className="text-lg font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700 group-active:text-primary-800">
										{link.title}
									</span>
									<span className="col-start-1 max-w-[40em] break-phrase text-sm leading-[1.7] text-gray-600 md:col-start-2 md:row-start-1">
										{link.description}
									</span>
									<ArrowIcon className="col-start-2 row-span-2 row-start-1 size-5 text-gray-400 transition-[color,translate] group-hover:translate-x-0.5 group-hover:text-primary-700 md:col-start-3 md:row-span-1" />
								</Link>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* WebXRを選ぶ前に知っておくこと: 2カラムの読み物（箱なし） */}
			<section aria-labelledby="home-before" className="py-14 md:py-20">
				<div className="mx-auto max-w-6xl px-5 md:px-8">
					<h2 id="home-before" className={sectionHeadingClass}>
						WebXRを選ぶ前に知っておくこと
					</h2>
					<div className="mt-8 grid gap-12 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-16">
						<div className="space-y-8">
							{webxrPerspectives.map((perspective) => (
								<div key={perspective.title}>
									<h3 className="text-lg font-bold leading-snug text-gray-950">
										{perspective.title}
									</h3>
									<p className="mt-2 max-w-[40em] text-base leading-[1.8] text-gray-700">
										{perspective.description}
									</p>
								</div>
							))}
						</div>
						<div>
							<h3 className="text-lg font-bold leading-snug text-gray-950">
								知りたいことから探す
							</h3>
							<ul className="mt-4 border-l border-gray-200">
								{questions.map((item) => (
									<li key={item.href}>
										<Link
											href={item.href}
											className="group -ml-px flex items-center justify-between gap-3 border-l-2 border-transparent py-2 pr-1 pl-4 transition-colors hover:border-primary-600 focus-visible:border-primary-600"
										>
											<span className="min-w-0">
												<span className="block text-[15px] font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700 group-active:text-primary-800">
													{item.question}
												</span>
												<span className="mt-0.5 block text-[13px] leading-[1.6] text-gray-500">
													{item.destination}
												</span>
											</span>
											<ChevronIcon className="size-4 text-gray-400 transition-colors group-hover:text-primary-700" />
										</Link>
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* 記事のほかに探せるもの: 文字だけのリンクの一覧 */}
			<section aria-labelledby="home-explore" className="pb-14 md:pb-20">
				<div className="mx-auto max-w-6xl px-5 md:px-8">
					<h2 id="home-explore" className={sectionHeadingClass}>
						記事のほかに探せるもの
					</h2>
					{/* スマートフォンで2列にすると1列が155pxしかなく、説明が語の途中で折れる。639px までは1列にして文節で折る */}
					<ul className="mt-6 grid gap-x-6 gap-y-4 sm:grid-cols-2 md:gap-x-8 lg:grid-cols-4">
						{exploreLinks.map((item) => (
							<li key={item.href} className="min-w-0">
								<div className="flex flex-wrap items-baseline gap-x-2">
									<Link
										href={item.href}
										className="text-link inline-flex min-h-11 items-center text-base font-bold"
									>
										{item.name}
									</Link>
									{item.count ? (
										<span className="text-[13px] text-gray-500">
											{item.count}
										</span>
									) : null}
								</div>
								<p className="break-phrase text-sm leading-[1.7] text-gray-600">
									{item.description}
								</p>
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* 公開リポジトリ: 説明 → 行動 */}
			<section aria-labelledby="home-open" className="pb-14 md:pb-20">
				<div className="mx-auto grid max-w-6xl gap-8 px-5 md:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,24rem)] lg:items-start lg:gap-16">
					<div>
						<h2 id="home-open" className={sectionHeadingClass}>
							BANGEOは公開リポジトリで運営しています
						</h2>
						<p className="mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-700">
							{`記事、デモ、サイトの変更をGitHubで公開しています。気づいたことは、IssueかPull${NBSP}Requestで送ってください。`}
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<a
								href={GITHUB_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="GitHubを見る（新しいタブで開く）"
								className="btn btn-dark"
							>
								GitHubを見る
								<ExternalIcon />
							</a>
							<Link href="/about" className="btn btn-secondary">
								私たちについて
							</Link>
							<Link href="/contact" className="btn btn-secondary">
								問い合わせる
							</Link>
						</div>
					</div>
					<div className="rounded-xl bg-gray-50 p-6">
						<h3 className="text-lg font-bold leading-snug text-gray-950">
							こんな報告と提案を受け付けています
						</h3>
						<ul className="mt-3 list-disc space-y-2 break-phrase pl-5 text-sm leading-[1.7] text-gray-700 marker:text-gray-400">
							<li>WebXR対応状況の実機報告</li>
							<li>Meta Quest、iPhone、Androidでの動作確認</li>
							<li>記事の誤り、古くなった情報、リンク切れの報告</li>
							<li>Three.js、PlayCanvas、WebGPU関連のデモ提案</li>
						</ul>
					</div>
				</div>
			</section>

			{/* Discord の帯（サイトで唯一の濃い面） */}
			<section
				aria-labelledby="home-discord"
				className="bg-gray-950 py-12 md:py-16"
			>
				<div className="mx-auto flex max-w-6xl flex-col gap-6 px-5 md:flex-row md:items-center md:justify-between md:px-8">
					<div>
						<h2
							id="home-discord"
							className="text-2xl font-black leading-snug text-white md:text-[1.75rem]"
						>
							質問と情報交換はDiscordで
						</h2>
						<p className="mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-300">
							{`WebXR${NBSP}JPのDiscordサーバーで、実装前の相談や情報交換ができます。`}
						</p>
					</div>
					<a
						href={DISCORD_URL}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Discordに参加する（新しいタブで開く）"
						className="btn btn-lg self-start bg-white text-gray-950 hover:bg-gray-100 md:self-auto"
					>
						<DiscordIcon />
						Discordに参加する
						<ExternalIcon />
					</a>
				</div>
			</section>
		</div>
	);
}
