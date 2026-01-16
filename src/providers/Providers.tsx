'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactNode } from 'react';
import SessionProvider from '@/providers/SessionProvider';
import { Provider } from 'react-redux';
import { store } from '@/redux/store';

// Create a client
export const queryClient = new QueryClient();

export function Providers({ children }: { children: ReactNode }) {
	return (
		<Provider store={store}>
			<QueryClientProvider client={queryClient}>
				<SessionProvider>{children}</SessionProvider>
			</QueryClientProvider>
		</Provider>
	);
}
