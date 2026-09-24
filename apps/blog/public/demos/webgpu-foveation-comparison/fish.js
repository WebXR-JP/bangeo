const shader = `
struct Camera { projection: mat4x4f, view: mat4x4f, model: mat4x4f }
struct Material { color: vec4f }
@group(0) @binding(0) var<uniform> camera: Camera;
@group(1) @binding(0) var fishTexture: texture_2d<f32>;
@group(1) @binding(1) var fishSampler: sampler;
@group(1) @binding(2) var<uniform> material: Material;
struct Out { @builtin(position) position: vec4f, @location(0) normal: vec3f, @location(1) uv: vec2f }
@vertex fn vertexMain(@location(0) position: vec3f, @location(1) normal: vec3f, @location(2) uv: vec2f) -> Out {
  let world = camera.model * vec4f(position, 1.0);
  return Out(camera.projection * camera.view * world, normalize((camera.model * vec4f(normal, 0.0)).xyz), uv);
}
@fragment fn fragmentMain(input: Out) -> @location(0) vec4f {
  let light = 0.62 + 0.38 * max(dot(normalize(input.normal), normalize(vec3f(-0.3, 0.8, 0.6))), 0.0);
  let base = textureSample(fishTexture, fishSampler, input.uv) * material.color;
  return vec4f(base.rgb * light, base.a);
}`;

function parseGlb(buffer) {
	const view = new DataView(buffer);
	if (view.getUint32(0, true) !== 0x46546c67 || view.getUint32(4, true) !== 2) {
		throw new Error("3Dモデルの形式が正しくありません。");
	}
	const jsonLength = view.getUint32(12, true);
	const json = JSON.parse(
		new TextDecoder().decode(new Uint8Array(buffer, 20, jsonLength)),
	);
	const binaryStart = 20 + jsonLength + 8;
	function accessor(index) {
		const item = json.accessors[index];
		const block = json.bufferViews[item.bufferView];
		const components = { SCALAR: 1, VEC2: 2, VEC3: 3, VEC4: 4 }[item.type];
		const bytes =
			item.componentType === 5126 || item.componentType === 5125 ? 4 : 2;
		const stride = block.byteStride || components * bytes;
		const offset = binaryStart + block.byteOffset + (item.byteOffset || 0);
		const values = [];
		for (let i = 0; i < item.count; i++) {
			for (let c = 0; c < components; c++) {
				const at = offset + i * stride + c * bytes;
				values.push(
					item.componentType === 5126
						? view.getFloat32(at, true)
						: item.componentType === 5125
							? view.getUint32(at, true)
							: view.getUint16(at, true),
				);
			}
		}
		return values;
	}
	const imageBlock = json.bufferViews[json.images[0].bufferView];
	const imageBytes = new Uint8Array(
		buffer,
		binaryStart + imageBlock.byteOffset,
		imageBlock.byteLength,
	);
	return { json, accessor, imageBytes };
}

