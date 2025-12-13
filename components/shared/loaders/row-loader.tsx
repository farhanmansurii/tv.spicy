import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import React from 'react';

export default function RowLoader({ withHeader }: { withHeader: boolean }) {
	return (
		<section className="w-full py-6 space-y-4">
			{withHeader && (
				<div className="mb-4 flex items-center justify-between group/title">
					<Skeleton className="h-9 w-48 md:h-10 md:w-56 bg-muted" />
				</div>
			)}

			<Carousel
				opts={{
					align: 'start',
					dragFree: true,
					loop: false,
				}}
				className="w-full group/row relative"
			>
				<CarouselPrevious
					className="hidden lg:flex absolute left-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
					icon={<ChevronLeft className="h-8 w-8" />}
				/>
				<CarouselNext
					className="hidden lg:flex absolute right-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300"
					icon={<ChevronRight className="h-8 w-8" />}
				/>

				<div className="">
					<CarouselContent className="-ml-4 items-start">
						{Array.from({ length: 6 }).map((_, index) => (
							<CarouselItem
								key={index}
								className="pl-4 basis-[45%] md:basis-1/3 lg:basis-1/4 xl:basis-1/5"
							>
								<div className="h-full w-full">
									<Skeleton className="aspect-video w-full rounded-sm bg-muted" />
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</div>
			</Carousel>
		</section>
	);
}
