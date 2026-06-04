import type {
	LayoutItem,
	ContainerDimensions,
	PositionedItem,
	LayoutResult,
} from "./types";
import { defineEngine } from "./types";
import { seededRandom } from "../images";

type BinPackingParams = {
	sortStrategy: "area-desc" | "height-desc" | "width-desc" | "aspect-desc";
	placement: "best-short-side" | "best-long-side" | "best-area" | "bottom-left";
	fill: number;
	sizeVariation: number;
	fillGaps: number;
};

/**
 * Bin-Packing (Maximal-Rectangles Collage) Layout Engine
 *
 * ## Algorithm
 * Places images as axis-aligned rectangles inside a fixed container, tracking the
 * leftover space as a set of *maximal* free rectangles (the MAXRECTS variant of
 * Jylänki, "A Thousand Ways to Pack the Bin"). Unlike a guillotine packer, the
 * free rectangles are allowed to overlap, which captures every empty pocket
 * exactly and packs noticeably tighter at the cost of a slightly larger free list.
 *
 * 1. Give every image a target area (see Scaling), then derive target width/height
 *    from its aspect ratio so both area and shape are respected.
 * 2. Sort images by the chosen strategy (large/awkward first while space is free).
 * 3. Seed the free list with one rectangle = the full container.
 * 4. For each image:
 *    a. Score every free rectangle that can hold it at full target size and pick
 *       the best (placement heuristic). If none fits at full size, fall back to the
 *       free rectangle that requires the *least* shrink — a closed-form max-scale
 *       computed directly per pocket, so every image lands in a single pass with no
 *       iterative guess-and-check.
 *    b. Place the image's footprint at that rectangle's top-left corner.
 *    c. Split every free rectangle the footprint overlaps into its maximal
 *       remainders, then prune any rectangle contained in another.
 * 5. Optionally grow placed rectangles into the leftover space (see Fill Gaps).
 *
 * ## Placement Heuristics (which free rectangle to use)
 * - **best-short-side** (BSSF): minimize the shorter leftover edge — tightest packing.
 * - **best-long-side** (BLSF): minimize the longer leftover edge — different texture.
 * - **best-area** (BAF): smallest free rectangle that still fits, preserving larger
 *   regions for later images.
 * - **bottom-left** (BL): place as high and as far left as possible, like settling bricks.
 *
 * ## Sort Strategies (placement order)
 * - **area-desc**: largest area first.   - **height-desc**: tallest first.
 * - **width-desc**: widest first.        - **aspect-desc**: most extreme aspect first.
 * Ties break toward the more extreme aspect ratio, packing awkward shapes early.
 *
 * ## Scaling
 * - **fill** is the fraction of the container the target areas cover before any gap
 *   growth. Lower fill leaves slack so images keep their target size; higher fill
 *   shrinks late images more.
 * - **size variation** spreads each image's target area around the mean using a
 *   deterministic per-id weight, creating a stable visual hierarchy at higher values.
 *
 * ## Gap Model
 * Each image reserves a footprint of (w + gap, h + gap) and is rendered inset by
 * gap/2 on every side. Neighbouring footprints touch, so images are separated by a
 * uniform `gap` and sit a uniform `gap/2` in from the container edges — symmetric on
 * all four sides rather than flush on two.
 *
 * ## Fill Gaps (post-pass)
 * MAXRECTS leaves slack (especially toward the right/bottom edge). The Fill Gaps
 * dial expands each placed footprint outward into adjacent empty space, processing
 * largest-first and clamping to its neighbours so nothing overlaps. At 0 the layout
 * is a pure aspect-preserving collage with visible gaps; at 100 the container is
 * fully tiled (aspect ratios bend, which `cover` fit hides as cropping); values in
 * between meet partway. This is the dial between an airy collage and a solid mosaic.
 *
 * ## Complexity
 * O(n · f) selection + O(n · f) split with O(f²) prune per placement, plus the
 * O(n log n) sort and an O(n²) grow pass. f (free-rect count) stays small in practice.
 *
 * ## Strengths
 * - Organic, collage-like layouts with high packing efficiency and no cropping
 *   required (until Fill Gaps is raised).
 * - Single-pass placement with exact per-pocket sizing — no iterative shrink.
 *
 * ## Weaknesses
 * - Heuristic, not optimal (2D bin-packing is NP-hard).
 * - Not order-preserving; small input changes can reflow the whole layout.
 * - Requires a fixed container height (fill mode).
 */

