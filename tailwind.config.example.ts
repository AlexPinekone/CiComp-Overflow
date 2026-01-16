import type { Config } from 'tailwindcss';

const config: Config = {
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
				primary: 'var(--primary)',
				secondary: 'var(--secondary)',
				tertiary: 'var(--tertiary)',
				titles: 'var(--titles)',
			},
		},
	},
	plugins: [
		function ({ addComponents }: any) {
			addComponents({
				blockquote: {
					borderLeftWidth: '4px',
					borderColor: '#6b7280', // Gray 500 en Tailwind
					fontStyle: 'italic',
					marginTop: '2rem', // my-8
					marginBottom: '2rem',
					paddingLeft: '1rem', // pl-4
					paddingRight: '1rem', // Si lo necesitas
					paddingTop: '1rem', // py-4
					paddingBottom: '1rem',
					marginLeft: '1rem', // mx-4
					marginRight: '1rem', // mx-4
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
