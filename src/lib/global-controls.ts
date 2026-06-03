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
	},
	{
		type: "select",
		key: "fit",
		label: "Fit Mode",
		default: "cover",
		options: [
			{
				label: "Cover",
				value: "cover",
				icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="2.5" y="2.5" width="7" height="7" rx="1" opacity="0.35"/><path d="M0 0h3v1.5H1.5V3H0zM12 0H9v1.5h1.5V3H12zM0 12V9h1.5v1.5H3V12zM12 12V9h-1.5v1.5H9V12z"/></svg>`,
			},
			{
				label: "Stretch",
				value: "stretch",
				icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><rect x="3" y="3" width="6" height="6" rx="0.75"/><rect x="5" y="0" width="2" height="3" rx="0.5"/><rect x="5" y="9" width="2" height="3" rx="0.5"/><rect x="0" y="5" width="3" height="2" rx="0.5"/><rect x="9" y="5" width="3" height="2" rx="0.5"/></svg>`,
			},
			{
				label: "Contain",
				value: "contain",
				icon: `<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor"><path fill-rule="evenodd" d="M1.5 0A1.5 1.5 0 000 1.5v9A1.5 1.5 0 001.5 12h9a1.5 1.5 0 001.5-1.5v-9A1.5 1.5 0 0010.5 0h-9zM1.5 1.5h9v9h-9v-9z"/><rect x="3.5" y="2.5" width="5" height="7" rx="0.5"/></svg>`,
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
