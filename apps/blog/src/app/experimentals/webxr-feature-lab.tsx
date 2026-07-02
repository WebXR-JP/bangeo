"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";
type SupportLevel = "checking" | "supported" | "partial" | "unsupported";

interface MinimalXRSystem {
	isSessionSupported(mode: XRSessionMode): Promise<boolean>;
}

type NavigatorWithXR = Navigator & { xr?: MinimalXRSystem };

type XRWindow = Window &
	typeof globalThis & {
		XRAnchor?: unknown;
		XRCPUDepthInformation?: unknown;
		XRDepthInformation?: unknown;
		XRGPUBinding?: unknown;
		XRHand?: unknown;
		XRHitTestSource?: unknown;
		XRInputSource?: unknown;
		XRLightEstimate?: unknown;
		XRMediaBinding?: unknown;
		XRWebGLDepthInformation?: unknown;
		XRWebGLLayer?: unknown;
	};

interface SupportSnapshot {
	checked: boolean;
	hasWebXR: boolean;
	isSecureContext: boolean;
	userAgent: string;
	sessions: Record<XRSessionMode, boolean>;
	modules: {
		anchors: boolean;
		depth: boolean;
		gamepads: boolean;
		hand: boolean;
		hitTest: boolean;
		layers: boolean;
		lighting: boolean;
		webgpuBinding: boolean;
	};
}

interface FeatureDefinition {
	id: string;
	title: string;
	modeLabel: string;
	description: string;
	demoLabel: string;
	demoHref?: string;
	evaluate(snapshot: SupportSnapshot): SupportLevel;
	note(snapshot: SupportSnapshot): string;
}

const emptySessions: Record<XRSessionMode, boolean> = {
	inline: false,
	"immersive-vr": false,
	"immersive-ar": false,
};

const initialSnapshot: SupportSnapshot = {
	checked: false,
	hasWebXR: false,
	isSecureContext: false,
	userAgent: "",
	sessions: emptySessions,
	modules: {
		anchors: false,
		depth: false,
		gamepads: false,
		hand: false,
		hitTest: false,
		layers: false,
		lighting: false,
		webgpuBinding: false,
	},
};

