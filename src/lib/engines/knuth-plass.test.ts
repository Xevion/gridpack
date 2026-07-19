import { describe, expect, it } from "vitest";

import type { LayoutItem, LayoutResult } from "./types";

import { knuthPlassEngine } from "./knuth-plass";

const W = 1000;
const GAP = 4;

function makeItems(aspects: number[]): LayoutItem[] {
	return aspects.map((aspectRatio, i) => ({ id: i + 1, aspectRatio }));
}

function dataset(n: number, offset = 0): LayoutItem[] {
	return makeItems(Array.from({ length: n }, (_, i) => 0.4 + (((i + offset) * 7) % 13) * 0.18));
}

function layout(items: LayoutItem[], params: Record<string, unknown>) {
	return knuthPlassEngine.layout(items, { width: W }, params, GAP);
}

function lastRowLength(result: LayoutResult): number {
	const maxY = Math.max(...result.items.map((i) => i.y));
	return result.items.filter((i) => i.y === maxY).length;
}

function rowHeights(result: LayoutResult): number[] {
	const heights = new Map<number, number>();
	for (const item of result.items) {
		if (!heights.has(item.y)) heights.set(item.y, item.height);
	}
	return [...heights.values()];
}

describe("knuth-plass", () => {
	it("preserves image order", () => {
		const items = dataset(30);
		const result = layout(items, {});
		expect(result.items.map((i) => i.id)).toEqual(items.map((i) => i.id));
	});

	// Zero looseness admits no row inside the tolerance, which would disconnect the
	// breakpoint graph. The per-node fallback edge is what keeps a path to the end,
	// so this is the regression guard for an empty gallery.
	it("still produces a full layout at zero looseness", () => {
		for (let t = 0; t < 12; t++) {
			const items = dataset(20 + t, t);
			const result = layout(items, { looseness: 0 });
			expect(result.items).toHaveLength(items.length);
			expect(result.totalHeight).toBeGreaterThan(0);
		}
	});

	it("gives every row the full container width", () => {
		const result = layout(dataset(28), {});
		const byRow = new Map<number, typeof result.items>();
		for (const item of result.items) {
			byRow.set(item.y, [...(byRow.get(item.y) ?? []), item]);
		}
		for (const row of byRow.values()) {
			expect(Math.max(...row.map((i) => i.x + i.width))).toBeCloseTo(W, 0);
		}
	});

	// Looseness trades height uniformity for row count, so tightening it should pull
	// rows toward the target height, and loosening it should buy fewer rows. Both
	// halves are asserted, since a dial that only moved one would be half dead.
	it("trades row-height accuracy for fewer rows as looseness rises", () => {
		const TARGET = 220;
		const measure = (looseness: number) => {
			let deviation = 0;
			let rows = 0;
			for (let t = 0; t < 15; t++) {
				const items = dataset(26 + t, t);
				const heights = rowHeights(layout(items, { looseness, targetRowHeight: TARGET }));
				deviation += heights.reduce((s, h) => s + Math.abs(h - TARGET), 0) / heights.length;
				rows += heights.length;
			}
			return { deviation, rows };
		};

		const tight = measure(0);
		const loose = measure(2);
		expect(loose.rows).toBeLessThan(tight.rows);
		expect(loose.deviation).toBeGreaterThan(tight.deviation);
	});

	it("orphans the last row less often as the penalty rises", () => {
		const orphans = (penalty: number) => {
			let count = 0;
			for (let t = 0; t < 40; t++) {
				const items = dataset(14 + (t % 21), t);
				if (lastRowLength(layout(items, { orphanPenalty: penalty })) < 3) count++;
			}
			return count;
		};
		expect(orphans(100)).toBeLessThanOrEqual(orphans(0));
	});

	it("handles a single image", () => {
		const result = layout(makeItems([1.6]), {});
		expect(result.items).toHaveLength(1);
		expect(result.items[0].width).toBeCloseTo(W, 0);
	});
});
