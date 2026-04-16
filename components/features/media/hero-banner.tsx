'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { tmdbImage } from '@/lib/tmdb-image';
import { Info, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import Container from '@/components/shared/containers/container';
import ContinueWatchingButton from '../watchlist/continue-watching-button';
import { GlowingButton } from '@/components/ui/glowing-button';
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
}

export function HeroBanner({
	show,
	type,
	isDetailsPage = false,
	loading = 'lazy',
	priority = false,
}: HeroBannerProps) {
	const isMobile = useMediaQuery();
	const [imageLoaded, setImageLoaded] = useState(false);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const contentRef = useRef<HTMLDivElement>(null);

	const title = show.title || show.name || 'Untitled';
	const releaseDate = show.first_air_date || show.release_date;
	const releaseYear = releaseDate ? new Date(releaseDate).getFullYear() : null;

	const rating =
		type === 'tv'
			? show.content_ratings?.results?.find((r) => r.iso_3166_1 === 'US')?.rating
			: show.release_dates?.results?.find((r) => r.iso_3166_1 === 'US')?.release_dates?.[0]
					?.certification;

	const runtime = show.episode_run_time?.[0] ?? show.runtime ?? null;
	const genreList = show.genres?.slice(0, 2).map((g) => g.name) ?? [];

	const backdrops = show.images?.backdrops || [];
	const posters = show.images?.posters || [];
	const logos = show.images?.logos || [];

	const backdrop =
		backdrops.find((img) => img.iso_639_1 === null)?.file_path || show.backdrop_path;
	const poster = posters.find((img) => img.iso_639_1 === null)?.file_path || show.poster_path;
	const logo = logos.find((img) => img.iso_639_1 === 'en')?.file_path || logos[0]?.file_path;

	const currentImage = (isMobile ? poster : backdrop) || '';
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

	// Reset image loaded state when image changes
	useEffect(() => {
		setImageLoaded(false);
		setShouldAnimate(false);
	}, [currentImage]);

	// Handle image load — useCallback so ref stays stable
	const handleImageLoad = useCallback(() => {
		setImageLoaded(true);
		// One rAF ensures the image is painted before the content fades in
		requestAnimationFrame(() => setShouldAnimate(true));
	}, []);

	return (
		<section
			className={cn(
				'relative w-full overflow-hidden bg-background',
				'h-[68vh] md:h-[80vh] lg:h-[85vh]'
			)}
		>
			<div className="absolute inset-0 z-0">
				{currentImage ? (
					<Image
						key={currentImage}
						src={tmdbImage(currentImage, isMobile ? 'w780' : 'w1280')}
						alt=""
						fill
						priority={priority}
						sizes="100vw"
						className={cn(
							'w-full h-full object-cover transition-opacity duration-700 ease-out',
							imageLoaded ? 'opacity-100' : 'opacity-0',
							isMobile ? 'object-top' : 'object-center'
						)}
						onLoad={handleImageLoad}
					/>
				) : null}
				{/* Cinematic bottom scrim — stronger base, fades cleanly */}
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 via-[35%] to-transparent" />
				{/* Left-side vignette keeps text legible on any image */}
				<div className="absolute inset-0 bg-gradient-to-r from-background/80 via-background/10 to-transparent" />
				{/* Top fade so bright images don't bleed into header */}
				<div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-transparent" />
			</div>

			<div className="relative z-10 h-full flex flex-col justify-end">
				<Container className="pb-6 md:pb-20">
					<div
						ref={contentRef}
						className={cn(
							'max-w-4xl flex flex-col transition-[opacity,transform] duration-500 ease-out',
							shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
						)}
					>
						{/* Unified metadata chips — all same pill style */}
						<div className="flex flex-wrap items-center gap-2 justify-center md:justify-start mb-3 md:mb-5 text-xs font-medium">
							{/* Type */}
							<span className="bg-white/[0.08] backdrop-blur-sm ring-1 ring-white/12 rounded-full px-2.5 py-0.5 text-zinc-300">
								{type === 'tv' ? 'Series' : 'Movie'}
							</span>

							{/* Genres */}
							{genreList.map((g) => (
								<span
									key={g}
									className="bg-white/[0.06] backdrop-blur-sm ring-1 ring-white/10 rounded-full px-2.5 py-0.5 text-zinc-400"
								>
									{g}
								</span>
							))}

							{/* Year */}
							{releaseYear && (
								<span className="bg-white/[0.06] backdrop-blur-sm ring-1 ring-white/10 rounded-full px-2.5 py-0.5 text-zinc-400 tabular-nums">
									{releaseYear}
								</span>
							)}

							{/* Runtime */}
							{runtime != null && runtime > 0 && (
								<span className="bg-white/[0.06] backdrop-blur-sm ring-1 ring-white/10 rounded-full px-2.5 py-0.5 text-zinc-400 tabular-nums">
									{runtime}m
								</span>
							)}

							{/* Age rating */}
							{rating && (
								<span className="bg-white/[0.08] backdrop-blur-sm ring-1 ring-white/15 rounded-full px-2.5 py-0.5 text-white/80 font-semibold tracking-wide">
									{rating}
								</span>
							)}

							{/* Score */}
							{(show.vote_average ?? 0) > 0 && (
								<span className="flex items-center gap-1 bg-yellow-500/10 backdrop-blur-sm ring-1 ring-yellow-500/20 rounded-full px-2.5 py-0.5 text-yellow-400 tabular-nums">
									<Star className="w-3 h-3 fill-current flex-shrink-0" />
									{(show.vote_average ?? 0).toFixed(1)}
								</span>
							)}
						</div>

						<div className="flex flex-col items-center md:items-start gap-3 md:gap-4">
							{logo ? (
								<Image
									src={tmdbImage(logo, 'w300')}
									alt={title}
									width={300}
									height={160}
									loading={loading}
									sizes="(max-width: 768px) 70vw, 300px"
									className="w-auto h-auto max-h-[70px] md:max-h-[160px] max-w-[70%] md:max-w-md object-contain object-center md:object-left drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
								/>
							) : (
								<h1 className="text-4xl md:text-7xl font-bold text-white leading-[0.9] text-center md:text-left">
									{title}
								</h1>
							)}
							{shouldShowHeroRunStatus && (
								<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
									<span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
									<p className="text-xs md:text-sm font-medium text-white/95">
										{nextEpisodeLabel
											? `Running · Next episode ${nextEpisodeLabel}`
											: 'Running · Next episode TBA'}
									</p>
								</div>
							)}
						</div>

						<div className="flex items-center justify-center md:justify-start gap-3 mt-6 md:mt-12">
							<ContinueWatchingButton
								id={show.id}
								show={show}
								type={type}
								isDetailsPage={isDetailsPage}
							/>
							<GlowingButton
								asChild
								iconOnly
								glow={false}
								className="bg-white/10 hover:bg-white/20 border border-white/10 text-white/90 hover:text-white"
								aria-label="Info"
								title="Info"
							>
								<a
									href={
										isDetailsPage ? '#show-details-info' : `/${type}/${show.id}`
									}
								>
									<Info className="w-5 h-5" strokeWidth={2} />
								</a>
							</GlowingButton>
						</div>
					</div>
				</Container>
			</div>
		</section>
	);
}
