import { fetchRecommendations } from '@/lib/utils';
import React from 'react';
import GridLoader from '@/components/shared/loaders/grid-loader';
import MediaRow from '../features/media/row/media-row';
interface RecommendationsContainerProps {
	type: string;
	id: string;
}
export default async function RecommendationsContainer(props: RecommendationsContainerProps) {
	const { type, id } = props;
	const recommendations = await fetchRecommendations(id, type, 'recommendations');
	const similar = await fetchRecommendations(id, type, 'similar');
	return (
		<div className="w-full">
			<GridLoader />
			{recommendations?.results?.length > 1 && (
				<MediaRow text="Recommendations" type={type} shows={recommendations?.results} />
			)}
			{similar?.results?.length > 1 && (
				<MediaRow text="Similar" type={type} shows={similar?.results} />
			)}
		</div>
	);
}
