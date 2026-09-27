import { EditorialHeroSkeleton } from '@/components/features/media/details/detail-skeletons';
import { MediaLoader } from '@/components/shared/loaders/media-loader';
import Container from '@/components/shared/containers/container';

const rowSkeleton =
	'relative left-1/2 w-screen shrink-0 -translate-x-1/2 px-(--gutter) section-spacing overflow-visible';

export default function MovieLoading() {
	return (
		<div className="min-h-screen bg-background">
			<EditorialHeroSkeleton />
			<Container>
				<MediaLoader withHeader className={`min-h-70 ${rowSkeleton}`} />
				{Array.from({ length: 5 }).map((_, i) => (
					<MediaLoader withHeader key={i} className={rowSkeleton} />
				))}
			</Container>
		</div>
	);
}
