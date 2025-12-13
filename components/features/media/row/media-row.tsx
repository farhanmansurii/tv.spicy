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
import React from 'react';
import MediaCard from '@/components/features/media/card/media-card';
import CommonTitle from '@/components/shared/animated/common-title';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';

export default function MediaRow(props: {
	shows: Show[];
	text?: string;
	showRank?: boolean;
	type: string;
	action?: () => void;
	isVertical?: boolean;
	viewAllLink?: string;
	headerAction?: React.ReactNode;
}) {
	return (
		<section className="w-full py-6 space-y-4">
			<div className="mb-4 flex items-center justify-between group/title">
				{props.text && <CommonTitle text={props.text} />}
				{props.viewAllLink && (
					<Link
						href={props.viewAllLink}
						className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
					>
						See All
					</Link>
				)}
				{props.headerAction}
			</div>

			<Carousel
				opts={{
					align: 'start',
					dragFree: true,
					loop: false,
				}}
				className="w-full group/row relative"
			>
				{/* FIX: Changed top-1/2 to top-[35%]
           This moves the buttons up to align with the image center,
           ignoring the text/metadata below the image.
        */}
				{!props.isVertical && (
					<>
						<CarouselPrevious
							className="hidden lg:flex absolute left-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
							icon={<ChevronLeft className="h-8 w-8" />}
						/>
						<CarouselNext
							className="hidden lg:flex absolute right-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
							icon={<ChevronRight className="h-8 w-8" />}
						/>
					</>
				)}

				<div className="">
					{!props.isVertical ? (
						// Added items-start to ensure cards hang from the top
						<CarouselContent className="-ml-4 items-start">
							{props?.shows?.map((show: Show, index: number) =>
								show?.backdrop_path ? (
									<CarouselItem
										key={show.id}
										className="pl-4 basis-[45%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
									>
										<div className="h-full w-full">
											<MediaCard
												type={props.type}
												showRank={props.showRank}
												show={show}
												index={index}
												isVertical={props.isVertical}
											/>
										</div>
									</CarouselItem>
								) : null
							)}
						</CarouselContent>
					) : (
						<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
							{props?.shows?.map((show: Show, index: number) =>
								show?.backdrop_path ? (
									<MediaCard
										key={index}
										showRank={props.showRank}
										show={show}
										type={props.type}
										index={index}
										isVertical={props.isVertical}
									/>
								) : null
							)}
						</div>
					)}
				</div>
			</Carousel>
		</section>
	);
}
