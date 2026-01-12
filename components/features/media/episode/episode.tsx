'use client';

import React, { useRef, useEffect } from 'react';
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, ChevronRight, X } from 'lucide-react';
import useProviderStore from '@/store/providerStore';
import { useEpisodeStore } from '@/store/episodeStore';

interface EpisodeProps {
	episodeId: string;
	id: string;
	movieID?: any;
	type: string;
	episodeNumber?: any;
	seasonNumber?: any;
	getNextEp?: () => void;
	isSticky?: boolean;
	onCloseSticky?: () => void;
}

export default function Episode(props: EpisodeProps) {
	const { id, type, seasonNumber, episodeNumber, getNextEp, isSticky, onCloseSticky } = props;
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const { selectedProvider, setProvider } = useProviderStore();
	const { setIsPlaying } = useEpisodeStore();

	// Set playing state when iframe is visible (user is watching)
	useEffect(() => {
		// Small delay to ensure component is fully mounted
		const timer = setTimeout(() => {
			setIsPlaying(true);
		}, 100);

		return () => {
			clearTimeout(timer);
			setIsPlaying(false);
		};
	}, [setIsPlaying]);

	const generateUrl = (domain: string, t: string, i: string, s: string, e: string) => {
		const safeId = encodeURIComponent(i);
		const safeSeason = encodeURIComponent(s);
		const safeEpisode = encodeURIComponent(e);
		return t === 'movie'
			? `https://${domain}/embed/${t}/${safeId}`
			: `https://${domain}/embed/tv/${safeId}/${safeSeason}/${safeEpisode}`;
	};
	const sourcesMap = [
		{
			name: 'vidsrc.pro',
			label: 'Main Server',
			url: generateUrl('vidsrc.pro', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'ythd',
			label: 'YTHD.org',
			url:
				type === 'movie'
					? `https://ythd.org/embed/${id}`
					: `https://ythd.org/embed/${id}/${seasonNumber}-${episodeNumber}`,
		},
		{
			name: 'vidlink',
			label: 'VidLink (No Ads)',
			url:
				type === 'movie'
					? `https://vidlink.pro/movie/${id}`
					: `https://vidlink.pro/tv/${id}/${seasonNumber}/${episodeNumber}?title=true`,
		},
		{
			name: 'vidsrc.vip',
			label: 'Premium Stream',
			url: generateUrl('vidsrc.vip', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'embedded.su',
			label: 'Embedded SU',
			url:
				type === 'movie'
					? `https://embed.su/embed/movie/${id}`
					: `https://embed.su/embed/tv/${id}/${seasonNumber}/${episodeNumber}?title=true`,
		},
		{
			name: 'vidsrc.su',
			label: 'Vidsrc SU',
			url: generateUrl('vidsrc.su', type, id, seasonNumber, episodeNumber),
		},
		{
			name: '111movies',
			label: '111Movies',
			url:
				type === 'movie'
					? `https://111movies.com/movie/${id}`
					: `https://111movies.com/tv/${id}/${seasonNumber}/${episodeNumber}?title=true`,
		},
		{
			name: 'VidEasy',
			label: 'VidEasy',
			url:
				type === 'movie'
					? `https://player.videasy.net/movie/${id}`
					: `https://player.videasy.net/tv/${id}/${seasonNumber}/${episodeNumber}`,
		},
		{
			name: 'vidsrc.cc/v3',
			label: 'Vidsrc CC v3',
			url: generateUrl('vidsrc.cc/v3', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'smashystream',
			label: 'Smashy Stream',
			url:
				type === 'movie'
					? `https://player.smashy.stream/movie/${id}`
					: `https://player.smashy.stream/tv/${id}?s=${seasonNumber}&e=${episodeNumber}`,
		},
		{
			name: 'AutoEmbe',
			label: 'AutoEmbe',
			url:
				type === 'movie'
					? `https://player.autoembed.cc/embed/movie/${id}`
					: `https://player.smashy.stream/tv/${id}?s=${seasonNumber}&e=${episodeNumber}`,
		},
		{
			name: 'vidsrc.icu',
			label: 'Backup Stream',
			url: generateUrl('vidsrc.icu', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'vidsrc.xyz',
			label: 'Alternative Stream',
			url: generateUrl('vidsrc.to', type, id, seasonNumber, episodeNumber),
		},
	];

	const currentSource = sourcesMap.find((s) => s.name === selectedProvider) || sourcesMap[0];

	return (
		<div className="group relative w-full flex flex-col gap-4">
			<div className="flex items-center justify-between px-1">
				<div className="flex items-center gap-4">
					<Select value={selectedProvider} onValueChange={setProvider}>
						<SelectTrigger className="h-11 w-fit bg-zinc-900/80 border-white/10 rounded-xl px-4 hover:bg-zinc-800/80 transition-all gap-3 shadow-lg backdrop-blur-sm">
							<Settings className="w-4 h-4 text-primary" />
							<SelectValue className="text-xs font-bold uppercase tracking-wider text-zinc-300">
								{currentSource.label}
							</SelectValue>
						</SelectTrigger>
						<SelectContent className="bg-zinc-950 border-white/10 rounded-xl backdrop-blur-xl p-1.5 shadow-2xl max-h-[300px]">
							{sourcesMap.map((source) => (
								<SelectItem
									value={source.name}
									key={source.name}
									className="text-xs"
								>
									{source.label}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{getNextEp && type === 'tv' && (
					<div className="flex items-center gap-2">
						<Button
							variant="ghost"
							onClick={getNextEp}
							className="h-10 md:h-11 rounded-xl px-3 md:px-6 transition-all gap-2 group/next bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 backdrop-blur-sm"
						>
							<span className="text-[10px] md:text-xs font-bold uppercase tracking-wider hidden sm:inline">
								Next Episode
							</span>
							<ChevronRight className="w-4 h-4 transition-transform group-hover/next:translate-x-1" />
						</Button>
						{isSticky && onCloseSticky && (
							<Button
								variant="ghost"
								size="icon"
								onClick={onCloseSticky}
								className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 backdrop-blur-sm"
								aria-label="Hide sticky player"
								title="Hide sticky player"
							>
								<X className="w-4 h-4" />
							</Button>
						)}
					</div>
				)}
			</div>

			<div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl group-hover:ring-white/20 transition-all duration-300">
				<iframe
					ref={iframeRef}
					allowFullScreen
					className="w-full h-full"
					src={currentSource.url}
					title="Media Player"
					loading="eager"
				/>

				{/* Visual Depth Overlay */}
				<div className="absolute inset-0 pointer-events-none ring-1 ring-inset ring-white/5 rounded-xl" />
			</div>
		</div>
	);
}
