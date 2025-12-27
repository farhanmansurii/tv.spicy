import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { GalleryVerticalEnd, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShowContainerLoader() {
	return (
		<div className="w-full space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-500">
			<div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center mb-6">
				<Skeleton className="h-10 w-[180px] rounded-2xl" />

				<div className="flex items-center p-1 gap-1 bg-white/5 border border-white/10 rounded-2xl">
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-2xl bg-white/10 text-white"
						disabled
					>
						<List className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
						<span className="hidden lg:inline">List</span>
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-2xl text-white/60"
						disabled
					>
						<Grid className="w-4 h-4 mr-2 md:mr-0 lg:mr-2" />
						<span className="hidden lg:inline">Grid</span>
					</Button>
					<Button
						size="sm"
						variant="ghost"
						className="h-8 px-3 rounded-2xl text-white/60"
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
						className="group relative aspect-video w-full overflow-hidden rounded-xl md:rounded-2xl border border-white/10 bg-card"
					>
						<Skeleton className="absolute inset-0 z-0 h-full w-full" />
						<div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-10" />
						<div className="relative z-20 h-full w-full flex flex-col justify-end p-5 md:p-6">
							<div className="flex flex-col gap-1">
								<div className="flex items-center gap-2">
									<Skeleton className="h-3 w-20 rounded-sm" />
									<Skeleton className="h-3 w-12 rounded-sm" />
								</div>
								<Skeleton className="h-5 md:h-6 w-3/4 rounded-sm" />
								<Skeleton className="h-3 md:h-4 w-full rounded-sm mt-1.5" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
