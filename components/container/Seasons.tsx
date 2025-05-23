'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GalleryVerticalEnd, Grid, List, X } from 'lucide-react';
import { Button } from '../ui/button';
import {
	SelectTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectValue,
} from '@/components/ui/select';
import { Carousel } from '../ui/carousel';
import { SeasonTabsProps } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSeasonEpisodes } from '@/lib/tmdb-fetch-helper';
import { Card, CardContent } from '../ui/card';
import { SeasonContent } from './SeasonContent';

import { useEpisodeStore } from '@/store/episodeStore';
import { TVContainer } from '../common/TVContainer';

const SeasonTabs: React.FC<SeasonTabsProps> = ({ seasons, showId }) => {
	const searchParams = useSearchParams();
	const [activeSeason, setActiveSeason] = useState<number | null>(null);
	const [view, setView] = useState<'grid' | 'list' | 'carousel'>('list');
	const { activeEP, setActiveEP } = useEpisodeStore();
	const episodePlayerRef = useRef<HTMLDivElement>(null);
	const {
		data: episodes,
		isLoading,
		isError,
		refetch,
	} = useQuery({
		queryKey: ['episodes', showId, activeSeason],
		queryFn: () => fetchSeasonEpisodes(showId, activeSeason as number),
		enabled: !!showId && activeSeason !== null,
	});

	useEffect(() => {
		// Default to the first season if no active season is set
		const seasonFromParams = searchParams.get('season');
		if (!seasonFromParams || !seasons) {
			setActiveSeason(seasons?.[0]?.season_number ?? null);
		} else {
			const seasonNumber = parseInt(seasonFromParams);
			setActiveSeason(seasonNumber);
		}
	}, [seasons, searchParams]);

	const handleSeasonChange = (value: string) => {
		setActiveSeason(Number(value));
	};

	const getNextEp = (currentSeason: number, currentEpisode: number | string) => {
		const currentSeasonIndex = seasons.findIndex(
			(season) => season.season_number === currentSeason
		);

		if (currentSeasonIndex === -1) return null;

		const currentSeasonEpisodes = seasons[currentSeasonIndex].episode_count;

		if (currentEpisode < currentSeasonEpisodes) {
			return {
				season: currentSeason,
				episode: parseInt(currentEpisode as string) + 1,
			};
		} else if (currentSeasonIndex < seasons.length - 1) {
			return {
				season: seasons[currentSeasonIndex + 1].season_number,
				episode: 1,
			};
		}

		return null;
	};

	const handleNextEpisode = (season: any, episode: any) => {
		if (!episode || !season || !episodes) return;
		const nextEp = getNextEp(activeSeason as number, episode);
		if (nextEp) {
			const nextEpisode = episodes.find(
				(episode) => episode.episode_number === nextEp.episode
			);
			if (!nextEpisode) return;
			setActiveEP(nextEpisode);
			const params = new URLSearchParams(window.location.search);
			params.set('season', String(nextEpisode.season_number));
			params.set('episode', String(nextEpisode.episode_number));
			window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`);
		}
	};

	if (activeSeason === null) {
		return (
			<Card className="w-full max-w-2xl mx-auto my-8 bg-gradient-to-br from-muted to-background">
				<CardContent className="flex flex-col items-center justify-center h-64 text-center p-6">
					<X className="w-16 h-16 text-red-500 mb-4 " />
					<h2 className="text-xl md:2x; font-bold text-white mb-2">
						No Episodes Available
					</h2>
					<p className="text-gray-300">
						There are no released episodes for this season yet.
					</p>
					<Button
						size={'sm'}
						className="mt-4"
						onClick={() => {
							setActiveSeason(seasons?.[0]?.season_number ?? null);
							refetch();
						}}
					>
						Retry
					</Button>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="w-full flex flex-col mx-auto">
			<TVContainer
				key={`${activeEP?.season_number}-${activeEP?.episode_number}`}
				showId={showId}
				getNextEp={handleNextEpisode}
			/>
			<Carousel opts={{ dragFree: true }} className="w-full justify-between mx-auto ">
				<div className="flex font-bold justify-between items-center text-xl md:text-2xl py-2 flex-row">
					<Select defaultValue={String(activeSeason)} onValueChange={handleSeasonChange}>
						<SelectTrigger className="w-fit">
							<SelectValue>
								<div className="pr-10">{`Season ${activeSeason}`}</div>
							</SelectValue>
						</SelectTrigger>
						<SelectContent>
							{seasons?.map((season: any) => (
								<SelectItem
									value={String(season.season_number)}
									key={season.season_number}
								>
									<div className="mx-1 flex gap-2">
										Season {season.season_number}
									</div>
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<div className="flex gap-2">
						<Button
							size="sm"
							variant={view === 'list' ? 'default' : 'secondary'}
							className="text-xs"
							onClick={() => setView('list')}
							aria-label="Switch View"
						>
							<List className="p-1" />
						</Button>
						<Button
							size="sm"
							variant={view === 'grid' ? 'default' : 'secondary'}
							className="text-xs"
							onClick={() => setView('grid')}
							aria-label="Switch View"
						>
							<Grid className="p-1" />
						</Button>
						<Button
							size="sm"
							variant={view === 'carousel' ? 'default' : 'secondary'}
							className="text-xs"
							onClick={() => setView('carousel')}
							aria-label="Switch View"
						>
							<GalleryVerticalEnd className="p-1" />
						</Button>
					</div>
				</div>

				{isLoading ? (
					<div>Loading episodes...</div>
				) : isError ? (
					<div>
						<p>Error loading episodes</p>
						<Button onClick={() => refetch()} className="mt-4">
							Retry
						</Button>
					</div>
				) : (
					episodes && (
						<SeasonContent
							view={view}
							showId={showId}
							episodes={episodes}
							onEpisodeSelectScroll={() =>
								episodePlayerRef.current?.scrollIntoView({
									behavior: 'smooth',
									block: 'start',
								})
							}
						/>
					)
				)}
			</Carousel>
		</div>
	);
};

export default SeasonTabs;
