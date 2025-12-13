'use client';

import * as React from 'react';
import Autoplay from 'embla-carousel-autoplay';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { tmdbImage } from '@/lib/tmdb-image';
import ContinueWatchingButton from '@/components/features/watchlist/continue-watching-button';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface HeroCarouselProps {
	shows: Show[];
	type: 'movie' | 'tv';
}

export default function HeroCarousel({ shows, type }: HeroCarouselProps) {
	const plugin = React.useRef(Autoplay({ delay: 8000, stopOnInteraction: true }));
	const validShows = shows?.filter((show) => show.backdrop_path || show.poster_path) || [];

	if (validShows.length === 0) return null;

	return (
		<div className="relative w-full group">
			<Carousel
				plugins={[plugin.current]}
				className="w-full"
				opts={{
					loop: true,
					align: 'start',
				}}
			>
				<CarouselContent className="-ml-0">
					{validShows.slice(0, 10).map((show, index) => {
						const releaseYear =
							(show.first_air_date || show.release_date)?.split('-')[0] || '';
						const runtime = (show as any).runtime
							? `${Math.floor((show as any).runtime / 60)}h ${(show as any).runtime % 60}m`
							: null;
						const rating =
							(show as any).content_ratings?.results?.find(
								(r: any) => r.iso_3166_1 === 'US'
							)?.rating || 'TV-MA';

						// Use poster for mobile, backdrop for desktop
						const posterPath = show.poster_path || show.backdrop_path;
						const backdropPath = show.backdrop_path || show.poster_path;

						return (
							<CarouselItem key={show.id} className="pl-0 relative w-full">
								<div className="w-full animate-in fade-in duration-700">
									<div className="relative w-full aspect-[2/3] md:aspect-[16/8] overflow-hidden md:rounded-[32px] bg-black shadow-2xl ring-1 ring-white/10 group">
										{/* Background Image */}
										<div className="absolute inset-0 z-0">
											{/* Mobile: Poster Image */}
											<img
												src={tmdbImage(posterPath, 'w500')}
												alt={show.title || show.name}
												className="w-full h-full object-cover opacity-80 transition-transform duration-[1.5s] ease-out group-hover:scale-105 md:hidden"
												loading={index === 0 ? 'eager' : 'lazy'}
											/>
											{/* Desktop: Backdrop Image */}
											<img
												src={tmdbImage(backdropPath, 'original')}
												alt={show.title || show.name}
												className="hidden w-full h-full object-cover opacity-80 transition-transform duration-[1.5s] ease-out group-hover:scale-105 md:block"
												loading={index === 0 ? 'eager' : 'lazy'}
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
											<div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent md:via-transparent" />
											<div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/60 to-transparent" />
										</div>
										<div className="relative z-10 h-full flex flex-col justify-end p-4 md:p-6 lg:p-12 lg:py-10">
											<div className="max-w-3xl flex flex-col items-start gap-4 md:gap-6">
												{/* Logo or Title */}
												{(show as any).images?.logos ? (
													(() => {
														const logo =
															(show as any).images?.logos?.find(
																(img: any) => img.iso_639_1 === 'en'
															)?.file_path ||
															(show as any).images?.logos?.find(
																(img: any) => img.iso_639_1 === null
															)?.file_path ||
															(show as any).images?.logos?.[0]
																?.file_path;
														return logo ? (
															<div className="w-full max-w-[240px] md:max-w-[320px] lg:max-w-[400px] xl:max-w-[500px] mb-2">
																<img
																	src={tmdbImage(logo, 'w500')}
																	alt={show.title || show.name}
																	className="w-full h-auto object-contain drop-shadow-2xl"
																	style={{
																		maskImage:
																			'linear-gradient(to bottom, black 90%, transparent 100%)',
																	}}
																/>
															</div>
														) : (
															<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter text-white drop-shadow-2xl">
																{show.title || show.name}
															</h1>
														);
													})()
												) : (
													<h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tighter text-white drop-shadow-2xl">
														{show.title || show.name}
													</h1>
												)}

												{/* Metadata Row */}
												<div className="flex flex-wrap items-center gap-3 text-sm font-medium text-white/90">
													{show.vote_average > 0 && (
														<Badge
															variant="secondary"
															className="bg-white/20 hover:bg-white/20 backdrop-blur-md text-white border-0 px-2 py-0.5 rounded text-xs font-semibold"
														>
															{Math.round(show.vote_average * 10)}%
															Match
														</Badge>
													)}

													{releaseYear && <span>{releaseYear}</span>}

													{show.number_of_seasons && (
														<>
															<span className="text-white/40">•</span>
															<span>
																{show.number_of_seasons} Seasons
															</span>
														</>
													)}

													{runtime && (
														<>
															<span className="text-white/40">•</span>
															<span>{runtime}</span>
														</>
													)}

													<span className="text-white/40">•</span>
													<span className="border border-white/30 px-1 rounded text-[10px] uppercase font-bold tracking-wider">
														{rating}
													</span>
													<span className="border border-white/30 px-1 rounded text-[10px] uppercase font-bold tracking-wider">
														4K
													</span>
												</div>

												{/* Overview */}
												{show.overview && (
													<p className="text-white/80 text-sm md:text-base lg:text-lg leading-relaxed font-medium line-clamp-2 md:line-clamp-3 lg:line-clamp-4 max-w-2xl drop-shadow-md">
														{show.overview}
													</p>
												)}

												{/* Action Buttons */}
												<div className="flex flex-wrap items-center gap-4 pt-2">
													<ContinueWatchingButton
														id={show.id}
														show={show}
														type={type}
														isDetailsPage={false}
													/>
												</div>

												{/* Genres */}
												{show.genres && show.genres.length > 0 && (
													<div className="flex flex-wrap gap-x-4 gap-y-2 mt-2">
														{show.genres
															.slice(0, 4)
															.map((genre: any) => (
																<span
																	key={genre.id || genre}
																	className="text-xs font-semibold text-white/50 hover:text-white transition-colors cursor-default"
																>
																	{typeof genre === 'string'
																		? genre
																		: genre.name}
																</span>
															))}
													</div>
												)}
											</div>
										</div>
									</div>
								</div>
							</CarouselItem>
						);
					})}
				</CarouselContent>

				{/* Navigation Buttons */}
				<div className="hidden md:flex absolute right-4 md:right-8 lg:right-12 bottom-20 md:bottom-24 z-20 gap-3">
					<CarouselPrevious className="static translate-y-0 h-12 w-12 rounded-full border-white/20 bg-black/40 hover:bg-black/60 text-white hover:text-white backdrop-blur-md transition-all duration-300" />
					<CarouselNext className="static translate-y-0 h-12 w-12 rounded-full border-white/20 bg-black/40 hover:bg-black/60 text-white hover:text-white backdrop-blur-md transition-all duration-300" />
				</div>
			</Carousel>
		</div>
	);
}
