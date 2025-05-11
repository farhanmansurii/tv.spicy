import React from 'react';
import FetchAndRenderRow from './FetchAndRenderRow';

export default function RelatedShowsComponent(props: {
	show: any;
	type: string;
	relation: string;
}) {
	return (
		<FetchAndRenderRow
			apiEndpoint={`/${props.type}/${props.show.id}/${props.relation}`}
			showRank={false}
			text=""
			type="tv"
			isVertical={true}
		/>
	);
}
