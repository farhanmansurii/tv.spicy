import { create } from 'zustand';

export type MediaInfoPanelTab = 'episode' | 'details' | 'watch' | 'cast' | 'trailers' | 'links';

interface MediaInfoPanelStore {
	isExpanded: boolean;
	activeTab: MediaInfoPanelTab | null;
	openTick: number;
	setExpanded: (isExpanded: boolean) => void;
	toggle: () => void;
	openTab: (tab: MediaInfoPanelTab) => void;
	reset: () => void;
}

export const useMediaInfoPanelStore = create<MediaInfoPanelStore>((set) => ({
	isExpanded: false,
	activeTab: null,
	openTick: 0,
	setExpanded: (isExpanded) => set({ isExpanded }),
	toggle: () => set((state) => ({ isExpanded: !state.isExpanded })),
	openTab: (tab) =>
		set((state) => ({
			isExpanded: true,
			activeTab: tab,
			openTick: state.openTick + 1,
		})),
	reset: () => set({ isExpanded: false, activeTab: null }),
}));
