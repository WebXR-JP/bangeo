// A small view-locked guide drawn over the comparison scene in each eye.
// The controller is deliberately a schematic, not a device-specific 3D model.
const width = 1024;
const height = 384;

const shader = `
@group(0) @binding(0) var guideTexture: texture_2d<f32>;
@group(0) @binding(1) var guideSampler: sampler;

struct VertexOut {
  @builtin(position) position: vec4f,
  @location(0) uv: vec2f,
}

@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> VertexOut {
  let corners = array<vec2f, 6>(
    vec2f(0.0, 0.0), vec2f(1.0, 0.0), vec2f(0.0, 1.0),
    vec2f(0.0, 1.0), vec2f(1.0, 0.0), vec2f(1.0, 1.0)
  );
  let uv = corners[index];
  var output: VertexOut;
  output.position = vec4f(-0.425 + uv.x * 0.85, -0.615 - uv.y * 0.32, 0.0, 1.0);
  output.uv = uv;
  return output;
}

@fragment fn fragmentMain(input: VertexOut) -> @location(0) vec4f {
  return textureSample(guideTexture, guideSampler, input.uv);
}`;

function roundedBox(ctx, x, y, w, h, radius, fill, stroke, lineWidth = 1) {
	ctx.beginPath();
	ctx.roundRect(x, y, w, h, radius);
	ctx.fillStyle = fill;
	ctx.fill();
	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
}

function oval(ctx, x, y, radiusX, radiusY, fill, stroke, lineWidth = 1) {
	ctx.beginPath();
	ctx.ellipse(x, y, radiusX, radiusY, 0, 0, Math.PI * 2);
	ctx.fillStyle = fill;
	ctx.fill();
	if (stroke) {
		ctx.strokeStyle = stroke;
		ctx.lineWidth = lineWidth;
		ctx.stroke();
	}
}

function drawController(ctx) {
	ctx.save();
	ctx.translate(170, 72);
	ctx.rotate(-0.13);

	// Grip and top shell read as one hand-held controller silhouette.
	ctx.beginPath();
	ctx.moveTo(20, 105);
	ctx.bezierCurveTo(5, 152, 1, 225, 37, 258);
	ctx.bezierCurveTo(55, 276, 91, 267, 95, 243);
	ctx.bezierCurveTo(103, 209, 80, 159, 80, 111);
	ctx.closePath();
	ctx.fillStyle = "#e7eef6";
	ctx.fill();
	ctx.lineWidth = 5;
	ctx.strokeStyle = "#60758a";
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(38, 156);
	ctx.bezierCurveTo(26, 200, 34, 232, 51, 247);
	ctx.strokeStyle = "#a8b9ca";
	ctx.lineWidth = 5;
	ctx.stroke();

	// Muted grip button is intentionally distinct from the orange index trigger.
	roundedBox(ctx, 80, 169, 19, 63, 9, "#60758a", "#39536a", 2);
	oval(ctx, 58, 98, 105, 65, "#e7eef6", "#60758a", 5);
	oval(ctx, 56, 86, 85, 47, "#526a80", "#33495e", 4);
	oval(ctx, 15, 80, 24, 24, "#253b50", "#b5c6d5", 3);
	oval(ctx, 15, 80, 10, 10, "#829bb0");
	oval(ctx, 93, 70, 12, 12, "#1d3448", "#c0cfdd", 2);
	oval(ctx, 115, 99, 12, 12, "#1d3448", "#c0cfdd", 2);

	// The index trigger protrudes from the forward top edge, not the grip.
	ctx.shadowColor = "#ff8a32";
	ctx.shadowBlur = 23;
	roundedBox(ctx, 129, 101, 43, 27, 12, "#ffae53", "#fff0c8", 4);
	ctx.shadowBlur = 0;
	ctx.restore();
}

function drawGuide(ctx) {
	ctx.clearRect(0, 0, width, height);
	ctx.shadowColor = "#06131d";
	ctx.shadowBlur = 20;
	roundedBox(ctx, 14, 14, 996, 356, 34, "rgba(10, 25, 39, 0.91)");
	ctx.shadowBlur = 0;
	roundedBox(ctx, 14, 14, 996, 356, 34, "rgba(0, 0, 0, 0)", "#7b9ab0", 3);

	drawController(ctx);

	ctx.strokeStyle = "#ffba65";
	ctx.lineWidth = 5;
	ctx.lineCap = "round";
	ctx.beginPath();
	ctx.moveTo(395, 141);
	ctx.lineTo(341, 166);
	ctx.stroke();
	ctx.beginPath();
	ctx.moveTo(341, 166);
	ctx.lineTo(357, 149);
	ctx.moveTo(341, 166);
	ctx.lineTo(364, 169);
	ctx.stroke();

	ctx.textBaseline = "middle";
	ctx.fillStyle = "#a7becf";
	ctx.font = "30px sans-serif";
	ctx.fillText("右手コントローラー（模式図）", 39, 339);
	ctx.fillStyle = "#f5f9fc";
	ctx.font = "bold 38px sans-serif";
	ctx.fillText("VR内で切り替える", 408, 84);
	ctx.fillStyle = "#ffba65";
	ctx.font = "bold 43px sans-serif";
	ctx.fillText("人差し指のトリガーを押す", 408, 155);
	ctx.fillStyle = "#f5f9fc";
	ctx.font = "bold 68px sans-serif";
	ctx.fillText("0 ⇄ 1", 410, 248);
	ctx.fillStyle = "#a7becf";
	ctx.font = "28px sans-serif";
	ctx.fillText("押すたびに変更", 655, 251);
}

export function createControllerGuideRenderer(device, format) {
	const canvas = document.createElement("canvas");
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext("2d");
	if (!ctx) throw new Error("操作ガイドを描画できません。");
	drawGuide(ctx);

	const texture = device.createTexture({
		size: [width, height],
		format: "rgba8unorm",
		usage:
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.RENDER_ATTACHMENT,
	});
	device.queue.copyExternalImageToTexture(
		{ source: canvas },
		{ texture, premultipliedAlpha: false },
		[width, height],
	);
	const module = device.createShaderModule({ code: shader });
	const pipeline = device.createRenderPipeline({
		layout: "auto",
		vertex: { module, entryPoint: "vertexMain" },
		fragment: {
			module,
			entryPoint: "fragmentMain",
			targets: [
				{
					format,
					blend: {
						color: {
							srcFactor: "src-alpha",
							dstFactor: "one-minus-src-alpha",
							operation: "add",
						},
						alpha: {
							srcFactor: "one",
							dstFactor: "one-minus-src-alpha",
							operation: "add",
						},
					},
				},
			],
		},
		primitive: { topology: "triangle-list", cullMode: "none" },
		depthStencil: {
			format: "depth24plus",
			depthWriteEnabled: false,
			depthCompare: "always",
		},
	});
	const bindGroup = device.createBindGroup({
		layout: pipeline.getBindGroupLayout(0),
		entries: [
			{ binding: 0, resource: texture.createView() },
			{
				binding: 1,
				resource: device.createSampler({
					magFilter: "linear",
					minFilter: "linear",
				}),
			},
		],
	});
	return {
		draw(pass, _view, _index) {
			pass.setPipeline(pipeline);
			pass.setBindGroup(0, bindGroup);
			pass.draw(6);
		},
		destroy() {
			texture.destroy();
		},
	};
}
