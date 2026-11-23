"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
	type ReactNode,
	Suspense,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { articleCategoryLabel } from "@/components/article-card";
import { PageHeader } from "@/components/page-header";
import { contentDateTime, formatContentDate } from "@/lib/content-dates";

/** /search-index.json の1件（src/lib/search-index.ts が新しい順に並べて出す） */
export interface SearchIndexItem {
	type: "blog" | "experiment" | "podcast";
	typeLabel: string;
	title: string;
	description: string;
	slug: string;
	date?: string;
	tags?: string[];
	category?: string;
}

const PAGE_TITLE = "検索";
const PAGE_LEAD =
	"技術記事・デモ・ポッドキャストを、タイトルと説明とタグの言葉で探せます。";
const VISIBLE_TAG_COUNT = 3;

function ExternalIcon() {
	return (
		<svg
			className="ml-1 inline-block size-4 align-[-2px] text-gray-500"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			strokeWidth={2}
			strokeLinecap="round"
			strokeLinejoin="round"
			aria-hidden="true"
		>
			<path d="M7 17 17 7M8 7h9v9" />
		</svg>
	);
}

const resultLinkClass =
	"group block px-5 py-4 transition-colors hover:bg-gray-50 focus-visible:-outline-offset-2 md:px-6 md:py-5";

/** デモはサイトの外の静的ページなので新しいタブで開く。ほかは先読みしないリンク */
function ResultLink({
	item,
	children,
}: {
	item: SearchIndexItem;
	children: ReactNode;
}) {
	if (item.slug.startsWith("/demos/")) {
		return (
			<a
				href={item.slug}
				target="_blank"
				rel="noopener noreferrer"
				className={resultLinkClass}
			>
				{children}
			</a>
		);
	}

	return (
		<Link href={item.slug} prefetch={false} className={resultLinkClass}>
			{children}
		</Link>
	);
}

