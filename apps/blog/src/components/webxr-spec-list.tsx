"use client";

import { type ReactNode, useEffect, useRef, useState } from "react";
import {
	REFERENCE_SPACE_IDS,
	reportStatusLabel,
	SESSION_MODE_IDS,
} from "@/lib/report/summary";
import {
	maturityTitle,
	type SpecCheckId,
	type SpecSupport,
	type WebXRSpecEntry,
	webxrSpecCatalog,
} from "@/lib/webxr-spec-catalog";
import {
	resolveStarterSessionFeatures,
	type StarterSessionHandle,
	startStarterSession,
} from "@/lib/webxr-starter/session";
import { MarkBadge, supportToMark } from "./report/report-mark";
import { useReport } from "./report/report-provider";

type XRSessionMode = "inline" | "immersive-vr" | "immersive-ar";

const sessionIds: readonly SpecCheckId[] = SESSION_MODE_IDS;

/** 体験スペース（Reference Spaces）として別セクションに出す仕様 */
const referenceSpaceIds: readonly SpecCheckId[] = REFERENCE_SPACE_IDS;

const supportTitle: Record<SpecSupport, string> = {
	supported: "APIまたはセッションモードの対応を確認しました",
	unsupported: "このブラウザでは利用できません",
	unknown: "セッション開始後の確認が必要、または判定できませんでした",
	checking: "確認中",
};

/** 判定の記号。結果画像・概要の印（report-mark.tsx）と同じ記号を使う */
const markSymbol: Record<SpecSupport, string> = {
	supported: "✓",
	unsupported: "–",
	unknown: "?",
	checking: "…",
};

const markSymbolTone: Record<SpecSupport, string> = {
	supported: "text-data-yes",
	unsupported: "text-gray-500",
	unknown: "text-data-ask",
	checking: "text-gray-400",
};

const sectionHeadingClass =
	"mt-12 text-lg font-bold leading-snug text-gray-950";

const sectionNoteClass =
	"mt-2 max-w-[40em] break-phrase text-xs leading-relaxed text-gray-500";

const fieldLabelClass = "text-[13px] font-bold text-gray-700";

const noteCodeClass =
	"rounded bg-gray-100 px-1 py-0.5 font-mono text-xs text-gray-700";

/** スターター体験（ランナー）でセッション内可視化があるfeature */
const runnerVisualized = new Set([
	"hit-test",
	"anchors",
	"hand-tracking",
	"bounded-floor",
	"mesh-detection",
	"depth-sensing",
	"light-estimation",
	"body-tracking",
]);

/** スターター体験で実際に requestSession へ渡してよいfeature */
const runnerEnabledFeatures = runnerVisualized;

// 名前を省略せずに出すため、幅は中身に合わせて折り返す。タッチで押しやすいよう、スマートフォンでは高さ44px
const demoButtonClass =
	"inline-flex min-h-11 items-center gap-2 whitespace-nowrap rounded-xl border border-gray-200 bg-white px-3.5 py-2 text-xs font-bold text-gray-700 transition-[background-color,border-color,color,transform] hover:border-gray-950 hover:bg-gray-950 hover:text-white active:scale-[0.98] sm:min-h-10";

/** モード・体験スペースの選択肢。選んでいるものは黒く塗る（スマートフォンでは高さ44px） */
const choiceClass = (selected: boolean) =>
	`inline-flex min-h-11 items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-[background-color,border-color,color,transform] active:scale-[0.98] sm:min-h-10 ${
		selected
			? "border-gray-950 bg-gray-950 text-white"
			: "border-gray-200 bg-white text-gray-700 hover:border-gray-950 hover:text-gray-950"
	}`;

