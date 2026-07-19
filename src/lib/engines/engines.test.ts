import { describe, expect, it } from "vitest";

import type { ContainerDimensions, LayoutEngine, LayoutItem, PositionedItem } from "./types";

import { engines } from "./registry";

const WIDTH = 1200;
const HEIGHT = 800;
const GAP = 4;

/** Rounding to integer pixels means exact geometry assertions need slack. */
const TOL = 1.5;

/**
 * Bin-packing legitimately drops images it cannot fit: with a fixed container
 * and no shrink below MIN_FIT_SCALE, a full container simply has no room left.
 * Every other engine is expected to place its whole input.
 */
const MAY_DROP_ITEMS = new Set(["bin-packing"]);

/** A spread of shapes: panorama, landscape, square, portrait, and a sliver. */
const ASPECTS = [
	1.78, 0.56, 1.0, 1.33, 0.75, 2.4, 0.42, 1.5, 1.0, 0.67, 3.2, 1.2, 0.9, 1.6, 0.8, 2.0, 0.5, 1.1,
	1.4, 0.62,
];

function makeItems(aspects: number[] = ASPECTS): LayoutItem[] {
	return aspects.map((aspectRatio, i) => ({ id: i + 1, aspectRatio }));
}

function container(engine: LayoutEngine): ContainerDimensions {
	return engine.containerMode === "fill" ? { width: WIDTH, height: HEIGHT } : { width: WIDTH };
}

function overlaps(a: PositionedItem, b: PositionedItem): boolean {
	return (
		a.x + a.width > b.x + TOL &&
		b.x + b.width > a.x + TOL &&
		a.y + a.height > b.y + TOL &&
		b.y + b.height > a.y + TOL
	);
}

/**
 * Every control's boundary values as a separate param bag, so the sweep exercises
 * each select branch and each slider extreme (padding 0/8, looseness 0/2, …)
 * rather than only the defaults.
 */
function paramVariants(engine: LayoutEngine): { label: string; params: Record<string, unknown> }[] {
	const variants: { label: string; params: Record<string, unknown> }[] = [
		{ label: "defaults", params: {} },
	];
	for (const ctrl of engine.controls) {
		const values: unknown[] =
			ctrl.type === "select"
				? ctrl.options.map((o) => o.value)
				: ctrl.type === "switch"
					? [true, false]
					: ctrl.type === "slider" || ctrl.type === "number"
						? [ctrl.min, ctrl.max]
						: [];
		for (const value of values) {
			variants.push({ label: `${ctrl.key}=${String(value)}`, params: { [ctrl.key]: value } });
		}
	}
	return variants;
}

