'use client';

import { loadEpisodesFromDB, loadRecentlySearchedFromDB } from '@/lib/indexedDB';
import useWatchListStore from '@/store/watchlistStore';
import { useFavoritesStore } from '@/store/favoritesStore';

interface SyncData {
	watchlist: any[];
	recentlyWatched: any[];
	favorites: any[];
	recentSearches: any[];
}

export async function collectLocalData(): Promise<SyncData> {
	const data: SyncData = {
		watchlist: [],
		recentlyWatched: [],
		favorites: [],
		recentSearches: [],
	};

	try {
		// Get watchlist from localStorage via Zustand
		const watchlistStore = useWatchListStore.getState();
		data.watchlist = [
			...(watchlistStore.watchlist || []).map((item: any) => ({
				mediaId: item.id || item.mediaId,
				mediaType: 'movie',
				posterPath: item.poster_path || item.posterPath,
				backdropPath: item.backdrop_path || item.backdropPath,
				title: item.title || item.name || '',
				overview: item.overview || null,
			})),
			...(watchlistStore.tvwatchlist || []).map((item: any) => ({
				mediaId: item.id || item.mediaId,
				mediaType: 'tv',
				posterPath: item.poster_path || item.posterPath,
				backdropPath: item.backdrop_path || item.backdropPath,
				title: item.title || item.name || '',
				overview: item.overview || null,
			})),
		];

		// Get recently watched from IndexedDB
		const episodes = await loadEpisodesFromDB();
		data.recentlyWatched = episodes.map((ep: any) => ({
			mediaId: parseInt(ep.tv_id),
			mediaType: 'tv',
			seasonNumber: ep.season_number,
			episodeNumber: ep.episode_number,
			episodeId: ep.id,
			stillPath: ep.still_path,
			episodeName: ep.name,
			showName: ep.show_name,
			progress: ep.time || 0,
		}));

		// Get favorites from Zustand store
		const favoritesStore = useFavoritesStore.getState();
		const allFavorites = [
			...(favoritesStore.favoriteMovies || []).map((item: any) => ({
				mediaId: item.id || item.mediaId,
				mediaType: 'movie' as const,
			})),
			...(favoritesStore.favoriteTV || []).map((item: any) => ({
				mediaId: item.id || item.mediaId,
				mediaType: 'tv' as const,
			})),
		];
		data.favorites = allFavorites;

		// Get recent searches from IndexedDB
		const searches = await loadRecentlySearchedFromDB();
		data.recentSearches = searches.map((search: any) => search.query || search);
	} catch (error) {
		console.error('Error collecting local data:', error);
	}

	return data;
}

export async function syncLocalToDatabase(userId: string): Promise<{ success: boolean; results?: any }> {
	try {
		const localData = await collectLocalData();

		const response = await fetch('/api/sync', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(localData),
		});

		if (!response.ok) {
			throw new Error('Failed to sync data');
		}

		const results = await response.json();
		return { success: true, results };
	} catch (error) {
		console.error('Error syncing to database:', error);
		return { success: false };
	}
}
