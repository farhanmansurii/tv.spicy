import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CommonTitle from '@/components/shared/animated/common-title';
import GridLoader from './grid-loader';

export default function MoreDetailsLoader() {
	return (
		<div className="w-full animate-in fade-in slide-in-from-bottom-8 duration-500">
			<div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
				<CommonTitle text="More Like This" />

				{/* Tab Selector Skeleton */}
				<div className="flex items-center p-1 bg-white/5 border border-white/10 rounded-full backdrop-blur-xl shadow-lg ring-1 ring-white/5">
					<Skeleton className="h-8 w-24 rounded-full bg-muted" />
					<Skeleton className="h-8 w-32 rounded-full bg-muted" />
				</div>
			</div>

			<div className="w-full min-h-[400px]">
				<GridLoader />
			</div>
		</div>
	);
}
