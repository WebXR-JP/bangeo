import type { ReactNode } from "react";
import type { ReportMark } from "@/lib/report/summary";
import type { SpecSupport } from "@/lib/webxr-spec-catalog";

/**
 * 判定を表すバッジ。色だけで意味を伝えないよう、記号と文字を必ず一緒に出す。
 * 色は globals.css の data-* トークン（対応=青 / 要確認=アンバー）と灰だけを使う。
 */
const tone: Record<ReportMark, string> = {
	yes: "bg-data-yes-soft text-data-yes-ink",
	no: "bg-gray-100 text-gray-600",
	unknown: "bg-data-ask-soft text-data-ask",
	checking: "bg-gray-100 text-gray-400 motion-safe:animate-pulse",
};

const symbol: Record<ReportMark, string> = {
	yes: "✓",
	no: "–",
	unknown: "?",
	checking: "…",
};

export function supportToMark(support: SpecSupport | undefined): ReportMark {
	if (support === "supported") return "yes";
	if (support === "unsupported") return "no";
	if (support === "unknown") return "unknown";
	return "checking";
}

/** 結果画像と同じ見え方: 確認できた項目は塗りで目立たせ、使えない項目は淡くして引っ込める */
const dotTone: Record<ReportMark, string> = {
	yes: "bg-data-yes text-white",
	no: "bg-gray-100 text-gray-500",
	unknown: "bg-data-ask text-white",
	checking: "bg-gray-100 text-gray-400 motion-safe:animate-pulse",
};

/** 記号だけの丸。隣に項目名を置いて使う（状態の言葉は読み上げ用に別途添える） */
export function MarkDot({ mark }: { mark: ReportMark }) {
	return (
		<span
			aria-hidden="true"
			className={`inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-black ${dotTone[mark]}`}
		>
			{symbol[mark]}
		</span>
	);
}

export function MarkBadge({
	mark,
	children,
	className = "",
}: {
	mark: ReportMark;
	children?: ReactNode;
	className?: string;
}) {
	return (
		<span
			className={`inline-flex items-center justify-center gap-1 whitespace-nowrap rounded-full px-2.5 py-1 text-[11px] font-bold ${tone[mark]} ${className}`}
		>
			<span aria-hidden="true">{symbol[mark]}</span>
			{children}
		</span>
	);
}
