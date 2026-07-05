/** bounded-floor: プレイエリアの境界線を表示する（体験スペース連動） */

import type { FeatureModule, GlBuffer } from "../types";

export function createBoundedFloorModule(): FeatureModule {
	let bounds: GlBuffer | null = null;

	return {
		id: "bounded-floor",
		isActive(_config, refSpaceName) {
			return refSpaceName === "bounded-floor";
		},
		setup(ctx) {
			const geometry = (
				ctx.space as { boundsGeometry?: { x: number; z: number }[] }
			).boundsGeometry;
			if (!geometry?.length) return;
			const out: number[] = [];
			for (const point of geometry) {
				out.push(point.x, 0.02, point.z);
			}
			bounds = ctx.kit.makeBuffer(new Float32Array(out));
		},
		render(ctx, viewProjection) {
			if (!bounds) return;
			ctx.kit.draw(
				viewProjection,
				null,
				bounds,
				ctx.kit.gl.LINE_LOOP,
				[0.2, 0.9, 0.6, 1],
			);
		},
	};
}
