'use client';

import React from 'react';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';
import { CarouselContent, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { isBefore } from 'date-fns';
import { toast } from '../ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { Episode, Show } from '@/lib/types';
import { EpisodeCard } from '../common/EpisodeCard';

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

		if (!episode?.id) {
			toast({ title: 'Invalid Episode', description: 'This episode is not available.' });
			return;
		}

		const isReleased = isBefore(new Date(episode.air_date), today);

		if (!isReleased) {
			toast({
				title: 'Episode Not Available Yet',
				description: 'Stay tuned! This episode will be available soon.',
			});
			return;
		}

		// Check if this episode is already active
		const isCurrentlyActive =
			(String(episode.season_number) === activeSeason &&
				String(episode.episode_number) === activeEpisode) ||
			activeEP?.id === episode.id;

		// Only proceed if the episode is actually changing
		if (!isCurrentlyActive) {
			// Update both store and URL parameters
			setActiveEP(episode);

			// Update URL parameters
			const params = new URLSearchParams(window.location.search);
			params.set('season', String(episode.season_number));
			params.set('episode', String(episode.episode_number));
			window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);

			const episodeWithHistory = {
				...episode,
				tv_id: showId,
				time: 0,
				id: episode.id,
				name: episode.name,
				episode_number: episode.episode_number,
				season_number: episode.season_number,
				air_date: episode.air_date,
				overview: episode.overview,
				runtime: episode.runtime,
				still_path: episode.still_path || showData.backdrop_path,
				show_name: showData?.title,
			};

			addRecentlyWatched(episodeWithHistory);
		}

		onEpisodeSelectScroll();
	};

	const hasEpisodes = episodes?.length > 0;

	const renderEpisodes = () =>
		episodes.map((ep) => (
			<EpisodeCard
				key={ep.id}
				episode={ep}
				active={
					// Check if URL parameters match1234

					(String(ep.season_number) === activeSeason &&
						String(ep.episode_number) === activeEpisode) ||
					// OR if store state matches (for cases without URL params)
					activeEP?.id === ep.id
				}
				toggle={toggle}
				view={view}
			/>
		));

	const renderEmpty = () => (
		<div className="flex flex-col items-center justify-center text-center py-12 gap-3 rounded-md border border-dashed bg-muted/40 text-muted-foreground">
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="32"
				height="32"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				className="text-muted-foreground"
			>
				<circle cx="12" cy="12" r="10" />
				<path d="m15 9-6 6" />
				<path d="m9 9 6 6" />
			</svg>
			<p className="text-sm md:text-base">No released episodes for this season</p>
		</div>
	);

	const renderCarousel = () => (
		<>
			<CarouselContent className="space-x-2">
				{hasEpisodes ? renderEpisodes() : renderEmpty()}
			</CarouselContent>
			<div className="flex justify-end mt-2 gap-2">
				<CarouselPrevious />
				<CarouselNext />
			</div>
		</>
	);

	const renderGrid = () => (
		<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
			{hasEpisodes ? renderEpisodes() : renderEmpty()}
		</div>
	);

	const renderList = () => (
		<div className="flex flex-col gap-3">{hasEpisodes ? renderEpisodes() : renderEmpty()}</div>
	);

	switch (view) {
		case 'grid':
			return renderGrid();
		case 'list':
			return renderList();
		case 'carousel':
			return renderCarousel();
		default:
			return null;
	}
};
