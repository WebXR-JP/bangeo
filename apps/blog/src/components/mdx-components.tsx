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

export const mdxComponents: MDXComponents = {
	pre: Pre,
	DemoIframe,
};
