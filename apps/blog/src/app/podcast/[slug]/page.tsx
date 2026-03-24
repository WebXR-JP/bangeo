import { podcast } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { mdxComponents } from "@/components/mdx-components";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

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
		},
		alternates: { canonical: `/podcast/${slug}` },
	};
}

export default async function PodcastEpisodePage({ params }: PageProps) {
	const { slug } = await params;
	const doc = findDoc(slug);
	if (!doc) notFound();

	const MDX = doc.body;
	const tags = doc.tags as string[] | undefined;

	const spotifyUrl = doc.spotifyUrl ? String(doc.spotifyUrl) : null;
	const youtubeId = doc.youtubeId ? String(doc.youtubeId) : null;

	const metaItems = [
		doc.episodeNumber && {
			label: "エピソード",
			value: `#${String(doc.episodeNumber)}`,
		},
		doc.duration && { label: "再生時間", value: String(doc.duration) },
		doc.date && { label: "公開日", value: String(doc.date) },
	].filter(Boolean) as { label: string; value: string }[];

	return (
		<div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-20">
			{/* Hero: episode icon + header side-by-side */}
			<header className="mb-8">
				<div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
					<div className="w-full md:w-56 md:min-w-56 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-rose-50 to-gray-50 flex items-center justify-center shrink-0">
						<span className="text-5xl font-black text-[#e11d48]/20">
							#{String(doc.episodeNumber || "")}
						</span>
					</div>
					<div className="flex-1 min-w-0">
						<div className="mb-3 flex flex-wrap items-center gap-2">
							<span className="px-2.5 py-1 bg-rose-50 text-[#e11d48] rounded-md text-[10px] font-black uppercase tracking-wide">
								EP {String(doc.episodeNumber || "")}
							</span>
							{doc.date && (
								<time className="text-xs text-gray-400 font-medium">
									{String(doc.date)}
								</time>
							)}
						</div>
						<h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-950 mb-3 leading-tight">
							{doc.title}
						</h1>
						{doc.description && (
							<p className="text-base text-gray-500 leading-relaxed mb-4">
								{doc.description}
							</p>
						)}
						{tags && tags.length > 0 && (
							<div className="flex flex-wrap gap-1.5">
								{tags.map((tag) => (
									<Link
										key={tag}
										href={`/tags/${encodeURIComponent(tag)}`}
										className="px-2.5 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs font-medium hover:bg-rose-50 hover:text-[#e11d48] transition-colors"
									>
										#{tag}
									</Link>
								))}
							</div>
						)}
					</div>
				</div>
			</header>

			{/* Meta info bar */}
			{metaItems.length > 0 && (
				<div className="mb-10 rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden">
					<div
						className="grid divide-x divide-gray-100"
						style={{
							gridTemplateColumns: `repeat(${metaItems.length}, minmax(0, 1fr))`,
						}}
					>
						{metaItems.map((item) => (
							<div key={item.label} className="px-5 py-3.5">
								<p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1">
									{item.label}
								</p>
								<p className="text-sm font-bold text-gray-950">{item.value}</p>
							</div>
						))}
					</div>
				</div>
			)}

			{/* YouTube embed player */}
			{youtubeId && (
				<div className="mb-6 aspect-video rounded-xl overflow-hidden bg-gray-100">
					<iframe
						src={`https://www.youtube.com/embed/${youtubeId}`}
						width="100%"
						height="100%"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
						allowFullScreen
						loading="lazy"
						className="border-0 w-full h-full"
						title={`${doc.title} - YouTube`}
					/>
				</div>
			)}

			{/* Spotify embed player */}
			{spotifyUrl && (
				<div className="mb-10 rounded-xl overflow-hidden">
					<iframe
						src={`${toEmbedUrl(spotifyUrl)}?utm_source=generator&theme=0`}
						width="100%"
						height="152"
						allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
						loading="lazy"
						className="border-0"
						title={`${doc.title} - Spotify Player`}
					/>
				</div>
			)}

			<article className="tech-article-content max-w-none">
				<MDX components={mdxComponents} />
			</article>

			<footer className="mt-12 pt-8 border-t border-gray-100">
				<Link
					href="/podcast"
					className="text-sm font-bold text-gray-400 hover:text-[#e11d48] transition-colors"
				>
					← エピソード一覧に戻る
				</Link>
			</footer>
		</div>
	);
}
