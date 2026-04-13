<script lang="ts">
import { css } from "styled-system/css";
import type { Snippet } from "svelte";

let { children }: { children: Snippet } = $props();
</script>

<div class={css({
	display: 'flex',
	flexWrap: 'wrap',
	gap: '4',
	alignItems: 'flex-end',
	px: '4',
	py: '3',
	mb: '6',
	borderRadius: '6px',
	layerStyle: 'embossed-panel',
})}>
	{@render children()}
</div>
