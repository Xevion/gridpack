import type { LayoutItem } from "./engines/types";

export type DatasetOrder =
	| "as-generated"
	| "aspect-wide-first"
	| "aspect-tall-first"
	| "shuffled"
	| "reversed";

/**
 * The full specification of a generated image set. The set is a pure function
 * of these params, which gives each control a distinct visual behavior:
 *
 * - `count` grows/shrinks the pool at the end → existing ids stay stable, so
 *   tiles append/truncate and spring into place.
 * - `order` permutes the same pool → ids stable, positions change → tiles
 *   reshuffle in place.
 * - `bias`/`spread` reshape the same ids → each tile morphs to a new aspect
 *   ratio (its photo is re-cropped to match).
 * - `seed` swaps every id → an entirely new sample with new photos (hard cut).
 */
export interface DatasetParams {
	count: number;
	/** -100…100; shifts the mean aspect ratio portrait↔landscape (log space). */
	bias: number;
	/** 0…100; half-width of the aspect-ratio band (log space). */
	spread: number;
	/** Which random sample; changing it replaces the whole set. */
	seed: number;
	order: DatasetOrder;
}

/** log2(ar) shift applied at |bias| = 100 (mean aspect ratio reaches 0.5 / 2). */
const BIAS_MAX = 1;
/** log2(ar) half-width of the sampling band at spread = 100. */
const HALF_MAX = 2;
/** Hard ceiling on |log2(ar)| → every aspect ratio lands in [0.25, 4]. */
const AR_CLAMP = 2;

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
export function seededRandom(seed: number): number {
	const x = Math.sin(seed * 9301 + 49297) * 49297;
	return x - Math.floor(x);
}

/**
 * Sample one image's aspect ratio in log space: a uniform band of half-width
 * `spread` centred on `bias`, clamped to [-AR_CLAMP, AR_CLAMP] so extreme
 * settings can't spawn slivers that break the layout engines.
 */
function sampleAspect(seed: number, index: number, bias: number, spread: number): number {
	const mu = (bias / 100) * BIAS_MAX;
	const half = (spread / 100) * HALF_MAX;
	const u = seededRandom((seed * 100003 + index) * 2 + 1);
	const l = Math.max(-AR_CLAMP, Math.min(AR_CLAMP, mu + (u * 2 - 1) * half));
	return 2 ** l;
}

/** Deterministic Fisher-Yates shuffle keyed off the dataset seed. */
function shuffle(items: LayoutItem[], seed: number): LayoutItem[] {
	const out = items.slice();
	for (let i = out.length - 1; i > 0; i--) {
		const j = Math.floor(seededRandom(seed * 7919 + i) * (i + 1));
		[out[i], out[j]] = [out[j], out[i]];
	}
	return out;
}

/** Permute the pool into the sequence handed to the engine (ids unchanged). */
function orderItems(items: LayoutItem[], order: DatasetOrder, seed: number): LayoutItem[] {
	switch (order) {
		case "as-generated":
			return items;
		case "reversed":
			return items.slice().reverse();
		case "aspect-wide-first":
			return items.slice().sort((a, b) => b.aspectRatio - a.aspectRatio);
		case "aspect-tall-first":
			return items.slice().sort((a, b) => a.aspectRatio - b.aspectRatio);
		case "shuffled":
			return shuffle(items, seed);
	}
}

/**
 * Generate a stable image set from a dataset spec. `id` doubles as the picsum
 * seed; keeping it a pure function of `(seed, poolIndex)` preserves tile
 * identity across count/order/shape changes (see {@link DatasetParams}).
 */
export function generateImages(params: DatasetParams): LayoutItem[] {
	const { count, bias, spread, seed, order } = params;
	const pool: LayoutItem[] = Array.from({ length: count }, (_, i) => ({
		id: seed * 100000 + i,
		aspectRatio: sampleAspect(seed, i, bias, spread),
	}));
	return orderItems(pool, order, seed);
}

/**
 * Picsum crops its source to whatever width:height ratio is requested, so tying
 * the request to a tile's live layout dimensions makes the *crop* jump whenever the
 * tile reshapes (grow-to-fill, resize) — a visible flicker independent of `object-fit`.
 * Instead the URL is derived purely from the image's intrinsic aspect ratio at a
 * fixed resolution: the requested crop is constant for an image's whole lifetime, and
 * `object-fit: cover` does all the tile-shape cropping. The URL never changes on reflow.
 */
const REQUEST_LONG_EDGE = 800;

/**
 * Aspect ratios are continuous now, so a tile dragged through the Spread control
 * would otherwise re-request a fresh crop every frame. The request aspect is
 * snapped to one of a few log-spaced buckets so an image only re-fetches when it
 * crosses a bucket boundary; `object-fit: cover` hides the slight mismatch.
 */
const URL_BUCKETS = 9;

function quantizeAspect(aspectRatio: number): number {
	const l = Math.max(-AR_CLAMP, Math.min(AR_CLAMP, Math.log2(aspectRatio)));
	const step = (2 * AR_CLAMP) / (URL_BUCKETS - 1);
	return 2 ** (Math.round((l + AR_CLAMP) / step) * step - AR_CLAMP);
}

/**
 * Get a stable picsum URL for an image at (a quantized form of) its aspect ratio.
 *
 * Uses the `/seed/` endpoint rather than `/id/`: picsum's id list has gaps, so
 * sequential ids 404 for any value not in the list, whereas `/seed/{seed}` returns
 * a deterministic image for *any* seed and never 404s.
 */
export function imageUrl(id: number, aspectRatio: number): string {
	const ar = quantizeAspect(aspectRatio);
	const w = ar >= 1 ? REQUEST_LONG_EDGE : Math.round(REQUEST_LONG_EDGE * ar);
	const h = ar >= 1 ? Math.round(REQUEST_LONG_EDGE / ar) : REQUEST_LONG_EDGE;
	return `https://picsum.photos/seed/${id}/${w}/${h}`;
}
