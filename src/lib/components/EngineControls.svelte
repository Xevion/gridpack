<script lang="ts">
	import type { ControlDescriptor } from "$lib/engines/types";

	import ButtonControl from "./ButtonControl.svelte";
	import NumberControl from "./NumberControl.svelte";
	import SelectControl from "./SelectControl.svelte";
	import SliderControl from "./SliderControl.svelte";
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
	{#if ctrl.type === "slider"}
		{@const val = [params[ctrl.key] as number]}
		<SliderControl
			label={ctrl.label}
			value={val}
			min={ctrl.min}
			max={ctrl.max}
			step={ctrl.step}
			wide={ctrl.wide ?? false}
			unit={ctrl.unit}
			help={ctrl.help}
			onValueChange={(detail) => onchange(ctrl.key, detail.value[0])}
		/>
	{:else if ctrl.type === "number"}
		{@const val = String(params[ctrl.key])}
		<NumberControl
			label={ctrl.label}
			value={val}
			min={ctrl.min}
			max={ctrl.max}
			presets={ctrl.presets}
			help={ctrl.help}
			onValueChange={(detail) => {
				const v = parseFloat(detail.value);
				if (!isNaN(v)) onchange(ctrl.key, v);
			}}
		/>
	{:else if ctrl.type === "select"}
		{@const val = params[ctrl.key] as string}
		<SelectControl
			label={ctrl.label}
			value={val}
			options={ctrl.options}
			help={ctrl.help}
			onValueChange={(value) => onchange(ctrl.key, value)}
		/>
	{:else if ctrl.type === "switch"}
		{@const val = params[ctrl.key] as boolean}
		<SwitchControl
			label={ctrl.label}
			checked={val}
			help={ctrl.help}
			onCheckedChange={(checked) => onchange(ctrl.key, checked)}
		/>
	{:else if ctrl.type === "button"}
		<ButtonControl
			label={ctrl.label}
			icon={ctrl.icon}
			help={ctrl.help}
			onclick={() => onchange(ctrl.key, null)}
		/>
	{/if}
{/each}
