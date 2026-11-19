"use client";

import { useEffect, useRef, useState } from "react";
import {
	CARD_HEIGHT,
	CARD_WIDTH,
	drawReportCard,
} from "@/lib/report/card-image";
import {
	type ReportMark,
	type ReportSummary,
	reportAltText,
	reportShareText,
	reportStatusLabel,
} from "@/lib/report/summary";
import { SITE_URL } from "@/lib/site-url";
import { MarkBadge } from "./report-mark";
import { useReport } from "./report-provider";

const REPORT_URL = `${SITE_URL}/report`;
const HASHTAG = "bangeo_webxr";
const MASCOT_SRC = "/favicon.png";

const primaryButtonClass =
	"inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full bg-primary-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-primary-700 active:scale-[0.98] disabled:cursor-default disabled:opacity-45 disabled:hover:bg-primary-600 disabled:active:scale-100";

const secondaryButtonClass =
	"inline-flex min-h-10 items-center justify-center whitespace-nowrap rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition hover:border-gray-950 hover:text-gray-950 active:scale-[0.98] disabled:cursor-default disabled:opacity-45 disabled:hover:border-gray-200 disabled:hover:text-gray-700 disabled:active:scale-100";

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

const CARD_MARKS: readonly ReportMark[] = ["yes", "no", "unknown", "checking"];

function cardTextSample(summary: ReportSummary): string {
	return [
		"BANGEO対応レポートこの端末のWebXR・WebGPU対応機能モジュールAPIを検出（features）非公開ソフトウェア描画ブラウザAPIの検出に基づく簡易チェック不明な",
		// 判定の言葉は表示名の定義から取る（言い回しを変えたときに読み込み漏れを出さない）
		...CARD_MARKS.map(reportStatusLabel),
		summary.environment?.label ?? "",
		summary.webgpu.adapterVendor ?? "",
		summary.webgpu.adapterDetail ?? "",
		...summary.webxr.modules.map((item) => item.name),
	].join("");
}

