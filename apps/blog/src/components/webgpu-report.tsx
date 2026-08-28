"use client";

import { useCallback, useEffect, useState } from "react";
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

type PowerPreference = "high-performance" | "low-power";

interface MinimalAdapterInfo {
	vendor?: string;
	architecture?: string;
	device?: string;
	description?: string;
	subgroupMinSize?: number;
	subgroupMaxSize?: number;
	isFallbackAdapter?: boolean;
}

interface MinimalAdapter {
	features: { has(name: string): boolean } & Iterable<string>;
	limits: Record<string, unknown>;
	info?: MinimalAdapterInfo;
	isFallbackAdapter?: boolean;
	requestAdapterInfo?: () => Promise<MinimalAdapterInfo>;
}

interface MinimalGPU {
	requestAdapter(options?: {
		powerPreference?: PowerPreference;
	}): Promise<MinimalAdapter | null>;
	getPreferredCanvasFormat?: () => string;
	wgslLanguageFeatures?: Iterable<string>;
}

interface ReportData {
	info: MinimalAdapterInfo;
	isFallbackAdapter: boolean;
	features: string[];
	limits: Record<string, number>;
	preferredCanvasFormat: string | null;
	wgslFeatures: string[];
}

type Status = "checking" | "ready" | "unsupported" | "error";

function getGPU(): MinimalGPU | null {
	if (typeof navigator === "undefined") return null;
	const nav = navigator as Navigator & { gpu?: MinimalGPU };
	return nav.gpu ?? null;
}

function describeEnvironment(ua: string): string {
	if (/OculusBrowser/i.test(ua)) return "Meta Quest / Quest Browser";
	if (/PicoBrowser|Pico\s?Browser/i.test(ua)) return "PICO / PICO Browser";
	if (/Wolvic/i.test(ua)) return "Wolvic";

	let os = "不明なOS";
	if (/Windows/i.test(ua)) os = "Windows";
	else if (/Android/i.test(ua)) os = "Android";
	else if (/iPhone|iPad/i.test(ua)) os = "iOS";
	else if (/Macintosh/i.test(ua)) os = "macOS";
	else if (/Linux/i.test(ua)) os = "Linux";

	let browser = "不明なブラウザ";
	const edge = ua.match(/Edg\/(\d+)/);
	const chrome = ua.match(/Chrome\/(\d+)/);
	const firefox = ua.match(/Firefox\/(\d+)/);
	const safari = ua.match(/Version\/(\d+).*Safari/);
	if (edge) browser = `Edge ${edge[1]}`;
	else if (firefox) browser = `Firefox ${firefox[1]}`;
	else if (chrome) browser = `Chrome ${chrome[1]}`;
	else if (safari) browser = `Safari ${safari[1]}`;

	return `${os} / ${browser}`;
}

function formatBytes(value: number): string {
	if (value < 1024) return `${value} B`;
	const units = ["KiB", "MiB", "GiB"];
	let v = value;
	let unitIndex = -1;
	while (v >= 1024 && unitIndex < units.length - 1) {
		v /= 1024;
		unitIndex += 1;
	}
	const rounded = Number.isInteger(v) ? String(v) : v.toFixed(1);
	return `${rounded} ${units[unitIndex]}`;
}

function formatLimitValue(entry: WebGPULimitEntry, value: number): string {
	if (entry.bytes) return `${formatBytes(value)}（${value.toLocaleString()}）`;
	return value.toLocaleString();
}

/** 既定値に対する余裕。maximum は大きいほど、alignment は小さいほど良い。 */
function ratioToDefault(entry: WebGPULimitEntry, value: number): number {
	if (value <= 0) return 0;
	return entry.limitClass === "alignment"
		? entry.default / value
		: value / entry.default;
}

function ratioLabel(ratio: number): string {
	if (ratio >= 100) return `標準の${Math.round(ratio)}倍`;
	if (ratio > 1.05) return `標準の${ratio.toFixed(ratio < 10 ? 1 : 0)}倍`;
	if (ratio >= 0.95) return "標準どおり";
	return "標準を下回る";
}

