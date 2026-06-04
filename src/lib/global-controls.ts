import type { ControlDescriptor, ImageFit } from "$lib/engines/types";
import { resolveParams } from "$lib/engines/types";
import type { DatasetOrder } from "$lib/images";

/**
 * Controls that describe the *dataset* — the set of images and the order they
 * are fed to the engine — independent of any one engine. `count`, `bias`,
 * `spread` and `order` flow into `generateImages`; `reseed` is an action the
 * host turns into a fresh seed (it carries no resolved value).
 */
export const datasetControls: ControlDescriptor[] = [
	{
		type: "number",
		key: "count",
		label: "Images",
		default: 40,
		min: 1,
		max: 200,
		presets: [5, 12, 25, 50, 100, 200],
	},
	{
		type: "slider",
		key: "bias",
		label: "Aspect Bias",
		default: 0,
		min: -100,
		max: 100,
		step: 5,
		wide: true,
		help: "Shifts the mix toward tall portraits (left) or wide landscapes (right).",
	},
	{
		type: "slider",
		key: "spread",
		label: "Aspect Spread",
		default: 50,
		min: 0,
		max: 100,
		step: 5,
		wide: true,
		help: "How much aspect ratios vary. 0 makes every image the same shape; 100 ranges from tall portraits to wide panoramas.",
	},
	{
		type: "select",
		key: "order",
		label: "Order",
		default: "as-generated",
		help: "Sequence images are fed to the layout. Order-preserving engines respond to this; engines that sort internally (Bin Pack, Treemap) ignore it.",
		options: [
			{
				label: "As Generated",
				value: "as-generated",
				hint: "The raw generated order, untouched.",
			},
			{
				label: "Wide First",
				value: "aspect-wide-first",
				hint: "Widest images first, descending to the tallest.",
			},
			{
				label: "Tall First",
				value: "aspect-tall-first",
				hint: "Tallest images first, ascending to the widest.",
			},
			{
				label: "Shuffled",
				value: "shuffled",
				hint: "A deterministic shuffle; reseeding gives a new arrangement.",
			},
			{
				label: "Reversed",
				value: "reversed",
				hint: "The generated order, back to front.",
			},
		],
	},
	{
		type: "button",
		key: "reseed",
		label: "Reseed",
		icon: "reseed",
		help: "Draw a fresh random set of images at the current settings.",
	},
];

/**
 * Controls that affect *rendering* rather than the dataset: `gap` is passed as
 * the dedicated layout argument, and `fit` drives `object-fit` at render time.
 */
export const renderControls: ControlDescriptor[] = [
	{
		type: "slider",
		key: "gap",
		label: "Gap",
		default: 4,
		min: 0,
		max: 16,
		step: 1,
		wide: true,
		unit: "px",
	},
	{
		type: "select",
		key: "fit",
		label: "Fit Mode",
		default: "cover",
		help: "How each image fills its cell. Cover crops to fill, Contain fits the whole image with letterboxing, Stretch distorts it to fit.",
		options: [
			{
				label: "Cover",
				value: "cover",
				// Icon name resolved by ControlIcon.svelte (keeps SVG out of data).
				icon: "cover",
			},
			{
				label: "Stretch",
				value: "stretch",
				icon: "stretch",
			},
			{
				label: "Contain",
				value: "contain",
				icon: "contain",
			},
		],
	},
];

export type GlobalParams = {
	count: number;
	bias: number;
	spread: number;
	order: DatasetOrder;
	gap: number;
	fit: ImageFit;
};

const globalControls = [...datasetControls, ...renderControls];

export function resolveGlobals(raw: Record<string, unknown>): GlobalParams {
	return resolveParams(globalControls, raw) as unknown as GlobalParams;
}
