'use client';

import { useSession } from 'next-auth/react';
import { useAuthStore } from '@/store/authStore';

export function useAuth() {
	const { data: session, status } = useSession();
	const authStore = useAuthStore();

	return {
		session,
		user: session?.user,
		isAuthenticated: !!session,
		isLoading: status === 'loading',
		userId: authStore.userId,
		userEmail: authStore.userEmail,
		userName: authStore.userName,
		userImage: authStore.userImage,
	};
}
