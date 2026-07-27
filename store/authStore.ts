import { create } from 'zustand';
import type { Session } from '@/lib/auth';

interface User {
	id: string;
	email: string;
	name: string | null;
	image?: string | null;
	emailVerified: boolean;
	createdAt: Date | string;
	updatedAt: Date | string;
}

interface AuthStore {
	session: Session | null;
	isLoading: boolean;
	isAuthenticated: boolean;
	user: User | null;
	// Computed selectors
	userId: string | null;
	userEmail: string | null;
	userName: string | null;
	userImage: string | null;
	isBootstrapping: boolean;
	bootstrappedUserId: string | null;
	// Actions
	setSession: (session: Session | null) => void;
	setLoading: (isLoading: boolean) => void;
	beginBootstrap: (userId: string) => void;
	completeBootstrap: (userId: string) => void;
	clearSession: () => void;
	// Legacy methods for backward compatibility
	setUser: (user: {
		id: string;
		email: string | null;
		name: string | null;
		image: string | null;
	}) => void;
	clearUser: () => void;
}

/**
 * Auth store WITHOUT localStorage persistence.
 *
 * Why no persistence?
 * - Stale localStorage can show fake authenticated UI after cookie expiry
 * - Better Auth session is the source of truth (HTTP-only cookie)
 * - useAuth() hook syncs from Better Auth on mount
 * - Prevents hydration mismatches between server and client
 */
export const useAuthStore = create<AuthStore>()((set, get) => ({
	session: null,
	isLoading: true,
	isAuthenticated: false,
	user: null,
	userId: null,
	userEmail: null,
	userName: null,
	userImage: null,
	isBootstrapping: false,
	bootstrappedUserId: null,

	setSession: (session) => {
		const user = session?.user || null;
		set((state) => {
			const userId = user?.id || null;
			const changedUser = state.userId !== userId;
			return {
				session,
				isAuthenticated: !!session,
				user,
				userId,
				userEmail: user?.email || null,
				userName: user?.name || null,
				userImage: user?.image || null,
				isLoading: false,
				isBootstrapping: userId
					? changedUser
						? true
						: state.isBootstrapping
					: false,
				bootstrappedUserId: changedUser ? null : state.bootstrappedUserId,
			};
		});
	},

	setLoading: (isLoading) => {
		set({ isLoading });
	},

	beginBootstrap: (userId) => {
		set((state) =>
			state.userId === userId
				? { isBootstrapping: true, bootstrappedUserId: null }
				: {}
		);
	},

	completeBootstrap: (userId) => {
		set((state) =>
			state.userId === userId
				? { isBootstrapping: false, bootstrappedUserId: userId }
				: {}
		);
	},

	clearSession: () => {
		set({
			session: null,
			isAuthenticated: false,
			user: null,
			userId: null,
			userEmail: null,
			userName: null,
			userImage: null,
			isLoading: false,
			isBootstrapping: false,
			bootstrappedUserId: null,
		});
	},

	// Legacy methods for backward compatibility
	setUser: (user) => {
		const session = get().session;
		set({
			isAuthenticated: true,
			userId: user.id,
			userEmail: user.email,
			userName: user.name,
			userImage: user.image,
			// Update session if it exists
			session: session
				? {
						...session,
						user: {
							...session.user,
							id: user.id,
							email: user.email || session.user.email,
							name: user.name || session.user.name,
							image: user.image || session.user.image,
						},
					}
				: null,
			user: {
				id: user.id,
				email: user.email || '',
				name: user.name,
				image: user.image,
				emailVerified: session?.user?.emailVerified || false,
				createdAt: session?.user?.createdAt || new Date().toISOString(),
				updatedAt: session?.user?.updatedAt || new Date().toISOString(),
			},
			isBootstrapping: false,
		});
	},

	clearUser: () => {
		set({
			isAuthenticated: false,
			userId: null,
			userEmail: null,
			userName: null,
			userImage: null,
			session: null,
			user: null,
			isBootstrapping: false,
			bootstrappedUserId: null,
		});
	},
}));
