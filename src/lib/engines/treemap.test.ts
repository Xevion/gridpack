import { describe, expect, it } from "vitest";

import type { LayoutItem } from "./types";

import { must } from "./test-support";
import { treemapEngine } from "./treemap";

const W = 1000;
const H = 700;

function makeItems(aspects: number[]): LayoutItem[] {
	return aspects.map((aspectRatio, i) => ({ id: i + 1, aspectRatio }));
}

function dataset(n: number, offset = 0): LayoutItem[] {
	return makeItems(Array.from({ length: n }, (_, i) => 0.4 + (((i + offset) * 7) % 13) * 0.18));
}

function layout(items: LayoutItem[], params: Record<string, unknown>, gap = 0) {
	return treemapEngine.layout(items, { width: W, height: H }, params, gap);
}

/** Mean of each cell's long-side-to-short-side ratio; 1 is a perfect square. */
function meanAspect(items: { width: number; height: number }[]): number {
	const ratios = items.map((i) => Math.max(i.width / i.height, i.height / i.width));
	return ratios.reduce((a, b) => a + b, 0) / ratios.length;
}

describe("treemap", () => {
	// Rounding each cell to whole pixels lets the total drift slightly off the
	// container area, so this is a relative bound rather than an exact one.
	it("allocates the entire container", () => {
		const items = dataset(24);
		const area = layout(items, { weightBy: "equal" }).items.reduce(
			(sum, i) => sum + i.width * i.height,
			0,
		);
		expect(Math.abs(area - W * H) / (W * H)).toBeLessThan(0.01);
	});

	it("gives every image the same area under equal weighting", () => {
		const result = layout(dataset(16), { weightBy: "equal" });
		const areas = result.items.map((i) => i.width * i.height);
		const expected = (W * H) / 16;
		for (const area of areas) {
			expect(area).toBeCloseTo(expected, -3);
		}
	});

	it("scales cell area with aspect ratio under aspect-ratio weighting", () => {
		const items = makeItems([3.0, 1.0, 0.5, 2.0, 1.5, 0.75]);
		const result = layout(items, { weightBy: "aspect-ratio" });
		const byId = new Map(result.items.map((i) => [i.id, i.width * i.height]));
		const totalAspect = items.reduce((s, i) => s + i.aspectRatio, 0);
		for (const item of items) {
			const expected = (item.aspectRatio / totalAspect) * W * H;
			expect(must(byId, item.id)).toBeCloseTo(expected, -3);
		}
	});

	// The whole point of squarification is avoiding the slivers slice-and-dice
	// produces, so it should win on mean aspect ratio across the board.
	it("produces squarer cells than slice-and-dice", () => {
		for (let t = 0; t < 10; t++) {
			const items = dataset(20 + t, t);
			const squared = meanAspect(layout(items, { squarify: true }).items);
			const sliced = meanAspect(layout(items, { squarify: false }).items);
			expect(squared).toBeLessThan(sliced);
		}
	});

	it("keeps squarified cells close to square", () => {
		const result = layout(dataset(25), { weightBy: "equal", squarify: true });
		expect(meanAspect(result.items)).toBeLessThan(1.8);
	});

	it("assigns random weights by id, so reordering does not change a tile's area", () => {
		const items = dataset(12);
		const forward = layout(items, { weightBy: "random" });
		const reversed = layout([...items].reverse(), { weightBy: "random" });
		const areaById = (r: typeof forward) =>
			new Map(r.items.map((i) => [i.id, Math.round(i.width * i.height)]));
		expect(areaById(reversed)).toEqual(areaById(forward));
	});

	it("insets every tile by the gap", () => {
		const items = dataset(12);
		const tight = layout(items, {}, 0);
		const loose = layout(items, {}, 12);
		const tightArea = tight.items.reduce((s, i) => s + i.width * i.height, 0);
		const looseArea = loose.items.reduce((s, i) => s + i.width * i.height, 0);
		expect(looseArea).toBeLessThan(tightArea);
	});
});
