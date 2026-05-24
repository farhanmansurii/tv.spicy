'use client';

import { memo, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Show } from '@/lib/types';
import { tmdbImage } from '@/lib/tmdb-image';
import { PlayIcon, StarIcon } from '@phosphor-icons/react';
import BlurFade from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';
import gsap from 'gsap';

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

	const shellRef = useRef<HTMLDivElement>(null);
	const imageRef = useRef<HTMLDivElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);
	const playBtnRef = useRef<HTMLDivElement>(null);
	const hoverTlRef = useRef<gsap.core.Timeline | null>(null);

	if (!mediaType) return <div className="bg-[#1C1C1E] animate-pulse rounded-2xl aspect-video" />;

	const imagePath = isVertical ? show.poster_path : show.backdrop_path;
	const imageUrl = imagePath ? tmdbImage(imagePath, 'w500') : null;
	const year = (show.first_air_date || show.release_date)?.split('-')[0];

	useEffect(() => {
		if (!imageUrl) return;

		const ctx = gsap.context(() => {
			// Set initial states
			gsap.set(overlayRef.current, { opacity: 0 });
			gsap.set(playBtnRef.current, { opacity: 0, scale: 0.6 });

			// Build hover timeline (paused)
			hoverTlRef.current = gsap.timeline({ paused: true })
				.to(imageRef.current, {
					scale: 1.06,
					duration: 0.55,
					ease: 'power2.out',
				}, 0)
				.to(overlayRef.current, {
					opacity: 1,
					duration: 0.3,
					ease: 'power2.out',
				}, 0)
				.to(playBtnRef.current, {
					opacity: 1,
					scale: 1,
					duration: 0.5,
					ease: 'back.out(1.8)',
				}, 0.08);
		}, shellRef);

		return () => ctx.revert();
	}, [imageUrl]);

	const handleMouseEnter = useCallback(() => {
		hoverTlRef.current?.play();
	}, []);

	const handleMouseLeave = useCallback(() => {
		hoverTlRef.current?.reverse();
	}, []);

	return (
		<Link
			href={`/${mediaType}/${show.id}`}
			onClick={() => onClick?.(show)}
			className="group block w-full outline-none select-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-2xl"
		>
			<div className="flex flex-col gap-2.5 w-full">
				{/* Card shell */}
				<div
					ref={shellRef}
					onMouseEnter={handleMouseEnter}
					onMouseLeave={handleMouseLeave}
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
								fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
								letterSpacing: '-0.05em',
							}}
							aria-hidden="true"
						>
							{rank}
						</span>
					)}

					{/* Image */}
					<div className="relative h-full w-full overflow-hidden rounded-xl md:rounded-2xl">
						{imageUrl ? (
							<BlurFade
								key={imageUrl}
								delay={0.01 * (index % 8)}
								inView
								duration={0.22}
								yOffset={6}
								className="relative h-full w-full"
							>
								{/* Image wrapper — GSAP scales this */}
								<div ref={imageRef} className="absolute inset-0 will-change-transform">
									<Image
										src={imageUrl}
										alt={show.title || show.name || ''}
										fill
										loading="lazy"
										sizes={
											isVertical
												? '(max-width: 640px) 45vw, (max-width: 1024px) 22vw, 14vw'
												: '(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 25vw'
										}
										className="w-full h-full object-cover"
									/>
								</div>

								{/* Persistent vignette */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none z-[1]" />

								{/* Hover darkening overlay — GSAP fades this */}
								<div
									ref={overlayRef}
									className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10 pointer-events-none z-[2]"
								/>

								{/* Liquid Glass play button — GSAP scales in */}
								<div className="absolute inset-0 flex items-center justify-center z-[3]">
									<div
										ref={playBtnRef}
										className={cn(
											'h-11 w-11 md:h-12 md:w-12 rounded-full flex items-center justify-center',
											'will-change-transform',
										)}
										style={{
											background: 'rgba(255,255,255,0.92)',
											backdropFilter: 'blur(20px) saturate(180%)',
											border: '1px solid rgba(255,255,255,0.30)',
											boxShadow: '0 8px 32px rgba(0,0,0,0.60), inset 0 1px 0 rgba(255,255,255,0.25)',
										}}
									>
										<PlayIcon weight="fill" size={18} className="text-black ml-0.5" />
									</div>
								</div>

							</BlurFade>
						) : (
							<div className="flex items-center justify-center w-full h-full text-xs font-medium text-zinc-700 tracking-wide">
								No Image
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
						style={{ fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif' }}
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
								<StarIcon weight="fill" size={11} color="#FFD60A" className="flex-shrink-0" aria-hidden="true" />
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
