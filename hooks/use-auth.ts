'use client';

import { useEffect } from 'react';
import { useSession } from '@/lib/auth-client';
import { useAuthStore } from '@/store/authStore';

/**
 * Hook that syncs Better Auth session to Zustand store and provides unified auth state
 * This reduces re-renders and provides a single source of truth for session data
 */
export function useAuth() {
	const { data: session, isPending } = useSession();
	const { setSession, setLoading, ...authStore } = useAuthStore();

	// Sync Better Auth session to Zustand store
	useEffect(() => {
		setLoading(isPending);
		if (!isPending) {
			setSession(session || null);
		}
	}, [session, isPending, setSession, setLoading]);

	// Return store state (which is synced from Better Auth)
	return {
		session: authStore.session,
		user: authStore.user,
		isAuthenticated: authStore.isAuthenticated,
		isLoading: authStore.isLoading || isPending,
		userId: authStore.userId,
		userEmail: authStore.userEmail,
		userName: authStore.userName,
		userImage: authStore.userImage,
	};
}
