'use client';

import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import useTVShowStore from '@/store/recentsStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { Episode, Show } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import Link from 'next/link';

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

	const recentlyWatchedEpisode = recentlyWatched.find((episode: Episode) => episode.tv_id === id);
	const isEpisodeActive = recentlyWatchedEpisode?.episode_number === activeEP?.episode_number;

	return (
		<div className="flex flex-col sm:flex-row gap-3 w-full max-w-3xl select-none">
			{!isDetailsPage && (
				<Link href={`/${type}/${id}`} className="w-full sm:w-auto">
					<Button
						variant="ghost"
						className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 text-sm tracking-wide font-medium uppercase rounded-none"
					>
						View {type === 'movie' ? 'Movie' : 'Show'}
					</Button>
				</Link>
			)}

			{!isDetailsPage && (
				<Button
					variant="ghost"
					className="w-full sm:w-auto bg-white/5 hover:bg-white/15 text-white border border-white/20 px-6 py-2 text-sm tracking-wide font-medium  rounded-none"
				>
					Play
				</Button>
			)}
			{!isEpisodeActive && recentlyWatchedEpisode && isDetailsPage && (
				<Link
					href={{
						query: {
							season: recentlyWatchedEpisode.season_number,
							episode: recentlyWatchedEpisode.episode_number,
						},
					}}
					className="w-full sm:w-auto"
				>
					<Button
						variant="ghost"
						className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white border border-white/20 px-6 py-2 text-sm tracking-wide font-medium  rounded-none"
						onClick={() => setActiveEP(recentlyWatchedEpisode)}
					>
						Play Season {recentlyWatchedEpisode.season_number} Episode{' '}
						{recentlyWatchedEpisode.episode_number}
					</Button>
				</Link>
			)}

			<Button
				variant="ghost"
				className="w-full sm:w-auto bg-white/5 hover:bg-white/15 text-white border border-white/20 px-6 py-2 text-sm tracking-wide font-medium  rounded-none"
				onClick={handleAddOrRemove}
			>
				{isAdded ? 'Added to List' : 'Add to List'}
			</Button>
		</div>
	);
}
