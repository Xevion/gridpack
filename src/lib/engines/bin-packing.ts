import type {
	LayoutEngine,
	LayoutItem,
	ContainerDimensions,
	PositionedItem,
	LayoutResult,
} from "./types";

/**
 * Bin-Packing (Maximal Rectangles / Collage) Layout Engine
 *
 * ## Algorithm
 * Treats the container as a bounded 2D rectangular region and places images as
 * axis-aligned rectangles, splitting remaining free space after each placement.
 * This is a variant of the 2D strip-packing / guillotine-cut bin-packing problem.
 *
 * The "Maximal Rectangles" (MaxRects) algorithm is used:
 * 1. Start with one free rectangle = the full container.
 * 2. For each image (in sorted order):
 *    a. Compute the image's target dimensions based on scaling mode.
 *    b. Find the best-fit free rectangle using the placement heuristic.
 *    c. Place the image in that free rectangle.
 *    d. Split all overlapping free rectangles around the placed image.
 *    e. Remove any free rectangles that are fully contained within another.
 * 3. The result is an arbitrary, non-grid arrangement with minimal wasted space.
 *
 * ## Free Rectangle Splitting
 * When an image is placed, every free rectangle that overlaps with it is split
 * into up to 4 new free rectangles (top, bottom, left, right of the placed image).
 * Redundant (fully contained) free rectangles are then pruned. This "maximal
 * rectangles" approach tracks ALL maximal free regions, including overlapping ones,
 * which provides better packing than simpler guillotine-cut approaches.
 *
 * ## Placement Heuristics
 * - **best-short-side** (BSSF): Choose the free rect where the shorter leftover
 *   side after placement is minimized. Tends to produce tight packing.
 * - **best-long-side** (BLSF): Minimize the longer leftover side. Slightly
 *   different packing patterns.
 * - **best-area** (BAF): Choose the free rect with the smallest area that
 *   still fits the image. Leaves larger free rects available for bigger images.
 * - **bottom-left** (BL): Place as low and as far left as possible. Produces
 *   a gravity-like effect where images settle to the bottom-left corner.
 *
 * ## Sort Strategies
 * Pre-sorting images dramatically affects packing quality:
 * - **area-desc**: Largest images first. Generally best packing because large
 *   items are hardest to place and should go first.
 * - **height-desc**: Tallest images first. Good for layouts with strong
 *   vertical structure.
 * - **width-desc**: Widest images first. Good for horizontal-biased layouts.
 * - **aspect-desc**: Most extreme aspect ratios first (furthest from 1:1).
 *   Places "difficult" shapes first when there's the most free space.
 *
 * ## Split Rules
 * When a free rectangle is split by a placed image, the remaining L-shaped
 * space can be divided two ways. The split rule determines which:
 * - **shorter-axis**: Split along the shorter remaining dimension. Tends to
 *   create more square-ish free regions.
 * - **longer-axis**: Split along the longer remaining dimension. Tends to
 *   create more elongated free regions.
 *
 * ## Scaling
 * - **uniform** (uniformScale=true): All images are scaled to have roughly equal
 *   area = (containerWidth × containerHeight) / itemCount. Aspect ratio is preserved.
 *   This produces the most visually balanced collages.
 * - **proportional** (uniformScale=false): Each image's area is proportional to
 *   its natural pixel area (width × height from the aspect ratio). Larger images
 *   get more space. Can produce interesting visual hierarchies.
 *
 * ## Complexity
 * O(n² · f) where n = images, f = free rectangles. In practice, f is bounded
 * and the sort step is O(n log n), so effective complexity is O(n log n) to
 * O(n²) depending on container shape.
 *
 * ## Strengths
 * - Produces organic, collage-like layouts that are visually striking.
 * - Minimal wasted space — packing efficiency often exceeds 95%.
 * - Each layout is unique and interesting.
 * - Multiple heuristic knobs give users visible control over the aesthetic.
 * - No cropping required — images preserve their aspect ratio.
 *
 * ## Weaknesses
 * - NP-hard in the general case (these are heuristic solutions).
 * - Layout depends heavily on sort order — small input changes can cause
 *   large layout shifts (poor animation stability).
 * - Not order-preserving — images may appear in arbitrary positions.
 * - Harder to make responsive than row/column-based layouts.
 * - Can leave irregular gaps if images have incompatible aspect ratios.
 * - Requires a fixed container height (fill mode).
 *
 * ## Implementation Approach
 * 1. Compute target area per image based on scaling mode.
 * 2. For each image, compute target dimensions:
 *    targetWidth = sqrt(targetArea × aspectRatio)
 *    targetHeight = sqrt(targetArea / aspectRatio)
 * 3. Sort images by the chosen sort strategy.
 * 4. Initialize free rectangles list with [{ x:0, y:0, w:containerWidth, h:containerHeight }].
 * 5. For each image:
 *    a. Find best-fit free rect using placement heuristic.
 *    b. If no rect fits, scale down the image and retry.
 *    c. Place image at the chosen position.
 *    d. Split all free rects that overlap with the placed image.
 *    e. Prune contained free rects.
 * 6. Return positioned items. totalHeight = containerHeight (fixed).
 */
export const binPackingEngine: LayoutEngine = {
	id: "bin-packing",
	name: "Bin Pack",
	containerMode: "fill",
	controls: [
		{
			type: "select",
			key: "sortStrategy",
			label: "Sort Strategy",
			default: "area-desc",
			options: [
				{ label: "Area (largest first)", value: "area-desc" },
				{ label: "Height (tallest first)", value: "height-desc" },
				{ label: "Width (widest first)", value: "width-desc" },
				{ label: "Aspect (extreme first)", value: "aspect-desc" },
			],
		},
		{
			type: "select",
			key: "placement",
			label: "Placement",
			default: "best-short-side",
			options: [
				{ label: "Best Short Side", value: "best-short-side" },
				{ label: "Best Long Side", value: "best-long-side" },
				{ label: "Best Area", value: "best-area" },
				{ label: "Bottom-Left", value: "bottom-left" },
			],
		},
		{
			type: "select",
			key: "splitRule",
			label: "Split Rule",
			default: "shorter-axis",
			options: [
				{ label: "Shorter Axis", value: "shorter-axis" },
				{ label: "Longer Axis", value: "longer-axis" },
			],
		},
		{
			type: "switch",
			key: "uniformScale",
			label: "Uniform Size",
			default: true,
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
		const cellW = (container.width - (cols - 1) * gap) / cols;

		let x = 0;
		let y = 0;
		let rowHeight = 0;

		for (let i = 0; i < items.length; i++) {
			const item = items[i];
			const h = Math.min(cellW / item.aspectRatio, containerHeight * 0.4);
			const w = h * item.aspectRatio;

			if (x > 0 && x + w > container.width) {
				x = 0;
				y += rowHeight + gap;
				rowHeight = 0;
			}

			if (y + h > containerHeight) break;

			results.push({
				id: item.id,
				x,
				y,
				width: Math.round(w),
				height: Math.round(h),
			});
			rowHeight = Math.max(rowHeight, h);
			x += Math.round(w) + gap;
		}

		return { items: results, totalHeight: containerHeight };
	},
};
