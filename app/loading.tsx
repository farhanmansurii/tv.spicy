import React from 'react';
import Container from '@/components/shared/containers/container';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { EDITORIAL_HERO_HEIGHT_CLASS } from '@/components/features/media/hero-height';

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground pb-20">
			{/* Skeleton shares the hero height token and mirrors the home hero's
			    header offset, so the hero swap reserves identical space. */}
			<div className="-mt-16 lg:mt-0">
				<div className={`${EDITORIAL_HERO_HEIGHT_CLASS} relative bg-white/[0.03] animate-pulse`}>
					<div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
				</div>
			</div>

			<Container className="relative z-10 w-full pt-7 md:pt-12">
				{/* Rows bring their own section-spacing rhythm */}
				<MediaLoader withHeader className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />
				<MediaLoader withHeader className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />
				<MediaLoader withHeader className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />
				{/* Additional rows for better perceived loading */}
				<MediaLoader withHeader className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />
				<MediaLoader withHeader className="relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing" />
			</Container>
		</div>
	);
}
