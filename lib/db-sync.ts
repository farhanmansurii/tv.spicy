'use client';

import { useSession } from 'next-auth/react';

// Helper functions to sync Zustand stores with database

export async function syncWatchlistFromDB() {
	const session = await fetch('/api/auth/session').then((res) => res.json());
	if (!session?.user?.id) return;

	try {
		const response = await fetch('/api/watchlist');
		if (response.ok) {
			const watchlist = await response.json();
			// This will be used by updated stores
			return watchlist;
		}
	} catch (error) {
		console.error('Error syncing watchlist:', error);
	}
	return [];
}

export async function syncRecentlyWatchedFromDB() {
	const session = await fetch('/api/auth/session').then((res) => res.json());
	if (!session?.user?.id) return;

	try {
		const response = await fetch('/api/recently-watched');
		if (response.ok) {
			const episodes = await response.json();
			return episodes;
		}
	} catch (error) {
		console.error('Error syncing recently watched:', error);
	}
	return [];
}

export async function syncFavoritesFromDB() {
	const session = await fetch('/api/auth/session').then((res) => res.json());
	if (!session?.user?.id) return;

	try {
		const response = await fetch('/api/favorites');
		if (response.ok) {
			const favorites = await response.json();
			return favorites;
		}
	} catch (error) {
		console.error('Error syncing favorites:', error);
	}
	return [];
}
