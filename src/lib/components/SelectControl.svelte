<script lang="ts">
	import { selectControl } from "styled-system/recipes";
	import { Portal } from "@ark-ui/svelte/portal";
	import { Select, createListCollection } from "@ark-ui/svelte/select";

	let {
		label,
		value = $bindable(),
		options,
		onValueChange: onValueChangeProp,
	}: {
		label: string;
		value: string;
		options: { label: string; value: string; icon?: string }[];
		onValueChange?: (value: string) => void;
	} = $props();

	const classes = selectControl();
	let collection = $derived(createListCollection({ items: options }));

	let internalValue = $derived([value]);

	function handleValueChange(detail: { value: string[] }) {
		if (detail.value.length > 0) {
			value = detail.value[0];
			onValueChangeProp?.(detail.value[0]);
		}
	}
</script>

<div class={classes.root}>
	<Select.Root {collection} value={internalValue} onValueChange={handleValueChange}>
		<Select.Label class={classes.label}>{label}</Select.Label>
		<Select.Control>
			<Select.Trigger class={classes.trigger}>
				<Select.ValueText placeholder="Select" />
				<svg
					class="{classes.arrow} select-arrow"
					viewBox="0 0 10 10"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path
						d="M2 3.5L5 6.5L8 3.5"
						stroke="currentColor"
						stroke-width="1.5"
						stroke-linecap="round"
						stroke-linejoin="round"
					/>
				</svg>
			</Select.Trigger>
		</Select.Control>
		<Portal>
			<Select.Positioner>
				<Select.Content class={classes.content}>
					{#each collection.items as item}
						<Select.Item class={classes.item} {item}>
							{#if item.icon}
								<span class={classes.itemIcon}>{@html item.icon}</span>
							{/if}
							<Select.ItemText class={classes.itemText}>{item.label}</Select.ItemText>
							<Select.ItemIndicator class={classes.itemIndicator}>
								<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
									<path d="M10.2 2.4L4.5 8.8 1.8 6l1.1-1.1 1.6 1.7L9 2.4z" />
								</svg>
							</Select.ItemIndicator>
						</Select.Item>
					{/each}
				</Select.Content>
				<!-- Caret after Content so sibling selector (~) can read data-state -->
				<span class="{classes.caret} select-caret">
					<svg width="14" height="7" viewBox="0 0 14 7">
						<path d="M0 7L7 0l7 7z" fill="rgba(0,0,0,0.1)" />
						<path d="M1.5 7L7 1.5 12.5 7z" fill="currentColor" />
					</svg>
				</span>
			</Select.Positioner>
		</Portal>
		<Select.HiddenSelect />
	</Select.Root>
</div>

<style>
	:global([data-state="open"]) .select-arrow {
		transform: rotate(180deg);
	}

	/* Content open/close animation */
	:global([data-scope="select"][data-part="content"][data-state="open"]) {
		opacity: 1;
		transform: translateY(0) scale(1);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	@starting-style {
		:global([data-scope="select"][data-part="content"][data-state="open"]) {
			opacity: 0;
			transform: translateY(-6px) scale(0.96);
		}
	}

	:global([data-scope="select"][data-part="content"][data-state="closed"]) {
		opacity: 0;
		transform: translateY(-4px) scale(0.98);
		transition:
			opacity 0.12s ease,
			transform 0.12s ease;
	}

	/* Caret synced to content state via sibling selector */
	.select-caret {
		opacity: 0;
		transform: translateY(-4px);
		transition:
			opacity 0.12s ease,
			transform 0.12s ease;
	}

	:global([data-scope="select"][data-part="content"][data-state="open"])
		~ .select-caret {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	@starting-style {
		:global([data-scope="select"][data-part="content"][data-state="open"])
			~ .select-caret {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
</style>
