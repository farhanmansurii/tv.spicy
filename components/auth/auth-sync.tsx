'use client';

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { collectLocalData, requestUserSync } from '@/lib/sync/local-to-db';
import { bootstrapUserData, resetUserBootstrap } from '@/lib/sync/bootstrap-user-data';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';

/**
 * AuthSync handles the local-first → database sync lifecycle.
 *
 * Architecture:
 * 1. LocalStorage (via Zustand persist) is the UI source of truth.
 * 2. All reads are instant from local state.
 * 3. On login, one sync request uploads local changes and returns canonical data.
 * 4. The response is merged into local stores and seeds the shared query cache.
 * 5. On logout: stop syncing. Local data remains for next session.
 */
export function AuthSync() {
	const userId = useAuthStore((state) => state.userId);
	const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
	const bootstrappedUserId = useAuthStore((state) => state.bootstrappedUserId);
	const beginBootstrap = useAuthStore((state) => state.beginBootstrap);
	const completeBootstrap = useAuthStore((state) => state.completeBootstrap);
	const queryClient = useQueryClient();
	const lastSyncedUserId = useRef<string | null>(null);

	useEffect(() => {
		// User logged out or not authenticated
		if (!isAuthenticated || !userId) {
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
		beginBootstrap(userId);

		void bootstrapUserData(userId, {
			collectLocalData,
			request: async (localData) => {
				const response = await requestUserSync(localData);
				return response.data;
			},
		})
			.then((data) => {
				if (useAuthStore.getState().userId !== userId) {
					return;
				}

				if (data) {
					useWatchListStore.getState().mergeRemoteData(data.watchlist);
					useTVShowStore.getState().mergeRemoteData(data.recentlyWatched, userId);
					useFavoritesStore.getState().mergeRemoteData(data.favorites);
					queryClient.setQueryData(['user', userId, 'personalized-home'], data);
				}
				completeBootstrap(userId);
			})
			.catch((error) => {
				console.error('AuthSync failed:', error);
				completeBootstrap(userId);
			});
	}, [
		beginBootstrap,
		bootstrappedUserId,
		completeBootstrap,
		isAuthenticated,
		queryClient,
		userId,
	]);

	return null;
}
