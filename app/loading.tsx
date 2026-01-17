import React from 'react';
import Container from '@/components/shared/containers/container';
import { MediaLoader } from '@/components/shared/loaders/media-loader';

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			{/* Hero Carousel Skeleton */}
			<div className="relative w-full h-[85vh] md:h-[75vh] bg-zinc-900 animate-pulse">
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
			</div>

			<Container className="w-full">
				<div className="space-y-4">
					{/* First few rows that will be preloaded */}
					<MediaLoader withHeader />
					<MediaLoader withHeader />
					<MediaLoader withHeader />
					{/* Additional rows for better perceived loading */}
					<MediaLoader withHeader />
					<MediaLoader withHeader />
				</div>
			</Container>
		</div>
	);
}
