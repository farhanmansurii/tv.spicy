'use client';

import { loadEpisodesFromDB, loadRecentlySearchedFromDB } from '@/lib/indexedDB';
import useWatchListStore from '@/store/watchlistStore';
import { useFavoritesStore } from '@/store/favoritesStore';

interface SyncWatchlistItem {
	mediaId: number;
	mediaType: 'movie' | 'tv';
	posterPath?: string | null;
	backdropPath?: string | null;
	title: string;
	overview?: string | null;
}

interface SyncRecentlyWatchedItem {
	mediaId: number;
	mediaType: 'tv';
	seasonNumber: number;
	episodeNumber: number;
	episodeId: number;
	stillPath?: string | null;
	episodeName: string;
	showName?: string;
	progress: number;
}

interface SyncFavoriteItem {
	mediaId: number;
	mediaType: 'movie' | 'tv';
}

interface SyncData {
	watchlist: SyncWatchlistItem[];
	recentlyWatched: SyncRecentlyWatchedItem[];
	favorites: SyncFavoriteItem[];
	recentSearches: string[];
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
			...(watchlistStore.watchlist || []).map((item) => ({
				mediaId: Number(item.id ?? (item as { mediaId?: number }).mediaId ?? 0),
				mediaType: 'movie' as const,
				posterPath: item.poster_path ?? (item as { posterPath?: string | null }).posterPath,
				backdropPath:
					item.backdrop_path ?? (item as { backdropPath?: string | null }).backdropPath,
				title: item.title ?? item.name ?? '',
				overview: item.overview ?? null,
			})),
			...(watchlistStore.tvwatchlist || []).map((item) => ({
				mediaId: Number(item.id ?? (item as { mediaId?: number }).mediaId ?? 0),
				mediaType: 'tv' as const,
				posterPath: item.poster_path ?? (item as { posterPath?: string | null }).posterPath,
				backdropPath:
					item.backdrop_path ?? (item as { backdropPath?: string | null }).backdropPath,
				title: item.title ?? item.name ?? '',
				overview: item.overview ?? null,
			})),
		];

		// Get recently watched from IndexedDB
		const episodes = await loadEpisodesFromDB();
		data.recentlyWatched = episodes.map((ep) => ({
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
			...(favoritesStore.favoriteMovies || []).map((item) => ({
				mediaId: Number(item.id ?? (item as { mediaId?: number }).mediaId ?? 0),
				mediaType: 'movie' as const,
			})),
			...(favoritesStore.favoriteTV || []).map((item) => ({
				mediaId: Number(item.id ?? (item as { mediaId?: number }).mediaId ?? 0),
				mediaType: 'tv' as const,
			})),
		];
		data.favorites = allFavorites;

		// Get recent searches from IndexedDB
		const searches = await loadRecentlySearchedFromDB();
		data.recentSearches = searches.map((search) => {
			if (typeof search === 'string') return search;
			if (typeof search === 'object' && search && 'query' in search) {
				return String((search as { query?: string }).query || '');
			}
			return '';
		});
	} catch (error) {
		console.error('Error collecting local data:', error);
	}

	return data;
}

export async function syncLocalToDatabase(
	userId: string
): Promise<{ success: boolean; results?: unknown }> {
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
