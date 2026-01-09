'use client';

import { useAuthStore } from '@/store/authStore';

/**
 * Hook for reading session data directly from Zustand store
 * Use this when you don't need real-time updates and want to avoid re-renders
 * For components that need to sync with Better Auth, use useAuth() instead
 */
export function useSessionStore() {
	const session = useAuthStore((state) => state.session);
	const user = useAuthStore((state) => state.user);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const isLoading = useAuthStore((state) => state.isLoading);
	const userId = useAuthStore((state) => state.userId);
	const userEmail = useAuthStore((state) => state.userEmail);
	const userName = useAuthStore((state) => state.userName);
	const userImage = useAuthStore((state) => state.userImage);

	return {
		session,
		user,
		isAuthenticated,
		isLoading,
		userId,
		userEmail,
		userName,
		userImage,
	};
}

/**
 * Selector hooks for specific session data (optimized for minimal re-renders)
 */
export function useUserId() {
	return useAuthStore((state) => state.userId);
}

export function useUser() {
	return useAuthStore((state) => state.user);
}

export function useIsAuthenticated() {
	return useAuthStore((state) => state.isAuthenticated);
}
