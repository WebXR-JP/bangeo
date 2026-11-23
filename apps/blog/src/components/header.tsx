"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
	type FocusEvent as ReactFocusEvent,
	type KeyboardEvent as ReactKeyboardEvent,
	useEffect,
	useRef,
	useState,
} from "react";
import { flushSync } from "react-dom";
import { OptimizedImage } from "@/components/optimized-image";
import { ICON_IMAGE_SIZES } from "@/lib/image-defaults";
import {
	GITHUB_URL,
	NAV_CATEGORIES,
	NAV_PRIMARY,
	type NavItem,
	REPORT_NAV_ITEMS,
} from "@/lib/navigation";

/** この幅から上は PC のナビを出し、スマートフォンのメニューは閉じる（Tailwind の lg） */
const DESKTOP_MEDIA = "(min-width: 1024px)";

/** スマートフォンのメニューの中で、Tab で移れる要素 */
const FOCUSABLE = "a[href], button:not([disabled])";

/** スマートフォンのメニューは、レポートの表示切り替えを先頭に置き、続けてカテゴリを並べる */
const MOBILE_GROUPS = [
	{ label: NAV_PRIMARY.name, items: REPORT_NAV_ITEMS },
	...NAV_CATEGORIES,
];

/** PC のドロップダウンの項目（14px / 500、高さ40px、角丸10px） */
const DESKTOP_ITEM =
	"flex h-10 items-center justify-between gap-3 whitespace-nowrap rounded-[10px] px-3 text-sm transition-colors hover:bg-gray-50 active:bg-gray-100";
const DESKTOP_ITEM_IDLE = "font-medium text-gray-800 hover:text-gray-950";
const DESKTOP_ITEM_CURRENT = "font-bold text-primary-700";

/** スマートフォンのメニューの項目（16px / 500、高さ48px、角丸12px） */
const MOBILE_ITEM =
	"flex min-h-12 items-center justify-between gap-3 rounded-xl px-3 text-base transition-colors hover:bg-gray-50 active:bg-gray-50";
const MOBILE_ITEM_IDLE = "font-medium text-gray-900";
const MOBILE_ITEM_CURRENT = "font-bold text-primary-700";

/**
 * リンク先がいまのページなら "page"、その下の階層（記事の詳細など）なら "true"。
 * どちらも aria-current に渡し、同じ見た目で現在地を示す
 */
function currentOf(
	pathname: string,
	href: string,
): "page" | "true" | undefined {
	if (pathname === href) return "page";
	if (pathname.startsWith(`${href}/`)) return "true";
	return undefined;
}

