import Link from "next/link";
import { OptimizedImage } from "@/components/optimized-image";
import { ICON_IMAGE_SIZES } from "@/lib/image-defaults";
import { FOOTER_BOTTOM_LINKS, FOOTER_MAIN_LINKS } from "@/lib/navigation";

export function Footer() {
	return (
		<footer className="mt-24 border-t border-gray-100 bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(252,244,246,0.82))]">
			<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
				<div className="grid gap-12 lg:grid-cols-[minmax(0,20rem)_1fr] lg:items-start">
					<div className="space-y-5">
						<Link
							href="/"
							className="inline-flex items-center gap-3 rounded-full border border-rose-100/80 bg-white/90 px-4 py-3 shadow-sm shadow-rose-100/40"
						>
							<OptimizedImage
								src="/favicon.svg"
								alt=""
								aria-hidden="true"
								width={32}
								height={32}
								sizes={ICON_IMAGE_SIZES}
								className="w-8 h-8 shrink-0"
							/>
							<span className="font-black text-xl tracking-tight text-gray-900 whitespace-nowrap">
								BANGEO
							</span>
						</Link>
						<div className="space-y-2">
							<p className="text-sm font-bold uppercase tracking-[0.22em] text-gray-500">
								WebXR日本語リソース
							</p>
							<p className="max-w-sm text-sm leading-7 text-gray-500">
								ブラウザだけで動く XR
								のデモ、技術記事、標準化状況を日本語で整理したオープンなナレッジベースです。
							</p>
						</div>
					</div>
					<div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm font-medium text-gray-500 sm:grid-cols-3">
						{FOOTER_MAIN_LINKS.map((link) => (
							<Link
								key={link.name}
								href={link.href}
								className="inline-flex items-center min-h-9 rounded-full px-3 py-2 hover:bg-white/70 hover:text-[#e11d48] transition-colors"
							>
								{link.name}
							</Link>
						))}
					</div>
				</div>
				<div className="mt-12 pt-8 border-t border-gray-100 flex flex-col gap-5 text-sm text-gray-500 md:flex-row md:items-center md:justify-between">
					<p className="font-medium">
						&copy; {new Date().getFullYear()} BANGEO
					</p>
					<div className="flex flex-wrap gap-x-6 gap-y-3 md:justify-end">
						{FOOTER_BOTTOM_LINKS.map((link) => (
							<Link
								key={link.name}
								href={link.href}
								target={link.external ? "_blank" : undefined}
								rel={link.external ? "noopener noreferrer" : undefined}
								className="hover:text-gray-950 transition-colors"
							>
								{link.name}
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
}
