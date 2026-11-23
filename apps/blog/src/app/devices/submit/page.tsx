import type { Metadata } from "next";
import Link from "next/link";
import { PageHeader } from "@/components/page-header";
import { MarkDot } from "@/components/report/report-mark";
import { WebXRChecker } from "@/components/webxr-checker";

export const metadata: Metadata = {
	title: "WebXR対応状況チェック",
	description:
		"お使いのブラウザ・デバイスがWebXRに対応しているか確認できます。VR/ARモードの利用可否、対応モジュールを診断します。",
	alternates: { canonical: "/devices/submit" },
	robots: { index: false, follow: true },
};

/** 環境ごとの説明の中の小見出し（対応デバイス例・使用ブラウザなど） */
const groupLabelClass = "text-xs font-bold text-gray-500";

/** 製品名やソフトウェア名のラベル。灰の面の上に置くので白地 + 線にする */
const nameChipClass =
	"inline-flex items-center rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700";

/** 早見表の列。スマートフォンではレポートと同じ短い呼び名（VR / AR）で見出しを出す */
const quickTableModes = [
	{ id: "inline", short: "inline" },
	{ id: "immersive-vr", short: "VR" },
	{ id: "immersive-ar", short: "AR" },
] as const;

/** 早見表の1行。true = そのモードを開始できる */
const quickTableRows: { env: string; modes: [boolean, boolean, boolean] }[] = [
	{ env: "PC（ブラウザのみ）", modes: [true, false, false] },
	{ env: "PC + SteamVR/Oculus Link", modes: [true, true, false] },
	{ env: "Meta Quest（単体）", modes: [true, true, true] },
	{ env: "Android + Chrome", modes: [true, false, true] },
	{ env: "iPhone Safari", modes: [true, false, false] },
];

