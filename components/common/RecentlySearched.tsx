/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
'use client';
import Link from 'next/link';
import React from 'react';
import { ImageIcon } from 'lucide-react';
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
import { TextGlitch } from '../animated-common/TextFlip';
import useSearchStore from '@/store/recentsSearchStore';

const RecentlySearchedTV = () => {
	const { recentlySearched, addToRecentlySearched } = useSearchStore();
	return (
		recentlySearched.length > 0 && (
			<Carousel opts={{ dragFree: true }} className="w-[99%]  mx-auto">
				<div className="flex font-bold justify-between  mx-auto text-xl md:text-3xl items-center my-1 py-1 flex-row">
					<div className="mx-1 flex gap-2 items-center">
						<h1 className="text-xl md:2x; flex  font-bold">Recently Watched</h1>
						<div>
							<CaretRightIcon className="h-full " />
						</div>
					</div>
					<div className="flex  gap-2">
						<CarouselPrevious variant={'secondary'} />
						<CarouselNext variant={'secondary'} />
					</div>
				</div>
				<AnimatePresence>
					<CarouselContent className="gap-2 ">
						{recentlySearched.map((show: any, index: number) => (
							<CarouselItem
								className={cn(
									`group basis-7/12 w-full  md:basis-1/3 lg:basis-3/12   `
								)}
								key={show.id}
							>
								<Link
									href={`/tv/${show.tv_id}?season=${show.season}&episode=${show.episode}`}
								>
									<Motiondiv
										initial="hidden"
										animate="visible"
										transition={{
											delay: index * 0.1,
											ease: 'easeInOut',
											duration: 0.5,
										}}
										viewport={{ amount: 0 }}
										custom={index}
									>
										<div
											className="w-full h-full group group-hover:scale-95 duration-100 cursor-pointer space-y-2"
											data-testid="movie-card"
										>
											<div
												style={{ aspectRatio: 16 / 9 }}
												className="relative h-full  flex aspect-video w-full items-center justify-center overflow-hidden rounded-md border bg-background/50 shadow"
											>
												{show.img?.hd ? (
													<div>
														<img
															className="object-cover  inset-0"
															src={show.img?.hd}
															alt={show.title}
														/>
														<svg
															fill="currentColor"
															viewBox="0 0 16 16"
															height="2em"
															width="2em"
															className="absolute group-hover:opacity-100 opacity-0 scale-90 group-hover:scale-100 duration-200 ease-in-out bottom-0 right-0 m-4 text-white"
														>
															<path d="M11.596 8.697l-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 010 1.393z" />
														</svg>
													</div>
												) : (
													<div className="flex items-center justify-center w-full h-full bg-background">
														<ImageIcon className="text-muted" />
													</div>
												)}
											</div>

											<div className="space-y-1.5">
												<div className="flex text-sm md:text-base items-start justify-between gap-1">
													<TextGlitch>
														{show.title || show.name}
													</TextGlitch>
												</div>
												<div
													className={`text-xs  flex gap-1 capitalize opacity-75 `}
												>
													Season {show.season}
													<p
														className={` capitalize
                          `}
													>
														• Episode {show.episode}
													</p>
												</div>
											</div>
										</div>
									</Motiondiv>
								</Link>
							</CarouselItem>
						))}
					</CarouselContent>
				</AnimatePresence>
			</Carousel>
		)
	);
};

export default RecentlySearchedTV;
