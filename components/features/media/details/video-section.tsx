'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Play, X, Youtube } from 'lucide-react';
import { fetchVideos } from '@/lib/api';
import CommonTitle from '@/components/shared/animated/common-title';
import VideoLoader from '@/components/shared/loaders/video-loader';
import { cn } from '@/lib/utils';

export default function VideoSection({ id, type }: { id: string; type: string }) {
    const { data, isLoading } = useQuery({
        queryKey: ['videos', id, type],
        queryFn: () => fetchVideos(id, type as 'movie' | 'tv'),
    });

    const videos = data?.results || [];
    const trailers = videos.filter((v: any) => v.type === 'Trailer');
    const teasers = videos.filter((v: any) => v.type === 'Teaser');

    if (isLoading) return <VideoLoader />;
    if (!videos.length) return null;

    return (
        <div className="w-full space-y-8">
            <Tabs defaultValue="trailers" className="w-full">
                <div className="space-y-2">
                    <CommonTitle text="Cinematic Media" variant="section" spacing="none" />
                    <CommonTitle text="Trailers & Extras" variant="small" spacing="medium">
                        <TabsList className="bg-white/[0.03] border border-white/5 rounded-full p-1 h-auto backdrop-blur-xl">
                            <TabsTrigger value="trailers" className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">
                                Trailers ({trailers.length})
                            </TabsTrigger>
                            <TabsTrigger value="teasers" className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:text-black">
                                Teasers ({teasers.length})
                            </TabsTrigger>
                        </TabsList>
                    </CommonTitle>
                </div>

                <TabsContent value="trailers" className="mt-0">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trailers.slice(0, 6).map((video: any) => (
                            <Dialog key={video.id}>
                                <DialogTrigger className="relative aspect-video rounded-2xl overflow-hidden group border border-white/5 shadow-2xl">
                                    <img src={`https://img.youtube.com/vi/${video.key}/maxresdefault.jpg`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" alt="" />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
                                        <div className="h-12 w-12 rounded-full bg-white flex items-center justify-center shadow-2xl"><Play className="ml-1 w-5 h-5 fill-black text-black" /></div>
                                    </div>
                                    <div className="absolute bottom-4 left-4 right-4 text-left">
                                        <p className="text-sm font-bold text-white line-clamp-1">{video.name}</p>
                                    </div>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl p-0 bg-black border-none rounded-[2rem] overflow-hidden">
                                    <div className="aspect-video w-full">
                                        <iframe src={`https://www.youtube.com/embed/${video.key}?autoplay=1`} className="w-full h-full" allowFullScreen />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        ))}
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
