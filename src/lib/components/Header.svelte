<script lang="ts">
	let { title, subtitle }: { title: string; subtitle: string } = $props();
</script>

<header class="text-center mb-7 pb-5 border-b border-b-black/8 shadow-[0_1px_0_rgba(255,255,255,0.5)]">
	<h1
		class="font-display text-48px font-800 text-ink m-0 tracking-tight"
		style="text-shadow: 0 2px 0 rgba(255,255,255,0.6), 0 -1px 0 rgba(0,0,0,0.08)"
	>
		{title}
	</h1>
	<p
		class="text-13px text-ink-muted mt-1.5 mb-0 tracking-widest uppercase"
		style="text-shadow: 0 1px 0 rgba(255,255,255,0.4)"
	>
		{subtitle}
	</p>
</header>
