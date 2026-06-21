import type { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";

export const metadata: Metadata = {
	title: "WebXR FAQ｜よくある質問と回答",
	description:
		"WebXRとは何か、iPhone(Safari)・Meta Quest・PCVRで動くか、Three.jsやBabylon.jsの選び方、WebXRとWebVR/WebARの違いなど、よくある質問に日本語で回答します。",
	alternates: { canonical: "/faq" },
};

const FAQ_ITEMS = [
	{
		category: "WebXRについて",
		question: "WebXRとは何ですか？",
		answer:
			"WebXR は、ウェブブラウザ上で仮想現実（VR）や拡張現実（AR）を扱うための Web API の総称です。アプリをインストールしなくても、対応するブラウザから XR 体験を提供できます。",
	},
	{
		category: "WebXRについて",
		question: "WebXRとWebVRの違いは何ですか？",
		answer:
			"WebVR は主に VR 向けの仕様でしたが、WebXR は VR に加えて AR も扱えるように設計されています。現在は WebVR の後継として WebXR が使われています。",
	},
	{
		category: "WebXRについて",
		question: "WebXRはどのブラウザでサポートされていますか？",
		answer:
			"対応状況はブラウザやデバイスの組み合わせで変わります。Chrome 系や Quest Browser を中心に利用できる機能が多く、詳細は対応デバイス一覧と標準化・対応状況ページで確認できます。",
	},
	{
		category: "開発について",
		question: "WebXRの開発を始めるには何が必要ですか？",
		answer:
			"HTML、JavaScript、CSS の基本知識と、WebXR に対応したブラウザがあれば始められます。Three.js や Babylon.js のような 3D ライブラリを使うと実装しやすくなります。",
	},
	{
		category: "開発について",
		question: "WebXR開発でよく使われるフレームワークは？",
		answer:
			"Three.js、Babylon.js、A-Frame、React Three Fiber などがよく使われます。特徴の違いはライブラリページでまとめています。",
	},
	{
		category: "開発について",
		question: "VRデバイスなしでもWebXRの開発はできますか？",
		answer:
			"はい、可能です。ブラウザの開発者ツールやエミュレーター拡張を使えば、実機がなくても基本的な実装確認を進められます。ただし最終確認には実機があると安心です。",
	},
	{
		category: "デバイス・ハードウェア",
		question: "Meta Quest 3でWebXRは使えますか？",
		answer:
			"はい。Meta Quest 3 では標準ブラウザから WebXR コンテンツを利用できます。Quest 2 や Quest Pro でも多くのコンテンツを試せます。",
	},
	{
		category: "デバイス・ハードウェア",
		question: "iPhoneでWebXR ARは使えますか？",
		answer:
			"iPhone での AR 体験は、ブラウザ単体ではなくアプリや App Clip など別の導線を使うケースもあります。利用方法は端末や実装方式によって変わるため、対応デバイス一覧もあわせて確認してください。",
	},
	{
		category: "デバイス・ハードウェア",
		question: "PCVR（SteamVR、Oculus Link）でWebXRは動作しますか？",
		answer:
			"はい。Chrome や Edge と PCVR ランタイムを組み合わせることで、対応ヘッドセット上で WebXR コンテンツを利用できます。詳しくは PCVR WebXR ガイドを参照してください。",
	},
	{
		category: "BANGEOについて",
		question: "BANGEOとは何ですか？",
		answer:
			"BANGEO は、WebXR に関する情報を日本語で整理して公開する OSS ベースの情報サイトです。技術記事、デモ、ポッドキャスト、デバイス情報などを扱っています。",
	},
	{
		category: "BANGEOについて",
		question: "コンテンツの投稿や貢献は可能ですか？",
		answer:
			"はい。GitHub リポジトリから Pull Request を送るか、Issue や Discord で相談してください。小さな修正や文言の改善も歓迎しています。",
	},
	{
		category: "BANGEOについて",
		question: "改善提案や質問はどこから送れますか？",
		answer:
			"GitHub Issues、Pull Request、Discord から受け付けています。確定した修正や不具合報告は GitHub、実装前の相談は Discord が向いています。",
	},
	{
		category: "トラブルシューティング",
		question: "WebXRコンテンツが動作しません。何が原因ですか？",
		answer:
			"主な原因として、ブラウザやデバイスが対応していない、HTTPS ではなく HTTP で配信している、権限が許可されていない、ブラウザのバージョンが古い、といった点が考えられます。対応状況はデバイスページで確認できます。",
	},
	{
		category: "トラブルシューティング",
		question: "「XRSession creation failed」エラーが出ます",
		answer:
			"WebXR セッションの作成に失敗すると表示されるエラーです。対応していない機能を要求している、HTTPS で配信していない、権限が拒否されている、といった原因が考えられます。",
	},
];

export default function FaqPage() {
	const grouped = FAQ_ITEMS.reduce<
		Record<string, { question: string; answer: string }[]>
	>((acc, item) => {
		if (!acc[item.category]) {
			acc[item.category] = [];
		}
		acc[item.category].push({
			question: item.question,
			answer: item.answer,
		});
		return acc;
	}, {});

	return (
		<div className="max-w-4xl mx-auto px-6 md:px-8 py-16 md:py-20">
			<BreadcrumbStructuredData items={[{ name: "FAQ", path: "/faq" }]} />
			{/* Header */}
			<header className="space-y-6 text-center mb-16">
				<h1 className="text-4xl md:text-5xl font-black tracking-tight text-gray-950">
					よくある質問（FAQ）
					<span className="text-[#e11d48]">。</span>
				</h1>
				<p className="text-xl text-gray-500 font-medium leading-relaxed">
					WebXR や BANGEO に関する、よくある質問と回答をまとめています
				</p>
			</header>

			{/* FAQ sections */}
			<div className="space-y-12">
				{Object.entries(grouped).map(([category, items]) => (
					<section key={category} className="space-y-6">
						<h2 className="text-2xl font-bold border-b-2 border-rose-200 pb-4 text-gray-950">
							{category}
						</h2>
						<div className="space-y-4">
							{items.map((item) => (
								<details
									key={item.question}
									className="group bg-white rounded-xl border border-gray-200 p-6 hover:border-rose-200 transition-colors"
								>
									<summary className="flex items-center justify-between cursor-pointer list-none font-bold text-gray-950">
										<span>{item.question}</span>
										<svg
											className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-90 shrink-0 ml-4"
											aria-hidden="true"
											fill="none"
											viewBox="0 0 24 24"
											stroke="currentColor"
											strokeWidth={2}
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												d="M9 5l7 7-7 7"
											/>
										</svg>
									</summary>
									<p className="mt-4 text-gray-600 leading-relaxed">
										{item.answer}
									</p>
								</details>
							))}
						</div>
					</section>
				))}
			</div>

			{/* Bottom CTA */}
			<section className="mt-16 bg-rose-50 rounded-3xl p-10 text-center space-y-6">
				<h2 className="text-2xl font-black text-gray-950">
					お探しの情報が見つかりませんでしたか？
				</h2>
				<p className="text-gray-600 leading-relaxed">
					解決しない場合は、お問い合わせページや Discord
					コミュニティをご利用ください。
				</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<Link
						href="/contact"
						className="inline-block px-8 py-4 bg-[#e11d48] text-white rounded-full font-black hover:bg-[#be185d] transition-all"
					>
						お問い合わせ
					</Link>
					<a
						href="https://discord.com/invite/9WyRvAwX7B"
						target="_blank"
						rel="noopener noreferrer"
						className="inline-block px-8 py-4 bg-white text-gray-950 border border-gray-200 rounded-full font-black hover:border-rose-200 transition-all"
					>
						Discordに参加する
					</a>
				</div>
			</section>
		</div>
	);
}
