/**
 * feature可視化モジュールの登録所。
 * 新しいモジュールを作ったら、ファイルを modules/ に置いてここに1行足す。
 */

import type { FeatureModule } from "../types";
import { createAnchorsModule } from "./anchors";
import { createBodyTrackingModule } from "./body-tracking";
import { createBoundedFloorModule } from "./bounded-floor";
import { createDepthSensingModule } from "./depth-sensing";
import { createHandTrackingModule } from "./hand-tracking";
import { createHitTestModule } from "./hit-test";
import { createLightEstimationModule } from "./light-estimation";
import { createMeshDetectionModule } from "./mesh-detection";

export function createFeatureModules(): FeatureModule[] {
	return [
		createHitTestModule(),
		createAnchorsModule(),
		createHandTrackingModule(),
		createBodyTrackingModule(),
		createBoundedFloorModule(),
		createMeshDetectionModule(),
		createDepthSensingModule(),
		createLightEstimationModule(),
	];
}
