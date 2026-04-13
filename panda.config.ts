import { defineConfig } from '@pandacss/dev';

export default defineConfig({
	preflight: true,

	include: ['./src/**/*.{js,ts,svelte}'],
	exclude: [],

	globalCss: {
		body: {
			fontFamily: 'sans',
			WebkitFontSmoothing: 'antialiased',
			MozOsxFontSmoothing: 'grayscale',
			textRendering: 'optimizeLegibility',
			background: `url("data:image/svg+xml,%3Csvg width='6' height='6' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='6' height='6' fill='%23e8e0d4'/%3E%3Crect width='1' height='1' x='0' y='0' fill='%23ddd6c8' fill-opacity='0.4'/%3E%3Crect width='1' height='1' x='3' y='3' fill='%23ddd6c8' fill-opacity='0.3'/%3E%3C/svg%3E"), {colors.parchment}`,
		},
		'::selection': {
			background: '{colors.control.selection}',
			color: '{colors.ink}',
		},
		'::-webkit-scrollbar': {
			width: '10px',
			height: '10px',
		},
		'::-webkit-scrollbar-track': {
			background: '{colors.parchment.dark}',
		},
		'::-webkit-scrollbar-thumb': {
			background: '{colors.control.light}',
			border: '2px solid {colors.parchment.dark}',
			borderRadius: '5px',
		},
		'::-webkit-scrollbar-thumb:hover': {
			background: '#a09280',
		},
		'::-webkit-scrollbar-thumb:active': {
			background: '{colors.ink.muted}',
		},
		'::-webkit-scrollbar-corner': {
			background: '{colors.parchment.dark}',
		},
		'*': {
			scrollbarWidth: 'thin',
			scrollbarColor: '{colors.control.light} {colors.parchment.dark}',
		},
	},

	theme: {
		extend: {
			tokens: {
				colors: {
					parchment: {
						DEFAULT: { value: '#e8e0d4' },
						light: { value: '#f8f4ee' },
						mid: { value: '#ebe5db' },
						dark: { value: '#ddd6c8' },
						warm: { value: '#e2dace' },
						deep: { value: '#ddd4c7' },
					},
					ink: {
						DEFAULT: { value: '#2e2519' },
						mid: { value: '#3a3226' },
						soft: { value: '#5a5042' },
						muted: { value: '#8a7e6e' },
					},
					accent: {
						DEFAULT: { value: '#5a8ab8' },
						light: { value: '#8bb0d4' },
						focus: { value: 'rgba(90, 138, 184, 0.5)' },
						ring: { value: 'rgba(90, 120, 160, 0.3)' },
					},
					control: {
						DEFAULT: { value: '#8a7f6e' },
						light: { value: '#b5a994' },
						lighter: { value: '#c5bdb0' },
						dark: { value: '#6e6356' },
						mid: { value: '#918577' },
						highlight: { value: '#a89a84' },
						selection: { value: '#c4a97d' },
					},
				},
				fonts: {
					display: { value: "'Playfair Display Variable', Georgia, serif" },
					sans: { value: "'Source Sans Pro', 'Helvetica Neue', Arial, sans-serif" },
				},
			},
		},
	},

	outdir: 'styled-system',
});
