'use client';

import * as React from 'react';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import Container from '@/components/shared/containers/container';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
	Bookmark,
	Heart,
	History,
	LogIn,
	Clapperboard,
	Sparkles,
} from 'lucide-react';

import { LibraryWatchlist } from '@/components/features/watchlist/library-watchlist';
import { LibraryContinueWatching } from '@/components/features/watchlist/library-continue-watching';
import { LibraryFavoritesSynced } from '@/components/features/watchlist/library-favorites-synced';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { usePersonalizedGreeting } from '@/hooks/use-personalized-greeting';

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
			onClick={() => onClick(value)}
			className={cn(
				'relative flex items-center gap-2 px-3 py-2.5 md:px-4 md:py-3',
				'text-sm font-medium transition-colors duration-200',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black',
				active
					? 'text-foreground'
					: 'text-muted-foreground/60 hover:text-muted-foreground'
			)}
			aria-selected={active}
			role="tab"
		>
			{icon}
			<span className="hidden sm:inline">{label}</span>
			{count > 0 && (
				<span
					className={cn(
						'inline-flex items-center justify-center',
						'min-w-[1.25rem] h-5 px-1 rounded-full text-[11px] font-semibold tabular-nums',
						active
							? 'bg-white/[0.10] text-foreground'
							: 'bg-white/[0.06] text-muted-foreground/70'
					)}
				>
					{count > 99 ? '99+' : count}
				</span>
			)}
			{active && (
				<span className="absolute bottom-0 left-2 right-2 h-[2px] bg-foreground rounded-full" />
			)}
		</button>
	);
}

export default function LibraryPage() {
	const { data: session, isPending } = useSession();
	const watchlist = useWatchListStore((s) => s.watchlist);
	const tvwatchlist = useWatchListStore((s) => s.tvwatchlist);
	const favoriteMovies = useFavoritesStore((s) => s.favoriteMovies);
	const favoriteTV = useFavoritesStore((s) => s.favoriteTV);
	const recentlyWatched = useTVShowStore((s) => s.recentlyWatched);
	const { message: greetingMessage, isAuthenticated } = usePersonalizedGreeting();
	const isSignedIn = Boolean(session?.user?.id);

	const [activeTab, setActiveTab] = React.useState<TabValue>('continue');

	// Counts from the same stores the sub-components render from
	const counts = React.useMemo(() => {
		const watchlistItems = (watchlist?.length || 0) + (tvwatchlist?.length || 0);
		const favoritesItems = (favoriteMovies?.length || 0) + (favoriteTV?.length || 0);
		const recentItems = recentlyWatched?.length || 0;
		return {
			watchlist: watchlistItems,
			favorites: favoritesItems,
			recent: recentItems,
		};
	}, [watchlist, tvwatchlist, favoriteMovies, favoriteTV, recentlyWatched]);

	// Auto-switch to the first non-empty tab once on initial load only
	const didAutoSwitch = React.useRef(false);
	React.useEffect(() => {
		if (didAutoSwitch.current || isPending) return;
		if (counts.recent === 0 && activeTab === 'continue') {
			if (counts.watchlist > 0) {
				setActiveTab('watchlist');
				didAutoSwitch.current = true;
			} else if (counts.favorites > 0) {
				setActiveTab('favorites');
				didAutoSwitch.current = true;
			} else {
				didAutoSwitch.current = true;
			}
		} else {
			didAutoSwitch.current = true;
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [counts.recent, counts.watchlist, counts.favorites, isPending]);

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
			</div>
		);
	}

	return (
		<div className="min-h-screen mt-20 bg-background">
			{/* Header */}
			<Container className="pt-8 pb-6 md:pt-12 md:pb-8">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
					<div className="max-w-2xl">
						<div className="flex items-center gap-2 text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-[0.2em]">
							<Clapperboard className="h-3.5 w-3.5" />
							<span>{isSignedIn ? 'Library · Synced' : 'Library · Local'}</span>
						</div>
						{isAuthenticated && greetingMessage ? (
							<h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
								{greetingMessage}
							</h1>
						) : (
							<h1 className="mt-3 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
								Your Library
							</h1>
						)}
						<p className="mt-3 text-sm md:text-base text-muted-foreground max-w-xl leading-relaxed">
							Everything you saved in one place.
							{isSignedIn
								? ' Synced across your devices.'
								: ' Stored on this device.'}
						</p>
					</div>

					{!isSignedIn && (
						<div className="flex items-center gap-3 shrink-0">
							<Button
								asChild
								className="gap-2 rounded-lg h-10 px-4"
							>
								<Link href="/auth/signin?callbackUrl=/library">
									<LogIn className="h-4 w-4" />
									Sign in to sync
								</Link>
							</Button>
						</div>
					)}

					{isSignedIn && (
						<div className="flex items-center gap-2 text-xs text-muted-foreground/60 shrink-0">
							<Sparkles className="h-3.5 w-3.5" />
							<span>Synced across devices</span>
						</div>
					)}
				</div>
			</Container>

			{/* Tabs */}
			<Container className="pb-10 md:pb-16">
				<div className="border-b border-white/[0.06]">
					<div className="flex items-center gap-1 -mb-px">
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
				<div className="pt-6 md:pt-8" role="tabpanel">
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
			</Container>
		</div>
	);
}
