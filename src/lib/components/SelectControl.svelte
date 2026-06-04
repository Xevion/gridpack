<script lang="ts">
	import { Portal } from "@ark-ui/svelte/portal";
	import { Select, createListCollection } from "@ark-ui/svelte/select";
	import { Tooltip } from "@ark-ui/svelte/tooltip";

	import { css } from "styled-system/css";
	import { selectControl, tooltip } from "styled-system/recipes";

	import ControlIcon from "./ControlIcon.svelte";
	import HelpTip from "./HelpTip.svelte";

	type Option = { label: string; value: string; icon?: string; hint?: string };

	let {
		label,
		value = $bindable(),
		options,
		help,
		onValueChange: onValueChangeProp,
	}: {
		label: string;
		value: string;
		options: Option[];
		help?: string;
		onValueChange?: (value: string) => void;
	} = $props();

	const classes = selectControl();
	const tip = tooltip();
	const labelInner = css({ display: "inline-flex", alignItems: "center", gap: "3px" });
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
		<Select.Label class={classes.label}>
			{#if help}
				<span class={labelInner}>{label}<HelpTip text={help} /></span>
			{:else}
				{label}
			{/if}
		</Select.Label>
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
					{#each collection.items as item (item.value)}
						<Select.Item class={classes.item} {item}>
							{#if item.hint}
								<Tooltip.Root
									openDelay={300}
									closeDelay={60}
									positioning={{ placement: "left", gutter: 10 }}
								>
									<Tooltip.Trigger>
										{#snippet asChild(triggerProps)}
											<div class={classes.itemInner} {...triggerProps() as Record<string, unknown>}>
												{@render itemBody(item)}
											</div>
										{/snippet}
									</Tooltip.Trigger>
									<Portal>
										<Tooltip.Positioner>
											<Tooltip.Content class={tip.content}>
												<Tooltip.Arrow class={tip.arrow}>
													<Tooltip.ArrowTip class={tip.arrowTip} />
												</Tooltip.Arrow>
												{item.hint}
											</Tooltip.Content>
										</Tooltip.Positioner>
									</Portal>
								</Tooltip.Root>
							{:else}
								<div class={classes.itemInner}>
									{@render itemBody(item)}
								</div>
							{/if}
						</Select.Item>
					{/each}
				</Select.Content>
				<!-- Caret after Content so sibling selector (~) can read data-state -->
				<span class="{classes.caret} select-caret">
					<svg width="14" height="9" viewBox="0 0 14 9">
						<!-- Edge treatment matches the content's top rim 1:1. The two upper
						     edges are at 45°, so weights are set perpendicular, not horizontal:
						     • border  — the upper edges stroked at width 2; the fill (drawn
						       next) covers the inner half, leaving a true 1px rim outside
						       (matches content's 0 0 0 1px rgba(0,0,0,0.08)).
						     • highlight — a 1px line offset just *inside* the edges, so it sits
						       flush like content's inset 0 1px 0 rgba(255,255,255,0.3) rather
						       than a centred stroke spilling outside.
						     The base (y≈7.5) tucks behind the content (caret z 49 < 50). -->
						<path
							d="M1 7.5L7 1.5 13 7.5"
							fill="none"
							stroke="rgba(0,0,0,0.08)"
							stroke-width="2"
							stroke-linejoin="round"
						/>
						<path d="M7 1.5L13 7.5 1 7.5z" fill="currentColor" />
						<path
							d="M2.4 7.5L7 2.9 11.6 7.5"
							fill="none"
							stroke="rgba(255,255,255,0.3)"
							stroke-width="1"
							stroke-linejoin="round"
						/>
					</svg>
				</span>
			</Select.Positioner>
		</Portal>
		<Select.HiddenSelect />
	</Select.Root>
</div>

{#snippet itemBody(item: Option)}
	{#if item.icon}
		<span class={classes.itemIcon}><ControlIcon name={item.icon} /></span>
	{/if}
	<Select.ItemText class={classes.itemText}>{item.label}</Select.ItemText>
	<Select.ItemIndicator class={classes.itemIndicator}>
		<svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
			<path d="M10.2 2.4L4.5 8.8 1.8 6l1.1-1.1 1.6 1.7L9 2.4z" />
		</svg>
	</Select.ItemIndicator>
{/snippet}

<style>
	:global([data-state="open"]) .select-arrow {
		transform: rotate(180deg);
	}

	/* Content open/close animation. Vertical slide + fade only — no scale, so the
	   popup's edges (and their shadow) never move laterally and the caret stays put. */
	:global([data-scope="select"][data-part="content"][data-state="open"]) {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	@starting-style {
		:global([data-scope="select"][data-part="content"][data-state="open"]) {
			opacity: 0;
			transform: translateY(-6px);
		}
	}

	:global([data-scope="select"][data-part="content"][data-state="closed"]) {
		opacity: 0;
		transform: translateY(-4px);
		transition:
			opacity 0.12s ease,
			transform 0.12s ease;
	}

	/* Caret darkens in step with the top row when it's highlighted, matching the
	   row's rgba(0,0,0,0.05) hover overlay (~brightness 0.95). */
	:global(
			[data-scope="select"][data-part="content"]:has(
					[data-part="item"]:first-child[data-highlighted]
				)
		)
		~ .select-caret {
		filter: brightness(0.95);
	}

	/* Caret synced to content state via sibling selector */
	.select-caret {
		opacity: 0;
		transform: translateY(-4px);
		transition:
			opacity 0.12s ease,
			transform 0.12s ease;
	}

	:global([data-scope="select"][data-part="content"][data-state="open"]) ~ .select-caret {
		opacity: 1;
		transform: translateY(0);
		transition:
			opacity 0.15s ease,
			transform 0.15s ease;
	}

	@starting-style {
		:global([data-scope="select"][data-part="content"][data-state="open"]) ~ .select-caret {
			opacity: 0;
			transform: translateY(-6px);
		}
	}
</style>
