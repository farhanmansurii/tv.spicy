import React, { memo } from 'react';
import DataRow from '@/components/features/media/row/data-row';
import type { Show } from '@/lib/types';

interface RelatedShowsContainerProps {
	type: 'movie' | 'tv';
	items: Show[];
}

function RelatedShowsContainerComponent({ type, items }: RelatedShowsContainerProps) {
	return (
		<DataRow
			initialData={items}
			showRank={false}
			type={type}
			isVertical={true}
			hideHeader={true}
			gridLayout={true}
		/>
	);
}

export default memo(RelatedShowsContainerComponent);
RelatedShowsContainerComponent.displayName = 'RelatedShowsContainer';
