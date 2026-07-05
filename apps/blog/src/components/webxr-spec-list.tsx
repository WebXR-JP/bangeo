"use client";

import { useEffect, useState } from "react";
import { SITE_URL } from "@/lib/site-url";
import {
	maturityTitle,
	type SpecCheckId,
	type SpecSupport,
	type WebXRSpecEntry,
	webxrSpecCatalog,
} from "@/lib/webxr-spec-catalog";

type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";

interface MinimalXRSystem {
	isSessionSupported(mode: XRSessionMode): Promise<boolean>;
}

function getXR(): MinimalXRSystem | null {
	if (typeof navigator === "undefined") return null;
	const nav = navigator as Navigator & { xr?: MinimalXRSystem };
	return nav.xr ?? null;
}

function hasInterface(name: string): boolean {
	if (typeof window === "undefined") return false;
	return (
		typeof (window as unknown as Record<string, unknown>)[name] !== "undefined"
	);
}

function prototypeHas(interfaceName: string, prop: string): boolean {
	if (typeof window === "undefined") return false;
	const ctor = (window as unknown as Record<string, unknown>)[interfaceName] as
		| { prototype?: object }
		| undefined;
	return Boolean(ctor?.prototype && prop in ctor.prototype);
}

async function sessionSupported(mode: XRSessionMode): Promise<boolean> {
	const xr = getXR();
	if (!xr) return false;
	try {
		return await xr.isSessionSupported(mode);
	} catch {
		return false;
	}
}

const asSupport = (value: boolean): SpecSupport =>
	value ? "supported" : "unsupported";

const specChecks: Record<
	SpecCheckId,
	() => SpecSupport | Promise<SpecSupport>
> = {
	inline: async () => asSupport(await sessionSupported("inline")),
	"immersive-vr": async () => asSupport(await sessionSupported("immersive-vr")),
	"immersive-ar": async () => asSupport(await sessionSupported("immersive-ar")),
	viewer: () => (getXR() ? "supported" : "unsupported"),
	local: () => (getXR() ? "supported" : "unsupported"),
	"local-floor": () => (getXR() ? "unknown" : "unsupported"),
	"bounded-floor": () => (getXR() ? "unknown" : "unsupported"),
	unbounded: () => (getXR() ? "unknown" : "unsupported"),
	gamepads: () => asSupport(hasInterface("XRInputSource")),
	"hand-input": () => asSupport(hasInterface("XRHand")),
	"hit-test": () => asSupport(hasInterface("XRHitTestSource")),
	anchors: () => asSupport(hasInterface("XRAnchor")),
	"dom-overlays": () => asSupport(prototypeHas("XRSession", "domOverlayState")),
	"depth-sensing": () =>
		asSupport(
			hasInterface("XRCPUDepthInformation") ||
				hasInterface("XRWebGLDepthInformation") ||
				prototypeHas("XRSession", "depthUsage"),
		),
	"mesh-detection": () =>
		asSupport(
			hasInterface("XRMesh") || prototypeHas("XRFrame", "detectedMeshes"),
		),
	"lighting-estimation": () => asSupport(hasInterface("XRLightEstimate")),
	layers: () =>
		asSupport(
			hasInterface("XRProjectionLayer") || hasInterface("XRMediaBinding"),
		),
	"webgpu-binding": () => asSupport(hasInterface("XRGPUBinding")),
	"body-tracking": () =>
		asSupport(hasInterface("XRBody") || prototypeHas("XRFrame", "body")),
};

const sessionIds: SpecCheckId[] = ["inline", "immersive-vr", "immersive-ar"];

/** 体験スペース（Reference Spaces）として別セクションに出す仕様 */
const referenceSpaceIds: SpecCheckId[] = [
	"viewer",
	"local",
	"local-floor",
	"bounded-floor",
	"unbounded",
];

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

const supportMark: Record<SpecSupport, string> = {
	supported: "○",
	unsupported: "—",
	unknown: "?",
	checking: "…",
};

