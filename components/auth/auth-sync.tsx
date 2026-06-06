'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { syncLocalToDatabase } from '@/lib/sync/local-to-db';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';

/**
 * AuthSync handles the local-first → database sync lifecycle.
 *
 * Architecture:
 * 1. LocalStorage (via Zustand persist) is the UI source of truth.
 * 2. All reads are instant from local state.
 * 3. DB sync happens invisibly in the background.
 * 4. On login: merge DB data into local, then push merged local back to DB.
 * 5. On logout: stop syncing. Local data remains for next session.
 */
export function AuthSync() {
	const { userId, isAuthenticated } = useAuthStore();
	const lastSyncedUserId = useRef<string | null>(null);

	useEffect(() => {
		// User logged out or not authenticated
		if (!isAuthenticated || !userId) {
			if (lastSyncedUserId.current !== null) {
				lastSyncedUserId.current = null;
			}
			return;
		}

		// Already synced for this user in this session
		if (lastSyncedUserId.current === userId) {
			return;
		}

		// Mark this user as synced so we don't re-run
		lastSyncedUserId.current = userId;

		// Step 1: Load DB data and merge into local stores (background, non-blocking)
		Promise.all([
			useWatchListStore.getState().initialize(),
			useTVShowStore.getState().initialize(),
			useFavoritesStore.getState().initialize(),
		])
			.then(() => {
				// Step 2: Push merged local data back to DB
				// This ensures anything saved while logged out gets uploaded
				return syncLocalToDatabase(userId);
			})
			.catch((error) => {
				console.error('AuthSync failed:', error);
			});
	}, [isAuthenticated, userId]);

	return null;
}
