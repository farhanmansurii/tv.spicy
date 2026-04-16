import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import {
	clampProgress,
	compareByUpdatedAtDesc,
	episodeToContinueWatchingPayload,
	getContinueWatchingId,
	mergeContinueWatchingItems,
	sanitizeContinueWatchingItems,
	type ContinueWatchingItem,
} from '@/lib/continue-watching';
import type { Episode } from '@/lib/types';
import { useAuthStore } from '@/store/authStore';
import { invalidateUserQueries } from '@/lib/query-client';

type RecentsEpisode = Episode & { time?: number };

interface TVShowStore {
	recentlyWatched: ContinueWatchingItem[];
	isInitialized: boolean;
	isLoading: boolean;
	lastUserId: string | null;
	addRecentlyWatched: (episode: RecentsEpisode) => Promise<void>;
	loadEpisodes: () => Promise<void>;
	updateTimeWatched: (
		mediaId: string,
		timeWatched: number,
		mediaType?: 'movie' | 'tv'
	) => Promise<void>;
	updatePlaybackProgress: (input: {
		mediaId: string;
		mediaType?: 'movie' | 'tv';
		progressPercent?: number | null;
		lastPositionSeconds?: number | null;
		durationSeconds?: number | null;
		seasonNumber?: number | null;
		episodeNumber?: number | null;
	}) => Promise<void>;
	deleteRecentlyWatched: (mediaId?: number, mediaType?: 'movie' | 'tv') => Promise<void>;
	syncWithDatabase: () => Promise<void>;
	loadFromDatabase: () => Promise<void>;
	initialize: () => Promise<void>;
}

async function fetchRecentlyWatchedFromDatabase(): Promise<ContinueWatchingItem[]> {
	const response = await fetch('/api/recently-watched', {
		credentials: 'include',
	});

	if (response.status === 401) {
		return [];
	}

	if (!response.ok) {
		throw new Error('Failed to fetch continue watching');
	}

	return sanitizeContinueWatchingItems(await response.json());
}

async function persistRecentlyWatchedItem(item: ContinueWatchingItem): Promise<void> {
	const response = await fetch('/api/recently-watched', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(item),
	});

	if (!response.ok) {
		throw new Error('Failed to persist continue watching item');
	}
}

async function persistProgress(
	item: ContinueWatchingItem,
	progressPercent: number
): Promise<void> {
	const response = await fetch('/api/recently-watched', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify({
			mediaId: item.mediaId,
			mediaType: item.mediaType,
			progressPercent,
			seasonNumber: item.seasonNumber,
			episodeNumber: item.episodeNumber,
		}),
	});

	if (!response.ok) {
		throw new Error('Failed to persist continue watching progress');
	}
}

async function removeItemFromDatabase(mediaId?: number, mediaType?: 'movie' | 'tv') {
	const searchParams = new URLSearchParams();
	if (mediaId && mediaType) {
		searchParams.set('mediaId', String(mediaId));
		searchParams.set('mediaType', mediaType);
	}

	const suffix = searchParams.toString() ? `?${searchParams.toString()}` : '';
	const response = await fetch(`/api/recently-watched${suffix}`, {
		method: 'DELETE',
		credentials: 'include',
	});

	if (!response.ok) {
		throw new Error('Failed to remove continue watching item');
	}
}

function mergeLocalAndRemote(
	localItems: ContinueWatchingItem[],
	remoteItems: ContinueWatchingItem[]
): ContinueWatchingItem[] {
	return mergeContinueWatchingItems(localItems, remoteItems).sort(compareByUpdatedAtDesc);
}

