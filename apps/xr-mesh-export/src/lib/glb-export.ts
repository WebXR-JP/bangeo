import type { Group } from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

type ExportCallbacks = {
	onSuccess: (filename: string) => void;
	onError: (error: unknown) => void;
};

function createTimestamp(date: Date): string {
	const pad = (n: number) => String(n).padStart(2, "0");
	return (
		`${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
		`-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`
	);
}

function downloadArrayBuffer(buffer: ArrayBuffer, filename: string): void {
	const blob = new Blob([buffer], { type: "model/gltf-binary" });
	const url = URL.createObjectURL(blob);
	const anchor = document.createElement("a");
	anchor.href = url;
	anchor.download = filename;
	anchor.style.display = "none";

	document.body.appendChild(anchor);
	anchor.click();
	document.body.removeChild(anchor);
	window.setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export function exportGroupAsGlb(
	group: Group,
	callbacks: ExportCallbacks,
): void {
	const filename = `room-${createTimestamp(new Date())}.glb`;
	const exporter = new GLTFExporter();

	exporter.parse(
		group,
		(result: ArrayBuffer | { [key: string]: unknown }) => {
			if (!(result instanceof ArrayBuffer)) {
				callbacks.onError(new Error("GLB export did not return binary data"));
				return;
			}

			downloadArrayBuffer(result, filename);
			callbacks.onSuccess(filename);
		},
		(error: ErrorEvent) => {
			callbacks.onError(error);
		},
		{ binary: true },
	);
}
