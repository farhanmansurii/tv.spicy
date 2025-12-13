import React from 'react';
import Container from '@/components/shared/containers/container';
import RowLoader from '@/components/shared/loaders/row-loader';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Container className="w-full py-4 md:py-10">
				{/* Hero Carousel Skeleton */}
				<div className="relative w-full aspect-[16/8] overflow-hidden rounded-[32px] bg-muted mb-8">
					<Skeleton className="w-full h-full bg-muted" />
				</div>
			</Container>
			<Container className="w-full">
				<RowLoader withHeader />
				<RowLoader withHeader />
				<RowLoader withHeader />
				<RowLoader withHeader />
			</Container>
		</div>
	);
}
