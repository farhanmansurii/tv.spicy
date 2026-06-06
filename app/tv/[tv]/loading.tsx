import {
	HeroSkeleton,
	ShowContainerSkeleton,
	RelatedSkeleton,
} from '@/components/features/media/details/detail-skeletons';

export default function TVDetailLoading() {
	return (
		<div className="min-h-screen bg-background">
			<HeroSkeleton />
			<ShowContainerSkeleton type="tv" />
			<RelatedSkeleton />
		</div>
	);
}
