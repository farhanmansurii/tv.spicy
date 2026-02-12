'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Clapperboard, Play, MonitorPlay } from 'lucide-react';
import { fetchVideos } from '@/lib/api';
import VideoLoader from '@/components/shared/loaders/video-loader';
import SegmentedControl from '@/components/shared/segmented-control';
import { DetailHeader, DetailShell } from './detail-primitives';

export default function VideoSection({ id, type }: { id: string; type: string }) {
	const { data, isLoading } = useQuery({
		queryKey: ['videos', id, type],
		queryFn: () => fetchVideos(id, type as 'movie' | 'tv'),
	});

	const [activeTab, setActiveTab] = useState<'trailers' | 'teasers'>('trailers');
	const videos = data?.results || [];
	const trailers = videos.filter((v: any) => v.type === 'Trailer');
	const teasers = videos.filter((v: any) => v.type === 'Teaser');
	const activeVideos = activeTab === 'trailers' ? trailers : teasers;
	const activeLabel = activeTab === 'trailers' ? 'Trailers' : 'Teasers';
	const activeCount = activeVideos.length;

	if (isLoading) return <VideoLoader />;
	if (!videos.length) return null;

	return (
		<DetailShell>
			<DetailHeader
				title="Trailers & Clips"
				subtitle={`${activeLabel} (${activeCount})`}
				action={
				<SegmentedControl
					value={activeTab}
					onChange={(value) => setActiveTab(value as 'trailers' | 'teasers')}
					items={[
						{
							value: 'trailers',
							label: 'Trailers',
							icon: MonitorPlay,
							showLabelOnMobile: false,
							tooltip: `${trailers.length} trailers`,
						},
						{
							value: 'teasers',
							label: 'Teasers',
							icon: Clapperboard,
							showLabelOnMobile: false,
							tooltip: `${teasers.length} teasers`,
						},
					]}
				/>
				}
			/>

			<div className="mt-2">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
					{activeVideos.slice(0, 6).map((video: any) => (
						<Dialog key={video.id}>
							<DialogTrigger className="relative aspect-video rounded-2xl overflow-hidden group border border-white/5 shadow-2xl">
								<img
									src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`}
									className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
									alt={video.name || 'Trailer thumbnail'}
								/>
								<div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
									<div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-2xl">
										<Play className="ml-1 w-5 h-5 fill-black text-black" />
									</div>
								</div>
								<div className="absolute bottom-4 left-4 right-4 text-left">
									<p className="text-sm font-bold text-white line-clamp-1">
										{video.name}
									</p>
								</div>
							</DialogTrigger>
							<DialogContent className="max-w-5xl p-0 bg-black border-none rounded-[2rem] overflow-hidden">
								<div className="aspect-video w-full">
									<iframe
										src={`https://www.youtube.com/embed/${video.key}?autoplay=1`}
										className="w-full h-full"
										allowFullScreen
										title={video.name || 'Video player'}
									/>
								</div>
							</DialogContent>
						</Dialog>
					))}
				</div>
			</div>
		</DetailShell>
	);
}
