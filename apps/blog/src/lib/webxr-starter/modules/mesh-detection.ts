/** mesh-detection: 部屋メッシュの頂点を点群で表示する */

import type { FeatureModule, GlBuffer, XRMeshLike } from "../types";

const MAX_MESHES = 6;

export function createMeshDetectionModule(): FeatureModule {
	const cache = new Map<XRMeshLike, GlBuffer>();
	let visible: { buffer: GlBuffer; model: Float32Array | null }[] = [];

	return {
		id: "mesh-detection",
		sessionFeatures: ["mesh-detection"],
		update(ctx, frame) {
			visible = [];
			if (!frame.detectedMeshes || !frame.getPose) return;
			let index = 0;
			for (const mesh of frame.detectedMeshes) {
				if (index >= MAX_MESHES) break;
				index++;
				let buffer = cache.get(mesh);
				if (!buffer) {
					buffer = ctx.kit.makeBuffer(mesh.vertices);
					cache.set(mesh, buffer);
				}
				const pose = frame.getPose(mesh.meshSpace, ctx.space);
				visible.push({ buffer, model: pose ? pose.transform.matrix : null });
			}
		},
		render(ctx, viewProjection) {
			for (const item of visible) {
				ctx.kit.draw(
					viewProjection,
					item.model,
					item.buffer,
					ctx.kit.gl.POINTS,
					[0.4, 0.8, 1, 1],
				);
			}
		},
	};
}