const useTVShowStore = create<TVShowStore>()(
	persist(
		(set, get) => ({
			recentlyWatched: [],
			isInitialized: false,
			isLoading: false,
			lastUserId: null,

			addRecentlyWatched: async (episode) => {
				const existing = get().recentlyWatched.find(
					(item) => item.id === getContinueWatchingId('tv', Number(episode.tv_id))
				);
				const nextItem = episodeToContinueWatchingPayload(episode, existing);
				const nextItems = mergeLocalAndRemote([nextItem], get().recentlyWatched);

				set({ recentlyWatched: nextItems });

				const authState = useAuthStore.getState();
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}

				if (!authState.isAuthenticated) {
					return;
				}

				try {
					await persistRecentlyWatchedItem(nextItem);
				} catch (error) {
					console.error('Failed to persist continue watching item:', error);
				}
			},

			loadEpisodes: async () => {
				set({
					recentlyWatched: sanitizeContinueWatchingItems(get().recentlyWatched),
					isInitialized: true,
				});
			},

			updateTimeWatched: async (mediaId, timeWatched, mediaType = 'tv') => {
				await get().updatePlaybackProgress({
					mediaId,
					mediaType,
					progressPercent: timeWatched,
				});
			},

			updatePlaybackProgress: async ({
				mediaId,
				mediaType = 'tv',
				progressPercent,
				lastPositionSeconds,
				durationSeconds,
				seasonNumber,
				episodeNumber,
			}) => {
				const targetId = getContinueWatchingId(mediaType, Number(mediaId));
				const existingItem = get().recentlyWatched.find((item) => {
					if (item.id !== targetId) {
						return false;
					}

					if (mediaType !== 'tv') {
						return true;
					}

					if (seasonNumber == null || episodeNumber == null) {
						return true;
					}

					return (
						item.seasonNumber === seasonNumber && item.episodeNumber === episodeNumber
					);
				});

				if (!existingItem) {
					return;
				}

				const nextProgressPercent =
					progressPercent != null
						? clampProgress(progressPercent)
						: durationSeconds && lastPositionSeconds != null && durationSeconds > 0
							? clampProgress((lastPositionSeconds / durationSeconds) * 100)
							: existingItem.progressPercent;

				const updatedItem: ContinueWatchingItem = {
					...existingItem,
					progressPercent: nextProgressPercent,
					lastPositionSeconds:
						lastPositionSeconds != null
							? Math.max(0, lastPositionSeconds)
							: existingItem.lastPositionSeconds ?? null,
					durationSeconds:
						durationSeconds != null
							? Math.max(0, durationSeconds)
							: existingItem.durationSeconds ?? null,
					updatedAt: new Date().toISOString(),
				};
				const filteredItems = get().recentlyWatched.filter((item) => item !== existingItem);
				const nextItems = sanitizeContinueWatchingItems([updatedItem, ...filteredItems]).sort(
					compareByUpdatedAtDesc
				);

				set({ recentlyWatched: nextItems });

				const authState = useAuthStore.getState();
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}

				if (!authState.isAuthenticated) {
					return;
				}

				try {
					if (nextProgressPercent >= 95) {
						await removeItemFromDatabase(updatedItem.mediaId, updatedItem.mediaType);
						return;
					}

					await persistProgress(updatedItem, nextProgressPercent);
				} catch (error) {
					console.error('Failed to update continue watching progress:', error);
				}
			},

			deleteRecentlyWatched: async (mediaId, mediaType = 'tv') => {
				const nextItems = mediaId
					? get().recentlyWatched.filter(
							(item) =>
								item.id !== getContinueWatchingId(mediaType, Number(mediaId))
					  )
					: [];

				set({ recentlyWatched: nextItems });

				const authState = useAuthStore.getState();
				if (authState.userId) {
					invalidateUserQueries(authState.userId);
				}

				if (!authState.isAuthenticated) {
					return;
				}

				try {
					await removeItemFromDatabase(mediaId, mediaType);
				} catch (error) {
					console.error('Failed to delete continue watching item:', error);
				}
			},

			syncWithDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					return;
				}

				const response = await fetch('/api/sync', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					credentials: 'include',
					body: JSON.stringify({
						recentlyWatched: get().recentlyWatched,
					}),
				});

				if (!response.ok) {
					throw new Error('Failed to sync continue watching');
				}
			},

			loadFromDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					set({
						recentlyWatched: sanitizeContinueWatchingItems(get().recentlyWatched),
						isInitialized: true,
						isLoading: false,
						lastUserId: null,
					});
					return;
				}

				set({ isLoading: true });
				try {
					const remoteItems = await fetchRecentlyWatchedFromDatabase();
					const mergedItems = mergeLocalAndRemote(get().recentlyWatched, remoteItems);

					set({
						recentlyWatched: mergedItems,
						isInitialized: true,
						isLoading: false,
						lastUserId: authState.userId,
					});

					if (mergedItems.length > 0) {
						await fetch('/api/sync', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							credentials: 'include',
							body: JSON.stringify({
								recentlyWatched: mergedItems,
							}),
						});
					}
				} catch (error) {
					console.error('Error loading continue watching from database:', error);
					set({
						recentlyWatched: sanitizeContinueWatchingItems(get().recentlyWatched),
						isInitialized: true,
						isLoading: false,
						lastUserId: authState.userId,
					});
				}
			},

			initialize: async () => {
				const authState = useAuthStore.getState();
				if (
					get().isInitialized &&
					(!authState.userId || authState.userId === get().lastUserId)
				) {
					return;
				}

				await get().loadFromDatabase();
			},
		}),
		{
			name: 'continue-watching-storage',
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				recentlyWatched: state.recentlyWatched,
				lastUserId: state.lastUserId,
			}),
		}
	)
);

export default useTVShowStore;
