import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from '@/components/ui/carousel';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import React from 'react';

export default function RowLoader({ withHeader }: { withHeader: boolean }) {
	return (
		<Carousel className="ease-in-out duration-100 w-[99%] mx-auto">
			{withHeader && (
				<div className="flex items-center justify-between gap-4 py-2 md:py-4 mx-auto">
					<h1 className="text-5xl truncate md:text-6xl tracking-tight lowercase text-transparent animate-pulse bg-secondary/60 rounded-md w-40 h-10" />

					<div className="flex items-center gap-2">
						<CarouselPrevious
							variant="outline"
							className="w-9 h-9 rounded-full border border-border text-muted-foreground"
						/>
						<CarouselNext
							variant="outline"
							className="w-9 h-9 rounded-full border border-border text-muted-foreground"
						/>
					</div>
				</div>
			)}

			<CarouselContent className="gap-2 mb-12">
				{Array.from({ length: 6 }).map((_, index) => (
					<CarouselItem
						key={index}
						className={cn(
							`group basis-9/12 w-full md:basis-1/3 lg:basis-[30%] space-y-2`
						)}
					>
						<Skeleton className="aspect-video w-full rounded-sm" />
					</CarouselItem>
				))}
			</CarouselContent>
		</Carousel>
	);
}
