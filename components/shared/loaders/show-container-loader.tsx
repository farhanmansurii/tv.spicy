import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { GalleryVerticalEnd, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShowContainerLoader() {
	return (
		<div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
			{/* Season Selector & View Toggle */}
			<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
				{/* Season Selector */}
				<Skeleton className="h-10 w-[180px] rounded-lg bg-muted" />

				{/* View Toggle */}
				<div className="flex items-center p-1 gap-1 bg-white/5 border border-white/10 rounded-lg">
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-md bg-white/10 text-white"
						disabled
					>
						<List className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
						<span className="hidden lg:inline">List</span>
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-md text-white/60"
						disabled
					>
						<Grid className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
						<span className="hidden lg:inline">Grid</span>
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-md text-white/60"
						disabled
					>
						<GalleryVerticalEnd className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
						<span className="hidden lg:inline">Deck</span>
					</Button>
				</div>
			</div>

			{/* Episodes Grid Skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 min-h-[200px]">
				{Array.from({ length: 8 }).map((_, index) => (
					<div key={index} className="space-y-2">
						<Skeleton className="aspect-video w-full rounded-xl bg-muted" />
						<Skeleton className="h-4 w-3/4 bg-muted" />
						<div className="flex gap-2">
							<Skeleton className="h-3 w-12 bg-muted" />
							<Skeleton className="h-3 w-16 bg-muted" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