export default function DeviceSubmitPage() {
	return (
		<div className="max-w-4xl mx-auto px-5 md:px-8 pt-8 md:pt-12">
			<PageHeader
				title="この端末のWebXR対応状況"
				lead="いま開いている端末とブラウザで、WebXRのどの機能が使えるかと、VR/ARを開始できるかを判定します。"
				className="mb-8"
			/>

			<div className="space-y-8">
				<WebXRChecker />
			</div>

			{/* WebXR体験方法ガイド */}
			<section aria-labelledby="xr-environments" className="mt-16">
				<h2
					id="xr-environments"
					className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
				>
					WebXRを体験できる環境
				</h2>
				<p className="mt-3 max-w-[40em] break-phrase text-sm leading-[1.8] text-gray-600">
					VRやARの体験に使える端末・ブラウザ・ソフトウェアの組み合わせです。
				</p>

				<div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
					{/* PC + VRヘッドセット */}
					<div className="space-y-4 rounded-2xl bg-gray-50 p-6">
						<h3 className="text-lg font-bold leading-snug text-gray-950">
							PC + VRヘッドセット（PCVR）
						</h3>
						<p className="break-phrase text-sm leading-relaxed text-gray-600">
							PCのブラウザ（Chrome、Edge）でWebXRのページを開き、SteamVRやOculus
							Link経由でVRヘッドセットに映像を送ります。
						</p>
						<div className="space-y-2">
							<p className={groupLabelClass}>対応デバイス例</p>
							<div className="flex flex-wrap gap-2">
								<span className={nameChipClass}>
									Meta Quest 2/3/Pro（Link接続）
								</span>
								<span className={nameChipClass}>Valve Index</span>
								<span className={nameChipClass}>HTC Vive</span>
								<span className={nameChipClass}>Windows MR</span>
							</div>
						</div>
						<div className="space-y-2">
							<p className={groupLabelClass}>必要なソフトウェア</p>
							<div className="flex flex-wrap gap-2">
								<span className={nameChipClass}>SteamVR</span>
								<span className={nameChipClass}>Oculus PC App</span>
							</div>
						</div>
					</div>

					{/* スタンドアロンVR */}
					<div className="space-y-4 rounded-2xl bg-gray-50 p-6">
						<h3 className="text-lg font-bold leading-snug text-gray-950">
							スタンドアロンVRヘッドセット
						</h3>
						<p className="break-phrase text-sm leading-relaxed text-gray-600">
							PCなしで、ヘッドセット内蔵のブラウザから直接WebXRを体験できます。追加のセットアップは要りません。
						</p>
						<div className="space-y-2">
							<p className={groupLabelClass}>対応デバイス例</p>
							<div className="flex flex-wrap gap-2">
								<span className={nameChipClass}>Meta Quest 2/3/Pro</span>
								<span className={nameChipClass}>PICO 4</span>
								<span className={nameChipClass}>Apple Vision Pro</span>
							</div>
						</div>
						<div className="space-y-2">
							<p className={groupLabelClass}>使用ブラウザ</p>
							<div className="flex flex-wrap gap-2">
								<span className={nameChipClass}>Meta Quest Browser</span>
								<span className={nameChipClass}>PICO Browser</span>
								<span className={nameChipClass}>Safari（visionOS）</span>
							</div>
						</div>
					</div>

					{/* スマートフォン AR */}
					<div className="space-y-4 rounded-2xl bg-gray-50 p-6">
						<h3 className="text-lg font-bold leading-snug text-gray-950">
							スマートフォン（AR）
						</h3>
						<p className="break-phrase text-sm leading-relaxed text-gray-600">
							AndroidのChromeで、カメラ越しに仮想オブジェクトを現実の空間に置くARを体験できます。
						</p>
						<div className="space-y-2">
							<p className={groupLabelClass}>対応環境</p>
							<div className="flex flex-wrap gap-2">
								<span className={nameChipClass}>Android + Chrome</span>
								<span className={nameChipClass}>ARCore対応端末</span>
							</div>
						</div>
						<p className="break-phrase rounded-xl bg-white px-4 py-3 text-xs font-bold leading-relaxed text-gray-700">
							iPhoneのSafariは、WebXRのARに対応していません。iOS向けには
							<a
								href="https://apps.apple.com/app/webxr-viewer/id1295998056"
								className="text-link whitespace-nowrap"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="WebXR Viewer（新しいタブで開く）"
							>
								WebXR Viewer
							</a>
							アプリが必要です。
						</p>
					</div>

					{/* エミュレータ */}
					<div className="space-y-4 rounded-2xl bg-gray-50 p-6">
						<h3 className="text-lg font-bold leading-snug text-gray-950">
							開発者向けエミュレータ
						</h3>
						<p className="break-phrase text-sm leading-relaxed text-gray-600">
							VRヘッドセットがなくても、ブラウザ拡張機能を使ってWebXRの開発・テストができます。
						</p>
						<div className="space-y-1">
							<p className={groupLabelClass}>推奨ツール</p>
							<a
								href="https://chromewebstore.google.com/detail/immersive-web-emulator/cgffilbpcibhmcfbgggfhfolhkfbhmik"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="Immersive Web Emulator（新しいタブで開く）"
								className="text-link inline-flex min-h-11 items-center gap-1 whitespace-nowrap text-sm font-bold"
							>
								Immersive Web Emulator
								<span aria-hidden="true">↗</span>
							</a>
						</div>
					</div>
				</div>

				{/* 簡易早見表 */}
				<div className="card mt-6 p-5 md:p-6">
					<h3 className="text-lg font-bold leading-snug text-gray-950">
						環境ごとに開始できるモード
					</h3>
					{/* 入りきらないときは表だけを横にずらして読む。
					    relative は、読み上げ用の文字（sr-only は absolute）をこの枠の中に閉じ込めて、ページを横に広げないため */}
					<div className="relative mt-4 overflow-x-auto">
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="px-2 py-3 text-left font-bold text-gray-700">
										環境
									</th>
									{quickTableModes.map((mode) => (
										<th
											key={mode.id}
											className="whitespace-nowrap px-2 py-3 text-center font-bold text-gray-700"
										>
											<span className="sm:hidden">{mode.short}</span>
											<span className="hidden font-mono text-xs sm:inline">
												{mode.id}
											</span>
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{quickTableRows.map((row) => (
									<tr
										key={row.env}
										className="border-b border-gray-100 last:border-b-0"
									>
										<td className="px-2 py-3 text-[13px] leading-snug text-gray-700 sm:text-sm">
											{row.env}
										</td>
										{row.modes.map((ok, index) => (
											<td
												key={quickTableModes[index].id}
												className="px-2 py-3 text-center"
											>
												<MarkDot mark={ok ? "yes" : "no"} />
												<span className="sr-only">
													{ok ? "対応" : "未対応"}
												</span>
											</td>
										))}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>

				{/* 技術解説記事へのリンク */}
				<h3 className="mt-12 text-lg font-bold leading-snug text-gray-950">
					環境ごとの技術記事
				</h3>
				<ul className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
					<li className="min-w-0">
						<Link
							href="/tech-articles/pcvr-webxr-guide"
							className="card card-link group block h-full p-5"
						>
							<p className="text-[13px] font-bold text-primary-700">
								PCVRガイド
							</p>
							<p className="mt-1 text-base font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700">
								PC + VRヘッドセットでWebXRを体験するガイド
							</p>
							<p className="mt-1 text-[13px] leading-[1.6] text-gray-600">
								OpenXR、SteamVR、Oculus Linkの仕組みと設定方法
							</p>
						</Link>
					</li>
					<li className="min-w-0">
						<Link
							href="/tech-articles/ios-webxr-app-clip-guide"
							className="card card-link group block h-full p-5"
						>
							<p className="text-[13px] font-bold text-primary-700">
								iPhoneガイド
							</p>
							<p className="mt-1 text-base font-bold leading-snug text-gray-950 transition-colors group-hover:text-primary-700">
								iPhoneでWebXRを体験する方法
							</p>
							<p className="mt-1 text-[13px] leading-[1.6] text-gray-600">
								App Clip、EyeJack、ARKitポリフィルの仕組み
							</p>
						</Link>
					</li>
				</ul>
				<Link
					href="/tech-articles"
					className="text-link mt-4 inline-flex min-h-11 items-center whitespace-nowrap text-sm font-bold"
				>
					技術記事の一覧を見る
				</Link>
			</section>
		</div>
	);
}
