import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface AuthStore {
	isAuthenticated: boolean;
	userId: string | null;
	userEmail: string | null;
	userName: string | null;
	userImage: string | null;
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
		(set) => ({
			isAuthenticated: false,
			userId: null,
			userEmail: null,
			userName: null,
			userImage: null,
			setUser: (user) =>
				set({
					isAuthenticated: true,
					userId: user.id,
					userEmail: user.email,
					userName: user.name,
					userImage: user.image,
				}),
			clearUser: () =>
				set({
					isAuthenticated: false,
					userId: null,
					userEmail: null,
					userName: null,
					userImage: null,
				}),
		}),
		{
			name: 'auth-storage',
			storage: createJSONStorage(() => localStorage),
		}
	)
);
