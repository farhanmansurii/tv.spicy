import { Skeleton } from '@/components/ui/skeleton';
import Container from '@/components/shared/containers/container';

export default function GenresLoading() {
	return (
		<div className="min-h-screen mt-20 bg-background">
			<Container>
				{/* Header skeleton */}
				<div className="py-8 md:py-12 pb-4">
					<div className="max-w-4xl space-y-6">
						<div className="space-y-2">
							<Skeleton className="h-4 w-32 rounded-md" />
							<Skeleton className="h-10 md:h-14 w-56 md:w-80 rounded-lg" />
						</div>
						<Skeleton className="h-5 md:h-6 w-full max-w-xl rounded-md" />
					</div>
				</div>

				{/* Movie Collections skeleton */}
				<div className="py-6 md:py-8">
					<div className="flex items-center gap-3 mb-4 md:mb-6">
						<Skeleton className="h-8 w-8 rounded-lg" />
						<Skeleton className="h-6 md:h-7 w-40 rounded-md" />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
						{Array.from({ length: 10 }).map((_, i) => (
							<Skeleton key={i} className="aspect-[16/10] rounded-[1.5rem]" />
						))}
					</div>
				</div>

				{/* Series Collections skeleton */}
				<div className="py-6 md:py-8">
					<div className="flex items-center gap-3 mb-4 md:mb-6">
						<Skeleton className="h-8 w-8 rounded-lg" />
						<Skeleton className="h-6 md:h-7 w-44 rounded-md" />
					</div>
					<div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-8">
						{Array.from({ length: 10 }).map((_, i) => (
							<Skeleton key={i} className="aspect-[16/10] rounded-[1.5rem]" />
						))}
					</div>
				</div>
			</Container>
		</div>
	);
}
