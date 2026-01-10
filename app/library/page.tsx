'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import Container from '@/components/shared/containers/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Bookmark, Heart, History, LogIn } from 'lucide-react'

import { LibraryWatchlist } from '@/components/features/watchlist/library-watchlist'
import { LibraryContinueWatching } from '@/components/features/watchlist/library-continue-watching'
import { LibraryFavoritesSynced } from '@/components/features/watchlist/library-favorites-synced'
import { useUserFavorites, useUserRecentlyWatched, useUserWatchlist } from '@/hooks/use-user-data'
import useWatchListStore from '@/store/watchlistStore'
import useTVShowStore from '@/store/recentsStore'
import { useFavoritesStore } from '@/store/favoritesStore'
import { usePersonalizedGreeting } from '@/hooks/use-personalized-greeting'

interface LibraryStatCardProps {
	label: string
	value: number
	icon: React.ReactNode
	className?: string
}

function LibraryStatCard({ label, value, icon, className }: LibraryStatCardProps) {
	return (
		<Card
			className={cn(
				'bg-background/40 backdrop-blur-xl border-border/50 p-4',
				'hover:border-border/80 transition-all duration-300 hover:shadow-lg',
				className
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<div className="flex items-center gap-3">
					<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-foreground/[0.08] border border-border/50">
						{icon}
					</div>
					<div className="min-w-0">
						<p className="text-2xl font-bold text-foreground leading-tight">{value}</p>
						<p className="text-xs text-muted-foreground font-medium">{label}</p>
					</div>
				</div>
			</div>
		</Card>
	)
}

export default function LibraryPage() {
	const { data: session, isPending } = useSession()
	const { watchlist, tvwatchlist } = useWatchListStore()
	const { favoriteMovies, favoriteTV } = useFavoritesStore()
	const { recentlyWatched } = useTVShowStore()
	const { message: greetingMessage, isAuthenticated } = usePersonalizedGreeting()
	const isSignedIn = Boolean(session?.user?.id)

	// DB-backed counts (only enabled when signed in)
	const { data: dbWatchlistMovies = [] } = useUserWatchlist('movie')
	const { data: dbWatchlistTV = [] } = useUserWatchlist('tv')
	const { data: dbFavoritesMovies = [] } = useUserFavorites('movie')
	const { data: dbFavoritesTV = [] } = useUserFavorites('tv')
	const { data: dbRecentlyWatched = [] } = useUserRecentlyWatched()

	const counts = React.useMemo(() => {
		const localCounts = {
			watchlist: (watchlist?.length || 0) + (tvwatchlist?.length || 0),
			favorites: (favoriteMovies?.length || 0) + (favoriteTV?.length || 0),
			recent: recentlyWatched?.length || 0
		}

		return {
			watchlist: isSignedIn ? dbWatchlistMovies.length + dbWatchlistTV.length : localCounts.watchlist,
			favorites: isSignedIn ? dbFavoritesMovies.length + dbFavoritesTV.length : localCounts.favorites,
			recent: isSignedIn ? dbRecentlyWatched.length : localCounts.recent
		}
	}, [
		isSignedIn,
		dbWatchlistMovies.length,
		dbWatchlistTV.length,
		dbFavoritesMovies.length,
		dbFavoritesTV.length,
		dbRecentlyWatched.length,
		watchlist,
		tvwatchlist,
		favoriteMovies,
		favoriteTV,
		recentlyWatched
	])

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
			</div>
		)
	}

	return (
		<div className="min-h-screen mt-20 bg-background">
			<div className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950 border-b border-white/5">
				<Container className="relative py-10 md:py-14">
					<div className="max-w-4xl">
						<p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em]">
							{isSignedIn ? 'Library · Synced' : 'Library · Local mode'}
						</p>
						{isAuthenticated && greetingMessage ? (
							<h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
								{greetingMessage}
							</h1>
						) : (
							<h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
								Your Library
							</h1>
						)}
						<p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
							Everything you saved in one place: watchlist, favorites, and continue-watching.
							{isSignedIn ? ' Synced across devices.' : ' Stored on this device.'}
						</p>
						{!isSignedIn && (
							<div className="mt-6 flex flex-wrap items-center gap-3">
								<Button asChild className="gap-2">
									<Link href="/auth/signin?callbackUrl=/library">
										<LogIn className="h-4 w-4" />
										Sign in to sync
									</Link>
								</Button>
								<p className="text-xs text-muted-foreground/70">
									Signing in keeps your Library across devices.
								</p>
							</div>
						)}
					</div>
				</Container>
			</div>

			<Container className="py-8 md:py-12">
				<div className="grid gap-3 sm:grid-cols-3 mb-8">
					<LibraryStatCard
						label="Watchlist"
						value={counts.watchlist}
						icon={<Bookmark className="h-5 w-5 text-foreground" />}
					/>
					<LibraryStatCard
						label="Favorites"
						value={counts.favorites}
						icon={<Heart className="h-5 w-5 text-foreground" />}
					/>
					<LibraryStatCard
						label="Continue watching"
						value={counts.recent}
						icon={<History className="h-5 w-5 text-foreground" />}
					/>
				</div>

				{/* Continue Watching Section */}
				<div className="mb-12">
					<Card className="bg-background/40 backdrop-blur-xl border-border/50">
						<div className="p-4 md:p-6">
							<LibraryContinueWatching />
						</div>
					</Card>
				</div>

				{/* Watchlist Section */}
				<div className="mb-12">
					<Card className="bg-background/40 backdrop-blur-xl border-border/50">
						<div className="p-4 md:p-6">
							<LibraryWatchlist />
						</div>
					</Card>
				</div>

				{/* Favorites Section */}
				<div className="mb-12">
					<Card className="bg-background/40 backdrop-blur-xl border-border/50">
						<div className="p-4 md:p-6">
							<LibraryFavoritesSynced />
						</div>
					</Card>
				</div>
			</Container>
		</div>
	)
}