const supportBadge: Record<SpecSupport, { label: string; className: string }> =
	{
		supported: {
			label: "対応",
			className: "bg-emerald-50 text-emerald-700",
		},
		unsupported: {
			label: "未対応",
			className: "bg-gray-100 text-gray-400",
		},
		unknown: {
			label: "対応",
			className: "bg-emerald-50 text-emerald-700",
		},
		checking: {
			label: "…",
			className: "animate-pulse bg-gray-100 text-gray-300",
		},
	};

const supportTitle: Record<SpecSupport, string> = {
	supported: "このブラウザで利用できます",
	unsupported: "このブラウザでは利用できません",
	unknown: "このブラウザで利用できます",
	checking: "確認中",
};

const PAGE_URL = `${SITE_URL}/experiments`;

const sectionLabelClass =
	"mt-10 text-[11px] font-black tracking-[0.14em] text-gray-400";

const demoButtonClass =
	"flex min-h-10 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-950 hover:bg-gray-950 hover:text-white";

export function WebXRSpecList() {
	const [results, setResults] = useState<
		Partial<Record<SpecCheckId, SpecSupport>>
	>({});
	const [envLabel, setEnvLabel] = useState<string | null>(null);
	const [userAgent, setUserAgent] = useState("");
	const [copied, setCopied] = useState(false);

	useEffect(() => {
		let cancelled = false;

		async function run() {
			setUserAgent(navigator.userAgent);
			setEnvLabel(describeEnvironment(navigator.userAgent));

			const next: Partial<Record<SpecCheckId, SpecSupport>> = {};
			for (const entry of webxrSpecCatalog) {
				let support: SpecSupport = "unsupported";
				try {
					const result = specChecks[entry.id]();
					support = result instanceof Promise ? await result : result;
				} catch {
					support = "unsupported";
				}
				next[entry.id] = support;
			}
			const immersiveReady =
				next["immersive-vr"] === "supported" ||
				next["immersive-ar"] === "supported";
			const sessionDependentIds: SpecCheckId[] = [
				"local-floor",
				"bounded-floor",
				"unbounded",
			];
			for (const id of sessionDependentIds) {
				next[id] = immersiveReady ? "supported" : "unsupported";
			}
			if (!cancelled) setResults(next);
		}

		run();
		return () => {
			cancelled = true;
		};
	}, []);

	const loaded = Object.keys(results).length > 0;
	const sessionEntries = webxrSpecCatalog.filter((entry) =>
		sessionIds.includes(entry.id),
	);
	const referenceSpaceEntries = webxrSpecCatalog.filter((entry) =>
		referenceSpaceIds.includes(entry.id),
	);
	const moduleEntries = webxrSpecCatalog.filter(
		(entry) =>
			!sessionIds.includes(entry.id) && !referenceSpaceIds.includes(entry.id),
	);
	const supportRank: Record<SpecSupport, number> = {
		supported: 0,
		unknown: 1,
		checking: 2,
		unsupported: 3,
	};
	const sortedModules = loaded
		? [...moduleEntries].sort(
				(a, b) =>
					supportRank[results[a.id] ?? "checking"] -
					supportRank[results[b.id] ?? "checking"],
			)
		: moduleEntries;
	const supportedNames = webxrSpecCatalog
		.filter((entry) => results[entry.id] === "supported")
		.map((entry) => entry.name);

	const copyText = [
		"BANGEO WebXR対応チェック",
		envLabel ?? "",
		userAgent,
		webxrSpecCatalog
			.map(
				(entry) =>
					`${supportMark[results[entry.id] ?? "checking"]} ${entry.name}`,
			)
			.join(" / "),
		PAGE_URL,
	].join("\n");

	const shareText = loaded
		? supportedNames.length > 0
			? `${envLabel} で使えるWebXR: ${supportedNames.join("・")}`
			: `${envLabel} ではWebXRを利用できませんでした`
		: "";
	const shareHref = `https://x.com/intent/tweet?text=${encodeURIComponent(
		shareText,
	)}&url=${encodeURIComponent(PAGE_URL)}&hashtags=${encodeURIComponent(
		"bangeo_webxr",
	)}`;

	async function copyResult() {
		try {
			await navigator.clipboard.writeText(copyText);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// クリップボードが使えない環境では何もしない
		}
	}

	function renderEntry(entry: WebXRSpecEntry) {
		const support = results[entry.id] ?? "checking";
		const badge = supportBadge[support];
		const isSession = sessionIds.includes(entry.id);
		return (
			<li
				key={entry.id}
				className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-4 px-5 py-6 md:grid-cols-[3.5rem_minmax(0,1fr)_17rem] md:gap-x-6"
			>
				<span className="pt-0.5" title={supportTitle[support]}>
					<span
						className={`inline-flex w-full justify-center rounded-full px-2 py-1 text-[11px] font-bold ${badge.className}`}
					>
						{badge.label}
					</span>
				</span>
				<div className="min-w-0">
					<p className="text-base font-bold leading-snug text-gray-950">
						{entry.name}
						{entry.featureName && (
							<code
								title={
									isSession
										? "requestSession に渡すセッションモード名"
										: "requestSession の requiredFeatures / optionalFeatures に渡す機能名"
								}
								className="ml-2.5 rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] font-normal text-gray-600"
							>
								{entry.featureName}
							</code>
						)}
					</p>
					<p className="mt-1.5 text-sm leading-relaxed text-gray-600">
						{entry.description}
					</p>
					{entry.specUrl ? (
						<a
							href={entry.specUrl}
							target="_blank"
							rel="noopener noreferrer"
							title={maturityTitle[entry.maturity]}
							className="mt-1.5 inline-block text-xs text-gray-400 transition hover:text-gray-600 hover:underline"
						>
							{entry.specName}
						</a>
					) : (
						<span
							className="mt-1.5 inline-block text-xs text-gray-400"
							title={maturityTitle[entry.maturity]}
						>
							{entry.specName}
						</span>
					)}
				</div>
				<div className="col-span-2 md:col-span-1">
					{entry.demos && entry.demos.length > 0 ? (
						<div className="grid grid-cols-2 gap-2">
							{entry.demos.map((demo) => (
								<a
									key={demo.href}
									href={demo.href}
									target="_blank"
									rel="noopener noreferrer"
									title={`${demo.label}の${entry.name}デモを開く`}
									className={demoButtonClass}
								>
									<span className="truncate">{demo.label}</span>
									<span aria-hidden="true" className="shrink-0 text-[10px]">
										↗
									</span>
								</a>
							))}
						</div>
					) : (
						<p className="flex min-h-10 items-center justify-center rounded-xl border border-dashed border-gray-200 text-xs text-gray-300">
							デモは近日公開
						</p>
					)}
				</div>
			</li>
		);
	}

	function renderSection(label: string, entries: WebXRSpecEntry[]) {
		return (
			<>
				<p className={sectionLabelClass}>{label}</p>
				<ul className="mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100">
					{entries.map(renderEntry)}
				</ul>
			</>
		);
	}

	return (
		<div>
			<div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-gray-50 px-5 py-4">
				<div className="min-w-0">
					<p className="text-sm font-bold text-gray-950">
						{envLabel ?? "環境を確認中…"}
					</p>
					{loaded && (
						<p className="mt-0.5 text-xs text-gray-400">
							{supportedNames.length} / {webxrSpecCatalog.length}{" "}
							の仕様がこのブラウザで利用できます
						</p>
					)}
				</div>
				{loaded && (
					<div className="ml-auto flex items-center gap-2">
						<button
							type="button"
							onClick={copyResult}
							className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
						>
							{copied ? "コピーしました" : "結果をコピー"}
						</button>
						<a
							href={shareHref}
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-xs font-bold text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
						>
							Xでシェア
						</a>
					</div>
				)}
			</div>

			{renderSection("セッションモード", sessionEntries)}
			{renderSection("体験スペース", referenceSpaceEntries)}
			{renderSection("モジュール", sortedModules)}

			<p className="mt-4 text-xs leading-relaxed text-gray-400">
				対応表示はブラウザのAPI実装有無に基づく簡易チェックです。各行のコードは、requestSession
				のモード名または requiredFeatures / optionalFeatures
				に渡す機能名です。最終的な動作は各デモページでご確認ください。
			</p>
		</div>
	);
}
