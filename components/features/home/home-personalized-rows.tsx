'use client';

import dynamic from 'next/dynamic';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import type { UserMediaRowProps } from '@/components/features/home/user-media-row';

const RecentlyWatched = dynamic(() => import('@/components/features/watchlist/recently-watched'), {
	ssr: false,
	loading: () => <MediaLoader withHeader withHeaderAction className="min-h-[280px]" />,
});
const UserWatchlistAll = dynamic<UserMediaRowProps>(
	() => import('@/components/features/home/user-media-row').then((mod) => mod.UserMediaRow),
	{ ssr: false, loading: () => <MediaLoader withHeader className="min-h-[280px]" /> }
);
const UserFavoritesAll = dynamic<UserMediaRowProps>(
	() => import('@/components/features/home/user-media-row').then((mod) => mod.UserMediaRow),
	{ ssr: false, loading: () => <MediaLoader withHeader className="min-h-[280px]" /> }
);

export function HomePersonalizedRows() {
	return (
		<>
			<RecentlyWatched />
			<UserWatchlistAll variant="watchlist" scope="all" />
			<UserFavoritesAll variant="favorites" scope="all" />
		</>
	);
}
