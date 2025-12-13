'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import CommonTitle from '@/components/shared/animated/common-title';
import { Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { fetchVideosClient } from '@/lib/utils';
import VideoLoader from '@/components/shared/loaders/video-loader';

interface Video {
	id: string;
	key: string;
	name: string;
	site: string;
	type: string;
	official: boolean;
	published_at: string;
}

interface VideoSectionProps {
	id: string;
	type: string;
}

function VideoContent({ videos }: { videos: Video[] }) {
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);

	// Filter for YouTube videos and prioritize trailers
	const youtubeVideos = videos?.filter((video) => video.site === 'YouTube') || [];
	const trailers = youtubeVideos.filter((video) => video.type === 'Trailer');
	const teasers = youtubeVideos.filter((video) => video.type === 'Teaser');
	const clips = youtubeVideos.filter((video) => video.type === 'Clip');
	const otherVideos = youtubeVideos.filter(
		(video) => !['Trailer', 'Teaser', 'Clip'].includes(video.type)
	);

	// Combine: Trailers first, then teasers, then clips, then others
	const sortedVideos = [...trailers, ...teasers, ...clips, ...otherVideos];

	if (sortedVideos.length === 0) return null;

	const getThumbnailUrl = (videoKey: string) => {
		return `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;
	};

	const getEmbedUrl = (videoKey: string) => {
		return `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`;
	};

	return (
		<div className="w-full space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
			<CommonTitle text="Videos & Trailers" />

			{/* Video Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
				{sortedVideos.slice(0, 6).map((video) => (
					<Dialog key={video.id}>
						<DialogTrigger asChild>
							<button
								onClick={() => setSelectedVideo(video)}
								className="group relative aspect-video w-full overflow-hidden rounded-xl md:rounded-2xl bg-black/40 shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:ring-white/20"
							>
								{/* Thumbnail */}
								<img
									src={getThumbnailUrl(video.key)}
									alt={video.name}
									className="h-full w-full object-cover"
									onError={(e) => {
										// Fallback to a default thumbnail if YouTube thumbnail fails
										(e.target as HTMLImageElement).src =
											`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`;
									}}
								/>

								{/* Gradient Overlay */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

								{/* Overlay with Play Button */}
								<div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 backdrop-blur-[2px]">
									<div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-black shadow-2xl transition-transform duration-300 group-hover:scale-110">
										<Play className="ml-1 h-8 w-8 fill-current" />
									</div>
								</div>

								{/* Video Type Badge */}
								<div className="absolute top-3 left-3">
									<span className="rounded-md bg-black/70 backdrop-blur-md border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
										{video.type}
									</span>
								</div>

								{/* Video Title */}
								<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/80 to-transparent p-4">
									<p className="text-sm font-semibold text-white line-clamp-2 drop-shadow-md">
										{video.name}
									</p>
								</div>
							</button>
						</DialogTrigger>

						<DialogContent className="max-w-5xl w-full p-0 bg-black border-none rounded-2xl overflow-hidden">
							<div className="relative aspect-video w-full">
								{selectedVideo?.id === video.id && (
									<>
										<iframe
											src={getEmbedUrl(video.key)}
											title={video.name}
											allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
											allowFullScreen
											className="h-full w-full"
										/>
										<button
											onClick={() => setSelectedVideo(null)}
											className="absolute top-4 right-4 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-black/70 backdrop-blur-md text-white border border-white/10 transition-colors hover:bg-black/90"
										>
											<X className="h-5 w-5" />
										</button>
									</>
								)}
							</div>
						</DialogContent>
					</Dialog>
				))}
			</div>

			{/* Show more indicator if there are more videos */}
			{sortedVideos.length > 6 && (
				<p className="text-center text-sm text-white/50 font-medium">
					+{sortedVideos.length - 6} more videos
				</p>
			)}
		</div>
	);
}

export default function VideoSection({ id, type }: VideoSectionProps) {
	const { data, isLoading, error } = useQuery({
		queryKey: ['videos', id, type],
		queryFn: () => fetchVideosClient(id, type),
		enabled: !!id && !!type,
		staleTime: 1000 * 60 * 60 * 24 * 7, // 7 days
		gcTime: 1000 * 60 * 60 * 24 * 7,
		refetchOnWindowFocus: false,
		refetchOnReconnect: false,
	});

	if (isLoading) {
		return (
			<div className="w-full">
				<VideoLoader />
			</div>
		);
	}

	if (error || !data || !data.results || data.results.length === 0) {
		return null;
	}

	return (
		<div className="w-full">
			<VideoContent videos={data.results} />
		</div>
	);
}
