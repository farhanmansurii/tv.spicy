import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Session } from '@/lib/auth';

interface User {
	id: string;
	email: string;
	name: string | null;
	image: string | null;
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
	// Actions
	setSession: (session: Session | null) => void;
	setLoading: (isLoading: boolean) => void;
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

export const useAuthStore = create<AuthStore>()(
	persist(
		(set, get) => ({
			session: null,
			isLoading: true,
			isAuthenticated: false,
			user: null,
			userId: null,
			userEmail: null,
			userName: null,
			userImage: null,

			setSession: (session) => {
				const user = session?.user || null;
				set({
					session,
					isAuthenticated: !!session,
					user,
					userId: user?.id || null,
					userEmail: user?.email || null,
					userName: user?.name || null,
					userImage: user?.image || null,
					isLoading: false,
				});
			},

			setLoading: (isLoading) => {
				set({ isLoading });
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
				});
			},
		}),
		{
			name: 'auth-storage',
			storage: createJSONStorage(() => localStorage),
			// Only persist essential data, not loading states
			partialize: (state) => ({
				session: state.session,
				user: state.user,
				isAuthenticated: state.isAuthenticated,
				userId: state.userId,
				userEmail: state.userEmail,
				userName: state.userName,
				userImage: state.userImage,
			}),
		}
	)
);
