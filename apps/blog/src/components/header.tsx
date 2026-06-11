"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { OptimizedImage } from "@/components/optimized-image";
import { ICON_IMAGE_SIZES } from "@/lib/image-defaults";
import { NAV_CATEGORIES } from "@/lib/navigation";

export function Header() {
	const [openCategory, setOpenCategory] = useState<number | null>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const navRef = useRef<HTMLElement>(null);

	useEffect(() => {
		function handleClickOutside(e: MouseEvent) {
			if (navRef.current && !navRef.current.contains(e.target as Node)) {
				setOpenCategory(null);
			}
		}
		function handleEscape(e: KeyboardEvent) {
			if (e.key === "Escape") {
				setOpenCategory(null);
				setMobileMenuOpen(false);
			}
		}
		document.addEventListener("mousedown", handleClickOutside);
		document.addEventListener("keydown", handleEscape);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleEscape);
		};
	}, []);

	return (
		<header
			className="fixed top-0 left-0 w-full z-50 px-4 py-3 md:py-5 lg:px-10"
			ref={navRef}
		>
			<div className="max-w-7xl mx-auto">
				<nav className="flex items-center justify-between bg-white rounded-full px-5 md:px-8 py-3 shadow-xs border border-gray-100">
					{/* Logo */}
					<Link
						href="/"
						className="flex items-center gap-2.5 md:gap-3 group shrink-0"
					>
						<OptimizedImage
							src="/favicon.svg"
							alt="BANGEOマスコット"
							width={36}
							height={36}
							sizes={ICON_IMAGE_SIZES}
							priority
							className="w-8 h-8 md:w-9 md:h-9 transition-transform duration-200 group-hover:scale-110 group-active:scale-90"
						/>
						<span className="font-black text-base md:text-lg tracking-tight text-gray-900">
							BANGEO WebXR
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex items-center gap-1 lg:gap-2 text-[11px] font-bold text-gray-800 uppercase tracking-[0.18em]">
						{NAV_CATEGORIES.map((cat, i) => (
							<div key={cat.label} className="relative">
								<button
									type="button"
									className={`whitespace-nowrap flex items-center gap-1 px-3 py-2 rounded-full border shadow-xs cursor-default transition-colors ${
										openCategory === i
											? "text-[#e11d48] bg-rose-50/80 border-rose-100"
											: "text-gray-800 bg-white/80 border-rose-50/80 hover:text-[#e11d48] hover:bg-rose-50/80"
									}`}
									onClick={() => setOpenCategory(openCategory === i ? null : i)}
								>
									{cat.label}
									<svg
										className={`w-3 h-3 transition-transform opacity-50 ${openCategory === i ? "rotate-180" : ""}`}
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
										aria-hidden="true"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M19 9l-7 7-7-7"
										/>
									</svg>
								</button>

								{openCategory === i && (
									<div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 backdrop-blur-md bg-white/95 rounded-2xl shadow-xl border border-rose-100/80 p-2 z-50">
										{cat.items.map((item) => (
											<Link
												key={item.name}
												href={item.href}
												target={item.external ? "_blank" : undefined}
												rel={item.external ? "noopener noreferrer" : undefined}
												className="block px-4 py-2.5 rounded-xl hover:bg-rose-50 hover:text-[#e11d48] transition-colors whitespace-nowrap text-xs font-bold text-gray-900"
												onClick={() => setOpenCategory(null)}
											>
												{item.name}
											</Link>
										))}
									</div>
								)}
							</div>
						))}
					</div>

					{/* Search + Mobile Menu */}
					<div className="flex items-center gap-2">
						<Link
							href="/search"
							className="p-2 text-gray-500 hover:text-[#e11d48] transition-colors"
							aria-label="検索"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="2"
								stroke="currentColor"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
								/>
							</svg>
						</Link>

						<button
							type="button"
							className="md:hidden p-2 text-rose-500 hover:text-gray-900 transition-colors"
							onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
							aria-label="メニューを開く"
						>
							<svg
								className="w-6 h-6"
								fill="none"
								viewBox="0 0 24 24"
								strokeWidth="2"
								stroke="currentColor"
							>
								{mobileMenuOpen ? (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M6 18L18 6M6 6l12 12"
									/>
								) : (
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										d="M4 6h16M4 12h16M4 18h16"
									/>
								)}
							</svg>
						</button>
					</div>
				</nav>
			</div>

			{/* Mobile Menu Overlay */}
			{mobileMenuOpen && (
				<>
					{/* biome-ignore lint/a11y/noStaticElementInteractions: overlay dismiss pattern */}
					<div
						className="fixed inset-0 bg-rose-50 z-40 md:hidden"
						onClick={() => setMobileMenuOpen(false)}
						onKeyDown={() => {}}
						role="presentation"
					/>
					<div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white border-l border-rose-100 shadow-[-20px_0_50px_-20px_rgba(225,29,72,0.16)] z-50 overflow-y-auto md:hidden">
						<div className="p-6 pt-24 space-y-8">
							{NAV_CATEGORIES.map((cat) => (
								<nav
									key={cat.label}
									className="space-y-2"
									aria-label={cat.label}
								>
									<h3 className="text-xs font-black text-rose-500 uppercase tracking-widest px-2">
										{cat.label}
									</h3>
									<div className="space-y-1">
										{cat.items.map((item) => (
											<Link
												key={item.name}
												href={item.href}
												target={item.external ? "_blank" : undefined}
												rel={item.external ? "noopener noreferrer" : undefined}
												className="group flex items-center justify-between px-4 py-3 text-sm font-bold text-gray-900 hover:text-[#e11d48] hover:bg-rose-50 rounded-xl transition-all duration-200"
												onClick={() => setMobileMenuOpen(false)}
											>
												<span>{item.name}</span>
												{item.external && (
													<svg
														className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-hidden="true"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth={2}
															d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
														/>
													</svg>
												)}
											</Link>
										))}
									</div>
								</nav>
							))}
						</div>
					</div>
				</>
			)}
		</header>
	);
}
