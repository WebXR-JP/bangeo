import type { CSSProperties } from "react";

interface DemoIframeProps {
	src: string;
	title: string;
	caption?: string;
	fullPageHref?: string;
	height?: number;
}

export function DemoIframe({
	src,
	title,
	caption,
	fullPageHref,
	height = 480,
}: DemoIframeProps) {
	const fullHref = fullPageHref ?? src.replace(/\/app\.html$/, "/");

	return (
		<figure className="demo-embed not-prose">
			<div
				className="demo-embed-frame"
				style={{ "--demo-embed-height": `${height}px` } as CSSProperties}
			>
				<iframe
					src={src}
					title={title}
					loading="lazy"
					allow="xr-spatial-tracking; fullscreen; autoplay; camera; microphone"
					allowFullScreen
					referrerPolicy="strict-origin-when-cross-origin"
					className="demo-embed-iframe"
				/>
			</div>
			{(caption || fullHref) && (
				<figcaption className="demo-embed-caption">
					{caption && <p>{caption}</p>}
					{fullHref && (
						<p className="demo-embed-actions">
							<a href={fullHref}>
								全画面でデモを開く
								<svg
									width="16"
									height="16"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth={2}
									strokeLinecap="round"
									strokeLinejoin="round"
									aria-hidden="true"
								>
									<path d="M9 5l7 7-7 7" />
								</svg>
							</a>
							<span className="block">
								Meta Quest /
								PICOでは、全画面のリンクから開くと権限の確認が安定します。
							</span>
						</p>
					)}
				</figcaption>
			)}
		</figure>
	);
}
