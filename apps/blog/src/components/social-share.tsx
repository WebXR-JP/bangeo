type SocialShareProps = {
	url: string;
	title: string;
	className?: string;
};

function hatenaEntryUrl(url: string): string {
	const urlWithoutScheme = url.replace(/^https?:\/\//, "");
	const entryPath = url.startsWith("https://") ? "entry/s/" : "entry/";

	return `https://b.hatena.ne.jp/${entryPath}${urlWithoutScheme}`;
}

export function SocialShare({ url, title, className = "" }: SocialShareProps) {
	const encodedTitle = encodeURIComponent(title);
	const encodedUrl = encodeURIComponent(url);

	return (
		<section className={`flex flex-wrap justify-center gap-3 ${className}`}>
			<a
				href={`https://x.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-800 shadow-xs transition-all hover:border-gray-300 hover:bg-gray-50 hover:shadow-sm"
			>
				<svg
					className="h-4 w-4"
					viewBox="0 0 24 24"
					fill="currentColor"
					aria-hidden="true"
				>
					<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
				</svg>
				Xでシェア
			</a>
			<a
				href={hatenaEntryUrl(url)}
				target="_blank"
				rel="noopener noreferrer"
				className="inline-flex min-h-11 items-center gap-2.5 rounded-full border border-[#00a4de]/20 bg-[#00a4de] px-5 py-2.5 text-sm font-bold text-white shadow-xs transition-all hover:bg-[#008fc2] hover:shadow-sm"
				title="このページをはてなブックマークに追加"
			>
				<span className="flex h-5 w-5 items-center justify-center rounded bg-white text-[12px] font-black leading-none text-[#00a4de]">
					B!
				</span>
				はてブする
			</a>
		</section>
	);
}
