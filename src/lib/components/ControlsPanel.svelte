<script lang="ts">
	import type { Snippet } from 'svelte';

	let { children }: { children: Snippet } = $props();
</script>

<div class="controls-panel flex flex-wrap gap-4 items-end px-4 py-3 mb-6 rounded-1.5">
	{@render children()}
</div>
