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
		help,
		onValueChange,
	}: {
		label: string;
		value: string;
		min: number;
		max: number;
		help?: string;
		onValueChange?: (detail: { value: string }) => void;
	} = $props();

	const classes = numberInput();
	const labelInner = css({ display: "inline-flex", alignItems: "center", gap: "3px" });
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
</div>
