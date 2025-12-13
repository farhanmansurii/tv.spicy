'use client';

import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import useTVShowStore from '@/store/recentsStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { Episode, Show } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import Link from 'next/link';
import { Play, Plus, Check, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContinueWatchingButtonProps {
	id: any;
	show: Show;
	type: string;
	isDetailsPage: boolean;
}

export default function ContinueWatchingButton({
	id,
	show,
	type,
	isDetailsPage,
}: ContinueWatchingButtonProps) {
	const { recentlyWatched, loadEpisodes } = useTVShowStore();
	const { activeEP, setActiveEP } = useEpisodeStore();

	const {
		addToWatchlist,
		removeFromWatchList,
		addToTvWatchlist,
		removeFromTvWatchList,
		watchlist,
		tvwatchlist,
	} = useWatchListStore();

	useEffect(() => {
		loadEpisodes();
	}, [loadEpisodes]);

	const isAdded =
		type === 'movie'
			? watchlist.some((s) => s?.id === id)
			: tvwatchlist.some((s) => s?.id === id);

	const handleAddOrRemove = () => {
		if (isAdded) {
			type === 'movie' ? removeFromWatchList(id) : removeFromTvWatchList(id);
		} else {
			type === 'movie' ? addToWatchlist(show) : addToTvWatchlist(show);
		}
	};

	const recentlyWatchedEpisode = recentlyWatched
		.filter((episode: Episode) => episode.tv_id === id)
		.sort((a: Episode, b: Episode) => {
			if (a.season_number !== b.season_number) {
				return b.season_number - a.season_number;
			}
			return b.episode_number - a.episode_number;
		})[0];

	const primaryButtonClass = cn(
		'h-10 md:h-12 rounded-full',
		'bg-white hover:bg-white/90 text-black',
		'font-bold text-sm md:text-base tracking-tight',
		'flex items-center justify-center gap-2',
		'transition-transform duration-200 active:scale-95',
		'shadow-lg shadow-black/20',
		'px-4 md:px-6 lg:px-8',
		'min-w-[100px] md:min-w-[140px]'
	);

	const secondaryButtonClass = cn(
		'h-10 md:h-12 rounded-full',
		'bg-white/10 hover:bg-white/20',
		'backdrop-blur-[12px]',
		'text-white font-medium text-sm md:text-base tracking-tight',
		'flex items-center justify-center gap-2',
		'transition-all duration-200 active:scale-95',
		'border border-white/5',
		'px-3 md:px-4 lg:px-6'
	);

	const iconButtonClass = cn(
		'h-10 md:h-12 w-10 md:w-12 rounded-full',
		'bg-white/10 hover:bg-white/20',
		'backdrop-blur-[12px]',
		'text-white',
		'flex items-center justify-center',
		'transition-all duration-200 active:scale-95',
		'border border-white/5'
	);

	// Build resume link URL
	const resumeLink =
		recentlyWatchedEpisode && isDetailsPage
			? `/${type}/${id}?season=${recentlyWatchedEpisode.season_number}&episode=${recentlyWatchedEpisode.episode_number}`
			: `/${type}/${id}`;

	return (
		<div className="flex flex-wrap items-center gap-2 md:gap-3 pt-2 md:pt-4">
			{/* Play/Resume Button */}
			{!isDetailsPage || !recentlyWatchedEpisode ? (
				<Link href={`/${type}/${id}`} className="flex-shrink-0">
					<Button className={primaryButtonClass}>
						<Play className="w-4 h-4 md:w-5 md:h-5 fill-black" />
						<span className="hidden sm:inline">Play</span>
					</Button>
				</Link>
			) : (
				<Link href={resumeLink} className="flex-shrink-0">
					<Button
						className={cn(primaryButtonClass, 'px-3 md:px-6')}
						onClick={() => setActiveEP(recentlyWatchedEpisode)}
					>
						<Play className="w-4 h-4 md:w-5 md:h-5 fill-black flex-shrink-0" />
						<div className="flex flex-col items-start leading-none ml-1">
							<span className="text-[9px] md:text-[10px] font-bold uppercase opacity-60 tracking-wider mb-[1px]">
								Resume
							</span>
							<span className="text-xs md:text-sm font-bold">
								S{recentlyWatchedEpisode.season_number} E
								{recentlyWatchedEpisode.episode_number}
							</span>
						</div>
					</Button>
				</Link>
			)}

			{/* Add to Watchlist Button */}
			<Button
				className={cn(
					secondaryButtonClass,
					isAdded ? 'w-10 md:w-12 px-0' : 'px-3 md:px-4 lg:px-6'
				)}
				onClick={handleAddOrRemove}
			>
				{isAdded ? (
					<Check className="w-4 h-4 md:w-5 md:h-5" />
				) : (
					<>
						<Plus className="w-4 h-4 md:w-5 md:h-5 flex-shrink-0" />
						<span className="hidden sm:inline text-xs md:text-sm">Add to Up Next</span>
						<span className="sm:hidden">Add</span>
					</>
				)}
			</Button>

			{/* Info Button (only on hero carousel) */}
			{!isDetailsPage && (
				<Link href={`/${type}/${id}`} className="flex-shrink-0">
					<Button className={iconButtonClass}>
						<Info className="w-4 h-4 md:w-5 md:h-5" />
					</Button>
				</Link>
			)}
		</div>
	);
}
