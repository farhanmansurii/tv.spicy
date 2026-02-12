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
import { cn } from '@/lib/utils';
import CommonTitle from '@/components/shared/animated/common-title';
import MediaCard from '@/components/features/media/card/media-card';
import Container from '@/components/shared/containers/container';
import { ChevronLeft, ChevronRight } from 'lucide-react';

type Props = {
	title: string;
	shows: Show[];
	type: string;
	noPadding?: boolean;
};

export default function BentoGrid({ title, shows, type, noPadding }: Props) {
	if (!shows?.length) return null;

	return (
		<Container className={`relative ${noPadding ? '' : 'py-6 md:py-10'}`}>
			<Carousel
				opts={{
					align: 'start',
					dragFree: true,
					loop: false,
				}}
				// "overflow-visible" is key here: it lets the Card's hover scale/shadow effect
				// extend outside the carousel container without getting clipped.
				className="w-full overflow-visible"
			>
				<div className="flex items-end justify-between px-4 mb-4 md:px-0 md:mb-6">
					{/* Title with Apple-style typography */}
					<CommonTitle
						text={title}
						className="text-xl md:text-2xl font-semibold tracking-tight text-foreground/90"
					/>

					{/* Navigation Controls - Minimalist Circular */}
					<div className="hidden md:flex items-center gap-2">
						<CarouselPrevious
							variant="ghost"
							className="static translate-y-0 h-9 w-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-20"
						>
							<ChevronLeft className="h-5 w-5" />
						</CarouselPrevious>
						<CarouselNext
							variant="ghost"
							className="static translate-y-0 h-9 w-9 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:text-white disabled:opacity-20"
						>
							<ChevronRight className="h-5 w-5" />
						</CarouselNext>
					</div>
				</div>

				{/* -ml-4 to counteract the pl-4 padding on items, creating a seamless grid
           while maintaining the gap logic for shadcn/ui carousel
        */}
				<CarouselContent className="-ml-4 md:-ml-6 pb-4">
					{shows.map((show: Show, index: number) => {
						if (!show.backdrop_path) return null;

						return (
							<CarouselItem
								key={show.id}
								// Sizing Logic:
								// Mobile: 85% width (lets the next card peek significantly)
								// Tablet: 45% (2 cards + peek)
								// Desktop: 28% (3.5 cards - classic streaming row feel)
								className={cn(
									'pl-4 md:pl-6 basis-[85%] md:basis-[45%] lg:basis-[28%] xl:basis-[22%]'
								)}
							>
								<MediaCard
									show={show}
									index={index}
									type={type}
									isVertical={false} // Ensures landscape "Apple TV" card style
									showRank={false}
								/>
							</CarouselItem>
						);
					})}
				</CarouselContent>
			</Carousel>
		</Container>
	);
}
