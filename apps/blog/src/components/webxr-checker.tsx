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
			{supported ? "\u3007" : "\u2014"} {text}
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
				デモ準備中
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
					name: "WebXR Device API (core)",
					check: () => xr != null,
				},
				{
					id: "webxr-gamepads",
					name: "WebXR Gamepads",
					check: () => typeof win.XRInputSource !== "undefined",
				},
				{
					id: "webxr-ar",
					name: "WebXR Augmented Reality",
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
					name: "WebXR Hit Test",
					check: () => typeof win.XRHitTestSource !== "undefined",
				},
				{
					id: "webxr-dom-overlays",
					name: "WebXR DOM Overlays",
					check: () => xr != null,
				},
				{
					id: "webxr-layers",
					name: "WebXR Layers",
					check: () =>
						typeof win.XRWebGLLayer !== "undefined" &&
						typeof win.XRMediaBinding !== "undefined",
				},
				{
					id: "webxr-anchors",
					name: "WebXR Anchors",
					check: () => typeof win.XRAnchor !== "undefined",
				},
				{
					id: "webxr-lighting-estimation",
					name: "WebXR Lighting Estimation",
					check: () => typeof win.XRLightEstimate !== "undefined",
				},
				{
					id: "webxr-hand-input",
					name: "WebXR Hand Input",
					check: () => typeof win.XRHand !== "undefined",
				},
				{
					id: "webxr-body-tracking",
					name: "WebXR Body Tracking (proposal)",
					check: () =>
						(typeof win.XRFrame !== "undefined" &&
							"body" in win.XRFrame.prototype) ||
						typeof win.XRBody !== "undefined",
				},
				{
					id: "webxr-webgpu-bindings",
					name: "WebXR/WebGPU bindings",
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

			// Check session modes
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
			{/* WebXR基本対応チェック */}
			<div className="bg-white border-2 border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-xs">
				{loading ? (
					<div className="flex items-center justify-center p-12">
						<div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-200 border-t-gray-900" />
					</div>
				) : (
					<div className="flex items-center justify-center gap-4 p-8">
						<div>
							<p
								className={`text-2xl font-black ${hasWebXR ? "text-gray-950" : "text-gray-400"}`}
							>
								WebXR {hasWebXR ? "対応" : "非対応"}
							</p>
							<p className="text-gray-400 text-sm">
								{hasWebXR
									? "お使いのブラウザはWebXRをサポートしています"
									: "お使いのブラウザはWebXRをサポートしていません"}
							</p>
						</div>
					</div>
				)}
			</div>

			{/* WebXRモジュール対応状況 */}
			{!loading && (
				<div className="bg-white border-2 border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-xs space-y-6">
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-gray-800">
							WebXR モジュール
						</h2>
						<p className="text-gray-500 text-sm">
							WebXRの各機能は仕様上「モジュール」として分割されています。ここで「対応」と表示されても、ハードウェアが機能を公開していない場合は利用できないことがあります。
						</p>
						<p className="text-gray-400 text-xs leading-relaxed">
							Body Tracking は提案段階の API です。ここでは{" "}
							<code className="bg-gray-100 px-1.5 py-0.5 rounded">
								XRFrame.body
							</code>{" "}
							または{" "}
							<code className="bg-gray-100 px-1.5 py-0.5 rounded">XRBody</code>{" "}
							の実装有無を確認します。実際に利用するには、セッション側で{" "}
							<code className="bg-gray-100 px-1.5 py-0.5 rounded">
								body-tracking
							</code>{" "}
							feature descriptor が許可される必要があります。
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

			{/* セッションモード */}
			{!loading && (
				<div className="bg-white border-2 border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-xs space-y-6">
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-gray-800">
							セッションモード
						</h2>
						<p className="text-gray-500 text-sm">
							セッションモードはWebXRセッションの種類を決定します。ブラウザとハードウェアの両方がサポートしている場合のみ利用可能と表示されます。
						</p>
					</div>
					<div className="space-y-3">
						{sessions.map((s) => (
							<div
								key={s.id}
								className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between"
							>
								<div className="flex items-center gap-3">
									<span className="text-sm font-bold text-gray-700">
										{s.name}
									</span>
								</div>
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
											セッション開始
										</button>
									)}
								</div>
							</div>
						))}
					</div>

					{/* セッションモードの説明 */}
					<div className="mt-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
						<div className="flex items-start gap-3">
							<div className="space-y-2">
								<p className="font-bold text-gray-800">
									「inline」だけが利用可能な場合
								</p>
								<p className="text-gray-600 text-sm leading-relaxed">
									<code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
										inline
									</code>{" "}
									セッションはブラウザ内で3Dコンテンツを表示するモードで、
									<strong>VR/AR体験ではありません</strong>。 本格的なVR/AR体験（
									<code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
										immersive-vr
									</code>
									,{" "}
									<code className="bg-gray-200 px-1.5 py-0.5 rounded text-xs">
										immersive-ar
									</code>
									）には、VRヘッドセットやAR対応デバイスの接続が必要です。
								</p>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* XRセッションビューアー */}
			{(sessionActive || sessionError) && (
				<div className="bg-white border-2 border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-xs space-y-6">
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-gray-800">XRセッション</h2>
						<p className="text-gray-500 text-sm">
							アクティブなXRセッションの情報がここに表示されます。
						</p>
					</div>
					{sessionActive && (
						<div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
							<p className="text-gray-900 font-bold">
								{sessionActive} セッションがアクティブです
							</p>
						</div>
					)}
					{sessionError && (
						<div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
							<p className="text-gray-400 font-bold">
								セッションの開始に失敗しました
							</p>
							<p className="text-gray-400 text-sm mt-2">{sessionError}</p>
						</div>
					)}
				</div>
			)}

			{/* ブラウザ情報 */}
			{!loading && (
				<div className="bg-white border-2 border-gray-100 rounded-[3rem] p-8 md:p-12 shadow-xs space-y-6">
					<div className="space-y-2">
						<h2 className="text-2xl font-black text-gray-800">ブラウザ情報</h2>
					</div>
					<div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
						<p className="text-xs font-mono break-all text-gray-400 leading-relaxed">
							{userAgent}
						</p>
					</div>
				</div>
			)}
		</>
	);
}
