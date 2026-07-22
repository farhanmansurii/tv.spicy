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
import { BROWSE_CATEGORIES } from '@/lib/browse-categories';

// Public catalog content can be reused safely; avoid re-rendering the full
// homepage and its hero/detail requests for every visitor.
export const revalidate = 3600;

async function fetchHomePageData() {
	const [trendingTV, trendingMovies, tvPopular] = await Promise.all([
		fetchRowData('trending/tv/week'),
		fetchRowData('trending/movie/week'),
		fetchRowData('tv/popular'),
	]);

	const allTrending = [...(trendingTV || []), ...(trendingMovies || [])].filter(Boolean);
	const basicHeroShows = allTrending
		.filter((show) => show?.backdrop_path || show?.poster_path)
		.slice(0, 5);

	const heroShows = (await fetchHeroItemsWithDetails(basicHeroShows, 'tv', 5)) as Array<
		Show & { media_type?: 'movie' | 'tv' }
	>;

	return {
		heroShows,
		trendingTV: trendingTV as Array<Show | { id: number }>,
		trendingMovies: trendingMovies as Array<Show | { id: number }>,
		tvPopular: tvPopular as Array<Show | { id: number }>,
	};
}

function HomePageContent({
	heroShows,
	trendingTV,
	trendingMovies,
	tvPopular,
}: {
	heroShows: Array<Show & { media_type?: 'movie' | 'tv' }>;
	trendingTV: Array<Show | { id: number }>;
	trendingMovies: Array<Show | { id: number }>;
	tvPopular: Array<Show | { id: number }>;
}) {
	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			<div className="-mt-16 lg:mt-0">
				<HeroCarousel
					shows={heroShows as unknown as HeroCarouselProps['shows']}
					type="tv"
				/>
			</div>

			{/* Apple TV-style content rows with negative margin overlap for cinematic feel */}
			<div className="relative z-10 -mt-12 md:-mt-20">
				<div className="bg-gradient-to-t from-background via-background to-transparent h-16 md:h-24" />
			</div>

			<Container className="w-full relative z-10">
				<div className="flex flex-col space-y-4 md:space-y-8">
					<HomePersonalizedRows section="continue-watching" />

					<DataRow
						endpoint="tv/popular"
						text={BROWSE_CATEGORIES['popular-tonight'].title}
						type="tv"
						viewAllLink="/browse/popular-tonight"
						initialData={tvPopular as unknown as Show[]}
					/>

					<HomePersonalizedRows section="saved" />

					{/* Pre-fetched rows */}
					<DataRow
						endpoint="trending/tv/week"
						text={BROWSE_CATEGORIES['binge-worthy-series'].title}
						type="tv"
						viewAllLink="/browse/binge-worthy-series"
						initialData={trendingTV as unknown as Show[]}
					/>

					<Suspense fallback={<MediaLoader withHeader />}>
						<DataRow
							endpoint="tv/on_the_air"
							text={BROWSE_CATEGORIES['airing-this-week'].title}
							type="tv"
							viewAllLink="/browse/airing-this-week"
						/>
					</Suspense>

					<Suspense fallback={<MediaLoader withHeader />}>
						<DataRow
							endpoint="tv/top_rated"
							text={BROWSE_CATEGORIES['critically-acclaimed-tv'].title}
							type="tv"
							viewAllLink="/browse/critically-acclaimed-tv"
						/>
					</Suspense>

					<DataRow
						endpoint="trending/movie/week"
						text={BROWSE_CATEGORIES['blockbuster-hits'].title}
						type="movie"
						showRank
						viewAllLink="/browse/blockbuster-hits"
						initialData={trendingMovies as unknown as Show[]}
					/>

					<Suspense fallback={<MediaLoader withHeader />}>
						<DataRow
							endpoint="movie/now_playing"
							text={BROWSE_CATEGORIES['fresh-in-theaters'].title}
							type="movie"
							viewAllLink="/browse/fresh-in-theaters"
						/>
					</Suspense>

					<Suspense fallback={<MediaLoader withHeader />}>
						<DataRow
							endpoint="movie/popular"
							text={BROWSE_CATEGORIES['cult-classics-fan-favorites'].title}
							type="movie"
							viewAllLink="/browse/cult-classics-fan-favorites"
						/>
					</Suspense>

					<Suspense fallback={<MediaLoader withHeader />}>
						<DataRow
							endpoint="movie/top_rated"
							text={BROWSE_CATEGORIES['cinema-hall-of-fame'].title}
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
					<p className="text-zinc-500">Please try refreshing the page.</p>
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
