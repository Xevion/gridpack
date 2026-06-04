import type { ControlDescriptor, ImageFit } from "$lib/engines/types";
import { resolveParams } from "$lib/engines/types";

/**
 * Controls shared by every engine, rendered through the same descriptor
 * pipeline as engine-specific controls. `count` produces the image set, `gap`
 * is passed as the dedicated layout argument, and `fit` drives `object-fit` at
 * render time — none of them are engine parameters.
 */
export const globalControls: ControlDescriptor[] = [
	{
		type: "number",
		key: "count",
		label: "Images",
		default: 40,
		min: 1,
		max: 200,
	},
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
	gap: number;
	fit: ImageFit;
};

export function resolveGlobals(raw: Record<string, unknown>): GlobalParams {
	return resolveParams(globalControls, raw) as unknown as GlobalParams;
}
