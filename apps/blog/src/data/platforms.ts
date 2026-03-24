export interface PlatformProfile {
	id: string;
	name: string;
	link: string;
	features: string[];
	notes?: string;
}

export const WEBXR_PLATFORMS: PlatformProfile[] = [
	{
		id: "xrift",
		name: "XRift",
		link: "https://xrift.net/",
		features: [
			"インストール不要でアクセスできるクロスプラットフォームメタバース",
			"React Three Fiber ベースでワールドを構築し、URL 共有だけで参加できます",
		],
		notes:
			"PC・スマートフォン・VR ヘッドセットをまたいで同じワールド体験を提供する国内発のサービスです。",
	},
	{
		id: "deovr",
		name: "DeoVR",
		link: "https://deovr.com/",
		features: [
			"360° / 180° / 3D の VR 動画と写真を配信する没入型メディアプラットフォーム",
			"8K・120fps・パススルー対応など、高品質な VR 視聴体験を継続的に提供しています",
		],
		notes:
			"Web と専用アプリの両方で展開されている、没入型動画視聴の代表的なプラットフォームです。",
	},
];
