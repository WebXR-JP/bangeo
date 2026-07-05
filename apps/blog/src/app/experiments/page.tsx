import { experiments } from "fumadocs-mdx:collections/server";
import type { Metadata } from "next";
import Link from "next/link";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { WebXRSpecList } from "@/components/webxr-spec-list";
import { contentDateValue } from "@/lib/content-dates";
import { getDocs, getSlugFromPath } from "@/lib/fumadocs-utils";

export const metadata: Metadata = {
	title: "WebXRデモ｜仕様ごとに、この端末で動かして確かめる",
	description:
		"WebXRの各仕様（immersive-vr、Hit Test、Hand Inputなど）を、いま開いている端末で対応状況を確認しながら、そのままブラウザで動かして確かめられます。",
	openGraph: {
		title: "WebXRデモ｜仕様ごとに、この端末で動かして確かめる",
		description:
			"WebXRの各仕様を、いま開いている端末で対応状況を確認しながら、そのままブラウザで動かして確かめられます。",
		type: "website",
	},
	alternates: { canonical: "/experiments" },
};

export default function ExperimentsIndexPage() {
	const articles = getDocs(experiments)
		.filter((exp) => !exp.draft)
		.sort((a, b) => {
			const dateA = contentDateValue(a.updated ?? a.date);
			const dateB = contentDateValue(b.updated ?? b.date);
			return dateB - dateA;
		})
		.map((exp) => ({
			slug: getSlugFromPath(exp.info.path),
			title: String(exp.title),
			description: exp.description ? String(exp.description) : undefined,
			thumbnail: exp.thumbnail ? String(exp.thumbnail) : undefined,
			date: exp.date ? String(exp.date) : undefined,
			updated: exp.updated ? String(exp.updated) : undefined,
		}));

	return (
		<div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20">
			<CollectionStructuredData
				name="BANGEO WebXRデモ"
				path="/experiments"
				description="WebXRの各仕様を、端末の対応状況を確認しながらブラウザで動かして確かめられるデモ一覧。"
				breadcrumbs={[{ name: "デモ", path: "/experiments" }]}
				items={articles.map((article) => ({
					name: article.title,
					path: `/experiments/${article.slug}`,
					description: article.description,
					image: article.thumbnail,
					datePublished: article.date,
					dateModified: article.updated ?? article.date,
				}))}
			/>

			<header className="mb-10">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
					WebXR デモ
				</h1>
				<p className="mt-3 text-sm leading-relaxed text-gray-500">
					WebXRの各仕様を、いま開いている端末でそのまま動かして確かめられます。
				</p>
			</header>

			<WebXRSpecList />

			<section className="mt-14">
				<h2 className="text-sm font-black tracking-tight text-gray-950">
					解説つきデモ記事
				</h2>
				<ul className="mt-3 space-y-2">
					{articles.map((article) => (
						<li key={article.slug}>
							<Link
								href={`/experiments/${article.slug}`}
								className="text-sm text-gray-600 underline decoration-gray-200 underline-offset-4 transition hover:text-[#e11d48] hover:decoration-rose-300"
							>
								{article.title}
							</Link>
						</li>
					))}
				</ul>
			</section>

			<footer className="mt-12 border-t border-gray-100 pt-6">
				<p className="text-xs leading-relaxed text-gray-400">
					このページはW3C標準のWebXR仕様を対象としています。カメラベースのWebAR（8th
					Wall系デモ）は対象外です。ブラウザ横断の対応状況は
					<Link
						href="/webxr-status"
						className="text-gray-500 underline decoration-gray-200 underline-offset-2 transition hover:text-[#e11d48]"
					>
						WebXR対応状況
					</Link>
					をご覧ください。
				</p>
			</footer>
		</div>
	);
}
