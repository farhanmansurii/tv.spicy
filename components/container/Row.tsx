/* eslint-disable @next/next/no-img-element */
'use client';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Show } from '@/lib/types';
import { CaretRightIcon } from '@radix-ui/react-icons';
import Link from 'next/link';
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import ShowCard from '../common/Card';

export default function Row(props: {
	shows: Show[];
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
	return (
		<Carousel opts={{ dragFree: true }} className="ease-in-out duration-100 w-[99%] mx-auto">
			{props.text && (
				<div className="flex font-bold ease-in-out duration-100 justify-between  mx-auto text-xl md:text-3xl items-center my-1 py-1 flex-row">
					<h1 className="text-xl md:2x; flex  font-bold">{props.text}</h1>
					<div className="flex  gap-2">
						<CarouselPrevious variant={'secondary'} />
						<CarouselNext variant={'secondary'} />
					</div>
				</div>
			)}

			{!props.isVertical ? (
				<CarouselContent className="gap-2 ">
					{props?.shows?.map(
						(show: Show, index: number) =>
							show?.backdrop_path && (
								<CarouselItem
									className={cn(
										`group basis-7/12 w-full  md:basis-1/3 lg:basis-[22%]   `
									)}
									key={show.id}
								>
									<ShowCard
										type={props.type}
										showRank={props.showRank}
										show={show}
										index={index}
										isVertical={props.isVertical}
									/>
								</CarouselItem>
							)
					)}
				</CarouselContent>
			) : (
				<div className="grid grid-cols-2 gap-x-2 gap-y-10 md:grid-cols-3 md:c   ">
					{props?.shows?.map(
						(show: Show, index: number) =>
							show?.backdrop_path && (
								<ShowCard
									key={index}
									showRank={props.showRank}
									variants={variants}
									show={show}
									type={props.type}
									index={index}
									isVertical={props.isVertical}
								/>
							)
					)}
				</div>
			)}
		</Carousel>
	);
}
