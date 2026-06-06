import { Skeleton } from '@/components/ui/skeleton';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import Container from '@/components/shared/containers/container';

export default function BrowseLoading() {
	return (
		<div className="min-h-screen bg-background">
			{/* Editorial header skeleton — matches browse page layout */}
			<div className="pt-20 md:pt-24 pb-0">
				<Container>
					<div className="max-w-4xl space-y-4">
						<Skeleton className="h-4 w-32 rounded-md" />
						<Skeleton className="h-10 md:h-14 w-64 md:w-96 rounded-lg" />
						<Skeleton className="h-5 md:h-6 w-full max-w-md rounded-md" />
					</div>
				</Container>
			</div>

			{/* Grid content skeleton */}
			<div className="py-8 md:py-12">
				<Container>
					<MediaLoader layout="grid" isVertical itemCount={12} />
				</Container>
			</div>
		</div>
	);
}
