import { fetchRecommendations } from '@/lib/api';
import React from 'react';
import GridLoader from '@/components/shared/loaders/grid-loader';
import MediaRow from '../features/media/row/media-row';
import { MediaType } from '@/lib/api/tmdb-client';
interface RecommendationsContainerProps {
	type: string;
	id: string;
}
export default async function RecommendationsContainer(props: RecommendationsContainerProps) {
	const { type, id } = props;
	const recommendations = await fetchRecommendations(id, type as MediaType, 'recommendations');
	const similar = await fetchRecommendations(id, type as MediaType, 'similar');
	return (
		<div className="w-full">
			<GridLoader isVertical={true} />
			{recommendations?.results?.length > 1 && (
				<MediaRow text="Recommendations" type={type} shows={recommendations?.results} isVertical={true} />
			)}
			{similar?.results?.length > 1 && (
				<MediaRow text="Similar" type={type} shows={similar?.results} isVertical={true} />
			)}
		</div>
	);
}
