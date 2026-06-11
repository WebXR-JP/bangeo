import Link from "next/link";

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
					allow="fullscreen"
					className="demo-embed-iframe"
				/>
			</div>
			{(caption || fullHref) && (
				<figcaption className="demo-embed-caption">
					{caption && <p>{caption}</p>}
					{fullHref && (
						<p>
							<Link href={fullHref}>全画面でデモを開く →</Link>
						</p>
					)}
				</figcaption>
			)}
		</figure>
	);
}
