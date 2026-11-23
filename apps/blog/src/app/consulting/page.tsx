import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { DISCORD_URL, GITHUB_URL } from "@/lib/navigation";

export const metadata: Metadata = {
	title: "WebXR開発参加・技術相談｜Issue・PR・Discord",
	description:
		"BANGEOはOSSとして公開中。WebXRの機能提案、不具合報告、改善相談、デモ追加の相談はGitHub Issues・Pull Request・Discordで受け付けています。",
	alternates: { canonical: "/consulting" },
};

/** 外向きの矢印。ボタンの中では既定、文中では className で行の高さに合わせる */
function ExternalIcon({
	className = "size-3 shrink-0",
}: {
	className?: string;
}) {
	return (
		<svg
			className={className}
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

export default function ConsultingPage() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "開発参加・技術相談", path: "/consulting" }]}
			/>
			<PageHeader
				title="開発参加・技術相談"
				lead="BANGEOはオープンソースのサイトで、受託開発の窓口はありません。相談はGitHubとDiscordの公開の場で受け付けています。"
			/>

			{/* 相談できること、連絡の方法、用意するもの。
			    3つとも最初の1画面に入れる */}
			<dl className="max-w-4xl border-t border-gray-200">
				<div className="grid gap-1 border-b border-gray-200 py-5 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8 md:py-6">
					<dt className="text-[15px] font-bold leading-[1.8] text-gray-950">
						相談できること
					</dt>
					<dd className="break-phrase text-base leading-[1.8] text-gray-700">
						実装と設計の相談、機能やデモの提案、記事とサイトの不具合の報告
					</dd>
				</div>
				<div className="grid gap-1 border-b border-gray-200 py-5 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8 md:py-6">
					<dt className="text-[15px] font-bold leading-[1.8] text-gray-950">
						連絡の方法
					</dt>
					{/* 空白を含む名前（GitHub Issues、Pull Request）は行をまたがせない */}
					<dd className="break-phrase text-base leading-[1.8] text-gray-700">
						記録を残して進めたい相談は
						<span className="whitespace-nowrap">GitHub Issues</span>
						で、実装前の相談や方針の意見交換はDiscordで受け付けています。修正を書けるときは、
						<a
							href={GITHUB_URL}
							target="_blank"
							rel="noopener noreferrer"
							aria-label="GitHubのリポジトリ（新しいタブで開く）"
							className="text-link whitespace-nowrap"
						>
							GitHubのリポジトリ
							<ExternalIcon className="ml-0.5 inline-block size-3 align-[-0.05em]" />
						</a>
						に<span className="whitespace-nowrap">Pull Request</span>
						を送ってください。
					</dd>
				</div>
				<div className="grid gap-1 border-b border-gray-200 py-5 md:grid-cols-[12rem_minmax(0,1fr)] md:gap-8 md:py-6">
					<dt className="text-[15px] font-bold leading-[1.8] text-gray-950">
						用意するとよいもの
					</dt>
					<dd className="break-phrase text-base leading-[1.8] text-gray-700">
						対象のページのURL、使っている端末とブラウザ、起きたこと。端末とブラウザは、
						<Link href="/report" className="text-link whitespace-nowrap">
							この端末のレポート
						</Link>
						の結果画像を添えると1枚で伝わります。
					</dd>
				</div>
			</dl>

			<div className="mt-8 flex flex-wrap gap-3">
				<a
					href={`${GITHUB_URL}/issues`}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="GitHub Issuesで相談する（新しいタブで開く）"
					className="btn btn-primary"
				>
					GitHub Issuesで相談する
					<ExternalIcon />
				</a>
				<a
					href={DISCORD_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Discordに参加する（新しいタブで開く）"
					className="btn btn-secondary"
				>
					Discordに参加する
					<ExternalIcon />
				</a>
			</div>
			<p className="mt-4 max-w-[40em] text-[13px] leading-[1.6] text-gray-500">
				公開しにくい話題を除き、相談はできるだけ公開の場で進めます。
			</p>
		</div>
	);
}
