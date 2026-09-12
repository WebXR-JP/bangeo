import type { SpecCheckId, SpecSupport } from "./webxr-spec-catalog";

interface MinimalXRSystem {
	isSessionSupported(
		mode: "inline" | "immersive-vr" | "immersive-ar",
	): Promise<boolean>;
}

function getXR(): MinimalXRSystem | null {
	if (typeof navigator === "undefined") return null;
	const nav = navigator as Navigator & { xr?: MinimalXRSystem };
	return nav.xr ?? null;
}

function hasInterface(name: string): boolean {
	if (typeof window === "undefined") return false;
	return (
		typeof (window as unknown as Record<string, unknown>)[name] !== "undefined"
	);
}

function prototypeHas(interfaceName: string, prop: string): boolean {
	if (typeof window === "undefined") return false;
	const ctor = (window as unknown as Record<string, unknown>)[interfaceName] as
		| { prototype?: object }
		| undefined;
	return Boolean(ctor?.prototype && prop in ctor.prototype);
}

async function sessionSupported(
	mode: "inline" | "immersive-vr" | "immersive-ar",
): Promise<SpecSupport> {
	const xr = getXR();
	if (!xr) return "unsupported";
	try {
		return asSupport(await xr.isSessionSupported(mode));
	} catch {
		return "unknown";
	}
}

const asSupport = (value: boolean): SpecSupport =>
	value ? "supported" : "unsupported";

const specChecks: Record<
	SpecCheckId,
	() => SpecSupport | Promise<SpecSupport>
> = {
	inline: async () => sessionSupported("inline"),
	"immersive-vr": async () => sessionSupported("immersive-vr"),
	"immersive-ar": async () => sessionSupported("immersive-ar"),
	viewer: () => (getXR() ? "supported" : "unsupported"),
	local: () => (getXR() ? "supported" : "unsupported"),
	"local-floor": () => (getXR() ? "unknown" : "unsupported"),
	"bounded-floor": () => (getXR() ? "unknown" : "unsupported"),
	unbounded: () => (getXR() ? "unknown" : "unsupported"),
	gamepads: () => asSupport(prototypeHas("XRInputSource", "gamepad")),
	"hand-input": () => asSupport(hasInterface("XRHand")),
	"hit-test": () => asSupport(hasInterface("XRHitTestSource")),
	anchors: () => asSupport(hasInterface("XRAnchor")),
	"dom-overlays": () => asSupport(prototypeHas("XRSession", "domOverlayState")),
	"depth-sensing": () =>
		asSupport(
			hasInterface("XRCPUDepthInformation") ||
				hasInterface("XRWebGLDepthInformation") ||
				prototypeHas("XRSession", "depthUsage"),
		),
	"mesh-detection": () =>
		asSupport(
			hasInterface("XRMesh") || prototypeHas("XRFrame", "detectedMeshes"),
		),
	"lighting-estimation": () => asSupport(hasInterface("XRLightEstimate")),
	layers: () =>
		asSupport(
			hasInterface("XRProjectionLayer") || hasInterface("XRMediaBinding"),
		),
	"webgpu-binding": () => asSupport(hasInterface("XRGPUBinding")),
	"body-tracking": () =>
		asSupport(hasInterface("XRBody") || prototypeHas("XRFrame", "body")),
};

/** Check failures and timeouts are inconclusive, not proof of missing support. */
export async function checkWebXRSupport(
	onResult: (id: SpecCheckId, support: SpecSupport) => void,
	timeoutMs = 3000,
): Promise<void> {
	await Promise.all(
		(Object.keys(specChecks) as SpecCheckId[]).map(async (id) => {
			let timer: ReturnType<typeof setTimeout> | undefined;
			try {
				const result = await Promise.race([
					Promise.resolve().then(() => specChecks[id]()),
					new Promise<SpecSupport>((resolve) => {
						timer = setTimeout(() => resolve("unknown"), timeoutMs);
					}),
				]);
				onResult(id, result);
			} catch {
				onResult(id, "unknown");
			} finally {
				clearTimeout(timer);
			}
		}),
	);
}
