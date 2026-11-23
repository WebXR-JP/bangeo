import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { ReportOverview } from "@/components/report/report-overview";
import { ReportTopAnchor } from "@/components/report/report-top-anchor";

const title = "WebXR・WebGPU対応レポート｜この端末で使える機能を画像で確認";
const description =
	"いま開いている端末とブラウザで、WebXRとWebGPUのどの機能が使えるかをその場で判定し、1枚の画像にまとめます。画像は保存して、そのまま共有できます。";

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description,
		type: "website",
		images: ["/ogp.png"],
	},
	// 共有されるURLなので、Xのカードにもこのページの題名と説明を出す
	twitter: {
		card: "summary_large_image",
		title,
		description,
		images: ["/ogp.png"],
	},
	alternates: { canonical: "/report" },
};

export default function ReportOverviewPage() {
	return (
		<>
			<ReportTopAnchor />
			<BreadcrumbStructuredData
				items={[{ name: "レポート", path: "/report" }]}
			/>

			<header className="mb-10">
				{/* 狭い画面でも「WebXR・WebGPU」を分けずに折る */}
				<h1 className="text-2xl font-black text-gray-950 md:text-3xl">
					<span className="inline-block">WebXR・WebGPU</span>対応レポート
				</h1>
				<p className="mt-3 max-w-[40em] break-phrase text-sm leading-[1.8] text-gray-600">
					いま開いている端末とブラウザで、WebXRとWebGPUのどの機能が使えるかを判定した結果です。確かめたい端末のブラウザでこのページを開くと、その端末の結果に変わります。
				</p>
			</header>

			<ReportOverview />

			<footer className="mt-12 border-t border-gray-200 pt-6">
				<p className="max-w-[40em] text-xs leading-relaxed text-gray-500">
					判定はこの端末・このブラウザ・この時点のものです。ブラウザ横断の標準化状況は
					<Link
						href="/webxr-status"
						className="whitespace-nowrap text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-primary-600 hover:decoration-current"
					>
						標準化・対応状況
					</Link>
					、端末ごとの仕様は
					<Link
						href="/devices"
						className="whitespace-nowrap text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-primary-600 hover:decoration-current"
					>
						対応デバイス一覧
					</Link>
					で確認できます。
				</p>
			</footer>
		</>
	);
}
