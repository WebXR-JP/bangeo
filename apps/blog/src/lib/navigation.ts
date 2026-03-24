export interface NavItem {
	name: string;
	href: string;
	external?: boolean;
}

export interface NavCategory {
	label: string;
	items: NavItem[];
}

export const NAV_CATEGORIES: NavCategory[] = [
	{
		label: "ガイド",
		items: [
			{ name: "WebXRとは", href: "/webxr-explainer" },
			{ name: "標準化・対応状況", href: "/webxr-status" },
			{ name: "活用事例集", href: "/platforms" },
			{ name: "対応デバイス一覧", href: "/devices" },
		],
	},
	{
		label: "作る・学ぶ",
		items: [
			{ name: "デモ", href: "/experiments" },
			{ name: "技術記事", href: "/tech-articles" },
			{ name: "ポッドキャスト", href: "/podcast" },
			{ name: "ライブラリ", href: "/libraries" },
		],
	},
	{
		label: "コミュニティ",
		items: [
			{ name: "私たちについて", href: "/about" },
			{ name: "ポッドキャスト", href: "/podcast" },
			{
				name: "WebXR JP (外部)",
				href: "https://discord.com/invite/9WyRvAwX7B",
				external: true,
			},
			{
				name: "X公式 (外部)",
				href: "https://x.com/bangeo_jp",
				external: true,
			},
		],
	},
	{
		label: "サポート",
		items: [
			{ name: "よくある質問", href: "/faq" },
			{ name: "お問い合わせ", href: "/contact" },
			{ name: "開発・導入相談", href: "/consulting" },
		],
	},
];

export const FOOTER_MAIN_LINKS = [
	{ name: "デモ", href: "/experiments" },
	{ name: "技術記事", href: "/tech-articles" },
	{ name: "ポッドキャスト", href: "/podcast" },
	{ name: "標準化状況", href: "/webxr-status" },
	{ name: "デバイス", href: "/devices" },
	{ name: "ライブラリ", href: "/libraries" },
	{ name: "私たちについて", href: "/about" },
	{ name: "FAQ", href: "/faq" },
	{ name: "お問い合わせ", href: "/contact" },
];

export const FOOTER_BOTTOM_LINKS = [
	{
		name: "Discord",
		href: "https://discord.com/invite/9WyRvAwX7B",
		external: true,
	},
	{ name: "X", href: "https://x.com/bangeo_jp", external: true },
	{ name: "サイトマップ", href: "/sitemap.xml" },
	{ name: "プライバシーポリシー", href: "/privacy-policy" },
];
