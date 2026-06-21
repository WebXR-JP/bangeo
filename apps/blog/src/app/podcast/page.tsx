import { podcast } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { OptimizedImage } from "@/components/optimized-image";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { CARD_IMAGE_SIZES } from "@/lib/image-defaults";

export const metadata: Metadata = {
	title: "WebXR JPポッドキャスト｜XRの話題を気軽に",
	description:
		"WebXR JPコミュニティのメンバーがXR・WebXR・VR/ARの話題を気軽に語るポッドキャストのエピソード一覧です。",
	alternates: { canonical: "/podcast" },
};

function toEmbedUrl(spotifyUrl: string) {
	return spotifyUrl.replace(
		"open.spotify.com/episode/",
		"open.spotify.com/embed/episode/",
	);
}

export default function PodcastIndexPage() {
	const episodes = getDocs(podcast).sort((a, b) => {
		const epA = Number(a.episodeNumber || 0);
		const epB = Number(b.episodeNumber || 0);
		return epB - epA;
	});

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<BreadcrumbStructuredData
				items={[{ name: "ポッドキャスト", path: "/podcast" }]}
			/>
			<header className="mb-12">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-2">
					ポッドキャスト
				</h1>
				<p className="text-base text-gray-500">
					WebXR JPのポッドキャストエピソード一覧
				</p>
			</header>

			<div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-3">
				{episodes.map((ep) => {
					const slug = getSlugFromPath(ep.info.path);
					const spotifyUrl = ep.spotifyUrl ? String(ep.spotifyUrl) : null;
					const youtubeId = ep.youtubeId ? String(ep.youtubeId) : null;
					return (
						<div
							key={slug}
							className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent transition-all duration-300 flex flex-col"
						>
							{/* YouTube thumbnail or fallback */}
							<Link
								href={`/podcast/${slug}`}
								className="block aspect-video bg-gray-100 relative overflow-hidden"
							>
								{youtubeId ? (
									<OptimizedImage
										src={`https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg`}
										alt={ep.title}
										fill
										sizes={CARD_IMAGE_SIZES}
										className="object-cover group-hover:scale-105 transition-transform duration-500"
									/>
								) : (
									<div className="w-full h-full bg-gradient-to-br from-rose-50 to-gray-50 flex items-center justify-center">
										<span className="text-5xl font-black text-[#e11d48]/20">
											#{String(ep.episodeNumber || "")}
										</span>
									</div>
								)}
								{ep.duration && (
									<span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded">
										{String(ep.duration)}
									</span>
								)}
							</Link>

							{/* Info */}
							<Link
								href={`/podcast/${slug}`}
								className="p-5 flex-1 flex flex-col"
							>
								<div className="flex items-center gap-2 mb-2">
									<span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-wide">
										EP {String(ep.episodeNumber || "")}
									</span>
								</div>
								<h2 className="font-black text-base text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2 leading-snug">
									{ep.title}
								</h2>
								{ep.description && (
									<p className="text-sm text-gray-500 line-clamp-2 leading-relaxed flex-1">
										{ep.description}
									</p>
								)}
								<div className="mt-3 text-xs text-gray-500 font-medium">
									{ep.date && <time>{String(ep.date)}</time>}
								</div>
							</Link>

							{/* Spotify compact player */}
							{spotifyUrl && (
								<div className="border-t border-gray-100">
									<iframe
										src={`${toEmbedUrl(spotifyUrl)}?utm_source=generator&theme=0`}
										width="100%"
										height="80"
										allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
										loading="lazy"
										className="border-0"
										title={`${ep.title} - Spotify`}
									/>
								</div>
							)}
						</div>
					);
				})}
			</div>

			{episodes.length === 0 && (
				<div className="py-12 text-center">
					<p className="text-gray-500">まだエピソードがありません。</p>
				</div>
			)}
		</div>
	);
}
