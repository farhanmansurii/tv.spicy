'use client';

import React, { useState, useEffect, useRef } from 'react';
import { GalleryVerticalEnd, Grid, List, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
	SelectTrigger,
	Select,
	SelectContent,
	SelectItem,
	SelectValue,
} from '@/components/ui/select';
import { Carousel } from '@/components/ui/carousel';
import { SeasonTabsProps } from '@/lib/types';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSeasonEpisodes } from '@/lib/tmdb-fetch-helper';
import { SeasonContent } from './season-content';
import { useEpisodeStore } from '@/store/episodeStore';
import { TVContainer } from '@/components/features/media/player/tv-container';
import { cn } from '@/lib/utils';

const SeasonTabs: React.FC<SeasonTabsProps> = ({ seasons, showId, showData }) => {
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
		const seasonFromParams = searchParams.get('season');
		if (!seasonFromParams || !seasons) {
			setActiveSeason(seasons?.[0]?.season_number ?? null);
		} else {
			setActiveSeason(parseInt(seasonFromParams));
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
			return { season: currentSeason, episode: parseInt(currentEpisode as string) + 1 };
		} else if (currentSeasonIndex < seasons.length - 1) {
			return { season: seasons[currentSeasonIndex + 1].season_number, episode: 1 };
		}
		return null;
	};

	const handleNextEpisode = (season: any, episode: any) => {
		if (!episode || !season || !episodes) return;
		const nextEp = getNextEp(activeSeason as number, episode);
		if (nextEp) {
			const nextEpisode = episodes.find((ep) => ep.episode_number === nextEp.episode);
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
			<div className="w-full max-w-4xl mx-auto my-12 p-8 rounded-2xl border border-white/10 bg-white/5 flex flex-col items-center justify-center text-center gap-4">
				<div className="h-16 w-16 rounded-full bg-red-500/10 flex items-center justify-center">
					<AlertCircle className="w-8 h-8 text-red-400" />
				</div>
				<div className="space-y-1">
					<h2 className="text-xl font-bold text-white">No Seasons Available</h2>
					<p className="text-white/40">
						We couldn&apos;t find any released seasons for this show.
					</p>
				</div>
				<Button
					variant="secondary"
					className="mt-2"
					onClick={() => {
						setActiveSeason(seasons?.[0]?.season_number ?? null);
						refetch();
					}}
				>
					Refresh Data
				</Button>
			</div>
		);
	}

	return (
		<div className="w-full flex flex-col gap-8 mx-auto">
			<div ref={episodePlayerRef}>
				<TVContainer
					key={`${activeEP?.season_number}-${activeEP?.episode_number}`}
					showId={showId}
					getNextEp={handleNextEpisode}
				/>
			</div>
			<Carousel opts={{ dragFree: true }} className="w-full">
				<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
					<div className="relative z-20">
						<Select
							defaultValue={String(activeSeason)}
							onValueChange={handleSeasonChange}
						>
							<SelectTrigger className="w-[180px] h-10 border-white/10 bg-white/5 hover:bg-white/10 text-white font-medium rounded-lg transition-all focus:ring-0 focus:ring-offset-0">
								<SelectValue>
									<span className="flex items-center gap-2">
										<span className="text-white/60 font-normal">View:</span>
										Season {activeSeason}
									</span>
								</SelectValue>
							</SelectTrigger>
							<SelectContent className="bg-black/90 border-white/10 text-white backdrop-blur-xl max-h-[300px]">
								{seasons?.map((season: any) => (
									<SelectItem
										value={String(season.season_number)}
										key={season.season_number}
										className="focus:bg-white/10 focus:text-white cursor-pointer"
									>
										Season {season.season_number}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>

					<div className="flex items-center p-1 gap-1 bg-white/5 border border-white/10 rounded-lg">
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setView('list')}
							className={cn(
								'h-8 px-3 rounded-md text-white/60 hover:text-white transition-all',
								view === 'list' && 'bg-white/10 text-white shadow-sm'
							)}
						>
							<List className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
							<span className="hidden lg:inline">List</span>
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setView('grid')}
							className={cn(
								'h-8 px-3 rounded-md text-white/60 hover:text-white transition-all',
								view === 'grid' && 'bg-white/10 text-white shadow-sm'
							)}
						>
							<Grid className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
							<span className="hidden lg:inline">Grid</span>
						</Button>
						<Button
							size="sm"
							variant="ghost"
							onClick={() => setView('carousel')}
							className={cn(
								'h-8 px-3 rounded-md text-white/60 hover:text-white transition-all',
								view === 'carousel' && 'bg-white/10 text-white shadow-sm'
							)}
						>
							<GalleryVerticalEnd className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
							<span className="hidden lg:inline">Deck</span>
						</Button>
					</div>
				</div>

				<div className="min-h-[200px] w-full">
					{isLoading ? (
						<div className="flex flex-col items-center justify-center py-24 gap-4 text-white/40">
							<Loader2 className="h-8 w-8 animate-spin text-primary" />
							<p className="text-sm font-medium animate-pulse">
								Fetching episodes...
							</p>
						</div>
					) : isError ? (
						<div className="flex flex-col items-center justify-center py-16 gap-4 border border-dashed border-red-500/20 bg-red-500/5 rounded-xl text-red-400">
							<AlertCircle className="h-8 w-8" />
							<p>Failed to load episodes.</p>
							<Button
								variant="outline"
								size="sm"
								onClick={() => refetch()}
								className="border-red-500/20 hover:bg-red-500/10 text-red-400"
							>
								Try Again
							</Button>
						</div>
					) : (
						episodes && (
							<SeasonContent
								view={view}
								showId={showId}
								episodes={episodes}
								showData={showData}
								onEpisodeSelectScroll={() => {
									if (episodePlayerRef.current) {
										episodePlayerRef.current.scrollIntoView({
											behavior: 'smooth',
											block: 'start',
										});
									}
								}}
							/>
						)
					)}
				</div>
			</Carousel>
		</div>
	);
};

export default SeasonTabs;
