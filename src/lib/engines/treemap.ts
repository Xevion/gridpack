import type { LayoutItem, ContainerDimensions, PositionedItem, LayoutResult } from "./types";

import { seededRandom } from "../images";
import { defineEngine } from "./types";

type TreemapParams = {
	weightBy: "equal" | "aspect-ratio" | "random";
	squarify: boolean;
};

interface Rect {
	x: number;
	y: number;
	w: number;
	h: number;
}

/** An image reduced to the only property subdivision cares about: its area. */
interface Cell {
	id: number;
	area: number;
}

type PlacedCell = Rect & { id: number };

/**
 * Bruls' aspect-ratio objective for a candidate strip: the worst width-to-height
 * ratio among its cells once `side` is divided between them. Lower is squarer,
 * and the greedy loop stops extending a strip as soon as this starts rising.
 */
function worstRatio(row: Cell[], side: number): number {
	if (row.length === 0) return Infinity;
	let sum = 0;
	let max = 0;
	let min = Infinity;
	for (const c of row) {
		sum += c.area;
		max = Math.max(max, c.area);
		min = Math.min(min, c.area);
	}
	if (sum <= 0 || side <= 0 || min <= 0) return Infinity;
	const s2 = sum * sum;
	const w2 = side * side;
	return Math.max((w2 * max) / s2, s2 / (w2 * min));
}

/**
 * Squarified subdivision: repeatedly grow a strip along the rectangle's shorter
 * edge while that improves the worst aspect ratio, emit it, and continue into
 * the space left over.
 */
function squarifyCells(cells: Cell[], rect: Rect): PlacedCell[] {
	const out: PlacedCell[] = [];
	let remaining = cells;
	let r = { ...rect };

	while (remaining.length > 0 && r.w > 0 && r.h > 0) {
		const side = Math.min(r.w, r.h);
		const row: Cell[] = [remaining[0]];
		let i = 1;
		while (
			i < remaining.length &&
			worstRatio([...row, remaining[i]], side) <= worstRatio(row, side)
		) {
			row.push(remaining[i]);
			i++;
		}

		const rowArea = row.reduce((s, c) => s + c.area, 0);
		if (r.w <= r.h) {
			const stripH = Math.min(r.h, rowArea / r.w);
			let x = r.x;
			for (const c of row) {
				const w = stripH > 0 ? c.area / stripH : 0;
				out.push({ id: c.id, x, y: r.y, w, h: stripH });
				x += w;
			}
			r = { x: r.x, y: r.y + stripH, w: r.w, h: r.h - stripH };
		} else {
			const stripW = Math.min(r.w, rowArea / r.h);
			let y = r.y;
			for (const c of row) {
				const h = stripW > 0 ? c.area / stripW : 0;
				out.push({ id: c.id, x: r.x, y, w: stripW, h });
				y += h;
			}
			r = { x: r.x + stripW, y: r.y, w: r.w - stripW, h: r.h };
		}
		remaining = remaining.slice(row.length);
	}

	// Any tail left by a degenerate rectangle still gets a (zero-area) slot so the
	// caller's "every image is placed" contract holds; the inset clamp gives it 1px.
	for (const c of remaining) {
		out.push({ id: c.id, x: r.x, y: r.y, w: 0, h: 0 });
	}
	return out;
}

/**
 * Slice-and-dice: bisect the cells by weight and the rectangle proportionally,
 * alternating axis at each level. Faster and order-preserving, but the cells
 * elongate as the recursion deepens.
 */
