import type { Metadata } from "next";
import { WebXRChecker } from "./webxr-checker";

export const metadata: Metadata = {
	title: "WebXR対応状況チェック",
	description:
		"お使いのブラウザ・デバイスがWebXRに対応しているか確認できます。VR/ARモードの利用可否、対応モジュールを診断します。",
	alternates: { canonical: "/devices/submit" },
};

export default function DeviceSubmitPage() {
	return (
		<div className="max-w-5xl mx-auto px-4 md:px-6 py-16 md:py-20">
			<div className="space-y-12">
				<header className="space-y-4 text-center">
					<h1 className="page-title tracking-tighter leading-tight text-gray-900">
						WebXR対応状況チェック
					</h1>
					<p className="text-xl text-gray-500 font-medium max-w-2xl mx-auto">
						お使いのブラウザ・デバイスがWebXRに対応しているか確認できます。VR/ARモードの利用可否、対応モジュールをリアルタイムで診断します。
					</p>
				</header>

				<WebXRChecker />

				{/* WebXR体験方法ガイド */}
				<div className="bg-white border-2 border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-xs space-y-8">
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-gray-900">
							WebXRを体験するには？
						</h2>
						<p className="text-gray-600 text-sm">
							WebXRコンテンツを本格的に体験するための環境と組み合わせをご紹介します。
						</p>
					</div>

					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{/* PC + VRヘッドセット */}
						<div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
							<h3 className="font-black text-lg">
								PC + VRヘッドセット（PCVR）
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								PC のブラウザ（Chrome, Edge）から WebXR
								コンテンツにアクセスし、SteamVR や Oculus Link 経由で VR
								ヘッドセットに映像を送信します。
							</p>
							<div className="space-y-2 pt-2">
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
									対応デバイス例
								</p>
								<div className="flex flex-wrap gap-2">
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										Meta Quest 2/3/Pro（Link接続）
									</span>
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										Valve Index
									</span>
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										HTC Vive
									</span>
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										Windows MR
									</span>
								</div>
							</div>
							<div className="space-y-2 pt-2">
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
									必要なソフトウェア
								</p>
								<div className="flex flex-wrap gap-2">
									<span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium">
										SteamVR
									</span>
									<span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium">
										Oculus PC App
									</span>
								</div>
							</div>
						</div>

						{/* スタンドアロンVR */}
						<div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
							<h3 className="font-black text-lg">
								スタンドアロンVRヘッドセット
							</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								PCなしで、VRヘッドセット内蔵のブラウザから直接WebXRコンテンツを体験できます。追加のセットアップが不要なため、すぐに始められます。
							</p>
							<div className="space-y-2 pt-2">
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
									対応デバイス例
								</p>
								<div className="flex flex-wrap gap-2">
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										Meta Quest 2/3/Pro
									</span>
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										Pico 4
									</span>
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										Apple Vision Pro
									</span>
								</div>
							</div>
							<div className="space-y-2 pt-2">
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
									使用ブラウザ
								</p>
								<div className="flex flex-wrap gap-2">
									<span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium">
										Meta Quest Browser
									</span>
									<span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium">
										Pico Browser
									</span>
									<span className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-medium">
										Safari（visionOS）
									</span>
								</div>
							</div>
						</div>

						{/* スマートフォン AR */}
						<div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
							<h3 className="font-black text-lg">スマートフォン（AR）</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Android端末のChromeブラウザでAR機能を利用できます。カメラ越しに仮想オブジェクトを現実世界に配置する体験ができます。
							</p>
							<div className="space-y-2 pt-2">
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
									対応環境
								</p>
								<div className="flex flex-wrap gap-2">
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										Android + Chrome
									</span>
									<span className="px-3 py-1 bg-white border border-gray-100 rounded-full text-xs font-medium">
										ARCore対応端末
									</span>
								</div>
							</div>
							<div className="p-3 bg-rose-50 rounded-xl border border-rose-100 mt-3">
								<p className="text-rose-600 text-xs font-bold">
									iPhoneのSafariはWebXR AR非対応です。iOS向けには{" "}
									<a
										href="https://apps.apple.com/app/webxr-viewer/id1295998056"
										className="underline hover:text-[#e11d48]"
										target="_blank"
										rel="noopener noreferrer"
									>
										WebXR Viewer
									</a>{" "}
									アプリが必要です。
								</p>
							</div>
						</div>

						{/* エミュレータ */}
						<div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 space-y-4">
							<h3 className="font-black text-lg">開発者向けエミュレータ</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								VRヘッドセットがなくても、ブラウザ拡張機能を使ってWebXRコンテンツの開発・テストができます。
							</p>
							<div className="space-y-2 pt-2">
								<p className="text-xs font-bold text-gray-500 uppercase tracking-wide">
									推奨ツール
								</p>
								<div className="flex flex-wrap gap-2">
									<a
										href="https://chromewebstore.google.com/detail/immersive-web-emulator/cgffilbpcibhmcfbgggfhfolhkfbhmik"
										target="_blank"
										rel="noopener noreferrer"
										className="px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs font-bold hover:bg-rose-100 transition-colors"
									>
										Immersive Web Emulator →
									</a>
								</div>
							</div>
						</div>
					</div>

					{/* 簡易早見表 */}
					<div className="bg-white rounded-2xl p-6 border border-gray-100 overflow-x-auto">
						<h3 className="font-black text-lg mb-4">
							早見表：どの組み合わせで何ができる？
						</h3>
						<table className="w-full text-sm">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 px-2 font-bold text-gray-700">
										環境
									</th>
									<th className="text-center py-3 px-2 font-bold text-gray-700">
										inline
									</th>
									<th className="text-center py-3 px-2 font-bold text-gray-700">
										immersive-vr
									</th>
									<th className="text-center py-3 px-2 font-bold text-gray-700">
										immersive-ar
									</th>
								</tr>
							</thead>
							<tbody>
								<tr className="border-b border-gray-100">
									<td className="py-3 px-2">PC（ブラウザのみ）</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-gray-300">—</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-gray-300">—</span>
									</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="py-3 px-2">PC + SteamVR/Oculus Link</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-gray-300">—</span>
									</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="py-3 px-2">Meta Quest（単体）</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
								</tr>
								<tr className="border-b border-gray-100">
									<td className="py-3 px-2">Android + Chrome</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-gray-300">—</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
								</tr>
								<tr>
									<td className="py-3 px-2">iPhone Safari</td>
									<td className="text-center py-3 px-2">
										<span className="text-emerald-500">〇</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-gray-300">—</span>
									</td>
									<td className="text-center py-3 px-2">
										<span className="text-gray-300">—</span>
									</td>
								</tr>
							</tbody>
						</table>
					</div>

					{/* 技術解説記事へのリンク */}
					<div className="mt-8 p-8 bg-gray-50 rounded-[2.5rem] border border-gray-100">
						<h3 className="font-black text-xl mb-6">
							もっと詳しく知りたい方へ
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<a
								href="/tech-articles/pcvr-webxr-guide"
								className="block p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#e11d48] hover:shadow-lg transition-all group"
							>
								<div className="flex items-center gap-3 mb-2">
									<span className="text-sm font-black text-[#e11d48] group-hover:underline">
										PCVR ガイド
									</span>
								</div>
								<p className="text-sm font-bold text-gray-800 mb-1">
									PC + VRヘッドセットでWebXRを体験するガイド
								</p>
								<p className="text-xs text-gray-500">
									OpenXR、SteamVR、Oculus Linkの仕組みと設定方法
								</p>
							</a>
							<a
								href="/tech-articles/ios-webxr-app-clip-guide"
								className="block p-6 bg-white rounded-2xl border border-gray-100 hover:border-[#e11d48] hover:shadow-lg transition-all group"
							>
								<div className="flex items-center gap-3 mb-2">
									<span className="text-sm font-black text-[#e11d48] group-hover:underline">
										iPhone ガイド
									</span>
								</div>
								<p className="text-sm font-bold text-gray-800 mb-1">
									iPhoneでWebXRを体験する方法
								</p>
								<p className="text-xs text-gray-500">
									App Clip、EyeJack、ARKitポリフィルの仕組み
								</p>
							</a>
						</div>
						<p className="text-xs text-gray-500 mt-6 text-center font-bold underline hover:text-[#e11d48]">
							<a href="/tech-articles">すべての技術解説記事を見る →</a>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