describe.each(engines.map((e) => [e.name, e] as const))("%s", (_name, engine) => {
	describe.each(paramVariants(engine).map((v) => [v.label, v.params] as const))(
		"%s",
		(_label, params) => {
			const items = makeItems();
			const result = engine.layout(items, container(engine), params, GAP);

			it("emits only input ids, without duplicates", () => {
				const ids = result.items.map((i) => i.id);
				expect(new Set(ids).size).toBe(ids.length);
				const inputIds = new Set(items.map((i) => i.id));
				expect(ids.every((id) => inputIds.has(id))).toBe(true);
			});

			it("places every image", () => {
				if (MAY_DROP_ITEMS.has(engine.id)) {
					expect(result.items.length).toBeGreaterThan(0);
				} else {
					expect(result.items).toHaveLength(items.length);
				}
			});

			it("gives every image a positive, finite size", () => {
				for (const item of result.items) {
					expect(Number.isFinite(item.x)).toBe(true);
					expect(Number.isFinite(item.y)).toBe(true);
					expect(item.width).toBeGreaterThan(0);
					expect(item.height).toBeGreaterThan(0);
				}
			});

			it("keeps every image within the container width", () => {
				for (const item of result.items) {
					expect(item.x).toBeGreaterThanOrEqual(-TOL);
					expect(item.x + item.width).toBeLessThanOrEqual(WIDTH + TOL);
				}
			});

			it("never overlaps two images", () => {
				for (let i = 0; i < result.items.length; i++) {
					for (let j = i + 1; j < result.items.length; j++) {
						const a = result.items[i];
						const b = result.items[j];
						expect(
							overlaps(a, b),
							`#${a.id} (${a.x},${a.y},${a.width}x${a.height}) overlaps ` +
								`#${b.id} (${b.x},${b.y},${b.width}x${b.height})`,
						).toBe(false);
					}
				}
			});

			it("reports a totalHeight that covers every image", () => {
				const lowest = result.items.reduce((max, i) => Math.max(max, i.y + i.height), 0);
				expect(result.totalHeight).toBeGreaterThanOrEqual(lowest - TOL);
			});

			it("is deterministic", () => {
				const again = engine.layout(makeItems(), container(engine), params, GAP);
				expect(again).toEqual(result);
			});
		},
	);

	describe("fill-mode engines", () => {
		it("confine images to the container height and report it as totalHeight", () => {
			if (engine.containerMode !== "fill") return;
			const result = engine.layout(makeItems(), container(engine), {}, GAP);
			expect(result.totalHeight).toBe(HEIGHT);
			for (const item of result.items) {
				expect(item.y).toBeGreaterThanOrEqual(-TOL);
				expect(item.y + item.height).toBeLessThanOrEqual(HEIGHT + TOL);
			}
		});
	});

	/**
	 * A control that leaves the layout byte-identical at every setting is dead —
	 * either unwired or a UI element that should not be on screen. Each control is
	 * given several datasets and its full value range; mattering anywhere passes.
	 */
	describe("control wiring", () => {
		// A single dataset is not enough evidence: a live control can coincidentally
		// produce the same layout on one input (max-deviation often agrees with
		// variance on well-balanced rows). Only a control inert across this whole
		// sweep of shapes, counts and widths is actually dead.
		const datasets = [
			ASPECTS,
			ASPECTS.concat(ASPECTS),
			ASPECTS.map((a) => 1 / a),
			ASPECTS.slice(0, 7),
			ASPECTS.map((a) => a * 1.6),
			Array.from({ length: 33 }, (_, i) => 0.4 + ((i * 7) % 13) * 0.22),
		];
		const widths = [WIDTH, 700];

		function key(
			items: LayoutItem[],
			params: Record<string, unknown>,
			width: number,
			gap = GAP,
		): string {
			const dims = engine.containerMode === "fill" ? { width, height: HEIGHT } : { width };
			const r = engine.layout(items, dims, params, gap);
			return JSON.stringify([
				r.items.map((i) => [i.id, i.x, i.y, i.width, i.height]),
				r.totalHeight,
			]);
		}

		function mattersSomewhere(params: Record<string, unknown>[]): boolean {
			return datasets.some((aspects) =>
				widths.some((width) => {
					const items = makeItems(aspects);
					const base = key(items, {}, width);
					return params.some((p) => key(items, p, width) !== base);
				}),
			);
		}

		for (const ctrl of engine.controls) {
			if (ctrl.type === "button") continue;
			const alternatives: unknown[] =
				ctrl.type === "select"
					? ctrl.options.map((o) => o.value).filter((v) => v !== ctrl.default)
					: ctrl.type === "switch"
						? [!ctrl.default]
						: [ctrl.min, ctrl.max].filter((v) => v !== ctrl.default);

			it(`${ctrl.key} changes the layout`, () => {
				expect(alternatives.length).toBeGreaterThan(0);
				expect(mattersSomewhere(alternatives.map((v) => ({ [ctrl.key]: v })))).toBe(true);
			});
		}

		it("gap changes the layout", () => {
			const items = makeItems();
			expect(key(items, {}, WIDTH, 0)).not.toBe(key(items, {}, WIDTH, 16));
		});
	});

	describe("degenerate input", () => {
		it("returns an empty layout for no images", () => {
			const result = engine.layout([], container(engine), {}, GAP);
			expect(result.items).toHaveLength(0);
			expect(Number.isFinite(result.totalHeight)).toBe(true);
			expect(result.totalHeight).toBeGreaterThanOrEqual(0);
		});

		it("handles a single image", () => {
			const result = engine.layout(makeItems([1.5]), container(engine), {}, GAP);
			expect(result.items).toHaveLength(1);
			expect(result.items[0].width).toBeGreaterThan(0);
			expect(result.items[0].height).toBeGreaterThan(0);
		});

		it("handles extreme aspect ratios", () => {
			const result = engine.layout(makeItems([0.25, 4, 0.25, 4]), container(engine), {}, GAP);
			for (const item of result.items) {
				expect(item.width).toBeGreaterThan(0);
				expect(item.height).toBeGreaterThan(0);
			}
		});

		it("handles a container narrower than a single gap", () => {
			const tiny = engine.containerMode === "fill" ? { width: 2, height: 2 } : { width: 2 };
			expect(() => engine.layout(makeItems(), tiny, {}, GAP)).not.toThrow();
		});
	});
});
