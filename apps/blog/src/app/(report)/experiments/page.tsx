import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { ReportTopAnchor } from "@/components/report/report-top-anchor";
import { WebXRSpecList } from "@/components/webxr-spec-list";

const title = "WebXR対応レポート｜仕様ごとの対応状況とデモをこの端末で確かめる";
const description =
	"WebXRの各仕様（immersive-vr、Hit Test、Hand Inputなど）を、いま開いている端末で対応状況を確認しながら、公式サンプルやライブラリのデモをそのままブラウザで動かして確かめられます。";

export const metadata: Metadata = {
	title,
	description,
	openGraph: {
		title,
		description,
		type: "website",
		images: ["/ogp.png"],
	},
	alternates: { canonical: "/experiments" },
};

export default function WebXRReportPage() {
	return (
		<>
			<ReportTopAnchor />
			<BreadcrumbStructuredData
				items={[
					{ name: "レポート", path: "/report" },
					{ name: "WebXR対応レポート", path: "/experiments" },
				]}
			/>

			<header>
				<h1 className="text-2xl font-black text-gray-950 md:text-3xl">
					WebXR対応レポート
				</h1>
				<p className="mt-3 max-w-[40em] break-phrase text-sm leading-[1.8] text-gray-600">
					WebXRの仕様ごとに、この端末での対応を判定しています。公式サンプルやライブラリのデモを開いて、その場で動きを確かめられます。
				</p>
			</header>

			<WebXRSpecList />

			<footer className="mt-12 border-t border-gray-200 pt-6">
				<p className="max-w-[40em] text-xs leading-relaxed text-gray-500">
					このページはW3C標準のWebXR仕様を対象としています。カメラベースのWebAR（8th
					Wall系）は対象外です。ブラウザ横断の対応状況は
					<Link
						href="/webxr-status"
						className="whitespace-nowrap text-gray-600 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-primary-600 hover:decoration-current"
					>
						標準化・対応状況
					</Link>
					をご覧ください。
				</p>
			</footer>
		</>
	);
}