const EPS = 0.5;
/** Smallest scale an image may shrink to and still be placed. */
const MIN_FIT_SCALE = 0.12;

interface FreeRect {
	x: number;
	y: number;
	w: number;
	h: number;
}

interface Placed extends FreeRect {
	id: number;
}

/**
 * Score a free rectangle for a footprint under the chosen heuristic.
 * Returns [primary, secondary] (lower is better); the caller has already
 * verified the footprint fits.
 */
function score(
	rect: FreeRect,
	w: number,
	h: number,
	placement: BinPackingParams["placement"],
): [number, number] {
	const leftoverH = rect.w - w;
	const leftoverV = rect.h - h;
	const shortSide = Math.min(leftoverH, leftoverV);
	const longSide = Math.max(leftoverH, leftoverV);

	switch (placement) {
		case "best-short-side":
			return [shortSide, longSide];
		case "best-long-side":
			return [longSide, shortSide];
		case "best-area":
			return [rect.w * rect.h - w * h, shortSide];
		case "bottom-left":
			return [rect.y + h, rect.x];
	}
}

function isBetter(s: [number, number], best: [number, number] | null): boolean {
	if (!best) return true;
	if (s[0] < best[0] - EPS) return true;
	return Math.abs(s[0] - best[0]) < EPS && s[1] < best[1];
}

/** True when `inner` lies within `outer` (with tolerance). */
function contains(outer: FreeRect, inner: FreeRect): boolean {
	return (
		inner.x >= outer.x - EPS &&
		inner.y >= outer.y - EPS &&
		inner.x + inner.w <= outer.x + outer.w + EPS &&
		inner.y + inner.h <= outer.y + outer.h + EPS
	);
}

/** True when the two rectangles share interior area. */
function intersects(a: FreeRect, b: FreeRect): boolean {
	return (
		a.x < b.x + b.w - EPS &&
		a.x + a.w > b.x + EPS &&
		a.y < b.y + b.h - EPS &&
		a.y + a.h > b.y + EPS
	);
}

/**
 * Remove every free rectangle the placed footprint overlaps, replacing each with
 * its maximal remainders (the MAXRECTS split), then drop degenerate and
 * fully-contained rectangles.
 */
function carve(free: FreeRect[], p: FreeRect): FreeRect[] {
	const next: FreeRect[] = [];
	for (const f of free) {
		if (!intersects(f, p)) {
			next.push(f);
			continue;
		}
		if (p.x > f.x + EPS) next.push({ x: f.x, y: f.y, w: p.x - f.x, h: f.h });
		if (p.x + p.w < f.x + f.w - EPS)
			next.push({
				x: p.x + p.w,
				y: f.y,
				w: f.x + f.w - (p.x + p.w),
				h: f.h,
			});
		if (p.y > f.y + EPS) next.push({ x: f.x, y: f.y, w: f.w, h: p.y - f.y });
		if (p.y + p.h < f.y + f.h - EPS)
			next.push({
				x: f.x,
				y: p.y + p.h,
				w: f.w,
				h: f.y + f.h - (p.y + p.h),
			});
	}

	const live = next.filter((r) => r.w > EPS && r.h > EPS);
	return live.filter((r, i) => {
		const area = r.w * r.h;
		return !live.some((o, k) => {
			if (k === i || !contains(o, r)) return false;
			const oArea = o.w * o.h;
			return oArea > area + EPS || (oArea > area - EPS && k < i);
		});
	});
}

/**
 * Expand each placed footprint into adjacent empty space by fraction `g` of the
 * available room. Smallest-first, so boxed-in tiles get first claim on nearby
 * slack and sizes stay even (a large neighbour can't swallow the gap before a
 * small one reaches it). Each footprint clamps to its current neighbours, so the
 * result never overlaps regardless of `g`.
 */
