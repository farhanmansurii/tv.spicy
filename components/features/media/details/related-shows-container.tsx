import React from 'react';
import DataRow from '@/components/features/media/row/data-row';

export default function RelatedShowsContainer(props: {
	show: { id: number };
	type: 'movie' | 'tv';
	relation: string;
}) {
	return (
		<DataRow
			endpoint={`${props.type}/${props.show.id}/${props.relation}`}
			showRank={false}
			type={props.type}
			isVertical={true}
			hideHeader={true}
			gridLayout={true}
		/>
	);
}
