/**
 * WebXR と WebGPU の判定結果を、レポート上部の結果画像と「概要」タブが
 * 共通で使う1つの要約にまとめる。
 *
 * ここは純粋な関数だけにして、カタログは引数で受け取る（テストから実データで呼べる）。
 * API の有無（機能モジュール）と isSessionSupported（セッションモード）は
 * 意味が違うので、要約でも別の配列として持ち、合算した数字を主役にしない。
 */
import type {
	SpecCheckId,
	SpecSupport,
	WebXRSpecEntry,
} from "../webxr-spec-catalog";
import type { ReportEnvironment } from "./environment";
import type { WebGPUReportData, WebGPUStatus } from "./webgpu";

/** 画像と概要での並び順（没入モードを先に見せる） */
export const SESSION_MODE_IDS = [
	"immersive-vr",
	"immersive-ar",
	"inline",
] as const satisfies readonly SpecCheckId[];

export const REFERENCE_SPACE_IDS = [
	"viewer",
	"local",
	"local-floor",
	"bounded-floor",
	"unbounded",
] as const satisfies readonly SpecCheckId[];

const sessionLabel: Record<(typeof SESSION_MODE_IDS)[number], string> = {
	"immersive-vr": "VR",
	"immersive-ar": "AR",
	inline: "inline",
};

/** yes: 対応 / no: 未対応 / unknown: 判定できなかった（未確認） / checking: 確認中 */
export type ReportMark = "yes" | "no" | "unknown" | "checking";

export interface ReportItem {
	id: string;
	name: string;
	mark: ReportMark;
}

/** 結果画像に載せる代表的な上限値の1行 */
export interface ReportLimitHighlight {
	/** GPUSupportedLimits のプロパティ名 */
	name: string;
	title: string;
	/** 表示用に整えた値（例: 16,384 / 4 GiB） */
	value: string;
	/** 仕様の既定値との比（例: 標準の2倍） */
	ratioLabel: string;
	aboveDefault: boolean;
}

export interface ReportSummary {
	/** すべての判定が終わったか。false の間は画像を作らない */
	ready: boolean;
	environment: ReportEnvironment | null;
	/** 判定した日（端末のローカル日付、YYYY-MM-DD） */
	dateLabel: string;
	webxr: {
		sessions: ReportItem[];
		modules: ReportItem[];
		spaces: ReportItem[];
		moduleYes: number;
		/** カタログ全体のうち「対応」と判定できた数 */
		supported: number;
		total: number;
	};
	webgpu: {
		status: WebGPUStatus;
		mark: ReportMark;
		featureYes: number;
		featureTotal: number;
		/** ブラウザが伏せているときは null */
		adapterVendor: string | null;
		adapterDetail: string | null;
		isFallbackAdapter: boolean;
		/** 仕様の既定値を上回っている limit の数 */
		limitsAboveDefault: number;
		limitTotal: number;
		/** カタログ順の feature ごとの判定。WebGPU を使えないときは全件が同じ判定になる */
		features: ReportItem[];
		/** 代表的な上限値。値を取得できたものだけ */
		limitHighlights: ReportLimitHighlight[];
	};
}

export interface LimitDefinition {
	name: string;
	title: string;
	default: number;
	limitClass: "maximum" | "alignment";
	/** バイト数として表示するか */
	bytes?: boolean;
}

/** 結果画像に載せる上限値。テクスチャ・バッファ・コンピュートから1つずつ選ぶ */
export const LIMIT_HIGHLIGHT_NAMES: readonly string[] = [
	"maxTextureDimension2D",
	"maxBufferSize",
	"maxComputeInvocationsPerWorkgroup",
];

/** 既定値に対する余裕。maximum は大きいほど、alignment は小さいほど良い。 */
export function limitRatioToDefault(
	entry: Pick<LimitDefinition, "default" | "limitClass">,
	value: number,
): number {
	if (value <= 0) return 0;
	return entry.limitClass === "alignment"
		? entry.default / value
		: value / entry.default;
}

