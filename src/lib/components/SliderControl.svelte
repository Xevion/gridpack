<script lang="ts">
import { css } from "styled-system/css";
import { slider } from "styled-system/recipes";
import { Slider } from "@ark-ui/svelte/slider";
import HelpTip from "./HelpTip.svelte";

let {
	label,
	value = $bindable(),
	min,
	max,
	step,
	wide = false,
	unit,
	help,
	onValueChange,
}: {
	label: string;
	value: number[];
	min: number;
	max: number;
	step: number;
	wide?: boolean;
	unit?: string;
	help?: string;
	onValueChange?: (detail: { value: number[] }) => void;
} = $props();

let classes = $derived(slider({ wide }));

const labelInner = css({ display: "inline-flex", alignItems: "center", gap: "3px" });

// px-style units read better with a hair of space ("4 px"); symbolic units
// like % and × hug the number ("50%", "1.0×").
let spaced = $derived(!!unit && !["%", "×"].includes(unit));
let decimals = $derived(step < 1 ? 1 : 0);
let display = $derived(value[0].toFixed(decimals));
</script>

<div class={classes.root}>
	<Slider.Root bind:value {min} {max} {step} {onValueChange}>
		<div class={classes.header}>
			<Slider.Label class={classes.label}>
				{#if help}
					<span class={labelInner}>{label}<HelpTip text={help} /></span>
				{:else}
					{label}
				{/if}
			</Slider.Label>
			<span class={classes.valueText}>
				<span class={classes.valueNumber}>{display}</span>
				{#if unit}
					<span class={classes.valueUnit} data-spaced={spaced}>{unit}</span>
				{/if}
			</span>
		</div>
		<Slider.Control class={classes.control}>
			<Slider.Track class={classes.track}>
				<Slider.Range class={classes.range} />
			</Slider.Track>
			<Slider.Thumb index={0} class={classes.thumb}>
				<Slider.HiddenInput />
			</Slider.Thumb>
		</Slider.Control>
	</Slider.Root>
</div>
