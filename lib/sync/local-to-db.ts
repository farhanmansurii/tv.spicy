'use client';

import { useAuthStore } from '@/store/authStore';
import useWatchListStore from '@/store/watchlistStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import useTVShowStore from '@/store/recentsStore';
import type { UserSyncResponse } from '@/lib/types/personalized-home';

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
	mediaType: 'tv' | 'movie';
	seasonNumber?: number | null;
	episodeNumber?: number | null;
	episodeId?: number | null;
	stillPath?: string | null;
	episodeName?: string;
	showName?: string;
	title?: string;
	progressPercent: number;
	updatedAt: string;
	createdAt: string;
}

interface SyncFavoriteItem {
	mediaId: number;
	mediaType: 'movie' | 'tv';
}

export interface SyncData {
	watchlist: SyncWatchlistItem[];
	recentlyWatched: SyncRecentlyWatchedItem[];
	favorites: SyncFavoriteItem[];
	recentSearches: string[];
}

/**
 * Collect local data that is provably owned by the signed-in user and has not
 * been confirmed by the server yet.
 *
 * - Sections whose store `ownerUserId` doesn't match are skipped, so one
 *   account's data can never be uploaded into another account.
 * - Only unconfirmed items are uploaded: confirmed membership follows the
 *   server, which is what lets deletions propagate instead of resurrecting.
 * - Recent searches live in a device-global IndexedDB store with no owner
 *   recorded, so they are never uploaded (they cannot be attributed).
 */
export async function collectLocalData(): Promise<SyncData> {
	const data: SyncData = {
		watchlist: [],
		recentlyWatched: [],
		favorites: [],
		recentSearches: [],
	};

	const currentUserId = useAuthStore.getState().userId;
	const isPending = (item: { syncedAt?: string | null }): boolean => !item.syncedAt;

	try {
		// Get watchlist from localStorage via Zustand
		const watchlistStore = useWatchListStore.getState();
		if (watchlistStore.ownerUserId === currentUserId) {
			data.watchlist = [
				...(watchlistStore.watchlist || [])
					.filter(isPending)
					.map((item) => ({
						mediaId: Number(item.id ?? (item as { mediaId?: number }).mediaId ?? 0),
						mediaType: 'movie' as const,
						posterPath: item.poster_path ?? (item as { posterPath?: string | null }).posterPath,
						backdropPath:
							item.backdrop_path ?? (item as { backdropPath?: string | null }).backdropPath,
						title: item.title ?? item.name ?? '',
						overview: item.overview ?? null,
					})),
				...(watchlistStore.tvwatchlist || [])
					.filter(isPending)
					.map((item) => ({
						mediaId: Number(item.id ?? (item as { mediaId?: number }).mediaId ?? 0),
						mediaType: 'tv' as const,
						posterPath: item.poster_path ?? (item as { posterPath?: string | null }).posterPath,
						backdropPath:
							item.backdrop_path ?? (item as { backdropPath?: string | null }).backdropPath,
						title: item.title ?? item.name ?? '',
						overview: item.overview ?? null,
					})),
			];
		}

		// Get recently watched from the unified persisted Zustand store
		const recentsStore = useTVShowStore.getState();
		if (recentsStore.ownerUserId === currentUserId) {
			data.recentlyWatched = (recentsStore.recentlyWatched || [])
				.filter(isPending)
				.map((item) => ({
					mediaId: item.mediaId,
					mediaType: item.mediaType,
					seasonNumber: item.seasonNumber,
					episodeNumber: item.episodeNumber,
					episodeId: item.episodeId,
					stillPath: item.stillPath,
					episodeName: item.episodeName,
					showName: item.showName,
					title: item.title,
					progressPercent: item.progressPercent,
					updatedAt: item.updatedAt,
					createdAt: item.createdAt,
				}));
		}

		// Get favorites from Zustand store
		const favoritesStore = useFavoritesStore.getState();
		if (favoritesStore.ownerUserId === currentUserId) {
			data.favorites = [
				...(favoritesStore.favoriteMovies || []).filter(isPending).map((item) => ({
					mediaId: Number(item.id ?? (item as { mediaId?: number }).mediaId ?? 0),
					mediaType: 'movie' as const,
				})),
				...(favoritesStore.favoriteTV || []).filter(isPending).map((item) => ({
					mediaId: Number(item.id ?? (item as { mediaId?: number }).mediaId ?? 0),
					mediaType: 'tv' as const,
				})),
			];
		}
	} catch (error) {
		console.error('Error collecting local data:', error);
	}

	return data;
}

export async function syncLocalToDatabase(): Promise<{
	success: boolean;
	results?: unknown;
	data?: UserSyncResponse['data'];
}> {
	try {
		const localData = await collectLocalData();
		const response = await requestUserSync(localData);
		return { success: true, results: response.results, data: response.data };
	} catch (error) {
		console.error('Error syncing to database:', error);
		return { success: false };
	}
}

export async function requestUserSync(localData: SyncData): Promise<UserSyncResponse> {
	const response = await fetch('/api/sync', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		credentials: 'include',
		body: JSON.stringify(localData),
	});

	if (!response.ok) {
		throw new Error(`Failed to sync data (${response.status})`);
	}

	return response.json();
}