/** 表示の丸め誤差で「標準どおり」が上回り扱いにならないよう、5%の幅を持たせる */
export const LIMIT_ABOVE_DEFAULT_RATIO = 1.05;
const LIMIT_BELOW_DEFAULT_RATIO = 0.95;

/** 仕様の既定値との比を言葉にする。既定値ちょうどの前後5%は「標準どおり」 */
export function limitRatioLabel(ratio: number): string {
	if (ratio >= 100) return `標準の${Math.round(ratio)}倍`;
	if (ratio > LIMIT_ABOVE_DEFAULT_RATIO) {
		// 2.0倍 のような末尾の .0 は付けない
		const rounded = ratio < 10 ? Number(ratio.toFixed(1)) : Math.round(ratio);
		return `標準の${rounded}倍`;
	}
	if (ratio >= LIMIT_BELOW_DEFAULT_RATIO) return "標準どおり";
	return "標準を下回る";
}

export function formatBytes(value: number): string {
	if (value < 1024) return `${value} B`;
	const units = ["KiB", "MiB", "GiB"];
	let scaled = value;
	let unitIndex = -1;
	while (scaled >= 1024 && unitIndex < units.length - 1) {
		scaled /= 1024;
		unitIndex += 1;
	}
	const rounded = Number.isInteger(scaled) ? String(scaled) : scaled.toFixed(1);
	return `${rounded} ${units[unitIndex]}`;
}

/** 3桁区切り。端末の言語設定で表記が変わらないよう、区切り方を固定する */
export function formatCount(value: number): string {
	return value.toLocaleString("en-US");
}

function toMark(support: SpecSupport | undefined): ReportMark {
	if (support === "supported") return "yes";
	if (support === "unsupported") return "no";
	if (support === "unknown") return "unknown";
	return "checking";
}

