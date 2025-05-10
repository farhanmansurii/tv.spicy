/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import useTVShowStore from '@/store/recentsStore';
import Link from 'next/link';
import React, { useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { ArrowBigDownDashIcon, ChevronLeft, ChevronRight, ImageIcon, X } from 'lucide-react';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '../ui/carousel';
import { CaretRightIcon } from '@radix-ui/react-icons';
import { AnimatePresence } from 'framer-motion';
import { Motiondiv } from './MotionDiv';
import { cn } from '@/lib/utils';
import { tmdbImage } from '@/lib/tmdb-image';
import { TextGlitch } from '../animated-common/TextFlip';
import { Badge } from '../ui/badge';
import { Episode } from '@/lib/types';
import BlurFade from '../ui/blur-fade';

const RecentlyWatchedTV = () => {
	const { recentlyWatched, loadEpisodes, deleteRecentlyWatched } = useTVShowStore();

	useEffect(() => {
		loadEpisodes();
	}, []);

	function clearRecentlyWatched() {
		const store = useTVShowStore.getState();
		store.deleteRecentlyWatched();
	}
	return (
		recentlyWatched.length > 0 && (
			<Carousel opts={{ dragFree: true }} className="w-[99%]  mx-auto">
				<div className="flex  justify-between  mx-auto text-xl md:text-3xl items-center my-1   gap-4 py-2  flex-row">
					<div className="mx-1 flex gap-2 items-center">
						<h1 className="text-5xl truncate md:text-6xl  tracking-tight lowercase text-foreground">
							Recently Watched
						</h1>
					</div>
					<div className="flex  gap-2">
						<Button
							variant={'link'}
							size={'icon'}
							className={cn('w-10 h-10 text-red-500')}
							onClick={clearRecentlyWatched}
						>
							<X className="h-4 w-4" />
						</Button>
						<CarouselPrevious className="w-10 h-10" variant={'secondary'} />
						<CarouselNext className="w-10 h-10" variant={'secondary'} />
					</div>
				</div>
				<AnimatePresence>
					<CarouselContent className="gap-2 ">
						{recentlyWatched.map((show: Episode, index: number) => (
							<CarouselItem
								className={cn(
									`group basis-9/12 w-full  md:basis-1/3 lg:basis-[30%]   `
								)}
								key={show.id}
							>
								<Link
									href={`/tv/${show.show_id}?season=${show.season_number}&episode=${show.episode_number}`}
								>
									<div
										className="group relative w-full h-full cursor-pointer  overflow-hidden aspect-video  bg-muted shadow"
										data-testid="movie-card"
									>
										{show.still_path ? (
											<BlurFade
												key={show.still_path}
												delay={0.05 + index * 0.04}
												inView
											>
												<img
													src={tmdbImage(show.still_path, 'w500')}
													alt={show.name}
													className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
												/>
											</BlurFade>
										) : (
											<div className="flex items-center justify-center w-full h-full bg-muted">
												<ImageIcon className="w-6 h-6 text-muted-foreground" />
											</div>
										)}
										<div className="top-0 absolute text-[10px] md:text-sm flex flex-row right-0 ">
											<div className="px-2 py-0.5 text-background bg-primary">
												S{show.season_number} E{show.episode_number}
											</div>
										</div>
										<div className="absolute w-full pl-2 pb-1 bg-gradient-to-t from-background/80 via-background/70 to-background/10 inset-0 text-foreground flex align-bottom flex-col justify-end transition-all duration-300 ">
											<p className="text-xs md:text-sm text-muted-foreground mt-1">
												{show.runtime} mins
											</p>
											<div className="flex items-center justify-between text-sm md:text-xl">
												<p className=" truncate ">{show.name}</p>
											</div>
										</div>
									</div>
								</Link>
							</CarouselItem>
						))}
					</CarouselContent>
				</AnimatePresence>
			</Carousel>
		)
	);
};

export default RecentlyWatchedTV;
