'use client';

import * as React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import {
	Bookmark,
	Heart,
	History,
	LogIn,
} from 'lucide-react';

import { LibraryWatchlist } from '@/components/features/watchlist/library-watchlist';
import { LibraryContinueWatching } from '@/components/features/watchlist/library-continue-watching';
import { LibraryFavoritesSynced } from '@/components/features/watchlist/library-favorites-synced';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { usePersonalizedGreeting } from '@/hooks/use-personalized-greeting';
import { useAuthStore } from '@/store/authStore';
import { useHasMounted } from '@/hooks/use-has-mounted';

type TabValue = 'continue' | 'watchlist' | 'favorites';

function TabButton({
	active,
	value,
	onClick,
	icon,
	label,
	count,
}: {
	active: boolean;
	value: TabValue;
	onClick: (v: TabValue) => void;
	icon: React.ReactNode;
	label: string;
	count: number;
}) {
	return (
		<button
			type="button"
			id={`library-tab-${value}`}
			aria-controls="library-tabpanel"
			tabIndex={active ? 0 : -1}
			onClick={() => onClick(value)}
			className={cn(
				'relative flex min-h-11 items-center gap-2 px-3 py-2.5 md:px-4 md:py-3',
				'text-ui font-semibold transition-colors duration-(--duration-ui) active:scale-97 motion-reduce:active:scale-100',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
				active
					? 'text-foreground'
					: 'text-dim can-hover:text-foreground'
			)}
			aria-selected={active}
			role="tab"
		>
			{icon}
			<span className="sr-only sm:not-sr-only">{label}</span>
			{count > 0 && (
				<span
					className={cn(
						'inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1',
						'font-mono text-micro font-medium tabular-nums',
						active ? 'bg-brand text-brand-foreground' : 'bg-muted text-muted-foreground'
					)}
				>
					{count > 99 ? '99+' : count}
				</span>
			)}
			{active && (
				<span className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-brand" />
			)}
		</button>
	);
}

