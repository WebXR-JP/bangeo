"use client";

import Link from "next/link";
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
	"bounded-floor": () => (getXR() ? "unknown" : "unsupported"),
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

const listClass =
	"mt-3 divide-y divide-gray-100 rounded-2xl border border-gray-100";
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
	const moduleEntries = webxrSpecCatalog.filter(
		(entry) => !sessionIds.includes(entry.id),
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
	const rows: (
		| { kind: "header"; label: string }
		| { kind: "entry"; entry: WebXRSpecEntry }
	)[] = [];
	if (loaded) {
		const groupDefs: { label: string; match: SpecSupport[] }[] = [
			{ label: "このブラウザで使える", match: ["supported"] },
			{ label: "実機で確認", match: ["unknown", "checking"] },
			{ label: "このブラウザでは未対応", match: ["unsupported"] },
		];
		for (const group of groupDefs) {
			const items = sortedModules.filter((entry) =>
				group.match.includes(results[entry.id] ?? "checking"),
			);
			if (items.length === 0) continue;
			rows.push({ kind: "header", label: group.label });
			for (const entry of items) {
				rows.push({ kind: "entry", entry });
			}
		}
	} else {
		for (const entry of moduleEntries) {
			rows.push({ kind: "entry", entry });
		}
	}
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
				className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-x-4 gap-y-3 px-5 py-4 sm:grid-cols-[3.5rem_minmax(0,1fr)_10rem] sm:gap-x-5"
			>
				<span className="pt-0.5" title={supportTitle[support]}>
					<span
						className={`inline-flex w-full justify-center rounded-full px-2 py-1 text-[11px] font-bold ${badge.className}`}
					>
						{badge.label}
					</span>
				</span>
				<div className="min-w-0">
					<p className="text-sm leading-snug">
						<span className="font-bold text-gray-950">{entry.name}</span>
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
								{isSession ? "mode" : "feature"}: {entry.featureName}
							</code>
						</p>
					)}
				</div>
				<div className="col-span-2 flex flex-row flex-wrap gap-x-4 gap-y-1.5 border-t border-gray-50 pt-3 sm:col-span-1 sm:flex-col sm:items-end sm:gap-1.5 sm:border-t-0 sm:pt-0">
					{entry.demos && entry.demos.length > 0 ? (
						entry.demos.map((demo) => (
							<a
								key={demo.href}
								href={demo.href}
								target="_blank"
								rel="noopener noreferrer"
								title={`${demo.label}のデモページを開く`}
								className="text-xs font-bold text-gray-700 underline decoration-gray-300 underline-offset-4 transition hover:text-[#e11d48] hover:decoration-rose-300"
							>
								{demo.label} <span aria-hidden="true">↗</span>
							</a>
						))
					) : (
						<span className="text-xs text-gray-300">デモは近日公開</span>
					)}
				</div>
			</li>
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
			<ul className={listClass}>{sessionEntries.map(renderEntry)}</ul>

			<p className={sectionLabelClass}>モジュール</p>
			<ul className={listClass}>
				{rows.map((row) => {
					if (row.kind === "header") {
						return (
							<li
								key={`header-${row.label}`}
								className="bg-gray-50/60 px-5 py-2 text-[11px] font-bold tracking-wide text-gray-400"
							>
								{row.label}
							</li>
						);
					}
					return renderEntry(row.entry);
				})}
			</ul>

			<p className="mt-4 text-xs leading-relaxed text-gray-400">
				対応表示はブラウザのAPI実装有無に基づく簡易チェックです。「実機」の項目は、featureに示した機能名を
				requestSession の optionalFeatures
				に渡し、実機のXRセッション内で確認できます。最終的な動作は各デモページでご確認ください。
			</p>
		</div>
	);
}
