export type ContainerMode = "scroll" | "fill";
export type ImageFit = "cover" | "stretch" | "contain";

export type SliderControl = {
	type: "slider";
	key: string;
	label: string;
	default: number;
	min: number;
	max: number;
	step: number;
	wide?: boolean;
};

export type NumberControl = {
	type: "number";
	key: string;
	label: string;
	default: number;
	min: number;
	max: number;
};

export type SelectControl = {
	type: "select";
	key: string;
	label: string;
	default: string;
	options: { label: string; value: string }[];
};

export type SwitchControl = {
	type: "switch";
	key: string;
	label: string;
	default: boolean;
};

export type ControlDescriptor =
	| SliderControl
	| NumberControl
	| SelectControl
	| SwitchControl;

export interface LayoutItem {
	id: number;
	aspectRatio: number;
}

export interface PositionedItem {
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface LayoutResult {
	items: PositionedItem[];
	totalHeight: number;
}

export interface ContainerDimensions {
	width: number;
	height?: number;
}

export interface LayoutEngine {
	id: string;
	name: string;
	containerMode: ContainerMode;
	controls: ControlDescriptor[];
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: Record<string, unknown>,
		gap: number,
	): LayoutResult;
}

export function buildDefaultParams(
	controls: ControlDescriptor[],
): Record<string, unknown> {
	const params: Record<string, unknown> = {};
	for (const ctrl of controls) {
		params[ctrl.key] = ctrl.default;
	}
	return params;
}

/**
 * Simple grid fallback used by stub engines.
 * Lays out items in rows of equal-height cells, preserving aspect ratio.
 */
export function stubLayout(
	items: LayoutItem[],
	containerWidth: number,
	cellHeight: number,
	gap: number,
): LayoutResult {
	const results: PositionedItem[] = [];
	let x = 0;
	let y = 0;
	let rowHeight = cellHeight;

	for (const item of items) {
		const w = Math.round(cellHeight * item.aspectRatio);

		if (x > 0 && x + w > containerWidth) {
			x = 0;
			y += rowHeight + gap;
		}

		results.push({ id: item.id, x, y, width: w, height: rowHeight });
		x += w + gap;
	}

	return { items: results, totalHeight: y + rowHeight };
}
