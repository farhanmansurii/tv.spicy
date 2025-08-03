import BentoGrid from '@/components/common/BentoGrid';
import MinimalSocialsFooter from '@/components/common/Footer';
import { Header } from '@/components/common/header';
import WatchList from '@/components/common/WatchList';
import RecentlyWatchedTV from '@/components/common/RecentlyWatched';
import { fetchRowData } from '@/lib/utils';
import CommonContainer from '@/components/container/CommonContainer';

export const revalidate = 604800;

export default async function HomePage() {
	const [trendingTV, topRatedTV, trendingMovies, topRatedMovies] = await Promise.all([
		fetchRowData('trending/tv/week'),
		fetchRowData('tv/top_rated'),
		fetchRowData('trending/movie/week'),
		fetchRowData('movie/top_rated'),
	]);

	return (
		<CommonContainer className="space-y-14 pb-20">
			<div className="space-y-10">
				<RecentlyWatchedTV />
				<WatchList type="movie" />
				<WatchList type="tv" />
			</div>
			<BentoGrid title="Trending TV" shows={trendingTV} type="tv" />
			<BentoGrid title="Top Rated TV" shows={topRatedTV} type="tv" />
			<BentoGrid title="Trending Movies" shows={trendingMovies} type="movie" />
			<BentoGrid title="Top Rated Movies" shows={topRatedMovies} type="movie" />
		</CommonContainer>
	);
}
