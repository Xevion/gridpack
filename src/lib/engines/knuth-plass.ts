import type { LayoutItem, ContainerDimensions, LayoutResult } from "./types";

import { fittedRowHeight, renderRows } from "./row-layout";
import { defineEngine } from "./types";

type KnuthPlassParams = {
	targetRowHeight: number;
	looseness: number;
	orphanPenalty: number;
};

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
 * O(n²) worst case, but in practice much faster: a row only ever gets shorter as
 * images are added, so each breakpoint stops scanning once the row falls far
 * enough below target, and each item sees a small window of break positions.
 *
 * ## Parameters
 * - **targetRowHeight**: The ideal row height. The algorithm tries to get every
 *   row as close to this as possible.
 * - **looseness**: Weighs height uniformity against row count, on a 0-2 scale.
 *   0 keeps every row as near the target as the images allow; 2 accepts rows well
 *   off target in exchange for packing the gallery into fewer of them.
 *   It scales the badness weight rather than filtering which rows are admissible:
 *   a filter stops binding once it admits every row the demerits would have picked
 *   anyway, which would leave the upper half of the dial inert.
 *   Because demerits are `(1 + badness)²`, it is the weight's ratio to that
 *   constant 1 that matters, so the dial sweeps it geometrically. Below a point
 *   the tight end flattens out: uniformity already dominates and the partition is
 *   optimal, so tightening further cannot improve it.
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
 * - The tight end of the looseness range is nearly flat, since the most uniform
 *   partition is reached well before the dial bottoms out.
 * - Overkill for small galleries where greedy justified already looks fine.
 * - The visual improvement is most noticeable in the last few rows —
 *   middle rows tend to look similar to greedy regardless.
 *
 * ## Implementation Approach
 * 1. For each item i, compute its "natural width" = aspectRatio × targetRowHeight.
 * 2. Build prefix sums of natural widths.
 * 3. For each potential breakpoint i, scan forward over end breakpoints j, where a
 *    row from i to j has
 *    adjustmentRatio = (fittedRowHeight(i..j) - targetRowHeight) / targetRowHeight
 *    Stop extending once the row falls below MAX_SHRINK of the target. The
 *    single-image row is always added first, so a path to the end always exists.
 * 4. Compute demerits for each row:
 *    demerits = (1 + badness + penalty)² where badness = weight(looseness) × |adjustmentRatio|³
 * 5. Use Dijkstra-like shortest path from breakpoint 0 to breakpoint n.
 * 6. Backtrack to recover the optimal set of row breaks.
 * 7. Render each row: rowHeight = containerWidth / sum(aspectRatios_in_row) adjusted for gaps.
 */
/** Row length below which the last row counts as orphaned. */
const ORPHAN_MIN = 3;
/** How far below target a row may fall before longer rows stop being considered. */
const MAX_SHRINK = 0.75;
/**
 * Badness weight at each end of the looseness dial. Demerits are
 * `(1 + weight * |r|^3)^2`, so it is the weight *relative to that constant 1*
 * that decides whether uniform rows or few rows win. A typical row deviates by
 * |r| ~ 0.2, which this range carries from "deviation dwarfs the row count" to
 * "deviation is nearly free", keeping the whole slider live.
 */
const BADNESS_WEIGHT_TIGHT = 300;
const BADNESS_WEIGHT_LOOSE = 2;

export const knuthPlassEngine = defineEngine<KnuthPlassParams>({
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
			unit: "px",
			help: "Target height each row aims for. The line-breaker fits images to the container width, so actual row heights vary around this value.",
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
			unit: "×",
			help: "Trades row-height uniformity against row count. Lower keeps every row near the target height; higher accepts rows well off target to pack the gallery into fewer of them.",
		},
		{
			type: "slider",
			key: "orphanPenalty",
			label: "Orphan Penalty",
			default: 50,
			min: 0,
			max: 100,
			step: 5,
			unit: "%",
			help: "Discourages leaving a single image alone on the last row. Higher values pull more images down to keep it company.",
		},
	],
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: KnuthPlassParams,
		gap: number,
	): LayoutResult {
		const { targetRowHeight, looseness, orphanPenalty } = params;
		const W = container.width;
		const n = items.length;

		if (n === 0 || W <= 0) return { items: [], totalHeight: 0 };

		const prefix = new Array<number>(n + 1).fill(0);
		for (let i = 0; i < n; i++) prefix[i + 1] = prefix[i] + items[i].aspectRatio;

		/** Signed stretch of the row items a..b: 0 sits exactly on the target height. */
		const adjustment = (a: number, b: number): number => {
			const h = fittedRowHeight(prefix[b + 1] - prefix[a], b - a + 1, W, gap);
			if (!Number.isFinite(h) || h <= 0) return Infinity;
			return (h - targetRowHeight) / targetRowHeight;
		};

		// Looseness weighs height uniformity against row count, rather than gating
		// which rows are admissible. A gate stops binding once it admits every row the
		// demerits would have picked anyway, which leaves the upper half of the dial
		// inert. The weight is swept geometrically because only its ratio to the
		// constant 1 matters, and it always leaves a path to the end.
		const span = Math.min(1, Math.max(0, looseness / 2));
		const badnessWeight =
			BADNESS_WEIGHT_TIGHT * (BADNESS_WEIGHT_LOOSE / BADNESS_WEIGHT_TIGHT) ** span;

		const demerits = (a: number, b: number, r: number): number => {
			// Knuth's cubic badness: mild stretches cost almost nothing, and the price
			// climbs steeply enough that one very wrong row loses to several mediocre ones.
			const badness = badnessWeight * Math.abs(r) ** 3;
			const count = b - a + 1;
			// Only the final row can be orphaned, and the penalty scales with how short
			// it is, so raising the dial pulls images down to keep it company.
			const orphan = b === n - 1 && count < ORPHAN_MIN ? orphanPenalty * (ORPHAN_MIN - count) : 0;
			return (1 + badness + orphan) ** 2;
		};

		const dp = new Array<number>(n + 1).fill(Infinity);
		const back = new Array<number>(n + 1).fill(-1);
		dp[0] = 0;

		for (let i = 0; i < n; i++) {
			if (dp[i] === Infinity) continue;

			for (let j = i; j < n; j++) {
				const r = adjustment(i, j);
				if (!Number.isFinite(r)) break;

				const cost = dp[i] + demerits(i, j, r);
				if (cost < dp[j + 1]) {
					dp[j + 1] = cost;
					back[j + 1] = i;
				}

				// Rows only ever get shorter as images are added, so once one is far
				// below target every longer row is too: stop extending this node. The
				// single-image row is always added first, so a path to the end survives.
				if (r < -MAX_SHRINK) break;
			}
		}

		if (dp[n] === Infinity) return renderRows([items], W, gap);

		const rows: LayoutItem[][] = [];
		for (let end = n; end > 0; ) {
			const start = back[end];
			if (start < 0) return renderRows([items], W, gap);
			rows.unshift(items.slice(start, end));
			end = start;
		}

		return renderRows(rows, W, gap);
	},
});
