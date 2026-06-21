import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
	title: "WebXRとは？使い方・対応ブラウザ・デモを日本語で解説",
	description:
		"WebXRの意味、使い方、対応ブラウザ、iPhoneやMeta Questでの注意点、AR/VRデモの始め方を日本語で解説します。",
	openGraph: {
		title: "WebXRとは？使い方・対応ブラウザ・デモを日本語で解説",
		description:
			"WebXRの意味、使い方、対応ブラウザ、AR/VRデモの始め方を日本語で解説します。",
		type: "article",
	},
	alternates: { canonical: "/webxr-explainer" },
};

export default function WebXRExplainerPage() {
	return (
		<div className="relative px-4 md:px-6 py-16 md:py-20 max-w-5xl mx-auto overflow-hidden">
			<div className="space-y-16 relative z-10">
				{/* Header */}
				<div className="space-y-6 text-center">
					<h1 className="text-4xl md:text-6xl font-black tracking-tighter text-gray-900">
						WebXR <span className="text-[#e11d48]">とは？</span>
					</h1>
					<p className="text-lg text-gray-500 font-medium max-w-2xl mx-auto">
						なぜWebXRが必要なのか、どんなデバイスと機能（ハンドトラッキング、コントローラー、空間オーディオ、AR）が対象なのかを日本語で整理しました。
					</p>
				</div>

				{/* Table of Contents */}
				<nav className="p-8 bg-gray-50 rounded-3xl border border-gray-100">
					<h2 className="text-lg font-black mb-4 text-gray-900">目次</h2>
					<ul className="grid md:grid-cols-2 gap-2 text-sm text-gray-600">
						<li>
							<a
								href="#what-is-webxr"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									1.
								</span>
								WebXRとは何か？
							</a>
						</li>
						<li>
							<a
								href="#getting-started"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									2.
								</span>
								WebXRの使い方
							</a>
						</li>
						<li>
							<a
								href="#goals"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									3.
								</span>
								目標と非目標
							</a>
						</li>
						<li>
							<a
								href="#hardware"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									4.
								</span>
								対象ハードウェア
							</a>
						</li>
						<li>
							<a
								href="#x-meaning"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									5.
								</span>
								XRの「X」とは？
							</a>
						</li>
						<li>
							<a
								href="#use-cases"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									6.
								</span>
								ユースケース
							</a>
						</li>
						<li>
							<a
								href="#why-new-api"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									7.
								</span>
								なぜ新しいAPIが必要だったのか
							</a>
						</li>
						<li>
							<a
								href="#webvr-vs-webxr"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									8.
								</span>
								WebVRとWebXRの違い
							</a>
						</li>
						<li>
							<a
								href="#openxr"
								className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-white hover:shadow-xs transition-all"
							>
								<span className="text-[10px] font-black text-[#e11d48]">
									9.
								</span>
								OpenXRとの関係
							</a>
						</li>
					</ul>
				</nav>

				{/* 1. WebXRとは何か */}
				<section id="what-is-webxr" className="space-y-6 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						1. WebXRとは何か？
					</h2>
					<div className="space-y-4">
						<p className="text-gray-700 text-lg leading-relaxed">
							<strong>WebXR Device API</strong>
							は、VR（仮想現実）やAR（拡張現実）デバイスへのアクセスを提供するWeb
							APIです。W3C の勧告候補草案（Candidate Recommendation
							Draft）として策定が進んでおり、W3C Recommendation
							としてはまだ確定していません。ブラウザ上でVR/AR体験を開発・配信することを可能にします。
						</p>
						<p className="text-gray-700 text-lg leading-relaxed">
							従来、VR/AR体験を提供するにはネイティブアプリの開発が必要でしたが、
							WebXRを使えば<strong>URLを開くだけで</strong>
							没入体験を届けられます。
							インストール不要、クロスプラットフォーム対応という、Webならではの強みを活かせます。
						</p>
					</div>
				</section>

				<section id="getting-started" className="space-y-6 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						2. WebXRの使い方
					</h2>
					<div className="grid md:grid-cols-3 gap-5">
						<Link
							href="/experiments"
							className="block rounded-2xl border border-gray-100 bg-white p-6 hover:border-[#e11d48]/30 hover:shadow-lg transition-all"
						>
							<h3 className="font-black text-gray-950 mb-2">WebXRデモを試す</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								Meta
								Quest、Android、PCブラウザで動くVR/ARデモをブラウザから開いて確認します。
							</p>
						</Link>
						<Link
							href="/devices"
							className="block rounded-2xl border border-gray-100 bg-white p-6 hover:border-[#e11d48]/30 hover:shadow-lg transition-all"
						>
							<h3 className="font-black text-gray-950 mb-2">
								対応デバイスを見る
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								iPhone、Meta Quest、Android XR、PC
								VRなど、WebXR対応状況を端末別に確認します。
							</p>
						</Link>
						<Link
							href="/libraries"
							className="block rounded-2xl border border-gray-100 bg-white p-6 hover:border-[#e11d48]/30 hover:shadow-lg transition-all"
						>
							<h3 className="font-black text-gray-950 mb-2">
								ライブラリを選ぶ
							</h3>
							<p className="text-sm text-gray-600 leading-relaxed">
								Three.js、Babylon.js、PlayCanvasなど、WebXR実装に使うライブラリを比較します。
							</p>
						</Link>
					</div>
					<p className="text-gray-700 text-lg leading-relaxed">
						はじめてWebXRを触る場合は、まずデモを実機で開き、次に対応ブラウザとデバイスを確認し、最後に使うライブラリを選ぶ順番が現実的です。iPhoneではSafari単体のWebXR
						AR対応に制限があるため、iOS向けには
						<Link
							href="/tech-articles/ios-webxr-app-clip-guide"
							className="font-bold text-[#e11d48] hover:underline"
						>
							App Clipを使う方法
						</Link>
						もあわせて確認してください。
					</p>
				</section>

				{/* 2. 目標と非目標 */}
				<section id="goals" className="space-y-6 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						3. 目標と非目標
					</h2>
					<div className="grid md:grid-cols-2 gap-8">
						<div className="space-y-4">
							<h3 className="text-xl font-black text-gray-900 flex items-center gap-2">
								<span className="w-2 h-8 bg-[#e11d48] rounded-full" />
								目標（Goals）
							</h3>
							<ul className="space-y-3 text-gray-700">
								<li className="flex gap-3 items-start">
									<span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
									<span>XR機能が利用可能か検出する</span>
								</li>
								<li className="flex gap-3 items-start">
									<span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
									<span>XRデバイスの機能を照会する</span>
								</li>
								<li className="flex gap-3 items-start">
									<span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-400" />
									<span>XRデバイスと入力デバイスの状態をポーリングする</span>
								</li>
								<li className="flex gap-3 items-start">
									<span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#e11d48]" />
									<span>適切なフレームレートでXRデバイスに映像を表示する</span>
								</li>
							</ul>
						</div>
						<div className="space-y-4">
							<h3 className="text-xl font-black text-gray-400 flex items-center gap-2">
								<span className="w-2 h-8 bg-gray-200 rounded-full" />
								非目標（Non-goals）
							</h3>
							<ul className="space-y-3 text-gray-600">
								<li className="flex gap-3 items-start">
									<span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-200" />
									<span>VR/ARブラウザの動作を定義すること</span>
								</li>
								<li className="flex gap-3 items-start">
									<span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-200" />
									<span>
										すべてのVR/ARハードウェアのすべての機能を公開すること
									</span>
								</li>
								<li className="flex gap-3 items-start">
									<span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-gray-200" />
									<span>「メタバース」を構築すること</span>
								</li>
							</ul>
						</div>
					</div>
				</section>

				{/* 3. 対象ハードウェア */}
				<section id="hardware" className="space-y-6 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						4. 対象ハードウェア
					</h2>
					<div className="space-y-6">
						<p className="text-gray-600">
							WebXRは以下のようなデバイスに対応しています：
						</p>
						<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
							{[
								"Meta Quest シリーズ",
								"Apple Vision Pro",
								"HTC Vive",
								"Valve Index",
								"ARCore対応スマホ",
								"ARKit対応iPhone",
								"Microsoft HoloLens",
								"Magic Leap",
							].map((name) => (
								<div
									key={name}
									className="p-4 bg-gray-50 border border-gray-100 rounded-2xl text-center"
								>
									<div className="text-sm font-bold text-gray-700">{name}</div>
								</div>
							))}
						</div>
					</div>
				</section>

				{/* 4. XRの「X」とは */}
				<section id="x-meaning" className="space-y-6 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						5. XRの「X」とは？
					</h2>
					<div className="space-y-6">
						<p className="text-gray-700 text-lg leading-relaxed">
							Virtual Reality、Augmented Reality、Mixed Reality...
							これらには多くの共通点があります。
						</p>
						<p className="text-gray-700 text-lg leading-relaxed">
							WebXR APIは、これら<strong>すべての基盤要素</strong>
							を提供することを目指しています。
							特定の形式に限定したくないため、頭文字ではなく
							<strong>代数的な変数</strong>
							として「X」を使用しています。
						</p>
						<div className="p-8 bg-gradient-to-r from-gray-900 via-slate-900 to-gray-900 rounded-3xl text-center border border-gray-800 shadow-inner">
							<p className="text-2xl font-black text-rose-200">
								X = Your Reality Here
							</p>
							<p className="text-sm font-medium text-gray-300 mt-2">
								（あなたの現実をここに）
							</p>
						</div>
					</div>
				</section>

				{/* 5. ユースケース */}
				<section id="use-cases" className="space-y-6 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						6. ユースケース
					</h2>
					<div className="grid md:grid-cols-3 gap-8">
						<div className="space-y-3">
							<h3 className="text-xl font-black text-gray-900">360°動画</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								Webは動画配信に非常に効果的です。XR対応プレーヤーは没入視聴を可能にします。
							</p>
						</div>
						<div className="space-y-3">
							<h3 className="text-xl font-black text-gray-900">データ可視化</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								3Dモデルや医療画像など、VR/ARではより正確なスケール感を伝えられます。
							</p>
						</div>
						<div className="space-y-3">
							<h3 className="text-xl font-black text-gray-900">アート体験</h3>
							<p className="text-gray-600 text-sm leading-relaxed">
								ストアモデルに合わない短い実験的体験にとって、Webの即時性は魅力的です。
							</p>
						</div>
					</div>
				</section>

				{/* 6. なぜ新しいAPIが必要だったのか */}
				<section id="why-new-api" className="space-y-8 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						7. なぜ新しいAPIが必要だったのか
					</h2>
					<div className="grid md:grid-cols-2 gap-8">
						<div className="space-y-4">
							<h3 className="text-xl font-black text-gray-900">
								既存APIの限界
							</h3>
							<p className="text-gray-700 text-sm">
								DeviceOrientation や Gamepad API
								では、XRに必要な高精度なタイミングと位置情報の同期が困難でした。
							</p>
						</div>
						<div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 italic">
							<p className="text-gray-900 font-bold mb-2">描画の課題</p>
							<p className="text-gray-600 text-sm">
								レンズ歪み補正やステレオレンダリングを標準化された方法で処理する仕組みが必要でした。
							</p>
						</div>
					</div>
				</section>

				{/* 7. WebVRとWebXRの違い */}
				<section id="webvr-vs-webxr" className="space-y-6 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						8. WebVRとWebXRの違い
					</h2>
					<div className="grid md:grid-cols-2 gap-8">
						<div className="p-6 bg-gray-50 rounded-2xl">
							<h3 className="text-xl font-black text-gray-400 mb-2">
								WebVR (廃止)
							</h3>
							<p className="text-gray-500 text-sm">
								VRのみを想定した初期の実験的設計。
							</p>
						</div>
						<div className="p-6 bg-white border border-gray-200 rounded-2xl">
							<h3 className="text-xl font-black text-gray-900 mb-2">
								WebXR（W3C勧告候補草案）
							</h3>
							<p className="text-gray-700 text-sm font-medium">
								VR + AR 全てに対応し、セキュリティと拡張性を重視。
							</p>
						</div>
					</div>
				</section>

				{/* 8. OpenXRとの関係 */}
				<section id="openxr" className="space-y-6 scroll-mt-24">
					<h2 className="text-3xl font-black text-gray-900 border-b-4 border-gray-100 pb-2">
						9. OpenXRとの関係
					</h2>
					<p className="text-gray-700 leading-relaxed">
						<strong>OpenXR</strong>
						はネイティブ向けの標準APIです。WebXRと多くの概念を共有しており、ブラウザのバックエンドとして活用されます。
					</p>
				</section>

				{/* Footer */}
				<div className="text-center space-y-8 pt-16 border-t border-gray-100">
					<p className="text-gray-400 text-xs">
						参照:{" "}
						<a
							href="https://github.com/immersive-web/webxr/blob/master/explainer.md"
							target="_blank"
							rel="noopener noreferrer"
							className="text-gray-900 font-bold underline decoration-gray-200 underline-offset-4 hover:decoration-gray-900 transition-all"
						>
							WebXR Device API Explainer
						</a>
					</p>
					<div className="flex flex-col md:flex-row justify-center gap-4">
						<Link
							href="/webxr-status"
							className="px-8 py-4 bg-[#e11d48] text-white rounded-full font-bold text-sm hover:bg-[#c91a3a] transition-all shadow-lg hover:shadow-xl active:scale-95"
						>
							WebXRの現状を見る →
						</Link>
						<Link
							href="/experiments"
							className="px-8 py-4 bg-white text-gray-900 rounded-full font-bold text-sm border border-gray-200 hover:border-gray-900 transition-all active:scale-95"
						>
							デモを見る
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
