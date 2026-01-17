/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { tmdbImage } from '@/lib/tmdb-image';
import { Star, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useMediaQuery } from '@/store/mediaQueryStore';
import { useEpisodeStore } from '@/store/episodeStore';
import { Badge } from '@/components/ui/badge';
import Container from '@/components/shared/containers/container';
import ContinueWatchingButton from '../watchlist/continue-watching-button';
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
	const { activeEP, isPlaying } = useEpisodeStore();
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
				'h-[75vh] md:h-[80vh] lg:h-[85vh]'
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
				<Container className="pb-10 md:pb-20">
					<div
						ref={contentRef}
						className={cn(
							'max-w-4xl flex flex-col transition-all duration-500 ease-out',
							shouldAnimate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
						)}
						style={{ willChange: 'opacity, transform' }}
					>
						<div className="flex flex-wrap items-center gap-3 justify-center md:justify-start mb-3 md:mb-5">
							<Badge className="bg-white/10 text-white border-none backdrop-blur-xl px-2 py-0.5 uppercase text-[10px] font-black tracking-widest">
								{type === 'tv' ? 'Series' : 'Movie'}
							</Badge>
							<div className="flex items-center gap-2.5 text-[12px] font-bold text-zinc-400 tabular-nums">
								{releaseYear && <span>{releaseYear}</span>}
								{rating && (
									<span className="border border-white/20 px-1.5 py-0.5 rounded-sm text-[10px] text-white leading-none">
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
								<h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-[0.85] text-center md:text-left">
									{title}
								</h1>
							)}
							<p className="mt-3 md:mt-4 text-[10px] md:text-xs font-black text-zinc-500 tracking-[0.3em] uppercase">
								{genres} {runtime != null && runtime > 0 && ` • ${runtime}m`}
							</p>
						</div>

						<div className="max-w-2xl hidden md:block mt-7 md:mt-9">
							{isDetailsPage &&
							type === 'tv' &&
							activeEP &&
							String(activeEP.tv_id) === String(show.id) ? (
								<div
									className={cn(
										'inline-flex items-center gap-5 rounded-2xl border p-4 pr-10 backdrop-blur-3xl transition-all duration-300',
										isPlaying
											? 'bg-primary/[0.08] border-primary/20 hover:bg-primary/[0.12]'
											: 'bg-white/[0.03] border-white/10 hover:bg-white/[0.05]'
									)}
								>
									<div
										className={cn(
											'p-3 rounded-full shadow-lg transition-all duration-300',
											isPlaying
												? 'bg-primary shadow-primary/30'
												: 'bg-white/10 shadow-white/5'
										)}
									>
										{isPlaying ? (
											<Pause className="w-4 h-4 fill-black text-black" />
										) : (
											<Play className="w-4 h-4 fill-white text-white" />
										)}
									</div>
									<div className="text-left">
										<div className="flex items-center gap-2">
											{isPlaying && (
												<span className="relative flex h-2 w-2">
													<span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
													<span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
												</span>
											)}
											<h4
												className={cn(
													'text-[10px] font-black uppercase tracking-widest transition-colors duration-300',
													isPlaying ? 'text-primary' : 'text-zinc-500'
												)}
											>
												{isPlaying ? 'Now Playing' : 'Up Next'}
											</h4>
										</div>
										<p className="text-white font-bold text-base leading-tight">
											S{activeEP.season_number} E{activeEP.episode_number}:{' '}
											{activeEP.name}
										</p>
									</div>
								</div>
							) : (
								<p className="text-zinc-300 text-base md:text-lg leading-relaxed line-clamp-3 font-medium opacity-90 text-balance">
									{show.overview}
								</p>
							)}
						</div>

						<div className="flex justify-center md:justify-start mt-9 md:mt-12">
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
