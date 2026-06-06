import { HeroSkeleton } from '@/components/features/media/details/detail-skeletons';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import Container from '@/components/shared/containers/container';

export default function MovieLoading() {
	return (
		<div className="min-h-screen bg-background">
			<HeroSkeleton />
			<Container>
				<div className="flex flex-col space-y-4 md:space-y-6">
					<MediaLoader withHeader className="min-h-[280px]" />
					<MediaLoader withHeader />
					<MediaLoader withHeader />
					{Array.from({ length: 6 }).map((_, i) => (
						<MediaLoader withHeader key={i} />
					))}
				</div>
			</Container>
		</div>
	);
}
