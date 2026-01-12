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

			{/* Episodes Grid Skeleton */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 min-h-[400px]">
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
