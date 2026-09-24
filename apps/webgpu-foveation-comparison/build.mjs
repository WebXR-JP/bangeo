import { cp, mkdir } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const output = resolve(
	root,
	"../blog/public/demos/webgpu-foveation-comparison",
);
await mkdir(output, { recursive: true });
for (const name of [
	"index.html",
	"minimum.html",
	"maximum.html",
	"app.js",
	"fish.js",
	"patterns.js",
	"controller-guide.js",
	"style.css",
]) {
	await cp(resolve(root, name), resolve(output, name));
}
await cp(resolve(root, "assets"), resolve(output, "assets"), {
	recursive: true,
	filter: (path) => !path.endsWith(".blend"),
});
console.log(`Built ${output}`);
