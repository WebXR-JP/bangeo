import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { OptimizedImage } from "@/components/optimized-image";
import { PageHeader } from "@/components/page-header";
import { DISCORD_URL, GITHUB_URL } from "@/lib/navigation";

export const metadata: Metadata = {
	title: "BANGEOについて｜WebXR日本語リソースの運営方針",
	description:
		"BANGEOはWebXR・VR/AR・Meta Quest・iPhone・WebGPUの情報を日本語で整理するOSS技術リソースです。実機確認・出典重視・日本語入口の3原則で運営し、GitHubで改善提案・寄稿・検証協力を受け付けています。",
	alternates: { canonical: "/about" },
};

/** 何が読めて、何が試せるか。行全体がリンク */
const destinations = [
	{
		href: "/tech-articles",
		title: "技術記事",
		description:
			"ブラウザやライブラリのニュース、実装の技術解説、実機で試すガイドを新しい順に並べています。",
	},
	{
		href: "/report",
		title: "この端末のレポート",
		description:
			"いま開いている端末とブラウザで、WebXRとWebGPUのどの機能が使えるかを判定します。",
	},
	{
		href: "/experiments",
		title: "デモ",
		description:
			"ハンドトラッキングやARのデモを、WebXR対応レポートで仕様ごとに動かせます。",
	},
] as const;

/**
 * 情報を載せるときに守っていること。
 * metadata の「3原則」と同じ3つ
 */
const principles = [
	{
		title: "実機で確かめられる情報を優先する",
		description:
			"ヘッドセット、スマートフォン、PCの実機で試すときに必要な前提と制約を書きます。",
	},
	{
		title: "一次情報を出典にする",
		description:
			"W3Cの仕様と、ブラウザやライブラリの公式情報を確かめ、古くなった記述は更新します。",
	},
	{
		title: "日本語で読める入口を作る",
		description:
			"英語の仕様やIssueを読む前に、背景と用語、判断のポイントを日本語で押さえられるようにします。",
	},
] as const;

/** GitHub Issues で受け付けている報告と提案の例 */
const contributionItems = [
	"WebXRの対応状況を実機で確かめた結果",
	"記事の誤字、リンク切れ、古い情報の修正",
	"Three.js、PlayCanvas、WebGPU、iPhoneでのWebXRの検証メモ",
	"BANGEOに載せてほしいニュース、デモ、イベントの情報",
] as const;

function ChevronIcon() {
	return (
		<svg
			className="size-5 shrink-0 text-gray-500 transition-[color,transform] duration-150 group-hover:translate-x-0.5 group-hover:text-gray-950"
			viewBox="0 0 20 20"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.75}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M8 5l5 5-5 5" />
		</svg>
	);
}

