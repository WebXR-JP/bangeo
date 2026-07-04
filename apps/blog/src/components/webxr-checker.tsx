"use client";

import { useEffect, useState } from "react";

interface ModuleResult {
	id: WebXRModuleId;
	name: string;
	supported: boolean;
}

export type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";

export type WebXRModuleId =
	| "webxr-core"
	| "webxr-gamepads"
	| "webxr-ar"
	| "webxr-hit-test"
	| "webxr-dom-overlays"
	| "webxr-layers"
	| "webxr-anchors"
	| "webxr-lighting-estimation"
	| "webxr-hand-input"
	| "webxr-body-tracking"
	| "webxr-webgpu-bindings";

interface SessionResult {
	id: XRSessionMode;
	name: string;
	available: boolean;
}

export interface WebXRCheckerDemoLink {
	href?: string;
	label?: string;
	note?: string;
}

export type WebXRCheckerDemoLinks = Partial<
	Record<XRSessionMode | WebXRModuleId, WebXRCheckerDemoLink>
>;

type MinimalXRSession = EventTarget;

interface MinimalXRSystem {
	isSessionSupported(mode: XRSessionMode): Promise<boolean>;
	requestSession(mode: XRSessionMode): Promise<MinimalXRSession>;
}

type NavigatorWithXR = Navigator & { xr?: MinimalXRSystem };

type XRWindow = Window &
	typeof globalThis & {
		XRInputSource?: unknown;
		XRHitTestSource?: unknown;
		XRWebGLLayer?: unknown;
		XRMediaBinding?: unknown;
		XRAnchor?: unknown;
		XRLightEstimate?: unknown;
		XRHand?: unknown;
		XRFrame?: { prototype: object };
		XRBody?: unknown;
		XRGPUBinding?: unknown;
	};

const nav =
	typeof navigator !== "undefined" ? (navigator as NavigatorWithXR) : null;

function getXR() {
	return nav?.xr ?? null;
}

function Badge({ supported, text }: { supported: boolean; text: string }) {
	return (
		<span
			className={`px-3 py-1 rounded-full text-xs font-bold ${
				supported ? "bg-gray-100 text-gray-950" : "bg-gray-50 text-gray-400"
			}`}
		>
			{supported ? "○" : "—"} {text}
		</span>
	);
}

function DemoLink({ demo }: { demo?: WebXRCheckerDemoLink }) {
	if (!demo?.href) {
		return (
			<span
				className="inline-flex min-h-9 items-center justify-center rounded-full border border-dashed border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-black text-gray-400"
				aria-disabled="true"
				title={demo?.note}
			>
				近日公開
			</span>
		);
	}

	return (
		<a
			href={demo.href}
			className="inline-flex min-h-9 items-center justify-center rounded-full bg-gray-950 px-3 py-1.5 text-xs font-black text-white transition-colors hover:bg-[#e11d48]"
			title={demo.note}
		>
			{demo.label ?? "デモ"} ↗
		</a>
	);
}

interface WebXRCheckerProps {
	demoLinks?: WebXRCheckerDemoLinks;
	showDemoLinks?: boolean;
}

