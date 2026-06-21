import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Script from "next/script";
import { Analytics, GTMNoScript } from "@/components/analytics";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { StructuredData } from "@/components/structured-data";
import { SITE_URL } from "@/lib/site-url";
import { ADSENSE_CLIENT, HAS_ADSENSE, HAS_GTM } from "@/lib/third-party";

const notoSansJP = Noto_Sans_JP({
	subsets: ["latin"],
	weight: ["400", "700", "900"],
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
		<html lang="ja" className={notoSansJP.variable} suppressHydrationWarning>
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
			<body className="font-sans min-h-screen flex flex-col">
				<GTMNoScript />
				{HAS_ADSENSE && (
					<Script
						src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
						crossOrigin="anonymous"
						strategy="afterInteractive"
					/>
				)}
				<div className="mesh-bg" />
				<Header />
				<main className="flex-1 pt-24 md:pt-28">{children}</main>
				<Footer />
				<Analytics />
			</body>
		</html>
	);
}
