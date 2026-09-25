import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { useAuthStore } from '@/store/authStore';
import { updatePersonalizedHomeQuery } from '@/lib/query-client';
import type { PersonalizedFavoriteItem } from '@/lib/types/personalized-home';
import { createUserScopedStorage } from '@/lib/sync/user-storage';
import {
	addTombstones,
	clearTombstones,
	confirmTombstones,
	mergeWithServer,
	stripMembershipKey,
	type Tombstones,
} from '@/lib/sync/membership';

export interface FavoriteItem {
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
	item: FavoriteItem;
	action: 'add' | 'remove';
}

export interface FavoritesSnapshot {
	favoriteMovies: FavoriteItem[];
	favoriteTV: FavoriteItem[];
}

interface FavoritesState {
	favoriteMovies: FavoriteItem[];
	favoriteTV: FavoriteItem[];
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

interface FavoritesActions {
	addFavorite: (item: FavoriteItem, mediaType: 'movie' | 'tv') => Promise<boolean>;
	removeFavorite: (mediaId: number, mediaType: 'movie' | 'tv') => Promise<boolean>;
	clearFavorites: (mediaType?: 'movie' | 'tv') => Promise<boolean>;
	restoreFavorites: (snapshot: FavoritesSnapshot) => Promise<boolean>;
	loadFromDatabase: () => Promise<boolean>;
	syncWithDatabase: () => Promise<boolean>;
	initialize: () => Promise<void>;
	mergeRemoteData: (items: PersonalizedFavoriteItem[]) => void;
	markAllSynced: () => void;
	retryFailedSync: () => Promise<boolean>;
	resetInitialization: () => void;
}

type FavoritesStore = FavoritesState & FavoritesActions;

type MyPersist = (
	config: StateCreator<FavoritesStore>,
	options: PersistOptions<FavoritesStore>
) => StateCreator<FavoritesStore>;

function favoriteKey(mediaType: 'movie' | 'tv', id: number): string {
	return `${mediaType}:${id}`;
}

function withKey(mediaType: 'movie' | 'tv', item: FavoriteItem): FavoriteItem & { key: string } {
	return { ...item, key: favoriteKey(mediaType, item.id) };
}

function toMembership(
	items: Array<PersonalizedFavoriteItem | Record<string, unknown>>,
	mediaType: 'movie' | 'tv'
): Array<FavoriteItem & { key: string }> {
	return items.map((item) => {
		const raw = item as { id?: number; mediaId?: number };
		return {
			...convertToLocalFormat(item),
			key: favoriteKey(mediaType, Number(raw.id ?? raw.mediaId ?? 0)),
		};
	});
}

function messageOf(error: unknown, fallback: string): string {
	return error instanceof Error ? error.message : fallback;
}

function stripKeys(
	items: Array<FavoriteItem & { key: string }>
): FavoriteItem[] {
	return items.map(stripMembershipKey);
}

// Background sync: returns false (and records a retryable op) on failure so the
// caller never reports success for a change that only exists on this device.
const syncFavoriteToDatabase = async (
	mediaType: 'movie' | 'tv',
	item: FavoriteItem,
	action: 'add' | 'remove'
): Promise<boolean> => {
	const authState = useAuthStore.getState();
	if (!authState.isAuthenticated || !authState.userId) {
		return true;
	}

	try {
		if (action === 'add') {
			const response = await fetch('/api/favorites', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ mediaId: item.id, mediaType }),
				credentials: 'include',
			});

			if (!response.ok) {
				throw new Error(`Failed to sync: ${response.statusText}`);
			}

