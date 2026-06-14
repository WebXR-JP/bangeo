const LABEL_COLOR: Record<string, number> = {
	floor: 0x4ade80,
	wall: 0x60a5fa,
	ceiling: 0xa78bfa,
	table: 0xfb923c,
	couch: 0xfb923c,
	door: 0xfb923c,
	window: 0xfb923c,
};

const DEFAULT_MESH_COLOR = 0x94a3b8;

export function colorForSemanticLabel(label?: string): number {
	if (!label) return DEFAULT_MESH_COLOR;
	return LABEL_COLOR[label.toLowerCase()] ?? DEFAULT_MESH_COLOR;
}
