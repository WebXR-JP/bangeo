import type { MDXComponents } from "mdx/types";
import { CodeBlockCopyButton } from "./code-block-copy";
import { DemoIframe } from "./demo-iframe";

function Pre(props: React.ComponentPropsWithoutRef<"pre">) {
	const { children, className, ...rest } = props;
	const rawLang =
		((rest as Record<string, unknown>)["data-language"] as
			| string
			| undefined) ?? null;
	const lang = rawLang && rawLang !== "plaintext" ? rawLang : null;
	const title = (rest as Record<string, unknown>)["data-title"] as
		| string
		| undefined;

	return (
		<figure className="code-block-figure" data-language={lang ?? undefined}>
			{(title || lang) && (
				<figcaption className="code-block-header">
					{title && <span className="code-block-title">{title}</span>}
					{lang && !title && (
						<span className="code-block-lang">{String(lang)}</span>
					)}
				</figcaption>
			)}
			<div className="code-block-body">
				<pre className={className} {...rest}>
					{children}
				</pre>
				<CodeBlockCopyButton />
			</div>
		</figure>
	);
}

/** 表は横に長いとき枠の中だけで横に送れるようにする（ページ全体は横に広げない） */
function Table(props: React.ComponentPropsWithoutRef<"table">) {
	const { children, className, ...rest } = props;

	return (
		<div className="article-table-scroll">
			<table className={className} {...rest}>
				{children}
			</table>
		</div>
	);
}

/**
 * 本文中の画像。記事へのリンクを先読みしたときや、記事を開いた直後に、
 * 画面の外にある本文の画像まで読み込まないよう、遅延読み込みにする。
 * 優先して読むのは記事の頭のサムネイルだけ（ページ側の next/image）
 */
function Img(props: React.ComponentPropsWithoutRef<"img">) {
	const { alt, ...rest } = props;
	// biome-ignore lint/performance/noImgElement: MDX の画像は大きさが分からないので next/image を使わない
	return <img {...rest} alt={alt ?? ""} loading="lazy" decoding="async" />;
}

export const mdxComponents: MDXComponents = {
	pre: Pre,
	table: Table,
	img: Img,
	DemoIframe,
};