/** 既定値ちょうどを25%として、4倍以上で満杯になるバー */
function ratioBarWidth(ratio: number): number {
	return Math.max(4, Math.min(100, (ratio / 4) * 100));
}

const badgeClass = {
	supported: "bg-emerald-50 text-emerald-700",
	unsupported: "bg-gray-100 text-gray-400",
};

const sectionLabelClass =
	"mt-10 text-[11px] font-black tracking-[0.14em] text-gray-400";

const chipClass =
	"rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-500";

const codeClass =
	"rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-normal text-gray-600";

const buttonClass =
	"rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-600 transition hover:border-gray-950 hover:text-gray-950";

const PAGE_URL = `${SITE_URL}/webgpu-report`;

export function WebGPUReport() {
	const [status, setStatus] = useState<Status>("checking");
	const [errorMessage, setErrorMessage] = useState<string | null>(null);
	const [report, setReport] = useState<ReportData | null>(null);
	const [envLabel, setEnvLabel] = useState<string | null>(null);
	const [userAgent, setUserAgent] = useState("");
	const [power, setPower] = useState<PowerPreference>("high-performance");
	const [hasXRGPUBinding, setHasXRGPUBinding] = useState(false);
	const [copied, setCopied] = useState(false);

	const collect = useCallback(async (powerPreference: PowerPreference) => {
		const gpu = getGPU();
		if (!gpu) {
			setStatus("unsupported");
			return;
		}

		setStatus("checking");
		try {
			const adapter = await gpu.requestAdapter({ powerPreference });
			if (!adapter) {
				setStatus("error");
				setErrorMessage(
					"navigator.gpu はありますが、使えるGPUアダプターを取得できませんでした。ドライバーの制限や、ブラウザ側でGPUが拒否リストに入っている可能性があります。",
				);
				return;
			}

			let info: MinimalAdapterInfo = adapter.info ?? {};
			if (!adapter.info && adapter.requestAdapterInfo) {
				try {
					info = await adapter.requestAdapterInfo();
				} catch {
					info = {};
				}
			}

			const features = [...adapter.features].sort();
			const limits: Record<string, number> = {};
			for (const entry of webgpuLimitCatalog) {
				const value = adapter.limits[entry.name];
				if (typeof value === "number") limits[entry.name] = value;
			}

			setReport({
				info,
				isFallbackAdapter: Boolean(
					adapter.isFallbackAdapter ?? info.isFallbackAdapter,
				),
				features,
				limits,
				preferredCanvasFormat: gpu.getPreferredCanvasFormat?.() ?? null,
				wgslFeatures: gpu.wgslLanguageFeatures
					? [...gpu.wgslLanguageFeatures].sort()
					: [],
			});
			setStatus("ready");
		} catch (error) {
			setStatus("error");
			setErrorMessage(
				error instanceof Error
					? `GPU情報の取得に失敗しました: ${error.message}`
					: "GPU情報の取得に失敗しました。",
			);
		}
	}, []);

	useEffect(() => {
		setUserAgent(navigator.userAgent);
		setEnvLabel(describeEnvironment(navigator.userAgent));
		setHasXRGPUBinding(
			typeof (window as unknown as Record<string, unknown>).XRGPUBinding !==
				"undefined",
		);
		collect("high-performance");
	}, [collect]);

	function switchPower(next: PowerPreference) {
		setPower(next);
		collect(next);
	}

	const supportedFeatures = new Set(report?.features ?? []);
	const knownSupportedCount = webgpuFeatureCatalog.filter((entry) =>
		supportedFeatures.has(entry.name),
	).length;
	const extraFeatures = (report?.features ?? []).filter(
		(name) => !webgpuFeatureByName.has(name),
	);

	const adapterName =
		[report?.info.vendor, report?.info.architecture]
			.filter(Boolean)
			.join(" / ") ||
		report?.info.description ||
		"GPU名は非公開";

	function buildSummaryText(): string {
		if (!report) return "";
		const lines = [
			"WebGPU対応レポート (BANGEO)",
			`環境: ${envLabel ?? "不明"}`,
			`GPU: ${adapterName}`,
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
		try {
			await navigator.clipboard.writeText(buildSummaryText());
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			setCopied(false);
		}
	}

	const shareText = report
		? `私の環境（${envLabel ?? "不明"}）のWebGPU対応は ${knownSupportedCount}/${webgpuFeatureCatalog.length} でした`
		: "WebGPUの対応状況を日本語の解説つきで確認できます";
	const shareHref = `https://x.com/intent/tweet?text=${encodeURIComponent(
		shareText,
	)}&url=${encodeURIComponent(PAGE_URL)}`;

	function renderFeatureRow(name: string) {
		const entry = webgpuFeatureByName.get(name);
		const supported = supportedFeatures.has(name);
		const category: WebGPUFeatureCategory | null = entry?.category ?? null;
		return (
			<li
				key={name}
				className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 px-5 py-5"
			>
				<span className="pt-0.5">
					<span
						className={`inline-flex w-full justify-center rounded-full px-2 py-1 text-[11px] font-bold ${
							supported ? badgeClass.supported : badgeClass.unsupported
						}`}
					>
						{supported ? "対応" : "未対応"}
					</span>
				</span>
				<div className="min-w-0">
					<p className="flex flex-wrap items-center gap-2 text-base font-bold leading-snug text-gray-950">
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
					<p className="mt-1.5 text-sm leading-relaxed text-gray-600">
						{entry?.description ??
							"W3C WebGPU仕様の標準セットには無い機能です。ブラウザ独自の拡張か、仕様に追加されたばかりの項目です。"}
					</p>
					{entry?.whyNote && (
						<details className="mt-1.5">
							<summary className="cursor-pointer text-xs font-bold text-gray-400 transition hover:text-gray-600">
								なぜ必要？
							</summary>
							<p className="mt-1 rounded-xl bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-500">
								{entry.whyNote}
							</p>
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
					<p className="text-base font-bold leading-snug text-gray-950">
						{entry.title}
					</p>
					<code className={codeClass}>{entry.name}</code>
					<span className={chipClass}>{limitCategoryLabel[category]}</span>
					{entry.limitClass === "alignment" && (
						<span className={chipClass}>小さいほど良い</span>
					)}
				</div>
				<p className="mt-1.5 text-sm leading-relaxed text-gray-600">
					{entry.description}
				</p>
				<div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,11rem)_minmax(0,1fr)] sm:items-center">
					<p className="text-sm font-black text-gray-950">
						{known ? formatLimitValue(entry, value) : "取得できません"}
					</p>
					<div>
						<div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
							<div
								className={`h-full rounded-full ${
									belowDefault ? "bg-amber-400" : "bg-gray-950"
								}`}
								style={{ width: `${known ? ratioBarWidth(ratio) : 0}%` }}
							/>
						</div>
						<p className="mt-1 text-xs text-gray-400">
							仕様の既定値 {formatLimitValue(entry, entry.default)}
							{known ? ` ／ ${ratioLabel(ratio)}` : ""}
						</p>
					</div>
				</div>
			</li>
		);
	}

	if (status === "unsupported") {
		return (
			<div className="rounded-2xl border border-gray-100 bg-gray-50 px-5 py-6">
				<p className="text-sm font-bold text-gray-950">
					このブラウザではWebGPUを利用できません
				</p>
				<p className="mt-2 text-sm leading-relaxed text-gray-600">
					{envLabel ? `${envLabel} では ` : ""}
					<code className={codeClass}>navigator.gpu</code>{" "}
					が見つかりませんでした。WebGPUに対応したブラウザ（デスクトップ版のChrome・Edge、Safari
					26以降、Windows版のFirefoxなど）で開くと、この端末のGPUが持つ機能と上限値を確認できます。
				</p>
				<p className="mt-2 text-xs leading-relaxed text-gray-400">
					下の一覧は、対応していない環境でも「WebGPUにどんな項目があるか」を読めるように、そのまま表示しています。
				</p>
				<div className="mt-5">
					<p className={sectionLabelClass}>機能（features）</p>
					<ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
						{webgpuFeatureCatalog.map((entry) => renderFeatureRow(entry.name))}
					</ul>
					<p className={sectionLabelClass}>上限値（limits）</p>
					<ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100 bg-white">
						{webgpuLimitCatalog.map(renderLimitRow)}
					</ul>
				</div>
			</div>
		);
	}

	return (
		<div>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-gray-50 px-5 py-4">
				<div className="min-w-0">
					<p className="text-sm font-bold text-gray-950">
						{envLabel ?? "環境を確認中…"}
					</p>
					<p className="mt-0.5 text-xs text-gray-400">
						{status === "ready"
							? `${adapterName} ／ ${knownSupportedCount} / ${webgpuFeatureCatalog.length} の機能がこのGPUで使えます`
							: "GPU情報を取得中…"}
					</p>
				</div>
				{status === "ready" && (
					<div className="ml-auto flex items-center gap-2">
						<button type="button" onClick={copyResult} className={buttonClass}>
							{copied ? "コピーしました" : "結果をコピー"}
						</button>
						<a
							href={shareHref}
							target="_blank"
							rel="noopener noreferrer"
							className={buttonClass}
						>
							Xでシェア
						</a>
					</div>
				)}
			</div>

			{status === "error" && (
				<p className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-relaxed text-amber-900">
					{errorMessage}
				</p>
			)}

			<div className="mt-4 flex flex-wrap items-center gap-2">
				<span className="text-xs font-bold text-gray-400">
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
						className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition ${
							power === value
								? "bg-gray-950 text-white"
								: "border border-gray-200 bg-white text-gray-600 hover:border-gray-950 hover:text-gray-950"
						}`}
					>
						{label}
					</button>
				))}
				<span className="text-xs text-gray-400">
					（GPUが2つある端末では結果が変わります）
				</span>
			</div>

			<p className={sectionLabelClass}>アダプター情報</p>
			<p className="mt-1.5 text-xs leading-relaxed text-gray-500">
				<code className={codeClass}>navigator.gpu.requestAdapter()</code>{" "}
				が返したGPUの素性です。指紋（フィンガープリント）対策として、ブラウザが値を伏せることがあります。
			</p>
			<ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100">
				{adapterInfoFields.map((field) => {
					const raw = report?.info[field.key as keyof MinimalAdapterInfo];
					const value = raw === undefined || raw === "" ? null : String(raw);
					return (
						<li key={field.key} className="px-5 py-4">
							<div className="flex flex-wrap items-baseline gap-x-2">
								<p className="text-sm font-bold text-gray-950">{field.title}</p>
								<code className={codeClass}>{field.key}</code>
							</div>
							<p className="mt-1 text-base font-black text-gray-950">
								{value ?? "非公開"}
							</p>
							<p className="mt-1 text-xs leading-relaxed text-gray-500">
								{field.description}
							</p>
						</li>
					);
				})}
				<li className="px-5 py-4">
					<div className="flex flex-wrap items-baseline gap-x-2">
						<p className="text-sm font-bold text-gray-950">
							ソフトウェア描画かどうか
						</p>
						<code className={codeClass}>isFallbackAdapter</code>
					</div>
					<p className="mt-1 text-base font-black text-gray-950">
						{report?.isFallbackAdapter
							? "はい（CPU側のフォールバック）"
							: "いいえ（GPUで動作）"}
					</p>
					<p className="mt-1 text-xs leading-relaxed text-gray-500">
						true
						の場合は実GPUではなくソフトウェア実装で動いています。描画は通りますが、実機の性能評価には使えません。
					</p>
				</li>
				<li className="px-5 py-4">
					<div className="flex flex-wrap items-baseline gap-x-2">
						<p className="text-sm font-bold text-gray-950">
							推奨キャンバスフォーマット
						</p>
						<code className={codeClass}>getPreferredCanvasFormat()</code>
					</div>
					<p className="mt-1 text-base font-black text-gray-950">
						{report?.preferredCanvasFormat ?? "取得できません"}
					</p>
					<p className="mt-1 text-xs leading-relaxed text-gray-500">
						キャンバスに描くときに、変換コストなしで表示できるフォーマットです。
						<code className={codeClass}>context.configure()</code>{" "}
						にはこの値をそのまま渡すのが基本です。
					</p>
				</li>
				<li className="px-5 py-4">
					<div className="flex flex-wrap items-baseline gap-x-2">
						<p className="text-sm font-bold text-gray-950">
							WebXRとの接続（WebGPU binding）
						</p>
						<code className={codeClass}>XRGPUBinding</code>
					</div>
					<p className="mt-1 text-base font-black text-gray-950">
						{hasXRGPUBinding ? "利用できます" : "利用できません"}
					</p>
					<p className="mt-1 text-xs leading-relaxed text-gray-500">
						WebGPUで描いた映像をそのままWebXRのセッションに出すための橋渡しです。未対応の環境では、XR側の描画はWebGLで行うことになります。
					</p>
				</li>
			</ul>

			<p className={sectionLabelClass}>機能（features）</p>
			<p className="mt-1.5 text-xs leading-relaxed text-gray-500">
				使いたい機能は{" "}
				<code className={codeClass}>
					requestDevice({"{"} requiredFeatures: [...] {"}"})
				</code>{" "}
				で要求します。ここで「未対応」の機能を必須指定すると、デバイス作成そのものが失敗します。
			</p>
			<ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100">
				{[...webgpuFeatureCatalog]
					.sort((a, b) => {
						const aSupported = supportedFeatures.has(a.name) ? 0 : 1;
						const bSupported = supportedFeatures.has(b.name) ? 0 : 1;
						return aSupported - bSupported;
					})
					.map((entry) => renderFeatureRow(entry.name))}
				{extraFeatures.map((name) => renderFeatureRow(name))}
			</ul>

			<p className={sectionLabelClass}>上限値（limits）</p>
			<p className="mt-1.5 text-xs leading-relaxed text-gray-500">
				どこまで大きな値を使えるかの上限です。仕様の既定値はすべての対応環境が保証する下限なので、既定値の範囲で書いたコードはどこでも動きます。上限を引き上げたいときは{" "}
				<code className={codeClass}>
					requestDevice({"{"} requiredLimits: [...] {"}"})
				</code>{" "}
				で明示的に要求します。
			</p>
			<ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100">
				{webgpuLimitCatalog.map(renderLimitRow)}
			</ul>

			<p className={sectionLabelClass}>WGSL言語機能</p>
			<p className="mt-1.5 text-xs leading-relaxed text-gray-500">
				シェーダー言語WGSLの側で使える構文・命令です（
				<code className={codeClass}>navigator.gpu.wgslLanguageFeatures</code>
				）。GPUの機能ではなく、ブラウザのシェーダーコンパイラが持つ機能です。
			</p>
			{report && report.wgslFeatures.length === 0 ? (
				<p className="mt-3 rounded-2xl border border-dashed border-gray-200 px-5 py-6 text-sm text-gray-400">
					このブラウザでは追加のWGSL言語機能は報告されていません。
				</p>
			) : (
				<ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100">
					{(report?.wgslFeatures ?? []).map((name) => {
						const entry = wgslLanguageFeatureByName.get(name);
						return (
							<li key={name} className="px-5 py-4">
								<div className="flex flex-wrap items-baseline gap-x-2">
									<p className="text-sm font-bold text-gray-950">
										{entry?.title ?? name}
									</p>
									<code className={codeClass}>{name}</code>
								</div>
								<p className="mt-1 text-xs leading-relaxed text-gray-500">
									{entry?.description ??
										"このブラウザのWGSL実装が報告している拡張です。WGSL仕様の該当項目を確認してください。"}
								</p>
							</li>
						);
					})}
				</ul>
			)}

			{userAgent && (
				<details className="mt-8">
					<summary className="cursor-pointer text-xs font-bold text-gray-400 transition hover:text-gray-600">
						User Agent を表示
					</summary>
					<p className="mt-2 break-all rounded-xl bg-gray-50 px-3 py-2 font-mono text-[11px] leading-relaxed text-gray-500">
						{userAgent}
					</p>
				</details>
			)}
		</div>
	);
}
