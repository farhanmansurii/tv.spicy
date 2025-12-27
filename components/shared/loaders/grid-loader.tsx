import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface GridLoaderProps {
	isVertical?: boolean;
}

export default function GridLoader({ isVertical = true }: GridLoaderProps) {
	return (
		<div className={cn(
			"grid gap-4 md:gap-8",
			isVertical
				? "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6"
				: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
		)}>
			{Array.from({ length: 12 }).map((_, index) => (
				<div className="flex flex-col gap-3 w-full transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]" key={index}>
					<Skeleton
						className={cn(
							"relative w-full overflow-hidden rounded-lg md:rounded-xl",
							isVertical ? "aspect-[2/3]" : "aspect-video"
						)}
					/>
					<div className="flex flex-col gap-0.5 px-1">
						<Skeleton className="h-[14px] w-3/4 rounded-sm" />
						<div className="flex items-center gap-2">
							<Skeleton className="h-[12px] w-12 rounded-sm" />
							<Skeleton className="h-2 w-2 rounded-full" />
							<Skeleton className="h-[12px] w-10 rounded-sm" />
						</div>
					</div>
				</div>
			))}
		</div>
	);
}