export function WebXRSpecList() {
	// 判定はレポートのレイアウトで1回だけ行い、結果画像と同じ結果をここで使う
	const {
		webxr: { results, loaded },
	} = useReport();
	const [mode, setMode] = useState<XRSessionMode>("immersive-vr");
	const [refSpace, setRefSpace] = useState<string>("local-floor");
	const [features, setFeatures] = useState<string[]>([]);
	const [codeCopy, setCodeCopy] = useState<"idle" | "done" | "failed">("idle");
	const codeCopyTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);
	const [xrRunning, setXrRunning] = useState(false);
	const [xrError, setXrError] = useState<string | null>(null);
	const xrSessionRef = useRef<StarterSessionHandle | null>(null);
	useEffect(() => () => clearTimeout(codeCopyTimer.current), []);

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

	const starterFeatures = features.filter((feature) =>
		runnerEnabledFeatures.has(feature),
	);
	const skippedStarterFeatures = features.filter(
		(feature) => !runnerEnabledFeatures.has(feature),
	);
	const builderSessionFeatures = resolveStarterSessionFeatures(starterFeatures);

	const builderLines: string[] = [
		`const supported = await navigator.xr.isSessionSupported("${mode}");`,
		"",
	];
	const builderOpts: string[] = [];
	if (refSpace !== "viewer") {
		builderOpts.push(`  requiredFeatures: ["${refSpace}"],`);
	}
	if (builderSessionFeatures.length > 0) {
		builderOpts.push(
			`  optionalFeatures: [${builderSessionFeatures.map((f) => `"${f}"`).join(", ")}],`,
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
	// 暗い面の上のコメント。白地の下限（gray-500）では暗すぎるので、明るい gray-400 で読める濃さにする
	const tokCmt = "text-gray-400";
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
		if (builderSessionFeatures.length > 0) {
			codeJsxLines.push({
				id: "l4",
				content: (
					<>
						{"  "}
						<span className={tokProp}>optionalFeatures</span>: [
						{builderSessionFeatures.map((f, index) => (
							<span key={f}>
								<span className={tokHl}>"{f}"</span>
								{index < builderSessionFeatures.length - 1 ? ", " : ""}
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
				...(results[mode] === "unsupported" ? [mode] : []),
				...(results[refSpace as SpecCheckId] === "unsupported"
					? [refSpace]
					: []),
				...features.filter((f) => {
					const entry = featureOptions.find((o) => o.featureName === f);
					if (!runnerEnabledFeatures.has(f)) return false;
					return entry ? results[entry.id] === "unsupported" : false;
				}),
			]
		: [];
	async function startExperience() {
		setXrError(null);
		if (selectedUnsupported.length > 0) {
			setXrError(
				`この端末では${selectedUnsupported.join("・")}が未対応のため、この構成では開始できません。選び直すか、対応している端末でお試しください。`,
			);
			return;
		}
		try {
			setXrRunning(true);
			xrSessionRef.current = await startStarterSession(
				{
					mode,
					refSpace,
					features: starterFeatures,
					skyboxUrl: "/assets/starter-skybox.jpg",
				},
				(message) => {
					setXrRunning(false);
					xrSessionRef.current = null;
					setXrError(
						message
							? `セッションが終了しました（${message}）。`
							: "セッションを終了しました。",
					);
				},
			);
		} catch (err) {
			setXrRunning(false);
			xrSessionRef.current = null;
			setXrError(
				err instanceof Error
					? err.message
					: "体験を開始できませんでした。ページを開き直すか、対応している端末でお試しください。",
			);
		}
	}

	function endExperience() {
		xrSessionRef.current?.end();
	}

	async function copyBuilderCode() {
		let result: "done" | "failed" = "done";
		try {
			await navigator.clipboard.writeText(builderCode);
		} catch {
			// クリップボードが使えない環境でも、押した結果は伝える
			result = "failed";
		}
		setCodeCopy(result);
		clearTimeout(codeCopyTimer.current);
		codeCopyTimer.current = setTimeout(() => setCodeCopy("idle"), 1600);
	}

	/** 選択肢に添える判定の印。色だけに頼らないよう記号で出す（読み上げは supportStatus） */
	function supportSymbol(id: SpecCheckId) {
		const support = results[id] ?? "checking";
		return (
			<span
				aria-hidden="true"
				title={supportTitle[support]}
				className={`w-3 shrink-0 text-center text-xs font-bold ${markSymbolTone[support]}`}
			>
				{markSymbol[support]}
			</span>
		);
	}

	/** 選択肢の名前のあとに読み上げる判定の言葉 */
	function supportStatus(id: SpecCheckId) {
		return (
			<span className="sr-only">
				（{reportStatusLabel(supportToMark(results[id] ?? "checking"))}）
			</span>
		);
	}

	function renderEntry(entry: WebXRSpecEntry) {
		const support = results[entry.id] ?? "checking";
		const mark = supportToMark(support);
		const isSession = sessionIds.includes(entry.id);
		return (
			<li
				key={entry.id}
				id={`spec-${entry.id}`}
				// スマートフォンでは判定の印を名前の上に置き、説明に幅を回す
				className="grid scroll-mt-28 grid-cols-1 gap-y-3 px-5 py-6 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-x-4 sm:gap-y-4 md:grid-cols-[4.5rem_minmax(0,1fr)_17rem] md:gap-x-6"
			>
				<span className="pt-0.5" title={supportTitle[support]}>
					{/* 確認中は記号（…）だけを出す */}
					<MarkBadge mark={mark} className="sm:w-full">
						{mark === "checking" ? "" : reportStatusLabel(mark)}
					</MarkBadge>
				</span>
				<div className="min-w-0">
					{/* 名前とコード表記は、入りきらないときに語の途中で割らず、まとまりごと次の行へ送る */}
					<p className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-base font-bold leading-snug text-gray-950">
						{entry.name}
						{entry.featureName && (
							<code
								title={
									isSession
										? "requestSessionに渡すセッションモード名"
										: "requestSessionのrequiredFeatures / optionalFeaturesに渡す機能名"
								}
								className="rounded bg-gray-100 px-1.5 py-0.5 font-mono text-xs font-normal text-gray-600"
							>
								{entry.featureName}
							</code>
						)}
					</p>
					<p className="mt-1.5 break-phrase text-sm leading-relaxed text-gray-600">
						{entry.description}
					</p>
					{entry.whyNote && (
						<details className="mt-1">
							{/* タッチで押しやすいよう、スマートフォンでは高さ44px（文字16px + 上下14px） */}
							<summary className="cursor-pointer py-3.5 text-xs font-bold text-gray-500 transition-colors hover:text-gray-800 sm:py-1">
								必要な理由
							</summary>
							<p className="mt-1 rounded-xl bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
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
							aria-label={`${entry.specName}（新しいタブで開く）`}
							// 押せる範囲を上下に4pxずつ広げる（高さ24px）
							className="inline-block py-1 text-xs text-gray-500 underline decoration-gray-300 underline-offset-2 transition-colors hover:text-gray-800 hover:decoration-current"
						>
							{entry.specName}
						</a>
					) : (
						<span
							className="inline-block py-1 text-xs text-gray-500"
							title={maturityTitle[entry.maturity]}
						>
							{entry.specName}
						</span>
					)}
				</div>
				<div className="sm:col-span-2 md:col-span-1">
					{entry.demos && entry.demos.length > 0 ? (
						<div className="flex flex-wrap gap-2">
							{entry.demos.map((demo) => (
								<a
									key={demo.href}
									href={demo.href}
									target="_blank"
									rel="noopener noreferrer"
									title={`${demo.label}の${entry.name}デモを開く`}
									aria-label={`${demo.name ?? demo.label}：${entry.name}のデモ（新しいタブで開く）`}
									className={demoButtonClass}
								>
									{demo.name ?? demo.label}
									<span aria-hidden="true" className="text-xs">
										↗
									</span>
								</a>
							))}
						</div>
					) : (
						<p className="flex min-h-10 items-center justify-center rounded-xl border border-dashed border-gray-200 px-3 text-xs text-gray-500">
							動かせるデモはまだありません
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
				<h2 className={sectionHeadingClass}>{label}</h2>
				<p className={sectionNoteClass}>{note}</p>
				<ul className="mt-4 divide-y divide-gray-100 rounded-2xl border border-gray-200">
					{entries.map(renderEntry)}
				</ul>
			</>
		);
	}

	return (
		<div>
			{renderSection(
				"セッションモード",
				<>
					XR体験の入口です。体験を始めるときに
					<code className={noteCodeClass}>
						navigator.xr.requestSession("モード名")
					</code>
					で、この中から1つを選びます。
				</>,
				sessionEntries,
			)}
			{renderSection(
				"機能モジュール",
				<>
					体験に足せる機能です。使いたい機能のfeature名を
					<code className={noteCodeClass}>requiredFeatures</code>（必須）または
					<code className={noteCodeClass}>optionalFeatures</code>
					（任意）に入れて<code className={noteCodeClass}>requestSession</code>
					に渡すと有効になります。
				</>,
				sortedModules,
			)}
			{renderSection(
				"体験スペース",
				<>
					体験の基準になる座標系です。セッション開始後に
					<code className={noteCodeClass}>
						session.requestReferenceSpace("名前")
					</code>
					で選びます。<code className={noteCodeClass}>bounded-floor</code>
					などは<code className={noteCodeClass}>optionalFeatures</code>
					への指定も必要です。
				</>,
				referenceSpaceEntries,
			)}

			<h2 className={sectionHeadingClass}>スターターコードを組み立てる</h2>
			<p className={sectionNoteClass}>
				モード・機能・体験スペースを選ぶと、WebXRを開始するコードがその場で組み上がります。未対応の端末でも、実装の形をそのまま確認できます。
			</p>
			<div className="mt-4 rounded-2xl border border-gray-200 p-5">
				<div className="flex flex-wrap items-center gap-2">
					{loaded && (
						<button
							type="button"
							onClick={buildForDevice}
							className="btn btn-dark rounded-full"
						>
							この端末向けに構成する
						</button>
					)}
					{loaded && (
						<button
							type="button"
							onClick={xrRunning ? endExperience : startExperience}
							className="btn btn-primary rounded-full"
						>
							{xrRunning ? "体験を終了する" : "この構成で体験を始める"}
						</button>
					)}
				</div>
				{xrError && (
					<p
						role="alert"
						className="mt-3 break-phrase rounded-xl bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-700"
					>
						{xrError}
					</p>
				)}
				{/* 選択肢の群ごとに fieldset で囲み、群の名前（legend）を読み上げで結び付ける。
				    min-w-0 は、fieldset の既定の最小幅（中身の幅）で狭い画面からはみ出さないため */}
				<fieldset className="mt-5 min-w-0">
					<legend className={fieldLabelClass}>モード</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						{sessionEntries.map((entry) => (
							<button
								key={entry.id}
								type="button"
								onClick={() => setMode(entry.id as XRSessionMode)}
								aria-pressed={mode === entry.id}
								className={choiceClass(mode === entry.id)}
							>
								{supportSymbol(entry.id)}
								{entry.name}
								{supportStatus(entry.id)}
							</button>
						))}
					</div>
				</fieldset>
				<fieldset className="mt-5 min-w-0">
					<legend className={fieldLabelClass}>機能（optionalFeatures）</legend>
					<div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
						{featureOptions.map((entry) => (
							<label
								key={entry.id}
								className="flex cursor-pointer items-start gap-2.5 rounded-xl border border-gray-200 px-3 py-2.5 text-xs text-gray-700 transition-colors hover:border-gray-400"
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
									className="mt-px h-4 w-4 shrink-0 accent-gray-950"
								/>
								{/* 名前を省略しないよう、機能名と「可視化なし」は2行目に置く */}
								<span className="min-w-0">
									<span className="flex items-center gap-1.5 font-bold text-gray-950">
										{supportSymbol(entry.id)}
										{entry.name}
										{supportStatus(entry.id)}
									</span>
									<span className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
										<code className="font-mono text-gray-500">
											{entry.featureName}
										</code>
										{entry.featureName &&
											!runnerVisualized.has(entry.featureName) && (
												<span
													title="BANGEOのスターター体験ではまだ可視化されず、体験開始時のセッション要求にも入れません"
													className="rounded bg-gray-100 px-1.5 py-0.5 text-gray-600"
												>
													可視化なし
												</span>
											)}
									</span>
								</span>
							</label>
						))}
					</div>
				</fieldset>
				<fieldset className="mt-5 min-w-0">
					<legend className={fieldLabelClass}>体験スペース</legend>
					<div className="mt-2 flex flex-wrap gap-2">
						{referenceSpaceEntries.map((entry) => (
							<button
								key={entry.id}
								type="button"
								onClick={() => setRefSpace(entry.id)}
								aria-pressed={refSpace === entry.id}
								className={choiceClass(refSpace === entry.id)}
							>
								{supportSymbol(entry.id)}
								{entry.name}
								{supportStatus(entry.id)}
							</button>
						))}
					</div>
				</fieldset>
				<div className="mt-6 overflow-hidden rounded-xl bg-gray-950">
					<div className="flex min-h-12 items-center gap-3 border-b border-white/10 py-1 pl-4 pr-2 sm:py-2">
						<span className="font-mono text-xs text-gray-400">starter.js</span>
						{/* タッチで押しやすいよう、スマートフォンでは高さ44px */}
						<button
							type="button"
							onClick={copyBuilderCode}
							className="ml-auto inline-flex min-h-11 items-center whitespace-nowrap rounded-full border border-white/20 px-3 text-xs font-bold text-white/80 transition-[background-color,color,transform] hover:bg-white/10 hover:text-white active:scale-[0.98] sm:min-h-8"
						>
							{codeCopy === "done"
								? "コピーしました"
								: codeCopy === "failed"
									? "コピーできませんでした"
									: "コードをコピー"}
						</button>
					</div>
					<div className="overflow-x-auto p-4">
						<pre className="font-mono text-xs leading-relaxed">
							<code>
								{codeJsxLines.map((line, index) => (
									<span key={line.id} className="flex gap-4">
										<span className="w-5 shrink-0 select-none text-right text-gray-500">
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
				<p className="mt-3 max-w-[40em] text-xs leading-relaxed text-gray-500">
					体験を開始すると、VRでは安定性を優先した暗背景、ARではパススルーを背景に、hit-test（面マーカー）・anchors（選択操作で固定キューブを設置）・hand-tracking（関節の点表示）・bounded-floor（境界線）・mesh-detection（部屋メッシュの点群）・depth-sensing（視線の先の実測距離マーカー）・light-estimation（主光源の方向線）・body-tracking（全身関節の点表示）がセッションの中で確認できます。Layersなど「可視化なし」の機能は、体験開始時のセッション要求には入れません。
				</p>
				{skippedStarterFeatures.length > 0 && (
					<p className="mt-3 break-phrase rounded-xl bg-gray-50 px-3 py-2 text-xs leading-relaxed text-gray-600">
						BANGEOのスターター体験では未実装のため、開始時には
						{skippedStarterFeatures.join("・")}をセッション要求から外します。
					</p>
				)}
				{selectedUnsupported.length > 0 && (
					<p className="mt-3 break-phrase rounded-xl bg-data-ask-soft px-3 py-2 text-xs leading-relaxed text-data-ask">
						この構成には、この端末では未対応のものが含まれます（
						{selectedUnsupported.join("・")}
						）。コードの形はそのまま学べます。
					</p>
				)}
			</div>

			<p className="mt-4 max-w-[40em] text-xs leading-relaxed text-gray-500">
				対応表示はブラウザのAPI実装有無に基づく簡易判定です。各行のコードは、requestSessionのモード名またはrequiredFeatures
				/
				optionalFeaturesに渡す機能名です。最終的な動作は各デモページでご確認ください。
			</p>
		</div>
	);
}
