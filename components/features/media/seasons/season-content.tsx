'use client';

import React from 'react';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';
import {
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { isBefore } from 'date-fns';
import { toast } from '@/components/ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { Episode, Show } from '@/lib/types';
import { EpisodeCard } from '@/components/features/media/card/episode-card';

interface SeasonContentProps {
	episodes: Episode[];
	showId: string;
	view: 'grid' | 'list' | 'carousel';
	onEpisodeSelectScroll: () => void;
	showData: Show;
}

export const SeasonContent: React.FC<SeasonContentProps> = ({
	episodes,
	showId,
	view,
	onEpisodeSelectScroll,
	showData,
}) => {
	const today = new Date();
	const { activeEP, setActiveEP } = useEpisodeStore();
	const { addRecentlyWatched } = useTVShowStore();
	const searchParams = useSearchParams();
	const activeSeason = searchParams.get('season');
	const activeEpisode = searchParams.get('episode');

	const toggle = (episode: Episode, event: React.MouseEvent<HTMLDivElement>) => {
		event.preventDefault();
		if (!episode?.id) return;

		const isReleased = isBefore(new Date(episode.air_date), today);
		if (!isReleased) {
			toast({
				title: 'Coming Soon',
				description: `This episode airs on ${episode.air_date}`,
				variant: 'default',
			});
			return;
		}

		const isCurrentlyActive = activeEP?.id === episode.id;

		if (!isCurrentlyActive) {
			setActiveEP(episode);
			const params = new URLSearchParams(window.location.search);
			params.set('season', String(episode.season_number));
			params.set('episode', String(episode.episode_number));
			window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

			addRecentlyWatched({
				...episode,
				tv_id: showId,
				time: 0,
				still_path: episode.still_path || showData.backdrop_path,
				show_name: showData?.title,
			});
		}
		onEpisodeSelectScroll();
	};

	const isEpisodeActive = (ep: Episode) =>
		(String(ep.season_number) === activeSeason &&
			String(ep.episode_number) === activeEpisode) ||
		activeEP?.id === ep.id;

	const hasEpisodes = episodes?.length > 0;

	const renderEmpty = () => (
		<div className="col-span-full flex flex-col items-center justify-center py-12 text-white/40 bg-white/5 border border-dashed border-white/10 rounded-xl">
			<p>No episodes found for this season.</p>
		</div>
	);

	const renderCarousel = () => (
		<div className="w-full">
			<div className="flex items-center justify-end gap-2 mb-4">
				<CarouselPrevious className="static translate-y-0 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white" />
				<CarouselNext className="static translate-y-0 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white" />
			</div>
			<CarouselContent className="-ml-4 pb-4">
				{' '}
				{/* pb-4 allows shadow to show */}
				{hasEpisodes
					? episodes.map((ep) => (
							// h-full here is crucial for equal height cards
							<CarouselItem
								key={ep.id}
								className="pl-4 basis-[85%] sm:basis-1/2 md:basis-1/3 lg:basis-1/4 h-full"
							>
								<div className="h-full">
									<EpisodeCard
										episode={ep}
										active={isEpisodeActive(ep)}
										toggle={toggle}
										view="carousel"
									/>
								</div>
							</CarouselItem>
						))
					: renderEmpty()}
			</CarouselContent>
		</div>
	);

	const renderGrid = () => (
		<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
			{hasEpisodes
				? episodes.map((ep) => (
						<EpisodeCard
							key={ep.id}
							episode={ep}
							active={isEpisodeActive(ep)}
							toggle={toggle}
							view="grid"
						/>
					))
				: renderEmpty()}
		</div>
	);

	const renderList = () => (
		<div className="flex flex-col gap-3">
			{hasEpisodes
				? episodes.map((ep) => (
						<EpisodeCard
							key={ep.id}
							episode={ep}
							active={isEpisodeActive(ep)}
							toggle={toggle}
							view="list"
						/>
					))
				: renderEmpty()}
		</div>
	);

	return (
		<div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
			{view === 'grid' && renderGrid()}
			{view === 'list' && renderList()}
			{view === 'carousel' && renderCarousel()}
		</div>
	);
};
