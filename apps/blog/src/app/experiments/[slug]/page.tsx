import { experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleStructuredData } from "@/components/article-structured-data";
import { ExperimentLaunchPanel } from "@/components/experiment-launch-panel";
import { mdxComponents } from "@/components/mdx-components";
import { OptimizedImage } from "@/components/optimized-image";
import { SocialShare } from "@/components/social-share";
import { contentDateTime } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { THUMB_IMAGE_SIZES } from "@/lib/image-defaults";
import { SITE_URL } from "@/lib/site-url";

interface PageProps {
	params: Promise<{ slug: string }>;
}

function findDoc(slug: string) {
	return getDocs(experiments).find(
		(d) => getSlugFromPath(d.info.path) === slug,
	);
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return getDocs(experiments).map((doc) => ({
		slug: getSlugFromPath(doc.info.path),
	}));
}

export async function generateMetadata({
	params,
}: PageProps): Promise<Metadata> {
	const { slug } = await params;
	const doc = findDoc(slug);
	if (!doc) return {};

	const ogImage = doc.thumbnail
		? String(doc.thumbnail)
		: "/assets/ogp-default.png";
	const publishedDate = doc.date ? String(doc.date) : undefined;
	const modifiedDate = doc.updated ? String(doc.updated) : publishedDate;

	return {
		title: doc.title,
		description: doc.description,
		openGraph: {
			title: doc.title,
			description: doc.description,
			type: "article",
			publishedTime: contentDateTime(publishedDate),
			modifiedTime: contentDateTime(modifiedDate),
			tags: (doc.tags as string[] | undefined) || [],
			images: [{ url: ogImage, width: 1200, height: 630, alt: doc.title }],
		},
		twitter: {
			card: "summary_large_image",
			title: doc.title,
			description: doc.description,
			images: [ogImage],
		},
		alternates: { canonical: `/experiments/${slug}` },
	};
}

const difficultyLabel: Record<string, string> = {
	beginner: "初級",
	intermediate: "中級",
	advanced: "上級",
};

export default async function ExperimentPage({ params }: PageProps) {
	const { slug } = await params;
	const doc = findDoc(slug);
	if (!doc) notFound();

	const MDX = doc.body;
	const tags = doc.tags as string[] | undefined;
	const frameworks = doc.frameworks as string[] | undefined;
	const devices = doc.devices as string[] | undefined;
	const difficulty = String(doc.difficulty || "");
	const shareUrl = `${SITE_URL}/experiments/${slug}`;
	const image = doc.thumbnail ? String(doc.thumbnail) : "/ogp.png";
	const publishedDate = doc.date ? String(doc.date) : undefined;
	const modifiedDate = doc.updated ? String(doc.updated) : publishedDate;

	const metaItems = [
		difficulty && {
			label: "難易度",
			value: difficultyLabel[difficulty] || difficulty,
		},
		doc.estimatedTime && {
			label: "所要時間",
			value: `約${String(doc.estimatedTime)}分`,
		},
		frameworks &&
			frameworks.length > 0 && { label: "フレームワーク", badges: frameworks },
		devices && devices.length > 0 && { label: "対応デバイス", badges: devices },
	].filter(Boolean) as { label: string; value?: string; badges?: string[] }[];

	return (
		<div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<ArticleStructuredData
				title={doc.title}
				description={doc.description}
				path={`/experiments/${slug}`}
				image={image}
				datePublished={publishedDate}
				dateModified={modifiedDate}
				author="BANGEO"
				categoryLabel="デモ"
				categoryPath="/experiments"
				tags={tags}
			/>

			<header className="mb-8">
				<div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start">
					{doc.thumbnail && (
						<div className="w-full md:w-56 md:min-w-56 aspect-video overflow-hidden rounded-xl bg-gray-100 shrink-0 relative">
							<OptimizedImage
								src={String(doc.thumbnail)}
								alt={doc.title}
								fill
								sizes={THUMB_IMAGE_SIZES}
								priority
								className="object-cover"
							/>
						</div>
					)}
					<div className="flex-1 min-w-0">
						<div className="mb-3 flex flex-wrap items-center gap-2">
							{doc.category && (
								<span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-wide">
									{String(doc.category)}
								</span>
							)}
							{doc.date && (
								<time
									dateTime={contentDateTime(publishedDate)}
									className="text-xs text-gray-500 font-medium"
								>
									{String(doc.date)}
								</time>
							)}
							{doc.updated && doc.updated !== doc.date && (
								<time
									dateTime={contentDateTime(modifiedDate)}
									className="text-xs text-gray-500 font-medium"
								>
									更新: {String(doc.updated)}
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
								<p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-1">
									{item.label}
								</p>
								{item.value ? (
									<p className="text-sm font-bold text-gray-950">
										{item.value}
									</p>
								) : (
									<div className="flex flex-wrap gap-1.5">
										{item.badges?.map((b) => (
											<span
												key={b}
												className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-gray-700 border border-gray-200"
											>
												{b}
											</span>
										))}
									</div>
								)}
							</div>
						))}
					</div>
				</div>
			)}

			<SocialShare url={shareUrl} title={doc.title} className="mb-10" />

			<ExperimentLaunchPanel
				slug={slug}
				title={doc.title}
				href={doc.link ? String(doc.link) : undefined}
				devices={devices}
			/>

			<article className="tech-article-content max-w-none">
				<MDX components={mdxComponents} />
			</article>

			{doc.link && (
				<div className="mt-12 pt-8 border-t border-gray-100">
					<a
						href={String(doc.link)}
						target="_blank"
						rel="noopener noreferrer"
						className="inline-flex items-center gap-2 px-6 py-3 bg-[#e11d48] text-white text-sm font-bold rounded-xl hover:bg-[#be1b3e] transition-colors"
					>
						デモを試す
					</a>
				</div>
			)}

			<footer className="mt-12 pt-8 border-t border-gray-100">
				<Link
					href="/experiments"
					className="text-sm font-bold text-gray-600 hover:text-[#e11d48] transition-colors"
				>
					← デモ一覧に戻る
				</Link>
			</footer>
		</div>
	);
}
