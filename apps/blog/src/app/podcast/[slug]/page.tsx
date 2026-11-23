import { blog, experiments, podcast } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleStructuredData } from "@/components/article-structured-data";
import { mdxComponents } from "@/components/mdx-components";
import { SocialShare } from "@/components/social-share";
import { collectTags, tagPath } from "@/lib/collect-tags";
import { contentDateTime, formatContentDate } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { SITE_URL } from "@/lib/site-url";

interface PageProps {
	params: Promise<{ slug: string }>;
}

function findDoc(slug: string) {
	return getDocs(podcast).find((d) => getSlugFromPath(d.info.path) === slug);
}

function toEmbedUrl(spotifyUrl: string) {
	return spotifyUrl.replace(
		"open.spotify.com/episode/",
		"open.spotify.com/embed/episode/",
	);
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return getDocs(podcast).map((doc) => ({
		slug: getSlugFromPath(doc.info.path),
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const doc = findDoc(slug);
	if (!doc) return {};

	return {
		title: doc.title,
		description: doc.description,
		openGraph: {
			title: doc.title,
			description: doc.description,
			type: "article",
			publishedTime: doc.date ? String(doc.date) : undefined,
			tags: (doc.tags as string[] | undefined) || [],
			images: [{ url: "/ogp.png", width: 1200, height: 630, alt: doc.title }],
		},
		twitter: {
			card: "summary_large_image",
			title: doc.title,
			description: doc.description,
			images: ["/ogp.png"],
		},
		alternates: { canonical: `/podcast/${slug}` },
		robots: { index: false, follow: true },
	};
}

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

export default async function PodcastEpisodePage({ params }: PageProps) {
	const { slug } = await params;
	const doc = findDoc(slug);
	if (!doc) notFound();

	const MDX = doc.body;
	const tags = doc.tags as string[] | undefined;
	const uniqueTags = tags ? [...new Set(tags)] : [];
	// タグのページ（/tags/[tag]）があるのは、技術記事とデモに付いたタグだけ。
	// ないタグはリンクにせず、文字だけのチップにする（404 に送らない）
	const tagsWithPage = new Set(
		collectTags([...getDocs(blog), ...getDocs(experiments)]),
	);

	const spotifyUrl = doc.spotifyUrl ? String(doc.spotifyUrl) : null;
	const youtubeId = doc.youtubeId ? String(doc.youtubeId) : null;
	const shareUrl = `${SITE_URL}/podcast/${slug}`;
	const date = doc.date ? String(doc.date) : undefined;
	const dateText = formatContentDate(date);
	const duration = doc.duration
		? formatDuration(String(doc.duration))
		: undefined;

	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<ArticleStructuredData
				title={doc.title}
				description={doc.description}
				path={`/podcast/${slug}`}
				image="/ogp.png"
				datePublished={
					doc.pubDate ? String(doc.pubDate) : String(doc.date || "")
				}
				author="BANGEO"
				categoryLabel="ポッドキャスト"
				categoryPath="/podcast"
				tags={tags}
			/>
			<article className="mx-auto max-w-[40rem]">
				<header>
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[13px] leading-[1.6] text-gray-500">
						{doc.episodeNumber ? (
							<span className="chip chip-brand tabular-nums">
								第{String(doc.episodeNumber)}回
							</span>
						) : null}
						{dateText ? (
							<time dateTime={contentDateTime(date)}>{dateText}</time>
						) : null}
						{duration ? (
							<time dateTime={duration.iso}>{duration.text}</time>
						) : null}
					</div>
					<h1 className="mt-3 text-2xl font-black leading-snug text-gray-950 md:text-[2rem]">
						{doc.title}
					</h1>
					{doc.description ? (
						<p className="mt-4 text-base leading-[1.8] text-gray-700 md:text-lg">
							{doc.description}
						</p>
					) : null}
					{uniqueTags.length > 0 ? (
						<ul aria-label="タグ" className="mt-3 flex flex-wrap gap-x-2">
							{uniqueTags.map((tag) => (
								<li key={tag}>
									{tagsWithPage.has(tag) ? (
										// 押せる範囲は高さ 44px（PCは 36px）、見た目はチップ。輪はチップに出す
										<Link
											href={tagPath(tag)}
											prefetch={false}
											className="group inline-flex min-h-11 items-center rounded-full focus-visible:outline-none md:min-h-9"
										>
											<span className="chip transition-colors group-hover:bg-gray-200 group-hover:text-gray-950 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary-600">
												{tag}
											</span>
										</Link>
									) : (
										// リンクのチップと行の高さをそろえる
										<span className="inline-flex min-h-11 items-center md:min-h-9">
											<span className="chip">{tag}</span>
										</span>
									)}
								</li>
							))}
						</ul>
					) : null}
				</header>

				{/* プレーヤーの枠は先に大きさを決めておき、読み込みで下の文章がずれないようにする */}
				{youtubeId ? (
					<div className="mt-6 aspect-video overflow-hidden rounded-2xl bg-gray-100">
						<iframe
							src={`https://www.youtube.com/embed/${youtubeId}`}
							width="100%"
							height="100%"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							loading="lazy"
							className="block h-full w-full border-0"
							title={`${doc.title} - YouTube`}
						/>
					</div>
				) : null}

				{spotifyUrl ? (
					<div className="mt-4 h-[152px] overflow-hidden rounded-xl bg-gray-100">
						<iframe
							src={`${toEmbedUrl(spotifyUrl)}?utm_source=generator&theme=0`}
							width="100%"
							height="152"
							allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
							loading="lazy"
							className="block border-0"
							title={`${doc.title} - Spotify Player`}
						/>
					</div>
				) : null}

				<div className="tech-article-content mt-10 md:mt-12">
					<MDX components={mdxComponents} />
				</div>

				<footer className="mt-16 border-t border-gray-200 pt-8">
					<SocialShare url={shareUrl} title={doc.title} align="start" />
					<p className="mt-8">
						<Link
							href="/podcast"
							className="text-link inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold"
						>
							ポッドキャストの一覧を見る
						</Link>
					</p>
				</footer>
			</article>
		</div>
	);
}
