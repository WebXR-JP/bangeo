const FALLBACK_DATE = "2026-06-15";

export function parseContentDate(value?: string): Date | undefined {
	if (!value) return undefined;

	const japaneseDate = value.match(/^(\d{4})年(\d{1,2})月(\d{1,2})日$/);
	if (japaneseDate) {
		const [, year, month, day] = japaneseDate;
		return new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
	}

	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? undefined : date;
}

export function contentDateTime(value?: string): string | undefined {
	const date = parseContentDate(value);
	if (!date) return undefined;

	const year = date.getUTCFullYear();
	const month = String(date.getUTCMonth() + 1).padStart(2, "0");
	const day = String(date.getUTCDate()).padStart(2, "0");
	return `${year}-${month}-${day}T00:00:00+09:00`;
}

/**
 * 画面に出す日付。フロントマターの「2026-11-18」も「2026年11月18日」も、
 * 「2026年11月18日」の形にそろえる（月日は0で埋めない）。
 * parseContentDate と同じく UTC の年月日で読むので、サーバーとブラウザで同じ文字列になる
 */
export function formatContentDate(value?: string): string | undefined {
	const date = parseContentDate(value);
	if (!date) return undefined;

	return `${date.getUTCFullYear()}年${date.getUTCMonth() + 1}月${date.getUTCDate()}日`;
}

export function contentDateValue(value?: string): number {
	return parseContentDate(value)?.getTime() ?? 0;
}

export function sitemapDate(value?: string): Date {
	return parseContentDate(value) ?? new Date(`${FALLBACK_DATE}T00:00:00Z`);
}

export function latestContentDate(values: Array<string | undefined>): Date {
	const latest = values
		.map((value) => parseContentDate(value))
		.filter((date): date is Date => Boolean(date))
		.sort((a, b) => b.getTime() - a.getTime())[0];

	return latest ?? new Date(`${FALLBACK_DATE}T00:00:00Z`);
}
