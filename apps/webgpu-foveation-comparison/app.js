import { createFishRenderer } from "./fish.js";
import { createPatternRenderer } from "./patterns.js";

// The immersive WebGPU setup follows the Immersive Web Community Group's
// WebGPU barebones sample (MIT): https://github.com/immersive-web/webxr-samples
const startButton = document.querySelector("#start");
const endButton = document.querySelector("#end");
const status = document.querySelector("#status");
const requested = document.querySelector("#requested");
const actual = document.querySelector("#actual");
const level = Number(document.documentElement.dataset.foveationLevel);
let activeLevel = level;

let session;
let binding;
let layer;
let referenceSpace;
let device;
let fishRenderer;
let patternRenderer;
let ready = false;
let lastError = "";

function setStatus(message) {
	status.textContent = message;
}
function levelLabel(value) {
	return value === 1 ? "1（最大）" : "0（最小）";
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
	requested.textContent = levelLabel(activeLevel);
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
function onFrame(_time, frame) {
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
			patternRenderer.draw(pass, view, index);
			fishRenderer.draw(pass, view, index);
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
				patternRenderer = undefined;
				referenceSpace = undefined;
				activeLevel = level;
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
		activeLevel = level;
		layer.fixedFoveation = activeLevel;
		patternRenderer = createPatternRenderer(device, format, activeLevel);
		session.addEventListener("select", () => {
			if (!layer) return;
			try {
				const nextLevel = activeLevel === 0 ? 1 : 0;
				layer.fixedFoveation = nextLevel;
				activeLevel = nextLevel;
				patternRenderer.setLevel(activeLevel);
				updateControls();
				setStatus(
					`設定値${activeLevel}に切り替えました。トリガーで再度切り替えられます。`,
				);
			} catch (error) {
				showError(error);
			}
		});
		session.updateRenderState({ layers: [layer] });
		referenceSpace = await session.requestReferenceSpace("local");
		updateControls();
		setStatus(
			`設定値${activeLevel}でVRを実行中です。トリガーで0と1を切り替えられます。`,
		);
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
			"WebXRでWebGPUを使えません。Quest BrowserのWebXR/WebGPU Binding設定を確認してください。",
		);
	if (!(await navigator.xr.isSessionSupported("immersive-vr")))
		throw new Error(
			"この端末ではVRを開始できません。Quest Browserで開いてください。",
		);
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
