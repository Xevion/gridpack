<script lang="ts">
	import { css } from 'styled-system/css';
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

<div class={css({ minWidth: '110px' })}>
	<NumberInput.Root bind:value {min} {max}>
		<NumberInput.Label class="control-label">{label}</NumberInput.Label>
		<NumberInput.Control class="number-control">
			<NumberInput.DecrementTrigger class="number-btn">
				&minus;
			</NumberInput.DecrementTrigger>
			<NumberInput.Input class="number-field" />
			<NumberInput.IncrementTrigger class="number-btn">
				+
			</NumberInput.IncrementTrigger>
		</NumberInput.Control>
	</NumberInput.Root>
</div>

<style>
	.control-label {
		display: block;
		font-size: 10px;
		font-weight: 600;
		color: var(--colors-ink-soft);
		margin-bottom: 4px;
		text-transform: uppercase;
		letter-spacing: 0.8px;
		text-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
	}

	.number-control {
		display: inline-flex;
		border: 1px solid var(--colors-control);
		border-radius: 5px;
		overflow: hidden;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
	}

	.number-btn,
	.number-field {
		display: block;
		height: 26px;
		margin: 0;
		padding: 0;
		border: none;
		outline: none;
		box-sizing: border-box;
	}

	.number-btn {
		width: 28px;
		font-size: 14px;
		font-weight: 700;
		line-height: 26px;
		color: #fff;
		cursor: pointer;
		background: linear-gradient(to bottom, var(--colors-control-mid), var(--colors-control-dark));
		text-shadow: 0 -1px 0 rgba(0, 0, 0, 0.4);
		transition: background 0.15s ease;
	}

	.number-btn:hover {
		background: linear-gradient(to bottom, #a19586, #837869);
	}

	.number-btn:active {
		background: linear-gradient(to bottom, var(--colors-control-dark), var(--colors-control-mid));
		transition: none;
	}

	.number-field {
		width: 44px;
		font-size: 13px;
		font-family: 'Source Sans Pro', sans-serif;
		font-weight: 600;
		font-variant-numeric: tabular-nums;
		text-align: center;
		color: var(--colors-ink-mid);
		background: linear-gradient(to bottom, var(--colors-parchment-mid), var(--colors-parchment-light));
		box-shadow:
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset -1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 2px 4px rgba(0, 0, 0, 0.1);
		transition:
			background 0.2s ease,
			box-shadow 0.2s ease;
	}

	.number-field:focus {
		background: linear-gradient(to bottom, #e5dfd5, #f5f0e8);
		box-shadow:
			inset 1px 0 0 rgba(0, 0, 0, 0.1),
			inset -1px 0 0 rgba(0, 0, 0, 0.1),
			inset 0 2px 4px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px var(--colors-accent-ring);
	}
</style>
