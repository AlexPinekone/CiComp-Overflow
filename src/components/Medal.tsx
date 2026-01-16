'use client'; // Indica que este componente se debe ejecutar en el lado del cliente

import { useState } from 'react';

interface MedalProps {
	icon: React.ReactNode;
	text: string; // Nombre del logro o texto descriptivo
}

export default function Medal({ icon, text }: MedalProps) {
	const [showInfo, setShowInfo] = useState(false);

	// Alternar visibilidad de la información al hacer clic
	const handleClick = () => {
		setShowInfo((prev) => !prev);
	};

	return (
		<div
			onClick={handleClick}
			className="cursor-pointer relative flex items-center justify-center bg-blue-100 text-blue-600 rounded-full w-14 h-14 shadow-md hover:bg-blue-200 transition-all">
			{/* Icono de la medalla */}
			<div className="text-3xl">{icon}</div>

			{/* Información oculta que aparece al hacer clic */}
			{showInfo && (
				<div className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-xs rounded-b-lg py-1 px-2 shadow-md opacity-90">
					<span>{text}</span>
				</div>
			)}
		</div>
	);
}
