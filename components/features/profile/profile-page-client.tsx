'use client';

import { signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import Container from '@/components/shared/containers/container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import {
	CalendarIcon,
	ClockIcon,
	FilmSlateIcon,
	TelevisionIcon,
	StarIcon,
	HeartIcon,
	BookmarkSimpleIcon,
	UserIcon,
	GearIcon,
	SignOutIcon,
	SquaresFourIcon,
	EyeIcon,
	TrendUpIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Show } from '@/lib/types';
import MediaRow from '@/components/features/media/row/media-row';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePlayerPrefsStore } from '@/store/playerPrefsStore';
import RecentlyWatchedComponent from '@/components/features/watchlist/recently-watched';
import type { Session } from '@/lib/auth';

interface StatCardProps {
	icon: React.ReactNode;
	value: number;
	label: string;
	trend?: number;
	className?: string;
}

function StatCard({ icon, value, label, trend, className }: StatCardProps) {
	return (
		<Card
			className={cn(
				'bg-background/40 backdrop-blur-xl border-border/50 p-3 md:p-4 lg:p-6',
				'hover:border-border/80 transition-all duration-300 hover:shadow-lg',
				className
			)}
		>
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2 md:gap-3 lg:gap-4">
					<div className="p-2 md:p-2.5 lg:p-3 rounded-xl bg-foreground/[0.08] border border-border/50">
						{icon}
					</div>
					<div>
						<p className="text-xl md:text-2xl lg:text-3xl font-bold text-foreground mb-0.5 md:mb-1">
							{value}
						</p>
						<p className="text-xs md:text-sm text-muted-foreground font-medium">
							{label}
						</p>
					</div>
				</div>
				{trend !== undefined && trend > 0 && (
					<div className="flex items-center gap-1 text-green-500">
						<TrendUpIcon className="w-4 h-4" />
						<span className="text-xs font-semibold">+{trend}</span>
					</div>
				)}
			</div>
		</Card>
	);
}

interface ProfilePageClientProps {
	session: Session;
}

