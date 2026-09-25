import { StateCreator, create } from 'zustand';
import { createJSONStorage, persist, PersistOptions } from 'zustand/middleware';
import { toast } from 'sonner';

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
import { updatePersonalizedHomeQuery } from '@/lib/query-client';
import { WriteCoordinator } from '@/lib/sync/write-coordinator';
import { createUserScopedStorage } from '@/lib/sync/user-storage';
import {
	addTombstones,
	clearTombstones,
	confirmTombstones,
	mergeWithServer,
	stripMembershipKey,
	type Tombstones,
} from '@/lib/sync/membership';

type RecentsEpisode = Episode & { time?: number };

interface TVShowStore {
	recentlyWatched: ContinueWatchingItem[];
	isInitialized: boolean;
	isLoading: boolean;
	lastUserId: string | null;
	/** Which user the in-memory data belongs to; null means anonymous. */
	ownerUserId: string | null;
	/** Local delete tombstones, keyed `<mediaType>:<id>`, until the server confirms them. */
	tombstones: Tombstones;
	/** Last background-sync failure, so the UI can render it. */
	syncError: string | null;
	addRecentlyWatched: (episode: RecentsEpisode) => Promise<boolean>;
	loadEpisodes: () => Promise<void>;
	// Progress writers are typed Promise<void> because the playback hook that
	// consumes them is outside this change's file ownership; failures surface
	// as sonner toasts raised inside the store instead of a returned flag.
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
	deleteRecentlyWatched: (
		mediaId?: number,
		mediaType?: 'movie' | 'tv'
	) => Promise<boolean>;
	/** Undo path for a bulk delete: put the snapshot back and re-upload it. */
	restoreRecentlyWatched: (items: ContinueWatchingItem[]) => Promise<boolean>;
	flushPlaybackProgress: (mediaId: string, mediaType?: 'movie' | 'tv') => Promise<void>;
	syncWithDatabase: () => Promise<boolean>;
	loadFromDatabase: () => Promise<boolean>;
	mergeRemoteData: (items: ContinueWatchingItem[], userId: string) => void;
	markAllSynced: () => void;
	initialize: () => Promise<void>;
}

type RecentsStore = TVShowStore;

type MyPersist = (
	config: StateCreator<RecentsStore>,
	options: PersistOptions<RecentsStore>
) => StateCreator<RecentsStore>;

const progressWrites = new WriteCoordinator({ intervalMs: 60_000 });

function getProgressWriteKey(mediaType: 'movie' | 'tv', mediaId: number): string {
	return `${mediaType}:${mediaId}`;
}

function messageOf(error: unknown, fallback: string): string {
	return error instanceof Error ? error.message : fallback;
}

/**
 * Toast a failed background write once (stable id de-duplicates repeats) and
 * offer the same operation again instead of losing the user's change.
 */
function reportSyncFailure(id: string, message: string, retry: () => Promise<unknown>): void {
	if (typeof window === 'undefined') {
		return;
	}
	toast.error(message, {
		id,
		description: 'The change is saved on this device and will be retried.',
		action: {
			label: 'Retry',
			onClick: () => {
				void Promise.resolve()
					.then(retry)
					.catch(() => reportSyncFailure(id, message, retry));
			},
		},
	});
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

async function persistRecentlyWatchedItem(item: ContinueWatchingItem): Promise<boolean> {
	const response = await fetch('/api/recently-watched', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(item),
	});

	return response.ok;
}

async function persistProgress(
	item: ContinueWatchingItem,
	progressPercent: number
): Promise<boolean> {
	const payload = {
		mediaId: item.mediaId,
		mediaType: item.mediaType,
		progressPercent,
		seasonNumber: item.seasonNumber,
		episodeNumber: item.episodeNumber,
	};

	const response = await fetch('/api/recently-watched', {
		method: 'PUT',
		headers: { 'Content-Type': 'application/json' },
		credentials: 'include',
		body: JSON.stringify(payload),
	});

	// F3: a missing row means the item was never created for this account —
	// fall back to POST so progress is not silently dropped.
	if (response.status === 404) {
		return persistRecentlyWatchedItem({ ...item, progressPercent });
	}

	return response.ok;
}

