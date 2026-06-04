<script lang="ts">
	import { NumberInput } from "@ark-ui/svelte/number-input";

	import { css } from "styled-system/css";
	import { numberInput } from "styled-system/recipes";

	import HelpTip from "./HelpTip.svelte";

	let {
		label,
		value = $bindable(),
		min,
		max,
		presets,
		help,
		onValueChange,
	}: {
		label: string;
		value: string;
		min: number;
		max: number;
		presets?: number[];
		help?: string;
		onValueChange?: (detail: { value: string }) => void;
	} = $props();

	const classes = numberInput();
	const labelInner = css({ display: "inline-flex", alignItems: "center", gap: "3px" });
	const chipRow = css({ display: "flex", flexWrap: "wrap", gap: "1", mt: "1.5" });
	const chip = css({
		minWidth: "24px",
		height: "18px",
		px: "1.5",
		fontSize: "10px",
		fontWeight: "600",
		fontVariantNumeric: "tabular-nums",
		cursor: "pointer",
		borderRadius: "4px",
		layerStyle: "metal-button",
		transition: "background 0.12s ease, box-shadow 0.12s ease",
		_hover: {
			background: "linear-gradient(135deg, {colors.control.highlight}, {colors.control.mid})",
		},
		"&[data-active]": {
			background: "linear-gradient(135deg, {colors.control.dark}, {colors.control.mid})",
			boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 2px rgba(0, 0, 0, 0.1)",
		},
	});
</script>

<div class={classes.root}>
	<NumberInput.Root bind:value {min} {max} {onValueChange}>
		<NumberInput.Label class={classes.label}>
			{#if help}
				<span class={labelInner}>{label}<HelpTip text={help} /></span>
			{:else}
				{label}
			{/if}
		</NumberInput.Label>
		<NumberInput.Control class={classes.control}>
			<NumberInput.DecrementTrigger class={classes.decrementTrigger}>
				&minus;
			</NumberInput.DecrementTrigger>
			<NumberInput.Input class={classes.field} />
			<NumberInput.IncrementTrigger class={classes.incrementTrigger}>
				+
			</NumberInput.IncrementTrigger>
		</NumberInput.Control>
	</NumberInput.Root>
	{#if presets && presets.length > 0}
		<div class={chipRow}>
			{#each presets as preset (preset)}
				<button
					type="button"
					class={chip}
					data-active={Number(value) === preset ? "" : undefined}
					onclick={() => onValueChange?.({ value: String(preset) })}
				>
					{preset}
				</button>
			{/each}
		</div>
	{/if}
</div>
