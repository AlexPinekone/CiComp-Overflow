import React from 'react';

const CiCompLogo = (props: React.SVGProps<SVGAElement>) => (
	<svg
		width="508"
		height="508"
		fill="none"
		xmlns="http://www.w3.org/2000/svg">
		<g filter="url(#a)">
			<path
				d="m250.5 249.5-222-128v253l222 125v-83L99.5 336v-85.5l151 81v-82Z"
				fill="#004A99"
			/>
			<path
				d="M469.5 198v-75.5l-219 127v250l69-39.872V388.5l150-89.5v-55.5l-149 86v-43l149-88.5Z"
				fill="#2A3074"
			/>
			<path
				d="m250.5 249.5-222-128L250 .5l61 33.904L174.5 124.5l76 46L398 82.76l71.5 39.74-219 127Z"
				fill="#0083CC"
			/>
			<path
				d="M469.5 122.5 250 .5l-65.5 36L395 166l74.5-43.5Z"
				fill="#0083CC"
			/>
		</g>
		<defs>
			<filter
				id="a"
				x="-4"
				y="0"
				width="508"
				height="508"
				filterUnits="userSpaceOnUse"
				color-interpolation-filters="sRGB">
				<feFlood flood-opacity="0" result="BackgroundImageFix" />
				<feColorMatrix
					in="SourceAlpha"
					values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
					result="hardAlpha"
				/>
				<feOffset dy="4" />
				<feGaussianBlur stdDeviation="2" />
				<feComposite in2="hardAlpha" operator="out" />
				<feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
				<feBlend
					in2="BackgroundImageFix"
					result="effect1_dropShadow_4_66"
				/>
				<feBlend
					in="SourceGraphic"
					in2="effect1_dropShadow_4_66"
					result="shape"
				/>
			</filter>
		</defs>
	</svg>
);

export default CiCompLogo;
