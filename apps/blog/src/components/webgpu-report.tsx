"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
	formatBytes,
	formatCount,
	limitRatioLabel,
	limitRatioToDefault,
	reportStatusLabel,
} from "@/lib/report/summary";
import {
	type AdapterInfoLike,
	adapterDisplayName,
	type PowerPreference,
} from "@/lib/report/webgpu";
import { SITE_URL } from "@/lib/site-url";
import {
	adapterInfoFields,
	featureCategoryLabel,
	limitCategoryLabel,
	type WebGPUFeatureCategory,
	type WebGPULimitCategory,
	type WebGPULimitEntry,
	webgpuFeatureByName,
	webgpuFeatureCatalog,
	webgpuLimitCatalog,
	wgslLanguageFeatureByName,
} from "@/lib/webgpu-report-catalog";
import { MarkBadge, supportToMark } from "./report/report-mark";
import { useReport } from "./report/report-provider";

// 値の整え方と既定値との比の言い方は、結果画像と同じ関数を使う
function formatLimitValue(entry: WebGPULimitEntry, value: number): string {
	if (entry.bytes) return `${formatBytes(value)}（${formatCount(value)}）`;
	return formatCount(value);
}

const ratioToDefault = limitRatioToDefault;
const ratioLabel = limitRatioLabel;

/** 既定値ちょうどを25%として、4倍以上で満杯になるバー */
function ratioBarWidth(ratio: number): number {
	return Math.max(4, Math.min(100, (ratio / 4) * 100));
}

const sectionHeadingClass =
	"mt-12 text-lg font-bold leading-snug text-gray-950";

// 項目名と説明は文節で折る（語の途中で割れたり、「ます。」だけの行が残ったりしないように）。
// 項目名には [overflow-wrap:anywhere] も付ける。1文節が1行より長い名前（「動的オフセット付きユニフォームバッファ数」など）が
// 320〜375px幅ではみ出さないようにするためで、見出しの土台（globals.css の h1〜h4）と同じ組み合わせ
const sectionNoteClass =
	"mt-2 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500";

const listClass =
	"mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200";

const chipClass = "chip";

// 区切りのない長い名前（maxDynamicUniformBuffersPerPipelineLayout など）が320px幅ではみ出さないよう、どこでも折れるようにする
const codeClass =
	"rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-normal text-gray-600 [overflow-wrap:anywhere]";

// 「コピーしました」などに変わっても横の説明が動かないよう、いちばん長いラベルの幅を取っておく
const buttonClass = "btn btn-secondary min-w-56 rounded-full";

// 開閉の見出し。タッチで押しやすいよう、スマートフォンでは高さ44px（文字16px + 上下14px）
const whySummaryClass =
	"cursor-pointer py-3.5 text-xs font-bold text-gray-500 transition-colors hover:text-gray-800 sm:py-1";

const whyNoteClass =
	"mt-1 rounded-xl bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600";

const PAGE_URL = `${SITE_URL}/webgpu-report`;

