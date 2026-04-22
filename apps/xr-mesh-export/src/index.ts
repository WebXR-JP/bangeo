/**
 * xr-mesh-export — エントリーポイント
 *
 * Meta Quest 3 / 3S / Pro の WebXR Mesh Detection / Plane Detection を使い、
 * 検出したルームメッシュをワイヤーフレームで可視化し GLB としてエクスポートする。
 */

import {
	buildSessionInit,
	normalizeReferenceSpec,
	type ReferenceSpaceType,
	resolveReferenceSpaceType,
	SceneUnderstandingSystem,
	SessionMode,
	World,
} from "@iwsdk/core";
import { MeshVisualizerSystem } from "./systems/MeshVisualizerSystem.js";

const container = document.getElementById("scene-container") as HTMLDivElement;

const xrOptions = {
	sessionMode: SessionMode.ImmersiveAR,
	features: {
		meshDetection: { required: true } as const,
		planeDetection: true as const,
		anchors: true as const,
		handTracking: true as const,
	},
};

World.create(container, {
	xr: {
		...xrOptions,
		// IWSDKのオファーフローを無効にして、dom-overlay付きでセッションを手動起動する
		offer: "none",
	},
	render: {
		defaultLighting: false,
	},
	features: {
		// SceneUnderstandingSystem は手動で registerSystem する
		sceneUnderstanding: false,
	},
}).then((world) => {
	// SceneUnderstandingSystem: XRMesh/XRPlane エンティティの自動管理
	world.registerSystem(SceneUnderstandingSystem);

	// カスタム色分け・GLBエクスポートシステム
	world.registerSystem(MeshVisualizerSystem);

	// dom-overlay を含むセッションを手動で開始する
	launchARWithDomOverlay(world);
});

/**
 * dom-overlay を含む immersive-ar セッションを起動する。
 * IWSDKの buildSessionInit に dom-overlay を追加してから requestSession する。
 */
async function launchARWithDomOverlay(world: World): Promise<void> {
	const overlayRoot = document.getElementById("overlay-root");

	if (!navigator.xr) {
		console.warn("[xr-mesh-export] WebXR not available");
		return;
	}

	// セッション終了時に再オファーするループ
	const offerSession = async () => {
		if (world.session) return;

		try {
			const baseInit = buildSessionInit(xrOptions);
			const sessionInit: XRSessionInit & { domOverlay?: { root: Element } } = {
				...baseInit,
				optionalFeatures: [...(baseInit.optionalFeatures ?? []), "dom-overlay"],
				...(overlayRoot ? { domOverlay: { root: overlayRoot } } : {}),
			};

			const session = await navigator.xr!.requestSession(
				"immersive-ar",
				sessionInit,
			);

			const refSpec = normalizeReferenceSpec(
				xrOptions as Parameters<typeof normalizeReferenceSpec>[0],
			);
			session.addEventListener("end", () => {
				world.session = undefined;
				// セッション終了後に再オファー
				setTimeout(offerSession, 500);
			});

			// disable built-in occlusion (IWSDK 内部と同じ処理)
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
		} catch (err) {
			console.error("[xr-mesh-export] Session request failed:", err);
		}
	};

	offerSession();
}
