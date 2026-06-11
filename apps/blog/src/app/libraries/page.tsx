import type { Metadata } from "next";
import { LIBRARIES } from "@/data/libraries";

export const metadata: Metadata = {
	title: "ライブラリ",
	description: "WebXR 開発で使われる主要ライブラリと公式ドキュメントへの導線。",
	alternates: { canonical: "/libraries" },
};

export default function LibrariesPage() {
	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			{/* Header */}
			<header className="mb-12">
				<h1 className="text-3xl font-black tracking-tight text-gray-950 mb-3">
					ライブラリ
				</h1>
				<p className="text-base text-gray-500 leading-relaxed max-w-3xl">
					WebXR
					開発で使われる主要ライブラリと、公式ドキュメントやリポジトリへの導線をまとめています。
				</p>
			</header>

			{/* Library Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
				{LIBRARIES.map((library) => (
					<div
						key={library.id}
						className="bg-white rounded-[2.5rem] border border-gray-100 p-8 md:p-10 space-y-6"
					>
						<div className="space-y-3">
							<h2 className="text-3xl font-black text-gray-950">
								{library.name}
							</h2>
							<p className="text-lg text-gray-500 font-medium leading-relaxed">
								{library.description}
							</p>
						</div>

						<div className="flex flex-wrap gap-3">
							<a
								href={library.repositoryUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-block px-6 py-3 bg-white border border-gray-200 text-gray-950 rounded-full font-black text-sm hover:bg-gray-50 transition-colors"
							>
								GitHub
							</a>
							<a
								href={library.documentationUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="inline-block px-6 py-3 bg-gray-950 text-white rounded-full font-black text-sm hover:bg-gray-800 transition-colors"
							>
								ドキュメント
							</a>
						</div>

						<p className="text-xs text-gray-500 leading-relaxed">
							更新状況や導入方法の詳細は公式ドキュメントと GitHub
							リポジトリを参照してください。
						</p>
					</div>
				))}
			</div>
		</div>
	);
}