function ResultRow({ item }: { item: SearchIndexItem }) {
	const isExternal = item.slug.startsWith("/demos/");
	const dateText = formatContentDate(item.date);
	const uniqueTags = item.tags ? [...new Set(item.tags)] : [];
	const visibleTags = uniqueTags.slice(0, VISIBLE_TAG_COUNT);
	const hiddenTagCount = uniqueTags.length - visibleTags.length;

	return (
		<ResultLink item={item}>
			<div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1">
				<span className="chip">{item.typeLabel}</span>
				{item.category ? (
					<span className="chip chip-brand">
						{articleCategoryLabel(item.category)}
					</span>
				) : null}
				{dateText ? (
					<time
						dateTime={contentDateTime(item.date)}
						className="ml-1 text-[13px] leading-[1.6] text-gray-500"
					>
						{dateText}
					</time>
				) : null}
			</div>
			<h2 className="text-base font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700 group-focus-visible:text-primary-700 md:text-lg">
				{item.title}
				{isExternal ? <ExternalIcon /> : null}
			</h2>
			{/* 読み上げの補足は見出しの外（リンクの中）に置き、見出しの一覧に混ぜない */}
			{isExternal ? (
				<span className="sr-only">（新しいタブで開く）</span>
			) : null}
			{item.description ? (
				<p className="mt-1.5 line-clamp-2 max-w-[40em] break-phrase text-sm leading-[1.7] text-gray-600">
					{item.description}
				</p>
			) : null}
			{visibleTags.length > 0 ? (
				<div className="mt-3 flex flex-wrap items-center gap-2">
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
		</ResultLink>
	);
}

/** 読み込み中。行の形の骨組みを3つ出す */
function LoadingState() {
	return (
		<div role="status">
			<p className="break-phrase text-[13px] leading-[1.6] text-gray-500">
				技術記事・デモ・ポッドキャストの一覧を読み込んでいます。
			</p>
			<ul
				className="card mt-4 divide-y divide-gray-100 overflow-hidden"
				aria-hidden="true"
			>
				{[0, 1, 2].map((key) => (
					<li key={key} className="animate-pulse px-5 py-5 md:px-6">
						<div className="h-5 w-32 rounded-full bg-gray-100" />
						<div className="mt-3 h-5 w-3/4 rounded-md bg-gray-100" />
						<div className="mt-2 h-4 w-full max-w-[40em] rounded-md bg-gray-100" />
					</li>
				))}
			</ul>
		</div>
	);
}

function SearchContent() {
	const searchParams = useSearchParams();
	const initialQuery = searchParams.get("q") || "";

	const [query, setQuery] = useState(initialQuery);
	const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(false);
	const [reloadKey, setReloadKey] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		let cancelled = false;

		fetch(`/search-index.json?retry=${reloadKey}`)
			.then((res) => {
				if (!res.ok) {
					throw new Error(`HTTP ${res.status}`);
				}
				return res.json();
			})
			.then((data) => {
				if (!Array.isArray(data)) {
					throw new Error("検索インデックスの形式が不正です");
				}
				if (cancelled) return;
				setSearchIndex(data);
				setError(false);
			})
			.catch((err) => {
				if (cancelled) return;
				console.error("検索インデックスの取得に失敗しました:", err);
				setError(true);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [reloadKey]);

	// 押したボタンは読み込み中の表示に替わって消えるので、フォーカスを入力欄へ移す。
	// 入力欄は読み込み中も出たままで、読み込みが終わると件数が role="status" で読み上げられる
	function retry() {
		setError(false);
		setLoading(true);
		setReloadKey((key) => key + 1);
		inputRef.current?.focus();
	}

	const trimmedQuery = query.trim();
	const results = useMemo(() => {
		if (!trimmedQuery) return searchIndex;
		const lowerQuery = trimmedQuery.toLowerCase();
		return searchIndex.filter((item) => {
			const titleMatch = item.title.toLowerCase().includes(lowerQuery);
			const descMatch = item.description.toLowerCase().includes(lowerQuery);
			const tagMatch = item.tags?.some((tag) =>
				tag.toLowerCase().includes(lowerQuery),
			);
			return titleMatch || descMatch || tagMatch;
		});
	}, [searchIndex, trimmedQuery]);

	return (
		<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<PageHeader title={PAGE_TITLE} lead={PAGE_LEAD} className="mb-6" />

			{/* 入力のたびに下の一覧を絞り込む。Enter で送信してページを読み直さない */}
			<search className="mb-8 block max-w-3xl">
				<form onSubmit={(event) => event.preventDefault()}>
					<label
						htmlFor="search-query"
						className="mb-2 block text-sm font-bold text-gray-950"
					>
						キーワード
					</label>
					<input
						ref={inputRef}
						id="search-query"
						type="search"
						placeholder="例: WebGPU、Meta Quest"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						autoComplete="off"
						enterKeyHint="search"
						className="block h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-gray-950 transition-colors placeholder:text-gray-500 hover:border-gray-400"
						// biome-ignore lint/a11y/noAutofocus: 検索ページでは自動フォーカスが望ましい
						autoFocus
					/>
				</form>
			</search>

			<div className="max-w-3xl">
				{loading ? <LoadingState /> : null}

				{!loading && error ? (
					<div role="alert" className="card flex gap-3 p-5 md:p-6">
						<span
							className="flex size-6 shrink-0 items-center justify-center rounded-full bg-data-ask-soft text-sm font-bold text-data-ask"
							aria-hidden="true"
						>
							!
						</span>
						<div className="min-w-0">
							<p className="break-phrase font-bold leading-snug text-gray-950">
								検索に使う一覧を読み込めませんでした。
							</p>
							<p className="mt-1 break-phrase text-sm leading-[1.7] text-gray-600">
								通信の状態を確かめてから、もう一度読み込んでください。
							</p>
							<button
								type="button"
								onClick={retry}
								className="btn btn-dark mt-4"
							>
								もう一度読み込む
							</button>
						</div>
					</div>
				) : null}

				{!loading && !error ? (
					<>
						{/* 入力に合わせて件数と0件を読み上げる（領域は出したままにして中身だけ替える） */}
						<div role="status" className="mb-4">
							{trimmedQuery && results.length === 0 ? (
								<div className="card p-5 md:p-6">
									<p className="break-phrase font-bold leading-snug text-gray-950">
										「{trimmedQuery}
										」に一致する技術記事・デモ・ポッドキャストはありません。
									</p>
									<Link
										href="/tags"
										className="text-link mt-2 inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold"
									>
										タグ一覧から探す
									</Link>
								</div>
							) : (
								<p className="break-phrase text-[13px] leading-[1.6] text-gray-500">
									{trimmedQuery ? (
										<>
											「{trimmedQuery}」に一致する
											<span className="font-bold text-gray-950 tabular-nums">
												{results.length}件
											</span>
											を、新しい順に並べています。
										</>
									) : (
										<>
											技術記事・デモ・ポッドキャストの
											<span className="font-bold text-gray-950 tabular-nums">
												全{searchIndex.length}件
											</span>
											を、新しい順に並べています。キーワードを入れると絞り込みます。
										</>
									)}
								</p>
							)}
						</div>

						{results.length > 0 ? (
							<ul className="card divide-y divide-gray-100 overflow-hidden">
								{results.map((item) => (
									<li key={item.slug}>
										<ResultRow item={item} />
									</li>
								))}
							</ul>
						) : null}
					</>
				) : null}
			</div>
		</div>
	);
}

export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="max-w-6xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
					<PageHeader title={PAGE_TITLE} lead={PAGE_LEAD} className="mb-6" />
					<div className="max-w-3xl">
						<LoadingState />
					</div>
				</div>
			}
		>
			<SearchContent />
		</Suspense>
	);
}
