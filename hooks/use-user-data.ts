'use client';

import { useQuery } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';

interface WatchlistItem {
	id: string;
	mediaId: number;
	mediaType: 'MOVIE' | 'TV';
	title: string;
	posterPath?: string | null;
	backdropPath?: string | null;
	overview?: string | null;
}

interface RecentlyWatchedItem {
	id: string;
	mediaId: number;
	mediaType: 'MOVIE' | 'TV';
	seasonNumber?: number | null;
	episodeNumber?: number | null;
	episodeName?: string | null;
	showName?: string | null;
	stillPath?: string | null;
	progress: number;
}

interface FavoriteItem {
	id: string;
	mediaId: number;
	mediaType: 'MOVIE' | 'TV';
}

const fetchWatchlist = async (type?: 'movie' | 'tv'): Promise<WatchlistItem[]> => {
	const url = type ? `/api/watchlist?type=${type}` : '/api/watchlist';
	const response = await fetch(url);
	if (!response.ok) throw new Error('Failed to fetch watchlist');
	return response.json();
};

const fetchRecentlyWatched = async (): Promise<RecentlyWatchedItem[]> => {
	const response = await fetch('/api/recently-watched');
	if (!response.ok) throw new Error('Failed to fetch recently watched');
	return response.json();
};

const fetchFavorites = async (type?: 'movie' | 'tv'): Promise<FavoriteItem[]> => {
	const url = type ? `/api/favorites?type=${type}` : '/api/favorites';
	const response = await fetch(url);
	if (!response.ok) throw new Error('Failed to fetch favorites');
	return response.json();
};

export function useUserWatchlist(type?: 'movie' | 'tv') {
	const { data: session } = useSession();
	const userId = session?.user?.id;

	return useQuery({
		queryKey: ['user', userId, 'watchlist', type || 'all'],
		queryFn: () => fetchWatchlist(type),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 3,
	});
}

export function useUserRecentlyWatched() {
	const { data: session } = useSession();
	const userId = session?.user?.id;

	return useQuery({
		queryKey: ['user', userId, 'recently-watched'],
		queryFn: fetchRecentlyWatched,
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 3,
	});
}

export function useUserFavorites(type?: 'movie' | 'tv') {
	const { data: session } = useSession();
	const userId = session?.user?.id;

	return useQuery({
		queryKey: ['user', userId, 'favorites', type || 'all'],
		queryFn: () => fetchFavorites(type),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000,
		gcTime: 30 * 60 * 1000,
		retry: 3,
	});
}
