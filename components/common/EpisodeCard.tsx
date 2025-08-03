/* eslint-disable @next/next/no-img-element */
import React from 'react';
import Link from 'next/link';
import { ImageIcon } from 'lucide-react';
import { CarouselItem } from '@/components/ui/carousel';
import { tmdbImage } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import BlurFade from '../ui/blur-fade';
import { Episode } from '@/lib/types';

interface EpisodeCardProps {
	episode: Episode;
	toggle: (episode: Episode, event: React.MouseEvent<HTMLDivElement>) => void;
	active: boolean;
	view: 'grid' | 'list' | 'carousel';
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, active, toggle, view }) => {
	if (view === 'list') {
		return (
			<Link
				scroll={true}
				href={{
					query: {
						season: episode.season_number,
						episode: episode.episode_number,
					},
					hash: 'episode-player',
				}}
				onClick={(ev: any) => toggle(episode, ev)}
				className={cn(
					'p-3 rounded-md border transition cursor-pointer flex justify-between items-center',
					active ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
				)}
			>
				<div className="flex flex-col gap-1">
					<span className="font-medium text-sm">{episode.name}</span>
					{active && (
						<span className="text-xs  italic">Overview: {episode.overview}</span>
					)}
					<span className="text-xs text-muted-foreground">
						Season {episode.season_number}, Episode {episode.episode_number}
					</span>
					<span className="text-xs text-muted-foreground">
						{format(new Date(episode.air_date), 'd MMM yy')}
					</span>
				</div>
				<span className="text-xs text-muted-foreground whitespace-nowrap">
					{episode.runtime} mins
				</span>
			</Link>
		);
	}

	return (
		<CarouselItem
			onClick={(ev) => toggle(episode, ev)}
			className={cn(
				'group basis-[48.75%] md:basis-[32.75%] w-full duration-100 hover:scale-95'
			)}
		>
			<Link
				href={{
					query: {
						season: episode.season_number,
						episode: episode.episode_number,
					},
				}}
			>
				<div
					className={cn(
						'relative w-full aspect-video cursor-pointer overflow-hidden shadow group',
						active ? 'ring-2 ring-primary' : ''
					)}
					data-testid="movie-card"
				>
					{episode.still_path ? (
						<BlurFade key={episode.still_path} delay={0.02} inView>
							<img
								src={tmdbImage(episode.still_path, 'w500')}
								alt={episode.name}
								className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
							/>
						</BlurFade>
					) : (
						<div className="flex items-center justify-center w-full h-full bg-muted">
							<ImageIcon className="w-6 h-6 text-muted-foreground" />
						</div>
					)}

					<div className="absolute top-0 right-0 bg-primary text-background text-[10px] md:text-sm px-2 py-0.5">
						S{episode.season_number} E{episode.episode_number}
					</div>

					<div className="absolute inset-0 flex flex-col justify-end w-full p-2 bg-gradient-to-t from-background/80 via-background/70 to-background/10 text-foreground transition-all duration-300">
						<p className="text-xs items-center flex gap-1 md:text-sm text-muted-foreground mb-0.5">
							{format(new Date(episode.air_date), 'd MMM yy')}
							<span style={{ fontSize: '5px' }} className=" text-center  h-full ">
								●
							</span>
							{episode.runtime} mins
						</p>
						<p className="truncate text-sm md:text-lg font-medium">{episode.name}</p>
					</div>
				</div>
			</Link>
		</CarouselItem>
	);
};
