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
			<div className="demo-embed-frame" style={{ height }}>
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
							<a href={fullHref}>全画面でデモを開く →</a>
							<span>
								Meta Quest / PICO では全画面リンクから開くと権限確認が安定します。
							</span>
						</p>
					)}
				</figcaption>
			)}
		</figure>
	);
}
