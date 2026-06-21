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
		default: "WebXR日本語リソース｜VR・ARデモ、対応ブラウザ、実装ガイド",
	},
	description:
		"BANGEOはWebXR（VR/AR/MR）を日本語で学ぶ技術ハブです。Meta Quest、iPhone、Android、PCブラウザで試せるデモ、対応ブラウザ、WebXR Device API、Three.js、PlayCanvas、WebGPUの実装ガイドを整理しています。",
	keywords: [
		"WebXR",
		"WebXR 日本語",
		"WebXR デモ",
		"VR ブラウザ",
		"AR ブラウザ",
		"Meta Quest WebXR",
		"iPhone WebXR",
		"WebXR iOS",
		"Three.js WebXR",
		"PlayCanvas WebXR",
		"WebGPU WebXR",
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
		title: "WebXR日本語リソース｜VR・ARデモ、対応ブラウザ、実装ガイド",
		description:
			"BANGEOはWebXR（VR/AR/MR）を日本語で学ぶ技術ハブです。Meta Quest、iPhone、Android、PCブラウザで試せるデモ、対応ブラウザ、WebXR Device API、Three.js、PlayCanvas、WebGPUの実装ガイドを整理しています。",
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
		title: "WebXR日本語リソース｜VR・ARデモ、対応ブラウザ、実装ガイド",
		description:
			"BANGEOはWebXR（VR/AR/MR）を日本語で学ぶ技術ハブです。Meta Quest、iPhone、Android、PCブラウザで試せるデモと実装ガイドを整理しています。",
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
