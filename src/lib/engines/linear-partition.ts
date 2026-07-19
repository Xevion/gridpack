import type { LayoutItem, ContainerDimensions, LayoutResult } from "./types";

import { fittedRowHeight, renderRows } from "./row-layout";
import { defineEngine } from "./types";

type LinearPartitionParams = {
	targetRowHeight: number;
	costFunction: "variance" | "max-deviation";
};

/**
 * Linear Partition (DP-Optimal Justified) Layout Engine
 *
 * ## Algorithm
 * Uses dynamic programming to find the optimal partition of N images into K rows
 * that minimizes a global cost function (typically the variance of row heights
 * from a target). This is the "optimal" counterpart to the greedy justified
 * layout — instead of committing to a row break as soon as the row is full enough,
 * it considers ALL possible row break positions and picks the globally best set.
 *
 * The core DP recurrence:
 *   dp[i][k] = min over j < i of { max(dp[j][k-1], cost(j+1..i)) }
 *
 * where cost(j+1..i) measures how "bad" a row containing items j+1 through i
 * would be (deviation from target height, aspect ratio imbalance, etc.).
 *
 * ## Complexity
 * O(n² · k) where n = number of images, k = number of rows.
 * Space: O(n · k) for the DP table, O(n) with path compression.
 *
 * ## Cost Functions
 * - **variance**: Minimize the sum of squared deviations from target row height.
 *   Produces uniformly-heighted rows. Most predictable results.
 * - **max-deviation**: Minimize the maximum deviation of any single row from
 *   the target. Prevents any one row from looking drastically different, but
 *   may allow more overall variation.
 *
 * ## Row Count Determination
 * If `maxRows` is 0 (unlimited), the algorithm estimates the ideal row count:
 *   k ≈ totalAspectWidth / containerWidth
 * where totalAspectWidth = sum(item.aspectRatio * targetRowHeight).
 * It then searches k-1, k, k+1 and picks the partition with lowest total cost.
 *
 * ## Strengths
 * - Produces more visually balanced rows than greedy justified layout.
 * - Globally optimal — no single row is sacrificed for the benefit of others.
 * - Same visual style as justified (rows of varying height, full-width) but
 *   with better proportions.
 * - Preserves image order.
 *
 * ## Weaknesses
 * - O(n²·k) is noticeably slower for large galleries (500+ images).
 * - The visual improvement over greedy is often subtle — requires side-by-side
 *   comparison to appreciate.
 * - More complex to implement correctly, especially the backtracking step
 *   to recover the actual partition from the DP table.
 * - Edge cases: when n < k, falls back to one image per row.
 *
 * ## Implementation Approach
 * 1. Compute prefix sums of aspect ratios for O(1) row-width queries.
 * 2. Estimate k from targetRowHeight if maxRows is 0.
 * 3. Build DP table: dp[i][j] = minimum cost of partitioning items 0..i into j rows.
 * 4. Cost of a row spanning items a..b:
 *    rowAspectSum = prefixSum[b+1] - prefixSum[a]
 *    rowHeight = (containerWidth - (b-a)*gap) / rowAspectSum
 *    cost = (rowHeight - targetRowHeight)² (for variance mode)
 * 5. Backtrack through the DP table to recover row break indices.
 * 6. Commit each row using the same row-rendering logic as justified layout.
 */
export const linearPartitionEngine = defineEngine<LinearPartitionParams>({
	id: "linear-partition",
	name: "Linear Partition",
	containerMode: "scroll",
	controls: [
		{
			type: "slider",
			key: "targetRowHeight",
			label: "Row Height",
			default: 220,
			min: 100,
			max: 400,
			step: 10,
			wide: true,
			unit: "px",
			help: "Target height each row aims for. The partitioner balances rows around this value while scaling images to fill the container width.",
		},
		{
			type: "select",
			key: "costFunction",
			label: "Cost Function",
			default: "variance",
			help: "What the partitioner minimizes when balancing rows. Variance evens out all rows; Max Deviation targets the single worst row.",
			options: [
				{
					label: "Variance",
					value: "variance",
					hint: "Balances every row's height around the average.",
				},
				{
					label: "Max Deviation",
					value: "max-deviation",
					hint: "Focuses on shrinking the single most off-target row.",
				},
			],
		},
	],
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: LinearPartitionParams,
		gap: number,
	): LayoutResult {
		const { targetRowHeight, costFunction } = params;
		const W = container.width;
		const n = items.length;

		if (n === 0 || W <= 0) return { items: [], totalHeight: 0 };

		// Prefix sums make any row's aspect total an O(1) lookup, which is what keeps
		// the O(n^2 * k) table affordable.
		const prefix = new Array<number>(n + 1).fill(0);
		for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + items[i].aspectRatio;

		/** Cost of a row spanning items a..b inclusive. */
		const rowCost = (a: number, b: number): number => {
			const h = fittedRowHeight(prefix[b + 1] - prefix[a], b - a + 1, W, gap);
			if (!Number.isFinite(h) || h <= 0) return Infinity;
			const dev = h - targetRowHeight;
			return costFunction === "variance" ? dev * dev : Math.abs(dev);
		};

		// Variance sums every row's penalty, so one bad row can be offset elsewhere.
		// Max-deviation carries the single worst row forward, which instead makes the
		// partition chase its outlier.
		const combine = (a: number, b: number) =>
			costFunction === "variance" ? a + b : Math.max(a, b);

		/** Best partition of all items into exactly `k` rows, or null if none exists. */
		function partition(k: number): { cost: number; rows: LayoutItem[][] } | null {
			const dp: number[][] = Array.from({ length: k + 1 }, () =>
				new Array<number>(n + 1).fill(Infinity),
			);
			const back: number[][] = Array.from({ length: k + 1 }, () =>
				new Array<number>(n + 1).fill(-1),
			);
			dp[0][0] = 0;

			for (let rows = 1; rows <= k; rows++) {
				for (let i = rows; i <= n; i++) {
					for (let j = rows - 1; j < i; j++) {
						if (dp[rows - 1][j] === Infinity) continue;
						const c = combine(dp[rows - 1][j], rowCost(j, i - 1));
						if (c < dp[rows][i]) {
							dp[rows][i] = c;
							back[rows][i] = j;
						}
					}
				}
			}

			if (dp[k][n] === Infinity) return null;

			const rows: LayoutItem[][] = [];
			let end = n;
			for (let r = k; r > 0; r--) {
				const start = back[r][end];
				if (start < 0) return null;
				rows.unshift(items.slice(start, end));
				end = start;
			}
			return { cost: dp[k][n], rows };
		}

		// Seed the row count from how much width the images want at their target
		// height, then let the neighbours compete: the ideal k is rarely off by more
		// than one, and comparing their costs settles which side to land on.
		const naturalWidth = prefix[n] * targetRowHeight + gap * (n - 1);
		const seed = Math.max(1, Math.min(n, Math.round(naturalWidth / W)));

		let best: { cost: number; rows: LayoutItem[][] } | null = null;
		for (const k of [seed - 1, seed, seed + 1]) {
			if (k < 1 || k > n) continue;
			const candidate = partition(k);
			if (candidate && (best === null || candidate.cost < best.cost)) best = candidate;
		}

		return renderRows(best ? best.rows : [items], W, gap);
	},
});
