<script lang="ts">
	import { numberInput } from 'styled-system/recipes';
	import { NumberInput } from '@ark-ui/svelte/number-input';

	let {
		label,
		value = $bindable(),
		min,
		max
	}: {
		label: string;
		value: string;
		min: number;
		max: number;
	} = $props();

	const classes = numberInput();
</script>

<div class={classes.root}>
	<NumberInput.Root bind:value {min} {max}>
		<NumberInput.Label class={classes.label}>{label}</NumberInput.Label>
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
