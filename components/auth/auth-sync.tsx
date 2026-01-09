'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/store/authStore';
import { syncLocalToDatabase } from '@/lib/sync/local-to-db';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';

export function AuthSync() {
	const { data: session } = useSession();
	const { setUser, clearUser } = useAuthStore();
	const hasSyncedRef = useRef(false);
	const hasLoadedRef = useRef(false);
	const { loadFromDatabase: loadWatchlistFromDB } = useWatchListStore();
	const { loadFromDatabase: loadRecentsFromDB } = useTVShowStore();
	const { loadFromDatabase: loadFavoritesFromDB } = useFavoritesStore();

	useEffect(() => {
		if (session?.user) {
			setUser({
				id: session.user.id || '',
				email: session.user.email || null,
				name: session.user.name || null,
				image: session.user.image || null,
			});

			if (!hasSyncedRef.current && session.user.id) {
				hasSyncedRef.current = true;
				syncLocalToDatabase(session.user.id).catch((error) => {
					console.error('Auto-sync failed:', error);
				});
			}

			if (!hasLoadedRef.current && session.user.id) {
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
			clearUser();
			hasSyncedRef.current = false;
			hasLoadedRef.current = false;
		}
	}, [session, setUser, clearUser, loadWatchlistFromDB, loadRecentsFromDB, loadFavoritesFromDB]);

	return null;
}
