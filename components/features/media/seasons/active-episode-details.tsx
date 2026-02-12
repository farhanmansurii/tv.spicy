'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchEpisodeDetails } from '@/lib/api';
import { useEpisodeStore } from '@/store/episodeStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

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
		<section
			className={cn(
				'w-full rounded-[28px] border p-5 md:p-7 backdrop-blur-xl transition-all duration-300 ease-out',
				isPlaying
					? 'border-white/20 bg-zinc-950/65 shadow-[0_14px_32px_rgba(0,0,0,0.28)]'
					: 'border-white/10 bg-zinc-950/55 shadow-[0_10px_24px_rgba(0,0,0,0.22)]'
			)}
		>
			<div className="flex items-center justify-between gap-3">
				<h2 className="text-[12px] font-semibold uppercase tracking-[0.24em] text-zinc-300/90">
					Active Episode
				</h2>
				<span className="text-[10px] font-bold uppercase tracking-[0.14em] text-zinc-500">
					S{seasonNumber}E{episodeNumber}
				</span>
			</div>

			<h3 className="mt-3 text-[18px] md:text-xl font-semibold tracking-tight text-white leading-tight line-clamp-2">
				{title}
			</h3>

			<div className="mt-4 flex flex-wrap items-center gap-2 text-[11px] font-semibold text-zinc-200/90">
				<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
					{isPlaying ? 'Now Playing' : 'Upcoming'}
				</span>
				<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
					{normalizedStatus}
				</span>
				{typeof episode.vote_average === 'number' && episode.vote_average > 0 && (
					<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
						★ {episode.vote_average.toFixed(1)}
					</span>
				)}
				{releaseLabel && (
					<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
						{isReleased ? 'Aired' : 'Airs'} {releaseLabel}
					</span>
				)}
				{typeof episode.runtime === 'number' && episode.runtime > 0 && (
					<span className="rounded-full border border-white/10 bg-white/[0.06] px-3 py-1.5">
						{episode.runtime} min
					</span>
				)}
			</div>

			<p className="mt-4 text-[16px] leading-[1.55] text-zinc-200/90 line-clamp-3">{overview}</p>
		</section>
	);
};