const features: FeatureDefinition[] = [
	{
		id: "inline",
		title: "Inline / 通常表示",
		modeLabel: "inline",
		description:
			"Webページ内で3Dプレビューを表示する入口。非XR環境でも体験の説明やプレビューを置きやすい場所です。",
		demoLabel: "Inline Demo",
		evaluate: (snapshot) =>
			snapshot.hasWebXR || snapshot.sessions.inline ? "supported" : "unsupported",
		note: (snapshot) =>
			snapshot.hasWebXR
				? "WebXR API を検出しました。通常表示のプレビュー入口として使えます。"
				: "WebXR API を検出できませんでした。通常のWebページとして説明や動画を置く想定です。",
	},
	{
		id: "immersive-vr",
		title: "VRセッション",
		modeLabel: "immersive-vr",
		description:
			"Meta Quest / PICO / PCVR で全画面のVR空間に入るための基本モードです。",
		demoLabel: "VR Demo",
		evaluate: (snapshot) =>
			snapshot.sessions["immersive-vr"]
				? "supported"
				: snapshot.hasWebXR
					? "partial"
					: "unsupported",
		note: (snapshot) =>
			snapshot.sessions["immersive-vr"]
				? "このブラウザは immersive-vr をサポートしています。"
				: snapshot.hasWebXR
					? "WebXR API はありますが、immersive-vr は今の環境では有効ではありません。"
					: "WebXR API がありません。VRヘッドセット内蔵ブラウザやPCVR接続で開いてください。",
	},
	{
		id: "immersive-ar",
		title: "ARセッション",
		modeLabel: "immersive-ar",
		description:
			"カメラ映像やパススルー上に3Dを重ねるAR/MR系デモの入口です。",
		demoLabel: "AR Demo",
		evaluate: (snapshot) =>
			snapshot.sessions["immersive-ar"]
				? "supported"
				: snapshot.hasWebXR
					? "partial"
					: "unsupported",
		note: (snapshot) =>
			snapshot.sessions["immersive-ar"]
				? "このブラウザは immersive-ar をサポートしています。"
				: snapshot.hasWebXR
					? "WebXR API はありますが、ARセッションは今の環境では有効ではありません。"
					: "WebXR API がありません。Android Chrome や対応ヘッドセットで開いてください。",
	},
	{
		id: "hand-tracking",
		title: "Hand Tracking",
		modeLabel: "hand-tracking",
		description:
			"手の関節情報を使った操作デモの入口。Quest系では体験の差が出やすい項目です。",
		demoLabel: "Hand Demo",
		evaluate: (snapshot) => {
			if (snapshot.modules.hand && snapshot.sessions["immersive-vr"]) {
				return "supported";
			}
			return snapshot.sessions["immersive-vr"] ? "partial" : "unsupported";
		},
		note: (snapshot) =>
			snapshot.modules.hand
				? "XRHand を検出しました。実際の許可はデモ起動時に確認します。"
				: "VRセッションが使えても、Hand Tracking API が公開されていない場合があります。",
	},
	{
		id: "hit-test",
		title: "AR Hit Test",
		modeLabel: "hit-test",
		description:
			"床や机を検出して、3Dオブジェクトを現実空間に置くARデモの基本機能です。",
		demoLabel: "Hit Test Demo",
		evaluate: (snapshot) => {
			if (snapshot.modules.hitTest && snapshot.sessions["immersive-ar"]) {
				return "supported";
			}
			return snapshot.sessions["immersive-ar"] ? "partial" : "unsupported";
		},
		note: (snapshot) =>
			snapshot.modules.hitTest
				? "XRHitTestSource を検出しました。ARデモ側で hit-test feature を要求します。"
				: "ARセッションが使えても、Hit Test がブラウザから公開されていない場合があります。",
	},
	{
		id: "anchors",
		title: "Anchors / 空間固定",
		modeLabel: "anchors",
		description:
			"現実空間の位置にオブジェクトを固定するデモ向け。永続化は端末・ブラウザ依存です。",
		demoLabel: "Anchor Demo",
		evaluate: (snapshot) => {
			if (snapshot.modules.anchors && snapshot.sessions["immersive-ar"]) {
				return "supported";
			}
			return snapshot.sessions["immersive-ar"] ? "partial" : "unsupported";
		},
		note: (snapshot) =>
			snapshot.modules.anchors
				? "XRAnchor を検出しました。保存可否はデモ側で追加確認します。"
				: "Anchors は未検出です。ARだけ対応している環境でも使えないことがあります。",
	},
	{
		id: "layers",
		title: "Layers / 高品質描画",
		modeLabel: "layers",
		description:
			"動画・UI・高解像度パネルなどをXR空間で扱うための描画系モジュールです。",
		demoLabel: "Layers Demo",
		evaluate: (snapshot) =>
			snapshot.modules.layers
				? "supported"
				: snapshot.hasWebXR
					? "partial"
					: "unsupported",
		note: (snapshot) =>
			snapshot.modules.layers
				? "XRWebGLLayer と XRMediaBinding を検出しました。"
				: "WebXR本体とは別に Layers API の実装が必要です。",
	},
	{
		id: "depth-lighting",
		title: "Depth / Lighting",
		modeLabel: "depth + lighting",
		description:
			"現実空間との隠蔽や光推定を使うMR表現の入口。実機差がかなり出る領域です。",
		demoLabel: "MR Demo",
		evaluate: (snapshot) => {
			if (
				snapshot.sessions["immersive-ar"] &&
				(snapshot.modules.depth || snapshot.modules.lighting)
			) {
				return "supported";
			}
			return snapshot.sessions["immersive-ar"] ? "partial" : "unsupported";
		},
		note: (snapshot) =>
			(snapshot.modules.depth ? "Depth" : "") +
			(snapshot.modules.depth && snapshot.modules.lighting ? " / " : "") +
			(snapshot.modules.lighting ? "Lighting" : "") ||
			"Depth / Lighting は未検出です。対応端末でもブラウザ設定や権限に左右されます。",
	},
	{
		id: "webgpu-binding",
		title: "WebGPU + WebXR",
		modeLabel: "webgpu xr",
		description:
			"WebGPUレンダリングとXRを組み合わせる実験枠。現時点では検証用スロットとして扱います。",
		demoLabel: "WebGPU Demo",
		evaluate: (snapshot) =>
			snapshot.modules.webgpuBinding
				? "supported"
				: snapshot.hasWebXR
					? "partial"
					: "unsupported",
		note: (snapshot) =>
			snapshot.modules.webgpuBinding
				? "XRGPUBinding を検出しました。"
				: "XRGPUBinding は未検出です。WebGL fallback のデモ枠として使います。",
	},
];

