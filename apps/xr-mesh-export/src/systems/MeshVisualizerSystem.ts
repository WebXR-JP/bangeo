/**
 * MeshVisualizerSystem
 *
 * WebXR Mesh Detection / Plane Detection で検出されたジオメトリを
 * セマンティックラベルに応じた色でワイヤーフレーム / 塗りつぶし表示する。
 * GLB エクスポート用に exportGroup も管理する。
 */

import {
	createSystem,
	XRMesh as XRMeshComponent,
	XRPlane as XRPlaneComponent,
} from "@iwsdk/core";
import { Group, Matrix4, type Mesh } from "three";
import {
	createDetectedMesh,
	createDetectedPlane,
	disposeDetectedMesh,
} from "../lib/detected-geometry.js";
import { exportGroupAsGlb } from "../lib/glb-export.js";
import { pulseHapticFeedback } from "../lib/haptics.js";
import { OverlayController } from "../lib/overlay.js";

// ---- システム本体 -------------------------------------------

export class MeshVisualizerSystem extends createSystem({
	meshEntities: { required: [XRMeshComponent] },
	planeEntities: { required: [XRPlaneComponent] },
}) {
	/** エクスポート対象グループ */
	public exportGroup = new Group();

	private overlay = new OverlayController();
	private matrixBuffer = new Matrix4();

	/** XRMesh (webxr) -> Three.js Mesh のマップ */
	private meshObjects = new Map<globalThis.XRMesh, Mesh>();
	/** XRPlane (webxr) -> Three.js Mesh のマップ */
	private planeObjects = new Map<globalThis.XRPlane, Mesh>();

	/** メッシュの lastChangedTime キャッシュ */
	private meshChangedTime = new WeakMap<globalThis.XRMesh, number>();

	init(): void {
		this.exportGroup.name = "room-export";

		this.xrManager.addEventListener("sessionstart", () => {
			this.overlay.activate();
			this.overlay.updateStatus(0, 0, "Scanning");
			this.exportGroup.clear();
			this.meshObjects.clear();
			this.planeObjects.clear();
			this.scene.add(this.exportGroup);
		});

		this.xrManager.addEventListener("sessionend", () => {
			this.overlay.deactivate();
			this.scene.remove(this.exportGroup);
			this.meshObjects.clear();
			this.planeObjects.clear();
		});

		// ボタンのイベント登録
		const btnExport = document.getElementById(
			"btn-export",
		) as HTMLButtonElement | null;
		const btnReset = document.getElementById(
			"btn-reset",
		) as HTMLButtonElement | null;

		btnExport?.addEventListener("click", () => {
			pulseHapticFeedback();
			this.exportGLB();
		});

		btnReset?.addEventListener("click", () => {
			pulseHapticFeedback();
			this.resetScan();
		});
	}

	update(_delta: number, _time: number): void {
		const frame = this.xrFrame as XRFrame | undefined;
		if (!frame) return;

		const referenceSpace = this.xrManager.getReferenceSpace();
		if (!referenceSpace) return;

		const detectedMeshes = frame.detectedMeshes;
		const detectedPlanes = frame.detectedPlanes;

		if (detectedMeshes) {
			this.syncMeshes(detectedMeshes, frame, referenceSpace);
		}
		if (detectedPlanes) {
			this.syncPlanes(detectedPlanes, frame, referenceSpace);
		}

		this.overlay.updateStatus(
			this.meshObjects.size,
			this.planeObjects.size,
			"Scanning",
		);
	}

	// ---- メッシュ同期 ------------------------------------------

	private syncMeshes(
		detectedMeshes: XRMeshSet,
		frame: XRFrame,
		referenceSpace: XRSpace,
	): void {
		// 削除されたメッシュを取り除く
		for (const [rawMesh, threeMesh] of this.meshObjects) {
			if (!detectedMeshes.has(rawMesh)) {
				this.exportGroup.remove(threeMesh);
				disposeDetectedMesh(threeMesh);
				this.meshObjects.delete(rawMesh);
			}
		}

		// 追加・更新
		for (const rawMesh of detectedMeshes) {
			const pose = frame.getPose(rawMesh.meshSpace, referenceSpace);
			if (!pose) continue;

			this.matrixBuffer.fromArray(pose.transform.matrix);

			const cachedTime = this.meshChangedTime.get(rawMesh);
			const needsRebuild =
				!this.meshObjects.has(rawMesh) ||
				cachedTime !== rawMesh.lastChangedTime;

			if (needsRebuild) {
				const nextMesh = createDetectedMesh(rawMesh);
				const existing = this.meshObjects.get(rawMesh);
				if (existing) {
					disposeDetectedMesh(existing);
					existing.geometry = nextMesh.geometry;
					existing.material = nextMesh.material;
				} else {
					this.exportGroup.add(nextMesh);
					this.meshObjects.set(rawMesh, nextMesh);
				}

				this.meshChangedTime.set(rawMesh, rawMesh.lastChangedTime);
			}

			// ポーズを毎フレーム更新
			const obj = this.meshObjects.get(rawMesh);
			if (obj) {
				obj.position.setFromMatrixPosition(this.matrixBuffer);
				obj.quaternion.setFromRotationMatrix(this.matrixBuffer);
			}
		}
	}

	// ---- プレーン同期 ------------------------------------------

	private syncPlanes(
		detectedPlanes: XRPlaneSet,
		frame: XRFrame,
		referenceSpace: XRSpace,
	): void {
		// 削除されたプレーンを取り除く
		for (const [rawPlane, threeMesh] of this.planeObjects) {
			if (!detectedPlanes.has(rawPlane)) {
				this.exportGroup.remove(threeMesh);
				disposeDetectedMesh(threeMesh);
				this.planeObjects.delete(rawPlane);
			}
		}

		// 追加・更新
		for (const rawPlane of detectedPlanes) {
			const pose = frame.getPose(rawPlane.planeSpace, referenceSpace);
			if (!pose) continue;

			this.matrixBuffer.fromArray(pose.transform.matrix);

			if (!this.planeObjects.has(rawPlane)) {
				const threeMesh = createDetectedPlane(rawPlane);
				if (!threeMesh) continue;

				this.exportGroup.add(threeMesh);
				this.planeObjects.set(rawPlane, threeMesh);
			}

			// ポーズを毎フレーム更新
			const obj = this.planeObjects.get(rawPlane);
			if (obj) {
				obj.position.setFromMatrixPosition(this.matrixBuffer);
				obj.quaternion.setFromRotationMatrix(this.matrixBuffer);
			}
		}
	}

	// ---- GLB エクスポート --------------------------------------

	private exportGLB(): void {
		exportGroupAsGlb(this.exportGroup, {
			onSuccess: (filename) => {
				this.overlay.showToast(`Saved: ${filename}`);
			},
			onError: (error) => {
				console.error("[MeshVisualizerSystem] GLTFExporter error:", error);
				this.overlay.showToast("Export failed");
			},
		});
	}

	// ---- リセット -----------------------------------------------

	private resetScan(): void {
		for (const mesh of this.meshObjects.values()) {
			disposeDetectedMesh(mesh);
		}
		for (const mesh of this.planeObjects.values()) {
			disposeDetectedMesh(mesh);
		}
		this.exportGroup.clear();
		this.meshObjects.clear();
		this.planeObjects.clear();
		this.overlay.updateStatus(0, 0, "Scanning");
		this.overlay.showToast("Scan reset");
	}
}
