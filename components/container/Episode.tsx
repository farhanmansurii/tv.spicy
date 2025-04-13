'use client';
import React, { useEffect, useState, useRef } from 'react';
import { fetchMovieLinks, fetchVidSrc } from '@/lib/utils';
import { Skeleton } from '../ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/button';
import { Forward, Settings } from 'lucide-react';
import Link from 'next/link';
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

	// Use the Zustand store for persistent provider selection
	const { selectedProvider, setProvider } = useProviderStore();

	const generateUrl = (
		domain: string,
		type: string,
		id: string,
		seasonNumber: string,
		episodeNumber: string
	) => {
		return type === 'movie'
			? `https://${domain}/embed/${type}/${id}`
			: `https://${domain}/embed/tv/${id}/${seasonNumber}/${episodeNumber}`;
	};

	const sourcesMap = [
		{
			name: '111movies',
			label: '111Movies',
			ads: 'false',
			url:
				type === 'movie'
					? `https://111movies.com/movie/${id}`
					: `https://111movies.com/tv/${id}/${seasonNumber}/${episodeNumber}?title=true`,
		},
		{
			name: 'ythd',
			label: 'YTHD.org',
			ads: 'false',
			url:
				type === 'movie'
					? ` https://ythd.org/embed/${id}`
					: ` https://ythd.org/embed/${id}/${seasonNumber}-${episodeNumber}`,
		},
		{
			name: 'VidEasy',
			label: 'VidEasy',
			ads: 'false',
			url:
				type === 'movie'
					? `https://player.videasy.net/movie/${id}`
					: `https://player.videasy.net/tv/${id}/${seasonNumber}/${episodeNumber}`,
		},
		{
			name: 'vidlink',
			label: 'VidLink',
			ads: 'false',
			url:
				type === 'movie'
					? `https://vidlink.pro/movie/${id}`
					: `https://vidlink.pro/tv/${id}/${seasonNumber}/${episodeNumber}?title=true`,
		},
		{
			name: 'embedded.su',
			label: 'Embeded SU',
			ads: 'false',
			url:
				type === 'movie'
					? `https://embed.su/embed/movie/${id}`
					: `https://embed.su/embed/tv/${id}/${seasonNumber}/${episodeNumber}?title=true`,
		},
		{
			name: 'vidsrc.su',
			label: 'Vidsrc SU',
			position: 4,
			url: generateUrl('vidsrc.su', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'vidsrc.vip',
			label: 'Premium Stream',
			position: 4,
			url: generateUrl('vidsrc.vip', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'vidsrc.cc/v3',
			label: 'Vidsrc CC v3',
			ads: 'false',
			url: generateUrl('vidsrc.cc/v3', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'smashystream',
			label: 'Smashy stream',
			ads: 'false',
			url:
				type === 'movie'
					? `https://player.smashy.stream/movie/${id}`
					: `https://player.smashy.stream/tv/${id}?s=${seasonNumber}&e=${episodeNumber}`,
		},
		{
			name: 'AutoEmbe',
			label: 'AutoEmbe',
			ads: 'false',
			url:
				type === 'movie'
					? `https://player.autoembed.cc/embed/movie/${id}`
					: `https://player.smashy.stream/tv/${id}?s=${seasonNumber}&e=${episodeNumber}`,
		},
		{
			name: 'vidsrc.icu',
			label: 'Backup Stream',
			position: 3,
			url: generateUrl('vidsrc.icu', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'vidsrc.pro',
			label: 'Main Stream',
			position: 1,
			url: generateUrl('vidsrc.pro', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'vidsrc.xyz',
			label: 'Alternative Stream',
			position: 5,
			url: generateUrl('vidsrc.to', type, id, seasonNumber, episodeNumber),
		},
	];

	const handleSelectOnChange = (value: string) => {
		setProvider(value); // Store the provider selection
	};

	useEffect(() => {
		const handleIframeLoad = () => {
			if (iframeRef.current) {
				try {
					const iframeWindow = iframeRef.current.contentWindow;
					if (iframeWindow) {
						iframeWindow.onbeforeunload = (e: BeforeUnloadEvent) => {
							e.preventDefault();
						};
					}
				} catch (error) {
					console.error('Error setting up iframe redirect prevention:', error);
				}
			}
		};

		if (iframeRef.current) {
			iframeRef.current.addEventListener('load', handleIframeLoad);
		}
	}, [selectedProvider]);

	return (
		<div id="episode-player" className="">
			<div className="flex items-center justify-between mb-2">
				<Select defaultValue={selectedProvider} onValueChange={handleSelectOnChange}>
					<SelectTrigger className="w-fit h-12 ">
						<Settings className="w-6 h-6 p-1 mr-2" />
						<SelectValue>
							<div className="pr-10">
								{
									sourcesMap.find((source) => source.name === selectedProvider)
										?.label
								}
							</div>
						</SelectValue>
					</SelectTrigger>
					<SelectContent>
						{sourcesMap.map((source, index) => (
							<SelectItem value={source.name} key={index}>
								<div className="mx-1 flex gap-2">{source.label}</div>
							</SelectItem>
						))}
					</SelectContent>
				</Select>
				{getNextEp && type === 'tv' && (
					<Button
						className="flex gap-2"
						variant={'ghost'}
						onClick={() => getNextEp(seasonNumber, episodeNumber)}
					>
						Next{' '}
						<svg
							width="24"
							height="24"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								fill="currentColor"
								d="M20.095 21a.75.75 0 0 1-.75-.75V3.75a.75.75 0 0 1 1.5 0v16.5a.74.74 0 0 1-.75.75m-3.4-9.589a2.25 2.25 0 0 1-.85 1.82l-9.11 7.09c-.326.247-.713.4-1.12.44h-.23a2.14 2.14 0 0 1-1-.22a2.2 2.2 0 0 1-.9-.81a2.17 2.17 0 0 1-.33-1.16V5.421a2.2 2.2 0 0 1 .31-1.12a2.25 2.25 0 0 1 .85-.8a2.18 2.18 0 0 1 2.24.1l9.12 6.08c.29.191.53.448.7.75a2.3 2.3 0 0 1 .32.98"
							/>
						</svg>
					</Button>
				)}
			</div>
			<iframe
				ref={iframeRef}
				allowFullScreen
				className="w-full h-full border-border/30 border  aspect-video font-mono"
				src={sourcesMap.find((source) => source.name === selectedProvider)?.url}
			/>
		</div>
	);
}
