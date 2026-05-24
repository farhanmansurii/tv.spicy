'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import useTVShowStore from '@/store/recentsStore';
import useWatchListStore from '@/store/watchlistStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { PlayIcon, PauseIcon, PlusIcon, CheckIcon, InfoIcon, HeartIcon, SpinnerGapIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { GlowingButton } from '@/components/ui/glowing-button';
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
	const { recentlyWatched, initialize } = useTVShowStore();
	const { activeEP, isPlaying } = useEpisodeStore();
	const {
		addToWatchlist,
		removeFromWatchList,
		addToTvWatchlist,
		removeFromTvWatchList,
		watchlist,
		tvwatchlist,
	} = useWatchListStore();
	const { favoriteMovies, favoriteTV, addFavorite, removeFavorite } = useFavoritesStore();

	const [isLoading, setIsLoading] = useState(false);
	const haptic = useHaptics();

	// Load episodes on mount
	useEffect(() => {
		initialize();
	}, [initialize]);

	// Check if this show is currently playing (on details page)
	const isCurrentlyPlaying = useMemo(() => {
		if (!isDetailsPage || type !== 'tv' || !activeEP || !isPlaying) return false;
		return String(activeEP.tv_id) === String(id);
	}, [isDetailsPage, type, activeEP, isPlaying, id]);

	// Get the currently active episode for this show (even if not playing)
	const currentActiveEpisode = useMemo(() => {
		if (!isDetailsPage || type !== 'tv' || !activeEP) return null;
		if (String(activeEP.tv_id) !== String(id)) return null;
		return activeEP;
	}, [isDetailsPage, type, activeEP, id]);

	// Check if item is liked
	const isLiked = useMemo(() => {
		const itemId = Number(id);
		if (type === 'movie') {
			return favoriteMovies.some((item: any) => item.id === itemId);
		} else {
			return favoriteTV.some((item: any) => item.id === itemId);
		}
	}, [id, type, favoriteMovies, favoriteTV]);

	// Memoize watchlist status
	const isAdded = useMemo(() => {
		const itemId = Number(id);
		return type === 'movie'
			? watchlist.some((s) => s?.id === itemId)
			: tvwatchlist.some((s) => s?.id === itemId);
	}, [type, watchlist, tvwatchlist, id]);

	// Find most recent episode from watch history
	const recentFromHistory = useMemo(() => {
		const showId = String(id);
		return recentlyWatched
			.filter((item) => String(item.mediaId) === showId && item.mediaType === 'tv')
			.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0];
	}, [recentlyWatched, id]);

	// Handle add/remove from watchlist
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
		[
			isAdded,
			type,
			id,
			show,
			haptic,
			addToWatchlist,
			addToTvWatchlist,
			removeFromWatchList,
			removeFromTvWatchList,
		]
	);

	// Handle like/unlike
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

	// Handle scroll to player (when already playing)
	const scrollToPlayer = useCallback(() => {
		const playerElement = document.querySelector('[data-player-container]');
		if (playerElement) {
			playerElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, []);

	// Handle play/resume
	const handlePlay = useCallback(async () => {
		haptic('medium');
		// If currently playing this show, just scroll to player
		if (isCurrentlyPlaying) {
			scrollToPlayer();
			return;
		}

		setIsLoading(true);

		try {
			if (type === 'tv') {
				// Use active episode if on details page, otherwise use history
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
		} catch (error) {
			toast.error('Navigation failed');
		} finally {
			setIsLoading(false);
		}
	}, [
		router,
		type,
		id,
		currentActiveEpisode,
		recentFromHistory,
		isCurrentlyPlaying,
		haptic,
		scrollToPlayer,
	]);

	// Handle info button
	const handleInfo = useCallback(() => {
		if (!isDetailsPage) {
			router.push(`/${type}/${id}`);
		}
	}, [router, type, id, isDetailsPage]);

	// Determine which episode to show in button (prioritize active over history)
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

	// Determine button text based on state
	const { buttonText, buttonLabel, ButtonIcon } = useMemo(() => {
		if (type === 'movie') {
			return {
				buttonText: 'Play',
				buttonLabel: 'Play Movie',
				ButtonIcon: PlayIcon,
			};
		}

		// TV Show logic
		if (isCurrentlyPlaying && displayEpisode) {
			// Currently playing - show "Playing" with Pause icon
			return {
				buttonText: `Playing S${displaySeasonNumber} E${displayEpisodeNumber}`,
				buttonLabel: `Now playing Season ${displaySeasonNumber} Episode ${displayEpisodeNumber}`,
				ButtonIcon: PauseIcon,
			};
		}

		if (displayEpisode) {
			// Has active/recent episode - show "Resume"
			return {
				buttonText: `Resume S${displaySeasonNumber} E${displayEpisodeNumber}`,
				buttonLabel: `Resume S${displaySeasonNumber} E${displayEpisodeNumber}`,
				ButtonIcon: PlayIcon,
			};
		}

		// Fresh start
		return {
			buttonText: 'Start Watching',
			buttonLabel: 'Start Watching from Episode 1',
			ButtonIcon: PlayIcon,
		};
	}, [type, isCurrentlyPlaying, displayEpisode, displaySeasonNumber, displayEpisodeNumber]);

	// Secondary button shared styles — glassmorphism pill
	const secondaryBtnBase = cn(
		'h-11 w-11 md:h-12 md:w-12',
		'bg-white/[0.08] hover:bg-white/[0.14]',
		'border border-white/[0.12] hover:border-white/20',
		'text-white/80 hover:text-white',
		'backdrop-blur-sm',
		'transition-all duration-200 ease-out',
		'hover:shadow-[0_0_20px_rgba(255,255,255,0.06)]'
	);

	return (
		<div className="flex items-center gap-3 md:gap-3.5">
			{/* Primary CTA — Apple TV style: large white rounded pill with black text */}
			<GlowingButton
				onClick={handlePlay}
				disabled={isLoading}
				glow={false}
				className={cn(
					// Size: substantial, Apple TV proportions
					'h-12 md:h-[52px] px-7 md:px-8',
					// Typography: bold, clean
					'font-semibold text-sm md:text-[15px] tracking-tight',
					// Layout
					'inline-flex items-center justify-center gap-2.5',
					// Colors: high contrast white-on-black or black-on-white
					isCurrentlyPlaying
						? 'bg-white text-black hover:bg-white/90'
						: 'bg-white text-black hover:bg-white/90',
					// Hover physics
					'hover:-translate-y-px hover:shadow-[0_12px_32px_rgba(255,255,255,0.15)]',
					'active:scale-[0.97] active:translate-y-0',
					// Disabled
					'disabled:opacity-60 disabled:pointer-events-none',
					// Transition
					'transition-all duration-200 ease-out'
				)}
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
			</GlowingButton>

			{/* Add to Watchlist — glass pill */}
			<GlowingButton
				iconOnly
				onClick={handleAddOrRemove}
				glow={isAdded}
				glowVariant="light"
				className={cn(
					secondaryBtnBase,
					isAdded && 'bg-white/[0.14] border-white/25 text-white'
				)}
				aria-label={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
				title={isAdded ? 'In Watchlist' : 'Add to Watchlist'}
			>
				{isAdded ? (
					<CheckIcon size={18} weight="bold" />
				) : (
					<PlusIcon size={18} weight="bold" />
				)}
			</GlowingButton>

			{/* Details Page Actions */}
			{isDetailsPage && (
				<>
					{/* Favorite Button */}
					<GlowingButton
						iconOnly
						onClick={handleLike}
						glow={isLiked}
						glowVariant="accent"
						className={cn(
							secondaryBtnBase,
							isLiked
								? 'bg-red-500/15 border-red-500/25 text-red-400 hover:bg-red-500/25 hover:border-red-500/35'
								: secondaryBtnBase
						)}
						aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
						title={isLiked ? 'Favorited' : 'Add to Favorites'}
					>
						<HeartIcon size={18} weight={isLiked ? 'fill' : 'regular'} />
					</GlowingButton>
				</>
			)}

			{/* Info Button (Non-Details Page) */}
			{!isDetailsPage && (
				<GlowingButton
					iconOnly
					onClick={handleInfo}
					glow={false}
					className={secondaryBtnBase}
					aria-label="View details"
					title="More Info"
				>
					<InfoIcon size={18} />
				</GlowingButton>
			)}
		</div>
	);
}
