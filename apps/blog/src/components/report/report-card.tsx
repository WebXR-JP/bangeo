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

/** 画像を置く箱。1ページずつ縦に並べる幅では、ページが大きくなりすぎないよう幅を止める */
const previewBoxClass = "mx-auto w-full max-w-md rounded-2xl md:max-w-none";

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
			className={className}
		/>
	);
}

/**
 * この端末の結果を、見開き2ページの画像（BANGEOレポート）にして見せる。
 * ページを開いた時点で自動的に作り、画像を押すだけでコピーできる。
 */
export function ReportCard() {
	const { summary } = useReport();
	const hintId = useId();
	const [image, setImage] = useState<{ url: string; blob: Blob } | null>(null);
	const [imageFailed, setImageFailed] = useState(false);
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

	const preview = image && (
		<>
			{/* 768px以上: 見開きのまま1枚で見せる */}
			<CardImage
				src={image.url}
				alt={altText}
				className={`hidden h-auto w-full md:block ${frameClass}`}
			/>
			{/* スマートフォン: 横長のままだと文字が読めないので、左右のページを切り出して縦に並べる */}
			<span className="grid gap-3 md:hidden">
				<span className={pageFrameClass}>
					<CardImage
						src={image.url}
						alt={altText}
						className="block h-auto w-[200%] max-w-none"
					/>
				</span>
				<span className={pageFrameClass}>
					<CardImage
						src={image.url}
						alt=""
						className="block h-auto w-[200%] max-w-none -translate-x-1/2"
					/>
				</span>
			</span>
		</>
	);

	const shareButton = (
		<button
			type="button"
			onClick={handleShare}
			disabled={!image}
			className={secondaryButtonClass}
		>
			{nativeShare ? "画像をシェア" : "Xでシェア"}
		</button>
	);

	const saveClass = canCopyImage ? secondaryButtonClass : primaryButtonClass;
	const saveButton = image ? (
		<a href={image.url} download={fileName} className={saveClass}>
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
					<p className="text-[11px] font-black tracking-[0.14em] text-primary-600">
						BANGEOレポート
					</p>
					<p className="mt-1.5 text-2xl font-black tracking-tight text-gray-950 md:text-3xl">
						この端末の結果
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
								disabled={!image}
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

			<div className="mt-5">
				{image && canCopyImage && (
					<button
						type="button"
						onClick={handleCopy}
						aria-describedby={hintId}
						className={`group relative block cursor-copy text-left transition-transform active:scale-[0.995] motion-reduce:transition-none ${previewBoxClass}`}
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
				{image && !canCopyImage && (
					<a
						href={image.url}
						download={fileName}
						aria-describedby={hintId}
						className={`group block ${previewBoxClass}`}
					>
						{preview}
					</a>
				)}
				{!image && (
					// 画像ができたときに下の内容が動かないよう、同じ形の枠を先に置く
					<div className={`grid gap-3 md:block ${previewBoxClass}`}>
						<div
							className={`flex aspect-[1000/1414] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500 md:aspect-[2000/1414] ${
								imageFailed ? "" : "motion-safe:animate-pulse"
							}`}
						>
							{imageFailed
								? "画像を作成できませんでした。結果は下の一覧で確認できます。"
								: "この端末を判定しています…"}
						</div>
						<div
							aria-hidden="true"
							className={`aspect-[1000/1414] rounded-2xl border border-gray-200 bg-gray-50 md:hidden ${
								imageFailed ? "" : "motion-safe:animate-pulse"
							}`}
						/>
					</div>
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
