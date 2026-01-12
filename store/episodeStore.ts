import { create } from 'zustand';
import { Episode as TEpisode } from '@/lib/types';

interface EpisodeStore {
	activeEP: TEpisode | null;
	isPlaying: boolean;
	setActiveEP: (activeEP: TEpisode) => void;
	setIsPlaying: (isPlaying: boolean) => void;
	clearActiveEP: () => void;
}

export const useEpisodeStore = create<EpisodeStore>((set) => ({
	activeEP: null,
	isPlaying: false,
	setActiveEP: (activeEP: TEpisode) => set({ activeEP }),
	setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
	clearActiveEP: () => set({ activeEP: null, isPlaying: false }),
}));
