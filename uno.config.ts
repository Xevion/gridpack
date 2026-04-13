import { defineConfig, presetUno, transformerDirectives } from 'unocss';
import extractorSvelte from '@unocss/extractor-svelte';

export default defineConfig({
	presets: [presetUno()],
	extractors: [extractorSvelte()],
	transformers: [transformerDirectives()],
	theme: {
		colors: {
			parchment: {
				DEFAULT: '#e8e0d4',
				light: '#f8f4ee',
				mid: '#ebe5db',
				dark: '#ddd6c8',
				warm: '#e2dace',
				deep: '#ddd4c7'
			},
			ink: {
				DEFAULT: '#2e2519',
				mid: '#3a3226',
				soft: '#5a5042',
				muted: '#8a7e6e'
			},
			accent: {
				DEFAULT: '#5a8ab8',
				light: '#8bb0d4',
				focus: 'rgba(90, 138, 184, 0.5)',
				ring: 'rgba(90, 120, 160, 0.3)'
			},
			control: {
				DEFAULT: '#8a7f6e',
				light: '#b5a994',
				lighter: '#c5bdb0',
				dark: '#6e6356',
				mid: '#918577',
				highlight: '#a89a84',
				selection: '#c4a97d'
			}
		},
		fontFamily: {
			display: ["'Playfair Display Variable'", 'Georgia', 'serif'],
			sans: ["'Source Sans Pro'", "'Helvetica Neue'", 'Arial', 'sans-serif']
		}
	}
});
