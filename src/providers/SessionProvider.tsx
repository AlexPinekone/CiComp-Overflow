'use client';
import { getUserFromSession } from '@/actions/user';
import { useQuery } from '@tanstack/react-query';
import { createContext, useEffect, useState } from 'react';

interface SessionContextType {
	session: any;
	setSession: React.Dispatch<React.SetStateAction<any>>;
}
export const SessionContext = createContext<SessionContextType | null>(null);

export default function SessionProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [session, setSession] = useState(null);
	const response = useQuery({
		queryKey: ['session'],
		queryFn: getUserFromSession,
		refetchOnWindowFocus: true,
	});
	useEffect(() => {
		if (response.isSuccess) {
			setSession(response.data);
		}
	}, [response.isSuccess, response.data]);
	return (
		<SessionContext.Provider value={{ session, setSession }}>
			{children}
		</SessionContext.Provider>
	);
}
