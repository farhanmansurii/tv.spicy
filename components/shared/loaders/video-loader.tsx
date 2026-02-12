import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import CommonTitle from '@/components/shared/animated/common-title';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function VideoLoader() {
	return (
		<div className="w-full py-8 md:py-12">
			<Tabs defaultValue="trailers" className="w-full">
				<div className="space-y-2">
					<CommonTitle text="Cinematic Media" variant="section" spacing="none" />
					<CommonTitle text="Trailers & Extras" variant="small" spacing="medium">
						<TabsList className="bg-white/[0.03] border border-white/5 rounded-full p-1 h-auto backdrop-blur-xl">
							<TabsTrigger
								value="trailers"
								className="px-4 py-1.5 rounded-full text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-black"
							>
								Trailers (0)
							</TabsTrigger>
							<TabsTrigger
								value="teasers"
								className="px-4 py-1.5 rounded-full text-xs font-medium data-[state=active]:bg-white data-[state=active]:text-black"
							>
								Teasers (0)
							</TabsTrigger>
						</TabsList>
					</CommonTitle>
				</div>

				<div className="mt-6 md:mt-8">
					{/* Video Grid */}
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
						{Array.from({ length: 6 }).map((_, index) => (
							<div
								key={index}
								className="group relative aspect-video w-full overflow-hidden rounded-2xl border border-white/5 shadow-2xl"
							>
								<Skeleton className="h-full w-full" />
								<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
									<Skeleton className="h-12 w-12 rounded-full" />
								</div>
								<div className="absolute bottom-4 left-4 right-4 text-left">
									<Skeleton className="h-4 w-3/4" />
								</div>
							</div>
						))}
					</div>
				</div>
			</Tabs>
		</div>
	);
}
