'use client';

import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
	CheckIcon,
	PlayIcon,
	PlusIcon,
	ShareNetworkIcon,
} from '@phosphor-icons/react';
import { useGSAP } from '@gsap/react';
import { TitleDisplay } from '@/components/ui/title-display';
import { MediaFallback } from '@/components/ui/media-fallback';
import { StickyActionBar } from '@/components/ui/sticky-action-bar';
import { arrival, flourishMyList, isReducedMotion } from '@/lib/motion';
import { useHaptics } from '@/hooks/use-haptics';
import useWatchListStore from '@/store/watchlistStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { tmdbImage } from '@/lib/tmdb-image';
import { toast } from 'sonner';
import { buttonIconLabelClass } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

interface Genre {
	id: number;
	name: string;
}

interface HeroImage {
	iso_639_1: string | null;
	file_path: string;
}

interface ShowData {
	id?: number;
	title?: string | null;
	name?: string | null;
	original_title?: string | null;
	original_name?: string | null;
	tagline?: string | null;
	overview?: string | null;
	backdrop_path?: string | null;
	poster_path?: string | null;
	first_air_date?: string | null;
	release_date?: string | null;
	runtime?: number | null;
	episode_run_time?: number[] | null;
	number_of_seasons?: number | null;
	seasons?: Array<{ season_number: number; episode_count?: number }> | null;
	vote_average?: number | null;
	vote_count?: number | null;
	genres?: Genre[];
	images?: {
		posters?: HeroImage[];
		backdrops?: HeroImage[];
	};
}

interface DetailHeroProps {
	show: ShowData;
	type: 'movie' | 'tv';
}

