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
				<Skeleton className="h-10 w-[180px] rounded-ui md:rounded-ui-md bg-muted" />

				{/* View Toggle */}
				<div className="flex items-center p-1 gap-1 bg-white/5 border border-white/10 rounded-ui md:rounded-ui-md">
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-ui bg-white/10 text-white"
						disabled
					>
						<List className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
						<span className="hidden lg:inline">List</span>
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-ui text-white/60"
						disabled
					>
						<Grid className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
						<span className="hidden lg:inline">Grid</span>
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-ui text-white/60"
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
					<div
						key={index}
						className="group relative overflow-hidden rounded-[24px] border border-white/[0.08] bg-[#1a1a1a] shadow-2xl aspect-[1.62/1] w-full"
					>
						<Skeleton className="absolute inset-0 z-0 h-full w-full bg-muted/40" />
						<div className="relative z-30 h-full w-full flex flex-col justify-end px-5 md:px-6 pb-5">
							<div className="space-y-0.5">
								<Skeleton className="h-3 w-20 bg-white/20 rounded-sm" />
								<Skeleton className="h-6 md:h-7 w-3/4 bg-white/30 rounded-sm" />
								<Skeleton className="h-4 w-full bg-white/20 rounded-sm mt-1" />
							</div>

							<div className="flex items-center justify-between mt-4">
								<Skeleton className="h-4 w-12 bg-white/20 rounded-sm" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
