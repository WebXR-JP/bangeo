import { createFishRenderer } from "./fish.js";

// The immersive WebGPU setup follows the Immersive Web Community Group's
// WebGPU barebones sample (MIT): https://github.com/immersive-web/webxr-samples
const startButton = document.querySelector("#start");
const toggleButton = document.querySelector("#toggle");
const endButton = document.querySelector("#end");
const status = document.querySelector("#status");
const requested = document.querySelector("#requested");
const actual = document.querySelector("#actual");

const shader = `
struct Options { enabled: f32, aspect: f32, pad0: f32, pad1: f32 }
@group(0) @binding(0) var<uniform> options: Options;
struct Out { @builtin(position) position: vec4f, @location(0) uv: vec2f }
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> Out {
  var positions = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  let p = positions[index];
  return Out(vec4f(p, 1.0, 1.0), p * vec2f(0.5, -0.5) + vec2f(0.5, 0.5));
}
@fragment fn fragmentMain(input: Out) -> @location(0) vec4f {
  let uv = input.uv;
  let centered = (uv - vec2f(0.5)) * vec2f(options.aspect, 1.0);
  let radius = length(centered);
  let grid = min(abs(fract(uv.x * 92.0) - 0.5), abs(fract(uv.y * 92.0) - 0.5));
  let fine = 1.0 - smoothstep(0.015, 0.055, grid);
  let rings = 1.0 - smoothstep(0.015, 0.06, abs(fract(radius * 25.0) - 0.5));
  let axes = 1.0 - smoothstep(0.001, 0.004, min(abs(uv.x - 0.5), abs(uv.y - 0.5)));
  let edge = smoothstep(0.10, 0.60, radius);
  var color = mix(vec3f(0.98, 0.94, 0.95), vec3f(0.92, 0.85, 0.88), edge);
  color -= fine * vec3f(0.28, 0.22, 0.23);
  color -= rings * vec3f(0.05, 0.12, 0.12);
  color -= axes * vec3f(0.06, 0.07, 0.07);
  let band = 1.0 - smoothstep(0.065, 0.070, uv.y);
  let marker = select(vec3f(0.12, 0.62, 0.67), vec3f(0.89, 0.11, 0.28), options.enabled > 0.5);
  return vec4f(mix(color, marker, band), 1.0);
}`;

let session;
let binding;
let layer;
let referenceSpace;
let device;
let pipeline;
let optionsBuffer;
let bindGroup;
let fishRenderer;
let enabled = false;
let ready = false;
let lastError = "";

