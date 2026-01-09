// useTVShowStore.ts

import { create } from 'zustand';
import { saveEpisodesToDB, loadEpisodesFromDB, deleteAllEpisodesFromDB } from '../lib/indexedDB';

interface TVShowStore {
	recentlyWatched: any;
	addRecentlyWatched: (episode: any) => void;
	loadEpisodes: () => Promise<void>;
	updateTimeWatched: (episodeId: string, timeWatched: number) => void;
	deleteRecentlyWatched: () => any;
	syncWithDatabase: () => Promise<void>;
	loadFromDatabase: () => Promise<void>;
}

const syncEpisodeToDatabase = async (episode: any, action: 'add' | 'update' | 'delete') => {
	try {
		if (action === 'add' || action === 'update') {
			await fetch('/api/recently-watched', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mediaId: parseInt(episode.tv_id),
					mediaType: 'tv',
					seasonNumber: episode.season_number,
					episodeNumber: episode.episode_number,
					episodeId: episode.id,
					stillPath: episode.still_path,
					episodeName: episode.name,
					showName: episode.show_name,
					progress: episode.time || 0,
				}),
			});
		} else if (action === 'delete') {
			await fetch('/api/recently-watched', { method: 'DELETE' });
		}
	} catch (error) {
		console.error('Error syncing episode to database:', error);
	}
};

const useTVShowStore = create<TVShowStore>((set, get) => ({
	recentlyWatched: [],
	addRecentlyWatched: async (episode) => {
		set((state) => {
			const filteredEpisodes = state.recentlyWatched.filter((existingEpisode: any) => {
				return existingEpisode.tv_id !== episode.tv_id;
			});
			const updatedRecentlyWatched = [episode, ...filteredEpisodes];
			saveEpisodesToDB(updatedRecentlyWatched);
			return { recentlyWatched: updatedRecentlyWatched };
		});
		await syncEpisodeToDatabase(episode, 'add');
	},
	loadEpisodes: async () => {
		try {
			const episodes = await loadEpisodesFromDB();
			set({ recentlyWatched: episodes });
		} catch (error) {
			console.error('Error loading episodes from IndexedDB:', error);
		}
	},
	deleteRecentlyWatched: async () => {
		set({ recentlyWatched: [] });
		deleteAllEpisodesFromDB();
		await syncEpisodeToDatabase(null, 'delete');
	},
	updateTimeWatched: async (episodeId, timeWatched) => {
		const episode = get().recentlyWatched.find((ep: any) => ep.tv_id === episodeId);
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
		if (episode) {
			await fetch('/api/recently-watched', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					mediaId: parseInt(episode.tv_id),
					progress: timeWatched,
					seasonNumber: episode.season_number,
					episodeNumber: episode.episode_number,
				}),
			});
		}
	},
	syncWithDatabase: async () => {
		const { recentlyWatched } = get();
		for (const episode of recentlyWatched) {
			await syncEpisodeToDatabase(episode, 'add');
		}
	},
	loadFromDatabase: async () => {
		try {
			const response = await fetch('/api/recently-watched');
			if (response.ok) {
				const episodes = await response.json();
				// Convert database format to local format
				const localEpisodes = episodes.map((ep: any) => ({
					tv_id: String(ep.mediaId),
					name: ep.episodeName || `Episode ${ep.episodeNumber}`,
					id: ep.episodeId || 0,
					episode_number: ep.episodeNumber,
					season_number: ep.seasonNumber,
					still_path: ep.stillPath,
					time: ep.progress,
					show_name: ep.showName,
				}));
				set({ recentlyWatched: localEpisodes });
				saveEpisodesToDB(localEpisodes);
			}
		} catch (error) {
			console.error('Error loading from database:', error);
		}
	},
}));

export default useTVShowStore;
