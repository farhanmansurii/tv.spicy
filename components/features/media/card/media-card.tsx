'use client';

import { memo, useEffect, useRef, useState } from 'react';
import Link, { useLinkStatus } from 'next/link';
import { StarIcon } from '@phosphor-icons/react';
import type { Show } from '@/lib/types';
import { tmdbImage, tmdbImageSrcSet } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';

/** Shows the tap was heard during the one round trip before the route's loading skeleton streams in. */
function NavigationPendingBar() {
	const { pending } = useLinkStatus();
	return (
		<span
			aria-hidden="true"
			className={cn(
				'absolute inset-x-0 bottom-0 z-40 h-0.5 overflow-hidden transition-opacity duration-(--duration-ui)',
				pending ? 'opacity-100' : 'opacity-0'
			)}
		>
			<span className="block h-full w-full bg-brand animate-shimmer motion-reduce:animate-none" />
		</span>
	);
}

interface MediaCardProps {
	/** Row position. Kept for callers; the numbered badge comes from `rank`. */
	index: number;
	show: Show;
	isVertical?: boolean;
	type: 'movie' | 'tv';
	onClick?: (show: Show) => void;
	rank?: number;
	/** @deprecated The editorial card is the only card. Drop this at the call sites. */
	variant?: 'editorial';
}

function MediaCardComponent({
	show,
	isVertical = false,
	type,
	onClick,
	rank,
}: MediaCardProps) {
	const [imageError, setImageError] = useState(false);
	const imgRef = useRef<HTMLImageElement>(null);
	const [isImageLoaded, setIsImageLoaded] = useState(false);

	useEffect(() => {
		const img = imgRef.current;
		if (img?.complete && img.naturalWidth > 0) setIsImageLoaded(true);
	}, []);

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
	const score = show.vote_average;
	const hasScore = score > 0;

	if (!mediaType) return null;


	const meta = (
		<span className="flex flex-wrap items-center gap-x-2 gap-y-0.5 font-mono text-micro uppercase leading-tight tracking-meta text-muted-foreground">
			{year && <span className="tabular-nums">{year}</span>}
			<span>{mediaType === 'tv' ? 'Series' : 'Movie'}</span>
			{hasScore && (
				<span className="ml-auto inline-flex items-center gap-1 tabular-nums text-foreground">
					<StarIcon size={10} weight="fill" className="text-brand" aria-hidden="true" />
					{score.toFixed(1)}
				</span>
			)}
		</span>
	);

	const href = `/${mediaType}/${show.id}`;

	return (
		<Link
			href={href}
			prefetch={false}
			onClick={() => onClick?.(show)}
			aria-label={ranked ? `Rank ${rank}: ${title}` : title}
			className="group block w-full select-none rounded-sm outline-none transition-transform duration-(--duration-press) ease-out active:scale-97 motion-reduce:transition-none motion-reduce:active:scale-100"
		>
			<span
				className={cn(
					'relative isolate block w-full overflow-hidden rounded-sm bg-gradient-card-placeholder',
					usesPoster ? 'aspect-2/3' : 'aspect-video'
				)}
			>
				{imageUrl && !imageError ? (
										<img
						ref={imgRef}
						src={imageUrl}
						srcSet={imageSrcSet}
						sizes={imageSizes}
						alt=""
						loading="lazy"
						decoding="async"
						onLoad={() => setIsImageLoaded(true)}
						onError={() => setImageError(true)}
						className={cn(
							'absolute inset-0 size-full object-cover transform-gpu transition-[transform,scale,opacity] duration-(--duration-image) ease-entrance motion-safe:group-focus-visible:scale-104 motion-safe:group-can-hover:scale-104 motion-reduce:transform-none motion-reduce:transition-none',
							isImageLoaded ? 'opacity-100' : 'opacity-0'
						)}
					/>
				) : null}

				{!usesPoster && (
					// A missing image keeps the title in its normal overlay role on the
					// placeholder gradient, so it is never printed twice.
					<>
						<span
							aria-hidden="true"
							className="absolute inset-0 z-10 bg-linear-to-t from-background/80 via-background/20 via-55% to-transparent to-75%"
						/>
						<span
							aria-hidden="true"
							className="absolute inset-x-3.5 bottom-3 z-20 grid gap-1"
						>
							<span className="line-clamp-2 font-display text-display-card uppercase">
								{title}
							</span>
							{meta}
						</span>
					</>
				)}

				{ranked && (
					<span
						aria-hidden="true"
						className="absolute top-2 left-2 z-20 rounded-full bg-brand px-2 py-1 font-mono text-micro leading-none font-semibold tracking-meta text-brand-foreground tabular-nums"
					>
						{String(rank).padStart(2, '0')}
					</span>
				)}

				<span aria-hidden="true" className="pointer-events-none absolute inset-0 z-30 rounded-sm shadow-inset-line" />
				<NavigationPendingBar />
				<span
					aria-hidden="true"
					className="absolute inset-0 z-30 rounded-sm border-2 border-brand opacity-0 transition-opacity duration-(--duration-ui) ease-out group-focus-visible:opacity-100 group-can-hover:opacity-100"
				/>
			</span>

			{usesPoster && (
				<span className="mt-2.5 block">
					<span className="block truncate text-title leading-tight font-semibold text-foreground">
						{title}
					</span>
					<span className="mt-1 block">{meta}</span>
				</span>
			)}
		</Link>
	);
}

export default memo(MediaCardComponent);
MediaCardComponent.displayName = 'MediaCard';
