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
import {
	BufferAttribute,
	BufferGeometry,
	DoubleSide,
	Group,
	Matrix4,
	Mesh,
	MeshBasicMaterial,
	Shape,
	ShapeGeometry,
} from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

// ---- カラーマッピング ----------------------------------------

const LABEL_COLOR: Record<string, number> = {
	floor: 0x4ade80,
	wall: 0x60a5fa,
	ceiling: 0xa78bfa,
	table: 0xfb923c,
	couch: 0xfb923c,
	door: 0xfb923c,
	window: 0xfb923c,
};
const DEFAULT_MESH_COLOR = 0x94a3b8;

function colorForLabel(label?: string): number {
	if (!label) return DEFAULT_MESH_COLOR;
	return LABEL_COLOR[label.toLowerCase()] ?? DEFAULT_MESH_COLOR;
}

// ---- DOM ヘルパー -------------------------------------------

function showToast(message: string): void {
	const toast = document.getElementById("toast");
	if (!toast) return;
	toast.textContent = message;
	toast.classList.add("visible");
	setTimeout(() => toast.classList.remove("visible"), 3000);
}

function updateStatus(
	meshCount: number,
	planeCount: number,
	state: string,
): void {
	const elMesh = document.getElementById("status-meshes");
	const elPlane = document.getElementById("status-planes");
	const elState = document.getElementById("status-state");
	if (elMesh) elMesh.textContent = `Meshes: ${meshCount}`;
	if (elPlane) elPlane.textContent = `Planes: ${planeCount}`;
	if (elState) elState.textContent = `Status: ${state}`;
}

function activateOverlay(): void {
	const overlay = document.getElementById("overlay-root");
	if (overlay) overlay.classList.add("active");
}

function deactivateOverlay(): void {
	const overlay = document.getElementById("overlay-root");
	if (overlay) overlay.classList.remove("active");
}

// ---- ハプティクス -------------------------------------------

function hapticPulse(): void {
	try {
		const gamepads = navigator.getGamepads?.() ?? [];
		for (const gp of gamepads) {
			if (!gp) continue;
			// GamepadHapticActuator に pulse が存在しないブラウザ実装を動的に参照する
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const actuator = (gp as any).hapticActuators?.[0];
			if (actuator?.pulse) {
				actuator.pulse(0.5, 100).catch(() => {});
				break;
			}
		}
	} catch (_) {
		// ハプティクス非対応環境ではサイレントに無視
	}
}

// ---- システム本体 -------------------------------------------

export class MeshVisualizerSystem extends createSystem({
	meshEntities: { required: [XRMeshComponent] },
	planeEntities: { required: [XRPlaneComponent] },
}) {
	/** エクスポート対象グループ */
	public exportGroup = new Group();

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
			activateOverlay();
			updateStatus(0, 0, "Scanning");
			this.exportGroup.clear();
			this.meshObjects.clear();
			this.planeObjects.clear();
			this.scene.add(this.exportGroup);
		});

		this.xrManager.addEventListener("sessionend", () => {
			deactivateOverlay();
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
			hapticPulse();
			this.exportGLB();
		});

		btnReset?.addEventListener("click", () => {
			hapticPulse();
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

		updateStatus(this.meshObjects.size, this.planeObjects.size, "Scanning");
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
				(threeMesh.geometry as BufferGeometry).dispose();
				(threeMesh.material as MeshBasicMaterial).dispose();
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
				// ジオメトリを(再)生成
				const geometry = new BufferGeometry();
				geometry.setAttribute(
					"position",
					new BufferAttribute(rawMesh.vertices.slice(), 3),
				);
				geometry.setIndex(new BufferAttribute(rawMesh.indices.slice(), 1));
				geometry.computeVertexNormals();

				const color = colorForLabel(rawMesh.semanticLabel);
				const material = new MeshBasicMaterial({
					color,
					wireframe: true,
					transparent: true,
					opacity: 0.6,
				});

				const existing = this.meshObjects.get(rawMesh);
				if (existing) {
					(existing.geometry as BufferGeometry).dispose();
					(existing.material as MeshBasicMaterial).dispose();
					existing.geometry = geometry;
					existing.material = material;
				} else {
					const threeMesh = new Mesh(geometry, material);
					threeMesh.name = `mesh-${rawMesh.semanticLabel ?? "unknown"}`;
					this.exportGroup.add(threeMesh);
					this.meshObjects.set(rawMesh, threeMesh);
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
				(threeMesh.geometry as BufferGeometry).dispose();
				(threeMesh.material as MeshBasicMaterial).dispose();
				this.planeObjects.delete(rawPlane);
			}
		}

		// 追加・更新
		for (const rawPlane of detectedPlanes) {
			const pose = frame.getPose(rawPlane.planeSpace, referenceSpace);
			if (!pose) continue;

			this.matrixBuffer.fromArray(pose.transform.matrix);

			if (!this.planeObjects.has(rawPlane)) {
				const shape = new Shape();
				const pts = rawPlane.polygon;
				if (pts.length < 3) continue;

				// Y=0 の polygon を XZ 平面 → Three.js ShapeGeometry (XY 平面) に変換
				shape.moveTo(pts[0].x, pts[0].z);
				for (let i = 1; i < pts.length; i++) {
					shape.lineTo(pts[i].x, pts[i].z);
				}
				shape.closePath();

				const geometry = new ShapeGeometry(shape);
				// XY -> XZ に回転して水平/垂直を適切に扱う
				geometry.rotateX(-Math.PI / 2);

				const color = colorForLabel(rawPlane.semanticLabel);
				const material = new MeshBasicMaterial({
					color,
					transparent: true,
					opacity: 0.3,
					side: DoubleSide,
				});

				const threeMesh = new Mesh(geometry, material);
				threeMesh.name = `plane-${rawPlane.orientation ?? "unknown"}-${rawPlane.semanticLabel ?? "unknown"}`;
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
		const exporter = new GLTFExporter();
		const now = new Date();
		const pad = (n: number) => String(n).padStart(2, "0");
		const dateStr =
			`${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
			`-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
		const filename = `room-${dateStr}.glb`;

		exporter.parse(
			this.exportGroup,
			(result: ArrayBuffer | { [key: string]: unknown }) => {
				const blob = new Blob([result as ArrayBuffer], {
					type: "model/gltf-binary",
				});
				const url = URL.createObjectURL(blob);
				const a = document.createElement("a");
				a.href = url;
				a.download = filename;
				a.style.display = "none";
				document.body.appendChild(a);
				a.click();
				document.body.removeChild(a);
				setTimeout(() => URL.revokeObjectURL(url), 10000);
				showToast(`Saved: ${filename}`);
			},
			(error: ErrorEvent) => {
				console.error("[MeshVisualizerSystem] GLTFExporter error:", error);
				showToast("Export failed");
			},
			{ binary: true },
		);
	}

	// ---- リセット -----------------------------------------------

	private resetScan(): void {
		for (const mesh of this.meshObjects.values()) {
			(mesh.geometry as BufferGeometry).dispose();
			(mesh.material as MeshBasicMaterial).dispose();
		}
		for (const mesh of this.planeObjects.values()) {
			(mesh.geometry as BufferGeometry).dispose();
			(mesh.material as MeshBasicMaterial).dispose();
		}
		this.exportGroup.clear();
		this.meshObjects.clear();
		this.planeObjects.clear();
		updateStatus(0, 0, "Scanning");
		showToast("Scan reset");
	}
}
