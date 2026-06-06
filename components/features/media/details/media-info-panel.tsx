'use client';

import React, { memo, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
	ArrowSquareOutIcon,
	CalendarBlankIcon,
	CaretDownIcon,
	ClockIcon,
	FilmStripIcon,
	GlobeHemisphereWestIcon,
	InfoIcon,
	LinkIcon,
	PlayIcon,
	StarIcon,
	TagIcon,
	TelevisionIcon,
	UsersThreeIcon,
	XIcon,
} from '@phosphor-icons/react';
import { tmdbImage } from '@/lib/tmdb-image';
import { EpisodeDetailPanel } from '@/components/features/media/seasons/episode-detail-panel';
import { useEpisodeStore } from '@/store/episodeStore';
import { useMediaInfoPanelStore } from '@/store/mediaInfoPanelStore';

interface CastMember {
	id: number;
	name: string;
	character?: string;
	profile_path?: string | null;
}

interface CrewMember {
	id?: number;
	name: string;
	job?: string;
	department?: string;
	profile_path?: string | null;
}

interface Video {
	key: string;
	name: string;
	id: string;
	type: string;
	site: string;
}

interface WatchProvider {
	provider_id: number;
	provider_name: string;
	logo_path?: string | null;
}

interface MediaInfoPanelProps {
	data: any;
	type: 'movie' | 'tv';
	credits?: { cast?: CastMember[]; crew?: CrewMember[] } | null;
	videos?: Video[];
}

type PanelTab = 'episode' | 'details' | 'watch' | 'cast' | 'trailers' | 'links';

const panelVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring' as const, stiffness: 180, damping: 24 },
	},
};

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.055, delayChildren: 0.08 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 10 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring' as const, stiffness: 280, damping: 26 },
	},
};

