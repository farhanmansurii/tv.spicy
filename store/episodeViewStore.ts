import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type EpisodeView = 'grid' | 'list' | 'carousel';

interface EpisodeViewStore {
	view: EpisodeView;
	setView: (view: EpisodeView) => void;
}

const noopStorage = {
	getItem: () => null,
	setItem: () => {},
	removeItem: () => {},
};

export const useEpisodeViewStore = create<EpisodeViewStore>()(
	persist(
		(set) => ({
			view: 'list',
			setView: (view: EpisodeView) => set({ view }),
		}),
		{
			name: 'episode-view-preference',
			storage: createJSONStorage(() =>
				typeof window !== 'undefined' ? localStorage : noopStorage
			),
		}
	)
);
