import React from 'react';
import Container from '@/components/shared/containers/container';
import ShowDetailsLoader from '@/components/shared/loaders/show-details-loader';
import ShowContainerLoader from '@/components/shared/loaders/show-container-loader';
import CastCrewLoader from '@/components/shared/loaders/cast-crew-loader';
import VideoLoader from '@/components/shared/loaders/video-loader';
import MoreDetailsLoader from '@/components/shared/loaders/more-details-loader';

export default function Loading() {
	return (
		<Container className="w-full space-y-8 md:space-y-12 py-6 md:py-8">
			<ShowDetailsLoader />
			<ShowContainerLoader />
			<CastCrewLoader />
			<VideoLoader />
			<MoreDetailsLoader />
		</Container>
	);
}
