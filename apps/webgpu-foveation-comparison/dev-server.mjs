import { readFile } from "node:fs/promises";
import { createServer } from "node:http";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT || 8766);
const contentTypes = {
	"/": "text/html; charset=utf-8",
	"/index.html": "text/html; charset=utf-8",
	"/minimum.html": "text/html; charset=utf-8",
	"/maximum.html": "text/html; charset=utf-8",
	"/app.js": "text/javascript; charset=utf-8",
	"/fish.js": "text/javascript; charset=utf-8",
	"/patterns.js": "text/javascript; charset=utf-8",
	"/style.css": "text/css; charset=utf-8",
	"/assets/bangeo-fish.glb": "model/gltf-binary",
	"/assets/bangeo-fish-preview.gif": "image/gif",
	"/assets/bangeo-mark.png": "image/png",
	"/assets/quest-browser-flags-privacy.webp": "image/webp",
	"/assets/quest-browser-demo-privacy.webp": "image/webp",
};

createServer(async (request, response) => {
	const pathname = new URL(request.url, "http://localhost").pathname;
	const type = contentTypes[pathname];
	if (!type) {
		response.writeHead(404).end();
		return;
	}
	try {
		const file = pathname === "/" ? "index.html" : pathname.slice(1);
		response
			.writeHead(200, { "Content-Type": type })
			.end(await readFile(resolve(root, file)));
	} catch {
		response.writeHead(500).end();
	}
}).listen(port, "127.0.0.1", () => {
	console.log(`Preview: http://127.0.0.1:${port}/`);
});
