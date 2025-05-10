import React, { Suspense } from 'react';
import RecentlyWatchedTV from '@/components/common/RecentlyWatched';
import WatchList from '@/components/common/WatchList';
import { SearchCommandBox } from './search-command-box';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import MinimalSocialsFooter from '@/components/common/Footer';
import CommonContainer from '../CommonContainer';
import { Header } from '@/components/common/header';

export default function HomeContainer() {
	return (
		<CommonContainer>
			<Header />

			<div className="w-full min-h-screen space-y-4">
				<RecentlyWatchedTV />
				<WatchList type="movie" />
				<WatchList type="tv" />
			</div>

			<MinimalSocialsFooter />
		</CommonContainer>
	);
}
