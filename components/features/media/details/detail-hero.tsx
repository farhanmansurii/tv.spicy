'use client';

import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';
import { createPortal } from 'react-dom';
import { tmdbImage } from '@/lib/tmdb-image';
import {
	FilmSlateIcon,
	InfoIcon,
	PlayIcon,
	PlusIcon,
	ShareNetworkIcon,
	StarIcon,
	TelevisionIcon,
} from '@phosphor-icons/react';
import gsap from 'gsap';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useMediaInfoPanelStore } from '@/store/mediaInfoPanelStore';
import { useEpisodeStore } from '@/store/episodeStore';
import useWatchListStore from '@/store/watchlistStore';
import { useHaptics } from '@/hooks/use-haptics';
import { toast } from 'sonner';

interface Genre {
	id: number;
	name: string;
}

interface Logo {
	iso_639_1: string | null;
	file_path: string;
}

interface HeroImage {
	iso_639_1: string | null;
	file_path: string;
}

interface ContentRating {
	iso_3166_1: string;
	rating: string;
}

interface ReleaseDate {
	certification: string;
}

interface ReleaseDateResult {
	iso_3166_1: string;
	release_dates: ReleaseDate[];
}

interface ShowData {
	id?: number;
	title?: string | null;
	name?: string | null;
	tagline?: string | null;
	overview?: string | null;
	backdrop_path?: string | null;
	poster_path?: string | null;
	first_air_date?: string | null;
	release_date?: string | null;
	runtime?: number | null;
	episode_run_time?: number[] | null;
	vote_average?: number | null;
	genres?: Genre[];
	images?: { logos?: Logo[]; posters?: HeroImage[]; backdrops?: HeroImage[] };
	content_ratings?: { results?: ContentRating[] };
	release_dates?: { results?: ReleaseDateResult[] };
}

interface DetailHeroProps {
	show: ShowData;
	type: 'movie' | 'tv';
}

function formatRuntime(minutes: number | null) {
	if (minutes == null || minutes <= 0) return null;
	return minutes >= 60 ? `${Math.floor(minutes / 60)}h ${minutes % 60}m` : `${minutes}m`;
}

