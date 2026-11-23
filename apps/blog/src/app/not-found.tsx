import type { Metadata } from "next";
import Link from "next/link";
import { OptimizedImage } from "@/components/optimized-image";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = {
	title: "ページが見つかりません",
	// ルートの canonical（トップページ）と hreflang を引き継がない
	alternates: { canonical: null },
};

/** トップページのほかに案内する行き先 */
const destinations = [
	{ href: "/tech-articles", label: "技術記事の一覧を見る" },
	{ href: "/report", label: "この端末のレポートを見る" },
	{ href: "/search", label: "サイト内を検索する" },
] as const;

/**
 * 存在しない URL の画面。
 * ルートのレイアウト（ヘッダーとフッター）の中に出る
 */
export default function NotFound() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<PageHeader
				kicker="404"
				title={
					<span className="inline-flex items-center gap-3">
						ページが見つかりません
						{/* マスコットの画像は白地なので、
						    乗算で背景になじませる。
						    狭い幅では見出しを折らないよう出さない */}
						<OptimizedImage
							src="/favicon.png"
							alt=""
							width={48}
							height={48}
							sizes="48px"
							className="hidden size-10 shrink-0 mix-blend-multiply sm:block md:size-12"
						/>
					</span>
				}
				lead="URLが変わったか、ページが削除された可能性があります。トップページに戻るか、下の一覧から探してください。"
				actions={
					<Link href="/" className="btn btn-primary btn-lg">
						トップページへ戻る
					</Link>
				}
				className="mb-8"
			/>

			<ul className="flex flex-col items-start">
				{destinations.map((item) => (
					<li key={item.href}>
						<Link
							href={item.href}
							className="text-link inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-base font-bold"
						>
							{item.label}
							<svg
								className="size-4 shrink-0"
								viewBox="0 0 24 24"
								fill="none"
								stroke="currentColor"
								strokeWidth={2}
								strokeLinecap="round"
								strokeLinejoin="round"
								aria-hidden="true"
							>
								<path d="M9 5l7 7-7 7" />
							</svg>
						</Link>
					</li>
				))}
			</ul>
		</div>
	);
}
