import { fetchRowData, fetchHeroItemsWithDetails } from '@/lib/api';
import Container from '@/components/shared/containers/container';
import { Show } from '@/lib/types';
import HeroCarousel, {
	type HeroCarouselProps,
} from '@/components/features/media/carousel/hero-carousel';
import DataRow from '@/components/features/media/row/data-row';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { Suspense } from 'react';
import { HomePersonalizedRows } from '@/components/features/home/home-personalized-rows';

export const revalidate = 604800;

async function fetchHomePageData() {
	// Phase 1: Fetch hero data and first 2-3 rows server-side for instant loading
	const [trendingTV, trendingMovies, tvPopular, tvOnTheAir, movieNowPlaying] = await Promise.all([
		fetchRowData('trending/tv/week'),
		fetchRowData('trending/movie/week'),
		fetchRowData('tv/popular'),
		fetchRowData('tv/on_the_air'),
		fetchRowData('movie/now_playing'),
	]);

	const allTrending = [...(trendingTV || []), ...(trendingMovies || [])].filter(Boolean);
	const basicHeroShows = allTrending.filter((show) => show?.backdrop_path).slice(0, 10);

	// Fetch full details (with logos) for hero items
	const heroShows = (await fetchHeroItemsWithDetails(basicHeroShows, 'tv', 10)) as Array<
		Show & { media_type?: 'movie' | 'tv' }
	>;

	return {
		heroShows,
		trendingTV: trendingTV as Array<Show | { id: number }>,
		trendingMovies: trendingMovies as Array<Show | { id: number }>,
		tvPopular: tvPopular as Array<Show | { id: number }>,
		tvOnTheAir: tvOnTheAir as Array<Show | { id: number }>,
		movieNowPlaying: movieNowPlaying as Array<Show | { id: number }>,
	};
}

function HomePageContent({
	heroShows,
	trendingTV,
	trendingMovies,
	tvPopular,
	tvOnTheAir,
	movieNowPlaying,
}: {
	heroShows: Array<Show & { media_type?: 'movie' | 'tv' }>;
	trendingTV: Array<Show | { id: number }>;
	trendingMovies: Array<Show | { id: number }>;
	tvPopular: Array<Show | { id: number }>;
	tvOnTheAir: Array<Show | { id: number }>;
	movieNowPlaying: Array<Show | { id: number }>;
}) {
	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			<HeroCarousel shows={heroShows as unknown as HeroCarouselProps['shows']} type="tv" />
			<Container className="w-full">
				<div className="flex flex-col space-y-4 md:space-y-6">
					<HomePersonalizedRows />

					{/* Pre-fetched rows - no Suspense needed since data is already available */}
					<DataRow
						endpoint="trending/tv/week"
						text="Binge-Worthy Series"
						type="tv"
						viewAllLink="/browse/binge-worthy-series"
						initialData={trendingTV as unknown as Show[]}
					/>

					<DataRow
						endpoint="tv/popular"
						text="Crowd Favorites: TV"
						type="tv"
						viewAllLink="/browse/crowd-favorites-tv"
						initialData={tvPopular as unknown as Show[]}
					/>

					<DataRow
						endpoint="tv/on_the_air"
						text="Airing This Week"
						type="tv"
						viewAllLink="/browse/airing-this-week"
						initialData={tvOnTheAir as unknown as Show[]}
					/>

					<Suspense fallback={<MediaLoader withHeader />}>
						<DataRow
							endpoint="tv/top_rated"
							text="Critically Acclaimed TV"
							type="tv"
							viewAllLink="/browse/critically-acclaimed-tv"
						/>
					</Suspense>

					{/* Pre-fetched rows - no Suspense needed since data is already available */}
					<DataRow
						endpoint="trending/movie/week"
						text="Blockbuster Hits"
						type="movie"
						viewAllLink="/browse/blockbuster-hits"
						initialData={trendingMovies as unknown as Show[]}
					/>

					<DataRow
						endpoint="movie/now_playing"
						text="Fresh in Theaters"
						type="movie"
						viewAllLink="/browse/fresh-in-theaters"
						initialData={movieNowPlaying as unknown as Show[]}
					/>

					<Suspense fallback={<MediaLoader withHeader />}>
						<DataRow
							endpoint="movie/popular"
							text="Cult Classics & Fan Favorites"
							type="movie"
							viewAllLink="/browse/cult-classics-fan-favorites"
						/>
					</Suspense>

					<Suspense fallback={<MediaLoader withHeader />}>
						<DataRow
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
}

function HomePageError() {
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

export default async function HomePage() {
	const dataResult = await fetchHomePageData().catch((error) => {
		console.error('Error loading homepage:', error);
		return null;
	});

	if (!dataResult) {
		return <HomePageError />;
	}

	return <HomePageContent {...dataResult} />;
}
