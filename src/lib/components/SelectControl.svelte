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
	options: { label: string; value: string }[];
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
				<span>&#x25BE;</span>
			</Select.Trigger>
		</Select.Control>
		<Portal>
			<Select.Positioner>
				<Select.Content class={classes.content}>
					{#each collection.items as item}
						<Select.Item class={classes.item} {item}>
							<Select.ItemText class={classes.itemText}>{item.label}</Select.ItemText>
							<Select.ItemIndicator class={classes.itemIndicator}>&#x2713;</Select.ItemIndicator>
						</Select.Item>
					{/each}
				</Select.Content>
			</Select.Positioner>
		</Portal>
		<Select.HiddenSelect />
	</Select.Root>
</div>
