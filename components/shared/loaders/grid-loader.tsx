import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

export default function GridLoader() {
	return (
		<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
			{Array.from({ length: 12 }).map((_, index) => (
				<div className="group w-full space-y-2" key={index}>
					<Skeleton className="aspect-[2/3] w-full rounded-lg md:rounded-xl bg-muted" />
					<Skeleton className="h-4 w-3/4 bg-muted" />
					<div className="flex flex-row gap-1">
						<Skeleton className="h-3 w-12 bg-muted" />
						<Skeleton className="h-3 w-16 bg-muted" />
					</div>
				</div>
			))}
		</div>
	);
}
