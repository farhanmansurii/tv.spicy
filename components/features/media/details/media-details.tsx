'use client';
import React, { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import ShowContainer from './show-container';
import MoreDetailsContainer from './more-details-container';
import ShowDetails from './show-details';
import CastCrewSection from './cast-crew-section';
import VideoSection from './video-section';
import Container from '@/components/shared/containers/container';
import { cn } from '@/lib/utils';
import { isHighIntentNavigation } from '@/lib/utils/scroll-context';

const MediaDetails = (props: any) => {
	const { data, type, id } = props;
	const mediaId = id || data?.id?.toString();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const hasScrolledRef = useRef(false);

	// Context-aware scroll: Don't scroll to top if coming from Continue Watching
	useEffect(() => {
		const isHighIntent = isHighIntentNavigation(searchParams);

		// Only scroll to top if:
		// 1. Not high-intent navigation (not from Continue Watching)
		// 2. Haven't scrolled yet for this page load
		if (!isHighIntent && !hasScrolledRef.current) {
			hasScrolledRef.current = true;
			// Gentle scroll to top for general navigation
			window.scrollTo({ top: 0, behavior: 'smooth' });
		} else if (isHighIntent) {
			// High-intent: let season-tabs handle scrolling to player
			hasScrolledRef.current = true;
		}
	}, [pathname, searchParams]);

	return (
		<div className="w-full">
			{/* Hero Banner - Full width on mobile, contained on desktop */}
			<div className={cn(
				"w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]",
				"md:w-full md:left-auto md:right-auto md:ml-0 md:mr-0",
			)}>
				<ShowDetails id={data?.id} show={data} type={type} />
			</div>
			{/* Rest of content in container */}
			<Container className="w-full mt-4 py-6 md:py-8">
				<div className="space-y-10 md:space-y-12">
					<ShowContainer showData={data} id={data?.id} type={type} seasons={data.seasons} />
					{mediaId && <CastCrewSection id={mediaId} type={type} />}
					{mediaId && <VideoSection id={mediaId} type={type} />}
					<MoreDetailsContainer type={type} show={data} />
				</div>
			</Container>
		</div>
	);
};
export default MediaDetails;
