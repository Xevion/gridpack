<script lang="ts">
import { css } from "styled-system/css";

let { title, subtitle }: { title: string; subtitle: string } = $props();
</script>

<header
	class={css({
		textAlign: 'center',
		mb: '7',
		pb: '5',
		borderBottom: '1px solid rgba(0,0,0,0.08)',
		boxShadow: '0 1px 0 rgba(255,255,255,0.5)',
	})}
>
	<h1
		class={css({
			fontFamily: 'display',
			fontSize: '48px',
			fontWeight: '800',
			color: 'ink',
			m: '0',
			letterSpacing: '-0.025em',
			textShadow: '0 2px 0 rgba(255,255,255,0.6), 0 -1px 0 rgba(0,0,0,0.08)',
		})}
	>
		{title}
	</h1>
	<p
		class={css({
			fontSize: '13px',
			color: 'ink.muted',
			mt: '1.5',
			mb: '0',
			letterSpacing: '0.1em',
			textTransform: 'uppercase',
			textShadow: '0 1px 0 rgba(255,255,255,0.4)',
		})}
	>
		{subtitle}
	</p>
</header>
