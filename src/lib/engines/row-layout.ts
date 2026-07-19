import type { LayoutItem, LayoutResult, PositionedItem } from "./types";

/**
 * Render an ordered set of rows, each stretched to exactly the container width.
 *
 * Shared by the two engines that decide row breaks globally (Linear Partition and
 * Knuth-Plass): both reduce to "here are the rows", and the rendering that follows
 * is identical. Each row's height falls out of the width it has to fill, and the
 * final image absorbs the rounding error so rows end flush rather than a pixel short.
 */
export function renderRows(
	rows: LayoutItem[][],
	containerWidth: number,
	gap: number,
): LayoutResult {
	const results: PositionedItem[] = [];
	let y = 0;

	for (const row of rows) {
		if (row.length === 0) continue;
		const aspectSum = row.reduce((s, it) => s + it.aspectRatio, 0);
		const totalGaps = gap * (row.length - 1);
		const rowHeight = aspectSum > 0 ? Math.max(1, (containerWidth - totalGaps) / aspectSum) : 1;

		let x = 0;
		for (let i = 0; i < row.length; i++) {
			const isLast = i === row.length - 1;
			const w = isLast ? containerWidth - x : Math.round(rowHeight * row[i].aspectRatio);
			results.push({
				id: row[i].id,
				x,
				y,
				width: Math.max(1, w),
				height: Math.round(rowHeight),
			});
			x += w + gap;
		}
		y += Math.round(rowHeight) + gap;
	}

	return { items: results, totalHeight: Math.max(0, y - gap) };
}

/** Row height that makes `items` exactly fill `containerWidth`, gaps included. */
export function fittedRowHeight(aspectSum: number, count: number, width: number, gap: number) {
	if (aspectSum <= 0) return 0;
	return (width - gap * (count - 1)) / aspectSum;
}
