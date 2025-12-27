import WatchList from '@/components/features/watchlist/watch-list';
import RecentlyWatched from '@/components/features/watchlist/recently-watched';
import { fetchRowData, fetchHeroItemsWithDetails } from '@/lib/api';
import Container from '@/components/shared/containers/container';
import { Show } from '@/lib/types';
import HeroCarousel from '@/components/features/media/carousel/hero-carousel';
import { HomeRow } from '@/components/features/media/row/home-row';
import RowLoader from '@/components/shared/loaders/row-loader';
import { Suspense } from 'react';

export const revalidate = 604800;

export default async function HomePage() {
	try {
		// Phase 1: Fetch hero data and first 2-3 rows server-side for instant loading
		const [trendingTV, trendingMovies, tvPopular, tvOnTheAir, movieNowPlaying] = await Promise.all([
			fetchRowData('trending/tv/week'),
			fetchRowData('trending/movie/week'),
			fetchRowData('tv/popular'),
			fetchRowData('tv/on_the_air'),
			fetchRowData('movie/now_playing'),
		]);

		const allTrending = [...(trendingTV || []), ...(trendingMovies || [])].filter(Boolean);
		const basicHeroShows = allTrending.filter((show: Show) => show?.backdrop_path).slice(0, 10);

		// Fetch full details (with logos) for hero items
		const heroShows = await fetchHeroItemsWithDetails(basicHeroShows, 'tv', 10);

		return (
			<div className="min-h-screen bg-background text-foreground pb-20">
					<HeroCarousel shows={heroShows} type="tv" />

				<Container className="w-full">
				<div className="flex flex-col space-y-4 md:space-y-6">
						<RecentlyWatched />
						<WatchList type="movie" />
						<WatchList type="tv" />

						{/* Pre-fetched rows - no Suspense needed since data is already available */}
						<HomeRow
							endpoint="trending/tv/week"
							text="Binge-Worthy Series"
							type="tv"
							viewAllLink="/browse/binge-worthy-series"
							initialData={trendingTV}
						/>

						<HomeRow
							endpoint="tv/popular"
							text="Crowd Favorites: TV"
							type="tv"
							viewAllLink="/browse/crowd-favorites-tv"
							initialData={tvPopular}
						/>

						<HomeRow
							endpoint="tv/on_the_air"
							text="Airing This Week"
							type="tv"
							viewAllLink="/browse/airing-this-week"
							initialData={tvOnTheAir}
						/>

						<Suspense fallback={<RowLoader withHeader />}>
							<HomeRow
								endpoint="tv/top_rated"
								text="Critically Acclaimed TV"
								type="tv"
								viewAllLink="/browse/critically-acclaimed-tv"
							/>
						</Suspense>

						{/* Pre-fetched rows - no Suspense needed since data is already available */}
						<HomeRow
							endpoint="trending/movie/week"
							text="Blockbuster Hits"
							type="movie"
							viewAllLink="/browse/blockbuster-hits"
							initialData={trendingMovies}
						/>

						<HomeRow
							endpoint="movie/now_playing"
							text="Fresh in Theaters"
							type="movie"
							viewAllLink="/browse/fresh-in-theaters"
							initialData={movieNowPlaying}
						/>

						<Suspense fallback={<RowLoader withHeader />}>
							<HomeRow
								endpoint="movie/popular"
								text="Cult Classics & Fan Favorites"
								type="movie"
								viewAllLink="/browse/cult-classics-fan-favorites"
							/>
						</Suspense>

						<Suspense fallback={<RowLoader withHeader />}>
							<HomeRow
								endpoint="movie/top_rated"
								text="Cinema Hall of Fame"
								type="movie"
								viewAllLink="/browse/cinema-hall-of-fame"
							/>
						</Suspense>
					</div>
				</Container>
			</div>
		);
	} catch (error) {
		console.error('Error loading homepage:', error);
		return (
			<div className="min-h-screen bg-background text-foreground flex items-center justify-center">
				<Container>
					<div className="text-center">
						<h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
						<p className="text-muted-foreground">Please try refreshing the page.</p>
					</div>
				</Container>
			</div>
		);
	}
}
