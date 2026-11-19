/**
 * BANGEOレポートの結果画像（横長の見開き2ページ、2000×1414px）を Canvas に描く。
 *
 * A3を2つ折りにした見開きのつもりで、左ページに確認した環境とWebXR、右ページにWebGPUを置く。
 * 画像の中央（x = CARD_WIDTH / 2）がページの境目なので、画面幅の狭い端末では
 * 左右を切り出して1ページずつ縦に並べて見せられる。
 *
 * 画像はこのブラウザの中だけで作る。文字は下の type で決めた大きさ・太さ・字間の
 * 組み合わせだけを使い、描く場所ごとに数値を書かない（記号の中の「?」だけは記号の大きさに合わせる）。
 * 色は BANGEO のデータ用の2色（対応=青 / 要確認=アンバー）と灰だけを使い、
 * 記号（チェック・横棒・?）を必ず添える。ブランドの rose は判定には使わない。
 */
import {
	type ReportItem,
	type ReportMark,
	type ReportSummary,
	reportStatusLabel,
} from "./summary";

export const CARD_WIDTH = 2000;
export const CARD_HEIGHT = 1414;

const PAGE_WIDTH = CARD_WIDTH / 2;
/** 画像の外周からページ（白い紙）までの余白 */
const SHEET_OUTER = 40;
/** 見開きの中央からページまでの余白 */
const SHEET_INNER = 32;
const SHEET_TOP = 56;
const SHEET_BOTTOM = CARD_HEIGHT - SHEET_OUTER;
const SHEET_WIDTH = PAGE_WIDTH - SHEET_OUTER - SHEET_INNER;
const SHEET_PAD = 56;
const CONTENT_WIDTH = SHEET_WIDTH - SHEET_PAD * 2;
const CONTENT_TOP = SHEET_TOP + SHEET_PAD;
const GAP = 16;
const TILE_HEIGHT = 136;

/** 左右のページで高さをそろえる位置 */
const HEAD_Y = CONTENT_TOP + 32;
const BODY_BOTTOM = 1204;
const FOOT_RULE_Y = 1262;
const FOOT_Y = 1318;

const color = {
	background: "#fafaf9",
	surface: "#ffffff",
	tint: "#f4f4f2",
	ink: "#18181b",
	muted: "#52525b",
	subtle: "#71717a",
	line: "rgba(9, 9, 11, 0.1)",
	brand: "#e11d48",
	brandInk: "#9f1239",
	yes: "#2a78d6",
	yesInk: "#1c5ca8",
	yesSoft: "#eaf2fc",
	ask: "#b45309",
	askSoft: "#fdf1e3",
	no: "#c3c2b7",
} as const;

type Weight = 400 | 700 | 900;

interface TextStyle {
	weight: Weight;
	size: number;
	/** 字間（em）。大きい見出しは詰め、小さいラベルは少し開ける */
	tracking: number;
}

const type = {
	brand: { weight: 900, size: 40, tracking: -0.01 },
	brandSub: { weight: 700, size: 34, tracking: 0.04 },
	meta: { weight: 700, size: 24, tracking: 0.04 },
	eyebrow: { weight: 700, size: 22, tracking: 0.1 },
	device: { weight: 900, size: 112, tracking: -0.025 },
	browser: { weight: 700, size: 44, tracking: -0.005 },
	sectionTitle: { weight: 900, size: 56, tracking: -0.02 },
	pill: { weight: 700, size: 28, tracking: 0.06 },
	groupLabel: { weight: 700, size: 24, tracking: 0.06 },
	groupLabelSub: { weight: 400, size: 22, tracking: 0.02 },
	groupNote: { weight: 400, size: 22, tracking: 0.02 },
	groupCount: { weight: 700, size: 24, tracking: 0.02 },
	tileTitle: { weight: 900, size: 38, tracking: -0.01 },
	tileStatus: { weight: 700, size: 24, tracking: 0.06 },
	tileCaption: { weight: 700, size: 20, tracking: 0.06 },
	tileCaptionSub: { weight: 400, size: 19, tracking: 0.02 },
	tileValue: { weight: 900, size: 40, tracking: -0.01 },
	tileNote: { weight: 400, size: 20, tracking: 0.02 },
	itemLarge: { weight: 700, size: 28, tracking: 0 },
	item: { weight: 700, size: 24, tracking: 0 },
	// feature 名は長いものでも同じ大きさで並ぶよう、項目名より一段小さくする
	itemCode: { weight: 700, size: 22, tracking: 0 },
	itemValue: { weight: 900, size: 26, tracking: 0 },
	itemNote: { weight: 700, size: 21, tracking: 0.02 },
	emptyTitle: { weight: 900, size: 38, tracking: -0.01 },
	emptyNote: { weight: 400, size: 24, tracking: 0.02 },
	footUrl: { weight: 900, size: 30, tracking: 0 },
	footNote: { weight: 400, size: 20, tracking: 0.02 },
	pageNumber: { weight: 700, size: 22, tracking: 0.08 },
} as const satisfies Record<string, TextStyle>;

