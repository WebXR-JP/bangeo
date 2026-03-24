import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "私たちについて",
	description:
		"BANGEO は、WebXR に関する情報を日本語で整理して公開するオープンなナレッジベースです。",
	alternates: { canonical: "/about" },
};

export default function AboutPage() {
	return (
		<div className="relative max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20 overflow-hidden">
			<img
				src="/assets/mascot/watermark.png"
				alt=""
				className="absolute w-[600px] top-1/2 -right-40 -rotate-12 opacity-[0.04] pointer-events-none"
			/>
			<div className="space-y-24 md:space-y-32 relative z-10">
				{/* Hero */}
				<header className="space-y-8 text-center max-w-4xl mx-auto">
					<div className="flex justify-center mb-4">
						<img
							src="/assets/mascot/hero.png"
							alt="BANGEOマスコット"
							className="w-32 md:w-40"
						/>
					</div>
					<h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-gray-900">
						私たちについて<span className="text-[#e11d48]">。</span>
					</h1>
					<p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed">
						BANGEO は、WebXR に関する情報を日本語で整理して公開するオープンなナレッジベースです。
					</p>
				</header>

				{/* Features */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="p-10 bg-white/60 border border-white rounded-[3rem] space-y-6">
						<div className="mb-6 h-20">
							<img
								src="/assets/mascot/vr.png"
								alt="デモマスコット"
								className="h-full w-auto object-contain"
							/>
						</div>
						<h2 className="text-3xl font-black">WebXR デモ</h2>
						<p className="text-lg text-gray-500 leading-relaxed font-medium">
							WebXR Device API の機能を実際に試せるデモを公開しています。ハンドトラッキング、空間音響、AR
							などを、ブラウザ上で確認できます。
						</p>
						<Link
							href="/experiments"
							className="inline-block font-black text-[#e11d48] hover:translate-x-2 transition-transform"
						>
							デモ集を見る →
						</Link>
					</div>
					<div className="p-10 bg-white/60 border border-white rounded-[3rem] space-y-6">
						<div className="mb-6 h-20">
							<img
								src="/assets/mascot/tech.png"
								alt="技術マスコット"
								className="h-full w-auto object-contain"
							/>
						</div>
						<h2 className="text-3xl font-black">技術解説</h2>
						<p className="text-lg text-gray-500 leading-relaxed font-medium">
							検証で得られた知見を、実践的な記事として整理しています。ソースコードの解説から、WebXR
							特有の課題への対応まで、開発に役立つ情報をまとめています。
						</p>
						<Link
							href="/tech-articles"
							className="inline-block font-black text-[#e11d48] hover:translate-x-2 transition-transform"
						>
							技術解説を読む →
						</Link>
					</div>
				</div>

				{/* Community */}
				<section className="space-y-12 text-center">
					<div className="space-y-6">
						<h2 className="text-4xl md:text-6xl font-black tracking-tighter">
							コミュニティ
						</h2>
						<p className="text-xl text-gray-500 font-medium leading-relaxed max-w-3xl mx-auto">
							日本の WebXR 開発者が集まる Discord コミュニティ「WebXR JP」とも連携し、情報共有や議論の場を広げています。
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-4">
							<h3 className="text-2xl font-black">ニュース</h3>
							<p className="text-gray-500 leading-relaxed">
								WebXR のニュース、イベント情報、BANGEO の更新内容をまとめています。
							</p>
							<Link
								href="/tech-articles"
								className="inline-block font-black text-gray-950 hover:text-[#e11d48] transition-colors"
							>
								ニュースを見る →
							</Link>
						</div>
						<div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-4">
							<h3 className="text-2xl font-black">ポッドキャスト</h3>
							<p className="text-gray-500 leading-relaxed">
								WebXR JP のメンバーが、XR の話題や開発で気づいたことを気軽に話しています。
							</p>
							<Link
								href="/podcast"
								className="inline-block font-black text-gray-950 hover:text-[#e11d48] transition-colors"
							>
								ポッドキャストを聞く →
							</Link>
						</div>
					</div>
				</section>

				{/* Participation */}
				<section className="bg-gray-950 text-white p-12 md:p-20 rounded-[4rem] text-center space-y-10">
					<div className="space-y-6">
						<h2 className="text-4xl md:text-6xl font-black tracking-tighter">
							参加する
						</h2>
						<p className="text-xl text-gray-300 font-medium leading-relaxed max-w-2xl mx-auto">
							改善提案、不具合報告、コンテンツ追加の相談は GitHub とコミュニティから受け付けています。
						</p>
					</div>
					<Link
						href="/contact"
						className="inline-block px-12 py-5 bg-[#e11d48] text-white rounded-full font-black text-lg hover:bg-[#be185d] transition-all transform hover:scale-105"
					>
						参加方法を見る
					</Link>
				</section>
			</div>
		</div>
	);
}