const statusMeta: Record<
	SupportLevel,
	{ label: string; className: string; dotClassName: string }
> = {
	checking: {
		label: "判定中",
		className: "border-gray-200 bg-gray-50 text-gray-500",
		dotClassName: "bg-gray-300",
	},
	supported: {
		label: "対応",
		className: "border-emerald-200 bg-emerald-50 text-emerald-700",
		dotClassName: "bg-emerald-500",
	},
	partial: {
		label: "条件付き",
		className: "border-amber-200 bg-amber-50 text-amber-700",
		dotClassName: "bg-amber-500",
	},
	unsupported: {
		label: "未対応",
		className: "border-gray-200 bg-gray-50 text-gray-400",
		dotClassName: "bg-gray-300",
	},
};

function getXR() {
	if (typeof navigator === "undefined") return null;
	return (navigator as NavigatorWithXR).xr ?? null;
}

async function checkSession(
	xr: MinimalXRSystem | null,
	mode: XRSessionMode,
): Promise<boolean> {
	if (!xr) return false;
	try {
		return await xr.isSessionSupported(mode);
	} catch {
		return false;
	}
}

function StatusBadge({ level }: { level: SupportLevel }) {
	const meta = statusMeta[level];
	return (
		<span
			className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-black ${meta.className}`}
		>
			<span className={`h-2 w-2 rounded-full ${meta.dotClassName}`} />
			{meta.label}
		</span>
	);
}

function DemoButton({ feature }: { feature: FeatureDefinition }) {
	if (feature.demoHref) {
		return (
			<Link
				href={feature.demoHref}
				className="inline-flex shrink-0 items-center justify-center rounded-full bg-gray-950 px-4 py-2 text-xs font-black text-white transition hover:bg-[#e11d48]"
			>
				{feature.demoLabel} ↗
			</Link>
		);
	}

	return (
		<span className="inline-flex shrink-0 items-center justify-center rounded-full border border-dashed border-rose-200 bg-rose-50 px-4 py-2 text-xs font-black text-rose-500">
			Demo 準備中
		</span>
	);
}

export function ExperimentalFeatureLab() {
	const [snapshot, setSnapshot] = useState<SupportSnapshot>(initialSnapshot);

	useEffect(() => {
		async function runChecks() {
			const xr = getXR();
			const win = window as XRWindow;
			const sessions: Record<XRSessionMode, boolean> = {
				inline: await checkSession(xr, "inline"),
				"immersive-vr": await checkSession(xr, "immersive-vr"),
				"immersive-ar": await checkSession(xr, "immersive-ar"),
			};

			setSnapshot({
				checked: true,
				hasWebXR: xr != null,
				isSecureContext: window.isSecureContext,
				userAgent: navigator.userAgent,
				sessions,
				modules: {
					anchors: typeof win.XRAnchor !== "undefined",
					depth:
						typeof win.XRDepthInformation !== "undefined" ||
						typeof win.XRCPUDepthInformation !== "undefined" ||
						typeof win.XRWebGLDepthInformation !== "undefined",
					gamepads: typeof win.XRInputSource !== "undefined",
					hand: typeof win.XRHand !== "undefined",
					hitTest: typeof win.XRHitTestSource !== "undefined",
					layers:
						typeof win.XRWebGLLayer !== "undefined" &&
						typeof win.XRMediaBinding !== "undefined",
					lighting: typeof win.XRLightEstimate !== "undefined",
					webgpuBinding: typeof win.XRGPUBinding !== "undefined",
				},
			});
		}

		runChecks();
	}, []);

	const evaluatedFeatures = useMemo(
		() =>
			features.map((feature) => ({
				feature,
				level: snapshot.checked ? feature.evaluate(snapshot) : "checking",
				note: snapshot.checked ? feature.note(snapshot) : "判定しています。",
			})),
		[snapshot],
	);

	const supportedCount = evaluatedFeatures.filter(
		(item) => item.level === "supported",
	).length;
	const partialCount = evaluatedFeatures.filter(
		(item) => item.level === "partial",
	).length;

	return (
		<section id="feature-lab" className="space-y-6 scroll-mt-28">
			<div className="rounded-[2rem] border border-gray-100 bg-gray-950 p-6 text-white shadow-xl shadow-gray-200/70 md:p-8">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-xs font-black tracking-[0.26em] text-rose-200 uppercase">
							Live device map
						</p>
						<h2 className="mt-3 text-2xl font-black tracking-tight md:text-3xl">
							この端末で動きそうなWebXR機能
						</h2>
						<p className="mt-3 max-w-2xl text-sm font-medium leading-relaxed text-gray-300">
							ここは `/devices/submit` の診断を、デモの入口として使いやすく整理した場所です。判定の右側にデモ枠を置いて、将来的にはそのまま体験へ進めるようにします。
						</p>
					</div>
					<div className="grid min-w-64 grid-cols-3 gap-2 text-center">
						<div className="rounded-2xl border border-white/10 bg-white/10 p-3">
							<p className="text-2xl font-black">{supportedCount}</p>
							<p className="text-[10px] font-black tracking-[0.16em] text-gray-300 uppercase">
								対応
							</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/10 p-3">
							<p className="text-2xl font-black">{partialCount}</p>
							<p className="text-[10px] font-black tracking-[0.16em] text-gray-300 uppercase">
								条件付き
							</p>
						</div>
						<div className="rounded-2xl border border-white/10 bg-white/10 p-3">
							<p className="text-2xl font-black">
								{snapshot.hasWebXR ? "OK" : "—"}
							</p>
							<p className="text-[10px] font-black tracking-[0.16em] text-gray-300 uppercase">
								WebXR
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="grid gap-3 md:grid-cols-3">
				<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
					<p className="text-xs font-black tracking-[0.18em] text-gray-400 uppercase">
						Context
					</p>
					<p className="mt-2 text-sm font-black text-gray-950">
						{snapshot.isSecureContext ? "Secure Context" : "Not Secure"}
					</p>
					<p className="mt-1 text-xs font-medium text-gray-500">
						WebXRはHTTPSなどの安全なコンテキストで動きます。
					</p>
				</div>
				<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
					<p className="text-xs font-black tracking-[0.18em] text-gray-400 uppercase">
						VR Session
					</p>
					<p className="mt-2 text-sm font-black text-gray-950">
						{snapshot.sessions["immersive-vr"] ? "available" : "not available"}
					</p>
					<p className="mt-1 text-xs font-medium text-gray-500">
						Quest / PICO / PCVR 向けの基本入口です。
					</p>
				</div>
				<div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-xs">
					<p className="text-xs font-black tracking-[0.18em] text-gray-400 uppercase">
						AR Session
					</p>
					<p className="mt-2 text-sm font-black text-gray-950">
						{snapshot.sessions["immersive-ar"] ? "available" : "not available"}
					</p>
					<p className="mt-1 text-xs font-medium text-gray-500">
						Android AR / パススルーMR 向けの入口です。
					</p>
				</div>
			</div>

			<div className="overflow-hidden rounded-[2rem] border border-gray-100 bg-white shadow-xs">
				<div className="grid grid-cols-[1fr_auto_auto] gap-3 border-b border-gray-100 bg-gray-50 px-4 py-3 text-[10px] font-black tracking-[0.18em] text-gray-400 uppercase md:px-6">
					<span>Feature</span>
					<span className="text-center">Support</span>
					<span className="text-center">Demo</span>
				</div>
				<div className="divide-y divide-gray-100">
					{evaluatedFeatures.map(({ feature, level, note }) => (
						<article
							key={feature.id}
							className="grid gap-4 px-4 py-5 md:grid-cols-[1fr_auto_auto] md:items-center md:px-6"
						>
							<div>
								<div className="mb-2 flex flex-wrap items-center gap-2">
									<h3 className="text-base font-black text-gray-950">
										{feature.title}
									</h3>
									<span className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-black text-gray-500">
										{feature.modeLabel}
									</span>
								</div>
								<p className="text-sm font-medium leading-relaxed text-gray-600">
									{feature.description}
								</p>
								<p className="mt-2 text-xs font-bold leading-relaxed text-gray-400">
									{note}
								</p>
							</div>
							<div className="flex items-center md:justify-center">
								<StatusBadge level={level} />
							</div>
							<div className="flex items-center md:justify-end">
								<DemoButton feature={feature} />
							</div>
						</article>
					))}
				</div>
			</div>

			<div className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-xs">
				<p className="mb-2 text-xs font-black tracking-[0.18em] text-gray-400 uppercase">
					User Agent
				</p>
				<p className="break-words text-xs font-medium leading-relaxed text-gray-500">
					{snapshot.userAgent || "ブラウザ情報を読み込み中です。"}
				</p>
			</div>
		</section>
	);
}
