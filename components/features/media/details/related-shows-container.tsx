import React from 'react';
import FetchAndRenderRow from '@/components/features/media/row/fetch-and-render-row';

export default function RelatedShowsContainer(props: {
	show: any;
	type: string;
	relation: string;
}) {
	return (
		<FetchAndRenderRow
			apiEndpoint={`${props.type}/${props.show.id}/${props.relation}`}
			showRank={false}
			type={props.type}
			isVertical={true}
			hideHeader={true}
			gridLayout={true}
		/>
	);
}
