'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useAuthStore } from '@/store/authStore';

/**
 * Centralized auth hook that syncs Better Auth session to Zustand.
 *
 * Benefits over raw useSession():
 * - Single React subscriber to useSession (reduces re-renders)
 * - Auth state accessible from Zustand without hook calls
 *
 * Usage:
 *   const { user, isAuthenticated, isLoading } = useAuth();
 */
export function useAuth() {
	const { data: session, isPending } = useSession();
	const setSession = useAuthStore((s) => s.setSession);
	const setLoading = useAuthStore((s) => s.setLoading);

	// Sync Better Auth → Zustand once per session change
	useEffect(() => {
		setLoading(isPending);
		if (!isPending) {
			setSession(session || null);
		}
	}, [session, isPending, setSession, setLoading]);

	// Stable selectors — prevents re-renders when unrelated store fields change
	const user = useAuthStore((s) => s.user);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const isLoading = useAuthStore((s) => s.isLoading);
	const userId = useAuthStore((s) => s.userId);

	return {
		session,
		user,
		isAuthenticated,
		isLoading: isLoading || isPending,
		userId,
	};
}
