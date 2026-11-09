"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { type ReactNode, Suspense, useEffect, useState } from "react";

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

const resultCardClass =
	"group block p-6 bg-white rounded-2xl border border-gray-100 hover:shadow-2xl hover:shadow-gray-200/50 hover:border-transparent hover:-translate-y-1 transition-all duration-300";

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
				className={resultCardClass}
			>
				{children}
			</a>
		);
	}

	return (
		<Link href={item.slug} className={resultCardClass}>
			{children}
		</Link>
	);
}

function SearchContent() {
	const searchParams = useSearchParams();
	const initialQuery = searchParams.get("q") || "";

	const [query, setQuery] = useState(initialQuery);
	const [searchIndex, setSearchIndex] = useState<SearchIndexItem[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [reloadKey, setReloadKey] = useState(0);

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
				setError(null);
			})
			.catch((err) => {
				if (cancelled) return;
				console.error("検索インデックスの取得に失敗しました:", err);
				setError(
					"検索インデックスを取得できませんでした。通信状況を確認して、もう一度お試しください。",
				);
			})
			.finally(() => {
				if (!cancelled) setLoading(false);
			});

		return () => {
			cancelled = true;
		};
	}, [reloadKey]);

	function retry() {
		setError(null);
		setLoading(true);
		setReloadKey((key) => key + 1);
	}

	const results = searchIndex.filter((item) => {
		if (!query.trim()) return true;
		const lowerQuery = query.toLowerCase();
		const titleMatch = item.title.toLowerCase().includes(lowerQuery);
		const descMatch = item.description.toLowerCase().includes(lowerQuery);
		const tagMatch = item.tags?.some((tag) =>
			tag.toLowerCase().includes(lowerQuery),
		);
		return titleMatch || descMatch || tagMatch;
	});

	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-8">
					検索
				</h1>

				<div className="mb-8">
					<input
						type="text"
						placeholder="キーワードで検索 (タイトル、説明文、タグ)"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						className="w-full px-5 py-3.5 bg-white border border-gray-200 rounded-2xl text-gray-950 placeholder:text-gray-500 focus:outline-hidden focus:ring-2 focus:ring-[#e11d48] focus:border-transparent transition-shadow"
						// biome-ignore lint/a11y/noAutofocus: 検索ページでは自動フォーカスが望ましい
						autoFocus
					/>
				</div>

				{loading && (
					<div className="text-center py-12 text-gray-500">読み込み中...</div>
				)}

				{!loading && error && (
					<div
						role="alert"
						className="rounded-2xl border border-rose-100 bg-rose-50 px-5 py-6"
					>
						<p className="font-black text-rose-700">
							検索インデックスを取得できませんでした
						</p>
						<p className="mt-2 text-sm leading-relaxed text-rose-600">
							{error}
						</p>
						<button
							type="button"
							onClick={retry}
							className="mt-4 inline-flex min-h-10 items-center justify-center rounded-xl bg-gray-950 px-5 py-2 text-sm font-bold text-white transition-colors hover:bg-[#e11d48]"
						>
							再読み込み
						</button>
					</div>
				)}

				{!loading && !error && (
					<>
						<div className="mb-6 text-sm text-gray-500">
							{query.trim() ? (
								<>
									<span className="font-bold text-gray-950">
										{results.length}
									</span>{" "}
									件の検索結果
								</>
							) : (
								<>
									すべてのコンテンツ (
									<span className="font-bold text-gray-950">
										{searchIndex.length}
									</span>{" "}
									件)
								</>
							)}
						</div>

						{results.length === 0 && query.trim() && (
							<div className="text-center py-12 text-gray-500">
								検索結果が見つかりませんでした。
								<br />
								別のキーワードで検索してみてください。
							</div>
						)}

						<div className="space-y-4">
							{results.map((item) => (
								<ResultLink key={item.slug} item={item}>
									<div className="flex items-center gap-2 mb-3">
										<span className="px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase">
											{item.typeLabel}
										</span>
										{item.category && (
											<span className="px-2.5 py-1 bg-rose-50 text-rose-700 rounded-md text-[10px] font-black uppercase tracking-wide">
												{item.category}
											</span>
										)}
									</div>
									<h2 className="font-black text-xl text-gray-950 group-hover:text-[#e11d48] transition-colors mb-2">
										{item.title}
									</h2>
									{item.description && (
										<p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
											{item.description}
										</p>
									)}
									<div className="flex items-center gap-4 text-xs text-gray-500 font-medium">
										{item.date && <span>{item.date}</span>}
										{item.tags && item.tags.length > 0 && (
											<div className="flex gap-1.5">
												{item.tags.slice(0, 3).map((tag) => (
													<span
														key={tag}
														className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded text-xs"
													>
														{tag}
													</span>
												))}
												{item.tags.length > 3 && (
													<span>+{item.tags.length - 3}</span>
												)}
											</div>
										)}
									</div>
								</ResultLink>
							))}
						</div>
					</>
				)}
			</div>
		</div>
	);
}

export default function SearchPage() {
	return (
		<Suspense
			fallback={
				<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
					<div className="max-w-4xl mx-auto">
						<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-8">
							検索
						</h1>
						<div className="text-center py-12 text-gray-500">読み込み中...</div>
					</div>
				</div>
			}
		>
			<SearchContent />
		</Suspense>
	);
}
