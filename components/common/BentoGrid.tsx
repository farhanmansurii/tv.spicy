/* eslint-disable @next/next/no-img-element */
'use client';

import Link from 'next/link';
import { Show } from '@/lib/types';
import { cn } from '@/lib/utils';
import CommonTitle from '../animated-common/CommonTitle';

type Props = {
	title: string;
	shows: Show[];
	type: string;
};

const streamingLayoutTailwind = {
	desktop: [
		{ className: 'feature-movie col-span-4 row-span-2', imageType: 'backdrop' },
		{ className: 'feature-highlight col-span-2 row-span-2', imageType: 'poster' },
		{ className: 'poster-slot col-span-2 row-span-1', imageType: 'backdrop' },
		{ className: 'poster-slot col-span-1 row-span-1', imageType: 'poster' },
		{ className: 'poster-slot col-span-3 row-span-1', imageType: 'backdrop' },
		{ className: 'poster-slot col-span-1 row-span-1', imageType: 'poster' },
		{ className: 'backdrop-slot col-span-3 row-span-1', imageType: 'backdrop' },
		{ className: 'poster-slot col-span-1 row-span-1', imageType: 'poster' },
		{ className: 'poster-slot col-span-1 row-span-1', imageType: 'poster' },
	],
	mobile: [
		{ className: 'col-span-7 row-span-3', imageType: 'backdrop' },
		{ className: 'col-span-5 row-span-4', imageType: 'poster' },
		{ className: 'col-span-7 row-span-3', imageType: 'backdrop' },
		{ className: 'col-span-5 row-span-3', imageType: 'poster' },
		{ className: 'col-span-3 row-span-3', imageType: 'poster' },
		{ className: 'col-span-4 row-span-3', imageType: 'poster' },
		{ className: 'col-span-5 row-span-4', imageType: 'poster' },
		{ className: 'col-span-7 row-span-2', imageType: 'backdrop' },
	],
};

const GridItem = ({
	show,
	imageType,
	className,
	type,
	index,
	isFeatured,
	isMobile,
}: {
	show: Show;
	imageType: 'poster' | 'backdrop';
	className: string;
	type: string;
	index: number;
	isFeatured: boolean;
	isMobile: boolean;
}) => {
	const path =
		imageType === 'backdrop'
			? show.backdrop_path || show.poster_path
			: show.poster_path || show.backdrop_path;
	if (!path) return null;

	const size = imageType === 'backdrop' ? 'w780' : 'w342';
	const url = `https://image.tmdb.org/t/p/${size}${path}`;
	const titleText = show.title || show.name;

	return (
		<div
			className={cn(
				'relative group group-hover:border-2 border-transparent group-hover:border-primary overflow-hidden',
				className
			)}
		>
			<Link href={`/${type}/${show.id}`} className="block w-full h-full">
				<img
					src={url}
					alt={titleText}
					loading={index > 3 ? 'lazy' : 'eager'}
					className="absolute inset-0 w-full h-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex flex-col justify-end">
					<h3
						className={cn(
							'text-white font-semibold line-clamp-2',
							isFeatured ? 'text-xl md:text-4xl ' : 'text-sm md:text-xl'
						)}
					>
						{titleText}
					</h3>
					{!isMobile && isFeatured && show.overview && (
						<p className="mt-2  text-white/80 text-xs md:text-base line-clamp-3">
							{show.overview}
						</p>
					)}
				</div>
			</Link>
		</div>
	);
};

export default function BentoGrid({ title, shows, type }: Props) {
	if (!shows?.length) return null;

	const renderGrid = (
		layout: typeof streamingLayoutTailwind.desktop | typeof streamingLayoutTailwind.mobile,
		isMobile: boolean
	) => (
		<div
			className={cn(
				'grid gap-1',
				isMobile
					? 'grid-cols-12 auto-rows-[60px] md:hidden'
					: 'grid-cols-6 auto-rows-[200px] hidden md:grid'
			)}
		>
			{shows.slice(0, layout.length).map((show, index) => {
				const { className, imageType } = layout[index];
				const isFeatured = index === 0;
				return (
					<GridItem
						key={show.id}
						show={show}
						imageType={imageType as 'backdrop' | 'poster'}
						className={className}
						type={type}
						isMobile={isMobile}
						index={index}
						isFeatured={isFeatured}
					/>
				);
			})}
		</div>
	);

	return (
		<section className="max-w-5xl mx-auto">
			<CommonTitle text={title} className="mb-4" />
			{renderGrid(streamingLayoutTailwind.mobile, true)}
			{renderGrid(streamingLayoutTailwind.desktop, false)}
		</section>
	);
}
