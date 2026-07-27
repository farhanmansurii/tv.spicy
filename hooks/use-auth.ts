'use client';

import { useAuthStore } from '@/store/authStore';

/**
 * Read the session mirrored by the root AuthProvider.
 *
 * Usage:
 *   const { user, isAuthenticated, isLoading } = useAuth();
 */
export function useAuth() {
	const session = useAuthStore((s) => s.session);
	const user = useAuthStore((s) => s.user);
	const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
	const isLoading = useAuthStore((s) => s.isLoading);
	const userId = useAuthStore((s) => s.userId);

	return {
		session,
		user,
		isAuthenticated,
		isLoading,
		userId,
	};
}
