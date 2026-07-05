/**
 * /experiments のスタータービルダーで組んだ構成から、そのままXRセッションを開始する最小ランナー。
 * フレームワーク非依存（素のWebGL2）で、ページ内で完結する。
 *
 * feature可視化は「1機能 = 1モジュール」で増やしていく方針。
 * 現在のモジュール:
 * - hit-test: 現実の面にリング状の配置マーカーを表示する
 * - anchors: 選択操作（トリガー等）でマーカー位置に固定キューブを置く
 * - hand-tracking: 手の関節を点で表示する
 * - bounded-floor: プレイエリアの境界線を表示する
 * - mesh-detection: 部屋メッシュの頂点を点群で表示する
 * - depth-sensing: 視線の先の実測距離にマーカーを浮かべる
 * - light-estimation: 現実の主光源の方向を線で表示する
 *
 * 背景: immersive-vr / inline はエクイレクタングラー画像のスカイボックス
 * （/assets/starter-skybox.jpg。差し替えれば背景が変わる）、immersive-ar はパススルー。
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

interface XRRigidTransformLike {
	matrix: Float32Array;
	position: { x: number; y: number; z: number };
}

interface XRViewLike {
	projectionMatrix: Float32Array;
	transform: { matrix: Float32Array; inverse: XRRigidTransformLike };
}

interface XRViewportLike {
	x: number;
	y: number;
	width: number;
	height: number;
}

interface XRWebGLLayerLike {
	framebuffer: WebGLFramebuffer | null;
	getViewport(view: XRViewLike): XRViewportLike | null;
}

interface XRPoseLike {
	transform: XRRigidTransformLike;
}

interface XRAnchorLike {
	anchorSpace: object;
}

interface XRHitTestResultLike {
	getPose(space: object): XRPoseLike | null;
	createAnchor?(): Promise<XRAnchorLike>;
}

interface XRInputSourceLike {
	hand?: { values(): Iterable<object> };
}

interface XRMeshLike {
	meshSpace: object;
	vertices: Float32Array;
}

interface XRDepthInfoLike {
	getDepthInMeters(x: number, y: number): number;
}

interface XRLightEstimateLike {
	primaryLightDirection?: { x: number; y: number; z: number };
}

interface XRFrameLike {
	getViewerPose(space: object): { views: XRViewLike[] } | null;
	getPose?(space: object, baseSpace: object): XRPoseLike | null;
	getHitTestResults?(source: object): XRHitTestResultLike[];
	getJointPose?(joint: object, space: object): XRPoseLike | null;
	detectedMeshes?: Iterable<XRMeshLike>;
	getDepthInformation?(view: XRViewLike): XRDepthInfoLike | null;
	getLightEstimate?(probe: object): XRLightEstimateLike | null;
}

interface XRSessionLike {
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

interface XRSystemLike {
	requestSession(mode: string, init?: object): Promise<XRSessionLike>;
}

function mat4Multiply(a: Float32Array, b: Float32Array): Float32Array {
	const out = new Float32Array(16);
	for (let col = 0; col < 4; col++) {
		for (let row = 0; row < 4; row++) {
			let sum = 0;
			for (let k = 0; k < 4; k++) {
				sum += a[k * 4 + row] * b[col * 4 + k];
			}
			out[col * 4 + row] = sum;
		}
	}
	return out;
}

function translation(x: number, y: number, z: number): Float32Array {
	return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

function buildGrid(size: number, step: number): Float32Array {
	const lines: number[] = [];
	for (let i = -size; i <= size + 0.0001; i += step) {
		lines.push(i, 0, -size, i, 0, size);
		lines.push(-size, 0, i, size, 0, i);
	}
	return new Float32Array(lines);
}

function buildCubeEdges(half: number): Float32Array {
	const p = [
		[-half, -half, -half],
		[half, -half, -half],
		[half, half, -half],
		[-half, half, -half],
		[-half, -half, half],
		[half, -half, half],
		[half, half, half],
		[-half, half, half],
	];
	const edges = [
		[0, 1],
		[1, 2],
		[2, 3],
		[3, 0],
		[4, 5],
		[5, 6],
		[6, 7],
		[7, 4],
		[0, 4],
		[1, 5],
		[2, 6],
		[3, 7],
	];
	const out: number[] = [];
	for (const [i, j] of edges) {
		out.push(...p[i], ...p[j]);
	}
	return new Float32Array(out);
}

function buildRing(radius: number, segments: number): Float32Array {
	const out: number[] = [];
	for (let i = 0; i < segments; i++) {
		const t = (i / segments) * Math.PI * 2;
		out.push(Math.cos(t) * radius, 0.01, Math.sin(t) * radius);
	}
	return new Float32Array(out);
}

function buildSphere(radius: number, latBands: number, lonBands: number) {
	const positions: number[] = [];
	for (let lat = 0; lat < latBands; lat++) {
		const t0 = (lat / latBands) * Math.PI;
		const t1 = ((lat + 1) / latBands) * Math.PI;
		for (let lon = 0; lon < lonBands; lon++) {
			const p0 = (lon / lonBands) * Math.PI * 2;
			const p1 = ((lon + 1) / lonBands) * Math.PI * 2;
			const v = (t: number, p: number) => [
				radius * Math.sin(t) * Math.cos(p),
				radius * Math.cos(t),
				radius * Math.sin(t) * Math.sin(p),
			];
			const a = v(t0, p0);
			const b = v(t1, p0);
			const c = v(t1, p1);
			const d = v(t0, p1);
			positions.push(...a, ...b, ...c, ...a, ...c, ...d);
		}
	}
	return new Float32Array(positions);
}

function cubeModel(time: number, y: number): Float32Array {
	const c = Math.cos(time / 1200);
	const s = Math.sin(time / 1200);
	return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, y, -1.5, 1]);
}

const VERT_SRC = `#version 300 es
in vec3 a_position;
uniform mat4 u_mvp;
void main() {
	gl_Position = u_mvp * vec4(a_position, 1.0);
	gl_PointSize = 7.0;
}`;

const FRAG_SRC = `#version 300 es
precision mediump float;
uniform vec4 u_color;
out vec4 outColor;
void main() {
	outColor = u_color;
}`;

const SKY_VERT_SRC = `#version 300 es
in vec3 a_position;
uniform mat4 u_mvp;
out vec3 v_dir;
void main() {
	v_dir = a_position;
	gl_Position = u_mvp * vec4(a_position, 1.0);
}`;

const SKY_FRAG_SRC = `#version 300 es
precision mediump float;
in vec3 v_dir;
uniform sampler2D u_texture;
out vec4 outColor;
void main() {
	vec3 d = normalize(v_dir);
	float u = 0.5 + atan(d.x, -d.z) / 6.283185307;
	float v = 0.5 - asin(clamp(d.y, -1.0, 1.0)) / 3.141592653;
	outColor = texture(u_texture, vec2(u, v));
}`;

function compileProgram(
	gl: WebGL2RenderingContext,
	vertSrc: string,
	fragSrc: string,
): WebGLProgram {
	const compile = (type: number, source: string): WebGLShader => {
		const shader = gl.createShader(type);
		if (!shader) throw new Error("シェーダーを作成できませんでした");
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		return shader;
	};
	const program = gl.createProgram();
	if (!program) throw new Error("描画プログラムを作成できませんでした");
	gl.attachShader(program, compile(gl.VERTEX_SHADER, vertSrc));
	gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragSrc));
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw new Error("描画プログラムを初期化できませんでした");
	}
	return program;
}

async function loadTexture(
	gl: WebGL2RenderingContext,
	url: string,
): Promise<WebGLTexture | null> {
	try {
		const image = new Image();
		image.src = url;
		await image.decode();
		const texture = gl.createTexture();
		if (!texture) return null;
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return texture;
	} catch {
		return null;
	}
}

export async function startStarterSession(
	config: StarterConfig,
	onEnd: () => void,
): Promise<StarterSessionHandle> {
	const xr = (navigator as Navigator & { xr?: XRSystemLike }).xr;
	if (!xr) throw new Error("このブラウザではWebXRを利用できません");

	const overlay = document.createElement("div");
	overlay.style.cssText = "position:fixed;inset:0;z-index:60;background:#000;";
	const canvas = document.createElement("canvas");
	canvas.style.cssText = "width:100%;height:100%;display:block;";
	overlay.appendChild(canvas);
	const closeButton = document.createElement("button");
	closeButton.type = "button";
	closeButton.textContent = "終了";
	closeButton.style.cssText =
		"position:absolute;top:16px;right:16px;padding:8px 20px;border-radius:9999px;border:1px solid rgba(255,255,255,0.3);background:rgba(0,0,0,0.4);color:#fff;font-size:13px;font-weight:700;cursor:pointer;";
	overlay.appendChild(closeButton);

	const gl = canvas.getContext("webgl2", {
		xrCompatible: true,
		alpha: true,
		antialias: true,
	}) as WebGL2RenderingContext | null;
	if (!gl) throw new Error("WebGL2を利用できません");

	const isAR = config.mode === "immersive-ar";
	const optionalFeatures = [...config.features];
	if (config.refSpace !== "viewer") optionalFeatures.push(config.refSpace);
	const sessionInit: {
		optionalFeatures: string[];
		depthSensing?: {
			usagePreference: string[];
			dataFormatPreference: string[];
		};
	} = { optionalFeatures };
	if (config.features.includes("depth-sensing")) {
		sessionInit.depthSensing = {
			usagePreference: ["cpu-optimized"],
			dataFormatPreference: ["luminance-alpha", "float32"],
		};
	}

	let session: XRSessionLike;
	try {
		session = await xr.requestSession(config.mode, sessionInit);
	} catch (err) {
		const reason = err instanceof Error ? err.message : String(err);
		throw new Error(`セッションを開始できませんでした（${reason}）`);
	}

	let ended = false;
	function handleEnd() {
		if (ended) return;
		ended = true;
		overlay.remove();
		onEnd();
	}
	session.addEventListener("end", handleEnd);
	closeButton.addEventListener("click", () => {
		session.end().catch(handleEnd);
	});

	try {
		if (config.mode === "inline") {
			document.body.appendChild(overlay);
			const dpr = window.devicePixelRatio || 1;
			canvas.width = Math.floor(canvas.clientWidth * dpr);
			canvas.height = Math.floor(canvas.clientHeight * dpr);
		}

		const XRWebGLLayerCtor = (
			window as unknown as {
				XRWebGLLayer?: new (
					session: XRSessionLike,
					gl: WebGL2RenderingContext,
				) => XRWebGLLayerLike;
			}
		).XRWebGLLayer;
		if (!XRWebGLLayerCtor) throw new Error("XRWebGLLayerを利用できません");
		const baseLayer = new XRWebGLLayerCtor(session, gl);
		session.updateRenderState({ baseLayer });

		let refSpace: object | null = null;
		let refSpaceName = config.refSpace;
		for (const name of [config.refSpace, "local-floor", "local", "viewer"]) {
			try {
				refSpace = await session.requestReferenceSpace(name);
				refSpaceName = name;
				break;
			} catch {
				// 次の候補にフォールバックする
			}
		}
		if (!refSpace) throw new Error("体験スペースを取得できませんでした");
		const space = refSpace;

		// モジュール: hit-test（anchorsもマーカー位置を使う）
		let hitTestSource: object | null = null;
		const wantHitTest =
			config.features.includes("hit-test") ||
			config.features.includes("anchors");
		if (wantHitTest && session.requestHitTestSource) {
			try {
				const viewerSpace = await session.requestReferenceSpace("viewer");
				hitTestSource = await session.requestHitTestSource({
					space: viewerSpace,
				});
			} catch {
				hitTestSource = null;
			}
		}

		// モジュール: anchors（選択操作でマーカー位置に固定）
		const anchors: XRAnchorLike[] = [];
		let latestHitResult: XRHitTestResultLike | null = null;
		if (config.features.includes("anchors")) {
			session.addEventListener("select", () => {
				latestHitResult
					?.createAnchor?.()
					.then((anchor) => {
						anchors.push(anchor);
					})
					.catch(() => {
						// アンカーを作成できない環境では何もしない
					});
			});
		}

		// モジュール: light-estimation
		let lightProbe: object | null = null;
		if (
			config.features.includes("light-estimation") &&
			session.requestLightProbe
		) {
			try {
				lightProbe = await session.requestLightProbe();
			} catch {
				lightProbe = null;
			}
		}

		// モジュール: bounded-floor（境界線）
		let boundsData: Float32Array | null = null;
		const boundsGeometry = (
			space as { boundsGeometry?: { x: number; z: number }[] }
		).boundsGeometry;
		if (refSpaceName === "bounded-floor" && boundsGeometry?.length) {
			const out: number[] = [];
			for (const point of boundsGeometry) {
				out.push(point.x, 0.02, point.z);
			}
			boundsData = new Float32Array(out);
		}

		const program = compileProgram(gl, VERT_SRC, FRAG_SRC);
		const positionLoc = gl.getAttribLocation(program, "a_position");
		const mvpLoc = gl.getUniformLocation(program, "u_mvp");
		const colorLoc = gl.getUniformLocation(program, "u_color");

		const skyProgram = compileProgram(gl, SKY_VERT_SRC, SKY_FRAG_SRC);
		const skyPositionLoc = gl.getAttribLocation(skyProgram, "a_position");
		const skyMvpLoc = gl.getUniformLocation(skyProgram, "u_mvp");
		const skyTexture = isAR
			? null
			: await loadTexture(gl, config.skyboxUrl ?? "/assets/starter-skybox.jpg");

		function makeBuffer(data: Float32Array, usage: number) {
			if (!gl) throw new Error("WebGL2を利用できません");
			const buffer = gl.createBuffer();
			if (!buffer) throw new Error("バッファを作成できませんでした");
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(gl.ARRAY_BUFFER, data, usage);
			return { buffer, count: data.length / 3 };
		}

		const isFloorBased =
			refSpaceName === "local-floor" || refSpaceName === "bounded-floor";
		const gridBuffer = makeBuffer(buildGrid(3, 0.5), gl.STATIC_DRAW);
		const cubeBuffer = makeBuffer(buildCubeEdges(0.12), gl.STATIC_DRAW);
		const smallCubeBuffer = makeBuffer(buildCubeEdges(0.05), gl.STATIC_DRAW);
		const ringBuffer = makeBuffer(buildRing(0.12, 32), gl.STATIC_DRAW);
		const skyBuffer = makeBuffer(buildSphere(40, 16, 24), gl.STATIC_DRAW);
		const boundsBuffer = boundsData
			? makeBuffer(boundsData, gl.STATIC_DRAW)
			: null;
		const handCapacity = 60;
		const handStore = new Float32Array(handCapacity * 3);
		const handBuffer = makeBuffer(handStore, gl.DYNAMIC_DRAW);
		const lightStore = new Float32Array(6);
		const lightBuffer = makeBuffer(lightStore, gl.DYNAMIC_DRAW);
		const meshBuffers = new Map<
			XRMeshLike,
			{ buffer: WebGLBuffer; count: number }
		>();

		function drawBuffer(
			viewProjection: Float32Array,
			model: Float32Array | null,
			buffer: { buffer: WebGLBuffer; count: number },
			drawMode: number,
			color: [number, number, number, number],
			count?: number,
		) {
			if (!gl) return;
			const mvp = model ? mat4Multiply(viewProjection, model) : viewProjection;
			gl.uniformMatrix4fv(mvpLoc, false, mvp);
			gl.uniform4f(colorLoc, color[0], color[1], color[2], color[3]);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
			gl.enableVertexAttribArray(positionLoc);
			gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(drawMode, 0, count ?? buffer.count);
		}

		const cubeY = isFloorBased ? 1.2 : 0;
		const wantHands = config.features.includes("hand-tracking");
		const wantMeshes = config.features.includes("mesh-detection");
		const wantDepth = config.features.includes("depth-sensing");

		function onFrame(time: number, frame: XRFrameLike) {
			if (ended || !gl) return;
			session.requestAnimationFrame(onFrame);
			const pose = frame.getViewerPose(space);
			if (!pose) return;

			gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer.framebuffer);
			gl.enable(gl.DEPTH_TEST);
			if (isAR) {
				gl.clearColor(0, 0, 0, 0);
			} else {
				gl.clearColor(0.03, 0.03, 0.08, 1);
			}
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			// モジュール: hit-test の交点
			let hitModel: Float32Array | null = null;
			if (hitTestSource && frame.getHitTestResults) {
				const results = frame.getHitTestResults(hitTestSource);
				latestHitResult = results[0] ?? null;
				const hitPose = latestHitResult?.getPose(space);
				if (hitPose) hitModel = hitPose.transform.matrix;
			}

			// モジュール: hand-tracking の関節
			let handCount = 0;
			if (wantHands && frame.getJointPose) {
				for (const source of session.inputSources) {
					if (!source.hand) continue;
					for (const joint of source.hand.values()) {
						if (handCount >= handCapacity) break;
						const jointPose = frame.getJointPose(joint, space);
						if (!jointPose) continue;
						const { x, y, z } = jointPose.transform.position;
						handStore[handCount * 3] = x;
						handStore[handCount * 3 + 1] = y;
						handStore[handCount * 3 + 2] = z;
						handCount++;
					}
				}
				if (handCount > 0) {
					gl.bindBuffer(gl.ARRAY_BUFFER, handBuffer.buffer);
					gl.bufferSubData(gl.ARRAY_BUFFER, 0, handStore);
				}
			}

			// モジュール: light-estimation の主光源方向
			let hasLight = false;
			if (lightProbe && frame.getLightEstimate) {
				const estimate = frame.getLightEstimate(lightProbe);
				const direction = estimate?.primaryLightDirection;
				if (direction) {
					lightStore[0] = 0;
					lightStore[1] = cubeY;
					lightStore[2] = -1.5;
					lightStore[3] = direction.x * 0.7;
					lightStore[4] = cubeY + direction.y * 0.7;
					lightStore[5] = -1.5 + direction.z * 0.7;
					gl.bindBuffer(gl.ARRAY_BUFFER, lightBuffer.buffer);
					gl.bufferSubData(gl.ARRAY_BUFFER, 0, lightStore);
					hasLight = true;
				}
			}

			// モジュール: mesh-detection の点群
			const meshModels: {
				buffer: { buffer: WebGLBuffer; count: number };
				model: Float32Array | null;
			}[] = [];
			if (wantMeshes && frame.detectedMeshes && frame.getPose) {
				let meshIndex = 0;
				for (const mesh of frame.detectedMeshes) {
					if (meshIndex >= 6) break;
					meshIndex++;
					let cached = meshBuffers.get(mesh);
					if (!cached) {
						cached = makeBuffer(mesh.vertices, gl.STATIC_DRAW);
						meshBuffers.set(mesh, cached);
					}
					const meshPose = frame.getPose(mesh.meshSpace, space);
					meshModels.push({
						buffer: cached,
						model: meshPose ? meshPose.transform.matrix : null,
					});
				}
			}

			for (const view of pose.views) {
				const viewport = baseLayer.getViewport(view);
				if (!viewport) continue;
				gl.viewport(viewport.x, viewport.y, viewport.width, viewport.height);
				const viewProjection = mat4Multiply(
					view.projectionMatrix,
					view.transform.inverse.matrix,
				);

				// 背景スカイボックス（VR / inline）
				if (skyTexture) {
					const rotationOnly = new Float32Array(view.transform.inverse.matrix);
					rotationOnly[12] = 0;
					rotationOnly[13] = 0;
					rotationOnly[14] = 0;
					const skyMvp = mat4Multiply(view.projectionMatrix, rotationOnly);
					gl.depthMask(false);
					// biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram はReactフックではなくWebGL APIの呼び出し
					gl.useProgram(skyProgram);
					gl.uniformMatrix4fv(skyMvpLoc, false, skyMvp);
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, skyTexture);
					gl.bindBuffer(gl.ARRAY_BUFFER, skyBuffer.buffer);
					gl.enableVertexAttribArray(skyPositionLoc);
					gl.vertexAttribPointer(skyPositionLoc, 3, gl.FLOAT, false, 0, 0);
					gl.drawArrays(gl.TRIANGLES, 0, skyBuffer.count);
					gl.depthMask(true);
				}

				// biome-ignore lint/correctness/useHookAtTopLevel: gl.useProgram はReactフックではなくWebGL APIの呼び出し
				gl.useProgram(program);

				if (isFloorBased && !isAR) {
					drawBuffer(
						viewProjection,
						null,
						gridBuffer,
						gl.LINES,
						[0.35, 0.4, 0.55, 1],
					);
				}
				drawBuffer(
					viewProjection,
					cubeModel(time, cubeY),
					cubeBuffer,
					gl.LINES,
					[0.99, 0.35, 0.45, 1],
				);
				if (hitModel) {
					drawBuffer(
						viewProjection,
						hitModel,
						ringBuffer,
						gl.LINE_LOOP,
						[0.2, 0.9, 0.6, 1],
					);
				}
				if (frame.getPose) {
					for (const anchor of anchors) {
						const anchorPose = frame.getPose(anchor.anchorSpace, space);
						if (!anchorPose) continue;
						drawBuffer(
							viewProjection,
							anchorPose.transform.matrix,
							smallCubeBuffer,
							gl.LINES,
							[0.2, 0.9, 0.6, 1],
						);
					}
				}
				if (boundsBuffer) {
					drawBuffer(
						viewProjection,
						null,
						boundsBuffer,
						gl.LINE_LOOP,
						[0.2, 0.9, 0.6, 1],
					);
				}
				for (const meshModel of meshModels) {
					drawBuffer(
						viewProjection,
						meshModel.model,
						meshModel.buffer,
						gl.POINTS,
						[0.4, 0.8, 1, 1],
					);
				}
				if (handCount > 0) {
					drawBuffer(
						viewProjection,
						null,
						handBuffer,
						gl.POINTS,
						[1, 0.8, 0.3, 1],
						handCount,
					);
				}
				if (hasLight) {
					drawBuffer(
						viewProjection,
						null,
						lightBuffer,
						gl.LINES,
						[1, 0.9, 0.2, 1],
					);
				}

				// モジュール: depth-sensing（視線の先の実測距離）
				if (wantDepth && frame.getDepthInformation) {
					try {
						const depthInfo = frame.getDepthInformation(view);
						if (depthInfo) {
							const distance = depthInfo.getDepthInMeters(0.5, 0.5);
							if (Number.isFinite(distance) && distance > 0) {
								const m = view.transform.matrix;
								const model = translation(
									m[12] - m[8] * distance,
									m[13] - m[9] * distance,
									m[14] - m[10] * distance,
								);
								drawBuffer(
									viewProjection,
									model,
									ringBuffer,
									gl.LINE_LOOP,
									[0.4, 0.7, 1, 1],
								);
							}
						}
					} catch {
						// depth情報を取得できないフレームでは何もしない
					}
				}
			}
		}

		session.requestAnimationFrame(onFrame);
	} catch (err) {
		session.end().catch(handleEnd);
		handleEnd();
		throw err;
	}

	return {
		end: async () => {
			try {
				await session.end();
			} catch {
				handleEnd();
			}
		},
	};
}
