"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_URL } from "@/lib/site-url";
import {
	maturityTitle,
	type SpecCheckId,
	type SpecDemoLink,
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

/** デモ提供元の列順。増えたらここに追加する */
const providerOrder: SpecDemoLink["label"][] = [
	"WebXR Samples",
	"Three.js",
	"Babylon.js",
	"A-Frame",
	"PlayCanvas",
	"BANGEO",
];

const providerShortLabel: Record<SpecDemoLink["label"], string> = {
	"WebXR Samples": "Samples",
	"Three.js": "Three.js",
	"Babylon.js": "Babylon",
	"A-Frame": "A-Frame",
	PlayCanvas: "PlayCanvas",
	BANGEO: "BANGEO",
};

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
			label: "実機",
			className: "bg-gray-100 text-gray-500",
		},
		checking: {
			label: "…",
			className: "animate-pulse bg-gray-100 text-gray-300",
		},
	};

const supportTitle: Record<SpecSupport, string> = {
	supported: "このブラウザで利用できます",
	unsupported: "このブラウザでは利用できません",
	unknown: "実機のXRセッション内でのみ確認できます",
	checking: "確認中",
};

const PAGE_URL = `${SITE_URL}/experiments`;

const sectionLabelClass =
	"mt-10 text-[11px] font-black tracking-[0.14em] text-gray-400";

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
	const providers = providerOrder.filter((provider) =>
		webxrSpecCatalog.some((entry) =>
			entry.demos?.some((demo) => demo.label === provider),
		),
	);
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

	function renderTable(entries: WebXRSpecEntry[]) {
		return (
			<div className="mt-3 overflow-x-auto rounded-2xl border border-gray-100">
				<table className="w-full min-w-[640px] border-collapse text-left">
					<thead>
						<tr className="border-b border-gray-100 bg-gray-50/60">
							<th className="w-16 px-4 py-2.5 text-[11px] font-bold text-gray-400">
								状態
							</th>
							<th className="px-2 py-2.5 text-[11px] font-bold text-gray-400">
								仕様
							</th>
							{providers.map((provider) => (
								<th
									key={provider}
									title={provider}
									className="w-20 whitespace-nowrap px-2 py-2.5 text-center text-[11px] font-bold text-gray-400"
								>
									{providerShortLabel[provider]}
								</th>
							))}
						</tr>
					</thead>
					<tbody className="divide-y divide-gray-100">
						{entries.map((entry) => {
							const support = results[entry.id] ?? "checking";
							const badge = supportBadge[support];
							const isSession = sessionIds.includes(entry.id);
							return (
								<tr key={entry.id}>
									<td
										className="px-4 py-4 align-top"
										title={supportTitle[support]}
									>
										<span
											className={`inline-flex w-12 justify-center rounded-full px-2 py-1 text-[11px] font-bold ${badge.className}`}
										>
											{badge.label}
										</span>
									</td>
									<td className="min-w-56 px-2 py-4 align-top">
										<p className="text-sm leading-snug">
											<span className="font-bold text-gray-950">
												{entry.name}
											</span>
											{entry.specUrl ? (
												<a
													href={entry.specUrl}
													target="_blank"
													rel="noopener noreferrer"
													title={`${entry.specName}（${maturityTitle[entry.maturity]}）`}
													className="ml-2 text-[11px] text-gray-400 transition hover:text-gray-600 hover:underline"
												>
													{entry.specName}
												</a>
											) : (
												<span
													className="ml-2 text-[11px] text-gray-400"
													title={maturityTitle[entry.maturity]}
												>
													{entry.specName}
												</span>
											)}
										</p>
										<p className="mt-1 text-xs leading-relaxed text-gray-500">
											{entry.description}
											{entry.articleSlug && (
												<Link
													href={`/experiments/${entry.articleSlug}`}
													className="ml-2 text-gray-400 underline decoration-gray-200 underline-offset-2 transition hover:text-[#e11d48]"
												>
													解説
												</Link>
											)}
										</p>
										{entry.featureName && (
											<p className="mt-1.5">
												<code
													title={
														isSession
															? "requestSession に渡すセッションモード名"
															: "requestSession の requiredFeatures / optionalFeatures に渡す機能名"
													}
													className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-[11px] text-gray-600"
												>
													{entry.featureName}
												</code>
											</p>
										)}
									</td>
									{providers.map((provider) => {
										const demo = entry.demos?.find(
											(item) => item.label === provider,
										);
										return (
											<td
												key={provider}
												className="px-2 py-4 text-center align-middle"
											>
												{demo ? (
													<a
														href={demo.href}
														target="_blank"
														rel="noopener noreferrer"
														title={`${provider}の${entry.name}デモを開く`}
														aria-label={`${provider}の${entry.name}デモを開く`}
														className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-xs font-bold text-gray-600 transition hover:border-gray-950 hover:bg-gray-950 hover:text-white"
													>
														↗
													</a>
												) : (
													<span
														aria-hidden="true"
														className="text-xs text-gray-200"
													>
														–
													</span>
												)}
											</td>
										);
									})}
								</tr>
							);
						})}
					</tbody>
				</table>
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

			<p className={sectionLabelClass}>セッションモード</p>
			{renderTable(sessionEntries)}

			<p className={sectionLabelClass}>体験スペース</p>
			{renderTable(referenceSpaceEntries)}

			<p className={sectionLabelClass}>モジュール</p>
			{renderTable(sortedModules)}

			<p className="mt-4 text-xs leading-relaxed text-gray-400">
				対応表示はブラウザのAPI実装有無に基づく簡易チェックです。各行のコードは、requestSession
				のモード名または requiredFeatures / optionalFeatures
				に渡す機能名です。最終的な動作は各デモページでご確認ください。
			</p>
		</div>
	);
}
