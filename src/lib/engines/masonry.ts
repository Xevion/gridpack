import type { LayoutItem, ContainerDimensions, PositionedItem, LayoutResult } from "./types";

import { defineEngine } from "./types";

type MasonryParams = {
	columns: number;
	assignment: "shortest-column" | "round-robin" | "balanced";
};

/**
 * Masonry (Column-Major) Layout Engine
 *
 * ## Algorithm
 * Maintains N columns of equal width. Each new image is placed at the bottom of
 * the shortest column, preserving its aspect ratio (height = columnWidth / aspectRatio).
 * Columns flow independently like a waterfall — each column accumulates images
 * vertically, and the total height is determined by the tallest column.
 *
 * ## Complexity
 * O(n) — single pass over items with O(1) shortest-column lookup (for small N).
 *
 * ## Assignment Strategies
 * - **shortest-column** (default): Always place in the column with the least total height.
 *   Produces the most balanced bottom edge but disrupts left-to-right reading order.
 * - **round-robin**: Place images left-to-right, wrapping at the last column.
 *   Preserves insertion order but can create very uneven column heights with
 *   varying aspect ratios.
 * - **balanced**: Two-pass approach. First pass assigns greedily to shortest column;
 *   second pass swaps items between columns to minimize the max height difference.
 *   Produces the most even bottom edge at the cost of O(n log n) runtime.
 *
 * ## Strengths
 * - Handles mixed aspect ratios naturally — tall portraits and wide landscapes
 *   coexist without cropping or distortion.
 * - Vertical scanning feels natural for content feeds (Pinterest, social media).
 * - Simple to implement and fast to compute.
 * - Responsive: column count can adapt to container width.
 *
 * ## Weaknesses
 * - Bottom edge is always ragged — columns end at different heights.
 * - Left-to-right reading order is not preserved (with shortest-column assignment).
 * - Very wide panoramic images get squeezed to column width, becoming tiny.
 * - No concept of "rows" — adjacent images in different columns have no
 *   horizontal alignment relationship.
 *
 * ## Implementation Approach
 * 1. Determine column count from the `columns` parameter.
 * 2. Compute columnWidth = (containerWidth - (columns-1) * gap) / columns.
 * 3. Maintain an array of column heights, initialized to 0.
 * 4. For each image:
 *    a. Select target column based on assignment strategy.
 *    b. Compute image height = columnWidth / item.aspectRatio.
 *    c. Position at (columnIndex * (columnWidth + gap), columnHeights[columnIndex]).
 *    d. Update columnHeights[columnIndex] += imageHeight + gap.
 * 5. totalHeight = max(columnHeights) - gap.
 */
export const masonryEngine = defineEngine<MasonryParams>({
	id: "masonry",
	name: "Masonry",
	containerMode: "scroll",
	controls: [
		{
			type: "number",
			key: "columns",
			label: "Columns",
			default: 4,
			min: 2,
			max: 10,
		},
		{
			type: "select",
			key: "assignment",
			label: "Assignment",
			default: "shortest-column",
			help: "How each image picks a column. Shortest Column keeps heights even, Round Robin cycles in order, Balanced optimizes the overall fill.",
			options: [
				{
					label: "Shortest Column",
					value: "shortest-column",
					hint: "Adds each image to whichever column is currently shortest, keeping heights even.",
				},
				{
					label: "Round Robin",
					value: "round-robin",
					hint: "Fills columns in a fixed left-to-right rotation, ignoring their heights.",
				},
				{
					label: "Balanced",
					value: "balanced",
					hint: "Looks ahead to minimize the final height difference between columns.",
				},
			],
		},
	],
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: MasonryParams,
		gap: number,
	): LayoutResult {
		const { columns, assignment } = params;
		const W = container.width;
		const results: PositionedItem[] = [];

		if (items.length === 0 || W <= 0) {
			return { items: results, totalHeight: 0 };
		}

		const cols = Math.max(1, Math.min(Math.round(columns), items.length));
		const colW = Math.max(1, (W - (cols - 1) * gap) / cols);
		const heights = new Array<number>(cols).fill(0);
		const assigned: number[][] = Array.from({ length: cols }, () => []);
		const itemHeight = items.map((it) => colW / it.aspectRatio);

		const shortest = () => heights.indexOf(Math.min(...heights));

		if (assignment === "balanced") {
			// Longest-processing-time first: placing the tallest images while the
			// columns are still empty leaves the short ones to even out the tails,
			// which lands a flatter bottom edge than a single in-order greedy pass.
			const byHeight = items
				.map((_, i) => i)
				.sort((a, b) => itemHeight[b] - itemHeight[a] || a - b);
			for (const i of byHeight) {
				const c = shortest();
				assigned[c].push(i);
				heights[c] += itemHeight[i] + gap;
			}
			// Reading order is restored within each column; only the column choice
			// was driven by height.
			for (const col of assigned) col.sort((a, b) => a - b);
		} else {
			for (let i = 0; i < items.length; i++) {
				const c = assignment === "round-robin" ? i % cols : shortest();
				assigned[c].push(i);
				heights[c] += itemHeight[i] + gap;
			}
		}

		for (let c = 0; c < cols; c++) {
			let y = 0;
			for (const i of assigned[c]) {
				results.push({
					id: items[i].id,
					x: Math.round(c * (colW + gap)),
					y: Math.round(y),
					width: Math.round(colW),
					height: Math.max(1, Math.round(itemHeight[i])),
				});
				y += itemHeight[i] + gap;
			}
		}

		return { items: results, totalHeight: Math.max(0, Math.max(...heights) - gap) };
	},
});
