import React from 'react';
import Container from '@/components/shared/containers/container';
import RowLoader from '@/components/shared/loaders/row-loader';
import ShowDetailsLoader from '@/components/shared/loaders/show-details-loader';

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Container className="w-full py-4 md:py-10">
				<ShowDetailsLoader />
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