function DetailHeroComponent({ show, type }: DetailHeroProps) {
	const sectionRef = useRef<HTMLElement>(null);
	const imageWrapRef = useRef<HTMLDivElement>(null);
	const contentRef = useRef<HTMLDivElement>(null);
	const btnRowRef = useRef<HTMLDivElement>(null);
	const openInfoTab = useMediaInfoPanelStore((s) => s.openTab);
	const activeEP = useEpisodeStore((s) => s.activeEP);
	const isPlayerSticky = useEpisodeStore((s) => s.isPlayerSticky);
	const prefersReducedMotion = useReducedMotion();
	const haptic = useHaptics();
	const watchlist = useWatchListStore((s) => s.watchlist);
	const tvwatchlist = useWatchListStore((s) => s.tvwatchlist);
	const addToWatchlist = useWatchListStore((s) => s.addToWatchlist);
	const removeFromWatchList = useWatchListStore((s) => s.removeFromWatchList);
	const addToTvWatchlist = useWatchListStore((s) => s.addToTvWatchlist);
	const removeFromTvWatchList = useWatchListStore((s) => s.removeFromTvWatchList);
	const [isHeroVisible, setIsHeroVisible] = useState(true);

	const title = show.title || show.name || 'Untitled';
	const releaseDate = show.first_air_date || show.release_date || null;
	const releaseYear = releaseDate?.split('-')[0] ?? null;
	const runtime = show.episode_run_time?.[0] ?? show.runtime ?? null;
	const runtimeLabel = formatRuntime(runtime);
	const voteAvg =
		typeof show.vote_average === 'number' && show.vote_average > 0 ? show.vote_average : null;
	const rating =
		type === 'tv'
			? show.content_ratings?.results?.find((r) => r.iso_3166_1 === 'US')?.rating
			: show.release_dates?.results?.find((r) => r.iso_3166_1 === 'US')?.release_dates?.[0]
					?.certification;
	const genreNames = show.genres?.map((g) => g.name).filter(Boolean) ?? [];
	const genres = genreNames.slice(0, 2);
	const cleanPoster =
		show.images?.posters?.find((img) => img.iso_639_1 === null)?.file_path || show.poster_path;
	const cleanBackdrop =
		show.images?.backdrops?.find((img) => img.iso_639_1 === null)?.file_path ||
		show.backdrop_path;
	const mobileHeroImage = cleanPoster || cleanBackdrop || '';
	const desktopHeroImage = cleanBackdrop || cleanPoster || '';
	const logo =
		show.images?.logos?.find((img) => img.iso_639_1 === 'en')?.file_path ||
		show.images?.logos?.[0]?.file_path;
	const activeEpisodeForShow =
		type === 'tv' && activeEP && String(activeEP.tv_id) === String(show.id) ? activeEP : null;
	const isInWatchlist = useMemo(() => {
		if (!show.id) return false;
		const items = type === 'movie' ? watchlist : tvwatchlist;
		return items.some((item) => item.id === show.id);
	}, [show.id, type, watchlist, tvwatchlist]);
	const primaryLabel =
		type === 'movie'
			? 'Play'
			: activeEpisodeForShow
				? `Continue S${activeEpisodeForShow.season_number} E${activeEpisodeForShow.episode_number}`
				: 'Choose Episode';

	const scrollToSection = useCallback(
		(id: string) => {
			document.getElementById(id)?.scrollIntoView({
				behavior: prefersReducedMotion ? 'auto' : 'smooth',
				block: 'start',
			});
		},
		[prefersReducedMotion]
	);

	const handlePrimaryAction = useCallback(() => {
		haptic('medium');
		if (type === 'tv' && !activeEpisodeForShow) {
			scrollToSection('episodes-section');
			return;
		}
		scrollToSection('media-player');
	}, [activeEpisodeForShow, haptic, scrollToSection, type]);

	const handleWatchlist = useCallback(() => {
		if (!show.id) return;
		const watchlistItem = {
			id: show.id,
			title: show.title ?? undefined,
			name: show.name ?? undefined,
			poster_path: show.poster_path ?? null,
			backdrop_path: show.backdrop_path ?? null,
			overview: show.overview ?? null,
			media_type: type,
		};
		haptic(isInWatchlist ? 'soft' : 'success');
		if (type === 'movie') {
			isInWatchlist ? removeFromWatchList(show.id) : addToWatchlist(watchlistItem);
		} else {
			isInWatchlist ? removeFromTvWatchList(show.id) : addToTvWatchlist(watchlistItem);
		}
		toast(isInWatchlist ? 'Removed from Watchlist' : 'Added to Watchlist');
	}, [
		addToTvWatchlist,
		addToWatchlist,
		haptic,
		isInWatchlist,
		removeFromTvWatchList,
		removeFromWatchList,
		show,
		type,
	]);

	const handleShare = useCallback(async () => {
		const shareData = { title, url: window.location.href };
		try {
			if (navigator.share) await navigator.share(shareData);
			else {
				await navigator.clipboard.writeText(window.location.href);
				toast.success('Link copied');
			}
		} catch (error) {
			if ((error as Error).name !== 'AbortError') toast.error('Unable to share');
		}
	}, [title]);

	useEffect(() => {
		const section = sectionRef.current;
		if (!section) return;
		const observer = new IntersectionObserver(
			([entry]) => setIsHeroVisible(entry.isIntersecting),
			{ threshold: 0.12 }
		);
		observer.observe(section);
		return () => observer.disconnect();
	}, []);

	/* ── Desktop artwork + entrance ── */
	useEffect(() => {
		if (!sectionRef.current) return;
		if (prefersReducedMotion || window.matchMedia('(max-width: 767px)').matches) return;

		const ctx = gsap.context(() => {
			if (imageWrapRef.current) {
				gsap.fromTo(
					imageWrapRef.current,
					{ scale: 1.06 },
					{ scale: 1, duration: 16, ease: 'none' }
				);
			}

			if (!contentRef.current) return;

			const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

			const metaItems = contentRef.current.querySelectorAll('[data-meta]');
			tl.fromTo(
				metaItems,
				{ y: 10, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.5, stagger: 0.035 },
				0.1
			);

			const titleEl = contentRef.current.querySelector('[data-hero-title]');
			if (titleEl) {
				tl.fromTo(
					titleEl,
					{ y: 32, opacity: 0, scale: 0.975 },
					{ y: 0, opacity: 1, scale: 1, duration: 0.9, ease: 'power4.out' },
					0.22
				);
			}

			const taglineEl = contentRef.current.querySelector('[data-hero-tagline]');
			if (taglineEl) {
				tl.fromTo(
					taglineEl,
					{ y: 14, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.6 },
					0.42
				);
			}

			const overviewEl = contentRef.current.querySelector('[data-hero-overview]');
			if (overviewEl) {
				tl.fromTo(
					overviewEl,
					{ y: 10, opacity: 0 },
					{ y: 0, opacity: 1, duration: 0.6 },
					0.5
				);
			}

			const actions = contentRef.current.querySelectorAll('[data-hero-action]');
			tl.fromTo(
				actions,
				{ y: 20, opacity: 0 },
				{ y: 0, opacity: 1, duration: 0.6, stagger: 0.065, ease: 'back.out(1.3)' },
				0.62
			);
		}, sectionRef);

		return () => ctx.revert();
	}, [prefersReducedMotion]);

	return (
		<section
			ref={sectionRef}
			className="relative w-full h-[60dvh] min-h-[480px] max-h-[620px] overflow-hidden bg-background md:h-[78dvh] md:min-h-[620px] md:max-h-[780px] lg:h-[82dvh]"
		>
			{/* Hero image: poster on phones, cinematic backdrop on wider screens. */}
			<div className="absolute inset-0 z-0 overflow-hidden">
				{/* Fallback dark surface — visible when images are missing or fail */}
				<div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-black" />

				<div ref={imageWrapRef} className="absolute inset-0 will-change-transform">
					{mobileHeroImage && (
						<img
							src={tmdbImage(mobileHeroImage, 'w780')}
							alt={title}
							loading="eager"
							fetchPriority="high"
							className="absolute inset-0 h-full w-full object-cover object-top md:hidden"
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).style.display = 'none';
							}}
						/>
					)}
					{desktopHeroImage && (
						<img
							src={tmdbImage(desktopHeroImage, 'w1280')}
							alt={title}
							loading="eager"
							fetchPriority="high"
							className="absolute inset-0 hidden h-full w-full object-cover object-center md:block"
							onError={(e) => {
								(e.currentTarget as HTMLImageElement).style.display = 'none';
							}}
						/>
					)}
				</div>
			</div>

			{/* One stable legibility field on mobile; richer directional light on desktop. */}
			<div className="absolute inset-0 z-[1] pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-t from-background from-[5%] via-background/65 via-[42%] to-black/5" />
				{/* Left side for text legibility */}
				<div className="absolute inset-0 hidden bg-gradient-to-r from-background/90 via-background/35 to-transparent md:block" />
				{/* Radial punch behind content area */}
				<div
					className="absolute bottom-0 left-0 w-[60vw] h-[70%] pointer-events-none"
					style={{
						background:
							'radial-gradient(ellipse 80% 70% at 20% 100%, color-mix(in oklab, var(--background) 72%, transparent) 0%, transparent 70%)',
					}}
				/>
				{/* Top edge */}
				<div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-transparent md:from-background/50" />
			</div>

			{/* Grain */}
			<div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03] grain-overlay" />

			{/* Content */}
			<div className="absolute inset-0 z-10 flex flex-col justify-end">
				<div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-6 md:pb-12 lg:pb-14">
					<div
						ref={contentRef}
						className="max-w-xl md:max-w-2xl flex flex-col items-start text-left"
					>
						{/* Metadata row */}
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mb-4 md:mb-5">
							{/* Type badge */}
							<span
								data-meta
								className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60"
							>
								{type === 'tv' ? (
									<TelevisionIcon weight="fill" size={10} />
								) : (
									<FilmSlateIcon weight="fill" size={10} />
								)}
								{type === 'tv' ? 'Series' : 'Film'}
							</span>

							{genres.length > 0 && (
								<>
									<span data-meta className="text-white/18 select-none">
										·
									</span>
									<span
										data-meta
										className="text-[11px] font-medium text-white/45 tracking-wide"
									>
										{genres.join(' / ')}
									</span>
								</>
							)}

							{releaseYear && (
								<>
									<span data-meta className="text-white/18 select-none">
										·
									</span>
									<span
										data-meta
										className="text-[11px] font-medium text-white/45 tabular-nums"
									>
										{releaseYear}
									</span>
								</>
							)}

							{runtime != null && runtime > 0 && (
								<>
									<span data-meta className="text-white/18 select-none">
										·
									</span>
									<span
										data-meta
										className="text-[11px] font-medium text-white/45 tabular-nums"
									>
										{runtimeLabel}
									</span>
								</>
							)}

							{voteAvg && (
								<>
									<span data-meta className="text-white/18 select-none">
										·
									</span>
									<span
										data-meta
										className="inline-flex items-center gap-1 px-1.5 py-[3px] rounded-md"
										style={{
											background: 'rgba(255,214,10,0.12)',
											border: '1px solid rgba(255,214,10,0.2)',
										}}
									>
										<StarIcon
											weight="fill"
											size={10}
											color="#FFD60A"
											aria-hidden="true"
										/>
										<span
											className="text-[10px] font-bold tabular-nums"
											style={{ color: '#FFD60A' }}
										>
											{voteAvg.toFixed(1)}
										</span>
									</span>
								</>
							)}

							{rating && (
								<>
									<span data-meta className="text-white/18 select-none">
										·
									</span>
									<span
										data-meta
										className="text-[10px] font-bold text-white/50 border border-white/18 rounded-[4px] px-[5px] py-[2px] leading-none tracking-widest uppercase"
									>
										{rating}
									</span>
								</>
							)}
						</div>

						{/* Logo or title */}
						<div
							data-hero-title
							className="flex flex-col items-start gap-2.5 md:gap-3 w-full"
						>
							{logo ? (
								<img
									src={tmdbImage(logo, 'w500')}
									alt={title}
									width={720}
									height={360}
									loading="eager"
									fetchPriority="high"
									className="h-auto w-[min(72vw,330px)] max-h-[120px] sm:w-[min(68vw,390px)] md:w-auto md:max-w-xl md:max-h-[160px] lg:max-h-[200px] object-contain object-left drop-shadow-[0_16px_48px_rgba(0,0,0,0.9)]"
									onError={(e) => {
										(e.currentTarget as HTMLImageElement).style.display =
											'none';
									}}
								/>
							) : (
								<h1 className="text-[clamp(2.2rem,5.5vw,4rem)] font-bold text-white leading-[0.9] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
									{title}
								</h1>
							)}
						</div>

						{/* Tagline */}
						{show.tagline && (
							<p
								data-hero-tagline
								className="mt-2.5 line-clamp-1 text-[12px] font-medium italic leading-snug tracking-wide text-white/55 md:text-sm"
							>
								&ldquo;{show.tagline}&rdquo;
							</p>
						)}

						{/* Overview */}
						{show.overview && (
							<p
								data-hero-overview
								className="mt-3 hidden max-w-lg text-sm leading-relaxed text-white/52 md:mt-3.5 md:block md:line-clamp-4"
								style={{
									fontFamily:
										'-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif',
								}}
							>
								{show.overview}
							</p>
						)}

						{/* Actions */}
						<div
							ref={btnRowRef}
							className="mt-5 flex w-full items-center gap-2.5 md:mt-8 md:w-auto md:gap-3"
						>
							{/* Primary play */}
							<button
								data-hero-action
								onClick={handlePrimaryAction}
								className="inline-flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-white px-5 text-[13px] font-bold text-zinc-950 shadow-[0_6px_28px_rgba(255,255,255,0.18)] transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none md:h-auto md:flex-none md:px-8 md:py-3 md:text-sm"
							>
								<PlayIcon weight="fill" size={16} />
								<span className="truncate">{primaryLabel}</span>
							</button>

							{/* Watchlist frosted */}
							<button
								data-hero-action
								onClick={handleWatchlist}
								aria-label={
									isInWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'
								}
								className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full font-semibold text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none md:w-auto md:gap-2 md:px-6 md:text-sm"
								style={{
									background: 'rgba(255,255,255,0.1)',
									backdropFilter: 'blur(24px) saturate(180%)',
									border: '1px solid rgba(255,255,255,0.14)',
									boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
								}}
							>
								<PlusIcon
									weight="bold"
									size={17}
									className={isInWatchlist ? 'rotate-45' : ''}
								/>
								<span className="hidden md:inline">
									{isInWatchlist ? 'Remove' : 'Watchlist'}
								</span>
							</button>

							{/* More info — opens details panel directly */}
							<button
								data-hero-action
								aria-label="More info"
								onClick={() => {
									openInfoTab('details');
									if (typeof window !== 'undefined') {
										requestAnimationFrame(() => {
											document
												.getElementById('media-info-body')
												?.scrollIntoView({
													behavior: 'smooth',
													block: 'start',
												});
										});
									}
								}}
								className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none"
								style={{
									background: 'rgba(255,255,255,0.08)',
									backdropFilter: 'blur(24px) saturate(180%)',
									border: '1px solid rgba(255,255,255,0.11)',
									boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
								}}
							>
								<InfoIcon weight="bold" size={16} />
							</button>

							{/* Share icon only */}
							<button
								data-hero-action
								aria-label="Share"
								onClick={handleShare}
								className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-full text-white transition-transform duration-150 hover:scale-[1.02] active:scale-[0.97] focus-visible:ring-2 focus-visible:ring-[#0A84FF]/60 focus-visible:ring-offset-2 focus-visible:ring-offset-black outline-none min-[375px]:inline-flex"
								style={{
									background: 'rgba(255,255,255,0.08)',
									backdropFilter: 'blur(24px) saturate(180%)',
									border: '1px solid rgba(255,255,255,0.11)',
									boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.07)',
								}}
							>
								<ShareNetworkIcon weight="bold" size={16} />
							</button>
						</div>
					</div>
				</div>
			</div>

			{typeof document !== 'undefined'
				? createPortal(
						<AnimatePresence>
							{!isHeroVisible && !isPlayerSticky && (
								<motion.div
									data-mobile-detail-dock
									initial={
										prefersReducedMotion
											? { opacity: 0 }
											: { opacity: 0, y: 24 }
									}
									animate={{ opacity: 1, y: 0 }}
									exit={
										prefersReducedMotion
											? { opacity: 0 }
											: { opacity: 0, y: 24 }
									}
									transition={{ type: 'spring', bounce: 0, duration: 0.35 }}
									className="fixed inset-x-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-50 md:hidden"
								>
									<div className="flex items-center gap-2 rounded-[22px] border border-white/10 bg-black/78 p-2 shadow-[0_18px_60px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.12)] backdrop-blur-2xl supports-[backdrop-filter]:bg-black/62 motion-reduce:backdrop-blur-none">
										<button
											type="button"
											onClick={handlePrimaryAction}
											className="flex h-12 min-w-0 flex-1 items-center justify-center gap-2 rounded-[16px] bg-white px-4 text-sm font-semibold text-black transition-transform duration-100 active:scale-[0.97]"
										>
											<PlayIcon size={16} weight="fill" />
											<span className="truncate">{primaryLabel}</span>
										</button>
										<button
											type="button"
											onClick={handleWatchlist}
											aria-label={
												isInWatchlist
													? 'Remove from Watchlist'
													: 'Add to Watchlist'
											}
											className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[16px] bg-white/10 text-white transition-transform duration-100 active:scale-[0.94]"
										>
											<PlusIcon
												size={18}
												weight="bold"
												className={isInWatchlist ? 'rotate-45' : ''}
											/>
										</button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>,
						document.body
					)
				: null}
		</section>
	);
}

export default memo(DetailHeroComponent);
DetailHeroComponent.displayName = 'DetailHero';
