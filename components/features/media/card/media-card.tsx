'use client';

import { memo, useState } from 'react';
import Link from 'next/link';
import { StarIcon } from '@phosphor-icons/react';
import type { Show } from '@/lib/types';
import { tmdbImage, tmdbImageSrcSet } from '@/lib/tmdb-image';
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
	const [imageError, setImageError] = useState(false);
	const mediaType = show.media_type || type;
	const ranked = typeof rank === 'number';
	const usesPoster = ranked || isVertical;
	const imagePath = usesPoster
		? show.poster_path || show.backdrop_path
		: show.backdrop_path || show.poster_path;
	const imageUrl = imagePath ? tmdbImage(imagePath, 'w500') : null;
	const imageSrcSet = imagePath ? tmdbImageSrcSet(imagePath) : undefined;
	const imageSizes = ranked
		? '(min-width: 1280px) 14vw, (min-width: 1024px) 17vw, (min-width: 768px) 24vw, 48vw'
		: usesPoster
			? '(min-width: 1280px) 16vw, (min-width: 1024px) 18vw, (min-width: 768px) 22vw, 42vw'
			: '(min-width: 1280px) 22vw, (min-width: 1024px) 31vw, (min-width: 640px) 48vw, 78vw';
	const title = show.title || show.name || 'Untitled';
	const year = (show.first_air_date || show.release_date)?.split('-')[0];

	if (!mediaType) {
		return <div className="aspect-video animate-pulse rounded-2xl bg-[#1C1C1E]" />;
	}

	return (
		<Link
			href={`/${mediaType}/${show.id}`}
			onClick={() => onClick?.(show)}
			aria-label={ranked ? `Rank ${rank}: ${title}` : title}
			className="group block w-full select-none rounded-2xl outline-none transition-transform duration-100 active:scale-[0.975] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/70 focus-visible:ring-offset-2 focus-visible:ring-offset-black motion-reduce:transition-none motion-reduce:active:scale-100"
		>
			<div className="flex w-full flex-col gap-2.5">
				<div className="relative w-full">
					<div
						className={cn(
							'relative z-10 w-full overflow-hidden rounded-xl bg-[#1C1C1E] ring-1 ring-inset ring-white/[0.08] transition-[box-shadow,transform] duration-300 group-hover:ring-white/[0.14] md:rounded-2xl',
							usesPoster ? 'aspect-[2/3]' : 'aspect-video'
						)}
					>
						{imageUrl && !imageError ? (
							<>
								<img
									src={imageUrl}
									srcSet={imageSrcSet}
									sizes={imageSizes}
									alt={title}
									loading="lazy"
									decoding="async"
									onError={() => setImageError(true)}
									className="h-full w-full object-cover transform-gpu transition-transform duration-500 ease-out group-hover:scale-[1.035] motion-reduce:transform-none motion-reduce:transition-none"
								/>
								<div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-black/[0.03]" />
							</>
						) : (
							<div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-950 p-4">
								<span className="line-clamp-2 text-center text-sm font-semibold leading-snug text-white/80">
									{title}
								</span>
							</div>
						)}

						{ranked && (
							<span className="pointer-events-none absolute left-2 top-2 z-20 inline-flex h-8 min-w-8 items-center justify-center rounded-full bg-white px-2 text-xs font-black tracking-[-0.02em] text-black shadow-[0_5px_18px_rgba(0,0,0,0.38)] ring-1 ring-black/10 sm:left-2.5 sm:top-2.5">
								#{rank}
							</span>
						)}
					</div>
				</div>

				<div className="min-w-0 px-0.5">
					<h3 className="line-clamp-1 text-sm font-semibold leading-snug tracking-[-0.01em] text-zinc-100 transition-colors group-hover:text-white md:text-[15px]">
						{title}
					</h3>
					<div className="mt-1 flex min-h-4 items-center gap-2 tabular-nums">
						{year && (
							<span className="text-xs text-white/38 md:text-[13px]">{year}</span>
						)}
						{show.vote_average > 0 && (
							<span className="inline-flex items-center gap-1 text-xs font-semibold text-[#FFD60A] md:text-[13px]">
								<StarIcon size={10} weight="fill" aria-hidden="true" />
								{show.vote_average.toFixed(1)}
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
