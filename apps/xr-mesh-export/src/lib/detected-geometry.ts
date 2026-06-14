import {
	BufferAttribute,
	BufferGeometry,
	DoubleSide,
	Mesh,
	MeshBasicMaterial,
	Shape,
	ShapeGeometry,
} from "three";
import { colorForSemanticLabel } from "./colors.js";

export function createDetectedMesh(rawMesh: globalThis.XRMesh): Mesh {
	const geometry = new BufferGeometry();
	geometry.setAttribute(
		"position",
		new BufferAttribute(rawMesh.vertices.slice(), 3),
	);
	geometry.setIndex(new BufferAttribute(rawMesh.indices.slice(), 1));
	geometry.computeVertexNormals();

	const material = new MeshBasicMaterial({
		color: colorForSemanticLabel(rawMesh.semanticLabel),
		wireframe: true,
		transparent: true,
		opacity: 0.6,
	});

	const mesh = new Mesh(geometry, material);
	mesh.name = `mesh-${rawMesh.semanticLabel ?? "unknown"}`;
	return mesh;
}

export function createDetectedPlane(rawPlane: globalThis.XRPlane): Mesh | null {
	const polygon = rawPlane.polygon;
	if (polygon.length < 3) return null;

	const shape = new Shape();
	shape.moveTo(polygon[0].x, polygon[0].z);
	for (let i = 1; i < polygon.length; i++) {
		shape.lineTo(polygon[i].x, polygon[i].z);
	}
	shape.closePath();

	const geometry = new ShapeGeometry(shape);
	geometry.rotateX(-Math.PI / 2);

	const material = new MeshBasicMaterial({
		color: colorForSemanticLabel(rawPlane.semanticLabel),
		transparent: true,
		opacity: 0.3,
		side: DoubleSide,
	});

	const mesh = new Mesh(geometry, material);
	mesh.name = `plane-${rawPlane.orientation ?? "unknown"}-${rawPlane.semanticLabel ?? "unknown"}`;
	return mesh;
}

export function disposeDetectedMesh(mesh: Mesh): void {
	(mesh.geometry as BufferGeometry).dispose();
	(mesh.material as MeshBasicMaterial).dispose();
}
