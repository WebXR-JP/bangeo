import type { Metadata } from "next";
import Link from "next/link";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { WebXRSpecList } from "@/components/webxr-spec-list";
import { getDemoCatalog } from "@/lib/demo-catalog";

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
	const demos = getDemoCatalog();

	return (
		<div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20">
			<CollectionStructuredData
				name="BANGEO WebXRデモ"
				path="/experiments"
				description="WebXRの各仕様を、端末の対応状況を確認しながらブラウザで動かして確かめられるデモ一覧。"
				breadcrumbs={[{ name: "デモ", path: "/experiments" }]}
				items={demos.map((demo) => ({
					name: demo.title,
					path: demo.href,
					description: demo.description,
				}))}
			/>

			<header className="mb-10">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 md:text-4xl">
					WebXR デモ
				</h1>
				<p className="mt-3 text-sm leading-relaxed text-gray-500">
					BANGEOのデモと、WebXRの各仕様をいま開いている端末でそのまま動かして確かめられます。
				</p>
			</header>

			<div className="mb-8">
				<h2 className="text-2xl font-black tracking-tight text-gray-950">
					WebXR仕様から探す
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-gray-500">
					各仕様の対応状況を確認しながら、公式サンプルやライブラリのデモを開けます。
				</p>
			</div>

			<WebXRSpecList />

			<section
				aria-labelledby="bangeo-demos-heading"
				className="mt-12 border-t border-gray-100 pt-6"
			>
				<div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
					<h2
						id="bangeo-demos-heading"
						className="text-base font-bold text-gray-950"
					>
						BANGEOのデモ
						<span className="ml-2 text-xs font-normal text-gray-500">
							{demos.length}件
						</span>
					</h2>
					<p className="text-xs text-gray-500">別タブで開きます</p>
				</div>
				<ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2">
					{demos.map((demo) => (
						<li key={demo.slug} className="min-w-0 border-b border-gray-100">
							<a
								href={demo.href}
								target="_blank"
								rel="noopener noreferrer"
								title={demo.description}
								className="group flex min-h-11 items-center justify-between gap-3 rounded-sm py-2.5 transition-colors hover:text-[#e11d48] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-500"
							>
								<span className="min-w-0">
									<span className="block text-sm font-semibold leading-snug">
										{demo.title}
									</span>
									<span className="mt-0.5 block text-xs text-gray-500">
										{demo.category}
									</span>
								</span>
								<span
									aria-hidden="true"
									className="shrink-0 text-sm text-gray-400 group-hover:text-[#e11d48]"
								>
									↗
								</span>
								<span className="sr-only">（別タブで開きます）</span>
							</a>
						</li>
					))}
				</ul>
			</section>

			<footer className="mt-12 border-t border-gray-100 pt-6">
				<p className="text-xs leading-relaxed text-gray-400">
					仕様一覧はW3C標準のWebXR仕様を対象としています。8th
					Wall系のカメラベースWebARは、スマートフォン向けデモとしてBANGEOのデモ一覧に掲載しています。ブラウザ横断の対応状況は
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
