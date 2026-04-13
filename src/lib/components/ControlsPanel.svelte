<script lang="ts">
	import { css } from 'styled-system/css';
	import type { Snippet } from 'svelte';

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
	background: 'linear-gradient(to bottom, {colors.parchment.deep}, {colors.parchment.warm})',
	borderTop: '1px solid rgba(255, 255, 255, 0.6)',
	borderLeft: '1px solid rgba(255, 255, 255, 0.4)',
	borderRight: '1px solid {colors.control.light}',
	borderBottom: '1px solid {colors.control.highlight}',
	boxShadow: 'inset 0 2px 6px rgba(0, 0, 0, 0.15), inset 0 0 0 1px rgba(0, 0, 0, 0.04), 0 1px 0 rgba(255, 255, 255, 0.6), 0 2px 4px rgba(0, 0, 0, 0.06)',
})}>
	{@render children()}
</div>
