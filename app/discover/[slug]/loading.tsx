import { Skeleton } from '@/components/ui/skeleton';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import Container from '@/components/shared/containers/container';

export default function DiscoverLoading() {
	return (
		<div className="min-h-screen mt-20 bg-background">
			<Container>
				{/* Editorial header skeleton */}
				<div className="py-8 md:py-12 pb-4">
					<div className="max-w-4xl space-y-6">
						<div className="space-y-2">
							<Skeleton className="h-4 w-24 rounded-md" />
							<Skeleton className="h-10 md:h-14 w-48 md:w-72 rounded-lg" />
						</div>
						<Skeleton className="h-5 md:h-6 w-full max-w-lg rounded-md" />
					</div>
				</div>

				{/* Grid content skeleton */}
				<div className="py-6 md:py-10">
					<MediaLoader layout="grid" isVertical itemCount={12} />
				</div>
			</Container>
		</div>
	);
}
