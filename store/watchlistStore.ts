import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { useAuthStore } from '@/store/authStore';
import { updatePersonalizedHomeQuery } from '@/lib/query-client';
import type { PersonalizedWatchlistItem } from '@/lib/types/personalized-home';
import { createUserScopedStorage } from '@/lib/sync/user-storage';
import {
	addTombstones,
	clearTombstones,
	confirmTombstones,
	mergeWithServer,
	stripMembershipKey,
	type Tombstones,
} from '@/lib/sync/membership';

interface Show {
	id: number;
	title?: string;
	name?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	overview?: string | null;
	media_type?: string;
	/** Last time the server confirmed this row exists; unset means pending upload. */
	syncedAt?: string | null;
}

interface FailedSyncOp {
	mediaType: 'movie' | 'tv';
	item: Show;
	action: 'add' | 'remove';
}

interface WatchlistState {
	watchlist: Show[];
	tvwatchlist: Show[];
	isInitialized: boolean;
	isLoading: boolean;
	/** Which user the in-memory data belongs to; null means anonymous. */
	ownerUserId: string | null;
	/** Local delete tombstones, keyed `<mediaType>:<id>`, until the server confirms them. */
	tombstones: Tombstones;
	/** Last background-sync failure, so the UI can render it. */
	syncError: string | null;
	failedOps: FailedSyncOp[];
}

interface WatchlistActions {
	addToWatchlist: (show: Show) => Promise<boolean>;
	removeFromWatchList: (id: number) => Promise<boolean>;
	clearWatchlist: () => Promise<boolean>;
	addToTvWatchlist: (show: Show) => Promise<boolean>;
	removeFromTvWatchList: (id: number) => Promise<boolean>;
	clearTVWatchlist: () => Promise<boolean>;
	loadFromDatabase: () => Promise<boolean>;
	syncWithDatabase: () => Promise<boolean>;
	initialize: () => Promise<void>;
	mergeRemoteData: (items: PersonalizedWatchlistItem[]) => void;
	markAllSynced: () => void;
	retryFailedSync: () => Promise<boolean>;
	resetInitialization: () => void;
}

type WatchlistStore = WatchlistState & WatchlistActions;

type MyPersist = (
	config: StateCreator<WatchlistStore>,
	options: PersistOptions<WatchlistStore>
) => StateCreator<WatchlistStore>;

function showKey(mediaType: 'movie' | 'tv', id: number): string {
	return `${mediaType}:${id}`;
}

function withKey(mediaType: 'movie' | 'tv', show: Show): Show & { key: string } {
	return { ...show, key: showKey(mediaType, show.id) };
}

function toMembership(
	items: Array<PersonalizedWatchlistItem | Record<string, unknown>>,
	mediaType: 'movie' | 'tv'
): Array<Show & { key: string }> {
	return items.map((item) => {
		const raw = item as { id?: number; mediaId?: number };
		return {
			...convertToLocalFormat(item),
			key: showKey(mediaType, Number(raw.mediaId ?? raw.id ?? 0)),
		};
	});
}

