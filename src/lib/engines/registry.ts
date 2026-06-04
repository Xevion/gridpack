import type { LayoutEngine } from "./types";

import { binPackingEngine } from "./bin-packing";
import { justifiedEngine } from "./justified";
import { knuthPlassEngine } from "./knuth-plass";
import { linearPartitionEngine } from "./linear-partition";
import { masonryEngine } from "./masonry";
import { squareGridEngine } from "./square-grid";
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
