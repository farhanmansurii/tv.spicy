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
		<div className="w-full space-y-8 md:space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-500">
			{/* Cast Section */}
			<div className="space-y-6">
				<CommonTitle text="Cast" />
				<Carousel
					opts={{
						align: 'start',
						dragFree: true,
						loop: false,
					}}
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
					<CarouselContent className="-ml-4 items-start">
						{Array.from({ length: 10 }).map((_, index) => (
							<CarouselItem
								key={index}
								className="pl-4 basis-[28%] md:basis-1/5 lg:basis-1/6 xl:basis-1/7"
							>
								<div className="flex flex-col gap-2 w-full">
									{/* Actor Photo */}
									<Skeleton className="aspect-[2/3] w-full rounded-card md:rounded-card-md bg-muted" />
									{/* Actor Info */}
									<div className="flex flex-col gap-1 px-0.5">
										<Skeleton className="h-4 w-24 bg-muted" />
										<Skeleton className="h-3 w-32 bg-muted" />
									</div>
								</div>
							</CarouselItem>
						))}
					</CarouselContent>
				</Carousel>
			</div>

			{/* Crew Section */}
			<div className="space-y-6">
				<CommonTitle text="Crew" />
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
					{Array.from({ length: 3 }).map((_, index) => (
						<div
							key={index}
							className="bg-white/5 border border-white/10 backdrop-blur-xl rounded-card md:rounded-card-md p-4 md:p-6 space-y-3 shadow-lg ring-1 ring-white/5"
						>
							<Skeleton className="h-4 w-20 bg-muted" />
							<div className="flex flex-wrap gap-2">
								{Array.from({ length: 3 }).map((_, i) => (
									<Skeleton key={i} className="h-4 w-24 rounded bg-muted" />
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