export function WebXRChecker({
	demoLinks,
	showDemoLinks = false,
}: WebXRCheckerProps = {}) {
	const [loading, setLoading] = useState(true);
	const [hasWebXR, setHasWebXR] = useState(false);
	const [modules, setModules] = useState<ModuleResult[]>([]);
	const [sessions, setSessions] = useState<SessionResult[]>([]);
	const [userAgent, setUserAgent] = useState("");
	const [sessionActive, setSessionActive] = useState<string | null>(null);
	const [sessionError, setSessionError] = useState<string | null>(null);

	useEffect(() => {
		async function init() {
			const xr = getXR();
			const xrSupported = xr != null;
			setHasWebXR(xrSupported);
			setUserAgent(navigator.userAgent);

			const win = window as XRWindow;

			const moduleChecks: {
				id: WebXRModuleId;
				name: string;
				check: () => boolean | Promise<boolean>;
			}[] = [
				{
					id: "webxr-core",
					name: "WebXR基本機能",
					check: () => xr != null,
				},
				{
					id: "webxr-gamepads",
					name: "コントローラー入力",
					check: () => typeof win.XRInputSource !== "undefined",
				},
				{
					id: "webxr-ar",
					name: "AR表示",
					check: async () => {
						if (!xr) return false;
						try {
							return await xr.isSessionSupported("immersive-ar");
						} catch {
							return false;
						}
					},
				},
				{
					id: "webxr-hit-test",
					name: "床・机などの面検出",
					check: () => typeof win.XRHitTestSource !== "undefined",
				},
				{
					id: "webxr-dom-overlays",
					name: "AR中の画面UI表示",
					check: () => xr != null,
				},
				{
					id: "webxr-layers",
					name: "高品質なレイヤー表示",
					check: () =>
						typeof win.XRWebGLLayer !== "undefined" &&
						typeof win.XRMediaBinding !== "undefined",
				},
				{
					id: "webxr-anchors",
					name: "空間アンカー",
					check: () => typeof win.XRAnchor !== "undefined",
				},
				{
					id: "webxr-lighting-estimation",
					name: "照明推定",
					check: () => typeof win.XRLightEstimate !== "undefined",
				},
				{
					id: "webxr-hand-input",
					name: "ハンドトラッキング",
					check: () => typeof win.XRHand !== "undefined",
				},
				{
					id: "webxr-body-tracking",
					name: "ボディトラッキング",
					check: () =>
						(typeof win.XRFrame !== "undefined" &&
							"body" in win.XRFrame.prototype) ||
						typeof win.XRBody !== "undefined",
				},
				{
					id: "webxr-webgpu-bindings",
					name: "WebGPU連携",
					check: () => typeof win.XRGPUBinding !== "undefined",
				},
			];

			const moduleResults: ModuleResult[] = [];
			for (const mod of moduleChecks) {
				let supported = false;
				try {
					const result = mod.check();
					supported = result instanceof Promise ? await result : result;
				} catch {
					supported = false;
				}
				moduleResults.push({ id: mod.id, name: mod.name, supported });
			}
			setModules(moduleResults);

			const sessionModes: XRSessionMode[] = [
				"inline",
				"immersive-vr",
				"immersive-ar",
			];
			const sessionResults: SessionResult[] = [];
			for (const mode of sessionModes) {
				let available = false;
				try {
					if (xr) {
						available = await xr.isSessionSupported(mode);
					}
				} catch {
					available = false;
				}
				sessionResults.push({ id: mode, name: mode, available });
			}
			setSessions(sessionResults);

			setLoading(false);
		}

		init();
	}, []);

	async function startSession(mode: XRSessionMode) {
		const xr = getXR();
		if (!xr) return;
		try {
			const session = await xr.requestSession(mode);
			setSessionActive(mode);
			setSessionError(null);
			session.addEventListener("end", () => {
				setSessionActive(null);
			});
		} catch (err) {
			setSessionError(err instanceof Error ? err.message : "Unknown error");
		}
	}

	return (
		<>
			<div className="rounded-[3rem] border-2 border-gray-100 bg-white p-8 shadow-xs md:p-12">
				{loading ? (
					<div className="flex items-center justify-center p-12">
						<div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-gray-900" />
					</div>
				) : (
					<div className="flex items-center justify-center gap-4 p-8 text-center">
						<div>
							<p
								className={`text-2xl font-black ${hasWebXR ? "text-gray-950" : "text-gray-400"}`}
							>
								WebXR {hasWebXR ? "利用できます" : "利用できません"}
							</p>
							<p className="text-sm text-gray-400">
								{hasWebXR
									? "このブラウザではWebXRを利用できます。"
									: "現在のブラウザではWebXRを利用できません。対応ヘッドセットのブラウザやAndroid Chromeなどでお試しください。"}
							</p>
						</div>
					</div>
				)}
			</div>

			{!loading && (
				<div className="space-y-6 rounded-[3rem] border-2 border-gray-100 bg-white p-8 shadow-xs md:p-12">
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-gray-800">
							このブラウザで使える機能
						</h2>
						<p className="text-sm text-gray-500">
							主なWebXR機能の対応状況です。対応している項目は、横のデモから実際の見え方や操作感を確認できます。
						</p>
						<p className="text-xs leading-relaxed text-gray-400">
							一部の機能は端末やブラウザの設定によって利用可否が変わります。対応表示が出た場合も、最終的には各デモでの体験確認をおすすめします。
						</p>
					</div>
					<div className="space-y-3">
						{modules.map((mod) => (
							<div
								key={mod.id}
								className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
							>
								<span className="text-sm font-bold text-gray-700">
									{mod.name}
								</span>
								<div className="flex flex-wrap items-center gap-2">
									<Badge
										supported={mod.supported}
										text={mod.supported ? "対応" : "未対応"}
									/>
									{showDemoLinks && <DemoLink demo={demoLinks?.[mod.id]} />}
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{!loading && (
				<div className="space-y-6 rounded-[3rem] border-2 border-gray-100 bg-white p-8 shadow-xs md:p-12">
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-gray-800">
							VR / ARの開始可否
						</h2>
						<p className="text-sm text-gray-500">
							現在のブラウザと端末で、ブラウザ内表示・VR表示・AR表示を開始できるかを確認します。
						</p>
					</div>
					<div className="space-y-3">
						{sessions.map((s) => (
							<div
								key={s.id}
								className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
							>
								<span className="text-sm font-bold text-gray-700">
									{s.name}
								</span>
								<div className="flex flex-wrap items-center gap-2">
									<Badge
										supported={s.available}
										text={s.available ? "利用可" : "未対応"}
									/>
									{showDemoLinks && <DemoLink demo={demoLinks?.[s.id]} />}
									{s.available && (
										<button
											type="button"
											onClick={() => startSession(s.id)}
											className="rounded-full bg-gray-950 px-5 py-2 text-sm font-bold text-white shadow-xs transition-colors hover:bg-[#e11d48]"
										>
											開始を試す
										</button>
									)}
								</div>
							</div>
						))}
					</div>

					<div className="mt-8 rounded-2xl border border-gray-100 bg-gray-50 p-6">
						<p className="font-bold text-gray-800">
							「inline」だけが利用できる場合
						</p>
						<p className="mt-2 text-sm leading-relaxed text-gray-600">
							<code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">
								inline
							</code>{" "}
							はブラウザ内で3Dコンテンツを表示するモードです。ヘッドセットでのVRや、カメラを使ったARを開始するには、
							<code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">
								immersive-vr
							</code>
							、
							<code className="rounded bg-gray-200 px-1.5 py-0.5 text-xs">
								immersive-ar
							</code>
							に対応するデバイスとブラウザが必要です。
						</p>
					</div>
				</div>
			)}

			{(sessionActive || sessionError) && (
				<div className="space-y-6 rounded-[3rem] border-2 border-gray-100 bg-white p-8 shadow-xs md:p-12">
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-gray-800">確認結果</h2>
						<p className="text-sm text-gray-500">
							セッション開始の結果がここに表示されます。
						</p>
					</div>
					{sessionActive && (
						<div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
							<p className="font-bold text-gray-900">
								{sessionActive} を開始しました
							</p>
						</div>
					)}
					{sessionError && (
						<div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
							<p className="font-bold text-gray-500">開始できませんでした</p>
							<p className="mt-2 text-sm text-gray-400">{sessionError}</p>
						</div>
					)}
				</div>
			)}

			{!loading && (
				<details className="rounded-[2rem] border border-gray-100 bg-white p-5 text-sm text-gray-500 shadow-xs">
					<summary className="cursor-pointer font-black text-gray-700">
						ブラウザ情報を表示
					</summary>
					<p className="mt-4 break-all rounded-2xl bg-gray-50 p-4 font-mono text-xs leading-relaxed text-gray-400">
						{userAgent}
					</p>
				</details>
			)}
		</>
	);
}
