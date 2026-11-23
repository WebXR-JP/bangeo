import type { ReactNode } from "react";

type PageHeaderProps = {
	/** ページタイトル（h1）。h1 に入っている検索語は変えない */
	title: ReactNode;
	/** リード文（1〜2文）。インラインの内容だけを渡す（<p> や <div> は入れない） */
	lead?: ReactNode;
	/** h1 の上の小さな前置き。情報があるときだけ（例: 「全39本」）。英語の飾りは入れない */
	kicker?: ReactNode;
	/** 確認日などの注記（例: 「確認日: 2026年11月18日」） */
	meta?: ReactNode;
	/** ページの頭に置くボタンやリンク。並べるときは横に並び、入らなければ折り返す */
	actions?: ReactNode;
	/**
	 * 渡すと、既定の下の余白（mb-12）と置き換わる（足し算ではない）。
	 * ほかのクラスを足すときも下の余白を一緒に書く。
	 * 例: すぐ下に上の余白を持つセクションが続くなら className="mb-0"
	 */
	className?: string;
};

/**
 * トップ以外のページの頭。左揃えで 前置き → h1 → リード文 → 注記 → ボタン の順に並べる。
 * コンテナ（max-w-* と左右の余白）は持たないので、呼ぶ側のコンテナの中に置く。
 *
 * @example
 * <PageHeader
 *   kicker="全39本"
 *   title="WebXR技術記事・ニュース"
 *   lead="ブラウザやライブラリのニュース、実装の技術解説、実機で試すガイドを新しい順に並べています。"
 *   meta="確認日: 2026年11月18日"
 *   actions={
 *     <Link
 *       href="/tech-articles/categories"
 *       className="text-link inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-bold"
 *     >
 *       カテゴリ一覧を見る
 *     </Link>
 *   }
 * />
 */
export function PageHeader({
	title,
	lead,
	kicker,
	meta,
	actions,
	className,
}: PageHeaderProps) {
	return (
		<header className={className ?? "mb-12"}>
			{kicker ? (
				<p className="mb-2 text-[13px] font-bold leading-[1.6] text-primary-700">
					{kicker}
				</p>
			) : null}
			<h1 className="text-3xl font-black leading-tight text-gray-950 md:text-4xl">
				{title}
			</h1>
			{lead ? (
				<p className="mt-3 max-w-[40em] break-phrase text-base leading-[1.8] text-gray-700 md:text-lg">
					{lead}
				</p>
			) : null}
			{meta ? (
				<div className="mt-3 text-[13px] leading-[1.6] text-gray-500">
					{meta}
				</div>
			) : null}
			{actions ? (
				<div className="mt-6 flex flex-wrap items-center gap-3">{actions}</div>
			) : null}
		</header>
	);
}
