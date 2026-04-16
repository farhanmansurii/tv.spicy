import React, { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Show } from '@/lib/types';
import { tmdbImage } from '@/lib/tmdb-image';
import { Star, Play } from 'lucide-react';
import BlurFade from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';

interface MediaCardProps {
	index: number;
	show: Show;
	isVertical?: boolean;
	type: 'movie' | 'tv';
	onClick?: (show: Show) => void;
	rank?: number;
}

function MediaCardComponent({
	index,
	show,
	isVertical = false,
	type,
	onClick,
	rank,
}: MediaCardProps) {
	const mediaType = show.media_type || type;
	const effectiveIsVertical = isVertical;

	if (!mediaType) return <div className="bg-zinc-900 animate-pulse rounded-xl aspect-video" />;

	const imagePath = effectiveIsVertical ? show.poster_path : show.backdrop_path;
	const imageUrl = imagePath ? tmdbImage(imagePath, 'w500') : null;

	return (
		<Link
			href={`/${mediaType}/${show.id}`}
			onClick={() => onClick?.(show)}
			className="group block w-full outline-none select-none"
		>
			<div className="flex flex-col gap-3 w-full transition-transform duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] supports-[hover:hover]:group-hover:-translate-y-1">
				<div
					className={cn(
						'relative w-full overflow-hidden bg-zinc-900 transition-all duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
						'rounded-lg md:rounded-xl supports-[hover:hover]:group-hover:scale-[1.01] supports-[hover:hover]:group-hover:shadow-[0_12px_24px_rgba(0,0,0,0.35)]',
						effectiveIsVertical ? 'aspect-[2/3]' : 'aspect-video',
						rank ? 'ml-[10%]' : ''
					)}
				>
					{rank && (
						<span
							className="pointer-events-none absolute -left-[22%] bottom-0 z-10 select-none text-[6.5rem] font-black leading-none tracking-tighter"
							style={{
								WebkitTextStroke: '2px rgba(255,255,255,0.18)',
								color: 'transparent',
								fontFamily: 'ui-sans-serif, system-ui, sans-serif',
							}}
							aria-hidden="true"
						>
							{rank}
						</span>
					)}
					{imageUrl ? (
						<BlurFade
							key={imageUrl}
							delay={0.012 * (index % 8)}
							inView
							duration={0.25}
							yOffset={4}
							className="relative h-full w-full"
						>
							<Image
								src={imageUrl}
								alt=""
								fill
								loading="lazy"
								sizes={
									effectiveIsVertical
										? '(max-width: 640px) 45vw, (max-width: 1024px) 25vw, 16vw'
										: '(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw'
								}
								className="w-full h-full object-cover transition-transform duration-700 supports-[hover:hover]:group-hover:scale-[1.045] supports-[hover:hover]:group-hover:brightness-110"
							/>
							<div className="absolute inset-0 ring-1 ring-inset ring-white/[0.06] rounded-lg md:rounded-xl pointer-events-none" />
							<div className="absolute inset-0 flex items-center justify-center opacity-0 supports-[hover:hover]:group-hover:opacity-100 transition-opacity duration-300 bg-black/25">
								<div className="h-12 w-12 rounded-full bg-white/90 flex items-center justify-center shadow-lg transition-transform duration-300 supports-[hover:hover]:group-hover:scale-105">
									<Play className="w-5 h-5 text-black fill-black ml-0.5" />
								</div>
							</div>
						</BlurFade>
					) : (
						<div className="flex items-center justify-center w-full h-full text-xs font-medium text-zinc-700">
							No Image
						</div>
					)}
				</div>

				<div className="flex flex-col gap-0.5 px-1">
					<h3 className="text-sm md:text-base font-semibold text-zinc-300 line-clamp-2 leading-snug supports-[hover:hover]:group-hover:text-white transition-colors duration-300">
						{show.title || show.name}
					</h3>
					<div className="flex items-center gap-2 text-xs md:text-sm text-zinc-400 font-medium tabular-nums">
						<span>{(show.first_air_date || show.release_date)?.split('-')[0]}</span>
						{show.vote_average > 0 && (
							<>
								<span className="opacity-20">•</span>
								<div className="flex items-center gap-1">
									<Star className="w-3 h-3 fill-zinc-400 text-zinc-400 group-hover:fill-yellow-500 group-hover:text-yellow-500 transition-colors" />
									<span className="group-hover:text-zinc-400 transition-colors">
										{show.vote_average.toFixed(1)}
									</span>
								</div>
							</>
						)}
					</div>
				</div>
			</div>
		</Link>
	);
}

export default memo(MediaCardComponent);
MediaCardComponent.displayName = 'MediaCard';
