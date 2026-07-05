"use client";

import { useCallback, useEffect, useState } from "react";

export function CodeBlockCopyButton() {
	const [copied, setCopied] = useState(false);

	const handleCopy = useCallback(async (e: React.MouseEvent) => {
		const button = e.currentTarget as HTMLButtonElement;
		const pre =
			button.closest("figure")?.querySelector("pre") ?? button.closest("pre");
		if (!pre) return;

		const code = pre.querySelector("code");
		const text = code?.textContent ?? pre.textContent ?? "";

		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
		} catch {
			// fallback
			const textarea = document.createElement("textarea");
			textarea.value = text;
			textarea.style.position = "fixed";
			textarea.style.opacity = "0";
			document.body.appendChild(textarea);
			textarea.select();
			document.execCommand("copy");
			document.body.removeChild(textarea);
			setCopied(true);
		}
	}, []);

	useEffect(() => {
		if (copied) {
			const timer = setTimeout(() => setCopied(false), 2000);
			return () => clearTimeout(timer);
		}
	}, [copied]);

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="code-copy-btn"
			aria-label={copied ? "コピー完了" : "コードをコピー"}
		>
			{copied ? (
				<svg
					width="16"
					height="16"
					viewBox="0 0 24 24"
					aria-hidden="true"
					fill="none"
					stroke="currentColor"
					strokeWidth="2"
					strokeLinecap="round"
					strokeLinejoin="round"
				>
					<polyline points="20 6 9 17 4 12" />
				</svg>
			) : (
				<svg
					width="16"
					height="16"
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
		</button>
	);
}
