'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSession } from '@/lib/auth-client';
import { useCallback } from 'react';
import { toast } from 'sonner';

interface UserData {
	recentlyWatched: any[];
	watchlistMovies: any[];
	watchlistTV: any[];
	favoriteMovies: any[];
	favoriteTV: any[];
}

const fetchUserData = async (userId: string): Promise<UserData> => {
	const [recentlyWatched, watchlistMovies, watchlistTV, favoriteMovies, favoriteTV] = await Promise.all([
		fetch('/api/recently-watched').then((res) => (res.ok ? res.json() : [])),
		fetch('/api/watchlist?type=movie').then((res) => (res.ok ? res.json() : [])),
		fetch('/api/watchlist?type=tv').then((res) => (res.ok ? res.json() : [])),
		fetch('/api/favorites?type=movie').then((res) => (res.ok ? res.json() : [])),
		fetch('/api/favorites?type=tv').then((res) => (res.ok ? res.json() : [])),
	]);

	return {
		recentlyWatched,
		watchlistMovies,
		watchlistTV,
		favoriteMovies,
		favoriteTV,
	};
};

export function useDatabaseSync() {
	const { data: session } = useSession();
	const queryClient = useQueryClient();
	const userId = session?.user?.id;

	const queryKey = userId ? ['user', userId, 'home-data'] : null;

	const {
		data,
		isLoading,
		isError,
		error,
		refetch,
	} = useQuery({
		queryKey: queryKey || ['user', 'home-data'],
		queryFn: () => (userId ? fetchUserData(userId) : Promise.resolve({
			recentlyWatched: [],
			watchlistMovies: [],
			watchlistTV: [],
			favoriteMovies: [],
			favoriteTV: [],
		})),
		enabled: !!userId,
		staleTime: 5 * 60 * 1000, // 5 minutes
		gcTime: 30 * 60 * 1000, // 30 minutes
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
		retry: 3,
		retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
	});

	const invalidateCache = useCallback(() => {
		if (userId) {
			queryClient.invalidateQueries({ queryKey: ['user', userId] });
		}
	}, [userId, queryClient]);

	const syncData = useCallback(async () => {
		if (!userId) return;
		try {
			await refetch();
		} catch (err) {
			console.error('Error syncing data:', err);
			toast.error('Failed to sync data', {
				description: 'Please try again later',
			});
		}
	}, [userId, refetch]);

	return {
		data: data || {
			recentlyWatched: [],
			watchlistMovies: [],
			watchlistTV: [],
			favoriteMovies: [],
			favoriteTV: [],
		},
		isLoading,
		isError,
		error,
		syncData,
		invalidateCache,
	};
}