export function WebGPUReport() {
	// 取得はレポートのレイアウトで1回だけ行い、結果画像と同じ結果をここで使う
	const {
		userAgent,
		environment,
		webxr,
		webgpu: { status, report, errorMessage, power, switchPower },
	} = useReport();
	const [copyState, setCopyState] = useState<"idle" | "done" | "failed">(
		"idle",
	);
	const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	useEffect(() => () => clearTimeout(copiedTimer.current), []);
	const powerLabelId = useId();

	const envLabel = environment?.label ?? null;
	const xrBinding = webxr.results["webgpu-binding"];
	// 最初の取得が終わるまでは、値の代わりに「確認中」を出す（GPUの切り替え中は前の値を残す）
	const pending = status === "checking" && !report;
	const missingValue = pending ? "確認中" : "取得できません";

	const supportedFeatures = new Set(report?.features ?? []);
	const knownSupportedCount = webgpuFeatureCatalog.filter((entry) =>
		supportedFeatures.has(entry.name),
	).length;
	const extraFeatures = (report?.features ?? []).filter(
		(name) => !webgpuFeatureByName.has(name),
	);

	function buildSummaryText(): string {
		if (!report) return "";
		const lines = [
			"WebGPU対応レポート (BANGEO)",
			`環境: ${envLabel ?? "不明"}`,
			`GPU: ${adapterDisplayName(report.info) ?? "GPU名は非公開"}`,
			`対応feature: ${knownSupportedCount} / ${webgpuFeatureCatalog.length}`,
			`対応feature一覧: ${report.features.join(", ") || "なし"}`,
			`preferredCanvasFormat: ${report.preferredCanvasFormat ?? "不明"}`,
			"",
			"上限値（標準の既定値との比）:",
			...webgpuLimitCatalog.flatMap((entry) => {
				const value = report.limits[entry.name];
				if (typeof value !== "number") return [];
				const ratio = ratioToDefault(entry, value);
				return [
					`- ${entry.name}: ${value} (既定 ${entry.default} / ${ratioLabel(ratio)})`,
				];
			}),
			"",
			`UA: ${userAgent}`,
			PAGE_URL,
		];
		return lines.join("\n");
	}

	async function copyResult() {
		let result: "done" | "failed" = "done";
		try {
			await navigator.clipboard.writeText(buildSummaryText());
		} catch {
			// クリップボードが使えない環境でも、押した結果は伝える
			result = "failed";
		}
		setCopyState(result);
		clearTimeout(copiedTimer.current);
		copiedTimer.current = setTimeout(() => setCopyState("idle"), 1600);
	}

	function renderFeatureRow(name: string) {
		const entry = webgpuFeatureByName.get(name);
		const supported = supportedFeatures.has(name);
		const category: WebGPUFeatureCategory | null = entry?.category ?? null;
		// アダプターを取得できなかったときは「未対応」と言い切らない
		const mark =
			status === "checking"
				? "checking"
				: status === "error"
					? "unknown"
					: supported
						? "yes"
						: "no";
		return (
			<li
				key={name}
				id={`feature-${name}`}
				// スマートフォンでは判定の印を名前の上に置き、説明に幅を回す
				className="grid scroll-mt-28 grid-cols-1 gap-y-3 px-5 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-x-4"
			>
				<span className="pt-0.5">
					{/* 確認中は記号（…）だけを出す */}
					<MarkBadge mark={mark} className="sm:w-full">
						{mark === "checking" ? "" : reportStatusLabel(mark)}
					</MarkBadge>
				</span>
				<div className="min-w-0">
					<p className="flex flex-wrap items-center gap-2 break-phrase text-base font-bold leading-snug text-gray-950 [overflow-wrap:anywhere]">
						{entry?.title ?? name}
						<code className={codeClass} title="requiredFeatures に渡す名前">
							{name}
						</code>
						{category && (
							<span className={chipClass}>
								{featureCategoryLabel[category]}
							</span>
						)}
					</p>
					<p className="mt-1.5 max-w-[40em] break-phrase text-sm leading-relaxed text-gray-600">
						{entry?.description ??
							"W3C WebGPU仕様の標準セットには無い機能です。ブラウザ独自の拡張か、仕様に追加されたばかりの項目です。"}
					</p>
					{entry?.whyNote && (
						<details className="mt-1">
							<summary className={whySummaryClass}>必要な理由</summary>
							<p className={whyNoteClass}>{entry.whyNote}</p>
						</details>
					)}
				</div>
			</li>
		);
	}

	function renderLimitRow(entry: WebGPULimitEntry) {
		const value = report?.limits[entry.name];
		const category: WebGPULimitCategory = entry.category;
		const known = typeof value === "number";
		const ratio = known ? ratioToDefault(entry, value) : 0;
		const belowDefault = known && ratio < 0.95;

		return (
			<li key={entry.name} className="px-5 py-5">
				<div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
					<p className="break-phrase text-base font-bold leading-snug text-gray-950 [overflow-wrap:anywhere]">
						{entry.title}
					</p>
					<code className={codeClass}>{entry.name}</code>
					<span className={chipClass}>{limitCategoryLabel[category]}</span>
					{entry.limitClass === "alignment" && (
						<span className={chipClass}>小さいほど良い</span>
					)}
				</div>
				<p className="mt-1.5 max-w-[40em] break-phrase text-sm leading-relaxed text-gray-600">
					{entry.description}
				</p>
				<div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-center">
					<p className="text-sm font-bold text-gray-950">
						{known ? formatLimitValue(entry, value) : missingValue}
					</p>
					<div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
							<div
								className={`h-full rounded-full ${
									belowDefault ? "bg-data-ask" : "bg-gray-950"
								}`}
								style={{ width: `${known ? ratioBarWidth(ratio) : 0}%` }}
							/>
						</div>
						<p className="mt-1 text-xs text-gray-500">
							仕様の既定値{formatLimitValue(entry, entry.default)}
							{known ? ` / ${ratioLabel(ratio)}` : ""}
						</p>
					</div>
				</div>
			</li>
		);
	}

	if (status === "unsupported") {
		// 未対応の知らせと一覧を分けて置く（囲みの中に一覧の枠を重ねない）
		return (
			<div>
				<div className="rounded-2xl bg-gray-50 px-5 py-6">
					<p className="text-base font-bold text-gray-950">
						このブラウザはWebGPUに未対応です
					</p>
					<p className="mt-2 max-w-[40em] break-phrase text-sm leading-relaxed text-gray-600">
						{envLabel ? `${envLabel}では` : ""}
						<code className={codeClass}>navigator.gpu</code>
						が見つかりませんでした。WebGPUに対応したブラウザ（デスクトップ版のChrome・Edge、Safari
						26以降、Windows版のFirefoxなど）で開くと、この端末のGPUが持つ機能と上限値を確認できます。
					</p>
					<p className="mt-2 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500">
						下の一覧で、WebGPUにある機能と上限値を1項目ずつ読めます。
					</p>
				</div>
				<h2 className={sectionHeadingClass}>機能（features）</h2>
				<ul className={listClass}>
					{webgpuFeatureCatalog.map((entry) => renderFeatureRow(entry.name))}
				</ul>
				<h2 className={sectionHeadingClass}>上限値（limits）</h2>
				<ul className={listClass}>{webgpuLimitCatalog.map(renderLimitRow)}</ul>
			</div>
		);
	}

	return (
		<div>
			{status === "error" && (
				<p className="mb-4 break-phrase rounded-2xl bg-data-ask-soft px-5 py-4 text-sm leading-relaxed text-data-ask">
					{errorMessage}
				</p>
			)}

			{/* biome-ignore lint/a11y/useSemanticElements: 群の名前とボタンを1行に並べるため。legend は flex の行に入れられない */}
			<div
				role="group"
				aria-labelledby={powerLabelId}
				className="flex flex-wrap items-center gap-2"
			>
				<span id={powerLabelId} className="text-[13px] font-bold text-gray-700">
					アダプターの選び方
				</span>
				{(
					[
						["high-performance", "高性能GPU優先"],
						["low-power", "省電力GPU優先"],
					] as [PowerPreference, string][]
				).map(([value, label]) => (
					<button
						key={value}
						type="button"
						onClick={() => switchPower(value)}
						aria-pressed={power === value}
						// タッチで押しやすいよう、スマートフォンでは高さ44px
						className={`inline-flex min-h-11 items-center whitespace-nowrap rounded-full border px-4 text-xs font-bold transition-[background-color,border-color,color,transform] active:scale-[0.98] sm:min-h-10 ${
							power === value
								? "border-gray-950 bg-gray-950 text-white"
								: "border-gray-200 bg-white text-gray-700 hover:border-gray-950 hover:text-gray-950"
						}`}
					>
						{label}
					</button>
				))}
				<span className="break-phrase text-xs leading-relaxed text-gray-500">
					（GPUが2つある端末では結果が変わり、上の画像にも反映されます）
				</span>
			</div>

			<h2 className={sectionHeadingClass}>アダプター情報</h2>
			<p className={sectionNoteClass}>
				<code className={codeClass}>navigator.gpu.requestAdapter()</code>
				が返したGPUの素性です。指紋（フィンガープリント）対策として、ブラウザが値を伏せることがあります。
			</p>
			<ul className={listClass}>
				{adapterInfoFields.map((field) => {
					const raw = report?.info[field.key as keyof AdapterInfoLike];
					const value = raw === undefined || raw === "" ? null : String(raw);
					return (
						<li key={field.key} className="px-5 py-4">
							<div className="flex flex-wrap items-baseline gap-x-2">
								<p className="break-phrase text-sm font-bold text-gray-950 [overflow-wrap:anywhere]">
									{field.title}
								</p>
								<code className={codeClass}>{field.key}</code>
							</div>
							<p className="mt-1 text-base font-bold text-gray-950">
								{value ?? (report ? "非公開" : missingValue)}
							</p>
							<p className="mt-1 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500">
								{field.description}
							</p>
						</li>
					);
				})}
				<li className="px-5 py-4">
					<div className="flex flex-wrap items-baseline gap-x-2">
						<p className="break-phrase text-sm font-bold text-gray-950 [overflow-wrap:anywhere]">
							ソフトウェア描画かどうか
						</p>
						<code className={codeClass}>isFallbackAdapter</code>
					</div>
					<p className="mt-1 text-base font-bold text-gray-950">
						{!report
							? missingValue
							: report.isFallbackAdapter
								? "はい（CPU側のフォールバック）"
								: "いいえ（GPUで動作）"}
					</p>
					<p className="mt-1 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500">
						<code className={codeClass}>true</code>
						の場合は実GPUではなくソフトウェア実装で動いています。描画は通りますが、実機の性能評価には使えません。
					</p>
				</li>
				<li className="px-5 py-4">
					<div className="flex flex-wrap items-baseline gap-x-2">
						<p className="break-phrase text-sm font-bold text-gray-950 [overflow-wrap:anywhere]">
							推奨キャンバスフォーマット
						</p>
						<code className={codeClass}>getPreferredCanvasFormat()</code>
					</div>
					<p className="mt-1 text-base font-bold text-gray-950">
						{report?.preferredCanvasFormat ?? missingValue}
					</p>
					<p className="mt-1 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500">
						キャンバスに描くときに、変換コストなしで表示できるフォーマットです。
						<code className={codeClass}>context.configure()</code>
						にはこの値をそのまま渡すのが基本です。
					</p>
				</li>
				<li className="px-5 py-4">
					<div className="flex flex-wrap items-baseline gap-x-2">
						<p className="break-phrase text-sm font-bold text-gray-950 [overflow-wrap:anywhere]">
							WebXRとの接続（WebGPU binding）
						</p>
						<code className={codeClass}>XRGPUBinding</code>
					</div>
					<p className="mt-1 text-base font-bold text-gray-950">
						{reportStatusLabel(supportToMark(xrBinding))}
					</p>
					<p className="mt-1 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500">
						WebGPUで描いた映像をそのままWebXRのセッションに出すための橋渡しです。未対応の環境では、XR側の描画はWebGLで行うことになります。
					</p>
				</li>
			</ul>

			<h2 className={sectionHeadingClass}>機能（features）</h2>
			<p className={sectionNoteClass}>
				使いたい機能は
				<code className={codeClass}>
					requestDevice({"{"} requiredFeatures: [...] {"}"})
				</code>
				で要求します。ここで「未対応」の機能を必須指定すると、デバイス作成そのものが失敗します。
			</p>
			<ul className={listClass}>
				{[...webgpuFeatureCatalog]
					.sort((a, b) => {
						const aSupported = supportedFeatures.has(a.name) ? 0 : 1;
						const bSupported = supportedFeatures.has(b.name) ? 0 : 1;
						return aSupported - bSupported;
					})
					.map((entry) => renderFeatureRow(entry.name))}
				{extraFeatures.map((name) => renderFeatureRow(name))}
			</ul>

			<h2 className={sectionHeadingClass}>上限値（limits）</h2>
			<p className={sectionNoteClass}>
				どこまで大きな値を使えるかの上限です。仕様の既定値はすべての対応環境が保証する下限なので、既定値の範囲で書いたコードはどこでも動きます。上限を引き上げたいときは
				<code className={codeClass}>
					requestDevice({"{"} requiredLimits: {"{"}...{"}"} {"}"})
				</code>
				で明示的に要求します。
			</p>
			<ul className={listClass}>{webgpuLimitCatalog.map(renderLimitRow)}</ul>

			<h2 className={sectionHeadingClass}>WGSL言語機能</h2>
			<p className={sectionNoteClass}>
				シェーダー言語WGSLの側で使える構文・命令です（
				<code className={codeClass}>navigator.gpu.wgslLanguageFeatures</code>
				）。GPUの機能ではなく、ブラウザのシェーダーコンパイラが持つ機能です。
			</p>
			{!report ? (
				<p className="mt-4 rounded-2xl border border-dashed border-gray-200 px-5 py-6 text-sm text-gray-500">
					{pending
						? "確認中です。"
						: "GPUアダプターを取得できなかったため、WGSL言語機能を確認できませんでした。"}
				</p>
			) : report.wgslFeatures.length === 0 ? (
				<p className="mt-4 rounded-2xl border border-dashed border-gray-200 px-5 py-6 text-sm text-gray-500">
					このブラウザでは追加のWGSL言語機能は報告されていません。
				</p>
			) : (
				<ul className={listClass}>
					{report.wgslFeatures.map((name) => {
						const entry = wgslLanguageFeatureByName.get(name);
						return (
							<li key={name} className="px-5 py-4">
								<div className="flex flex-wrap items-baseline gap-x-2">
									<p className="break-phrase text-sm font-bold text-gray-950 [overflow-wrap:anywhere]">
										{entry?.title ?? name}
									</p>
									<code className={codeClass}>{name}</code>
								</div>
								<p className="mt-1 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500">
									{entry?.description ??
										"このブラウザのWGSL実装が報告している拡張です。WGSL仕様の該当項目を確認してください。"}
								</p>
							</li>
						);
					})}
				</ul>
			)}

			{status === "ready" && (
				<div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2">
					<button type="button" onClick={copyResult} className={buttonClass}>
						{copyState === "done"
							? "コピーしました"
							: copyState === "failed"
								? "コピーできませんでした"
								: "全項目をテキストでコピー"}
					</button>
					<p className="break-phrase text-xs leading-relaxed text-gray-500">
						不具合の報告や比較用に、機能と上限値の一覧を文字でコピーします。
					</p>
				</div>
			)}

			{userAgent && (
				<details className="mt-4">
					<summary className={whySummaryClass}>User Agentを表示</summary>
					<p className="mt-2 break-all rounded-xl bg-gray-50 px-3 py-2 font-mono text-xs leading-relaxed text-gray-600">
						{userAgent}
					</p>
				</details>
			)}
		</div>
	);
}
