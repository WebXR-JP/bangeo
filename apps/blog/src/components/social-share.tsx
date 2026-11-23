import { CopyUrlButton } from "@/components/copy-url-button";

type SocialShareProps = {
	url: string;
	title: string;
	className?: string;
	/** ボタンの並びの寄せ方。既定は中央（デモのページ）。記事の末尾では "start" */
	align?: "center" | "start";
};

function hatenaEntryUrl(url: string): string {
	const urlWithoutScheme = url.replace(/^https?:\/\//, "");
	const entryPath = url.startsWith("https://") ? "entry/s/" : "entry/";

	return `https://b.hatena.ne.jp/${entryPath}${urlWithoutScheme}`;
}

/**
 * 共有のボタン。X とはてなブックマークは新しいタブで開き（左のロゴが行き先の印）、
 * URL のコピーはその場で結果を出す
 */
export function SocialShare({
	url,
	title,
	className = "",
	align = "center",
}: SocialShareProps) {
	const encodedTitle = encodeURIComponent(title);
	const encodedUrl = encodeURIComponent(url);

	return (
		<div
			className={`flex flex-wrap gap-2 ${align === "start" ? "justify-start" : "justify-center"} ${className}`}
		>
			<a
				href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="btn btn-secondary"
			>
				<svg
					className="size-4 shrink-0"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
				>
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
				Xで共有する
				<span className="sr-only">（新しいタブで開く）</span>
			</a>
			<a
				href={hatenaEntryUrl(url)}
				target="_blank"
				rel="noopener noreferrer"
				className="btn btn-secondary"
			>
				<span
					className="flex size-5 shrink-0 items-center justify-center rounded bg-gray-950 text-xs font-bold leading-none text-white"
					aria-hidden="true"
				>
					B!
				</span>
				はてなブックマークに追加する
				<span className="sr-only">（新しいタブで開く）</span>
			</a>
			<CopyUrlButton url={url} size="md" />
		</div>
	);
}
