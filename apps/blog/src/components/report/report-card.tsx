"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
	CARD_HEIGHT,
	CARD_WIDTH,
	collectCardText,
	drawReportCard,
} from "@/lib/report/card-image";
import {
	type ReportSummary,
	reportAltText,
	reportShareText,
} from "@/lib/report/summary";
import { SITE_URL } from "@/lib/site-url";
import { useReport } from "./report-provider";

const REPORT_URL = `${SITE_URL}/report`;
const HASHTAG = "bangeo_webxr";
const MASCOT_SRC = "/favicon.png";

const primaryButtonClass =
	"inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-[0.98] disabled:cursor-default disabled:opacity-45 disabled:hover:bg-primary-600 disabled:active:scale-100";

const secondaryButtonClass =
	"inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-950 hover:text-gray-950 active:scale-[0.98] disabled:cursor-default disabled:opacity-45 disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:active:scale-100";

/** 画像の枠。見開き1枚のときも、1ページずつ切り出すときも同じ見た目にする */
const frameClass =
	"overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(9,9,11,0.06),0_8px_24px_-12px_rgba(9,9,11,0.2)] transition-colors group-hover:border-gray-400";

const pageFrameClass = `block aspect-[1000/1414] ${frameClass}`;

/**
 * 画像を置く箱。1ページずつ縦に並べる幅では、ページが大きくなりすぎないよう幅を止める。
 * 判定中の枠と結果画像を同じマスに重ねるので、どちらにも同じ grid-area を付ける
 */
const previewBoxClass =
	"mx-auto w-full max-w-md rounded-2xl [grid-area:1/1] md:max-w-none";

/**
 * 判定の段階を画面に出す最短の間隔。判定そのものは一瞬で終わることが多いので、
 * 何を確かめているのかが読める速さにそろえる（実際に終わる前に印を付けることはない）
 */
const STEP_INTERVAL_MS = 280;
/** 最後の段階に印が付いてから、結果を出すまでの間 */
const REVEAL_DELAY_MS = 200;
/** 結果画像がせり出す動きの長さ。globals.css の --animate-report-pop と同じにする */
const POP_MS = 300;

type StepState = "done" | "failed" | "active" | "pending";

interface JudgingStep {
	label: string;
	state: StepState;
}

const stepTone: Record<StepState, string> = {
	done: "text-gray-700",
	failed: "text-gray-700",
	active: "text-gray-950",
	pending: "text-gray-400",
};

const stepStatusText: Record<StepState, string> = {
	done: "完了",
	failed: "失敗",
	active: "確認中",
	pending: "待機中",
};

const stepIconClass =
	"inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full";

/**
 * 段階の印。判定の色（青・アンバー）は結果のためのものなので、進み具合には無彩色だけを使う。
 * globals.css が全要素の border-color を固定しているため、輪は枠線ではなく SVG の線で描く
 */
function StepIcon({ state }: { state: StepState }) {
	if (state === "done" || state === "failed") {
		return (
			<span
				aria-hidden="true"
				className={`${stepIconClass} text-xs font-black motion-safe:animate-report-check ${
					state === "done"
						? "bg-gray-950 text-white"
						: "bg-gray-200 text-gray-600"
				}`}
			>
				{state === "done" ? "✓" : "–"}
			</span>
		);
	}
	return (
		<svg
			aria-hidden="true"
			viewBox="0 0 24 24"
			fill="none"
			strokeWidth="2"
			className={`h-6 w-6 shrink-0 ${
				state === "active" ? "motion-safe:animate-spin" : ""
			}`}
		>
			<circle cx="12" cy="12" r="11" className="stroke-gray-200" />
			{state === "active" && (
				<path
					d="M12 1a11 11 0 0 1 11 11"
					strokeLinecap="round"
					className="stroke-gray-950"
				/>
			)}
		</svg>
	);
}

/** 判定中に、いま何を確かめているかを上から順に見せる */
function JudgingSteps({
	steps,
	leaving,
}: {
	steps: JudgingStep[];
	leaving: boolean;
}) {
	return (
		<ol
			className={`grid gap-3 text-left transition-opacity duration-150 motion-reduce:transition-none md:gap-4 ${
				leaving ? "opacity-0" : ""
			}`}
		>
			{steps.map((step) => (
				<li
					key={step.label}
					// 320px幅でもいちばん長い行が折り返さないよう、狭い画面だけ1段小さくする
					className={`flex items-center gap-3 text-[13px] font-bold transition-colors duration-200 motion-reduce:transition-none min-[360px]:text-sm md:text-base ${stepTone[step.state]}`}
				>
					<StepIcon state={step.state} />
					<span>{step.label}</span>
					<span className="sr-only">（{stepStatusText[step.state]}）</span>
				</li>
			))}
		</ol>
	);
}

