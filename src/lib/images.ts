import type { LayoutItem } from "./engines/types";

/** 5 aspect ratio buckets */
const ASPECT_BUCKETS = [0.667, 0.8, 1.0, 1.333, 1.778] as const;

/** Deterministic pseudo-random from seed */
function seededRandom(seed: number): number {
	const x = Math.sin(seed * 9301 + 49297) * 49297;
	return x - Math.floor(x);
}

/** Generate stable image items with picsum IDs and bucketed aspect ratios */
export function generateImages(count: number): LayoutItem[] {
	return Array.from({ length: count }, (_, i) => {
		const bucketIndex = Math.floor(seededRandom(i + 1) * ASPECT_BUCKETS.length);
		return {
			id: i + 10, // picsum IDs starting at 10 to avoid missing images
			aspectRatio: ASPECT_BUCKETS[bucketIndex],
		};
	});
}

/** Get a picsum URL for a given ID and dimensions */
export function imageUrl(id: number, width: number, height: number): string {
	return `https://picsum.photos/id/${id}/${Math.round(width)}/${Math.round(height)}`;
}
