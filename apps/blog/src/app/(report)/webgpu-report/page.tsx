import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { ReportTopAnchor } from "@/components/report/report-top-anchor";
import { WebGPUReport } from "@/components/webgpu-report";

const title = "WebGPU対応レポート｜この端末のGPU機能と上限値を日本語で確認";

export const metadata: Metadata = {
	title,
	description:
		"いま開いている端末のWebGPU対応状況を、features・limits・WGSL言語機能の1項目ずつ日本語の解説つきで確認できます。仕様が定める既定値と比べて、どこまで余裕があるかも分かります。",
	openGraph: {
		title,
		description:
			"WebGPUのfeatures・limits・WGSL言語機能を、1項目ずつ日本語の解説つきで確認できます。",
		type: "website",
		images: ["/ogp.png"],
	},
	alternates: { canonical: "/webgpu-report" },
};

export default function WebGPUReportPage() {
	return (
		<>
			<ReportTopAnchor />
			<BreadcrumbStructuredData
				items={[
					{ name: "レポート", path: "/report" },
					{ name: "WebGPU対応レポート", path: "/webgpu-report" },
				]}
			/>

			<header className="mb-8">
				<h1 className="text-balance text-2xl font-black tracking-tight text-gray-950 md:text-3xl">
					WebGPU対応レポート
				</h1>
				<p className="mt-3 text-sm leading-relaxed text-gray-600">
					いま開いている端末のGPUが、WebGPUのどの機能を持ち、どこまで大きな値を扱えるかを表示します。項目名だけでは分かりにくい
					features・limits・WGSL言語機能を、1項目ずつ日本語の解説つきで並べています。
				</p>
			</header>

			<WebGPUReport />

			<footer className="mt-12 space-y-3 border-t border-gray-100 pt-6">
				<p className="text-xs leading-relaxed text-gray-500">
					表示している値は、この端末・このブラウザ・この時点でのGPUアダプターの申告値です。同じ端末でも、外部GPUの接続状態やブラウザの設定、省電力の状況によって変わることがあります。項目名と既定値はW3C
					WebGPU仕様（
					<a
						href="https://www.w3.org/TR/webgpu/"
						target="_blank"
						rel="noopener noreferrer"
						className="text-gray-600 underline decoration-gray-300 underline-offset-2 transition hover:text-primary-600"
					>
						W3C WebGPU
					</a>
					）に準拠しています。
				</p>
				<p className="text-xs leading-relaxed text-gray-500">
					ブラウザ横断の標準化状況は
					<Link
						href="/webxr-status"
						className="text-gray-600 underline decoration-gray-300 underline-offset-2 transition hover:text-primary-600"
					>
						標準化・対応状況
					</Link>
					、端末ごとの仕様は
					<Link
						href="/devices"
						className="text-gray-600 underline decoration-gray-300 underline-offset-2 transition hover:text-primary-600"
					>
						対応デバイス一覧
					</Link>
					で確認できます。
				</p>
			</footer>
		</>
	);
}