export async function createFishRenderer(device) {
	const response = await fetch("./assets/bangeo-fish.glb");
	if (!response.ok) throw new Error("3Dモデルを読み込めませんでした。");
	const glb = parseGlb(await response.arrayBuffer());
	const bitmap = await createImageBitmap(
		new Blob([glb.imageBytes], { type: "image/png" }),
	);
	const texture = device.createTexture({
		size: [bitmap.width, bitmap.height],
		format: "rgba8unorm",
		usage:
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.RENDER_ATTACHMENT,
	});
	device.queue.copyExternalImageToTexture({ source: bitmap }, { texture }, [
		bitmap.width,
		bitmap.height,
	]);
	const white = device.createTexture({
		size: [1, 1],
		format: "rgba8unorm",
		usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST,
	});
	device.queue.writeTexture(
		{ texture: white },
		new Uint8Array([255, 255, 255, 255]),
		{ bytesPerRow: 4 },
		[1, 1],
	);
	const sampler = device.createSampler({
		magFilter: "linear",
		minFilter: "linear",
	});
	const cameraBuffer = device.createBuffer({
		size: 6 * 256,
		usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
	});
	const primitives = glb.json.meshes[0].primitives.map((item) => {
		const positions = glb.accessor(item.attributes.POSITION);
		const normals = glb.accessor(item.attributes.NORMAL);
		const uvs = glb.accessor(item.attributes.TEXCOORD_0);
		const vertices = new Float32Array((positions.length / 3) * 8);
		for (let i = 0; i < positions.length / 3; i++) {
			vertices.set(positions.slice(i * 3, i * 3 + 3), i * 8);
			vertices.set(normals.slice(i * 3, i * 3 + 3), i * 8 + 3);
			vertices.set(uvs.slice(i * 2, i * 2 + 2), i * 8 + 6);
		}
		const indices = new Uint32Array(glb.accessor(item.indices));
		const vertexBuffer = device.createBuffer({
			size: vertices.byteLength,
			usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
		});
		const indexBuffer = device.createBuffer({
			size: indices.byteLength,
			usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
		});
		device.queue.writeBuffer(vertexBuffer, 0, vertices);
		device.queue.writeBuffer(indexBuffer, 0, indices);
		const pbr = glb.json.materials[item.material].pbrMetallicRoughness;
		const colorBuffer = device.createBuffer({
			size: 16,
			usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
		});
		device.queue.writeBuffer(
			colorBuffer,
			0,
			new Float32Array(pbr.baseColorFactor || [1, 1, 1, 1]),
		);
		return {
			vertexBuffer,
			indexBuffer,
			indexCount: indices.length,
			colorBuffer,
			texture: pbr.baseColorTexture ? texture : white,
		};
	});
	let pipeline;
	let cameraBindGroups;
	return {
		createPipeline(format) {
			const module = device.createShaderModule({ code: shader });
			pipeline = device.createRenderPipeline({
				layout: "auto",
				vertex: {
					module,
					entryPoint: "vertexMain",
					buffers: [
						{
							arrayStride: 32,
							attributes: [
								{ shaderLocation: 0, offset: 0, format: "float32x3" },
								{ shaderLocation: 1, offset: 12, format: "float32x3" },
								{ shaderLocation: 2, offset: 24, format: "float32x2" },
							],
						},
					],
				},
				fragment: { module, entryPoint: "fragmentMain", targets: [{ format }] },
				primitive: { topology: "triangle-list", cullMode: "none" },
				depthStencil: {
					format: "depth24plus",
					depthWriteEnabled: true,
					depthCompare: "less",
				},
			});
			cameraBindGroups = Array.from({ length: 6 }, (_, index) =>
				device.createBindGroup({
					layout: pipeline.getBindGroupLayout(0),
					entries: [
						{
							binding: 0,
							resource: {
								buffer: cameraBuffer,
								offset: index * 256,
								size: 192,
							},
						},
					],
				}),
			);
			for (const primitive of primitives) {
				primitive.bindGroup = device.createBindGroup({
					layout: pipeline.getBindGroupLayout(1),
					entries: [
						{ binding: 0, resource: primitive.texture.createView() },
						{ binding: 1, resource: sampler },
						{ binding: 2, resource: { buffer: primitive.colorBuffer } },
					],
				});
			}
		},
		draw(pass, view, index) {
			pass.setPipeline(pipeline);
			// World-space copies stay aligned between the two eyes.
			for (const [instance, x, y, z, scale] of [
				[0, -1.1, 0.02, -2.5, 0.65],
				[1, 0, -0.03, -2.4, 1],
				[2, 1.1, 0.02, -2.5, 0.65],
			]) {
				const model = [
					scale,
					0,
					0,
					0,
					0,
					scale,
					0,
					0,
					0,
					0,
					scale,
					0,
					x,
					y,
					z,
					1,
				];
				const matrices = new Float32Array(48);
				matrices.set(view.projectionMatrix, 0);
				matrices.set(view.transform.inverse.matrix, 16);
				matrices.set(model, 32);
				const slot = index * 3 + instance;
				device.queue.writeBuffer(cameraBuffer, slot * 256, matrices);
				pass.setBindGroup(0, cameraBindGroups[slot]);
				for (const primitive of primitives) {
					pass.setBindGroup(1, primitive.bindGroup);
					pass.setVertexBuffer(0, primitive.vertexBuffer);
					pass.setIndexBuffer(primitive.indexBuffer, "uint32");
					pass.drawIndexed(primitive.indexCount);
				}
			}
		},
	};
}
