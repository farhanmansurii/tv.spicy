import { useFavoritesStore } from '@/store/favoritesStore';
import useTVShowStore from '@/store/recentsStore';
import useWatchListStore from '@/store/watchlistStore';

import { ensureUserScopedData } from './user-storage';

interface PersistedStoreLike {
	persist?: { rehydrate?: () => Promise<void> | void };
}

async function rehydrate(store: unknown): Promise<void> {
	const rehydrateStore = (store as PersistedStoreLike).persist?.rehydrate;
	if (typeof rehydrateStore === 'function') {
		await rehydrateStore();
	}
}

/**
 * Point every persisted local-data store at `userId`'s storage slot (or the
 * anonymous slot when signed out). Must run before any upload so collected data
 * provably belongs to the signing-in user, and on sign-out so the previous
 * user's data leaves memory. Idempotent.
 */
export async function adoptAuthScope(userId: string | null): Promise<void> {
	if (typeof window === 'undefined') {
		return;
	}

	if (!ensureUserScopedData('watchlist-storage', userId)) {
		useWatchListStore.setState({ watchlist: [], tvwatchlist: [] });
	}
	await rehydrate(useWatchListStore);
	useWatchListStore.setState({
		ownerUserId: userId,
		isInitialized: true,
		isLoading: false,
		syncError: null,
	});

	if (!ensureUserScopedData('favorites-storage', userId)) {
		useFavoritesStore.setState({ favoriteMovies: [], favoriteTV: [] });
	}
	await rehydrate(useFavoritesStore);
	useFavoritesStore.setState({
		ownerUserId: userId,
		isInitialized: true,
		isLoading: false,
		syncError: null,
	});

	if (!ensureUserScopedData('continue-watching-storage', userId)) {
		useTVShowStore.setState({ recentlyWatched: [] });
	}
	await rehydrate(useTVShowStore);
	useTVShowStore.setState({
		ownerUserId: userId,
		lastUserId: userId,
		isInitialized: true,
		isLoading: false,
		syncError: null,
	});
}
