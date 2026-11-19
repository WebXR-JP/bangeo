/**
 * レポートの結果画像（縦 4:5、1080×1350px）を Canvas に描く。
 *
 * 画像はこのブラウザの中だけで作る。縦長にしているのは、スマートフォンの画面幅でも
 * 端末名と判定がそのまま読めるようにするため（横長だと文字が潰れる）。
 *
 * 色は BANGEO のデータ用の2色（対応=青 / 要確認=アンバー）と灰だけを使い、
 * 記号（チェック・横棒・?）を必ず添える。ブランドの rose は判定には使わない。
 */
import {
	type ReportItem,
	type ReportMark,
	type ReportSummary,
	reportStatusLabel,
} from "./summary";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

const MARGIN = 72;
const CONTENT_WIDTH = CARD_WIDTH - MARGIN * 2;
const TILE_GAP = 20;
const TILE_HEIGHT = 116;

const color = {
	background: "#fafaf9",
	surface: "#ffffff",
	ink: "#18181b",
	muted: "#52525b",
	subtle: "#71717a",
	faint: "#8a8a94",
	line: "rgba(9, 9, 11, 0.1)",
	brand: "#e11d48",
	brandInk: "#9f1239",
	yes: "#2a78d6",
	yesInk: "#1c5ca8",
	ask: "#b45309",
	no: "#c3c2b7",
} as const;

export interface CardAssets {
	/** BANGEO のマスコット。読み込めなかったときは null（文字だけで描く） */
	mascot: CanvasImageSource | null;
	/** ページ本文と同じ font-family（Noto Sans JP → システムフォントの順） */
	fontFamily: string;
}

type Weight = 400 | 700 | 900;

function roundedRect(
	ctx: CanvasRenderingContext2D,
	x: number,
	y: number,
	width: number,
	height: number,
	radius: number,
) {
	ctx.beginPath();
	ctx.moveTo(x + radius, y);
	ctx.arcTo(x + width, y, x + width, y + height, radius);
	ctx.arcTo(x + width, y + height, x, y + height, radius);
	ctx.arcTo(x, y + height, x, y, radius);
	ctx.arcTo(x, y, x + width, y, radius);
	ctx.closePath();
}

