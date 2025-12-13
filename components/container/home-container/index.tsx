import React, { Suspense } from 'react';
import RecentlyWatched from '@/components/features/watchlist/recently-watched';
import WatchList from '@/components/features/watchlist/watch-list';
import { Separator } from '@/components/ui/separator';
import Footer from '@/components/layout/footer/footer';
import Container from '@/components/shared/containers/container';
import { Header } from '@/components/layout/header/header';

export default function HomeContainer() {
	return (
		<Container>
			<Header />

			<div className="w-full min-h-screen space-y-4">
				<RecentlyWatched />
				<WatchList type="movie" />
				<WatchList type="tv" />
			</div>

			<Footer />
		</Container>
	);
}
