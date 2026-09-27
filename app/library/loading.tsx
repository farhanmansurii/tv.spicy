import { Skeleton } from '@/components/ui/skeleton';

function TabSkeleton() {
	return (
		<div className="flex items-center gap-1 -mb-px">
			{Array.from({ length: 3 }).map((_, i) => (
				<div key={i} className="px-3 py-2.5 md:px-4 md:py-3">
					<Skeleton className="h-5 w-24 rounded-sm" />
				</div>
			))}
		</div>
	);
}

function PosterGridSkeleton() {
	return (
		<div className="flex flex-col gap-5">
			<div className="flex flex-col gap-1">
				<Skeleton className="h-4 w-16 rounded-sm" />
				<Skeleton className="h-3.5 w-32 rounded-sm" />
			</div>
			<div className="grid gap-4 md:gap-6 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
				{Array.from({ length: 6 }).map((_, i) => (
					<div key={i}>
						<Skeleton className="aspect-2/3 rounded-sm" />
						<Skeleton className="h-3.5 w-20 mt-2.5 rounded-sm" />
					</div>
				))}
			</div>
		</div>
	);
}

function ContinueWatchingSkeleton() {
	return (
		<div className="flex flex-col gap-4">
			<div className="flex items-center justify-end">
				<Skeleton className="h-4 w-24 rounded-sm" />
			</div>
			<div className="flex gap-4 overflow-hidden">
				{Array.from({ length: 3 }).map((_, i) => (
					<div
						key={i}
						className="flex-shrink-0 w-9/10 sm:w-7/12 lg:w-5/12 xl:w-1/3"
					>
						<div className="flex items-center gap-3 rounded-sm border border-border bg-card p-2 md:p-2.5">
							<Skeleton className="flex-shrink-0 w-32 sm:w-36 md:w-40 aspect-video rounded-sm" />
							<div className="flex flex-1 flex-col gap-2 py-1">
								<Skeleton className="h-4 w-3/4 rounded-sm" />
								<Skeleton className="h-3 w-1/2 rounded-sm" />
								<Skeleton className="h-3 w-16 rounded-sm" />
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
			<div className="w-full px-gutter pt-8 pb-6 md:pt-12 md:pb-8">
				<div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
					<div className="flex max-w-2xl flex-col gap-4">
						<Skeleton className="h-3 w-32 rounded-sm" />
						<Skeleton className="h-10 md:h-14 lg:h-16 w-56 md:w-80 rounded-sm" />
						<Skeleton className="h-4 md:h-5 w-full max-w-md rounded-sm" />
					</div>
					<Skeleton className="h-10 w-36 rounded-full shrink-0" />
				</div>
			</div>

			{/* Tabs + Content skeleton */}
			<div className="w-full px-gutter pb-10 md:pb-16">
				<div className="border-b border-border">
					<TabSkeleton />
				</div>
				<div className="flex flex-col gap-10 pt-6 md:pt-8">
					<ContinueWatchingSkeleton />
					<PosterGridSkeleton />
				</div>
			</div>
		</div>
	);
}
