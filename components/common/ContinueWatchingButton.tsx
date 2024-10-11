'use client';
import React, { useEffect } from 'react';
import { Button } from '../ui/button';
import useTVShowStore from '@/store/recentsStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { ArrowRight, Check, PlayIcon, Plus } from 'lucide-react';
import { Episode, Show } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import { FaPlay } from 'react-icons/fa';
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

	const recentlyWatchedEpisode = recentlyWatched.find((episode: any) => episode.tv_id === id);
	const isEpisodeActive = recentlyWatchedEpisode?.episode === activeEP?.episode;

	return (
		<div className="flex w-full w-fit gap-0">
			{!isDetailsPage && (
				<Link href={`/${type}/${id}`}>
					<Button
						iconPlacement="right"
						variant={'expandIcon'}
						Icon={ArrowRight}
						className="whitespace-nowrap rounded-none  w-full"
					>
						View {type === 'movie' ? 'Movie' : 'Show'}
					</Button>
				</Link>
			)}
			{!isEpisodeActive && recentlyWatchedEpisode && isDetailsPage && (
				<Button
					asChild
					iconPlacement="right"
					variant={'expandIcon'}
					Icon={FaPlay}
					className="whitespace-nowrap rounded-none  w-full"
					onClick={() => setActiveEP(recentlyWatchedEpisode)}
				>
					<Link
						href={{
							query: {
								season: recentlyWatchedEpisode.season,
								episode: recentlyWatchedEpisode.episode,
							},
						}}
					>
						Play S{recentlyWatchedEpisode.season}E{recentlyWatchedEpisode.episode}
					</Link>
				</Button>
			)}
			<Button
				iconPlacement="right"
				variant={'expandIcon'}
				Icon={isAdded ? Check : Plus}
				className=" bg-secondary text-secondary-foreground rounded-none w-full lg:w-fit hover:bg-secondary/80 whitespace-nowrap"
				onClick={handleAddOrRemove}
			>
				{isAdded ? 'Added' : 'Add to List'}
			</Button>
		</div>
	);
}
