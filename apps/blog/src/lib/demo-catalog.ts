import fs from "node:fs";
import path from "node:path";
import { getExperimentGuide } from "./experiment-guides";

/**
 * `public/demos/<slug>/` に置かれた静的デモのカタログ。
 *
 * デモ本体の正は public/demos 側のHTMLなので、ディレクトリの実体から
 * 一覧・ホーム・検索インデックスを作り、件数やリンク先が実装とずれないようにする。
 */
export interface DemoCatalogEntry {
	slug: string;
	title: string;
	description: string;
	href: string;
	category: "BANGEO" | "8th Wall OSS";
	tags: string[];
	order: number;
}

const ENTRY_FILES = ["index.html", "app.html", "demo.html"] as const;

/** ホームの先頭に並べるデモ。ここにないものは名前順で後ろに続く。 */
const FEATURED_ORDER = [
	"hit-test-advanced",
	"hand-tracking-advanced",
	"immersive-ar-basic",
	"anchors-basic",
	"webxr-audio-space",
	"webgpu-foveation-comparison",
] as const;

const DEMOS_DIR = path.join(process.cwd(), "public", "demos");

let cachedCatalog: DemoCatalogEntry[] | null = null;

function cleanTitle(value: string): string {
	return value
		.replace(/\s*[|｜]\s*BANGEO.*$/i, "")
		.replace(/\s+—\s+8th Wall.*$/i, "")
		.trim();
}

function readTitle(entryPath: string, slug: string): string {
	try {
		const html = fs.readFileSync(entryPath, "utf8");
		const match = html.match(/<title>([^<]*)<\/title>/i);
		const title = match?.[1] ? cleanTitle(match[1]) : "";
		return title || slug;
	} catch {
		return slug;
	}
}

function entryFileFor(dir: string): string | null {
	return (
		ENTRY_FILES.find((file) => fs.existsSync(path.join(dir, file))) ?? null
	);
}

export function getDemoCatalog(): DemoCatalogEntry[] {
	if (cachedCatalog) return cachedCatalog;

	if (!fs.existsSync(DEMOS_DIR)) {
		cachedCatalog = [];
		return cachedCatalog;
	}

	const entries = fs
		.readdirSync(DEMOS_DIR, { withFileTypes: true })
		.filter((entry) => entry.isDirectory() && entry.name !== "_shared")
		.flatMap((entry) => {
			const dir = path.join(DEMOS_DIR, entry.name);
			const entryFile = entryFileFor(dir);
			if (!entryFile) return [];

			const guide = getExperimentGuide(entry.name);
			const is8thWall = entry.name.startsWith("8thwall-");
			const title = readTitle(path.join(dir, entryFile), entry.name);
			const tags = new Set<string>(["WebXR"]);
			const isArDemo =
				is8thWall ||
				guide?.track === "smartphone-ar" ||
				guide?.track === "mr-lab" ||
				["world-effects", "webxr-colocation"].includes(entry.name) ||
				/(^|-)(ar|mr)(-|$)/i.test(entry.name) ||
				/\bAR\b/i.test(title);
			if (isArDemo) {
				tags.add("AR");
			}
			if (guide?.track === "mr-lab" || entry.name === "webxr-colocation") {
				tags.add("MR");
			}
			if (!tags.has("AR") && !tags.has("MR")) {
				tags.add("VR");
			}

			const featuredIndex = FEATURED_ORDER.indexOf(
				entry.name as (typeof FEATURED_ORDER)[number],
			);

			return [
				{
					slug: entry.name,
					title,
					description:
						guide?.summary ??
						(is8thWall
							? `${title}をスマートフォンのブラウザで体験できるWebARデモです。`
							: `${title}をブラウザで体験できるBANGEOのWebXRデモです。`),
					href: `/demos/${entry.name}`,
					category: is8thWall ? "8th Wall OSS" : "BANGEO",
					tags: [...tags],
					order: featuredIndex === -1 ? FEATURED_ORDER.length : featuredIndex,
				} satisfies DemoCatalogEntry,
			];
		})
		.sort((a, b) => {
			if (a.order !== b.order) return a.order - b.order;
			if (a.category !== b.category) {
				return a.category === "BANGEO" ? -1 : 1;
			}
			return a.title.localeCompare(b.title, "ja");
		});

	cachedCatalog = entries;
	return entries;
}
