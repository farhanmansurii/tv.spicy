'use client';

import { signOut } from '@/lib/auth-client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Fragment, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { SignOutIcon, UserIcon, BookmarkSimpleIcon } from '@phosphor-icons/react';
import { Show } from '@/lib/types';
import MediaRow from '@/components/features/media/row/media-row';
import { Button } from '@/components/ui/button';
import RecentlyWatchedComponent from '@/components/features/watchlist/recently-watched';
import { ProfileSkeleton } from '@/components/features/profile/profile-skeleton';
import { useHasMounted } from '@/hooks/use-has-mounted';
import type { Session } from '@/lib/auth';

/** The stores keep trimmed rows; the card recipe needs the Show fields it reads. */
type RowSource = {
	id: number;
	title?: string;
	name?: string;
	poster_path?: string | null;
	backdrop_path?: string | null;
	overview?: string | null;
	media_type?: string;
};

function toRowShow(item: RowSource): Show {
	return {
		...item,
		name: item.name ?? item.title ?? '',
		title: item.title ?? item.name ?? '',
	} as Show;
}

function rowsWithArt(items: RowSource[] | undefined): Show[] {
	return (items ?? []).filter((item) => item.poster_path || item.backdrop_path).map(toRowShow);
}

interface StatCardProps {
	value: number;
	label: string;
}

function StatCard({ value, label }: StatCardProps) {
	return (
		<Card className="p-4 lg:p-6">
			<p className="font-mono text-micro uppercase tracking-meta text-dim">{label}</p>
			<p className="mt-2 font-display text-display-3 tabular-nums text-foreground">{value}</p>
		</Card>
	);
}

interface ProfilePageClientProps {
	session: Session;
}

