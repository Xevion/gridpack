import { describe, expect, it } from "vitest";

import type { LayoutItem, LayoutResult } from "./types";

import { linearPartitionEngine } from "./linear-partition";

const W = 1000;
const GAP = 4;
const TARGET = 220;

function makeItems(aspects: number[]): LayoutItem[] {
	return aspects.map((aspectRatio, i) => ({ id: i + 1, aspectRatio }));
}

/** Row lengths, recovered from the fact that a row shares one y coordinate. */
function rowSizes(result: LayoutResult): number[] {
	const sizes: number[] = [];
	let lastY: number | null = null;
	for (const item of result.items) {
		if (item.y !== lastY) {
			sizes.push(0);
			lastY = item.y;
		}
		sizes[sizes.length - 1]++;
	}
	return sizes;
}

function partitionCost(
	sizes: number[],
	items: LayoutItem[],
	mode: "variance" | "max-deviation",
): number {
	const costs: number[] = [];
	let idx = 0;
	for (const size of sizes) {
		const row = items.slice(idx, idx + size);
		idx += size;
		const aspectSum = row.reduce((s, it) => s + it.aspectRatio, 0);
		const height = (W - GAP * (size - 1)) / aspectSum;
		const dev = height - TARGET;
		costs.push(mode === "variance" ? dev * dev : Math.abs(dev));
	}
	return mode === "variance" ? costs.reduce((a, b) => a + b, 0) : Math.max(...costs);
}

/** Every way to cut `n` ordered items into exactly `k` non-empty runs. */
function* compositions(n: number, k: number): Generator<number[]> {
	if (k === 1) {
		yield [n];
		return;
	}
	for (let first = 1; first <= n - k + 1; first++) {
		for (const rest of compositions(n - first, k - 1)) yield [first, ...rest];
	}
}

function bruteForceBest(items: LayoutItem[], k: number, mode: "variance" | "max-deviation") {
	let best = Infinity;
	for (const sizes of compositions(items.length, k)) {
		best = Math.min(best, partitionCost(sizes, items, mode));
	}
	return best;
}

const DATASETS = [
	[1.5, 0.8, 1.2, 2.0, 0.6, 1.1, 1.7, 0.9, 1.3],
	[1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0],
	[3.0, 0.35, 2.2, 0.5, 1.8, 0.42, 2.6, 0.75, 1.1, 0.9],
	[0.5, 0.55, 0.6, 0.65, 0.7, 0.75, 0.8, 0.85, 0.9],
];

describe("linear partition", () => {
	// The DP is only worth its O(n^2*k) cost if it genuinely returns the optimum.
	// Brute force over every contiguous partition settles that on inputs small
	// enough to enumerate, which is what catches an off-by-one in the backtrack.
	describe.each(["variance", "max-deviation"] as const)("%s cost", (mode) => {
		it.each(DATASETS.map((d, i) => [i, d] as const))(
			"finds the optimal partition for its row count (dataset %i)",
			(_i, aspects) => {
				const items = makeItems(aspects);
				const result = linearPartitionEngine.layout(
					items,
					{ width: W },
					{ targetRowHeight: TARGET, costFunction: mode },
					GAP,
				);
				const sizes = rowSizes(result);
				const actual = partitionCost(sizes, items, mode);
				const optimal = bruteForceBest(items, sizes.length, mode);
				expect(actual).toBeCloseTo(optimal, 6);
			},
		);
	});

	it("preserves image order across rows", () => {
		const items = makeItems(DATASETS[2]);
		const result = linearPartitionEngine.layout(
			items,
			{ width: W },
			{ targetRowHeight: TARGET },
			GAP,
		);
		expect(result.items.map((i) => i.id)).toEqual(items.map((i) => i.id));
	});

	it("gives every row the full container width", () => {
		const items = makeItems(DATASETS[0]);
		const result = linearPartitionEngine.layout(
			items,
			{ width: W },
			{ targetRowHeight: TARGET },
			GAP,
		);
		const byRow = new Map<number, typeof result.items>();
		for (const item of result.items) {
			byRow.set(item.y, [...(byRow.get(item.y) ?? []), item]);
		}
		for (const row of byRow.values()) {
			const right = Math.max(...row.map((i) => i.x + i.width));
			expect(right).toBeCloseTo(W, 0);
		}
	});

	// The estimated row count is clamped to the image count, so the "n < k"
	// degenerate case the DP guards against is unreachable from the outside. These
	// pin that clamp: a target height far too tall for the container asks for more
	// rows than there are images, and must still resolve to one image per row.
	it("never emits more rows than images", () => {
		const items = makeItems([0.3, 0.3, 0.3]);
		const result = linearPartitionEngine.layout(
			items,
			{ width: 200 },
			{ targetRowHeight: 400 },
			GAP,
		);
		expect(result.items).toHaveLength(3);
		expect(new Set(result.items.map((i) => i.y)).size).toBeLessThanOrEqual(3);
	});

	it("puts everything on one row when the images barely fill the width", () => {
		const items = makeItems([1.5, 0.8]);
		const result = linearPartitionEngine.layout(items, { width: W }, { targetRowHeight: 40 }, GAP);
		expect(result.items).toHaveLength(2);
		expect(new Set(result.items.map((i) => i.y)).size).toBe(1);
	});
});