export interface CardAssets {
	/** BANGEO のマスコット。読み込めなかったときは null（文字だけで描く） */
	mascot: CanvasImageSource | null;
	/** ページ本文と同じ font-family（Noto Sans JP → システムフォントの順） */
	fontFamily: string;
}

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
	// 字間を指定できないブラウザでは、字間なしで描く（位置の計算は同じ式のまま）
	const canTrack = "letterSpacing" in ctx;

	/** 文字の設定を反映し、1文字ごとに付く字間（px）を返す */
	function applyStyle(style: TextStyle, size: number): number {
		ctx.font = `${style.weight} ${size}px ${assets.fontFamily}`;
		const spacing = canTrack ? size * style.tracking : 0;
		if (canTrack) ctx.letterSpacing = `${spacing.toFixed(2)}px`;
		return spacing;
	}

	/** 見た目の幅。最後の文字の後ろに付く字間は含めない */
	function measure(value: string, style: TextStyle, size = style.size): number {
		const spacing = applyStyle(style, size);
		return ctx.measureText(value).width - spacing;
	}

	function text(
		value: string,
		x: number,
		y: number,
		style: TextStyle,
		fill: string,
		align: "left" | "right" | "center" = "left",
		size = style.size,
	) {
		const spacing = applyStyle(style, size);
		ctx.fillStyle = fill;
		ctx.textAlign = align;
		// 字間は最後の文字の後ろにも付くので、右揃え・中央揃えではそのぶんを戻す
		const shift =
			align === "right" ? spacing : align === "center" ? spacing / 2 : 0;
		ctx.fillText(value, x + shift, y);
	}

	/** 幅に収まるまで文字を小さくし、下限でも収まらなければ末尾を省略する */
	function fitText(
		value: string,
		x: number,
		y: number,
		maxWidth: number,
		style: TextStyle,
		minSize: number,
		fill: string,
		align: "left" | "right" | "center" = "left",
	) {
		for (let size = style.size; size >= minSize; size -= 1) {
			if (measure(value, style, size) <= maxWidth) {
				text(value, x, y, style, fill, align, size);
				return;
			}
		}
		let trimmed = value;
		while (
			trimmed.length > 1 &&
			measure(`${trimmed}…`, style, minSize) > maxWidth
		) {
			trimmed = trimmed.slice(0, -1);
		}
		text(`${trimmed}…`, x, y, style, fill, align, minSize);
	}

	function rule(x: number, y: number, width: number) {
		ctx.fillStyle = color.line;
		ctx.fillRect(x, y, width, 2);
	}

	function tile(x: number, y: number, width: number, height: number) {
		// ページ（白）の中では、線を重ねずに地の色の差だけで区切る
		roundedRect(ctx, x, y, width, height, 20);
		ctx.fillStyle = color.tint;
		ctx.fill();
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
				{ weight: 900, size: radius * 1.25, tracking: 0 },
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

	/** 和文の見出しと、仕様上の英語名（features など）を並べる */
	function pairedLabel(
		x: number,
		y: number,
		label: string,
		english: string | null,
		style: TextStyle,
		englishStyle: TextStyle,
	) {
		text(label, x, y, style, color.muted);
		if (english) {
			const offset = measure(label, style) + style.size * 0.6;
			text(english, x + offset, y + 1, englishStyle, color.subtle);
		}
	}

	function groupLabel(
		x: number,
		y: number,
		label: string,
		english: string | null = null,
	) {
		pairedLabel(x, y, label, english, type.groupLabel, type.groupLabelSub);
	}

	/** 記号 + 見出し + 状態の3点で1つの判定を見せるタイル */
	function verdictTile(
		x: number,
		y: number,
		width: number,
		title: string,
		value: ReportMark,
	) {
		tile(x, y, width, TILE_HEIGHT);
		mark(x + 54, y + TILE_HEIGHT / 2, 28, value);
		const textX = x + 102;
		fitText(
			title,
			textX,
			y + 49,
			width - 102 - 20,
			type.tileTitle,
			26,
			color.ink,
		);
		text(
			reportStatusLabel(value),
			textX,
			y + 94,
			type.tileStatus,
			statusInk(value),
		);
	}

	/** 見出し・値・補足の3行で1つの事実を見せるタイル */
	function factTile(
		x: number,
		y: number,
		width: number,
		caption: string,
		captionEnglish: string | null,
		value: string,
		note: string,
	) {
		tile(x, y, width, TILE_HEIGHT);
		const inner = width - 48;
		pairedLabel(
			x + 24,
			y + 32,
			caption,
			captionEnglish,
			type.tileCaption,
			type.tileCaptionSub,
		);
		fitText(value, x + 24, y + 74, inner, type.tileValue, 24, color.ink);
		if (note) {
			fitText(note, x + 24, y + 110, inner, type.tileNote, 15, color.muted);
		}
	}

	/** ページ見出しの右に置く、全体の判定 */
	function statusPill(right: number, cy: number, value: ReportMark) {
		const label = reportStatusLabel(value);
		const height = 56;
		const width = 18 + 40 + 12 + measure(label, type.pill) + 26;
		const left = right - width;
		roundedRect(ctx, left, cy - height / 2, width, height, height / 2);
		ctx.fillStyle =
			value === "yes"
				? color.yesSoft
				: value === "unknown"
					? color.askSoft
					: color.tint;
		ctx.fill();
		mark(left + 18 + 20, cy, 20, value);
		text(label, left + 18 + 40 + 12, cy + 1, type.pill, statusInk(value));
	}

	/** 記号つきの一覧を2列で並べる。カタログの順番のまま、左の列を上から下へ読む */
	function checklist(
		items: readonly ReportItem[],
		x: number,
		firstRowY: number,
		pitch: number,
		style: TextStyle,
		minSize: number,
		markRadius: number,
	) {
		const rows = Math.ceil(items.length / 2);
		const columnGap = GAP * 2;
		const textOffset = markRadius * 2 + 16;
		const needed = (column: readonly ReportItem[]) =>
			Math.max(0, ...column.map((item) => measure(item.name, style))) +
			textOffset;
		// 2列は同じ幅を基本にする。長い名前がある列だけ、もう一方の列の余りを借りて
		// 同じ大きさの文字のまま収める
		const even = (CONTENT_WIDTH - columnGap) / 2;
		const leftNeed = needed(items.slice(0, rows));
		const rightNeed = needed(items.slice(rows));
		let leftWidth = even;
		if (leftNeed > even && rightNeed < even) {
			leftWidth = Math.min(leftNeed, CONTENT_WIDTH - columnGap - rightNeed);
		} else if (rightNeed > even && leftNeed < even) {
			leftWidth = Math.max(leftNeed, CONTENT_WIDTH - columnGap - rightNeed);
		}
		const rightWidth = CONTENT_WIDTH - columnGap - leftWidth;
		items.forEach((item, index) => {
			const second = index >= rows;
			const columnX = second ? x + leftWidth + columnGap : x;
			const cy = firstRowY + (index % rows) * pitch;
			mark(columnX + markRadius, cy, markRadius, item.mark);
			fitText(
				item.name,
				columnX + textOffset,
				cy + 1,
				(second ? rightWidth : leftWidth) - textOffset,
				style,
				minSize,
				item.mark === "no" ? color.subtle : color.ink,
			);
		});
	}

	function sheet(x: number) {
		roundedRect(ctx, x, SHEET_TOP, SHEET_WIDTH, SHEET_BOTTOM - SHEET_TOP, 28);
		ctx.fillStyle = color.surface;
		ctx.fill();
		ctx.lineWidth = 2;
		ctx.strokeStyle = color.line;
		ctx.stroke();
	}

	function footer(x: number, page: number, draw: (left: number) => void) {
		rule(x, FOOT_RULE_Y, CONTENT_WIDTH);
		draw(x);
		text(
			`${page} / 2`,
			x + CONTENT_WIDTH,
			FOOT_Y,
			type.pageNumber,
			color.subtle,
			"right",
		);
	}

	ctx.textBaseline = "middle";
	if ("textRendering" in ctx) ctx.textRendering = "optimizeLegibility";

	// 地の色、上端のブランド帯、2枚のページ
	ctx.fillStyle = color.background;
	ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
	ctx.fillStyle = color.brand;
	ctx.fillRect(0, 0, CARD_WIDTH, 16);
	const leftSheet = SHEET_OUTER;
	const rightSheet = PAGE_WIDTH + SHEET_INNER;
	sheet(leftSheet);
	sheet(rightSheet);

	const tileWidth = (CONTENT_WIDTH - GAP * 2) / 3;

	// ---- 1ページ目: 確認した環境と WebXR ----
	{
		const x = leftSheet + SHEET_PAD;
		const right = x + CONTENT_WIDTH;

		// 題字: どこで確かめた結果かを最初に示す
		let brandX = x;
		if (assets.mascot) {
			// マスコット画像は白地なので、角丸のアイコンとして置く
			const size = 64;
			const top = HEAD_Y - size / 2;
			ctx.save();
			roundedRect(ctx, x, top, size, size, 18);
			ctx.fillStyle = color.surface;
			ctx.fill();
			ctx.clip();
			ctx.drawImage(assets.mascot, x, top, size, size);
			ctx.restore();
			roundedRect(ctx, x, top, size, size, 18);
			ctx.lineWidth = 2;
			ctx.strokeStyle = color.line;
			ctx.stroke();
			brandX += size + 18;
		}
		text("BANGEO", brandX, HEAD_Y, type.brand, color.ink);
		text(
			"レポート",
			brandX + measure("BANGEO", type.brand) + 16,
			HEAD_Y + 1,
			type.brandSub,
			color.brandInk,
		);
		text(
			summary.dateLabel,
			right,
			HEAD_Y + 1,
			type.meta,
			color.subtle,
			"right",
		);

		// この画像の主役は「どの環境の結果か」
		text("確認した環境", x, 240, type.eyebrow, color.brandInk);
		fitText(
			summary.environment?.device ?? "不明な端末",
			// 太い見出しは左端の余白が大きく見えるので、少しだけ左へ寄せる
			x - 4,
			326,
			CONTENT_WIDTH,
			type.device,
			56,
			color.ink,
		);
		// 端末名の「Q」「p」の下に伸びる部分と重ならない間隔を取る
		fitText(
			summary.environment?.browser ?? "不明なブラウザ",
			x,
			434,
			CONTENT_WIDTH,
			type.browser,
			30,
			color.muted,
		);
		rule(x, 490, CONTENT_WIDTH);

		text("WebXR", x, 556, type.sectionTitle, color.ink);

		// セッションモード（isSessionSupported の結果）
		groupLabel(x, 628, "セッションモード");
		text(
			"isSessionSupported の結果",
			right,
			628,
			type.groupNote,
			color.subtle,
			"right",
		);
		summary.webxr.sessions.forEach((item, index) => {
			verdictTile(
				x + index * (tileWidth + GAP),
				656,
				tileWidth,
				item.name,
				item.mark,
			);
		});

		// 機能モジュール（ブラウザにAPIがあるか）
		groupLabel(x, 850, "機能モジュール");
		text(
			`APIを検出 ${summary.webxr.moduleYes} / ${summary.webxr.modules.length}`,
			right,
			850,
			type.groupCount,
			color.ink,
			"right",
		);
		const moduleRows = Math.ceil(summary.webxr.modules.length / 2);
		const modulePitch = 56;
		checklist(
			summary.webxr.modules,
			x,
			BODY_BOTTOM - 20 - (moduleRows - 1) * modulePitch,
			modulePitch,
			type.itemLarge,
			20,
			18,
		);

		footer(x, 1, (left) => {
			text("bangeo.net/report", left, FOOT_Y, type.footUrl, color.ink);
		});
	}

	// ---- 2ページ目: WebGPU ----
	{
		const x = rightSheet + SHEET_PAD;
		const right = x + CONTENT_WIDTH;
		const { webgpu } = summary;

		text("WebGPU", x, HEAD_Y, type.sectionTitle, color.ink);
		statusPill(right, HEAD_Y, webgpu.mark);

		const bodyTop = HEAD_Y + 60;
		if (webgpu.mark === "yes") {
			factTile(
				x,
				bodyTop,
				tileWidth,
				"GPU",
				null,
				webgpu.adapterVendor ?? "非公開",
				webgpu.isFallbackAdapter
					? "ソフトウェア描画"
					: (webgpu.adapterDetail ?? ""),
			);
			factTile(
				x + tileWidth + GAP,
				bodyTop,
				tileWidth,
				"機能",
				"features",
				`${webgpu.featureYes} / ${webgpu.featureTotal}`,
				"対応している項目",
			);
			factTile(
				x + (tileWidth + GAP) * 2,
				bodyTop,
				tileWidth,
				"上限値",
				"limits",
				`${webgpu.limitsAboveDefault} / ${webgpu.limitTotal}`,
				"標準を上回る項目",
			);

			// 機能（requiredFeatures に渡す名前）。右の列まで読んでも順番が変わらないよう、仕様の並びのまま
			const featureTop = bodyTop + TILE_HEIGHT + 58;
			groupLabel(x, featureTop, "機能", "features");
			const featurePitch = 46;
			checklist(
				webgpu.features,
				x,
				featureTop + 54,
				featurePitch,
				type.itemCode,
				17,
				14,
			);

			// 主な上限値。値は右にそろえ、仕様の既定値との比を添える
			const limitPitch = 46;
			const limitFirst =
				BODY_BOTTOM - 22 - (webgpu.limitHighlights.length - 1) * limitPitch;
			if (webgpu.limitHighlights.length > 0) {
				groupLabel(x, limitFirst - 56, "主な上限値", "limits");
				text(
					"仕様の既定値との比",
					right,
					limitFirst - 56,
					type.groupNote,
					color.subtle,
					"right",
				);
			}
			webgpu.limitHighlights.forEach((item, index) => {
				const cy = limitFirst + index * limitPitch;
				fitText(item.title, x, cy + 1, 440, type.item, 18, color.ink);
				text(
					item.value,
					right - 176,
					cy + 1,
					type.itemValue,
					color.ink,
					"right",
				);
				text(
					item.ratioLabel,
					right,
					cy + 1,
					type.itemNote,
					item.aboveDefault ? color.yesInk : color.subtle,
					"right",
				);
			});
		} else {
			// 使えない・確認できない環境では、項目を1件ずつ並べずに理由を1つだけ示す
			const height = BODY_BOTTOM - bodyTop;
			roundedRect(ctx, x, bodyTop, CONTENT_WIDTH, height, 20);
			ctx.fillStyle = color.tint;
			ctx.fill();
			const centerX = x + CONTENT_WIDTH / 2;
			const centerY = bodyTop + height / 2;
			mark(centerX, centerY - 96, 44, webgpu.mark);
			text(
				webgpu.mark === "no"
					? "このブラウザはWebGPUに未対応です"
					: "WebGPUの対応を確認できませんでした",
				centerX,
				centerY + 6,
				type.emptyTitle,
				color.ink,
				"center",
			);
			text(
				webgpu.mark === "no"
					? "navigator.gpu が見つかりませんでした"
					: "GPUアダプターを取得できませんでした",
				centerX,
				centerY + 66,
				type.emptyNote,
				color.muted,
				"center",
			);
		}

		footer(x, 2, (left) => {
			text(
				"ブラウザAPIの検出に基づく簡易チェックです",
				left,
				FOOT_Y,
				type.footNote,
				color.subtle,
			);
		});
	}
}

/**
 * 画像に描く文字を、実際の描画処理を空のコンテキストに1回流して集める。
 * Noto Sans JP は文字ごとに分割配信されるので、描く前にこの文字列でフォントを読み込ませる。
 * 描画の文言を変えても、読み込む文字の指定がずれない。
 */
export function collectCardText(summary: ReportSummary): string {
	// 省略記号は幅を測った結果で付くので、あらかじめ入れておく
	const drawn = ["…"];
	const recorder = new Proxy(
		{},
		{
			get: (_target, property) => {
				if (property === "fillText") {
					return (value: string) => {
						drawn.push(value);
					};
				}
				if (property === "measureText") return () => ({ width: 0 });
				return () => {};
			},
			set: () => true,
		},
	);
	drawReportCard(recorder as unknown as CanvasRenderingContext2D, summary, {
		mascot: null,
		fontFamily: "sans-serif",
	});
	return drawn.join("");
}
