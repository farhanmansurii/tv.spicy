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
	const { loadFromDatabase: loadWatchlistFromDB } = useWatchListStore();
	const { loadFromDatabase: loadRecentsFromDB } = useTVShowStore();
	const { loadFromDatabase: loadFavoritesFromDB } = useFavoritesStore();

	useEffect(() => {
		if (user && userId) {
			// Sync local data to database
			if (!hasSyncedRef.current) {
				hasSyncedRef.current = true;
				syncLocalToDatabase(userId).catch((error) => {
					console.error('Auto-sync failed:', error);
				});
			}

			// Load data from database
			if (!hasLoadedRef.current) {
				hasLoadedRef.current = true;
				Promise.all([
					loadWatchlistFromDB().catch((error) => {
						console.error('Error loading watchlist from database:', error);
					}),
					loadRecentsFromDB().catch((error) => {
						console.error('Error loading recently watched from database:', error);
					}),
					loadFavoritesFromDB().catch((error) => {
						console.error('Error loading favorites from database:', error);
					}),
				]);
			}
		} else {
			// Reset refs when user logs out
			hasSyncedRef.current = false;
			hasLoadedRef.current = false;
		}
	}, [user, userId, loadWatchlistFromDB, loadRecentsFromDB, loadFavoritesFromDB]);

	return null;
}
