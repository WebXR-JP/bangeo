import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { type PlatformProfile, WEBXR_PLATFORMS } from "@/data/platforms";

export const metadata: Metadata = {
	title:
		"WebXRプラットフォーム｜Quest Browser・iOS Safari・visionOS・Chrome・Edge",
	description:
		"WebXRを実装・配信・体験するための主要ブラウザプラットフォーム（Meta Quest Browser、Wolvic、Safari on visionOS、Chrome、Edge、Samsung Internet）や代表サービスを整理しています。",
	alternates: { canonical: "/platforms" },
};

/* BANGEO design · 骨格: 罫線で区切った行の一覧（名前と行き先 → 対応と特徴 → 注記）·
   自己採点は報告に記載 */

const SECTIONS: Array<{
	category: PlatformProfile["category"];
	title: string;
}> = [
	{ category: "browser", title: "WebXRに対応するブラウザ" },
	{ category: "service", title: "Webで体験できるXRサービス" },
];

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

const URL_PATTERN = /https?:\/\/[^\s（）()「」、。]+/g;

/**
 * 生の URL の見せ方。パスの ID や版番号まで出すと読めないので、ホスト名と、語になっている末尾だけを出す
 * （developers.meta.com/…/2d-web、bugs.webkit.org）。href はデータの URL のまま
 */
function shortUrl(url: string) {
	try {
		const { hostname, pathname } = new URL(url);
		const host = hostname.replace(/^www\./, "");
		const segments = pathname.split("/").filter(Boolean);
		const last = segments[segments.length - 1] ?? "";
		if (!/^(?!\d+$)[\w-]+$/.test(last)) return host;
		return segments.length > 1 ? `${host}/…/${last}` : `${host}/${last}`;
	} catch {
		return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
	}
}

/** 注記に入っている生の URL を押せるリンクにする（前後の文字はデータのまま。表示は shortUrl） */
function Linkified({ text }: { text: string }) {
	const parts: ReactNode[] = [];
	let cursor = 0;
	for (const match of text.matchAll(URL_PATTERN)) {
		const url = match[0];
		const start = match.index ?? 0;
		if (start > cursor) parts.push(text.slice(cursor, start));
		const shown = shortUrl(url);
		// 外向きの印だけが次の行に送られないよう、末尾の語と印を折らずにつなげる
		const tailStart = Math.max(shown.search(/[^/.\-…]+$/), 0);
		parts.push(
			<a
				key={start}
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={`${shown}（新しいタブで開く）`}
				className="text-link [overflow-wrap:anywhere]"
			>
				{shown.slice(0, tailStart)}
				<span className="whitespace-nowrap">
					{shown.slice(tailStart)}
					<ExternalIcon />
				</span>
			</a>,
		);
		cursor = start + url.length;
	}
	if (cursor < text.length) parts.push(text.slice(cursor));
	return <>{parts}</>;
}

/** 行き先の名前。外部はドメイン名（www. を省く）、サイト内は技術記事 */
function destinationLabel(link: string) {
	try {
		return new URL(link).hostname.replace(/^www\./, "");
	} catch {
		return link;
	}
}

function PlatformRow({ platform }: { platform: PlatformProfile }) {
	const internal = platform.link.startsWith("/");
	const linkClassName =
		"text-link mt-1 inline-flex min-h-11 items-center text-[13px] font-bold leading-[1.6] md:min-h-0";
	return (
		<li className="grid gap-x-10 gap-y-3 py-6 md:grid-cols-[13rem_minmax(0,1fr)] lg:grid-cols-[15rem_minmax(0,1fr)_minmax(0,19rem)]">
			<div className="min-w-0">
				<h3 className="text-lg font-bold leading-snug text-gray-950">
					{platform.name}
				</h3>
				{internal ? (
					<Link href={platform.link} className={linkClassName}>
						<span className="sr-only">{platform.name}の</span>
						解説記事を読む
					</Link>
				) : (
					<a
						href={platform.link}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={`${platform.name}: ${destinationLabel(platform.link)}（新しいタブで開く）`}
						className={linkClassName}
					>
						{destinationLabel(platform.link)}
						<ExternalIcon />
					</a>
				)}
			</div>
			<ul className="min-w-0 space-y-1.5 text-sm leading-[1.7] text-gray-700">
				{platform.features.map((feature) => (
					<li key={feature} className="flex gap-2.5">
						<span
							aria-hidden="true"
							className="mt-[0.7em] size-1 shrink-0 rounded-full bg-gray-400"
						/>
						<span className="min-w-0 [overflow-wrap:anywhere]">{feature}</span>
					</li>
				))}
			</ul>
			{platform.notes ? (
				<p className="min-w-0 text-[13px] leading-[1.6] text-gray-600 [overflow-wrap:anywhere] md:col-start-2 lg:col-start-3">
					<Linkified text={platform.notes} />
				</p>
			) : null}
		</li>
	);
}

export default function PlatformsPage() {
	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "プラットフォーム", path: "/platforms" }]}
			/>
			<PageHeader
				title="プラットフォーム"
				lead="WebXRに対応するブラウザと、Webで体験できるXRサービスの一覧です。対応する機能と注意点を、公式情報へのリンクとあわせて載せています。"
			/>

			<div className="space-y-16 md:space-y-20">
				{SECTIONS.map((section) => {
					const platforms = WEBXR_PLATFORMS.filter(
						(platform) => platform.category === section.category,
					);
					if (platforms.length === 0) return null;
					return (
						<section
							key={section.category}
							aria-labelledby={`${section.category}-heading`}
						>
							<h2
								id={`${section.category}-heading`}
								className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
							>
								{section.title}
								<span className="ml-3 text-base font-bold text-gray-500 tabular-nums">
									{platforms.length}件
								</span>
							</h2>
							<ul className="mt-6 divide-y divide-gray-200 border-y border-gray-200">
								{platforms.map((platform) => (
									<PlatformRow key={platform.id} platform={platform} />
								))}
							</ul>
						</section>
					);
				})}
			</div>
		</div>
	);
}
