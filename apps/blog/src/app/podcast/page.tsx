import { podcast } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { contentDateTime, formatContentDate } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

export const metadata: Metadata = {
	title: "WebXR JPポッドキャスト｜XRの話題を気軽に",
	description:
		"WebXR JPコミュニティのメンバーがXR・WebXR・VR/ARの話題を気軽に語るポッドキャストのエピソード一覧です。",
	alternates: { canonical: "/podcast" },
	robots: { index: false, follow: true },
};

/**
 * フロントマターの再生時間（"1:13:25" / "47:21"）を、音声アプリと同じく分までの「1時間13分」「47分」にする。
 * 秒まで正確な値は <time dateTime>（PT1H13M25S）に残す。読めない値は undefined
 */
function formatDuration(
	value: string,
): { text: string; iso: string } | undefined {
	const parts = value.split(":").map((part) => Number(part));
	if (parts.length < 2 || parts.length > 3 || parts.some(Number.isNaN)) {
		return undefined;
	}
	const [hours, minutes, seconds] =
		parts.length === 3 ? parts : [0, parts[0], parts[1]];
	const text =
		hours > 0
			? `${hours}時間${minutes > 0 ? `${minutes}分` : ""}`
			: minutes > 0
				? `${minutes}分`
				: `${seconds}秒`;
	return {
		text,
		iso: `PT${hours ? `${hours}H` : ""}${minutes}M${seconds}S`,
	};
}

export default function PodcastIndexPage() {
	const episodes = getDocs(podcast).sort((a, b) => {
		const epA = Number(a.episodeNumber || 0);
		const epB = Number(b.episodeNumber || 0);
		return epB - epA;
	});

	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "ポッドキャスト", path: "/podcast" }]}
			/>
			<PageHeader
				kicker={episodes.length > 0 ? `全${episodes.length}回` : undefined}
				title="ポッドキャスト"
				lead="WebXR JPのメンバーがXRの話題を話す音声番組です。"
			/>

			{episodes.length > 0 ? (
				// 1件 = 回の番号 + 日付 + 再生時間 → タイトル → 説明。各回のページでYouTubeとSpotifyのプレーヤーを開ける
				<ol className="card max-w-3xl divide-y divide-gray-100 overflow-hidden">
					{episodes.map((ep) => {
						const slug = getSlugFromPath(ep.info.path);
						const date = ep.date ? String(ep.date) : undefined;
						const dateText = formatContentDate(date);
						const duration = ep.duration
							? formatDuration(String(ep.duration))
							: undefined;
						return (
							<li key={slug}>
								<Link
									href={`/podcast/${slug}`}
									prefetch={false}
									className="group block px-5 py-5 transition-colors hover:bg-gray-50 focus-visible:-outline-offset-2 md:px-6"
								>
									<div className="mb-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-[1.6] text-gray-500">
										{ep.episodeNumber ? (
											<span className="chip chip-brand tabular-nums">
												第{String(ep.episodeNumber)}回
											</span>
										) : null}
										{dateText ? (
											<time dateTime={contentDateTime(date)}>{dateText}</time>
										) : null}
										{duration ? (
											<time dateTime={duration.iso}>{duration.text}</time>
										) : null}
									</div>
									<h2 className="text-base font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700 md:text-lg">
										{ep.title}
									</h2>
									{ep.description ? (
										<p className="mt-1.5 line-clamp-2 max-w-[40em] break-phrase text-sm leading-[1.7] text-gray-600">
											{ep.description}
										</p>
									) : null}
								</Link>
							</li>
						);
					})}
				</ol>
			) : (
				<div>
					<p className="text-base leading-[1.8] text-gray-700">
						公開している回はまだありません。
					</p>
					<Link
						href="/tech-articles"
						className="text-link mt-2 inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold"
					>
						技術記事の一覧を見る
					</Link>
				</div>
			)}
		</div>
	);
}
