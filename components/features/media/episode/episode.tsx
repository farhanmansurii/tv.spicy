'use client';

import React, { useRef } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, ChevronRight } from 'lucide-react';
import useProviderStore from '@/store/providerStore';

interface EpisodeProps {
    episodeId: string;
    id: string;
    movieID?: any;
    type: string;
    episodeNumber?: any;
    seasonNumber?: any;
    getNextEp?: () => void;
}

export default function Episode(props: EpisodeProps) {
    const { id, type, seasonNumber, episodeNumber, getNextEp } = props;
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const { selectedProvider, setProvider } = useProviderStore();

    const generateUrl = (domain: string, t: string, i: string, s: string, e: string) => {
        return t === 'movie'
            ? `https://${domain}/embed/${t}/${i}`
            : `https://${domain}/embed/tv/${i}/${s}/${e}`;
    };
    const sourcesMap = [
        { name: 'vidsrc.pro', label: 'Main Server', url: generateUrl('vidsrc.pro', type, id, seasonNumber, episodeNumber) },
        { name: 'ythd', label: 'YTHD.org', url: type === 'movie' ? `https://ythd.org/embed/${id}` : `https://ythd.org/embed/${id}/${seasonNumber}-${episodeNumber}` },
        { name: 'vidlink', label: 'VidLink (No Ads)', url: type === 'movie' ? `https://vidlink.pro/movie/${id}` : `https://vidlink.pro/tv/${id}/${seasonNumber}/${episodeNumber}?title=true` },
        { name: 'vidsrc.vip', label: 'Premium Stream', url: generateUrl('vidsrc.vip', type, id, seasonNumber, episodeNumber) },
        { name: 'embedded.su', label: 'Embedded SU', url: type === 'movie' ? `https://embed.su/embed/movie/${id}` : `https://embed.su/embed/tv/${id}/${seasonNumber}/${episodeNumber}?title=true` },
        { name: 'vidsrc.su', label: 'Vidsrc SU', url: generateUrl('vidsrc.su', type, id, seasonNumber, episodeNumber) },
        { name: '111movies', label: '111Movies', url: type === 'movie' ? `https://111movies.com/movie/${id}` : `https://111movies.com/tv/${id}/${seasonNumber}/${episodeNumber}?title=true` },
        { name: 'VidEasy', label: 'VidEasy', url: type === 'movie' ? `https://player.videasy.net/movie/${id}` : `https://player.videasy.net/tv/${id}/${seasonNumber}/${episodeNumber}` },
        { name: 'vidsrc.cc/v3', label: 'Vidsrc CC v3', url: generateUrl('vidsrc.cc/v3', type, id, seasonNumber, episodeNumber) },
        { name: 'smashystream', label: 'Smashy Stream', url: type === 'movie' ? `https://player.smashy.stream/movie/${id}` : `https://player.smashy.stream/tv/${id}?s=${seasonNumber}&e=${episodeNumber}` },
        { name: 'AutoEmbe', label: 'AutoEmbe', url: type === 'movie' ? `https://player.autoembed.cc/embed/movie/${id}` : `https://player.smashy.stream/tv/${id}?s=${seasonNumber}&e=${episodeNumber}` },
        { name: 'vidsrc.icu', label: 'Backup Stream', url: generateUrl('vidsrc.icu', type, id, seasonNumber, episodeNumber) },
        { name: 'vidsrc.xyz', label: 'Alternative Stream', url: generateUrl('vidsrc.to', type, id, seasonNumber, episodeNumber) },
    ];

    const currentSource = sourcesMap.find((s) => s.name === selectedProvider) || sourcesMap[0];

    return (
        <div className="group relative w-full flex flex-col p-2 md:p-3 gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Select value={selectedProvider} onValueChange={setProvider}>
                        <SelectTrigger className="h-10 w-fit bg-white/[0.03] border-white/10 rounded-xl px-4 hover:bg-white/[0.08] transition-all gap-3 shadow-2xl">
                            <Settings className="w-3.5 h-3.5 text-primary" />
                            <SelectValue className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                {currentSource.label}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-white/10 rounded-2xl backdrop-blur-3xl p-1.5 shadow-2xl max-h-[300px]">
                            {sourcesMap.map((source) => (
                                <SelectItem
                                    value={source.name}
                                    key={source.name}
                                >
                                    <span className="text-[11px] ">{source.label}</span>
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>


                </div>

                {getNextEp && type === 'tv' && (
                    <Button
                        variant="ghost"
                        onClick={getNextEp}
                        className="h-10 rounded-xl px-6 transition-all gap-2 group/next shadow-2xl"
                    >
                        <span className="text-[10px] font-black uppercase tracking-widest">Next Chapter</span>
                        <ChevronRight className="w-4 h-4 transition-transform group-hover/next:translate-x-1" />
                    </Button>
                )}
            </div>

            <div className="relative aspect-video  rounded-2xl md:rounded-2xl overflow-hidden  bg-black ring-1 ring-white/10 shadow-[0_40px_100px_-20px_rgba(0,0,0,1)] group-hover:ring-white/20 transition-all duration-700">
                <iframe
                    ref={iframeRef}
                    allowFullScreen
                    className="w-full h-full"
                    src={currentSource.url}
                    title="Media Player"
                    loading="eager"
                />

                {/* Visual Depth Overlay */}
                <div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-[1.5rem] md:rounded-[2rem]" />
            </div>
        </div>
    );
}
