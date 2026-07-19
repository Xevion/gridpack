import { describe, expect, it } from "vitest";

import type { LayoutItem } from "./types";

import { masonryEngine } from "./masonry";
import { must } from "./test-support";

const W = 1000;
const GAP = 4;

function makeItems(aspects: number[]): LayoutItem[] {
	return aspects.map((aspectRatio, i) => ({ id: i + 1, aspectRatio }));
}

/** Deterministic spread of shapes, varied enough that column choice matters. */
function dataset(n: number, offset = 0): LayoutItem[] {
	return makeItems(Array.from({ length: n }, (_, i) => 0.4 + (((i + offset) * 7) % 13) * 0.18));
}

/** Height of the tallest column minus the shortest: lower is a flatter bottom edge. */
function columnSpread(items: { x: number; y: number; height: number }[]): number {
	const byColumn = new Map<number, number>();
	for (const item of items) {
		byColumn.set(item.x, Math.max(byColumn.get(item.x) ?? 0, item.y + item.height));
	}
	const heights = [...byColumn.values()];
	return Math.max(...heights) - Math.min(...heights);
}

function layout(items: LayoutItem[], params: Record<string, unknown>) {
	return masonryEngine.layout(items, { width: W }, params, GAP);
}

describe("masonry", () => {
	it("gives every image the same column width", () => {
		const result = layout(dataset(20), { columns: 4 });
		const widths = new Set(result.items.map((i) => i.width));
		expect(widths.size).toBe(1);
	});

	it("uses exactly the requested number of columns", () => {
		for (const columns of [2, 3, 5, 8]) {
			const result = layout(dataset(30), { columns });
			expect(new Set(result.items.map((i) => i.x)).size).toBe(columns);
		}
	});

	it("preserves each image's aspect ratio", () => {
		const items = dataset(15);
		const result = layout(items, { columns: 3 });
		const byId = new Map(items.map((i) => [i.id, i.aspectRatio]));
		for (const item of result.items) {
			expect(item.width / item.height).toBeCloseTo(must(byId, item.id), 1);
		}
	});

	it("round-robin walks the columns strictly left to right", () => {
		const items = dataset(12);
		const result = layout(items, { columns: 4, assignment: "round-robin" });
		const xs = [...new Set(result.items.map((i) => i.x))].sort((a, b) => a - b);
		const byId = new Map(result.items.map((i) => [i.id, i]));
		items.forEach((item, index) => {
			expect(must(byId, item.id).x).toBe(xs[index % 4]);
		});
	});

	// The strategies are ranked by how flat a bottom edge they leave. Any one
	// dataset can buck the ordering, so this compares totals across many.
	it("ranks strategies by column evenness: balanced <= shortest-column <= round-robin", () => {
		let balanced = 0;
		let shortest = 0;
		let roundRobin = 0;

		for (let t = 0; t < 25; t++) {
			const items = dataset(24 + (t % 9), t);
			balanced += columnSpread(layout(items, { columns: 4, assignment: "balanced" }).items);
			shortest += columnSpread(layout(items, { columns: 4, assignment: "shortest-column" }).items);
			roundRobin += columnSpread(layout(items, { columns: 4, assignment: "round-robin" }).items);
		}

		expect(shortest).toBeLessThan(roundRobin);
		expect(balanced).toBeLessThanOrEqual(shortest);
	});

	it("keeps reading order within a column under balanced assignment", () => {
		const items = dataset(20);
		const result = layout(items, { columns: 4, assignment: "balanced" });
		const order = new Map(items.map((item, i) => [item.id, i]));
		const columns = new Map<number, number[]>();
		for (const item of result.items) {
			columns.set(item.x, [...(columns.get(item.x) ?? []), must(order, item.id)]);
		}
		for (const indices of columns.values()) {
			expect(indices).toEqual([...indices].sort((a, b) => a - b));
		}
	});

	it("never asks for more columns than it has images", () => {
		const result = layout(dataset(3), { columns: 10 });
		expect(new Set(result.items.map((i) => i.x)).size).toBeLessThanOrEqual(3);
	});
});
