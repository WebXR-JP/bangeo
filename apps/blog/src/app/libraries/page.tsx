import type { Metadata } from "next";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { LIBRARIES } from "@/data/libraries";

export const metadata: Metadata = {
	title: "WebXRライブラリ｜IWSDK・Three.js・Babylon.js・PlayCanvas・A-Frame",
	description:
		"WebXR開発で使われるThree.js、Babylon.js、PlayCanvas、A-Frame、React Three Fiberなどの主要ライブラリと公式ドキュメント・リポジトリへの導線を整理しています。",
	alternates: { canonical: "/libraries" },
};

/* BANGEO design · 骨格: 罫線で区切った行（名前と概要 → 行き先を書いた2本のリンク）·
   自己採点は報告に記載 */

/** 外向きの矢印（フッターと同じ形）。読み上げない */
function ExternalIcon() {
	return (
		<svg
			className="ml-0.5 inline-block size-3 shrink-0 align-[-0.05em]"
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

/** ドキュメントはドメイン名、GitHub は「オーナー/リポジトリ」で行き先を見せる */
function hostOf(url: string) {
	try {
		return new URL(url).hostname.replace(/^www\./, "");
	} catch {
		return url;
	}
}

function repositoryOf(url: string) {
	try {
		const { hostname, pathname } = new URL(url);
		const path = pathname.replace(/^\/|\/$/g, "");
		return hostname === "github.com" && path ? path : url;
	} catch {
		return url;
	}
}

const LINK =
	"text-link inline-flex min-h-11 items-center text-sm font-bold [overflow-wrap:anywhere] md:min-h-0";

export default function LibrariesPage() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "ライブラリ", path: "/libraries" }]}
			/>
			<PageHeader
				title="ライブラリ"
				lead={`WebXRの開発で使われる${LIBRARIES.length}つのライブラリと、それぞれの公式ドキュメントとGitHubリポジトリへのリンクです。`}
				meta="更新状況と導入方法は、リンク先で確認してください。"
			/>

			<ul className="divide-y divide-gray-200 border-y border-gray-200">
				{LIBRARIES.map((library) => (
					<li
						key={library.id}
						className="grid gap-x-12 gap-y-4 py-7 md:grid-cols-[minmax(0,34rem)_18rem]"
					>
						<div className="min-w-0">
							<h2 className="text-xl font-bold leading-snug text-gray-950">
								{library.name}
							</h2>
							<p className="mt-2 max-w-[40em] text-sm leading-[1.7] text-gray-700">
								{library.description}
							</p>
						</div>
						<dl className="grid content-start gap-3">
							<div>
								<dt className="text-xs font-bold leading-[1.6] text-gray-500">
									公式ドキュメント
								</dt>
								<dd>
									<a
										href={library.documentationUrl}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${library.name}の公式ドキュメント ${hostOf(library.documentationUrl)}（新しいタブで開く）`}
										className={LINK}
									>
										{hostOf(library.documentationUrl)}
										<ExternalIcon />
									</a>
								</dd>
							</div>
							<div>
								<dt className="text-xs font-bold leading-[1.6] text-gray-500">
									GitHub
								</dt>
								<dd>
									<a
										href={library.repositoryUrl}
										target="_blank"
										rel="noopener noreferrer"
										aria-label={`${library.name}のGitHubリポジトリ ${repositoryOf(library.repositoryUrl)}（新しいタブで開く）`}
										className={LINK}
									>
										{repositoryOf(library.repositoryUrl)}
										<ExternalIcon />
									</a>
								</dd>
							</div>
						</dl>
					</li>
				))}
			</ul>
		</div>
	);
}
