import { create } from 'zustand';
import { Episode as TEpisode } from '@/lib/types';

interface EpisodeStore {
	activeEP: TEpisode | null;
	isPlaying: boolean;
	isPlayerSticky: boolean;
	setActiveEP: (activeEP: TEpisode) => void;
	setIsPlaying: (isPlaying: boolean) => void;
	setIsPlayerSticky: (isPlayerSticky: boolean) => void;
	clearActiveEP: () => void;
}

export const useEpisodeStore = create<EpisodeStore>(set => ({
	activeEP: null,
	isPlaying: false,
	isPlayerSticky: false,
	setActiveEP: (activeEP: TEpisode) => set({ activeEP }),
	setIsPlaying: (isPlaying: boolean) => set({ isPlaying }),
	setIsPlayerSticky: (isPlayerSticky: boolean) => set({ isPlayerSticky }),
	clearActiveEP: () => set({ activeEP: null, isPlaying: false, isPlayerSticky: false }),
}));
