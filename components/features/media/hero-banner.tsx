'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tmdbImage } from '@/lib/tmdb-image';
import { StarIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import Container from '@/components/shared/containers/container';
import ContinueWatchingButton from '@/components/features/watchlist/continue-watching-button';
import type { TMDBImagesResponse, TMDBMovie, TMDBTVShow } from '@/lib/types/tmdb';

interface HeroBannerProps {
	show: (TMDBMovie & TMDBTVShow & { images?: TMDBImagesResponse }) & {
		media_type?: 'movie' | 'tv';
		content_ratings?: { results?: Array<{ iso_3166_1?: string; rating?: string }> };
		release_dates?: {
			results?: Array<{
				iso_3166_1?: string;
				release_dates?: Array<{ certification?: string }>;
			}>;
		};
	};
	type: 'movie' | 'tv';
	isDetailsPage?: boolean;
	loading?: 'eager' | 'lazy';
	priority?: boolean;
	isActive?: boolean;
}

export function HeroBanner({
	show,
	type,
	isDetailsPage = false,
	loading = 'lazy',
	priority = false,
	isActive = true,
}: HeroBannerProps) {
	const isMobile = useMediaQuery();
	const [imageLoaded, setImageLoaded] = useState(false);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);
	const imageContainerRef = useRef<HTMLDivElement>(null);

	const title = show.title || show.name || 'Untitled';
	const releaseDate = show.first_air_date || show.release_date;
	const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

	const rating =
		type === 'tv'
			? show.content_ratings?.results?.find((r) => r.iso_3166_1 === 'US')?.rating
			: show.release_dates?.results
					?.find((r) => r.iso_3166_1 === 'US')
					?.release_dates?.[0]?.certification;

	const runtime = show.episode_run_time?.[0] ?? show.runtime ?? null;
	const genreList = show.genres?.slice(0, 2).map((g) => g.name) ?? [];

	const backdrops = show.images?.backdrops || [];
	const posters = show.images?.posters || [];
	const logos = show.images?.logos || [];

	const backdrop =
		backdrops.find((img) => img.iso_639_1 === null)?.file_path || show.backdrop_path;
	const poster = posters.find((img) => img.iso_639_1 === null)?.file_path || show.poster_path;
	const logo = logos.find((img) => img.iso_639_1 === 'en')?.file_path || logos[0]?.file_path;

	// On detail pages, use backdrop everywhere — let CSS object-fit handle mobile cropping.
	// This avoids hydration mismatches from useMediaQuery defaulting to false on server.
	const currentImage = (isDetailsPage ? backdrop : isMobile ? poster : backdrop) || '';
	const nextEpisodeDate = show.next_episode_to_air?.air_date;
	const nextEpisodeLabel = (() => {
		if (!nextEpisodeDate) return null;
		const d = new Date(nextEpisodeDate);
		return d > new Date()
			? `in ${formatDistanceToNow(d)}`
			: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
	})();
	const shouldShowHeroRunStatus =
		isDetailsPage && type === 'tv' && show.status === 'Returning Series';

	// Tagline or overview excerpt for text-only heroes
	const tagline = show.tagline || '';
	const overviewExcerpt = show.overview
		? show.overview.length > 160
			? show.overview.slice(0, 160) + '...'
			: show.overview
		: '';

	useEffect(() => {
		setImageLoaded(false);
		setShouldAnimate(false);
	}, [currentImage]);

	const handleImageLoad = useCallback(() => {
		setImageLoaded(true);
		requestAnimationFrame(() => setShouldAnimate(true));
	}, []);

	// Failsafe: if image already loaded before hydration (cached/priority), trigger onLoad manually
	useEffect(() => {
		const img = imageContainerRef.current?.querySelector('img');
		if (img?.complete && img.naturalHeight > 0) {
			handleImageLoad();
		}
	}, [handleImageLoad]);

	// Ken Burns: slow zoom on active slide (disabled on detail pages to save GPU)
	useEffect(() => {
		if (isDetailsPage || !imageContainerRef.current) return;
		if (isActive) {
			imageContainerRef.current.style.transform = 'scale(1.08)';
		} else {
			imageContainerRef.current.style.transform = 'scale(1)';
		}
	}, [isActive, isDetailsPage]);

	return (
		<section
			className={cn(
				'relative w-full overflow-hidden bg-background',
				'h-[78vh] md:h-[88vh] lg:h-[92vh]'
			)}
		>
			{/* Background Image with Ken Burns */}
			<div className="absolute inset-0 z-0">
				{currentImage ? (
					<div
						ref={imageContainerRef}
						className={cn(
							'absolute inset-0 transition-transform duration-[12000ms] ease-[cubic-bezier(0.22,1,0.36,1)]',
							imageLoaded ? 'opacity-100' : 'opacity-0'
						)}
						style={{ willChange: imageLoaded ? 'transform' : 'auto' }}
					>
						<Image
							key={currentImage}
							src={tmdbImage(currentImage, isDetailsPage ? 'w1280' : isMobile ? 'w780' : 'w1280')}
							alt={`${title} backdrop`}
							fill
							priority={priority}
							sizes="100vw"
							className={cn(
								'w-full h-full object-cover',
								isDetailsPage ? 'object-top md:object-center' : isMobile ? 'object-top' : 'object-center'
							)}
							onLoad={handleImageLoad}
						/>
					</div>
				) : null}

				{/* Cinematic gradient stack — Apple TV+ style multi-layer scrim */}
				{/* Bottom-to-top: strongest fade at bottom */}
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 via-[20%] to-transparent" />
				{/* Left-to-right: content readability on left */}
				<div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
				{/* Top fade for header blend */}
				<div className="absolute inset-0 bg-gradient-to-b from-background/50 via-transparent to-transparent" />
				{/* Radial vignette for cinematic depth */}
				<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_70%,transparent_20%,rgba(0,0,0,0.55)_100%)]" />
				{/* Additional bottom scrim for text legibility */}
				<div className="absolute bottom-0 left-0 right-0 h-[45%] bg-gradient-to-t from-background via-background/60 to-transparent" />
			</div>

			{/* Content */}
			<div className="relative z-10 h-full flex flex-col justify-end">
				<Container variant={isDetailsPage ? 'detail' : 'default'} className="pb-12 md:pb-20 lg:pb-28">
					<div
						ref={contentRef}
						className={cn(
							'max-w-4xl flex flex-col items-center md:items-start text-center md:text-left',
							shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8',
							'transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]'
						)}
					>
						{/* Metadata — clean, minimal, Apple TV style */}
						<div className="flex flex-wrap items-center justify-center md:justify-start gap-x-2.5 gap-y-1 mb-6 md:mb-8">
							<span className="text-[11px] md:text-xs font-semibold text-white/50 uppercase tracking-[0.2em]">
								{type === 'tv' ? 'Series' : 'Movie'}
							</span>

							{genreList.length > 0 && (
								<>
									<span className="text-white/15">·</span>
									<span className="text-[11px] md:text-xs font-medium text-white/50 tracking-wide">
										{genreList.join(', ')}
									</span>
								</>
							)}

							{releaseYear && (
								<>
									<span className="text-white/15">·</span>
									<span className="text-[11px] md:text-xs font-medium text-white/50 tabular-nums">
										{releaseYear}
									</span>
								</>
							)}

							{runtime != null && runtime > 0 && (
								<>
									<span className="text-white/15">·</span>
									<span className="text-[11px] md:text-xs font-medium text-white/50 tabular-nums">
										{runtime}m
									</span>
								</>
							)}

							{rating && (
								<>
									<span className="text-white/15">·</span>
									<span className="text-[11px] md:text-xs font-semibold text-white/70 tracking-wide">
										{rating}
									</span>
								</>
							)}

							{(show.vote_average ?? 0) > 0 && (
								<>
									<span className="text-white/15">·</span>
									<span className="flex items-center gap-1 text-[11px] md:text-xs font-medium text-amber-400/90 tabular-nums">
										<StarIcon weight="fill" size={12} className="flex-shrink-0" />
										{(show.vote_average ?? 0).toFixed(1)}
									</span>
								</>
							)}
						</div>

						{/* Title / Logo — Apple TV+ uses massive logos, clamped text for titles */}
						<div className="flex flex-col items-center md:items-start gap-4 md:gap-5 w-full">
							{logo ? (
								<div className="relative w-full flex justify-center md:justify-start">
									<Image
										src={tmdbImage(logo, 'w500')}
										alt={title}
										width={720}
										height={360}
										loading={loading}
										sizes="(max-width: 768px) 90vw, 720px"
										className={cn(
											'w-auto h-auto',
											// Much larger logo treatment
											'max-h-[120px] sm:max-h-[160px] md:max-h-[220px] lg:max-h-[280px]',
											'max-w-[90%] md:max-w-xl lg:max-w-2xl xl:max-w-3xl',
											'object-contain object-center md:object-left',
											// Deep cinematic shadow
											'drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)]'
										)}
									/>
								</div>
							) : (
								<div className="w-full">
									<h1
										className={cn(
											// Hero 2-line iron rule: clamp ensures max 2-3 lines
											'text-[clamp(2.5rem,6vw,5.5rem)]',
											'font-bold text-white leading-[0.92] tracking-tight',
											'text-center md:text-left',
											'max-w-5xl'
										)}
									>
										{title}
									</h1>
									{tagline && (
										<p className="mt-3 md:mt-4 text-sm md:text-base text-white/40 font-medium italic max-w-lg tracking-wide">
											{tagline}
										</p>
									)}
									{!tagline && overviewExcerpt && (
										<p className="mt-4 md:mt-5 text-sm md:text-base text-white/45 leading-relaxed max-w-lg">
											{overviewExcerpt}
										</p>
									)}
								</div>
							)}

							{shouldShowHeroRunStatus && (
								<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 backdrop-blur-md">
									<span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
									<p className="text-xs md:text-sm font-medium text-white/95">
										{nextEpisodeLabel
											? `Running · Next episode ${nextEpisodeLabel}`
											: 'Running · Next episode TBA'}
									</p>
								</div>
							)}
						</div>

						{/* Action Bar — Apple TV style: large white play, minimal secondary actions */}
						<div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 mt-8 md:mt-12">
							<ContinueWatchingButton
								id={show.id}
								show={show}
								type={type}
								isDetailsPage={isDetailsPage}
							/>
						</div>
					</div>
				</Container>
			</div>
		</section>
	);
}
