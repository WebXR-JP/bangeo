"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import { SITE_URL } from "@/lib/site-url";
import {
	maturityTitle,
	type SpecCheckId,
	type SpecSupport,
	type WebXRSpecEntry,
	webxrSpecCatalog,
} from "@/lib/webxr-spec-catalog";
import {
	type StarterSessionHandle,
	startStarterSession,
} from "@/lib/webxr-starter-session";

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

const noteCodeClass =
	"rounded bg-gray-100 px-1 py-0.5 font-mono text-[11px] text-gray-600";

const demoButtonClass =
	"flex min-h-10 items-center justify-between gap-2 rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 transition hover:border-gray-950 hover:bg-gray-950 hover:text-white";

export function WebXRSpecList() {
	const [results, setResults] = useState<
		Partial<Record<SpecCheckId, SpecSupport>>
	>({});
	const [envLabel, setEnvLabel] = useState<string | null>(null);
	const [userAgent, setUserAgent] = useState("");
	const [copied, setCopied] = useState(false);
	const [mode, setMode] = useState<XRSessionMode>("immersive-vr");
	const [refSpace, setRefSpace] = useState<string>("local-floor");
	const [features, setFeatures] = useState<string[]>([]);
	const [codeCopied, setCodeCopied] = useState(false);
	const [xrRunning, setXrRunning] = useState(false);
	const [xrError, setXrError] = useState<string | null>(null);
	const xrSessionRef = useRef<StarterSessionHandle | null>(null);

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
	const featureOptions = moduleEntries.filter((entry) =>
		Boolean(entry.featureName),
	);

	function toggleFeature(name: string) {
		setFeatures((prev) =>
			prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name],
		);
	}

	function buildForDevice() {
		const modes: XRSessionMode[] = ["immersive-vr", "immersive-ar", "inline"];
		const bestMode = modes.find((m) => results[m] === "supported") ?? "inline";
		setMode(bestMode);
		const refCandidates =
			bestMode === "inline"
				? ["viewer"]
				: ["bounded-floor", "local-floor", "local"];
		const bestRef =
			refCandidates.find((r) => results[r as SpecCheckId] === "supported") ??
			(bestMode === "inline" ? "viewer" : "local");
		setRefSpace(bestRef);
		setFeatures(
			featureOptions.flatMap((entry) =>
				entry.featureName && results[entry.id] === "supported"
					? [entry.featureName]
					: [],
			),
		);
	}

	const builderLines: string[] = [
		`const supported = await navigator.xr.isSessionSupported("${mode}");`,
		"",
	];
	const builderOpts: string[] = [];
	if (refSpace !== "viewer") {
		builderOpts.push(`  requiredFeatures: ["${refSpace}"],`);
	}
	if (features.length > 0) {
		builderOpts.push(
			`  optionalFeatures: [${features.map((f) => `"${f}"`).join(", ")}],`,
		);
	}
	if (builderOpts.length > 0) {
		builderLines.push(
			`const session = await navigator.xr.requestSession("${mode}", {`,
			...builderOpts,
			"});",
		);
	} else {
		builderLines.push(
			`const session = await navigator.xr.requestSession("${mode}");`,
		);
	}
	builderLines.push(
		"",
		`const refSpace = await session.requestReferenceSpace("${refSpace}");`,
	);
	const builderCode = builderLines.join("\n");

	const tokKw = "text-fuchsia-400";
	const tokFn = "text-sky-300";
	const tokProp = "text-amber-200";
	const tokCmt = "text-gray-500";
	const tokHl =
		"rounded bg-emerald-400/15 px-1 text-emerald-300 ring-1 ring-emerald-400/30";

	const codeJsxLines: { id: string; content: ReactNode }[] = [];
	codeJsxLines.push({
		id: "c1",
		content: (
			<span className={tokCmt}>{"// 1. この端末でモードが使えるか確認"}</span>
		),
	});
	codeJsxLines.push({
		id: "l1",
		content: (
			<>
				<span className={tokKw}>const</span> supported ={" "}
				<span className={tokKw}>await</span> navigator.xr.
				<span className={tokFn}>isSessionSupported</span>(
				<span className={tokHl}>"{mode}"</span>);
			</>
		),
	});
	codeJsxLines.push({ id: "b1", content: <span> </span> });
	codeJsxLines.push({
		id: "c2",
		content: (
			<span className={tokCmt}>
				{"// 2. セッションを開始（使いたい機能はここで要求）"}
			</span>
		),
	});
	if (builderOpts.length > 0) {
		codeJsxLines.push({
			id: "l2",
			content: (
				<>
					<span className={tokKw}>const</span> session ={" "}
					<span className={tokKw}>await</span> navigator.xr.
					<span className={tokFn}>requestSession</span>(
					<span className={tokHl}>"{mode}"</span>, {"{"}
				</>
			),
		});
		if (refSpace !== "viewer") {
			codeJsxLines.push({
				id: "l3",
				content: (
					<>
						{"  "}
						<span className={tokProp}>requiredFeatures</span>: [
						<span className={tokHl}>"{refSpace}"</span>],
					</>
				),
			});
		}
		if (features.length > 0) {
			codeJsxLines.push({
				id: "l4",
				content: (
					<>
						{"  "}
						<span className={tokProp}>optionalFeatures</span>: [
						{features.map((f, index) => (
							<span key={f}>
								<span className={tokHl}>"{f}"</span>
								{index < features.length - 1 ? ", " : ""}
							</span>
						))}
						],
					</>
				),
			});
		}
		codeJsxLines.push({ id: "l5", content: <span>{"});"}</span> });
	} else {
		codeJsxLines.push({
			id: "l2",
			content: (
				<>
					<span className={tokKw}>const</span> session ={" "}
					<span className={tokKw}>await</span> navigator.xr.
					<span className={tokFn}>requestSession</span>(
					<span className={tokHl}>"{mode}"</span>);
				</>
			),
		});
	}
	codeJsxLines.push({ id: "b2", content: <span> </span> });
	codeJsxLines.push({
		id: "c3",
		content: (
			<span className={tokCmt}>{"// 3. 体験の基準になる座標系を取得"}</span>
		),
	});
	codeJsxLines.push({
		id: "l6",
		content: (
			<>
				<span className={tokKw}>const</span> refSpace ={" "}
				<span className={tokKw}>await</span> session.
				<span className={tokFn}>requestReferenceSpace</span>(
				<span className={tokHl}>"{refSpace}"</span>);
			</>
		),
	});

	const selectedUnsupported = loaded
		? [
				...(results[mode] !== "supported" ? [mode] : []),
				...(results[refSpace as SpecCheckId] === "unsupported"
					? [refSpace]
					: []),
				...features.filter((f) => {
					const entry = featureOptions.find((o) => o.featureName === f);
					return entry ? results[entry.id] === "unsupported" : false;
				}),
			]
		: [];

	async function startExperience() {
		setXrError(null);
		try {
			setXrRunning(true);
			xrSessionRef.current = await startStarterSession(
				{ mode, refSpace, features },
				() => {
					setXrRunning(false);
					xrSessionRef.current = null;
				},
			);
		} catch (err) {
			setXrRunning(false);
			xrSessionRef.current = null;
			setXrError(
				err instanceof Error ? err.message : "体験を開始できませんでした",
			);
		}
	}

	function endExperience() {
		xrSessionRef.current?.end();
	}

	async function copyBuilderCode() {
		try {
			await navigator.clipboard.writeText(builderCode);
			setCodeCopied(true);
			setTimeout(() => setCodeCopied(false), 2000);
		} catch {
			// クリップボードが使えない環境では何もしない
		}
	}

	function supportDot(id: SpecCheckId) {
		const ok = results[id] === "supported";
		return (
			<span
				aria-hidden="true"
				className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${ok ? "bg-emerald-500" : "bg-gray-300"}`}
				title={ok ? "この端末で利用できます" : "この端末では未対応です"}
			/>
		);
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
					{entry.whyNote && (
						<details className="mt-1.5">
							<summary className="cursor-pointer text-xs font-bold text-gray-400 transition hover:text-gray-600">
								なぜ必要？
							</summary>
							<p className="mt-1 rounded-xl bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-500">
								{entry.whyNote}
							</p>
						</details>
					)}
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
									<span className="truncate">{demo.name ?? demo.label}</span>
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

	function renderSection(
		label: string,
		note: ReactNode,
		entries: WebXRSpecEntry[],
	) {
		return (
			<>
				<p className={sectionLabelClass}>{label}</p>
				<p className="mt-1.5 text-xs leading-relaxed text-gray-500">{note}</p>
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

			{renderSection(
				"セッションモード",
				<>
					XR体験の入口です。体験を始めるときに{" "}
					<code className={noteCodeClass}>
						navigator.xr.requestSession("モード名")
					</code>{" "}
					で、この中から1つを選びます。
				</>,
				sessionEntries,
			)}
			{renderSection(
				"モジュール",
				<>
					体験に足せる機能です。使いたい機能のfeature名を{" "}
					<code className={noteCodeClass}>requiredFeatures</code>（必須）または{" "}
					<code className={noteCodeClass}>optionalFeatures</code>
					（任意）に入れて <code className={noteCodeClass}>requestSession</code>{" "}
					に渡すと有効になります。
				</>,
				sortedModules,
			)}
			{renderSection(
				"体験スペース",
				<>
					体験の基準になる座標系です。セッション開始後に{" "}
					<code className={noteCodeClass}>
						session.requestReferenceSpace("名前")
					</code>{" "}
					で選びます。bounded-floor などは{" "}
					<code className={noteCodeClass}>optionalFeatures</code>{" "}
					への指定も必要です。
				</>,
				referenceSpaceEntries,
			)}

			<p className={sectionLabelClass}>スターターコードを組み立てる</p>
			<p className="mt-1.5 text-xs leading-relaxed text-gray-500">
				モード・機能・体験スペースを選ぶと、WebXRを開始するコードがその場で組み上がります。未対応の端末でも、実装の形をそのまま確認できます。
			</p>
			<div className="mt-3 rounded-2xl border border-gray-100 p-5">
				<div className="flex flex-wrap items-center gap-2">
					{loaded && (
						<button
							type="button"
							onClick={buildForDevice}
							className="rounded-full bg-gray-950 px-4 py-2 text-xs font-bold text-white transition hover:bg-[#e11d48]"
						>
							この端末向けに構成する
						</button>
					)}
					{loaded && results[mode] === "supported" && (
						<button
							type="button"
							onClick={xrRunning ? endExperience : startExperience}
							className="rounded-full bg-emerald-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-emerald-700"
						>
							{xrRunning ? "体験を終了する" : "この構成で体験を開始"}
						</button>
					)}
				</div>
				{xrError && (
					<p className="mt-3 rounded-xl bg-red-50 px-3 py-2 text-xs leading-relaxed text-red-600">
						{xrError}
					</p>
				)}
				<p className="mt-4 text-[11px] font-bold text-gray-400">モード</p>
				<div className="mt-2 flex flex-wrap gap-2">
					{sessionEntries.map((entry) => (
						<button
							key={entry.id}
							type="button"
							onClick={() => setMode(entry.id as XRSessionMode)}
							className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
								mode === entry.id
									? "border-gray-950 bg-gray-950 text-white"
									: "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
							}`}
						>
							{supportDot(entry.id)}
							{entry.name}
						</button>
					))}
				</div>
				<p className="mt-4 text-[11px] font-bold text-gray-400">
					機能（optionalFeatures）
				</p>
				<div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-2 md:grid-cols-3">
					{featureOptions.map((entry) => (
						<label
							key={entry.id}
							className="flex cursor-pointer items-center gap-2 rounded-xl border border-gray-100 px-3 py-2 text-xs text-gray-700 transition hover:border-gray-300"
						>
							<input
								type="checkbox"
								checked={
									entry.featureName
										? features.includes(entry.featureName)
										: false
								}
								onChange={() =>
									entry.featureName && toggleFeature(entry.featureName)
								}
								className="h-3.5 w-3.5 accent-gray-950"
							/>
							{supportDot(entry.id)}
							<span className="min-w-0 truncate font-bold">{entry.name}</span>
							<code className="ml-auto shrink-0 font-mono text-[10px] text-gray-400">
								{entry.featureName}
							</code>
						</label>
					))}
				</div>
				<p className="mt-4 text-[11px] font-bold text-gray-400">体験スペース</p>
				<div className="mt-2 flex flex-wrap gap-2">
					{referenceSpaceEntries.map((entry) => (
						<button
							key={entry.id}
							type="button"
							onClick={() => setRefSpace(entry.id)}
							className={`flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition ${
								refSpace === entry.id
									? "border-gray-950 bg-gray-950 text-white"
									: "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
							}`}
						>
							{supportDot(entry.id)}
							{entry.name}
						</button>
					))}
				</div>
				<div className="mt-5 overflow-hidden rounded-xl bg-gray-950">
					<div className="flex items-center gap-1.5 border-b border-white/10 px-4 py-2.5">
						<span className="h-2.5 w-2.5 rounded-full bg-red-400/80" />
						<span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" />
						<span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
						<span className="ml-3 font-mono text-[11px] text-gray-500">
							starter.js
						</span>
						<button
							type="button"
							onClick={copyBuilderCode}
							className="ml-auto rounded-full border border-white/15 px-3 py-1 text-[11px] font-bold text-white/70 transition hover:bg-white/10 hover:text-white"
						>
							{codeCopied ? "コピーしました" : "コピー"}
						</button>
					</div>
					<div className="overflow-x-auto p-4">
						<pre className="font-mono text-xs leading-relaxed">
							<code>
								{codeJsxLines.map((line, index) => (
									<span key={line.id} className="flex gap-4">
										<span className="w-5 shrink-0 select-none text-right text-gray-600">
											{index + 1}
										</span>
										<span className="whitespace-pre text-gray-200">
											{line.content}
										</span>
									</span>
								))}
							</code>
						</pre>
					</div>
				</div>
				<p className="mt-3 text-[11px] leading-relaxed text-gray-400">
					体験を開始すると、hit-test（面マーカー）・hand-tracking（関節の点表示）・bounded-floor（境界線）はセッションの中で動きを確認できます。ほかの機能は要求のみで、確認モジュールは順次追加していきます。
				</p>
				{selectedUnsupported.length > 0 && (
					<p className="mt-3 rounded-xl bg-amber-50 px-3 py-2 text-xs leading-relaxed text-amber-700">
						この構成には、この端末では未対応のものが含まれます（
						{selectedUnsupported.join("・")}
						）。コードの形はそのまま学べます。
					</p>
				)}
			</div>

			<p className="mt-4 text-xs leading-relaxed text-gray-400">
				対応表示はブラウザのAPI実装有無に基づく簡易チェックです。各行のコードは、requestSession
				のモード名または requiredFeatures / optionalFeatures
				に渡す機能名です。最終的な動作は各デモページでご確認ください。
			</p>
		</div>
	);
}