export default function LibraryPage() {
	const session = useAuthStore((state) => state.session);
	const isPending = useAuthStore((state) => state.isLoading);
	const isMounted = useHasMounted();
	const watchlist = useWatchListStore((s) => s.watchlist);
	const tvwatchlist = useWatchListStore((s) => s.tvwatchlist);
	const favoriteMovies = useFavoritesStore((s) => s.favoriteMovies);
	const favoriteTV = useFavoritesStore((s) => s.favoriteTV);
	const recentlyWatched = useTVShowStore((s) => s.recentlyWatched);
	const { message: greetingMessage, isAuthenticated } = usePersonalizedGreeting();
	const isSignedIn = isMounted && Boolean(session?.user?.id);

	const [activeTab, setActiveTab] = React.useState<TabValue>('continue');

	// Counts from the same stores the sub-components render from
	const counts = React.useMemo(() => {
		if (!isMounted) return { watchlist: 0, favorites: 0, recent: 0 };
		const watchlistItems = (watchlist?.length || 0) + (tvwatchlist?.length || 0);
		const favoritesItems = (favoriteMovies?.length || 0) + (favoriteTV?.length || 0);
		const recentItems = recentlyWatched?.length || 0;
		return {
			watchlist: watchlistItems,
			favorites: favoritesItems,
			recent: recentItems,
		};
	}, [isMounted, watchlist, tvwatchlist, favoriteMovies, favoriteTV, recentlyWatched]);

	// Auto-switch to the first non-empty tab once on initial load only
	const didAutoSwitch = React.useRef(false);
	React.useEffect(() => {
		if (didAutoSwitch.current || isPending || !isMounted) return;
		didAutoSwitch.current = true;
		if (counts.recent > 0) return;
		if (counts.watchlist > 0) {
			setActiveTab('watchlist');
		} else if (counts.favorites > 0) {
			setActiveTab('favorites');
		}
	}, [counts.recent, counts.watchlist, counts.favorites, isPending, isMounted]);

	const tabValues: TabValue[] = ['continue', 'watchlist', 'favorites'];
	const handleTabKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
		if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
		event.preventDefault();
		const current = tabValues.indexOf(activeTab);
		let next = current;
		if (event.key === 'ArrowLeft') {
			next = (current - 1 + tabValues.length) % tabValues.length;
		} else if (event.key === 'ArrowRight') {
			next = (current + 1) % tabValues.length;
		} else if (event.key === 'Home') {
			next = 0;
		} else if (event.key === 'End') {
			next = tabValues.length - 1;
		}
		setActiveTab(tabValues[next]);
		document.getElementById(`library-tab-${tabValues[next]}`)?.focus();
	};

	if (isPending) {
		return (
			<div role="status" aria-label="Loading your library" className="min-h-screen mt-20 bg-background">
				<div className="w-full px-gutter pt-8 pb-6 md:pt-12 md:pb-8">
					<div className="flex flex-col gap-4">
						<Skeleton className="h-3 w-36 rounded-sm" />
						<Skeleton className="h-12 w-64 rounded-sm md:h-16 md:w-96" />
						<Skeleton className="h-5 w-full max-w-md rounded-sm" />
					</div>
				</div>
				<div className="w-full px-gutter pb-10 md:pb-16">
					<div className="flex gap-2 border-b border-border pb-2">
						<Skeleton className="h-11 w-28 rounded-full" />
						<Skeleton className="h-11 w-28 rounded-full" />
						<Skeleton className="h-11 w-28 rounded-full" />
					</div>
					<div className="flex gap-4 overflow-hidden pt-6 md:pt-8">
						{Array.from({ length: 3 }, (_, index) => (
							<div key={index} className="flex w-9/10 shrink-0 items-center gap-3 rounded-sm border border-border bg-card p-3 sm:w-7/12 lg:w-5/12">
								<Skeleton className="aspect-video w-32 shrink-0 rounded-sm sm:w-36" />
								<div className="flex min-w-0 flex-1 flex-col gap-2">
									<Skeleton className="h-4 w-3/4 rounded-sm" />
									<Skeleton className="h-3 w-1/2 rounded-sm" />
									<Skeleton className="h-3 w-1/3 rounded-sm" />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen mt-20 bg-background">
			{/* Header */}
			<div className="w-full px-gutter pt-8 pb-6 md:pt-12 md:pb-8">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
					<div className="max-w-2xl">
						<p className="font-mono text-caption uppercase tracking-label text-dim">
							{isSignedIn ? 'Library · Synced' : 'Library · On this device'}
						</p>
						{isMounted && isAuthenticated && greetingMessage ? (
							<h1 className="mt-3 text-title text-balance text-foreground">
								{greetingMessage}
							</h1>
						) : (
							<h1 className="mt-3 text-title text-balance text-foreground">
								Your Library
							</h1>
						)}
						<p className="mt-3 max-w-xl text-lede text-dim">
							{isSignedIn
								? 'Everything you saved, on every device you sign in on.'
								: 'Everything you saved, kept on this device.'}
						</p>
					</div>

					{!isSignedIn && (
						<div className="flex shrink-0 items-center gap-3">
							<Button asChild size="xl">
								<Link href="/auth/signin?callbackUrl=/library" prefetch={false}>
									<LogIn aria-hidden="true" />
									Sign in to sync
								</Link>
							</Button>
						</div>
					)}
				</div>
			</div>

			{/* Tabs */}
			<div className="w-full px-gutter pb-10 md:pb-16">
				<div className="border-b border-border">
					<div className="flex items-center gap-1 -mb-px" role="tablist" aria-label="Library sections" onKeyDown={handleTabKeyDown}>
						<TabButton
							active={activeTab === 'continue'}
							value="continue"
							onClick={setActiveTab}
							icon={<History className="h-4 w-4" />}
							label="Continue"
							count={counts.recent}
						/>
						<TabButton
							active={activeTab === 'watchlist'}
							value="watchlist"
							onClick={setActiveTab}
							icon={<Bookmark className="h-4 w-4" />}
							label="Watchlist"
							count={counts.watchlist}
						/>
						<TabButton
							active={activeTab === 'favorites'}
							value="favorites"
							onClick={setActiveTab}
							icon={<Heart className="h-4 w-4" />}
							label="Favorites"
							count={counts.favorites}
						/>
					</div>
				</div>

				{/* Tab Panels */}
				<div className="pt-6 md:pt-8" role="tabpanel" id="library-tabpanel" aria-labelledby={`library-tab-${activeTab}`}>
					{activeTab === 'continue' && (
						<section>
							<LibraryContinueWatching />
						</section>
					)}

					{activeTab === 'watchlist' && (
						<section>
							<LibraryWatchlist />
						</section>
					)}

					{activeTab === 'favorites' && (
						<section>
							<LibraryFavoritesSynced />
						</section>
					)}
				</div>
			</div>
		</div>
	);
}
