'use client';

import { loadEpisodesFromDB, loadRecentlySearchedFromDB } from '@/lib/indexedDB';
import useWatchListStore from '@/store/watchlistStore';
import { useSearchStore } from '@/store/recentsSearchStore';

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
				...item,
				mediaType: 'movie',
			})),
			...(watchlistStore.tvwatchlist || []).map((item: any) => ({
				...item,
				mediaType: 'tv',
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

		// Get favorites from localStorage
		const likedIds = JSON.parse(localStorage.getItem('liked') || '[]');
		data.favorites = likedIds.map((id: number) => {
			// Try to determine type from watchlist or default to 'movie'
			const inWatchlist = data.watchlist.find((w) => w.id === id);
			return {
				mediaId: id,
				mediaType: inWatchlist?.mediaType || 'movie',
			};
		});

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
