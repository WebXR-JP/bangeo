import Link from "next/link";
import { OptimizedImage } from "@/components/optimized-image";
import {
	contentDateTime,
	formatContentDate,
	parseContentDate,
} from "@/lib/content-dates";
import { NO_IMAGE } from "@/lib/image-defaults";

/**
 * 標準のグリッドに置いたときの画像の表示幅。
 * 標準のグリッド = max-w-6xl・左右 px-5 / md:px-8 のコンテナの中で、1列 → 768px〜2列 → 1024px〜3列、gap-6。
 * これと違う幅の場所に置くときは、ArticleCard の sizes に実際の表示幅を渡す
 */
export const ARTICLE_CARD_IMAGE_SIZES =
	"(min-width: 1152px) 347px, (min-width: 1024px) calc((100vw - 112px) / 3), (min-width: 768px) calc(50vw - 44px), calc(100vw - 40px)";

/**
 * カテゴリの表示名の対応表（サイト全体でここ1か所だけ）。
 * フロントマターの値は変えず、画面に出すときだけ日本語にそろえる。表にない値はそのまま出す
 */
const CATEGORY_LABELS = new Map<string, string>([
	["NEWS", "ニュース"],
	["TECH", "技術解説"],
	["GUIDE", "ガイド"],
]);

/** フロントマターのカテゴリ（NEWS / TECH / GUIDE / チュートリアル）を画面の表示名にする */
export function articleCategoryLabel(category: string): string {
	const value = category.trim();
	return CATEGORY_LABELS.get(value.toUpperCase()) ?? value;
}

/**
 * 一覧に出す日付（ArticleCard と、行で並べる一覧で同じ決まりを使う）。
 * updated が date より後の日なら更新日を返し、isRevised を true にする（画面では「◯年◯月◯日更新」）。
 * value は <time dateTime> 用の元の値、text は「2026年11月18日」の形
 */
export function articleListDate(
	date?: string,
	updated?: string,
): { value?: string; text?: string; isRevised: boolean } {
	const published = parseContentDate(date);
	const revised = parseContentDate(updated);
	const isRevised =
		revised !== undefined &&
		(published === undefined || revised.getTime() > published.getTime());
	const value = isRevised ? updated : date;
	return { value, text: formatContentDate(value), isRevised };
}

const VISIBLE_TAG_COUNT = 3;

type ArticleCardProps = {
	href: string;
	title: string;
	description?: string;
	/** 無ければ NO_IMAGE */
	thumbnail?: string;
	/** フロントマターの値そのまま（表示名への置き換えは部品の中で行う） */
	category?: string;
	/** フロントマターの値そのまま（"2026-11-18" も "2026年11月10日" も可） */
	date?: string;
	/**
	 * 更新日。フロントマターの値そのまま。date より後の日のときだけ、
	 * 日付の代わりに「2026年10月14日更新」と出す（一覧を updated ?? date で並べるときに渡す）
	 */
	updated?: string;
	/** 3つまで表示し、残りは「+N」 */
	tags?: string[];
	/** 最初の1画面でいちばん大きい画像だけ true（既定 false） */
	priority?: boolean;
	/**
	 * 既定 false（長い一覧で数十件の先読みが走るのを防ぐ）。
	 * true にすると Next.js の既定の先読み（prefetch="auto"）になる
	 */
	prefetch?: boolean;
	/** 既定 "h3"。ページ直下に並べて上に h2 がないときは "h2" */
	headingLevel?: "h2" | "h3";
	/** 画像の表示幅。既定は標準のグリッド（ARTICLE_CARD_IMAGE_SIZES） */
	sizes?: string;
};

/**
 * 記事カード。カード全体が1つのリンクで、中に別のリンクやボタンを入れない（タグは文字として出す）。
 * グリッドの中で同じ行のカードは同じ高さに伸び、タグはカードの下端にそろう。
 *
 * @example
 * <ul className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
 *   {posts.map((post, index) => {
 *     const slug = getSlugFromPath(post.info.path);
 *     return (
 *       <li key={slug} className="min-w-0">
 *         <ArticleCard
 *           href={`/tech-articles/${slug}`}
 *           title={post.title}
 *           description={post.description}
 *           thumbnail={post.thumbnail}
 *           category={post.category}
 *           date={post.date}
 *           updated={post.updated}
 *           tags={post.tags}
 *           headingLevel="h2"
 *           priority={index === 0}
 *         />
 *       </li>
 *     );
 *   })}
 * </ul>
 */
export function ArticleCard({
	href,
	title,
	description,
	thumbnail,
	category,
	date,
	updated,
	tags,
	priority = false,
	prefetch = false,
	headingLevel = "h3",
	sizes = ARTICLE_CARD_IMAGE_SIZES,
}: ArticleCardProps) {
	const Heading = headingLevel;
	const categoryLabel = category ? articleCategoryLabel(category) : "";

	const {
		value: shownDate,
		text: dateText,
		isRevised,
	} = articleListDate(date, updated);

	const uniqueTags = tags ? [...new Set(tags)] : [];
	const visibleTags = uniqueTags.slice(0, VISIBLE_TAG_COUNT);
	const hiddenTagCount = uniqueTags.length - visibleTags.length;

	return (
		<Link
			href={href}
			prefetch={prefetch ? "auto" : false}
			className="group card card-link flex h-full flex-col overflow-hidden"
		>
			<div className="relative aspect-video shrink-0 bg-gray-100">
				<OptimizedImage
					src={thumbnail || NO_IMAGE}
					alt=""
					fill
					sizes={sizes}
					priority={priority}
					className="object-cover"
				/>
			</div>
			<div className="flex flex-1 flex-col p-5 md:p-6">
				{categoryLabel || dateText ? (
					<div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
						{categoryLabel ? (
							<span className="chip chip-brand">{categoryLabel}</span>
						) : null}
						{dateText ? (
							<span className="text-[13px] leading-[1.6] text-gray-500">
								<time dateTime={contentDateTime(shownDate)}>{dateText}</time>
								{isRevised ? "更新" : null}
							</span>
						) : null}
					</div>
				) : null}
				<Heading className="text-lg font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700">
					{title}
				</Heading>
				{description ? (
					<p className="mt-2 line-clamp-2 break-phrase wrap-anywhere text-sm leading-[1.7] text-gray-600">
						{description}
					</p>
				) : null}
				{visibleTags.length > 0 ? (
					<div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
						{visibleTags.map((tag) => (
							<span key={tag} className="chip">
								{tag}
							</span>
						))}
						{hiddenTagCount > 0 ? (
							<span className="text-xs font-bold text-gray-500">
								<span aria-hidden="true">+{hiddenTagCount}</span>
								<span className="sr-only">ほか{hiddenTagCount}件</span>
							</span>
						) : null}
					</div>
				) : null}
			</div>
		</Link>
	);
}
