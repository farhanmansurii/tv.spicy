'use client';

import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import useTVShowStore from '@/store/recentsStore';
import { Episode } from '@/lib/types';
import useWatchListStore from '@/store/watchlistStore';
import { useFavoritesStore } from '@/store/favoritesStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Play, Pause, Plus, Check, Info, Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GlowingButton } from '@/components/ui/glowing-button';

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
	const { recentlyWatched, loadEpisodes } = useTVShowStore();
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

	// Load episodes on mount
	useEffect(() => {
		loadEpisodes();
	}, [loadEpisodes]);

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
			.filter((ep: Episode) => String(ep.tv_id) === showId)
			.sort((a: Episode, b: Episode) => {
				if (b.season_number !== a.season_number) {
					return b.season_number - a.season_number;
				}
				return b.episode_number - a.episode_number;
			})[0];
	}, [recentlyWatched, id]);

	// Handle add/remove from watchlist
	const handleAddOrRemove = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (isAdded) {
				type === 'movie'
					? removeFromWatchList(Number(id))
					: removeFromTvWatchList(Number(id));
				toast.info('Removed from watchlist', {
					description: `${show?.name || show?.title || 'Item'} has been removed from your watchlist.`,
				});
			} else {
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
				removeFavorite(Number(id), type);
				toast.info('Removed from favorites');
			} else {
				addFavorite(show, type);
				toast.success('Added to favorites');
			}
		},
		[id, isLiked, show, type, addFavorite, removeFavorite]
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
					const params = new URLSearchParams();
					params.set('season', String(episodeToPlay.season_number));
					params.set('episode', String(episodeToPlay.episode_number));
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

	// Determine button text based on state
	const { buttonText, buttonLabel, ButtonIcon } = useMemo(() => {
		if (type === 'movie') {
			return {
				buttonText: 'Play',
				buttonLabel: 'Play Movie',
				ButtonIcon: Play,
			};
		}

		// TV Show logic
		if (isCurrentlyPlaying && displayEpisode) {
			// Currently playing - show "Playing" with Pause icon
			return {
				buttonText: `Playing S${displayEpisode.season_number} E${displayEpisode.episode_number}`,
				buttonLabel: `Now playing Season ${displayEpisode.season_number} Episode ${displayEpisode.episode_number}`,
				ButtonIcon: Pause,
			};
		}

		if (displayEpisode) {
			// Has active/recent episode - show "Resume"
			return {
				buttonText: `Resume S${displayEpisode.season_number} E${displayEpisode.episode_number}`,
				buttonLabel: `Resume Season ${displayEpisode.season_number} Episode ${displayEpisode.episode_number}`,
				ButtonIcon: Play,
			};
		}

		// Fresh start
		return {
			buttonText: 'Start Watching',
			buttonLabel: 'Start Watching from Episode 1',
			ButtonIcon: Play,
		};
	}, [type, isCurrentlyPlaying, displayEpisode]);

	// Button styles
	const iconButtonBase = cn(
		'bg-white/10 hover:bg-white/20',
		'border border-white/10',
		'text-white/90 hover:text-white'
	);

	return (
		<div className="flex items-center gap-3">
			{/* Play/Resume/Playing Button - Primary CTA */}
			<GlowingButton
				onClick={handlePlay}
				disabled={isLoading}
				glow
				glowVariant={isCurrentlyPlaying ? 'primary' : 'light'}
				className={cn(
					'h-11 md:h-12 px-5 md:px-6',
					'inline-flex items-center justify-center gap-2',
					'font-semibold text-sm',
					'transition-all duration-200 ease-out',
					'active:scale-[0.98]',
					'focus-visible:ring-offset-black',
					'disabled:opacity-60 disabled:pointer-events-none',
					isCurrentlyPlaying
						? 'bg-primary text-primary-foreground hover:bg-primary/90'
						: 'bg-white text-black hover:bg-white/90'
				)}
				aria-label={buttonLabel}
				aria-busy={isLoading}
			>
				{isLoading ? (
					<Loader2 className="w-[18px] h-[18px] animate-spin" />
				) : isCurrentlyPlaying ? (
					<Pause className="w-[18px] h-[18px] fill-current" strokeWidth={0} />
				) : (
					<ButtonIcon className="w-[18px] h-[18px] fill-current" />
				)}
				<span className="whitespace-nowrap">{isLoading ? 'Loading' : buttonText}</span>
			</GlowingButton>

			{/* Add to Watchlist Button */}
			<GlowingButton
				iconOnly
				onClick={handleAddOrRemove}
				glow={isAdded}
				glowVariant="light"
				className={cn(isAdded ? 'bg-white text-black hover:bg-white/90' : iconButtonBase)}
				aria-label={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
				title={isAdded ? 'In Watchlist' : 'Add to Watchlist'}
			>
				{isAdded ? (
					<Check className="w-5 h-5" strokeWidth={2.5} />
				) : (
					<Plus className="w-5 h-5" strokeWidth={2} />
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
						glowVariant="primary"
						className={cn(
							isLiked
								? 'bg-red-500/20 border border-red-500/30 text-red-500 hover:bg-red-500/30'
								: iconButtonBase
						)}
						aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
						title={isLiked ? 'Favorited' : 'Add to Favorites'}
					>
						<Heart
							className={cn('w-5 h-5', isLiked && 'fill-current')}
							strokeWidth={2}
						/>
					</GlowingButton>

				</>
			)}

			{/* Info Button (Non-Details Page) */}
			{!isDetailsPage && (
				<GlowingButton
					iconOnly
					onClick={handleInfo}
					glow={false}
					className={iconButtonBase}
					aria-label="View details"
					title="More Info"
				>
					<Info className="w-5 h-5" strokeWidth={2} />
				</GlowingButton>
			)}
		</div>
	);
}
