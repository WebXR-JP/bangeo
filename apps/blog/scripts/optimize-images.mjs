import { existsSync } from "node:fs";
import { readdir, rename, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.resolve(__dirname, "../public");

const MAX_THUMB_WIDTH = 640;
const MAX_OG_WIDTH = 1200;
const NO_IMAGE_WIDTH = 640;
const NO_IMAGE_HEIGHT = 360;

async function ensureNoImagePlaceholder() {
	const outputPath = path.join(publicDir, "no-image.webp");
	const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${NO_IMAGE_WIDTH}" height="${NO_IMAGE_HEIGHT}" viewBox="0 0 ${NO_IMAGE_WIDTH} ${NO_IMAGE_HEIGHT}">
  <rect width="${NO_IMAGE_WIDTH}" height="${NO_IMAGE_HEIGHT}" fill="#f3f4f6"/>
  <rect x="220" y="110" width="200" height="140" rx="8" fill="#e5e7eb"/>
  <circle cx="270" cy="155" r="14" fill="#d1d5db"/>
  <path d="M220 250l52-52 36 36 58-58 74 74v20H220z" fill="#d1d5db"/>
</svg>`;

	await sharp(Buffer.from(svg)).webp({ quality: 80 }).toFile(outputPath);
	console.log("generated no-image.webp");
}

async function walk(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];

	for (const entry of entries) {
		const fullPath = path.join(dir, entry.name);
		if (entry.isDirectory()) {
			if (entry.name === "demos" || entry.name === "demo") continue;
			files.push(...(await walk(fullPath)));
			continue;
		}

		if (/\.(png|jpe?g|gif)$/i.test(entry.name)) {
			files.push(fullPath);
		}
	}

	return files;
}

async function writeOptimized(filePath, pipeline) {
	const buffer = await pipeline.toBuffer();
	const tempPath = `${filePath}.optimized.tmp`;
	await writeFile(tempPath, buffer);
	await rename(tempPath, filePath);
}

async function writeWebpVariant(filePath, { force = false } = {}) {
	if (!/\.(png|jpe?g)$/i.test(filePath)) return;
	const webpPath = filePath.replace(/\.(png|jpe?g)$/i, ".webp");
	// 既にwebpがあるなら再生成しない（毎ビルドでコミット済みwebpが書き換わるのを防ぐ）。
	// 元画像をリサイズした直後だけ force で作り直す。
	if (!force && existsSync(webpPath)) return;
	await sharp(filePath).webp({ quality: 80 }).toFile(webpPath);
	console.log(
		`updated webp variant: ${path.relative(publicDir, webpPath).replace(/\\/g, "/")}`,
	);
}

async function optimizeFile(filePath) {
	const relative = path.relative(publicDir, filePath).replace(/\\/g, "/");
	const ext = path.extname(filePath).toLowerCase();

	if (relative === "favicon.png") {
		return;
	}

	if (relative === "ogp.png" || relative === "ogp.webp") {
		return;
	}

	if (relative === "no-image.png" || relative === "no-image.webp") {
		return;
	}

	if (relative.endsWith(".optimized.tmp")) {
		return;
	}

	const maxWidth = relative.includes("ogp") ? MAX_OG_WIDTH : MAX_THUMB_WIDTH;
	const info = await stat(filePath);

	if (ext === ".gif") {
		const webpPath = filePath.replace(/\.gif$/i, ".webp");
		if (existsSync(webpPath)) return;
		await sharp(filePath, { animated: false })
			.resize(maxWidth, null, { withoutEnlargement: true })
			.webp({ quality: 80 })
			.toFile(webpPath);
		console.log(
			`converted ${relative} -> ${path.relative(publicDir, webpPath).replace(/\\/g, "/")} (${Math.round(info.size / 1024)}KB)`,
		);
		return;
	}

	const image = sharp(filePath);
	const metadata = await image.metadata();
	if (!metadata.width || metadata.width <= maxWidth) {
		if (ext === ".png" || ext === ".jpg" || ext === ".jpeg") {
			await writeWebpVariant(filePath);
		}
		return;
	}

	await writeOptimized(
		filePath,
		sharp(filePath).resize(maxWidth, null, { withoutEnlargement: true }),
	);
	console.log(`resized ${relative} (${Math.round(info.size / 1024)}KB)`);
	await writeWebpVariant(filePath, { force: true });
}

await ensureNoImagePlaceholder();

const files = await walk(publicDir);

for (const file of files) {
	await optimizeFile(file);
}

console.log("Done.");
