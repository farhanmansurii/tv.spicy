'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEpisodeDetails } from '@/lib/api';
import { useEpisodeStore } from '@/store/episodeStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { CalendarDays, Clock3, Star } from 'lucide-react';
import { DetailHeader, DetailPill, DetailShell } from '../details/detail-primitives';

interface ActiveEpisodeDetailsProps {
	showId: string | number;
	seasonNumber: number;
	episodeNumber: number;
	showStatus?: string | null;
}

export const ActiveEpisodeDetails = ({
	showId,
	seasonNumber,
	episodeNumber,
	showStatus,
}: ActiveEpisodeDetailsProps) => {
	const showIdString = String(showId);
	const { isPlaying } = useEpisodeStore();
	const { data: episode, isLoading } = useQuery({
		queryKey: ['episode', showIdString, seasonNumber, episodeNumber],
		queryFn: () => fetchEpisodeDetails(showIdString, seasonNumber, episodeNumber),
		enabled: !!showId,
	});

	if (isLoading || !episode) {
		return (
			<div className="w-full rounded-2xl border border-white/10 bg-zinc-950/75 p-4 space-y-3">
				<Skeleton className="h-4 w-28" />
				<Skeleton className="h-5 w-3/4" />
				<Skeleton className="h-4 w-1/2" />
			</div>
		);
	}

	const title = episode.name || `Episode ${episodeNumber}`;
	const overview = episode.overview?.trim() || 'No synopsis available yet.';
	const releaseDate = episode.air_date ? new Date(episode.air_date) : null;
	const isReleased = releaseDate ? releaseDate <= new Date() : true;
	const releaseLabel = releaseDate
		? releaseDate.toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
		  })
		: null;
	const normalizedStatus =
		typeof showStatus === 'string' && showStatus.trim().length > 0
			? showStatus
			: 'In Progress';

	return (
		<DetailShell
			className={cn(
				'transition-all duration-300 ease-out',
				isPlaying
					? 'border-white/20 bg-zinc-950/65 shadow-[0_14px_32px_rgba(0,0,0,0.28)]'
					: 'border-white/10 bg-zinc-950/55 shadow-[0_10px_24px_rgba(0,0,0,0.22)]'
			)}
		>
			<DetailHeader
				title={title}
				subtitle={`${isPlaying ? 'Now playing' : 'Upcoming'} • S${seasonNumber}E${episodeNumber}`}
			/>

			<div className="mt-4 flex flex-wrap items-center gap-2">
				<DetailPill label={isPlaying ? 'Playing' : 'Upcoming'} />
				<DetailPill label={normalizedStatus} />
				{typeof episode.vote_average === 'number' && episode.vote_average > 0 && (
					<DetailPill label={episode.vote_average.toFixed(1)} icon={Star} />
				)}
				{releaseLabel && (
					<DetailPill
						label={`${isReleased ? 'Aired' : 'Airs'} ${releaseLabel}`}
						icon={CalendarDays}
					/>
				)}
				{typeof episode.runtime === 'number' && episode.runtime > 0 && (
					<DetailPill label={`${episode.runtime} min`} icon={Clock3} />
				)}
			</div>

			<p className="mt-4 text-sm md:text-base leading-[1.55] text-zinc-200/90 line-clamp-3">
				{overview}
			</p>
		</DetailShell>
	);
};
