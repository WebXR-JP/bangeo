import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import { Analytics, GTMNoScript } from "@/components/analytics";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { SiteAnalytics } from "@/components/site-analytics";
import { StructuredData } from "@/components/structured-data";
import { SITE_URL } from "@/lib/site-url";
import { ADSENSE_CLIENT, HAS_ADSENSE, HAS_GTM } from "@/lib/third-party";

// weight を指定しない = 可変フォント（wght 100〜900）として1組の @font-face で読む。
// ウェイトごとに @font-face を並べるより CSS が約1/3になり、font-medium(500) なども
// 400 に丸められずに効く（フォントファイル自体は、ウェイトを指定していたときも同じ可変フォント）
const notoSansJP = Noto_Sans_JP({
	subsets: ["latin"],
	variable: "--font-noto-sans-jp",
	display: "swap",
	preload: true,
	adjustFontFallback: true,
});

export const viewport: Viewport = {
	themeColor: "#ffffff",
	width: "device-width",
	initialScale: 1,
};

export const metadata: Metadata = {
	title: {
		template: "%s | BANGEO",
		default: "WebXRを日本語で学ぶ｜VR・ARデモ・対応ブラウザ・実装ガイド",
	},
	description:
		"WebXR（VR/AR/MR）の基礎、対応ブラウザ、Meta Quest・iPhoneでの動かし方、ブラウザで試せるデモ、実装ガイド、標準化の動きを日本語で整理する技術リソース。Three.js・PlayCanvas・8th Wall・IWSDKのサンプルも公開。",
	keywords: [
		"WebXR",
		"WebXR 日本語",
		"WebXR デモ",
		"VR ブラウザ",
		"AR ブラウザ",
		"WebXR 対応ブラウザ",
		"WebXR 実装ガイド",
	],
	metadataBase: new URL(SITE_URL),
	icons: {
		icon: "/favicon.png",
	},
	manifest: "/site.webmanifest",
	openGraph: {
		type: "website",
		locale: "ja_JP",
		siteName: "BANGEO（バンオ）",
		title: "WebXRを日本語で学ぶ｜VR・ARデモ・対応ブラウザ・実装ガイド",
		description:
			"WebXR（VR/AR/MR）の基礎、対応ブラウザ、Meta Quest・iPhoneでの動かし方、ブラウザで試せるデモ、実装ガイド、標準化の動きを日本語で整理する技術リソース。",
		images: [
			{
				url: "/ogp.png",
				width: 1200,
				height: 630,
				alt: "BANGEO｜WebXR日本語リソース",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		site: "@bangeo_jp",
		creator: "@bangeo_jp",
		title: "WebXRを日本語で学ぶ｜VR・ARデモ・対応ブラウザ・実装ガイド",
		description:
			"WebXRの基礎、対応ブラウザ、VR/ARデモ、実装ガイド、標準化の動きを日本語で整理。",
		images: ["/ogp.png"],
	},
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
			"max-video-preview": -1,
		},
	},
	alternates: {
		canonical: SITE_URL,
		languages: {
			ja: SITE_URL,
			"x-default": SITE_URL,
		},
		types: {
			"application/rss+xml": `${SITE_URL}/rss.xml`,
		},
	},
	authors: [{ name: "BANGEO" }],
	formatDetection: {
		telephone: false,
	},
	other: {
		"format-detection": "telephone=no",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		// data-scroll-behavior: globals.css の scroll-behavior: smooth を、ページ遷移の間だけ
		// Next.js に切ってもらう指定。無いと遷移後の「先頭へ戻す」処理が滑らかなスクロールと
		// 競合し、下までスクロールした状態から開いたページの先頭がヘッダーの裏に隠れる
		<html
			lang="ja"
			data-scroll-behavior="smooth"
			className={notoSansJP.variable}
			suppressHydrationWarning
		>
			<head>
				<link rel="preconnect" href="https://i.ytimg.com" />
				<link rel="dns-prefetch" href="https://i.ytimg.com" />
				{HAS_GTM && (
					<>
						<link rel="preconnect" href="https://www.googletagmanager.com" />
						<link rel="dns-prefetch" href="https://www.googletagmanager.com" />
					</>
				)}
				{HAS_ADSENSE && (
					<>
						<link
							rel="preconnect"
							href="https://pagead2.googlesyndication.com"
						/>
						<link
							rel="dns-prefetch"
							href="https://pagead2.googlesyndication.com"
						/>
					</>
				)}
				<StructuredData />
			</head>
			<body className="relative font-sans min-h-screen flex flex-col">
				{/* キーボードで操作する人がヘッダーのリンクを飛ばして本文へ移れるようにする。
				    ふだんは隠し、Tab でフォーカスしたときだけ左上に出す。
				    focus-visible:not-sr-only は padding: 0 も付けて btn の余白を消すので、
				    「フォーカスしていない間だけ sr-only」と書く */}
				<a
					href="#main"
					className="btn btn-dark fixed left-4 top-4 z-[60] not-focus-visible:sr-only"
				>
					本文へ移動
				</a>
				<GTMNoScript />
				{HAS_ADSENSE && (
					<Script
						src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
						crossOrigin="anonymous"
						strategy="afterInteractive"
					/>
				)}
				<div className="page-wash" aria-hidden="true" />
				<Header />
				<main
					id="main"
					tabIndex={-1}
					className="flex-1 pt-24 md:pt-28 outline-none"
				>
					{children}
				</main>
				<Footer />
				<Analytics />
				<SiteAnalytics />
			</body>
		</html>
	);
}
