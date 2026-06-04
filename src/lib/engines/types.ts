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
	/** Unit appended to the displayed value, e.g. "px", "%", "×". */
	unit?: string;
	/** Optional help text surfaced through a tooltip on the label. */
	help?: string;
};

export type NumberControl = {
	type: "number";
	key: string;
	label: string;
	default: number;
	min: number;
	max: number;
	help?: string;
};

export type SelectControl = {
	type: "select";
	key: string;
	label: string;
	default: string;
	options: { label: string; value: string; icon?: string; hint?: string }[];
	help?: string;
};

export type SwitchControl = {
	type: "switch";
	key: string;
	label: string;
	default: boolean;
	help?: string;
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

export interface LayoutEngine<P = Record<string, unknown>> {
	id: string;
	name: string;
	containerMode: ContainerMode;
	controls: ControlDescriptor[];
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: P,
		gap: number,
	): LayoutResult;
}

/**
 * Coerce a raw parameter bag into a complete, in-range object.
 *
 * For every descriptor, takes `raw[key]` when valid and falls back to the
 * descriptor default otherwise: numbers/sliders are clamped to `[min, max]`,
 * selects are validated against their option set, switches are coerced to
 * boolean. The result always has exactly the descriptor keys, every value
 * present and within bounds — so a `layout()` never sees `undefined`/`NaN`
 * regardless of how partial or stale the incoming bag is.
 */
export function resolveParams(
	controls: ControlDescriptor[],
	raw: Record<string, unknown>,
): Record<string, unknown> {
	const out: Record<string, unknown> = {};
	for (const ctrl of controls) {
		const v = raw[ctrl.key];
		switch (ctrl.type) {
			case "slider":
			case "number": {
				const n = typeof v === "number" ? v : Number(v);
				out[ctrl.key] = Number.isFinite(n)
					? Math.min(ctrl.max, Math.max(ctrl.min, n))
					: ctrl.default;
				break;
			}
			case "select":
				out[ctrl.key] = ctrl.options.some((o) => o.value === v)
					? v
					: ctrl.default;
				break;
			case "switch":
				out[ctrl.key] = typeof v === "boolean" ? v : ctrl.default;
				break;
		}
	}
	return out;
}

/**
 * Author an engine with a typed parameter shape `P` while exposing a uniform
 * `LayoutEngine` to the registry. The wrapper resolves the incoming bag through
 * {@link resolveParams} before handing it to the typed `layout`, so engine
 * bodies read fully-typed, always-present params and the single unsafe cast
 * lives here, justified by the resolver's completeness guarantee.
 */
export function defineEngine<P extends Record<string, unknown>>(cfg: {
	id: string;
	name: string;
	containerMode: ContainerMode;
	controls: ControlDescriptor[];
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: P,
		gap: number,
	): LayoutResult;
}): LayoutEngine {
	return {
		id: cfg.id,
		name: cfg.name,
		containerMode: cfg.containerMode,
		controls: cfg.controls,
		layout(items, container, params, gap) {
			const resolved = resolveParams(cfg.controls, params) as P;
			return cfg.layout(items, container, resolved, gap);
		},
	};
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
