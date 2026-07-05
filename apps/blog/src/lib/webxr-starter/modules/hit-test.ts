/** hit-test: 現実の面にリング状の配置マーカーを表示する */

import { buildRing } from "../gl";
import type { FeatureModule, GlBuffer } from "../types";

export function createHitTestModule(): FeatureModule {
	let source: object | null = null;
	let ring: GlBuffer | null = null;
	let hitModel: Float32Array | null = null;

	return {
		id: "hit-test",
		sessionFeatures: ["hit-test"],
		async setup(ctx) {
			if (!ctx.session.requestHitTestSource) return;
			const viewerSpace = await ctx.session.requestReferenceSpace("viewer");
			source = await ctx.session.requestHitTestSource({ space: viewerSpace });
			ring = ctx.kit.makeBuffer(buildRing(0.12, 32));
		},
		update(ctx, frame) {
			hitModel = null;
			if (!source || !frame.getHitTestResults) return;
			const results = frame.getHitTestResults(source);
			const pose = results[0]?.getPose(ctx.space);
			if (pose) hitModel = pose.transform.matrix;
		},
		render(ctx, viewProjection) {
			if (!ring || !hitModel) return;
			ctx.kit.draw(
				viewProjection,
				hitModel,
				ring,
				ctx.kit.gl.LINE_LOOP,
				[0.2, 0.9, 0.6, 1],
			);
		},
	};
}
