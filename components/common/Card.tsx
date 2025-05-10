/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { Show } from '@/lib/types';
import { tmdbImage } from '@/lib/tmdb-image';
import { TextGlitch } from '../animated-common/TextFlip';
import { ImageIcon } from 'lucide-react';
import BlurFade from '../ui/blur-fade';
import { Badge } from '../ui/badge';

export default function ShowCard({
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
	const href = `/${show.media_type || type}/${show.id}`;

	return (
		<Link
			href={href}
			onClick={() => onClick?.(show)}
			className="block transition-transform duration-150 ease-in-out "
		>
			<ShowCardContent show={show} index={index} type={type} isVertical={isVertical} />
		</Link>
	);
}

function ShowCardContent({
	show,
	index,
	type,
	isVertical,
}: {
	show: Show;
	index: number;
	type?: string;
	isVertical?: boolean;
}) {
	const { title, name, backdrop_path, first_air_date, release_date, vote_average, media_type } =
		show;

	const imageUrl = backdrop_path ? tmdbImage(backdrop_path, 'w500') : null;
	const displayTitle = title || name;
	const year = (first_air_date || release_date)?.split('-')[0] || '—';
	const contentType = (media_type || type || '').toLowerCase();

	return (
		<div
			className="group relative w-full h-full cursor-pointer  overflow-hidden aspect-video  bg-muted shadow"
			data-testid="movie-card"
		>
			{imageUrl ? (
				<BlurFade key={imageUrl} delay={0.05 + index * 0.04} inView>
					<img
						src={imageUrl}
						alt={displayTitle}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
					/>
				</BlurFade>
			) : (
				<div className="flex items-center justify-center w-full h-full bg-muted">
					<ImageIcon className="w-6 h-6 text-muted-foreground" />
				</div>
			)}
			<div className="top-0 absolute text-[10px] md:text-sm flex flex-row right-0 ">
				<div className="px-2 py-0.5 text-background bg-yellow-500">
					{vote_average.toFixed(1)}
				</div>
				<div className="px-2 py-0.5 text-background bg-primary">{contentType}</div>
			</div>
			<div className="absolute w-full pl-2 pb-1 bg-gradient-to-t from-background/80 via-background/70 to-background/10 inset-0 text-foreground flex align-bottom flex-col justify-end transition-all duration-300 ">
				<p className="text-xs md:text-sm text-muted-foreground mt-1">{year}</p>
				<div className="flex items-center justify-between text-sm md:text-xl">
					<p className=" truncate ">{displayTitle}</p>
				</div>
			</div>
		</div>
	);
}
