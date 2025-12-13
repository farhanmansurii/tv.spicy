import Container from '@/components/shared/containers/container';
import GridLoader from '@/components/shared/loaders/grid-loader';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
	return (
		<div className="min-h-screen bg-background text-foreground">
			<Container className="w-full py-6 md:py-8">
				<div className="space-y-6">
					<div className="space-y-2">
						<Skeleton className="h-12 w-64 md:h-16 md:w-80 bg-muted" />
						<Skeleton className="h-6 w-96 bg-muted" />
					</div>
					<GridLoader />
				</div>
			</Container>
		</div>
	);
}
