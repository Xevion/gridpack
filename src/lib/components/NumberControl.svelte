<script lang="ts">
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
</script>

<div class="min-w-110px">
	<NumberInput.Root bind:value {min} {max}>
		<NumberInput.Label class="control-label">{label}</NumberInput.Label>
		<NumberInput.Control class="number-control">
			<NumberInput.DecrementTrigger class="number-btn number-btn-left">
				&minus;
			</NumberInput.DecrementTrigger>
			<NumberInput.Input class="number-field" />
			<NumberInput.IncrementTrigger class="number-btn number-btn-right">
				+
			</NumberInput.IncrementTrigger>
		</NumberInput.Control>
	</NumberInput.Root>
</div>
