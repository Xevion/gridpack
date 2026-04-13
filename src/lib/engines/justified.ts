import type {
	LayoutEngine,
	LayoutItem,
	PositionedItem,
	ContainerDimensions,
	LayoutResult,
} from "./types";

export const justifiedEngine: LayoutEngine = {
	id: "justified",
	name: "Justified",
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
		},
		{
			type: "select",
			key: "lastRow",
			label: "Last Row",
			default: "justify",
			options: [
				{ label: "Justify", value: "justify" },
				{ label: "Left", value: "left" },
				{ label: "Center", value: "center" },
			],
		},
	],
	layout(
		items: LayoutItem[],
		container: ContainerDimensions,
		params: Record<string, unknown>,
		gap: number,
	): LayoutResult {
		const targetRowHeight = params.targetRowHeight as number;
		const lastRow = params.lastRow as string;
		const containerWidth = container.width;

		const results: PositionedItem[] = [];
		let currentRow: LayoutItem[] = [];
		let aspectSum = 0;
		let y = 0;

		function commitRow(row: LayoutItem[], rowHeight: number) {
			let x = 0;
			for (let i = 0; i < row.length; i++) {
				const item = row[i];
				const isLast = i === row.length - 1;
				const w = isLast
					? containerWidth - x
					: Math.round(rowHeight * item.aspectRatio);
				results.push({
					id: item.id,
					x,
					y,
					width: w,
					height: Math.round(rowHeight),
				});
				x += w + gap;
			}
			y += Math.round(rowHeight) + gap;
		}

		function commitLastRow(row: LayoutItem[], rowAspectSum: number) {
			const totalGaps = gap * (row.length - 1);
			const stretchedHeight = (containerWidth - totalGaps) / rowAspectSum;
			const rowHeight = Math.min(stretchedHeight, targetRowHeight * 1.5);

			if (lastRow === "justify") {
				commitRow(row, rowHeight);
				return;
			}

			const naturalHeight = Math.min(targetRowHeight, rowHeight);
			let x = 0;

			if (lastRow === "center") {
				const totalWidth =
					row.reduce(
						(sum, item) => sum + Math.round(naturalHeight * item.aspectRatio),
						0,
					) + totalGaps;
				x = Math.round((containerWidth - totalWidth) / 2);
			}

			for (const item of row) {
				const w = Math.round(naturalHeight * item.aspectRatio);
				results.push({
					id: item.id,
					x,
					y,
					width: w,
					height: Math.round(naturalHeight),
				});
				x += w + gap;
			}
			y += Math.round(naturalHeight) + gap;
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

		if (currentRow.length > 0) {
			commitLastRow(currentRow, aspectSum);
		}

		return { items: results, totalHeight: y - gap };
	},
};
