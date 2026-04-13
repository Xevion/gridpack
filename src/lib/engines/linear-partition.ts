import type {
	LayoutEngine,
	LayoutItem,
	ContainerDimensions,
	LayoutResult,
} from "./types";
import { stubLayout } from "./types";

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
export const linearPartitionEngine: LayoutEngine = {
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
		},
		{
			type: "select",
			key: "costFunction",
			label: "Cost Function",
			default: "variance",
			options: [
				{ label: "Variance", value: "variance" },
				{ label: "Max Deviation", value: "max-deviation" },
			],
		},
	],
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		_params: Record<string, unknown>,
		gap: number,
	): LayoutResult {
		return stubLayout(items, container.width, 200, gap);
	},
};
