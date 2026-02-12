'use client';

import React, { useState, useEffect, useRef } from 'react';
import { tmdbImage } from '@/lib/tmdb-image';
import { Info, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import { Badge } from '@/components/ui/badge';
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
}

export function HeroBanner({
	show,
	type,
	isDetailsPage = false,
	loading = 'eager',
}: HeroBannerProps) {
	const isMobile = useMediaQuery();
	const [imageLoaded, setImageLoaded] = useState(false);
	const [shouldAnimate, setShouldAnimate] = useState(false);
	const imageRef = useRef<HTMLImageElement>(null);
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
	const genres = show.genres
		?.map((g) => g.name)
		.slice(0, 2)
		.join(' • ');

	const backdrops = show.images?.backdrops || [];
	const posters = show.images?.posters || [];
	const logos = show.images?.logos || [];

	const backdrop =
		backdrops.find((img) => img.iso_639_1 === null)?.file_path || show.backdrop_path;
	const poster = posters.find((img) => img.iso_639_1 === null)?.file_path || show.poster_path;
	const logo = logos.find((img) => img.iso_639_1 === 'en')?.file_path || logos[0]?.file_path;

	const currentImage = (isMobile ? poster : backdrop) || '';
	const nextEpisodeDate = show.next_episode_to_air?.air_date;
	const nextEpisodeLabel = nextEpisodeDate
		? new Date(nextEpisodeDate).toLocaleDateString('en-US', {
				month: 'short',
				day: 'numeric',
				year: 'numeric',
		  })
		: null;
	const shouldShowHeroRunStatus = isDetailsPage && type === 'tv' && show.status === 'Returning Series';

	// Reset image loaded state when image changes
	useEffect(() => {
		setImageLoaded(false);
		setShouldAnimate(false);
	}, [currentImage]);

	// Handle image load
	const handleImageLoad = () => {
		setImageLoaded(true);
		// Small delay to ensure image is fully rendered before animating
		setTimeout(() => {
			setShouldAnimate(true);
		}, 50);
	};

	// Check if image is already loaded (cached)
	useEffect(() => {
		if (imageRef.current?.complete && imageRef.current.naturalWidth > 0) {
			handleImageLoad();
		}
	}, [currentImage]);

	return (
		<section
			className={cn(
				'relative w-full overflow-hidden bg-background',
				'h-[68vh] md:h-[80vh] lg:h-[85vh]'
			)}
		>
			<div className="absolute inset-0 z-0">
				<img
					ref={imageRef}
					key={currentImage}
					src={tmdbImage(currentImage, 'original')}
					alt=""
					className={cn(
						'w-full h-full object-cover transition-opacity duration-700 ease-out',
						imageLoaded ? 'opacity-100' : 'opacity-0',
						isMobile ? 'object-top' : 'object-center'
					)}
					style={{ willChange: 'opacity' }}
					onLoad={handleImageLoad}
					loading={loading}
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
				<div className="absolute inset-0 hidden md:block bg-[radial-gradient(circle_at_left_center,rgba(9,9,11,0.8)_0%,transparent_75%)]" />
			</div>

			<div className="relative z-10 h-full flex flex-col justify-end">
				<Container className="pb-6 md:pb-20">
					<div
						ref={contentRef}
						className={cn(
							'max-w-4xl flex flex-col transition-all duration-500 ease-out',
							shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
						)}
						style={{ willChange: 'opacity, transform' }}
					>
						<div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-3 md:mb-5">
							<Badge className="bg-white/10 text-white border-none backdrop-blur-xl px-2 py-0.5 text-xs font-semibold">
								{type === 'tv' ? 'Series' : 'Movie'}
							</Badge>
							<div className="flex items-center gap-2.5 text-xs md:text-sm font-medium text-zinc-300 tabular-nums">
								{releaseYear && <span>{releaseYear}</span>}
								{rating && (
									<span className="border border-white/20 px-1.5 py-0.5 rounded-sm text-xs text-white leading-none">
										{rating}
									</span>
								)}
								{(show.vote_average ?? 0) > 0 && (
									<div className="flex items-center gap-1 text-yellow-500">
										<Star className="w-3.5 h-3.5 fill-current" />
										<span>{(show.vote_average ?? 0).toFixed(1)}</span>
									</div>
								)}
							</div>
						</div>

						<div className="flex flex-col items-center md:items-start gap-3 md:gap-4">
							{logo ? (
								<img
									src={tmdbImage(logo, 'w500')}
									alt={title}
									className="h-auto max-h-[70px] md:max-h-[160px] max-w-[70%] md:max-w-md object-contain object-center md:object-left drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
								/>
							) : (
								<h1 className="text-4xl md:text-7xl font-bold text-white leading-[0.9] text-center md:text-left">
									{title}
								</h1>
							)}
							<p className="mt-3 md:mt-4 text-xs md:text-sm font-medium text-zinc-300/90">
								{genres} {runtime != null && runtime > 0 && ` • ${runtime}m`}
							</p>
							{shouldShowHeroRunStatus && (
								<div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 backdrop-blur-md">
									<span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
									<p className="text-xs md:text-sm font-medium text-white/95">
										{nextEpisodeLabel
											? `Running • Next Episode ${nextEpisodeLabel}`
											: 'Running • Next Episode TBA'}
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
								<a href="#show-details-info">
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