function DetailHeroComponent({ show, type }: DetailHeroProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const artRef = useRef<HTMLDivElement>(null);
	const overlineRef = useRef<HTMLParagraphElement>(null);
	const quoteRef = useRef<HTMLQuoteElement>(null);
	const ratingRef = useRef<HTMLParagraphElement>(null);
	const synopsisRef = useRef<HTMLParagraphElement>(null);
	const actionsRef = useRef<HTMLDivElement>(null);
	const listBtnRef = useRef<HTMLButtonElement>(null);
	const stickyListBtnRef = useRef<HTMLButtonElement>(null);

	const activeEP = useEpisodeStore((s) => s.activeEP);
	const haptic = useHaptics();

	const watchlist = useWatchListStore((s) => s.watchlist);
	const tvwatchlist = useWatchListStore((s) => s.tvwatchlist);
	const addToWatchlist = useWatchListStore((s) => s.addToWatchlist);
	const removeFromWatchList = useWatchListStore((s) => s.removeFromWatchList);
	const addToTvWatchlist = useWatchListStore((s) => s.addToTvWatchlist);
	const removeFromTvWatchList = useWatchListStore((s) => s.removeFromTvWatchList);
	const retryFailedSync = useWatchListStore((s) => s.retryFailedSync);

	const [backdropError, setBackdropError] = useState(false);
	const [isOverviewExpanded, setIsOverviewExpanded] = useState(false);
	const [canExpandOverview, setCanExpandOverview] = useState(false);

	const title = show.title || show.name || 'Untitled';
	const originalTitle = show.original_title || show.original_name || undefined;
	const releaseDate = show.first_air_date || show.release_date || null;
	const releaseYear = releaseDate ? releaseDate.split('-')[0] : null;

	const runtime = show.episode_run_time?.[0] ?? show.runtime ?? null;
	const seasonsCount =
		show.number_of_seasons ??
		(show.seasons ? show.seasons.filter((s) => s.season_number > 0).length : null);

	const voteAvg =
		typeof show.vote_average === 'number' && show.vote_average > 0 ? show.vote_average : null;
	const voteCount = typeof show.vote_count === 'number' ? show.vote_count : null;
	const hasRating = voteAvg !== null && (voteCount === null || voteCount >= 10);
	const voteCountText =
		voteCount !== null && voteCount >= 10
			? `${new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 }).format(voteCount)} ratings`
			: '';

	const genreNames = show.genres?.map((g) => g.name).filter(Boolean) ?? [];
	const genres = genreNames.slice(0, 2);

	const cleanBackdrop =
		show.images?.backdrops?.find((img) => img.iso_639_1 === null)?.file_path ||
		show.backdrop_path ||
		show.poster_path;
	// A textless poster frames a portrait phone screen better than a centre-cropped backdrop.
	const phonePoster = show.images?.posters?.find((img) => img.iso_639_1 === null)?.file_path;

	const activeEpisodeForShow =
		type === 'tv' && activeEP && String(activeEP.tv_id) === String(show.id) ? activeEP : null;

	const isInWatchlist = useMemo(() => {
		if (!show.id) return false;
		const items = type === 'movie' ? watchlist : tvwatchlist;
		return items.some((item) => item.id === show.id);
	}, [show.id, type, watchlist, tvwatchlist]);

	const primaryLabel =
		type === 'movie'
			? 'Play'
			: activeEpisodeForShow
				? `Resume S${activeEpisodeForShow.season_number} E${activeEpisodeForShow.episode_number}`
				: 'Play';

	const scrollToSection = useCallback((id: string) => {
		const target = document.getElementById(id);
		if (!target) return;
		target.scrollIntoView({
			behavior: isReducedMotion() ? 'auto' : 'smooth',
			block: 'start',
		});
	}, []);

	const handlePrimaryAction = useCallback(() => {
		haptic('medium');
		if (type === 'tv' && !activeEpisodeForShow) {
			const epSection = document.getElementById('episodes-section');
			if (epSection) {
				scrollToSection('episodes-section');
				return;
			}
		}
		scrollToSection('media-player');
	}, [activeEpisodeForShow, haptic, scrollToSection, type]);

	const handleWatchlist = useCallback(async () => {
		if (!show.id) return;
		const watchlistItem = {
			id: show.id,
			title: show.title ?? undefined,
			name: show.name ?? undefined,
			poster_path: show.poster_path ?? null,
			backdrop_path: show.backdrop_path ?? null,
			overview: show.overview ?? null,
			media_type: type,
		};
		const removing = isInWatchlist;
		haptic(removing ? 'medium' : 'success');

		if (!removing) {
			if (listBtnRef.current) flourishMyList(listBtnRef.current);
			if (stickyListBtnRef.current) flourishMyList(stickyListBtnRef.current);
		}

		const ok =
			type === 'movie'
				? removing
					? await removeFromWatchList(show.id)
					: await addToWatchlist(watchlistItem)
				: removing
					? await removeFromTvWatchList(show.id)
					: await addToTvWatchlist(watchlistItem);

		if (ok) {
			toast(removing ? 'Removed from My List' : 'Added to My List');
		} else {
			toast.error('Could not update My List', {
				description: 'Your change is saved on this device and will sync on retry.',
				action: {
					label: 'Retry',
					onClick: () => {
						void retryFailedSync();
					},
				},
			});
		}
	}, [
		addToTvWatchlist,
		addToWatchlist,
		haptic,
		isInWatchlist,
		removeFromTvWatchList,
		removeFromWatchList,
		retryFailedSync,
		show,
		type,
	]);

	const handleShare = useCallback(async () => {
		const shareData = { title, url: window.location.href };
		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(window.location.href);
				toast.success('Link copied to clipboard');
			}
		} catch (error) {
			if ((error as Error).name !== 'AbortError') {
				toast.error('Unable to share');
			}
		}
	}, [title]);

	const toggleOverview = useCallback(() => {
		const next = !isOverviewExpanded;
		setIsOverviewExpanded(next);
		if (next && synopsisRef.current && !isReducedMotion()) {
			gsap.fromTo(
				synopsisRef.current,
				{ opacity: 0.6 },
				{ opacity: 1, duration: 0.18, ease: 'power2.out' }
			);
		}
	}, [isOverviewExpanded]);

	useEffect(() => {
		const checkOverview = () => {
			if (synopsisRef.current) {
				setCanExpandOverview(
					synopsisRef.current.scrollHeight > synopsisRef.current.clientHeight + 2 ||
						isOverviewExpanded
				);
			}
		};
		checkOverview();
		window.addEventListener('resize', checkOverview);
		return () => window.removeEventListener('resize', checkOverview);
	}, [show.overview, isOverviewExpanded]);

	// The arrival runs inside a GSAP context, so an unmount (or the StrictMode
	// remount in dev) reverts it to the natural state instead of killing a from()
	// timeline and leaving the inline opacity it applied behind.
	useGSAP(
		() => {
			if (!sectionRef.current) return;

			// Attach DOM query classes needed by the arrival recipe
			artRef.current?.classList.add('dv-art');
			overlineRef.current?.classList.add('dv-overline');
			quoteRef.current?.classList.add('dv-quote');
			ratingRef.current?.classList.add('dv-rating');
			synopsisRef.current?.classList.add('dv-synopsis');
			actionsRef.current?.classList.add('dv-actions');

			arrival(sectionRef.current);
		},
		{ scope: sectionRef }
	);

	return (
		<>
			<section
				ref={sectionRef}
				aria-labelledby="dv-title"
				className="relative isolate flex hero-detail-height items-end overflow-hidden px-gutter pt-28 pb-10 md:min-h-screen md:pt-32 md:pb-20"
			>
				{/* Backdrop art */}
				<div
					ref={artRef}
					className="absolute inset-0 -z-10 overflow-hidden bg-surface shadow-inset-line"
					aria-hidden="true"
				>
					{cleanBackdrop && !backdropError ? (
						<picture>
							{phonePoster && (
								<source media="(max-width: 767px)" srcSet={tmdbImage(phonePoster, 'w780')} />
							)}
							<img
							src={tmdbImage(cleanBackdrop, 'w1280')}
							alt=""
							loading="eager"
							fetchPriority="high"
							decoding="async"
							onError={() => setBackdropError(true)}
							className="size-full object-cover object-top md:object-center"
						/>
						</picture>
					) : (
						<MediaFallback variant="backdrop" />
					)}
				</div>

				{/* Shade overlay */}
				<div
					className="pointer-events-none absolute inset-0 -z-5 bg-detail-shade"
					aria-hidden="true"
				/>


				{/* Content column */}
				<div className="relative z-10 w-full max-w-3xl">
					{/* Overline / Caption */}
					<p
						ref={overlineRef}
						className="flex flex-wrap items-center gap-x-5 gap-y-2 mb-4 font-mono text-caption uppercase text-text tracking-label tabular-nums"
					>
						<span
							className="inline-block w-7 h-0.5 mr-1 bg-brand shrink-0"
							aria-hidden="true"
						/>
						<span>{type === 'tv' ? 'Series' : 'Movie'}</span>
						{releaseYear && <span>{releaseYear}</span>}
						{type === 'tv' && seasonsCount ? (
							<span>
								<span className="font-mono tabular-nums">
									{seasonsCount}
								</span>{' '}
								{seasonsCount === 1 ? 'Season' : 'Seasons'}
							</span>
						) : runtime && runtime > 0 ? (
							<span>
								{runtime >= 60 ? (
									<>
										<span className="font-mono tabular-nums">
											{Math.floor(runtime / 60)}
										</span>
										h{' '}
										<span className="font-mono tabular-nums">
											{runtime % 60}
										</span>
										m
									</>
								) : (
									<>
										<span className="font-mono tabular-nums">
											{runtime}
										</span>
										m
									</>
								)}
							</span>
						) : null}
						{genres.map((genre, index) => (
							<span
								key={genre}
								className={index > 0 ? 'hidden sm:inline' : undefined}
							>
								{genre}
							</span>
						))}
					</p>

					{/* Display title */}
					<TitleDisplay
						title={title}
						originalTitle={originalTitle}
						as="h1"
						id="dv-title"
						splitWords={true}
						className="mb-0"
					/>

					{/* Tagline */}
					{show.tagline &&
						show.tagline.trim().length > 0 &&
						show.tagline.length <= 120 && (
							<blockquote
								ref={quoteRef}
								className="my-5 max-w-xl font-sans text-body leading-normal text-soft line-clamp-2 md:text-lede md:leading-relaxed"
							>
								“{show.tagline.trim()}”
							</blockquote>
						)}

					{/* Score / Rating */}
					{hasRating ? (
						<p
							ref={ratingRef}
							className="mt-5 mb-4 flex flex-wrap items-baseline gap-2.5 tabular-nums"
						>
							<strong className="text-title tabular-nums text-text">
								{voteAvg.toFixed(1)}
							</strong>
							<span
								className="select-none text-lede text-brand"
								aria-hidden="true"
							>
								★
							</span>
							<span className="font-mono text-caption uppercase text-dim tracking-label">
								/ 10{voteCountText ? ` · ${voteCountText}` : ''}
							</span>
						</p>
					) : (
						<p
							ref={ratingRef}
							className="mt-5 mb-4 flex flex-wrap items-baseline gap-2.5 font-mono text-caption uppercase text-dim tracking-label"
						>
							NOT YET RATED
						</p>
					)}

					{/* Clamped Overview */}
					{show.overview && (
						<div className="mt-4 max-w-xl">
							<p
								id="dv-synopsis"
								ref={synopsisRef}
								className={cn(
									'font-sans text-body leading-normal text-soft text-pretty md:text-lede md:leading-relaxed',
									!isOverviewExpanded && 'line-clamp-3'
								)}
							>
								{show.overview}
							</p>
							{/* The slot is always reserved: whether the synopsis overflows is only known after layout. */}
							<div className="mt-2 h-6">
								{canExpandOverview && (
									<button
										type="button"
										id="dv-more"
										aria-expanded={isOverviewExpanded}
										aria-controls="dv-synopsis"
										onClick={toggleOverview}
										className="inline-block font-sans font-medium text-ui tracking-normal text-text underline underline-offset-4 cursor-pointer can-hover:text-soft"
									>
										{isOverviewExpanded ? 'Less' : 'More'}
									</button>
								)}
							</div>
						</div>
					)}

					{/* Action buttons */}
					<div
						id="dv-actions"
						ref={actionsRef}
						className="mt-6 flex items-center gap-2.5"
					>
						<button
							type="button"
							onClick={handlePrimaryAction}
							className={cn(
								buttonIconLabelClass,
								'flex h-12 min-w-36 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-5 font-sans text-ui font-medium tracking-normal text-brand-foreground transition-[background-color,transform] duration-(--duration-press) ease-out can-hover:bg-brand-hover active:scale-97 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 sm:flex-none sm:px-6'
							)}
						>
							<PlayIcon weight="fill" aria-hidden="true" />
							<span>{primaryLabel}</span>
						</button>

						<button
							type="button"
							ref={listBtnRef}
							onClick={handleWatchlist}
							aria-pressed={isInWatchlist}
							aria-label="My List"
							className={cn(
								buttonIconLabelClass,
								'flex h-12 shrink-0 cursor-pointer items-center gap-2 rounded-full border bg-canvas/50 px-4 font-sans text-ui font-medium tracking-normal transition-transform duration-(--duration-press) active:scale-97 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 sm:px-5',
								isInWatchlist
									? 'border-brand text-brand'
									: 'border-line-strong can-hover:border-line text-text'
							)}
						>
							<span
								className="relative flex size-[1cap] shrink-0 items-center justify-center"
								aria-hidden="true"
							>
								<PlusIcon
									weight="bold"
									className={cn(
										'absolute transition-opacity duration-200',
										isInWatchlist ? 'opacity-0' : 'opacity-100'
									)}
									data-icon="plus"
								/>
								<CheckIcon
									weight="bold"
									className={cn(
										'absolute size-[1cap] text-brand transition-opacity duration-200',
										isInWatchlist ? 'opacity-100' : 'opacity-0'
									)}
									data-icon="check"
								/>
							</span>
							My List
						</button>

						<button
							type="button"
							onClick={handleShare}
							aria-label="Share"
							title="Share"
							className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong can-hover:border-line bg-canvas/50 text-text transition-transform duration-(--duration-press) active:scale-97 motion-reduce:active:scale-100 focus-visible:outline-2 focus-visible:outline-brand focus-visible:outline-offset-2 cursor-pointer"
						>
							<ShareNetworkIcon size={18} aria-hidden="true" />
						</button>
					</div>
				</div>
			</section>

			{/* Sticky action bar on mobile */}
			<StickyActionBar targetId="dv-actions" className="translate-y-0">
				<div className="flex w-full items-center justify-between gap-2.5">
					<button
						type="button"
						onClick={handlePrimaryAction}
						className={cn(
							buttonIconLabelClass,
							'flex h-12 flex-1 cursor-pointer items-center justify-center gap-2 rounded-full bg-brand px-4 font-sans text-ui font-medium tracking-normal text-brand-foreground transition-transform duration-(--duration-press) active:scale-97 motion-reduce:active:scale-100 can-hover:bg-brand-hover'
						)}
					>
						<PlayIcon weight="fill" aria-hidden="true" />
						<span className="truncate">{primaryLabel}</span>
					</button>
					<button
						type="button"
						ref={stickyListBtnRef}
						onClick={handleWatchlist}
						aria-pressed={isInWatchlist}
						aria-label="My List"
						className={cn(
							'flex size-12 shrink-0 items-center justify-center rounded-full border bg-canvas/50 text-text transition-transform duration-(--duration-press) active:scale-97 motion-reduce:active:scale-100 cursor-pointer',
							isInWatchlist ? 'border-brand text-brand' : 'border-line-strong'
						)}
					>
						{isInWatchlist ? (
							<CheckIcon
								size={18}
								weight="bold"
								className="text-brand"
								data-icon="check"
							/>
						) : (
							<PlusIcon size={18} weight="bold" data-icon="plus" />
						)}
					</button>
					<button
						type="button"
						onClick={handleShare}
						aria-label="Share"
						className="flex size-12 shrink-0 items-center justify-center rounded-full border border-line-strong bg-canvas/50 text-text transition-transform duration-(--duration-press) active:scale-97 motion-reduce:active:scale-100 cursor-pointer"
					>
						<ShareNetworkIcon size={18} />
					</button>
				</div>
			</StickyActionBar>
		</>
	);
}

export default memo(DetailHeroComponent);
DetailHeroComponent.displayName = 'DetailHero';
