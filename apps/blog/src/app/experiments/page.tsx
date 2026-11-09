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

			<section className="mb-14">
				<div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-2xl font-black tracking-tight text-gray-950">
							BANGEOのデモ
						</h2>
						<p className="mt-2 text-sm leading-relaxed text-gray-500">
							公開中の{demos.length}件のデモを、ブラウザから直接開けます。
						</p>
					</div>
					<p className="text-xs font-bold text-gray-400">
						デモは別タブで開きます
					</p>
				</div>

				<div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
					{demos.map((demo) => (
						<a
							key={demo.slug}
							href={demo.href}
							target="_blank"
							rel="noopener noreferrer"
							className="group flex h-full flex-col rounded-2xl border border-gray-100 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-rose-100 hover:shadow-xl hover:shadow-gray-200/50"
						>
							<div className="mb-3 flex flex-wrap items-center gap-2">
								<span className="rounded-md bg-rose-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-rose-700">
									{demo.category}
								</span>
								{demo.tags.slice(0, 2).map((tag) => (
									<span
										key={tag}
										className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500"
									>
										{tag}
									</span>
								))}
							</div>
							<h3 className="text-base font-black leading-snug text-gray-950 transition-colors group-hover:text-[#e11d48]">
								{demo.title}
							</h3>
							<p className="mt-2 flex-1 text-sm leading-relaxed text-gray-500">
								{demo.description}
							</p>
							<span className="mt-4 inline-flex min-h-9 items-center text-xs font-black text-gray-600 transition-colors group-hover:text-[#e11d48]">
								デモを開く ↗
							</span>
						</a>
					))}
				</div>
			</section>

			<div className="mb-8 border-t border-gray-100 pt-8">
				<h2 className="text-2xl font-black tracking-tight text-gray-950">
					WebXR仕様から探す
				</h2>
				<p className="mt-2 text-sm leading-relaxed text-gray-500">
					各仕様の対応状況を確認しながら、公式サンプルやライブラリのデモを開けます。
				</p>
			</div>

			<WebXRSpecList />

			<footer className="mt-12 border-t border-gray-100 pt-6">
				<p className="text-xs leading-relaxed text-gray-400">
					下部の仕様一覧はW3C標準のWebXR仕様を対象としています。8th
					Wall系のカメラベースWebARは、スマートフォン向けデモとして上の一覧に掲載しています。ブラウザ横断の対応状況は
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
