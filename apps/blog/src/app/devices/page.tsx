import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { PageHeader } from "@/components/page-header";
import { MarkBadge } from "@/components/report/report-mark";
import {
	AR_DEVICES,
	type DeviceWebxrSummary,
	VR_DEVICES,
} from "@/data/devices";

export const metadata: Metadata = {
	title: "WebXR対応デバイス一覧｜VRヘッドセット・スマートフォン",
	description:
		"Meta Quest、Steam Frame、Apple Vision Pro、HTC Vive、PICO、iPhone、AndroidなどのWebXR対応状況・未確認情報、ブラウザ、接続方式を一覧で整理しています。",
	alternates: { canonical: "/devices" },
};

/* BANGEO design · 骨格: 結論先出し（デバイスと判定の早見表）→ 1台1枚のカード（定義リスト）·
   自己採点は報告に記載 */

const GROUPS = [
	{
		id: "vr-headsets",
		title: "VRヘッドセットのWebXR対応",
		short: "VRヘッドセット",
		lead: "Meta Quest、HTC VIVE、Picoの各シリーズなど、主要なヘッドセットにはWebXRを利用できる環境があります。Valve IndexとWindows MRも同様です。一方で、PlayStation VR/VR2やHTC VIVE Flowのように、ブラウザ経由での利用が難しいデバイスもあります。",
		devices: VR_DEVICES,
	},
	{
		id: "smartphones-ar",
		title: "スマートフォン・ARデバイスのWebXR対応",
		short: "スマートフォン・ARデバイス",
		lead: "スマートフォンでのWebXR ARは、端末とブラウザの組み合わせによって利用条件が大きく変わります。特にiOSでは、ブラウザ以外の手段が必要になることもあります。",
		devices: AR_DEVICES,
	},
];

type DeviceStatus = DeviceWebxrSummary["webxrSupport"]["status"];

/**
 * WebXR の判定。/report と同じ印（対応=青の✓ / 未対応=灰の– / 未確認=アンバーの?）にそろえる。
 * データの「非対応」は判定の4語に合わせて「未対応」と出す。
 * 「条件付き対応」は MarkBadge にない状態なので、同じ形のアンバーに △ を付けて区別する
 */
function StatusBadge({ status }: { status: DeviceStatus }) {
	switch (status) {
		case "対応":
			return <MarkBadge mark="yes">対応</MarkBadge>;
		case "非対応":
			return <MarkBadge mark="no">未対応</MarkBadge>;
		case "未確認":
			return <MarkBadge mark="unknown">未確認</MarkBadge>;
		case "条件付き対応":
			return (
				<span className="inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full bg-data-ask-soft px-2.5 py-1 text-xs font-bold text-data-ask">
					<span aria-hidden="true">△</span>
					条件付き対応
				</span>
			);
		default: {
			const exhaustiveCheck: never = status;
			return exhaustiveCheck;
		}
	}
}

/** 外向きの矢印（フッターと同じ形）。読み上げない */
function ExternalIcon() {
	return (
		<svg
			className="ml-0.5 inline-block size-3 shrink-0 align-[-0.05em]"
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
	);
}

const URL_PATTERN = /https?:\/\/[^\s（）()「」、。]+/g;

/**
 * 生の URL の見せ方。パスの ID や版番号まで出すと読めないので、ホスト名と、語になっている末尾だけを出す
 * （developers.meta.com/…/2d-web、store.steampowered.com）。href はデータの URL のまま
 */
function shortUrl(url: string) {
	try {
		const { hostname, pathname } = new URL(url);
		const host = hostname.replace(/^www\./, "");
		const segments = pathname.split("/").filter(Boolean);
		const last = segments[segments.length - 1] ?? "";
		if (!/^(?!\d+$)[\w-]+$/.test(last)) return host;
		return segments.length > 1 ? `${host}/…/${last}` : `${host}/${last}`;
	} catch {
		return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
	}
}

/** データの文に入っている生の URL を、押せるリンクにする（前後の文字はデータのまま。表示は shortUrl） */
function Linkified({ text }: { text: string }) {
	const parts: ReactNode[] = [];
	let cursor = 0;
	for (const match of text.matchAll(URL_PATTERN)) {
		const url = match[0];
		const start = match.index ?? 0;
		if (start > cursor) parts.push(text.slice(cursor, start));
		const shown = shortUrl(url);
		// 外向きの印だけが次の行に送られないよう、末尾の語と印を折らずにつなげる
		const tailStart = Math.max(shown.search(/[^/.\-…]+$/), 0);
		parts.push(
			<a
				key={start}
				href={url}
				target="_blank"
				rel="noopener noreferrer"
				aria-label={`${shown}（新しいタブで開く）`}
				className="text-link [overflow-wrap:anywhere]"
			>
				{shown.slice(0, tailStart)}
				<span className="whitespace-nowrap">
					{shown.slice(tailStart)}
					<ExternalIcon />
				</span>
			</a>,
		);
		cursor = start + url.length;
	}
	if (cursor < text.length) parts.push(text.slice(cursor));
	return <>{parts}</>;
}

const LABEL = "text-xs font-bold leading-[1.6] text-gray-500";
const VALUE =
	"mt-1 text-sm leading-[1.7] text-gray-700 [overflow-wrap:anywhere]";