async function renderCard(summary: ReportSummary): Promise<Blob> {
	const fontFamily =
		getComputedStyle(document.body).fontFamily || "system-ui, sans-serif";
	const [mascot] = await Promise.all([
		loadMascot(),
		loadCardFonts(fontFamily, cardTextSample(summary)),
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
		await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
		return true;
	} catch {
		return false;
	}
}

/**
 * この端末の結果を1枚の画像にして見せる。ページを開いた時点で自動的に作り、
 * 保存・コピー・シェアをここから行う。
 */
export function ReportCard() {
	const { summary } = useReport();
	const [image, setImage] = useState<{ url: string; blob: Blob } | null>(null);
	const [imageFailed, setImageFailed] = useState(false);
	const [nativeShare, setNativeShare] = useState(false);
	// 現行の主要ブラウザは画像のコピーに対応しているので、ボタンは最初から出しておき、
	// 使えない環境だと分かったときだけ外す（表示後にボタンが増えて位置がずれるのを避ける）
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
	const shareText = reportShareText(summary);
	const intentHref = `https://x.com/intent/tweet?text=${encodeURIComponent(
		shareText,
	)}&url=${encodeURIComponent(REPORT_URL)}&hashtags=${encodeURIComponent(HASHTAG)}`;

	async function handleCopy() {
		if (!image) return;
		setBlockedShareHref(null);
		if (await copyImageToClipboard(image.blob)) {
			setCopied(true);
			setNotice("画像をコピーしました。投稿欄やチャットに貼り付けられます。");
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

	const { webxr, webgpu } = summary;

	return (
		<section
			aria-label="この端末の結果"
			className="grid gap-6 md:grid-cols-[minmax(0,21rem)_minmax(0,1fr)] md:items-center md:gap-10"
		>
			<div className="mx-auto w-full max-w-sm md:max-w-none">
				{image ? (
					<a
						href={image.url}
						download={fileName}
						className="block overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(9,9,11,0.06),0_8px_24px_-12px_rgba(9,9,11,0.2)] transition hover:border-gray-400 active:scale-[0.99]"
					>
						{/* biome-ignore lint/performance/noImgElement: ブラウザ内で作ったblob画像。長押し・右クリックでそのまま保存できるよう素のimgで出す */}
						<img
							src={image.url}
							alt={reportAltText(summary)}
							width={CARD_WIDTH}
							height={CARD_HEIGHT}
							className="block h-auto w-full"
						/>
						<span className="sr-only">（押すと画像を保存します）</span>
					</a>
				) : (
					<div
						className={`flex aspect-[4/5] items-center justify-center rounded-2xl border border-gray-200 bg-gray-50 px-6 text-center text-sm text-gray-500 ${
							imageFailed ? "" : "motion-safe:animate-pulse"
						}`}
					>
						{imageFailed
							? "画像を作成できませんでした。結果は下の一覧で確認できます。"
							: "この端末を判定しています…"}
					</div>
				)}
			</div>

			<div className="min-w-0">
				<p className="text-[11px] font-black tracking-[0.14em] text-primary-600">
					レポート
				</p>
				<p className="mt-2 text-2xl font-black tracking-tight text-gray-950 md:text-3xl">
					この端末の結果
				</p>
				<p className="mt-2 text-sm font-bold text-gray-700 [overflow-wrap:anywhere]">
					{summary.environment?.label ?? "環境を確認中…"}
				</p>

				{/* スマートフォンでは画像がそのまま読めるので、同じ内容の文字の要約は出さない */}
				<dl className="mt-5 hidden space-y-3 text-sm md:block">
					<div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
						<dt className="w-24 shrink-0 text-xs font-bold text-gray-500">
							セッション
						</dt>
						<dd className="flex flex-wrap gap-1.5">
							{webxr.sessions.map((item) => (
								<MarkBadge key={item.id} mark={item.mark}>
									{item.name}
									<span className="sr-only">
										：{reportStatusLabel(item.mark)}
									</span>
								</MarkBadge>
							))}
						</dd>
					</div>
					<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<dt className="w-24 shrink-0 text-xs font-bold text-gray-500">
							WebXRの機能
						</dt>
						<dd className="font-bold text-gray-950">
							{summary.ready
								? `${webxr.modules.length}件中 ${webxr.moduleYes}件のAPIを検出`
								: "確認中…"}
						</dd>
					</div>
					<div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
						<dt className="w-24 shrink-0 text-xs font-bold text-gray-500">
							WebGPU
						</dt>
						<dd className="font-bold text-gray-950">
							{webgpu.mark === "yes"
								? `対応（${webgpu.featureTotal}機能中 ${webgpu.featureYes}機能を検出）`
								: webgpu.mark === "checking"
									? "確認中…"
									: reportStatusLabel(webgpu.mark)}
						</dd>
					</div>
				</dl>

				<div className="mt-6 flex flex-wrap gap-2">
					<button
						type="button"
						onClick={handleShare}
						disabled={!image}
						className={primaryButtonClass}
					>
						{nativeShare ? "画像をシェア" : "Xでシェア"}
					</button>
					{canCopyImage && (
						<button
							type="button"
							onClick={handleCopy}
							disabled={!image}
							// 「コピーしました」に変わっても隣のボタンが動かない幅にしておく
							className={`${secondaryButtonClass} min-w-[8.5rem]`}
						>
							{copied ? "コピーしました" : "画像をコピー"}
						</button>
					)}
					{image ? (
						<a
							href={image.url}
							download={fileName}
							className={secondaryButtonClass}
						>
							画像を保存
						</a>
					) : (
						<button type="button" disabled className={secondaryButtonClass}>
							画像を保存
						</button>
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
				<p className="mt-1 text-xs leading-relaxed text-gray-500">
					画像そのものを押しても保存できます。端末名・ブラウザ・GPUの種類が入るので、共有する前に内容をご確認ください。
				</p>
			</div>
		</section>
	);
}
