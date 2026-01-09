'use client'

import * as React from 'react'
import Link from 'next/link'
import { useSession } from '@/lib/auth-client'
import Container from '@/components/shared/containers/container'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import { Bookmark, Heart, History, LogIn, User } from 'lucide-react'

import { LibraryWatchlist } from '@/components/features/watchlist/library-watchlist'
import { MyFavorites } from '@/components/features/watchlist/my-favorites'
import RecentlyWatchedComponent from '@/components/features/watchlist/recently-watched'
import { useUserFavorites, useUserRecentlyWatched, useUserWatchlist } from '@/hooks/use-user-data'

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

function SignInFirst() {
	return (
		<div className="min-h-screen mt-20 bg-background">
			<div className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950 border-b border-white/5">
				<Container className="relative py-10 md:py-14">
					<div className="max-w-3xl">
						<p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em]">
							Library
						</p>
						<h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
							Sign in first
						</h1>
						<p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
							Your Library keeps your watchlist, favorites, and continue-watching progress synced
							across devices.
						</p>
						<div className="mt-6 flex flex-wrap items-center gap-3">
							<Button asChild className="gap-2">
								<Link href="/auth/signin?callbackUrl=/library">
									<LogIn className="h-4 w-4" />
									Sign in
								</Link>
							</Button>
							<Button asChild variant="outline" className="gap-2">
								<Link href="/auth/signin?callbackUrl=/profile">
									<User className="h-4 w-4" />
									Account
								</Link>
							</Button>
						</div>
					</div>
				</Container>
			</div>

			<Container className="py-8 md:py-12">
				<div className="grid gap-3 sm:grid-cols-3">
					<LibraryStatCard
						label="Watchlist"
						value={0}
						icon={<Bookmark className="h-5 w-5 text-foreground" />}
					/>
					<LibraryStatCard
						label="Favorites"
						value={0}
						icon={<Heart className="h-5 w-5 text-foreground" />}
					/>
					<LibraryStatCard
						label="Continue watching"
						value={0}
						icon={<History className="h-5 w-5 text-foreground" />}
					/>
				</div>
			</Container>
		</div>
	)
}

export default function LibraryPage() {
	const { data: session, isPending } = useSession()

	// DB-backed counts (only enabled when signed in)
	const { data: dbWatchlistMovies = [] } = useUserWatchlist('movie')
	const { data: dbWatchlistTV = [] } = useUserWatchlist('tv')
	const { data: dbFavoritesMovies = [] } = useUserFavorites('movie')
	const { data: dbFavoritesTV = [] } = useUserFavorites('tv')
	const { data: dbRecentlyWatched = [] } = useUserRecentlyWatched()

	const counts = React.useMemo(() => {
		return {
			watchlist: dbWatchlistMovies.length + dbWatchlistTV.length,
			favorites: dbFavoritesMovies.length + dbFavoritesTV.length,
			recent: dbRecentlyWatched.length
		}
	}, [dbWatchlistMovies.length, dbWatchlistTV.length, dbFavoritesMovies.length, dbFavoritesTV.length, dbRecentlyWatched.length])

	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
			</div>
		)
	}

	if (!session) return <SignInFirst />

	return (
		<div className="min-h-screen mt-20 bg-background">
			<div className="relative w-full overflow-hidden bg-gradient-to-b from-zinc-950 via-zinc-950/95 to-zinc-950 border-b border-white/5">
				<Container className="relative py-10 md:py-14">
					<div className="max-w-4xl">
						<p className="text-[11px] font-semibold text-muted-foreground/60 uppercase tracking-[0.18em]">
							Library
						</p>
						<h1 className="mt-2 text-3xl md:text-5xl font-bold tracking-tight text-foreground">
							Your Library
						</h1>
						<p className="mt-3 text-sm md:text-base text-muted-foreground max-w-2xl">
							Everything you saved in one place: watchlist, favorites, and continue-watching.
						</p>
					</div>
				</Container>
			</div>

			<Container className="py-8 md:py-12">
				<div className="grid gap-3 sm:grid-cols-3">
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

				<Card className="mt-6 bg-background/40 backdrop-blur-xl border-border/50">
					<div className="p-4 md:p-6">
						<Tabs defaultValue="continue" className="w-full">
							<TabsList className="w-full justify-start bg-transparent border border-border/50 rounded-xl p-1">
								<TabsTrigger value="continue" className="gap-2">
									<History className="h-4 w-4" />
									Continue watching
								</TabsTrigger>
								<TabsTrigger value="watchlist" className="gap-2">
									<Bookmark className="h-4 w-4" />
									Watchlist
								</TabsTrigger>
								<TabsTrigger value="favorites" className="gap-2">
									<Heart className="h-4 w-4" />
									Favorites
								</TabsTrigger>
							</TabsList>

							<TabsContent value="continue" className="mt-6">
								{counts.recent > 0 ? (
									<RecentlyWatchedComponent />
								) : (
									<div className="flex flex-col items-center justify-center py-16 space-y-4">
										<div className="w-16 h-16 rounded-full bg-zinc-900 flex items-center justify-center mb-2">
											<History className="w-8 h-8 text-zinc-600" />
										</div>
										<h3 className="text-xl font-bold text-foreground">No recent activity</h3>
										<p className="text-muted-foreground text-center max-w-md">
											Start watching a show or movie and it will show up here so you can resume
											instantly.
										</p>
									</div>
								)}
							</TabsContent>

							<TabsContent value="watchlist" className="mt-6">
								<LibraryWatchlist />
							</TabsContent>

							<TabsContent value="favorites" className="mt-6">
								<MyFavorites />
							</TabsContent>
						</Tabs>
					</div>
				</Card>
			</Container>
		</div>
	)
}