function BulletList({ items }: { items: string[] }) {
	return (
		<ul className="space-y-1.5">
			{items.map((item) => (
				<li key={item} className="flex min-w-0 gap-2.5">
					<span
						aria-hidden="true"
						className="mt-[0.7em] size-1 shrink-0 rounded-full bg-gray-400"
					/>
					<span className="min-w-0 [overflow-wrap:anywhere]">
						<Linkified text={item} />
					</span>
				</li>
			))}
		</ul>
	);
}

function DeviceCard({ device }: { device: DeviceWebxrSummary }) {
	return (
		<article
			id={device.id}
			aria-labelledby={`${device.id}-name`}
			className="card min-w-0 scroll-mt-24 p-5 md:p-8"
		>
			<div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between md:gap-6">
				<div className="min-w-0">
					<p className="flex flex-wrap gap-1.5">
						<span className="chip">{device.type}</span>
						<span className="chip">{device.manufacturer}</span>
					</p>
					<h3
						id={`${device.id}-name`}
						className="mt-3 text-xl font-bold leading-snug text-gray-950 md:text-2xl"
					>
						{device.name}
					</h3>
				</div>
				<p className="flex items-center gap-2">
					<span className="text-xs font-bold text-gray-500">WebXR</span>
					<StatusBadge status={device.webxrSupport.status} />
				</p>
			</div>
			<p className="mt-3 max-w-[48em] text-sm leading-[1.7] text-gray-700 [overflow-wrap:anywhere]">
				<Linkified text={device.webxrSupport.detail} />
			</p>

			<div className="mt-6 grid min-w-0 gap-6 border-t border-gray-100 pt-6 md:grid-cols-2 md:gap-10">
				<dl className="min-w-0 space-y-4">
					<div>
						<dt className={LABEL}>対応ブラウザ</dt>
						<dd className={VALUE}>
							<BulletList items={device.browsers} />
						</dd>
					</div>
					<div>
						<dt className={LABEL}>接続方式</dt>
						<dd className={VALUE}>{device.connectionType}</dd>
					</div>
					<div>
						<dt className={LABEL}>価格</dt>
						<dd className={`${VALUE} tabular-nums`}>{device.priceRange}</dd>
					</div>
					<div>
						<dt className={LABEL}>販売状況</dt>
						<dd className={VALUE}>{device.availability}</dd>
					</div>
				</dl>
				<dl className="min-w-0">
					<dt className={LABEL}>特徴と注意点</dt>
					<dd className={VALUE}>
						<BulletList items={device.notes} />
					</dd>
				</dl>
			</div>
		</article>
	);
}

export default function DevicesPage() {
	const deviceCount = GROUPS.reduce(
		(total, group) => total + group.devices.length,
		0,
	);

	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "対応デバイス一覧", path: "/devices" }]}
			/>
			<PageHeader
				title="対応デバイス一覧"
				lead={`VRヘッドセットやスマートフォンなど${deviceCount}件のWebXR対応状況を、対応ブラウザと接続方式とあわせて一覧にしています。未確認のデバイスも含みます。`}
				actions={
					<Link href="/devices/submit" className="btn btn-dark">
						この端末の対応を確かめる
					</Link>
				}
			/>

			{/* 早見表: デバイス名と判定を先に並べ、各カードへ飛べるようにする */}
			<nav aria-labelledby="device-index-heading" className="card p-5 md:p-8">
				<h2
					id="device-index-heading"
					className="text-lg font-bold leading-snug text-gray-950"
				>
					デバイスとWebXR対応の早見表
				</h2>
				<div className="mt-4 grid gap-8 md:grid-cols-2 md:gap-10">
					{GROUPS.map((group) => (
						<div key={group.id} className="min-w-0">
							<p className="flex items-center gap-2 text-[13px] font-bold leading-[1.6] text-gray-500">
								<a
									href={`#${group.id}`}
									className="inline-flex min-h-11 items-center text-gray-950 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-primary-700 hover:decoration-current md:min-h-0"
								>
									{group.short}
								</a>
								<span className="tabular-nums">{group.devices.length}件</span>
							</p>
							<ul className="mt-2 divide-y divide-gray-100 border-t border-gray-100">
								{group.devices.map((device) => (
									<li key={device.id}>
										<a
											href={`#${device.id}`}
											className="-mx-2 flex min-h-11 items-center justify-between gap-3 rounded-lg px-2 py-2 text-sm leading-snug text-gray-800 transition-colors hover:text-primary-700"
										>
											<span className="min-w-0">{device.name}</span>
											<StatusBadge status={device.webxrSupport.status} />
										</a>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</nav>

			<div className="mt-16 space-y-16 md:mt-20 md:space-y-20">
				{GROUPS.map((group) => (
					<section
						key={group.id}
						id={group.id}
						aria-labelledby={`${group.id}-heading`}
						className="scroll-mt-24"
					>
						<h2
							id={`${group.id}-heading`}
							className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
						>
							{group.title}
							<span className="ml-3 text-base font-bold text-gray-500 tabular-nums">
								{group.devices.length}件
							</span>
						</h2>
						<p className="mt-3 max-w-[40em] text-base leading-[1.8] text-gray-700">
							{group.lead}
						</p>
						<div className="mt-6 min-w-0 space-y-4 md:space-y-6">
							{group.devices.map((device) => (
								<DeviceCard key={device.id} device={device} />
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}
