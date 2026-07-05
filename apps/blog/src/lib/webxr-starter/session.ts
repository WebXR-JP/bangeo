/**
 * /experiments のスタータービルダーで組んだ構成から、そのままXRセッションを開始する最小ランナー。
 * フレームワーク非依存（素のWebGL2）で、ページ内で完結する。
 *
 * このファイルはコア（セッション確立・基本シーン・フレームループ）だけを持つ。
 * feature可視化は modules/ 配下の「1機能 = 1ファイル」のモジュールが担う。
 *
 * 背景: immersive-vr / inline はエクイレクタングラー画像のスカイボックス
 * （/assets/starter-skybox.jpg。差し替えれば背景が変わる）、immersive-ar はパススルー。
 */

import {
	buildCubeEdges,
	buildGrid,
	buildSphere,
	compileProgram,
	createDrawKit,
	loadTexture,
	mat4Multiply,
} from "./gl";
import { createFeatureModules } from "./modules";
import type {
	FeatureModule,
	ModuleContext,
	StarterConfig,
	StarterSessionHandle,
	XRFrameLike,
	XRSessionLike,
	XRSystemLike,
	XRWebGLLayerLike,
} from "./types";

export type { StarterConfig, StarterSessionHandle } from "./types";

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

function cubeModel(time: number, y: number): Float32Array {
	const c = Math.cos(time / 1200);
	const s = Math.sin(time / 1200);
	return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, y, -1.5, 1]);
}

export async function startStarterSession(
	config: StarterConfig,
	onEnd: (message?: string) => void,
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
	const glCompat = gl as WebGL2RenderingContext & {
		makeXRCompatible?: () => Promise<void>;
	};
	if (glCompat.makeXRCompatible) {
		await glCompat.makeXRCompatible();
	}

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
	let fatalMessage: string | null = null;
	function handleEnd() {
		if (ended) return;
		ended = true;
		overlay.remove();
		onEnd(fatalMessage ?? undefined);
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

		const kit = createDrawKit(gl);
		const isFloorBased =
			refSpaceName === "local-floor" || refSpaceName === "bounded-floor";
		const cubeY = isFloorBased ? 1.2 : 0;

		const ctx: ModuleContext = {
			session,
			space: refSpace,
			refSpaceName,
			config,
			kit,
			cubeY,
		};

		// モジュールの選別とセットアップ（失敗したモジュールは外す）
		const candidates = createFeatureModules().filter((module) =>
			module.isActive
				? module.isActive(config, refSpaceName)
				: config.features.includes(module.id),
		);
		const modules: FeatureModule[] = [];
		for (const module of candidates) {
			try {
				await module.setup?.(ctx);
				modules.push(module);
			} catch {
				// このモジュールだけ無効化して続行する
			}
		}

		// 基本シーン
		const gridBuffer = kit.makeBuffer(buildGrid(3, 0.5));
		const cubeBuffer = kit.makeBuffer(buildCubeEdges(0.12));
		const skyProgram = compileProgram(gl, SKY_VERT_SRC, SKY_FRAG_SRC);
		const applySkyProgram = gl.useProgram.bind(gl);
		const skyPositionLoc = gl.getAttribLocation(skyProgram, "a_position");
		const skyMvpLoc = gl.getUniformLocation(skyProgram, "u_mvp");
		const skyBuffer = kit.makeBuffer(buildSphere(40, 16, 24));
		const skyTexture = isAR
			? null
			: await loadTexture(gl, config.skyboxUrl ?? "/assets/starter-skybox.jpg");

		function renderFrame(
			time: number,
			frame: Parameters<
				Parameters<XRSessionLike["requestAnimationFrame"]>[0]
			>[1],
		) {
			if (!gl) return;
			const pose = frame.getViewerPose(ctx.space);
			if (!pose) return;

			gl.bindFramebuffer(gl.FRAMEBUFFER, baseLayer.framebuffer);
			gl.enable(gl.DEPTH_TEST);
			if (isAR) {
				gl.clearColor(0, 0, 0, 0);
			} else {
				gl.clearColor(0.03, 0.03, 0.08, 1);
			}
			gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

			for (const module of modules) {
				try {
					module.update?.(ctx, frame, time);
				} catch {
					// モジュール単体の失敗ではセッションを止めない
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
					applySkyProgram(skyProgram);
					gl.uniformMatrix4fv(skyMvpLoc, false, skyMvp);
					gl.activeTexture(gl.TEXTURE0);
					gl.bindTexture(gl.TEXTURE_2D, skyTexture);
					gl.bindBuffer(gl.ARRAY_BUFFER, skyBuffer.buffer);
					gl.enableVertexAttribArray(skyPositionLoc);
					gl.vertexAttribPointer(skyPositionLoc, 3, gl.FLOAT, false, 0, 0);
					gl.drawArrays(gl.TRIANGLES, 0, skyBuffer.count);
					gl.depthMask(true);
				}

				if (isFloorBased && !isAR) {
					kit.draw(
						viewProjection,
						null,
						gridBuffer,
						gl.LINES,
						[0.35, 0.4, 0.55, 1],
					);
				}
				kit.draw(
					viewProjection,
					cubeModel(time, cubeY),
					cubeBuffer,
					gl.LINES,
					[0.99, 0.35, 0.45, 1],
				);

				for (const module of modules) {
					try {
						module.render?.(ctx, viewProjection, view, frame);
					} catch {
						// モジュール単体の失敗ではセッションを止めない
					}
				}
			}
		}

		function onFrame(time: number, frame: XRFrameLike) {
			if (ended) return;
			session.requestAnimationFrame(onFrame);
			try {
				renderFrame(time, frame);
			} catch (err) {
				fatalMessage =
					err instanceof Error ? err.message : "描画中にエラーが発生しました";
				session.end().catch(handleEnd);
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