function formatLocalDate(date: Date): string {
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${date.getFullYear()}-${month}-${day}`;
}

export interface ReportSummaryInput {
	environment: ReportEnvironment | null;
	date: Date;
	specs: readonly WebXRSpecEntry[];
	webxr: Partial<Record<SpecCheckId, SpecSupport>>;
	webgpuStatus: WebGPUStatus;
	webgpuReport: WebGPUReportData | null;
	/** カタログにある feature 名（ブラウザ独自の feature は数に入れない） */
	webgpuFeatureNames: readonly string[];
	webgpuLimits: readonly LimitDefinition[];
}

export function buildReportSummary(input: ReportSummaryInput): ReportSummary {
	const { specs, webxr } = input;
	const sessionIds: readonly string[] = SESSION_MODE_IDS;
	const spaceIds: readonly string[] = REFERENCE_SPACE_IDS;
	const byId = new Map(specs.map((entry) => [entry.id as string, entry]));

	const sessions: ReportItem[] = SESSION_MODE_IDS.map((id) => ({
		id,
		name: sessionLabel[id],
		mark: toMark(webxr[id]),
	}));
	const spaces: ReportItem[] = REFERENCE_SPACE_IDS.flatMap((id) => {
		const entry = byId.get(id);
		return entry ? [{ id, name: entry.name, mark: toMark(webxr[id]) }] : [];
	});
	const modules: ReportItem[] = specs
		.filter(
			(entry) => !sessionIds.includes(entry.id) && !spaceIds.includes(entry.id),
		)
		.map((entry) => ({
			id: entry.id,
			name: entry.name,
			mark: toMark(webxr[entry.id]),
		}));

	const webxrSettled = specs.every((entry) => {
		const support = webxr[entry.id];
		return support !== undefined && support !== "checking";
	});

	const report = input.webgpuStatus === "ready" ? input.webgpuReport : null;
	const supportedFeatures = new Set(report?.features ?? []);
	const limitsAboveDefault = report
		? input.webgpuLimits.filter((entry) => {
				const value = report.limits[entry.name];
				return (
					typeof value === "number" &&
					limitRatioToDefault(entry, value) > LIMIT_ABOVE_DEFAULT_RATIO
				);
			}).length
		: 0;

	const webgpuMark: ReportMark =
		input.webgpuStatus === "ready"
			? "yes"
			: input.webgpuStatus === "unsupported"
				? "no"
				: input.webgpuStatus === "error"
					? "unknown"
					: "checking";

	// アダプターを取得できなかったときは、feature を1件ずつ「未対応」と言い切らない
	const features: ReportItem[] = input.webgpuFeatureNames.map((name) => ({
		id: name,
		name,
		mark: report ? (supportedFeatures.has(name) ? "yes" : "no") : webgpuMark,
	}));

	const limitHighlights: ReportLimitHighlight[] = report
		? LIMIT_HIGHLIGHT_NAMES.flatMap((name) => {
				const entry = input.webgpuLimits.find((limit) => limit.name === name);
				const value = report.limits[name];
				if (!entry || typeof value !== "number") return [];
				const ratio = limitRatioToDefault(entry, value);
				return [
					{
						name,
						title: entry.title,
						value: entry.bytes ? formatBytes(value) : formatCount(value),
						ratioLabel: limitRatioLabel(ratio),
						aboveDefault: ratio > LIMIT_ABOVE_DEFAULT_RATIO,
					},
				];
			})
		: [];

	return {
		ready:
			input.environment !== null &&
			webxrSettled &&
			input.webgpuStatus !== "checking",
		environment: input.environment,
		dateLabel: formatLocalDate(input.date),
		webxr: {
			sessions,
			modules,
			spaces,
			moduleYes: modules.filter((item) => item.mark === "yes").length,
			supported: specs.filter((entry) => webxr[entry.id] === "supported")
				.length,
			total: specs.length,
		},
		webgpu: {
			status: input.webgpuStatus,
			mark: webgpuMark,
			featureYes: features.filter((item) => item.mark === "yes").length,
			featureTotal: features.length,
			adapterVendor: report?.info.vendor || null,
			adapterDetail:
				report?.info.architecture || report?.info.description || null,
			isFallbackAdapter: report?.isFallbackAdapter ?? false,
			limitsAboveDefault,
			limitTotal: input.webgpuLimits.length,
			features,
			limitHighlights,
		},
	};
}

const statusText: Record<ReportMark, string> = {
	yes: "対応",
	no: "未対応",
	unknown: "未確認",
	checking: "確認中",
};

/**
 * 判定の表示名。結果画像・概要・詳細の一覧で同じ言葉にそろえる。
 * 判定できなかったもの（unknown）は「未対応」と言い切らず「未確認」にする。
 */
export function reportStatusLabel(mark: ReportMark): string {
	return statusText[mark];
}

/** 結果画像の代替テキスト。画像に描いた内容を文章で言い直す */
export function reportAltText(summary: ReportSummary): string {
	const environment = summary.environment?.label ?? "この端末";
	const sessions = summary.webxr.sessions
		.map((item) => `${item.name}は${reportStatusLabel(item.mark)}`)
		.join("、");
	const webgpu =
		summary.webgpu.mark === "yes"
			? `WebGPUは対応で、${summary.webgpu.featureTotal}機能のうち${summary.webgpu.featureYes}機能を検出`
			: `WebGPUは${reportStatusLabel(summary.webgpu.mark)}`;
	return `${environment} のWebXR・WebGPU対応レポート。${sessions}。WebXRの機能モジュールは${summary.webxr.modules.length}件のうち${summary.webxr.moduleYes}件のAPIを検出。${webgpu}。`;
}

/** 共有するときに添える本文。数字は画像に任せ、どの環境の結果かだけを書く */
export function reportShareText(summary: ReportSummary): string {
	const environment = summary.environment?.label;
	return environment
		? `${environment} のWebXR・WebGPU対応を、BANGEOレポートで確認しました`
		: "WebXR・WebGPU対応を、BANGEOレポートで確認しました";
}
