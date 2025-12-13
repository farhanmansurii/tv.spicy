/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { Show } from '@/lib/types';
import { tmdbImage } from '@/lib/tmdb-image';
import { Star } from 'lucide-react';
import BlurFade from '@/components/ui/blur-fade';
import { cn } from '@/lib/utils';

export default function MediaCard({
	index,
	show,
	showRank,
	isVertical = false,
	type,
	onClick,
}: {
	index: number;
	show: Show;
	showRank?: boolean;
	isVertical?: boolean;
	type?: string;
	onClick?: (show: Show) => void;
}) {
	const mediaType = show.media_type || type;

	if (!mediaType) return <div className="bg-muted/20 animate-pulse rounded-lg aspect-video" />;

	const href = `/${mediaType}/${show.id}`;

	return (
		<Link
			href={href}
			onClick={() => onClick?.(show)}
			className="group block w-full outline-none"
		>
			<ShowCardContent show={show} index={index} isVertical={isVertical} />
		</Link>
	);
}

function ShowCardContent({
	show,
	index,
	isVertical,
}: {
	show: Show;
	index: number;
	isVertical?: boolean;
}) {
	const { title, name, backdrop_path, poster_path, first_air_date, release_date, vote_average } =
		show;

	const imagePath = isVertical ? poster_path : backdrop_path;
	const imageUrl = imagePath ? tmdbImage(imagePath, 'w500') : null;

	const displayTitle = title || name || 'Untitled';
	const year = (first_air_date || release_date)?.split('-')[0] || '';

	const aspectRatioClass = isVertical ? 'aspect-[2/3]' : 'aspect-video';

	return (
		<div className="flex flex-col gap-2 w-full">
			<div
				className={cn(
					'relative w-full overflow-hidden rounded-md md:rounded-lg bg-zinc-900 shadow-sm transition-all duration-300',
					'group-hover:shadow-xl group-hover:scale-[1.03] group-focus-visible:ring-2 group-focus-visible:ring-primary',
					aspectRatioClass
				)}
			>
				{imageUrl ? (
					<BlurFade key={imageUrl} delay={0.04 * index} inView className="h-full w-full">
						<img
							src={imageUrl}
							alt={displayTitle}
							loading="lazy"
							className="w-full h-full object-cover"
						/>
						<div className="absolute inset-0 rounded-md md:rounded-lg ring-1 ring-inset ring-white/10 pointer-events-none" />

						<div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
					</BlurFade>
				) : (
					<div className="flex items-center justify-center w-full h-full bg-muted/20 text-muted-foreground/50">
						<span className="text-xs">No Image</span>
					</div>
				)}
			</div>

			<div className="flex flex-col gap-0.5 px-0.5">
				<div className="flex items-center justify-between">
					<h3 className="text-sm font-semibold text-foreground leading-tight truncate pr-2 group-hover:text-primary transition-colors">
						{displayTitle}
					</h3>
				</div>

				<div className="flex items-center gap-2 text-[11px] text-muted-foreground font-medium">
					{vote_average > 0 && (
						<div className="flex items-center gap-1 text-foreground/80">
							<Star className="w-3 h-3 fill-foreground/80 text-foreground/80" />
							<span>{vote_average.toFixed(1)}</span>
						</div>
					)}

					{year && (
						<>
							<span className="text-muted-foreground/30">•</span>
							<span>{year}</span>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
