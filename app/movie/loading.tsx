import RowLoader from '@/components/shared/loaders/row-loader';
import { Skeleton } from '@/components/ui/skeleton';
import React from 'react';

export default function Loading() {
	return (
		<div className="mx-auto max-w-4xl space-y-4 px-4 lg:px-0">
			<div className="flex md:hidden z-20 h-[70vh] relative">
				<Skeleton className="absolute inset-0 bg-muted" />
			</div>
			<div className="relative h-[70vh] md:flex hidden mx-auto ">
				<Skeleton className="absolute inset-0 bg-muted" />
			</div>
			<RowLoader withHeader />
			<RowLoader withHeader />
			<RowLoader withHeader />
			<RowLoader withHeader />
		</div>
	);
}
