'use client';

import dynamic from 'next/dynamic';
import { useInView } from 'react-intersection-observer';
import { useMemo } from 'react';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { cn } from '@/lib/utils';
import { usePersonalizedHome } from '@/hooks/use-user-data';
import type { UserMediaRowProps } from '@/components/features/home/user-media-row';
import { hasUserMediaItems } from '@/components/features/home/user-media-row';

const RecentlyWatched = dynamic(() => import('@/components/features/watchlist/recently-watched'), {
	ssr: false,
	loading: () => <MediaLoader withHeader withHeaderAction className="min-h-70 relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />,
});
const UserWatchlistAll = dynamic<UserMediaRowProps>(
	() => import('@/components/features/home/user-media-row').then((mod) => mod.UserMediaRow),
	{ ssr: false, loading: () => <MediaLoader withHeader className="min-h-70 relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" /> }
);
const UserFavoritesAll = dynamic<UserMediaRowProps>(
	() => import('@/components/features/home/user-media-row').then((mod) => mod.UserMediaRow),
	{ ssr: false, loading: () => <MediaLoader withHeader className="min-h-70 relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" /> }
);

// The index each row prints: the mono accent number every heading recipe shares.
const ROW_INDEX_SELECTOR = 'span[data-row-reveal-header].text-brand, section > div > span.text-brand';

/** The next free row number, so numbering continues instead of restarting. */
function nextRowNumber(): number {
	if (typeof document === 'undefined') return 1;
	const numbers = Array.from(document.querySelectorAll(ROW_INDEX_SELECTOR))
		.map((el) => (el.textContent ?? '').trim())
		.filter((text) => /^\d{2,}$/.test(text))
		.map((text) => Number.parseInt(text, 10));
	return (numbers.length > 0 ? Math.max(...numbers) : 0) + 1;
}

interface HomePersonalizedRowsProps {
	section: 'continue-watching' | 'saved';
	sentinelClassName?: string;
	startRowNumber?: number;
}

export function HomePersonalizedRows({
	section,
	sentinelClassName,
	startRowNumber,
}: HomePersonalizedRowsProps) {
	const { ref, inView } = useInView({
		triggerOnce: true,
		rootMargin: '320px 0px',
	});
	const { data, isLoading } = usePersonalizedHome();

	// These rows are client-only, so the rows above them are already in the
	// document by the time this renders: continue their sequence. A row that
	// will not render must not burn a number, or the next one leaves a gap.
	const numbers = useMemo(() => {
		const first = startRowNumber ?? nextRowNumber();
		if (!inView || isLoading) return { watchlist: undefined, favorites: undefined };
		const watchlistRenders = hasUserMediaItems('watchlist', 'all', data);
		const favoritesRenders = hasUserMediaItems('favorites', 'all', data);
		return {
			watchlist: watchlistRenders ? first : undefined,
			favorites: favoritesRenders ? first + (watchlistRenders ? 1 : 0) : undefined,
		};
	}, [data, inView, isLoading, startRowNumber]);

	if (section === 'continue-watching') {
		return <RecentlyWatched />;
	}

	return (
		<>
			<div ref={ref} className={cn('h-1 w-full', sentinelClassName)} />
			{inView && (
				<>
					<UserWatchlistAll variant="watchlist" scope="all" rowNumber={numbers.watchlist} />
					<UserFavoritesAll variant="favorites" scope="all" rowNumber={numbers.favorites} />
				</>
			)}
		</>
	);
}
