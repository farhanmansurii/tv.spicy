'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { Show } from '@/lib/types';
import { tmdbImage, tmdbImageSrcSet } from '@/lib/tmdb-image';
import { PlayIcon, StarIcon } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface MediaCardProps {
	index: number;
	show: Show;
	isVertical?: boolean;
	type: 'movie' | 'tv';
	onClick?: (show: Show) => void;
	rank?: number;
}

function MediaCardComponent({ show, isVertical = false, type, onClick, rank }: MediaCardProps) {
	const mediaType = show.media_type || type;

	const [imageError, setImageError] = useState(false);

	const imagePath = isVertical ? show.poster_path : show.backdrop_path;
	const imageUrl = imagePath ? tmdbImage(imagePath, 'w500') : null;
	const imageSrcSet = imagePath ? tmdbImageSrcSet(imagePath) : undefined;
	const imageSizes = isVertical
		? '(min-width: 1280px) 16vw, (min-width: 1024px) 18vw, (min-width: 768px) 22vw, 42vw'
		: '(min-width: 1280px) 22vw, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 82vw';
	const year = (show.first_air_date || show.release_date)?.split('-')[0];

	if (!mediaType) return <div className="bg-[#1C1C1E] animate-pulse rounded-2xl aspect-video" />;

	return (
		<Link
			href={`/${mediaType}/${show.id}`}
			onClick={() => onClick?.(show)}
			className="group block w-full outline-none select-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
		>
			<div className="flex flex-col gap-2.5 w-full">
				{/* Card shell */}
				<div
					className={cn(
						'relative w-full overflow-hidden bg-[#1C1C1E]',
						'rounded-xl md:rounded-2xl',
						isVertical ? 'aspect-[2/3]' : 'aspect-video',
						rank ? 'ml-[10%]' : ''
					)}
				>
					{/* Rank numeral */}
					{rank && (
						<span
							className="pointer-events-none absolute -left-[22%] bottom-[-4%] z-10 select-none font-black leading-none"
							style={{
								fontSize: 'clamp(5rem, 9vw, 8rem)',
								WebkitTextStroke: '1.5px rgba(255,255,255,0.12)',
								color: 'transparent',
								fontFamily:
									'-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
								letterSpacing: '-0.05em',
							}}
							aria-hidden="true"
						>
							{rank}
						</span>
					)}

					{/* Image */}
					<div className="relative h-full w-full overflow-hidden rounded-xl md:rounded-2xl">
						{imageUrl && !imageError ? (
							<div className="relative h-full w-full">
								{/* CSS keeps the hover effect compositor-friendly without a per-card animation instance. */}
								<div className="absolute inset-0 transform-gpu transition-transform duration-500 ease-out group-hover:scale-[1.06] motion-reduce:transform-none motion-reduce:transition-none">
									<img
										src={imageUrl}
										srcSet={imageSrcSet}
										sizes={imageSizes}
										alt={show.title || show.name || ''}
										loading="lazy"
										decoding="async"
										className="h-full w-full object-cover"
										onError={() => setImageError(true)}
									/>
								</div>

								{/* Persistent vignette */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-[1]" />

								{/* Hover darkening overlay */}
								<div className="absolute inset-0 z-[2] pointer-events-none bg-gradient-to-t from-black/80 via-black/30 to-black/10 opacity-0 transition-opacity duration-300 ease-out group-hover:opacity-100 motion-reduce:transition-none" />

								{/* Liquid Glass play button */}
								<div className="absolute inset-0 flex items-center justify-center z-[3]">
									<div
										className={cn(
											'h-11 w-11 md:h-12 md:w-12 rounded-full flex items-center justify-center',
											'opacity-0 scale-75 transition-[opacity,transform] duration-500 ease-out delay-75 group-hover:opacity-100 group-hover:scale-100 motion-reduce:transition-none'
										)}
										style={{
											background: 'rgba(255,255,255,0.92)',
											backdropFilter: 'blur(20px) saturate(180%)',
											border: '1px solid rgba(255,255,255,0.30)',
											boxShadow:
												'0 8px 32px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.25)',
										}}
									>
										<PlayIcon
											weight="fill"
											size={18}
											className="text-black ml-0.5"
										/>
									</div>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-zinc-800 to-zinc-950 px-4">
								<h4 className="text-sm md:text-base font-semibold text-white/90 text-center line-clamp-2 leading-snug">
									{show.title || show.name}
								</h4>
							</div>
						)}
					</div>

					{/* Inner border ring */}
					<div className="absolute inset-0 rounded-xl md:rounded-2xl ring-1 ring-inset ring-white/[0.06] pointer-events-none transition-all duration-300 group-hover:ring-white/[0.12]" />
				</div>

				{/* Below-card metadata */}
				<div className="flex flex-col gap-1 px-0.5">
					<h3
						className="text-sm md:text-[15px] font-semibold text-zinc-100 line-clamp-1 leading-snug transition-colors duration-300 group-hover:text-white"
						style={{
							fontFamily:
								'-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
						}}
					>
						{show.title || show.name}
					</h3>
					<div className="flex items-center gap-2 tabular-nums">
						{year && (
							<span className="text-xs md:text-[13px] text-zinc-500 transition-colors duration-300 group-hover:text-zinc-400">
								{year}
							</span>
						)}
						{show.vote_average > 0 && (
							<span className="flex items-center gap-1">
								<StarIcon
									weight="fill"
									size={11}
									color="#FFD60A"
									className="flex-shrink-0"
									aria-hidden="true"
								/>
								<span
									className="text-xs md:text-[13px] font-semibold"
									style={{ color: '#FFD60A' }}
								>
									{show.vote_average.toFixed(1)}
								</span>
							</span>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}

export default memo(MediaCardComponent);
MediaCardComponent.displayName = 'MediaCard';
