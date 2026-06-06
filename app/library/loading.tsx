import { Skeleton } from '@/components/ui/skeleton';

function TabSkeleton() {
	return (
		<div className="flex items-center gap-1 -mb-px">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="px-3 py-2.5 md:px-4 md:py-3">
					<Skeleton className="h-5 w-24 rounded-md" />
				</div>
			))}
		</div>
	);
}

function PosterGridSkeleton() {
	return (
		<div className="space-y-5">
			<div className="space-y-1">
				<Skeleton className="h-4 w-16 rounded-md" />
				<Skeleton className="h-3.5 w-32 rounded-md" />
			</div>
			<div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i}>
						<Skeleton className="aspect-[2/3] rounded-xl md:rounded-2xl" />
						<Skeleton className="h-3.5 w-20 mt-2.5 rounded-md" />
					</div>
				))}
			</div>
		</div>
	);
}

function ContinueWatchingSkeleton() {
	return (
		<div className="space-y-4">
			<div className="flex items-center justify-end">
				<Skeleton className="h-4 w-24 rounded-md" />
			</div>
			<div className="flex gap-4 overflow-hidden">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="flex-shrink-0 w-[90%] sm:w-[58%] lg:w-[42%] xl:w-[34%]"
					>
						<div className="flex items-center gap-3 rounded-xl md:rounded-2xl p-2 md:p-2.5 bg-white/[0.03] ring-1 ring-white/[0.06]">
							<Skeleton className="flex-shrink-0 w-32 sm:w-36 md:w-40 aspect-video rounded-lg md:rounded-xl" />
							<div className="flex-1 space-y-2 py-1">
								<Skeleton className="h-4 w-3/4 rounded-md" />
								<Skeleton className="h-3 w-1/2 rounded-md" />
								<Skeleton className="h-3 w-16 rounded-md" />
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function LibraryLoading() {
	return (
		<div className="min-h-screen mt-20 bg-background">
			{/* Header skeleton */}
			<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-screen-2xl pt-8 pb-6 md:pt-12 md:pb-8">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
					<div className="max-w-2xl space-y-4">
						<Skeleton className="h-3 w-32 rounded-md" />
						<Skeleton className="h-10 md:h-14 lg:h-16 w-56 md:w-80 rounded-lg" />
						<Skeleton className="h-4 md:h-5 w-full max-w-md rounded-md" />
					</div>
					<Skeleton className="h-10 w-36 rounded-lg shrink-0" />
				</div>
			</div>

			{/* Tabs + Content skeleton */}
			<div className="w-full mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl 2xl:max-w-screen-2xl pb-10 md:pb-16">
				<div className="border-b border-white/[0.06]">
					<TabSkeleton />
				</div>
				<div className="pt-6 md:pt-8 space-y-10">
					<ContinueWatchingSkeleton />
					<PosterGridSkeleton />
				</div>
			</div>
		</div>
	);
}
