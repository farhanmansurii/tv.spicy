'use client';

import { ReactNode, useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useAuthStore } from '@/store/authStore';

/**
 * Auth provider wrapper.
 *
 * Owns the application's single Better Auth session subscription and mirrors
 * its result into the shared auth store.
 */
export function AuthProvider({ children }: { children: ReactNode }) {
	const { data: session, isPending } = useSession();
	const setSession = useAuthStore((state) => state.setSession);
	const setLoading = useAuthStore((state) => state.setLoading);

	useEffect(() => {
		setLoading(isPending);
		if (!isPending) {
			setSession(session ?? null);
		}
	}, [isPending, session, setLoading, setSession]);

	return children;
}
