import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { codeToHtml } from "shiki";
import { BreadcrumbStructuredData } from "@/components/breadcrumb-structured-data";
import { CodeBlockCopyButton } from "@/components/code-block-copy";
import { PageHeader } from "@/components/page-header";
import { LIBRARIES } from "@/data/libraries";

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

/* BANGEO design · 骨格: 解説の長文 + 固定の目次。節ごとに 番号の段 / 表 / 定義リスト / 問いと答え などを内容に合わせて選ぶ ·
   自己採点は報告に記載 */

const MINIMAL_CODE = `if (!navigator.xr) {
  showFallback();
}

const supported = await navigator.xr.isSessionSupported("immersive-vr");
if (!supported) {
  showFallback();
}

const session = await navigator.xr.requestSession("immersive-vr", {
  optionalFeatures: ["local-floor", "bounded-floor"],
});

const referenceSpace = await session.requestReferenceSpace("local-floor");
session.requestAnimationFrame(function onFrame(time, frame) {
  const pose = frame.getViewerPose(referenceSpace);
  if (pose) {
    renderSceneForXR(pose);
  }
  session.requestAnimationFrame(onFrame);
});`;

/**
 * 節の並び。目次と本文の見出しの番号は、この配列の順番から作る（食い違わないように1か所で持つ）。
 * id は外部からのアンカーリンクのために変えない
 */
