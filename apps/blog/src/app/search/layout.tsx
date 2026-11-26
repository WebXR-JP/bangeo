import type { Metadata } from "next";

export const metadata: Metadata = {
	title: "検索",
	description: "BANGEOサイト内の記事・デモ・ポッドキャストを検索します。",
	robots: { index: false, follow: true },
	alternates: { canonical: "/search" },
};

export default function SearchLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return children;
}
