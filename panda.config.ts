import { defineConfig, defineSlotRecipe } from '@pandacss/dev';

// Each object defines a reusable visual treatment. They serve double duty:
//   1. Spread into slot-recipe definitions (guaranteed to work)
//   2. Wrapped in { value: ... } as layerStyles for ad-hoc css() usage

const embossedPanel = {
	background: 'linear-gradient(135deg, {colors.parchment.warm}, {colors.parchment.dark})',
	borderTop: '1px solid rgba(0, 0, 0, 0.12)',
	borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
	borderBottom: '1px solid rgba(255, 255, 255, 0.5)',
	borderRight: '1px solid rgba(255, 255, 255, 0.35)',
	boxShadow:
		'inset 0 2px 8px rgba(0, 0, 0, 0.2), inset 2px 0 6px rgba(0, 0, 0, 0.08), inset 0 0 0 1px rgba(0, 0, 0, 0.03), 0 1px 0 rgba(255, 255, 255, 0.6)',
};

const insetGroove = {
	background: 'linear-gradient(to bottom, {colors.control}, {colors.control.lighter})',
	borderRadius: '3px',
	borderTop: '1px solid rgba(0, 0, 0, 0.15)',
	borderLeft: '1px solid rgba(0, 0, 0, 0.08)',
	borderBottom: '1px solid rgba(255, 255, 255, 0.3)',
	borderRight: '1px solid rgba(255, 255, 255, 0.2)',
	boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.25)',
};

const accentFill = {
	background: 'linear-gradient(to bottom, {colors.accent.light}, {colors.accent})',
	borderRadius: '3px',
	boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.35), inset 0 -1px 0 rgba(0, 0, 0, 0.1)',
};

const raisedKnob = {
	background: 'linear-gradient(135deg, {colors.surface.light}, {colors.surface.dark})',
	border: '1px solid {colors.control}',
	boxShadow:
		'0 1px 3px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset -1px 0 0 rgba(0, 0, 0, 0.03)',
};

const metalButton = {
	background: 'linear-gradient(135deg, {colors.control.mid}, {colors.control.dark})',
	color: '#fff',
	textShadow: '0 -1px 0 rgba(0, 0, 0, 0.4)',
	boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.12)',
};

const insetField = {
	background: 'linear-gradient(to bottom, {colors.parchment.mid}, {colors.parchment.light})',
	boxShadow:
		'inset 1px 0 0 rgba(0, 0, 0, 0.12), inset -1px 0 0 rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.12)',
};

const photoFrame = {
	background: 'linear-gradient(135deg, {colors.surface.light}, {colors.surface})',
	boxShadow:
		'0 3px 10px rgba(0, 0, 0, 0.22), 0 1px 3px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.6), inset 1px 0 0 rgba(255, 255, 255, 0.3)',
};

const controlLabelStyle = {
	display: 'block',
	fontSize: '10px',
	fontWeight: '600',
	color: 'ink.soft',
	marginBottom: '4px',
	textTransform: 'uppercase',
	letterSpacing: '0.8px',
	textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)',
};

const controlValueStyle = {
	fontSize: '10px',
	fontWeight: '600',
	color: 'ink.soft',
	fontVariantNumeric: 'tabular-nums',
};

const controlResetBase = {
	display: 'block',
	height: '28px',
	margin: '0',
	padding: '0',
	border: 'none',
	outline: 'none',
	boxSizing: 'border-box',
};

const triggerBase = {
	...controlResetBase,
	width: '30px',
	fontSize: '14px',
	fontWeight: '700',
	lineHeight: '28px',
	cursor: 'pointer',
	...metalButton,
	transition: 'background 0.15s ease, box-shadow 0.15s ease, transform 0.08s ease',
	_hover: {
		background: 'linear-gradient(135deg, {colors.control.highlight}, {colors.control.mid})',
	},
	_active: {
		background: 'linear-gradient(135deg, {colors.control.dark}, {colors.control.mid})',
		boxShadow: 'inset 0 2px 4px rgba(0, 0, 0, 0.3), inset 0 0 2px rgba(0, 0, 0, 0.1)',
		transform: 'translateY(1px)',
		transition: 'none',
	},
};

