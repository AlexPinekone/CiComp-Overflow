import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/sonner';
import PrimarySearchAppBar from '@/components/Appbar';
import { Suspense } from 'react';
import { Providers } from '@/providers/Providers';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'CiComp Overflow',
	description: '',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen max-h-screen`}>
				<Providers>
					<PrimarySearchAppBar />
					<Suspense fallback={<div>Cargando...</div>}>
						{children}
					</Suspense>
					<Toaster />
				</Providers>
			</body>
		</html>
	);
}