let mascotPromise: Promise<HTMLImageElement | null> | null = null;

function loadMascot(): Promise<HTMLImageElement | null> {
	mascotPromise ??= new Promise((resolve) => {
		const image = new Image();
		image.onload = () => resolve(image);
		image.onerror = () => resolve(null);
		image.src = MASCOT_SRC;
	});
	return mascotPromise;
}

/**
 * Noto Sans JP は文字ごとに分割配信されるので、描く文字を渡して先に読み込ませる。
 * 読み込めなくても system-ui で描けるため、待ちすぎずに先へ進む。
 */
async function loadCardFonts(fontFamily: string, sample: string) {
	if (!document.fonts?.load) return;
	const loads = [400, 700, 900].map((weight) =>
		document.fonts.load(`${weight} 32px ${fontFamily}`, sample),
	);
	await Promise.race([
		Promise.allSettled(loads),
		new Promise((resolve) => setTimeout(resolve, 2500)),
	]);
}

async function renderCard(summary: ReportSummary): Promise<Blob> {
	const fontFamily =
		getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
	const [mascot] = await Promise.all([
		loadMascot(),
		loadCardFonts(fontFamily, collectCardText(summary)),
	]);
	const canvas = document.createElement("canvas");
	canvas.width = CARD_WIDTH;
	canvas.height = CARD_HEIGHT;
	const context = canvas.getContext("2d");
	if (!context) throw new Error("Canvas 2D is unavailable");
	drawReportCard(context, summary, { mascot, fontFamily });
	const blob = await new Promise<Blob | null>((resolve) =>
		canvas.toBlob(resolve, "image/png"),
	);
	if (!blob) throw new Error("Could not encode the report card");
	return blob;
}

async function copyImageToClipboard(blob: Blob): Promise<boolean> {
	try {
		if (typeof ClipboardItem === "undefined" || !navigator.clipboard?.write) {
			return false;
		}
		// Safari は操作の直後に書き込みを始めないと拒否するので、ここより前で待たない
		await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
		return true;
	} catch {
		return false;
	}
}

/** ブラウザ内で作った画像。長押し・右クリックでもそのまま保存・コピーできるよう素の img で出す */
function CardImage({
	src,
	alt,
	className,
}: {
	src: string;
	alt: string;
	className: string;
}) {
	return (
		// biome-ignore lint/performance/noImgElement: ブラウザ内で作ったblob画像は next/image で扱えない
		<img
			src={src}
			alt={alt}
			width={CARD_WIDTH}
			height={CARD_HEIGHT}
			// せり出す動きの途中で空の枠が見えないよう、描く前に復号を済ませる
			decoding="sync"
			className={className}
		/>
	);
}

/**
 * この端末の結果を、見開き2ページの画像（BANGEOレポート）にして見せる。
 * ページを開いた時点で自動的に作り、画像を押すだけでコピーできる。
 *
 * 開いた直後は「判定中」の段階を上から順に見せ、すべて終わってから結果画像を出す。
 * いま開いている端末をその場で調べた結果だと伝わるようにするためで、
 * 2回目以降の作り直し（GPUの切り替えなど）では画像だけを差し替える。
 */
