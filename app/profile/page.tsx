'use client';

import { useSession, signOut } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo } from 'react';
import Container from '@/components/shared/containers/container';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import useWatchListStore from '@/store/watchlistStore';
import useTVShowStore from '@/store/recentsStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useUserWatchlist, useUserFavorites, useUserRecentlyWatched } from '@/hooks/use-user-data';
import {
	Calendar,
	Clock,
	Film,
	Tv,
	Star,
	Heart,
	Bookmark,
	TrendingUp,
	User as UserIcon,
	Settings,
	LogOut,
	LayoutDashboard,
	Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchDetailsTMDB } from '@/lib/api';
import { Show } from '@/lib/types';
import MediaRow from '@/components/features/media/row/media-row';
import { WatchlistLoader } from '@/components/shared/loaders/watchlist-loader';
import { Button } from '@/components/ui/button';
import RecentlyWatchedComponent from '@/components/features/watchlist/recently-watched';

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
						<TrendingUp className="w-4 h-4" />
						<span className="text-xs font-semibold">+{trend}</span>
					</div>
				)}
			</div>
		</Card>
	);
}


function ProfileContentSection({
	title,
	children,
	isLoading,
	emptyMessage,
}: {
	title: string;
	children: React.ReactNode;
	isLoading?: boolean;
	emptyMessage?: string;
}) {
	if (isLoading) {
		return (
			<div className="space-y-2 md:space-y-3 lg:space-y-4">
				<h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3 lg:mb-4">
					{title}
				</h3>
				<WatchlistLoader />
			</div>
		);
	}

	return (
		<div className="space-y-2 md:space-y-3 lg:space-y-4">
			<h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3 lg:mb-4">
				{title}
			</h3>
			{children || (
				<div className="text-center py-6 md:py-8 lg:py-12 text-muted-foreground">
					<p className="text-xs md:text-sm">{emptyMessage || 'No content available'}</p>
				</div>
			)}
		</div>
	);
}

