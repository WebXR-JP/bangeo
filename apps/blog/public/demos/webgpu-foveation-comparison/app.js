import { createFishRenderer } from "./fish.js";

// The immersive WebGPU setup follows the Immersive Web Community Group's
// WebGPU barebones sample (MIT): https://github.com/immersive-web/webxr-samples
const startButton = document.querySelector("#start");
const endButton = document.querySelector("#end");
const status = document.querySelector("#status");
const requested = document.querySelector("#requested");
const actual = document.querySelector("#actual");
const level = Number(document.documentElement.dataset.foveationLevel);
const levelLabel = level === 1 ? "最大（1）" : "最小（0）";

let session;
let binding;
let layer;
let referenceSpace;
let device;
let fishRenderer;
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
	requested.textContent = levelLabel;
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
			const pass = encoder.beginRenderPass({
				colorAttachments: [
					{
						view: subImage.colorTexture.createView(
							subImage.getViewDescriptor(),
						),
						loadOp: "clear",
						storeOp: "store",
						clearValue: [0.98, 0.96, 0.97, 1],
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
		binding = new XRGPUBinding(session, device);
		const format = binding.getPreferredColorFormat();
		fishRenderer.createPipeline(format);
		layer = binding.createProjectionLayer({
			colorFormat: format,
			depthStencilFormat: "depth24plus",
		});
		if (layer.fixedFoveation == null)
			throw new Error("この環境ではfixed foveationを設定できません。");
		layer.fixedFoveation = level;
		session.updateRenderState({ layers: [layer] });
		referenceSpace = await session.requestReferenceSpace("local");
		updateControls();
		setStatus(`${levelLabel}でVRを実行中です。終了後に別の設定を選べます。`);
		session.requestAnimationFrame(onFrame);
	} catch (error) {
		showError(error);
		if (session) await session.end().catch(() => {});
		updateControls();
	}
}

startButton.addEventListener("click", start);
endButton.addEventListener("click", () => session?.end());

async function checkSupport() {
	if (!isSecureContext)
		throw new Error("HTTPSまたはlocalhostで開いてください。");
	if (!navigator.gpu)
		throw new Error(
			"WebGPUが見つかりません。Quest BrowserのWebGPU設定を確認してください。",
		);
	if (!navigator.xr) throw new Error("WebXRが見つかりません。");
	if (!("XRGPUBinding" in window))
		throw new Error(
			"XRGPUBindingが見つかりません。chrome://flagsのWebXR/WebGPU BindingとWebXR Projection Layersを確認し、Quest Browserを再起動してください。",
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
	fishRenderer = await createFishRenderer(device);
	ready = true;
	updateControls();
	setStatus(
		"開始できます。Quest Browser 150.1以降で実機の効果を確認してください。",
	);
}
if (level !== 0 && level !== 1) {
	showError(
		new Error("設定値が正しくありません。比較ページから開き直してください。"),
	);
	updateControls();
} else {
	checkSupport().catch((error) => {
		showError(error);
		updateControls();
	});
}
