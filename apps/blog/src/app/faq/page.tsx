import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { DISCORD_URL } from "@/lib/navigation";

export const metadata: Metadata = {
	title: "WebXR FAQ｜よくある質問と回答",
	description:
		"WebXRとは何か、iPhone（Safari）・Meta Quest・PCVRで動くか、Three.jsやBabylon.jsの選び方、WebXRとWebVR/WebARの違いなど、よくある質問に日本語で答えています。",
	alternates: { canonical: "/faq" },
};

/** 答えの中のサイト内リンク。行き先の名前の途中で折り返さない */
function InlineLink({ href, children }: { href: string; children: ReactNode }) {
	return (
		<Link href={href} className="text-link whitespace-nowrap">
			{children}
		</Link>
	);
}

type FaqItem = {
	category: string;
	question: string;
	answer: ReactNode;
};

const FAQ_ITEMS: FaqItem[] = [
	{
		category: "WebXRについて",
		question: "WebXRとは何ですか？",
		answer:
			"WebXRは、ブラウザ上でVRやARを動かすためのWeb APIの総称です。アプリを入れなくても、対応ブラウザからURLを開くだけでXR体験を利用できます。",
	},
	{
		category: "WebXRについて",
		question: "WebXRとWebVRの違いは何ですか？",
		answer:
			"WebVRは主にVR向けの仕様でしたが、WebXRはVRに加えてARも扱えるように設計されています。現在はWebVRの後継としてWebXRが使われています。",
	},
	{
		category: "WebXRについて",
		question: "WebXRはどのブラウザでサポートされていますか？",
		answer: (
			<>
				対応状況はブラウザとデバイスの組み合わせで変わります。Chrome系やMeta
				Quest Browserを中心に使える機能が多く、詳しくは
				<InlineLink href="/devices">対応デバイス一覧</InlineLink>と
				<InlineLink href="/webxr-status">標準化・対応状況</InlineLink>
				のページで確認できます。
			</>
		),
	},
	{
		category: "開発について",
		question: "WebXRの開発を始めるには何が必要ですか？",
		answer:
			"HTML、JavaScript、CSSの基本知識と、WebXRに対応したブラウザがあれば始められます。Three.jsやBabylon.jsのような3Dライブラリを使うと実装しやすくなります。",
	},
	{
		category: "開発について",
		question: "WebXR開発でよく使われるフレームワークは？",
		answer: (
			<>
				Three.js、Babylon.js、A-Frame、React Three
				Fiberなどがよく使われます。特徴の違いは
				<InlineLink href="/libraries">ライブラリ</InlineLink>
				のページでまとめています。
			</>
		),
	},
	{
		category: "開発について",
		question: "VRデバイスなしでもWebXRの開発はできますか？",
		answer:
			"はい、できます。ブラウザの開発者ツールやエミュレーター拡張を使えば、実機がなくても基本的な動作確認を進められます。ただし公開前の最終確認には実機があると安心です。",
	},
	{
		category: "デバイス・ハードウェア",
		question: "Meta Quest 3でWebXRは使えますか？",
		answer:
			"はい。Meta Quest 3では標準ブラウザからWebXRコンテンツを利用できます。Meta Quest 2やMeta Quest Proでも多くのコンテンツを試せます。",
	},
	{
		category: "デバイス・ハードウェア",
		question: "iPhoneでWebXR ARは使えますか？",
		answer: (
			<>
				iPhoneのSafari単体ではWebXR ARに対応していないため、専用アプリやApp
				Clipを使う方法をとります。詳しくは
				<InlineLink href="/devices">対応デバイス一覧</InlineLink>と
				<InlineLink href="/tech-articles/ios-webxr-app-clip-guide">
					iPhoneでWebXRを動かす方法
				</InlineLink>
				をご覧ください。
			</>
		),
	},
	{
		category: "デバイス・ハードウェア",
		question: "PCVR（SteamVR、Oculus Link）でWebXRは動作しますか？",
		answer: (
			<>
				はい。ChromeやEdgeとPCVRランタイムを組み合わせれば、対応ヘッドセット上でWebXRコンテンツを動かせます。手順は
				<InlineLink href="/tech-articles/pcvr-webxr-guide">
					PCVRのガイド記事
				</InlineLink>
				で解説しています。
			</>
		),
	},
	{
		category: "BANGEOについて",
		question: "BANGEOとは何ですか？",
		answer:
			"BANGEOは、オープンソースで公開しているWebXRの日本語情報サイトです。技術記事、デモ、ポッドキャスト、デバイスの情報を載せています。",
	},
	{
		category: "BANGEOについて",
		question: "記事の寄稿やサイトの改善に参加できますか？",
		answer:
			"はい。GitHubのリポジトリからPull Requestを送るか、IssueやDiscordで相談してください。小さな修正や文言の改善も歓迎しています。",
	},
	{
		category: "BANGEOについて",
		question: "改善提案や質問はどこから送れますか？",
		answer:
			"GitHub Issues、Pull Request、Discordで受け付けています。確定した修正や不具合の報告はGitHub、実装前の相談はDiscordが向いています。",
	},
	{
		category: "トラブルシューティング",
		question: "WebXRコンテンツが動作しません。何が原因ですか？",
		answer: (
			<>
				主な原因として、ブラウザやデバイスが対応していない、HTTPSではなくHTTPで配信している、権限が許可されていない、ブラウザのバージョンが古い、といった点が考えられます。対応状況は
				<InlineLink href="/devices">対応デバイス一覧</InlineLink>
				で、いま開いている端末で何が動くかは
				<InlineLink href="/report">この端末のレポート</InlineLink>
				で確かめられます。
			</>
		),
	},
	{
		category: "トラブルシューティング",
		question: "「XRSession creation failed」エラーが出ます",
		answer:
			"WebXRセッションの作成に失敗すると表示されるエラーです。対応していない機能を要求している、HTTPSで配信していない、権限が拒否されている、といった原因が考えられます。",
	},
];

