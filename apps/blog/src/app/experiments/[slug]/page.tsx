import { experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleStructuredData } from "@/components/article-structured-data";
import { ExperimentLaunchPanel } from "@/components/experiment-launch-panel";
import { mdxComponents } from "@/components/mdx-components";
import { OptimizedImage } from "@/components/optimized-image";
import { PageHeader } from "@/components/page-header";
import { SocialShare } from "@/components/social-share";
import {
	contentDateTime,
	contentDateValue,
	formatContentDate,
} from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";
import { SITE_URL } from "@/lib/site-url";

/** 見出しの下に置くサムネイルの表示幅（max-w-4xl・左右 20px / 32px のコンテナいっぱい） */
const HEADER_IMAGE_SIZES = "(min-width: 896px) 832px, calc(100vw - 40px)";

interface PageProps {
	params: Promise<{ slug: string }>;
}

function findDoc(slug: string) {
	return getDocs(experiments).find(
		(d) => !d.draft && getSlugFromPath(d.info.path) === slug,
	);
}

export async function generateStaticParams(): Promise<{ slug: string }[]> {
	return getDocs(experiments)
		.filter((doc) => !doc.draft)
		.map((doc) => ({
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
		robots: { index: false, follow: true },
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

	// 更新日が公開日より後のときだけ「◯年◯月◯日更新」を添える（記事カードと同じ）
	const publishedText = formatContentDate(publishedDate);
	const revisedText =
		doc.updated &&
		contentDateValue(String(doc.updated)) > contentDateValue(publishedDate)
			? formatContentDate(String(doc.updated))
			: undefined;

	return (
		<div className="max-w-4xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
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

			<PageHeader
				kicker={doc.category ? String(doc.category) : undefined}
				title={doc.title}
				lead={doc.description}
				meta={
					publishedText ? (
						<>
							<time dateTime={contentDateTime(publishedDate)}>
								{publishedText}
							</time>
							{revisedText && (
								<>
									（
									<time dateTime={contentDateTime(modifiedDate)}>
										{revisedText}
									</time>
									更新）
								</>
							)}
						</>
					) : undefined
				}
				actions={
					tags && tags.length > 0 ? (
						<ul aria-label="タグ" className="flex flex-wrap gap-x-2">
							{tags.map((tag) => (
								<li key={tag}>
									{/* 押せる範囲は高さ 44px（PCは 36px）、見た目はチップ。輪はチップに出す（技術記事の詳細と同じ形） */}
									<Link
										href={`/tags/${encodeURIComponent(tag)}`}
										className="group inline-flex min-h-11 items-center rounded-full focus-visible:outline-none md:min-h-9"
									>
										<span className="chip transition-colors group-hover:bg-gray-200 group-hover:text-gray-950 group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-primary-600">
											{tag}
										</span>
									</Link>
								</li>
							))}
						</ul>
					) : undefined
				}
				className="mb-8"
			/>

			{doc.thumbnail && (
				<div className="relative mb-10 aspect-video overflow-hidden rounded-2xl bg-gray-100">
					<OptimizedImage
						src={String(doc.thumbnail)}
						alt={doc.title}
						fill
						sizes={HEADER_IMAGE_SIZES}
						priority
						className="object-cover"
					/>
				</div>
			)}

			{metaItems.length > 0 && (
				<dl className="mb-10 grid grid-cols-2 gap-x-6 gap-y-4 rounded-2xl bg-gray-50 px-5 py-4 md:grid-cols-4">
					{metaItems.map((item) => (
						<div key={item.label} className="min-w-0">
							<dt className="text-xs font-bold text-gray-500">{item.label}</dt>
							{item.value ? (
								<dd className="mt-1 text-sm font-bold text-gray-950">
									{item.value}
								</dd>
							) : (
								<dd className="mt-1 flex flex-wrap gap-1.5">
									{item.badges?.map((b) => (
										<span key={b} className="chip bg-white text-gray-700">
											{b}
										</span>
									))}
								</dd>
							)}
						</div>
					))}
				</dl>
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

			<footer className="mt-12 border-t border-gray-200 pt-6">
				<Link
					href="/experiments"
					className="text-link inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold"
				>
					WebXR対応レポートを見る
				</Link>
			</footer>
		</div>
	);
}