			const syncedAt = new Date().toISOString();
			useFavoritesStore.setState((state) => ({
				favoriteMovies:
					mediaType === 'movie'
						? state.favoriteMovies.map((entry) =>
								entry.id === item.id && !entry.syncedAt ? { ...entry, syncedAt } : entry
							)
						: state.favoriteMovies,
				favoriteTV:
					mediaType === 'tv'
						? state.favoriteTV.map((entry) =>
								entry.id === item.id && !entry.syncedAt ? { ...entry, syncedAt } : entry
							)
						: state.favoriteTV,
			}));
		} else {
			const response = await fetch(
				`/api/favorites?mediaId=${item.id}&mediaType=${mediaType}`,
				{
					method: 'DELETE',
					credentials: 'include',
				}
			);

			if (!response.ok) {
				throw new Error(`Failed to remove: ${response.statusText}`);
			}
		}

		useFavoritesStore.setState((state) => ({
			syncError: null,
			failedOps: state.failedOps.filter(
				(op) => !(op.mediaType === mediaType && op.item.id === item.id && op.action === action)
			),
		}));
		return true;
	} catch (error) {
		console.error('Favorites sync error:', error);
		useFavoritesStore.setState((state) => ({
			syncError: messageOf(error, 'Favorites sync failed'),
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

const convertToLocalFormat = (item: any): FavoriteItem => ({
	id: item.mediaId ?? item.id,
	media_type: (item.mediaType ?? item.media_type)?.toLowerCase(),
	syncedAt: null,
});

export const useFavoritesStore = create<FavoritesStore>()(
	(persist as MyPersist)(
		(set, get) => ({
			favoriteMovies: [],
			favoriteTV: [],
			isInitialized: false,
			isLoading: false,
			ownerUserId: null,
			tombstones: {},
			syncError: null,
			failedOps: [],

			addFavorite: async (item: FavoriteItem, mediaType: 'movie' | 'tv') => {
				const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
				const authState = useAuthStore.getState();
				set((state) => ({
					[key]: [
						{ ...item, syncedAt: null },
						...(state[key as keyof FavoritesState] as FavoriteItem[]).filter(
							(i) => i.id !== item.id
						),
					],
					tombstones: clearTombstones(state.tombstones, [favoriteKey(mediaType, item.id)]),
				}));
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						favorites: [
							{ ...item, media_type: mediaType },
							...data.favorites.filter(
								(favorite) =>
									!(favorite.id === item.id && favorite.media_type === mediaType)
							),
						],
					}));
				}
				return syncFavoriteToDatabase(mediaType, item, 'add');
			},

			removeFavorite: async (mediaId: number, mediaType: 'movie' | 'tv') => {
				const key = mediaType === 'movie' ? 'favoriteMovies' : 'favoriteTV';
				const authState = useAuthStore.getState();
				const existing = (get()[key] as FavoriteItem[]).find((i) => i.id === mediaId);
				set((state) => ({
					[key]: (state[key as keyof FavoritesStore] as FavoriteItem[]).filter(
						(i) => i.id !== mediaId
					),
					tombstones: addTombstones(state.tombstones, [favoriteKey(mediaType, mediaId)]),
				}));
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						favorites: data.favorites.filter(
							(favorite) => !(favorite.id === mediaId && favorite.media_type === mediaType)
						),
					}));
				}
				return syncFavoriteToDatabase(
					mediaType,
					existing ?? { id: mediaId, media_type: mediaType },
					'remove'
				);
			},

			clearFavorites: async (mediaType?: 'movie' | 'tv') => {
				const state = get();
				const authState = useAuthStore.getState();
				const removedMovies = mediaType && mediaType !== 'movie' ? [] : state.favoriteMovies;
				const removedTV = mediaType && mediaType !== 'tv' ? [] : state.favoriteTV;

				set({
					favoriteMovies: mediaType === 'tv' ? state.favoriteMovies : [],
					favoriteTV: mediaType === 'movie' ? state.favoriteTV : [],
					tombstones: addTombstones(state.tombstones, [
						...removedMovies.map((item) => favoriteKey('movie', item.id)),
						...removedTV.map((item) => favoriteKey('tv', item.id)),
					]),
				});

				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						favorites: mediaType
							? data.favorites.filter((favorite) => favorite.media_type !== mediaType)
							: [],
					}));
				}

				if (!authState.isAuthenticated) {
					return true;
				}

				try {
					const suffix = mediaType ? `?mediaType=${mediaType}` : '';
					const response = await fetch(`/api/favorites${suffix}`, {
						method: 'DELETE',
						credentials: 'include',
					});
					if (!response.ok) {
						throw new Error(`Failed to clear favorites: ${response.statusText}`);
					}
					useFavoritesStore.setState({ syncError: null });
					return true;
				} catch (error) {
					console.error('Failed to clear favorites:', error);
					useFavoritesStore.setState({
						syncError: messageOf(error, 'Failed to clear favorites'),
					});
					return false;
				}
			},

			// Undo path for a bulk clear: put the snapshot back, re-open each
			// restoree for upload, and push it so the server catches up.
			restoreFavorites: async (snapshot: FavoritesSnapshot) => {
				const state = get();
				const restoredKeys = [
					...snapshot.favoriteMovies.map((item) => favoriteKey('movie', item.id)),
					...snapshot.favoriteTV.map((item) => favoriteKey('tv', item.id)),
				];
				const reactivated = (item: FavoriteItem): FavoriteItem => ({ ...item, syncedAt: null });

				set({
					favoriteMovies: snapshot.favoriteMovies.map(reactivated),
					favoriteTV: snapshot.favoriteTV.map(reactivated),
					tombstones: clearTombstones(state.tombstones, restoredKeys),
				});

				const authState = useAuthStore.getState();
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						favorites: [
							...snapshot.favoriteMovies.map((item) => ({
								...item,
								media_type: 'movie' as const,
							})),
							...snapshot.favoriteTV.map((item) => ({
								...item,
								media_type: 'tv' as const,
							})),
						],
					}));
				}

				return get().syncWithDatabase();
			},

			loadFromDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					set({ isInitialized: true });
					return true;
				}

				try {
					const [moviesResponse, tvResponse] = await Promise.all([
						fetch('/api/favorites?type=movie', { credentials: 'include' }),
						fetch('/api/favorites?type=tv', { credentials: 'include' }),
					]);

					if (moviesResponse.status === 401 || tvResponse.status === 401) {
						set({ isInitialized: true });
						return true;
					}

					if (!moviesResponse.ok || !tvResponse.ok) {
						// Keep local data instead of treating an outage as an empty server list.
						set({
							isLoading: false,
							isInitialized: true,
							syncError: 'Failed to load favorites',
						});
						return false;
					}

					const movies = await moviesResponse.json();
					const tv = await tvResponse.json();

					set((state) => {
						const serverMovies = toMembership(movies, 'movie');
						const serverTV = toMembership(tv, 'tv');
						const localMovies = state.favoriteMovies.map((item) => withKey('movie', item));
						const localTV = state.favoriteTV.map((item) => withKey('tv', item));

						const mergedMovies = mergeWithServer(serverMovies, localMovies, state.tombstones);
						const mergedTV = mergeWithServer(serverTV, localTV, state.tombstones);
						const serverKeys = new Set([...serverMovies, ...serverTV].map((item) => item.key));

						return {
							favoriteMovies: stripKeys(mergedMovies),
							favoriteTV: stripKeys(mergedTV),
							tombstones: confirmTombstones(state.tombstones, serverKeys),
							isInitialized: true,
							isLoading: false,
						};
					});
					return true;
				} catch (error) {
					console.error('Error loading favorites from database:', error);
					set({ isLoading: false, isInitialized: true });
					return false;
				}
			},

			syncWithDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) return true;

				const { favoriteMovies, favoriteTV } = get();
				const ops: FailedSyncOp[] = [
					...favoriteMovies
						.filter((item) => !item.syncedAt)
						.map((item) => ({ mediaType: 'movie' as const, item, action: 'add' as const })),
					...favoriteTV
						.filter((item) => !item.syncedAt)
						.map((item) => ({ mediaType: 'tv' as const, item, action: 'add' as const })),
				];

				let allOk = true;
				for (const op of ops) {
					const ok = await syncFavoriteToDatabase(op.mediaType, op.item, op.action);
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
				const remoteMovies = items.filter((item) => item.media_type === 'movie');
				const remoteTV = items.filter((item) => item.media_type === 'tv');

				set((state) => {
					const serverMovies = toMembership(remoteMovies, 'movie');
					const serverTV = toMembership(remoteTV, 'tv');
					const localMovies = state.favoriteMovies.map((item) => withKey('movie', item));
					const localTV = state.favoriteTV.map((item) => withKey('tv', item));

					const mergedMovies = mergeWithServer(serverMovies, localMovies, state.tombstones);
					const mergedTV = mergeWithServer(serverTV, localTV, state.tombstones);
					const serverKeys = new Set([...serverMovies, ...serverTV].map((item) => item.key));

					return {
						favoriteMovies: stripKeys(mergedMovies),
						favoriteTV: stripKeys(mergedTV),
						tombstones: confirmTombstones(state.tombstones, serverKeys),
						isInitialized: true,
						isLoading: false,
					};
				});
			},

			markAllSynced: () => {
				const syncedAt = new Date().toISOString();
				set((state) => ({
					favoriteMovies: state.favoriteMovies.map((item) =>
						item.syncedAt ? item : { ...item, syncedAt }
					),
					favoriteTV: state.favoriteTV.map((item) =>
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
					const ok = await syncFavoriteToDatabase(op.mediaType, op.item, op.action);
					if (!ok) allOk = false;
				}
				return allOk;
			},

			resetInitialization: () => {
				set({ isInitialized: false });
			},
		}),
		{
			name: 'favorites-storage',
			storage: createJSONStorage(() => createUserScopedStorage('favorites-storage')),
			partialize: (state) =>
				({
					favoriteMovies: state.favoriteMovies,
					favoriteTV: state.favoriteTV,
					tombstones: state.tombstones,
					ownerUserId: state.ownerUserId,
				}) as unknown as FavoritesStore,
		}
	)
);
