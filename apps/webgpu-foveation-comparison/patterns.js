// A fixed, high-detail wall behind the fish gives the two foveation settings
// identical features to compare at the center and edges of the view.
const shader = `
struct Camera { projection: mat4x4f, view: mat4x4f }
@group(0) @binding(0) var<uniform> camera: Camera;
@group(0) @binding(1) var<uniform> setting: vec4f;

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
  let world = vec4f((uv.x - 0.5) * 16.0, (uv.y - 0.5) * 14.0, -4.6, 1.0);
  var output: VertexOut;
  output.position = camera.projection * camera.view * world;
  output.uv = uv;
  return output;
}

fn thinLine(value: f32, halfWidth: f32) -> f32 {
  let distance = abs(fract(value) - 0.5);
  let pixel = max(fwidth(value), 0.001);
  return 1.0 - smoothstep(halfWidth, halfWidth + pixel, distance);
}

@fragment fn fragmentMain(input: VertexOut) -> @location(0) vec4f {
  let panel = min(u32(input.uv.x * 3.0), 2u);
  let local = vec2f(fract(input.uv.x * 3.0), input.uv.y);
  let sharedGrid = max(thinLine(input.uv.x * 216.0, 0.075), thinLine(input.uv.y * 52.0, 0.075));
  let fineGrid = thinLine(local.x * 180.0, 0.025);
  let radius = length((local - vec2f(0.5, 0.5)) * vec2f(1.0, 1.45));
  let rings = thinLine(radius * 95.0, 0.075);
  let slant = thinLine((local.x + local.y) * 110.0, 0.035);
  let crosshatch = max(thinLine((local.x + local.y) * 115.0, 0.045), thinLine((local.x - local.y) * 115.0, 0.045));
  var color = vec3f(0.89, 0.94, 0.98);
  var detail = sharedGrid;

  if (panel == 0u) {
    // Fine grid plus narrow vertical lines.
    detail = max(detail, fineGrid * 0.5);
  } else if (panel == 1u) {
    // Rings and crossing diagonals exercise many pixel edges.
    color = vec3f(0.98, 0.91, 0.91);
    detail = max(detail, max(rings, slant));
  } else {
    // Crosshatching with a small checker texture.
    color = vec3f(0.91, 0.96, 0.91);
    let checker = (u32(floor(local.x * 48.0) + floor(local.y * 48.0)) & 1u);
    detail = max(detail, max(crosshatch, f32(checker) * 0.22));
  }

  // The same multi-frequency shader work covers all three panels and both eyes.
  var waves = 0.0;
  var weight = 0.035;
  for (var octave = 0u; octave < 5u; octave++) {
    let frequency = 37.0 + f32(octave) * 24.0;
    waves += sin(local.x * frequency + sin(local.y * frequency * 0.71) * 2.8) * weight;
    weight *= 0.76;
  }
  color += vec3f(waves);
  color = mix(color, vec3f(0.13, 0.20, 0.30), min(detail, 1.0) * 0.85);
  let divider = 1.0 - smoothstep(0.0, 0.004, min(local.x, 1.0 - local.x));
  color = mix(color, vec3f(0.28, 0.31, 0.37), divider);

  // The large digit reports the requested API value; it is not an effect preview.
  let badge = (input.uv - vec2f(0.5, 0.61)) / vec2f(0.055, 0.065);
  let plate = 1.0 - smoothstep(0.88, 0.92, max(abs(badge.x), abs(badge.y)));
  let badgeRadius = length(badge * vec2f(1.0, 0.84));
  let zero = (1.0 - smoothstep(0.68, 0.73, badgeRadius)) * smoothstep(0.35, 0.40, badgeRadius);
  let stem = (1.0 - smoothstep(0.10, 0.15, abs(badge.x))) * (1.0 - smoothstep(0.68, 0.73, abs(badge.y)));
  let foot = (1.0 - smoothstep(0.43, 0.48, abs(badge.x))) * (1.0 - smoothstep(0.08, 0.12, abs(badge.y + 0.60)));
  let cap = (1.0 - smoothstep(0.19, 0.24, abs(badge.x + 0.15))) * (1.0 - smoothstep(0.08, 0.12, abs(badge.y - 0.53)));
  let one = max(stem, max(foot, cap));
  let digit = select(zero, one, setting.x > 0.5);
  color = mix(color, vec3f(0.98, 0.98, 0.98), plate);
  color = mix(color, vec3f(0.10, 0.13, 0.20), digit * plate);
  return vec4f(color, 1.0);
}`;

export function createPatternRenderer(device, format, level) {
	const module = device.createShaderModule({ code: shader });
	const pipeline = device.createRenderPipeline({
		layout: "auto",
		vertex: { module, entryPoint: "vertexMain" },
		fragment: { module, entryPoint: "fragmentMain", targets: [{ format }] },
		primitive: { topology: "triangle-list", cullMode: "none" },
		depthStencil: {
			format: "depth24plus",
			depthWriteEnabled: false,
			depthCompare: "less",
		},
	});
	const cameraBuffer = device.createBuffer({
		size: 2 * 256,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});
	const settingBuffer = device.createBuffer({
		size: 16,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});
	device.queue.writeBuffer(
		settingBuffer,
		0,
		new Float32Array([level, 0, 0, 0]),
	);
	const bindGroups = Array.from({ length: 2 }, (_, index) =>
		device.createBindGroup({
			layout: pipeline.getBindGroupLayout(0),
			entries: [
				{
					binding: 0,
					resource: { buffer: cameraBuffer, offset: index * 256, size: 128 },
				},
				{ binding: 1, resource: { buffer: settingBuffer } },
			],
		}),
	);
	return {
		setLevel(value) {
			device.queue.writeBuffer(
				settingBuffer,
				0,
				new Float32Array([value, 0, 0, 0]),
			);
		},
		draw(pass, view, index) {
			const matrices = new Float32Array(32);
			matrices.set(view.projectionMatrix, 0);
			matrices.set(view.transform.inverse.matrix, 16);
			device.queue.writeBuffer(cameraBuffer, index * 256, matrices);
			pass.setPipeline(pipeline);
			pass.setBindGroup(0, bindGroups[index]);
			pass.draw(6);
		},
	};
}
