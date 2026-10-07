import Container from '@/components/shared/containers/container';
import type { HeroCarouselProps } from '@/components/features/media/carousel/hero-carousel';
import { EditorialHero } from '@/components/features/home/editorial-hero';
import DataRow from '@/components/features/media/row/data-row';
import { PageFetchError } from '@/components/shared/errors/page-fetch-error';
import { connection } from 'next/server';
import { HomePersonalizedRows } from '@/components/features/home/home-personalized-rows';
import { BROWSE_CATEGORIES } from '@/lib/browse-categories';
import { getCachedRow, getCachedHeroItems } from '@/lib/api/catalog-cache';
import type { TMDBBaseMedia } from '@/lib/types/tmdb';

const ROW_ENDPOINTS = [
	'tv/popular',
	'trending/tv/week',
	'tv/on_the_air',
	'tv/top_rated',
	'trending/movie/week',
	'movie/now_playing',
	'movie/popular',
	'movie/top_rated',
] as const;

// Every row is fetched on the server inside 'use cache'. A fulfilled row rides
// along as initialData so the client makes no /api/tmdb/row call; a rejected
// row renders at request time without initialData, keeping the client fetch
// path with its error panel and retry. A genuinely empty catalog resolves to
// [] and renders the row's designed empty state with no extra round trip.
export default async function HomePage() {
	const settled = await Promise.allSettled(ROW_ENDPOINTS.map((e) => getCachedRow(e)));
	const initial = new Map<string, TMDBBaseMedia[]>();
	let sawFailure = false;
	settled.forEach((result, index) => {
		if (result.status === 'fulfilled') initial.set(ROW_ENDPOINTS[index], result.value);
		else sawFailure = true;
	});

	let heroShows: TMDBBaseMedia[] | null = null;
	try {
		const basicHeroShows = [
			...(initial.get('trending/tv/week') ?? []),
			...(initial.get('trending/movie/week') ?? []),
		]
			.filter((show) => show?.backdrop_path || show?.poster_path)
			.slice(0, 5);
		if (basicHeroShows.length > 0) {
			heroShows = await getCachedHeroItems(basicHeroShows, 'tv', 5);
		} else {
			sawFailure = true;
		}
	} catch {
		sawFailure = true;
	}

	if (sawFailure) await connection();

	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			<div className="-mt-16 lg:mt-0">
				{heroShows ? (
					<EditorialHero shows={heroShows as unknown as HeroCarouselProps['shows']} />
				) : (
					<PageFetchError
						title="Couldn’t load the homepage"
						description="We couldn’t reach the catalog. Try again in a moment."
					/>
				)}
			</div>

			<Container className="relative z-10 w-full">
				<div className="flex flex-col">
					<HomePersonalizedRows section="continue-watching" />

					<DataRow
						rowNumber={1}
						endpoint="tv/popular"
						text={BROWSE_CATEGORIES['popular-tonight'].title}
						type="tv"
						viewAllLink="/browse/popular-tonight"
						initialData={initial.get('tv/popular')}
					/>

					<HomePersonalizedRows section="saved" sentinelClassName="-mt-1" />

					<DataRow
						rowNumber={2}
						endpoint="trending/tv/week"
						text={BROWSE_CATEGORIES['binge-worthy-series'].title}
						type="tv"
						viewAllLink="/browse/binge-worthy-series"
						initialData={initial.get('trending/tv/week')}
					/>

					<DataRow
						rowNumber={3}
						endpoint="tv/on_the_air"
						text={BROWSE_CATEGORIES['airing-this-week'].title}
						type="tv"
						viewAllLink="/browse/airing-this-week"
						initialData={initial.get('tv/on_the_air')}
					/>

					<DataRow
						rowNumber={4}
						endpoint="tv/top_rated"
						text={BROWSE_CATEGORIES['critically-acclaimed-tv'].title}
						type="tv"
						viewAllLink="/browse/critically-acclaimed-tv"
						initialData={initial.get('tv/top_rated')}
					/>

					<DataRow
						rowNumber={5}
						endpoint="trending/movie/week"
						text={BROWSE_CATEGORIES['blockbuster-hits'].title}
						type="movie"
						showRank
						viewAllLink="/browse/blockbuster-hits"
						initialData={initial.get('trending/movie/week')}
					/>

					<DataRow
						rowNumber={6}
						endpoint="movie/now_playing"
						text={BROWSE_CATEGORIES['fresh-in-theaters'].title}
						type="movie"
						viewAllLink="/browse/fresh-in-theaters"
						initialData={initial.get('movie/now_playing')}
					/>

					<DataRow
						rowNumber={7}
						endpoint="movie/popular"
						text={BROWSE_CATEGORIES['cult-classics-fan-favorites'].title}
						type="movie"
						viewAllLink="/browse/cult-classics-fan-favorites"
						initialData={initial.get('movie/popular')}
					/>

					<DataRow
						rowNumber={8}
						endpoint="movie/top_rated"
						text={BROWSE_CATEGORIES['cinema-hall-of-fame'].title}
						type="movie"
						viewAllLink="/browse/cinema-hall-of-fame"
						initialData={initial.get('movie/top_rated')}
					/>
				</div>
			</Container>
		</div>
	);
}