export function drawReportCard(
	ctx: CanvasRenderingContext2D,
	summary: ReportSummary,
	assets: CardAssets,
): void {
	const font = (weight: Weight, size: number) =>
		`${weight} ${size}px ${assets.fontFamily}`;

	/** 幅に収まるまで文字を小さくし、下限でも収まらなければ末尾を省略する */
	function fitText(
		text: string,
		maxWidth: number,
		weight: Weight,
		maxSize: number,
		minSize: number,
	): string {
		for (let size = maxSize; size >= minSize; size -= 2) {
			ctx.font = font(weight, size);
			if (ctx.measureText(text).width <= maxWidth) return text;
		}
		ctx.font = font(weight, minSize);
		let trimmed = text;
		while (
			trimmed.length > 1 &&
			ctx.measureText(`${trimmed}…`).width > maxWidth
		) {
			trimmed = trimmed.slice(0, -1);
		}
		return `${trimmed}…`;
	}

	function text(
		value: string,
		x: number,
		y: number,
		weight: Weight,
		size: number,
		fill: string,
		align: CanvasTextAlign = "left",
	) {
		ctx.font = font(weight, size);
		ctx.fillStyle = fill;
		ctx.textAlign = align;
		ctx.fillText(value, x, y);
	}

	function tile(x: number, y: number, width: number, height: number) {
		roundedRect(ctx, x, y, width, height, 22);
		ctx.fillStyle = color.surface;
		ctx.fill();
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = color.line;
		ctx.stroke();
	}

	function mark(cx: number, cy: number, radius: number, value: ReportMark) {
		ctx.beginPath();
		ctx.arc(cx, cy, radius, 0, Math.PI * 2);
		ctx.fillStyle =
			value === "yes" ? color.yes : value === "unknown" ? color.ask : color.no;
		ctx.fill();

		ctx.strokeStyle = color.surface;
		ctx.lineWidth = radius * 0.24;
		ctx.lineCap = "round";
		ctx.lineJoin = "round";
		if (value === "yes") {
			ctx.beginPath();
			ctx.moveTo(cx - radius * 0.42, cy + radius * 0.04);
			ctx.lineTo(cx - radius * 0.12, cy + radius * 0.34);
			ctx.lineTo(cx + radius * 0.44, cy - radius * 0.28);
			ctx.stroke();
		} else if (value === "unknown") {
			text(
				"?",
				cx,
				cy + radius * 0.06,
				900,
				radius * 1.25,
				color.surface,
				"center",
			);
		} else {
			ctx.beginPath();
			ctx.moveTo(cx - radius * 0.4, cy);
			ctx.lineTo(cx + radius * 0.4, cy);
			ctx.stroke();
		}
	}

	const statusInk = (value: ReportMark) =>
		value === "yes"
			? color.yesInk
			: value === "unknown"
				? color.ask
				: color.subtle;

	/** 記号 + 見出し + 状態の3点で1つの判定を見せるタイル */
	function verdictTile(
		x: number,
		y: number,
		width: number,
		title: string,
		status: string,
		value: ReportMark,
	) {
		tile(x, y, width, TILE_HEIGHT);
		mark(x + 50, y + TILE_HEIGHT / 2, 26, value);
		const textX = x + 94;
		const fitted = fitText(title, width - 94 - 20, 900, 34, 24);
		ctx.fillStyle = color.ink;
		ctx.textAlign = "left";
		ctx.fillText(fitted, textX, y + 44);
		text(status, textX, y + 84, 700, 22, statusInk(value));
	}

	ctx.textBaseline = "middle";

	// 地の色と、上端のブランド帯
	ctx.fillStyle = color.background;
	ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
	ctx.fillStyle = color.brand;
	ctx.fillRect(0, 0, CARD_WIDTH, 14);

	// ブランド行: どこで確かめた結果かを最初に示す
	let brandX = MARGIN;
	if (assets.mascot) {
		// マスコット画像は白地なので、白い角丸のアイコンとして置く
		ctx.save();
		roundedRect(ctx, MARGIN, 60, 68, 68, 18);
		ctx.fillStyle = color.surface;
		ctx.fill();
		ctx.clip();
		ctx.drawImage(assets.mascot, MARGIN, 60, 68, 68);
		ctx.restore();
		roundedRect(ctx, MARGIN, 60, 68, 68, 18);
		ctx.lineWidth = 1.5;
		ctx.strokeStyle = color.line;
		ctx.stroke();
		brandX += 86;
	}
	text("BANGEO", brandX, 96, 900, 40, color.ink);
	const wordmarkWidth = ctx.measureText("BANGEO").width;
	ctx.fillStyle = color.line;
	ctx.fillRect(brandX + wordmarkWidth + 20, 78, 2, 36);
	text(
		"対応レポート",
		brandX + wordmarkWidth + 40,
		97,
		700,
		26,
		color.brandInk,
	);
	text(
		summary.dateLabel,
		CARD_WIDTH - MARGIN,
		97,
		700,
		24,
		color.faint,
		"right",
	);

	// 見出し: この画像の主役は「どの端末の結果か」
	text("この端末のWebXR・WebGPU対応", MARGIN, 190, 700, 28, color.brandInk);
	const device = fitText(
		summary.environment?.device ?? "不明な端末",
		CONTENT_WIDTH,
		900,
		84,
		48,
	);
	ctx.fillStyle = color.ink;
	ctx.textAlign = "left";
	ctx.fillText(device, MARGIN, 262);
	const browser = fitText(
		summary.environment?.browser ?? "不明なブラウザ",
		CONTENT_WIDTH,
		700,
		38,
		28,
	);
	ctx.fillStyle = color.muted;
	ctx.fillText(browser, MARGIN, 344);

	// WebXR: セッションモード（isSessionSupported の結果）
	const tileWidth = (CONTENT_WIDTH - TILE_GAP * 2) / 3;
	text("WebXR", MARGIN, 428, 900, 36, color.ink);
	summary.webxr.sessions.forEach((item, index) => {
		verdictTile(
			MARGIN + index * (tileWidth + TILE_GAP),
			462,
			tileWidth,
			item.name,
			reportStatusLabel(item.mark),
			item.mark,
		);
	});

	// WebXR: 機能モジュール（ブラウザにAPIがあるか）
	text("機能モジュール", MARGIN, 616, 700, 24, color.muted);
	text(
		`APIを検出 ${summary.webxr.moduleYes} / ${summary.webxr.modules.length}`,
		CARD_WIDTH - MARGIN,
		616,
		700,
		24,
		color.ink,
		"right",
	);
	const columnWidth = (CONTENT_WIDTH - TILE_GAP) / 2;
	const rowHeight = 60;
	summary.webxr.modules.forEach((item: ReportItem, index) => {
		const column = index % 2;
		const row = Math.floor(index / 2);
		const x = MARGIN + column * (columnWidth + TILE_GAP);
		const cy = 644 + row * rowHeight + 26;
		mark(x + 18, cy, 18, item.mark);
		const name = fitText(item.name, columnWidth - 52, 700, 27, 20);
		ctx.fillStyle = item.mark === "no" ? color.subtle : color.ink;
		ctx.textAlign = "left";
		ctx.fillText(name, x + 52, cy + 1);
	});

	// WebGPU
	const { webgpu } = summary;
	text("WebGPU", MARGIN, 1040, 900, 36, color.ink);
	const webgpuTop = 1074;
	verdictTile(
		MARGIN,
		webgpuTop,
		tileWidth,
		"WebGPU",
		reportStatusLabel(webgpu.mark),
		webgpu.mark,
	);

	const featureX = MARGIN + tileWidth + TILE_GAP;
	tile(featureX, webgpuTop, tileWidth, TILE_HEIGHT);
	text(
		webgpu.mark === "yes"
			? `${webgpu.featureYes} / ${webgpu.featureTotal}`
			: "–",
		featureX + 28,
		webgpuTop + 44,
		900,
		40,
		webgpu.mark === "yes" ? color.ink : color.subtle,
	);
	text("機能（features）", featureX + 28, webgpuTop + 86, 700, 20, color.muted);

	const gpuX = MARGIN + (tileWidth + TILE_GAP) * 2;
	tile(gpuX, webgpuTop, tileWidth, TILE_HEIGHT);
	text("GPU", gpuX + 28, webgpuTop + 28, 700, 20, color.muted);
	const gpuWidth = tileWidth - 56;
	if (webgpu.mark === "yes") {
		const vendor = fitText(
			webgpu.adapterVendor ?? "非公開",
			gpuWidth,
			900,
			28,
			20,
		);
		ctx.fillStyle = color.ink;
		ctx.textAlign = "left";
		ctx.fillText(vendor, gpuX + 28, webgpuTop + 62);
		const detail = fitText(
			webgpu.isFallbackAdapter
				? "ソフトウェア描画"
				: (webgpu.adapterDetail ?? ""),
			gpuWidth,
			700,
			20,
			16,
		);
		if (detail) {
			ctx.fillStyle = color.muted;
			ctx.fillText(detail, gpuX + 28, webgpuTop + 94);
		}
	} else {
		text("–", gpuX + 28, webgpuTop + 66, 900, 28, color.subtle);
	}

	// フッター: 見た人が同じことを試せる場所と、判定の前提
	ctx.fillStyle = color.line;
	ctx.fillRect(MARGIN, 1232, CONTENT_WIDTH, 2);
	text("bangeo.net/report", MARGIN, 1278, 900, 30, color.ink);
	text(
		"ブラウザAPIの検出に基づく簡易チェック",
		CARD_WIDTH - MARGIN,
		1279,
		400,
		20,
		color.subtle,
		"right",
	);
}
