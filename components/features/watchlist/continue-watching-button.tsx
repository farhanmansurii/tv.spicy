'use client';

import React, { useState, useCallback, useMemo } from 'react';
import useTVShowStore from '@/store/recentsStore';
import useWatchListStore from '@/store/watchlistStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
	PlayIcon,
	PauseIcon,
	PlusIcon,
	CheckIcon,
	InfoIcon,
	HeartIcon,
	SpinnerGapIcon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useHaptics } from '@/hooks/use-haptics';

interface ContinueWatchingButtonProps {
	id: string | number;
	show: any;
	type: 'movie' | 'tv';
	isDetailsPage?: boolean;
}

export default function ContinueWatchingButton({
	id,
	show,
	type,
	isDetailsPage = false,
}: ContinueWatchingButtonProps) {
	const router = useRouter();
	const recentlyWatched = useTVShowStore((s) => s.recentlyWatched);
	const { activeEP, isPlaying } = useEpisodeStore();
	const addToWatchlist = useWatchListStore((s) => s.addToWatchlist);
	const removeFromWatchList = useWatchListStore((s) => s.removeFromWatchList);
	const addToTvWatchlist = useWatchListStore((s) => s.addToTvWatchlist);
	const removeFromTvWatchList = useWatchListStore((s) => s.removeFromTvWatchList);
	const watchlist = useWatchListStore((s) => s.watchlist);
	const tvwatchlist = useWatchListStore((s) => s.tvwatchlist);
	const favoriteMovies = useFavoritesStore((s) => s.favoriteMovies);
	const favoriteTV = useFavoritesStore((s) => s.favoriteTV);
	const addFavorite = useFavoritesStore((s) => s.addFavorite);
	const removeFavorite = useFavoritesStore((s) => s.removeFavorite);

	const [isLoading, setIsLoading] = useState(false);
	const haptic = useHaptics();

	const isCurrentlyPlaying = useMemo(() => {
		if (!isDetailsPage || type !== 'tv' || !activeEP || !isPlaying) return false;
		return String(activeEP.tv_id) === String(id);
	}, [isDetailsPage, type, activeEP, isPlaying, id]);

	const currentActiveEpisode = useMemo(() => {
		if (!isDetailsPage || type !== 'tv' || !activeEP) return null;
		if (String(activeEP.tv_id) !== String(id)) return null;
		return activeEP;
	}, [isDetailsPage, type, activeEP, id]);

	const isLiked = useMemo(() => {
		const itemId = Number(id);
		return type === 'movie'
			? favoriteMovies.some((item: any) => item.id === itemId)
			: favoriteTV.some((item: any) => item.id === itemId);
	}, [id, type, favoriteMovies, favoriteTV]);

	const isAdded = useMemo(() => {
		const itemId = Number(id);
		return type === 'movie'
			? watchlist.some((s) => s?.id === itemId)
			: tvwatchlist.some((s) => s?.id === itemId);
	}, [type, watchlist, tvwatchlist, id]);

	const recentFromHistory = useMemo(() => {
		const showId = String(id);
		return recentlyWatched
			.filter((item) => String(item.mediaId) === showId && item.mediaType === 'tv')
			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
	}, [recentlyWatched, id]);

	const handleAddOrRemove = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (isAdded) {
				haptic('soft');
				type === 'movie'
					? removeFromWatchList(Number(id))
					: removeFromTvWatchList(Number(id));
				toast.info('Removed from watchlist', {
					description: `${show?.name || show?.title || 'Item'} has been removed from your watchlist.`,
				});
			} else {
				haptic('success');
				type === 'movie' ? addToWatchlist(show) : addToTvWatchlist(show);
				toast.success('Added to watchlist', {
					description: `${show?.name || show?.title || 'Item'} has been added to your watchlist.`,
				});
			}
		},
		[isAdded, type, id, show, haptic, addToWatchlist, addToTvWatchlist, removeFromWatchList, removeFromTvWatchList]
	);

	const handleLike = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (isLiked) {
				haptic('soft');
				removeFavorite(Number(id), type);
				toast.info('Removed from favorites');
			} else {
				haptic('success');
				addFavorite(show, type);
				toast.success('Added to favorites');
			}
		},
		[id, isLiked, show, type, haptic, addFavorite, removeFavorite]
	);

	const scrollToPlayer = useCallback(() => {
		const playerElement = document.querySelector('[data-player-container]');
		if (playerElement) {
			playerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, []);

	const handlePlay = useCallback(async () => {
		haptic('medium');
		if (isCurrentlyPlaying) {
			scrollToPlayer();
			return;
		}

		setIsLoading(true);
		try {
			if (type === 'tv') {
				const episodeToPlay = currentActiveEpisode || recentFromHistory;
				if (episodeToPlay) {
					const seasonNumber =
						'season_number' in episodeToPlay
							? episodeToPlay.season_number
							: episodeToPlay.seasonNumber;
					const episodeNumber =
						'episode_number' in episodeToPlay
							? episodeToPlay.episode_number
							: episodeToPlay.episodeNumber;
					const params = new URLSearchParams();
					params.set('season', String(seasonNumber || 1));
					params.set('episode', String(episodeNumber || 1));
					router.push(`/${type}/${id}?${params.toString()}`);
				} else {
					router.push(`/${type}/${id}?season=1&episode=1`);
				}
			} else {
				router.push(`/${type}/${id}`);
			}
		} catch {
			toast.error('Navigation failed');
		} finally {
			setIsLoading(false);
		}
	}, [router, type, id, currentActiveEpisode, recentFromHistory, isCurrentlyPlaying, haptic, scrollToPlayer]);

	const handleInfo = useCallback(() => {
		if (!isDetailsPage) {
			router.push(`/${type}/${id}`);
		}
	}, [router, type, id, isDetailsPage]);

	const displayEpisode = currentActiveEpisode || recentFromHistory;
	const displaySeasonNumber =
		(displayEpisode &&
			('season_number' in displayEpisode
				? displayEpisode.season_number
				: displayEpisode.seasonNumber)) ||
		1;
	const displayEpisodeNumber =
		(displayEpisode &&
			('episode_number' in displayEpisode
				? displayEpisode.episode_number
				: displayEpisode.episodeNumber)) ||
		1;

	const { buttonText, buttonLabel, ButtonIcon } = useMemo(() => {
		if (type === 'movie') {
			return { buttonText: 'Play', buttonLabel: 'Play Movie', ButtonIcon: PlayIcon };
		}
		if (isCurrentlyPlaying && displayEpisode) {
			return {
				buttonText: `Playing S${displaySeasonNumber} E${displayEpisodeNumber}`,
				buttonLabel: `Now playing Season ${displaySeasonNumber} Episode ${displayEpisodeNumber}`,
				ButtonIcon: PauseIcon,
			};
		}
		if (displayEpisode) {
			return {
				buttonText: `Resume S${displaySeasonNumber} E${displayEpisodeNumber}`,
				buttonLabel: `Resume Season ${displaySeasonNumber} Episode ${displayEpisodeNumber}`,
				ButtonIcon: PlayIcon,
			};
		}
		return { buttonText: 'Start Watching', buttonLabel: 'Start from Episode 1', ButtonIcon: PlayIcon };
	}, [type, isCurrentlyPlaying, displayEpisode, displaySeasonNumber, displayEpisodeNumber]);

	// Secondary icon button: subtle surface on dark
	const secondaryBase = cn(
		'rounded-full h-11 w-11 md:h-12 md:w-12',
		'bg-white/[0.06] hover:bg-white/[0.10] active:bg-white/[0.14]',
		'text-white/70 hover:text-white',
		'border border-white/[0.08] hover:border-white/[0.14]'
	);

	return (
		<div className="flex items-center gap-3 md:gap-3.5">
			{/* Primary CTA */}
			<Button
				onClick={handlePlay}
				disabled={isLoading}
				variant="default"
				size="lg"
				className="rounded-full h-12 md:h-[52px] px-7 md:px-8 text-sm md:text-[15px]"
				aria-label={buttonLabel}
				aria-busy={isLoading}
			>
				{isLoading ? (
					<SpinnerGapIcon size={18} className="animate-spin" />
				) : isCurrentlyPlaying ? (
					<PauseIcon size={18} weight="fill" />
				) : (
					<ButtonIcon size={18} weight="fill" />
				)}
				<span className="whitespace-nowrap">{isLoading ? 'Loading' : buttonText}</span>
			</Button>

			{/* Watchlist */}
			<Button
				variant="ghost"
				size="icon"
				onClick={handleAddOrRemove}
				glow={isAdded}
				glowVariant="light"
				className={cn(secondaryBase, isAdded && 'bg-white/[0.12] text-white border-white/15')}
				aria-label={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
				title={isAdded ? 'In Watchlist' : 'Add to Watchlist'}
			>
				{isAdded ? <CheckIcon size={18} weight="bold" /> : <PlusIcon size={18} weight="bold" />}
			</Button>

			{/* Favorite */}
			{isDetailsPage && (
				<Button
					variant="ghost"
					size="icon"
					onClick={handleLike}
					glow={isLiked}
					glowVariant="accent"
					className={cn(
						secondaryBase,
						isLiked &&
							'bg-[#ff453a]/10 text-[#ff453a] border-[#ff453a]/20 hover:bg-[#ff453a]/15 hover:border-[#ff453a]/30'
					)}
					aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
					title={isLiked ? 'Favorited' : 'Add to Favorites'}
				>
					<HeartIcon size={18} weight={isLiked ? 'fill' : 'regular'} />
				</Button>
			)}

			{/* Info */}
			{!isDetailsPage && (
				<Button
					variant="ghost"
					size="icon"
					onClick={handleInfo}
					className={secondaryBase}
					aria-label="View details"
					title="More Info"
				>
					<InfoIcon size={18} />
				</Button>
			)}
		</div>
	);
}
