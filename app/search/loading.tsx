import { Skeleton } from '@/components/ui/skeleton';

export default function SearchLoading() {
	return (
		<div className="min-h-screen bg-background pt-20">
			<div className="mx-auto w-full max-w-[1400px] px-5 md:px-8 lg:px-12 py-8">
				{/* Search input skeleton */}
				<div className="max-w-2xl mx-auto mb-10">
					<Skeleton className="h-12 w-full rounded-full" />
				</div>

				{/* Filter pills skeleton */}
				<div className="flex items-center justify-center gap-2 mb-8">
					{Array.from({ length: 4 }).map((_, i) => (
						<Skeleton key={i} className="h-9 w-24 rounded-full" />
					))}
				</div>

				{/* Results grid skeleton */}
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-4">
					{Array.from({ length: 18 }).map((_, i) => (
						<div key={i}>
							<Skeleton className="aspect-[2/3] rounded-2xl" />
							<Skeleton className="h-3.5 w-20 mt-2" />
							<Skeleton className="h-3 w-14 mt-1" />
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
