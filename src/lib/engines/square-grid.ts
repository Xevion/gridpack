import type {
	LayoutEngine,
	LayoutItem,
	ContainerDimensions,
	LayoutResult,
} from "./types";
import { stubLayout } from "./types";

/**
 * Square Grid (Fixed Cell) Layout Engine
 *
 * ## Algorithm
 * Places images in a uniform grid of identical cells. Each cell has the same
 * dimensions, determined by the `cellSize` parameter and an optional aspect ratio.
 * Images are center-cropped to fill cells (object-fit: cover), or letterboxed/
 * stretched depending on the global ImageFit setting.
 *
 * Column count is auto-calculated: columns = floor((containerWidth + gap) / (cellWidth + gap)).
 * Items flow left-to-right, top-to-bottom in reading order.
 *
 * ## Complexity
 * O(n) — trivially fast. Each item's position is computed from its index:
 *   col = index % columns
 *   row = floor(index / columns)
 *   x = col * (cellWidth + gap)
 *   y = row * (cellHeight + gap)
 *
 * ## Cell Aspect Ratios
 * - **1:1** (default): Square cells. Most uniform, works well for profile photos
 *   and thumbnails. Crops the most from landscape/portrait images.
 * - **4:3**: Slightly wider. Good for landscape-oriented photography.
 * - **3:2**: Classic photo aspect ratio. Less cropping for standard photos.
 * - **16:9**: Cinematic widescreen. Great for video thumbnails, heavy cropping
 *   on portrait images.
 *
 * ## Strengths
 * - Perfectly uniform — zero wasted space, perfectly aligned edges.
 * - Trivially responsive — just recalculate column count on resize.
 * - Fastest possible layout computation.
 * - Works well when all images are similar (product grids, avatars).
 *
 * ## Weaknesses
 * - Crops every image — lossy by nature. Tall portraits and wide panoramas
 *   lose significant content.
 * - Visually monotonous — every cell looks the same size.
 * - Ignores image aspect ratio entirely in layout computation.
 * - No visual hierarchy — all images have equal visual weight.
 *
 * ## Implementation Approach
 * 1. Parse cellAspectRatio string to get numeric ratio (e.g., "4:3" → 4/3).
 * 2. cellWidth = cellSize, cellHeight = cellSize / aspectRatio.
 * 3. columns = max(1, floor((containerWidth + gap) / (cellWidth + gap))).
 * 4. Center the grid: offsetX = (containerWidth - columns * cellWidth - (columns-1) * gap) / 2.
 * 5. For each item at index i:
 *    x = offsetX + (i % columns) * (cellWidth + gap)
 *    y = floor(i / columns) * (cellHeight + gap)
 * 6. totalHeight = ceil(items.length / columns) * (cellHeight + gap) - gap.
 */
export const squareGridEngine: LayoutEngine = {
	id: "square-grid",
	name: "Grid",
	containerMode: "scroll",
	controls: [
		{
			type: "slider",
			key: "cellSize",
			label: "Cell Size",
			default: 200,
			min: 80,
			max: 400,
			step: 10,
			wide: true,
		},
		{
			type: "select",
			key: "cellAspectRatio",
			label: "Cell Ratio",
			default: "1:1",
			options: [
				{ label: "1:1", value: "1:1" },
				{ label: "4:3", value: "4:3" },
				{ label: "3:2", value: "3:2" },
				{ label: "16:9", value: "16:9" },
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
