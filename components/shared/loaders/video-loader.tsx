import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CommonTitle from '@/components/shared/animated/common-title';

export default function VideoLoader() {
	return (
		<div className="w-full space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-500">
			<CommonTitle text="Videos & Trailers" />

			{/* Video Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={index}
						className="group relative aspect-video w-full overflow-hidden rounded-xl md:rounded-2xl bg-black/40 shadow-lg ring-1 ring-white/10"
					>
						<Skeleton className="h-full w-full bg-muted" />
						{/* Badge Skeleton */}
						<div className="absolute top-3 left-3">
							<Skeleton className="h-5 w-16 rounded-md bg-muted" />
						</div>
						{/* Title Skeleton */}
						<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
							<Skeleton className="h-4 w-3/4 bg-muted" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
