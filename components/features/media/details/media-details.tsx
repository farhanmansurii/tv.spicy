'use client';
import React from 'react';
import ShowContainer from './show-container';
import MoreDetailsContainer from './more-details-container';
import ShowDetails from './show-details';
import CastCrewSection from './cast-crew-section';
import VideoSection from './video-section';
import Container from '@/components/shared/containers/container';

const MediaDetails = (props: any) => {
	const { data, type, id } = props;
	const mediaId = id || data?.id?.toString();

	return (
		<Container className="w-full space-y-8 md:space-y-12 py-6 md:py-8">
			<ShowDetails id={data?.id} show={data} type={type} />
			<ShowContainer showData={data} id={data?.id} type={type} seasons={data.seasons} />

			{/* Lazy load credits and videos with TanStack Query */}
			{mediaId && <CastCrewSection id={mediaId} type={type} />}
			{mediaId && <VideoSection id={mediaId} type={type} />}

			<MoreDetailsContainer type={type} show={data} />
		</Container>
	);
};
export default MediaDetails;
