import { describe, expect, it } from "vitest";

import type { LayoutItem } from "./types";

import { squareGridEngine } from "./square-grid";

const W = 1000;
const GAP = 4;

function makeItems(n: number): LayoutItem[] {
	return Array.from({ length: n }, (_, i) => ({ id: i + 1, aspectRatio: 0.5 + (i % 5) * 0.4 }));
}

function layout(n: number, params: Record<string, unknown>, width = W) {
	return squareGridEngine.layout(makeItems(n), { width }, params, GAP);
}

describe("square grid", () => {
	it("gives every cell identical dimensions regardless of image shape", () => {
		const result = layout(20, { cellSize: 200 });
		expect(new Set(result.items.map((i) => i.width)).size).toBe(1);
		expect(new Set(result.items.map((i) => i.height)).size).toBe(1);
	});

	it.each([
		["1:1", 1],
		["4:3", 4 / 3],
		["3:2", 3 / 2],
		["16:9", 16 / 9],
	])("shapes cells to the %s ratio", (cellAspectRatio, ratio) => {
		const result = layout(12, { cellSize: 240, cellAspectRatio });
		const cell = result.items[0];
		expect(cell.width / cell.height).toBeCloseTo(ratio, 1);
	});

	it("fits as many columns as the width allows", () => {
		for (const cellSize of [100, 160, 200, 320]) {
			const result = layout(40, { cellSize });
			const expected = Math.floor((W + GAP) / (cellSize + GAP));
			expect(new Set(result.items.map((i) => i.x)).size).toBe(expected);
		}
	});

	it("flows left to right, top to bottom in reading order", () => {
		const result = layout(9, { cellSize: 300 });
		const columns = new Set(result.items.map((i) => i.x)).size;
		result.items.forEach((item, i) => {
			expect(item.y).toBe(result.items[Math.floor(i / columns) * columns].y);
		});
		for (let i = 1; i < columns; i++) {
			expect(result.items[i].x).toBeGreaterThan(result.items[i - 1].x);
		}
	});

	it("centers the grid in the container", () => {
		const result = layout(12, { cellSize: 300 });
		const left = Math.min(...result.items.map((i) => i.x));
		const right = Math.max(...result.items.map((i) => i.x + i.width));
		expect(left).toBeCloseTo(W - right, 0);
	});

	it("shrinks a cell that would outgrow a narrow container", () => {
		const result = layout(4, { cellSize: 400 }, 150);
		for (const item of result.items) {
			expect(item.width).toBeLessThanOrEqual(150);
		}
		expect(new Set(result.items.map((i) => i.x)).size).toBe(1);
	});
});