async function removeItemFromDatabase(
	mediaId?: number,
	mediaType?: 'movie' | 'tv'
): Promise<boolean> {
	const searchParams = new URLSearchParams();
	if (mediaId && mediaType) {
		searchParams.set('mediaId', String(mediaId));
		searchParams.set('mediaType', mediaType);
	} else {
		// F4: wiping the whole history must be an explicit, confirmed request.
		searchParams.set('confirm', 'all');
	}

	const response = await fetch(`/api/recently-watched?${searchParams.toString()}`, {
		method: 'DELETE',
		credentials: 'include',
	});

	return response.ok;
}

function toMembershipKey(item: ContinueWatchingItem): string {
	return item.id;
}

/**
 * Server membership decides which history entries exist; values (progress,
 * timestamps) still resolve by recency so a newer watch on another device wins.
 * The result is sanitized because this list *is* the display path: the 24-item
 * cap and completion filters belong here, not in persistence.
 */
function reconcileWithServer(
	serverItems: ContinueWatchingItem[],
	localItems: ContinueWatchingItem[],
	tombstones: Tombstones
): ContinueWatchingItem[] {
	const stampedServer = serverItems.map((item) => ({ ...item, key: toMembershipKey(item) }));
	const stampedLocal = localItems.map((item) => ({ ...item, key: toMembershipKey(item) }));
	const membership = mergeWithServer(stampedServer, stampedLocal, tombstones);

	const serverByKey = new Map(serverItems.map((item) => [item.id, item]));
	const localByKey = new Map(localItems.map((item) => [item.id, item]));

	const merged = membership.map((entry) => {
		const serverItem = serverByKey.get(entry.key);
		const localItem = localByKey.get(entry.key);
		let value: ContinueWatchingItem = stripMembershipKey(entry);

		if (serverItem && localItem) {
			value = mergeContinueWatchingItems([localItem], [serverItem], { mode: 'persist' })[0] ?? value;
		}

		return { ...value, syncedAt: entry.syncedAt ?? value.syncedAt ?? null };
	});

	return sanitizeContinueWatchingItems(merged.sort(compareByUpdatedAtDesc));
}

function uploadPending(items: ContinueWatchingItem[]): ContinueWatchingItem[] {
	return items.filter((item) => !item.syncedAt);
}

