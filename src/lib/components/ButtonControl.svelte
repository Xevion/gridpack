<script lang="ts">
	import { css } from "styled-system/css";

	import ControlIcon from "./ControlIcon.svelte";
	import HelpTip from "./HelpTip.svelte";

	let {
		label,
		icon,
		help,
		onclick,
	}: {
		label: string;
		icon?: string;
		help?: string;
		onclick?: () => void;
	} = $props();

	const root = css({ display: "flex", flexDirection: "column" });
	const labelCls = css({ textStyle: "control-label" });
	const labelInner = css({ display: "inline-flex", alignItems: "center", gap: "3px" });
	const button = css({
		display: "inline-flex",
		alignItems: "center",
		justifyContent: "center",
		gap: "1.5",
		height: "28px",
		px: "3",
		fontSize: "11px",
		fontWeight: "600",
		cursor: "pointer",
		borderRadius: "5px",
		layerStyle: "metal-button",
		transition: "background 0.15s ease, box-shadow 0.15s ease, transform 0.08s ease",
		_hover: {
			background: "linear-gradient(135deg, {colors.control.highlight}, {colors.control.mid})",
		},
		_active: {
			transform: "translateY(1px)",
			boxShadow: "inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 2px rgba(0, 0, 0, 0.1)",
			transition: "none",
		},
	});
	const glyph = css({ display: "inline-flex" });
</script>

<div class={root}>
	<span class={labelCls}>
		{#if help}
			<span class={labelInner}>{label}<HelpTip text={help} /></span>
		{:else}
			{label}
		{/if}
	</span>
	<button type="button" class={button} aria-label={label} {onclick}>
		{#if icon}
			<span class={glyph}><ControlIcon name={icon} /></span>
		{:else}
			{label}
		{/if}
	</button>
</div>
