import type { Metadata } from "next";
import Link from "next/link";
import { CollectionStructuredData } from "@/components/collection-structured-data";
import { WebXRSpecList } from "@/components/webxr-spec-list";

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
	return (
		<div className="mx-auto max-w-4xl px-6 py-16 md:px-8 md:py-20">
			<CollectionStructuredData
				name="BANGEO WebXRデモ"
				path="/experiments"
				description="WebXRの各仕様を、端末の対応状況を確認しながらブラウザで動かして確かめられるデモ一覧。"
				breadcrumbs={[{ name: "デモ", path: "/experiments" }]}
				items={[]}
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
