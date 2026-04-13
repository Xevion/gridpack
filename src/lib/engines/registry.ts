import type { LayoutEngine } from "./types";
import { justifiedEngine } from "./justified";
import { masonryEngine } from "./masonry";
import { squareGridEngine } from "./square-grid";
import { linearPartitionEngine } from "./linear-partition";
import { knuthPlassEngine } from "./knuth-plass";
import { binPackingEngine } from "./bin-packing";
import { treemapEngine } from "./treemap";

export const engines: LayoutEngine[] = [
	justifiedEngine,
	masonryEngine,
	squareGridEngine,
	linearPartitionEngine,
	knuthPlassEngine,
	binPackingEngine,
	treemapEngine,
];

export function getEngine(id: string): LayoutEngine {
	return engines.find((e) => e.id === id) ?? engines[0];
}
