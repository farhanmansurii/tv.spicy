import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface PlayerPrefsStore {
	stickyEnabled: boolean;
	setStickyEnabled: (enabled: boolean) => void;
}

const noopStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
};

export const usePlayerPrefsStore = create<PlayerPrefsStore>()(
	persist(
		(set) => ({
			stickyEnabled: true,
			setStickyEnabled: (enabled) => set({ stickyEnabled: enabled }),
		}),
		{
			name: 'player-preferences',
			storage: createJSONStorage(() =>
				typeof window !== 'undefined' ? localStorage : noopStorage
			),
		}
	)
);
