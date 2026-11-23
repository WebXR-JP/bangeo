export interface NavItem {
	name: string;
	href: string;
	/** 別のサイトへのリンク。新しいタブで開き、名前の右に外向きの矢印を付ける */
	external?: boolean;
}

export interface NavCategory {
	label: string;
	items: NavItem[];
}

export const GITHUB_URL = "https://github.com/WebXR-JP/bangeo";
/** WebXR JP の Discord サーバーへの招待 */
export const DISCORD_URL = "https://discord.com/invite/9WyRvAwX7B";
export const X_URL = "https://x.com/bangeo_jp";

/**
 * サイトの主機能。カテゴリのドロップダウンに入れず、ヘッダーに常に出す。
 */
export const NAV_PRIMARY: NavItem = { name: "レポート", href: "/report" };

/**
 * レポート内の表示切り替え。この端末の結果画像の下に並ぶタブで、
 * モバイルメニューにも同じ順で出す。
 */
export const REPORT_NAV_ITEMS: NavItem[] = [
	{ name: "概要", href: "/report" },
	{ name: "WebXR", href: "/experiments" },
	{ name: "WebGPU", href: "/webgpu-report" },
];

/**
 * ヘッダーのカテゴリ。項目の名前は行き先のページの h1（またはその短い形）にそろえ、
 * フッターと同じ言葉で呼ぶ。1つのページは1つのカテゴリにだけ入れる。
 * 外部のリンクは「(外部)」と書かず、external で外向きの矢印を付ける。
 */
export const NAV_CATEGORIES: NavCategory[] = [
	{
		label: "ガイド",
		items: [
			{ name: "WebXRとは", href: "/webxr-explainer" },
			{ name: "標準化・対応状況", href: "/webxr-status" },
			{ name: "イベント", href: "/events" },
			{ name: "プラットフォーム", href: "/platforms" },
			{ name: "対応デバイス一覧", href: "/devices" },
		],
	},
	{
		label: "作る・学ぶ",
		items: [
			{ name: "技術記事", href: "/tech-articles" },
			{ name: "ポッドキャスト", href: "/podcast" },
			{ name: "ライブラリ", href: "/libraries" },
		],
	},
	{
		label: "コミュニティ",
		items: [
			{ name: "私たちについて", href: "/about" },
			{ name: "GitHub", href: GITHUB_URL, external: true },
			{ name: "Discord", href: DISCORD_URL, external: true },
			{ name: "X", href: X_URL, external: true },
		],
	},
	{
		label: "サポート",
		items: [
			{ name: "よくある質問", href: "/faq" },
			{ name: "お問い合わせ", href: "/contact" },
			{ name: "開発参加・技術相談", href: "/consulting" },
		],
	},
];

/**
 * フッターのリンク。見出しを付けた3つのまとまりに分けて並べる。
 */
export const FOOTER_LINK_GROUPS: NavCategory[] = [
	{
		label: "レポート",
		items: [
			{ name: "この端末のレポート", href: "/report" },
			{ name: "WebXR対応レポート", href: "/experiments" },
			{ name: "WebGPU対応レポート", href: "/webgpu-report" },
		],
	},
	{
		label: "読む・調べる",
		items: [
			{ name: "技術記事", href: "/tech-articles" },
			{ name: "ポッドキャスト", href: "/podcast" },
			{ name: "標準化・対応状況", href: "/webxr-status" },
			{ name: "対応デバイス一覧", href: "/devices" },
			{ name: "イベント", href: "/events" },
			{ name: "ライブラリ", href: "/libraries" },
		],
	},
	{
		label: "BANGEO",
		items: [
			{ name: "私たちについて", href: "/about" },
			{ name: "よくある質問", href: "/faq" },
			{ name: "お問い合わせ", href: "/contact" },
			{ name: "GitHub", href: GITHUB_URL, external: true },
		],
	},
];

/** フッターの最下段。SNS と、サイトの情報のファイル・ページ */
export const FOOTER_BOTTOM_LINKS: NavItem[] = [
	{ name: "Discord", href: DISCORD_URL, external: true },
	{ name: "X", href: X_URL, external: true },
	{ name: "GitHub", href: GITHUB_URL, external: true },
	{ name: "RSS", href: "/rss.xml" },
	{ name: "サイトマップ", href: "/sitemap.xml" },
	{ name: "プライバシーポリシー", href: "/privacy-policy" },
];
