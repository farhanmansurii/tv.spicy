'use client';

import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
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
	const { ref, inView } = useInView({
		triggerOnce: true,
		rootMargin: '320px 0px',
	});

	return (
		<>
			<RecentlyWatched />
			<div ref={ref} className="h-1 w-full" />
			{inView ? (
				<>
					<UserWatchlistAll variant="watchlist" scope="all" />
					<UserFavoritesAll variant="favorites" scope="all" />
				</>
			) : (
				<>
					<MediaLoader withHeader className="min-h-[280px]" />
					<MediaLoader withHeader className="min-h-[280px]" />
				</>
			)}
		</>
	);
}
