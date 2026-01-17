import Container from '@/components/shared/containers/container';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="min-h-screen">
			<Container className="w-full py-6 md:py-8">
				<div className="space-y-6">
					<div className="space-y-2">
						<Skeleton className="h-12 w-64 md:h-16 md:w-80" />
						<Skeleton className="h-6 w-96" />
					</div>
					<MediaLoader layout="grid" isVertical />
				</div>
			</Container>
		</div>
	);
}
