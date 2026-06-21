import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { OptimizedImage } from "@/components/optimized-image";
import { MASCOT_IMAGE_SIZES } from "@/lib/image-defaults";

export const metadata: Metadata = {
	title: "BANGEOについて｜WebXR日本語リソースの運営方針",
	description:
		"BANGEOはWebXR・VR/AR・Meta Quest・iPhone・WebGPUの情報を日本語で整理するOSS技術リソースです。実機確認・出典重視・日本語入口の3原則で運営し、GitHubで改善提案・寄稿・検証協力を受け付けています。",
	alternates: { canonical: "/about" },
};

const principles = [
	{
		title: "実機で確認できる情報を重視",
		description:
			"Meta Quest、iPhone、Android、PCブラウザなど、WebXRを実際に試すときに必要な前提や制約を整理します。",
	},
	{
		title: "出典と公開情報を追う",
		description:
			"W3C、ブラウザベンダー、ライブラリのGitHub、公式ドキュメントを確認し、古くなりやすい情報を更新します。",
	},
	{
		title: "日本語で探せる入口を作る",
		description:
			"英語の仕様やissueに直接行く前に、背景、用語、判断ポイントを日本語で理解できる状態を目指します。",
	},
] as const;

const contributionItems = [
	"WebXR対応状況の実機レポート",
	"記事の誤字、リンク切れ、古い情報の修正",
	"Three.js、PlayCanvas、WebGPU、iPhone WebXRの検証メモ",
	"BANGEOで扱ってほしいニュース、デモ、イベント情報",
] as const;

export default function AboutPage() {
	return (
		<div className="relative max-w-6xl mx-auto px-4 md:px-6 py-16 md:py-20 overflow-hidden">
			<BreadcrumbStructuredData
				items={[{ name: "私たちについて", path: "/about" }]}
			/>
			<OptimizedImage
				src="/assets/mascot/watermark.png"
				alt=""
				width={600}
				height={600}
				sizes="600px"
				className="absolute w-[600px] top-1/2 -right-40 -rotate-12 opacity-[0.04] pointer-events-none"
			/>
			<div className="space-y-24 md:space-y-32 relative z-10">
				{/* Hero */}
				<header className="space-y-8 text-center max-w-4xl mx-auto">
					<div className="flex justify-center mb-4">
						<OptimizedImage
							src="/assets/mascot/hero.png"
							alt="BANGEOマスコット"
							width={160}
							height={160}
							sizes={MASCOT_IMAGE_SIZES}
							priority
							className="w-32 md:w-40 h-auto"
						/>
					</div>
					<h1 className="text-4xl md:text-6xl font-black tracking-tighter leading-tight text-gray-900">
						私たちについて<span className="text-[#e11d48]">。</span>
					</h1>
					<p className="text-xl md:text-2xl text-gray-500 font-medium leading-relaxed">
						BANGEO は、WebXR
						に関する情報を日本語で整理して公開するオープンな技術リソースです。記事、デモ、改善提案は
						GitHub とコミュニティを通じて育てています。
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
						<a
							href="https://github.com/WebXR-JP/bangeo"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center rounded-full bg-gray-950 px-7 py-4 text-sm font-black text-white transition-colors hover:bg-[#e11d48]"
						>
							GitHubを見る
						</a>
						<Link
							href="/contact"
							className="inline-flex items-center justify-center rounded-full border border-rose-100 bg-white px-7 py-4 text-sm font-black text-gray-950 transition-colors hover:border-rose-200 hover:text-[#e11d48]"
						>
							参加・問い合わせ
						</Link>
					</div>
				</header>

				{/* Principles */}
				<section className="space-y-10">
					<div className="max-w-3xl">
						<p className="text-xs font-black tracking-[0.28em] text-rose-600 mb-3">
							WHY BANGEO
						</p>
						<h2 className="text-3xl md:text-5xl font-black tracking-tight text-gray-950">
							WebXRを日本語で追い続けるために
						</h2>
						<p className="mt-5 text-lg leading-relaxed text-gray-500 font-medium">
							WebXRは仕様、ブラウザ実装、デバイス、ライブラリの更新が速く、古い情報が検索結果に残りやすい領域です。BANGEOは、開発者が判断しやすいように、検証しやすい情報と出典への導線をまとめます。
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{principles.map((principle) => (
							<div
								key={principle.title}
								className="rounded-2xl border border-gray-100 bg-white/70 p-7"
							>
								<h3 className="text-xl font-black text-gray-950">
									{principle.title}
								</h3>
								<p className="mt-4 text-sm leading-relaxed text-gray-500 font-medium">
									{principle.description}
								</p>
							</div>
						))}
					</div>
				</section>

				{/* Features */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="p-10 bg-white/60 border border-white rounded-[3rem] space-y-6">
						<div className="mb-6 h-20">
							<OptimizedImage
								src="/assets/mascot/vr.png"
								alt="デモマスコット"
								width={160}
								height={80}
								sizes="160px"
								className="h-full w-auto object-contain"
							/>
						</div>
						<h2 className="text-3xl font-black">WebXR デモ</h2>
						<p className="text-lg text-gray-500 leading-relaxed font-medium">
							WebXR Device API
							の機能を実際に試せるデモを公開しています。ハンドトラッキング、空間音響、AR
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
							<OptimizedImage
								src="/assets/mascot/tech.png"
								alt="技術マスコット"
								width={160}
								height={80}
								sizes="160px"
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
							日本の WebXR 開発者が集まる Discord コミュニティ「WebXR
							JP」とも連携し、情報共有や議論の場を広げています。
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
						<div className="p-8 bg-gray-50 rounded-[2.5rem] space-y-4">
							<h3 className="text-2xl font-black">ニュース</h3>
							<p className="text-gray-500 leading-relaxed">
								WebXR のニュース、イベント情報、BANGEO
								の更新内容をまとめています。
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
								WebXR JP のメンバーが、XR
								の話題や開発で気づいたことを気軽に話しています。
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
							BANGEOでは、WebXRに関する検証協力、記事の改善、デモ提案、イベント情報の共有を歓迎しています。小さな修正も歓迎です。
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto text-left">
						{contributionItems.map((item) => (
							<div
								key={item}
								className="rounded-2xl border border-white/10 bg-white/5 px-5 py-4 text-sm font-bold text-gray-200"
							>
								{item}
							</div>
						))}
					</div>
					<div className="flex flex-col sm:flex-row justify-center gap-3">
						<a
							href="https://github.com/WebXR-JP/bangeo/issues"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center justify-center px-8 py-4 bg-[#e11d48] text-white rounded-full font-black text-base hover:bg-[#be185d] transition-all"
						>
							GitHub Issuesへ
						</a>
						<Link
							href="/contact"
							className="inline-flex items-center justify-center px-8 py-4 bg-white text-gray-950 rounded-full font-black text-base hover:bg-rose-50 transition-all"
						>
							参加方法を見る
						</Link>
					</div>
				</section>
			</div>
		</div>
	);
}