export function ReportCard() {
	const { summary } = useReport();
	const hintId = useId();
	const [image, setImage] = useState<{ url: string; blob: Blob } | null>(null);
	const [imageFailed, setImageFailed] = useState(false);
	// 画面で印を付け終えた段階の数。実際の完了（finishedSteps）を追い越さない
	const [shownSteps, setShownSteps] = useState(0);
	const [revealed, setRevealed] = useState(false);
	// 結果画像が収まり、下に敷いていた判定中の枠を外したか
	const [popDone, setPopDone] = useState(false);
	const lastStepAt = useRef(0);
	const reducedMotion = useRef(false);
	const [nativeShare, setNativeShare] = useState(false);
	// 現行の主要ブラウザは画像のコピーに対応しているので、コピーを前提に組んでおき、
	// 使えない環境だと分かったときだけ「保存」に切り替える
	const [canCopyImage, setCanCopyImage] = useState(true);
	const [copied, setCopied] = useState(false);
	const [notice, setNotice] = useState("");
	const [blockedShareHref, setBlockedShareHref] = useState<string | null>(null);
	const currentUrl = useRef<string | null>(null);
	const copiedTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	useEffect(() => {
		lastStepAt.current = performance.now();
		// 動きを減らす設定では、段階の間を空けずに結果をすぐ出す
		reducedMotion.current = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		// 共有シートに画像を渡せるのは実質スマートフォン・タブレットだけ。
		// PCの共有ダイアログにはSNSが並ばないので、PCではXの投稿画面を開く。
		setNativeShare(
			window.matchMedia("(pointer: coarse)").matches &&
				typeof navigator.share === "function" &&
				typeof navigator.canShare === "function",
		);
		setCanCopyImage(
			typeof ClipboardItem !== "undefined" &&
				typeof navigator.clipboard?.write === "function",
		);
		return () => {
			clearTimeout(copiedTimer.current);
			if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
		};
	}, []);

	useEffect(() => {
		if (!summary.ready) return;
		let cancelled = false;
		renderCard(summary).then(
			(blob) => {
				if (cancelled) return;
				// 新しい画像に差し替えてから古いURLを破棄する（保存リンクを途切れさせない）
				const url = URL.createObjectURL(blob);
				if (currentUrl.current) URL.revokeObjectURL(currentUrl.current);
				currentUrl.current = url;
				setImage({ url, blob });
				setImageFailed(false);
			},
			() => {
				if (!cancelled) setImageFailed(true);
			},
		);
		return () => {
			cancelled = true;
		};
	}, [summary]);

	const webxrSettled = [
		...summary.webxr.sessions,
		...summary.webxr.modules,
		...summary.webxr.spaces,
	].every((item) => item.mark !== "checking");
	const stepSources = [
		{ label: "端末とブラウザを確認", done: summary.environment !== null },
		{ label: `WebXRの${summary.webxr.total}項目を判定`, done: webxrSettled },
		{
			label: "WebGPUの機能と上限値を確認",
			done: summary.webgpu.mark !== "checking",
		},
		{
			label: "結果を1枚の画像にまとめる",
			done: image !== null || imageFailed,
		},
	];
	const stepCount = stepSources.length;
	// 上から順に、実際に終わっている段階の数
	const firstUnfinished = stepSources.findIndex((step) => !step.done);
	const finishedSteps = firstUnfinished === -1 ? stepCount : firstUnfinished;

	useEffect(() => {
		if (shownSteps >= finishedSteps) return;
		const wait = reducedMotion.current
			? 0
			: Math.max(
					0,
					STEP_INTERVAL_MS - (performance.now() - lastStepAt.current),
				);
		const timer = setTimeout(() => {
			lastStepAt.current = performance.now();
			setShownSteps((count) => count + 1);
		}, wait);
		return () => clearTimeout(timer);
	}, [shownSteps, finishedSteps]);

	useEffect(() => {
		if (revealed || shownSteps < stepCount) return;
		const timer = setTimeout(
			() => setRevealed(true),
			reducedMotion.current ? 0 : REVEAL_DELAY_MS,
		);
		return () => clearTimeout(timer);
	}, [revealed, shownSteps, stepCount]);

	useEffect(() => {
		if (!revealed || !image || popDone) return;
		const timer = setTimeout(
			() => setPopDone(true),
			reducedMotion.current ? 0 : POP_MS + 40,
		);
		return () => clearTimeout(timer);
	}, [revealed, image, popDone]);

	// 判定中は画像ができていても出さない。ボタンも結果と同時に使えるようにする
	const shownImage = revealed ? image : null;
	const failed = revealed && !image && imageFailed;
	const steps: JudgingStep[] = stepSources.map((step, index) => ({
		label: step.label,
		state:
			index < shownSteps
				? index === stepCount - 1 && !image
					? "failed"
					: "done"
				: index === shownSteps
					? "active"
					: "pending",
	}));

	const fileName = `bangeo-report-${summary.dateLabel}.png`;
	const altText = reportAltText(summary);
	const shareText = reportShareText(summary);
	const intentHref = `https://x.com/intent/tweet?text=${encodeURIComponent(
		shareText,
	)}&url=${encodeURIComponent(REPORT_URL)}&hashtags=${encodeURIComponent(HASHTAG)}`;

	async function handleCopy() {
		if (!image) return;
		setBlockedShareHref(null);
		if (await copyImageToClipboard(image.blob)) {
			setCopied(true);
			setNotice(
				"画像をコピーしました。投稿欄やチャットにそのまま貼り付けられます。",
			);
			clearTimeout(copiedTimer.current);
			copiedTimer.current = setTimeout(() => setCopied(false), 1600);
		} else {
			setNotice(
				"このブラウザでは画像をコピーできませんでした。「画像を保存」をお使いください。",
			);
		}
	}

	async function handleShare() {
		if (!image) return;
		setBlockedShareHref(null);
		const file = new File([image.blob], fileName, { type: "image/png" });
		if (nativeShare && navigator.canShare({ files: [file] })) {
			try {
				await navigator.share({
					files: [file],
					text: `${shareText}\n${REPORT_URL} #${HASHTAG}`,
				});
				setNotice("");
				return;
			} catch (error) {
				// 共有シートを自分で閉じたときは何もしない
				if (error instanceof DOMException && error.name === "AbortError") {
					return;
				}
				// 共有シートを開けなかったときは、下のXの投稿画面に切り替える
			}
		}

		const imageCopied = await copyImageToClipboard(image.blob);
		const opened = window.open(intentHref, "_blank");
		if (opened) {
			opened.opener = null;
			setNotice(
				imageCopied
					? "画像をコピーして、Xの投稿画面を開きました。投稿欄に貼り付けると画像を添付できます。"
					: "Xの投稿画面を開きました。画像は「画像を保存」から保存して添付してください。",
			);
		} else {
			setBlockedShareHref(intentHref);
			setNotice(
				imageCopied
					? "画像をコピーしました。投稿画面を自動で開けなかったので、次のリンクから開いて貼り付けてください。"
					: "投稿画面を自動で開けませんでした。次のリンクから開いてください。",
			);
		}
	}

	const preview = shownImage && (
		<>
			{/* 768px以上: 見開きのまま1枚で見せる */}
			<CardImage
				src={shownImage.url}
				alt={altText}
				className={`hidden h-auto w-full md:block ${frameClass}`}
			/>
			{/* スマートフォン: 横長のままだと文字が読めないので、左右のページを切り出して縦に並べる */}
			<span className="grid gap-3 md:hidden">
				<span className={pageFrameClass}>
					<CardImage
						src={shownImage.url}
						alt={altText}
						className="block h-auto w-[200%] max-w-none"
					/>
				</span>
				<span className={pageFrameClass}>
					<CardImage
						src={shownImage.url}
						alt=""
						className="block h-auto w-[200%] max-w-none -translate-x-1/2"
					/>
				</span>
			</span>
			{/* 収まった直後に外周を一度だけ囲む。出たあとは透明のまま残る */}
			<span
				aria-hidden="true"
				className="pointer-events-none absolute -inset-1.5 rounded-[1.375rem] opacity-0 ring-2 ring-primary-500 motion-safe:animate-report-ring"
			/>
		</>
	);

	const shareButton = (
		<button
			type="button"
			onClick={handleShare}
			disabled={!shownImage}
			className={secondaryButtonClass}
		>
			{nativeShare ? "画像をシェア" : "Xでシェア"}
		</button>
	);

	const saveClass = canCopyImage ? secondaryButtonClass : primaryButtonClass;
	const saveButton = shownImage ? (
		<a href={shownImage.url} download={fileName} className={saveClass}>
			画像を保存
		</a>
	) : (
		<button type="button" disabled className={saveClass}>
			画像を保存
		</button>
	);

	return (
		<section aria-label="この端末の結果">
			<div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
				<div className="min-w-0">
					{/* 「判定完了」が出ても下がずれないよう、行の高さを先に取っておく */}
					<p className="flex min-h-5 items-center gap-2 text-[11px] font-black tracking-[0.14em] text-primary-600">
						BANGEOレポート
						{revealed && (
							<span className="inline-flex items-center gap-1 rounded-full bg-gray-950 px-2 py-1 text-[10px] leading-none tracking-[0.08em] text-white motion-safe:animate-report-check">
								<span aria-hidden="true">✓</span>
								判定完了
							</span>
						)}
					</p>
					<p
						aria-live="polite"
						className="mt-1.5 text-2xl font-black tracking-tight text-gray-950 md:text-3xl"
					>
						<span
							key={revealed ? "result" : "judging"}
							className={`block ${revealed ? "motion-safe:animate-report-rise" : ""}`}
						>
							{revealed ? "この端末の結果" : "この端末を判定中"}
						</span>
					</p>
					<p className="mt-1.5 text-sm font-bold text-gray-700 [overflow-wrap:anywhere]">
						{summary.environment?.label ?? "環境を確認中…"}
					</p>
				</div>

				<div className="flex flex-wrap gap-2">
					{canCopyImage ? (
						<>
							<button
								type="button"
								onClick={handleCopy}
								disabled={!shownImage}
								// 「コピーしました」に変わっても隣のボタンが動かない幅にしておく
								className={`${primaryButtonClass} min-w-[9rem]`}
							>
								{copied ? "コピーしました" : "画像をコピー"}
							</button>
							{shareButton}
							{saveButton}
						</>
					) : (
						<>
							{saveButton}
							{shareButton}
						</>
					)}
				</div>
			</div>

			{/* 判定中の枠の上に結果画像を重ねて出すので、同じマスに置く */}
			<div className="mt-5 grid">
				{(!shownImage || !popDone) && (
					// 画像ができたときに下の内容が動かないよう、同じ形の枠を先に置く
					<div className={`grid gap-3 md:block ${previewBoxClass}`}>
						<div className="relative flex aspect-[1000/1414] items-center justify-center overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 px-4 md:aspect-[2000/1414]">
							{failed ? (
								<p className="text-center text-sm text-gray-500">
									画像を作成できませんでした。結果は下の一覧で確認できます。
								</p>
							) : (
								<>
									{/* 段階が進むたびに伸びる線。結果画像の上端の帯と同じ位置・同じ色にする */}
									<span
										aria-hidden="true"
										className="absolute inset-x-0 top-0 h-1 origin-left bg-primary-600 transition-transform duration-300 ease-settle motion-reduce:transition-none"
										style={{
											transform: `scaleX(${shownSteps / stepCount})`,
										}}
									/>
									<JudgingSteps steps={steps} leaving={revealed} />
								</>
							)}
						</div>
						<div
							aria-hidden="true"
							className={`aspect-[1000/1414] rounded-2xl border border-gray-200 bg-gray-50 md:hidden ${
								failed ? "" : "motion-safe:animate-pulse"
							}`}
						/>
					</div>
				)}
				{shownImage && canCopyImage && (
					<button
						type="button"
						onClick={handleCopy}
						aria-describedby={hintId}
						className={`group relative block cursor-copy text-left transition-transform active:scale-[0.995] motion-safe:animate-report-pop motion-reduce:transition-none ${previewBoxClass}`}
					>
						{preview}
						<span
							aria-hidden="true"
							className={`pointer-events-none absolute right-3 top-3 rounded-full bg-gray-950 px-3 py-1.5 text-xs font-bold text-white transition-opacity duration-200 motion-reduce:transition-none ${
								copied
									? "opacity-100"
									: "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"
							}`}
						>
							{copied ? "コピーしました" : "クリックでコピー"}
						</span>
					</button>
				)}
				{shownImage && !canCopyImage && (
					<a
						href={shownImage.url}
						download={fileName}
						aria-describedby={hintId}
						className={`group relative block motion-safe:animate-report-pop ${previewBoxClass}`}
					>
						{preview}
					</a>
				)}
			</div>

			<p
				role="status"
				className="mt-3 min-h-5 text-xs leading-relaxed text-gray-700"
			>
				{notice}
				{blockedShareHref && (
					<>
						{" "}
						<a
							href={blockedShareHref}
							target="_blank"
							rel="noopener noreferrer"
							className="font-bold text-primary-600 underline underline-offset-2 hover:no-underline"
						>
							Xの投稿画面を開く
						</a>
					</>
				)}
			</p>
			<p id={hintId} className="mt-1 text-xs leading-relaxed text-gray-500">
				{canCopyImage
					? "画像を押すとコピーできます。"
					: "画像を押すと保存できます。"}
				端末名・ブラウザ・GPUの種類が入るので、共有する前に内容をご確認ください。
			</p>
		</section>
	);
}
