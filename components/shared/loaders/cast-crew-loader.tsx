import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import CommonTitle from '@/components/shared/animated/common-title';

export default function CastCrewLoader() {
	return (
		<div className="w-full py-8 md:py-12">
			{/* Cast Section */}
			<div>
				<CommonTitle text="Cast & Crew" variant="section" spacing="none" />
				<CommonTitle text="Meet the Cast" variant="small" spacing="medium">
					<span className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest tabular-nums">
						Loading...
					</span>
				</CommonTitle>

				<Carousel
					opts={{ align: 'start', dragFree: true }}
					className="w-full group/row relative"
				>
					<CarouselPrevious
						className="hidden lg:flex absolute left-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-full"
						icon={<ChevronLeft className="h-8 w-8" />}
					/>
					<CarouselNext
						className="hidden lg:flex absolute right-4 top-[40%] -translate-y-1/2 z-40 h-12 w-12 border-0 bg-black/50 backdrop-blur-md text-white hover:bg-black/70 hover:text-white opacity-0 group-hover/row:opacity-100 transition-opacity duration-300 rounded-full"
						icon={<ChevronRight className="h-8 w-8" />}
					/>
					<CarouselContent className="-ml-4 md:-ml-6">
						{Array.from({ length: 12 }).map((_, index) => (
							<CarouselItem
								key={index}
								className="pl-4 md:pl-6 basis-[35%] sm:basis-[22%] lg:basis-[15%] xl:basis-[12.5%]"
							>
								<div className="flex flex-col items-center gap-4 group">
									{/* Actor Photo - Circular */}
									<Skeleton className="aspect-square w-full rounded-full ring-1 ring-white/10" />
									{/* Actor Info */}
									<div className="text-center space-y-1 w-full">
										<Skeleton className="h-4 w-24 mx-auto" />
										<Skeleton className="h-3 w-32 mx-auto" />
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>
		</div>
	);
}
