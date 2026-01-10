'use client';

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { syncLocalToDatabase } from '@/lib/sync/local-to-db';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';

/**
 * Component that handles database syncing and data loading when user is authenticated
 * Session syncing is now handled by useAuth hook, so this focuses on data operations
 */
export function AuthSync() {
	const { user, userId } = useAuthStore();
	const hasSyncedRef = useRef(false);
	const hasLoadedRef = useRef(false);
	const { initialize: initializeWatchlist } = useWatchListStore();
	const { loadFromDatabase: loadRecentsFromDB } = useTVShowStore();
	const { initialize: initializeFavorites } = useFavoritesStore();

	useEffect(() => {
		if (user && userId) {
			// Initialize stores - load from database once
			if (!hasLoadedRef.current) {
				hasLoadedRef.current = true;
				// Load from database first
				Promise.all([
					initializeWatchlist(),
					loadRecentsFromDB(),
					initializeFavorites(),
				]).then(() => {
					// After loading, sync local data to database in background
					if (!hasSyncedRef.current) {
						hasSyncedRef.current = true;
						syncLocalToDatabase(userId).catch((error) => {
							console.error('Auto-sync failed:', error);
						});
					}
				}).catch((error) => {
					console.error('Initialization failed:', error);
				});
			}
		} else {
			// Reset refs when user logs out
			hasSyncedRef.current = false;
			hasLoadedRef.current = false;
			// Reset initialization flags
			useWatchListStore.setState({ isInitialized: false });
			useFavoritesStore.setState({ isInitialized: false });
		}
	}, [user, userId, initializeWatchlist, loadRecentsFromDB, initializeFavorites]);

	return null;
}
