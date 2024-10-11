import { create } from 'zustand';
import { Episode as TEpisode } from '@/lib/types';

interface EpisodeStore {
	activeEP: TEpisode | null;
	setActiveEP: (activeEP: TEpisode) => void;
}

export const useEpisodeStore = create<EpisodeStore>((set) => ({
	activeEP: null,
	setActiveEP: (activeEP: TEpisode) => set({ activeEP }),
}));
