import Link from "next/link";
import { OptimizedImage } from "@/components/optimized-image";
import { ICON_IMAGE_SIZES } from "@/lib/image-defaults";
import {
	FOOTER_BOTTOM_LINKS,
	FOOTER_LINK_GROUPS,
	type NavItem,
} from "@/lib/navigation";

/** ページではなくファイル（/rss.xml、/sitemap.xml）。Link の先読みと画面遷移を通さず、ふつうのリンクで開く */
function isFileHref(href: string) {
	return /\.[a-z0-9]+$/i.test(href);
}

function ExternalIcon() {
	return (
		<svg
			className="size-3 shrink-0 text-gray-500"
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

/** サイト内のページは Link。外部は新しいタブで開き、外向きの矢印と読み上げの補足を付ける */
function FooterLink({ item, className }: { item: NavItem; className: string }) {
	if (item.external) {
		return (
			<a
				href={item.href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={`${item.name}（新しいタブで開く）`}
				className={className}
			>
				{item.name}
				<ExternalIcon />
			</a>
		);
	}
	if (isFileHref(item.href)) {
		return (
			<a href={item.href} className={className}>
				{item.name}
			</a>
		);
	}
	return (
		<Link href={item.href} className={className}>
			{item.name}
		</Link>
	);
}

export function Footer() {
	return (
		<footer className="mt-16 border-t border-gray-200 bg-gray-50 md:mt-24">
			<div className="mx-auto max-w-6xl px-5 pt-12 pb-8 md:px-8 md:pt-16 md:pb-12">
				<div className="grid gap-8 lg:grid-cols-[minmax(0,18rem)_minmax(0,1fr)] lg:gap-16">
					<div>
						<Link
							href="/"
							className="group inline-flex items-center gap-2 rounded-lg"
						>
							<OptimizedImage
								src="/favicon.png"
								alt=""
								width={32}
								height={32}
								sizes={ICON_IMAGE_SIZES}
								className="size-8 shrink-0 transition-transform duration-200 group-hover:-rotate-6 group-active:scale-95"
							/>
							<span className="whitespace-nowrap text-lg font-black tracking-tight text-gray-950">
								BANGEO
							</span>
						</Link>
						<p className="mt-4 max-w-[24em] break-phrase text-sm leading-[1.7] text-gray-600">
							WebXRの日本語情報サイトです。技術記事と標準化・対応状況を読み、この端末で何が動くかをレポートで確かめられます。
						</p>
					</div>

					{/* スマートフォンは2列。左の列は中身の幅（いちばん長い「WebGPU対応レポート」）で決め、
					    項目の多い「読む・調べる」を右の列に縦に通して、左に「レポート」と「BANGEO」を重ねる。
					    640px から3列 */}
					<nav
						aria-label="フッターメニュー"
						className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-4 gap-y-8 min-[360px]:gap-x-8 sm:grid-cols-3"
					>
						{FOOTER_LINK_GROUPS.map((group, index) => (
							<div
								key={group.label}
								className={index === 1 ? "row-span-2 sm:row-span-1" : undefined}
							>
								<h2
									id={`footer-group-${index}`}
									className="text-[13px] font-bold leading-[1.6] text-gray-950"
								>
									{group.label}
								</h2>
								{/* スマートフォンでは押しやすいよう1行44px、PC では32px */}
								<ul
									aria-labelledby={`footer-group-${index}`}
									className="mt-1 md:mt-3"
								>
									{group.items.map((item) => (
										<li key={item.href}>
											<FooterLink
												item={item}
												className="inline-flex min-h-11 items-center gap-1 text-sm text-gray-600 transition-colors hover:text-gray-950 md:min-h-8"
											/>
										</li>
									))}
								</ul>
							</div>
						))}
					</nav>
				</div>

				<div className="mt-12 flex flex-col gap-2 border-t border-gray-200 pt-6 md:mt-16 md:flex-row md:items-center md:justify-between md:gap-6">
					<p className="text-[13px] text-gray-500">
						&copy; {new Date().getFullYear()} BANGEO
					</p>
					{/* スマートフォンでは1行44px。「X」「RSS」のような短いリンクも押しやすいよう、的を左右に8pxずつ広げる。
					    広げたぶんは負の余白で打ち消すので、文字の位置と折り返しは変わらず、隣の的とは間の16pxの中央で接する */}
					<ul className="flex flex-wrap gap-x-4 md:gap-x-6">
						{FOOTER_BOTTOM_LINKS.map((item) => (
							<li key={item.href}>
								<FooterLink
									item={item}
									className="-mx-2 inline-flex min-h-11 items-center gap-1 px-2 text-[13px] text-gray-500 transition-colors hover:text-gray-950 md:mx-0 md:min-h-0 md:px-0"
								/>
							</li>
						))}
					</ul>
				</div>
			</div>
		</footer>
	);
}