const sliderRecipe = defineSlotRecipe({
	className: 'slider',
	slots: ['root', 'header', 'label', 'valueText', 'control', 'track', 'range', 'thumb'],
	base: {
		root: { minWidth: '160px' },
		header: { display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' },
		label: controlLabelStyle,
		valueText: controlValueStyle,
		control: { position: 'relative', display: 'flex', alignItems: 'center', height: '20px' },
		track: {
			...insetGroove,
			flex: '1',
			height: '6px',
		},
		range: {
			...accentFill,
			height: '100%',
		},
		thumb: {
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			width: '18px',
			height: '18px',
			borderRadius: '50%',
			...raisedKnob,
			cursor: 'grab',
			outline: 'none',
			transition: 'background 0.15s ease, box-shadow 0.2s ease, transform 0.1s ease',
			_hover: {
				transform: 'scale(1.1)',
				boxShadow:
					'0 2px 6px rgba(0, 0, 0, 0.3), 0 0 1px rgba(0, 0, 0, 0.18), inset 0 1px 0 rgba(255, 255, 255, 0.9), inset -1px 0 0 rgba(0, 0, 0, 0.03)',
			},
			_dragging: {
				cursor: 'grabbing',
				background:
					'linear-gradient(135deg, {colors.surface.dark}, {colors.surface.light})',
				transform: 'scale(1.05)',
				boxShadow:
					'0 1px 2px rgba(0, 0, 0, 0.2), inset 0 1px 2px rgba(0, 0, 0, 0.1), inset 0 -1px 0 rgba(255, 255, 255, 0.5)',
				transition:
					'background 0.1s ease, box-shadow 0.1s ease, transform 0.08s ease',
			},
			_focusVisible: {
				boxShadow:
					'0 1px 3px rgba(0, 0, 0, 0.3), 0 0 0 2px {colors.accent.focus}, inset 0 1px 0 rgba(255, 255, 255, 0.9)',
			},
			_after: {
				content: '""',
				width: '8px',
				height: '6px',
				background:
					'repeating-linear-gradient(to bottom, transparent, transparent 1px, rgba(0, 0, 0, 0.18) 1px, rgba(0, 0, 0, 0.18) 2px)',
				borderRadius: '1px',
				opacity: '0.8',
			},
		},
	},
	variants: {
		wide: {
			true: { root: { flex: '1' } },
		},
	},
});

const numberInputRecipe = defineSlotRecipe({
	className: 'numberInput',
	slots: ['root', 'label', 'control', 'decrementTrigger', 'incrementTrigger', 'field'],
	base: {
		root: { minWidth: '110px' },
		label: controlLabelStyle,
		control: {
			display: 'inline-flex',
			border: '1px solid {colors.control}',
			borderRadius: '6px',
			overflow: 'hidden',
			boxShadow:
				'0 1px 3px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.04), inset 0 0 0 1px rgba(255, 255, 255, 0.1)',
		},
		decrementTrigger: {
			...triggerBase,
			borderRight: '1px solid rgba(0, 0, 0, 0.2)',
		},
		incrementTrigger: {
			...triggerBase,
			borderLeft: '1px solid rgba(0, 0, 0, 0.2)',
		},
		field: {
			...controlResetBase,
			width: '46px',
			fontSize: '13px',
			fontFamily: 'sans',
			fontWeight: '600',
			fontVariantNumeric: 'tabular-nums',
			textAlign: 'center',
			color: 'ink.mid',
			...insetField,
			transition: 'background 0.2s ease, box-shadow 0.2s ease',
			_focus: {
				background:
					'linear-gradient(to bottom, {colors.parchment.dark}, {colors.parchment.light})',
				boxShadow:
					'inset 1px 0 0 rgba(0, 0, 0, 0.12), inset -1px 0 0 rgba(0, 0, 0, 0.12), inset 0 2px 4px rgba(0, 0, 0, 0.18), inset 0 0 0 1px {colors.accent.ring}',
			},
		},
	},
});

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
			background: '{colors.control.highlight}',
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
					surface: {
						DEFAULT: { value: '#ede8e0' },
						light: { value: '#faf7f2' },
						dark: { value: '#e2ddd3' },
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

			textStyles: {
				'control-label': {
					value: {
						display: 'block',
						fontSize: '10px',
						fontWeight: '600',
						color: '{colors.ink.soft}',
						marginBottom: '4px',
						textTransform: 'uppercase',
						letterSpacing: '0.8px',
						textShadow: '0 1px 0 rgba(255, 255, 255, 0.5)',
					},
				},
				'control-value': {
					value: {
						fontSize: '10px',
						fontWeight: '600',
						color: '{colors.ink.soft}',
						fontVariantNumeric: 'tabular-nums',
					},
				},
			},

			layerStyles: {
				'embossed-panel': { value: embossedPanel },
				'inset-groove': { value: insetGroove },
				'accent-fill': { value: accentFill },
				'raised-knob': { value: raisedKnob },
				'metal-button': { value: metalButton },
				'inset-field': { value: insetField },
				'photo-frame': { value: photoFrame },
			},

			slotRecipes: {
				slider: sliderRecipe,
				numberInput: numberInputRecipe,
			},
		},
	},

	outdir: 'styled-system',
});
