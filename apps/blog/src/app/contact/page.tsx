import type { Metadata } from "next";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { DISCORD_URL, GITHUB_URL, X_URL } from "@/lib/navigation";

export const metadata: Metadata = {
	title: "お問い合わせ",
	description:
		"BANGEOはOSSとして公開しています。質問、改善提案、不具合報告、記事寄稿、WebXRデモや企画の相談窓口をまとめています。",
	alternates: { canonical: "/contact" },
	robots: { index: false, follow: true },
};

/** 連絡の種類ごとの窓口。行全体が外部へのリンク */
const channels = [
	{
		title: "質問と相談",
		description: "使い方の質問や、実装を始める前の相談をしたいときに使います。",
		destination: "Discord（WebXR JP）",
		href: DISCORD_URL,
	},
	{
		title: "不具合と誤りの報告",
		description:
			"記事の誤り、リンク切れ、サイトの不具合を見つけたときに使います。",
		destination: "GitHub Issues",
		href: `${GITHUB_URL}/issues`,
	},
	{
		title: "修正の提案",
		description: "記事やコードの修正を、Pull Requestで直接送るときに使います。",
		destination: "GitHub",
		href: GITHUB_URL,
	},
	{
		title: "更新のお知らせ",
		description: "BANGEOの更新情報と関連する話題を受け取りたいときに使います。",
		destination: "X（@bangeo_jp）",
		href: X_URL,
	},
] as const;

const welcomeTopics = [
	"WebXR、WebGPU、Three.js、PlayCanvasの記事寄稿",
	"Meta Quest、iPhone、Android、PCブラウザでの動作検証",
	"デモ追加、イベント掲載、ニュース提供、リンク追加の相談",
] as const;

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

export default function ContactPage() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "お問い合わせ", path: "/contact" }]}
			/>
			<PageHeader
				title="お問い合わせ"
				lead="質問と相談はDiscordで、不具合の報告と修正の提案はGitHubで受け付けています。"
			/>

			<div className="max-w-3xl">
				<ul className="card divide-y divide-gray-100">
					{channels.map((channel, index) => (
						<li key={channel.href}>
							<a
								href={channel.href}
								target="_blank"
								rel="noopener noreferrer"
								className={`group flex flex-col gap-2 px-5 py-4 transition-colors hover:bg-gray-50 focus-visible:-outline-offset-2 active:bg-gray-100 sm:flex-row sm:items-center sm:gap-6 md:px-6 md:py-5 ${
									index === 0 ? "rounded-t-[15px]" : ""
								} ${index === channels.length - 1 ? "rounded-b-[15px]" : ""}`}
							>
								<span className="min-w-0 flex-1">
									<span className="block text-lg font-bold leading-snug text-gray-950">
										{channel.title}
									</span>
									<span className="mt-1 block break-phrase text-sm leading-[1.7] text-gray-600">
										{channel.description}
									</span>
								</span>
								<span className="inline-flex items-center gap-1 whitespace-nowrap text-sm font-bold text-gray-950 transition-colors group-hover:text-primary-700 sm:shrink-0">
									{channel.destination}
									<ExternalIcon />
									<span className="sr-only">（新しいタブで開く）</span>
								</span>
							</a>
						</li>
					))}
				</ul>

				{/* このページで rose の淡い面はここだけ */}
				<section
					aria-labelledby="contact-welcome"
					className="mt-14 rounded-2xl bg-primary-50 px-6 py-8 md:mt-20 md:px-8"
				>
					<h2
						id="contact-welcome"
						className="text-xl font-bold leading-normal text-gray-950"
					>
						寄稿と検証、掲載の相談を受け付けています
					</h2>
					<p className="mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-700">
						WebXRは端末による違いが大きいので、短い検証メモやスクリーンショット、デモがうまく動かなかった記録も役に立ちます。まとまっていなくても、まずはIssueかDiscordで相談してください。
					</p>
					<ul className="mt-5 space-y-2 break-phrase text-base leading-[1.7] text-gray-800">
						{welcomeTopics.map((topic) => (
							<li key={topic} className="flex gap-3">
								<span
									aria-hidden="true"
									className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-primary-600"
								/>
								<span className="min-w-0">{topic}</span>
							</li>
						))}
					</ul>
				</section>
			</div>
		</div>
	);
}