export default function FaqPage() {
	const grouped = FAQ_ITEMS.reduce<
		Record<string, { question: string; answer: ReactNode }[]>
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
	const groups = Object.entries(grouped);

	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "よくある質問", path: "/faq" }]}
			/>
			<PageHeader
				title="よくある質問（FAQ）"
				lead={
					<>
						WebXRの基本から、端末ごとの対応、動かないときの原因まで、
						<span className="whitespace-nowrap">
							{FAQ_ITEMS.length}件の質問に答えています。
						</span>
					</>
				}
				className="mb-6"
			/>

			{/* 問いはすべて開いたまま並べるので、分類へ飛べるようにする */}
			<nav aria-label="質問の分類" className="mb-12 md:mb-16">
				<ul className="flex flex-wrap gap-2">
					{groups.map(([category], index) => (
						<li key={category}>
							<a href={`#faq-${index}`} className="btn btn-secondary px-4">
								{category}
							</a>
						</li>
					))}
				</ul>
			</nav>

			{/* 分類ごとに区切り線を引く。
			    PC では左に分類、右に問いと答えを並べる。
			    固定ヘッダーの下に見出しが出るよう、飛び先に上の余白を取る */}
			<div className="space-y-12 md:space-y-16">
				{groups.map(([category, items], index) => (
					<section
						key={category}
						id={`faq-${index}`}
						aria-labelledby={`faq-${index}-heading`}
						className="scroll-mt-24 border-t border-gray-200 pt-6 md:scroll-mt-32 md:pt-8 lg:grid lg:grid-cols-[minmax(0,16rem)_minmax(0,1fr)] lg:gap-12"
					>
						<h2
							id={`faq-${index}-heading`}
							className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem] lg:text-2xl"
						>
							{category}
						</h2>
						<div className="mt-2 min-w-0 divide-y divide-gray-200 lg:mt-0">
							{items.map((item) => (
								<div
									key={item.question}
									className="max-w-[40em] py-6 first:pt-4 last:pb-0 lg:first:pt-1"
								>
									<h3 className="text-lg font-bold leading-snug text-gray-950">
										{item.question}
									</h3>
									<p className="mt-2 text-base leading-[1.8] text-gray-700">
										{item.answer}
									</p>
								</div>
							))}
						</div>
					</section>
				))}
			</div>

			<section
				aria-labelledby="faq-contact"
				className="mt-14 rounded-2xl bg-gray-50 px-6 py-8 md:mt-20 md:px-8"
			>
				<h2
					id="faq-contact"
					className="text-xl font-bold leading-normal text-gray-950"
				>
					ここにない質問の問い合わせ先
				</h2>
				<p className="mt-2 max-w-[40em] text-base leading-[1.8] text-gray-700">
					使い方の質問は、
					<span className="whitespace-nowrap">WebXR JP</span>
					のDiscordで受け付けています。ほかの窓口はお問い合わせのページにまとめています。
				</p>
				<div className="mt-6 flex flex-wrap gap-3">
					<Link href="/contact" className="btn btn-primary">
						問い合わせる
					</Link>
					<a
						href={DISCORD_URL}
						target="_blank"
						rel="noopener noreferrer"
						aria-label="Discordに参加する（新しいタブで開く）"
						className="btn btn-secondary"
					>
						Discordに参加する
						<svg
							className="size-3 shrink-0"
							viewBox="0 0 12 12"
							fill="none"
							stroke="currentColor"
							strokeWidth={1.5}
							strokeLinecap="round"
							strokeLinejoin="round"
							aria-hidden="true"
						>
							<path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
						</svg>
					</a>
				</div>
			</section>
		</div>
	);
}