/** カテゴリのボタンの文字色。現在のページがあるカテゴリは rose で示す */
function categoryTextClass(isCurrent: boolean, isOpen: boolean) {
	if (isCurrent) return "text-primary-700";
	if (isOpen) return "text-gray-950";
	return "text-gray-700 hover:text-gray-950";
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

function ChevronIcon({ open }: { open: boolean }) {
	return (
		<svg
			className={`size-3 shrink-0 opacity-60 transition-transform duration-150 ${open ? "rotate-180" : ""}`}
			viewBox="0 0 12 12"
			fill="none"
			stroke="currentColor"
			strokeWidth={1.5}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M3 4.5l3 3 3-3" />
		</svg>
	);
}

function SearchIcon({ className }: { className: string }) {
	return (
		<svg
			className={className}
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
		</svg>
	);
}

function GitHubIcon() {
	return (
		<svg
			className="size-4 shrink-0"
			viewBox="0 0 24 24"
			fill="currentColor"
			aria-hidden="true"
		>
			<path
				fillRule="evenodd"
				clipRule="evenodd"
				d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
			/>
		</svg>
	);
}

function MenuIcon() {
	return (
		<svg
			className="size-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			aria-hidden="true"
		>
			<path d="M4 6h16M4 12h16M4 18h16" />
		</svg>
	);
}

function CloseIcon() {
	return (
		<svg
			className="size-6"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			aria-hidden="true"
		>
			<path d="M6 18L18 6M6 6l12 12" />
		</svg>
	);
}

type MenuLinkProps = {
	item: NavItem;
	pathname: string;
	/** 形と大きさ。文字の太さと色は idle / current で渡す */
	className: string;
	idleClassName: string;
	currentClassName: string;
	/**
	 * メニューが開いているときだけ true にする。閉じたメニューも visibility で隠して描いているので、
	 * Link の既定のままだと画面内にあるとみなされ、開いていないメニューの行き先まで先読みしてしまう
	 */
	prefetch: boolean;
	onClick?: () => void;
	onKeyDown?: (event: ReactKeyboardEvent<HTMLAnchorElement>) => void;
};

/** サイト内は Link。外部は新しいタブで開く a にして、外向きの矢印と読み上げの補足を付ける */
function MenuLink({
	item,
	pathname,
	className,
	idleClassName,
	currentClassName,
	prefetch,
	onClick,
	onKeyDown,
}: MenuLinkProps) {
	if (item.external) {
		return (
			<a
				href={item.href}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={`${item.name}（新しいタブで開く）`}
				className={`${className} ${idleClassName}`}
				onClick={onClick}
				onKeyDown={onKeyDown}
			>
				{item.name}
				<ExternalIcon />
			</a>
		);
	}
	const current = currentOf(pathname, item.href);
	return (
		<Link
			href={item.href}
			prefetch={prefetch ? undefined : false}
			aria-current={current}
			className={`${className} ${current ? currentClassName : idleClassName}`}
			onClick={onClick}
			onKeyDown={onKeyDown}
		>
			{item.name}
		</Link>
	);
}

export function Header() {
	const pathname = usePathname();
	const [openCategory, setOpenCategory] = useState<number | null>(null);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const categoryListRef = useRef<HTMLUListElement>(null);
	const menuButtonRef = useRef<HTMLButtonElement>(null);
	const sheetRef = useRef<HTMLDivElement>(null);

	const onReport = REPORT_NAV_ITEMS.some((item) => item.href === pathname);
	const onSearch = pathname === "/search";
	const currentCategory = NAV_CATEGORIES.findIndex((category) =>
		category.items.some(
			(item) => !item.external && currentOf(pathname, item.href),
		),
	);

	// PC のドロップダウン: 外側を押すと閉じる。Esc で閉じて、開いたボタンへフォーカスを戻す
	useEffect(() => {
		if (openCategory === null) return;
		const index = openCategory;
		const handlePointerDown = (event: PointerEvent) => {
			if (!categoryListRef.current?.contains(event.target as Node | null)) {
				setOpenCategory(null);
			}
		};
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key !== "Escape") return;
			setOpenCategory(null);
			document.getElementById(`nav-category-button-${index}`)?.focus();
		};
		document.addEventListener("pointerdown", handlePointerDown);
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("pointerdown", handlePointerDown);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [openCategory]);

	// スマートフォンのメニュー: 開いている間は後ろのページをスクロールさせず、フォーカスをシートの中に閉じ込める。
	// Esc で閉じる。閉じたら（どの閉じ方でも）メニューのボタンへフォーカスを戻す
	useEffect(() => {
		if (!mobileMenuOpen) return;
		const sheet = sheetRef.current;
		const menuButton = menuButtonRef.current;
		if (!sheet) return;

		// スクロールバーが消えるぶん本文が横にずれないよう、同じ幅の余白を足す（スマートフォンでは 0）
		const { body, documentElement } = document;
		const scrollbarWidth = window.innerWidth - documentElement.clientWidth;
		const previousOverflow = body.style.overflow;
		const previousPaddingRight = body.style.paddingRight;
		body.style.overflow = "hidden";
		if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;

		// 360px 以上で隠れる検索の項目のような、見えていない要素は数えない
		const focusables = () =>
			Array.from(sheet.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
				(element) => element.getClientRects().length > 0,
			);
		focusables()[0]?.focus({ preventScroll: true });

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				setMobileMenuOpen(false);
				return;
			}
			if (event.key !== "Tab") return;
			const items = focusables();
			const first = items[0];
			const last = items[items.length - 1];
			if (!first || !last) return;
			const active = document.activeElement;
			const inside = active instanceof Node && sheet.contains(active);
			if (event.shiftKey && (active === first || !inside)) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && (active === last || !inside)) {
				event.preventDefault();
				first.focus();
			}
		};
		const handleFocusIn = (event: FocusEvent) => {
			if (event.target instanceof Node && !sheet.contains(event.target)) {
				focusables()[0]?.focus({ preventScroll: true });
			}
		};
		// 開いたまま PC の幅に広げると、シートは見えなくなるので閉じる（スクロールの固定も外す）
		const desktop = window.matchMedia(DESKTOP_MEDIA);
		const handleDesktop = (event: MediaQueryListEvent) => {
			if (event.matches) setMobileMenuOpen(false);
		};

		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("focusin", handleFocusIn);
		desktop.addEventListener("change", handleDesktop);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("focusin", handleFocusIn);
			desktop.removeEventListener("change", handleDesktop);
			body.style.overflow = previousOverflow;
			body.style.paddingRight = previousPaddingRight;
			menuButton?.focus({ preventScroll: true });
		};
	}, [mobileMenuOpen]);

	const openMobileMenu = () => {
		setOpenCategory(null);
		setMobileMenuOpen(true);
	};
	const closeMobileMenu = () => setMobileMenuOpen(false);

	const toggleCategory = (index: number) => {
		setOpenCategory((current) => (current === index ? null : index));
	};

	// カテゴリのボタンで ↓ を押すと、開いて最初の項目へ移る
	const handleCategoryKeyDown = (
		event: ReactKeyboardEvent<HTMLButtonElement>,
		index: number,
	) => {
		if (event.key !== "ArrowDown") return;
		event.preventDefault();
		// 閉じている間は visibility: hidden でフォーカスできないので、開いた状態を先に反映させる
		flushSync(() => setOpenCategory(index));
		document
			.getElementById(`nav-category-${index}`)
			?.querySelector<HTMLElement>("a")
			?.focus();
	};

	// 項目の上で ↑ ↓ を押すと隣の項目へ移る。最初の項目で ↑ を押すとボタンへ戻る
	const handleItemKeyDown = (
		event: ReactKeyboardEvent<HTMLAnchorElement>,
		index: number,
	) => {
		if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
		const panel = document.getElementById(`nav-category-${index}`);
		const links = Array.from(
			panel?.querySelectorAll<HTMLAnchorElement>("a") ?? [],
		);
		const position = links.indexOf(event.currentTarget);
		event.preventDefault();
		if (event.key === "ArrowDown") {
			links[position + 1]?.focus();
			return;
		}
		if (position > 0) {
			links[position - 1]?.focus();
			return;
		}
		document.getElementById(`nav-category-button-${index}`)?.focus();
	};

	// フォーカスがボタンとドロップダウンの外へ出たら閉じる。
	// 行き先のない blur（項目の余白を押した、ウィンドウを離れた）では閉じない。外側を押したときは pointerdown で閉じる
	const handleCategoryBlur = (
		event: ReactFocusEvent<HTMLLIElement>,
		index: number,
	) => {
		const next = event.relatedTarget;
		if (next instanceof Node && !event.currentTarget.contains(next)) {
			setOpenCategory((current) => (current === index ? null : current));
		}
	};

	return (
		// ヘッダーの外枠（バーの周りの透明な余白）はクリックを下のページへ通し、バーとメニューだけが受け取る
		<header className="pointer-events-none fixed top-0 left-0 z-50 w-full px-4 py-3 md:py-5 lg:px-10">
			<div className="pointer-events-auto mx-auto flex h-14 max-w-7xl items-center justify-between gap-3 rounded-full border border-gray-200 bg-white pr-1.5 pl-3 shadow-float lg:h-15 lg:pr-2.5 lg:pl-3.5">
				<Link
					href="/"
					aria-current={pathname === "/" ? "page" : undefined}
					className="group flex shrink-0 items-center gap-2 rounded-full"
				>
					<OptimizedImage
						src="/favicon.png"
						alt=""
						width={32}
						height={32}
						sizes={ICON_IMAGE_SIZES}
						className="size-8 transition-transform duration-200 group-hover:-rotate-6 group-active:scale-95"
					/>
					<span className="whitespace-nowrap text-base tracking-tight md:text-lg">
						<span className="font-black text-gray-950">BANGEO</span>
						{/* 狭い画面では「レポート」ボタンの幅を優先する */}
						<span className="hidden font-bold text-gray-500 min-[430px]:inline">
							{" "}
							WebXR
						</span>
					</span>
				</Link>

				{/* PC のナビ。主機能のレポートはドロップダウンに入れず、1回で開けるようにする */}
				<nav
					aria-label="メインメニュー"
					className="hidden items-center gap-2 lg:flex"
				>
					<Link
						href={NAV_PRIMARY.href}
						aria-current={onReport ? "page" : undefined}
						className="btn btn-primary btn-sm rounded-full"
					>
						{NAV_PRIMARY.name}
					</Link>
					<ul ref={categoryListRef} className="flex items-center gap-1">
						{NAV_CATEGORIES.map((category, index) => {
							const open = openCategory === index;
							return (
								<li
									key={category.label}
									className="relative"
									onBlur={(event) => handleCategoryBlur(event, index)}
								>
									<button
										id={`nav-category-button-${index}`}
										type="button"
										aria-expanded={open}
										aria-controls={`nav-category-${index}`}
										className={`inline-flex h-9 cursor-pointer items-center gap-1 whitespace-nowrap rounded-full px-3 text-[13px] font-bold transition-colors ${
											open ? "bg-gray-100" : "hover:bg-gray-100"
										} ${categoryTextClass(index === currentCategory, open)}`}
										onClick={() => toggleCategory(index)}
										onKeyDown={(event) => handleCategoryKeyDown(event, index)}
									>
										{category.label}
										<ChevronIcon open={open} />
									</button>
									{/* 閉じている間も描いておき、visibility で隠す（フォーカスも読み上げも届かない）。
									    開くときだけ 150ms で上 4px から現れ、閉じるときはすぐ消す */}
									<ul
										id={`nav-category-${index}`}
										className={`absolute top-full left-1/2 z-10 mt-5 w-max min-w-56 -translate-x-1/2 rounded-2xl border border-gray-200 bg-white p-2 shadow-float ${
											open
												? "visible translate-y-0 opacity-100 transition-[opacity,translate] duration-150"
												: "invisible -translate-y-1 opacity-0"
										}`}
									>
										{category.items.map((item) => (
											<li key={item.href}>
												<MenuLink
													item={item}
													pathname={pathname}
													className={DESKTOP_ITEM}
													idleClassName={DESKTOP_ITEM_IDLE}
													currentClassName={DESKTOP_ITEM_CURRENT}
													prefetch={open}
													onClick={() => setOpenCategory(null)}
													onKeyDown={(event) => handleItemKeyDown(event, index)}
												/>
											</li>
										))}
									</ul>
								</li>
							);
						})}
					</ul>
				</nav>

				<div className="flex shrink-0 items-center gap-1 sm:gap-2">
					<Link
						href={NAV_PRIMARY.href}
						aria-current={onReport ? "page" : undefined}
						className="btn btn-primary btn-sm rounded-full lg:hidden"
					>
						{NAV_PRIMARY.name}
					</Link>
					<a
						href={GITHUB_URL}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub（新しいタブで開く）"
						className="btn btn-dark btn-sm hidden rounded-full pl-3 sm:inline-flex lg:hidden xl:inline-flex"
					>
						<GitHubIcon />
						GitHub
					</a>
					<Link
						href="/search"
						aria-label="検索"
						aria-current={onSearch ? "page" : undefined}
						className={`hidden size-11 items-center justify-center rounded-full transition-colors hover:bg-gray-100 active:bg-gray-100 min-[360px]:inline-flex lg:size-10 ${
							onSearch
								? "text-primary-700"
								: "text-gray-700 hover:text-gray-950"
						}`}
					>
						<SearchIcon className="size-5" />
					</Link>
					<button
						ref={menuButtonRef}
						type="button"
						aria-label="メニューを開く"
						aria-haspopup="dialog"
						aria-expanded={mobileMenuOpen}
						aria-controls="mobile-menu"
						className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-100 active:bg-gray-100 lg:hidden"
						onClick={openMobileMenu}
					>
						<MenuIcon />
					</button>
				</div>
			</div>

			{/* スマートフォンのメニュー（右から出るシート）。閉じている間も描いておき、visibility で隠す。
			    開くときだけ幕は 200ms で現れ、シートは右 16px から 200ms で入る。閉じるときはすぐ消す */}
			<div
				className={`pointer-events-auto fixed inset-0 z-10 lg:hidden ${
					mobileMenuOpen ? "visible" : "invisible"
				}`}
			>
				{/* 幕。押すと閉じる（キーボードでは Esc と閉じるボタンで閉じる） */}
				<div
					aria-hidden="true"
					className={`absolute inset-0 bg-gray-950/40 ${
						mobileMenuOpen
							? "opacity-100 transition-opacity duration-200"
							: "opacity-0"
					}`}
					onClick={closeMobileMenu}
				/>
				<div
					ref={sheetRef}
					id="mobile-menu"
					role="dialog"
					aria-modal="true"
					aria-label="メニュー"
					className={`absolute inset-y-0 right-0 flex w-[min(20rem,88vw)] flex-col border-l border-gray-200 bg-white ${
						mobileMenuOpen
							? "translate-x-0 opacity-100 transition-[opacity,translate] duration-200"
							: "translate-x-4 opacity-0"
					}`}
				>
					{/* 閉じるボタンは、ヘッダーのメニューのボタンと同じ位置に出す（上の余白と高さをバーにそろえる） */}
					<div className="flex shrink-0 justify-end px-4 pt-3 md:pt-5">
						<div className="flex h-14 items-center pr-1.5">
							<button
								type="button"
								aria-label="メニューを閉じる"
								className="inline-flex size-11 cursor-pointer items-center justify-center rounded-full text-gray-900 transition-colors hover:bg-gray-100 active:bg-gray-100"
								onClick={closeMobileMenu}
							>
								<CloseIcon />
							</button>
						</div>
					</div>
					<nav
						aria-label="メインメニュー"
						className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-3 pt-2 pb-12"
					>
						{/* 360px 未満ではヘッダーに検索のボタンを置けないので、ここから開けるようにする */}
						<Link
							href="/search"
							prefetch={mobileMenuOpen ? undefined : false}
							aria-current={onSearch ? "page" : undefined}
							className={`mb-4 flex min-h-12 items-center gap-3 rounded-xl px-3 text-base transition-colors hover:bg-gray-50 active:bg-gray-50 min-[360px]:hidden ${
								onSearch ? MOBILE_ITEM_CURRENT : MOBILE_ITEM_IDLE
							}`}
							onClick={closeMobileMenu}
						>
							<SearchIcon className="size-5 shrink-0 text-gray-500" />
							検索
						</Link>
						<div className="space-y-6">
							{MOBILE_GROUPS.map((group, index) => (
								<div key={group.label}>
									<p
										id={`mobile-menu-group-${index}`}
										className="px-3 pb-1 text-xs font-bold text-gray-500"
									>
										{group.label}
									</p>
									<ul aria-labelledby={`mobile-menu-group-${index}`}>
										{group.items.map((item) => (
											<li key={item.href}>
												<MenuLink
													item={item}
													pathname={pathname}
													className={MOBILE_ITEM}
													idleClassName={MOBILE_ITEM_IDLE}
													currentClassName={MOBILE_ITEM_CURRENT}
													prefetch={mobileMenuOpen}
													onClick={closeMobileMenu}
												/>
											</li>
										))}
									</ul>
								</div>
							))}
						</div>
					</nav>
				</div>
			</div>
		</header>
	);
}
