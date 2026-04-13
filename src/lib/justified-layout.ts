export interface LayoutItem {
	id: number;
	aspectRatio: number;
}

export interface PositionedItem {
	id: number;
	x: number;
	y: number;
	width: number;
	height: number;
}

export interface LayoutResult {
	items: PositionedItem[];
	totalHeight: number;
}

/**
 * Row-packing justified layout algorithm.
 * Accumulates images into rows scaled to a target height, then adjusts
 * the row height so items fill the container width exactly.
 */
export function justifiedLayout(
	items: LayoutItem[],
	containerWidth: number,
	targetRowHeight: number = 220,
	gap: number = 4
): LayoutResult {
	const results: PositionedItem[] = [];
	let currentRow: LayoutItem[] = [];
	let aspectSum = 0;
	let y = 0;

	function commitRow(row: LayoutItem[], rowHeight: number) {
		let x = 0;
		for (let i = 0; i < row.length; i++) {
			const item = row[i];
			const isLast = i === row.length - 1;
			const w = isLast ? containerWidth - x : Math.round(rowHeight * item.aspectRatio);
			results.push({
				id: item.id,
				x,
				y,
				width: w,
				height: Math.round(rowHeight)
			});
			x += w + gap;
		}
		y += Math.round(rowHeight) + gap;
	}

	for (const item of items) {
		currentRow.push(item);
		aspectSum += item.aspectRatio;

		const totalGaps = gap * (currentRow.length - 1);
		const rowWidthAtTarget = targetRowHeight * aspectSum + totalGaps;

		if (rowWidthAtTarget >= containerWidth) {
			const rowHeight = (containerWidth - totalGaps) / aspectSum;
			commitRow(currentRow, rowHeight);
			currentRow = [];
			aspectSum = 0;
		}
	}

	// Last row: don't stretch beyond 1.5x target height
	if (currentRow.length > 0) {
		const totalGaps = gap * (currentRow.length - 1);
		const stretchedHeight = (containerWidth - totalGaps) / aspectSum;
		const rowHeight = Math.min(stretchedHeight, targetRowHeight * 1.5);
		commitRow(currentRow, rowHeight);
	}

	return { items: results, totalHeight: y - gap };
}
