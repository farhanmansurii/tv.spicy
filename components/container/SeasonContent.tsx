'use client';
import React from 'react';
import { useEpisodeStore } from '@/store/episodeStore';
import useTVShowStore from '@/store/recentsStore';
import { CarouselContent, CarouselNext, CarouselPrevious } from '../ui/carousel';
import { isBefore } from 'date-fns';
import { toast } from '../ui/use-toast';
import { useSearchParams } from 'next/navigation';
import { Episode } from '@/lib/types';
import { EpisodeCard } from '../common/EpisodeCard';

interface SeasonContentProps {
	episodes: Episode[] | any[];
	showId: string;
	view: 'grid' | 'list' | 'carousel';
}

export const SeasonContent: React.FC<SeasonContentProps> = ({ episodes, showId, view }) => {
	const today = new Date();
	const searchParams = useSearchParams();
	const releasedEpisodes = episodes;
	const { activeEP, setActiveEP } = useEpisodeStore();
	const { addRecentlyWatched } = useTVShowStore();

	const toggle = (episode: Episode) => {
		if (!episode.id) {
			toast({
				title: 'Invalid Episode',
				description: 'This episode is not available.',
			});
			return;
		}

		const isReleased = isBefore(new Date(episode.air_date), today);
		if (!isReleased) {
			toast({
				title: 'Episode Not Available Yet',
				description: 'Stay tuned! This episode will be available soon. Check back later.',
			});
			return;
		}

		setActiveEP(null);
		setActiveEP({ tv_id: showId, time: 0, ...episode });
		addRecentlyWatched({ tv_id: showId, time: 0, ...episode });
	};

	const renderEpisodes = (episodes: Episode[]) => {
		return episodes.map((episode) => (
			<EpisodeCard
				key={episode.id}
				episode={episode}
				active={activeEP?.id === episode.id}
				toggle={toggle}
			/>
		));
	};

	const renderNoEpisodesMessage = () => (
		<div className="h-[130px] items-center justify-center flex text-center text-lg">
			No released episodes for this season
		</div>
	);

	const renderCarouselContent = () => (
		<>
			<CarouselContent className="space-x-2">
				{releasedEpisodes.length ? (
					renderEpisodes(releasedEpisodes)
				) : (
					<div className="w-8/12 h-[200px] mx-auto aspect-video border rounded-lg bg-muted flex-col gap-3 border-3 text-lg items-center justify-center flex text-center ">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="28"
							height="28"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
							className="lucide lucide-circle-x"
						>
							<circle cx="12" cy="12" r="10" />
							<path d="m15 9-6 6" />
							<path d="m9 9 6 6" />
						</svg>
						No released episodes for this season
					</div>
				)}
			</CarouselContent>

			<div className="flex justify-end mt-2 gap-2 w-full mx-auto">
				<CarouselPrevious />
				<CarouselNext />
			</div>
		</>
	);

	switch (view) {
		case 'grid':
			return (
				<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-2">
					{releasedEpisodes.length
						? renderEpisodes(releasedEpisodes)
						: renderNoEpisodesMessage()}
				</div>
			);

		case 'list':
			return (
				<div className="flex flex-col gap-2">
					{releasedEpisodes.length
						? renderEpisodes(releasedEpisodes)
						: renderNoEpisodesMessage()}
				</div>
			);

		case 'carousel':
			return renderCarouselContent();

		default:
			return null;
	}
};
