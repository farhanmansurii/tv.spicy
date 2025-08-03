// useTVShowStore.ts

import { create } from 'zustand';
import { saveEpisodesToDB, loadEpisodesFromDB, deleteAllEpisodesFromDB } from '../lib/indexedDB'; // Import the IndexedDB utility functions

interface TVShowStore {
	recentlyWatched: any;
	addRecentlyWatched: (episode: any) => void;
	loadEpisodes: () => Promise<void>;
	updateTimeWatched: (episodeId: string, timeWatched: number) => void; // New function
	deleteRecentlyWatched: () => any; // Return type should match TVShowStore
}

const useTVShowStore = create<TVShowStore>((set) => ({
	recentlyWatched: [],
	addRecentlyWatched: (episode) => {
		set((state) => {
			console.log('Adding episode:', episode);
			console.log('Current recently watched:', state.recentlyWatched);

			// Remove any existing episodes from the same show
			const filteredEpisodes = state.recentlyWatched.filter((existingEpisode: any) => {
				const shouldKeep = existingEpisode.tv_id !== episode.tv_id;
				console.log(
					`Episode ${existingEpisode.name} (tv_id: ${existingEpisode.tv_id}) vs new episode (tv_id: ${episode.tv_id}) - keeping: ${shouldKeep}`
				);
				return shouldKeep;
			});

			console.log('Filtered episodes:', filteredEpisodes);

			// Add the new episode at the beginning
			const updatedRecentlyWatched = [episode, ...filteredEpisodes];

			console.log('Updated recently watched:', updatedRecentlyWatched);

			saveEpisodesToDB(updatedRecentlyWatched);
			return { recentlyWatched: updatedRecentlyWatched };
		});
	},
	loadEpisodes: async () => {
		try {
			const episodes = await loadEpisodesFromDB();
			set({ recentlyWatched: episodes });
		} catch (error) {
			console.error('Error loading episodes from IndexedDB:', error);
		}
	},
	deleteRecentlyWatched: () => {
		set({ recentlyWatched: [] });
		deleteAllEpisodesFromDB();
	},
	updateTimeWatched: (episodeId, timeWatched) => {
		set((state) => {
			const updatedRecentlyWatched = state.recentlyWatched.map((episode: any) => {
				if (episode.tv_id === episodeId) {
					return { ...episode, time: timeWatched };
				}
				return episode;
			});
			saveEpisodesToDB(updatedRecentlyWatched);
			return { recentlyWatched: updatedRecentlyWatched };
		});
	},
}));

export default useTVShowStore;
