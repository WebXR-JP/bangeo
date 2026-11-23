"use client";

import { useCallback, useEffect, useState } from "react";

type CopyState = "idle" | "copied" | "failed";

/** 押した結果を出しておく時間 */
const RESULT_MS = 2000;

/** navigator.clipboard が使えない環境（http など）での代わり。成否を返す */
function copyWithTextarea(text: string): boolean {
	const textarea = document.createElement("textarea");
	textarea.value = text;
	textarea.setAttribute("readonly", "");
	textarea.style.position = "fixed";
	textarea.style.opacity = "0";
	document.body.appendChild(textarea);
	textarea.select();
	let ok = false;
	try {
		ok = document.execCommand("copy");
	} catch {
		ok = false;
	}
	document.body.removeChild(textarea);
	return ok;
}

/**
 * コードブロックの右上に置くコピーのボタン。.code-block-figure の中に置く。
 * 押すと「コピーしました」（失敗したら「コピーできませんでした」）に変わり、読み上げにも伝える
 */
export function CodeBlockCopyButton() {
	const [state, setState] = useState<CopyState>("idle");

	const handleCopy = useCallback(async (e: React.MouseEvent) => {
		const button = e.currentTarget as HTMLButtonElement;
		const pre =
			button.closest("figure")?.querySelector("pre") ?? button.closest("pre");
		if (!pre) return;

		const code = pre.querySelector("code");
		const text = code?.textContent ?? pre.textContent ?? "";

		try {
			await navigator.clipboard.writeText(text);
			setState("copied");
		} catch {
			setState(copyWithTextarea(text) ? "copied" : "failed");
		}
	}, []);

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
				className="code-copy-btn"
				data-state={state}
			>
				{state === "copied" ? (
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						aria-hidden="true"
						fill="none"
						stroke="currentColor"
						strokeWidth="2.5"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<polyline points="20 6 9 17 4 12" />
					</svg>
				) : (
					<svg
						width="14"
						height="14"
						viewBox="0 0 24 24"
						aria-hidden="true"
						fill="none"
						stroke="currentColor"
						strokeWidth="2"
						strokeLinecap="round"
						strokeLinejoin="round"
					>
						<rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
						<path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
					</svg>
				)}
				{state === "idle" ? (
					<span>
						<span className="sr-only">コードを</span>コピー
					</span>
				) : (
					<span>{message}</span>
				)}
			</button>
			<span role="status" className="sr-only">
				{message}
			</span>
		</>
	);
}
