'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
  const [expandedTabs, setExpandedTabs] = useState<Record<string, boolean>>({});

  // Filter for YouTube videos
  const youtubeVideos = videos?.filter((video) => video.site === 'YouTube') || [];
  const trailers = youtubeVideos.filter((video) => video.type === 'Trailer');
  const teasers = youtubeVideos.filter((video) => video.type === 'Teaser');
  const clips = youtubeVideos.filter((video) => video.type === 'Clip');
  const otherVideos = youtubeVideos.filter(
    (video) => !['Trailer', 'Teaser', 'Clip'].includes(video.type)
  );

  // Define tabs with their videos
  const tabs = [
    { title: 'Trailers', videos: trailers, key: 'trailers' },
    { title: 'Teasers', videos: teasers, key: 'teasers' },
    { title: 'Clips', videos: clips, key: 'clips' },
    { title: 'Other', videos: otherVideos, key: 'other' },
  ].filter((tab) => tab.videos.length > 0);

  if (tabs.length === 0) return null;

  // Default to first tab
  const defaultTab = tabs[0]?.key || 'trailers';

  const getThumbnailUrl = (videoKey: string) => {
    return `https://img.youtube.com/vi/${videoKey}/maxresdefault.jpg`;
  };

  const getEmbedUrl = (videoKey: string) => {
    return `https://www.youtube.com/embed/${videoKey}?autoplay=1&rel=0`;
  };

  const toggleTab = (key: string) => {
    setExpandedTabs((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const renderVideoCard = (video: Video) => (
    <Dialog key={video.id}>
      <DialogTrigger asChild>
        <button
          onClick={() => setSelectedVideo(video)}
          className="group relative aspect-video w-full overflow-hidden rounded-card md:rounded-card-md bg-black/40 shadow-lg ring-1 ring-white/10 transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] hover:ring-white/20 select-none"
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
            <span className="rounded-ui bg-black/70 backdrop-blur-md border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
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

      <DialogContent className="max-w-5xl w-full p-0 bg-black border-none rounded-dialog md:rounded-dialog-md overflow-hidden">
        <DialogTitle className="sr-only">{video.name}</DialogTitle>
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
  );

  return (
    <div className="w-full space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
      <CommonTitle text="Videos & Trailers" />

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="bg-white/5 border border-white/10 rounded-xl p-1 h-auto">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.key}
              value={tab.key}
              className={cn(
                'px-4 py-2 text-sm font-medium transition-all',
                'data-[state=active]:bg-white/10 data-[state=active]:text-white',
                'data-[state=inactive]:text-white/50 hover:text-white/70'
              )}
            >
              {tab.title}
              <span className="ml-2 text-xs opacity-70">({tab.videos.length})</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => {
          const isExpanded = expandedTabs[tab.key] ?? false;
          const maxInitialVideos = 6;
          const displayedVideos = isExpanded
            ? tab.videos
            : tab.videos.slice(0, maxInitialVideos);
          const hasMore = tab.videos.length > maxInitialVideos;

          return (
            <TabsContent key={tab.key} value={tab.key} className="mt-6">
              <div className="space-y-4">
                {/* Video Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                  {displayedVideos.map(renderVideoCard)}
                </div>

                {/* Show More/Less Button */}
                {hasMore && (
                  <button
                    onClick={() => toggleTab(tab.key)}
                    className="w-full py-3 text-center text-sm text-white/50 font-medium hover:text-white transition-colors"
                  >
                    {isExpanded
                      ? `Show Less`
                      : `+${tab.videos.length - maxInitialVideos} more videos`}
                  </button>
                )}
              </div>
            </TabsContent>
          );
        })}
      </Tabs>
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
