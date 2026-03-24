import rehypeShiki from "@shikijs/rehype";
import {
	transformerNotationDiff,
	transformerNotationFocus,
	transformerNotationHighlight,
	transformerNotationWordHighlight,
} from "@shikijs/transformers";
import { defineConfig, defineDocs } from "fumadocs-mdx/config";
import { z } from "zod";

const blogSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	date: z.string().optional(),
	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	author: z.string().optional(),
	thumbnail: z.string().optional(),
	externalLink: z.string().optional(),
	draft: z.boolean().optional().default(false),
});

const experimentsSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	date: z.string().optional(),
	category: z.string().optional(),
	tags: z.array(z.string()).optional(),
	frameworks: z.array(z.string()).optional(),
	devices: z.array(z.string()).optional(),
	difficulty: z.string().optional(),
	estimatedTime: z.union([z.number(), z.string()]).optional(),
	link: z.string().optional(),
	thumbnail: z.string().optional(),
	video: z.string().optional(),
	draft: z.boolean().optional().default(false),
});

const podcastSchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	date: z.string().optional(),
	pubDate: z.string().optional(),
	episodeNumber: z.number().optional(),
	duration: z.string().optional(),
	spotifyUrl: z.string().optional(),
	youtubeId: z.string().optional(),
	tags: z.array(z.string()).optional(),
	draft: z.boolean().optional().default(false),
});

export const blog = defineDocs({
	dir: "content/blog",
	docs: {
		schema: blogSchema,
	},
});

export const experiments = defineDocs({
	dir: "content/experiments",
	docs: {
		schema: experimentsSchema,
	},
});

export const podcast = defineDocs({
	dir: "content/podcast",
	docs: {
		schema: podcastSchema,
	},
});

export default defineConfig({
	mdxOptions: {
		remarkImageOptions: false,
		rehypeCodeOptions: false,
		rehypePlugins: [
			[
				rehypeShiki,
				{
					theme: "rose-pine-moon",
					transformers: [
						transformerNotationDiff(),
						transformerNotationHighlight(),
						transformerNotationWordHighlight(),
						transformerNotationFocus(),
						{
							name: "add-language",
							pre(
								this: { options?: { lang?: string } },
								node: { properties: Record<string, unknown> },
							) {
								const lang = this.options?.lang;
								if (lang && lang !== "plaintext") {
									node.properties["data-language"] = lang;
								}
							},
						},
					],
				},
			],
		],
	},
});
