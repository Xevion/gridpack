<script lang="ts">
	import 'virtual:uno.css';
	import '@fontsource/source-sans-pro/400.css';
	import '@fontsource/source-sans-pro/600.css';
	import '@fontsource/source-sans-pro/700.css';
	import '@fontsource-variable/playfair-display/index.css';
	import favicon from '$lib/assets/favicon.svg';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

{@render children()}

<style>
	:global(body) {
		margin: 0;
		font-family: 'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif;
		background:
			url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='6' height='6' fill='%23e8e0d4'/%3E%3Crect width='1' height='1' x='0' y='0' fill='%23ddd6c8' fill-opacity='0.4'/%3E%3Crect width='1' height='1' x='3' y='3' fill='%23ddd6c8' fill-opacity='0.3'/%3E%3C/svg%3E"),
			#e8e0d4;
	}
</style>
