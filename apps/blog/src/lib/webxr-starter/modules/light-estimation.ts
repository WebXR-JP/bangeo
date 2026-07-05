/** light-estimation: 現実の主光源の方向を線で表示する */

import type { FeatureModule, GlBuffer } from "../types";

export function createLightEstimationModule(): FeatureModule {
	let probe: object | null = null;
	let line: GlBuffer | null = null;
	const store = new Float32Array(6);
	let hasLight = false;

	return {
		id: "light-estimation",
		sessionFeatures: ["light-estimation"],
		async setup(ctx) {
			if (!ctx.session.requestLightProbe) return;
			probe = await ctx.session.requestLightProbe();
			line = ctx.kit.makeBuffer(store, true);
		},
		update(ctx, frame) {
			hasLight = false;
			if (!probe || !frame.getLightEstimate || !line) return;
			const direction = frame.getLightEstimate(probe)?.primaryLightDirection;
			if (!direction) return;
			store[0] = 0;
			store[1] = ctx.cubeY;
			store[2] = -1.5;
			store[3] = direction.x * 0.7;
			store[4] = ctx.cubeY + direction.y * 0.7;
			store[5] = -1.5 + direction.z * 0.7;
			ctx.kit.updateBuffer(line, store);
			hasLight = true;
		},
		render(ctx, viewProjection) {
			if (!line || !hasLight) return;
			ctx.kit.draw(
				viewProjection,
				null,
				line,
				ctx.kit.gl.LINES,
				[1, 0.9, 0.2, 1],
			);
		},
	};
}
