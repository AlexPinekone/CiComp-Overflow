// src/components/ui/menu.tsx
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import React, { ReactNode, useRef, useEffect } from 'react';

interface MenuProps {
	trigger: ReactNode;
	className?: string;
	children: ReactNode;
}

export function Menu({ trigger, children, className = '' }: MenuProps) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
			<DropdownMenuContent align="start" className={className}>
				{children}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface MenuItemProps {
	onClick: () => void;
	children: ReactNode;
	className?: string;
}

export function MenuItem({ onClick, children, className = '' }: MenuItemProps) {
	return (
		<DropdownMenuItem
			onSelect={(e) => {
				e.preventDefault(); // Evita que el menú se cierre antes de ejecutar la acción
				onClick();
			}}
			className={className}>
			{children}
		</DropdownMenuItem>
	);
}