const useTVShowStore = create<RecentsStore>()(
	(persist as MyPersist)(
		(set, get) => ({
			recentlyWatched: [],
			isInitialized: false,
			isLoading: false,
			lastUserId: null,
			ownerUserId: null,
			tombstones: {},
			syncError: null,

			addRecentlyWatched: async (episode) => {
				const existing = get().recentlyWatched.find(
					(item) => item.id === getContinueWatchingId('tv', Number(episode.tv_id))
				);
				const nextItem = {
					...episodeToContinueWatchingPayload(episode, existing),
					syncedAt: existing?.syncedAt ?? null,
				};
				const nextItems = mergeContinueWatchingItems([nextItem], get().recentlyWatched).sort(
					compareByUpdatedAtDesc
				);

				set((state) => ({
					recentlyWatched: nextItems,
					tombstones: clearTombstones(state.tombstones, [nextItem.id]),
				}));

				const authState = useAuthStore.getState();
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						recentlyWatched: nextItems,
					}));
				}

				if (!authState.isAuthenticated) {
					return true;
				}

				const ok = await persistRecentlyWatchedItem(nextItem);
				if (!ok) {
					useTVShowStore.setState({ syncError: 'Failed to save continue watching item' });
					reportSyncFailure('recents-persist', 'Could not save to your history', () =>
						get().syncWithDatabase()
					);
					return false;
				}

				useTVShowStore.setState((state) => ({
					syncError: null,
					recentlyWatched: state.recentlyWatched.map((item) =>
						item.id === nextItem.id && !item.syncedAt
							? { ...item, syncedAt: new Date().toISOString() }
							: item
					),
				}));
				return true;
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
				const isCompleted = nextProgressPercent >= 95;

				set((state) => ({
					recentlyWatched: nextItems,
					// Completed titles leave the list; tombstone so the next pull does not
					// resurrect a row the server is about to (or already did) drop.
					tombstones: isCompleted
						? addTombstones(state.tombstones, [updatedItem.id])
						: state.tombstones,
				}));

				const authState = useAuthStore.getState();
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						recentlyWatched: nextItems,
					}));
				}

				if (!authState.isAuthenticated) {
					return;
				}

				const writeKey = getProgressWriteKey(updatedItem.mediaType, updatedItem.mediaId);
				if (isCompleted) {
					progressWrites.cancel(writeKey);
					const ok = await removeItemFromDatabase(updatedItem.mediaId, updatedItem.mediaType);
					if (!ok) {
						useTVShowStore.setState({ syncError: 'Failed to archive completed title' });
						reportSyncFailure('recents-complete', 'Could not archive the finished title', () =>
							removeItemFromDatabase(updatedItem.mediaId, updatedItem.mediaType).then(
								(retried) => !!retried
							)
						);
						return;
					}
					useTVShowStore.setState({ syncError: null });
					return;
				}

				const fingerprint = [
					Math.floor(nextProgressPercent),
					updatedItem.seasonNumber ?? '',
					updatedItem.episodeNumber ?? '',
				].join(':');
				const scheduled = progressWrites.schedule(writeKey, fingerprint, async () => {
					const ok = await persistProgress(updatedItem, nextProgressPercent);
					if (!ok) {
						throw new Error('Failed to update continue watching progress');
					}
				});

				scheduled.catch((error) => {
					console.error('Failed to update continue watching progress:', error);
					useTVShowStore.setState({
						syncError: messageOf(error, 'Failed to update progress'),
					});
					reportSyncFailure('recents-progress', 'Could not sync your progress', () =>
						persistProgress(updatedItem, nextProgressPercent).then((ok) => {
							if (!ok) throw new Error('Retry failed');
							return undefined;
						})
					);
				});
			},

			deleteRecentlyWatched: async (mediaId, mediaType = 'tv') => {
				const targetId = mediaId ? getContinueWatchingId(mediaType, Number(mediaId)) : null;
				const removed = targetId
					? get().recentlyWatched.filter((item) => item.id === targetId)
					: [...get().recentlyWatched];

				const nextItems = targetId
					? get().recentlyWatched.filter((item) => item.id !== targetId)
					: [];

				set((state) => ({
					recentlyWatched: nextItems,
					tombstones: addTombstones(
						state.tombstones,
						removed.map((item) => item.id)
					),
				}));

				const authState = useAuthStore.getState();
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						recentlyWatched: nextItems,
					}));
				}

				if (!authState.isAuthenticated) {
					return true;
				}

				if (mediaId) {
					progressWrites.cancel(getProgressWriteKey(mediaType, mediaId));
				}

				const ok = await removeItemFromDatabase(mediaId, mediaType);
				if (!ok) {
					useTVShowStore.setState({ syncError: 'Failed to delete from history' });
					reportSyncFailure('recents-delete', 'Could not delete from your history', () =>
						removeItemFromDatabase(mediaId, mediaType).then((retried) => !!retried)
					);
					return false;
				}

				useTVShowStore.setState({ syncError: null });
				return true;
			},

			restoreRecentlyWatched: async (items) => {
				const state = get();
				const restored = items.map((item) => ({ ...item, syncedAt: null }));
				const restoredIds = new Set(restored.map((item) => item.id));

				set({
					recentlyWatched: mergeContinueWatchingItems(restored, state.recentlyWatched, {
						mode: 'persist',
					}).sort(compareByUpdatedAtDesc),
					tombstones: clearTombstones(state.tombstones, restoredIds),
				});

				const authState = useAuthStore.getState();
				if (authState.userId) {
					updatePersonalizedHomeQuery(authState.userId, (data) => ({
						...data,
						recentlyWatched: get().recentlyWatched,
					}));
				}

				if (!authState.isAuthenticated) {
					return true;
				}

				return get().syncWithDatabase();
			},

			flushPlaybackProgress: async (mediaId, mediaType = 'tv') => {
				try {
					await progressWrites.flush(getProgressWriteKey(mediaType, Number(mediaId)));
				} catch (error) {
					console.error('Failed to flush continue watching progress:', error);
					useTVShowStore.setState({
						syncError: messageOf(error, 'Failed to save progress'),
					});
					reportSyncFailure('recents-progress', 'Could not sync your progress', () =>
						get().flushPlaybackProgress(mediaId, mediaType)
					);
				}
			},

			syncWithDatabase: async () => {
				const authState = useAuthStore.getState();
				if (!authState.isAuthenticated) {
					return true;
				}

				const pending = uploadPending(get().recentlyWatched);
				let allOk = true;

				if (pending.length > 0) {
					try {
						const response = await fetch('/api/sync', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' },
							credentials: 'include',
							body: JSON.stringify({ recentlyWatched: pending }),
						});

						if (!response.ok) {
							throw new Error('Failed to sync continue watching');
						}

						const uploadedIds = new Set(pending.map((item) => item.id));
						const syncedAt = new Date().toISOString();
						useTVShowStore.setState((state) => ({
							syncError: null,
							recentlyWatched: state.recentlyWatched.map((item) =>
								uploadedIds.has(item.id) && !item.syncedAt ? { ...item, syncedAt } : item
							),
						}));
					} catch (error) {
						console.error('Failed to sync continue watching:', error);
						allOk = false;
						useTVShowStore.setState({
							syncError: messageOf(error, 'Failed to sync continue watching'),
						});
					}
				}

				// Re-send deletes the server has not confirmed yet, so a failure
				// offline still propagates once connectivity returns.
				for (const key of Object.keys(get().tombstones)) {
					const [tombstonedType, tombstonedId] = key.split(':');
					if (tombstonedType !== 'movie' && tombstonedType !== 'tv') continue;
					const ok = await removeItemFromDatabase(Number(tombstonedId), tombstonedType);
					if (!ok) allOk = false;
				}

				if (!allOk) {
					reportSyncFailure('recents-sync', 'Could not sync your history', () =>
						get().syncWithDatabase()
					);
				}
				return allOk;
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
					return true;
				}

				set({ isLoading: true });
				try {
					const remoteItems = await fetchRecentlyWatchedFromDatabase();

					set((state) => ({
						recentlyWatched: reconcileWithServer(
							remoteItems,
							state.recentlyWatched,
							state.tombstones
						),
						tombstones: confirmTombstones(
							state.tombstones,
							new Set(remoteItems.map((item) => item.id))
						),
						syncError: null,
						isInitialized: true,
						isLoading: false,
						lastUserId: authState.userId,
					}));
					return true;
				} catch (error) {
					console.error('Error loading continue watching from database:', error);
					// Keep local data instead of treating an outage as an empty server list.
					set({
						recentlyWatched: sanitizeContinueWatchingItems(get().recentlyWatched),
						syncError: messageOf(error, 'Failed to load continue watching'),
						isInitialized: true,
						isLoading: false,
					});
					return false;
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

			mergeRemoteData: (items, userId) => {
				set((state) => ({
					recentlyWatched: reconcileWithServer(
						items,
						state.recentlyWatched,
						state.tombstones
					),
					tombstones: confirmTombstones(
						state.tombstones,
						new Set(items.map((item) => item.id))
					),
					isInitialized: true,
					isLoading: false,
					lastUserId: userId,
				}));
			},

			markAllSynced: () => {
				const syncedAt = new Date().toISOString();
				set((state) => ({
					recentlyWatched: state.recentlyWatched.map((item) =>
						item.syncedAt ? item : { ...item, syncedAt }
					),
				}));
			},
		}),
		{
			name: 'continue-watching-storage',
			storage: createJSONStorage(() => createUserScopedStorage('continue-watching-storage')),
			partialize: (state) =>
				({
					recentlyWatched: state.recentlyWatched,
					lastUserId: state.lastUserId,
					ownerUserId: state.ownerUserId,
					tombstones: state.tombstones,
				}) as unknown as RecentsStore,
		}
	)
);

export default useTVShowStore;
