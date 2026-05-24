import { HeroSkeleton } from '@/components/features/media/details/detail-skeletons';
import { MediaLoader } from '@/components/shared/loaders/media-loader';

export default function DiscoverLoading() {
	return (
		<div className="min-h-screen bg-background">
			<HeroSkeleton />
			<div className="flex flex-col space-y-4 md:space-y-6 py-6">
				<MediaLoader withHeader />
				<MediaLoader withHeader />
				<MediaLoader withHeader />
			</div>
		</div>
	);
}
