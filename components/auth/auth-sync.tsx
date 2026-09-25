'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { collectLocalData, requestUserSync } from '@/lib/sync/local-to-db';
import { bootstrapUserData, resetUserBootstrap } from '@/lib/sync/bootstrap-user-data';
import { adoptAuthScope } from '@/lib/sync/auth-scope';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';

/** Bounded follow-up cycles after a bootstrap that already exhausted its own retries. */
const MAX_RETRY_CYCLES = 3;
const RETRY_CYCLE_MS = 8000;

/**
 * `fetchUserHomeData` swallows server errors and answers with empty sections,
 * which is indistinguishable from "the user deleted everything elsewhere". Only
 * merge a section when the server actually said something, so a failed read can
 * never wipe local data. Trade-off: a genuine "deleted all of this section on
 * another device" pull is ignored until the next successful non-empty read.
 */
function shouldMergeSection(serverItems: unknown[], localItems: unknown[]): boolean {
	return serverItems.length > 0 || localItems.length === 0;
}

/**
 * AuthSync handles the local-first → database sync lifecycle.
 *
 * Architecture:
 * 1. LocalStorage (via Zustand persist) is the UI source of truth.
 * 2. All reads are instant from local state.
 * 3. On login the storage scope is switched to this user FIRST, so the upload
 *    provably contains only data owned by this account (F2).
 * 4. One sync request uploads pending local changes and returns canonical data;
 *    it is retried with backoff and never marked complete on failure (F7).
 * 5. The response is merged into local stores and seeds the shared query cache.
 * 6. On logout: stop syncing. Local data remains for the next session.
 */
export function AuthSync() {
	const userId = useAuthStore((state) => state.userId);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const bootstrappedUserId = useAuthStore((state) => state.bootstrappedUserId);
	const beginBootstrap = useAuthStore((state) => state.beginBootstrap);
	const completeBootstrap = useAuthStore((state) => state.completeBootstrap);
	const failBootstrap = useAuthStore((state) => state.failBootstrap);
	const clearBootstrapError = useAuthStore((state) => state.clearBootstrapError);
	const queryClient = useQueryClient();
	const lastSyncedUserId = useRef<string | null>(null);
	const retryTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const retryCycles = useRef(0);

	useEffect(() => {
		return () => {
			if (retryTimer.current) {
				clearTimeout(retryTimer.current);
				retryTimer.current = null;
			}
		};
	}, []);

	useEffect(() => {
		// User logged out or not authenticated
		if (!isAuthenticated || !userId) {
			if (retryTimer.current) {
				clearTimeout(retryTimer.current);
				retryTimer.current = null;
			}
			retryCycles.current = 0;
			if (lastSyncedUserId.current !== null) {
				resetUserBootstrap(lastSyncedUserId.current);
				lastSyncedUserId.current = null;
			}
			return;
		}

		if (lastSyncedUserId.current === userId || bootstrappedUserId === userId) {
			return;
		}

		lastSyncedUserId.current = userId;
		retryCycles.current = 0;
		beginBootstrap(userId);

		const isCurrent = () => useAuthStore.getState().userId === userId;

		const runBootstrap = async (): Promise<void> => {
			// Scope every persisted store to this user BEFORE any upload.
			await adoptAuthScope(userId);

			const data = await bootstrapUserData(
				userId,
				{
					collectLocalData,
					request: async (localData) => {
						const response = await requestUserSync(localData);
						return response.data;
					},
				},
				{ isCurrent }
			);

			if (!isCurrent()) {
				return;
			}

			if (data) {
				const watchlistStore = useWatchListStore.getState();
				const favoritesStore = useFavoritesStore.getState();
				const recentsStore = useTVShowStore.getState();

				// The upload just confirmed these rows server-side, so pending
				// markers are cleared before merging the canonical response.
				watchlistStore.markAllSynced();
				favoritesStore.markAllSynced();
				recentsStore.markAllSynced();

				if (shouldMergeSection(data.watchlist ?? [], watchlistStore.watchlist)) {
					useWatchListStore.getState().mergeRemoteData(data.watchlist);
				}
				if (shouldMergeSection(data.favorites ?? [], [
					...favoritesStore.favoriteMovies,
					...favoritesStore.favoriteTV,
				])) {
					useFavoritesStore.getState().mergeRemoteData(data.favorites);
				}
				if (
					shouldMergeSection(data.recentlyWatched ?? [], recentsStore.recentlyWatched)
				) {
					useTVShowStore.getState().mergeRemoteData(data.recentlyWatched, userId);
				}

				queryClient.setQueryData(['user', userId, 'personalized-home'], data);
			}

			completeBootstrap(userId);
		};

		const scheduleRetry = (error: unknown) => {
			if (!isCurrent()) {
				return;
			}

			const message = error instanceof Error ? error.message : 'Sync failed';
			// Surface the failure while waiting so the UI can show it.
			failBootstrap(userId, message);

			if (retryCycles.current >= MAX_RETRY_CYCLES) {
				return;
			}
			retryCycles.current += 1;

			retryTimer.current = setTimeout(() => {
				retryTimer.current = null;
				if (!isCurrent()) {
					return;
				}
				clearBootstrapError();
				beginBootstrap(userId);
				runBootstrap().catch(scheduleRetry);
			}, RETRY_CYCLE_MS);
		};

		runBootstrap().catch(scheduleRetry);
	}, [
		beginBootstrap,
		clearBootstrapError,
		completeBootstrap,
		failBootstrap,
		bootstrappedUserId,
		isAuthenticated,
		queryClient,
		userId,
	]);

	return null;
}
