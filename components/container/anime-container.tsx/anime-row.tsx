/* eslint-disable @next/next/no-img-element */
'use client';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Anime, Show } from '@/lib/types';
import { CaretRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AnimeShowCard } from './anime-show-card';

export default function AnimeRow(props: {
	anime: Anime[];
	text?: string;
	showRank?: boolean;
	type: string;
	action?: () => void;
	isVertical?: boolean;
}) {
	const variants = {
		hidden: { opacity: 0, y: 30 },
		visible: (index: number) => ({
			opacity: 1,
			y: 0,
			transition: { duration: 0.3, delay: 0.05 },
		}),
	};
	if (!props?.anime)
		return (
			<div className="w-full h-[200px] mx-auto aspect-video border rounded-lg bg-muted flex-col gap-3 border-3 text-lg items-center justify-center flex text-center ">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="28"
					height="28"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					className="lucide lucide-circle-x"
				>
					<circle cx="12" cy="12" r="10" />
					<path d="m15 9-6 6" />
					<path d="m9 9 6 6" />
				</svg>
				<h1 className="text-2xl font-bold">No Results</h1>
			</div>
		);
	return (
		<Carousel opts={{ dragFree: true }} className=" w-[99%] mx-auto">
			{props.text && (
				<div className="flex font-bold justify-between  mx-auto text-xl md:text-3xl items-center my-1 py-1 flex-row">
					<h1 className="text-2xl flex  font-bold">{props.text}</h1>
					<div className="flex  gap-2">
						<CarouselPrevious variant={'secondary'} />
						<CarouselNext variant={'secondary'} />
					</div>
				</div>
			)}

			<AnimatePresence>
				{!props.isVertical ? (
					<CarouselContent className="gap-2 ">
						{props?.anime?.map(
							(show: Anime, index: number) =>
								show?.cover && (
									<CarouselItem
										className={cn(
											`group basis-[40%] w-full  md:basis-[32.8%]  lg:basis-[19.3%]  `
										)}
										key={show.id}
									>
										<AnimeShowCard anime={show} />
									</CarouselItem>
								)
						)}
					</CarouselContent>
				) : (
					<div className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-4 md:c   ">
						{props?.anime?.map((show: Anime, index: number) => (
							<AnimeShowCard key={index} anime={show} />
						))}
					</div>
				)}
			</AnimatePresence>
		</Carousel>
	);
}