function setStatus(message) {
	status.textContent = message;
}
function showError(error) {
	lastError =
		error instanceof Error && error.name === "Error"
			? error.message
			: error instanceof Error
				? `${error.name}: ${error.message}`
				: String(error);
	setStatus(lastError);
}
function updateControls() {
	requested.textContent = enabled ? "最大（1）" : "最小（0）";
	toggleButton.textContent = enabled
		? "最小（0）に切り替える"
		: "最大（1）に切り替える";
	toggleButton.disabled = !session || layer?.fixedFoveation == null;
	endButton.disabled = !session;
	startButton.disabled = Boolean(session) || !ready;
	startButton.textContent = session
		? "VR実行中"
		: ready
			? "VRを開始"
			: "この環境では開始できません";
	actual.textContent = layer
		? layer.fixedFoveation == null
			? "取得できません（非対応）"
			: String(layer.fixedFoveation)
		: "VR開始前";
}
function applyFoveation() {
	if (!layer) return;
	if (layer.fixedFoveation == null) {
		setStatus("この環境では描画密度の設定値を変更できません。");
		updateControls();
		return;
	}
	layer.fixedFoveation = enabled ? 1 : 0;
	updateControls();
	setStatus(
		`fixed foveationを${enabled ? "最大（1）" : "最小（0）"}に設定しました。見え方はヘッドセットで確認してください。`,
	);
}
function toggle() {
	if (!session || layer?.fixedFoveation == null) return;
	enabled = !enabled;
	applyFoveation();
}
function createPipeline(format) {
	const module = device.createShaderModule({ code: shader });
	pipeline = device.createRenderPipeline({
		layout: "auto",
		vertex: { module, entryPoint: "vertexMain" },
		fragment: { module, entryPoint: "fragmentMain", targets: [{ format }] },
		primitive: { topology: "triangle-list" },
		depthStencil: {
			format: "depth24plus",
			depthWriteEnabled: false,
			depthCompare: "always",
		},
	});
	bindGroup = device.createBindGroup({
		layout: pipeline.getBindGroupLayout(0),
		entries: [{ binding: 0, resource: { buffer: optionsBuffer } }],
	});
	fishRenderer.createPipeline(format);
}
function onFrame(time, frame) {
	if (!session || frame.session !== session) return;
	session.requestAnimationFrame(onFrame);
	const pose = frame.getViewerPose(referenceSpace);
	if (!pose) return;
	try {
		const encoder = device.createCommandEncoder();
		for (let index = 0; index < pose.views.length; index++) {
			const view = pose.views[index];
			const subImage = binding.getViewSubImage(layer, view);
			const viewport = subImage.viewport;
			device.queue.writeBuffer(
				optionsBuffer,
				0,
				new Float32Array([
					enabled ? 1 : 0,
					viewport.width / viewport.height,
					0,
					0,
				]),
			);
			const pass = encoder.beginRenderPass({
				colorAttachments: [
					{
						view: subImage.colorTexture.createView(
							subImage.getViewDescriptor(),
						),
						loadOp: "clear",
						storeOp: "store",
						clearValue: [0.98, 0.94, 0.95, 1],
					},
				],
				depthStencilAttachment: {
					view: subImage.depthStencilTexture.createView(
						subImage.getViewDescriptor(),
					),
					depthLoadOp: "clear",
					depthStoreOp: "store",
					depthClearValue: 1,
				},
			});
			pass.setViewport(
				viewport.x,
				viewport.y,
				viewport.width,
				viewport.height,
				0,
				1,
			);
			pass.setPipeline(pipeline);
			pass.setBindGroup(0, bindGroup);
			pass.draw(3);
			fishRenderer.draw(pass, view, time, index);
			pass.end();
		}
		device.queue.submit([encoder.finish()]);
	} catch (error) {
		showError(error);
		session.end().catch(showError);
	}
}
async function start() {
	if (!ready) return;
	startButton.disabled = true;
	lastError = "";
	try {
		// Request XR before another await, preserving the button's user gesture.
		const newSession = await navigator.xr.requestSession("immersive-vr", {
			requiredFeatures: ["webgpu"],
		});
		session = newSession;
		session.addEventListener(
			"end",
			() => {
				session = undefined;
				binding = undefined;
				layer = undefined;
				referenceSpace = undefined;
				actual.textContent = "VR開始前";
				setStatus(lastError || "VRを終了しました。");
				updateControls();
			},
			{ once: true },
		);
		session.addEventListener("select", toggle);
		binding = new XRGPUBinding(session, device);
		const format = binding.getPreferredColorFormat();
		createPipeline(format);
		layer = binding.createProjectionLayer({
			colorFormat: format,
			depthStencilFormat: "depth24plus",
		});
		session.updateRenderState({ layers: [layer] });
		referenceSpace = await session.requestReferenceSpace("local");
		enabled = false;
		applyFoveation();
		session.requestAnimationFrame(onFrame);
	} catch (error) {
		showError(error);
		if (session) await session.end().catch(() => {});
		updateControls();
	}
}

startButton.addEventListener("click", start);
toggleButton.addEventListener("click", toggle);
endButton.addEventListener("click", () => session?.end());

async function checkSupport() {
	if (!isSecureContext)
		throw new Error("HTTPSまたはlocalhostで開いてください。");
	if (!navigator.gpu) throw new Error("WebGPUが見つかりません。");
	if (!navigator.xr) throw new Error("WebXRが見つかりません。");
	if (!("XRGPUBinding" in window))
		throw new Error(
			"XRGPUBindingが見つかりません。WebXR実験機能を確認してください。",
		);
	if (!(await navigator.xr.isSessionSupported("immersive-vr")))
		throw new Error("immersive-vrに対応していません。");
	const adapter = await navigator.gpu.requestAdapter({ xrCompatible: true });
	if (!adapter) throw new Error("XR対応のWebGPUアダプターがありません。");
	device = await adapter.requestDevice();
	device.lost.then((info) => {
		ready = false;
		showError(`WebGPUデバイスを失いました: ${info.message}`);
		updateControls();
	});
	optionsBuffer = device.createBuffer({
		size: 16,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});
	fishRenderer = await createFishRenderer(device);
	ready = true;
	updateControls();
	setStatus(
		"開始できます。Quest Browser 150.1以降で実機の効果を確認してください。",
	);
}
checkSupport().catch((error) => {
	showError(error);
	updateControls();
});
