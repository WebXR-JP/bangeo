import {
	buildSessionInit,
	normalizeReferenceSpec,
	type ReferenceSpaceType,
	resolveReferenceSpaceType,
	SessionMode,
	type World,
} from "@iwsdk/core";

export const xrMeshExportOptions = {
	sessionMode: SessionMode.ImmersiveAR,
	features: {
		meshDetection: { required: true } as const,
		planeDetection: true as const,
		anchors: true as const,
		handTracking: true as const,
	},
};

export async function launchARWithDomOverlay(world: World): Promise<void> {
	const overlayRoot = document.getElementById("overlay-root");

	const xr = navigator.xr;
	if (!xr) {
		console.warn("[xr-mesh-export] WebXR not available");
		return;
	}

	const offerSession = async () => {
		if (world.session) return;

		try {
			const baseInit = buildSessionInit(xrMeshExportOptions);
			const sessionInit: XRSessionInit & { domOverlay?: { root: Element } } = {
				...baseInit,
				optionalFeatures: [...(baseInit.optionalFeatures ?? []), "dom-overlay"],
				...(overlayRoot ? { domOverlay: { root: overlayRoot } } : {}),
			};

			const session = await xr.requestSession("immersive-ar", sessionInit);

			const refSpec = normalizeReferenceSpec(
				xrMeshExportOptions as Parameters<typeof normalizeReferenceSpec>[0],
			);
			session.addEventListener("end", () => {
				world.session = undefined;
				window.setTimeout(offerSession, 500);
			});

			(
				world.renderer.xr as unknown as { getDepthSensingMesh: () => null }
			).getDepthSensingMesh = () => null;

			const resolvedType = await resolveReferenceSpaceType(
				session,
				refSpec.type as ReferenceSpaceType,
				refSpec.required ? [] : (refSpec.fallbackOrder as ReferenceSpaceType[]),
			);
			world.renderer.xr.setReferenceSpaceType(resolvedType);
			await world.renderer.xr.setSession(session);
			world.session = session;
		} catch (error) {
			console.error("[xr-mesh-export] Session request failed:", error);
		}
	};

	await offerSession();
}
