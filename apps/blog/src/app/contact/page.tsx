import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";

export const metadata: Metadata = {
	title: "お問い合わせ",
	description:
		"BANGEO は OSS として公開しています。質問、改善提案、不具合報告、記事寄稿、WebXRデモや企画の相談窓口をまとめています。",
	alternates: { canonical: "/contact" },
	robots: { index: false, follow: true },
};

const welcomeTopics = [
	"WebXR、WebGPU、Three.js、PlayCanvasの記事寄稿",
	"Meta Quest、iPhone、Android、PCブラウザでの動作検証",
	"デモ追加、イベント掲載、ニュース提供、リンク追加の相談",
	"誤字、古い情報、リンク切れ、不具合の報告",
] as const;

const contacts = [
	{
		title: "コミュニティ",
		description: "WebXR JP の Discord で質問や実装相談ができます",
		href: "https://discord.com/invite/9WyRvAwX7B",
		external: true,
		iconBg: "bg-rose-100",
		icon: (
			<svg
				className="w-6 h-6 text-[#e11d48]"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
				/>
			</svg>
		),
	},
	{
		title: "SNS",
		description: "X では更新情報や関連トピックを発信しています",
		href: "https://x.com/bangeo_jp",
		external: true,
		iconBg: "bg-blue-100",
		icon: (
			<svg
				className="w-6 h-6 text-blue-600"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
			</svg>
		),
	},
	{
		title: "GitHub",
		description:
			"BANGEO の公開リポジトリです。コード、コンテンツ、設定を確認できます",
		href: "https://github.com/WebXR-JP/bangeo",
		external: true,
		iconBg: "bg-purple-100",
		icon: (
			<svg
				className="w-6 h-6 text-purple-600"
				fill="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					fillRule="evenodd"
					clipRule="evenodd"
					d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
				/>
			</svg>
		),
	},
	{
		title: "Issue / PR",
		description:
			"不具合報告、提案、修正の送付には GitHub Issues / Pull Request を利用してください",
		href: "https://github.com/WebXR-JP/bangeo/issues",
		external: true,
		iconBg: "bg-green-100",
		icon: (
			<svg
				className="w-6 h-6 text-green-600"
				fill="none"
				stroke="currentColor"
				viewBox="0 0 24 24"
				aria-hidden="true"
			>
				<path
					strokeLinecap="round"
					strokeLinejoin="round"
					strokeWidth={2}
					d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
				/>
			</svg>
		),
	},
];

export default function ContactPage() {
	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<BreadcrumbStructuredData
				items={[{ name: "お問い合わせ", path: "/contact" }]}
			/>
			{/* Header */}
			<header className="space-y-6 text-center max-w-4xl mx-auto mb-16">
				<h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-950">
					お問い合わせ
				</h1>
				<p className="text-xl text-gray-500 font-medium leading-relaxed">
					BANGEO は OSS として公開しています。質問、改善提案、不具合報告は
					GitHub とコミュニティから受け付けています。
				</p>
				<p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed">
					記事寄稿、検証協力、WebXRデモの追加、イベント情報、企画提案も自由に募集しています。まとまっていなくても、まずはIssueやDiscordで相談してください。
				</p>
				<p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed">
					公開リポジトリ:{" "}
					<a
						href="https://github.com/WebXR-JP/bangeo"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#e11d48] hover:underline"
					>
						https://github.com/WebXR-JP/bangeo
					</a>
				</p>
			</header>

			<section className="mb-16 rounded-2xl border border-rose-100 bg-rose-50/50 p-7 md:p-9">
				<div className="grid gap-8 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:items-start">
					<div>
						<p className="text-xs font-black tracking-[0.28em] text-rose-600 mb-3">
							CONTRIBUTION
						</p>
						<h2 className="text-2xl md:text-3xl font-black tracking-tight text-gray-950">
							自由に企画・寄稿を募集しています
						</h2>
						<p className="mt-4 text-sm md:text-base leading-relaxed text-gray-500 font-medium">
							WebXRは実機差分が大きい分野です。小さな検証メモ、スクリーンショット、デモの失敗談、公式リリースの共有も価値があります。
						</p>
					</div>
					<ul className="grid gap-3 text-sm font-bold text-gray-600">
						{welcomeTopics.map((topic) => (
							<li
								key={topic}
								className="rounded-xl border border-white bg-white/80 px-4 py-3"
							>
								{topic}
							</li>
						))}
					</ul>
				</div>
			</section>

			{/* Contact cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
				{contacts.map((contact) => {
					const cardContent = (
						<>
							<div
								className={`w-14 h-14 ${contact.iconBg} rounded-2xl flex items-center justify-center mb-6`}
							>
								{contact.icon}
							</div>
							<h2 className="text-2xl font-black text-gray-950 mb-3">
								{contact.title}
							</h2>
							<p className="text-lg text-gray-500 leading-relaxed font-medium mb-6">
								{contact.description}
							</p>
							<span className="inline-block font-black text-[#e11d48] group-hover:translate-x-2 transition-transform">
								{contact.external
									? `${contact.title}を開く ↗`
									: `${contact.title}ページへ →`}
							</span>
						</>
					);

					if (contact.external) {
						return (
							<a
								key={contact.title}
								href={contact.href}
								target="_blank"
								rel="noopener noreferrer"
								className="group block bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300"
							>
								{cardContent}
							</a>
						);
					}

					return (
						<Link
							key={contact.title}
							href={contact.href}
							className="group block bg-white rounded-2xl border border-gray-100 p-8 hover:shadow-2xl hover:shadow-gray-200/50 hover:-translate-y-1 transition-all duration-300"
						>
							{cardContent}
						</Link>
					);
				})}
			</div>

			{/* Note */}
			<div className="text-center">
				<p className="text-lg text-gray-500 font-medium">
					実装前の相談は Discord、確定した課題や修正提案は GitHub Issues / Pull
					Request が向いています。
				</p>
			</div>
		</div>
	);
}
