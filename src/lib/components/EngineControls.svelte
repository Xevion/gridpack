<script lang="ts">
import type { ControlDescriptor } from "$lib/engines/types";
import SliderControl from "./SliderControl.svelte";
import NumberControl from "./NumberControl.svelte";
import SelectControl from "./SelectControl.svelte";
import SwitchControl from "./SwitchControl.svelte";

let {
	controls,
	params,
	onchange,
}: {
	controls: ControlDescriptor[];
	params: Record<string, unknown>;
	onchange: (key: string, value: unknown) => void;
} = $props();
</script>

{#each controls as ctrl (ctrl.key)}
	{#if ctrl.type === 'slider'}
		{@const val = [params[ctrl.key] as number]}
		<SliderControl
			label={ctrl.label}
			value={val}
			min={ctrl.min}
			max={ctrl.max}
			step={ctrl.step}
			wide={ctrl.wide ?? false}
			onValueChange={(detail) => onchange(ctrl.key, detail.value[0])}
		/>
	{:else if ctrl.type === 'number'}
		{@const val = String(params[ctrl.key])}
		<NumberControl
			label={ctrl.label}
			value={val}
			min={ctrl.min}
			max={ctrl.max}
			onValueChange={(detail) => {
				const v = parseFloat(detail.value);
				if (!isNaN(v)) onchange(ctrl.key, v);
			}}
		/>
	{:else if ctrl.type === 'select'}
		{@const val = params[ctrl.key] as string}
		<SelectControl
			label={ctrl.label}
			value={val}
			options={ctrl.options}
			onValueChange={(value) => onchange(ctrl.key, value)}
		/>
	{:else if ctrl.type === 'switch'}
		{@const val = params[ctrl.key] as boolean}
		<SwitchControl
			label={ctrl.label}
			checked={val}
			onCheckedChange={(checked) => onchange(ctrl.key, checked)}
		/>
	{/if}
{/each}