// Background sync: returns false (and records a retryable op) on failure so the
// caller never reports success for a change that only exists on this device.
const syncToDatabase = async (
	mediaType: 'movie' | 'tv',
	item: Show,
	action: 'add' | 'remove'
): Promise<boolean> => {
	const authState = useAuthStore.getState();
	if (!authState.isAuthenticated || !authState.userId) {
		return true;
	}

	try {
		if (action === 'add') {
			const normalizedItem = {
				mediaId: item.id,
				mediaType,
				posterPath: item.poster_path || null,
				backdropPath: item.backdrop_path || null,
				title: item.title || item.name || '',
				overview: item.overview || null,
			};

			const response = await fetch('/api/watchlist', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(normalizedItem),
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error(`Failed to sync: ${response.statusText}`);
			}

			const syncedAt = new Date().toISOString();
			useWatchListStore.setState((state) => ({
				watchlist:
					mediaType === 'movie'
						? state.watchlist.map((entry) =>
								entry.id === item.id && !entry.syncedAt ? { ...entry, syncedAt } : entry
							)
						: state.watchlist,
				tvwatchlist:
					mediaType === 'tv'
						? state.tvwatchlist.map((entry) =>
								entry.id === item.id && !entry.syncedAt ? { ...entry, syncedAt } : entry
							)
						: state.tvwatchlist,
			}));
		} else {
			const response = await fetch(
				`/api/watchlist?mediaId=${item.id}&mediaType=${mediaType}`,
				{
					method: 'DELETE',
					credentials: 'include',
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to remove: ${response.statusText}`);
			}
		}

		useWatchListStore.setState((state) => ({
			syncError: null,
			failedOps: state.failedOps.filter(
				(op) => !(op.mediaType === mediaType && op.item.id === item.id && op.action === action)
			),
		}));
		return true;
	} catch (error) {
		console.error('Watchlist sync error:', error);
		const message = error instanceof Error ? error.message : 'Watchlist sync failed';
		useWatchListStore.setState((state) => ({
			syncError: message,
			failedOps: [
				...state.failedOps.filter(
					(op) => !(op.mediaType === mediaType && op.item.id === item.id && op.action === action)
				),
				{ mediaType, item, action },
			],
		}));
		return false;
	}
};

const convertToLocalFormat = (item: any): Show => ({
	id: item.mediaId,
	title: item.title,
	name: item.title,
	poster_path: item.posterPath,
	backdrop_path: item.backdropPath,
	overview: item.overview,
	media_type: item.mediaType?.toLowerCase(),
	syncedAt: null,
});

const toPersonalizedItem = (item: Show, mediaType: 'movie' | 'tv') => ({
	mediaId: item.id,
	mediaType,
	title: item.title || item.name || '',
	posterPath: item.poster_path || null,
	backdropPath: item.backdrop_path || null,
	overview: item.overview || null,
});

const useWatchListStore = create<WatchlistStore>()(
	(persist as MyPersist)(
		(set, get) => ({
			watchlist: [],
			tvwatchlist: [],
			isInitialized: false,
			isLoading: false,
			ownerUserId: null,
			tombstones: {},
			syncError: null,
			failedOps: [],

			addToWatchlist: async (show: Show) => {
				const authState = useAuthStore.getState();
				set((state) => ({
					watchlist: [show, ...state.watchlist.filter((s) => s.id !== show.id)],
					tombstones: clearTombstones(state.tombstones, [showKey('movie', show.id)]),
				}));
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						watchlist: [
							toPersonalizedItem(show, 'movie'),
							...data.watchlist.filter(
								(item) =>
									!(
										item.mediaId === show.id &&
										item.mediaType.toLowerCase() === 'movie'
									)
							),
						],
					}));
				}
				return syncToDatabase('movie', show, 'add');
			},

			removeFromWatchList: async (id: number) => {
				const currentState = get();
				const authState = useAuthStore.getState();
				const show = currentState.watchlist.find((s) => s.id === id);
				set((state) => ({
					watchlist: state.watchlist.filter((s) => s.id !== id),
					tombstones: addTombstones(state.tombstones, [showKey('movie', id)]),
				}));
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						watchlist: data.watchlist.filter(
							(item) =>
								!(
									item.mediaId === id &&
									item.mediaType.toLowerCase() === 'movie'
								)
						),
					}));
				}
				if (show) {
					return syncToDatabase('movie', show, 'remove');
				}
				return true;
			},

			clearWatchlist: async () => {
				const state = get();
				set({
					watchlist: [],
					tombstones: addTombstones(
						state.tombstones,
						state.watchlist.map((item) => showKey('movie', item.id))
					),
				});
				const authState = useAuthStore.getState();
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						watchlist: data.watchlist.filter(
							(item) => item.mediaType.toLowerCase() !== 'movie'
						),
					}));
				}
				if (authState.isAuthenticated) {
					try {
						const response = await fetch('/api/watchlist?mediaType=movie', {
							method: 'DELETE',
							credentials: 'include',
						});
						if (!response.ok) {
							throw new Error(`Failed to clear watchlist: ${response.statusText}`);
						}
						useWatchListStore.setState({ syncError: null });
						return true;
					} catch (error) {
						console.error('Failed to clear watchlist:', error);
						useWatchListStore.setState({
							syncError: error instanceof Error ? error.message : 'Failed to clear watchlist',
						});
						return false;
					}
				}
				return true;
			},

			addToTvWatchlist: async (show: Show) => {
				const authState = useAuthStore.getState();
				set((state) => ({
					tvwatchlist: [show, ...state.tvwatchlist.filter((s) => s.id !== show.id)],
					tombstones: clearTombstones(state.tombstones, [showKey('tv', show.id)]),
				}));
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						watchlist: [
							toPersonalizedItem(show, 'tv'),
							...data.watchlist.filter(
								(item) =>
									!(
										item.mediaId === show.id &&
										item.mediaType.toLowerCase() === 'tv'
									)
							),
						],
					}));
				}
				return syncToDatabase('tv', show, 'add');
			},

			removeFromTvWatchList: async (id: number) => {
				const currentState = get();
				const authState = useAuthStore.getState();
				const show = currentState.tvwatchlist.find((s) => s.id === id);
				set((state) => ({
					tvwatchlist: state.tvwatchlist.filter((s) => s.id !== id),
					tombstones: addTombstones(state.tombstones, [showKey('tv', id)]),
				}));
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						watchlist: data.watchlist.filter(
							(item) =>
								!(
									item.mediaId === id &&
									item.mediaType.toLowerCase() === 'tv'
								)
						),
					}));
				}
				if (show) {
					return syncToDatabase('tv', show, 'remove');
				}
				return true;
			},

			clearTVWatchlist: async () => {
				const state = get();
				set({
					tvwatchlist: [],
					tombstones: addTombstones(
						state.tombstones,
						state.tvwatchlist.map((item) => showKey('tv', item.id))
					),
				});
				const authState = useAuthStore.getState();
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						watchlist: data.watchlist.filter(
							(item) => item.mediaType.toLowerCase() !== 'tv'
						),
					}));
				}
				if (authState.isAuthenticated) {
					try {
						const response = await fetch('/api/watchlist?mediaType=tv', {
							method: 'DELETE',
							credentials: 'include',
						});
						if (!response.ok) {
							throw new Error(`Failed to clear watchlist: ${response.statusText}`);
						}
						useWatchListStore.setState({ syncError: null });
						return true;
					} catch (error) {
						console.error('Failed to clear watchlist:', error);
						useWatchListStore.setState({
							syncError: error instanceof Error ? error.message : 'Failed to clear watchlist',
						});
						return false;
					}
				}
				return true;
			},

			loadFromDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					set({ isInitialized: true });
					return true;
				}

				try {
					const [moviesResponse, tvResponse] = await Promise.all([
						fetch('/api/watchlist?type=movie', { credentials: 'include' }),
						fetch('/api/watchlist?type=tv', { credentials: 'include' }),
					]);

					if (moviesResponse.status === 401 || tvResponse.status === 401) {
						set({ isInitialized: true });
						return true;
					}

					if (!moviesResponse.ok || !tvResponse.ok) {
						// Keep local data instead of treating an outage as an empty server list.
						set({ isLoading: false, isInitialized: true, syncError: 'Failed to load watchlist' });
						return false;
					}

					const movies = await moviesResponse.json();
					const tv = await tvResponse.json();

					set((state) => {
						const serverMovies = toMembership(movies, 'movie');
						const serverTV = toMembership(tv, 'tv');
						const localMovies = state.watchlist.map((item) => withKey('movie', item));
						const localTV = state.tvwatchlist.map((item) => withKey('tv', item));

						const mergedMovies = mergeWithServer(serverMovies, localMovies, state.tombstones);
						const mergedTV = mergeWithServer(serverTV, localTV, state.tombstones);
						const serverKeys = new Set([...serverMovies, ...serverTV].map((item) => item.key));

						return {
							watchlist: mergedMovies.map(stripMembershipKey),
							tvwatchlist: mergedTV.map(stripMembershipKey),
							tombstones: confirmTombstones(state.tombstones, serverKeys),
							isInitialized: true,
							isLoading: false,
						};
					});
					return true;
				} catch (error) {
					console.error('Error loading watchlist from database:', error);
					set({ isLoading: false, isInitialized: true });
					return false;
				}
			},

			syncWithDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) return true;

				const { watchlist, tvwatchlist } = get();
				const ops: FailedSyncOp[] = [
					...watchlist
						.filter((item) => !item.syncedAt)
						.map((item) => ({ mediaType: 'movie' as const, item, action: 'add' as const })),
					...tvwatchlist
						.filter((item) => !item.syncedAt)
						.map((item) => ({ mediaType: 'tv' as const, item, action: 'add' as const })),
				];

				let allOk = true;
				for (const op of ops) {
					const ok = await syncToDatabase(op.mediaType, op.item, op.action);
					if (!ok) allOk = false;
				}
				return allOk;
			},

			initialize: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					set({ isInitialized: true });
					return;
				}
				await get().loadFromDatabase();
			},

			mergeRemoteData: (items) => {
				const remoteMovies = items.filter(
					(item) => item.mediaType.toLowerCase() === 'movie'
				);
				const remoteTV = items.filter((item) => item.mediaType.toLowerCase() === 'tv');

				set((state) => {
					const serverMovies = toMembership(remoteMovies, 'movie');
					const serverTV = toMembership(remoteTV, 'tv');
					const localMovies = state.watchlist.map((item) => withKey('movie', item));
					const localTV = state.tvwatchlist.map((item) => withKey('tv', item));

					const mergedMovies = mergeWithServer(serverMovies, localMovies, state.tombstones);
					const mergedTV = mergeWithServer(serverTV, localTV, state.tombstones);
					const serverKeys = new Set([...serverMovies, ...serverTV].map((item) => item.key));

					return {
						watchlist: mergedMovies.map(stripMembershipKey),
						tvwatchlist: mergedTV.map(stripMembershipKey),
						tombstones: confirmTombstones(state.tombstones, serverKeys),
						isInitialized: true,
						isLoading: false,
					};
				});
			},

			markAllSynced: () => {
				const syncedAt = new Date().toISOString();
				set((state) => ({
					watchlist: state.watchlist.map((item) =>
						item.syncedAt ? item : { ...item, syncedAt }
					),
					tvwatchlist: state.tvwatchlist.map((item) =>
						item.syncedAt ? item : { ...item, syncedAt }
					),
				}));
			},

			retryFailedSync: async () => {
				const ops = get().failedOps;
				if (ops.length === 0) {
					return true;
				}

				let allOk = true;
				for (const op of ops) {
					const ok = await syncToDatabase(op.mediaType, op.item, op.action);
					if (!ok) allOk = false;
				}
				return allOk;
			},

			resetInitialization: () => {
				set({ isInitialized: false });
			},
		}),
		{
			name: 'watchlist-storage',
			storage: createJSONStorage(() => createUserScopedStorage('watchlist-storage')),
			partialize: (state) =>
				({
					watchlist: state.watchlist,
					tvwatchlist: state.tvwatchlist,
					tombstones: state.tombstones,
					ownerUserId: state.ownerUserId,
				}) as unknown as WatchlistStore,
		}
	)
);

export default useWatchListStore;
