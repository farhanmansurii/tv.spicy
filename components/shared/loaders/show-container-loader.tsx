import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { GalleryVerticalEnd, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ShowContainerLoader() {
	return (
		<div className="w-full py-8 md:py-12">
			<div className="space-y-6">
				<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-white/5 pb-4">
					<div className="space-y-4">
						<div className="flex items-center gap-4">
							<Skeleton className="h-10 w-40 rounded-xl" />
							<Skeleton className="h-4 w-24" />
						</div>
					</div>

					<div className="flex items-center p-1 gap-1 bg-zinc-900 border border-white/10 rounded-full">
						<Button
							size="sm"
							variant="ghost"
							className="h-8 px-4 rounded-full bg-white text-black"
							disabled
						>
							<List className="w-3 h-3 mr-2" />
							Digest
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="h-8 px-4 rounded-full text-zinc-500"
							disabled
						>
							<Grid className="w-3 h-3 mr-2" />
							Archive
						</Button>
						<Button
							size="sm"
							variant="ghost"
							className="h-8 px-4 rounded-full text-zinc-500"
							disabled
						>
							<GalleryVerticalEnd className="w-3 h-3 mr-2" />
							Binge
						</Button>
					</div>
				</div>
			</div>

			{/* Episodes Grid Skeleton — matches list view dimensions */}
			<div className="flex flex-col gap-2 min-h-[300px]">
				{Array.from({ length: 6 }).map((_, index) => (
					<div
						key={index}
						className="flex items-center gap-4 p-2 rounded-2xl"
					>
						<div className="flex-shrink-0 w-32 sm:w-36 aspect-video rounded-xl bg-white/[0.04] animate-pulse" />
						<div className="flex-1 space-y-2">
							<div className="h-3 w-20 bg-white/[0.04] rounded animate-pulse" />
							<div className="h-4 w-3/4 bg-white/[0.06] rounded animate-pulse" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
