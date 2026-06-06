import { Skeleton } from '@/components/ui/skeleton';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import Container from '@/components/shared/containers/container';

export default function SearchLoading() {
	return (
		<div className="min-h-screen overflow-x-hidden bg-background">
			{/* Hero / Search Section skeleton */}
			<section className="section-spacing pb-0">
				<Container>
					<div className="flex flex-col items-center text-center max-w-3xl mx-auto w-full space-y-8">
						<div className="space-y-3">
							<Skeleton className="h-10 md:h-12 w-40 mx-auto rounded-lg" />
							<Skeleton className="h-4 md:h-5 w-64 mx-auto rounded-md" />
						</div>

						<div className="relative w-full">
							<Skeleton className="h-14 md:h-16 w-full rounded-full" />
						</div>
					</div>
				</Container>
			</section>

			{/* Filter Bar skeleton */}
			<div className="sticky top-4 z-40 mt-8 md:mt-10 px-4 md:px-0">
				<Container>
					<div className="flex flex-col md:flex-row items-center justify-between gap-4 p-1.5 bg-card/80 backdrop-blur-xl border border-border/50 rounded-2xl">
						{/* Media Type Toggle skeleton */}
						<div className="flex items-center p-1 bg-black/30 rounded-xl w-full md:w-auto">
							{Array.from({ length: 3 }).map((_, i) => (
								<Skeleton key={i} className="h-9 w-24 rounded-lg" />
							))}
						</div>

						<div className="flex items-center gap-2 w-full md:w-auto">
							<Skeleton className="h-9 w-full md:w-[140px] rounded-lg" />
							<Skeleton className="h-9 w-24 rounded-lg" />
						</div>
					</div>
				</Container>
			</div>

			{/* Results grid skeleton */}
			<section className="section-spacing">
				<Container>
					<MediaLoader layout="grid" isVertical />
				</Container>
			</section>
		</div>
	);
}
