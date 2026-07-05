/** depth-sensing: 視線の先の実測距離にマーカーを浮かべる */

import { buildRing, translation } from "../gl";
import type { FeatureModule, GlBuffer } from "../types";

export function createDepthSensingModule(): FeatureModule {
	let ring: GlBuffer | null = null;

	return {
		id: "depth-sensing",
		sessionFeatures: ["depth-sensing"],
		setup(ctx) {
			ring = ctx.kit.makeBuffer(buildRing(0.12, 32));
		},
		render(ctx, viewProjection, view, frame) {
			if (!ring || !frame.getDepthInformation) return;
			try {
				const depthInfo = frame.getDepthInformation(view);
				if (!depthInfo) return;
				const distance = depthInfo.getDepthInMeters(0.5, 0.5);
				if (!Number.isFinite(distance) || distance <= 0) return;
				const m = view.transform.matrix;
				const model = translation(
					m[12] - m[8] * distance,
					m[13] - m[9] * distance,
					m[14] - m[10] * distance,
				);
				ctx.kit.draw(
					viewProjection,
					model,
					ring,
					ctx.kit.gl.LINE_LOOP,
					[0.4, 0.7, 1, 1],
				);
			} catch {
				// depth情報を取得できないフレームでは何もしない
			}
		},
	};
}
