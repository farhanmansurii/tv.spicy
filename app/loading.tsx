import React from 'react';
import Container from '@/components/shared/containers/container';
import { MediaLoader } from '@/components/shared/loaders/media-loader';

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			{/* Hero Carousel Skeleton — matches DetailHero dimensions exactly */}
			<div className="relative w-full h-[76dvh] min-h-[560px] max-h-[780px] md:h-[78dvh] md:min-h-[620px] lg:h-[82dvh] bg-white/[0.03] animate-pulse">
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
			</div>

			<Container className="w-full relative z-10">
				<div className="flex flex-col space-y-4 md:space-y-8">
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