export default function ProfilePageClient({ session }: ProfilePageClientProps) {
	const router = useRouter();
	const watchlist = useWatchListStore((s) => s.watchlist);
	const tvwatchlist = useWatchListStore((s) => s.tvwatchlist);
	const recentlyWatched = useTVShowStore((s) => s.recentlyWatched);
	const favoriteMovies = useFavoritesStore((s) => s.favoriteMovies);
	const favoriteTV = useFavoritesStore((s) => s.favoriteTV);
	const stickyEnabled = usePlayerPrefsStore((s) => s.stickyEnabled);
	const setStickyEnabled = usePlayerPrefsStore((s) => s.setStickyEnabled);

	const totalWatchlist = (watchlist?.length || 0) + (tvwatchlist?.length || 0);
	const totalWatched = recentlyWatched?.length || 0;
	const totalFavorites = (favoriteMovies?.length || 0) + (favoriteTV?.length || 0);
	const totalMovies = watchlist?.length || 0;
	const totalTV = tvwatchlist?.length || 0;

	const filteredWatchlistMovies = useMemo(() => {
		return watchlist.filter((show) => show.poster_path || show.backdrop_path) as Show[];
	}, [watchlist]);

	const filteredWatchlistTV = useMemo(() => {
		return tvwatchlist.filter((show) => show.poster_path || show.backdrop_path) as Show[];
	}, [tvwatchlist]);

	const filteredFavoritesMovies = useMemo(() => {
		return favoriteMovies.filter((show) => show.poster_path || show.backdrop_path) as Show[];
	}, [favoriteMovies]);

	const filteredFavoritesTV = useMemo(() => {
		return favoriteTV.filter((show) => show.poster_path || show.backdrop_path) as Show[];
	}, [favoriteTV]);

	const userInitials =
		session.user?.name
			?.split(' ')
			.map((n) => n[0])
			.join('')
			.toUpperCase()
			.slice(0, 2) || 'U';

	return (
		<div className="min-h-screen mt-20 bg-background">
			<Container className="py-4 md:py-8 lg:py-12">
				<div className="max-w-7xl mx-auto space-y-4 md:space-y-6 lg:space-y-8">
					{/* Profile Header */}
					<Card className="bg-background/40 backdrop-blur-2xl border-border/50 p-4 md:p-6 lg:p-10 relative overflow-hidden">
						<div className="absolute inset-0 bg-gradient-to-r from-foreground/[0.02] via-transparent to-foreground/[0.02] pointer-events-none" />

						<div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 lg:gap-8">
							<div className="relative">
								<Avatar className="h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-border/50 shadow-2xl">
									<AvatarImage
										src={session.user?.image || ''}
										alt={session.user?.name || 'User avatar'}
										className="object-cover"
									/>
									<AvatarFallback className="bg-foreground/[0.08] text-foreground text-2xl md:text-3xl lg:text-4xl font-bold">
										{userInitials}
									</AvatarFallback>
								</Avatar>
								<div className="absolute -bottom-1 -right-1 md:-bottom-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 bg-green-500 rounded-full border-2 md:border-4 border-background flex items-center justify-center">
									<div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full" />
								</div>
							</div>

							<div className="flex-1 text-center md:text-left w-full">
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4 mb-3 md:mb-4">
									<div>
										<h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-1 md:mb-2">
											{session.user?.name || 'User'}
										</h1>
										<p className="text-muted-foreground text-sm md:text-base flex items-center justify-center md:justify-start gap-2">
											<UserIcon className="w-4 h-4" />
											{session.user?.email}
										</p>
									</div>
									<div className="flex items-center gap-2 justify-center md:justify-end">
										<Button
											variant="outline"
											size="sm"
											className="border-border/50 hover:bg-foreground/[0.03]"
											onClick={() => router.push('/')}
										>
											<GearIcon className="w-4 h-4 mr-2" />
											Settings
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 text-red-400"
											onClick={async () => {
												await signOut();
												router.push('/');
											}}
										>
											<SignOutIcon className="w-4 h-4 mr-2" />
											Sign Out
										</Button>
									</div>
								</div>

								<div className="flex flex-wrap items-center gap-2 justify-center md:justify-start">
									<span className="px-4 py-1.5 rounded-full bg-foreground/[0.06] border border-border/50 text-foreground text-xs font-semibold">
										Premium Member
									</span>
									<span className="px-4 py-1.5 rounded-full bg-foreground/[0.03] border border-border/50 text-muted-foreground text-xs font-medium">
										Active Since {new Date().getFullYear()}
									</span>
								</div>
							</div>
						</div>
					</Card>

					{/* Stats Grid */}
					<div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 lg:gap-6">
						<StatCard
							icon={<BookmarkSimpleIcon className="w-6 h-6 text-foreground" />}
							value={totalWatchlist}
							label="In Watchlist"
						/>
						<StatCard
							icon={<ClockIcon className="w-6 h-6 text-foreground" />}
							value={totalWatched}
							label="Recently Watched"
						/>
						<StatCard
							icon={<HeartIcon className="w-6 h-6 text-foreground" />}
							value={totalFavorites}
							label="Favorites"
						/>
						<StatCard
							icon={<FilmSlateIcon className="w-6 h-6 text-foreground" />}
							value={totalMovies + totalTV}
							label="Total Content"
						/>
					</div>

					{/* Content Sections */}
					<div className="space-y-6 md:space-y-8">
						{/* Overview Section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.08]">
									<SquaresFourIcon className="h-5 w-5 text-foreground" />
								</div>
								<h2 className="text-xl md:text-2xl font-bold text-foreground">
									Overview
								</h2>
							</div>
							<div className="space-y-3 md:space-y-4 lg:space-y-6">
								{recentlyWatched && recentlyWatched.length > 0 && (
									<div className="space-y-2 md:space-y-3">
										<RecentlyWatchedComponent />
									</div>
								)}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-left">
										<div className="flex items-center justify-between">
											<div>
												<p className="text-xs text-muted-foreground">
													Sticky Player
												</p>
												<p className="text-sm font-semibold text-foreground">
													{stickyEnabled ? 'On' : 'Off'}
												</p>
											</div>
											<Switch
												checked={stickyEnabled}
												onCheckedChange={setStickyEnabled}
												className="data-[state=checked]:bg-primary"
											/>
										</div>
									</Card>
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-center">
										<FilmSlateIcon className="w-5 h-5 text-foreground mx-auto mb-2" />
										<p className="text-xl md:text-2xl font-bold text-foreground">
											{totalMovies}
										</p>
										<p className="text-xs text-muted-foreground">Movies</p>
									</Card>
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-center">
										<TelevisionIcon className="w-5 h-5 text-foreground mx-auto mb-2" />
										<p className="text-xl md:text-2xl font-bold text-foreground">
											{totalTV}
										</p>
										<p className="text-xs text-muted-foreground">TV Shows</p>
									</Card>
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-center">
										<StarIcon className="w-5 h-5 text-foreground mx-auto mb-2" />
										<p className="text-xl md:text-2xl font-bold text-foreground">
											{totalFavorites}
										</p>
										<p className="text-xs text-muted-foreground">Favorites</p>
									</Card>
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-center">
										<CalendarIcon className="w-5 h-5 text-foreground mx-auto mb-2" />
										<p className="text-xl md:text-2xl font-bold text-foreground">
											{totalWatched}
										</p>
										<p className="text-xs text-muted-foreground">Watched</p>
									</Card>
								</div>
							</div>
						</div>

						{/* Watchlist Section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.08]">
									<BookmarkSimpleIcon className="h-5 w-5 text-foreground" />
								</div>
								<h2 className="text-xl md:text-2xl font-bold text-foreground">
									Watchlist
								</h2>
							</div>
							<div className="space-y-3 md:space-y-4">
								{filteredWatchlistMovies.length > 0 && (
									<MediaRow
										isVertical={false}
										text="Movies"
										shows={filteredWatchlistMovies}
										type="movie"
									/>
								)}
								{filteredWatchlistTV.length > 0 && (
									<div className="mt-3 md:mt-4">
										<MediaRow
											isVertical={false}
											text="TV Shows"
											shows={filteredWatchlistTV}
											type="tv"
										/>
									</div>
								)}
								{filteredWatchlistMovies.length === 0 &&
									filteredWatchlistTV.length === 0 && (
										<div className="text-center py-6 md:py-8 text-muted-foreground">
											<BookmarkSimpleIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
											<p className="text-sm">Your watchlist is empty</p>
											<p className="text-xs mt-2">
												Start adding movies and shows to your watchlist!
											</p>
										</div>
									)}
							</div>
						</div>

						{/* Favorites Section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.08]">
									<HeartIcon className="h-5 w-5 text-foreground" />
								</div>
								<h2 className="text-xl md:text-2xl font-bold text-foreground">
									Favorites
								</h2>
							</div>
							<div className="space-y-3 md:space-y-4">
								{filteredFavoritesMovies.length > 0 && (
									<MediaRow
										isVertical={false}
										text="Favorite Movies"
										shows={filteredFavoritesMovies}
										type="movie"
									/>
								)}
								{filteredFavoritesTV.length > 0 && (
									<div className="mt-3 md:mt-4">
										<MediaRow
											isVertical={false}
											text="Favorite TV Shows"
											shows={filteredFavoritesTV}
											type="tv"
										/>
									</div>
								)}
								{filteredFavoritesMovies.length === 0 &&
									filteredFavoritesTV.length === 0 && (
										<div className="text-center py-6 md:py-8 text-muted-foreground">
											<HeartIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
											<p className="text-sm">No favorites yet</p>
											<p className="text-xs mt-2">
												Start adding your favorite movies and shows!
											</p>
										</div>
									)}
							</div>
						</div>

						{/* Recently Watched Section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.08]">
									<EyeIcon className="h-5 w-5 text-foreground" />
								</div>
								<h2 className="text-xl md:text-2xl font-bold text-foreground">
									Recently Watched
								</h2>
							</div>
							<div className="space-y-3 md:space-y-4">
								<>
									{recentlyWatched && recentlyWatched.length > 0 && (
										<RecentlyWatchedComponent />
									)}
									{(!recentlyWatched || recentlyWatched.length === 0) && (
										<div className="text-center py-6 md:py-8 text-muted-foreground">
											<ClockIcon className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
											<p className="text-sm">No recent activity</p>
											<p className="text-xs mt-2">
												Start watching to see your recent activity here!
											</p>
										</div>
									)}
								</>
							</div>
						</div>
					</div>
				</div>
			</Container>
		</div>
	);
}
