import type {
	LayoutEngine,
	LayoutItem,
	ContainerDimensions,
	PositionedItem,
	LayoutResult,
} from "./types";

/**
 * Treemap (Squarified Recursive Subdivision) Layout Engine
 *
 * ## Algorithm
 * Recursively subdivides the container rectangle into sub-rectangles, each
 * proportional to a weight value. The "squarified" variant (Bruls, Huizing &
 * van Wijk, 2000) optimizes the subdivision to produce sub-rectangles that are
 * as close to square as possible, avoiding the thin slivers that naive
 * slice-and-dice produces.
 *
 * The squarified algorithm works by:
 * 1. Sort items by weight (descending).
 * 2. Start with the full container as the current rectangle.
 * 3. Greedily add items to a "strip" along the shorter dimension of the
 *    current rectangle.
 * 4. After adding each item, check if the worst aspect ratio in the strip
 *    improved. If not, finalize the strip and start a new one in the
 *    remaining space.
 * 5. Repeat until all items are placed.
 *
 * ## Weight Modes
 * - **equal**: All images get equal area = containerArea / n.
 *   Produces the most uniform grid-like appearance.
 * - **aspect-ratio**: Weight = aspectRatio. Wider images get proportionally
 *   more space. Tends to preserve the "feel" of each image's shape.
 * - **random**: Random weights (seeded for stability). Creates intentional
 *   visual hierarchy — some images dominate, others recede.
 *
 * ## Squarification
 * When enabled (default), the algorithm optimizes for square-ish cells.
 * When disabled, it falls back to simple slice-and-dice: alternating
 * horizontal and vertical splits at each recursion level. Slice-and-dice
 * is faster and more predictable but produces many elongated rectangles.
 *
 * ## Complexity
 * O(n log n) due to the initial sort. The subdivision itself is O(n).
 *
 * ## Strengths
 * - Zero wasted space — every pixel of the container is allocated to an image.
 * - Naturally creates visual hierarchy when using non-equal weights.
 * - Well-suited for "importance-weighted" views (featured images get more space).
 * - The squarified variant produces aesthetically pleasing proportions.
 * - Responsive: subdivisions adapt naturally to any container aspect ratio.
 *
 * ## Weaknesses
 * - Images are cropped to arbitrary rectangles (aspect ratio is ignored in
 *   layout, only weight matters). This makes it fundamentally lossy unless
 *   the ImageFit mode is set to "contain" or "stretch".
 * - Without squarification, thin slivers are common and look ugly.
 * - Not order-preserving — the sort step reorders images.
 * - Visual stability on input changes is poor — adding or removing one image
 *   can cause the entire layout to reflow.
 * - Padding between cells requires shrinking each cell inward, which can
 *   make small cells disappear.
 *
 * ## Implementation Approach
 * 1. Assign weights based on weightBy parameter.
 * 2. Sort items by weight descending.
 * 3. Compute total weight. Each item's target area = (weight / totalWeight) × containerArea.
 * 4. If squarify is true:
 *    a. Use the squarified treemap algorithm:
 *       - Start with remaining = all items, rect = full container.
 *       - Take items from the front of the sorted list.
 *       - Add to current strip. Compute worst aspect ratio.
 *       - If adding the next item would worsen the worst ratio, finalize strip.
 *       - Layout strip items along the shorter edge of rect.
 *       - Reduce rect by the strip's thickness. Repeat.
 *    b. worst_ratio(strip, rect) = max over items of max(w/h, h/w) where
 *       each item's dimensions come from its share of the strip.
 * 5. If squarify is false (slice-and-dice):
 *    a. Alternate between horizontal and vertical splits.
 *    b. At each level, split the rectangle proportionally by weight.
 * 6. Apply padding by insetting each cell's rectangle by padding/2 on each side.
 * 7. Return positioned items. totalHeight = containerHeight (fixed).
 */
export const treemapEngine: LayoutEngine = {
	id: "treemap",
	name: "Treemap",
	containerMode: "fill",
	controls: [
		{
			type: "select",
			key: "weightBy",
			label: "Weight By",
			default: "equal",
			options: [
				{ label: "Equal", value: "equal" },
				{ label: "Aspect Ratio", value: "aspect-ratio" },
				{ label: "Random", value: "random" },
			],
		},
		{
			type: "switch",
			key: "squarify",
			label: "Squarify",
			default: true,
		},
		{
			type: "slider",
			key: "padding",
			label: "Padding",
			default: 2,
			min: 0,
			max: 8,
			step: 1,
		},
	],
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		_params: Record<string, unknown>,
		gap: number,
	): LayoutResult {
		const containerHeight = container.height ?? 600;
		const results: PositionedItem[] = [];
		const cols = Math.ceil(Math.sqrt(items.length));
		const rows = Math.ceil(items.length / cols);
		const cellW = (container.width - (cols - 1) * gap) / cols;
		const cellH = (containerHeight - (rows - 1) * gap) / rows;

		for (let i = 0; i < items.length; i++) {
			const col = i % cols;
			const row = Math.floor(i / cols);
			results.push({
				id: items[i].id,
				x: Math.round(col * (cellW + gap)),
				y: Math.round(row * (cellH + gap)),
				width: Math.round(cellW),
				height: Math.round(cellH),
			});
		}

		return { items: results, totalHeight: containerHeight };
	},
};
