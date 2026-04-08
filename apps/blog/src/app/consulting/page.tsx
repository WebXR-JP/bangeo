import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "開発参加・技術相談",
	description:
		"BANGEO は OSS として公開しています。機能提案、不具合報告、改善相談は GitHub とコミュニティで受け付けています。",
	alternates: { canonical: "/consulting" },
};

const services = [
	{
		title: "Issue で相談",
		description:
			"不具合報告、機能提案、設計相談は GitHub Issues へまとめてください。公開トラッキングで状況を共有しやすくなります。",
	},
	{
		title: "Pull Request で改善",
		description:
			"コード、コンテンツ、ドキュメントの修正は Pull Request で歓迎します。小さな改善でもそのままコントリビュートできます。",
	},
	{
		title: "Discord で壁打ち",
		description:
			"実装前の相談や方針の壁打ちは Discord が最短です。公開しにくい話題以外は、できるだけオープンに進めます。",
	},
];

export default function ConsultingPage() {
	return (
		<div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-20">
			{/* Hero */}
			<header className="space-y-8 text-center max-w-4xl mx-auto mb-20">
				<h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-950">
					開発参加・技術相談<span className="text-[#e11d48]">。</span>
				</h1>
				<p className="text-xl text-gray-500 font-medium leading-relaxed">
					BANGEO は OSS として公開しており、個別の受託窓口ではなく GitHub
					とコミュニティを中心に改善を進めています。実装相談、要望、不具合報告は、できるだけ公開の場に集約し、知見を共有できる形で扱います。
				</p>
				<p className="text-base md:text-lg text-gray-500 font-medium leading-relaxed">
					公開リポジトリ:{" "}
					<a
						href="https://github.com/WebXR-JP/bangeo"
						target="_blank"
						rel="noopener noreferrer"
						className="text-[#e11d48] hover:underline"
					>
						https://github.com/WebXR-JP/bangeo
					</a>
				</p>
			</header>

			{/* Services */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
				{services.map((service) => (
					<div
						key={service.title}
						className="p-10 bg-white rounded-3xl border border-gray-100 space-y-6"
					>
						<h2 className="text-2xl font-black text-gray-950">
							{service.title}
						</h2>
						<p className="text-lg text-gray-500 leading-relaxed font-medium">
							{service.description}
						</p>
					</div>
				))}
			</div>

			{/* CTA */}
			<section className="bg-gray-950 text-white p-12 md:p-20 rounded-3xl text-center space-y-10">
				<p className="text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
					まずは GitHub リポジトリまたは Discord から参加してください
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<a
						href="https://github.com/WebXR-JP/bangeo"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block px-12 py-5 bg-[#e11d48] text-white rounded-full font-black text-lg hover:bg-[#be185d] transition-all"
					>
						GitHub を開く
					</a>
					<a
						href="https://discord.com/invite/9WyRvAwX7B"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block px-12 py-5 bg-white/10 text-white border border-white/20 rounded-full font-black text-lg hover:bg-white/20 transition-all"
					>
						Discord で相談する
					</a>
				</div>
			</section>
		</div>
	);
}
