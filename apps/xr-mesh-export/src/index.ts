/**
 * xr-mesh-export — エントリーポイント
 *
 * Meta Quest 3 / 3S / Pro の WebXR Mesh Detection / Plane Detection を使い、
 * 検出したルームメッシュをワイヤーフレームで可視化し GLB としてエクスポートする。
 */

import { SceneUnderstandingSystem, World } from "@iwsdk/core";
import { MeshVisualizerSystem } from "./systems/MeshVisualizerSystem.js";
import { launchARWithDomOverlay, xrMeshExportOptions } from "./xr-session.js";

function getSceneContainer(): HTMLDivElement {
	const container = document.getElementById("scene-container");
	if (!(container instanceof HTMLDivElement)) {
		throw new Error("[xr-mesh-export] #scene-container is missing");
	}
	return container;
}

async function main(): Promise<void> {
	const world = await World.create(getSceneContainer(), {
		xr: {
			...xrMeshExportOptions,
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
	});

	world.registerSystem(SceneUnderstandingSystem);
	world.registerSystem(MeshVisualizerSystem);

	await launchARWithDomOverlay(world);
}

void main().catch((error) => {
	console.error("[xr-mesh-export] Failed to initialize:", error);
});
