/* eslint-disable @next/next/no-img-element */
import { CarouselItem } from '@/components/ui/carousel';
import { tmdbImage } from '@/lib/tmdb-image';
import { cn } from '@/lib/utils';
import { ImageIcon, Info, Star } from 'lucide-react';
import React from 'react';
import { TextGlitch } from '../animated-common/TextFlip';
import { format } from 'date-fns';
import { Badge } from '../ui/badge';
import Link from 'next/link';
import { Episode } from '@/lib/types';
import { StarFilledIcon } from '@radix-ui/react-icons';
import { FaStar } from 'react-icons/fa';

interface EpisodeCardProps {
	episode: Episode;
	toggle: any;
	active: boolean;
}

export const EpisodeCard: React.FC<EpisodeCardProps> = ({ episode, active, toggle }) => {
	return (
		<CarouselItem
			className={cn(
				`group basis-[48.75%] w-full md:basis-[32.75%] group duration-100 hover:scale-95`
			)}
		>
			<Link
				onClick={(ev) => toggle(episode, ev)}
				href={{
					query: {
						season: episode.season_number,
						episode: episode.episode_number,
					},
				}}
			>
				<div key={episode.id} className="relative   ">
					<div
						style={{ aspectRatio: 16 / 9 }}
						className="relative h-full   flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/20 shadow"
					>
						{episode.still_path ? (
							<div>
								<img
									className={'object-cover   inset-0 object-fit'}
									src={tmdbImage(episode.still_path, 'w500')}
									alt={'title'}
								/>

								{active ? (
									<div className="absolute flex-col text-xs lg:text-md flex items-center  duration-200 ease-in-out inset-0 justify-center bg-black/70  text-primary">
										<svg
											fill="currentColor"
											viewBox="0 0 16 16"
											className="w-10 h-10"
										>
											<path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
										</svg>
										<span>Now Playing</span>
									</div>
								) : (
									<svg
										fill="currentColor"
										viewBox="0 0 16 16"
										height="2em"
										width="2em"
										className="absolute group-hover:opacity-100 opacity-0 scale-90 group-hover:scale-100 duration-200 ease-in-out bottom-0 right-0 m-4 text-white"
									>
										<path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
									</svg>
								)}
								<Badge className="absolute top-0 m-1 right-0">
									EP {episode.episode_number}
								</Badge>
							</div>
						) : (
							<div className="flex items-center justify-center w-full h-full bg-background">
								<ImageIcon className="text-muted" />
							</div>
						)}
					</div>
				</div>
				<div className="w-full items-center space-x-2  flex flex-row">
					<div className="my-2 w-full">
						<div
							className={cn(
								'flex items-start text-sm md:text-base justify-between gap-1',
								active && 'text-primary'
							)}
						>
							<TextGlitch>{episode.name}</TextGlitch>
						</div>
						<div
							className={`text-xs text-muted-foreground  w-full items-center flex gap-2 capitalize  ${''}`}
						>
							<span>{format(new Date(episode.air_date), 'd MMM yy')}</span>
							<span style={{ fontSize: '5px' }} className="text-xs">
								●
							</span>
							<span className="text-secondary-foreground">
								{' '}
								{episode.runtime} mins{' '}
							</span>
							<span style={{ fontSize: '5px' }} className="text-xs">
								●
							</span>
							<span className="flex gap-1 text-yellow-500 items-center">
								<FaStar className="scale-90" />
								{episode.vote_average.toFixed(1)}
							</span>
						</div>
					</div>
				</div>
			</Link>
		</CarouselItem>
	);
};
