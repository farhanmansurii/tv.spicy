'use client';

import { useEffect, useRef, memo } from 'react';
import Image from 'next/image';
import { tmdbImage } from '@/lib/tmdb-image';
import { PlayIcon, PlusIcon, ShareNetworkIcon, StarIcon, FilmSlateIcon, TelevisionIcon } from '@phosphor-icons/react';
import gsap from 'gsap';

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

function DetailHeroComponent({ show, type }: DetailHeroProps) {
	const sectionRef  = useRef<HTMLElement>(null);
	const imageWrapRef = useRef<HTMLDivElement>(null);
	const contentRef  = useRef<HTMLDivElement>(null);
	const btnRowRef   = useRef<HTMLDivElement>(null);

	const title       = show.title || show.name || 'Untitled';
	const releaseYear = (show.first_air_date || show.release_date)?.split('-')[0] ?? null;
	const runtime     = show.episode_run_time?.[0] ?? show.runtime ?? null;
	const voteAvg     = typeof show.vote_average === 'number' && show.vote_average > 0
		? show.vote_average
		: null;
	const rating =
		type === 'tv'
			? show.content_ratings?.results?.find((r) => r.iso_3166_1 === 'US')?.rating
			: show.release_dates?.results?.find((r) => r.iso_3166_1 === 'US')?.release_dates?.[0]?.certification;
	const genres  = show.genres?.slice(0, 3).map((g) => g.name) ?? [];
	const cleanPoster =
		show.images?.posters?.find((img) => img.iso_639_1 === null)?.file_path ||
		show.poster_path;
	const cleanBackdrop =
		show.images?.backdrops?.find((img) => img.iso_639_1 === null)?.file_path ||
		show.backdrop_path;
	const mobileHeroImage = cleanPoster || cleanBackdrop || '';
	const desktopHeroImage = cleanBackdrop || cleanPoster || '';
	const logo =
		show.images?.logos?.find((img) => img.iso_639_1 === 'en')?.file_path ||
		show.images?.logos?.[0]?.file_path;

	/* ── Ken Burns + entrance ── */
	useEffect(() => {
		if (!sectionRef.current) return;

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
	}, []);

	/* ── Button hover + press physics ── */
	useEffect(() => {
		if (!btnRowRef.current) return;

		const ctx = gsap.context(() => {
			const btns = btnRowRef.current!.querySelectorAll<HTMLButtonElement>('[data-hero-action]');

			btns.forEach((btn) => {
				const hoverTl = gsap.timeline({ paused: true }).to(btn, {
					scale: 1.055,
					duration: 0.28,
					ease: 'power2.out',
				});
				const pressTl = gsap.timeline({ paused: true }).to(btn, {
					scale: 0.95,
					duration: 0.1,
					ease: 'power2.out',
				});

				btn.addEventListener('mouseenter', () => hoverTl.play());
				btn.addEventListener('mouseleave', () => hoverTl.reverse());
				btn.addEventListener('mousedown', () => pressTl.play());
				btn.addEventListener('mouseup', () => pressTl.reverse());
				btn.addEventListener('touchstart', () => pressTl.play(), { passive: true });
				btn.addEventListener('touchend', () => pressTl.reverse());
			});
		}, btnRowRef);

		return () => ctx.revert();
	}, []);

	return (
		<section
			ref={sectionRef}
			className="relative w-full overflow-hidden bg-zinc-950 h-[80vh] md:h-[90vh] lg:h-[94vh]"
		>
			{/* Hero image: poster on phones, cinematic backdrop on wider screens. */}
			{(mobileHeroImage || desktopHeroImage) && (
				<div className="absolute inset-0 z-0 overflow-hidden">
					<div ref={imageWrapRef} className="absolute inset-0 will-change-transform">
						{mobileHeroImage && (
							<Image
								src={tmdbImage(mobileHeroImage, 'w780')}
								alt={title}
								fill
								priority
								sizes="(max-width: 767px) 100vw"
								className="object-cover object-top md:hidden"
							/>
						)}
						{desktopHeroImage && (
							<Image
								src={tmdbImage(desktopHeroImage, 'w1280')}
								alt={title}
								fill
								priority
								sizes="(min-width: 768px) 100vw"
								className="hidden object-cover object-center md:block"
							/>
						)}
					</div>
				</div>
			)}

			{/* Gradient layers */}
			<div className="absolute inset-0 z-[1] pointer-events-none">
				{/* Primary bottom fade */}
				<div className="absolute inset-0 bg-gradient-to-t from-zinc-950 from-[8%] via-zinc-950/75 via-[38%] to-transparent" />
				{/* Left side for text legibility */}
				<div className="absolute inset-0 bg-gradient-to-r from-zinc-950/90 via-zinc-950/35 to-transparent" />
				{/* Radial punch behind content area */}
				<div
					className="absolute bottom-0 left-0 w-[60vw] h-[70%] pointer-events-none"
					style={{
						background: 'radial-gradient(ellipse 80% 70% at 20% 100%, rgba(0,0,0,0.65) 0%, transparent 70%)',
					}}
				/>
				{/* Top edge */}
				<div className="absolute inset-0 bg-gradient-to-b from-zinc-950/50 via-transparent to-transparent" />
			</div>

			{/* Grain */}
			<div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.03] grain-overlay" />

			{/* Content */}
			<div className="relative z-10 h-full flex flex-col justify-end">
				<div className="mx-auto w-full max-w-7xl 2xl:max-w-[1600px] px-4 sm:px-6 lg:px-8 pb-10 md:pb-16 lg:pb-20">
					<div ref={contentRef} className="max-w-xl md:max-w-2xl flex flex-col items-start text-left">

						{/* Metadata row */}
						<div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 mb-4 md:mb-5">
							{/* Type badge */}
							<span
								data-meta
								className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.18em] text-white/60"
							>
								{type === 'tv'
									? <TelevisionIcon weight="fill" size={10} />
									: <FilmSlateIcon weight="fill" size={10} />}
								{type === 'tv' ? 'Series' : 'Film'}
							</span>

							{genres.length > 0 && (
								<>
									<span data-meta className="text-white/18 select-none">·</span>
									<span data-meta className="text-[11px] font-medium text-white/45 tracking-wide">
										{genres.join(' / ')}
									</span>
								</>
							)}

							{releaseYear && (
								<>
									<span data-meta className="text-white/18 select-none">·</span>
									<span data-meta className="text-[11px] font-medium text-white/45 tabular-nums">
										{releaseYear}
									</span>
								</>
							)}

							{runtime != null && runtime > 0 && (
								<>
									<span data-meta className="text-white/18 select-none">·</span>
									<span data-meta className="text-[11px] font-medium text-white/45 tabular-nums">
										{runtime >= 60
											? `${Math.floor(runtime / 60)}h ${runtime % 60}m`
											: `${runtime}m`}
									</span>
								</>
							)}

							{voteAvg && (
								<>
									<span data-meta className="text-white/18 select-none">·</span>
									<span
										data-meta
										className="inline-flex items-center gap-1 px-1.5 py-[3px] rounded-md"
										style={{ background: 'rgba(255,214,10,0.12)', border: '1px solid rgba(255,214,10,0.2)' }}
									>
										<StarIcon weight="fill" size={10} color="#FFD60A" aria-hidden="true" />
										<span className="text-[10px] font-bold tabular-nums" style={{ color: '#FFD60A' }}>
											{voteAvg.toFixed(1)}
										</span>
									</span>
								</>
							)}

							{rating && (
								<>
									<span data-meta className="text-white/18 select-none">·</span>
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
						<div data-hero-title className="flex flex-col items-start gap-2.5 md:gap-3 w-full">
							{logo ? (
								<Image
									src={tmdbImage(logo, 'w500')}
									alt={title}
									width={720}
									height={360}
									priority
									sizes="(max-width: 768px) 90vw, 720px"
									className="h-auto w-[min(86vw,420px)] max-h-[clamp(120px,34vw,180px)] sm:w-[min(78vw,520px)] sm:max-h-[220px] md:w-auto md:max-w-xl md:max-h-[160px] lg:max-h-[200px] object-contain object-left drop-shadow-[0_16px_48px_rgba(0,0,0,0.9)]"
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
								className="mt-2.5 text-[12px] md:text-sm text-white/38 font-medium italic max-w-sm tracking-wide leading-snug"
							>
								&ldquo;{show.tagline}&rdquo;
							</p>
						)}

						{/* Overview */}
						{show.overview && (
							<p
								data-hero-overview
								className="mt-3 md:mt-3.5 text-[12.5px] md:text-sm text-white/52 leading-relaxed max-w-lg line-clamp-3 md:line-clamp-4"
								style={{ fontFamily: '-apple-system, "SF Pro Text", "Helvetica Neue", sans-serif' }}
							>
								{show.overview}
							</p>
						)}

						{/* Actions */}
						<div ref={btnRowRef} className="flex flex-wrap items-center gap-2.5 md:gap-3 mt-6 md:mt-8">
							{/* Primary play */}
							<button
								data-hero-action
								className="inline-flex items-center justify-center gap-2 rounded-full font-bold bg-white text-zinc-950 px-6 py-2.5 md:px-8 md:py-3 text-[13px] md:text-sm shadow-[0_6px_28px_rgba(255,255,255,0.18)] will-change-transform"
							>
								<PlayIcon weight="fill" size={16} />
								Play
							</button>

							{/* Watchlist frosted */}
							<button
								data-hero-action
								className="inline-flex items-center justify-center gap-2 rounded-full font-semibold text-white px-5 py-2.5 md:px-6 md:py-3 text-[13px] md:text-sm will-change-transform"
								style={{
									background: 'rgba(255,255,255,0.1)',
									backdropFilter: 'blur(24px) saturate(180%)',
									border: '1px solid rgba(255,255,255,0.14)',
									boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.08)',
								}}
							>
								<PlusIcon weight="bold" size={15} />
								Watchlist
							</button>

							{/* Share icon only */}
							<button
								data-hero-action
								aria-label="Share"
								className="inline-flex items-center justify-center rounded-full w-[42px] h-[42px] md:w-11 md:h-11 text-white will-change-transform"
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
		</section>
	);
}

export default memo(DetailHeroComponent);
DetailHeroComponent.displayName = 'DetailHero';
