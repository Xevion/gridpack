import type {
	LayoutItem,
	ContainerDimensions,
	LayoutResult,
} from "./types";
import { defineEngine, stubLayout } from "./types";

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
		_params: MasonryParams,
		gap: number,
	): LayoutResult {
		return stubLayout(items, container.width, 200, gap);
	},
});