export default function ProfilePage() {
	const { data: session, isPending } = useSession();
	const router = useRouter();
	const { watchlist, tvwatchlist } = useWatchListStore();
	const { recentlyWatched } = useTVShowStore();
	const { favoriteMovies, favoriteTV } = useFavoritesStore();

	// Fetch data from database
	const { data: dbWatchlistMovies = [], isLoading: loadingWatchlistMovies } =
		useUserWatchlist('movie');
	const { data: dbWatchlistTV = [], isLoading: loadingWatchlistTV } = useUserWatchlist('tv');
	const { data: dbFavoritesMovies = [], isLoading: loadingFavoritesMovies } =
		useUserFavorites('movie');
	const { data: dbFavoritesTV = [], isLoading: loadingFavoritesTV } = useUserFavorites('tv');
	const { data: dbRecentlyWatched = [], isLoading: loadingRecentlyWatched } =
		useUserRecentlyWatched();

	const [watchlistMovies, setWatchlistMovies] = useState<Show[]>([]);
	const [watchlistTV, setWatchlistTV] = useState<Show[]>([]);
	const [favoritesMovies, setFavoritesMovies] = useState<Show[]>([]);
	const [favoritesTV, setFavoritesTV] = useState<Show[]>([]);
	const [isLoadingDetails, setIsLoadingDetails] = useState(false);

	useEffect(() => {
		if (!isPending && !session) {
			router.push('/auth/signin?callbackUrl=/profile');
		}
	}, [isPending, session, router]);

	// Fetch details for watchlist items
	useEffect(() => {
		const fetchWatchlistDetails = async () => {
			if (dbWatchlistMovies.length === 0 && dbWatchlistTV.length === 0) {
				setWatchlistMovies([]);
				setWatchlistTV([]);
				return;
			}

			setIsLoadingDetails(true);
			try {
				const moviePromises = dbWatchlistMovies.map(async (item: any) => {
					try {
						const data = await fetchDetailsTMDB(String(item.mediaId), 'movie');
						return { ...data, media_type: 'movie' };
					} catch (error) {
						console.error(`Failed to fetch watchlist movie ${item.mediaId}:`, error);
						return null;
					}
				});

				const tvPromises = dbWatchlistTV.map(async (item: any) => {
					try {
						const data = await fetchDetailsTMDB(String(item.mediaId), 'tv');
						return { ...data, media_type: 'tv' };
					} catch (error) {
						console.error(`Failed to fetch watchlist TV ${item.mediaId}:`, error);
						return null;
					}
				});

				const [movieResults, tvResults] = await Promise.all([
					Promise.all(moviePromises),
					Promise.all(tvPromises),
				]);

				setWatchlistMovies(movieResults.filter((item): item is Show => item !== null));
				setWatchlistTV(tvResults.filter((item): item is Show => item !== null));
			} catch (error) {
				console.error('Error fetching watchlist details:', error);
			} finally {
				setIsLoadingDetails(false);
			}
		};

		if (dbWatchlistMovies.length > 0 || dbWatchlistTV.length > 0) {
			fetchWatchlistDetails();
		}
	}, [dbWatchlistMovies, dbWatchlistTV]);

	// Fetch details for favorites
	useEffect(() => {
		const fetchFavoritesDetails = async () => {
			if (dbFavoritesMovies.length === 0 && dbFavoritesTV.length === 0) {
				setFavoritesMovies([]);
				setFavoritesTV([]);
				return;
			}

			setIsLoadingDetails(true);
			try {
				const moviePromises = dbFavoritesMovies.map(async (item: any) => {
					try {
						const data = await fetchDetailsTMDB(String(item.mediaId), 'movie');
						return { ...data, media_type: 'movie' };
					} catch (error) {
						console.error(`Failed to fetch favorite movie ${item.mediaId}:`, error);
						return null;
					}
				});

				const tvPromises = dbFavoritesTV.map(async (item: any) => {
					try {
						const data = await fetchDetailsTMDB(String(item.mediaId), 'tv');
						return { ...data, media_type: 'tv' };
					} catch (error) {
						console.error(`Failed to fetch favorite TV ${item.mediaId}:`, error);
						return null;
					}
				});

				const [movieResults, tvResults] = await Promise.all([
					Promise.all(moviePromises),
					Promise.all(tvPromises),
				]);

				setFavoritesMovies(movieResults.filter((item): item is Show => item !== null));
				setFavoritesTV(tvResults.filter((item): item is Show => item !== null));
			} catch (error) {
				console.error('Error fetching favorites details:', error);
			} finally {
				setIsLoadingDetails(false);
			}
		};

		if (dbFavoritesMovies.length > 0 || dbFavoritesTV.length > 0) {
			fetchFavoritesDetails();
		}
	}, [dbFavoritesMovies, dbFavoritesTV]);

	// Calculate totals and filtered data - must be before conditional returns
	const totalWatchlist =
		(watchlist?.length || 0) +
		(tvwatchlist?.length || 0) +
		dbWatchlistMovies.length +
		dbWatchlistTV.length;
	const totalWatched = (recentlyWatched?.length || 0) + dbRecentlyWatched.length;
	const totalFavorites =
		(favoriteMovies?.length || 0) +
		(favoriteTV?.length || 0) +
		dbFavoritesMovies.length +
		dbFavoritesTV.length;
	const totalMovies = (watchlist?.length || 0) + dbWatchlistMovies.length;
	const totalTV = (tvwatchlist?.length || 0) + dbWatchlistTV.length;

	const filteredWatchlistMovies = useMemo(() => {
		return watchlistMovies.filter((show: Show) => show.poster_path || show.backdrop_path);
	}, [watchlistMovies]);

	const filteredWatchlistTV = useMemo(() => {
		return watchlistTV.filter((show: Show) => show.poster_path || show.backdrop_path);
	}, [watchlistTV]);

	const filteredFavoritesMovies = useMemo(() => {
		return favoritesMovies.filter((show: Show) => show.poster_path || show.backdrop_path);
	}, [favoritesMovies]);

	const filteredFavoritesTV = useMemo(() => {
		return favoritesTV.filter((show: Show) => show.poster_path || show.backdrop_path);
	}, [favoritesTV]);

	// Conditional returns must come after all hooks
	if (isPending) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
			</div>
		);
	}

	if (!session) {
		return null;
	}

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
						{/* Decorative gradient overlay */}
						<div className="absolute inset-0 bg-gradient-to-r from-foreground/[0.02] via-transparent to-foreground/[0.02] pointer-events-none" />

						<div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-4 md:gap-6 lg:gap-8">
							<div className="relative">
								<Avatar className="h-20 w-20 md:h-28 md:w-28 lg:h-32 lg:w-32 border-4 border-border/50 shadow-2xl">
									<AvatarImage
										src={session.user?.image || ''}
										alt={session.user?.name || 'User'}
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
											<Settings className="w-4 h-4 mr-2" />
											Settings
										</Button>
										<Button
											variant="outline"
											size="sm"
											className="border-red-500/20 hover:bg-red-500/10 hover:border-red-500/40 text-red-400"
											onClick={() => signOut({ callbackUrl: '/' })}
										>
											<LogOut className="w-4 h-4 mr-2" />
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
							icon={<Bookmark className="w-6 h-6 text-foreground" />}
							value={totalWatchlist}
							label="In Watchlist"
						/>
						<StatCard
							icon={<Clock className="w-6 h-6 text-foreground" />}
							value={totalWatched}
							label="Recently Watched"
						/>
						<StatCard
							icon={<Heart className="w-6 h-6 text-foreground" />}
							value={totalFavorites}
							label="Favorites"
						/>
						<StatCard
							icon={<Film className="w-6 h-6 text-foreground" />}
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
									<LayoutDashboard className="h-5 w-5 text-foreground" />
								</div>
								<h2 className="text-xl md:text-2xl font-bold text-foreground">Overview</h2>
							</div>
							<div className="space-y-3 md:space-y-4 lg:space-y-6">
								{recentlyWatched && recentlyWatched.length > 0 && (
									<div className="space-y-2 md:space-y-3">
										<RecentlyWatchedComponent />
									</div>
								)}
								<div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 lg:gap-4">
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-center">
										<Film className="w-5 h-5 text-foreground mx-auto mb-2" />
										<p className="text-xl md:text-2xl font-bold text-foreground">{totalMovies}</p>
										<p className="text-xs text-muted-foreground">Movies</p>
									</Card>
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-center">
										<Tv className="w-5 h-5 text-foreground mx-auto mb-2" />
										<p className="text-xl md:text-2xl font-bold text-foreground">{totalTV}</p>
										<p className="text-xs text-muted-foreground">TV Shows</p>
									</Card>
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-center">
										<Star className="w-5 h-5 text-foreground mx-auto mb-2" />
										<p className="text-xl md:text-2xl font-bold text-foreground">{totalFavorites}</p>
										<p className="text-xs text-muted-foreground">Favorites</p>
									</Card>
									<Card className="bg-foreground/[0.03] border-border/50 p-3 md:p-4 text-center">
										<Calendar className="w-5 h-5 text-foreground mx-auto mb-2" />
										<p className="text-xl md:text-2xl font-bold text-foreground">{totalWatched}</p>
										<p className="text-xs text-muted-foreground">Watched</p>
									</Card>
								</div>
							</div>
						</div>

						{/* Watchlist Section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.08]">
									<Bookmark className="h-5 w-5 text-foreground" />
								</div>
								<h2 className="text-xl md:text-2xl font-bold text-foreground">Watchlist</h2>
							</div>
							<div className="space-y-3 md:space-y-4">
								{loadingWatchlistMovies || loadingWatchlistTV || isLoadingDetails ? (
									<WatchlistLoader />
								) : (
									<>
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
											filteredWatchlistTV.length === 0 &&
											!isLoadingDetails && (
												<div className="text-center py-6 md:py-8 text-muted-foreground">
													<Bookmark className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
													<p className="text-sm">Your watchlist is empty</p>
													<p className="text-xs mt-2">
														Start adding movies and shows to your watchlist!
													</p>
												</div>
											)}
									</>
								)}
							</div>
						</div>

						{/* Favorites Section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.08]">
									<Heart className="h-5 w-5 text-foreground" />
								</div>
								<h2 className="text-xl md:text-2xl font-bold text-foreground">Favorites</h2>
							</div>
							<div className="space-y-3 md:space-y-4">
								{loadingFavoritesMovies || loadingFavoritesTV || isLoadingDetails ? (
									<WatchlistLoader />
								) : (
									<>
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
											filteredFavoritesTV.length === 0 &&
											!isLoadingDetails && (
												<div className="text-center py-6 md:py-8 text-muted-foreground">
													<Heart className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
													<p className="text-sm">No favorites yet</p>
													<p className="text-xs mt-2">
														Start adding your favorite movies and shows!
													</p>
												</div>
											)}
									</>
								)}
							</div>
						</div>

						{/* Recently Watched Section */}
						<div className="space-y-3 md:space-y-4">
							<div className="flex items-center gap-3">
								<div className="flex h-9 w-9 items-center justify-center rounded-xl bg-foreground/[0.08]">
									<Eye className="h-5 w-5 text-foreground" />
								</div>
								<h2 className="text-xl md:text-2xl font-bold text-foreground">Recently Watched</h2>
							</div>
							<div className="space-y-3 md:space-y-4">
								{loadingRecentlyWatched ? (
									<WatchlistLoader />
								) : (
									<>
										{recentlyWatched && recentlyWatched.length > 0 && (
											<RecentlyWatchedComponent />
										)}
										{(!recentlyWatched || recentlyWatched.length === 0) &&
											!loadingRecentlyWatched && (
												<div className="text-center py-6 md:py-8 text-muted-foreground">
													<Clock className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-3 md:mb-4 opacity-50" />
													<p className="text-sm">No recent activity</p>
													<p className="text-xs mt-2">
														Start watching to see your recent activity here!
													</p>
												</div>
											)}
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</Container>
		</div>
	);
}
