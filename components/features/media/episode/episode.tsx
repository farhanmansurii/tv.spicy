'use client';

import React, { useEffect, useMemo, useRef } from 'react';
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
import useTVShowStore from '@/store/recentsStore';

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
	const { recentlyWatched, updatePlaybackProgress } = useTVShowStore();
	const progressUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	const numericMediaId = Number(id);
	const numericSeasonNumber =
		typeof seasonNumber === 'number' ? seasonNumber : Number(seasonNumber ?? 0);
	const numericEpisodeNumber =
		typeof episodeNumber === 'number' ? episodeNumber : Number(episodeNumber ?? 0);

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

	const currentWatchItem = useMemo(
		() =>
			recentlyWatched.find((item) => {
				if (item.mediaId !== numericMediaId || item.mediaType !== type) {
					return false;
				}

				if (type === 'movie') {
					return true;
				}

				return (
					item.seasonNumber === numericSeasonNumber &&
					item.episodeNumber === numericEpisodeNumber
				);
			}),
		[recentlyWatched, numericMediaId, type, numericSeasonNumber, numericEpisodeNumber]
	);

	const generateVidkingUrl = () => {
		const baseUrl =
			type === 'movie'
				? `https://www.vidking.net/embed/movie/${encodeURIComponent(id)}`
				: `https://www.vidking.net/embed/tv/${encodeURIComponent(id)}/${encodeURIComponent(
						String(seasonNumber ?? 1)
					)}/${encodeURIComponent(String(episodeNumber ?? 1))}`;
		const searchParams = new URLSearchParams({
			color: 'ef4444',
			nextEpisode: 'true',
			episodeSelector: 'false',
			autoplay: 'true',
		});
		return `${baseUrl}?${searchParams.toString()}`;
	};

	const sourcesMap = [
		{
			name: 'vidking',
			label: 'Vidking',
			url: generateVidkingUrl(),
		},
		{
			name: 'rivestream',
			label: 'Rivestream',
			url:
				type === 'movie'
					? `https://rivestream.org/embed?type=movie&id=${encodeURIComponent(id)}`
					: `https://rivestream.org/embed?type=tv&id=${encodeURIComponent(id)}&season=${encodeURIComponent(String(seasonNumber ?? 1))}&episode=${encodeURIComponent(String(episodeNumber ?? 1))}`,
		},
		{
			name: 'vidstream',
			label: 'Vidstream',
			docs: 'https://vidzen.fun/',
			url:
				type === 'movie'
					? `https://vidzen.fun/movie/${id}`
					: `https://vidzen.fun/tv/${id}/${seasonNumber}/${episodeNumber}`,
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
			name: 'vidsrc',
			label: 'Vidsrc',
			url: generateUrl('vidsrc.pro', type, id, seasonNumber, episodeNumber),
		},
		{
			name: 'vidlink',
			label: 'VidLink',
			url:
				type === 'movie'
					? `https://vidlink.pro/movie/${id}`
					: `https://vidlink.pro/tv/${id}/${seasonNumber}/${episodeNumber}`,
		},
		{
			name: 'embed.su',
			label: 'Embed SU',
			url:
				type === 'movie'
					? `https://embed.su/embed/movie/${id}`
					: `https://embed.su/embed/tv/${id}/${seasonNumber}/${episodeNumber}`,
		},
		{
			name: 'autoembed',
			label: 'AutoEmbed',
			url:
				type === 'movie'
					? `https://player.autoembed.cc/embed/movie/${id}`
					: `https://player.autoembed.cc/embed/tv/${id}/${seasonNumber}/${episodeNumber}`,
		},
		{
			name: 'videasy',
			label: 'VidEasy',
			url:
				type === 'movie'
					? `https://player.videasy.net/movie/${id}`
					: `https://player.videasy.net/tv/${id}/${seasonNumber}/${episodeNumber}`,
		},
	];

	const currentSource = sourcesMap.find((s) => s.name === selectedProvider) || sourcesMap[0];

	useEffect(() => {
		if (selectedProvider !== 'vidking') {
			return;
		}

		const handleVidkingMessage = (event: MessageEvent) => {
			if (event.origin !== 'https://www.vidking.net') {
				return;
			}

			let payload = event.data;
			if (typeof payload === 'string') {
				try {
					payload = JSON.parse(payload);
				} catch {
					return;
				}
			}

			if (
				!payload ||
				typeof payload !== 'object' ||
				(payload as { type?: string }).type !== 'PLAYER_EVENT'
			) {
				return;
			}

			const playerEvent = (payload as { data?: Record<string, unknown> }).data;
			if (!playerEvent) {
				return;
			}

			const eventName = String(playerEvent.event ?? '');
			if (!['timeupdate', 'pause', 'seeked', 'ended', 'play'].includes(eventName)) {
				return;
			}

			const messageMediaId = Number(playerEvent.id ?? id);
			if (!Number.isFinite(messageMediaId) || messageMediaId !== numericMediaId) {
				return;
			}

			const currentTime = Number(playerEvent.currentTime ?? 0);
			const duration = Number(playerEvent.duration ?? 0);
			const progress = Number(playerEvent.progress ?? 0);
			const messageSeason =
				type === 'tv' ? Number(playerEvent.season ?? numericSeasonNumber) : null;
			const messageEpisode =
				type === 'tv' ? Number(playerEvent.episode ?? numericEpisodeNumber) : null;

			if (progressUpdateTimeoutRef.current) {
				clearTimeout(progressUpdateTimeoutRef.current);
			}

			progressUpdateTimeoutRef.current = setTimeout(
				() => {
					void updatePlaybackProgress({
						mediaId: String(messageMediaId),
						mediaType: type as 'movie' | 'tv',
						progressPercent: Number.isFinite(progress) ? progress : null,
						lastPositionSeconds: Number.isFinite(currentTime) ? currentTime : null,
						durationSeconds: Number.isFinite(duration) ? duration : null,
						seasonNumber:
							type === 'tv' && Number.isFinite(messageSeason) ? messageSeason : null,
						episodeNumber:
							type === 'tv' && Number.isFinite(messageEpisode)
								? messageEpisode
								: null,
					});
				},
				eventName === 'timeupdate' ? 1000 : 150
			);
		};

		window.addEventListener('message', handleVidkingMessage);

		return () => {
			window.removeEventListener('message', handleVidkingMessage);
			if (progressUpdateTimeoutRef.current) {
				clearTimeout(progressUpdateTimeoutRef.current);
				progressUpdateTimeoutRef.current = null;
			}
		};
	}, [
		id,
		numericEpisodeNumber,
		numericMediaId,
		numericSeasonNumber,
		selectedProvider,
		type,
		updatePlaybackProgress,
	]);

	return (
		<div className="group relative w-full flex flex-col gap-2">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-4">
					<Select value={selectedProvider} onValueChange={setProvider}>
						<SelectTrigger className="h-9 md:h-11 w-fit bg-white/[0.06] border-white/10 rounded-full px-4 hover:bg-white/[0.10] transition-[background-color,box-shadow] duration-200 gap-3 shadow-lg backdrop-blur-sm ring-1 ring-white/[0.08]">
							<Settings className="w-3.5 h-3.5 text-zinc-400" />
							<SelectValue className="text-xs md:text-sm font-medium text-zinc-200">
								{currentSource.label}
							</SelectValue>
						</SelectTrigger>
						<SelectContent className="bg-zinc-950/95 border-white/10 rounded-xl backdrop-blur-xl p-1.5 shadow-2xl max-h-[300px]">
							{sourcesMap.map((source) => (
								<SelectItem
									value={source.name}
									key={source.name}
									className="text-xs rounded-lg"
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
							className="h-9 md:h-11 rounded-full px-4 md:px-6 transition-[background-color,box-shadow] duration-200 gap-2 group/next bg-white text-black hover:bg-white/90 font-semibold shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_28px_rgba(255,255,255,0.25)]"
						>
							<span className="text-xs md:text-sm font-semibold hidden sm:inline">
								Next Episode
							</span>
							<ChevronRight className="w-4 h-4 transition-transform group-hover/next:translate-x-0.5" />
						</Button>
						{isSticky && onCloseSticky && (
							<Button
								variant="ghost"
								size="icon"
								onClick={onCloseSticky}
								className="h-9 w-9 md:h-11 md:w-11 rounded-xl bg-zinc-900/80 hover:bg-zinc-800/80 border border-white/10 backdrop-blur-sm"
								aria-label="Hide sticky player"
								title="Hide sticky player"
							>
								<X className="w-4 h-4" />
							</Button>
						)}
					</div>
				)}
			</div>

			<div className="relative w-full aspect-video rounded-xl overflow-hidden bg-black ring-1 ring-white/10 shadow-2xl group-hover:ring-white/20 transition-[box-shadow,border-color] duration-300">
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
