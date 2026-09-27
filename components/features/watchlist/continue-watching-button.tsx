'use client';

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
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
import { flourishMyList } from '@/lib/motion';

interface ContinueWatchingButtonProps {
	id: string | number;
	show: any;
	type: 'movie' | 'tv';
	isDetailsPage?: boolean;
	tone?: 'default' | 'brand';
}

export default function ContinueWatchingButton({
	id,
	show,
	type,
	isDetailsPage = false,
	tone = 'default',
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
	const [animateWatchlistToggle, setAnimateWatchlistToggle] = useState(false);
	const [showWatchlistPulse, setShowWatchlistPulse] = useState(false);
	const toggleFeedbackTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const pulseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
	const watchlistActionId = useRef(0);
	const watchlistButtonRef = useRef<HTMLButtonElement | null>(null);
	const haptic = useHaptics();

	useEffect(
		() => () => {
			if (toggleFeedbackTimer.current) clearTimeout(toggleFeedbackTimer.current);
			if (pulseTimer.current) clearTimeout(pulseTimer.current);
		},
		[]
	);

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
		async (e: React.MouseEvent<HTMLButtonElement>) => {
			e.preventDefault();
			e.stopPropagation();
			const actionId = ++watchlistActionId.current;
			const isPointerAction = e.detail > 0;
			setAnimateWatchlistToggle(isPointerAction);
			if (toggleFeedbackTimer.current) clearTimeout(toggleFeedbackTimer.current);
			toggleFeedbackTimer.current = setTimeout(() => setAnimateWatchlistToggle(false), 220);
			setShowWatchlistPulse(false);
			if (pulseTimer.current) clearTimeout(pulseTimer.current);

			const label = show?.name || show?.title || 'Item';
			if (isAdded) {
				const ok =
					type === 'movie'
						? await removeFromWatchList(Number(id))
						: await removeFromTvWatchList(Number(id));
				if (ok) {
					if (actionId === watchlistActionId.current) {
						haptic('medium');
						toast.info('Removed from watchlist', {
							id: `watchlist:${type}:${id}`,
							description: `${label} has been removed from your watchlist.`,
						});
					}
				} else {
					if (actionId === watchlistActionId.current) haptic('error');
					toast.error('Could not update watchlist', {
						description: 'The change is saved on this device and will sync on retry.',
						action: {
							label: 'Retry',
							onClick: () => {
								void useWatchListStore.getState().retryFailedSync();
							},
						},
					});
				}
			} else {
				const ok =
					type === 'movie'
						? await addToWatchlist(show)
						: await addToTvWatchlist(show);
				if (ok) {
					if (actionId === watchlistActionId.current) {
						haptic('success');
						if (
							watchlistButtonRef.current &&
							typeof window !== 'undefined' &&
							window.matchMedia('(hover: hover) and (pointer: fine)').matches
						) {
							flourishMyList(watchlistButtonRef.current);
						}
						if (isPointerAction) {
							setShowWatchlistPulse(true);
							pulseTimer.current = setTimeout(() => setShowWatchlistPulse(false), 280);
						}
						toast.success('Added to watchlist', {
							id: `watchlist:${type}:${id}`,
							description: `${label} has been added to your watchlist.`,
						});
					}
				} else {
					if (actionId === watchlistActionId.current) haptic('error');
					toast.error('Could not update watchlist', {
						description: 'The change is saved on this device and will sync on retry.',
						action: {
							label: 'Retry',
							onClick: () => {
								void useWatchListStore.getState().retryFailedSync();
							},
						},
					});
				}
			}
		},
		[isAdded, type, id, show, haptic, addToWatchlist, addToTvWatchlist, removeFromWatchList, removeFromTvWatchList]
	);

	const handleLike = useCallback(
		async (e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();

			if (isLiked) {
				const ok = await removeFavorite(Number(id), type);
				if (ok) {
					haptic('medium');
					toast.info('Removed from favorites');
				} else {
					haptic('error');
					toast.error('Could not update favorites', {
						description: 'The change is saved on this device and will sync on retry.',
						action: {
							label: 'Retry',
							onClick: () => {
								void useFavoritesStore.getState().retryFailedSync();
							},
						},
					});
				}
			} else {
				const ok = await addFavorite(show, type);
				if (ok) {
					haptic('success');
					toast.success('Added to favorites');
				} else {
					haptic('error');
					toast.error('Could not update favorites', {
						description: 'The change is saved on this device and will sync on retry.',
						action: {
							label: 'Retry',
							onClick: () => {
								void useFavoritesStore.getState().retryFailedSync();
							},
						},
					});
				}
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
		haptic('light');
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
	}, [router, type, id, currentActiveEpisode, recentFromHistory, isCurrentlyPlaying, scrollToPlayer, haptic]);

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

	return (
		<div className="flex items-center gap-3 md:gap-3.5">
			{/* Primary CTA */}
			<Button
				onClick={handlePlay}
				disabled={isLoading}
				variant={tone === 'brand' ? 'brand' : 'default'}
				size="xl"
				shape="pill"
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
			<span className="relative inline-flex">
				<Button
					ref={watchlistButtonRef}
					variant={isAdded ? 'ghost' : 'glass'}
					size="icon-lg"
					onClick={handleAddOrRemove}
					glow={isAdded}
					glowVariant="light"
					aria-label={isAdded ? 'Remove from watchlist' : 'Add to watchlist'}
					aria-pressed={isAdded}
					title={isAdded ? 'In Watchlist' : 'Add to Watchlist'}
				>
					<span className="relative inline-flex size-4.5 items-center justify-center" aria-hidden="true">
						<PlusIcon
							size={18}
							weight="bold"
							className={cn(
								'absolute motion-reduce:rotate-0 motion-reduce:scale-100 motion-reduce:blur-none motion-reduce:transition-opacity',
								animateWatchlistToggle
									? 'transition-[opacity,filter,transform] duration-(--duration-ui) ease-out'
									: 'transition-none',
								isAdded
									? 'rotate-90 scale-95 opacity-0 blur-sm'
									: 'rotate-0 scale-100 opacity-100 blur-none motion-reduce:blur-none'
							)}
						/>
						<CheckIcon
							size={18}
							weight="bold"
							className={cn(
								'absolute motion-reduce:rotate-0 motion-reduce:scale-100 motion-reduce:blur-none motion-reduce:transition-opacity',
								animateWatchlistToggle
									? 'transition-[opacity,filter,transform] duration-(--duration-ui) ease-out'
									: 'transition-none',
								isAdded
									? 'rotate-0 scale-100 opacity-100 blur-none motion-reduce:blur-none'
									: '-rotate-90 scale-95 opacity-0 blur-sm'
							)}
						/>
					</span>
				</Button>
				<span
					aria-hidden="true"
					className={cn(
						'pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand transition-opacity duration-(--duration-fade) motion-reduce:transition-opacity',
						showWatchlistPulse ? 'opacity-100' : 'opacity-0'
					)}
				/>
			</span>

			{/* Favorite */}
			{isDetailsPage && (
				<Button
					variant={isLiked ? 'secondary' : 'glass'}
					size="icon-lg"
					onClick={handleLike}
					glow={isLiked}
					glowVariant="accent"
					aria-label={isLiked ? 'Remove from favorites' : 'Add to favorites'}
					title={isLiked ? 'Favorited' : 'Add to Favorites'}
				>
					<HeartIcon size={18} weight={isLiked ? 'fill' : 'regular'} />
				</Button>
			)}

			{/* Info */}
			{!isDetailsPage && (
				<Button
					variant="glass"
					size="icon-lg"
					onClick={handleInfo}
					aria-label="View details"
					title="More Info"
				>
					<InfoIcon size={18} />
				</Button>
			)}
		</div>
	);
}