function ExternalIcon() {
	return (
		<svg
			className="size-3 shrink-0"
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

/**
 * 区切り線の下のセクション。
 * PC では左に見出し、右に中身を並べる
 */
function Section({
	id,
	title,
	children,
}: {
	id: string;
	title: string;
	children: ReactNode;
}) {
	return (
		<section
			aria-labelledby={id}
			className="mt-14 border-t border-gray-200 pt-6 first:mt-0 md:mt-20 md:pt-8 lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12"
		>
			<h2
				id={id}
				className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem] lg:text-2xl"
			>
				{title}
			</h2>
			<div className="mt-6 min-w-0 lg:mt-0">{children}</div>
		</section>
	);
}

export default function AboutPage() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "私たちについて", path: "/about" }]}
			/>
			<PageHeader
				title={
					<span className="inline-flex items-center gap-3">
						私たちについて
						{/* マスコットの画像は白地なので、
						    乗算で背景になじませる */}
						<OptimizedImage
							src="/assets/mascot/hero.png"
							alt=""
							width={56}
							height={56}
							sizes="56px"
							className="size-11 shrink-0 mix-blend-multiply md:size-14"
						/>
					</span>
				}
				lead="BANGEOは、ブラウザで動くVR/AR（WebXR）の日本語情報サイトです。"
			/>

			<div>
				<Section id="about-destinations" title="読めるものと試せるもの">
					<ul className="card divide-y divide-gray-100">
						{destinations.map((item, index) => (
							<li key={item.href}>
								<Link
									href={item.href}
									className={`group flex items-center gap-4 px-5 py-4 transition-colors hover:bg-gray-50 focus-visible:-outline-offset-2 active:bg-gray-100 md:px-6 md:py-5 ${
										index === 0 ? "rounded-t-[15px]" : ""
									} ${
										index === destinations.length - 1 ? "rounded-b-[15px]" : ""
									}`}
								>
									<span className="min-w-0 flex-1">
										<span className="block text-lg font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700">
											{item.title}
										</span>
										<span className="mt-1 block break-phrase text-sm leading-[1.7] text-gray-600">
											{item.description}
										</span>
									</span>
									<ChevronIcon />
								</Link>
							</li>
						))}
					</ul>
				</Section>

				<Section id="about-principles" title="情報を載せるときに守っていること">
					<ul className="max-w-[40em] space-y-6 md:space-y-8">
						{principles.map((principle) => (
							<li key={principle.title}>
								<h3 className="text-lg font-bold leading-snug text-gray-950">
									{principle.title}
								</h3>
								<p className="mt-2 break-phrase text-base leading-[1.8] text-gray-700">
									{principle.description}
								</p>
							</li>
						))}
					</ul>
				</Section>

				<Section
					id="about-community"
					title="WebXR JPのコミュニティと連携しています"
				>
					{/* 固有名「WebXR JP」は空白のところで2行に分けない */}
					<div className="max-w-[40em] space-y-4 break-phrase text-base leading-[1.8] text-gray-700">
						<p>
							BANGEOの記事とサイトのコードは、GitHubのWebXR-JPで公開しています。質問と情報交換は、日本のWebXR開発者が集まるDiscordコミュニティ「
							<span className="whitespace-nowrap">WebXR JP</span>
							」で受け付けています。
						</p>
						<p>
							ポッドキャストでは、
							<span className="whitespace-nowrap">WebXR JP</span>
							のメンバーがXRの話題と、開発で気づいたことを話しています。
						</p>
					</div>
					<ul className="mt-4 flex flex-wrap gap-x-6">
						<li>
							<a
								href={DISCORD_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Discordに参加する（新しいタブで開く）"
								className="text-link inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-base font-bold"
							>
								Discordに参加する
								<ExternalIcon />
							</a>
						</li>
						<li>
							<Link
								href="/podcast"
								className="text-link inline-flex min-h-11 items-center whitespace-nowrap text-base font-bold"
							>
								ポッドキャストを聞く
							</Link>
						</li>
						<li>
							<a
								href={GITHUB_URL}
								target="_blank"
								rel="noopener noreferrer"
								aria-label="GitHubを見る（新しいタブで開く）"
								className="text-link inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-base font-bold"
							>
								GitHubを見る
								<ExternalIcon />
							</a>
						</li>
					</ul>
				</Section>
			</div>

			{/* 参加の方法。このページで暗い面はここだけ。
			    rose のボタンもここの1つだけ */}
			<section
				aria-labelledby="about-join"
				className="mt-14 rounded-2xl bg-gray-950 px-6 py-8 text-white md:mt-20 md:px-12 md:py-12"
			>
				<div className="grid gap-8 lg:grid-cols-2 lg:gap-x-12">
					<div className="lg:col-start-1 lg:row-start-1">
						<h2
							id="about-join"
							className="text-2xl font-black leading-snug md:text-[1.75rem]"
						>
							報告と提案を受け付けています
						</h2>
						<p className="mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-300">
							GitHub
							Issuesに、見つけたことを書いてください。小さな修正も歓迎です。
						</p>
					</div>
					<div className="lg:col-start-2 lg:row-span-2 lg:row-start-1">
						<h3 className="text-[15px] font-bold leading-normal text-white">
							報告と提案の例
						</h3>
						<ul className="mt-3 space-y-2 break-phrase text-base leading-[1.7] text-gray-200">
							{contributionItems.map((item) => (
								<li key={item} className="flex gap-3">
									<span
										aria-hidden="true"
										className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-primary-500"
									/>
									<span className="min-w-0">{item}</span>
								</li>
							))}
						</ul>
					</div>
					<div className="flex flex-wrap gap-3 lg:col-start-1 lg:row-start-2 lg:self-end">
						<a
							href={`${GITHUB_URL}/issues`}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHub Issuesを開く（新しいタブで開く）"
							className="btn btn-primary"
						>
							GitHub Issuesを開く
							<ExternalIcon />
						</a>
						<Link href="/contact" className="btn btn-secondary">
							問い合わせる
						</Link>
					</div>
				</div>
			</section>
		</div>
	);
}
