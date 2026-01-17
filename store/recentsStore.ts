// useTVShowStore.ts

import { create } from 'zustand';
import {
	deleteAllEpisodesFromDB,
	loadEpisodesFromDB,
	saveEpisodesToDB,
	type Episode as IndexedDBEpisode,
} from '../lib/indexedDB';
import type { Episode } from '@/lib/types';

type RecentsEpisode = Episode & { time?: number };

interface TVShowStore {
	recentlyWatched: RecentsEpisode[];
	addRecentlyWatched: (episode: RecentsEpisode) => void;
	loadEpisodes: () => Promise<void>;
	updateTimeWatched: (episodeId: string, timeWatched: number) => void;
	deleteRecentlyWatched: () => void;
	syncWithDatabase: () => Promise<void>;
	loadFromDatabase: () => Promise<void>;
}

const syncEpisodeToDatabase = async (
	episode: RecentsEpisode,
	action: 'add' | 'update' | 'delete'
) => {
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
	addRecentlyWatched: (episode) => {
		set((state) => {
			const filteredEpisodes = state.recentlyWatched.filter((existingEpisode) => {
				return existingEpisode.tv_id !== episode.tv_id;
			});
			const updatedRecentlyWatched = [episode, ...filteredEpisodes];
			const dbEpisodes: IndexedDBEpisode[] = updatedRecentlyWatched.map((item) => ({
				tv_id: item.tv_id,
				name: item.name,
				id: item.id,
				episode_number: item.episode_number,
				season_number: item.season_number,
				air_date: item.air_date ?? '',
				overview: item.overview ?? '',
				runtime: item.runtime ?? 0,
				still_path: item.still_path ?? null,
				time: item.time ?? 0,
				show_name: item.show_name,
			}));
			saveEpisodesToDB(dbEpisodes);
			return { recentlyWatched: updatedRecentlyWatched };
		});
		syncEpisodeToDatabase(episode, 'add').catch((error) => {
			console.error('Failed to sync episode to database:', error);
		});
	},
	loadEpisodes: async () => {
		try {
			const episodes = await loadEpisodesFromDB();
			const hydratedEpisodes: RecentsEpisode[] = episodes.map((episode) => ({
				...episode,
				show_name: episode.show_name ?? '',
				show_id: 0,
				production_code: '',
				vote_average: 0,
				vote_count: 0,
				crew: [],
				guest_stars: [],
				tv_id: episode.tv_id,
			}));
			set({ recentlyWatched: hydratedEpisodes });
		} catch (error) {
			console.error('Error loading episodes from IndexedDB:', error);
		}
	},
	deleteRecentlyWatched: () => {
		set({ recentlyWatched: [] });
		deleteAllEpisodesFromDB();
		fetch('/api/recently-watched', { method: 'DELETE' }).catch((error) => {
			console.error('Failed to delete from database:', error);
		});
	},
	updateTimeWatched: async (episodeId, timeWatched) => {
		const episode = get().recentlyWatched.find((ep) => ep.tv_id === episodeId);
		set((state) => {
			const updatedRecentlyWatched = state.recentlyWatched.map((item) => {
				if (item.tv_id === episodeId) {
					return { ...item, time: timeWatched };
				}
				return item;
			});
			const dbEpisodes: IndexedDBEpisode[] = updatedRecentlyWatched.map((item) => ({
				tv_id: item.tv_id,
				name: item.name,
				id: item.id,
				episode_number: item.episode_number,
				season_number: item.season_number,
				air_date: item.air_date ?? '',
				overview: item.overview ?? '',
				runtime: item.runtime ?? 0,
				still_path: item.still_path ?? null,
				time: item.time ?? 0,
				show_name: item.show_name,
			}));
			saveEpisodesToDB(dbEpisodes);
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
				const localEpisodes: RecentsEpisode[] = episodes.map((ep: any) => ({
					tv_id: String(ep.mediaId),
					name: ep.episodeName || `Episode ${ep.episodeNumber}`,
					id: ep.episodeId || 0,
					episode_number: ep.episodeNumber,
					season_number: ep.seasonNumber,
					still_path: ep.stillPath,
					time: ep.progress,
					show_name: ep.showName,
					air_date: '',
					overview: '',
					runtime: 0,
					production_code: '',
					show_id: 0,
					vote_average: 0,
					vote_count: 0,
					crew: [],
					guest_stars: [],
				}));
				set({ recentlyWatched: localEpisodes });
				const dbEpisodes: IndexedDBEpisode[] = localEpisodes.map((item) => ({
					tv_id: item.tv_id,
					name: item.name,
					id: item.id,
					episode_number: item.episode_number,
					season_number: item.season_number,
					air_date: item.air_date ?? '',
					overview: item.overview ?? '',
					runtime: item.runtime ?? 0,
					still_path: item.still_path ?? null,
					time: item.time ?? 0,
					show_name: item.show_name,
				}));
				saveEpisodesToDB(dbEpisodes);
			}
		} catch (error) {
			console.error('Error loading from database:', error);
		}
	},
}));

export default useTVShowStore;
