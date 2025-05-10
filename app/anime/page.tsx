import AnimeCarousal from '@/components/container/anime-container.tsx/anime-detail/anime-carousal';
import AnimeRowContainer from '@/components/container/anime-container.tsx/anime-row-wrapper';
import { Metadata } from 'next';
import React from 'react';
export const metadata: Metadata = {
	title: 'Anime | Watvh TV',
	description: 'Watch any TV / Movies / Anime with Watvh ',
};
export default function page() {
	return (
		<div className="mx-auto max-w-7xl space-y-4 px-4 lg:px-0">
			<AnimeCarousal />
			<div className="flex flex-col space-y-12">
				<AnimeRowContainer text="Trending Anime" endpoint="trending" />
				<AnimeRowContainer text="Popular Anime" endpoint="popular" />
			</div>
		</div>
	);
}
