/** hand-tracking: 手の関節を点で表示する */

import type { FeatureModule, GlBuffer } from "../types";

const CAPACITY = 60;

export function createHandTrackingModule(): FeatureModule {
	const store = new Float32Array(CAPACITY * 3);
	let buffer: GlBuffer | null = null;
	let count = 0;

	return {
		id: "hand-tracking",
		sessionFeatures: ["hand-tracking"],
		setup(ctx) {
			buffer = ctx.kit.makeBuffer(store, true);
		},
		update(ctx, frame) {
			count = 0;
			if (!frame.getJointPose) return;
			for (const source of ctx.session.inputSources) {
				if (!source.hand) continue;
				for (const joint of source.hand.values()) {
					if (count >= CAPACITY) break;
					const pose = frame.getJointPose(joint, ctx.space);
					if (!pose) continue;
					const { x, y, z } = pose.transform.position;
					store[count * 3] = x;
					store[count * 3 + 1] = y;
					store[count * 3 + 2] = z;
					count++;
				}
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
				[1, 0.8, 0.3, 1],
				count,
			);
		},
	};
}
