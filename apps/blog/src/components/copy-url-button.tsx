"use client";

import { useState } from "react";

export function CopyUrlButton({ url }: { url: string }) {
	const [copied, setCopied] = useState<null | "ok" | "ng">(null);

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(url);
			setCopied("ok");
		} catch {
			setCopied("ng");
		}
		setTimeout(() => setCopied(null), 2200);
	}

	return (
		<button
			type="button"
			onClick={handleCopy}
			className="inline-flex items-center justify-center rounded-full border border-gray-200 bg-white px-5 py-2.5 text-xs font-black text-gray-700 transition hover:border-rose-200 hover:text-[#e11d48]"
		>
			{copied === "ok"
				? "コピーしました"
				: copied === "ng"
					? "コピーできませんでした"
					: "URLをコピー"}
		</button>
	);
}
