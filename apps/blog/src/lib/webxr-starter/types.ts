/**
 * スターターランナーの共通型定義。
 * WebXRのDOM型はTSの標準libに無いため、必要な範囲だけ *Like 型として定義する。
 */

export interface StarterConfig {
	mode: "inline" | "immersive-vr" | "immersive-ar";
	refSpace: string;
	features: string[];
	skyboxUrl?: string;
}

export interface StarterSessionHandle {
	end(): Promise<void>;
}

export interface XRRigidTransformLike {
	matrix: Float32Array;
	position: { x: number; y: number; z: number };
}

export interface XRViewLike {
	projectionMatrix: Float32Array;
	transform: { matrix: Float32Array; inverse: XRRigidTransformLike };
}

export interface XRViewportLike {
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface XRWebGLLayerLike {
	framebuffer: WebGLFramebuffer | null;
	getViewport(view: XRViewLike): XRViewportLike | null;
}

export interface XRPoseLike {
	transform: XRRigidTransformLike;
}

export interface XRAnchorLike {
	anchorSpace: object;
}

export interface XRHitTestResultLike {
	getPose(space: object): XRPoseLike | null;
	createAnchor?(): Promise<XRAnchorLike>;
}

export interface XRInputSourceLike {
	hand?: { values(): Iterable<object> };
}

export interface XRMeshLike {
	meshSpace: object;
	vertices: Float32Array;
}

export interface XRDepthInfoLike {
	getDepthInMeters(x: number, y: number): number;
}

export interface XRLightEstimateLike {
	primaryLightDirection?: { x: number; y: number; z: number };
}

export interface XRFrameLike {
	getViewerPose(space: object): { views: XRViewLike[] } | null;
	getPose?(space: object, baseSpace: object): XRPoseLike | null;
	getHitTestResults?(source: object): XRHitTestResultLike[];
	getJointPose?(joint: object, space: object): XRPoseLike | null;
	detectedMeshes?: Iterable<XRMeshLike>;
	body?: { values(): Iterable<object> };
	getDepthInformation?(view: XRViewLike): XRDepthInfoLike | null;
	getLightEstimate?(probe: object): XRLightEstimateLike | null;
}

export interface XRSessionLike {
	updateRenderState(state: { baseLayer?: object }): void;
	requestReferenceSpace(type: string): Promise<object>;
	requestAnimationFrame(
		callback: (time: number, frame: XRFrameLike) => void,
	): number;
	requestHitTestSource?(options: { space: object }): Promise<object>;
	requestLightProbe?(): Promise<object>;
	inputSources: XRInputSourceLike[];
	addEventListener(type: string, callback: () => void): void;
	end(): Promise<void>;
}

export interface XRSystemLike {
	requestSession(mode: string, init?: object): Promise<XRSessionLike>;
}

export interface GlBuffer {
	buffer: WebGLBuffer;
	count: number;
}

/** モジュールに渡す描画道具箱（gl.ts の createDrawKit が生成） */
export interface DrawKit {
	gl: WebGL2RenderingContext;
	makeBuffer(data: Float32Array, dynamic?: boolean): GlBuffer;
	updateBuffer(buffer: GlBuffer, data: Float32Array): void;
	draw(
		viewProjection: Float32Array,
		model: Float32Array | null,
		buffer: GlBuffer,
		mode: number,
		color: [number, number, number, number],
		count?: number,
	): void;
}

/** セッション確立後にモジュールへ渡される文脈 */
export interface ModuleContext {
	session: XRSessionLike;
	/** 選択された reference space */
	space: object;
	refSpaceName: string;
	config: StarterConfig;
	kit: DrawKit;
	/** 基本シーンのキューブのY座標（床基準なら1.2、それ以外は0） */
	cubeY: number;
}

/**
 * feature可視化モジュール。「1機能 = 1ファイル」で modules/ に置き、
 * modules/index.ts に登録する。
 *
 * - setup: セッション開始後に1回。失敗（throw）するとそのモジュールだけ無効になる
 * - update: 毎フレーム1回（ビュー描画の前）。データ収集に使う
 * - render: ビューごとに1回。描画に使う
 */
export interface FeatureModule {
	/** ビルダーのfeature名と一致させる */
	id: string;
	/** 有効条件。省略時は config.features に id が含まれるとき有効 */
	isActive?(config: StarterConfig, refSpaceName: string): boolean;
	setup?(ctx: ModuleContext): Promise<void> | void;
	update?(ctx: ModuleContext, frame: XRFrameLike, time: number): void;
	render?(
		ctx: ModuleContext,
		viewProjection: Float32Array,
		view: XRViewLike,
		frame: XRFrameLike,
	): void;
}
