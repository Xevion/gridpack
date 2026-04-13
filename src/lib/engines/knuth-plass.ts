import type {
	LayoutEngine,
	LayoutItem,
	ContainerDimensions,
	LayoutResult,
} from "./types";
import { stubLayout } from "./types";

/**
 * Knuth-Plass (Paragraph-Breaking) Layout Engine
 *
 * ## Algorithm
 * Models the image gallery as a typographic paragraph-breaking problem:
 * - Images are "words" with natural widths (aspectRatio × targetRowHeight).
 * - Rows are "lines" with a target width (containerWidth).
 * - Row breaks are chosen to minimize a global "badness" score that penalizes
 *   rows whose height deviates from the target.
 *
 * The algorithm builds a graph of feasible breakpoints and finds the shortest
 * path (minimum total demerits) from the start to the end. Each edge represents
 * a candidate row, with a cost (demerits) based on:
 *   - Adjustment ratio: how much the row must stretch/shrink from ideal
 *   - Badness: |adjustmentRatio|³ (Knuth's cubic penalty)
 *   - Penalties: extra cost for orphans, widows, or adjacent rows with
 *     very different heights
 *
 * ## Complexity
 * O(n²) worst case, but in practice much faster because feasible breakpoints
 * are limited by the looseness parameter. With tight looseness, each item only
 * "sees" a small window of potential break positions, giving near-linear performance.
 *
 * ## Parameters
 * - **targetRowHeight**: The ideal row height. The algorithm tries to get every
 *   row as close to this as possible.
 * - **looseness**: Tolerance for deviation from target height, on a 0-2 scale.
 *   0 = very tight (rows must be very close to target, may fail to find a
 *   valid layout for some inputs). 1 = balanced. 2 = very loose (allows
 *   significant height variation, always finds a valid layout).
 * - **orphanPenalty**: Extra demerits for a last row with very few items.
 *   Higher values force the algorithm to "steal" items from the second-to-last
 *   row to fill the last row, at the cost of slightly worse overall balance.
 *
 * ## Strengths
 * - Produces the most aesthetically balanced justified layouts of any algorithm.
 * - Considers the ENTIRE gallery when making break decisions — no local
 *   decisions that create global problems.
 * - The looseness parameter gives fine control over the uniformity/flexibility
 *   trade-off.
 * - Orphan penalty prevents the common "one lonely image on the last row" problem.
 * - Well-studied algorithm with decades of research (TeX, since 1981).
 *
 * ## Weaknesses
 * - Most complex algorithm to implement correctly.
 * - O(n²) can be slow for very large galleries (1000+ images).
 * - With tight looseness on adversarial inputs, may fail to find any valid
 *   layout (need fallback to greedy).
 * - Overkill for small galleries where greedy justified already looks fine.
 * - The visual improvement is most noticeable in the last few rows —
 *   middle rows tend to look similar to greedy regardless.
 *
 * ## Implementation Approach
 * 1. For each item i, compute its "natural width" = aspectRatio × targetRowHeight.
 * 2. Build prefix sums of natural widths.
 * 3. For each potential breakpoint i, scan forward to find all feasible end
 *    breakpoints j where a row from i to j fits within the looseness tolerance:
 *    rowWidth = sum(naturalWidths[i..j]) + (j-i) * gap
 *    adjustmentRatio = (containerWidth - rowWidth) / (targetRowHeight * sum(aspectRatios[i..j]))
 *    If |adjustmentRatio| <= looseness, the break is feasible.
 * 4. Compute demerits for each feasible row:
 *    demerits = (1 + badness + penalty)² where badness = 100 * |adjustmentRatio|³
 * 5. Use Dijkstra-like shortest path from breakpoint 0 to breakpoint n.
 * 6. Backtrack to recover the optimal set of row breaks.
 * 7. Render each row: rowHeight = containerWidth / sum(aspectRatios_in_row) adjusted for gaps.
 */
export const knuthPlassEngine: LayoutEngine = {
	id: "knuth-plass",
	name: "Knuth-Plass",
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
			type: "slider",
			key: "looseness",
			label: "Looseness",
			default: 1,
			min: 0,
			max: 2,
			step: 0.1,
			wide: true,
		},
		{
			type: "slider",
			key: "orphanPenalty",
			label: "Orphan Penalty",
			default: 50,
			min: 0,
			max: 100,
			step: 5,
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
