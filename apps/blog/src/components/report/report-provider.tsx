"use client";

import {
	createContext,
	type ReactNode,
	useCallback,
	useContext,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import {
	type ReportEnvironment,
	resolveReportEnvironment,
} from "@/lib/report/environment";
import { buildReportSummary, type ReportSummary } from "@/lib/report/summary";
import {
	collectWebGPUReport,
	type PowerPreference,
	type WebGPUReportData,
	type WebGPUStatus,
} from "@/lib/report/webgpu";
import {
	webgpuFeatureCatalog,
	webgpuLimitCatalog,
} from "@/lib/webgpu-report-catalog";
import {
	type SpecCheckId,
	type SpecSupport,
	webxrSpecCatalog,
} from "@/lib/webxr-spec-catalog";
import { checkWebXRSupport } from "@/lib/webxr-support";

interface ReportContextValue {
	userAgent: string;
	environment: ReportEnvironment | null;
	webxr: {
		results: Partial<Record<SpecCheckId, SpecSupport>>;
		/** カタログの全項目について判定が返ったか */
		loaded: boolean;
	};
	webgpu: {
		status: WebGPUStatus;
		report: WebGPUReportData | null;
		errorMessage: string | null;
		power: PowerPreference;
		switchPower: (next: PowerPreference) => void;
	};
	summary: ReportSummary;
}

const ReportContext = createContext<ReportContextValue | null>(null);

const webgpuFeatureNames = webgpuFeatureCatalog.map((entry) => entry.name);
const webgpuLimitNames = webgpuLimitCatalog.map((entry) => entry.name);

/**
 * レポートの3つのタブ（概要 / WebXR / WebGPU）と結果画像が同じ判定結果を使うための置き場。
 * レイアウトに置くので、タブを切り替えても判定をやり直さず、画像も作り直さない。
 */
export function ReportProvider({ children }: { children: ReactNode }) {
	const [userAgent, setUserAgent] = useState("");
	const [environment, setEnvironment] = useState<ReportEnvironment | null>(
		null,
	);
	const [checkedAt, setCheckedAt] = useState<Date | null>(null);
	const [webxrResults, setWebxrResults] = useState<
		Partial<Record<SpecCheckId, SpecSupport>>
	>({});
	const [webgpuStatus, setWebgpuStatus] = useState<WebGPUStatus>("checking");
	const [webgpuReport, setWebgpuReport] = useState<WebGPUReportData | null>(
		null,
	);
	const [webgpuError, setWebgpuError] = useState<string | null>(null);
	const [power, setPower] = useState<PowerPreference>("high-performance");
	// 切り替えを続けて押したとき、遅れて返った古い結果で上書きしない
	const webgpuRequest = useRef(0);

	const collectWebGPU = useCallback(async (preference: PowerPreference) => {
		const request = ++webgpuRequest.current;
		setWebgpuStatus("checking");
		setWebgpuError(null);
		const result = await collectWebGPUReport(preference, webgpuLimitNames);
		if (request !== webgpuRequest.current) return;
		setWebgpuReport(result.status === "ready" ? result.report : null);
		setWebgpuError(result.status === "error" ? result.message : null);
		setWebgpuStatus(result.status);
	}, []);

	useEffect(() => {
		let cancelled = false;
		setUserAgent(navigator.userAgent);
		resolveReportEnvironment(navigator).then((result) => {
			if (!cancelled) setEnvironment(result);
		});
		setCheckedAt(new Date());
		checkWebXRSupport((id, support) => {
			if (!cancelled) {
				setWebxrResults((previous) => ({ ...previous, [id]: support }));
			}
		});
		collectWebGPU("high-performance");
		return () => {
			cancelled = true;
		};
	}, [collectWebGPU]);

	const switchPower = useCallback(
		(next: PowerPreference) => {
			setPower(next);
			collectWebGPU(next);
		},
		[collectWebGPU],
	);

	const summary = useMemo(
		() =>
			buildReportSummary({
				environment,
				// 判定前（サーバー描画を含む）は日付を使わない。ready になるのは判定後だけ
				date: checkedAt ?? new Date(0),
				specs: webxrSpecCatalog,
				webxr: webxrResults,
				webgpuStatus,
				webgpuReport,
				webgpuFeatureNames,
				webgpuLimits: webgpuLimitCatalog,
			}),
		[environment, checkedAt, webxrResults, webgpuStatus, webgpuReport],
	);

	const value = useMemo<ReportContextValue>(
		() => ({
			userAgent,
			environment,
			webxr: {
				results: webxrResults,
				loaded: Object.keys(webxrResults).length === webxrSpecCatalog.length,
			},
			webgpu: {
				status: webgpuStatus,
				report: webgpuReport,
				errorMessage: webgpuError,
				power,
				switchPower,
			},
			summary,
		}),
		[
			userAgent,
			environment,
			webxrResults,
			webgpuStatus,
			webgpuReport,
			webgpuError,
			power,
			switchPower,
			summary,
		],
	);

	return (
		<ReportContext.Provider value={value}>{children}</ReportContext.Provider>
	);
}

export function useReport(): ReportContextValue {
	const value = useContext(ReportContext);
	if (!value) {
		throw new Error("useReport は ReportProvider の内側で呼び出してください");
	}
	return value;
}