const expandVariants = {
	collapsed: {
		height: 0,
		opacity: 0,
		transition: { duration: 0.32, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
	},
	expanded: {
		height: 'auto' as const,
		opacity: 1,
		transition: { duration: 0.42, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
	},
};

function formatDate(date?: string | null) {
	if (!date) return null;
	const parsed = new Date(date);
	if (Number.isNaN(parsed.getTime())) return null;
	return parsed.toLocaleDateString('en-US', {
		month: 'short',
		day: 'numeric',
		year: 'numeric',
	});
}

function formatRuntime(minutes?: number | null) {
	if (!minutes || minutes <= 0) return null;
	return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

function compactList(items: Array<string | null | undefined>, limit = 4) {
	return items.filter(Boolean).slice(0, limit).join(', ');
}

function uniqueProviders(providers: WatchProvider[]) {
	const seen = new Set<number>();
	return providers.filter((provider) => {
		if (seen.has(provider.provider_id)) return false;
		seen.add(provider.provider_id);
		return true;
	});
}

const SECTION_LABEL = 'text-[9.5px] font-bold uppercase tracking-[0.18em] text-white/30';

function SectionHeading({ title, kicker }: { title: string; kicker?: string }) {
	return (
		<div className="flex items-baseline gap-3">
			<h3
				className="text-lg font-bold tracking-tight text-white md:text-xl"
				style={{
					fontFamily: '-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
				}}
			>
				{title}
			</h3>
			{kicker && (
				<span className="text-[9.5px] font-black uppercase tracking-[0.22em] text-white/25 tabular-nums">
					{kicker}
				</span>
			)}
		</div>
	);
}

type ProviderLinkBuilder = (title: string, year?: string) => string;

const PROVIDER_LINKS: Record<number, ProviderLinkBuilder> = {
	8: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
	119: (t) => `https://www.amazon.com/s?k=${encodeURIComponent(t)}&i=instant-video`,
	337: (t) => `https://www.disneyplus.com/search?q=${encodeURIComponent(t)}`,
	1899: (t) => `https://www.max.com/search?q=${encodeURIComponent(t)}`,
	350: (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`,
	2: (t) => `https://tv.apple.com/search?term=${encodeURIComponent(t)}`,
	9: (t) => `https://www.amazon.com/s?k=${encodeURIComponent(t)}&i=instant-video`,
	531: (t) => `https://www.paramountplus.com/shows/?q=${encodeURIComponent(t)}`,
	386: (t) => `https://www.peacocktv.com/search?q=${encodeURIComponent(t)}`,
	15: (t) => `https://www.hulu.com/search?q=${encodeURIComponent(t)}`,
	387: (t) => `https://www.peacocktv.com/search?q=${encodeURIComponent(t)}`,
	232: (t) => `https://www.zee5.com/search?q=${encodeURIComponent(t)}`,
	220: (t) => `https://www.jiocinema.com/search/${encodeURIComponent(t)}`,
	237: (t) => `https://www.sonyliv.com/search?searchTerm=${encodeURIComponent(t)}`,
	121: (t) => `https://www.mxplayer.in/search?q=${encodeURIComponent(t)}`,
	122: (t) => `https://www.hotstar.com/in/search?q=${encodeURIComponent(t)}`,
	3: (t) => `https://play.google.com/store/search?q=${encodeURIComponent(t)}&c=movies`,
	68: (t) => `https://store.google.com/search?q=${encodeURIComponent(t)}`,
	10: (t) => `https://www.amazon.com/s?k=${encodeURIComponent(t)}&i=instant-video`,
	192: (t) => `https://www.youtube.com/results?search_query=${encodeURIComponent(`${t} movie`)}`,
	188: (t) => `https://www.youtube.com/results?search_query=${encodeURIComponent(t)}`,
	7: (t) => `https://www.vudu.com/content/movies/search?searchString=${encodeURIComponent(t)}`,
	257: (t) => `https://www.fubo.tv/welcome/search?query=${encodeURIComponent(t)}`,
	384: (t) => `https://www.max.com/search?q=${encodeURIComponent(t)}`,
	1796: (t) => `https://www.netflix.com/search?q=${encodeURIComponent(t)}`,
	283: (t) => `https://www.crunchyroll.com/search?q=${encodeURIComponent(t)}`,
};

function buildProviderUrl(
	provider: WatchProvider,
	title: string,
	year: string | undefined,
	fallback: string
) {
	const builder = PROVIDER_LINKS[provider.provider_id];
	if (builder) return builder(title, year);
	const slug = provider.provider_name.toLowerCase().replace(/[^a-z0-9]+/g, '');
	const guess = `https://www.google.com/search?q=${encodeURIComponent(`${provider.provider_name} ${title} ${year || ''}`)}&btnI=1`;
	return guess || fallback || slug;
}

function ProviderLogo({
	provider,
	title,
	year,
	fallback,
}: {
	provider: WatchProvider;
	title: string;
	year?: string;
	fallback: string;
}) {
	const href = buildProviderUrl(provider, title, year, fallback);
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			title={`Open ${provider.provider_name}`}
			className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.055] py-1.5 pl-1.5 pr-3 text-[12px] font-semibold text-white/75 transition-all duration-300 hover:border-white/[0.18] hover:bg-white/[0.09] hover:text-white active:scale-[0.97] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
		>
			<span className="relative h-6 w-6 overflow-hidden rounded-full bg-white/[0.08]">
				{provider.logo_path ? (
					<img
						src={tmdbImage(provider.logo_path, 'w92')}
						alt=""
						loading="lazy"
						className="h-full w-full object-cover"
						onError={(e) => {
							(e.currentTarget as HTMLImageElement).style.display = 'none';
						}}
					/>
				) : null}
			</span>
			{provider.provider_name}
			<ArrowSquareOutIcon size={11} weight="bold" className="text-white/35" />
		</a>
	);
}

function MediaInfoPanelComponent({ data, type, credits, videos = [] }: MediaInfoPanelProps) {
	const { activeEP } = useEpisodeStore();
	const activeEpisode =
		type === 'tv' && activeEP && String(activeEP.tv_id) === String(data?.id) ? activeEP : null;

	const isExpanded = useMediaInfoPanelStore((s) => s.isExpanded);
	const storeTab = useMediaInfoPanelStore((s) => s.activeTab);
	const openTick = useMediaInfoPanelStore((s) => s.openTick);
	const toggleExpanded = useMediaInfoPanelStore((s) => s.toggle);

	const [activeTab, setActiveTab] = useState<PanelTab>(
		type === 'tv' && activeEpisode ? 'episode' : 'details'
	);
	const [activeVideo, setActiveVideo] = useState<string | null>(null);

	React.useEffect(() => {
		if (storeTab) setActiveTab(storeTab);
	}, [storeTab, openTick]);

	const lastEpisodeIdRef = React.useRef<number | string | null>(activeEpisode?.id ?? null);
	React.useEffect(() => {
		if (type !== 'tv') return;
		const nextId = activeEpisode?.id ?? null;
		if (nextId && nextId !== lastEpisodeIdRef.current) {
			setActiveTab('episode');
		}
		lastEpisodeIdRef.current = nextId;
	}, [activeEpisode, type]);

	const title = data?.title || data?.name || (type === 'tv' ? 'TV show' : 'Movie');
	const releaseDate = data?.first_air_date || data?.release_date;
	const releaseYear = releaseDate?.split('-')[0];
	const releaseLabel = formatDate(releaseDate);
	const runtimeLabel = formatRuntime(data?.episode_run_time?.[0] ?? data?.runtime);
	const genreLabel = compactList(data?.genres?.map((genre: any) => genre.name) ?? [], 5);
	const primaryGenre = data?.genres?.[0]?.name as string | undefined;
	const languageLabel = compactList(
		data?.spoken_languages?.map((lang: any) => lang.english_name || lang.name) ?? [
			data?.original_language?.toUpperCase(),
		],
		3
	);
	const creatorLabel = compactList(
		data?.created_by?.map((creator: any) => creator.name) ?? [],
		3
	);
	const productionLabel = compactList(
		data?.production_companies?.map((company: any) => company.name) ?? [],
		3
	);
	const networkLabel = compactList(data?.networks?.map((network: any) => network.name) ?? [], 3);
	const countryLabel = compactList(
		data?.origin_country ??
			data?.production_countries?.map((country: any) => country.iso_3166_1),
		3
	);
	const keywords = compactList(
		(data?.keywords?.results ?? data?.keywords?.keywords ?? []).map(
			(keyword: any) => keyword.name
		),
		6
	);
	const voteLabel =
		typeof data?.vote_average === 'number' && data.vote_average > 0
			? `${data.vote_average.toFixed(1)} / 10`
			: null;
	const imdbId = data?.external_ids?.imdb_id || data?.imdb_id;
	const imdbUrl = imdbId ? `https://www.imdb.com/title/${imdbId}/` : null;
	const letterboxdUrl =
		type === 'movie'
			? `https://letterboxd.com/search/${encodeURIComponent(`${title} ${releaseYear || ''}`.trim())}/`
			: null;

	const posterUrl = data?.poster_path ? tmdbImage(data.poster_path, 'w342') : null;
	const backdropUrl = data?.backdrop_path ? tmdbImage(data.backdrop_path, 'w1280') : null;

	const indiaProviders = data?.['watch/providers']?.results?.IN;
	const providerGroups = [
		{ label: 'Stream', items: uniqueProviders(indiaProviders?.flatrate ?? []) },
		{ label: 'Rent', items: uniqueProviders(indiaProviders?.rent ?? []) },
		{ label: 'Buy', items: uniqueProviders(indiaProviders?.buy ?? []) },
	].filter((group) => group.items.length > 0);
	const providerLink =
		indiaProviders?.link || `https://www.themoviedb.org/${type}/${data?.id}/watch`;
	const providerTotal = providerGroups.reduce((total, group) => total + group.items.length, 0);

	const facts = [
		{ label: 'Release', value: releaseLabel, icon: CalendarBlankIcon },
		{ label: 'Genres', value: genreLabel, icon: TagIcon },
		{
			label: type === 'tv' ? 'Episode runtime' : 'Runtime',
			value: runtimeLabel,
			icon: ClockIcon,
		},
		{ label: 'Score', value: voteLabel, icon: StarIcon },
		{ label: 'Status', value: data?.status, icon: InfoIcon },
		{
			label: type === 'tv' ? 'Seasons' : 'Language',
			value:
				type === 'tv' && data?.number_of_seasons && data?.number_of_episodes
					? `${data.number_of_seasons} seasons, ${data.number_of_episodes} episodes`
					: languageLabel,
			icon: type === 'tv' ? TelevisionIcon : GlobeHemisphereWestIcon,
		},
		{
			label: type === 'tv' ? 'Created by' : 'Production',
			value: creatorLabel || productionLabel,
			icon: UsersThreeIcon,
		},
		{
			label: type === 'tv' ? 'Network' : 'Origin',
			value: networkLabel || countryLabel,
			icon: GlobeHemisphereWestIcon,
		},
		{ label: 'Keywords', value: keywords, icon: TagIcon },
	].filter((item) => item.value);

	const people = useMemo(() => {
		const castItems =
			credits?.cast?.slice(0, 18).map((person) => ({
				id: `cast-${person.id}`,
				name: person.name,
				role: person.character || 'Cast',
				profile_path: person.profile_path,
			})) ?? [];
		const crewItems =
			credits?.crew
				?.filter((person) => person.job || person.department)
				.slice(0, 10)
				.map((person, index) => ({
					id: `crew-${person.id ?? index}`,
					name: person.name,
					role: person.job || person.department || 'Crew',
					profile_path: person.profile_path,
				})) ?? [];
		return [...castItems, ...crewItems];
	}, [credits]);

	const externalLinks = [
		{ label: 'IMDb', href: imdbUrl, detail: imdbId || null },
		{
			label: 'Letterboxd',
			href: letterboxdUrl,
			detail: type === 'movie' ? 'Search by title' : null,
		},
		{ label: 'Official site', href: data?.homepage || null, detail: 'Homepage' },
		{ label: 'Where to watch', href: providerLink, detail: 'India providers' },
	].filter((link) => link.href);

	const tabs: Array<{ id: PanelTab; label: string; count?: number; disabled?: boolean }> = [
		{ id: 'episode', label: 'Episode', disabled: type !== 'tv' || !activeEpisode },
		{ id: 'details', label: 'Details' },
		{ id: 'watch', label: 'Watch', count: providerTotal },
		{ id: 'cast', label: 'Cast', count: people.length, disabled: people.length === 0 },
		{ id: 'trailers', label: 'Trailers', count: videos.length, disabled: videos.length === 0 },
		{
			id: 'links',
			label: 'Links',
			count: externalLinks.length,
			disabled: externalLinks.length === 0,
		},
	];

	const summaryChips: Array<{ icon: React.ElementType; label: string }> = [];
	if (releaseYear) summaryChips.push({ icon: CalendarBlankIcon, label: releaseYear });
	if (runtimeLabel) summaryChips.push({ icon: ClockIcon, label: runtimeLabel });
	if (type === 'tv' && data?.number_of_seasons) {
		summaryChips.push({
			icon: TelevisionIcon,
			label: `${data.number_of_seasons} ${data.number_of_seasons === 1 ? 'season' : 'seasons'}`,
		});
	}
	if (primaryGenre) summaryChips.push({ icon: TagIcon, label: primaryGenre });

	return (
		<section className="w-full pt-1 md:pt-2">
			<motion.div
				variants={panelVariants}
				initial="hidden"
				animate="visible"
				className="w-full overflow-hidden rounded-2xl"
				style={{
					background: 'rgba(18,18,20,0.85)',
					border: '1px solid rgba(255,255,255,0.07)',
					backdropFilter: 'blur(32px) saturate(140%)',
					boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 24px 64px rgba(0,0,0,0.48)',
				}}
			>
				{/* ── Collapsed Header / Summary Row ── */}
				<button
					type="button"
					onClick={() => toggleExpanded()}
					aria-expanded={isExpanded}
					aria-controls="media-info-body"
					className="group relative flex w-full items-center gap-4 px-4 py-4 text-left transition-colors duration-300 hover:bg-white/[0.02] md:px-6 md:py-5"
				>
					{/* Backdrop wash on hover */}
					{backdropUrl && (
						<div
							className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-700 group-hover:opacity-[0.18]"
							style={{
								backgroundImage: `linear-gradient(90deg, rgba(18,18,20,0.95) 0%, rgba(18,18,20,0.4) 60%, rgba(18,18,20,0.95) 100%), url(${backdropUrl})`,
								backgroundSize: 'cover',
								backgroundPosition: 'center',
							}}
						/>
					)}

					{/* Poster thumb */}
					<div className="relative z-[1] h-14 w-10 shrink-0 overflow-hidden rounded-md bg-white/[0.05] md:h-[68px] md:w-[48px]">
						{posterUrl ? (
							<img
								src={posterUrl}
								alt={title}
								loading="lazy"
								className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
								onError={(e) => {
									(e.currentTarget as HTMLImageElement).style.display = 'none';
								}}
							/>
						) : (
							<div className="flex h-full w-full items-center justify-center text-[10px] font-bold text-white/25">
								<FilmStripIcon size={18} />
							</div>
						)}
					</div>

					{/* Title + chips */}
					<div className="relative z-[1] flex min-w-0 flex-1 flex-col gap-1.5">
						<div className="flex items-center gap-2">
							<p className={SECTION_LABEL}>
								{type === 'tv' ? 'Show info' : 'Movie info'}
							</p>
							{voteLabel && (
								<span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-[#FFD60A]/20 bg-[#FFD60A]/10 px-2 py-[3px] text-[10px] font-bold tabular-nums text-[#FFD60A]">
									<StarIcon weight="fill" size={9} />
									{data.vote_average.toFixed(1)}
								</span>
							)}
						</div>
						<h2
							className="truncate text-base font-bold leading-tight tracking-tight text-white md:text-lg"
							style={{
								fontFamily:
									'-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
							}}
						>
							{title}
						</h2>
						{summaryChips.length > 0 && (
							<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
								{summaryChips.map((chip, idx) => (
									<React.Fragment key={chip.label}>
										{idx > 0 && (
											<span className="text-[10px] text-white/15">|</span>
										)}
										<span className="inline-flex items-center gap-1 text-[11.5px] text-white/45 tabular-nums">
											<chip.icon size={10} className="text-white/25" />
											{chip.label}
										</span>
									</React.Fragment>
								))}
							</div>
						)}
					</div>

					{/* Chevron */}
					<div className="relative z-[1] flex shrink-0 items-center gap-2">
						<span className="hidden text-[10px] font-bold uppercase tracking-[0.18em] text-white/30 sm:inline">
							{isExpanded ? 'Hide' : 'View'}
						</span>
						<motion.span
							animate={{ rotate: isExpanded ? 180 : 0 }}
							transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
							className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-white/65 transition-colors duration-300 group-hover:border-white/[0.16] group-hover:text-white"
						>
							<CaretDownIcon size={14} weight="bold" />
						</motion.span>
					</div>
				</button>

				{/* ── Expandable Body ── */}
				<AnimatePresence initial={false}>
					{isExpanded && (
						<motion.div
							key="media-info-body"
							id="media-info-body"
							variants={expandVariants}
							initial="collapsed"
							animate="expanded"
							exit="collapsed"
							style={{ overflow: 'hidden' }}
						>
							<div className="border-t border-white/[0.06]">
								{/* Tab nav */}
								<div className="mx-4 mt-4 overflow-x-auto rounded-full border border-white/[0.07] bg-white/[0.035] p-[3px] md:mx-6">
									<div className="flex min-w-max gap-1">
										{tabs.map((tab) => (
											<button
												key={tab.id}
												type="button"
												disabled={tab.disabled}
												onClick={() => setActiveTab(tab.id)}
												className={`inline-flex h-8 items-center gap-1.5 rounded-full px-3 text-[12px] font-bold transition-all duration-300 active:scale-[0.96] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214] ${
													activeTab === tab.id
														? 'bg-white text-zinc-950'
														: 'text-white/40 hover:bg-white/[0.06] hover:text-white/76 disabled:pointer-events-none disabled:opacity-25'
												}`}
											>
												{tab.label}
												{typeof tab.count === 'number' && tab.count > 0 && (
													<span
														className={
															activeTab === tab.id
																? 'text-zinc-500'
																: 'text-white/32'
														}
													>
														{tab.count}
													</span>
												)}
											</button>
										))}
									</div>
								</div>

								{/* Tab content */}
								<motion.div
									key={activeTab}
									variants={stagger}
									initial="hidden"
									animate="visible"
									className="flex min-w-0 flex-col gap-5 px-4 py-5 md:px-6 md:py-6"
								>
									{activeTab === 'episode' && type === 'tv' && activeEpisode && (
										<EpisodeDetailPanel episode={activeEpisode} />
									)}

									{activeTab === 'details' && (
										<motion.div
											variants={fadeUp}
											className="flex flex-col gap-6"
										>
											{/* Tagline + overview block */}
											<div className="flex flex-col gap-3.5">
												{data?.tagline && (
													<p
														className="text-[15px] font-medium italic leading-snug text-white/55 md:text-base"
														style={{
															fontFamily:
																'-apple-system, "SF Pro Display", "Helvetica Neue", sans-serif',
														}}
													>
														&ldquo;{data.tagline}&rdquo;
													</p>
												)}
												{data?.overview ? (
													<p
														className="text-[13.5px] leading-relaxed text-white/65 md:text-[14px]"
														style={{
															fontFamily:
																'-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
														}}
													>
														{data.overview}
													</p>
												) : (
													<p className="text-[13px] text-white/35">
														No overview available.
													</p>
												)}
											</div>

											{/* Editorial fact grid — bento style, no empty cells */}
											{facts.length > 0 && (
												<div
													className="grid grid-cols-2 gap-px overflow-hidden rounded-xl md:grid-cols-3"
													style={{
														background: 'rgba(255,255,255,0.05)',
														border: '1px solid rgba(255,255,255,0.06)',
													}}
												>
													{facts.map(({ label, value, icon: Icon }) => (
														<div
															key={label}
															className="flex flex-col gap-2 bg-[rgba(18,18,20,0.92)] p-3.5 transition-colors duration-300 hover:bg-[rgba(24,24,28,0.92)]"
														>
															<div className="flex items-center gap-1.5">
																<Icon
																	size={11}
																	className="text-white/30"
																/>
																<p className={SECTION_LABEL}>
																	{label}
																</p>
															</div>
															<p
																className="text-[12.5px] font-semibold leading-snug text-white/85"
																style={{
																	fontFamily:
																		'-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
																}}
															>
																{value}
															</p>
														</div>
													))}
												</div>
											)}
										</motion.div>
									)}

									{activeTab === 'watch' && (
										<motion.div
											variants={fadeUp}
											className="flex flex-col gap-5"
										>
											<div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
												<div>
													<SectionHeading
														title="Watch in India"
														kicker={
															providerTotal
																? `${providerTotal} providers`
																: undefined
														}
													/>
													<p className="mt-1.5 text-[12.5px] text-white/40">
														Provider availability via TMDB watch
														providers, region IN.
													</p>
												</div>
												<a
													href={providerLink}
													target="_blank"
													rel="noreferrer"
													className="inline-flex h-9 w-fit items-center gap-2 rounded-full bg-white px-3.5 text-[12px] font-bold text-zinc-950 transition-transform duration-300 active:scale-[0.98]"
												>
													Open providers
													<ArrowSquareOutIcon size={15} weight="bold" />
												</a>
											</div>

											{providerGroups.length > 0 ? (
												<div className="space-y-4 border-t border-white/[0.06] pt-4">
													{providerGroups.map((group) => (
														<div key={group.label}>
															<p
																className={`${SECTION_LABEL} mb-2.5`}
															>
																{group.label}
															</p>
															<div className="flex flex-wrap gap-2">
																{group.items.map((provider) => (
																	<ProviderLogo
																		key={provider.provider_id}
																		provider={provider}
																		title={title}
																		year={releaseYear}
																		fallback={providerLink}
																	/>
																))}
															</div>
														</div>
													))}
												</div>
											) : (
												<div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-4">
													<p className="text-sm font-medium text-white/60">
														No India streaming providers are listed for
														this title yet.
													</p>
												</div>
											)}
										</motion.div>
									)}

									{activeTab === 'cast' && (
										<motion.div
											variants={fadeUp}
											className="flex flex-col gap-4"
										>
											<SectionHeading
												title="Cast & crew"
												kicker={`${people.length} people`}
											/>
											<div className="overflow-hidden border-t border-white/[0.06] pt-4">
												<ul className="flex snap-x gap-3 overflow-x-auto pb-1 pr-1 scrollbar-none">
													{people.map((person, i) => (
														<motion.li
															key={person.id}
															initial={{
																opacity: 0,
																scale: 0.94,
																y: 6,
															}}
															animate={{ opacity: 1, scale: 1, y: 0 }}
															transition={{
																delay: 0.05 + i * 0.025,
																type: 'spring',
																stiffness: 280,
																damping: 26,
															}}
															className="w-24 shrink-0 snap-start md:w-28"
														>
															<div className="group relative aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.045]">
																{person.profile_path ? (
																	<img
																		src={tmdbImage(
																			person.profile_path,
																			'w185'
																		)}
																		alt={person.name}
																		loading="lazy"
																		className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
																		onError={(e) => {
																			(
																				e.currentTarget as HTMLImageElement
																			).style.display =
																				'none';
																		}}
																	/>
																) : (
																	<div className="absolute inset-0 flex items-center justify-center px-3 text-center text-[10px] font-semibold text-white/25">
																		No image
																	</div>
																)}
																<div className="absolute inset-0 pointer-events-none rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]" />
															</div>
															<h4 className="mt-2 truncate text-[12px] font-bold tracking-tight text-white">
																{person.name}
															</h4>
															<p className="mt-0.5 truncate text-[10.5px] text-white/40">
																{person.role}
															</p>
														</motion.li>
													))}
												</ul>
											</div>
										</motion.div>
									)}

									{activeTab === 'trailers' && (
										<motion.div
											variants={fadeUp}
											className="flex flex-col gap-4"
										>
											<SectionHeading
												title="Trailers & previews"
												kicker={`${videos.length} videos`}
											/>
											<div className="overflow-hidden border-t border-white/[0.06] pt-4">
												<ul className="flex snap-x gap-3 overflow-x-auto pb-1 pr-1 scrollbar-none">
													{videos.map((video, i) => (
														<motion.li
															key={video.id}
															initial={{
																opacity: 0,
																scale: 0.96,
																y: 6,
															}}
															animate={{ opacity: 1, scale: 1, y: 0 }}
															transition={{
																delay: 0.05 + i * 0.04,
																type: 'spring',
																stiffness: 280,
																damping: 26,
															}}
															className="w-[82vw] max-w-[420px] shrink-0 snap-start"
														>
															<button
																type="button"
																onClick={() =>
																	setActiveVideo(video.key)
																}
																className="group relative aspect-video w-full overflow-hidden rounded-xl bg-white/[0.045] text-left transition-transform duration-300 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121214]"
															>
																<img
																	src={`https://img.youtube.com/vi/${video.key}/mqdefault.jpg`}
																	alt={video.name}
																	loading="lazy"
																	className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
																	onError={(e) => {
																		(
																			e.currentTarget as HTMLImageElement
																		).style.display = 'none';
																	}}
																/>
																<div className="absolute inset-0 bg-gradient-to-t from-[#121214] via-black/20 to-transparent" />
																<div
																	className="pointer-events-none absolute inset-0"
																	style={{
																		boxShadow:
																			'inset 0 0 80px rgba(0,0,0,0.45)',
																	}}
																/>
																<div className="absolute bottom-3 left-3 right-3 flex items-end gap-3">
																	<span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 shadow-[0_8px_24px_rgba(0,0,0,0.4)]">
																		<PlayIcon
																			size={16}
																			weight="fill"
																		/>
																	</span>
																	<span
																		className="line-clamp-2 text-[13px] font-semibold leading-snug text-white"
																		style={{
																			textShadow:
																				'0 2px 12px rgba(0,0,0,0.6)',
																		}}
																	>
																		{video.name}
																	</span>
																</div>
															</button>
														</motion.li>
													))}
												</ul>
											</div>
										</motion.div>
									)}

									{activeTab === 'links' && (
										<motion.div
											variants={fadeUp}
											className="flex flex-col gap-4"
										>
											<SectionHeading
												title="External pages"
												kicker={`${externalLinks.length} sources`}
											/>
											<div className="overflow-hidden border-t border-white/[0.06]">
												{externalLinks.map((link, i) => (
													<motion.a
														key={link.label}
														href={link.href || '#'}
														target="_blank"
														rel="noreferrer"
														initial={{ opacity: 0, x: -6 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{
															delay: 0.05 + i * 0.04,
															type: 'spring',
															stiffness: 280,
															damping: 26,
														}}
														className="group flex min-h-14 items-center justify-between gap-4 border-b border-white/[0.055] py-3 transition-colors duration-300 hover:bg-white/[0.025] last:border-b-0"
													>
														<span className="flex flex-col">
															<span className="text-[13px] font-bold text-white">
																{link.label}
															</span>
															{link.detail && (
																<span className="mt-0.5 text-[11px] text-white/35">
																	{link.detail}
																</span>
															)}
														</span>
														<LinkIcon
															size={16}
															weight="bold"
															className="text-white/35 transition-all duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-white/85"
														/>
													</motion.a>
												))}
											</div>
										</motion.div>
									)}
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>

			{activeVideo && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-background/92 px-4 backdrop-blur-sm"
					onClick={() => setActiveVideo(null)}
				>
					<div
						className="relative aspect-video w-full max-w-5xl"
						onClick={(event) => event.stopPropagation()}
					>
						<button
							type="button"
							onClick={() => setActiveVideo(null)}
							className="absolute -top-11 right-0 inline-flex items-center gap-1.5 text-sm font-medium text-white/60 transition-colors duration-200 hover:text-white"
						>
							<XIcon size={16} />
							Close
						</button>
						<iframe
							src={`https://www.youtube.com/embed/${activeVideo}?autoplay=1&rel=0`}
							title="Trailer"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
							allowFullScreen
							className="h-full w-full rounded-2xl border border-white/10"
						/>
					</div>
				</div>
			)}
		</section>
	);
}

export default memo(MediaInfoPanelComponent);
MediaInfoPanelComponent.displayName = 'MediaInfoPanel';
