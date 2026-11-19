"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { REPORT_NAV_ITEMS } from "@/lib/navigation";

/**
 * レポートの表示切り替え（概要 / WebXR / WebGPU）。
 * 上の結果画像はそのままに下の内容だけを入れ替えるので、押した位置から画面を動かさない。
 */
export function ReportTabs() {
	const pathname = usePathname();

	return (
		<nav
			aria-label="レポートの表示切り替え"
			className="mt-10 border-b border-gray-100 pb-4"
		>
			<ul className="flex flex-wrap gap-2">
				{REPORT_NAV_ITEMS.map((item) => {
					const active = pathname === item.href;
					return (
						<li key={item.href}>
							<Link
								href={item.href}
								scroll={false}
								aria-current={active ? "page" : undefined}
								className={`inline-flex min-h-10 items-center whitespace-nowrap rounded-full border px-5 py-2 text-sm font-bold transition active:scale-[0.98] ${
									active
										? "border-gray-950 bg-gray-950 text-white"
										: "border-gray-200 bg-white text-gray-700 hover:border-gray-950 hover:text-gray-950"
								}`}
							>
								{item.name}
							</Link>
						</li>
					);
				})}
			</ul>
		</nav>
	);
}
