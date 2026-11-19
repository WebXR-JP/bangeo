/**
 * この端末の WebGPU アダプター情報を集める。
 *
 * レポート上部の結果画像と /webgpu-report の一覧が同じ結果を使うので、
 * 取得はここに一本化し、表示側では navigator.gpu を直接呼ばない。
 */
export type PowerPreference = "high-performance" | "low-power";

export interface AdapterInfoLike {
	vendor?: string;
	architecture?: string;
	device?: string;
	description?: string;
	subgroupMinSize?: number;
	subgroupMaxSize?: number;
	isFallbackAdapter?: boolean;
}

interface AdapterLike {
	features: Iterable<string>;
	limits: Record<string, unknown>;
	info?: AdapterInfoLike;
	isFallbackAdapter?: boolean;
	requestAdapterInfo?: () => Promise<AdapterInfoLike>;
}

interface GPULike {
	requestAdapter(options?: {
		powerPreference?: PowerPreference;
	}): Promise<AdapterLike | null>;
	getPreferredCanvasFormat?: () => string;
	wgslLanguageFeatures?: Iterable<string>;
}

export interface WebGPUReportData {
	info: AdapterInfoLike;
	isFallbackAdapter: boolean;
	features: string[];
	limits: Record<string, number>;
	preferredCanvasFormat: string | null;
	wgslFeatures: string[];
}

export type WebGPUStatus = "checking" | "ready" | "unsupported" | "error";

export type WebGPUCollectResult =
	| { status: "ready"; report: WebGPUReportData }
	| { status: "unsupported" }
	| { status: "error"; message: string };

function getGPU(): GPULike | null {
	if (typeof navigator === "undefined") return null;
	return (navigator as Navigator & { gpu?: GPULike }).gpu ?? null;
}

/** GPU名の表示用。ブラウザが伏せているときは null を返し、呼び出し側で「非公開」と出す */
export function adapterDisplayName(info: AdapterInfoLike): string | null {
	const name = [info.vendor, info.architecture].filter(Boolean).join(" / ");
	return name || info.description || null;
}

/**
 * @param limitNames 読み取る limit 名（カタログの名前）。アダプターが数値で返したものだけを残す
 * @param timeoutMs requestAdapter が返らない環境で、レポート全体を待たせないための上限
 */
export async function collectWebGPUReport(
	powerPreference: PowerPreference,
	limitNames: readonly string[],
	timeoutMs = 8000,
): Promise<WebGPUCollectResult> {
	const gpu = getGPU();
	if (!gpu) return { status: "unsupported" };

	let timer: ReturnType<typeof setTimeout> | undefined;
	try {
		const adapter = await Promise.race([
			gpu.requestAdapter({ powerPreference }),
			new Promise<"timeout">((resolve) => {
				timer = setTimeout(() => resolve("timeout"), timeoutMs);
			}),
		]);
		if (adapter === "timeout") {
			return {
				status: "error",
				message:
					"GPUアダプターの取得が時間内に終わりませんでした。ページを再読み込みするか、ブラウザを再起動してお試しください。",
			};
		}
		if (!adapter) {
			return {
				status: "error",
				message:
					"navigator.gpu はありますが、使えるGPUアダプターを取得できませんでした。ドライバーの制限や、ブラウザ側でGPUが拒否リストに入っている可能性があります。",
			};
		}

		let info: AdapterInfoLike = adapter.info ?? {};
		if (!adapter.info && adapter.requestAdapterInfo) {
			try {
				info = await adapter.requestAdapterInfo();
			} catch {
				info = {};
			}
		}

		const limits: Record<string, number> = {};
		for (const name of limitNames) {
			const value = adapter.limits[name];
			if (typeof value === "number") limits[name] = value;
		}

		return {
			status: "ready",
			report: {
				info,
				isFallbackAdapter: Boolean(
					adapter.isFallbackAdapter ?? info.isFallbackAdapter,
				),
				features: [...adapter.features].sort(),
				limits,
				preferredCanvasFormat: gpu.getPreferredCanvasFormat?.() ?? null,
				wgslFeatures: gpu.wgslLanguageFeatures
					? [...gpu.wgslLanguageFeatures].sort()
					: [],
			},
		};
	} catch (error) {
		return {
			status: "error",
			message:
				error instanceof Error
					? `GPU情報の取得に失敗しました: ${error.message}`
					: "GPU情報の取得に失敗しました。",
		};
	} finally {
		clearTimeout(timer);
	}
}
