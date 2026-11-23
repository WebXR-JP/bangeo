"use client";

import { useEffect, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

/** 押した結果を出しておく時間 */
const RESULT_MS = 2200;

/**
 * URL をコピーするボタン。押すと「コピーしました」（失敗したら「コピーできませんでした」）に変わり、読み上げにも伝える。
 * size: "sm" は高さ 36px（既定。ヘッドセットに送るブロック）、"md" は 44px（記事の共有）
 */
export function CopyUrlButton({
	url,
	size = "sm",
}: {
	url: string;
	size?: "sm" | "md";
}) {
	const [state, setState] = useState<CopyState>("idle");

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(url);
			setState("copied");
		} catch {
			setState("failed");
		}
	}

	useEffect(() => {
		if (state === "idle") return;
		const timer = setTimeout(() => setState("idle"), RESULT_MS);
		return () => clearTimeout(timer);
	}, [state]);

	const message =
		state === "copied"
			? "コピーしました"
			: state === "failed"
				? "コピーできませんでした"
				: "";

	return (
		<>
			<button
				type="button"
				onClick={handleCopy}
				className={`btn btn-secondary ${size === "sm" ? "btn-sm" : ""}`}
			>
				{state === "copied" ? (
					<svg
						className="size-4 shrink-0 text-data-yes-ink"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2.5}
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				) : (
					<svg
						className="size-4 shrink-0"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth={2}
						strokeLinecap="round"
						strokeLinejoin="round"
						aria-hidden="true"
					>
						<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
						<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
					</svg>
				)}
				{message || "URLをコピーする"}
			</button>
			<span role="status" className="sr-only">
				{message}
			</span>
		</>
	);
}
