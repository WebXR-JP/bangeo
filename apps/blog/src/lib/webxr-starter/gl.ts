/**
 * スターターランナーのWebGL道具箱。
 * 行列演算・ジオメトリ生成・単色描画のDrawKitをまとめる。
 */

import type { DrawKit, GlBuffer } from "./types";

export function mat4Multiply(a: Float32Array, b: Float32Array): Float32Array {
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

export function translation(x: number, y: number, z: number): Float32Array {
	return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]);
}

export function buildGrid(size: number, step: number): Float32Array {
	const lines: number[] = [];
	for (let i = -size; i <= size + 0.0001; i += step) {
		lines.push(i, 0, -size, i, 0, size);
		lines.push(-size, 0, i, size, 0, i);
	}
	return new Float32Array(lines);
}

export function buildCubeEdges(half: number): Float32Array {
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

export function buildRing(radius: number, segments: number): Float32Array {
	const out: number[] = [];
	for (let i = 0; i < segments; i++) {
		const t = (i / segments) * Math.PI * 2;
		out.push(Math.cos(t) * radius, 0.01, Math.sin(t) * radius);
	}
	return new Float32Array(out);
}

export function buildSphere(
	radius: number,
	latBands: number,
	lonBands: number,
): Float32Array {
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

export function compileProgram(
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

export interface TextureLoadResult {
	texture: WebGLTexture | null;
	error?: string;
}

function describeError(err: unknown): string {
	return err instanceof Error ? err.message : String(err);
}

function waitForImageLoad(image: HTMLImageElement): Promise<void> {
	if (image.complete && image.naturalWidth > 0) return Promise.resolve();
	if (image.complete) {
		return Promise.reject(new Error("画像を読み込めませんでした"));
	}
	return new Promise((resolve, reject) => {
		image.onload = () => resolve();
		image.onerror = () => reject(new Error("画像を読み込めませんでした"));
	});
}

export async function loadTexture(
	gl: WebGL2RenderingContext,
	url: string,
): Promise<TextureLoadResult> {
	try {
		const image = new Image();
		image.decoding = "async";
		image.src = url;
		try {
			await image.decode();
		} catch (err) {
			try {
				await waitForImageLoad(image);
			} catch {
				throw new Error(`画像decode/load失敗: ${describeError(err)}`);
			}
		}
		if (gl.isContextLost()) {
			throw new Error("WebGLコンテキストが失われました");
		}
		const texture = gl.createTexture();
		if (!texture) return { texture: null, error: "テクスチャを作成できません" };
		gl.bindTexture(gl.TEXTURE_2D, texture);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		return { texture };
	} catch (err) {
		return { texture: null, error: describeError(err) };
	}
}

/** 単色ジオメトリ描画の道具箱を作る。モジュールはこれだけで描画できる */
export function createDrawKit(gl: WebGL2RenderingContext): DrawKit {
	const program = compileProgram(gl, VERT_SRC, FRAG_SRC);
	const applyProgram = gl.useProgram.bind(gl);
	const positionLoc = gl.getAttribLocation(program, "a_position");
	const mvpLoc = gl.getUniformLocation(program, "u_mvp");
	const colorLoc = gl.getUniformLocation(program, "u_color");

	return {
		gl,
		makeBuffer(data, dynamic = false) {
			const buffer = gl.createBuffer();
			if (!buffer) throw new Error("バッファを作成できませんでした");
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
			gl.bufferData(
				gl.ARRAY_BUFFER,
				data,
				dynamic ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW,
			);
			return { buffer, count: data.length / 3 };
		},
		updateBuffer(buffer: GlBuffer, data: Float32Array) {
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
			gl.bufferSubData(gl.ARRAY_BUFFER, 0, data);
		},
		draw(viewProjection, model, buffer, mode, color, count) {
			const mvp = model ? mat4Multiply(viewProjection, model) : viewProjection;
			applyProgram(program);
			gl.uniformMatrix4fv(mvpLoc, false, mvp);
			gl.uniform4f(colorLoc, color[0], color[1], color[2], color[3]);
			gl.bindBuffer(gl.ARRAY_BUFFER, buffer.buffer);
			gl.enableVertexAttribArray(positionLoc);
			gl.vertexAttribPointer(positionLoc, 3, gl.FLOAT, false, 0, 0);
			gl.drawArrays(mode, 0, count ?? buffer.count);
		},
	};
}