const SECTIONS = [
	{ id: "what-is-webxr", toc: "WebXRとは何か", title: "WebXRとは何か" },
	{ id: "getting-started", toc: "WebXRの使い方", title: "WebXRの使い方" },
	{ id: "browser-support", toc: "対応ブラウザ", title: "WebXR対応ブラウザ" },
	{ id: "core-concepts", toc: "基本用語", title: "WebXRの基本用語" },
	{
		id: "minimal-code",
		toc: "最小コード",
		title: "最小コードで見るWebXRの流れ",
	},
	{ id: "modules", toc: "Module別機能", title: "WebXRのModule別機能" },
	{
		id: "production-checklist",
		toc: "実装チェックリスト",
		title: "WebXR実装チェックリスト",
	},
	{ id: "faq", toc: "よくある質問", title: "WebXRのよくある質問" },
	{ id: "goals", toc: "目標と非目標", title: "目標と非目標" },
	{ id: "hardware", toc: "対象ハードウェア", title: "対象ハードウェア" },
	{ id: "x-meaning", toc: "XRの「X」の意味", title: "XRの「X」の意味" },
	{ id: "use-cases", toc: "ユースケース", title: "ユースケース" },
	{
		id: "why-new-api",
		toc: "新しいAPIが必要になった理由",
		title: "新しいAPIが必要になった理由",
	},
	{
		id: "webvr-vs-webxr",
		toc: "WebVRとWebXRの違い",
		title: "WebVRとWebXRの違い",
	},
	{ id: "openxr", toc: "OpenXRとの関係", title: "OpenXRとの関係" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];

const BODY = "max-w-[40em] text-base leading-[1.8] text-gray-700";
const NOTE = "max-w-[40em] text-[13px] leading-[1.6] text-gray-600";
const H3 = "text-lg font-bold leading-snug text-gray-950";

/** 本文の1節。見出しの番号は SECTIONS の順番から付ける */
function Section({ id, children }: { id: SectionId; children: ReactNode }) {
	const index = SECTIONS.findIndex((section) => section.id === id);
	const section = SECTIONS[index];
	return (
		<section
			id={id}
			aria-labelledby={`${id}-heading`}
			className="scroll-mt-24 border-t border-gray-200 pt-10 md:pt-12"
		>
			<h2
				id={`${id}-heading`}
				className="text-2xl font-black leading-snug text-gray-950 md:text-[1.75rem]"
			>
				<span className="mr-2 text-gray-500 tabular-nums">{index + 1}.</span>
				{section.title}
			</h2>
			<div className="mt-6 space-y-6">{children}</div>
		</section>
	);
}

/** 本文中のリンクの右に付ける矢印（サイト内）。読み上げない */
function ArrowIcon() {
	return (
		<svg
			className="size-4 shrink-0"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M9 5l7 7-7 7"
			/>
		</svg>
	);
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

const GETTING_STARTED_STEPS = [
	{
		href: "/experiments",
		label: "WebXRデモを試す",
		body: "Meta Quest / Android / PCのブラウザで動くVR/ARデモを、WebXR対応レポートから開いて確かめます。",
	},
	{
		href: "/devices",
		label: "対応デバイス一覧を見る",
		body: "iPhone / Meta Quest / Android XR / PC VRのWebXR対応状況を、デバイスごとに確認します。",
	},
	{
		href: "/libraries",
		label: "ライブラリを選ぶ",
		body: `Three.js / Babylon.js / PlayCanvasなど${LIBRARIES.length}つのライブラリを、公式ドキュメントとGitHubで見比べます。`,
	},
];

const BROWSER_ROWS = [
	{
		env: "Meta Quest Browser",
		view: (
			<>
				<code>immersive-vr</code> / <code>immersive-ar</code>の主要検証環境
			</>
		),
		policy: "Quest実機デモとWebXR仕様更新を優先して追跡",
	},
	{
		env: "Chrome / Edge",
		view: "端末・OS・XR runtimeによって利用可否が変わる",
		policy: "WebXR EmulatorやPC VR検証の入口として扱う",
	},
	{
		env: "Android Chrome",
		view: (
			<>
				ARCore対応端末で<code>immersive-ar</code>の検証候補
			</>
		),
		policy: "Hit TestやスマートフォンARの検証対象",
	},
	{
		env: "iOS Safari",
		view: "WebXR Device APIは直接使えない前提で設計",
		policy: "App Clip、WebAR、AR Quick Lookなどの代替経路を検討",
	},
	{
		env: "visionOS Safari",
		view: "Apple Vision Pro向けのWebXR検証環境",
		policy: "Spatial Web、immersive website、HTML model要素とあわせて追跡",
	},
];

const TERMS = [
	{
		term: "XRSession",
		body: "WebXR体験の実行単位。inline、immersive-vr、immersive-arのsession modeを指定して開始します。",
	},
	{
		term: "XRReferenceSpace",
		body: "座標系の基準。viewer、local、local-floor、bounded-floor、unboundedなどを使い分けます。",
	},
	{
		term: "XRFrame",
		body: "各フレームのpose、input source、hit test結果などを読むためのオブジェクトです。",
	},
	{
		term: "XRInputSource",
		body: "controller、hand tracking、gazeなど、ユーザー入力を表します。",
	},
	{
		term: "requiredFeatures / optionalFeatures",
		body: "hit-test、local-floor、dom-overlayなど、セッション開始時に要求または任意指定する機能です。",
	},
	{
		term: "fallback",
		body: "WebXRや特定featureが使えない場合に、通常3D表示、画像、WebARなどへ落とす設計です。",
	},
];

const MODULES = [
	{
		name: "Hit Test Module",
		body: "現実空間の平面や特徴点に対してrayを飛ばし、ARオブジェクトを置く位置を求めます。スマートフォンARやQuestのpassthrough ARでよく使います。",
		link: "/demos/hit-test-advanced",
	},
	{
		name: "DOM Overlays Module",
		body: "immersive-ar中にHTML UIを重ねるためのModuleです。開始/終了ボタン、設定パネル、フォームなどを通常のDOMで扱いやすくします。",
		link: "/tech-articles/webxr-html-ui-dom-overlay-html-in-canvas-spatial-css",
	},
	{
		name: "Hand Input Module",
		body: "hand tracking（手の関節pose）を扱うModuleです。controllerがない環境でもpinchやdirect touchに近い入力設計を検討できます。",
		link: "/demos/hand-tracking-advanced",
	},
	{
		name: "Layers API",
		body: "projection layer、quad layerなど、WebXR描画をlayer単位で扱うための仕様です。高解像度UI、動画、foveated renderingと関係します。",
		link: "/tech-articles/threejs-r184-webxr-layers-hand-model-cache",
	},
	{
		name: "Depth Sensing Module",
		body: "現実空間のdepth情報を使い、depth occlusionやMR合成を行うためのModuleです。Quest Browser 146以降のdepth projection検証とも関係します。",
		link: "/webxr-status",
	},
	{
		name: "WebXR/WebGPU Binding",
		body: "WebGPUでWebXRセッションに描画するための接続仕様です。Quest BrowserのExperimental WebGPU supportとあわせて追跡しています。",
		link: "/tech-articles/quest-browser-146-webgpu-webxr",
	},
];

/** Module の関連リンク。行き先の種類（デモ / 技術記事 / 対応状況）をラベルで言う */
function ModuleLink({ name, href }: { name: string; href: string }) {
	const className =
		"text-link inline-flex min-h-11 items-center gap-1 text-sm font-bold md:min-h-0";
	if (href.startsWith("/demos/")) {
		// デモはアプリの外の静的なページなので、Link の先読みを通さずにふつうのリンクで開く
		return (
			<a href={href} className={className}>
				<span className="sr-only">{name}の</span>デモを開く
				<ArrowIcon />
			</a>
		);
	}
	const label = href.startsWith("/tech-articles/")
		? "技術記事を読む"
		: "標準化・対応状況を見る";
	return (
		<Link href={href} className={className}>
			<span className="sr-only">{name}の</span>
			{label}
			<ArrowIcon />
		</Link>
	);
}

const WEBVR_VS_WEBXR = [
	{ aspect: "状態", webvr: "廃止", webxr: "W3C勧告候補草案" },
	{
		aspect: "設計",
		webvr: "VRのみを想定した初期の実験的設計。",
		webxr: "VRとARの両方に対応し、セキュリティと拡張性を重視。",
	},
];

const FAQ = [
	{
		q: "WebXRはiPhoneで使えますか？",
		a: "iPhoneのiOS SafariではWebXR Device APIを直接使えない前提で考えます。iPhone向けARでは、App Clip、AR Quick Look、8th Wall、MindARなどのWebAR実装を検討します。",
	},
	{
		q: "WebXRとWebARは同じですか？",
		a: "同じではありません。WebXRはブラウザが提供する標準API群です。WebARはブラウザでARを見せる広い呼び方で、WebXR以外のカメラ合成、画像認識、AR Quick Lookなども含まれます。",
	},
	{
		q: "WebXRを始めるならThree.jsとBabylon.jsのどちらがよいですか？",
		a: "既存のThree.js資産やサンプルを使いたいならThree.js、WebXRの機能を高レベルに扱いたいならBabylon.jsも候補です。PlayCanvasはエディタや商用案件の運用で便利です。",
	},
	{
		q: "WebXRはメタバース用の技術ですか？",
		a: "WebXRはメタバース専用ではありません。Web上でVR/ARデバイスにアクセスするための低レベルAPIで、教育、製造、商品プレビュー、展示、可視化、ゲームなど幅広い用途に使えます。",
	},
];

export default async function WebXRExplainerPage() {
	const minimalCodeHtml = await codeToHtml(MINIMAL_CODE, {
		lang: "javascript",
		theme: "rose-pine-dawn",
	});
	return (
		<div className="mx-auto max-w-6xl px-5 pt-8 md:px-8 md:pt-12">
			<BreadcrumbStructuredData
				items={[{ name: "WebXRとは", path: "/webxr-explainer" }]}
			/>
			<PageHeader
				title="WebXRとは？"
				lead="WebXRの仕組みと対応ブラウザ、始め方を、最小コードや用語とあわせて解説します。"
			/>

			{/* スマートフォンでは目次を本文の前に、1024px からは本文の右に固定する。DOM の順番は 目次 → 本文 */}
			<div className="lg:grid lg:grid-cols-[minmax(0,1fr)_14rem] lg:gap-x-16">
				<nav
					aria-labelledby="toc-heading"
					className="mb-12 rounded-2xl bg-gray-50 p-5 lg:sticky lg:top-24 lg:col-start-2 lg:row-start-1 lg:mb-0 lg:self-start lg:bg-transparent lg:p-0"
				>
					<h2
						id="toc-heading"
						className="text-base font-bold leading-snug text-gray-950"
					>
						目次
					</h2>
					<ol className="mt-2 grid gap-x-6 sm:grid-cols-2 lg:mt-3 lg:grid-cols-1 lg:border-l lg:border-gray-200">
						{SECTIONS.map((section, index) => (
							<li key={section.id}>
								<a
									href={`#${section.id}`}
									className="flex min-h-11 items-baseline gap-2 py-2.5 text-sm leading-[1.5] text-gray-700 transition-colors hover:text-primary-700 lg:-ml-px lg:min-h-0 lg:border-l lg:border-transparent lg:py-1.5 lg:pl-4 lg:hover:border-primary-600"
								>
									<span className="w-5 shrink-0 text-gray-500 tabular-nums">
										{index + 1}.
									</span>
									<span className="min-w-0">{section.toc}</span>
								</a>
							</li>
						))}
					</ol>
				</nav>

				<div className="min-w-0 space-y-14 md:space-y-16 lg:col-start-1 lg:row-start-1">
					<Section id="what-is-webxr">
						<p className={BODY}>
							<strong className="font-bold text-gray-950">
								WebXR Device API
							</strong>
							は、VR（仮想現実）やAR（拡張現実）デバイスへのアクセスを提供するWeb
							APIです。W3Cの勧告候補草案（Candidate Recommendation
							Draft）として策定が進んでおり、W3C
							Recommendationとしてはまだ確定していません。ブラウザ上でVR/AR体験を開発・配信することを可能にします。
						</p>
						<p className={BODY}>
							従来、VR/AR体験を提供するにはネイティブアプリの開発が必要でしたが、WebXRを使えば
							<strong className="font-bold text-gray-950">
								URLを開くだけで
							</strong>
							没入体験を届けられます。インストール不要、クロスプラットフォーム対応という、Webならではの強みを活かせます。
						</p>
					</Section>

					<Section id="getting-started">
						<ol className="space-y-6">
							{GETTING_STARTED_STEPS.map((step, index) => (
								<li
									key={step.href}
									className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4"
								>
									{/* スマートフォンでは見出しのリンクが高さ44px になるので、番号の丸を8px 下げて行の中央にそろえる */}
									<span
										aria-hidden="true"
										className="mt-2 flex size-8 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-700 tabular-nums md:mt-0"
									>
										{index + 1}
									</span>
									<div className="min-w-0 pt-0.5">
										<h3 className={H3}>
											<Link
												href={step.href}
												className="inline-flex min-h-11 items-center gap-1 text-gray-950 underline decoration-gray-300 underline-offset-4 transition-colors hover:text-primary-700 hover:decoration-current md:min-h-0"
											>
												{step.label}
												<ArrowIcon />
											</Link>
										</h3>
										<p className="mt-1 max-w-[40em] text-sm leading-[1.7] text-gray-600">
											{step.body}
										</p>
									</div>
								</li>
							))}
						</ol>
						<p className={BODY}>
							はじめてWebXRを触る場合は、まずデモを実機で開き、次に対応ブラウザとデバイスを確認し、最後に使うライブラリを選ぶ順番が現実的です。iPhoneではSafari単体のWebXR
							AR対応に制限があるため、iOS向けには
							<Link
								href="/tech-articles/ios-webxr-app-clip-guide"
								className="text-link font-bold"
							>
								App Clipを使う方法
							</Link>
							もあわせて確認してください。
						</p>
					</Section>

					<Section id="browser-support">
						<p className={BODY}>
							WebXRはHTTPSなどのsecure contextで動作する実験的なWeb
							APIです。MDNではLimited
							availabilityとして扱われており、本番導入ではブラウザ互換性とfallbackを確認する必要があります。
						</p>
						{/* 768px からは表。それより狭い幅では行ごとに縦に積み、各値に見出しを添える */}
						<div className="card overflow-clip">
							<table className="block w-full text-left text-sm md:table">
								<thead className="hidden bg-gray-50 md:table-header-group">
									<tr className="border-b border-gray-200">
										<th
											scope="col"
											className="w-44 px-5 py-3 text-[13px] font-bold text-gray-700"
										>
											環境
										</th>
										<th
											scope="col"
											className="px-5 py-3 text-[13px] font-bold text-gray-700"
										>
											WebXRの見方
										</th>
										<th
											scope="col"
											className="px-5 py-3 text-[13px] font-bold text-gray-700"
										>
											BANGEOでの扱い
										</th>
									</tr>
								</thead>
								<tbody className="block md:table-row-group">
									{BROWSER_ROWS.map((row) => (
										<tr
											key={row.env}
											className="block border-b border-gray-200 px-5 py-4 last:border-b-0 md:table-row md:p-0"
										>
											<th
												scope="row"
												className="block text-base font-bold text-gray-950 md:table-cell md:px-5 md:py-4 md:align-top md:text-sm"
											>
												{row.env}
											</th>
											<td className="mt-2 block break-phrase leading-[1.7] text-gray-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
												<span className="block text-xs font-bold text-gray-500 md:hidden">
													WebXRの見方
												</span>
												{row.view}
											</td>
											<td className="mt-2 block break-phrase leading-[1.7] text-gray-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
												<span className="block text-xs font-bold text-gray-500 md:hidden">
													BANGEOでの扱い
												</span>
												{row.policy}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
						<p className={NOTE}>
							対応状況はブラウザ・OS・端末・feature
							flagで変わります。デバイスごとの対応は
							<Link href="/devices" className="text-link font-bold">
								対応デバイス一覧
							</Link>
							、仕様ごとの対応は
							<Link href="/webxr-status" className="text-link font-bold">
								標準化・対応状況
							</Link>
							で確認できます。
						</p>
					</Section>

					<Section id="core-concepts">
						<dl className="divide-y divide-gray-200 border-t border-gray-200">
							{TERMS.map((item) => (
								<div
									key={item.term}
									className="grid gap-1 py-4 md:grid-cols-[15rem_minmax(0,1fr)] md:gap-6"
								>
									<dt className="text-base font-bold leading-snug text-gray-950 [overflow-wrap:anywhere]">
										{item.term}
									</dt>
									<dd className="text-sm leading-[1.7] text-gray-700">
										{item.body}
									</dd>
								</div>
							))}
						</dl>
					</Section>

					<Section id="minimal-code">
						<p className={BODY}>
							WebXRアプリは、対応確認、セッション開始、reference
							space取得、フレームループの順に組み立てます。実際の描画はThree.jsやBabylon.jsなどのライブラリに任せることが多いですが、APIの流れは次の形です。
						</p>
						<figure className="code-block-figure" data-language="javascript">
							<figcaption className="code-block-header">
								<span className="code-block-lang">javascript</span>
							</figcaption>
							<div className="code-block-body">
								{/* biome-ignore lint/security/noDangerouslySetInnerHtml: shiki output is trusted */}
								<div dangerouslySetInnerHTML={{ __html: minimalCodeHtml }} />
								<CodeBlockCopyButton />
							</div>
						</figure>
						<p className={NOTE}>
							本番では、HTTPS配信、ユーザー操作を起点にしたsession開始、権限エラー、feature未対応、WebGL/WebGPU
							context loss、通常表示へのfallbackを必ず扱います。
						</p>
					</Section>

					<Section id="modules">
						<p className={BODY}>
							WebXR Device
							APIは中核となるセッション・pose・入力・描画の仕組みを提供し、ARやhand
							tracking、hit test、layers、depth
							sensingなどは追加Moduleとして整理されています。実装時は「WebXR対応ブラウザか」だけでなく、「必要なModuleがその端末で使えるか」を分けて確認します。
						</p>
						<ul className="grid gap-x-10 gap-y-8 md:grid-cols-2">
							{MODULES.map((item) => (
								<li
									key={item.name}
									className="flex min-w-0 flex-col border-t border-gray-200 pt-4"
								>
									<h3 className={H3}>{item.name}</h3>
									<p className="mt-2 text-sm leading-[1.7] text-gray-700">
										{item.body}
									</p>
									<p className="mt-2">
										<ModuleLink name={item.name} href={item.link} />
									</p>
								</li>
							))}
						</ul>
					</Section>

					<Section id="production-checklist">
						<div className="grid gap-8 md:grid-cols-2 md:gap-10">
							<div>
								<h3 className={H3}>公開前に確認すること</h3>
								<ul className="mt-3 space-y-2.5 text-base leading-[1.7] text-gray-700">
									{[
										"HTTPSで配信している",
										"ユーザー操作からrequestSession()を呼んでいる",
										"isSessionSupported()でsession modeを確認している",
										"requiredFeaturesとoptionalFeaturesを分けている",
										"WebXR不可の場合のfallbackを用意している",
										"Meta Quest / Android / PC / iOSで分岐を確認している",
									].map((item) => (
										<li key={item} className="flex gap-3">
											<span
												aria-hidden="true"
												className="mt-[0.35em] size-4 shrink-0 rounded border-[1.5px] border-gray-400"
											/>
											<span className="min-w-0 [overflow-wrap:anywhere]">
												{item}
											</span>
										</li>
									))}
								</ul>
							</div>
							<div>
								<h3 className={H3}>失敗しやすいところ</h3>
								<ul className="mt-3 space-y-2.5 text-base leading-[1.7] text-gray-700">
									{[
										"iOS SafariでWebXR ARが直接動く前提にする",
										"controllerのthumbstick axesが必ずある前提にする",
										"local-floorとbounded-floorの違いを見落とす",
										"depthやmeshが取れないときに画面が空になる",
										"iframe内のWebXRに必要なallow属性を忘れる",
										"WebGPU対応とWebGPUが安定して使えることを混同する",
									].map((item) => (
										<li key={item} className="flex gap-3">
											<span
												aria-hidden="true"
												className="mt-[0.8em] h-0.5 w-3 shrink-0 rounded-full bg-gray-400"
											/>
											<span className="min-w-0 [overflow-wrap:anywhere]">
												{item}
											</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</Section>

					<Section id="faq">
						<div className="divide-y divide-gray-200 border-t border-gray-200">
							{FAQ.map((item) => (
								<div key={item.q} className="py-6 last:pb-0">
									<h3 className={`${H3} flex gap-3`}>
										<span aria-hidden="true" className="text-gray-500">
											Q
										</span>
										<span className="min-w-0">{item.q}</span>
									</h3>
									<p className="mt-2 flex max-w-[44em] gap-3 text-base leading-[1.8] text-gray-700">
										<span
											aria-hidden="true"
											className="font-bold text-gray-500"
										>
											A
										</span>
										<span className="min-w-0">{item.a}</span>
									</p>
								</div>
							))}
						</div>
					</Section>

					<Section id="goals">
						<div className="grid gap-8 md:grid-cols-2 md:gap-10">
							<div>
								<h3 className={H3}>目標（Goals）</h3>
								<ul className="mt-3 space-y-2.5 text-base leading-[1.7] text-gray-700">
									{[
										"XR機能が利用可能か検出する",
										"XRデバイスの機能を照会する",
										"XRデバイスと入力デバイスの状態をポーリングする",
										"適切なフレームレートでXRデバイスに映像を表示する",
									].map((item) => (
										<li key={item} className="flex gap-3">
											<span
												aria-hidden="true"
												className="mt-[0.7em] size-1.5 shrink-0 rounded-full bg-gray-500"
											/>
											<span className="min-w-0">{item}</span>
										</li>
									))}
								</ul>
							</div>
							<div>
								<h3 className={H3}>非目標（Non-goals）</h3>
								<ul className="mt-3 space-y-2.5 text-base leading-[1.7] text-gray-700">
									{[
										"VR/ARブラウザの動作を定義すること",
										"すべてのVR/ARハードウェアのすべての機能を公開すること",
										"「メタバース」を構築すること",
									].map((item) => (
										<li key={item} className="flex gap-3">
											<span
												aria-hidden="true"
												className="mt-[0.8em] h-0.5 w-3 shrink-0 rounded-full bg-gray-400"
											/>
											<span className="min-w-0">{item}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</Section>

					<Section id="hardware">
						<p className={BODY}>WebXRが対象とするハードウェアの例です。</p>
						<ul className="grid max-w-[40em] grid-cols-1 gap-x-8 text-base text-gray-800 min-[400px]:grid-cols-2">
							{[
								"Meta Questシリーズ",
								"Apple Vision Pro",
								"HTC Vive",
								"Valve Index",
								"ARCore対応スマートフォン",
								"ARKit対応iPhone",
								"Microsoft HoloLens",
								"Magic Leap",
							].map((name) => (
								<li
									key={name}
									className="border-b border-gray-200 py-3 leading-snug"
								>
									{name}
								</li>
							))}
						</ul>
					</Section>

					<Section id="x-meaning">
						<p className={BODY}>
							Virtual Reality、Augmented Reality、Mixed
							Realityには、多くの共通点があります。
						</p>
						<p className={BODY}>
							WebXR APIは、これら
							<strong className="font-bold text-gray-950">
								すべての基盤要素
							</strong>
							を提供することを目指しています。特定の形式に限定したくないため、頭文字ではなく
							<strong className="font-bold text-gray-950">代数的な変数</strong>
							として「X」を使用しています。
						</p>
						<figure className="border-l-2 border-gray-950 py-1 pl-5">
							<p className="text-2xl font-black leading-snug text-gray-950">
								X = Your Reality Here
							</p>
							<figcaption className="mt-1 text-sm text-gray-600">
								（あなたの現実をここに）
							</figcaption>
						</figure>
					</Section>

					<Section id="use-cases">
						<div className="grid gap-8 md:grid-cols-3">
							<div>
								<h3 className={H3}>360°動画</h3>
								<p className="mt-2 text-sm leading-[1.7] text-gray-700">
									Webは動画配信に非常に効果的です。XR対応プレーヤーは没入視聴を可能にします。
								</p>
							</div>
							<div>
								<h3 className={H3}>データ可視化</h3>
								<p className="mt-2 text-sm leading-[1.7] text-gray-700">
									3Dモデルや医療画像など、VR/ARではより正確なスケール感を伝えられます。
								</p>
							</div>
							<div>
								<h3 className={H3}>アート体験</h3>
								<p className="mt-2 text-sm leading-[1.7] text-gray-700">
									ストアモデルに合わない短い実験的体験にとって、Webの即時性は魅力的です。
								</p>
							</div>
						</div>
					</Section>

					<Section id="why-new-api">
						<ol className="space-y-5">
							<li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4">
								<span
									aria-hidden="true"
									className="flex size-8 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-700 tabular-nums"
								>
									1
								</span>
								<div className="min-w-0 pt-0.5">
									<h3 className={H3}>既存APIの限界</h3>
									<p className="mt-1 max-w-[40em] text-base leading-[1.8] text-gray-700">
										DeviceOrientationやGamepad
										APIでは、XRに必要な高精度なタイミングと位置情報の同期が困難でした。
									</p>
								</div>
							</li>
							<li className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-4">
								<span
									aria-hidden="true"
									className="flex size-8 items-center justify-center rounded-full border border-gray-300 text-sm font-bold text-gray-700 tabular-nums"
								>
									2
								</span>
								<div className="min-w-0 pt-0.5">
									<h3 className={H3}>描画の課題</h3>
									<p className="mt-1 max-w-[40em] text-base leading-[1.8] text-gray-700">
										レンズ歪み補正やステレオレンダリングを、標準化された方法で処理する仕組みが必要でした。
									</p>
								</div>
							</li>
						</ol>
					</Section>

					<Section id="webvr-vs-webxr">
						{/* 768px からは表。それより狭い幅では項目（状態 / 設計）ごとに縦に積み、各値に WebVR / WebXR を添える */}
						<div className="card overflow-clip">
							<table className="block w-full text-left text-sm md:table md:table-fixed">
								<thead className="hidden bg-gray-50 md:table-header-group">
									<tr className="border-b border-gray-200">
										<th scope="col" className="w-28 px-5 py-3">
											<span className="sr-only">項目</span>
										</th>
										<th
											scope="col"
											className="px-5 py-3 text-base font-bold text-gray-950"
										>
											WebVR
										</th>
										<th
											scope="col"
											className="px-5 py-3 text-base font-bold text-gray-950"
										>
											WebXR
										</th>
									</tr>
								</thead>
								<tbody className="block md:table-row-group">
									{WEBVR_VS_WEBXR.map((row) => (
										<tr
											key={row.aspect}
											className="block border-b border-gray-200 px-5 py-4 last:border-b-0 md:table-row md:p-0"
										>
											<th
												scope="row"
												className="block text-base font-bold text-gray-950 md:table-cell md:px-5 md:py-4 md:align-top md:text-[13px] md:text-gray-500"
											>
												{row.aspect}
											</th>
											<td className="mt-2 block break-phrase leading-[1.7] text-gray-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
												<span className="block text-xs font-bold text-gray-500 md:hidden">
													WebVR
												</span>
												{row.webvr}
											</td>
											<td className="mt-2 block break-phrase leading-[1.7] text-gray-700 md:mt-0 md:table-cell md:px-5 md:py-4 md:align-top">
												<span className="block text-xs font-bold text-gray-500 md:hidden">
													WebXR
												</span>
												{row.webxr}
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</Section>

					<Section id="openxr">
						<p className={BODY}>
							<strong className="font-bold text-gray-950">OpenXR</strong>
							はネイティブ向けの標準APIです。WebXRと多くの概念を共有しており、ブラウザのバックエンドとして活用されます。
						</p>
					</Section>

					<div className="border-t border-gray-200 pt-8">
						<p className={NOTE}>
							参照:{" "}
							<a
								href="https://github.com/immersive-web/webxr/blob/master/explainer.md"
								target="_blank"
								rel="noopener noreferrer"
								aria-label="WebXR Device API Explainer（新しいタブで開く）"
								className="text-link font-bold"
							>
								WebXR Device API Explainer
								<ExternalIcon />
							</a>
						</p>
						<div className="mt-6 flex flex-wrap gap-3">
							<Link href="/webxr-status" className="btn btn-primary">
								標準化・対応状況を見る
							</Link>
							<Link href="/experiments" className="btn btn-secondary">
								WebXR対応レポートを見る
							</Link>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
