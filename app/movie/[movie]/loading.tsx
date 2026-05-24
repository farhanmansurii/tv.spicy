import {
	HeroSkeleton,
	ShowContainerSkeleton,
	CastCrewSkeleton,
	RelatedSkeleton,
	StorylineSkeleton,
	VideoSkeleton,
} from '@/components/features/media/details/detail-skeletons';

export default function MovieDetailLoading() {
	return (
		<div className="min-h-screen bg-background">
			<HeroSkeleton />
			<ShowContainerSkeleton type="movie" />
			<CastCrewSkeleton />
			<VideoSkeleton />
			<StorylineSkeleton />
			<RelatedSkeleton />
		</div>
	);
}
