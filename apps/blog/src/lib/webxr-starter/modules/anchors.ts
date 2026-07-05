/** anchors: 選択操作（トリガー等）でマーカー位置に固定キューブを置く */

import { buildCubeEdges } from "../gl";
import type {
	FeatureModule,
	GlBuffer,
	XRAnchorLike,
	XRHitTestResultLike,
} from "../types";

export function createAnchorsModule(): FeatureModule {
	let source: object | null = null;
	let cube: GlBuffer | null = null;
	let latestHit: XRHitTestResultLike | null = null;
	const anchors: XRAnchorLike[] = [];
	let anchorModels: Float32Array[] = [];

	return {
		id: "anchors",
		sessionFeatures: ["anchors", "hit-test"],
		dependencies: ["hit-test"],
		async setup(ctx) {
			if (!ctx.session.requestHitTestSource) return;
			const viewerSpace = await ctx.session.requestReferenceSpace("viewer");
			source = await ctx.session.requestHitTestSource({ space: viewerSpace });
			cube = ctx.kit.makeBuffer(buildCubeEdges(0.05));
			ctx.session.addEventListener("select", () => {
				latestHit
					?.createAnchor?.()
					.then((anchor) => {
						anchors.push(anchor);
					})
					.catch(() => {
						// アンカーを作成できない環境では何もしない
					});
			});
		},
		update(ctx, frame) {
			if (source && frame.getHitTestResults) {
				latestHit = frame.getHitTestResults(source)[0] ?? null;
			}
			anchorModels = [];
			if (!frame.getPose) return;
			for (const anchor of anchors) {
				const pose = frame.getPose(anchor.anchorSpace, ctx.space);
				if (pose) anchorModels.push(pose.transform.matrix);
			}
		},
		render(ctx, viewProjection) {
			if (!cube) return;
			for (const model of anchorModels) {
				ctx.kit.draw(
					viewProjection,
					model,
					cube,
					ctx.kit.gl.LINES,
					[0.2, 0.9, 0.6, 1],
				);
			}
		},
	};
}
