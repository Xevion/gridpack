<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="controls-panel">
	{@render children()}
</div>

<style>
	.controls-panel {
		display: flex;
		flex-wrap: wrap;
		gap: 16px;
		align-items: flex-end;
		padding: 12px 16px;
		margin-bottom: 24px;
		background: linear-gradient(to bottom, #ddd4c7, #e2dace);
		border-radius: 6px;
		border-top: 1px solid rgba(255, 255, 255, 0.6);
		border-left: 1px solid rgba(255, 255, 255, 0.4);
		border-right: 1px solid #b5a994;
		border-bottom: 1px solid #a89a84;
		box-shadow:
			inset 0 2px 6px rgba(0, 0, 0, 0.15),
			inset 0 0 0 1px rgba(0, 0, 0, 0.04),
			0 1px 0 rgba(255, 255, 255, 0.6),
			0 2px 4px rgba(0, 0, 0, 0.06);
	}
</style>