function growToFill(placed: Placed[], W: number, H: number, g: number): void {
	const order = [...placed.keys()].sort(
		(a, b) => placed[a].w * placed[a].h - placed[b].w * placed[b].h,
	);

	for (const idx of order) {
		const p = placed[idx];

		let limitR = W;
		let limitL = 0;
		let limitB = H;
		let limitT = 0;
		for (let j = 0; j < placed.length; j++) {
			if (j === idx) continue;
			const q = placed[j];
			const vOverlap = q.y < p.y + p.h - EPS && q.y + q.h > p.y + EPS;
			const hOverlap = q.x < p.x + p.w - EPS && q.x + q.w > p.x + EPS;
			if (vOverlap) {
				if (q.x >= p.x + p.w - EPS) limitR = Math.min(limitR, q.x);
				if (q.x + q.w <= p.x + EPS) limitL = Math.max(limitL, q.x + q.w);
			}
			if (hOverlap) {
				if (q.y >= p.y + p.h - EPS) limitB = Math.min(limitB, q.y);
				if (q.y + q.h <= p.y + EPS) limitT = Math.max(limitT, q.y + q.h);
			}
		}

		p.w += (limitR - (p.x + p.w)) * g;
		p.h += (limitB - (p.y + p.h)) * g;
		const dl = (p.x - limitL) * g;
		p.x -= dl;
		p.w += dl;
		const dt = (p.y - limitT) * g;
		p.y -= dt;
		p.h += dt;
	}
}