export default function ProfilePageClient({ session }: ProfilePageClientProps) {
	const router = useRouter();
	// The watchlist, favorites and history stores rehydrate from localStorage
	// after mount, so before that they read as empty and the page would flash
	// the empty state at a signed-in member who has plenty saved.
	const hasMounted = useHasMounted();
	const watchlist = useWatchListStore((s) => s.watchlist);
	const tvwatchlist = useWatchListStore((s) => s.tvwatchlist);
	const recentlyWatched = useTVShowStore((s) => s.recentlyWatched);
	const favoriteMovies = useFavoritesStore((s) => s.favoriteMovies);
	const favoriteTV = useFavoritesStore((s) => s.favoriteTV);

	const watchlistMovies = useMemo(() => rowsWithArt(watchlist), [watchlist]);
	const watchlistTV = useMemo(() => rowsWithArt(tvwatchlist), [tvwatchlist]);
	const favoriteMovieList = useMemo(() => rowsWithArt(favoriteMovies), [favoriteMovies]);
	const favoriteTVList = useMemo(() => rowsWithArt(favoriteTV), [favoriteTV]);
	const totalWatched = recentlyWatched?.length || 0;

	// Only titles with art are shown, so the counts must come from the same
	// filtered lists rather than the raw stores.
	const totalWatchlist = watchlistMovies.length + watchlistTV.length;
	const totalFavorites = favoriteMovieList.length + favoriteTVList.length;

	const userInitials =
		session.user?.name
			?.split(' ')
			.map((part) => part[0])
			.join('')
			.toUpperCase()
			.slice(0, 2) || 'U';

	// Sections are numbered in the order they appear, and empty ones are hidden
	// so the page never shows a heading with nothing under it.
	const sections: { id: string; node: React.ReactNode }[] = [];

	if (watchlistMovies.length > 0) {
		sections.push({
			id: 'watchlist-movies',
			node: (
				<MediaRow
					isVertical={false}
					text="Watchlist · Movies"
					shows={watchlistMovies}
					type="movie"
					rowNumber={sections.length + 1}
				/>
			),
		});
	}
	if (watchlistTV.length > 0) {
		sections.push({
			id: 'watchlist-tv',
			node: (
				<MediaRow
					isVertical={false}
					text="Watchlist · TV Shows"
					shows={watchlistTV}
					type="tv"
					rowNumber={sections.length + 1}
				/>
			),
		});
	}
	if (favoriteMovieList.length > 0) {
		sections.push({
			id: 'favorites-movies',
			node: (
				<MediaRow
					isVertical={false}
					text="Favorites · Movies"
					shows={favoriteMovieList}
					type="movie"
					rowNumber={sections.length + 1}
				/>
			),
		});
	}
	if (favoriteTVList.length > 0) {
		sections.push({
			id: 'favorites-tv',
			node: (
				<MediaRow
					isVertical={false}
					text="Favorites · TV Shows"
					shows={favoriteTVList}
					type="tv"
					rowNumber={sections.length + 1}
				/>
			),
		});
	}
	if (totalWatched > 0) {
		sections.push({ id: 'recently-watched', node: <RecentlyWatchedComponent /> });
	}

	const isEmpty = sections.length === 0;

	if (!hasMounted) {
		return <ProfileSkeleton />;
	}

	return (
		<div className="mt-20 min-h-screen bg-background">
			<div className="px-gutter pt-8 pb-6 md:pt-12 md:pb-8">
				<Card className="relative overflow-hidden p-4 md:p-6 lg:p-10">
					<div
						aria-hidden="true"
						className="pointer-events-none absolute inset-0 bg-(image:--gradient-band) opacity-30"
					/>

					<div className="relative z-10 flex flex-col items-center gap-4 md:flex-row md:items-start md:gap-6 lg:gap-8">
						<Avatar className="size-20 md:size-28 lg:size-32">
							<AvatarImage
								src={session.user?.image || ''}
								alt={session.user?.name || 'Account avatar'}
							/>
							<AvatarFallback>{userInitials}</AvatarFallback>
						</Avatar>

						<div className="w-full flex-1 text-center md:text-left">
							<div className="flex flex-col items-center gap-3 md:flex-row md:items-start md:justify-between md:gap-4">
								<div className="min-w-0">
									<h1 className="font-display text-display-2 text-balance uppercase leading-none text-foreground">
										{session.user?.name || 'Your account'}
									</h1>
									<p className="mt-2 flex items-center justify-center gap-2 font-mono text-micro uppercase tracking-meta text-dim md:justify-start">
										<UserIcon className="size-4 shrink-0" aria-hidden="true" />
										<span className="truncate">{session.user?.email}</span>
									</p>
								</div>
								<Button
									variant="outline"
									className="min-h-11 shrink-0"
									onClick={async () => {
										await signOut();
										router.push('/');
									}}
								>
									<SignOutIcon className="size-4" aria-hidden="true" />
									Sign Out
								</Button>
							</div>
						</div>
					</div>
				</Card>

				<div className="mt-2 grid grid-cols-2 gap-2 md:mt-4 md:gap-4 lg:grid-cols-4 lg:gap-6">
					<StatCard value={totalWatchlist} label="In watchlist" />
					<StatCard value={totalFavorites} label="Favorites" />
					<StatCard value={totalWatched} label="Watched" />
					<StatCard
						value={totalWatchlist + totalFavorites}
						label="Titles on your reel"
					/>
				</div>
			</div>

			{isEmpty ? (
				<div className="flex flex-col items-center gap-4 px-gutter py-16 text-center md:py-24">
					<BookmarkSimpleIcon size={24} className="text-dim" aria-hidden="true" />
					<h2 className="font-display text-display-2 text-balance uppercase leading-none text-foreground">
						Nothing on the reel yet.
					</h2>
					<p className="max-w-md font-mono text-micro uppercase leading-relaxed tracking-meta text-dim">
						Save a film or series with its bookmark, and it will appear here.
					</p>
					<Button asChild className="mt-2">
						<Link href="/movie" prefetch={false}>
							Browse films
						</Link>
					</Button>
				</div>
			) : (
				<div className="flex flex-col">
					{sections.map((section) => (
						<Fragment key={section.id}>{section.node}</Fragment>
					))}
				</div>
			)}
		</div>
	);
}
