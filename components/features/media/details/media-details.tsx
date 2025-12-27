'use client';
import React from 'react';
import ShowContainer from './show-container';
import MoreDetailsContainer from './more-details-container';
import ShowDetails from './show-details';
import CastCrewSection from './cast-crew-section';
import VideoSection from './video-section';
import Container from '@/components/shared/containers/container';
import { cn } from '@/lib/utils';

const MediaDetails = (props: any) => {
	const { data, type, id } = props;
	const mediaId = id || data?.id?.toString();

	return (
		<div className="w-full">
			{/* Hero Banner - Full width on mobile, contained on desktop */}
			<div className={cn(
				"w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw]",
				"md:w-full md:left-auto md:right-auto md:ml-0 md:mr-0",
				"-mt-20 md:mt-0"
			)}>
				<ShowDetails id={data?.id} show={data} type={type} />
			</div>
			{/* Rest of content in container */}
			<Container className="w-full mt-4 space-y-8 md:space-y-12 py-6 md:py-8">
				<ShowContainer showData={data} id={data?.id} type={type} seasons={data.seasons} />
				{mediaId && <CastCrewSection id={mediaId} type={type} />}
				{mediaId && <VideoSection id={mediaId} type={type} />}
				<MoreDetailsContainer type={type} show={data} />
			</Container>
		</div>
	);
};
export default MediaDetails;
