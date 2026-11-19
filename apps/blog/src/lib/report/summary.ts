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

/** yes: 確認できた / no: 使えない / unknown: 判定できなかった / checking: 判定中 */
export type ReportMark = "yes" | "no" | "unknown" | "checking";

export interface ReportItem {
	id: string;
	name: string;
	mark: ReportMark;
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
	};
}

export interface LimitDefinition {
	name: string;
	default: number;
	limitClass: "maximum" | "alignment";
}

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
			featureYes: input.webgpuFeatureNames.filter((name) =>
				supportedFeatures.has(name),
			).length,
			featureTotal: input.webgpuFeatureNames.length,
			adapterVendor: report?.info.vendor || null,
			adapterDetail:
				report?.info.architecture || report?.info.description || null,
			isFallbackAdapter: report?.isFallbackAdapter ?? false,
			limitsAboveDefault,
			limitTotal: input.webgpuLimits.length,
		},
	};
}

const sessionStatusText: Record<ReportMark, string> = {
	yes: "開始できる",
	no: "開始できない",
	unknown: "判定できず",
	checking: "確認中",
};

export function sessionStatusLabel(mark: ReportMark): string {
	return sessionStatusText[mark];
}

const webgpuStatusText: Record<ReportMark, string> = {
	yes: "利用できる",
	no: "利用できない",
	unknown: "取得できず",
	checking: "確認中",
};

export function webgpuStatusLabel(mark: ReportMark): string {
	return webgpuStatusText[mark];
}

/** 結果画像の代替テキスト。画像に描いた内容を文章で言い直す */
export function reportAltText(summary: ReportSummary): string {
	const environment = summary.environment?.label ?? "この端末";
	const sessions = summary.webxr.sessions
		.map((item) => `${item.name}は${sessionStatusLabel(item.mark)}`)
		.join("、");
	const webgpu =
		summary.webgpu.mark === "yes"
			? `WebGPUは利用でき、${summary.webgpu.featureTotal}機能のうち${summary.webgpu.featureYes}機能に対応`
			: `WebGPUは${webgpuStatusLabel(summary.webgpu.mark)}`;
	return `${environment} のWebXR・WebGPU対応レポート。${sessions}。WebXRの機能モジュールは${summary.webxr.modules.length}件のうち${summary.webxr.moduleYes}件のAPIを検出。${webgpu}。`;
}

/** 共有するときに添える本文。数字は画像に任せ、どの環境の結果かだけを書く */
export function reportShareText(summary: ReportSummary): string {
	const environment = summary.environment?.label;
	return environment
		? `${environment} のWebXR・WebGPU対応を、BANGEOのレポートで確認しました`
		: "WebXR・WebGPU対応を、BANGEOのレポートで確認しました";
}