export const binPackingEngine = defineEngine<BinPackingParams>({
	id: "bin-packing",
	name: "Bin Pack",
	containerMode: "fill",
	controls: [
		{
			type: "select",
			key: "sortStrategy",
			label: "Sort Strategy",
			default: "area-desc",
			help: "Order images are placed in. Packing larger images first usually leaves fewer gaps.",
			options: [
				{
					label: "Area (largest first)",
					value: "area-desc",
					hint: "Places images from largest area to smallest — usually the tightest pack.",
				},
				{
					label: "Height (tallest first)",
					value: "height-desc",
					hint: "Tallest images first; helps when heights vary a lot.",
				},
				{
					label: "Width (widest first)",
					value: "width-desc",
					hint: "Widest images first.",
				},
				{
					label: "Aspect (extreme first)",
					value: "aspect-desc",
					hint: "Most extreme shapes (very wide or very tall) placed first.",
				},
			],
		},
		{
			type: "select",
			key: "placement",
			label: "Placement",
			default: "best-short-side",
			help: "Heuristic for choosing which free gap each image drops into when several would fit.",
			options: [
				{
					label: "Best Short Side",
					value: "best-short-side",
					hint: "Drops each image into the gap that leaves the smallest leftover on its shorter side.",
				},
				{
					label: "Best Long Side",
					value: "best-long-side",
					hint: "Minimizes leftover space along the longer side of the gap.",
				},
				{
					label: "Best Area",
					value: "best-area",
					hint: "Chooses the gap that wastes the least total area.",
				},
				{
					label: "Bottom-Left",
					value: "bottom-left",
					hint: "Always slots images as far down and left as they fit — simple and predictable.",
				},
			],
		},
		{
			type: "slider",
			key: "fill",
			label: "Fill",
			default: 78,
			min: 50,
			max: 100,
			step: 2,
			wide: true,
			unit: "%",
		},
		{
			type: "slider",
			key: "sizeVariation",
			label: "Size Variation",
			default: 0,
			min: 0,
			max: 100,
			step: 5,
			wide: true,
			unit: "%",
		},
		{
			type: "slider",
			key: "fillGaps",
			label: "Fill Gaps",
			default: 70,
			min: 0,
			max: 100,
			step: 5,
			wide: true,
			unit: "%",
		},
	],
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: BinPackingParams,
		gap: number,
	): LayoutResult {
		const { sortStrategy, placement, fill, sizeVariation, fillGaps } = params;
		const W = container.width;
		const H = container.height ?? 600;
		const results: PositionedItem[] = [];

		if (items.length === 0 || W <= 0 || H <= 0) {
			return { items: results, totalHeight: H };
		}

		// Target image area per item, scaled by fill to leave room for gaps and the
		// unavoidable slack of free-aspect packing. The Fill Gaps pass reclaims the
		// remainder, so this dial mainly sets the base size and how much growth follows.
		const totalArea = W * H * (fill / 100);
		const v = sizeVariation / 100;
		const weights =
			v === 0
				? items.map(() => 1)
				: items.map((it) =>
						Math.max(0.15, 1 + v * (seededRandom(it.id) * 2 - 1)),
					);
		const weightSum = weights.reduce((s, w) => s + w, 0);

		const extreme = (ar: number) => Math.max(ar, 1 / ar);

		// Per-image target dimensions (area honoured, shape from aspect ratio).
		const sized = items.map((it, i) => {
			const area = (totalArea * weights[i]) / weightSum;
			return {
				item: it,
				w: Math.sqrt(area * it.aspectRatio),
				h: Math.sqrt(area / it.aspectRatio),
			};
		});

		sized.sort((a, b) => {
			let primary: number;
			switch (sortStrategy) {
				case "area-desc":
					primary = b.w * b.h - a.w * a.h;
					break;
				case "height-desc":
					primary = b.h - a.h;
					break;
				case "width-desc":
					primary = b.w - a.w;
					break;
				case "aspect-desc":
					primary =
						extreme(b.item.aspectRatio) - extreme(a.item.aspectRatio);
					break;
			}
			if (Math.abs(primary) > EPS) return primary;
			return extreme(b.item.aspectRatio) - extreme(a.item.aspectRatio);
		});

		let free: FreeRect[] = [{ x: 0, y: 0, w: W, h: H }];
		const placed: Placed[] = [];

		for (const { item, w: baseW, h: baseH } of sized) {
			// Closed-form fit: for each pocket compute the largest scale (capped at the
			// target) that lets the footprint fit. Prefer a full-size placement chosen
			// by the heuristic; otherwise take the pocket needing the least shrink.
			let fullIdx = -1;
			let fullScore: [number, number] | null = null;
			let shrinkIdx = -1;
			let shrinkScale = 0;

			for (let i = 0; i < free.length; i++) {
				const r = free[i];
				if (r.w <= gap + EPS || r.h <= gap + EPS) continue;
				const sFit = Math.min((r.w - gap) / baseW, (r.h - gap) / baseH);
				if (sFit <= 0) continue;

				if (sFit >= 1) {
					const s = score(r, baseW + gap, baseH + gap, placement);
					if (isBetter(s, fullScore)) {
						fullScore = s;
						fullIdx = i;
					}
				} else if (sFit > shrinkScale) {
					shrinkScale = sFit;
					shrinkIdx = i;
				}
			}

			let idx: number;
			let scale: number;
			if (fullIdx >= 0) {
				idx = fullIdx;
				scale = 1;
			} else if (shrinkIdx >= 0 && shrinkScale >= MIN_FIT_SCALE) {
				idx = shrinkIdx;
				scale = shrinkScale;
			} else {
				continue;
			}

			const rect = free[idx];
			const pw = baseW * scale + gap;
			const ph = baseH * scale + gap;
			const footprint: Placed = {
				id: item.id,
				x: rect.x,
				y: rect.y,
				w: pw,
				h: ph,
			};
			placed.push(footprint);
			free = carve(free, footprint);
		}

		if (fillGaps > 0 && placed.length > 0) {
			growToFill(placed, W, H, fillGaps / 100);
		}

		const half = gap / 2;
		for (const p of placed) {
			results.push({
				id: p.id,
				x: Math.round(p.x + half),
				y: Math.round(p.y + half),
				width: Math.max(1, Math.round(p.w - gap)),
				height: Math.max(1, Math.round(p.h - gap)),
			});
		}

		return { items: results, totalHeight: H };
	},
});
