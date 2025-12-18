import RowLoader from '@/components/shared/loaders/row-loader';
import ShowDetailsLoader from '@/components/shared/loaders/show-details-loader';
import Container from '@/components/shared/containers/container';
import React from 'react';

export default function Loading() {
	return (
		<>
			<Container className="w-full py-4 md:py-10">
				<ShowDetailsLoader />
			</Container>
			<Container className="w-full">
				<RowLoader withHeader />
				<RowLoader withHeader />
				<RowLoader withHeader />
				<RowLoader withHeader />
			</Container>
		</>
	);
}
