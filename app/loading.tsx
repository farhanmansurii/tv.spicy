import React from 'react';
import Container from '@/components/shared/containers/container';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { HERO_HEIGHT_CLASS } from '@/components/features/media/hero-height';

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			{/* Skeleton shares the hero height token and mirrors the home hero's
			    header offset, so the hero swap reserves identical space. */}
			<div className="-mt-16 lg:mt-0">
				<div className={`${HERO_HEIGHT_CLASS} relative bg-white/[0.03] animate-pulse`}>
					<div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
				</div>
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