function sliceAndDice(cells: Cell[], rect: Rect, horizontal: boolean): PlacedCell[] {
	if (cells.length === 0) return [];
	if (cells.length === 1) {
		return [{ id: cells[0].id, x: rect.x, y: rect.y, w: rect.w, h: rect.h }];
	}

	const total = cells.reduce((s, c) => s + c.area, 0);
	let acc = 0;
	let split = 1;
	for (let i = 0; i < cells.length - 1; i++) {
		acc += cells[i].area;
		if (acc >= total / 2) {
			split = i + 1;
			break;
		}
		split = i + 2;
	}

	const head = cells.slice(0, split);
	const tail = cells.slice(split);
	const headArea = head.reduce((s, c) => s + c.area, 0);
	const frac = total > 0 ? headArea / total : 0.5;

	const a = horizontal
		? { x: rect.x, y: rect.y, w: rect.w * frac, h: rect.h }
		: { x: rect.x, y: rect.y, w: rect.w, h: rect.h * frac };
	const b = horizontal
		? { x: rect.x + a.w, y: rect.y, w: rect.w - a.w, h: rect.h }
		: { x: rect.x, y: rect.y + a.h, w: rect.w, h: rect.h - a.h };

	return [...sliceAndDice(head, a, !horizontal), ...sliceAndDice(tail, b, !horizontal)];
}

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
 * - Separation between cells requires shrinking each cell inward, which can
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
 * 6. Separate cells by insetting each rectangle by gap/2 on each side. Cells tile
 *    the container exactly, so this inset is the only gap between neighbours and
 *    the global gap control needs no treemap-specific padding alongside it.
 * 7. Return positioned items. totalHeight = containerHeight (fixed).
 */
export const treemapEngine = defineEngine<TreemapParams>({
	id: "treemap",
	name: "Treemap",
	containerMode: "fill",
	// Cells are sorted by weight before subdivision, so the incoming order is lost.
	ignores: ["order"],
	controls: [
		{
			type: "select",
			key: "weightBy",
			label: "Weight By",
			default: "equal",
			help: "What determines each tile's area. Equal gives every image the same size; Aspect Ratio and Random weight tiles by shape or chance.",
			options: [
				{
					label: "Equal",
					value: "equal",
					hint: "Every image gets the same tile area.",
				},
				{
					label: "Aspect Ratio",
					value: "aspect-ratio",
					hint: "Wider images claim proportionally more area.",
				},
				{
					label: "Random",
					value: "random",
					hint: "Tile areas are assigned randomly for an organic, uneven mosaic.",
				},
			],
		},
		{
			type: "switch",
			key: "squarify",
			label: "Squarify",
			default: true,
			help: "Favors near-square tiles over long thin slivers, trading exact area accuracy for more usable image shapes.",
		},
	],
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: TreemapParams,
		gap: number,
	): LayoutResult {
		const { weightBy, squarify } = params;
		const H = container.height ?? 600;
		const W = container.width;
		const results: PositionedItem[] = [];

		if (items.length === 0 || W <= 0 || H <= 0) {
			return { items: results, totalHeight: Math.max(0, H) };
		}

		const weightOf = (item: LayoutItem): number => {
			switch (weightBy) {
				case "equal":
					return 1;
				case "aspect-ratio":
					return item.aspectRatio;
				case "random":
					// Keyed by id so a tile's share survives reorders and count changes.
					return 0.25 + seededRandom(item.id) * 1.75;
			}
		};

		const weights = items.map(weightOf);
		const totalWeight = weights.reduce((s, w) => s + w, 0);
		const totalArea = W * H;

		// Descending weight is what makes squarification work: the large cells are
		// committed while whole rectangles are still free.
		const cells: Cell[] = items
			.map((item, i) => ({ id: item.id, area: (weights[i] / totalWeight) * totalArea }))
			.sort((a, b) => b.area - a.area);

		const full: Rect = { x: 0, y: 0, w: W, h: H };
		const placed = squarify ? squarifyCells(cells, full) : sliceAndDice(cells, full, true);

		// Subdivision tiles the container edge to edge, so this inset is the only
		// thing separating neighbouring tiles. It is capped at what a cell can spare
		// so a small tile shrinks toward 1px instead of inverting into its neighbour.
		const inset = gap / 2;
		for (const p of placed) {
			const ix = Math.min(inset, Math.max(0, (p.w - 1) / 2));
			const iy = Math.min(inset, Math.max(0, (p.h - 1) / 2));
			results.push({
				id: p.id,
				x: Math.round(p.x + ix),
				y: Math.round(p.y + iy),
				width: Math.max(1, Math.round(p.w - 2 * ix)),
				height: Math.max(1, Math.round(p.h - 2 * iy)),
			});
		}

		return { items: results, totalHeight: H };
	},
});
