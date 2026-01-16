/** @type {import('tailwindcss').Config} */
import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
		'./app/**/*.{js,ts,jsx,tsx}',
		'./pages/**/*.{js,ts,jsx,tsx}',
		'./components/**/*.{js,ts,jsx,tsx}',
		'./src/**/*.{js,ts,jsx,tsx}', // Asegura que todos los archivos sean detectados
		'./node_modules/@shadcn/ui/dist/**/*.{js,ts,jsx,tsx}', // <- Agrega esto
	],
	theme: {
		extend: {
			colors: {
				// background: "var(--background)",
				// foreground: "var(--foreground)",
				// primary: "var(--primary)",
				// secondary: "var(--secondary)",
				// tertiary: "var(--tertiary)",
				// titles: "var(--titles)",
				border: '#e5e7eb',
				ring: '#3b82f6',
				background: '#ffffff',
				foreground: '#171717',
				primary: '#004a98',
				secondary: '#00b3e3',
				tertiary: '#0083cc',
				titles: '#004a99',
			},
		},
		screens: {
			'2xl': { max: '1535px' },
			// => @media (max-width: 1535px) { ... }

			xl: { max: '1279px' },
			// => @media (max-width: 1279px) { ... }

			lg: { max: '1023px' },
			// => @media (max-width: 1023px) { ... }

			md: { max: '767px' },
			// => @media (max-width: 767px) { ... }

			sm: { max: '639px' },
			// => @media (max-width: 639px) { ... }
		},
	},
	experimental: {
		optimizeUniversalDefaults: true,
	},
	plugins: [
		function ({
			addComponents,
		}: {
			addComponents: (components: Record<string, any>) => void;
		}) {
			addComponents({
				blockquote: {
					borderLeftWidth: '4px',
					borderColor: '#6b7280', // Gray 500 en Tailwind
					fontStyle: 'italic',
					paddingLeft: '1rem', // pl-4
					paddingRight: '1rem', // Si lo necesitas
					paddingTop: '1rem', // py-4
					paddingBottom: '1rem',
					maxWidth: '28rem', // max-w-md
					'@screen md': {
						paddingLeft: '2rem', // md:pl-8
						marginLeft: '2.5rem', // md:mx-10
						marginRight: '2.5rem', // md:mx-10
					},
				},
			});
		},
	],
};

export default config;
