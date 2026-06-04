<script lang="ts">
	import { Portal } from "@ark-ui/svelte/portal";
	import { Tooltip } from "@ark-ui/svelte/tooltip";

	import { tooltip } from "styled-system/recipes";

	let { text }: { text: string } = $props();

	const classes = tooltip();
</script>

<Tooltip.Root
	openDelay={250}
	closeDelay={120}
	closeOnClick={false}
	closeOnPointerDown={false}
	positioning={{ placement: "top", gutter: 6 }}
>
	<Tooltip.Trigger class={classes.trigger} aria-label="Help">
		<svg width="13" height="13" viewBox="0 0 16 16" fill="none" aria-hidden="true">
			<circle cx="8" cy="8" r="6.6" stroke="currentColor" stroke-width="1.4" />
			<path
				d="M6.1 6.1a1.9 1.9 0 1 1 2.6 1.9c-.55.25-.8.62-.8 1.2v.25"
				stroke="currentColor"
				stroke-width="1.4"
				stroke-linecap="round"
				fill="none"
			/>
			<circle cx="7.9" cy="11.4" r="0.85" fill="currentColor" />
		</svg>
	</Tooltip.Trigger>
	<Portal>
		<Tooltip.Positioner>
			<Tooltip.Content class={classes.content}>
				<Tooltip.Arrow class={classes.arrow}>
					<Tooltip.ArrowTip class={classes.arrowTip} />
				</Tooltip.Arrow>
				{text}
			</Tooltip.Content>
		</Tooltip.Positioner>
	</Portal>
</Tooltip.Root>
