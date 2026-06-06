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
import { cn } from '@/lib/utils';
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
	hidden: { opacity: 0, y: 12 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring' as const, stiffness: 200, damping: 26 },
	},
};

const stagger = {
	hidden: {},
	visible: { transition: { staggerChildren: 0.04, delayChildren: 0.06 } },
};

const fadeUp = {
	hidden: { opacity: 0, y: 8 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { type: 'spring' as const, stiffness: 300, damping: 28 },
	},
};

const expandVariants = {
	collapsed: {
		height: 0,
		opacity: 0,
		transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
	},
	expanded: {
		height: 'auto' as const,
		opacity: 1,
		transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
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

const SECTION_LABEL = 'text-[10px] font-bold uppercase tracking-[0.16em] text-white/25';

function SectionHeading({ title, kicker }: { title: string; kicker?: string }) {
	return (
		<div className="flex items-baseline gap-2.5">
			<h3 className="text-sm font-bold tracking-tight text-white md:text-base">
				{title}
			</h3>
			{kicker && (
				<span className="text-[10px] font-bold uppercase tracking-[0.18em] text-white/25 tabular-nums">
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
			className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.03] py-1.5 pl-1.5 pr-3 text-[12px] font-semibold text-white/70 transition-all duration-300 hover:border-white/[0.16] hover:bg-white/[0.06] hover:text-white active:scale-[0.97]"
		>
			<span className="relative h-6 w-6 overflow-hidden rounded-full bg-white/[0.06]">
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
			<ArrowSquareOutIcon size={11} weight="bold" className="text-white/30" />
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
			credits?.cast?.slice(0, 24).map((person) => ({
				id: `cast-${person.id}`,
				name: person.name,
				role: person.character || 'Cast',
				profile_path: person.profile_path,
			})) ?? [];
		const crewItems =
			credits?.crew
				?.filter((person) => person.job || person.department)
				.slice(0, 12)
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
		<section className="w-full">
			<motion.div
				variants={panelVariants}
				initial="hidden"
				animate="visible"
				className="w-full"
			>
								
					{/* Header Trigger */}
					<button
						type="button"
						onClick={() => toggleExpanded()}
						aria-expanded={isExpanded}
						aria-controls="media-info-body"
						className="group relative flex w-full items-center gap-3.5 py-3.5 text-left transition-colors duration-300 hover:bg-white/[0.03] md:py-4 border-b border-white/[0.06]"
					>
						{/* Poster thumb */}
						<div className="relative h-14 w-10 shrink-0 overflow-hidden rounded-lg bg-white/[0.05] ring-1 ring-white/[0.08] shadow-sm md:h-16 md:w-11">
							{posterUrl ? (
								<img
									src={posterUrl}
									alt={title}
									loading="lazy"
									className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
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
						<div className="flex min-w-0 flex-1 flex-col gap-1.5">
							<h2 className="truncate text-[15px] font-bold leading-tight tracking-tight text-white md:text-base">
								{title}
							</h2>
							{summaryChips.length > 0 && (
								<div className="flex flex-wrap items-center gap-2">
									{summaryChips.map((chip) => (
										<span
											key={chip.label}
											className="inline-flex items-center gap-1.5 rounded-md border border-white/[0.08] bg-white/[0.05] px-2 py-[3px] text-[11px] font-medium text-white/55"
										>
											<chip.icon size={10} className="text-white/35" />
											{chip.label}
										</span>
									))}
								</div>
							)}
						</div>

						{/* Chevron */}
						<motion.span
							animate={{ rotate: isExpanded ? 180 : 0 }}
							transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
							className={cn(
								'inline-flex h-8 w-8 items-center justify-center rounded-full',
								'border border-white/[0.10] bg-white/[0.06] text-white/60',
								'transition-all duration-200',
								'group-hover:border-white/[0.18] group-hover:bg-white/[0.10] group-hover:text-white',
								isExpanded && 'border-white/[0.18] bg-white/[0.10] text-white'
							)}
						>
							<CaretDownIcon size={14} weight="bold" />
						</motion.span>
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
								<div className="bg-background">
								{/* Tab nav */}
								<div className="mx-4 mt-5 overflow-x-auto scrollbar-none md:mx-5">
									<div className="flex min-w-max gap-6 border-b border-white/[0.06]">
										{tabs.map((tab) => (
											<button
												key={tab.id}
												type="button"
												disabled={tab.disabled}
												onClick={() => setActiveTab(tab.id)}
												className={`relative pb-3 text-[13px] font-semibold transition-colors duration-200 disabled:pointer-events-none disabled:opacity-25 ${
													activeTab === tab.id
														? 'text-white'
														: 'text-white/30 hover:text-white/60'
												}`}
											>
												{tab.label}
												{typeof tab.count === 'number' && tab.count > 0 && (
													<span
														className={
															activeTab === tab.id
																? 'text-white/40 ml-1'
																: 'text-white/20 ml-1'
														}
													>
														{tab.count}
													</span>
												)}
												{activeTab === tab.id && (
													<motion.div
														layoutId="activeTabIndicator"
														className="absolute bottom-0 left-0 right-0 h-[2px] bg-white"
														transition={{ type: 'spring', stiffness: 400, damping: 30 }}
													/>
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
									className="flex min-w-0 flex-col gap-6 py-5 md:py-6"
								>
									{activeTab === 'episode' && type === 'tv' && activeEpisode && (
										<EpisodeDetailPanel episode={activeEpisode} />
									)}

									{activeTab === 'details' && (
										<motion.div variants={fadeUp} className="flex flex-col gap-5">
											{/* Tagline + overview */}
											<div className="flex flex-col gap-3">
												{data?.tagline && (
													<p className="text-[15px] font-medium leading-snug text-white/40">
														&ldquo;{data.tagline}&rdquo;
													</p>
												)}
												{data?.overview ? (
													<p className="text-[13.5px] leading-relaxed text-white/60 md:text-sm max-w-prose">
														{data.overview}
													</p>
												) : (
													<p className="text-[13px] text-white/30">
														No overview available.
													</p>
												)}
											</div>

											{/* Fact grid */}
											{facts.length > 0 && (
												<div className="grid grid-cols-2 gap-2 md:gap-2.5 md:grid-cols-3">
													{facts.map(({ label, value, icon: Icon }) => (
														<div
															key={label}
															className="flex flex-col gap-2 rounded-xl border border-white/[0.06] bg-transparent p-3.5 transition-colors duration-300 hover:bg-white/[0.03]"
														>
															<div className="flex items-center gap-1.5">
																<Icon size={11} className="text-white/25" />
																<p className={SECTION_LABEL}>{label}</p>
															</div>
															<p className="text-[13px] font-semibold leading-snug text-white/80">
																{value}
															</p>
														</div>
													))}
												</div>
											)}
										</motion.div>
									)}

									{activeTab === 'watch' && (
										<motion.div variants={fadeUp} className="flex flex-col gap-5">
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
													<p className="mt-1 text-[12.5px] text-white/35">
														Provider availability via TMDB watch providers, region IN.
													</p>
												</div>
												<a
													href={providerLink}
													target="_blank"
													rel="noreferrer"
													className="inline-flex h-9 w-fit items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-4 text-[12px] font-bold text-white/80 transition-all duration-300 hover:bg-white/[0.07] hover:text-white active:scale-[0.98]"
												>
													Open providers
													<ArrowSquareOutIcon size={14} weight="bold" />
												</a>
											</div>

											{providerGroups.length > 0 ? (
												<div className="space-y-4 border-t border-white/[0.06] pt-4">
													{providerGroups.map((group) => (
														<div key={group.label}>
															<p className={`${SECTION_LABEL} mb-2.5`}>
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
												<div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
													<p className="text-sm font-medium text-white/50">
														No India streaming providers are listed for this title yet.
													</p>
												</div>
											)}
										</motion.div>
									)}

									{activeTab === 'cast' && (
										<motion.div variants={fadeUp} className="flex flex-col gap-4">
											<SectionHeading
												title="Cast & crew"
												kicker={`${people.length} people`}
											/>
											<div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3 md:gap-4">
												{people.map((person) => (
													<div key={person.id} className="group">
														<div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/[0.04]">
															{person.profile_path ? (
																<img
																	src={tmdbImage(person.profile_path, 'w185')}
																	alt={person.name}
																	loading="lazy"
																	className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
																	onError={(e) => {
																		(
																			e.currentTarget as HTMLImageElement
																		).style.display = 'none';
																	}}
																/>
															) : (
																<div className="flex h-full w-full items-center justify-center">
																	<span className="text-[10px] font-bold text-white/20 uppercase tracking-wider">
																		{person.name
																			?.split(' ')
																			.map((n) => n[0])
																			.join('')}
																	</span>
																</div>
															)}
															<div className="absolute inset-0 pointer-events-none rounded-xl shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]" />
														</div>
														<h4 className="mt-2 truncate text-[12px] font-semibold text-white/80">
															{person.name}
														</h4>
														<p className="truncate text-[11px] text-white/30">
															{person.role}
														</p>
													</div>
												))}
											</div>
										</motion.div>
									)}

									{activeTab === 'trailers' && (
										<motion.div variants={fadeUp} className="flex flex-col gap-4">
											<SectionHeading
												title="Trailers & previews"
												kicker={`${videos.length} videos`}
											/>
											<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
												{videos.map((video, i) => (
													<motion.div
														key={video.id}
														initial={{ opacity: 0, y: 8 }}
														animate={{ opacity: 1, y: 0 }}
														transition={{
															delay: 0.05 + i * 0.04,
															type: 'spring',
															stiffness: 300,
															damping: 28,
														}}
													>
														<button
															type="button"
															onClick={() => setActiveVideo(video.key)}
															className="group relative aspect-video w-full overflow-hidden rounded-xl bg-white/[0.04] text-left transition-transform duration-200 active:scale-[0.98]"
														>
															<img
																src={`https://img.youtube.com/vi/${video.key}/hqdefault.jpg`}
																alt={video.name}
																loading="lazy"
																className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
																onError={(e) => {
																	(
																		e.currentTarget as HTMLImageElement
																	).style.display = 'none';
																}}
															/>
															<div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
															<div className="absolute inset-0 flex items-center justify-center">
																<div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-black shadow-lg transition-transform duration-300 group-hover:scale-110">
																	<PlayIcon weight="fill" size={16} />
																</div>
															</div>
														</button>
														<p className="mt-2 text-[13px] font-medium text-white/60 line-clamp-1">
															{video.name}
														</p>
													</motion.div>
												))}
											</div>
										</motion.div>
									)}

									{activeTab === 'links' && (
										<motion.div variants={fadeUp} className="flex flex-col gap-4">
											<SectionHeading
												title="External pages"
												kicker={`${externalLinks.length} sources`}
											/>
											<div className="flex flex-col gap-1">
												{externalLinks.map((link, i) => (
													<motion.a
														key={link.label}
														href={link.href || '#'}
														target="_blank"
														rel="noreferrer"
														initial={{ opacity: 0, x: -4 }}
														animate={{ opacity: 1, x: 0 }}
														transition={{
															delay: 0.04 + i * 0.03,
															type: 'spring',
															stiffness: 300,
															damping: 28,
														}}
														className="group flex min-h-12 items-center justify-between gap-4 rounded-xl px-3 py-2.5 transition-colors duration-200 hover:bg-white/[0.03]"
													>
														<span className="flex flex-col">
															<span className="text-[13px] font-semibold text-white/70 transition-colors duration-200 group-hover:text-white">
																{link.label}
															</span>
															{link.detail && (
																<span className="text-[11px] text-white/25">
																	{link.detail}
																</span>
															)}
														</span>
														<ArrowSquareOutIcon
															size={14}
															weight="bold"
															className="text-white/25 transition-colors duration-200 group-hover:text-white/70"
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
