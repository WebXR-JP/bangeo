"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { SITE_URL } from "@/lib/site-url";
import {
	maturityLabel,
	maturityTitle,
	type SpecCheckId,
	type SpecSupport,
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

const supportMarkClass: Record<SpecSupport, string> = {
	supported: "text-emerald-600",
	unsupported: "text-gray-300",
	unknown: "text-gray-400",
	checking: "text-gray-300",
};

const supportTitle: Record<SpecSupport, string> = {
	supported: "このブラウザで利用できます",
	unsupported: "このブラウザでは利用できません",
	unknown: "実機のXRセッション内でのみ確認できます",
	checking: "確認中",
};

const PAGE_URL = `${SITE_URL}/experiments`;

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

	return (
		<div>
			<div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-gray-500">
				<span className="font-bold text-gray-800">
					{envLabel ?? "環境を確認中…"}
				</span>
				{loaded && (
					<span className="text-xs text-gray-400">
						{supportedNames.length} / {webxrSpecCatalog.length} 仕様が利用可
					</span>
				)}
				{loaded && (
					<span className="flex items-center gap-1.5">
						<button
							type="button"
							onClick={copyResult}
							className="rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-950"
						>
							{copied ? "コピーしました" : "結果をコピー"}
						</button>
						<a
							href={shareHref}
							target="_blank"
							rel="noopener noreferrer"
							className="rounded-full border border-gray-200 px-3 py-1 text-xs font-bold text-gray-600 transition hover:border-gray-300 hover:text-gray-950"
						>
							#bangeo_webxr でシェア
						</a>
					</span>
				)}
			</div>

			<ul className="mt-5 border-t border-gray-100">
				{webxrSpecCatalog.map((entry) => {
					const support = results[entry.id] ?? "checking";
					return (
						<li
							key={entry.id}
							className="flex items-center gap-4 border-b border-gray-100 py-3.5"
						>
							<span
								className={`w-4 shrink-0 text-center text-sm font-bold ${supportMarkClass[support]}`}
								title={supportTitle[support]}
							>
								<span aria-hidden="true">{supportMark[support]}</span>
								<span className="sr-only">{supportTitle[support]}</span>
							</span>
							<div className="min-w-0 flex-1">
								<p className="text-sm leading-snug">
									<span className="font-bold text-gray-950">{entry.name}</span>
									<span className="ml-2 text-xs text-gray-500">
										{entry.description}
									</span>
									{entry.articleSlug && (
										<Link
											href={`/experiments/${entry.articleSlug}`}
											className="ml-2 text-xs text-gray-400 underline decoration-gray-200 underline-offset-2 transition hover:text-[#e11d48]"
										>
											解説
										</Link>
									)}
								</p>
								{entry.specUrl ? (
									<a
										href={entry.specUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="text-[11px] text-gray-400 transition hover:text-gray-600 hover:underline"
									>
										{entry.specName}
									</a>
								) : (
									<span className="text-[11px] text-gray-400">
										{entry.specName}
									</span>
								)}
							</div>
							<span
								className="hidden shrink-0 rounded-full border border-gray-200 px-2 py-0.5 text-[10px] font-bold text-gray-400 sm:inline"
								title={maturityTitle[entry.maturity]}
							>
								{maturityLabel[entry.maturity]}
							</span>
							<span className="flex shrink-0 items-center justify-end gap-1.5">
								{entry.demos && entry.demos.length > 0 ? (
									support === "unsupported" ? (
										<span className="text-xs text-gray-300">未対応</span>
									) : (
										entry.demos.map((demo, index) => (
											<a
												key={demo.href}
												href={demo.href}
												target="_blank"
												rel="noopener noreferrer"
												title={`${demo.label}のデモページを開く`}
												className={
													index === 0 && support === "supported"
														? "inline-flex items-center justify-center rounded-full bg-gray-950 px-3 py-1 text-[11px] font-bold text-white transition hover:bg-[#e11d48]"
														: "inline-flex items-center justify-center rounded-full border border-gray-300 px-3 py-1 text-[11px] font-bold text-gray-600 transition hover:border-gray-950 hover:text-gray-950"
												}
											>
												{demo.label === "公式サンプル" ? "公式" : demo.label}
											</a>
										))
									)
								) : (
									<span className="text-xs text-gray-300">近日</span>
								)}
							</span>
						</li>
					);
				})}
			</ul>

			<p className="mt-4 text-xs leading-relaxed text-gray-400">
				判定はブラウザのAPI実装有無に基づく簡易チェックです。「?」の項目は実機のXRセッション内でのみ確認できます。最終的な動作は各デモでご確認ください。
			</p>
		</div>
	);
}
