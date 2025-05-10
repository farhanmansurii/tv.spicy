import BentoGrid from '@/components/common/BentoGrid';
import MinimalSocialsFooter from '@/components/common/Footer';
import { Header } from '@/components/common/header';
import WatchList from '@/components/common/WatchList';
import RecentlyWatchedTV from '@/components/common/RecentlyWatched';
import { fetchRowData } from '@/lib/utils';

export const revalidate = 604800;

export default async function HomePage() {
	const [trendingTV, topRatedTV, trendingMovies, topRatedMovies] = await Promise.all([
		fetchRowData('trending/tv/week'),
		fetchRowData('tv/top_rated'),
		fetchRowData('trending/movie/week'),
		fetchRowData('movie/top_rated'),
	]);

	return (
		<main className="container mx-auto px-2 space-y-14 pb-20">
			<div className="max-w-5xl space-y-14 mx-auto">
				<Header />
				<RecentlyWatchedTV />
				<WatchList type="movie" />
				<WatchList type="tv" />
			</div>
			<BentoGrid title="Trending TV" shows={trendingTV} type="tv" />
			<BentoGrid title="Top Rated TV" shows={topRatedTV} type="tv" />
			<BentoGrid title="Trending Movies" shows={trendingMovies} type="movie" />
			<BentoGrid title="Top Rated Movies" shows={topRatedMovies} type="movie" />
			<div className="max-w-5xl mx-auto">
				<MinimalSocialsFooter />
			</div>
		</main>
	);
}
