import type { LayoutItem } from "./engines/types";

/** 5 aspect ratio buckets */
const ASPECT_BUCKETS = [0.667, 0.8, 1.0, 1.333, 1.778] as const;

/** Deterministic pseudo-random in [0, 1) from an integer seed. */
export function seededRandom(seed: number): number {
	const x = Math.sin(seed * 9301 + 49297) * 49297;
	return x - Math.floor(x);
}

/** Generate stable image items with picsum IDs and bucketed aspect ratios */
export function generateImages(count: number): LayoutItem[] {
	return Array.from({ length: count }, (_, i) => {
		const bucketIndex = Math.floor(seededRandom(i + 1) * ASPECT_BUCKETS.length);
		return {
			id: i + 10, // used as the picsum /seed/ value (any integer works)
			aspectRatio: ASPECT_BUCKETS[bucketIndex],
		};
	});
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
 * Get a stable picsum URL for an image at its intrinsic aspect ratio.
 *
 * Uses the `/seed/` endpoint rather than `/id/`: picsum's id list has gaps, so
 * sequential ids 404 for any value not in the list, whereas `/seed/{seed}` returns
 * a deterministic image for *any* seed and never 404s.
 */
export function imageUrl(id: number, aspectRatio: number): string {
	const w =
		aspectRatio >= 1
			? REQUEST_LONG_EDGE
			: Math.round(REQUEST_LONG_EDGE * aspectRatio);
	const h =
		aspectRatio >= 1
			? Math.round(REQUEST_LONG_EDGE / aspectRatio)
			: REQUEST_LONG_EDGE;
	return `https://picsum.photos/seed/${id}/${w}/${h}`;
}
