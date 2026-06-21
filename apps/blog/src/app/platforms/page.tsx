import type { Metadata } from "next";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { WEBXR_PLATFORMS } from "@/data/platforms";

export const metadata: Metadata = {
	title: "WebXRプラットフォーム｜Quest Browser・iOS Safari・visionOS",
	description:
		"WebXRを実装・配信・体験するための主要プラットフォーム（Meta Quest Browser、iOS Safari、visionOS Safari、Chrome、Edge、Firefox）や代表サービスを整理しています。",
	alternates: { canonical: "/platforms" },
};

export default function PlatformsPage() {
	return (
		<div className="px-4 md:px-6 py-16 md:py-20 max-w-7xl mx-auto">
			<BreadcrumbStructuredData
				items={[{ name: "プラットフォーム", path: "/platforms" }]}
			/>
			<div className="space-y-24">
				{/* Header */}
				<header className="text-center max-w-4xl mx-auto space-y-8">
					<h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-gray-900">
						プラットフォーム<span className="text-[#e11d48]">。</span>
					</h1>
					<p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed">
						WebXR
						の実装・配信・体験に使われる主要なプラットフォームやサービスをまとめています。
					</p>
				</header>

				{/* Platforms List */}
				<section className="space-y-6">
					<h2 className="text-2xl font-black tracking-tight text-gray-800 border-l-4 border-gray-200 pl-6 ml-2">
						主要プラットフォーム一覧
					</h2>

					<div className="bg-white/80 border border-white rounded-[2.5rem] overflow-hidden shadow-xs">
						<div className="divide-y divide-gray-100">
							{WEBXR_PLATFORMS.map((platform) => (
								<div
									key={platform.id}
									className="group p-6 hover:bg-white transition-all duration-200"
								>
									<div className="flex flex-col lg:flex-row gap-6 lg:items-center">
										{/* Title & Status */}
										<div className="lg:w-1/4 shrink-0">
											<div className="flex items-center gap-3">
												<a
													href={platform.link}
													target="_blank"
													rel="noopener noreferrer"
													className="flex items-center gap-1.5 group/link"
												>
													<h3 className="text-lg font-black text-gray-900 group-hover/link:text-rose-500 transition-colors">
														{platform.name}
													</h3>
													<svg
														className="w-3.5 h-3.5 text-gray-300 group-hover/link:text-rose-500 transition-colors"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
														aria-hidden="true"
													>
														<path
															strokeLinecap="round"
															strokeLinejoin="round"
															strokeWidth="3"
															d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
														/>
													</svg>
												</a>
											</div>
										</div>

										{/* Features */}
										<div className="flex-1">
											<div className="flex flex-wrap gap-x-6 gap-y-2">
												{platform.features.map((feature: string) => (
													<div
														key={`${platform.name}-${feature}`}
														className="flex items-start gap-2 text-xs text-gray-500 font-medium"
													>
														<span className="text-[#e11d48] mt-0.5">●</span>
														<span className="leading-snug">{feature}</span>
													</div>
												))}
											</div>
										</div>

										{/* Notes */}
										<div className="lg:w-1/4 lg:text-right">
											{platform.notes && (
												<p className="text-[10px] text-gray-500 font-medium italic leading-relaxed">
													{platform.notes}
												</p>
											)}
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</section>
			</div>
		</div>
	);
}
