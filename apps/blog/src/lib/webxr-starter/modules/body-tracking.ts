/** body-tracking: 全身の関節を点で表示する（PICO等のベンダー拡張） */

import type { FeatureModule, GlBuffer } from "../types";

const CAPACITY = 100;

export function createBodyTrackingModule(): FeatureModule {
	const store = new Float32Array(CAPACITY * 3);
	let buffer: GlBuffer | null = null;
	let count = 0;

	return {
		id: "body-tracking",
		sessionFeatures: ["body-tracking"],
		setup(ctx) {
			buffer = ctx.kit.makeBuffer(store, true);
		},
		update(ctx, frame) {
			count = 0;
			if (!frame.body || !frame.getPose) return;
			for (const jointSpace of frame.body.values()) {
				if (count >= CAPACITY) break;
				const pose = frame.getPose(jointSpace, ctx.space);
				if (!pose) continue;
				const { x, y, z } = pose.transform.position;
				store[count * 3] = x;
				store[count * 3 + 1] = y;
				store[count * 3 + 2] = z;
				count++;
			}
			if (count > 0 && buffer) ctx.kit.updateBuffer(buffer, store);
		},
		render(ctx, viewProjection) {
			if (!buffer || count === 0) return;
			ctx.kit.draw(
				viewProjection,
				null,
				buffer,
				ctx.kit.gl.POINTS,
				[0.99, 0.4, 0.6, 1],
				count,
			);
		},
	};
}
